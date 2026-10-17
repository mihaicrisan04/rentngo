import { afterEach, describe, expect, it, vi } from "vitest";
import { createLocalStorage, isStaleSearch } from "./create-local-storage";

const now = new Date(2026, 9, 12, 15, 30);

describe("isStaleSearch", () => {
  it("keeps a search starting today or later", () => {
    expect(
      isStaleSearch([new Date(2026, 9, 12), new Date(2026, 9, 15)], now),
    ).toBe(false);
  });

  it("drops a search whose pickup is already past", () => {
    expect(
      isStaleSearch([new Date(2026, 8, 20), new Date(2026, 8, 23)], now),
    ).toBe(true);
  });

  it("drops a search that ended before today even with a missing date", () => {
    expect(isStaleSearch([undefined, new Date(2026, 9, 11)], now)).toBe(true);
  });

  it("is not stale without dates", () => {
    expect(isStaleSearch([undefined, undefined], now)).toBe(false);
  });
});

describe("createLocalStorage load", () => {
  interface Saved {
    location?: string;
    pickupDate?: Date;
    returnDate?: Date;
  }

  function storageWith(saved: Record<string, unknown>) {
    const store = new Map([["test", JSON.stringify(saved)]]);
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
      removeItem: (key: string) => store.delete(key),
    });
    return createLocalStorage<Saved>({
      key: "test",
      label: "test",
      dateFields: ["pickupDate", "returnDate"],
      fallback: () => ({}),
      applyDefaults: (parsed) => parsed,
    });
  }

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("drops both dates of a stale search and keeps the other fields", () => {
    vi.useFakeTimers({ now });
    const loaded = storageWith({
      location: "Aeroport",
      pickupDate: new Date(2026, 9, 1).toISOString(),
      returnDate: new Date(2026, 9, 20).toISOString(),
    }).load();
    expect(loaded).toEqual({
      location: "Aeroport",
      pickupDate: undefined,
      returnDate: undefined,
    });
  });

  it("keeps a search that is still ahead", () => {
    vi.useFakeTimers({ now });
    const pickup = new Date(2026, 9, 14);
    const loaded = storageWith({ pickupDate: pickup.toISOString() }).load();
    expect(loaded.pickupDate).toEqual(pickup);
  });
});
