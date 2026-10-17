import { describe, expect, it, vi } from "vitest";
import { ConvexError } from "convex/values";
import type { MutationCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import {
  applyWalletAdjustment,
  redeemWalletCredit,
  reverseWalletRedemption,
} from "./wallet";

const USER = "user-1" as Id<"users">;
const RESERVATION = "reservation-1" as Id<"reservations">;
const NOW = Date.UTC(2026, 0, 15, 12, 0, 0);
const YEAR = 365 * 24 * 60 * 60 * 1000;

type WalletRow = Partial<Doc<"walletTransactions">>;

/**
 * Mocked db, same shape as convex/counters.test.ts: `by_user` answers the
 * whole ledger and `by_reservation`/`by_transfer` the booking's own rows, so
 * the helpers' index choices are part of what is asserted.
 */
function createContext({
  ledger = [],
  bookingRows = [],
  settings = { enabled: true, maxRedemptionPercent: 50 },
}: {
  ledger?: WalletRow[];
  bookingRows?: WalletRow[];
  settings?: { enabled: boolean; maxRedemptionPercent: number } | null;
}) {
  const insert = vi.fn().mockResolvedValue("wallet-row");
  const first = vi.fn().mockResolvedValue(settings);
  const query = vi.fn((table: string) => {
    if (table === "affiliateSettings") return { first };
    return {
      withIndex: vi.fn((index: string) => ({
        collect: vi
          .fn()
          .mockResolvedValue(index === "by_user" ? ledger : bookingRows),
      })),
    };
  });

  return {
    ctx: { db: { query, insert } } as unknown as MutationCtx,
    insert,
    query,
  };
}

const credit = (id: string, amount: number): WalletRow => ({
  _id: id as Id<"walletTransactions">,
  userId: USER,
  kind: "referralCredit",
  amount,
  expiresAt: NOW + YEAR,
  createdAt: NOW - 1000,
});

const redemption = (id: string, amount: number): WalletRow => ({
  _id: id as Id<"walletTransactions">,
  userId: USER,
  kind: "redemption",
  amount: -amount,
  expiresAt: NOW + YEAR,
  reservationId: RESERVATION,
  createdAt: NOW - 500,
});

const redeem = (ctx: MutationCtx, overrides: { userId?: Id<"users"> } = {}) =>
  redeemWalletCredit(ctx, {
    bookingType: "reservation",
    bookingId: RESERVATION,
    userId: USER,
    totalAfterDiscount: 400,
    requested: true,
    ...overrides,
  });

describe("redeemWalletCredit", () => {
  it("ignores the request from a guest without touching the database", async () => {
    const { ctx, insert, query } = createContext({
      ledger: [credit("c1", 90)],
    });

    await expect(redeem(ctx, { userId: undefined })).resolves.toBe(0);
    expect(insert).not.toHaveBeenCalled();
    expect(query).not.toHaveBeenCalled();
  });

  it("ignores the request when the switch is off", async () => {
    const { ctx, insert } = createContext({ ledger: [credit("c1", 90)] });

    await expect(
      redeemWalletCredit(ctx, {
        bookingType: "reservation",
        bookingId: RESERVATION,
        userId: USER,
        totalAfterDiscount: 400,
        requested: false,
      }),
    ).resolves.toBe(0);
    expect(insert).not.toHaveBeenCalled();
  });

  it("writes nothing while the referral program is disabled", async () => {
    const { ctx, insert } = createContext({
      ledger: [credit("c1", 90)],
      settings: { enabled: false, maxRedemptionPercent: 50 },
    });

    await expect(redeem(ctx)).resolves.toBe(0);
    expect(insert).not.toHaveBeenCalled();
  });

  it("writes one debit per credit consumed, carrying its expiry", async () => {
    const { ctx, insert } = createContext({
      ledger: [credit("c1", 90), credit("c2", 200)],
    });

    // 50 % of 400 is 200: the whole of c1 plus 110 of c2.
    await expect(redeem(ctx)).resolves.toBe(200);
    expect(insert).toHaveBeenCalledTimes(2);
    expect(
      insert.mock.calls.map(([table, row]) => [table, row.amount]),
    ).toEqual([
      ["walletTransactions", -90],
      ["walletTransactions", -110],
    ]);
    expect(insert.mock.calls[0][1]).toMatchObject({
      userId: USER,
      kind: "redemption",
      expiresAt: NOW + YEAR,
      reservationId: RESERVATION,
    });
  });

  it("writes nothing when the wallet is empty", async () => {
    const { ctx, insert } = createContext({ ledger: [] });

    await expect(redeem(ctx)).resolves.toBe(0);
    expect(insert).not.toHaveBeenCalled();
  });
});

describe("reverseWalletRedemption", () => {
  const reverse = (ctx: MutationCtx) =>
    reverseWalletRedemption(ctx, {
      bookingType: "reservation",
      bookingId: RESERVATION,
    });

  it("gives back one credit row per debit, with the original expiry", async () => {
    const { ctx, insert } = createContext({
      bookingRows: [redemption("r1", 90), redemption("r2", 110)],
    });

    await expect(reverse(ctx)).resolves.toBe(200);
    expect(insert).toHaveBeenCalledTimes(2);
    expect(insert.mock.calls.map(([, row]) => row.amount)).toEqual([90, 110]);
    expect(insert.mock.calls[0][1]).toMatchObject({
      userId: USER,
      kind: "redemptionReversal",
      expiresAt: NOW + YEAR,
      reservationId: RESERVATION,
    });
  });

  it("is a no-op once the booking already has a reversal", async () => {
    const { ctx, insert } = createContext({
      bookingRows: [
        redemption("r1", 90),
        { ...redemption("rr1", -90), kind: "redemptionReversal", amount: 90 },
      ],
    });

    await expect(reverse(ctx)).resolves.toBe(0);
    expect(insert).not.toHaveBeenCalled();
  });

  it("returns 0 for a booking that never spent credit", async () => {
    const { ctx, insert } = createContext({ bookingRows: [] });

    await expect(reverse(ctx)).resolves.toBe(0);
    expect(insert).not.toHaveBeenCalled();
  });
});

describe("applyWalletAdjustment", () => {
  const ADMIN = "admin-1" as Id<"users">;
  const adjust = (ctx: MutationCtx, amount: number, note = "offline ref") =>
    applyWalletAdjustment(ctx, {
      userId: USER,
      amount,
      note,
      adminUserId: ADMIN,
    });

  it("stamps a top-up with the admin, the note and the configured expiry", async () => {
    const { ctx, insert } = createContext({ ledger: [] });

    const { balance } = await adjust(ctx, 25.004, "  offline referral  ");
    expect(balance).toBe(25);
    expect(insert).toHaveBeenCalledTimes(1);
    expect(insert.mock.calls[0][1]).toMatchObject({
      userId: USER,
      kind: "manualAdjustment",
      amount: 25,
      createdByUserId: ADMIN,
      note: "offline referral",
    });
    expect(insert.mock.calls[0][1].expiresAt).toBeGreaterThan(Date.now());
  });

  it("claws credit back down to zero", async () => {
    const { ctx, insert } = createContext({ ledger: [credit("c1", 90)] });

    await expect(adjust(ctx, -90)).resolves.toEqual({ balance: 0 });
    expect(insert.mock.calls[0][1]).toMatchObject({ amount: -90 });
    expect(insert.mock.calls[0][1].expiresAt).toBeUndefined();
  });

  // ConvexError, not Error: production redacts a plain Error to "Server Error"
  it("writes nothing when the claw-back would go below zero", async () => {
    const { ctx, insert } = createContext({ ledger: [credit("c1", 90)] });

    await expect(adjust(ctx, -90.01)).rejects.toThrow(ConvexError);
    await expect(adjust(ctx, -90.01)).rejects.toMatchObject({
      data: {
        code: "WALLET_ADJUSTMENT_INVALID",
        reason: expect.stringContaining("available balance"),
      },
    });
    expect(insert).not.toHaveBeenCalled();
  });

  it("writes nothing without a note", async () => {
    const { ctx, insert } = createContext({ ledger: [] });

    await expect(adjust(ctx, 10, "   ")).rejects.toThrow(/note is required/);
    expect(insert).not.toHaveBeenCalled();
  });
});
