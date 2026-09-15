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
const floor2 = (value: number) => Math.floor(value * 100) / 100;

export type WalletTransactionKind =
  | "referralCredit"
  | "creditReversal"
  | "manualAdjustment"
  | "redemption"
  | "redemptionReversal";

/** The subset of a `walletTransactions` document the pure math needs. */
export interface WalletTransactionData {
  id: string;
  kind: WalletTransactionKind;
  /**
   * EUR, signed. Positive opens credit (`referralCredit`, a top-up
   * `manualAdjustment`, `redemptionReversal`); negative spends it
   * (`redemption`, `creditReversal`, a claw-back `manualAdjustment`).
   */
  amount: number;
  /** Only set on credit-opening rows; absent means it never expires. */
  expiresAt?: number;
  /** Ties a `creditReversal` to the `referralCredit` it undoes. */
  conversionId?: string;
  createdAt: number;
}

/** A credit-granting transaction with the part of it still unspent. */
export interface WalletCredit {
  id: string;
  remaining: number;
  expiresAt?: number;
  createdAt: number;
  conversionId?: string;
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

interface LedgerReplay {
  credits: WalletCredit[];
  /** Debits no open credit could absorb; never let them inflate a balance. */
  overdraft: number;
}

/** Spend `amount` over `pool`, mutating `remaining`; returns what was left. */
function drawDown(pool: WalletCredit[], amount: number): number {
  let left = round2(amount);
  for (const credit of pool) {
    if (left <= 0) break;
    const take = round2(Math.min(credit.remaining, left));
    if (take <= 0) continue;
    credit.remaining = round2(credit.remaining - take);
    left = round2(left - take);
  }
  return left;
}

/**
 * Replay the ledger in chronological order. Order is authoritative: a debit
 * may only draw on credit that already existed and had not yet lapsed when it
 * was recorded, so a spend made after a credit expired can never be charged
 * back to it. Phase 3 applies the same soonest-expiring-first rule when it
 * writes a redemption, which is what keeps the replay and the real allocation
 * in agreement.
 */
function replayLedger(transactions: WalletTransactionData[]): LedgerReplay {
  // Within the same millisecond credit lands before spend — you cannot spend
  // what has not been credited — and ids break the remaining ties so the
  // replay is deterministic.
  const ordered = [...transactions].sort(
    (a, b) =>
      a.createdAt - b.createdAt ||
      Number(a.amount <= 0) - Number(b.amount <= 0) ||
      a.id.localeCompare(b.id),
  );
  const credits: WalletCredit[] = [];
  let overdraft = 0;

  for (const txn of ordered) {
    if (txn.amount > 0) {
      credits.push({
        id: txn.id,
        remaining: txn.amount,
        expiresAt: txn.expiresAt,
        createdAt: txn.createdAt,
        conversionId: txn.conversionId,
      });
      continue;
    }

    const spendable = credits
      .filter(
        (credit) =>
          credit.remaining > 0 &&
          credit.createdAt <= txn.createdAt &&
          (credit.expiresAt === undefined || credit.expiresAt > txn.createdAt),
      )
      .sort(byExpiryThenAge);

    let left = -txn.amount;
    // A reversal undoes a specific credit, so it takes that credit's own
    // remaining first; whatever was already spent falls through as a debit.
    if (txn.kind === "creditReversal" && txn.conversionId !== undefined) {
      left = drawDown(
        spendable.filter((c) => c.conversionId === txn.conversionId),
        left,
      );
    }
    overdraft = round2(overdraft + drawDown(spendable, left));
  }

  return { credits, overdraft };
}

/** Credits with their unspent part, soonest-expiring first. */
export function computeRemainingCredits(
  transactions: WalletTransactionData[],
  now: number,
): WalletCredit[] {
  return replayLedger(transactions)
    .credits.filter(
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
  const { credits, overdraft } = replayLedger(transactions);
  const total = credits
    .filter(
      (credit) => credit.expiresAt === undefined || credit.expiresAt > now,
    )
    .reduce((sum, credit) => sum + credit.remaining, 0);
  return round2(Math.max(0, total - overdraft));
}

/**
 * What a conversion's credit is still worth on the ledger: the signed sum of
 * every row carrying its id (only credits and their reversals do). A void or a
 * rejection appends a reversal for exactly this amount, so once it reaches 0 a
 * repeated void writes nothing — and a re-approval may mint afresh, since the
 * conversion no longer holds anything.
 */
export function conversionCreditOutstanding(
  transactions: Pick<WalletTransactionData, "amount">[],
): number {
  return round2(transactions.reduce((sum, txn) => sum + txn.amount, 0));
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
  // Floored, not rounded: rounding up would let the credit exceed the cap.
  const cap = floor2(
    (totalAfterDiscount * Math.min(maxRedemptionPercent, 100)) / 100,
  );
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

/**
 * What a booking still costs after the wallet paid part of it. `totalPrice` on
 * a booking is always the PRE-credit price — credit is a payment, not a
 * discount — so this is the single definition of "amount due" shared by the
 * checkout, the confirmation pages and the emails.
 */
export function bookingAmountDue(
  totalPrice: number,
  walletCreditApplied?: number,
): number {
  return round2(Math.max(0, totalPrice - (walletCreditApplied ?? 0)));
}

/** One credit a redemption draws on, with the expiry it has to give back. */
export interface RedemptionEntry {
  creditId: string;
  amount: number;
  expiresAt?: number;
}

export interface RedemptionPlan {
  /** EUR actually redeemable — 0 when nothing may or can be spent. */
  amount: number;
  /** Per-credit split; the caller persists one debit row per entry. */
  entries: RedemptionEntry[];
}

/**
 * The whole redemption decision for one booking, kept pure so the cap, the
 * expiry rule and the per-credit split are testable without a database. The
 * caller supplies the user's full ledger; guests have no wallet and never get
 * here.
 */
export function planRedemption(input: {
  /** The client's `useWalletCredit` switch — advisory, never an amount. */
  requested: boolean;
  /** The wallet is part of the referral program and dies with it. */
  programEnabled: boolean;
  transactions: WalletTransactionData[];
  totalAfterDiscount: number;
  maxRedemptionPercent: number;
  now: number;
}): RedemptionPlan {
  if (!input.requested || !input.programEnabled) {
    return { amount: 0, entries: [] };
  }

  const redeemable = computeRedeemable(
    computeAvailableBalance(input.transactions, input.now),
    input.totalAfterDiscount,
    input.maxRedemptionPercent,
  );
  if (redeemable <= 0) return { amount: 0, entries: [] };

  const credits = computeRemainingCredits(input.transactions, input.now);
  const { allocations, allocated } = allocateRedemption(credits, redeemable);
  const expiryOf = new Map(credits.map((c) => [c.id, c.expiresAt]));

  return {
    amount: allocated,
    entries: allocations.map((allocation) => ({
      creditId: allocation.creditId,
      amount: allocation.amount,
      expiresAt: expiryOf.get(allocation.creditId),
    })),
  };
}

export type WalletAdjustmentPlan =
  | { ok: true; amount: number; expiresAt?: number }
  | { ok: false; error: string };

/**
 * An admin's manual wallet movement, decided before anything is written.
 * A top-up opens credit and therefore expires like a referral credit; a
 * claw-back is a debit and may never push the wallet below zero, because the
 * ledger replay treats an uncovered debit as overdraft that would silently
 * swallow future credit instead of being visible as a negative balance.
 */
export function planWalletAdjustment(input: {
  amount: number;
  note: string;
  transactions: WalletTransactionData[];
  now: number;
  creditValidityMonths: number;
}): WalletAdjustmentPlan {
  if (input.note.trim().length === 0) {
    return { ok: false, error: "A note is required for a manual adjustment." };
  }
  if (!Number.isFinite(input.amount)) {
    return { ok: false, error: "Amount must be a number." };
  }

  const amount = round2(input.amount);
  if (amount === 0) {
    return { ok: false, error: "Amount must not be zero." };
  }
  if (amount > 0) {
    return {
      ok: true,
      amount,
      expiresAt: creditExpiry(input.now, input.creditValidityMonths),
    };
  }

  const balance = computeAvailableBalance(input.transactions, input.now);
  if (-amount > balance) {
    return {
      ok: false,
      error: `Cannot deduct ${(-amount).toFixed(2)} EUR — the available balance is ${balance.toFixed(2)} EUR.`,
    };
  }
  return { ok: true, amount };
}

/**
 * What became of one conversion's minted credit, read off the same
 * chronological replay the balance uses — there is no second allocator.
 * `consumed` is the guide's "Consumat": the credit was spent down to nothing
 * and was never reversed.
 */
export type ConversionCreditState =
  | "none"
  | "reversed"
  | "consumed"
  | "outstanding";

export function conversionCreditState(input: {
  transactions: WalletTransactionData[];
  conversionId: string;
}): ConversionCreditState {
  const own = input.transactions.filter(
    (txn) => txn.conversionId === input.conversionId,
  );
  if (!own.some((txn) => txn.kind === "referralCredit")) return "none";
  if (conversionCreditOutstanding(own) <= 0) return "reversed";

  const credit = replayLedger(input.transactions).credits.find(
    (entry) => entry.conversionId === input.conversionId,
  );
  return credit === undefined || credit.remaining <= 0
    ? "consumed"
    : "outstanding";
}
