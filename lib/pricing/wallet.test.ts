import { describe, expect, it } from "vitest";
import {
  allocateRedemption,
  computeAvailableBalance,
  computeCreditForConversion,
  computeRedeemable,
  computeRemainingCredits,
  creditExpiry,
  type WalletCredit,
  type WalletTransactionData,
} from "./wallet";

const NOW = Date.UTC(2026, 0, 15, 12, 0, 0);
const DAY = 24 * 60 * 60 * 1000;

const credit = (
  id: string,
  amount: number,
  expiresAt?: number,
  createdAt = NOW,
): WalletTransactionData => ({
  id,
  kind: "referralCredit",
  amount,
  expiresAt,
  createdAt,
});

const redemption = (
  id: string,
  amount: number,
  createdAt = NOW,
): WalletTransactionData => ({
  id,
  kind: "redemption",
  amount: -Math.abs(amount),
  createdAt,
});

describe("allocateRedemption", () => {
  const credits: WalletCredit[] = [
    { id: "far", remaining: 100, expiresAt: NOW + 90 * DAY, createdAt: NOW },
    { id: "soon", remaining: 30, expiresAt: NOW + 10 * DAY, createdAt: NOW },
    { id: "never", remaining: 50, createdAt: NOW },
  ];

  it("spends the soonest-expiring credit first", () => {
    expect(allocateRedemption(credits, 40)).toEqual({
      allocations: [
        { creditId: "soon", amount: 30 },
        { creditId: "far", amount: 10 },
      ],
      allocated: 40,
      unallocated: 0,
    });
  });

  it("puts never-expiring credit last", () => {
    const { allocations } = allocateRedemption(credits, 180);
    expect(allocations.map((a) => a.creditId)).toEqual([
      "soon",
      "far",
      "never",
    ]);
  });

  it("reports what the wallet could not cover", () => {
    const result = allocateRedemption(credits, 200);
    expect(result.allocated).toBe(180);
    expect(result.unallocated).toBe(20);
  });

  it("breaks expiry ties by age", () => {
    const sameExpiry: WalletCredit[] = [
      { id: "newer", remaining: 10, expiresAt: NOW + DAY, createdAt: NOW },
      {
        id: "older",
        remaining: 10,
        expiresAt: NOW + DAY,
        createdAt: NOW - DAY,
      },
    ];
    expect(allocateRedemption(sameExpiry, 5).allocations).toEqual([
      { creditId: "older", amount: 5 },
    ]);
  });

  it("does not mutate the credits it was given", () => {
    const input: WalletCredit[] = [{ id: "a", remaining: 10, createdAt: NOW }];
    allocateRedemption(input, 10);
    expect(input[0].remaining).toBe(10);
  });

  it("allocates nothing for a non-positive amount", () => {
    expect(allocateRedemption(credits, 0).allocations).toEqual([]);
    expect(allocateRedemption(credits, -5).allocated).toBe(0);
  });
});

describe("computeAvailableBalance", () => {
  it("is 0 for an empty ledger", () => {
    expect(computeAvailableBalance([], NOW)).toBe(0);
  });

  it("sums unexpired credits minus redemptions", () => {
    expect(
      computeAvailableBalance(
        [
          credit("a", 40, NOW + 30 * DAY),
          credit("b", 25, NOW + 60 * DAY),
          redemption("r", 15),
        ],
        NOW,
      ),
    ).toBe(50);
  });

  it("drops an expired credit without leaving its spend behind as debt", () => {
    const txns = [
      credit("expiring", 40, NOW + DAY),
      credit("later", 60, NOW + 60 * DAY),
      redemption("r", 40),
    ];
    // Before expiry the spend came out of the soonest-expiring credit
    expect(computeAvailableBalance(txns, NOW)).toBe(60);
    // ...so once that credit lapses the remaining credit is untouched
    expect(computeAvailableBalance(txns, NOW + 2 * DAY)).toBe(60);
  });

  it("treats expiry as exclusive at the boundary millisecond", () => {
    const txns = [credit("a", 10, NOW + DAY)];
    expect(computeAvailableBalance(txns, NOW + DAY - 1)).toBe(10);
    expect(computeAvailableBalance(txns, NOW + DAY)).toBe(0);
  });

  it("restores spend when a redemption is reversed", () => {
    const txns: WalletTransactionData[] = [
      credit("a", 100, NOW + 30 * DAY),
      redemption("r", 40),
      {
        id: "rev",
        kind: "redemptionReversal",
        amount: 40,
        createdAt: NOW,
      },
    ];
    expect(computeAvailableBalance(txns, NOW)).toBe(100);
  });

  it("lets a negative manual adjustment claw credit back", () => {
    const txns: WalletTransactionData[] = [
      credit("a", 50, NOW + 30 * DAY),
      { id: "adj", kind: "manualAdjustment", amount: -20, createdAt: NOW },
    ];
    expect(computeAvailableBalance(txns, NOW)).toBe(30);
  });

  it("never reports a negative balance", () => {
    const txns: WalletTransactionData[] = [
      credit("a", 10, NOW + 30 * DAY),
      redemption("r", 50),
    ];
    expect(computeAvailableBalance(txns, NOW)).toBe(0);
  });

  it("keeps cents exact across many small credits", () => {
    const txns = Array.from({ length: 3 }, (_, i) =>
      credit(`c${i}`, 0.1, NOW + 30 * DAY),
    );
    expect(computeAvailableBalance(txns, NOW)).toBe(0.3);
  });
});

describe("computeRemainingCredits", () => {
  it("returns unexpired credits soonest-expiring first, partially spent", () => {
    expect(
      computeRemainingCredits(
        [
          credit("far", 100, NOW + 90 * DAY),
          credit("soon", 30, NOW + 10 * DAY),
          redemption("r", 20),
        ],
        NOW,
      ),
    ).toEqual([
      { id: "soon", remaining: 10, expiresAt: NOW + 10 * DAY, createdAt: NOW },
      { id: "far", remaining: 100, expiresAt: NOW + 90 * DAY, createdAt: NOW },
    ]);
  });

  it("omits fully spent credits", () => {
    expect(
      computeRemainingCredits(
        [credit("a", 20, NOW + 10 * DAY), redemption("r", 20)],
        NOW,
      ),
    ).toEqual([]);
  });
});

describe("computeRedeemable", () => {
  it("caps at the configured share of the post-discount total", () => {
    expect(computeRedeemable(500, 200, 50)).toBe(100);
  });

  it("is limited by the balance when that is smaller than the cap", () => {
    expect(computeRedeemable(30, 200, 50)).toBe(30);
  });

  it("rounds the cap to cents", () => {
    expect(computeRedeemable(500, 333.33, 50)).toBe(166.67);
  });

  it("returns 0 for an empty wallet, a free booking or a 0% cap", () => {
    expect(computeRedeemable(0, 200, 50)).toBe(0);
    expect(computeRedeemable(500, 0, 50)).toBe(0);
    expect(computeRedeemable(500, 200, 0)).toBe(0);
  });

  it("never lets a cap above 100% exceed the total", () => {
    expect(computeRedeemable(500, 200, 150)).toBe(200);
  });
});

describe("computeCreditForConversion", () => {
  it("applies the tier percent to the referred booking total", () => {
    expect(computeCreditForConversion(240, 5)).toBe(12);
    expect(computeCreditForConversion(240, 10)).toBe(24);
  });

  it("rounds to cents", () => {
    expect(computeCreditForConversion(333.33, 5)).toBe(16.67);
  });

  it("mints nothing without a total or a tier", () => {
    expect(computeCreditForConversion(0, 10)).toBe(0);
    expect(computeCreditForConversion(240, 0)).toBe(0);
    expect(computeCreditForConversion(-10, 10)).toBe(0);
  });
});

describe("creditExpiry", () => {
  it("adds whole months", () => {
    expect(creditExpiry(Date.UTC(2026, 0, 15), 12)).toBe(Date.UTC(2027, 0, 15));
  });

  it("clamps to the last day of a shorter target month", () => {
    expect(creditExpiry(Date.UTC(2026, 0, 31), 1)).toBe(Date.UTC(2026, 1, 28));
    expect(creditExpiry(Date.UTC(2028, 0, 31), 1)).toBe(Date.UTC(2028, 1, 29));
  });

  it("keeps the time of day", () => {
    expect(creditExpiry(Date.UTC(2026, 0, 15, 9, 30, 15, 250), 12)).toBe(
      Date.UTC(2027, 0, 15, 9, 30, 15, 250),
    );
  });
});
