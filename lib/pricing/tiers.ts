import type { PricingTier, VehiclePricingData } from "./types";

/**
 * Get the base price tier (lowest minDays + highest pricePerDay)
 * This represents the "standard" or "base" price for the vehicle
 */
export function getBasePriceTier(
  vehicle: VehiclePricingData,
): PricingTier | null {
  if (!vehicle.pricingTiers || vehicle.pricingTiers.length === 0) {
    return null;
  }

  // Sort by minDays (ascending), then by pricePerDay (descending)
  // This gives us the tier with lowest day requirement and highest price
  const sortedTiers = [...vehicle.pricingTiers].sort((a, b) => {
    if (a.minDays !== b.minDays) {
      return a.minDays - b.minDays; // Lower minDays first
    }
    return b.pricePerDay - a.pricePerDay; // Higher pricePerDay first
  });

  return sortedTiers[0];
}

/**
 * Get the base price per day for a vehicle
 * Uses the pricing tier with lowest minDays and highest pricePerDay
 */
export function getBasePricePerDay(vehicle: VehiclePricingData): number {
  const baseTier = getBasePriceTier(vehicle);
  if (baseTier) {
    return baseTier.pricePerDay;
  }

  throw new Error(
    `Vehicle ${vehicle._id ?? "(unknown)"} has no pricing tiers configured`,
  );
}

/** Get the daily rate for a specific rental duration from the pricing tiers. */
export function getPriceForDuration(
  vehicle: VehiclePricingData,
  days: number,
): number {
  // If vehicle has pricing tiers, use them
  if (vehicle.pricingTiers && vehicle.pricingTiers.length > 0) {
    // Find the appropriate tier for the rental duration
    const applicableTier = vehicle.pricingTiers.find(
      (tier) => days >= tier.minDays && days <= tier.maxDays,
    );

    if (applicableTier) {
      return applicableTier.pricePerDay;
    }

    // If no exact tier found, use the tier with the highest maxDays
    const fallbackTier = vehicle.pricingTiers.reduce((prev, current) =>
      current.maxDays > prev.maxDays ? current : prev,
    );
    return fallbackTier.pricePerDay;
  }

  // Legacy fallback - use the base price per day
  return getBasePricePerDay(vehicle);
}

/** Duration-tier daily rate with the seasonal multiplier applied (rounded). */
export function getPriceForDurationWithSeason(
  vehicle: VehiclePricingData,
  days: number,
  seasonalMultiplier: number = 1.0,
): number {
  const basePrice = getPriceForDuration(vehicle, days);
  return Math.round(basePrice * seasonalMultiplier);
}

/** Total rental price (no season/extras) for a duration. */
export function getTotalPrice(
  vehicle: VehiclePricingData,
  days: number,
): number {
  return getPriceForDuration(vehicle, days) * days;
}

/** Min/max daily rate across the vehicle's pricing tiers. */
export function getPriceRange(vehicle: VehiclePricingData): {
  min: number;
  max: number;
} {
  if (vehicle.pricingTiers && vehicle.pricingTiers.length > 0) {
    const prices = vehicle.pricingTiers.map((tier) => tier.pricePerDay);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }

  // Legacy fallback - use base price per day
  const basePrice = getBasePricePerDay(vehicle);
  return {
    min: basePrice,
    max: basePrice,
  };
}
