import { describe, expect, it } from "vitest";
import {
  getBasePricePerDay,
  getBasePriceTier,
  getPriceForDuration,
  getPriceForDurationWithSeason,
} from "./tiers";
import type { VehiclePricingData } from "./types";

// Typical tiered pricing: short rentals cost more per day than long ones.
const vehicle: VehiclePricingData = {
  pricingTiers: [
    { minDays: 1, maxDays: 3, pricePerDay: 50 },
    { minDays: 4, maxDays: 7, pricePerDay: 40 },
    { minDays: 8, maxDays: 30, pricePerDay: 30 },
  ],
};

describe("tier selection", () => {
  it("picks the tier whose [minDays, maxDays] range contains the duration", () => {
    expect(getPriceForDuration(vehicle, 1)).toBe(50); // 1-3 day tier
    expect(getPriceForDuration(vehicle, 3)).toBe(50); // upper bound inclusive
    expect(getPriceForDuration(vehicle, 4)).toBe(40); // 4-7 day tier
    expect(getPriceForDuration(vehicle, 8)).toBe(30); // 8-30 day tier
    expect(getPriceForDuration(vehicle, 30)).toBe(30);
  });

  it("falls back to the tier with the highest maxDays when no tier matches", () => {
    // 45 days exceeds every tier → the longest tier's rate (30/day) applies
    expect(getPriceForDuration(vehicle, 45)).toBe(30);
  });

  it("uses the same highest-maxDays fallback for durations below all tiers", () => {
    // Documents current behavior: with tiers starting at 2 days, a 1-day
    // rental matches nothing and falls back to the longest tier's (cheaper)
    // rate — not the shortest tier's.
    const gappyVehicle: VehiclePricingData = {
      pricingTiers: [
        { minDays: 2, maxDays: 7, pricePerDay: 45 },
        { minDays: 8, maxDays: 30, pricePerDay: 35 },
      ],
    };
    expect(getPriceForDuration(gappyVehicle, 1)).toBe(35);
  });
});

describe("base tier", () => {
  it("is the tier with the lowest minDays (highest price on ties)", () => {
    // The base tier represents the vehicle's standard walk-up daily rate
    expect(getBasePriceTier(vehicle)).toEqual({
      minDays: 1,
      maxDays: 3,
      pricePerDay: 50,
    });
    expect(getBasePricePerDay(vehicle)).toBe(50);
  });

  it("breaks minDays ties by taking the higher price", () => {
    const tied: VehiclePricingData = {
      pricingTiers: [
        { minDays: 1, maxDays: 3, pricePerDay: 45 },
        { minDays: 1, maxDays: 7, pricePerDay: 55 },
      ],
    };
    expect(getBasePricePerDay(tied)).toBe(55);
  });

  it("throws for a vehicle with no pricing tiers (misconfiguration)", () => {
    expect(() => getBasePricePerDay({ pricingTiers: [] })).toThrow(
      /no pricing tiers/,
    );
  });
});

describe("seasonal multiplier on the daily rate", () => {
  it("defaults to 1.0 (no change)", () => {
    expect(getPriceForDurationWithSeason(vehicle, 5)).toBe(40);
  });

  it("multiplies then rounds the per-day rate to a whole number", () => {
    // 5-day rental → 40/day; ×1.35 = 54 exactly
    expect(getPriceForDurationWithSeason(vehicle, 5, 1.35)).toBe(54);
    // 2-day rental → 50/day; ×1.35 = 67.5 → rounds half-up to 68.
    // Rounding happens on the DAILY rate before multiplying by days, so a
    // 2-day total is 136 (2×68), not round(135)=135.
    expect(getPriceForDurationWithSeason(vehicle, 2, 1.35)).toBe(68);
  });

  it("supports low-season discounts (multiplier < 1)", () => {
    // 50 × 0.8 = 40
    expect(getPriceForDurationWithSeason(vehicle, 2, 0.8)).toBe(40);
  });
});
