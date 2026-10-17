// TRANSITIONAL — delete when RNGO-17 lands.
//
// Pre-RNGO-17 clients send physical extras only as localized prose
// `additionalCharges` line items, mixed with the location-fee entries. The
// server recomputes fees itself, so to keep the stored total reconciling it
// must strip the fee entries from the client array and treat the remainder
// as the extras total. Once the reservation page sends the structured
// `extras` arg, this whole path (and file) goes away.

export interface LegacyChargeInput {
  description?: string;
  amount: number;
}

export interface LegacyExtrasResult {
  /** Sum of the non-fee line items (never negative). */
  extrasTotal: number;
  /**
   * True when a fee entry was matched by amount somewhere other than the
   * head of the array — the known legacy client always pushes fees first,
   * so an out-of-position match may have consumed a real extra that merely
   * equals the fee (e.g. a €10 extra vs the €10 Cluj-Napoca fee).
   */
  ambiguousFeeMatch: boolean;
  /** True when negative/non-finite amounts were dropped from the sum. */
  droppedInvalidAmounts: boolean;
}

/**
 * Remove the location-fee entries from a legacy client charge array and sum
 * the rest as the extras total.
 *
 * The legacy client pushes charges in a fixed order — pickup fee, return
 * fee, then extras — so fees are matched head-first (exact for honest
 * clients even when an extra equals a fee amount). An out-of-position
 * amount match is still removed (best effort) but flagged ambiguous so the
 * caller can log it. Invalid (negative/non-finite) amounts never lower the
 * total: they are dropped and flagged.
 */
export function extractLegacyExtras(
  charges: LegacyChargeInput[],
  deliveryFee: number,
  returnFee: number,
): LegacyExtrasResult {
  const remaining = [...charges];
  let ambiguousFeeMatch = false;

  for (const fee of [deliveryFee, returnFee]) {
    if (fee <= 0) continue;
    if (remaining.length > 0 && remaining[0].amount === fee) {
      remaining.shift();
      continue;
    }
    const index = remaining.findIndex((c) => c.amount === fee);
    if (index !== -1) {
      remaining.splice(index, 1);
      ambiguousFeeMatch = true;
    }
    // No match at all: the client omitted (or altered) the fee entry. The
    // server's own fee is still charged; the caller's total-mismatch warn
    // covers the drift.
  }

  let extrasTotal = 0;
  let droppedInvalidAmounts = false;
  for (const charge of remaining) {
    if (!Number.isFinite(charge.amount) || charge.amount < 0) {
      droppedInvalidAmounts = true;
      continue;
    }
    extrasTotal += charge.amount;
  }

  return { extrasTotal, ambiguousFeeMatch, droppedInvalidAmounts };
}
