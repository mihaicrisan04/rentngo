/**
 * Coupon discount math — the pure half of the coupon feature, shared by the
 * advisory `validateCoupon` query and the atomic redemption inside
 * createReservation/createTransfer. Per-user and redemption-count writes need
 * the database and live in convex/coupons.ts; everything money-shaped is here.
 *
 * Single-discount seam (owner decision, RNGO-25): a booking carries at most
 * ONE discount. `AppliedDiscount.source` is the extension point and
 * `pickDiscount` defines the precedence: an explicitly entered coupon code
 * beats an automatic affiliate discount (owner decision, RNGO-26). Affiliate
 * math (tier resolution, referred discount) lives in ./affiliate.ts.
 */

export type DiscountSource = "coupon" | "affiliate";

export interface AppliedDiscount {
  source: DiscountSource;
  code: string;
  amount: number; // EUR, >= 0, never exceeds the pre-discount total
}

/**
 * Choose the single discount to apply. Explicit coupon codes take precedence
 * over any other (future automatic) source; among equals the first wins.
 */
export function pickDiscount(
  candidates: Array<AppliedDiscount | null | undefined>,
): AppliedDiscount | null {
  const present = candidates.filter((d): d is AppliedDiscount => !!d);
  return present.find((d) => d.source === "coupon") ?? present[0] ?? null;
}

export type CouponBookingType = "rentals" | "transfers";

/** The subset of a coupon document the pure checks need. */
export interface CouponData {
  discountType: "percentage" | "fixed";
  discountValue: number;
  expiresAt?: number;
  maxRedemptions?: number;
  redemptionCount: number;
  minOrderValue?: number;
  appliesTo: CouponBookingType | "both";
  isActive: boolean;
}

/**
 * Rejection reasons for the pure checks. The DB layer adds "notFound" and
 * "alreadyUsed" (which need a lookup / the redemptions table).
 */
export type CouponInvalidReason =
  | "inactive"
  | "expired"
  | "exhausted"
  | "wrongBookingType"
  | "belowMinimum";

export type CouponEvaluation =
  | { valid: true; discountAmount: number }
  | { valid: false; reason: CouponInvalidReason };

const round2 = (value: number) => Math.round(value * 100) / 100;

/** Codes are case-insensitive: stored and compared uppercase + trimmed. */
export function normalizeCouponCode(code: string): string {
  return code.trim().toUpperCase();
}

/** Guest per-user enforcement keys off the normalized booking email. */
export function normalizeCustomerEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * True when the once-per-user check has a real identity to key off: a user
 * account, or a non-empty normalized email. Redemption MUST be refused
 * otherwise — the booking mutations accept any string for the customer email,
 * so an empty/whitespace email would let a guest bypass the per-user limit by
 * simply leaving the field blank on every booking.
 */
export function hasCouponIdentity(identity: {
  userId?: string;
  email?: string;
}): boolean {
  return (
    identity.userId !== undefined ||
    normalizeCustomerEmail(identity.email ?? "").length > 0
  );
}

/**
 * EUR discount for a subtotal, rounded to cents. Fixed amounts clamp to the
 * subtotal so the discounted total can never go negative; percentages are
 * validated to (0, 100] at coupon creation.
 */
export function computeCouponDiscount(
  subtotal: number,
  discountType: "percentage" | "fixed",
  discountValue: number,
): number {
  if (subtotal <= 0) return 0;
  const raw =
    discountType === "percentage"
      ? (subtotal * discountValue) / 100
      : discountValue;
  return round2(Math.min(Math.max(raw, 0), subtotal));
}

/** Pre-discount total minus the discount, floored at 0. */
export function applyDiscountToTotal(
  total: number,
  discountAmount: number,
): number {
  return round2(Math.max(0, total - discountAmount));
}

/**
 * Run every check that needs only the coupon doc and the order context.
 * `subtotal` is always the server-recomputed authoritative total — a
 * client-sent number is only ever used for the advisory preview.
 */
export function evaluateCoupon(
  coupon: CouponData,
  context: { bookingType: CouponBookingType; subtotal: number; now: number },
): CouponEvaluation {
  if (!coupon.isActive) {
    return { valid: false, reason: "inactive" };
  }
  if (coupon.expiresAt !== undefined && context.now > coupon.expiresAt) {
    return { valid: false, reason: "expired" };
  }
  if (
    coupon.maxRedemptions !== undefined &&
    coupon.redemptionCount >= coupon.maxRedemptions
  ) {
    return { valid: false, reason: "exhausted" };
  }
  if (coupon.appliesTo !== "both" && coupon.appliesTo !== context.bookingType) {
    return { valid: false, reason: "wrongBookingType" };
  }
  if (
    coupon.minOrderValue !== undefined &&
    context.subtotal < coupon.minOrderValue
  ) {
    return { valid: false, reason: "belowMinimum" };
  }
  return {
    valid: true,
    discountAmount: computeCouponDiscount(
      context.subtotal,
      coupon.discountType,
      coupon.discountValue,
    ),
  };
}

// ---------------------------------------------------------------------------
// Expiry timezone: "valid until date D" means through 23:59:59.999 of D in
// Europe/Bucharest (owner default). Romania follows the EU DST rule — clocks
// go UTC+2 → UTC+3 on the last Sunday of March at 01:00 UTC and back on the
// last Sunday of October at 01:00 UTC — computed here with plain date math so
// the module stays free of Intl/timezone-database dependencies.
// ---------------------------------------------------------------------------

function lastSundayOfMonthUtcMs(year: number, monthIndex: number): number {
  const lastDayMs = Date.UTC(year, monthIndex + 1, 0, 1, 0, 0);
  const lastDay = new Date(lastDayMs);
  return Date.UTC(
    year,
    monthIndex,
    lastDay.getUTCDate() - lastDay.getUTCDay(),
    1,
    0,
    0,
  );
}

function bucharestOffsetHours(utcMs: number): number {
  const year = new Date(utcMs).getUTCFullYear();
  const dstStart = lastSundayOfMonthUtcMs(year, 2); // last Sunday of March
  const dstEnd = lastSundayOfMonthUtcMs(year, 9); // last Sunday of October
  return utcMs >= dstStart && utcMs < dstEnd ? 3 : 2;
}

/**
 * UTC ms timestamp for 23:59:59.999 of `dateString` ("YYYY-MM-DD") in
 * Europe/Bucharest. Used when the admin picks an expiry date; comparison at
 * validation time is then a plain `now > expiresAt`.
 */
export function bucharestEndOfDayMs(dateString: string): number {
  const endOfDayAsUtc = Date.parse(`${dateString}T23:59:59.999Z`);
  if (Number.isNaN(endOfDayAsUtc)) {
    throw new Error(`Invalid expiry date: ${dateString}`);
  }
  // The offset is sampled ~22:00 UTC on the same day; Romania's DST switches
  // happen at 01:00 UTC, so the sample can never straddle a transition.
  return endOfDayAsUtc - bucharestOffsetHours(endOfDayAsUtc) * 3_600_000;
}
