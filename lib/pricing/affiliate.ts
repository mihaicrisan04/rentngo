/**
 * Affiliate program math — the pure half of the referral feature (RNGO-26).
 * Tier resolution, referred-customer discounts and the conversion lifecycle
 * transitions are all here; everything that needs the database (attribution
 * lookups, conversion rows, the confirmedConversions counter) lives in
 * convex/affiliates.ts.
 *
 * Rewards are dynamic and count-derived: the referrer's discount on their own
 * bookings is resolved from confirmedConversions against the admin-editable
 * tier table at booking time — no coupons are minted, so voiding a conversion
 * (booking cancelled) automatically demotes the tier on the next booking.
 */

import { computeCouponDiscount, normalizeCustomerEmail } from "./discount";

export interface AffiliateTier {
  /** Confirmed conversions required to unlock this tier. */
  minConversions: number;
  /** Percentage discount on the referrer's own bookings while at this tier. */
  rewardPercent: number;
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
}

/**
 * Seed defaults, used until an admin saves the settings doc. The numbers are
 * PLACEHOLDERS from the client's example (6 conversions -> 5% referrer
 * reward; referred customer gets a fixed 10 EUR off) — real values are set in
 * the admin UI, never in code. Deliberately DISABLED by default: the program
 * must not grant real discounts on deploy until an admin has reviewed the
 * values and flipped the kill-switch on.
 */
export const DEFAULT_AFFILIATE_SETTINGS: AffiliateSettingsData = {
  enabled: false,
  attributionWindowDays: 30,
  referredDiscountType: "fixed",
  referredDiscountValue: 10,
  tiers: [{ minConversions: 6, rewardPercent: 5 }],
};

/** Slugs are stored normalized so /r/<slug> lookups are case-insensitive. */
export function normalizeAffiliateSlug(slug: string): string {
  return slug.trim().toLowerCase();
}

export function isValidAffiliateSlug(slug: string): boolean {
  return /^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$/.test(slug);
}

/**
 * Reward percent for a confirmed-conversion count: the highest tier whose
 * threshold is met wins; below every threshold the reward is 0. A per-affiliate
 * override replaces the tier table entirely.
 */
export function resolveTierRewardPercent(
  tiers: AffiliateTier[],
  confirmedConversions: number,
  rewardPercentOverride?: number,
): number {
  if (rewardPercentOverride !== undefined) {
    return rewardPercentOverride;
  }
  let percent = 0;
  let bestThreshold = -1;
  for (const tier of tiers) {
    if (
      confirmedConversions >= tier.minConversions &&
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
  confirmedConversions: number,
): AffiliateTier | null {
  let next: AffiliateTier | null = null;
  for (const tier of tiers) {
    if (
      tier.minConversions > confirmedConversions &&
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

/** EUR discount for the referrer's own booking at their current tier. */
export function computeReferrerReward(
  subtotal: number,
  rewardPercent: number,
): number {
  if (rewardPercent <= 0) return 0;
  return computeCouponDiscount(subtotal, "percentage", rewardPercent);
}

export type ConversionStatus = "pending" | "confirmed" | "voided";

export type ReferredIneligibilityReason =
  | "missingOwner"
  | "selfReferral"
  | "duplicate";

/**
 * Eligibility decision for the referred discount + conversion, given the
 * facts the DB layer looked up. FAILS CLOSED when the affiliate's owner user
 * row is missing: an orphaned affiliate must not grant discounts or
 * accumulate conversions, and without the owner's email the self-referral
 * check cannot run. `hasLiveConversion` is the one-per-customer rule: any
 * non-voided prior conversion for this (affiliate, email) blocks a repeat;
 * voided ones (cancelled bookings) free the slot.
 */
export function referredEligibility(params: {
  ownerUser: { id: string; email: string } | null;
  bookerUserId?: string;
  customerEmail: string;
  hasLiveConversion: boolean;
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
  return { eligible: true };
}

/**
 * Conversion lifecycle: how an existing conversion reacts to its booking's
 * status change (owner decision: counter reflects only live bookings).
 * Returns the new status and the delta to apply to the affiliate's
 * confirmedConversions counter, or null when nothing changes — which makes
 * the sync idempotent (a second cancel never double-decrements).
 */
export function conversionTransition(
  current: ConversionStatus,
  bookingIsLive: boolean,
): { nextStatus: ConversionStatus; counterDelta: number } | null {
  if (!bookingIsLive && current === "confirmed") {
    return { nextStatus: "voided", counterDelta: -1 };
  }
  if (bookingIsLive && current === "voided") {
    return { nextStatus: "confirmed", counterDelta: +1 };
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
    seen.add(tier.minConversions);
  }
  return null;
}
