---
linear: RNGO-50
linear-url: https://linear.app/mihaicrisan/issue/RNGO-50/referral-program-v2-wallet-credit-completion-gated-approval-50percent
last-verified: 2026-09-15
---

# Referral wallet — durable design notes

Shipped as RNGO-50 (phases RNGO-51 … RNGO-56). The phase plan itself is in
`archive/feature-referral-wallet.md`; what follows is the part that stays true
after the work landed and that anyone touching `convex/wallet.ts`,
`lib/pricing/wallet.ts` or the conversion lifecycle needs to know.

## The ledger is append-only, the balance is derived

`walletTransactions` holds signed EUR rows (`referralCredit`, `creditReversal`,
`manualAdjustment`, `redemption`, `redemptionReversal`). There is no
denormalized balance and no expiry cron: every figure a customer sees is
recomputed from their rows in `lib/pricing/wallet.ts`. Never patch a ledger
row to "fix" a balance — append the compensating row instead.

## Chronological replay is authoritative

`replayLedger` sorts by `createdAt`, then credits before debits inside the same
millisecond, then by id. A debit may only draw on credit that already existed
and had not lapsed **when the debit was recorded**, so a spend can never be
charged back to a credit that expired before it. Debits no open credit can
absorb accumulate as `overdraft` and are subtracted from the balance rather
than silently dropped, which is what keeps a reversal of already-spent credit
from inflating the wallet.

Spending always consumes the soonest-expiring credit first
(`allocateRedemption`), and the replay applies the same rule — that agreement
is why the derived balance matches what was actually written.

## One redemption row per credit consumed

`planRedemption` splits a booking's redemption across the credits it draws on
and the caller writes one debit row per entry, each carrying the consumed
credit's `expiresAt`. That is what makes a redemption reversal able to give
back exactly the expiry the customer had, instead of minting fresh
never-expiring credit.

Redemption is a **payment, not a discount**: it runs after `pickDiscount`,
capped at `maxRedemptionPercent` of the post-discount total. A booking's
`totalPrice` stays the pre-credit price and the spend is persisted as
`walletCreditApplied`; the single definition of what is still owed is
`bookingAmountDue(totalPrice, walletCreditApplied)`, used by the checkout,
confirmation pages, profile list, admin tables and emails alike.

## Reversal semantics

- A `creditReversal` carries the `conversionId` of the credit it undoes and
  takes that conversion's own remaining credit first; whatever was already
  spent falls through as a plain debit.
- `conversionCreditOutstanding` is the signed sum of the rows carrying a
  conversion's id. Once it reaches 0 a repeated void writes nothing (idempotent)
  and a later re-approval may mint afresh, because the conversion no longer
  holds anything.
- Cancelling a booking also clears its `walletCreditApplied`, so an un-cancel
  cannot claim it was paid with credit that is spendable again.

## Conversion lifecycle

`conversionTransition` is a pure table over `{current status, booking status,
admin action}` returning the next status plus its side-effects (counter delta,
mint, reverse) or `null` for "nothing changes" — that null is what makes every
caller idempotent.

```
booking created        -> pending
booking -> completed   -> awaitingApproval  (or approved + mint when autoApproveOnCompletion)
admin approve          -> approved          mints credit, approvedConversions += 1
admin reject           -> rejected          reverses a minted credit
cancelled / deleted    -> voided            reverses a minted credit, counter -= 1
voided -> live again   -> pending | awaitingApproval
```

An admin cannot approve a booking that is not `completed`, and a booking that
stops being completed demotes an unapproved conversion but never claws back an
approval. The credit amount is the tier percent resolved **at approval time**
(the approval counts towards its own tier) applied to the referred booking's
persisted total, snapshotted on the conversion.

## Widen / backfill / narrow

The v1 `confirmed` conversion status and `confirmedConversions` counter were
widened alongside the new statuses and `approvedConversions`, backfilled
(`confirmed` → `approved` **without minting credit**), and are read everywhere
through `approvedCount()` / `normalizeStatus()` so the narrow step is a pure
deletion. Do not write `confirmed` again. The same pattern applies to the
denormalized normalized-customer-email field added for the first-rental rule.

## Privacy

A wallet row never names the referred customer it came from, and the affiliate
dashboard shows counts, amounts and dates only — no referred emails. The admin
conversion history is the only place referrer and referred appear together.
