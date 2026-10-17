import { describe, expect, it, vi } from "vitest";
import type { MutationCtx } from "./_generated/server";
import {
  nextBookingNumber,
  reservationNumberCounter,
  transferNumberCounter,
} from "./counters";

function createContext({
  counter,
  latest,
}: {
  counter?: { _id: string; value: number };
  latest?: Record<string, number>;
}) {
  const unique = vi.fn().mockResolvedValue(counter ?? null);
  const first = vi.fn().mockResolvedValue(latest ?? null);
  const query = vi.fn((table: string) => ({
    withIndex: vi.fn(() =>
      table === "counters" ? { unique } : { order: vi.fn(() => ({ first })) },
    ),
  }));
  const patch = vi.fn().mockResolvedValue(undefined);
  const insert = vi.fn().mockResolvedValue("counter-id");

  return {
    ctx: { db: { query, patch, insert } } as unknown as MutationCtx,
    first,
    insert,
    patch,
    query,
  };
}

describe("nextBookingNumber", () => {
  it("increments an existing counter without reading the bookings table", async () => {
    const { ctx, patch, query } = createContext({
      counter: { _id: "counter-id", value: 10020 },
    });

    await expect(
      nextBookingNumber(ctx, reservationNumberCounter),
    ).resolves.toBe(10021);
    expect(patch).toHaveBeenCalledWith("counter-id", { value: 10021 });
    expect(query).toHaveBeenCalledTimes(1);
  });

  it("initializes a reservation counter from the latest issued number", async () => {
    const { ctx, insert } = createContext({
      latest: { reservationNumber: 10020 },
    });

    await expect(
      nextBookingNumber(ctx, reservationNumberCounter),
    ).resolves.toBe(10021);
    expect(insert).toHaveBeenCalledWith("counters", {
      name: "reservationNumber",
      value: 10021,
    });
  });

  it("uses the transfer seed when no transfer number exists", async () => {
    const { ctx, insert } = createContext({});

    await expect(nextBookingNumber(ctx, transferNumberCounter)).resolves.toBe(
      1,
    );
    expect(insert).toHaveBeenCalledWith("counters", {
      name: "transferNumber",
      value: 1,
    });
  });
});
