export interface TableStatsValue {
  total: number;
  byStatus: Record<string, number>;
}

export function emptyTableStats(): TableStatsValue {
  return { total: 0, byStatus: {} };
}

function withStatusDelta(
  byStatus: Record<string, number>,
  status: string,
  delta: number,
): Record<string, number> {
  return {
    ...byStatus,
    [status]: Math.max(0, (byStatus[status] ?? 0) + delta),
  };
}

export function applyInsert(
  stats: TableStatsValue,
  status: string,
): TableStatsValue {
  return {
    total: stats.total + 1,
    byStatus: withStatusDelta(stats.byStatus, status, 1),
  };
}

export function applyRemove(
  stats: TableStatsValue,
  status: string,
): TableStatsValue {
  return {
    total: Math.max(0, stats.total - 1),
    byStatus: withStatusDelta(stats.byStatus, status, -1),
  };
}

export function applyStatusChange(
  stats: TableStatsValue,
  from: string,
  to: string,
): TableStatsValue {
  if (from === to) {
    return stats;
  }

  return {
    total: stats.total,
    byStatus: withStatusDelta(withStatusDelta(stats.byStatus, from, -1), to, 1),
  };
}
