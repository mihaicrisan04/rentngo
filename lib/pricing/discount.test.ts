import { describe, expect, it } from "vitest";
import {
  applyDiscountToTotal,
  bucharestEndOfDayMs,
  computeCouponDiscount,
  evaluateCoupon,
  normalizeCouponCode,
  normalizeCustomerEmail,
  pickDiscount,
  type AppliedDiscount,
  type CouponData,
} from "./discount";

const baseCoupon: CouponData = {
  discountType: "percentage",
  discountValue: 10,
  redemptionCount: 0,
  appliesTo: "both",
  isActive: true,
};

const context = { bookingType: "rentals" as const, subtotal: 200, now: 1_000 };

describe("normalizeCouponCode", () => {
  it("uppercases and trims", () => {
    expect(normalizeCouponCode("  rngo10 ")).toBe("RNGO10");
    expect(normalizeCouponCode("Summer-2026")).toBe("SUMMER-2026");
  });
});

describe("normalizeCustomerEmail", () => {
  it("lowercases and trims", () => {
    expect(normalizeCustomerEmail(" John@Example.COM ")).toBe(
      "john@example.com",
    );
  });
});

describe("computeCouponDiscount", () => {
  it("computes percentage discounts rounded to cents", () => {
    expect(computeCouponDiscount(200, "percentage", 10)).toBe(20);
    expect(computeCouponDiscount(333, "percentage", 15)).toBe(49.95);
    expect(computeCouponDiscount(57.6, "percentage", 10)).toBe(5.76);
  });

  it("caps a 100% discount at the subtotal", () => {
    expect(computeCouponDiscount(150, "percentage", 100)).toBe(150);
  });

  it("returns fixed amounts as-is when below the subtotal", () => {
    expect(computeCouponDiscount(200, "fixed", 20)).toBe(20);
  });

  it("clamps fixed amounts to the subtotal (total floors at 0)", () => {
    expect(computeCouponDiscount(15, "fixed", 50)).toBe(15);
  });

  it("never discounts a non-positive subtotal", () => {
    expect(computeCouponDiscount(0, "fixed", 50)).toBe(0);
    expect(computeCouponDiscount(-10, "percentage", 10)).toBe(0);
  });

  it("never returns a negative discount", () => {
    expect(computeCouponDiscount(100, "fixed", -5)).toBe(0);
  });
});

describe("applyDiscountToTotal", () => {
  it("subtracts and rounds to cents", () => {
    expect(applyDiscountToTotal(200, 49.95)).toBe(150.05);
  });

  it("floors at zero even for an oversized discount", () => {
    expect(applyDiscountToTotal(20, 50)).toBe(0);
  });
});

describe("evaluateCoupon", () => {
  it("accepts a valid coupon and returns the computed discount", () => {
    expect(evaluateCoupon(baseCoupon, context)).toEqual({
      valid: true,
      discountAmount: 20,
    });
  });

  it("rejects an inactive coupon", () => {
    expect(evaluateCoupon({ ...baseCoupon, isActive: false }, context)).toEqual(
      { valid: false, reason: "inactive" },
    );
  });

  it("treats the expiry timestamp itself as still valid (inclusive bound)", () => {
    const coupon = { ...baseCoupon, expiresAt: 1_000 };
    expect(evaluateCoupon(coupon, { ...context, now: 1_000 })).toMatchObject({
      valid: true,
    });
    expect(evaluateCoupon(coupon, { ...context, now: 1_001 })).toEqual({
      valid: false,
      reason: "expired",
    });
  });

  it("rejects an exhausted coupon (redemptions reached the cap)", () => {
    expect(
      evaluateCoupon(
        { ...baseCoupon, maxRedemptions: 5, redemptionCount: 5 },
        context,
      ),
    ).toEqual({ valid: false, reason: "exhausted" });
    expect(
      evaluateCoupon(
        { ...baseCoupon, maxRedemptions: 5, redemptionCount: 4 },
        context,
      ),
    ).toMatchObject({ valid: true });
  });

  it("rejects the wrong booking type but accepts 'both'", () => {
    expect(
      evaluateCoupon({ ...baseCoupon, appliesTo: "transfers" }, context),
    ).toEqual({ valid: false, reason: "wrongBookingType" });
    expect(
      evaluateCoupon(
        { ...baseCoupon, appliesTo: "transfers" },
        { ...context, bookingType: "transfers" },
      ),
    ).toMatchObject({ valid: true });
  });

  it("gates on the minimum order value (inclusive)", () => {
    const coupon = { ...baseCoupon, minOrderValue: 200 };
    expect(evaluateCoupon(coupon, context)).toMatchObject({ valid: true });
    expect(
      evaluateCoupon(coupon, { ...context, subtotal: 199.99 }),
    ).toEqual({ valid: false, reason: "belowMinimum" });
  });
});

describe("bucharestEndOfDayMs", () => {
  it("uses UTC+3 in summer (EEST)", () => {
    expect(bucharestEndOfDayMs("2026-07-15")).toBe(
      Date.parse("2026-07-15T20:59:59.999Z"),
    );
  });

  it("uses UTC+2 in winter (EET)", () => {
    expect(bucharestEndOfDayMs("2026-01-15")).toBe(
      Date.parse("2026-01-15T21:59:59.999Z"),
    );
  });

  it("handles the DST-start day (last Sunday of March)", () => {
    // 2026-03-29 is the last Sunday of March; by 23:59 local, EEST is active
    expect(bucharestEndOfDayMs("2026-03-29")).toBe(
      Date.parse("2026-03-29T20:59:59.999Z"),
    );
    // the day before is still EET
    expect(bucharestEndOfDayMs("2026-03-28")).toBe(
      Date.parse("2026-03-28T21:59:59.999Z"),
    );
  });

  it("handles the DST-end day (last Sunday of October)", () => {
    // 2026-10-25 is the last Sunday of October; by 23:59 local, EET is back
    expect(bucharestEndOfDayMs("2026-10-25")).toBe(
      Date.parse("2026-10-25T21:59:59.999Z"),
    );
    expect(bucharestEndOfDayMs("2026-10-24")).toBe(
      Date.parse("2026-10-24T20:59:59.999Z"),
    );
  });

  it("rejects malformed dates", () => {
    expect(() => bucharestEndOfDayMs("not-a-date")).toThrow();
  });
});

describe("pickDiscount", () => {
  const coupon: AppliedDiscount = { source: "coupon", code: "A", amount: 10 };

  it("returns null with no candidates", () => {
    expect(pickDiscount([null, undefined])).toBeNull();
  });

  it("returns the only candidate", () => {
    expect(pickDiscount([null, coupon])).toBe(coupon);
  });

  it("prefers an explicit coupon and never stacks", () => {
    const other = { ...coupon, code: "B" };
    expect(pickDiscount([other, coupon])).toBe(other);
  });
});
