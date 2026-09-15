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
import { computeCreditForConversion, creditExpiry } from "./wallet";

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
 * Slugs an affiliate may never take: the non-localized top-level routes
 * (`app/*`), the locale prefixes, and the localized route names
 * (`app/[locale]/*`). Such a code reads as a site section once it appears in
 * `/r/<slug>` or in the "promo or referral code" field. Enforced on both the
 * admin and the self-service enrolment paths.
 */
export const RESERVED_AFFILIATE_SLUGS: readonly string[] = [
  "admin",
  "api",
  "r",
  "ro",
  "en",
  "about",
  "blog",
  "cars",
  "contact",
  "faq",
  "privacy",
  "profile",
  "reservation",
  "terms",
  "transfers",
];

export function isReservedAffiliateSlug(slug: string): boolean {
  return RESERVED_AFFILIATE_SLUGS.includes(normalizeAffiliateSlug(slug));
}

/** No look-alike characters: a referral code gets read out loud and retyped. */
const SLUG_SUFFIX_ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789";
const SLUG_SUFFIX_MIN_LENGTH = 2;
const SLUG_SUFFIX_MAX_LENGTH = 4;
const SLUG_BASE_MAX_LENGTH = 20;
/** Used when a name yields no usable ASCII letters (e.g. a name in Cyrillic). */
const SLUG_BASE_FALLBACK = "rngo";

/** First name, de-accented and stripped to the slug alphabet. */
export function affiliateSlugBase(name: string): string {
  const firstName = name.trim().split(/\s+/)[0] ?? "";
  const ascii = firstName
    .normalize("NFD")
    .replace(/[\u0300-\u036F]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, SLUG_BASE_MAX_LENGTH);
  return ascii.length >= 2 ? ascii : SLUG_BASE_FALLBACK;
}

export function affiliateSlugSuffix(
  length: number,
  random: () => number = Math.random,
): string {
  let suffix = "";
  for (let i = 0; i < length; i++) {
    const index = Math.min(
      SLUG_SUFFIX_ALPHABET.length - 1,
      Math.floor(random() * SLUG_SUFFIX_ALPHABET.length),
    );
    suffix += SLUG_SUFFIX_ALPHABET[index];
  }
  return suffix;
}

/**
 * Self-service code for `name`. `attempt` is the zero-based collision retry:
 * later attempts draw a longer suffix, so a common first name cannot livelock
 * against a saturated two-character space.
 */
export function generateAffiliateSlug(
  name: string,
  attempt: number = 0,
  random: () => number = Math.random,
): string {
  const suffixLength = Math.min(
    SLUG_SUFFIX_MIN_LENGTH + Math.floor(attempt / 2),
    SLUG_SUFFIX_MAX_LENGTH,
  );
  return `${affiliateSlugBase(name)}-${affiliateSlugSuffix(suffixLength, random)}`;
}

/**
 * Where a booking's referral attribution comes from. A code the customer
 * typed into the promo field always beats the cookie: it is an explicit
 * choice, while the cookie is a side-effect of a click that may be weeks old.
 * Both slugs are normalized here, so a mixed-case code works.
 */
export type ReferralSource =
  | { kind: "typedCode"; slug: string }
  | { kind: "link"; slug: string; visitorKey: string };

export function resolveReferralSource(params: {
  typedCode?: string | null;
  cookieReferral?: { slug: string; visitorKey: string } | null;
}): ReferralSource | null {
  const typed = normalizeAffiliateSlug(params.typedCode ?? "");
  if (isValidAffiliateSlug(typed)) {
    return { kind: "typedCode", slug: typed };
  }
  const cookie = params.cookieReferral;
  if (cookie) {
    const slug = normalizeAffiliateSlug(cookie.slug);
    if (isValidAffiliateSlug(slug) && cookie.visitorKey.length > 0) {
      return { kind: "link", slug, visitorKey: cookie.visitorKey };
    }
  }
  return null;
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

/**
 * Booking statuses that count as a prior rental for the first-rental rule:
 * everything except `cancelled` (convex/validators.ts). Hard-deleted bookings
 * are gone from the tables, so they cannot count either.
 */
export const PRIOR_RENTAL_BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "completed",
] as const;

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
  // Catches the signed-in affiliate and anyone booking with the owner's
  // email. A signed-out affiliate typing their own code with a throwaway
  // email is NOT caught, and deliberately so: requiring sign-in would stop
  // genuine guests from being referred. Accepted because approval is manual
  // by default and the admin conversion history shows referrer and referred
  // email side by side.
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

/**
 * Why a typed referral code was refused, as the `common.coupon.errors.*`
 * translation keys the checkout renders. Shared by the advisory preview
 * (`validateCoupon`) and the ConvexError the booking mutations throw, so both
 * speak the same language. `notFound` deliberately absorbs every reason that
 * would otherwise confirm a slug exists.
 */
export const REFERRAL_CODE_REASONS = [
  "notFound",
  "emailRequired",
  "referralSelfReferral",
  "referralDuplicate",
  "referralNotFirstRental",
] as const;

export type ReferralCodeReason = (typeof REFERRAL_CODE_REASONS)[number];

export function isReferralCodeReason(
  value: unknown,
): value is ReferralCodeReason {
  return (REFERRAL_CODE_REASONS as readonly unknown[]).includes(value);
}

const REFERRAL_CODE_REASON_BY_ELIGIBILITY = {
  missingOwner: "notFound",
  selfReferral: "referralSelfReferral",
  duplicate: "referralDuplicate",
  notFirstRental: "referralNotFirstRental",
} as const satisfies Record<ReferredIneligibilityReason, ReferralCodeReason>;

export function referralCodeReason(
  reason: ReferredIneligibilityReason,
): ReferralCodeReason {
  return REFERRAL_CODE_REASON_BY_ELIGIBILITY[reason];
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
    // Credit is earned by a finished rental: an admin cannot approve a booking
    // that has not been completed yet, however much they want to.
    if (wasApproved || input.bookingStatus !== "completed") return null;
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

export interface ConversionCreditInput {
  tiers: AffiliateTier[];
  /** The affiliate's counter BEFORE this approval is counted. */
  approvedConversionsBefore: number;
  rewardPercentOverride?: number;
  /** The referred booking's persisted total. */
  bookingTotal: number;
  approvedAt: number;
  creditValidityMonths: number;
}

export interface ConversionCredit {
  rewardPercent: number;
  amount: number;
  expiresAt: number;
}

/**
 * What an approval mints. The conversion being approved counts towards its own
 * tier — otherwise the first conversion would resolve against a counter of 0
 * and fall below every threshold — so the Nth approval is priced at tier N.
 */
export function resolveConversionCredit(
  input: ConversionCreditInput,
): ConversionCredit {
  const rewardPercent = resolveTierRewardPercent(
    input.tiers,
    input.approvedConversionsBefore + 1,
    input.rewardPercentOverride,
  );
  return {
    rewardPercent,
    amount: computeCreditForConversion(input.bookingTotal, rewardPercent),
    expiresAt: creditExpiry(input.approvedAt, input.creditValidityMonths),
  };
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
  // NaN slips through every comparison below, and a blank number input
  // parses to NaN, so finiteness is checked first on every free-text number.
  if (
    !Number.isFinite(settings.referredDiscountValue) ||
    settings.referredDiscountValue <= 0
  ) {
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
    if (
      !Number.isFinite(tier.rewardPercent) ||
      tier.rewardPercent <= 0 ||
      tier.rewardPercent > 100
    ) {
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
    !Number.isFinite(settings.maxRedemptionPercent) ||
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
