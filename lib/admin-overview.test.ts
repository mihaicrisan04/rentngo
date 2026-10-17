import { describe, expect, it } from "vitest";
import {
  UPCOMING_WINDOW_HOURS,
  getDayLabel,
  getUpcomingWindow,
} from "./admin-overview";

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

const now = new Date(2026, 7, 6, 14, 30, 0).getTime();
const midnight = new Date(2026, 7, 6, 0, 0, 0).getTime();

describe("getUpcomingWindow", () => {
  it("opens at midnight so earlier-today events stay visible", () => {
    expect(getUpcomingWindow(now).from).toBe(midnight);
  });

  it("closes the default window 48h after now", () => {
    expect(getUpcomingWindow(now).to).toBe(now + UPCOMING_WINDOW_HOURS * HOUR);
  });

  it("honours a custom window length", () => {
    expect(getUpcomingWindow(now, 12).to).toBe(now + 12 * HOUR);
  });
});

describe("getDayLabel", () => {
  it("names the adjacent days", () => {
    expect(getDayLabel(now, now)).toBe("Today");
    expect(getDayLabel(midnight, now)).toBe("Today");
    expect(getDayLabel(now + DAY, now)).toBe("Tomorrow");
    expect(getDayLabel(now - DAY, now)).toBe("Yesterday");
  });

  it("falls back to an absolute date further out", () => {
    expect(getDayLabel(now + 3 * DAY, now)).toBe(
      new Date(now + 3 * DAY).toLocaleDateString(),
    );
  });
});
