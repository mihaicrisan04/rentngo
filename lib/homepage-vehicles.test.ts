import { describe, expect, it } from "vitest";
import { pickHomepageVehicles } from "./homepage-vehicles";

describe("pickHomepageVehicles", () => {
  it("shows the featured vehicles when any are set", () => {
    expect(pickHomepageVehicles(["kuga"], ["fiesta", "focus"])).toEqual({
      vehicles: ["kuga"],
      titleKey: "featuredCars",
    });
  });

  it("falls back to the first three vehicles when none are featured", () => {
    expect(
      pickHomepageVehicles([], ["kuga", "fiesta", "focus", "mustang"]),
    ).toEqual({
      vehicles: ["kuga", "fiesta", "focus"],
      titleKey: "ourLatestCars",
    });
  });

  it("reports an empty fleet", () => {
    expect(pickHomepageVehicles([], [])).toEqual({
      vehicles: [],
      titleKey: "noCarsAvailable",
    });
  });
});
