/**
 * Wallet credit math — the pure half of the referral wallet (RNGO-50 phase 1).
 * The ledger itself (`walletTransactions`) is append-only and has no
 * denormalized balance: every number a user sees is derived here from their
 * transactions, so a credit expiring is a `expiresAt > now` comparison rather
 * than a cron that has to run on time.
 *
 * Redemption is a PAYMENT, not a discount: it is applied after `pickDiscount`
 * and is capped at `maxRedemptionPercent` of the post-discount total, so a
 * booking's `totalPrice` stays the pre-credit price.
 */

const round2 = (value: number) => Math.round(value * 100) / 100;

export type WalletTransactionKind =
  | "referralCredit"
  | "manualAdjustment"
  | "redemption"
  | "redemptionReversal";

/** The subset of a `walletTransactions` document the pure math needs. */
export interface WalletTransactionData {
  id: string;
  kind: WalletTransactionKind;
  /** EUR, signed: credits and reversals positive, redemptions negative. */
  amount: number;
  /** Only set on credit-granting rows; absent means it never expires. */
  expiresAt?: number;
  createdAt: number;
}

/** A credit-granting transaction with the part of it still unspent. */
export interface WalletCredit {
  id: string;
  remaining: number;
  expiresAt?: number;
  createdAt: number;
}

export interface WalletAllocation {
  creditId: string;
  amount: number;
}

export interface WalletAllocationResult {
  allocations: WalletAllocation[];
  allocated: number;
  /** Requested minus allocated; > 0 means the wallet could not cover it. */
  unallocated: number;
}

function isCreditKind(kind: WalletTransactionKind): boolean {
  return kind === "referralCredit" || kind === "manualAdjustment";
}

/** Soonest-expiring first; never-expiring last; ties broken by age. */
function byExpiryThenAge(a: WalletCredit, b: WalletCredit): number {
  const aExpiry = a.expiresAt ?? Number.POSITIVE_INFINITY;
  const bExpiry = b.expiresAt ?? Number.POSITIVE_INFINITY;
  return aExpiry === bExpiry ? a.createdAt - b.createdAt : aExpiry - bExpiry;
}

/**
 * Spend `amount` across `credits`, consuming the soonest-expiring first so a
 * user never loses value they could have used. Pure: the inputs are not
 * mutated, and the caller decides what to persist.
 */
export function allocateRedemption(
  credits: WalletCredit[],
  amount: number,
): WalletAllocationResult {
  const allocations: WalletAllocation[] = [];
  let left = round2(Math.max(0, amount));
  let allocated = 0;

  for (const credit of [...credits].sort(byExpiryThenAge)) {
    if (left <= 0) break;
    const take = round2(Math.min(credit.remaining, left));
    if (take <= 0) continue;
    allocations.push({ creditId: credit.id, amount: take });
    allocated = round2(allocated + take);
    left = round2(left - take);
  }

  return { allocations, allocated, unallocated: left };
}

/**
 * Credits with their unspent part, soonest-expiring first. Past redemptions
 * are replayed through the same FIFO rule used to spend them, so an expiring
 * credit takes its already-spent part with it instead of leaving a phantom
 * debt behind.
 */
export function computeRemainingCredits(
  transactions: WalletTransactionData[],
  now: number,
): WalletCredit[] {
  const credits: WalletCredit[] = [];
  let spent = 0;

  for (const txn of transactions) {
    if (isCreditKind(txn.kind) && txn.amount > 0) {
      credits.push({
        id: txn.id,
        remaining: txn.amount,
        expiresAt: txn.expiresAt,
        createdAt: txn.createdAt,
      });
    } else {
      spent = round2(spent - txn.amount);
    }
  }

  const { allocations } = allocateRedemption(credits, Math.max(0, spent));
  const spentByCredit = new Map<string, number>();
  for (const allocation of allocations) {
    spentByCredit.set(allocation.creditId, allocation.amount);
  }

  return credits
    .map((credit) => ({
      ...credit,
      remaining: round2(credit.remaining - (spentByCredit.get(credit.id) ?? 0)),
    }))
    .filter(
      (credit) =>
        credit.remaining > 0 &&
        (credit.expiresAt === undefined || credit.expiresAt > now),
    )
    .sort(byExpiryThenAge);
}

/** Spendable EUR right now: unspent, unexpired credit. Never negative. */
export function computeAvailableBalance(
  transactions: WalletTransactionData[],
  now: number,
): number {
  const total = computeRemainingCredits(transactions, now).reduce(
    (sum, credit) => sum + credit.remaining,
    0,
  );
  return round2(Math.max(0, total));
}

/**
 * How much of `balance` may be spent on a booking: the admin-configured
 * percentage cap of the total AFTER any discount, since credit is a payment
 * towards what is still owed.
 */
export function computeRedeemable(
  balance: number,
  totalAfterDiscount: number,
  maxRedemptionPercent: number,
): number {
  if (balance <= 0 || totalAfterDiscount <= 0 || maxRedemptionPercent <= 0) {
    return 0;
  }
  const cap = (totalAfterDiscount * Math.min(maxRedemptionPercent, 100)) / 100;
  return round2(Math.max(0, Math.min(balance, cap)));
}

/**
 * Credit minted for the referrer when a conversion is approved: the tier
 * percent resolved at approval time applied to the referred booking's
 * persisted total.
 */
export function computeCreditForConversion(
  bookingTotal: number,
  rewardPercent: number,
): number {
  if (bookingTotal <= 0 || rewardPercent <= 0) return 0;
  const raw = (bookingTotal * Math.min(rewardPercent, 100)) / 100;
  return round2(Math.min(raw, bookingTotal));
}

/**
 * Expiry timestamp for a credit minted at `approvedAt`. Month arithmetic is
 * done in UTC and clamps the day, so a credit minted on 31 January with a
 * one-month validity expires on 28/29 February rather than rolling into March.
 */
export function creditExpiry(
  approvedAt: number,
  creditValidityMonths: number,
): number {
  const granted = new Date(approvedAt);
  const targetMonth = granted.getUTCMonth() + creditValidityMonths;
  const daysInTargetMonth = new Date(
    Date.UTC(granted.getUTCFullYear(), targetMonth + 1, 0),
  ).getUTCDate();
  return Date.UTC(
    granted.getUTCFullYear(),
    targetMonth,
    Math.min(granted.getUTCDate(), daysInTargetMonth),
    granted.getUTCHours(),
    granted.getUTCMinutes(),
    granted.getUTCSeconds(),
    granted.getUTCMilliseconds(),
  );
}
