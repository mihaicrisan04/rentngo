import { describe, expect, it } from "vitest";
import {
  calculateChildSeatPrice,
  calculateExtraKilometersPrice,
  calculateIncludedKilometers,
  calculateSnowChainsPrice,
} from "./extras";
import { getLocationPrice, LOCATION_DATA } from "./locations";
import { DEFAULT_LOCATION } from "./constants";

describe("location fees", () => {
  it("charges the listed delivery fee for known locations", () => {
    expect(getLocationPrice("Cluj-Napoca")).toBe(10);
    expect(getLocationPrice("Bucuresti")).toBe(220);
    expect(getLocationPrice("Targu Mures")).toBe(70);
  });

  it("the default location (Aeroport Cluj-Napoca) is free", () => {
    expect(getLocationPrice(DEFAULT_LOCATION)).toBe(0);
    // and it is a real entry, not an accidental unknown-location fallback
    expect(LOCATION_DATA.some((l) => l.name === DEFAULT_LOCATION)).toBe(true);
  });

  it("unknown locations cost 0 (exact-name match only)", () => {
    expect(getLocationPrice("Vienna")).toBe(0);
    // matching is exact and case-sensitive — documents current behavior
    expect(getLocationPrice("cluj-napoca")).toBe(0);
  });
});

describe("physical extras", () => {
  it("snow chains cost 3 EUR per rental day", () => {
    expect(calculateSnowChainsPrice(6)).toBe(18);
  });

  it("child seats cost 3 EUR per seat per day (both age groups)", () => {
    // 2 seats × 5 days × 3 EUR = 30
    expect(calculateChildSeatPrice(2, 5)).toBe(30);
    expect(calculateChildSeatPrice(0, 5)).toBe(0);
  });

  it("extra kilometers are sold in 50km packages", () => {
    // 100 km = 2 packages × 5 EUR (default package price) = 10
    expect(calculateExtraKilometersPrice(100)).toBe(10);
    // package price comes from the vehicle class: 2 packages × 7 = 14
    expect(calculateExtraKilometersPrice(100, 7)).toBe(14);
    // partial packages are not charged: 149 km → floor(149/50) = 2 packages
    expect(calculateExtraKilometersPrice(149, 5)).toBe(10);
  });

  it("includes 200 km per rental day", () => {
    expect(calculateIncludedKilometers(4)).toBe(800);
  });
});
