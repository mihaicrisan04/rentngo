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

import { ConvexError, v } from "convex/values";
import {
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { getCurrentUser, requireAdmin } from "./users";
import {
  computeAvailableBalance,
  computeRedeemable,
  computeRemainingCredits,
  planRedemption,
  planWalletAdjustment,
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
export function toTransactionData(
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

export async function loadLedger(
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
    const settings = await loadSettings(ctx);
    // The wallet is part of the referral program: while that is off there is
    // no wallet to show, the same way there is no switch at checkout.
    if (!user || !settings.enabled) return null;

    const now = Date.now();
    // The balance is a replay, so it needs the whole ledger; the list the UI
    // renders is bounded separately.
    const ledger = toTransactionData(await loadLedger(ctx, user._id));
    // Counts and amounts only — a wallet row never names the referred
    // customer it came from, so there is no other user's PII to leak here.
    const expiring = computeRemainingCredits(ledger, now).find(
      (credit) => credit.expiresAt !== undefined,
    );
    const recent = await ctx.db
      .query("walletTransactions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(50);

    return {
      balance: computeAvailableBalance(ledger, now),
      maxRedemptionPercent: settings.maxRedemptionPercent,
      nextExpiry:
        expiring?.expiresAt !== undefined
          ? { amount: expiring.remaining, expiresAt: expiring.expiresAt }
          : null,
      transactions: recent.map((row) => ({
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
    // Nothing about the program's configuration is answered while it is off
    // or to a visitor without a wallet — not even the cap.
    const off = {
      programEnabled: false,
      balance: 0,
      redeemable: 0,
      maxRedemptionPercent: 0,
    };
    const settings = await loadSettings(ctx);
    const user = await getCurrentUser(ctx);
    if (!user || !settings.enabled) return off;

    const balance = computeAvailableBalance(
      toTransactionData(await loadLedger(ctx, user._id)),
      Date.now(),
    );
    return {
      programEnabled: true,
      balance,
      redeemable: computeRedeemable(
        balance,
        args.totalAfterDiscount,
        settings.maxRedemptionPercent,
      ),
      maxRedemptionPercent: settings.maxRedemptionPercent,
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
  ref: BookingRef & { note?: string },
): Promise<number> {
  const rows = await loadBookingLedgerRows(ctx, ref);
  if (rows.some((row) => row.kind === "redemptionReversal")) return 0;

  const now = Date.now();
  let restored = 0;
  for (const redemption of rows.filter((row) => row.kind === "redemption")) {
    await ctx.db.insert("walletTransactions", {
      userId: redemption.userId,
      kind: "redemptionReversal",
      amount: Math.abs(redemption.amount),
      expiresAt: redemption.expiresAt,
      ...bookingLink(ref),
      note: ref.note,
      createdAt: now,
    });
    restored += Math.abs(redemption.amount);
  }
  return Math.round(restored * 100) / 100;
}

// --- Admin wallet operations ---

/** How many ledger rows the admin dialog renders; the balance uses them all. */
const ADMIN_LEDGER_PAGE = 100;

export const listWalletTransactions = query({
  args: { userId: v.id("users") },
  returns: v.object({
    userName: v.string(),
    userEmail: v.string(),
    balance: v.number(),
    maxRedemptionPercent: v.number(),
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
        note: v.optional(v.string()),
        createdAt: v.number(),
      }),
    ),
  }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found.");
    }

    const settings = await loadSettings(ctx);
    const now = Date.now();
    const ledger = toTransactionData(await loadLedger(ctx, args.userId));
    const expiring = computeRemainingCredits(ledger, now).find(
      (credit) => credit.expiresAt !== undefined,
    );
    const recent = await ctx.db
      .query("walletTransactions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(ADMIN_LEDGER_PAGE);

    return {
      userName: user.name,
      userEmail: user.email,
      balance: computeAvailableBalance(ledger, now),
      maxRedemptionPercent: settings.maxRedemptionPercent,
      nextExpiry:
        expiring?.expiresAt !== undefined
          ? { amount: expiring.remaining, expiresAt: expiring.expiresAt }
          : null,
      transactions: recent.map((row) => ({
        id: row._id,
        kind: row.kind,
        amount: row.amount,
        expiresAt: row.expiresAt,
        note: row.note,
        createdAt: row.createdAt,
      })),
    };
  },
});

/**
 * Append one manual movement and return the balance it leaves behind. A
 * top-up expires like a referral credit; a claw-back carries no expiry and is
 * refused before anything is written when it would take the wallet below zero,
 * because the replay would otherwise swallow the shortfall as overdraft.
 */
export async function applyWalletAdjustment(
  ctx: MutationCtx,
  args: {
    userId: Id<"users">;
    amount: number;
    note: string;
    adminUserId: Id<"users">;
  },
): Promise<{ balance: number }> {
  const settings = await loadSettings(ctx);
  const now = Date.now();
  const ledger = toTransactionData(await loadLedger(ctx, args.userId));
  const plan = planWalletAdjustment({
    amount: args.amount,
    note: args.note,
    transactions: ledger,
    now,
    creditValidityMonths: settings.creditValidityMonths,
  });
  if (!plan.ok) {
    // ConvexError survives production error redaction, so the admin sees why
    throw new ConvexError({
      code: "WALLET_ADJUSTMENT_INVALID",
      reason: plan.error,
    });
  }

  const id = await ctx.db.insert("walletTransactions", {
    userId: args.userId,
    kind: "manualAdjustment",
    amount: plan.amount,
    expiresAt: plan.expiresAt,
    createdByUserId: args.adminUserId,
    note: args.note.trim(),
    createdAt: now,
  });

  return {
    balance: computeAvailableBalance(
      [
        ...ledger,
        {
          id,
          kind: "manualAdjustment",
          amount: plan.amount,
          expiresAt: plan.expiresAt,
          createdAt: now,
        },
      ],
      now,
    ),
  };
}

/**
 * Manual top-up or claw-back for offline referrals and corrections. It works
 * whether or not the program is enabled, because an owner configures the
 * wallet before flipping the program on.
 */
export const adjustWallet = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    note: v.string(),
  },
  returns: v.object({ balance: v.number() }),
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const user = await ctx.db.get(args.userId);
    if (!user || user.deletedAt !== undefined) {
      throw new Error("User not found.");
    }
    return await applyWalletAdjustment(ctx, {
      ...args,
      adminUserId: admin._id,
    });
  },
});
