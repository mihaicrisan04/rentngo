import { describe, expect, it } from "vitest";
import {
  affiliateSlugBase,
  affiliateSlugSuffix,
  computeReferredDiscount,
  conversionTransition,
  generateAffiliateSlug,
  withSettingsDefaults,
  BLOCKING_CONVERSION_STATUSES,
  isReservedAffiliateSlug,
  isValidAffiliateSlug,
  nextTier,
  normalizeAffiliateSlug,
  referredEligibility,
  resolveConversionCredit,
  resolveReferralSource,
  resolveTierRewardPercent,
  validateAffiliateSettings,
  DEFAULT_AFFILIATE_SETTINGS,
  PRIOR_RENTAL_BOOKING_STATUSES,
  type AffiliateTier,
  type ConversionStatus,
  type ConversionBookingStatus,
} from "./affiliate";
import { pickDiscount, type AppliedDiscount } from "./discount";
import { conversionCreditOutstanding } from "./wallet";

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

  it("picks nothing when there is no candidate", () => {
    expect(pickDiscount([null, undefined])).toBeNull();
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
          for (const autoApproveOnCompletion of [false, true]) {
            const result = conversionTransition({
              current,
              bookingStatus,
              adminAction,
              autoApproveOnCompletion,
            });
            if (!result) continue;
            expect(result.nextStatus).not.toBe("confirmed");
            expect(result.mintCredit && result.reverseCredit).toBe(false);
            expect(result.nextStatus).not.toBe(
              current === "confirmed" ? "approved" : current,
            );
            // Money and counter move together: credit is only ever minted into
            // `approved` with a +1, and only an approval can be reversed.
            if (result.mintCredit) {
              expect(result.nextStatus).toBe("approved");
              expect(result.counterDelta).toBe(1);
            }
            if (result.counterDelta === 1) {
              expect(result.mintCredit).toBe(true);
            }
            if (result.reverseCredit) {
              expect(current === "approved" || current === "confirmed").toBe(
                true,
              );
              expect(result.counterDelta).toBe(-1);
            }
            if (result.counterDelta === -1) {
              expect(result.reverseCredit).toBe(true);
            }
          }
        }
      }
    }
  });

  it("auto-approval only ever fires on completion, and only for a conversion still awaiting one", () => {
    for (const current of ALL_STATUSES) {
      for (const bookingStatus of ALL_BOOKING_STATUSES) {
        const auto = conversionTransition({
          current,
          bookingStatus,
          autoApproveOnCompletion: true,
        });
        const manual = conversionTransition({
          current,
          bookingStatus,
          autoApproveOnCompletion: false,
        });
        const minted = auto?.mintCredit === true;
        expect(minted).toBe(
          bookingStatus === "completed" &&
            (current === "pending" || current === "voided"),
        );
        // The setting changes nothing anywhere else in the table
        if (!minted) expect(auto).toEqual(manual);
      }
    }
  });

  it("auto-approval revives a voided conversion straight into a credit", () => {
    expect(
      conversionTransition({
        current: "voided",
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

  it("never mints for a rental that has not been completed", () => {
    for (const current of ALL_STATUSES) {
      for (const bookingStatus of ALL_BOOKING_STATUSES) {
        if (bookingStatus === "completed") continue;
        expect(
          conversionTransition({
            current,
            bookingStatus,
            adminAction: "approve",
          })?.mintCredit ?? false,
        ).toBe(false);
      }
    }
    // An approval on a booking that is still running is simply refused
    expect(
      conversionTransition({
        current: "awaitingApproval",
        bookingStatus: "confirmed",
        adminAction: "approve",
      }),
    ).toBeNull();
  });

  it("lets an admin approve a conversion they rejected earlier", () => {
    expect(
      conversionTransition({
        current: "rejected",
        bookingStatus: "completed",
        adminAction: "approve",
      }),
    ).toEqual({
      nextStatus: "approved",
      counterDelta: 1,
      mintCredit: true,
      reverseCredit: false,
    });
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

describe("resolveConversionCredit", () => {
  const guideTiers: AffiliateTier[] = [
    { minConversions: 1, rewardPercent: 5, name: "Pionier" },
    { minConversions: 6, rewardPercent: 10, name: "Ambasador" },
  ];
  const approve = (approvedConversionsBefore: number, over?: number) =>
    resolveConversionCredit({
      tiers: guideTiers,
      approvedConversionsBefore,
      rewardPercentOverride: over,
      bookingTotal: 400,
      approvedAt: Date.UTC(2026, 0, 15),
      creditValidityMonths: 12,
    });

  it("counts the conversion being approved towards its own tier", () => {
    // First ever approval must reach the 1-conversion tier, not fall below it
    expect(approve(0)).toEqual({
      rewardPercent: 5,
      amount: 20,
      expiresAt: Date.UTC(2027, 0, 15),
    });
  });

  it("promotes at the sixth approval", () => {
    expect(approve(4).rewardPercent).toBe(5);
    expect(approve(5)).toMatchObject({ rewardPercent: 10, amount: 40 });
    expect(approve(50).rewardPercent).toBe(10);
  });

  it("lets a per-affiliate override replace the tier table", () => {
    expect(approve(0, 25)).toMatchObject({ rewardPercent: 25, amount: 100 });
    expect(approve(50, 0)).toMatchObject({ rewardPercent: 0, amount: 0 });
  });

  it("mints nothing off a zero-total booking", () => {
    expect(
      resolveConversionCredit({
        tiers: guideTiers,
        approvedConversionsBefore: 0,
        bookingTotal: 0,
        approvedAt: Date.UTC(2026, 0, 15),
        creditValidityMonths: 12,
      }).amount,
    ).toBe(0);
  });
});

/**
 * The composition convex/affiliates.ts applies: the transition decides, the
 * ledger guard and the outstanding sum decide what is actually written. Kept
 * here because the repo has no convex-test harness; the dev-deployment recipe
 * in the RNGO-52 report covers the mutations end to end.
 */
describe("approval side-effects over the ledger", () => {
  interface Row {
    kind: "referralCredit" | "creditReversal";
    amount: number;
  }

  function apply(
    state: { status: ConversionStatus; counter: number; ledger: Row[] },
    input: Parameters<typeof conversionTransition>[0],
  ) {
    const transition = conversionTransition(input);
    if (!transition) return state;
    const ledger = [...state.ledger];
    let counter = state.counter;
    if (transition.mintCredit && conversionCreditOutstanding(ledger) <= 0) {
      const credit = resolveConversionCredit({
        tiers: [{ minConversions: 1, rewardPercent: 5 }],
        approvedConversionsBefore: counter,
        bookingTotal: 400,
        approvedAt: Date.UTC(2026, 0, 15),
        creditValidityMonths: 12,
      });
      ledger.push({ kind: "referralCredit", amount: credit.amount });
      counter += transition.counterDelta;
    } else if (!transition.mintCredit) {
      counter += transition.counterDelta;
    }
    if (transition.reverseCredit) {
      const outstanding = conversionCreditOutstanding(ledger);
      if (outstanding > 0) {
        ledger.push({ kind: "creditReversal", amount: -outstanding });
      }
    }
    return { status: transition.nextStatus, counter, ledger };
  }

  const approved = apply(
    { status: "awaitingApproval", counter: 0, ledger: [] },
    {
      current: "awaitingApproval",
      bookingStatus: "completed",
      adminAction: "approve",
    },
  );

  it("one approval mints one credit and moves the counter once", () => {
    expect(approved).toEqual({
      status: "approved",
      counter: 1,
      ledger: [{ kind: "referralCredit", amount: 20 }],
    });
  });

  it("approving again changes nothing", () => {
    expect(
      apply(approved, {
        current: approved.status,
        bookingStatus: "completed",
        adminAction: "approve",
      }),
    ).toEqual(approved);
  });

  it("voiding after approval reverses exactly once", () => {
    const voided = apply(approved, {
      current: approved.status,
      bookingStatus: "cancelled",
    });
    expect(voided).toEqual({
      status: "voided",
      counter: 0,
      ledger: [
        { kind: "referralCredit", amount: 20 },
        { kind: "creditReversal", amount: -20 },
      ],
    });
    // A repeated cancel yields no transition at all, so nothing is appended
    expect(
      apply(voided, { current: voided.status, bookingStatus: "cancelled" }),
    ).toEqual(voided);
  });

  it("a reversed conversion mints again when it is approved again", () => {
    const voided = apply(approved, {
      current: approved.status,
      bookingStatus: "cancelled",
    });
    const revived = apply(voided, {
      current: voided.status,
      bookingStatus: "completed",
      autoApproveOnCompletion: true,
    });
    expect(revived).toEqual({
      status: "approved",
      counter: 1,
      ledger: [
        { kind: "referralCredit", amount: 20 },
        { kind: "creditReversal", amount: -20 },
        { kind: "referralCredit", amount: 20 },
      ],
    });
    // Still only ever one credit outstanding, and approving again is a no-op
    expect(conversionCreditOutstanding(revived.ledger)).toBe(20);
    expect(
      apply(revived, {
        current: revived.status,
        bookingStatus: "completed",
        adminAction: "approve",
      }),
    ).toEqual(revived);
  });

  it("re-approving after a rejection mints the credit back", () => {
    const rejected = apply(approved, {
      current: approved.status,
      bookingStatus: "completed",
      adminAction: "reject",
    });
    expect(rejected.counter).toBe(0);
    expect(conversionCreditOutstanding(rejected.ledger)).toBe(0);

    const reapproved = apply(rejected, {
      current: rejected.status,
      bookingStatus: "completed",
      adminAction: "approve",
    });
    expect(reapproved.status).toBe("approved");
    expect(reapproved.counter).toBe(1);
    expect(conversionCreditOutstanding(reapproved.ledger)).toBe(20);
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

describe("PRIOR_RENTAL_BOOKING_STATUSES", () => {
  it("counts every booking status except cancelled", () => {
    expect([...PRIOR_RENTAL_BOOKING_STATUSES].sort()).toEqual([
      "completed",
      "confirmed",
      "pending",
    ]);
  });
});

describe("first-rental rule", () => {
  const base = {
    ownerUser: { id: "affiliate_user", email: "owner@example.com" },
    customerEmail: "customer@example.com",
    hasLiveConversion: false,
    firstRentalOnly: true,
  };

  // The DB layer probes by account AND by normalized booking email; either
  // hit reaches this decision as the same hasPriorRental: true.
  it("blocks when a prior rental was found by user id", () => {
    expect(
      referredEligibility({
        ...base,
        bookerUserId: "returning_customer",
        hasPriorRental: true,
      }),
    ).toEqual({ eligible: false, reason: "notFirstRental" });
  });

  it("blocks a guest whose prior rental was found by email", () => {
    expect(
      referredEligibility({
        ...base,
        bookerUserId: undefined,
        hasPriorRental: true,
      }),
    ).toEqual({ eligible: false, reason: "notFirstRental" });
  });

  it("lets a genuinely first-time customer through", () => {
    expect(referredEligibility({ ...base, hasPriorRental: false })).toEqual({
      eligible: true,
    });
  });
});

describe("reserved slugs", () => {
  it("rejects top-level route names, locales and the /r prefix", () => {
    for (const slug of ["admin", "api", "r", "ro", "en", "cars", "profile"]) {
      expect(isReservedAffiliateSlug(slug)).toBe(true);
    }
  });

  it("matches case-insensitively, like the slug lookup does", () => {
    expect(isReservedAffiliateSlug("ADMIN")).toBe(true);
    expect(isReservedAffiliateSlug("  Cars ")).toBe(true);
  });

  it("leaves ordinary codes alone", () => {
    expect(isReservedAffiliateSlug("mihai-a4")).toBe(false);
    expect(isReservedAffiliateSlug("admins")).toBe(false);
  });
});

describe("self-service slug generation", () => {
  const stubRandom = (values: number[]) => {
    let i = 0;
    return () => values[i++ % values.length];
  };

  it("uses the de-accented first name plus a random suffix", () => {
    expect(generateAffiliateSlug("Ștefan Popescu", 0, stubRandom([0]))).toBe(
      "stefan-aa",
    );
  });

  it("falls back when the name yields no usable letters", () => {
    expect(affiliateSlugBase("Ω")).toBe("rngo");
    expect(affiliateSlugBase("")).toBe("rngo");
  });

  it("widens the suffix as collision retries climb, capped at 4", () => {
    const lengths = [0, 1, 2, 3, 4, 5, 6, 7].map(
      (attempt) =>
        generateAffiliateSlug("Mihai", attempt, stubRandom([0])).split("-")[1]
          .length,
    );
    expect(lengths).toEqual([2, 2, 3, 3, 4, 4, 4, 4]);
  });

  it("always produces a valid, non-reserved slug", () => {
    for (const name of ["Mihai", "Ana-Maria Ionescu", "Ω", "X", "a"]) {
      for (let attempt = 0; attempt < 8; attempt++) {
        const slug = generateAffiliateSlug(name, attempt);
        expect(isValidAffiliateSlug(slug)).toBe(true);
        expect(isReservedAffiliateSlug(slug)).toBe(false);
      }
    }
  });

  it("draws suffixes only from the look-alike-free alphabet", () => {
    expect(affiliateSlugSuffix(200)).toMatch(/^[a-z0-9]+$/);
    expect(affiliateSlugSuffix(200)).not.toMatch(/[lo01]/);
  });
});

describe("resolveReferralSource", () => {
  const cookie = { slug: "rngo51-legacy", visitorKey: "visitor-key-123" };

  it("accepts a typed code in any case", () => {
    expect(resolveReferralSource({ typedCode: "  RnGo51-Legacy " })).toEqual({
      kind: "typedCode",
      slug: "rngo51-legacy",
    });
  });

  it("lets a typed code beat the cookie", () => {
    expect(
      resolveReferralSource({
        typedCode: "OTHER-CODE",
        cookieReferral: cookie,
      }),
    ).toEqual({ kind: "typedCode", slug: "other-code" });
  });

  it("falls back to the cookie when no code was typed", () => {
    expect(resolveReferralSource({ cookieReferral: cookie })).toEqual({
      kind: "link",
      slug: "rngo51-legacy",
      visitorKey: "visitor-key-123",
    });
  });

  it("falls back to the cookie when the typed value is not a slug", () => {
    expect(
      resolveReferralSource({ typedCode: "!!", cookieReferral: cookie }),
    ).toEqual({
      kind: "link",
      slug: "rngo51-legacy",
      visitorKey: "visitor-key-123",
    });
  });

  it("resolves nothing without a typed code or a usable cookie", () => {
    expect(resolveReferralSource({})).toBeNull();
    expect(resolveReferralSource({ typedCode: "" })).toBeNull();
    expect(
      resolveReferralSource({
        cookieReferral: { slug: "ok-slug", visitorKey: "" },
      }),
    ).toBeNull();
  });

  it("hands the typed and link paths the same affiliate slug", () => {
    // Both paths resolve to one slug, so the DB layer runs the same
    // eligibility check and writes the same conversion row either way.
    expect(resolveReferralSource({ typedCode: "RNGO51-LEGACY" })?.slug).toBe(
      resolveReferralSource({ cookieReferral: cookie })?.slug,
    );
  });

  it("blocks a self-referral typed by the affiliate themselves", () => {
    const source = resolveReferralSource({ typedCode: "RNGO51-LEGACY" });
    expect(source).toEqual({ kind: "typedCode", slug: "rngo51-legacy" });
    expect(
      referredEligibility({
        ownerUser: { id: "affiliate_user", email: "owner@example.com" },
        bookerUserId: "affiliate_user",
        customerEmail: "owner@example.com",
        hasLiveConversion: false,
      }),
    ).toEqual({ eligible: false, reason: "selfReferral" });
  });
});
