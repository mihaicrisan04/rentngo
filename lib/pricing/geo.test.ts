import { describe, expect, it } from "vitest";
import {
  assertPlausibleRouteDistance,
  assertValidCoordinates,
  haversineKm,
  isWithinDistanceTolerance,
  routeCacheKey,
} from "./geo";

const otopeni = { lng: 26.085, lat: 44.5711 };
const bucharest = { lng: 26.1025, lat: 44.4268 };

describe("transfer geo validation", () => {
  it("validates coordinate ranges and finite values", () => {
    expect(() => assertValidCoordinates(otopeni)).not.toThrow();
    expect(() => assertValidCoordinates({ lng: 181, lat: 0 })).toThrow();
    expect(() => assertValidCoordinates({ lng: 0, lat: NaN })).toThrow();
  });

  it("computes the straight-line distance", () => {
    expect(haversineKm(otopeni, bucharest)).toBeCloseTo(16.1, 0);
    expect(haversineKm(otopeni, otopeni)).toBe(0);
  });

  it("rejects client distances below the haversine lower bound", () => {
    expect(() =>
      assertPlausibleRouteDistance(20, otopeni, bucharest),
    ).not.toThrow();
    expect(() => assertPlausibleRouteDistance(1, otopeni, bucharest)).toThrow(
      /lower bound/,
    );
  });

  it("uses the larger of 2km and 10% for telemetry tolerance", () => {
    expect(isWithinDistanceTolerance(11.9, 10)).toBe(true);
    expect(isWithinDistanceTolerance(12.1, 10)).toBe(false);
    expect(isWithinDistanceTolerance(109, 100)).toBe(true);
    expect(isWithinDistanceTolerance(111, 100)).toBe(false);
  });

  it("rounds coordinates consistently for cache keys", () => {
    expect(
      routeCacheKey(
        { lng: 26.08504, lat: 44.57114 },
        { lng: 26.10254, lat: 44.42684 },
      ),
    ).toBe("26.0850,44.5711|26.1025,44.4268");
  });
});
