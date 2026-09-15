---
linear: RNGO-50
linear-url: https://linear.app/mihaicrisan/issue/RNGO-50/referral-program-v2-wallet-credit-completion-gated-approval-50percent
last-verified: 2026-09-15
---

# Referral program v2 — wallet credit aligned with the client guide

Supersedes the reward model from RNGO-26 (`archive/feature-affiliate-program.md`,
PR #51). Source: the client's "GHID DE IMPLEMENTARE: PROGRAM DE RECOMANDARE
(REFERRAL)" received 2026-09-15. Phases are Linear sub-issues RNGO-51 … RNGO-56;
this file holds the implementation context they share.

## Why a v2

The v1 reward is a count-derived percentage off the referrer's **own** next booking,
granted the moment the referred customer books. The guide wants something else:
the referrer accumulates **credit = 5–10 % of what the referred customer paid**,
activated only after that rental is **completed and approved**, redeemable for at
most **50 %** of a future booking, expiring after **12 months**, with admin
top-ups for offline referrals. None of that exists. v1 covers ~40 % of the guide.

What v1 got right and v2 keeps: `/r/<slug>` route + consent-gated cookie
attribution, server-authoritative amounts, self-referral block (user id + email),
one discount per booking via `pickDiscount` (coupon wins), global + per-affiliate
kill-switches, OCC-safe counters inside booking mutations, admin-configurable
settings with per-affiliate overrides.

## Current code map (verified 2026-09-15)

| Area | Where |
|---|---|
| Pure math | `lib/pricing/affiliate.ts` (+ `affiliate.test.ts`), `lib/pricing/discount.ts` (`pickDiscount`, `computeCouponDiscount`) |
| Convex | `convex/affiliates.ts` — `resolveAffiliateCandidates`, `recordReferralConversion`, `syncConversionForBooking`, `previewAffiliateDiscount`, admin CRUD, `getMyAffiliate` |
| Tables | `affiliates`, `affiliateSettings` (singleton), `referralAttributions`, `referralConversions` (`convex/schema.ts:308-400`) |
| Booking hooks | `convex/reservations.ts` (create ~L329-460, status/cancel/delete ~L665-720), `convex/transfers.ts` (same shape) |
| Route + cookie | `app/r/[slug]/route.ts`, `lib/referral.ts`, `components/shared/referral/referral-capture.tsx`, `proxy.ts` skip |
| Checkout | `hooks/use-affiliate-discount.ts`, `app/[locale]/reservation/page.tsx`, `app/[locale]/transfers/booking/page.tsx`, summary cards |
| Admin | `app/admin/affiliates/page.tsx`, `components/admin/affiliates/*` |
| Customer | `components/features/affiliate/affiliate-dashboard.tsx` on `/profile` |
| Emails | `convex/emails/types.ts` (`isReferralDiscount`), `UserReservationEmail.tsx` |
| Booking statuses | `convex/validators.ts` — `pending | confirmed | cancelled | completed` |

`referralConversions.status = "pending"` is defined but never written today.

## Target design

### Wallet: append-only ledger

`walletTransactions` — `userId`, `kind` (`referralCredit | manualAdjustment |
redemption | redemptionReversal`), `amount` (EUR, signed), `expiresAt?` (credits
and positive manual adjustments), `conversionId?`, `reservationId?`,
`transferId?`, `createdByUserId?` (admin), `note?`, `createdAt`. Indexes
`by_user`, `by_conversion`, `by_reservation`, `by_transfer`.

- Balance = Σ non-expired credits − Σ redemptions + Σ reversals, computed on read.
  No denormalized balance, no expiry cron: expiry is a `expiresAt > now` filter and
  redemption consumes the soonest-expiring credits first (`allocateRedemption`).
- Redemption is a **payment**, not a discount: applied after `pickDiscount`, capped
  at `maxRedemptionPercent` of the post-discount total. `totalPrice` stays the
  pre-credit price; `walletCreditApplied` is persisted on the booking. Decide and
  document which field means "amount due" before phase 3 UI.
- Guests cannot hold a wallet; referrers always have accounts.

### Conversion lifecycle

```
booking created       -> pending
booking -> completed  -> awaitingApproval   (or approved + mint, if autoApproveOnCompletion)
admin approve         -> approved           mints referralCredit, approvedConversions += 1
admin reject(reason)  -> rejected
booking cancelled /   -> voided             if it was approved: negative credit txn, counter -= 1
hard-deleted
voided -> live again  -> pending | awaitingApproval (by current booking status)
```

Credit amount = tier % (resolved from `approvedConversions` + override, **at
approval time**) × the referred booking's persisted `totalPrice`. Snapshot
`creditAmount`, `bookingTotalAtApproval`, `approvedAt`, `approvedByUserId`.

Rewrite `conversionTransition` as a table over `{current, bookingStatus,
adminAction}` and test it exhaustively — the v1 version only knows "live / not
live".

### Settings (`affiliateSettings`) additions and new defaults

| Field | Default |
|---|---|
| `referredDiscountType` / `Value` | `percentage` / `5` |
| `referredFirstRentalOnly` | `true` |
| `tiers` | `[{1, 5 %, "Pionier"}, {6, 10 %, "Ambasador"}]` |
| `maxRedemptionPercent` | `50` |
| `creditValidityMonths` | `12` |
| `autoApproveOnCompletion` | `false` |
| `enabled` | stays `false` until the owner flips it |

The guide's "days rented" tier variant is intentionally not built — it rewards
long cheap rentals over short expensive ones and detaches reward from revenue.

### Referred side

- "First rental only": booker has no prior non-cancelled reservation/transfer by
  `userId` **or** normalized email. Needs a `by_customer_email` index on both
  booking tables → add a denormalized normalized-email field (widen-migrate).
  Keep the per-(affiliate, email) dedupe from v1 as well.
- Typed code: the coupon field accepts an affiliate slug; the server records the
  attribution itself (server-minted visitorKey), so the conversion path is the
  same as the link path. No cookie/consent involved for typed codes.
- Self-service enrolment on the profile; admin provisioning and renaming stay.
  Add a slug reserved-word list (`admin`, `api`, `r`, `ro`, `en`, route names).

### Removed

The v1 "own tier reward" discount (`computeReferrerReward`, `ownReward` in
`resolveAffiliateCandidates`/`previewAffiliateDiscount`, the `reward` kind in
`use-affiliate-discount.ts`) is replaced by wallet redemption. Check
`reservations.affiliateId` semantics after removal — it was set for own-reward
bookings too.

## Migration (production-sensitive)

Widen-migrate-narrow with `@convex-dev/migrations`; load `working-with-convex`
and `convex-migration-helper` before touching it.

1. Widen: add new status literals, new optional fields, `approvedConversions`.
2. Backfill: `confirmed → approved` **without minting credit**;
   `approvedConversions = confirmedConversions`. Idempotent (skip rows already
   migrated). Verify `affiliateSettings.enabled` in prod first — if the program
   was ever live, decide with the owner whether historical conversions earn
   credit.
3. Narrow: drop `confirmed` and `confirmedConversions` once no code reads them.

## Sequence

| Phase | Linear | Blocked by |
|---|---|---|
| 1 Schema, pure math, migration | RNGO-51 | — |
| 2 Conversion lifecycle + admin approve/reject | RNGO-52 | 1 |
| 3 Wallet redemption at checkout | RNGO-53 | 1 (parallel with 2) |
| 4 Referred side: 5 % first-rental, typed code, self-service | RNGO-54 | 1 |
| 5 Admin: approvals, history, manual top-up, user search | RNGO-55 | 2, 3 |
| 6 Customer UX, WhatsApp, email block, PRD | RNGO-56 | 3, 4 |

Branch: `mihaicrisan/rngo-50-…` off `develop`; one PR per phase into `develop`
is preferable to a single XL PR. Feature stays behind `affiliateSettings.enabled`
throughout, so partial phases can ship.

## Verification

- `mise run check` per phase; new Vitest for `lib/pricing/wallet.ts` and the
  transition table.
- Dev-deployment end-to-end: referred booking → mark completed → approve → credit
  appears → redeem on next booking (cap respected) → cancel → reversal.
- `agent-browser` on desktop + mobile, `ro` + `en`, for checkout, profile, admin.
- Real confirmation email on dev for the referral block.

## Open decisions (client)

1. Credit base: % of the referred customer's total **after** their 5 % discount?
   Assumed yes.
2. Manual approval per conversion vs auto-approve on completion. Assumed manual;
   toggle provided.
3. Self-service codes for everyone vs admin-provisioned. Assumed self-service.
4. Any per-referral cap or max wallet balance? The guide has none; 5 % + 10 %
   on one booking is a 15 % margin hit per referral, uncapped.
5. Accounting/VAT treatment of wallet credit (it is a liability). Owner's
   accountant.
6. Confirm the "days rented" tier variant is dropped.
