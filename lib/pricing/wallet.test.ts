import { describe, expect, it } from "vitest";
import {
  allocateRedemption,
  bookingAmountDue,
  computeAvailableBalance,
  computeCreditForConversion,
  computeRedeemable,
  computeRemainingCredits,
  creditExpiry,
  planRedemption,
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

  it("charges a spend only to credit that was live when it was recorded", () => {
    // 40 lapses on day 1, 60 runs to day 60; the spend happens on day 10, so
    // it can only come out of the credit that was still alive then.
    const txns = [
      credit("lapsed", 40, NOW + DAY),
      credit("live", 60, NOW + 60 * DAY),
      redemption("r", 40, NOW + 10 * DAY),
    ];
    expect(computeAvailableBalance(txns, NOW + 10 * DAY)).toBe(20);
  });

  it("does not let a later credit pay for an earlier spend", () => {
    const txns = [
      credit("early", 10, NOW + 60 * DAY),
      redemption("r", 30, NOW + DAY),
      // Minted afterwards, and expiring sooner, so it must not sort ahead
      credit("late", 50, NOW + 5 * DAY, NOW + 2 * DAY),
    ];
    // The 20 the wallet could not cover stays an overdraft against the later
    // credit rather than silently vanishing
    expect(computeAvailableBalance(txns, NOW + 3 * DAY)).toBe(30);
  });

  it("a credit reversal takes back its own conversion's credit first", () => {
    const txns: WalletTransactionData[] = [
      { ...credit("c1", 50, NOW + 60 * DAY), conversionId: "conv1" },
      { ...credit("c2", 30, NOW + 10 * DAY), conversionId: "conv2" },
      {
        id: "rev",
        kind: "creditReversal",
        amount: -50,
        conversionId: "conv1",
        createdAt: NOW + DAY,
      },
    ];
    // conv2's sooner-expiring credit is untouched despite FIFO ordering
    expect(computeRemainingCredits(txns, NOW + DAY)).toEqual([
      {
        id: "c2",
        remaining: 30,
        expiresAt: NOW + 10 * DAY,
        createdAt: NOW,
        conversionId: "conv2",
      },
    ]);
  });

  it("a reversal of an already-spent credit falls through as a debit", () => {
    const txns: WalletTransactionData[] = [
      { ...credit("c1", 50, NOW + 60 * DAY), conversionId: "conv1" },
      { ...credit("c2", 50, NOW + 60 * DAY), conversionId: "conv2" },
      redemption("spend", 50, NOW + DAY),
      {
        id: "rev",
        kind: "creditReversal",
        amount: -50,
        conversionId: "conv1",
        createdAt: NOW + 2 * DAY,
      },
    ];
    // 100 credited, 50 spent, 50 clawed back — nothing left, never inflated
    expect(computeAvailableBalance(txns, NOW + 3 * DAY)).toBe(0);
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

  it("floors the cap to cents so it can never exceed the percentage", () => {
    expect(computeRedeemable(500, 333.33, 50)).toBe(166.66);
    expect(computeRedeemable(100, 33.333, 50)).toBe(16.66);
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

describe("bookingAmountDue", () => {
  it("is the full price when no credit was spent", () => {
    expect(bookingAmountDue(320)).toBe(320);
    expect(bookingAmountDue(320, 0)).toBe(320);
  });

  it("subtracts the credit and never goes below zero", () => {
    expect(bookingAmountDue(320, 160)).toBe(160);
    expect(bookingAmountDue(320, 400)).toBe(0);
  });

  it("keeps cents exact", () => {
    expect(bookingAmountDue(99.99, 33.33)).toBe(66.66);
  });
});

describe("planRedemption", () => {
  // 400 EUR is a worked booking: 500 EUR of rental + protection + extras with
  // a 20 % discount already applied, so the 50 % cap is 200 EUR.
  const plan = (
    transactions: WalletTransactionData[],
    overrides: Partial<Parameters<typeof planRedemption>[0]> = {},
  ) =>
    planRedemption({
      requested: true,
      programEnabled: true,
      transactions,
      totalAfterDiscount: 400,
      maxRedemptionPercent: 50,
      now: NOW,
      ...overrides,
    });

  it("redeems nothing when the switch is off or the program is disabled", () => {
    const wallet = [credit("c1", 100, NOW + 30 * DAY)];
    expect(plan(wallet, { requested: false })).toEqual({
      amount: 0,
      entries: [],
    });
    expect(plan(wallet, { programEnabled: false })).toEqual({
      amount: 0,
      entries: [],
    });
  });

  it("redeems nothing on an empty wallet", () => {
    expect(plan([])).toEqual({ amount: 0, entries: [] });
  });

  it("caps at half of the post-discount total when the balance is larger", () => {
    const result = plan([credit("c1", 300, NOW + 30 * DAY)]);
    expect(result.amount).toBe(200);
    expect(result.entries).toEqual([
      { creditId: "c1", amount: 200, expiresAt: NOW + 30 * DAY },
    ]);
  });

  it("spends the whole balance when it is under the cap", () => {
    expect(plan([credit("c1", 75, NOW + 30 * DAY)]).amount).toBe(75);
  });

  it("splits across credits, soonest-expiring first, keeping each expiry", () => {
    const result = plan([
      credit("late", 150, NOW + 90 * DAY),
      credit("soon", 60, NOW + 10 * DAY),
    ]);
    expect(result.amount).toBe(200);
    expect(result.entries).toEqual([
      { creditId: "soon", amount: 60, expiresAt: NOW + 10 * DAY },
      { creditId: "late", amount: 140, expiresAt: NOW + 90 * DAY },
    ]);
  });

  it("ignores credit that has already expired", () => {
    const result = plan([
      credit("gone", 300, NOW - DAY),
      credit("live", 40, NOW + DAY),
    ]);
    expect(result.amount).toBe(40);
    expect(result.entries).toEqual([
      { creditId: "live", amount: 40, expiresAt: NOW + DAY },
    ]);
  });

  it("leaves nothing to redeem once an earlier booking spent the credit", () => {
    expect(
      plan([
        credit("c1", 100, NOW + 30 * DAY, NOW - DAY),
        redemption("r1", 100, NOW - DAY),
      ]),
    ).toEqual({ amount: 0, entries: [] });
  });

  it("gives the exact amount back when the spend is reversed", () => {
    const ledger: WalletTransactionData[] = [
      credit("c1", 100, NOW + 30 * DAY, NOW - 2 * DAY),
      redemption("r1", 100, NOW - DAY),
      {
        id: "rr1",
        kind: "redemptionReversal",
        amount: 100,
        expiresAt: NOW + 30 * DAY,
        createdAt: NOW,
      },
    ];
    expect(computeAvailableBalance(ledger, NOW)).toBe(100);
    expect(plan(ledger).amount).toBe(100);
  });

  it("redeems nothing against a free booking", () => {
    expect(
      plan([credit("c1", 100, NOW + 30 * DAY)], { totalAfterDiscount: 0 }),
    ).toEqual({ amount: 0, entries: [] });
  });
});
