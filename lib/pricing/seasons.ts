// Season multiplier calculation (moved from lib/season-utils.ts, which
// mirrored a dead Convex query — this is now the single implementation,
// used client-side for instant display and server-side for the
// authoritative recompute).

import type { CurrentSeason, MultiplierResult, Season } from "./types";

// Helper to parse date string "YYYY-MM-DD" to comparable number YYYYMMDD
function dateToNumber(dateStr: string): number {
  const [year, month, day] = dateStr.split("-");
  return parseInt(year) * 10000 + parseInt(month) * 100 + parseInt(day);
}

// Helper to add days to a date string (purely string-based)
function addDays(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  // Create date at noon to avoid DST issues, but we only care about the date part
  const date = new Date(year, month - 1, day, 12, 0, 0);
  date.setDate(date.getDate() + days);

  const newYear = date.getFullYear();
  const newMonth = String(date.getMonth() + 1).padStart(2, "0");
  const newDay = String(date.getDate()).padStart(2, "0");
  return `${newYear}-${newMonth}-${newDay}`;
}

// Helper to generate all dates in range (string-based, timezone-safe)
function getDatesInRange(startStr: string, endStr: string): string[] {
  const dates: string[] = [];
  const startNum = dateToNumber(startStr);
  const endNum = dateToNumber(endStr);

  if (startNum > endNum) {
    return dates; // Invalid range
  }

  let currentDate = startStr;
  dates.push(currentDate);

  while (dateToNumber(currentDate) < endNum) {
    currentDate = addDays(currentDate, 1);
    dates.push(currentDate);
  }

  return dates;
}

// Helper to check if a date (MM-DD) falls within a period (handles year-spanning)
function isDateInPeriod(
  dateStr: string,
  periodStart: string,
  periodEnd: string,
): boolean {
  const date = dateStr.substring(5); // Extract MM-DD
  const start = periodStart.substring(5); // Extract MM-DD
  const end = periodEnd.substring(5); // Extract MM-DD

  if (start <= end) {
    // Period within same year (e.g., "06-01" to "09-30")
    return date >= start && date <= end;
  } else {
    // Period spans year boundary (e.g., "12-15" to "01-05")
    return date >= start || date <= end;
  }
}

/**
 * Calculate the seasonal multiplier for a date range: the active season with
 * the most overlapping rental days wins; otherwise fall back to the current
 * season, then to 1.0.
 */
export function calculateMultiplierForDateRange(
  startDateStr: string,
  endDateStr: string,
  activeSeasons: Season[],
  currentSeason: CurrentSeason | null,
): MultiplierResult {
  if (activeSeasons.length === 0) {
    // Fall back to current season
    if (currentSeason && currentSeason.season.isActive) {
      return {
        multiplier: currentSeason.season.multiplier,
        seasonId: currentSeason.season._id,
        seasonName: currentSeason.season.name,
      };
    }
    return { multiplier: 1.0 };
  }

  const rentalDates = getDatesInRange(startDateStr, endDateStr);
  const seasonOverlaps = new Map<string, number>();

  // For each active season, count how many rental days fall within its periods
  for (const season of activeSeasons) {
    let totalOverlap = 0;

    for (const rentalDate of rentalDates) {
      for (const period of season.periods) {
        if (isDateInPeriod(rentalDate, period.startDate, period.endDate)) {
          totalOverlap++;
          break; // Count each rental day only once per season
        }
      }
    }

    if (totalOverlap > 0) {
      seasonOverlaps.set(season._id, totalOverlap);
    }
  }

  // Find season with most overlap
  if (seasonOverlaps.size > 0) {
    let maxSeasonId: string | null = null;
    let maxOverlap = 0;

    for (const [seasonId, overlap] of seasonOverlaps.entries()) {
      if (overlap > maxOverlap) {
        maxOverlap = overlap;
        maxSeasonId = seasonId;
      }
    }

    if (maxSeasonId) {
      const winningSeason = activeSeasons.find((s) => s._id === maxSeasonId);
      if (winningSeason) {
        return {
          multiplier: winningSeason.multiplier,
          seasonId: winningSeason._id,
          seasonName: winningSeason.name,
        };
      }
    }
  }

  // No overlap found, fall back to current season
  if (currentSeason && currentSeason.season.isActive) {
    return {
      multiplier: currentSeason.season.multiplier,
      seasonId: currentSeason.season._id,
      seasonName: currentSeason.season.name,
    };
  }

  // Default to 1.0 if no season matches
  return { multiplier: 1.0 };
}

/**
 * Convert Date object to YYYY-MM-DD string (local timezone — client-side use)
 */
export function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Convert a booking timestamp to its intended YYYY-MM-DD calendar date,
 * independent of the runtime's timezone (the Convex server runs in UTC).
 *
 * Booking timestamps are local midnights from the customer's date picker, so
 * in UTC they sit within ±12h of a UTC midnight; rounding to the nearest UTC
 * day recovers the calendar date the customer picked (for any timezone
 * offset within ±12h — beyond that, e.g. UTC+13, the date can shift by one
 * day, which only moves season-boundary edge cases).
 */
export function msToDateString(ms: number): string {
  const roundedToUtcMidnight = Math.round(ms / DAY_MS) * DAY_MS;
  return new Date(roundedToUtcMidnight).toISOString().slice(0, 10);
}
