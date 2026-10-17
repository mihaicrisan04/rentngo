const MONTH_KEY_PATTERN = /^\d{4}-\d{2}$/;

export interface MonthlyStatsInput {
  timestamp: number;
  revenue: number;
}

export interface MonthlyStatsBucket {
  month: string;
  count: number;
  revenue: number;
}

interface TimestampRange {
  start: number;
  end: number;
}

export function validateContiguousTimestampRanges(
  ranges: TimestampRange[],
  expectedCount: number,
  maxDuration: number,
  rangeName: string,
): void {
  if (ranges.length !== expectedCount) {
    throw new Error(
      `Exactly ${expectedCount} ${rangeName} ranges are required`,
    );
  }

  for (const [index, range] of ranges.entries()) {
    if (
      !Number.isFinite(range.start) ||
      !Number.isFinite(range.end) ||
      !Number.isInteger(range.start) ||
      !Number.isInteger(range.end) ||
      range.start <= 0 ||
      range.end <= range.start ||
      range.end - range.start > maxDuration
    ) {
      throw new Error(
        `${rangeName} ranges must use positive finite integer timestamps within the maximum duration`,
      );
    }

    if (index > 0 && range.start !== ranges[index - 1].end) {
      throw new Error(`${rangeName} ranges must be ordered and contiguous`);
    }
  }
}

export function getMonthStart(timestamp: number): number {
  const date = new Date(timestamp);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1);
}

export function getMonthKey(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function getMonthRange(monthKey: string): {
  start: number;
  end: number;
} {
  if (!MONTH_KEY_PATTERN.test(monthKey)) {
    throw new Error(`Invalid month key: ${monthKey}`);
  }

  const [year, month] = monthKey.split("-").map(Number);
  if (month < 1 || month > 12) {
    throw new Error(`Invalid month key: ${monthKey}`);
  }

  return {
    start: Date.UTC(year, month - 1, 1),
    end: Date.UTC(year, month, 1),
  };
}

export function getRecentMonthKeys(now: number, count: number): string[] {
  const currentMonthStart = getMonthStart(now);
  const currentMonth = new Date(currentMonthStart);

  return Array.from({ length: count }, (_, index) =>
    getMonthKey(
      Date.UTC(
        currentMonth.getUTCFullYear(),
        currentMonth.getUTCMonth() - (count - index - 1),
        1,
      ),
    ),
  );
}

export function bucketMonthlyStats(
  items: MonthlyStatsInput[],
  now: number,
  monthCount: number,
): MonthlyStatsBucket[] {
  const buckets = new Map(
    getRecentMonthKeys(now, monthCount).map((month) => [
      month,
      { month, count: 0, revenue: 0 },
    ]),
  );

  for (const item of items) {
    const bucket = buckets.get(getMonthKey(item.timestamp));
    if (bucket) {
      bucket.count += 1;
      bucket.revenue += item.revenue;
    }
  }

  return [...buckets.values()];
}

export function calculateGrowth(
  current: number,
  previous: number,
  growthWhenPreviousIsZero = 0,
): number {
  if (previous === 0) {
    return current > 0 ? growthWhenPreviousIsZero : 0;
  }

  return Math.round(((current - previous) / previous) * 1000) / 10;
}
