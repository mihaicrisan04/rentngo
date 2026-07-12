import { DEFAULT_ADDITIONAL_50KM_PRICE } from "./constants";
import {
  calculateChildSeatPrice,
  calculateExtraKilometersPrice,
  calculateSnowChainsPrice,
} from "./extras";
import { getLocationPrice } from "./locations";
import { calculateRentalDays } from "./rental-days";
import { calculateSCDW, calculateWarranty } from "./scdw";
import {
  getBasePricePerDay,
  getPriceForDuration,
  getPriceForDurationWithSeason,
} from "./tiers";
import type {
  ReservationCharge,
  ReservationPricingBreakdown,
  ReservationPricingInput,
  VehiclePricingData,
} from "./types";

/**
 * Reject malformed extras before they reach any money math. Counts and
 * kilometers arrive as unbounded numbers from a public mutation, so a
 * negative or fractional value must fail loudly instead of producing a
 * charge nobody intended.
 */
export function assertValidReservationExtras(
  extras: ReservationPricingInput["extras"],
): void {
  if (!extras) return;
  const counts: Array<[string, number]> = [
    ["childSeat1to4", extras.childSeat1to4],
    ["childSeat5to12", extras.childSeat5to12],
  ];
  for (const [name, value] of counts) {
    if (!Number.isInteger(value) || value < 0) {
      throw new Error(`Invalid extras: ${name} must be a non-negative integer (got ${value}).`);
    }
  }
  if (!Number.isFinite(extras.extraKilometers) || extras.extraKilometers < 0) {
    throw new Error(
      `Invalid extras: extraKilometers must be a non-negative number (got ${extras.extraKilometers}).`,
    );
  }
}

/**
 * Compute the complete, itemized price of a reservation. This is the
 * canonical money-path calculation: the client uses it for display and the
 * Convex `createReservation` mutation recomputes it with server-fetched data
 * and overwrites whatever the client submitted.
 *
 * Reconciliation invariant:
 *   totalPrice = basePrice + protectionCost + sum(additionalCharges.amount)
 *
 * Rate rules:
 * - basePrice uses the DURATION-tier daily rate × seasonal multiplier
 *   (rounded per day, then × days)
 * - SCDW uses the BASE-tier daily rate × seasonal multiplier (rounded) —
 *   the owner-locked decision (Linear RNGO-13, 2026-07-11)
 * - location fees and physical extras are flat (no seasonal multiplier)
 */
export function computeReservationPricing(
  input: ReservationPricingInput,
): ReservationPricingBreakdown {
  assertValidReservationExtras(input.extras);

  const rentalDays = calculateRentalDays(
    input.startDate,
    input.endDate,
    input.pickupTime,
    input.restitutionTime,
  );

  const pricePerDay = getPriceForDurationWithSeason(
    input.vehicle,
    rentalDays,
    input.seasonalMultiplier,
  );
  const basePrice = rentalDays * pricePerDay;

  const deliveryFee = input.pickupLocation
    ? getLocationPrice(input.pickupLocation)
    : 0;
  const returnFee = input.restitutionLocation
    ? getLocationPrice(input.restitutionLocation)
    : 0;
  const totalLocationFees = deliveryFee + returnFee;

  const warrantyAmount = calculateWarranty(input.vehicle);
  const scdwDailyRate = Math.round(
    getBasePricePerDay(input.vehicle) * input.seasonalMultiplier,
  );
  const scdwPrice = calculateSCDW(rentalDays, scdwDailyRate);
  const protectionCost = input.isSCDWSelected ? scdwPrice : 0;
  const deductibleAmount = input.isSCDWSelected ? 0 : warrantyAmount || 0;

  const additionalCharges: ReservationCharge[] = [];

  if (deliveryFee > 0) {
    additionalCharges.push({
      code: "pickupLocationFee",
      params: { location: input.pickupLocation },
      amount: deliveryFee,
    });
  }
  if (returnFee > 0) {
    additionalCharges.push({
      code: "returnLocationFee",
      params: { location: input.restitutionLocation },
      amount: returnFee,
    });
  }

  const extras = input.extras;
  if (extras) {
    if (extras.snowChains) {
      additionalCharges.push({
        code: "snowChains",
        params: { days: rentalDays },
        amount: calculateSnowChainsPrice(rentalDays),
      });
    }
    if (extras.childSeat1to4 > 0) {
      additionalCharges.push({
        code: "childSeat1to4",
        params: { count: extras.childSeat1to4, days: rentalDays },
        amount: calculateChildSeatPrice(extras.childSeat1to4, rentalDays),
      });
    }
    if (extras.childSeat5to12 > 0) {
      additionalCharges.push({
        code: "childSeat5to12",
        params: { count: extras.childSeat5to12, days: rentalDays },
        amount: calculateChildSeatPrice(extras.childSeat5to12, rentalDays),
      });
    }
    if (extras.extraKilometers > 0) {
      const amount = calculateExtraKilometersPrice(
        extras.extraKilometers,
        input.additional50kmPrice ?? DEFAULT_ADDITIONAL_50KM_PRICE,
      );
      if (amount > 0) {
        additionalCharges.push({
          code: "extraKm",
          params: { km: extras.extraKilometers },
          amount,
        });
      }
    }
  }

  const totalAdditionalCharges = additionalCharges.reduce(
    (sum, charge) => sum + charge.amount,
    0,
  );

  return {
    rentalDays,
    pricePerDay,
    basePrice,
    deliveryFee,
    returnFee,
    totalLocationFees,
    warrantyAmount,
    scdwPrice,
    protectionCost,
    deductibleAmount,
    additionalCharges,
    totalAdditionalCharges,
    totalPrice: basePrice + protectionCost + totalAdditionalCharges,
    seasonalMultiplier: input.seasonalMultiplier,
  };
}

// ---------------------------------------------------------------------------
// Legacy display helpers (moved from lib/vehicle-utils.ts). These predate
// computeReservationPricing and remain for the existing client display call
// sites; they share the same tier/day/location primitives.
// ---------------------------------------------------------------------------

// Pricing calculation types
export interface PriceDetails {
  basePrice: number | null;
  totalPrice: number | null;
  days: number | null;
  deliveryFee: number;
  returnFee: number;
  totalLocationFees: number;
  // Add seasonal pricing info
  seasonalMultiplier?: number;
  seasonalAdjustment?: number;
  basePriceBeforeSeason?: number | null;
}

/**
 * Calculate pricing details for a vehicle rental using tiered pricing
 */
export function calculateVehiclePricing(
  vehicle: VehiclePricingData,
  pickup?: Date | null,
  restitution?: Date | null,
  deliveryLocation?: string,
  restitutionLocation?: string,
  pickupTime?: string | null,
  restitutionTime?: string | null,
): PriceDetails {
  if (pickup && restitution && pickupTime && restitutionTime && restitution >= pickup) {
    const calculatedDays = calculateRentalDays(pickup, restitution, pickupTime, restitutionTime);

    // Get the appropriate price per day based on rental duration using pricing tiers
    const pricePerDay = getPriceForDuration(vehicle, calculatedDays);
    const basePrice = calculatedDays * pricePerDay;

    // Add location fees
    const deliveryFee = deliveryLocation ? getLocationPrice(deliveryLocation) : 0;
    const returnFee = restitutionLocation ? getLocationPrice(restitutionLocation) : 0;
    const totalLocationFees = deliveryFee + returnFee;

    return {
      basePrice,
      totalPrice: basePrice + totalLocationFees,
      days: calculatedDays,
      deliveryFee,
      returnFee,
      totalLocationFees,
    };
  }

  return {
    basePrice: null,
    totalPrice: null,
    days: null,
    deliveryFee: 0,
    returnFee: 0,
    totalLocationFees: 0,
  };
}

/**
 * Calculate pricing details for a vehicle rental with seasonal adjustments
 */
export function calculateVehiclePricingWithSeason(
  vehicle: VehiclePricingData,
  seasonalMultiplier: number = 1.0,
  pickup?: Date | null,
  restitution?: Date | null,
  deliveryLocation?: string,
  restitutionLocation?: string,
  pickupTime?: string | null,
  restitutionTime?: string | null,
): PriceDetails {
  if (pickup && restitution && pickupTime && restitutionTime && restitution >= pickup) {
    const calculatedDays = calculateRentalDays(pickup, restitution, pickupTime, restitutionTime);

    // Get the base price per day from pricing tiers
    const basePricePerDay = getPriceForDuration(vehicle, calculatedDays);

    // Apply seasonal multiplier to the price per day and round it
    const seasonalPricePerDay = Math.round(basePricePerDay * seasonalMultiplier);

    // Calculate base price using the rounded seasonal price per day
    const basePriceBeforeSeason = calculatedDays * basePricePerDay;
    const seasonallyAdjustedBasePrice = calculatedDays * seasonalPricePerDay;
    const seasonalAdjustment = seasonallyAdjustedBasePrice - basePriceBeforeSeason;

    // Add location fees
    const deliveryFee = deliveryLocation ? getLocationPrice(deliveryLocation) : 0;
    const returnFee = restitutionLocation ? getLocationPrice(restitutionLocation) : 0;
    const totalLocationFees = deliveryFee + returnFee;

    return {
      basePrice: seasonallyAdjustedBasePrice,
      totalPrice: seasonallyAdjustedBasePrice + totalLocationFees,
      days: calculatedDays,
      deliveryFee,
      returnFee,
      totalLocationFees,
      seasonalMultiplier,
      seasonalAdjustment,
      basePriceBeforeSeason,
    };
  }

  return {
    basePrice: null,
    totalPrice: null,
    days: null,
    deliveryFee: 0,
    returnFee: 0,
    totalLocationFees: 0,
    seasonalMultiplier: 1.0,
    seasonalAdjustment: 0,
    basePriceBeforeSeason: null,
  };
}
