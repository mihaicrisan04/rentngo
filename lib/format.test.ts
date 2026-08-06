import { describe, expect, it } from "vitest";
import { formatDate, formatPrice, formatRelativeTime } from "./format";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const now = Date.UTC(2026, 7, 6, 12, 0, 0);
const ago = (ms: number) => formatRelativeTime(now - ms, now);

describe("formatPrice", () => {
  it("renders two decimals and the currency", () => {
    expect(formatPrice(120)).toBe("120.00 EUR");
  });
});

describe("formatRelativeTime", () => {
  it("collapses the last minute to 'just now'", () => {
    expect(ago(0)).toBe("just now");
    expect(ago(59_000)).toBe("just now");
  });

  it("counts minutes, hours and days", () => {
    expect(ago(MINUTE)).toBe("1m ago");
    expect(ago(59 * MINUTE)).toBe("59m ago");
    expect(ago(HOUR)).toBe("1h ago");
    expect(ago(23 * HOUR)).toBe("23h ago");
    expect(ago(DAY)).toBe("1d ago");
    expect(ago(6 * DAY)).toBe("6d ago");
  });

  it("falls back to the absolute date beyond a week", () => {
    const old = now - 7 * DAY;
    expect(formatRelativeTime(old, now)).toBe(formatDate(old));
  });

  it("uses a caller-supplied absolute formatter past the cutoff", () => {
    const old = now - 30 * DAY;
    expect(formatRelativeTime(old, now, () => "long ago")).toBe("long ago");
    expect(formatRelativeTime(now - HOUR, now, () => "long ago")).toBe("1h ago");
  });

  it("falls back to the absolute date for future timestamps", () => {
    const future = now + HOUR;
    expect(formatRelativeTime(future, now)).toBe(formatDate(future));
  });
});
