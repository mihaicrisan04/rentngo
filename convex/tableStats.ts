import type { Doc } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import {
  applyInsert,
  applyRemove,
  applyStatusChange,
  type TableStatsValue,
} from "./lib/tableStats";

export type StatsTable = "reservations" | "transfers" | "vehicles";

export async function getTableStats(
  ctx: QueryCtx | MutationCtx,
  table: StatsTable,
): Promise<Doc<"tableStats"> | null> {
  return await ctx.db
    .query("tableStats")
    .withIndex("by_table", (q) => q.eq("table", table))
    .unique();
}

async function updateTableStats(
  ctx: MutationCtx,
  table: StatsTable,
  update: (stats: TableStatsValue) => TableStatsValue,
): Promise<void> {
  const doc = await getTableStats(ctx, table);
  if (!doc) {
    // Not seeded yet (migrations/seedTableStats); readers fall back to scans,
    // so skipping the write keeps the eventual seed exact.
    return;
  }

  const { total, byStatus } = update({
    total: doc.total,
    byStatus: doc.byStatus,
  });
  await ctx.db.patch(doc._id, { total, byStatus });
}

export async function recordStatsInsert(
  ctx: MutationCtx,
  table: StatsTable,
  status: string,
): Promise<void> {
  await updateTableStats(ctx, table, (stats) => applyInsert(stats, status));
}

export async function recordStatsRemove(
  ctx: MutationCtx,
  table: StatsTable,
  status: string,
): Promise<void> {
  await updateTableStats(ctx, table, (stats) => applyRemove(stats, status));
}

export async function recordStatsStatusChange(
  ctx: MutationCtx,
  table: StatsTable,
  from: string,
  to: string,
): Promise<void> {
  await updateTableStats(ctx, table, (stats) =>
    applyStatusChange(stats, from, to),
  );
}
