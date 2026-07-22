# Feature: Coupon / Voucher Codes

Admin-generated discount codes that customers redeem at checkout. Each code gives
either a **percentage** or a **fixed-amount** reduction, and is constrained by
**an expiry date** and/or **a maximum number of redemptions** ("first N"). Everything
is admin-configurable.

> **Status: planned — not started.** This document is the implementation spec.
> Several client details are unspecified; they are collected in
> [Open questions](#open-questions) and must be answered before building the parts
> that depend on them. Do **not** invent answers.

---

## Context — what exists today

The codebase already contains a **partial, non-functional scaffold** for promo codes.
It is a free-text pass-through: a `promoCode` string flows client → mutation → DB →
email, but **nothing validates it, nothing applies a discount, and the backing table
has zero functions.** The feature is essentially unbuilt.

### 1. Data model — an unused `promotions` table

`convex/schema.ts:224-235` defines:

```ts
promotions: defineTable({
  code: v.string(),
  type: v.union(v.literal("percentage"), v.literal("fixed")),
  value: v.number(),            // percentage or fixed amount
  expiryDate: v.number(),       // Unix timestamp
  usageCount: v.number(),
  maxUsage: v.optional(v.number()),
  active: v.boolean(),
})
  .index("by_code", ["code"])
  .index("by_active", ["active"])
```

This table shape already matches the client's core requirement (percentage-or-fixed,
expiry-or-max-usage). **But there is no `convex/promotions.ts` — zero queries/mutations
read or write it.** It is dead schema. It also lacks: redemption audit trail,
min-order, applicability (rentals vs transfers), per-user limits, and an admin label.

### 2. `promoCode` free-text plumbing already threaded end-to-end

- **Schema**: `reservations.promoCode: v.optional(v.string())` (`convex/schema.ts:119`).
  The **`transfers` table has NO promoCode field** — transfers have no promo plumbing at all.
- **createReservation** (`convex/reservations.ts:27-154`): accepts `promoCode`
  (arg line 50), stores it verbatim (line 102), forwards it to the confirmation email
  (line 142). **It does not look up `promotions`, validate, or discount `totalPrice`.**
  `updateReservationDetails` (line 288) also accepts/patches `promoCode` (312, 346).
- **Customer reservation page** (`app/[locale]/reservation/page.tsx:758`):
  `promoCode: undefined, // TODO: Add promo code functionality` — the input was never built.
- **Emails already render a discount row**: `convex/emails/components/pricing_section.tsx:67-80`
  renders a green **"Promo Code Applied:"** row when `pricingDetails.promoCode` is set
  (wired in both `UserReservationEmail.tsx` and `AdminReservationEmail.tsx`). The transfer
  email component `convex/emails/components/transfer_pricing_section.tsx` has **no** such row.
- **Admin create-reservation dialog** already has a free-text promo input:
  `components/admin/reservations/create-reservation-dialog.tsx:72` (zod), `:116` (default),
  `:163` (submit), `:642` (the `FormField` input labeled "Promo Code (Optional)").
- **Tables display it**: `components/features/reservations/user-reservations-table.tsx:144`
  and `components/admin/reservations/reservation-table.tsx:194` show a `Promo: {code}` badge.

**Reconciliation required:** the new feature should replace this free-text pass-through
with validated codes, keeping `promoCode` as the persisted human-readable code and adding
a persisted discount amount + a link to the coupon record.

### 3. Reservation pricing (client-side today — see security dependency)

- `app/[locale]/reservation/page.tsx` is a 1888-line client God-component.
  `calculateTotalPrice()` (lines 357-482) returns a ~19-field `PricingCalculation`
  object; the grand `totalPrice = basePrice + totalLocationFees + protectionCost +
  totalAdditionalFeatures` (lines 436-440). **There is no discount term in this sum.**
- `handleSendReservation` (lines 621-797) builds the payload and passes client-computed
  money fields to `createReservation` (`totalPrice` line 744, `promoCode` line 758).
- **Price summary JSX** where a discount line goes: lines **1754-1861** (the "Pricing
  Summary" block; grand total at 1840-1860).
- Pricing helpers live in `lib/vehicle-utils.ts`: `calculateVehiclePricingWithSeason`
  (137-190, the one used), `calculateRentalDays` (120-132), returning `PriceDetails` (6-17).
- The `hooks/use-reservation-pricing.ts` / `hooks/use-reservation-form.ts` hooks are
  **dead** (only their TS types are imported); do not build on them — see
  [Dependencies](#dependencies-on-other-plans).

### 4. Transfers booking flow

- `app/[locale]/transfers/booking/page.tsx` (588 lines). Pricing is **not** local
  state — it is a live Convex query result: `pricing =
  useQuery(api.transferPricing.calculateTransferPriceByVehicle, {...})` (lines 95-104),
  returning `{ baseFare, distanceCharge, totalPrice, tierPricePerKm }`.
- `handleSubmit` (160-234) passes money fields to `createTransfer`
  (`convex/transfers.ts:36-157`): `baseFare`, `distancePrice` (= `pricing.distanceCharge`),
  `totalPrice`, `pricePerKm`. There is **no promo field and no coupon UI**.
- Price display: `components/features/transfers/transfer-summary-card.tsx` — receives only
  `totalPrice` (no breakdown props); total rendered at lines 231-236.
- Transfer confirmation email price section: `convex/emails/components/transfer_pricing_section.tsx`
  (shows Distance + Total only).

### 5. Confirmation page (rentals)

`app/[locale]/reservation/confirmation/page.tsx` recomputes the breakdown client-side
(lines 134-175) and renders the payment/total card at lines 434-509 (additionalCharges
mapped 462-480, SCDW 482-492, Total 494-499). **It does not read or display `promoCode`
or any discount.**

### 6. Admin dashboard structure (template for the Coupons UI)

- **Route tree** under `app/admin/`: `page.tsx` (overview), `reservations/`, `seasons/`,
  `transfers/`, `blogs/`, `settings/`, `vehicles/` (+ `vehicles/classes/[classId]/`).
  Layout in `app/admin/layout.tsx`; **no i18n** (per CLAUDE.md — admin is hardcoded English).
- **Sidebar nav**: `components/admin/admin-sidebar.tsx:29-65` (`navItems` array; icons from
  `lucide-react`). Add a `{ title: "Coupons", url: "/admin/coupons", icon: Ticket }` entry here.
- **Breadcrumbs** auto-generate from the pathname in `app/admin/layout.tsx:42-57` —
  `/admin/coupons` yields "Admin / Coupons" for free.
- **Seasons is the closest CRUD template** (simple entity, list + create/edit dialogs):
  - `app/admin/seasons/page.tsx` → thin, renders `<SeasonsManagement/>`.
  - `components/admin/seasons/seasons-management.tsx` — header + "Create" button toggling
    `showCreateDialog`, a `<Card>` wrapping the table, lazy-loaded create dialog via
    `dynamic(..., { ssr: false })`.
  - `components/admin/seasons/seasons-table.tsx` — `useQuery(api.seasons.getAll)`, shadcn
    `<Table>`, per-row `<DropdownMenu>` actions (Edit / Delete), **delete uses browser
    `confirm()`** then `deleteSeason({ id })` + toast.
  - `components/admin/seasons/create-season-dialog.tsx` / `edit-season-dialog.tsx` —
    **react-hook-form + zod** (`zodResolver`), shadcn `Dialog` + `Form`/`FormField`
    primitives, calls `useMutation(api.seasons.create|update)`, `isSubmitting` gate,
    `onSuccess?.()` + `onOpenChange(false)` on success.
- **Admin auth**: `proxy.ts` gates `/admin(.*)` via Clerk `sessionClaims.metadata.role ===
  "admin"` (lines 38-53). **Convex functions themselves are unguarded** — `seasons.ts`
  create/update/delete do no auth check, and there is **no `requireAdmin` helper** (only
  `getCurrentUser` / `getCurrentUserOrThrow` in `convex/users.ts`, which check presence not
  role). This is the AUDIT.md **critical "admin write functions are public endpoints"**
  finding. **Coupon admin mutations MUST NOT copy this gap** — see design.

### 7. i18n

- `messages/en.json` + `messages/ro.json`, identical key structure, 26 top-level
  namespaces (incl. `reservationPage`, `transferPage`, `confirmationPage`, `common`).
- Client components: `useTranslations("<namespace>")`; server components: `getTranslations`.
- Locales `['ro','en']`, default `ro`, `localePrefix: 'always'` (`proxy.ts`).

---

## Requirements

From the client (verbatim gist):

1. **Admin generates codes** on the admin side.
2. A code offers **% reduction OR fixed-amount reduction**.
3. Validity constraints: **until a date**, OR **first N redemptions**.
4. **Everything fully configurable.**

Derived non-negotiables (from AUDIT.md + architecture):

5. **All validation and redemption MUST be server-side and atomic.** The client may
   preview a discount, but the authoritative discount and the redemption-count decrement
   happen inside a Convex mutation. A client must not be able to spoof a discount or
   over-redeem a capped code (ties into the critical "createReservation trusts client
   totals" finding — see [Dependencies](#dependencies-on-other-plans)).
6. Admin CRUD must be **auth-guarded server-side** (do not repeat the unguarded-mutation gap).

---

## Design

### A. Convex schema

**Replace the unused `promotions` table** (it is empty and has no callers, so no migration
is needed) with a richer `coupons` table plus a `couponRedemptions` audit table.

> If the client prefers to keep the name `promotions`, the field set below still applies;
> `coupons` is used here for clarity. Deleting the old empty table definition is safe.

```ts
// convex/schema.ts
coupons: defineTable({
  code: v.string(),                    // stored NORMALIZED (uppercase, trimmed)
  label: v.optional(v.string()),       // admin-only human note ("summer 2026 promo")
  discountType: v.union(v.literal("percentage"), v.literal("fixed")),
  discountValue: v.number(),           // e.g. 15 (=15%) or 20 (=20 EUR); EUR — see OQ#3

  // Validity — either/both configurable (see OQ#10 on combining)
  expiresAt: v.optional(v.number()),   // UTC ms timestamp; null = no expiry
  maxRedemptions: v.optional(v.number()), // "first N"; null = unlimited
  redemptionCount: v.number(),         // maintained counter (atomic guard)

  // Optional constraints ("fully configurable")
  minOrderAmount: v.optional(v.number()),  // subtotal floor — see OQ#6, OQ#8
  appliesTo: v.union(                      // see OQ#1
    v.literal("rentals"),
    v.literal("transfers"),
    v.literal("both"),
  ),
  perUserLimit: v.optional(v.number()),    // see OQ#4, OQ#11

  active: v.boolean(),                 // admin kill-switch (see OQ#5)
  createdAt: v.number(),
  createdBy: v.optional(v.string()),   // admin clerkId/name
})
  .index("by_code", ["code"])          // primary lookup + uniqueness check
  .index("by_active", ["active"]),

couponRedemptions: defineTable({
  couponId: v.id("coupons"),
  code: v.string(),                    // denormalized for reporting
  bookingType: v.union(v.literal("reservation"), v.literal("transfer")),
  reservationId: v.optional(v.id("reservations")),
  transferId: v.optional(v.id("transfers")),
  userId: v.optional(v.id("users")),   // null for guest bookings (see OQ#11)
  customerEmail: v.string(),           // for guest per-user limits
  discountApplied: v.number(),         // actual EUR discount granted
  redeemedAt: v.number(),
})
  .index("by_coupon", ["couponId"])
  .index("by_reservation", ["reservationId"])
  .index("by_transfer", ["transferId"])
  .index("by_coupon_email", ["couponId", "customerEmail"]), // per-user limit checks
```

**Persist the applied discount on the booking** (fixes the AUDIT.md "confirmation
recomputes and can disagree with stored total" class of bug — store, don't recompute):

- `reservations`: keep `promoCode`; add `couponId: v.optional(v.id("coupons"))` and
  `discountAmount: v.optional(v.number())`.
- `transfers`: add `promoCode: v.optional(v.string())`, `couponId: v.optional(v.id("coupons"))`,
  `discountAmount: v.optional(v.number())`.

### B. Convex functions — `convex/coupons.ts` (new)

All admin mutations start with a shared `requireAdmin(ctx)` guard. Since no such helper
exists yet, this feature should **introduce `requireAdmin(ctx)` in `convex/users.ts`**
(identity → `by_clerk_id` → `role === "admin"`, else throw). This is the same helper the
AUDIT.md critical finding calls for; other admin modules can adopt it later. Every function
declares `args` and `returns` validators (Convex convention, currently widely violated).

**Admin CRUD (guarded):**

| Function | Kind | Purpose |
|---|---|---|
| `create` | mutation | Insert a coupon. Normalize `code` (uppercase+trim), reject if `by_code` already exists, init `redemptionCount: 0`. Validate `discountValue` (percentage 0–100; fixed > 0), and that at least the type is set. |
| `update` | mutation | Edit any field of an existing coupon (incl. `active`, so admin can deactivate a **live** code — OQ#5). Re-check code uniqueness if code changed. Uses a shared `stripUndefined` patch idiom. |
| `remove` | mutation | Delete a coupon. Decide whether to block deletion when redemptions exist (recommend soft-deactivate instead; OQ#5). |
| `list` | query | All coupons for the admin table (paginated or `.take()` — do not unbounded-collect). |
| `getById` | query | Prefill the edit dialog. |
| `getUsageStats` | query | Per-coupon: `redemptionCount`, `maxRedemptions`, remaining, total discount granted (sum over `couponRedemptions.by_coupon`), status (active/expired/exhausted). Powers the admin status column. |

**Customer-facing validation (read-only preview):**

- `validateCoupon` **query** — args `{ code, bookingType, subtotal }`. Normalizes the code,
  looks up via `by_code`, and returns a discriminated result:
  ```ts
  returns: v.union(
    v.object({ valid: v.literal(true), code: v.string(),
      discountType: ..., discountValue: v.number(),
      discountAmount: v.number() }),   // computed, clamped
    v.object({ valid: v.literal(false),
      reason: v.union(v.literal("not_found"), v.literal("inactive"),
        v.literal("expired"), v.literal("exhausted"),
        v.literal("wrong_scope"), v.literal("below_min_order")) }),
  )
  ```
  Checks (all server-side): exists → `active` → not `expiresAt < Date.now()` →
  `redemptionCount < maxRedemptions` → `appliesTo` matches `bookingType` →
  `subtotal >= minOrderAmount`. Computes `discountAmount` (see §C) but **does not**
  increment anything. This is only for live UI feedback; it is advisory.

**Redemption (atomic, server-authoritative):**

- `applyAndRedeemCoupon(ctx, { code, bookingType, subtotal, userId?, customerEmail })`
  — an **internal helper** (plain TS function in `convex/coupons.ts`, not a public mutation)
  **called from inside `createReservation` / `createTransfer`** within the same transaction.
  It re-runs every `validateCoupon` check, additionally checks `perUserLimit` via
  `by_coupon_email`, then **within the booking mutation's transaction**:
  1. computes the authoritative `discountAmount`,
  2. `ctx.db.patch(coupon._id, { redemptionCount: coupon.redemptionCount + 1 })`,
  3. inserts a `couponRedemptions` row linked to the new booking id,
  4. returns `{ couponId, code, discountAmount }` to be stored on the booking and used to
     recompute `totalPrice` server-side.
  If any check fails, it throws → the whole booking mutation rolls back (no half-applied
  coupon). See [Concurrency](#e-concurrency--atomicity) for why this is race-safe.

### C. Discount computation (single source of truth)

One pure function `computeDiscount(subtotal, discountType, discountValue)` used by both
`validateCoupon` and `applyAndRedeemCoupon` (never re-implemented client-side for the
authoritative value):

- percentage: `round(subtotal * discountValue / 100)`
- fixed: `min(discountValue, subtotal)` — **clamp so the discount never exceeds the
  order** (total floors at 0; OQ#9).
- Round consistently with the rest of the app (integer/2-dp EUR — match existing rounding).

**Open design point — the discount base (OQ#8):** what counts as `subtotal`? For rentals,
candidates are the rental subtotal only vs. including location fees / protection / extras.
For transfers, the transfer `totalPrice`. This changes both `minOrderAmount` semantics and
the discount amount. Must be confirmed; do not assume. The plan wires `subtotal` as a single
value so the decision is localized.

### D. Admin UI — `app/admin/coupons/` (new, mirrors seasons)

Hardcoded English (admin has no i18n). Files:

- `app/admin/coupons/page.tsx` — thin, renders `<CouponsManagement/>`.
- `components/admin/coupons/coupons-management.tsx` — header + "Create Coupon" button,
  `<Card>` wrapping `<CouponsTable/>`, lazy-loaded `<CreateCouponDialog/>`.
- `components/admin/coupons/coupons-table.tsx` — `useQuery(api.coupons.list)`, shadcn
  `<Table>` columns: code, type/value, validity (expiry + "used N / max"), scope, status
  badge (Active / Inactive / Expired / Exhausted), created. Per-row `<DropdownMenu>`:
  **Edit**, **Deactivate/Activate** (toggle `active`), **Delete** (browser `confirm()` then
  `api.coupons.remove` + toast, mirroring seasons).
- `components/admin/coupons/create-coupon-dialog.tsx` — RHF + zod. Fields: `code` (with a
  **"Generate" button** producing a random A–Z0–9 code, mirroring the vehicle-slug generate
  button pattern — uniqueness enforced server-side on create), `label`, `discountType`
  (select), `discountValue`, `expiresAt` (date picker, optional), `maxRedemptions`
  (optional), `minOrderAmount` (optional), `appliesTo` (select), `perUserLimit` (optional),
  `active` (default true). Calls `api.coupons.create`.
- `components/admin/coupons/edit-coupon-dialog.tsx` — same form; prefetch via
  `api.coupons.getById`; calls `api.coupons.update`. Shows read-only usage stats
  (`redemptionCount`, total discount granted) from `api.coupons.getUsageStats`.
- **Reconcile** the existing free-text promo input in
  `components/admin/reservations/create-reservation-dialog.tsx:642` — either validate it
  against real coupons or leave it as a manual override (OQ#12).

**Code generation** is a small client helper (random string); uniqueness is guaranteed by
the server `create` rejecting a duplicate `by_code`. Optionally support admin bulk-generation
later (out of scope unless requested).

### E. Concurrency & atomicity

Convex mutations are serializable transactions with optimistic concurrency control. The
race — two bookings competing for the **last** redemption of a capped code — is handled by
doing the read-check-increment of `coupon.redemptionCount` **inside** the booking mutation:

- Both transactions read `redemptionCount = maxRedemptions - 1` and try to patch the same
  coupon doc. OCC detects the write-write conflict on that document; one transaction commits,
  the other is **retried**, re-reads the now-incremented count, sees the cap reached, and
  throws — so the second booking fails cleanly rather than over-redeeming. No locks, no
  double-count. This is why redemption must live in the same mutation as booking creation,
  not in a separate call. (It also means high-frequency contention on one hot coupon
  serializes — acceptable for this domain.)

### F. Customer UX

**Reservation** (`app/[locale]/reservation/page.tsx`, or its decomposed successor — see
Dependencies): add a coupon input + "Apply" button in/near the Pricing Summary block
(lines 1754-1861). Flow:

1. User types code → clicks Apply → calls `api.coupons.validateCoupon` query with the
   current `subtotal` and `bookingType: "rentals"`.
2. On `valid`, store `{ code, discountAmount }` in component state; render a **Discount
   line** (green, `− X EUR`) above the grand total, and subtract it from the displayed
   `totalPrice`. On invalid, show a translated error (`not_found` / `expired` / etc.).
3. On submit, pass `promoCode: code` to `createReservation` (replacing the line-758 TODO).
   **The client-shown discount is advisory** — the server recomputes and stores the real
   `discountAmount`, `couponId`, and the discounted `totalPrice` via `applyAndRedeemCoupon`.

**Transfers** (`app/[locale]/transfers/booking/page.tsx`): same input in the form column;
thread a `discountAmount` + `subtotal` into `<TransferSummaryCard/>` (which today only
receives `totalPrice` — add breakdown props) and render the discount row. Pass `promoCode`
into `createTransfer`.

**Price breakdown display** (once discount is applied), everywhere the total appears:
- Reservation summary block 1754-1861 (discount row before total).
- Reservation confirmation `app/[locale]/reservation/confirmation/page.tsx:434-509` — add a
  discount row and show `reservation.promoCode`; **render the stored `discountAmount`**, do
  not recompute.
- Transfer summary card + transfer confirmation page.

### G. Emails

- **Rentals**: `convex/emails/components/pricing_section.tsx:67-80` already renders a
  "Promo Code Applied" row keyed on `pricingDetails.promoCode`. Extend the payload to carry
  the **discount amount** (add to the `pricingDetails` validator in `convex/emails.ts` and
  the `createReservation` email-scheduling call, `reservations.ts:~142`) so the row shows
  `− X EUR`, not just the code.
- **Transfers**: add a discount row to `convex/emails/components/transfer_pricing_section.tsx`,
  a `discountAmount`/`promoCode` field to `TransferPricingDetails` (`convex/emails/types.ts`),
  and thread it through `createTransfer`'s scheduler payload (`transfers.ts:142-147`) and the
  emails.ts validator. Templates carry bilingual labels inline (they don't use next-intl).

### H. i18n (customer-facing only)

Add keys to `messages/en.json` + `messages/ro.json` under `reservationPage` and
`transferPage` (or a shared `common`/`coupon` namespace): `coupon.label`,
`coupon.placeholder`, `coupon.apply`, `coupon.remove`, `coupon.applied`, `coupon.discount`,
and error strings (`coupon.errors.notFound|expired|exhausted|inactive|wrongScope|belowMinOrder`).
Admin UI stays hardcoded English.

### I. Edge cases

- **Expiry timezone** — store `expiresAt` as a UTC ms timestamp and compare only server-side
  (`Date.now()`). Decide whether "until date D" means end-of-day D in Europe/Bucharest
  (recommend: admin picks a date, store as 23:59:59 Bucharest → UTC). OQ#7.
- **Concurrent last redemption** — handled by Convex OCC (see §E).
- **Case sensitivity / whitespace** — normalize to uppercase+trim on both store and lookup.
- **Min-order** — `minOrderAmount` checked against `subtotal`; base is OQ#8.
- **Percentage > 100 / fixed > total** — reject `>100%` at create; clamp fixed discount to
  subtotal so total ≥ 0 (OQ#9).
- **Deactivated / expired / exhausted live code** — re-checked at both `validateCoupon` and
  `applyAndRedeemCoupon` time; a code that expires between preview and submit fails at submit.
- **Guest bookings (no userId)** — per-user limits fall back to `customerEmail` via
  `by_coupon_email` (OQ#11).
- **Stacking** — one coupon per booking for v1; interaction with the affiliate discount is
  OQ#2 (do not build stacking until confirmed).
- **Admin editing a code mid-life** — supported via `update`/`active` toggle (OQ#5).

---

## Implementation steps (ordered)

1. **Schema** (`convex/schema.ts`): remove the unused `promotions` table; add `coupons` and
   `couponRedemptions` tables + indexes; add `couponId`/`discountAmount` to `reservations`
   and `promoCode`/`couponId`/`discountAmount` to `transfers`.
2. **`requireAdmin(ctx)` helper** (`convex/users.ts`) — identity → role check → throw.
3. **`convex/coupons.ts`**: admin CRUD (`create`/`update`/`remove`/`list`/`getById`/
   `getUsageStats`, all `requireAdmin`-guarded, all with `returns` validators), the
   `computeDiscount` pure helper, the `validateCoupon` public query, and the
   `applyAndRedeemCoupon` internal helper.
4. **Wire redemption into bookings**: call `applyAndRedeemCoupon` inside `createReservation`
   (`convex/reservations.ts`) and `createTransfer` (`convex/transfers.ts`); recompute and
   store the discounted `totalPrice`, `discountAmount`, `couponId`, `promoCode`. Insert the
   redemption row with the new booking id. **(Depends on the server-pricing engine — see
   Dependencies; this step is where coupon logic joins that engine.)**
5. **Admin UI** (`app/admin/coupons/` + `components/admin/coupons/*`): management, table,
   create/edit dialogs; add the `Coupons` nav item to `components/admin/admin-sidebar.tsx`.
6. **Customer reservation UI**: coupon input + Apply + discount line in
   `app/[locale]/reservation/page.tsx` (summary block 1754-1861), replace the line-758 TODO,
   render discount on the confirmation page (434-509).
7. **Customer transfer UI**: coupon input in `app/[locale]/transfers/booking/page.tsx`,
   discount props/row in `transfer-summary-card.tsx`, transfer confirmation page.
8. **Emails**: extend rentals `pricing_section.tsx` payload with discount amount; add discount
   row + type field to transfer emails (`transfer_pricing_section.tsx`, `emails/types.ts`,
   `emails.ts` validators, scheduler payloads).
9. **i18n**: coupon keys in `messages/en.json` + `messages/ro.json`.
10. **Reconcile** the admin create-reservation dialog promo input (OQ#12) and the
    `Promo: {code}` badges in the two reservation tables (now also show discount).
11. Update `PRD.md` + `CHANGELOG.md` per project conventions.

---

## Dependencies on other plans

- **`audit-pricing-security` (CRITICAL, hard dependency).** That plan moves pricing
  computation and total-validation server-side (today `createReservation`/`createTransfer`
  trust client totals — the critical AUDIT.md finding). **Coupon redemption must be part of,
  or built on top of, that server-side engine** — the discount has to be recomputed and the
  redemption counted where the authoritative total is produced. Sequencing options:
  (a) **preferred** — land the server pricing engine first, then add coupons as a discount
  stage inside it; (b) if coupons ship first, `applyAndRedeemCoupon` must at minimum compute
  the discount server-side and derive the total server-side rather than accepting a
  client-supplied discounted total — otherwise a client can both spoof the base total *and*
  the discount. Coordinate the shared `requireAdmin(ctx)` helper (step 2) with that plan so
  it is introduced once.
- **`feature-affiliate-program`.** Affiliate referrals may also reduce price. The pricing
  engine's discount slot and the breakdown/email "discount" rows should be designed to hold
  **either** a coupon **or** an affiliate discount (or both, if stacking is allowed — OQ#2).
  Do not build a second, parallel discount mechanism; share the `discountAmount` concept and
  the redemption/attribution audit pattern.
- **`audit-reservation-decomposition`.** The 1888-line reservation page is being split into
  memoized child components with a single pricing hook (the dead `hooks/use-reservation-*`
  are to be made canonical or deleted). **Build the coupon input against the decomposed
  summary/pricing hook, not the God-component**, to avoid adding to code that is about to be
  refactored. Coordinate timing; if decomposition lands first, target the new components.

---

## Open questions

None of these were specified by the client — **confirm, do not assume:**

1. **Scope** — do coupons apply to transfers too, or only car reservations? (`appliesTo`
   is designed for `rentals | transfers | both`, but the default is unknown.)
2. **Stacking** — can a coupon combine with the planned affiliate discount, or is it
   one-discount-per-booking?
3. **Currency** — fixed-amount reductions in EUR (matching the rest of pricing)? Confirm.
4. **Per-user limit** — is a per-customer redemption cap wanted in addition to the global
   "first N", or is global-only sufficient?
5. **Admin lifecycle** — can an admin deactivate / edit / delete a code that is already live
   and has redemptions? (Designed as yes via `active` toggle + soft rules; confirm, and
   confirm whether hard delete of a redeemed coupon is allowed.)
6. **Min-order constraint** — is a minimum-order threshold desired? ("Fully configurable"
   implies flexibility, but the client didn't list it.)
7. **Expiry semantics / timezone** — does "until date D" include all of day D? In which
   timezone (Europe/Bucharest)? Store as an explicit end-of-day timestamp?
8. **Discount base** — is the % / fixed reduction applied to the rental subtotal only, or to
   the total including location fees, protection (SCDW), and extras? For transfers, on the
   full transfer total? (Also defines what `minOrderAmount` is measured against.)
9. **Clamping** — behavior when a fixed discount exceeds the order total (clamp to 0?) and
   confirmation that percentage is capped at 100.
10. **Combining validity constraints** — the brief says "until a date OR first N". Can a
    single code carry **both** an expiry **and** a max-redemptions cap (whichever hits
    first), or is it strictly one-or-the-other per code?
11. **Guest bookings** — how should per-user limits work for customers without an account
    (email-based, as designed, or not enforced for guests)?
12. **Admin manual promo input** — the existing free-text "Promo Code" field in the admin
    create-reservation dialog: should it now validate/redeem a real coupon, or remain a
    free-text manual override that bypasses redemption counting?

---

## Size estimate

**L** (backend CRUD + atomic redemption, admin CRUD UI, two customer checkout flows, two
confirmation pages, rental + transfer emails, i18n, schema migration). Trends toward **XL**
if the server-side pricing/validation engine (`audit-pricing-security`) has to be built or
substantially extended as part of this work rather than already existing — that dependency
is the dominant risk to the estimate.
