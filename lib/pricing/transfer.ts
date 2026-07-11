// Transfer pricing formula — the single implementation replacing the three
// near-identical copies that lived in convex/transferPricing.ts (×2) and
// convex/transfers.getTransferVehiclesWithImages.

import {
  TRANSFER_BASE_KM_INCLUDED,
  TRANSFER_DEFAULT_BASE_FARE,
  TRANSFER_DEFAULT_MULTIPLIER,
  TRANSFER_DEFAULT_PRICE_PER_KM,
} from "./constants";
import type { TransferPricingBreakdown, TransferPricingInput } from "./types";

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Compute a transfer fare: the base fare covers the first 15km; extra km are
 * charged at the matching tier's per-km rate × the vehicle class multiplier;
 * round trips double the total.
 */
export function computeTransferPricing(
  input: TransferPricingInput,
): TransferPricingBreakdown {
  const baseFare = input.vehicleClass?.transferBaseFare ?? TRANSFER_DEFAULT_BASE_FARE;
  const classMultiplier =
    input.vehicleClass?.transferMultiplier ?? TRANSFER_DEFAULT_MULTIPLIER;

  const extraKm = Math.max(input.distanceKm - TRANSFER_BASE_KM_INCLUDED, 0);

  if (extraKm === 0) {
    // Trip within base fare (≤ 15km)
    const total = input.transferType === "round_trip" ? baseFare * 2 : baseFare;
    return {
      baseFare,
      extraKm: 0,
      distanceCharge: 0,
      totalPrice: round2(total),
      tierPricePerKm: 0,
    };
  }

  // Find applicable tier based on extra km
  const tier = input.tiers
    .filter((t) => t.isActive !== false)
    .find(
      (t) =>
        extraKm >= t.minExtraKm &&
        (t.maxExtraKm === undefined || extraKm < t.maxExtraKm),
    );

  const tierPricePerKm = tier?.pricePerKm ?? TRANSFER_DEFAULT_PRICE_PER_KM;

  // baseFare + (extraKm × tierPrice × classMultiplier)
  const distanceCharge = extraKm * tierPricePerKm * classMultiplier;

  let totalPrice = baseFare + distanceCharge;
  if (input.transferType === "round_trip") {
    totalPrice *= 2;
  }

  return {
    baseFare,
    extraKm,
    distanceCharge: round2(distanceCharge),
    totalPrice: round2(totalPrice),
    tierPricePerKm,
  };
}
