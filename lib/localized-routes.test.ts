import { describe, expect, it } from "vitest";
import { carsPath, switchLocalePath } from "./localized-routes";

describe("carsPath", () => {
  it("uses the localized fleet segment", () => {
    expect(carsPath("ro")).toBe("/ro/masini-de-inchiriat-cluj-napoca");
    expect(carsPath("en", "dacia-logan-2024")).toBe(
      "/en/car-rental-cluj-napoca/dacia-logan-2024",
    );
  });
});

describe("switchLocalePath", () => {
  it("swaps the fleet segment along with the locale", () => {
    expect(
      switchLocalePath("/ro/masini-de-inchiriat-cluj-napoca/bmw-x5", "en"),
    ).toBe("/en/car-rental-cluj-napoca/bmw-x5");
    expect(switchLocalePath("/en/car-rental-cluj-napoca", "ro")).toBe(
      "/ro/masini-de-inchiriat-cluj-napoca",
    );
  });

  it("only swaps the prefix elsewhere", () => {
    expect(switchLocalePath("/ro/about", "en")).toBe("/en/about");
    expect(switchLocalePath("/en", "ro")).toBe("/ro");
    expect(switchLocalePath("/en/transfers/booking", "ro")).toBe(
      "/ro/transfers/booking",
    );
  });
});
