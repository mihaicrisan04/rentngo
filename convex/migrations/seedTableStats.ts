import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import type { MutationCtx } from "../_generated/server";
import { getTableStats, type StatsTable } from "../tableStats";
import {
  applyInsert,
  emptyTableStats,
  type TableStatsValue,
} from "../lib/tableStats";

/**
 * Seeds (or reconciles) the maintained all-time aggregates in `tableStats`
 * by recounting reservations, transfers, and vehicles.
 *
 * Idempotent: every run recomputes exact totals and per-status counts and
 * upserts the singleton doc per table, so it is safe to re-run at any time —
 * including as a reconciliation step if drift is ever suspected.
 *
 * Run AFTER deploying the code that maintains the aggregates. Until this has
 * run, mutations skip the aggregate writes and the dashboard queries fall
 * back to their previous scans, so ordering stays exact either way.
 *
 * Usage: npx convex run migrations/seedTableStats
 */

const statsValueValidator = v.object({
  total: v.number(),
  byStatus: v.record(v.string(), v.number()),
});

async function recountTable(
  ctx: MutationCtx,
  table: StatsTable,
): Promise<TableStatsValue> {
  let stats = emptyTableStats();
  for await (const doc of ctx.db.query(table)) {
    stats = applyInsert(stats, doc.status);
  }
  return stats;
}

export default internalMutation({
  args: {},
  returns: v.object({
    reservations: statsValueValidator,
    transfers: statsValueValidator,
    vehicles: statsValueValidator,
  }),
  handler: async (ctx) => {
    const tables = ["reservations", "transfers", "vehicles"] as const;
    const result = {} as Record<StatsTable, TableStatsValue>;

    for (const table of tables) {
      const stats = await recountTable(ctx, table);
      const existing = await getTableStats(ctx, table);
      if (existing) {
        await ctx.db.patch(existing._id, stats);
      } else {
        await ctx.db.insert("tableStats", { table, ...stats });
      }
      result[table] = stats;
      console.log(
        `Seeded tableStats for ${table}: total=${stats.total}, byStatus=${JSON.stringify(stats.byStatus)}`,
      );
    }

    return result;
  },
});
