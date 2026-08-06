import { describe, expect, it } from "vitest";
import { applySearchUpdates, SearchData } from "./search-storage";

const day = (n: number) => new Date(2026, 7, n);

describe("applySearchUpdates", () => {
  const prev: SearchData = {
    pickupDate: day(10),
    returnDate: day(15),
    pickupTime: "10:00",
    returnTime: "10:00",
  };

  it("merges non-date fields without touching dates", () => {
    const next = applySearchUpdates(prev, { deliveryLocation: "Cluj Centru" });
    expect(next.deliveryLocation).toBe("Cluj Centru");
    expect(next.pickupDate).toEqual(day(10));
    expect(next.returnDate).toEqual(day(15));
  });

  it("clamps return date when pickup moves past it", () => {
    const next = applySearchUpdates(prev, { pickupDate: day(20) });
    expect(next.returnDate).toEqual(day(20));
  });

  it("clamps return date to pickup when set earlier", () => {
    const next = applySearchUpdates(prev, { returnDate: day(5) });
    expect(next.returnDate).toEqual(day(10));
  });

  it("moves a whole range earlier without clamping against the old pickup", () => {
    const next = applySearchUpdates(prev, {
      pickupDate: day(2),
      returnDate: day(5),
    });
    expect(next.pickupDate).toEqual(day(2));
    expect(next.returnDate).toEqual(day(5));
  });

  it("moves a whole range later in one update", () => {
    const next = applySearchUpdates(prev, {
      pickupDate: day(20),
      returnDate: day(25),
    });
    expect(next.pickupDate).toEqual(day(20));
    expect(next.returnDate).toEqual(day(25));
  });

  it("leaves dates alone when one side is missing", () => {
    const next = applySearchUpdates({}, { returnDate: day(5) });
    expect(next.pickupDate).toBeUndefined();
    expect(next.returnDate).toEqual(day(5));
  });
});
