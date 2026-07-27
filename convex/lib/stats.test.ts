import { describe, expect, test } from "vitest";
import {
  bucketMonthlyStats,
  calculateGrowth,
  getMonthKey,
  getMonthRange,
  getMonthStart,
  getRecentMonthKeys,
  validateContiguousTimestampRanges,
} from "./stats";

const DAY = 24 * 60 * 60 * 1000;

describe("stats month helpers", () => {
  test("uses UTC month boundaries", () => {
    const timestamp = Date.UTC(2026, 0, 31, 23, 59);

    expect(getMonthStart(timestamp)).toBe(Date.UTC(2026, 0, 1));
    expect(getMonthKey(timestamp)).toBe("2026-01");
    expect(getMonthRange("2026-01")).toEqual({
      start: Date.UTC(2026, 0, 1),
      end: Date.UTC(2026, 1, 1),
    });
  });

  test("handles year boundaries for recent months", () => {
    expect(getRecentMonthKeys(Date.UTC(2026, 1, 15), 4)).toEqual([
      "2025-11",
      "2025-12",
      "2026-01",
      "2026-02",
    ]);
  });

  test("rejects invalid month keys", () => {
    expect(() => getMonthRange("2026-13")).toThrow("Invalid month key");
  });
});

describe("stats calculations", () => {
  test("buckets counts and revenue while retaining empty months", () => {
    expect(
      bucketMonthlyStats(
        [
          { timestamp: Date.UTC(2026, 0, 5), revenue: 100.4 },
          { timestamp: Date.UTC(2026, 0, 20), revenue: 50.2 },
          { timestamp: Date.UTC(2026, 1, 1), revenue: 80 },
          { timestamp: Date.UTC(2025, 10, 1), revenue: 999 },
        ],
        Date.UTC(2026, 1, 10),
        3,
      ),
    ).toEqual([
      { month: "2025-12", count: 0, revenue: 0 },
      { month: "2026-01", count: 2, revenue: 150.60000000000002 },
      { month: "2026-02", count: 1, revenue: 80 },
    ]);
  });

  test("calculates rounded percentage growth and zero baselines", () => {
    expect(calculateGrowth(125, 100)).toBe(25);
    expect(calculateGrowth(2, 3)).toBe(-33.3);
    expect(calculateGrowth(10, 0)).toBe(0);
    expect(calculateGrowth(10, 0, 100)).toBe(100);
    expect(calculateGrowth(0, 0, 100)).toBe(0);
  });
});

describe("timestamp range validation", () => {
  test("accepts the exact count of ordered contiguous bounded ranges", () => {
    expect(() =>
      validateContiguousTimestampRanges(
        [
          { start: DAY, end: DAY * 2 },
          { start: DAY * 2, end: DAY * 3 },
        ],
        2,
        DAY,
        "Day",
      ),
    ).not.toThrow();
  });

  test("rejects an incorrect range count", () => {
    expect(() =>
      validateContiguousTimestampRanges(
        [{ start: DAY, end: DAY * 2 }],
        2,
        DAY,
        "Day",
      ),
    ).toThrow("Exactly 2 Day ranges are required");
  });

  test.each([
    { start: Number.NaN, end: DAY },
    { start: DAY + 0.5, end: DAY * 2 },
    { start: 0, end: DAY },
    { start: DAY, end: DAY },
    { start: DAY, end: DAY * 2 + 1 },
  ])("rejects invalid or oversized timestamps", (range) => {
    expect(() =>
      validateContiguousTimestampRanges([range], 1, DAY, "Day"),
    ).toThrow(
      "Day ranges must use positive finite integer timestamps within the maximum duration",
    );
  });

  test("rejects gaps and overlaps", () => {
    expect(() =>
      validateContiguousTimestampRanges(
        [
          { start: DAY, end: DAY * 2 },
          { start: DAY * 2 + 1, end: DAY * 3 },
        ],
        2,
        DAY,
        "Day",
      ),
    ).toThrow("Day ranges must be ordered and contiguous");
  });
});
