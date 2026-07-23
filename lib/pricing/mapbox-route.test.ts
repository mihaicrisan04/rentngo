import { describe, expect, it } from "vitest";
import { MapboxRouteError, parseMapboxRoute } from "./mapbox-route";

describe("parseMapboxRoute", () => {
  it("converts a valid route to kilometers and rounded-up minutes", () => {
    expect(
      parseMapboxRoute({ routes: [{ distance: 21_250, duration: 1_201 }] }),
    ).toEqual({ distanceKm: 21.25, durationMinutes: 21 });
  });

  it("rejects successful responses with no route", () => {
    try {
      parseMapboxRoute({ routes: [] });
      throw new Error("Expected parsing to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(MapboxRouteError);
      expect((error as MapboxRouteError).code).toBe("NO_ROUTE");
    }
  });

  it("rejects malformed route values", () => {
    expect(() =>
      parseMapboxRoute({ routes: [{ distance: "10", duration: 20 }] }),
    ).toThrow(/invalid route response/);
    expect(() =>
      parseMapboxRoute({ routes: [{ distance: Infinity, duration: 20 }] }),
    ).toThrow(/invalid route response/);
  });

  it("classifies malformed success responses as provider failures", () => {
    try {
      parseMapboxRoute(null);
      throw new Error("Expected parsing to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(MapboxRouteError);
      expect((error as MapboxRouteError).code).toBe("INVALID_RESPONSE");
    }
  });
});
