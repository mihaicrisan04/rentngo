import { describe, expect, it } from "vitest";
import en from "../messages/en.json";
import ro from "../messages/ro.json";
import { formatReservationCharge } from "../convex/emails/utils";

function catalogKeys(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return [prefix];
  }

  return Object.entries(value).flatMap(([key, child]) =>
    catalogKeys(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe("locale catalogs", () => {
  it("keeps English and Romanian keys in exact parity", () => {
    expect(catalogKeys(ro).sort()).toEqual(catalogKeys(en).sort());
  });

  it("formats Romanian one, few, and other plural categories", () => {
    expect(
      formatReservationCharge(
        { code: "snowChains", params: { days: 1 }, amount: 3 },
        "ro",
      ),
    ).toContain("1 zi");
    expect(
      formatReservationCharge(
        { code: "snowChains", params: { days: 2 }, amount: 6 },
        "ro",
      ),
    ).toContain("2 zile");
    expect(
      formatReservationCharge(
        { code: "snowChains", params: { days: 20 }, amount: 60 },
        "ro",
      ),
    ).toContain("20 de zile");
  });

  it("preserves legacy reservation charge descriptions", () => {
    expect(
      formatReservationCharge({ description: "Legacy fee", amount: 10 }, "en"),
    ).toBe("Legacy fee");
  });
});
