import { describe, expect, it } from "vitest";
import {
  calculateVehiclePricingWithSeason,
  computeReservationPricing,
} from "./reservation";
import type { VehiclePricingData } from "./types";

// Fixture with distinct base (50) and duration (40/30) tiers so the tests
// can tell which rate each component uses.
const vehicle: VehiclePricingData = {
  pricingTiers: [
    { minDays: 1, maxDays: 3, pricePerDay: 50 },
    { minDays: 4, maxDays: 7, pricePerDay: 40 },
    { minDays: 8, maxDays: 30, pricePerDay: 30 },
  ],
  warranty: 600,
};

describe("computeReservationPricing — full booking scenarios", () => {
  it("assembles a realistic SCDW booking with extras and reconciles the total", () => {
    // 6-day rental (Jul 10 10:00 → Jul 16 10:00), no season, SCDW selected,
    // delivery to Cluj-Napoca (10 EUR fee), return at the airport (free),
    // snow chains + 1 child seat (1-4y) + 100 extra km at 5 EUR / 50km.
    const breakdown = computeReservationPricing({
      vehicle,
      startDate: new Date(2026, 6, 10),
      endDate: new Date(2026, 6, 16),
      pickupTime: "10:00",
      restitutionTime: "10:00",
      pickupLocation: "Cluj-Napoca",
      restitutionLocation: "Aeroport Cluj-Napoca",
      seasonalMultiplier: 1.0,
      isSCDWSelected: true,
      extras: {
        snowChains: true,
        childSeat1to4: 1,
        childSeat5to12: 0,
        extraKilometers: 100,
      },
      additional50kmPrice: 5,
    });

    // Rental: 6 days × duration-tier 40/day = 240
    expect(breakdown.rentalDays).toBe(6);
    expect(breakdown.pricePerDay).toBe(40);
    expect(breakdown.basePrice).toBe(240);

    // Protection: SCDW from BASE tier 50/day → 50×2 + 6 = 106, deductible 0
    expect(breakdown.protectionCost).toBe(106);
    expect(breakdown.deductibleAmount).toBe(0);

    // Line items: coded, locale-free, with the params the i18n layer needs
    expect(breakdown.additionalCharges).toEqual([
      { code: "pickupLocationFee", params: { location: "Cluj-Napoca" }, amount: 10 },
      { code: "snowChains", params: { days: 6 }, amount: 18 }, // 6 days × 3
      { code: "childSeat1to4", params: { count: 1, days: 6 }, amount: 18 }, // 1 × 6 × 3
      { code: "extraKm", params: { km: 100 }, amount: 10 }, // 2 packages × 5
    ]);

    // The reconciliation that was broken before this engine existed:
    // total = base + protection + sum(line items) = 240 + 106 + 56 = 402
    expect(breakdown.totalAdditionalCharges).toBe(56);
    expect(breakdown.totalPrice).toBe(402);
    expect(breakdown.totalPrice).toBe(
      breakdown.basePrice +
        breakdown.protectionCost +
        breakdown.additionalCharges.reduce((s, c) => s + c.amount, 0),
    );
  });

  it("prices a seasonal no-SCDW booking with the warranty as deductible", () => {
    // 4-day rental in a 1.35 season, no SCDW, both locations free, no extras.
    // Vehicle has no explicit warranty → type table (suv → 800).
    const breakdown = computeReservationPricing({
      vehicle: { ...vehicle, warranty: undefined, type: "suv" },
      startDate: new Date(2026, 6, 10),
      endDate: new Date(2026, 6, 14),
      pickupTime: "10:00",
      restitutionTime: "10:00",
      pickupLocation: "Aeroport Cluj-Napoca",
      restitutionLocation: "Aeroport Cluj-Napoca",
      seasonalMultiplier: 1.35,
      isSCDWSelected: false,
    });

    // Rental: duration tier 40 × 1.35 = 54/day → 4 × 54 = 216
    expect(breakdown.rentalDays).toBe(4);
    expect(breakdown.pricePerDay).toBe(54);
    expect(breakdown.basePrice).toBe(216);

    // No SCDW → nothing charged for protection, warranty is the deductible
    expect(breakdown.protectionCost).toBe(0);
    expect(breakdown.deductibleAmount).toBe(800);
    // The SCDW quote is still exposed for display:
    // base tier 50 × 1.35 = 67.5 → 68/day → 68×2 + 6 = 142
    expect(breakdown.scdwPrice).toBe(142);

    // No fees, no extras → total is just the rental
    expect(breakdown.additionalCharges).toEqual([]);
    expect(breakdown.totalPrice).toBe(216);
  });

  it("emits both location fee line items when pickup and return differ", () => {
    // Delivery to Bucuresti (220) and return in Sibiu (120), 2 days
    const breakdown = computeReservationPricing({
      vehicle,
      startDate: new Date(2026, 6, 10),
      endDate: new Date(2026, 6, 12),
      pickupTime: "10:00",
      restitutionTime: "10:00",
      pickupLocation: "Bucuresti",
      restitutionLocation: "Sibiu",
      seasonalMultiplier: 1.0,
      isSCDWSelected: false,
    });

    expect(breakdown.deliveryFee).toBe(220);
    expect(breakdown.returnFee).toBe(120);
    expect(breakdown.additionalCharges).toEqual([
      { code: "pickupLocationFee", params: { location: "Bucuresti" }, amount: 220 },
      { code: "returnLocationFee", params: { location: "Sibiu" }, amount: 120 },
    ]);
    // 2 days × base tier 50 + 340 fees + 600 deductible not charged = 440
    expect(breakdown.totalPrice).toBe(440);
  });

  it("rejects negative or fractional extras (public-mutation input)", () => {
    // extras arrive through a public Convex mutation as unbounded numbers;
    // a negative count or km value must never reach the money math
    const base = {
      vehicle,
      startDate: new Date(2026, 6, 10),
      endDate: new Date(2026, 6, 12),
      pickupTime: "10:00",
      restitutionTime: "10:00",
      pickupLocation: "Aeroport Cluj-Napoca",
      restitutionLocation: "Aeroport Cluj-Napoca",
      seasonalMultiplier: 1.0,
      isSCDWSelected: false,
    };
    const extras = {
      snowChains: false,
      childSeat1to4: 0,
      childSeat5to12: 0,
      extraKilometers: 0,
    };

    expect(() =>
      computeReservationPricing({
        ...base,
        extras: { ...extras, childSeat1to4: -10 },
      }),
    ).toThrow(/childSeat1to4/);
    expect(() =>
      computeReservationPricing({
        ...base,
        extras: { ...extras, childSeat5to12: 1.5 },
      }),
    ).toThrow(/childSeat5to12/);
    expect(() =>
      computeReservationPricing({
        ...base,
        extras: { ...extras, extraKilometers: -50 },
      }),
    ).toThrow(/extraKilometers/);
    expect(() =>
      computeReservationPricing({
        ...base,
        extras: { ...extras, extraKilometers: NaN },
      }),
    ).toThrow(/extraKilometers/);
  });

  it("omits zero-amount extras from the line items", () => {
    // Extras object present but everything zero/false → no extra charges,
    // and 40 extra km don't reach a full 50km package
    const breakdown = computeReservationPricing({
      vehicle,
      startDate: new Date(2026, 6, 10),
      endDate: new Date(2026, 6, 12),
      pickupTime: "10:00",
      restitutionTime: "10:00",
      pickupLocation: "Aeroport Cluj-Napoca",
      restitutionLocation: "Aeroport Cluj-Napoca",
      seasonalMultiplier: 1.0,
      isSCDWSelected: false,
      extras: {
        snowChains: false,
        childSeat1to4: 0,
        childSeat5to12: 0,
        extraKilometers: 40,
      },
    });
    expect(breakdown.additionalCharges).toEqual([]);
    expect(breakdown.totalPrice).toBe(100);
  });
});

describe("calculateVehiclePricingWithSeason — multiplier 1.0 equals plain tiered pricing", () => {
  // The former non-seasonal calculateVehiclePricing was collapsed into this
  // function; a 1.0 multiplier must reproduce it exactly: it skips the
  // per-day seasonal rounding, so even fractional tier rates stay exact.
  it("returns the plain duration-tier price at multiplier 1.0", () => {
    const result = calculateVehiclePricingWithSeason(
      vehicle,
      1.0,
      new Date(2026, 6, 10),
      new Date(2026, 6, 16),
      undefined,
      undefined,
      "10:00",
      "10:00",
    );
    // 6 days × duration-tier 40/day
    expect(result.days).toBe(6);
    expect(result.basePrice).toBe(240);
    expect(result.totalPrice).toBe(240);
    expect(result.basePriceBeforeSeason).toBe(240);
    expect(result.seasonalAdjustment).toBe(0);
    expect(result.seasonalMultiplier).toBe(1.0);
  });

  it("adds location fees unchanged at multiplier 1.0", () => {
    const result = calculateVehiclePricingWithSeason(
      vehicle,
      1.0,
      new Date(2026, 6, 10),
      new Date(2026, 6, 12),
      "Cluj-Napoca",
      "Aeroport Cluj-Napoca",
      "10:00",
      "10:00",
    );
    // 2 days × base-tier 50/day + 10 delivery fee
    expect(result.days).toBe(2);
    expect(result.basePrice).toBe(100);
    expect(result.deliveryFee).toBe(10);
    expect(result.returnFee).toBe(0);
    expect(result.totalPrice).toBe(110);
    expect(result.seasonalAdjustment).toBe(0);
  });

  it("returns the null shape when dates are missing (parity with the old helper)", () => {
    const result = calculateVehiclePricingWithSeason(vehicle, 1.0);
    expect(result.basePrice).toBeNull();
    expect(result.totalPrice).toBeNull();
    expect(result.days).toBeNull();
    expect(result.totalLocationFees).toBe(0);
  });

  it("keeps fractional daily rates exact at multiplier 1.0", () => {
    const fractionalVehicle: VehiclePricingData = {
      pricingTiers: [{ minDays: 1, maxDays: 30, pricePerDay: 49.5 }],
      warranty: 600,
    };
    const result = calculateVehiclePricingWithSeason(
      fractionalVehicle,
      1.0,
      new Date(2026, 6, 10),
      new Date(2026, 6, 13),
      undefined,
      undefined,
      "10:00",
      "10:00",
    );
    // 3 days × 49.5 = 148.5, not 3 × Math.round(49.5) = 150
    expect(result.days).toBe(3);
    expect(result.basePrice).toBe(148.5);
    expect(result.totalPrice).toBe(148.5);
    expect(result.seasonalAdjustment).toBe(0);
  });

  it("rounds the seasonal rate per day, not per total", () => {
    // 3 days at base-tier 50/day × 1.25 = 62.5 → rounds to 63/day → 189;
    // per-total rounding (Math.round(150 × 1.25) = 188) would differ
    const result = calculateVehiclePricingWithSeason(
      vehicle,
      1.25,
      new Date(2026, 6, 10),
      new Date(2026, 6, 13),
      undefined,
      undefined,
      "10:00",
      "10:00",
    );
    expect(result.days).toBe(3);
    expect(result.basePrice).toBe(189);
    expect(result.basePriceBeforeSeason).toBe(150);
    expect(result.seasonalAdjustment).toBe(39);
  });
});
