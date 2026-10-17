import { describe, expect, it } from "vitest";
import {
  calculateMultiplierForDateRange,
  msToDateString,
  toDateString,
} from "./seasons";
import type { CurrentSeason, Season } from "./types";

const summer: Season = {
  _id: "season_summer",
  name: "High Season",
  multiplier: 1.35,
  periods: [{ startDate: "2026-06-01", endDate: "2026-09-30" }],
  isActive: true,
};

const winterHolidays: Season = {
  _id: "season_winter",
  name: "Holiday Season",
  multiplier: 1.5,
  // Spans the year boundary — periods match by MM-DD, recurring yearly
  periods: [{ startDate: "2026-12-20", endDate: "2026-01-05" }],
  isActive: true,
};

const lowSeason: Season = {
  _id: "season_low",
  name: "Low Season",
  multiplier: 0.9,
  periods: [{ startDate: "2026-10-01", endDate: "2026-11-30" }],
  isActive: true,
};

const currentSeason: CurrentSeason = {
  seasonId: lowSeason._id,
  season: lowSeason,
};

describe("calculateMultiplierForDateRange", () => {
  it("defaults to 1.0 when no seasons exist at all", () => {
    expect(
      calculateMultiplierForDateRange("2026-07-01", "2026-07-05", [], null),
    ).toEqual({ multiplier: 1.0 });
  });

  it("applies the season whose period covers the rental", () => {
    // A July rental sits fully inside the summer period → 1.35
    const result = calculateMultiplierForDateRange(
      "2026-07-01",
      "2026-07-05",
      [summer, winterHolidays],
      null,
    );
    expect(result.multiplier).toBe(1.35);
    expect(result.seasonId).toBe("season_summer");
  });

  it("the season overlapping the most rental days wins", () => {
    // Sep 28 – Oct 4: 3 days fall in summer (Sep 28-30), 4 days in low
    // season (Oct 1-4) → low season wins with 0.9
    const result = calculateMultiplierForDateRange(
      "2026-09-28",
      "2026-10-04",
      [summer, lowSeason],
      null,
    );
    expect(result.multiplier).toBe(0.9);
    expect(result.seasonId).toBe("season_low");
  });

  it("matches year-spanning periods on both sides of the boundary", () => {
    // Jan 2 falls inside the Dec 20 → Jan 5 holiday period
    const result = calculateMultiplierForDateRange(
      "2026-01-02",
      "2026-01-04",
      [summer, winterHolidays],
      null,
    );
    expect(result.multiplier).toBe(1.5);
  });

  it("falls back to the current season when nothing overlaps", () => {
    // A May rental overlaps no period → the admin-set current season applies
    const result = calculateMultiplierForDateRange(
      "2026-05-01",
      "2026-05-03",
      [summer, winterHolidays],
      currentSeason,
    );
    expect(result.multiplier).toBe(0.9);
    expect(result.seasonId).toBe("season_low");
  });

  it("defaults to 1.0 when nothing overlaps and there is no current season", () => {
    const result = calculateMultiplierForDateRange(
      "2026-05-01",
      "2026-05-03",
      [summer],
      null,
    );
    expect(result).toEqual({ multiplier: 1.0 });
  });
});

describe("date string conversion (client/server parity)", () => {
  it("toDateString formats a local Date as YYYY-MM-DD", () => {
    expect(toDateString(new Date(2026, 6, 5))).toBe("2026-07-05");
  });

  it("msToDateString recovers the intended calendar date on a UTC server", () => {
    // Booking timestamps are local midnights. Midnight July 15 in Bucharest
    // (UTC+3, DST) is 21:00 UTC on July 14 — naive UTC formatting would say
    // July 14; rounding to the nearest UTC day recovers July 15.
    const bucharestMidnight = Date.UTC(2026, 6, 14, 21, 0, 0);
    expect(msToDateString(bucharestMidnight)).toBe("2026-07-15");

    // Same for a timezone west of UTC (midnight July 15 in UTC-5 = 05:00 UTC)
    const nycMidnight = Date.UTC(2026, 6, 15, 5, 0, 0);
    expect(msToDateString(nycMidnight)).toBe("2026-07-15");
  });
});
