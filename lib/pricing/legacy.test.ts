import { describe, expect, it } from "vitest";
import { extractLegacyExtras } from "./legacy";

/**
 * TRANSITIONAL path for pre-RNGO-17 clients, which send extras only as
 * localized prose line items mixed with the location-fee entries. The
 * server recomputes the fees itself, so it strips the fee entries from the
 * client array (head-first, matching the client's fixed push order:
 * pickup fee, return fee, then extras) and sums the remainder as extras.
 */
describe("extractLegacyExtras", () => {
  it("strips both fee entries and sums the remaining extras", () => {
    // Client pushed: pickup fee 10, return fee 120, snow chains 18, seat 18
    const result = extractLegacyExtras(
      [
        { description: "Taxă livrare (Cluj-Napoca)", amount: 10 },
        { description: "Taxă returnare (Sibiu)", amount: 120 },
        { description: "Lanțuri de zăpadă", amount: 18 },
        { description: "Scaun copil", amount: 18 },
      ],
      10,
      120,
    );
    expect(result.extrasTotal).toBe(36);
    expect(result.ambiguousFeeMatch).toBe(false);
    expect(result.droppedInvalidAmounts).toBe(false);
  });

  it("keeps an extra that merely equals a fee amount (head-first matching)", () => {
    // The €10 pickup fee sits at the head (the client always pushes fees
    // first), so the €10 extra later in the array survives — equal amounts
    // don't collide when the order is honest
    const result = extractLegacyExtras(
      [
        { description: "Taxă livrare (Cluj-Napoca)", amount: 10 },
        { description: "Extra 100 km", amount: 10 },
      ],
      10,
      0,
    );
    expect(result.extrasTotal).toBe(10);
    expect(result.ambiguousFeeMatch).toBe(false);
  });

  it("flags an out-of-position fee match as ambiguous (best effort)", () => {
    // The head entry (18) is not the fee, but a later entry equals the fee
    // amount — it is removed (best effort) and flagged so the server logs
    // it: with amount-only matching we can't tell a displaced fee entry
    // from a real extra that happens to cost the same
    const result = extractLegacyExtras(
      [
        { description: "Lanțuri de zăpadă", amount: 18 },
        { description: "Taxă livrare (Cluj-Napoca)", amount: 10 },
      ],
      10,
      0,
    );
    expect(result.extrasTotal).toBe(18);
    expect(result.ambiguousFeeMatch).toBe(true);
  });

  it("tolerates a missing fee entry (server still charges its own fee)", () => {
    // Client omitted the fee line entirely → nothing is stripped, extras
    // sum unchanged; the caller's total-mismatch warn covers the drift
    const result = extractLegacyExtras(
      [{ description: "Lanțuri de zăpadă", amount: 18 }],
      10,
      0,
    );
    expect(result.extrasTotal).toBe(18);
    expect(result.ambiguousFeeMatch).toBe(false);
  });

  it("never lets invalid amounts lower the total", () => {
    // Negative or non-finite client amounts are dropped, not summed — a
    // tampered legacy client cannot subtract from the authoritative total
    const result = extractLegacyExtras(
      [
        { description: "haxx", amount: -500 },
        { description: "Lanțuri de zăpadă", amount: 18 },
        { description: "nan", amount: NaN },
      ],
      0,
      0,
    );
    expect(result.extrasTotal).toBe(18);
    expect(result.droppedInvalidAmounts).toBe(true);
  });

  it("returns 0 extras for an empty or fee-only array", () => {
    expect(extractLegacyExtras([], 10, 0).extrasTotal).toBe(0);
    expect(
      extractLegacyExtras([{ description: "fee", amount: 10 }], 10, 0)
        .extrasTotal,
    ).toBe(0);
  });
});
