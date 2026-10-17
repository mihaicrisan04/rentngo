import { describe, expect, it } from "vitest";
import {
  calculateChildSeatPrice,
  calculateExtraKilometersPrice,
  calculateExtraKmPackages,
  calculateIncludedKilometers,
  calculateSnowChainsPrice,
} from "./extras";
import { getLocationPrice, isKnownLocation, LOCATION_DATA } from "./locations";
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

  it("matches names case-insensitively and ignores surrounding whitespace", () => {
    // A client can't dodge the delivery fee on the authoritative recompute
    // by re-casing or padding the location name
    expect(getLocationPrice("cluj-napoca")).toBe(10);
    expect(getLocationPrice("CLUJ-NAPOCA")).toBe(10);
    expect(getLocationPrice("  Cluj-Napoca  ")).toBe(10);
    expect(getLocationPrice("BUCURESTI")).toBe(220);
    expect(isKnownLocation("cluj-napoca")).toBe(true);
  });

  it("unknown locations cost 0", () => {
    expect(getLocationPrice("Vienna")).toBe(0);
    expect(getLocationPrice("")).toBe(0);
    expect(isKnownLocation("Vienna")).toBe(false);
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

  it("package count floors partial packages (display must match the charge)", () => {
    expect(calculateExtraKmPackages(40)).toBe(0);
    expect(calculateExtraKmPackages(50)).toBe(1);
    expect(calculateExtraKmPackages(75)).toBe(1);
    expect(calculateExtraKmPackages(100)).toBe(2);
    // the count shown in emails × package price must equal the charged amount
    expect(calculateExtraKmPackages(75) * 5).toBe(
      calculateExtraKilometersPrice(75, 5),
    );
    expect(calculateExtraKmPackages(40) * 5).toBe(
      calculateExtraKilometersPrice(40, 5),
    );
  });

  it("includes 200 km per rental day", () => {
    expect(calculateIncludedKilometers(4)).toBe(800);
  });
});
