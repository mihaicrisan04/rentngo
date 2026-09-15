/**
 * Wallet credit — the database half of the referral wallet (RNGO-50 phase 3).
 * The money math lives in ../lib/pricing/wallet.ts; this file only reads the
 * append-only `walletTransactions` ledger and appends to it.
 *
 * Redemption is a payment, not a discount: it runs AFTER pickDiscount inside
 * the booking mutation's transaction, the booking's `totalPrice` stays the
 * pre-credit price and the spend is persisted as `walletCreditApplied`. The
 * amount still owed is `bookingAmountDue(totalPrice, walletCreditApplied)`.
 */

import { v } from "convex/values";
import { query, type MutationCtx, type QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { getCurrentUser } from "./users";
import {
  computeAvailableBalance,
  computeRedeemable,
  computeRemainingCredits,
  planRedemption,
  withSettingsDefaults,
  type WalletTransactionData,
} from "../lib/pricing";

const walletKindValidator = v.union(
  v.literal("referralCredit"),
  v.literal("creditReversal"),
  v.literal("manualAdjustment"),
  v.literal("redemption"),
  v.literal("redemptionReversal"),
);

/** The ledger as the pure math wants it: ids as strings, nothing else. */
function toTransactionData(
  rows: Doc<"walletTransactions">[],
): WalletTransactionData[] {
  return rows.map((row) => ({
    id: row._id,
    kind: row.kind,
    amount: row.amount,
    expiresAt: row.expiresAt,
    conversionId: row.conversionId,
    createdAt: row.createdAt,
  }));
}

async function loadLedger(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
): Promise<Doc<"walletTransactions">[]> {
  return await ctx.db
    .query("walletTransactions")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
}

async function loadSettings(ctx: QueryCtx | MutationCtx) {
  return withSettingsDefaults(await ctx.db.query("affiliateSettings").first());
}

// --- Customer-facing reads ---

export const getMyWallet = query({
  args: {},
  returns: v.union(
    v.object({
      programEnabled: v.boolean(),
      balance: v.number(),
      maxRedemptionPercent: v.number(),
      /** Soonest-expiring unspent credit, for the "use it before" nudge. */
      nextExpiry: v.union(
        v.object({ amount: v.number(), expiresAt: v.number() }),
        v.null(),
      ),
      transactions: v.array(
        v.object({
          id: v.id("walletTransactions"),
          kind: walletKindValidator,
          amount: v.number(),
          expiresAt: v.optional(v.number()),
          createdAt: v.number(),
        }),
      ),
    }),
    v.null(),
  ),
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const settings = await loadSettings(ctx);
    const rows = await loadLedger(ctx, user._id);
    const ledger = toTransactionData(rows);
    const now = Date.now();
    // Counts and amounts only — a wallet row never names the referred
    // customer it came from, so there is no other user's PII to leak here.
    const expiring = computeRemainingCredits(ledger, now).find(
      (credit) => credit.expiresAt !== undefined,
    );

    return {
      programEnabled: settings.enabled,
      balance: computeAvailableBalance(ledger, now),
      maxRedemptionPercent: settings.maxRedemptionPercent,
      nextExpiry:
        expiring?.expiresAt !== undefined
          ? { amount: expiring.remaining, expiresAt: expiring.expiresAt }
          : null,
      transactions: rows
        .sort((a, b) => b.createdAt - a.createdAt)
        .map((row) => ({
          id: row._id,
          kind: row.kind,
          amount: row.amount,
          expiresAt: row.expiresAt,
          createdAt: row.createdAt,
        })),
    };
  },
});

/**
 * Advisory preview for the checkout switch. The booking mutation recomputes
 * everything from the server-recomputed total, so this number is only ever a
 * label; a signed-out visitor gets a disabled, empty wallet.
 */
export const previewRedemption = query({
  args: { totalAfterDiscount: v.number() },
  returns: v.object({
    programEnabled: v.boolean(),
    balance: v.number(),
    redeemable: v.number(),
    maxRedemptionPercent: v.number(),
  }),
  handler: async (ctx, args) => {
    const settings = await loadSettings(ctx);
    const user = await getCurrentUser(ctx);
    const empty = {
      programEnabled: settings.enabled,
      balance: 0,
      redeemable: 0,
      maxRedemptionPercent: settings.maxRedemptionPercent,
    };
    if (!user || !settings.enabled) return empty;

    const balance = computeAvailableBalance(
      toTransactionData(await loadLedger(ctx, user._id)),
      Date.now(),
    );
    return {
      ...empty,
      balance,
      redeemable: computeRedeemable(
        balance,
        args.totalAfterDiscount,
        settings.maxRedemptionPercent,
      ),
    };
  },
});

// --- Redemption (called inside the booking mutations) ---

interface BookingRef {
  bookingType: "reservation" | "transfer";
  bookingId: Id<"reservations"> | Id<"transfers">;
}

function bookingLink(ref: BookingRef) {
  return ref.bookingType === "reservation"
    ? { reservationId: ref.bookingId as Id<"reservations"> }
    : { transferId: ref.bookingId as Id<"transfers"> };
}

async function loadBookingLedgerRows(
  ctx: MutationCtx,
  ref: BookingRef,
): Promise<Doc<"walletTransactions">[]> {
  return ref.bookingType === "reservation"
    ? await ctx.db
        .query("walletTransactions")
        .withIndex("by_reservation", (q) =>
          q.eq("reservationId", ref.bookingId as Id<"reservations">),
        )
        .collect()
    : await ctx.db
        .query("walletTransactions")
        .withIndex("by_transfer", (q) =>
          q.eq("transferId", ref.bookingId as Id<"transfers">),
        )
        .collect();
}

/**
 * Spend wallet credit on a freshly created booking and return the EUR spent.
 *
 * Guests have no wallet and a disabled program has no wallet either, so both
 * ignore the client's `requested` switch. The split across credits is the same
 * soonest-expiring-first rule the ledger replay uses, and it is persisted as
 * one debit row per credit consumed (each carrying that credit's expiry) so a
 * later cancellation can hand the exact credits back.
 */
export async function redeemWalletCredit(
  ctx: MutationCtx,
  args: BookingRef & {
    userId?: Id<"users">;
    totalAfterDiscount: number;
    requested: boolean;
  },
): Promise<number> {
  if (!args.requested || !args.userId) return 0;

  const settings = await loadSettings(ctx);
  const now = Date.now();
  const plan = planRedemption({
    requested: true,
    programEnabled: settings.enabled,
    transactions: toTransactionData(await loadLedger(ctx, args.userId)),
    totalAfterDiscount: args.totalAfterDiscount,
    maxRedemptionPercent: settings.maxRedemptionPercent,
    now,
  });
  if (plan.amount <= 0) return 0;

  for (const entry of plan.entries) {
    await ctx.db.insert("walletTransactions", {
      userId: args.userId,
      kind: "redemption",
      amount: -entry.amount,
      expiresAt: entry.expiresAt,
      ...bookingLink(args),
      createdAt: now,
    });
  }
  return plan.amount;
}

/**
 * Give back everything a cancelled or deleted booking redeemed, one
 * `redemptionReversal` per credit it drew on so each returns with its original
 * expiry (credit that has since lapsed comes back already expired, which is
 * what the replay wants).
 *
 * Idempotent: a booking that already has reversal rows is left alone, so a
 * second cancellation cannot double-refund. Un-cancelling does not re-redeem —
 * the customer picks the switch again on a new booking.
 */
export async function reverseWalletRedemption(
  ctx: MutationCtx,
  ref: BookingRef,
): Promise<number> {
  const rows = await loadBookingLedgerRows(ctx, ref);
  if (rows.some((row) => row.kind === "redemptionReversal")) return 0;

  const redemptions = rows.filter((row) => row.kind === "redemption");
  let restored = 0;
  for (const redemption of redemptions) {
    await ctx.db.insert("walletTransactions", {
      userId: redemption.userId,
      kind: "redemptionReversal",
      amount: Math.abs(redemption.amount),
      expiresAt: redemption.expiresAt,
      ...bookingLink(ref),
      createdAt: Date.now(),
    });
    restored += Math.abs(redemption.amount);
  }
  return Math.round(restored * 100) / 100;
}
