import {
  EXTRA_FEATURE_PRICE_PER_DAY,
  EXTRA_KM_PACKAGE_SIZE,
  DEFAULT_ADDITIONAL_50KM_PRICE,
  INCLUDED_KM_PER_DAY,
  MAX_EXTRA_KILOMETERS,
} from "./constants";

/** Snow chains cost 3 EUR per rental day. */
export function calculateSnowChainsPrice(days: number): number {
  return days * EXTRA_FEATURE_PRICE_PER_DAY;
}

/** Child seats cost 3 EUR per seat per rental day. */
export function calculateChildSeatPrice(count: number, days: number): number {
  return count * days * EXTRA_FEATURE_PRICE_PER_DAY;
}

/**
 * Calculate total included kilometers for rental period
 * Base allowance: 200km per day
 */
export function calculateIncludedKilometers(days: number): number {
  return days * INCLUDED_KM_PER_DAY;
}

/**
 * Calculate extra kilometers price
 * Each extra 50km costs a configurable price (default 5 EUR)
 */
export function calculateExtraKilometersPrice(
  extraKilometers: number,
  pricePerExtra50km: number = DEFAULT_ADDITIONAL_50KM_PRICE,
): number {
  const extraPackages = Math.floor(extraKilometers / EXTRA_KM_PACKAGE_SIZE);
  return extraPackages * pricePerExtra50km;
}

/**
 * Get maximum allowed extra kilometers (5000km = 100 * 50km packages)
 */
export function getMaxExtraKilometers(): number {
  return MAX_EXTRA_KILOMETERS;
}
