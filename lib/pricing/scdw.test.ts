import { describe, expect, it } from "vitest";
import { calculateSCDW, calculateWarranty } from "./scdw";
import { computeReservationPricing } from "./reservation";
import type { VehiclePricingData } from "./types";

/**
 * SCDW (zero-deductible insurance) formula:
 *   base = dailyRate × 2          → covers days 1–3
 *   days > 3: base + 6 for the first extra 3-day block,
 *             then +5 for every further (started) 3-day block
 *
 * The dailyRate fed in is the BASE-tier rate × seasonal multiplier (rounded)
 * — the owner-locked decision on RNGO-13 — NOT the duration-tier rate.
 */
describe("calculateSCDW", () => {
  it("charges exactly 2× the daily rate for rentals up to 3 days", () => {
    // 1–3 days are all covered by the flat base = 50 × 2 = 100
    expect(calculateSCDW(1, 50)).toBe(100);
    expect(calculateSCDW(2, 50)).toBe(100);
    expect(calculateSCDW(3, 50)).toBe(100);
  });

  it("adds 6 EUR for the first extra 3-day block (days 4-6)", () => {
    // days 4, 5 and 6 all fall in the first extra block:
    // ceil((days-3)/3) = 1 block → 100 + 6 = 106
    expect(calculateSCDW(4, 50)).toBe(106);
    expect(calculateSCDW(6, 50)).toBe(106);
  });

  it("adds 5 EUR per further block after the first (+6) block", () => {
    // day 7 starts the second extra block: 100 + 6 + 5 = 111
    expect(calculateSCDW(7, 50)).toBe(111);
    // day 12 → ceil(9/3) = 3 blocks: 100 + 6 + 5×2 = 116
    expect(calculateSCDW(12, 50)).toBe(116);
  });

  it("scales the base with the (already multiplied) daily rate", () => {
    // A seasonal rate of round(50 × 1.5) = 75 → base 150, 6-day rental = 156
    expect(calculateSCDW(6, 75)).toBe(156);
  });
});

describe("SCDW uses the BASE tier, not the duration tier", () => {
  // Vehicle whose base tier (1-3 days: 50/day) differs from its long-rental
  // tiers, so the two candidate SCDW rates give different results and the
  // test proves which one is used.
  const vehicle: VehiclePricingData = {
    pricingTiers: [
      { minDays: 1, maxDays: 3, pricePerDay: 50 },
      { minDays: 4, maxDays: 7, pricePerDay: 40 },
      { minDays: 8, maxDays: 30, pricePerDay: 30 },
    ],
    warranty: 600,
  };

  it("prices SCDW from the base-tier rate even on a duration-tier rental", () => {
    // 6-day rental: the RENTAL itself is billed at the duration tier
    // (40/day), but SCDW is priced from the base tier (50/day):
    //   scdw = 50×2 + 6 = 106   (duration tier would give 40×2 + 6 = 86)
    const breakdown = computeReservationPricing({
      vehicle,
      startDate: new Date(2026, 6, 10),
      endDate: new Date(2026, 6, 16),
      pickupTime: "10:00",
      restitutionTime: "10:00",
      pickupLocation: "Aeroport Cluj-Napoca",
      restitutionLocation: "Aeroport Cluj-Napoca",
      seasonalMultiplier: 1.0,
      isSCDWSelected: true,
    });
    expect(breakdown.rentalDays).toBe(6);
    expect(breakdown.pricePerDay).toBe(40); // rental billed at duration tier
    expect(breakdown.scdwPrice).toBe(106); // SCDW billed at base tier
    expect(breakdown.protectionCost).toBe(106);
  });

  it("applies the seasonal multiplier to the base-tier SCDW rate", () => {
    // Multiplier 1.5 → SCDW daily rate = round(50 × 1.5) = 75
    //   scdw = 75×2 + 6 = 156   (duration tier would give 60×2 + 6 = 126)
    const breakdown = computeReservationPricing({
      vehicle,
      startDate: new Date(2026, 6, 10),
      endDate: new Date(2026, 6, 16),
      pickupTime: "10:00",
      restitutionTime: "10:00",
      pickupLocation: "Aeroport Cluj-Napoca",
      restitutionLocation: "Aeroport Cluj-Napoca",
      seasonalMultiplier: 1.5,
      isSCDWSelected: true,
    });
    expect(breakdown.scdwPrice).toBe(156);
  });
});

/**
 * Warranty (the deductible when SCDW is NOT taken): the vehicle's own
 * warranty amount wins; otherwise a per-type fallback table applies.
 */
describe("calculateWarranty", () => {
  it("uses the vehicle's explicit warranty when set", () => {
    expect(calculateWarranty({ warranty: 750, type: "suv" })).toBe(750);
  });

  it("honors an explicit warranty of 0 as a zero deductible", () => {
    // Owner decision (2026-07-11, PR #45 review): warranty: 0 is a
    // deliberate zero-deductible configuration, NOT "unset" — it must not
    // fall through to the type table. (Changed from the previous truthy
    // check, which sent warranty:0 vehicles to the 800 suv fallback.)
    expect(calculateWarranty({ warranty: 0, type: "suv" })).toBe(0);
  });

  it("falls back to the type table only when warranty is genuinely unset", () => {
    expect(calculateWarranty({ type: "suv" })).toBe(800);
    expect(calculateWarranty({ type: "luxury" })).toBe(1000);
    expect(calculateWarranty({ warranty: undefined, type: "suv" })).toBe(800);
  });

  it("treats a missing type as 'standard' (600) and unknown types as 500", () => {
    // No type at all falls back to the "standard" bucket...
    expect(calculateWarranty(null)).toBe(600);
    expect(calculateWarranty(undefined)).toBe(600);
    expect(calculateWarranty({})).toBe(600);
    // ...while a type that isn't in the table gets the switch default
    expect(calculateWarranty({ type: "sedan" })).toBe(500);
  });
});
