// Business pricing constants. Single source of truth for both the client
// display paths and the authoritative Convex recompute.

/** Default pickup/return location (no delivery fee). */
export const DEFAULT_LOCATION = "Aeroport Cluj-Napoca";

/** Default pickup/return time. */
export const DEFAULT_PICKUP_TIME = "10:00";

// SCDW (zero-deductible insurance): base covers days 1-3 at 2× the daily
// rate; the first extra 3-day block adds 6 EUR, each further block 5 EUR.
export const SCDW_FIRST_BLOCK_PRICE = 6;
export const SCDW_EXTRA_BLOCK_PRICE = 5;
export const SCDW_BLOCK_DAYS = 3;

/** Snow chains and child seats each cost 3 EUR per day (per seat). */
export const EXTRA_FEATURE_PRICE_PER_DAY = 3;

/** Included kilometers per rental day. */
export const INCLUDED_KM_PER_DAY = 200;

/** Extra kilometers are sold in 50km packages. */
export const EXTRA_KM_PACKAGE_SIZE = 50;

/** Default price per extra-50km package when the vehicle class has none. */
export const DEFAULT_ADDITIONAL_50KM_PRICE = 5;

/** Maximum purchasable extra kilometers (100 × 50km packages). */
export const MAX_EXTRA_KILOMETERS = 5000;

// Transfer pricing
export const TRANSFER_BASE_KM_INCLUDED = 15; // First 15km included in base fare
export const TRANSFER_DEFAULT_BASE_FARE = 25;
export const TRANSFER_DEFAULT_MULTIPLIER = 1.0;
export const TRANSFER_DEFAULT_PRICE_PER_KM = 1.0; // Fallback when no tier matches

/**
 * Sanity ceiling for a booked transfer distance. Cluj to anywhere in Europe
 * the service would plausibly drive is well under this; anything above is
 * garbage or tampered input, not a real trip.
 */
export const MAX_TRANSFER_DISTANCE_KM = 3000;
