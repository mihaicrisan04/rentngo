import { describe, expect, it } from "vitest";
import {
  assertValidTransferDistance,
  computeTransferPricing,
} from "./transfer";
import type { TransferTierData } from "./types";

// The production default tiers (see transferPricing.seedDefaultTiers):
// extra km after the 15km base are priced by the range they fall into.
const tiers: TransferTierData[] = [
  { minExtraKm: 0, maxExtraKm: 25, pricePerKm: 1.6, isActive: true },
  { minExtraKm: 25, maxExtraKm: 65, pricePerKm: 1.2, isActive: true },
  { minExtraKm: 65, maxExtraKm: 185, pricePerKm: 1.0, isActive: true },
  { minExtraKm: 385, maxExtraKm: undefined, pricePerKm: 0.9, isActive: true },
];

/**
 * Distance sanity clamp for the money path (createTransfer): the fare
 * FORMULA is server-authoritative, but distanceKm still comes from the
 * client's Mapbox route (server-side re-derivation tracked as RNGO-30), so
 * garbage values must be rejected before any fare math.
 */
describe("assertValidTransferDistance", () => {
  it("accepts realistic distances including 0 and the maximum", () => {
    expect(() => assertValidTransferDistance(0)).not.toThrow();
    expect(() => assertValidTransferDistance(42.7)).not.toThrow();
    expect(() => assertValidTransferDistance(3000)).not.toThrow();
  });

  it("rejects negative and non-finite distances", () => {
    expect(() => assertValidTransferDistance(-5)).toThrow(/non-negative/);
    expect(() => assertValidTransferDistance(NaN)).toThrow(/non-negative/);
    expect(() => assertValidTransferDistance(Infinity)).toThrow(/non-negative/);
  });

  it("rejects absurdly large distances (over 3000 km)", () => {
    expect(() => assertValidTransferDistance(3001)).toThrow(/maximum/);
    expect(() => assertValidTransferDistance(1e9)).toThrow(/maximum/);
  });
});

describe("computeTransferPricing", () => {
  it("trips within 15km cost only the base fare", () => {
    // 12 km ≤ 15 km included → base fare 25, no distance charge, no tier
    const fare = computeTransferPricing({
      distanceKm: 12,
      transferType: "one_way",
      vehicleClass: null,
      tiers,
    });
    expect(fare).toEqual({
      baseFare: 25,
      extraKm: 0,
      distanceCharge: 0,
      totalPrice: 25,
      tierPricePerKm: 0,
    });
  });

  it("charges extra km at the matching tier's rate", () => {
    // 35 km → 20 extra km → first tier [0, 25) at 1.6/km:
    //   25 + 20×1.6×1.0 = 25 + 32 = 57
    const fare = computeTransferPricing({
      distanceKm: 35,
      transferType: "one_way",
      vehicleClass: null,
      tiers,
    });
    expect(fare.extraKm).toBe(20);
    expect(fare.tierPricePerKm).toBe(1.6);
    expect(fare.distanceCharge).toBe(32);
    expect(fare.totalPrice).toBe(57);
  });

  it("tier ranges are min-inclusive / max-exclusive", () => {
    // Exactly 25 extra km falls in the [25, 65) tier at 1.2/km, not [0, 25)
    const fare = computeTransferPricing({
      distanceKm: 40,
      transferType: "one_way",
      vehicleClass: null,
      tiers,
    });
    expect(fare.tierPricePerKm).toBe(1.2);
    expect(fare.totalPrice).toBe(25 + 25 * 1.2); // 55
  });

  it("uses the vehicle class base fare and multiplies by its class multiplier", () => {
    // Premium class: base fare 40, multiplier 1.5
    //   40 + 20×1.6×1.5 = 40 + 48 = 88
    const fare = computeTransferPricing({
      distanceKm: 35,
      transferType: "one_way",
      vehicleClass: { transferBaseFare: 40, transferMultiplier: 1.5 },
      tiers,
    });
    expect(fare.baseFare).toBe(40);
    expect(fare.distanceCharge).toBe(48);
    expect(fare.totalPrice).toBe(88);
  });

  it("round trips double the whole price (base fare included)", () => {
    // Same 57 EUR leg as above, doubled → 114
    const fare = computeTransferPricing({
      distanceKm: 35,
      transferType: "round_trip",
      vehicleClass: null,
      tiers,
    });
    expect(fare.totalPrice).toBe(114);
    // distanceCharge stays per-leg (this is what's persisted as distancePrice)
    expect(fare.distanceCharge).toBe(32);

    // ...even when the trip fits in the base fare
    const short = computeTransferPricing({
      distanceKm: 10,
      transferType: "round_trip",
      vehicleClass: null,
      tiers,
    });
    expect(short.totalPrice).toBe(50);
  });

  it("falls back to 1.0/km when no tier covers the extra km", () => {
    // 100 km → 85 extra km; with only the first two tiers active there is a
    // gap at [65, 185) → default 1.0/km applies: 25 + 85×1.0 = 110
    const gappy = tiers.slice(0, 2);
    const fare = computeTransferPricing({
      distanceKm: 100,
      transferType: "one_way",
      vehicleClass: null,
      tiers: gappy,
    });
    expect(fare.tierPricePerKm).toBe(1.0);
    expect(fare.totalPrice).toBe(110);
  });

  it("ignores inactive tiers", () => {
    // The 1.6/km tier is disabled → 20 extra km hits the fallback 1.0/km
    const withInactive: TransferTierData[] = [{ ...tiers[0], isActive: false }];
    const fare = computeTransferPricing({
      distanceKm: 35,
      transferType: "one_way",
      vehicleClass: null,
      tiers: withInactive,
    });
    expect(fare.tierPricePerKm).toBe(1.0);
    expect(fare.totalPrice).toBe(45);
  });

  it("rounds money to 2 decimals", () => {
    // 400 km → 385 extra km → open-ended tier at 0.9/km with a 1.15
    // multiplier: 385 × 0.9 × 1.15 = 398.475 → 398.48 (charge)
    const fare = computeTransferPricing({
      distanceKm: 400,
      transferType: "one_way",
      vehicleClass: { transferMultiplier: 1.15 },
      tiers,
    });
    expect(fare.distanceCharge).toBe(398.48);
    expect(fare.totalPrice).toBe(423.48);
  });
});
