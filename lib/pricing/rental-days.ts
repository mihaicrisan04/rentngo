const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Calculate number of rental days using dates and pickup/return times
 * Rules:
 * - Same-day rentals count as 1 day
 * - For multi-day rentals, if restitution time is more than 2 hours after pickup time, add 1 day
 *
 * The pickup/restitution dates are calendar dates (local midnights from the
 * date picker); times travel separately as "HH:MM" strings. The day count is
 * a rounded millisecond difference rather than a calendar-day difference so
 * that the Convex server (UTC) computes the exact same count as the browser
 * (local timezone), including across DST transitions.
 */
export function calculateRentalDays(
  pickup: Date,
  restitution: Date,
  pickupTime: string,
  restitutionTime: string,
): number {
  const pickupHour = parseInt(pickupTime.split(":")[0]);
  const restitutionHour = parseInt(restitutionTime.split(":")[0]);
  const days = Math.round((restitution.getTime() - pickup.getTime()) / DAY_MS);
  if (days === 0) return 1;
  if (restitutionHour > pickupHour + 2) return days + 1;
  return days;
}
