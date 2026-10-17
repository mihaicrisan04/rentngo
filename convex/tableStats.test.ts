import { describe, expect, it, vi } from "vitest";
import type { MutationCtx } from "./_generated/server";
import {
  recordStatsInsert,
  recordStatsRemove,
  recordStatsStatusChange,
} from "./tableStats";

function createContext(doc?: {
  _id: string;
  total: number;
  byStatus: Record<string, number>;
}) {
  const unique = vi.fn().mockResolvedValue(doc ?? null);
  const query = vi.fn(() => ({
    withIndex: vi.fn(() => ({ unique })),
  }));
  const patch = vi.fn().mockResolvedValue(undefined);
  const insert = vi.fn().mockResolvedValue("stats-id");

  return {
    ctx: { db: { query, patch, insert } } as unknown as MutationCtx,
    insert,
    patch,
  };
}

describe("table stats maintenance", () => {
  it("no-ops before the aggregate doc is seeded", async () => {
    const { ctx, insert, patch } = createContext();

    await recordStatsInsert(ctx, "reservations", "pending");
    await recordStatsRemove(ctx, "reservations", "pending");
    await recordStatsStatusChange(ctx, "reservations", "pending", "confirmed");

    expect(patch).not.toHaveBeenCalled();
    expect(insert).not.toHaveBeenCalled();
  });

  it("patches the seeded doc on insert", async () => {
    const { ctx, patch } = createContext({
      _id: "stats-id",
      total: 5,
      byStatus: { pending: 2, confirmed: 3 },
    });

    await recordStatsInsert(ctx, "reservations", "pending");

    expect(patch).toHaveBeenCalledWith("stats-id", {
      total: 6,
      byStatus: { pending: 3, confirmed: 3 },
    });
  });

  it("patches the seeded doc on status change", async () => {
    const { ctx, patch } = createContext({
      _id: "stats-id",
      total: 5,
      byStatus: { pending: 2, confirmed: 3 },
    });

    await recordStatsStatusChange(ctx, "transfers", "pending", "cancelled");

    expect(patch).toHaveBeenCalledWith("stats-id", {
      total: 5,
      byStatus: { pending: 1, confirmed: 3, cancelled: 1 },
    });
  });

  it("patches the seeded doc on remove", async () => {
    const { ctx, patch } = createContext({
      _id: "stats-id",
      total: 5,
      byStatus: { available: 4, maintenance: 1 },
    });

    await recordStatsRemove(ctx, "vehicles", "maintenance");

    expect(patch).toHaveBeenCalledWith("stats-id", {
      total: 4,
      byStatus: { available: 4, maintenance: 0 },
    });
  });
});
