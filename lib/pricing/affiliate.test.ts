import { describe, expect, it } from "vitest";
import {
  computeReferredDiscount,
  conversionTransition,
  withSettingsDefaults,
  BLOCKING_CONVERSION_STATUSES,
  isValidAffiliateSlug,
  nextTier,
  normalizeAffiliateSlug,
  referredEligibility,
  resolveTierRewardPercent,
  validateAffiliateSettings,
  DEFAULT_AFFILIATE_SETTINGS,
  type AffiliateTier,
  type ConversionStatus,
  type ConversionBookingStatus,
} from "./affiliate";
import { pickDiscount, type AppliedDiscount } from "./discount";

const tiers: AffiliateTier[] = [
  { minConversions: 6, rewardPercent: 5 },
  { minConversions: 12, rewardPercent: 8 },
  { minConversions: 25, rewardPercent: 12 },
];

describe("resolveTierRewardPercent", () => {
  it("returns 0 below the first threshold", () => {
    expect(resolveTierRewardPercent(tiers, 0)).toBe(0);
    expect(resolveTierRewardPercent(tiers, 5)).toBe(0);
  });

  it("unlocks a tier exactly at its threshold", () => {
    expect(resolveTierRewardPercent(tiers, 6)).toBe(5);
    expect(resolveTierRewardPercent(tiers, 12)).toBe(8);
    expect(resolveTierRewardPercent(tiers, 25)).toBe(12);
  });

  it("keeps the highest unlocked tier between thresholds and above the top", () => {
    expect(resolveTierRewardPercent(tiers, 11)).toBe(5);
    expect(resolveTierRewardPercent(tiers, 24)).toBe(8);
    expect(resolveTierRewardPercent(tiers, 1000)).toBe(12);
  });

  it("does not depend on the tier table being sorted", () => {
    const shuffled = [tiers[2], tiers[0], tiers[1]];
    expect(resolveTierRewardPercent(shuffled, 13)).toBe(8);
  });

  it("returns 0 for an empty tier table", () => {
    expect(resolveTierRewardPercent([], 100)).toBe(0);
  });

  it("lets a per-affiliate override replace the tier table entirely", () => {
    expect(resolveTierRewardPercent(tiers, 0, 15)).toBe(15);
    expect(resolveTierRewardPercent(tiers, 100, 3)).toBe(3);
    // An explicit 0 override disables the reward even above thresholds
    expect(resolveTierRewardPercent(tiers, 100, 0)).toBe(0);
  });
});

describe("nextTier", () => {
  it("points at the closest not-yet-reached tier", () => {
    expect(nextTier(tiers, 0)).toEqual({ minConversions: 6, rewardPercent: 5 });
    expect(nextTier(tiers, 6)).toEqual({
      minConversions: 12,
      rewardPercent: 8,
    });
  });

  it("returns null once the top tier is reached", () => {
    expect(nextTier(tiers, 25)).toBeNull();
    expect(nextTier([], 0)).toBeNull();
  });
});

describe("computeReferredDiscount", () => {
  it("computes percentage discounts rounded to cents", () => {
    expect(
      computeReferredDiscount(333, { type: "percentage", value: 10 }),
    ).toBe(33.3);
  });

  it("clamps fixed discounts to the subtotal (total never negative)", () => {
    expect(computeReferredDiscount(8, { type: "fixed", value: 10 })).toBe(8);
    expect(computeReferredDiscount(200, { type: "fixed", value: 10 })).toBe(10);
  });

  it("grants nothing on a non-positive subtotal", () => {
    expect(computeReferredDiscount(0, { type: "fixed", value: 10 })).toBe(0);
    expect(computeReferredDiscount(-5, { type: "percentage", value: 50 })).toBe(
      0,
    );
  });
});

describe("pickDiscount with coupon and affiliate candidates", () => {
  const coupon: AppliedDiscount = {
    source: "coupon",
    code: "SUMMER10",
    amount: 10,
  };
  const affiliate: AppliedDiscount = {
    source: "affiliate",
    code: "john-doe",
    amount: 25,
  };

  it("an explicit coupon beats an automatic affiliate discount, even a larger one", () => {
    expect(pickDiscount([coupon, affiliate])).toBe(coupon);
    expect(pickDiscount([affiliate, coupon])).toBe(coupon);
  });

  it("falls back to the affiliate discount when no coupon is present", () => {
    expect(pickDiscount([null, affiliate])).toBe(affiliate);
  });

  it("among affiliate candidates the first wins (referred before own reward)", () => {
    const ownReward: AppliedDiscount = {
      source: "affiliate",
      code: "own-reward",
      amount: 5,
    };
    expect(pickDiscount([null, affiliate, ownReward])).toBe(affiliate);
  });
});

describe("conversionTransition", () => {
  const ALL_STATUSES: ConversionStatus[] = [
    "pending",
    "awaitingApproval",
    "approved",
    "rejected",
    "voided",
    "confirmed",
  ];
  const ALL_BOOKING_STATUSES: ConversionBookingStatus[] = [
    "pending",
    "confirmed",
    "cancelled",
    "completed",
    "deleted",
  ];
  const dead: ConversionBookingStatus[] = ["cancelled", "deleted"];
  const noEffects = {
    counterDelta: 0,
    mintCredit: false,
    reverseCredit: false,
  };

  it("never writes the legacy status and never mints and reverses at once", () => {
    for (const current of ALL_STATUSES) {
      for (const bookingStatus of ALL_BOOKING_STATUSES) {
        for (const adminAction of [
          undefined,
          "approve",
          "reject",
        ] as const satisfies readonly ("approve" | "reject" | undefined)[]) {
          const result = conversionTransition({
            current,
            bookingStatus,
            adminAction,
          });
          if (!result) continue;
          expect(result.nextStatus).not.toBe("confirmed");
          expect(result.mintCredit && result.reverseCredit).toBe(false);
          expect(result.nextStatus).not.toBe(
            current === "confirmed" ? "approved" : current,
          );
        }
      }
    }
  });

  it("voids and reverses an approved conversion when the booking dies", () => {
    for (const bookingStatus of dead) {
      for (const current of ["approved", "confirmed"] as const) {
        expect(conversionTransition({ current, bookingStatus })).toEqual({
          nextStatus: "voided",
          counterDelta: -1,
          mintCredit: false,
          reverseCredit: true,
        });
      }
    }
  });

  it("voids an unapproved conversion without touching the counter", () => {
    for (const bookingStatus of dead) {
      for (const current of [
        "pending",
        "awaitingApproval",
        "rejected",
      ] as const) {
        expect(conversionTransition({ current, bookingStatus })).toEqual({
          nextStatus: "voided",
          ...noEffects,
        });
      }
    }
  });

  it("is idempotent: a second cancel or delete never double-decrements", () => {
    for (const bookingStatus of dead) {
      expect(
        conversionTransition({ current: "voided", bookingStatus }),
      ).toBeNull();
    }
  });

  it("a completed booking parks the conversion for approval", () => {
    expect(
      conversionTransition({ current: "pending", bookingStatus: "completed" }),
    ).toEqual({ nextStatus: "awaitingApproval", ...noEffects });
  });

  it("auto-approval mints on completion instead", () => {
    expect(
      conversionTransition({
        current: "pending",
        bookingStatus: "completed",
        autoApproveOnCompletion: true,
      }),
    ).toEqual({
      nextStatus: "approved",
      counterDelta: 1,
      mintCredit: true,
      reverseCredit: false,
    });
  });

  it("completion does not disturb an already decided conversion", () => {
    for (const current of [
      "awaitingApproval",
      "approved",
      "confirmed",
      "rejected",
    ] as const) {
      expect(
        conversionTransition({ current, bookingStatus: "completed" }),
      ).toBeNull();
    }
  });

  it("admin approval mints once and is idempotent", () => {
    expect(
      conversionTransition({
        current: "awaitingApproval",
        bookingStatus: "completed",
        adminAction: "approve",
      }),
    ).toEqual({
      nextStatus: "approved",
      counterDelta: 1,
      mintCredit: true,
      reverseCredit: false,
    });
    for (const current of ["approved", "confirmed"] as const) {
      expect(
        conversionTransition({
          current,
          bookingStatus: "completed",
          adminAction: "approve",
        }),
      ).toBeNull();
    }
  });

  it("admin rejection reverses a credit already minted", () => {
    expect(
      conversionTransition({
        current: "approved",
        bookingStatus: "completed",
        adminAction: "reject",
      }),
    ).toEqual({
      nextStatus: "rejected",
      counterDelta: -1,
      mintCredit: false,
      reverseCredit: true,
    });
    expect(
      conversionTransition({
        current: "awaitingApproval",
        bookingStatus: "completed",
        adminAction: "reject",
      }),
    ).toEqual({ nextStatus: "rejected", ...noEffects });
    expect(
      conversionTransition({
        current: "rejected",
        bookingStatus: "completed",
        adminAction: "reject",
      }),
    ).toBeNull();
  });

  it("a cancelled booking wins over any admin action", () => {
    expect(
      conversionTransition({
        current: "pending",
        bookingStatus: "cancelled",
        adminAction: "approve",
      }),
    ).toEqual({ nextStatus: "voided", ...noEffects });
  });

  it("a booking coming back to life revives the conversion by its status", () => {
    expect(
      conversionTransition({ current: "voided", bookingStatus: "confirmed" }),
    ).toEqual({ nextStatus: "pending", ...noEffects });
    expect(
      conversionTransition({ current: "voided", bookingStatus: "completed" }),
    ).toEqual({ nextStatus: "awaitingApproval", ...noEffects });
  });

  it("un-completing a booking demotes an unapproved conversion but keeps an approval", () => {
    expect(
      conversionTransition({
        current: "awaitingApproval",
        bookingStatus: "confirmed",
      }),
    ).toEqual({ nextStatus: "pending", ...noEffects });
    for (const current of ["approved", "confirmed", "rejected"] as const) {
      expect(
        conversionTransition({ current, bookingStatus: "confirmed" }),
      ).toBeNull();
    }
  });
});

describe("BLOCKING_CONVERSION_STATUSES", () => {
  it("is every status except voided, so only voiding frees the customer slot", () => {
    expect([...BLOCKING_CONVERSION_STATUSES].sort()).toEqual([
      "approved",
      "awaitingApproval",
      "confirmed",
      "pending",
      "rejected",
    ]);
    expect(BLOCKING_CONVERSION_STATUSES).not.toContain("voided");
  });
});

describe("referredEligibility", () => {
  const owner = { id: "affiliate_user", email: "owner@example.com" };
  const base = {
    ownerUser: owner,
    bookerUserId: undefined,
    customerEmail: "customer@example.com",
    hasLiveConversion: false,
  };

  it("grants the referred discount on the happy path", () => {
    expect(referredEligibility(base)).toEqual({ eligible: true });
  });

  it("FAILS CLOSED when the affiliate's owner user is missing", () => {
    expect(referredEligibility({ ...base, ownerUser: null })).toEqual({
      eligible: false,
      reason: "missingOwner",
    });
    // ...even for a booking that would otherwise be eligible in every way
    expect(
      referredEligibility({
        ...base,
        ownerUser: null,
        customerEmail: owner.email,
      }),
    ).toEqual({ eligible: false, reason: "missingOwner" });
  });

  it("blocks self-referral by user id", () => {
    expect(
      referredEligibility({ ...base, bookerUserId: "affiliate_user" }),
    ).toEqual({ eligible: false, reason: "selfReferral" });
  });

  it("blocks self-referral by email, case- and whitespace-insensitively", () => {
    expect(
      referredEligibility({ ...base, customerEmail: " Owner@Example.COM " }),
    ).toEqual({ eligible: false, reason: "selfReferral" });
  });

  it("blocks a repeat while a live (non-voided) conversion exists", () => {
    expect(referredEligibility({ ...base, hasLiveConversion: true })).toEqual({
      eligible: false,
      reason: "duplicate",
    });
  });

  it("allows again once every prior conversion is voided", () => {
    // The DB layer maps "only voided priors" to hasLiveConversion: false
    expect(referredEligibility({ ...base, hasLiveConversion: false })).toEqual({
      eligible: true,
    });
  });

  it("blocks a repeat customer when the welcome offer is first-rental only", () => {
    expect(
      referredEligibility({
        ...base,
        hasPriorRental: true,
        firstRentalOnly: true,
      }),
    ).toEqual({ eligible: false, reason: "notFirstRental" });
  });

  it("ignores prior rentals when the first-rental rule is off", () => {
    expect(
      referredEligibility({
        ...base,
        hasPriorRental: true,
        firstRentalOnly: false,
      }),
    ).toEqual({ eligible: true });
  });

  it("a guest (no user id) never matches the owner's id", () => {
    expect(referredEligibility({ ...base, bookerUserId: undefined })).toEqual({
      eligible: true,
    });
  });
});

describe("validateAffiliateSettings", () => {
  it("accepts the seeded defaults", () => {
    expect(validateAffiliateSettings(DEFAULT_AFFILIATE_SETTINGS)).toBeNull();
  });

  it("rejects broken configs", () => {
    const base = DEFAULT_AFFILIATE_SETTINGS;
    expect(
      validateAffiliateSettings({ ...base, attributionWindowDays: 0 }),
    ).toBeTruthy();
    expect(
      validateAffiliateSettings({ ...base, referredDiscountValue: 0 }),
    ).toBeTruthy();
    expect(
      validateAffiliateSettings({
        ...base,
        referredDiscountType: "percentage",
        referredDiscountValue: 150,
      }),
    ).toBeTruthy();
    expect(
      validateAffiliateSettings({
        ...base,
        tiers: [
          { minConversions: 6, rewardPercent: 5 },
          { minConversions: 6, rewardPercent: 8 },
        ],
      }),
    ).toBeTruthy();
    expect(
      validateAffiliateSettings({
        ...base,
        tiers: [{ minConversions: 6, rewardPercent: 0 }],
      }),
    ).toBeTruthy();
    expect(
      validateAffiliateSettings({
        ...base,
        tiers: [{ minConversions: 6, rewardPercent: 5, name: "  " }],
      }),
    ).toBeTruthy();
    expect(
      validateAffiliateSettings({ ...base, maxRedemptionPercent: 0 }),
    ).toBeTruthy();
    expect(
      validateAffiliateSettings({ ...base, maxRedemptionPercent: 101 }),
    ).toBeTruthy();
    expect(
      validateAffiliateSettings({ ...base, creditValidityMonths: 0 }),
    ).toBeTruthy();
    expect(
      validateAffiliateSettings({ ...base, creditValidityMonths: 1.5 }),
    ).toBeTruthy();
  });

  it("ships the guide's defaults, with the program off", () => {
    expect(DEFAULT_AFFILIATE_SETTINGS).toMatchObject({
      enabled: false,
      referredDiscountType: "percentage",
      referredDiscountValue: 5,
      maxRedemptionPercent: 50,
      creditValidityMonths: 12,
      autoApproveOnCompletion: false,
      referredFirstRentalOnly: true,
      tiers: [
        { minConversions: 1, rewardPercent: 5, name: "Pionier" },
        { minConversions: 6, rewardPercent: 10, name: "Ambasador" },
      ],
    });
  });
});

describe("withSettingsDefaults", () => {
  it("fills the wallet fields a pre-wallet settings doc lacks", () => {
    expect(
      withSettingsDefaults({
        enabled: true,
        attributionWindowDays: 45,
        referredDiscountType: "fixed",
        referredDiscountValue: 10,
        tiers: [{ minConversions: 6, rewardPercent: 5 }],
      }),
    ).toEqual({
      enabled: true,
      attributionWindowDays: 45,
      referredDiscountType: "fixed",
      referredDiscountValue: 10,
      tiers: [{ minConversions: 6, rewardPercent: 5 }],
      maxRedemptionPercent: 50,
      creditValidityMonths: 12,
      autoApproveOnCompletion: false,
      referredFirstRentalOnly: true,
    });
  });

  it("keeps a missing doc on the seeded defaults", () => {
    expect(withSettingsDefaults(null)).toEqual(DEFAULT_AFFILIATE_SETTINGS);
  });

  it("keeps `enabled: false` from a stored doc rather than falling back", () => {
    expect(withSettingsDefaults({ enabled: false }).enabled).toBe(false);
  });
});

describe("slug helpers", () => {
  it("normalizes to lowercase", () => {
    expect(normalizeAffiliateSlug("  John-Doe ")).toBe("john-doe");
  });

  it("validates shape and length", () => {
    expect(isValidAffiliateSlug("john-doe")).toBe(true);
    expect(isValidAffiliateSlug("abc")).toBe(true);
    expect(isValidAffiliateSlug("ab")).toBe(false);
    expect(isValidAffiliateSlug("John")).toBe(false);
    expect(isValidAffiliateSlug("-john")).toBe(false);
    expect(isValidAffiliateSlug("john-")).toBe(false);
    expect(isValidAffiliateSlug("a".repeat(33))).toBe(false);
    expect(isValidAffiliateSlug("a".repeat(32))).toBe(true);
  });
});
