/**
 * Affiliate program math — the pure half of the referral feature (RNGO-50).
 * Tier resolution, referred-customer discounts and the conversion lifecycle
 * transitions are all here; everything that needs the database (attribution
 * lookups, conversion rows, the approvedConversions counter, the wallet
 * ledger) lives in convex/affiliates.ts. Wallet money math is in ./wallet.ts.
 *
 * The referrer earns wallet credit worth a tier percentage of what the
 * referred customer paid, minted only once that booking is completed and
 * approved; the tier percent is resolved from approvedConversions against the
 * admin-editable tier table at approval time.
 */

import { computeCouponDiscount, normalizeCustomerEmail } from "./discount";

export interface AffiliateTier {
  /** Approved conversions required to unlock this tier. */
  minConversions: number;
  /** Percentage of the referred booking minted as wallet credit. */
  rewardPercent: number;
  /** Customer-facing label ("Pionier"); optional while tiers are widened. */
  name?: string;
}

export type ReferredDiscountConfig = {
  type: "percentage" | "fixed";
  value: number;
};

export interface AffiliateSettingsData {
  enabled: boolean;
  attributionWindowDays: number;
  referredDiscountType: "percentage" | "fixed";
  referredDiscountValue: number;
  tiers: AffiliateTier[];
  /** Share of a booking's post-discount total payable with wallet credit. */
  maxRedemptionPercent: number;
  /** Months a minted credit stays spendable. */
  creditValidityMonths: number;
  /** Approve a conversion automatically when its booking completes. */
  autoApproveOnCompletion: boolean;
  /** Restrict the referred discount to customers with no prior rental. */
  referredFirstRentalOnly: boolean;
}

/**
 * Seed defaults, from the client's referral guide. Used until an admin saves
 * the settings doc, and to fill the fields an older settings doc predates.
 * Real values are set in the admin UI, never in code. Deliberately DISABLED
 * by default: the program must not grant real discounts on deploy until an
 * admin has reviewed the values and flipped the kill-switch on.
 */
export const DEFAULT_AFFILIATE_SETTINGS: AffiliateSettingsData = {
  enabled: false,
  attributionWindowDays: 30,
  referredDiscountType: "percentage",
  referredDiscountValue: 5,
  tiers: [
    { minConversions: 1, rewardPercent: 5, name: "Pionier" },
    { minConversions: 6, rewardPercent: 10, name: "Ambasador" },
  ],
  maxRedemptionPercent: 50,
  creditValidityMonths: 12,
  autoApproveOnCompletion: false,
  referredFirstRentalOnly: true,
};

/**
 * A settings doc as an `AffiliateSettingsData`, filling in the fields a doc
 * saved before the wallet rollout lacks. Picks field by field so document
 * system fields never leak into a value that is later written back.
 */
export function withSettingsDefaults(
  stored: Partial<AffiliateSettingsData> | null | undefined,
): AffiliateSettingsData {
  const d = DEFAULT_AFFILIATE_SETTINGS;
  return {
    enabled: stored?.enabled ?? d.enabled,
    attributionWindowDays:
      stored?.attributionWindowDays ?? d.attributionWindowDays,
    referredDiscountType:
      stored?.referredDiscountType ?? d.referredDiscountType,
    referredDiscountValue:
      stored?.referredDiscountValue ?? d.referredDiscountValue,
    tiers: stored?.tiers ?? d.tiers,
    maxRedemptionPercent:
      stored?.maxRedemptionPercent ?? d.maxRedemptionPercent,
    creditValidityMonths:
      stored?.creditValidityMonths ?? d.creditValidityMonths,
    autoApproveOnCompletion:
      stored?.autoApproveOnCompletion ?? d.autoApproveOnCompletion,
    referredFirstRentalOnly:
      stored?.referredFirstRentalOnly ?? d.referredFirstRentalOnly,
  };
}

/** Slugs are stored normalized so /r/<slug> lookups are case-insensitive. */
export function normalizeAffiliateSlug(slug: string): string {
  return slug.trim().toLowerCase();
}

export function isValidAffiliateSlug(slug: string): boolean {
  return /^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$/.test(slug);
}

/**
 * Reward percent for an approved-conversion count: the highest tier whose
 * threshold is met wins; below every threshold the reward is 0. A per-affiliate
 * override replaces the tier table entirely.
 */
export function resolveTierRewardPercent(
  tiers: AffiliateTier[],
  approvedConversions: number,
  rewardPercentOverride?: number,
): number {
  if (rewardPercentOverride !== undefined) {
    return rewardPercentOverride;
  }
  let percent = 0;
  let bestThreshold = -1;
  for (const tier of tiers) {
    if (
      approvedConversions >= tier.minConversions &&
      tier.minConversions > bestThreshold
    ) {
      percent = tier.rewardPercent;
      bestThreshold = tier.minConversions;
    }
  }
  return percent;
}

/** The next tier the affiliate has not reached yet (for dashboard progress). */
export function nextTier(
  tiers: AffiliateTier[],
  approvedConversions: number,
): AffiliateTier | null {
  let next: AffiliateTier | null = null;
  for (const tier of tiers) {
    if (
      tier.minConversions > approvedConversions &&
      (next === null || tier.minConversions < next.minConversions)
    ) {
      next = tier;
    }
  }
  return next;
}

/**
 * EUR discount for the referred customer. Same clamping semantics as coupons:
 * never negative, never exceeds the subtotal, rounded to cents.
 */
export function computeReferredDiscount(
  subtotal: number,
  config: ReferredDiscountConfig,
): number {
  return computeCouponDiscount(subtotal, config.type, config.value);
}

/**
 * Conversion lifecycle statuses. `confirmed` is the legacy v1 status, kept
 * readable while the widen migration runs; it is never written again and is
 * treated as `approved` everywhere.
 */
export type ConversionStatus =
  | "pending"
  | "awaitingApproval"
  | "approved"
  | "rejected"
  | "voided"
  | "confirmed";

/**
 * Whether a conversion still occupies the one-referred-discount-per-customer
 * slot for its (affiliate, email). Only voiding frees it — a rejected
 * conversion still had its discount granted to the customer. Exhaustive by
 * construction: adding a status literal without classifying it here is a
 * compile error.
 */
const OCCUPIES_CUSTOMER_SLOT = {
  pending: true,
  awaitingApproval: true,
  approved: true,
  rejected: true,
  confirmed: true,
  voided: false,
} as const satisfies Record<ConversionStatus, boolean>;

/** The statuses the per-customer dedupe must look for. */
export const BLOCKING_CONVERSION_STATUSES = (
  Object.keys(OCCUPIES_CUSTOMER_SLOT) as ConversionStatus[]
).filter((status) => OCCUPIES_CUSTOMER_SLOT[status]);

export type ReferredIneligibilityReason =
  | "missingOwner"
  | "selfReferral"
  | "duplicate"
  | "notFirstRental";

/**
 * Eligibility decision for the referred discount + conversion, given the
 * facts the DB layer looked up. FAILS CLOSED when the affiliate's owner user
 * row is missing: an orphaned affiliate must not grant discounts or
 * accumulate conversions, and without the owner's email the self-referral
 * check cannot run. `hasLiveConversion` is the one-per-customer rule: any
 * non-voided prior conversion for this (affiliate, email) blocks a repeat;
 * voided ones (cancelled bookings) free the slot. `hasPriorRental` is the
 * wider "welcome offer" rule: with `firstRentalOnly` on, a customer who has
 * ever booked gets no referred discount regardless of which affiliate sent
 * them.
 */
export function referredEligibility(params: {
  ownerUser: { id: string; email: string } | null;
  bookerUserId?: string;
  customerEmail: string;
  hasLiveConversion: boolean;
  hasPriorRental?: boolean;
  firstRentalOnly?: boolean;
}):
  | { eligible: true }
  | { eligible: false; reason: ReferredIneligibilityReason } {
  if (!params.ownerUser) {
    return { eligible: false, reason: "missingOwner" };
  }
  const isSelfReferral =
    params.bookerUserId === params.ownerUser.id ||
    normalizeCustomerEmail(params.ownerUser.email) ===
      normalizeCustomerEmail(params.customerEmail);
  if (isSelfReferral) {
    return { eligible: false, reason: "selfReferral" };
  }
  if (params.hasLiveConversion) {
    return { eligible: false, reason: "duplicate" };
  }
  if (params.firstRentalOnly && params.hasPriorRental) {
    return { eligible: false, reason: "notFirstRental" };
  }
  return { eligible: true };
}

/** Booking statuses (convex/validators.ts) plus the hard-delete case. */
export type ConversionBookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "deleted";

export type ConversionAdminAction = "approve" | "reject";

export interface ConversionTransitionInput {
  current: ConversionStatus;
  bookingStatus: ConversionBookingStatus;
  /** Set only when an admin explicitly acted on this conversion. */
  adminAction?: ConversionAdminAction;
  autoApproveOnCompletion?: boolean;
}

/**
 * What the database layer must do alongside the status flip. Keeping the
 * side-effects declarative is what lets the whole lifecycle be unit-tested
 * without a database.
 */
export interface ConversionTransition {
  nextStatus: Exclude<ConversionStatus, "confirmed">;
  /** Delta for the affiliate's approvedConversions counter. */
  counterDelta: number;
  /** Mint a referralCredit wallet transaction for the referrer. */
  mintCredit: boolean;
  /** Write the compensating negative transaction for a minted credit. */
  reverseCredit: boolean;
}

/** The legacy v1 status means the same thing as `approved`. */
function normalizeStatus(
  status: ConversionStatus,
): Exclude<ConversionStatus, "confirmed"> {
  return status === "confirmed" ? "approved" : status;
}

const NO_EFFECTS = { counterDelta: 0, mintCredit: false, reverseCredit: false };

/**
 * Conversion lifecycle as a single table over {current status, booking
 * status, admin action}. Returns null when nothing should change, which is
 * what makes every caller idempotent: a second cancel never double-decrements
 * and a second approve never mints twice.
 *
 * A booking that stops being completed demotes an unapproved conversion back
 * to `pending` but never claws back an approval — the credit was earned.
 */
export function conversionTransition(
  input: ConversionTransitionInput,
): ConversionTransition | null {
  const current = normalizeStatus(input.current);
  const wasApproved = current === "approved";
  const bookingIsLive =
    input.bookingStatus !== "cancelled" && input.bookingStatus !== "deleted";

  if (!bookingIsLive) {
    if (current === "voided") return null;
    return {
      nextStatus: "voided",
      counterDelta: wasApproved ? -1 : 0,
      mintCredit: false,
      reverseCredit: wasApproved,
    };
  }

  if (input.adminAction === "approve") {
    if (wasApproved) return null;
    return {
      nextStatus: "approved",
      counterDelta: +1,
      mintCredit: true,
      reverseCredit: false,
    };
  }

  if (input.adminAction === "reject") {
    if (current === "rejected") return null;
    return {
      nextStatus: "rejected",
      counterDelta: wasApproved ? -1 : 0,
      mintCredit: false,
      reverseCredit: wasApproved,
    };
  }

  if (input.bookingStatus === "completed") {
    if (current !== "pending" && current !== "voided") return null;
    return input.autoApproveOnCompletion
      ? {
          nextStatus: "approved",
          counterDelta: +1,
          mintCredit: true,
          reverseCredit: false,
        }
      : { nextStatus: "awaitingApproval", ...NO_EFFECTS };
  }

  if (current === "voided" || current === "awaitingApproval") {
    return { nextStatus: "pending", ...NO_EFFECTS };
  }
  return null;
}

/** Validation shared by the admin settings mutation and the tier editor. */
export function validateAffiliateSettings(
  settings: AffiliateSettingsData,
): string | null {
  if (
    !Number.isInteger(settings.attributionWindowDays) ||
    settings.attributionWindowDays < 1
  ) {
    return "Attribution window must be a positive whole number of days.";
  }
  if (settings.referredDiscountValue <= 0) {
    return "Referred discount value must be greater than 0.";
  }
  if (
    settings.referredDiscountType === "percentage" &&
    settings.referredDiscountValue > 100
  ) {
    return "Percentage discount cannot exceed 100.";
  }
  const seen = new Set<number>();
  for (const tier of settings.tiers) {
    if (!Number.isInteger(tier.minConversions) || tier.minConversions < 1) {
      return "Tier thresholds must be positive whole numbers.";
    }
    if (tier.rewardPercent <= 0 || tier.rewardPercent > 100) {
      return "Tier reward percent must be between 0 and 100.";
    }
    if (seen.has(tier.minConversions)) {
      return "Two tiers cannot share the same conversion threshold.";
    }
    if (tier.name !== undefined && tier.name.trim().length === 0) {
      return "Tier names cannot be blank.";
    }
    seen.add(tier.minConversions);
  }
  if (
    settings.maxRedemptionPercent <= 0 ||
    settings.maxRedemptionPercent > 100
  ) {
    return "Max redemption percent must be between 0 and 100.";
  }
  if (
    !Number.isInteger(settings.creditValidityMonths) ||
    settings.creditValidityMonths < 1
  ) {
    return "Credit validity must be a positive whole number of months.";
  }
  return null;
}
