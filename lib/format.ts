/** Shared display formatting helpers. */

export function formatPrice(price: number): string {
  return `${price.toFixed(2)} EUR`;
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString();
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const RELATIVE_CUTOFF = 7 * DAY;

/**
 * `now` is passed in rather than read from the clock so client components stay
 * prerenderable under cacheComponents (see `usePeriodicNow`).
 */
export function formatRelativeTime(
  timestamp: number,
  now: number,
  formatAbsolute: (timestamp: number) => string = formatDate,
): string {
  const elapsed = now - timestamp;

  if (elapsed < 0 || elapsed >= RELATIVE_CUTOFF) {
    return formatAbsolute(timestamp);
  }
  if (elapsed < MINUTE) return "just now";
  if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)}m ago`;
  if (elapsed < DAY) return `${Math.floor(elapsed / HOUR)}h ago`;
  return `${Math.floor(elapsed / DAY)}d ago`;
}
