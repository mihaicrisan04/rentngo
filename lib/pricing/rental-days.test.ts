import { describe, expect, it } from "vitest";
import { calculateRentalDays } from "./rental-days";

/**
 * Rental day count rules (PRD "Key Business Rules"):
 * - same-day rentals count as 1 day
 * - multi-day rentals count calendar days between pickup and return
 * - returning more than 2 hours later (by hour) than the pickup time adds
 *   one extra day (e.g. picked up at 10:00, returned at 13:00 → +1 day;
 *   returned at 12:00 → no extra day)
 */
describe("calculateRentalDays", () => {
  it("counts a same-day rental as 1 day (minimum floor)", () => {
    const day = new Date(2026, 6, 10);
    // Even a late return on the same calendar day is a single rental day
    expect(calculateRentalDays(day, day, "10:00", "18:00")).toBe(1);
  });

  it("counts exact 24h multiples as plain calendar days", () => {
    // 4 calendar days, returned at the same hour as pickup → 4 days
    const pickup = new Date(2026, 6, 10);
    const restitution = new Date(2026, 6, 14);
    expect(calculateRentalDays(pickup, restitution, "10:00", "10:00")).toBe(4);
  });

  it("does not add a day when the return is within the 2-hour grace", () => {
    // Returned at 12:00 after a 10:00 pickup: 12 is not > 10+2 → still 4 days
    const pickup = new Date(2026, 6, 10);
    const restitution = new Date(2026, 6, 14);
    expect(calculateRentalDays(pickup, restitution, "10:00", "12:00")).toBe(4);
  });

  it("adds an extra day when the return is more than 2 hours late", () => {
    // Returned at 13:00 after a 10:00 pickup: 13 > 12 → 4 + 1 = 5 days
    const pickup = new Date(2026, 6, 10);
    const restitution = new Date(2026, 6, 14);
    expect(calculateRentalDays(pickup, restitution, "10:00", "13:00")).toBe(5);
  });

  it("does not add a day for an early return", () => {
    // Returned at 08:00 after a 10:00 pickup → still 4 days
    const pickup = new Date(2026, 6, 10);
    const restitution = new Date(2026, 6, 14);
    expect(calculateRentalDays(pickup, restitution, "10:00", "08:00")).toBe(4);
  });

  it("is robust to DST-shortened spans (client/server parity)", () => {
    // A rental spanning a spring DST change is 4×24h minus 1h between the
    // two local midnights. The rounded millisecond difference still counts
    // 4 days — identically in the browser (local tz) and on the Convex
    // server (UTC), which is why the implementation rounds instead of
    // truncating.
    const pickup = new Date(2026, 2, 27); // local midnight
    const restitution = new Date(pickup.getTime() + 4 * 86400000 - 3600000);
    expect(calculateRentalDays(pickup, restitution, "10:00", "10:00")).toBe(4);
  });
});
