import { describe, expect, test } from "vitest";
import {
  applyInsert,
  applyRemove,
  applyStatusChange,
  emptyTableStats,
  type TableStatsValue,
} from "./tableStats";

describe("table stats deltas", () => {
  test("insert increments total and the status count", () => {
    const stats = applyInsert(emptyTableStats(), "pending");

    expect(stats).toEqual({ total: 1, byStatus: { pending: 1 } });
  });

  test("status change moves one count between statuses", () => {
    let stats = applyInsert(emptyTableStats(), "pending");
    stats = applyStatusChange(stats, "pending", "confirmed");

    expect(stats).toEqual({
      total: 1,
      byStatus: { pending: 0, confirmed: 1 },
    });
  });

  test("status change to the same status is a no-op", () => {
    const stats = applyInsert(emptyTableStats(), "confirmed");

    expect(applyStatusChange(stats, "confirmed", "confirmed")).toEqual(stats);
  });

  test("remove decrements total and the status count", () => {
    let stats = applyInsert(emptyTableStats(), "pending");
    stats = applyInsert(stats, "confirmed");
    stats = applyRemove(stats, "pending");

    expect(stats).toEqual({
      total: 1,
      byStatus: { pending: 0, confirmed: 1 },
    });
  });

  test("counts clamp at zero instead of going negative", () => {
    const stats = applyRemove(
      applyStatusChange(emptyTableStats(), "pending", "confirmed"),
      "cancelled",
    );

    expect(stats).toEqual({
      total: 0,
      byStatus: { pending: 0, confirmed: 1, cancelled: 0 },
    });
  });

  test("does not mutate its input", () => {
    const stats = emptyTableStats();
    applyInsert(stats, "pending");
    applyRemove(stats, "pending");
    applyStatusChange(stats, "pending", "confirmed");

    expect(stats).toEqual({ total: 0, byStatus: {} });
  });

  test("a booking lifecycle reconciles with a recount", () => {
    type Event =
      | { kind: "insert"; id: number; status: string }
      | { kind: "setStatus"; id: number; status: string }
      | { kind: "delete"; id: number };

    const events: Event[] = [
      { kind: "insert", id: 1, status: "pending" },
      { kind: "insert", id: 2, status: "pending" },
      { kind: "setStatus", id: 1, status: "confirmed" },
      { kind: "insert", id: 3, status: "pending" },
      { kind: "setStatus", id: 2, status: "cancelled" },
      { kind: "setStatus", id: 1, status: "completed" },
      { kind: "delete", id: 2 },
      { kind: "setStatus", id: 3, status: "confirmed" },
      { kind: "insert", id: 4, status: "pending" },
      { kind: "setStatus", id: 3, status: "cancelled" },
      { kind: "setStatus", id: 3, status: "confirmed" },
      { kind: "delete", id: 1 },
    ];

    const docs = new Map<number, string>();
    let stats = emptyTableStats();

    for (const event of events) {
      if (event.kind === "insert") {
        docs.set(event.id, event.status);
        stats = applyInsert(stats, event.status);
      } else if (event.kind === "setStatus") {
        const from = docs.get(event.id);
        if (from === undefined) throw new Error("unknown doc");
        docs.set(event.id, event.status);
        stats = applyStatusChange(stats, from, event.status);
      } else {
        const status = docs.get(event.id);
        if (status === undefined) throw new Error("unknown doc");
        docs.delete(event.id);
        stats = applyRemove(stats, status);
      }
    }

    const recount: TableStatsValue = emptyTableStats();
    for (const status of docs.values()) {
      recount.total += 1;
      recount.byStatus[status] = (recount.byStatus[status] ?? 0) + 1;
    }

    expect(stats.total).toBe(recount.total);
    for (const [status, count] of Object.entries(stats.byStatus)) {
      expect(count).toBe(recount.byStatus[status] ?? 0);
    }
  });
});
