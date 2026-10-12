import { describe, expect, it } from "vitest";
import { isStaleSearch } from "./create-local-storage";

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
