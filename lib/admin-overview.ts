/** Pure helpers for the admin overview "needs attention" row. */

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

export const UPCOMING_WINDOW_HOURS = 48;

function startOfDay(timestamp: number): number {
  const day = new Date(timestamp);
  day.setHours(0, 0, 0, 0);
  return day.getTime();
}

/**
 * `now` is passed in rather than read from the clock so client components stay
 * prerenderable under cacheComponents (see `usePeriodicNow`).
 *
 * The window opens at midnight so pickups earlier today still show up.
 */
export function getUpcomingWindow(
  now: number,
  hours: number = UPCOMING_WINDOW_HOURS,
): { from: number; to: number } {
  return { from: startOfDay(now), to: now + hours * HOUR };
}

export function getDayLabel(timestamp: number, now: number): string {
  const days = Math.round((startOfDay(timestamp) - startOfDay(now)) / DAY);

  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  return new Date(timestamp).toLocaleDateString();
}
