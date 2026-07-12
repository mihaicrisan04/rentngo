import * as React from "react";
import {
  computeReservationPricing,
  getBasePricePerDay,
  type ReservationPricingBreakdown,
  type VehiclePricingData,
} from "@/lib/pricing";

export interface UseReservationPricingInput {
  vehicle: VehiclePricingData | null | undefined;
  pickupDate: Date | undefined;
  returnDate: Date | undefined;
  pickupTime: string | null;
  returnTime: string | null;
  deliveryLocation: string;
  restitutionLocation: string;
  seasonalMultiplier: number;
  isSCDWSelected: boolean;
  snowChainsSelected: boolean;
  childSeat1to4Count: number;
  childSeat5to12Count: number;
  /** Extra-km packages selected (each = 50 km). */
  extraKilometersCount: number;
  additional50kmPrice: number;
}

export interface UseReservationPricingResult {
  /** null until vehicle, both dates and both times are set (return >= pickup). */
  breakdown: ReservationPricingBreakdown | null;
  // Per-feature amounts for the summary rows (0 while breakdown is null)
  snowChainsPrice: number;
  childSeat1to4Price: number;
  childSeat5to12Price: number;
  extraKilometersPrice: number;
  /** Physical extras only — excludes location fees, matching the summary row. */
  totalAdditionalFeatures: number;
  /**
   * Daily rate for the vehicle summary: the duration-tier seasonal rate once
   * dates are picked, else the base-tier seasonal rate.
   */
  displayPricePerDay: number | null;
}

/**
 * Single memoized pricing derivation for the reservation page, wrapping the
 * canonical lib/pricing engine. Both the summary UI and the submit payload
 * read this one object, so what the customer sees is exactly what is sent —
 * and the server recomputes the same breakdown from the same module.
 */
export function useReservationPricing(
  input: UseReservationPricingInput,
): UseReservationPricingResult {
  const {
    vehicle,
    pickupDate,
    returnDate,
    pickupTime,
    returnTime,
    deliveryLocation,
    restitutionLocation,
    seasonalMultiplier,
    isSCDWSelected,
    snowChainsSelected,
    childSeat1to4Count,
    childSeat5to12Count,
    extraKilometersCount,
    additional50kmPrice,
  } = input;

  return React.useMemo(() => {
    const breakdown =
      vehicle &&
      pickupDate &&
      returnDate &&
      pickupTime &&
      returnTime &&
      returnDate.getTime() >= pickupDate.getTime()
        ? computeReservationPricing({
            vehicle,
            startDate: pickupDate,
            endDate: returnDate,
            pickupTime,
            restitutionTime: returnTime,
            pickupLocation: deliveryLocation,
            restitutionLocation,
            seasonalMultiplier,
            isSCDWSelected,
            extras: {
              snowChains: snowChainsSelected,
              childSeat1to4: childSeat1to4Count,
              childSeat5to12: childSeat5to12Count,
              extraKilometers: extraKilometersCount * 50,
            },
            additional50kmPrice,
          })
        : null;

    const amountFor = (code: string) =>
      breakdown?.additionalCharges.find((charge) => charge.code === code)
        ?.amount ?? 0;

    return {
      breakdown,
      snowChainsPrice: amountFor("snowChains"),
      childSeat1to4Price: amountFor("childSeat1to4"),
      childSeat5to12Price: amountFor("childSeat5to12"),
      extraKilometersPrice: amountFor("extraKm"),
      totalAdditionalFeatures: breakdown
        ? breakdown.totalAdditionalCharges - breakdown.totalLocationFees
        : 0,
      displayPricePerDay: vehicle
        ? (breakdown?.pricePerDay ??
          Math.round(getBasePricePerDay(vehicle) * seasonalMultiplier))
        : null,
    };
  }, [
    vehicle,
    pickupDate,
    returnDate,
    pickupTime,
    returnTime,
    deliveryLocation,
    restitutionLocation,
    seasonalMultiplier,
    isSCDWSelected,
    snowChainsSelected,
    childSeat1to4Count,
    childSeat5to12Count,
    extraKilometersCount,
    additional50kmPrice,
  ]);
}
