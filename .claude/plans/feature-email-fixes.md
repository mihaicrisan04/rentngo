# Reservation Email Correctness + Content Fixes

## Context

### Current reservation email flow (customer confirmation)

1. Customer submits on `app/[locale]/reservation/page.tsx` → `handleSendReservation` (line 621) calls
   `createReservationMutation` (`api.reservations.createReservation`) with client-computed money fields.
2. `convex/reservations.ts` `createReservation` (line 27) inserts the reservation, then (line 114, only if
   `vehicleInfo` is supplied) schedules `internal.emails.sendReservationConfirmationEmail` via
   `ctx.scheduler.runAfter(0, ...)`.
3. `convex/emails.ts` `sendReservationConfirmationEmail` (line 73, `"use node"` internalAction) renders
   `AdminReservationEmail` + `UserReservationEmail` (React Email) and sends both through Resend.
4. Templates live in `convex/emails/templates/` and pull shared pieces from `convex/emails/components/`
   (`pricing_section.tsx`, `rental_details_section.tsx`, etc.) using helpers in `convex/emails/utils.ts`
   and types in `convex/emails/types.ts`.

The email's pricing/day/SCDW numbers are **whatever the client passed to the mutation** — nothing is
recomputed or validated server-side. The only server-side derivation is the day count and a `pricePerDay`
fallback, both computed inside `createReservation` (see bugs below).

### Separate, unrelated admin email path (do not confuse with the above)

`components/admin/reservations/reservation-email-dialog.tsx` (admin "Send Email to Customer" dialog) POSTs
freeform subject/message to `app/api/send/reservation-email/route.ts`, which inlines a ~140-line HTML
template (AUDIT High finding, route.ts:19-156). This path shows **only** `#id`, vehicle, dates, pickup,
return, and `totalPrice` (route.ts:116-143) — no per-day, no SCDW, no km. It shares no code with the
canonical `convex/emails` templates and has no auth. It is a different surface from the confirmation email;
the content fixes below target the canonical templates first (see Design → admin path).

---

### Bug trace #1 — SCDW value in the email ("chestia cu SCDW din mail")

The SCDW line in the email is rendered by `convex/emails/components/pricing_section.tsx:100-114` from
`pricingDetails.protectionCost`. That value flows straight from the mutation arg `protectionCost`
(`reservations.ts:145` → email `pricingDetails.protectionCost`), which is set by the client at
`app/[locale]/reservation/page.tsx:763`:

```
protectionCost: currentProtectionCost > 0 ? currentProtectionCost : undefined
```

`currentProtectionCost` (page:725) = `isSCDWSelected ? currentScdwPrice : 0`, where (page:723-724)
`currentScdwPrice = calculateSCDW(days, currentPricePerDay)` and (page:720-722)
`currentPricePerDay = seasonalPricePerDay = getPriceForDurationWithSeason(vehicle, days, seasonalMultiplier)`
= `round(getPriceForDuration(vehicle, days) * seasonalMultiplier)` — the **duration-tiered** daily rate.

But the **`totalPrice`** the client sends (page:744) comes from `calculateTotalPrice()` (the display path),
whose SCDW is computed with a **different daily rate** (page:414):

```
scdwPrice = calculateSCDW(days, Math.round(getBasePricePerDay(vehicle) * seasonalMultiplier))
```

`getBasePricePerDay(vehicle)` returns the **base tier** rate (`types/vehicle.ts:96` → `getBasePriceTier`,
line 75: the tier with the lowest `minDays` and highest `pricePerDay`), whereas
`getPriceForDuration(vehicle, days)` (`types/vehicle.ts:106`) returns the tier matching the actual rental
length. For any rental long enough to fall past the base tier (the normal case with tiered pricing, where
longer rentals are cheaper per day), these two rates differ.

**Net effect in the email:** the total (`pricingDetails.totalPrice`, `pricing_section.tsx:126`) was built
with the base-tier SCDW, while the SCDW **line item** (`pricing_section.tsx:110`) shows the duration-tier
SCDW. The line items therefore do not reconcile with the total, and the SCDW figure disagrees with what the
customer saw on the reservation summary (`page.tsx:1795`, which renders the display-path `scdwPrice`). This
is the exact copy-paste divergence in AUDIT critical finding #1 and the spaghetti finding on `page.tsx`.

Root cause: two independent SCDW computations (display path `calculateTotalPrice` vs submit path
`handleSendReservation`) fed divergent daily rates. `totalPrice` uses one, `protectionCost` uses the other.

### Bug trace #2 — rental-day count in the email ("calculul de zile corectat pe mail")

The email's `numberOfDays` is **recomputed independently** inside the mutation, not taken from the client's
priced day count. `convex/reservations.ts:116-118`:

```
const numberOfDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000*60*60*24)));
```

This uses only the raw `startDate`/`endDate` timestamps and **ignores `pickupTime`/`restitutionTime`**.
Everything the client priced instead used `calculateRentalDays(pickup, restitution, pickupTime,
restitutionTime)` (`lib/vehicle-utils.ts:120`), which does `differenceInDays` **plus** a "if
restitutionHour > pickupHour + 2 → +1 day" rule (same-day → 1). That priced `days` drives `basePrice`,
`scdwPrice`, per-day extras (snow chains, child seats), and `pricePerDayUsed`.

**Divergence example:** pickup Mon 10:00, return Wed 14:00 → `calculateRentalDays` = 3 (14 > 10+2), but the
mutation's ceil of the midnight-to-midnight timestamps = 2. The email then renders the rental line as
`pricePerDay × numberOfDays` (`pricing_section.tsx:37-41`, `calculatePricingBreakdown` in `utils.ts:22`)
using the **priced per-day rate** but the **wrong day count**, so the rental subtotal matches neither the
priced `basePrice` nor the emailed total. This is the day-count bug the client sees.

Root cause (same as AUDIT confirmation-page duplication finding): day count and price-per-day are
recomputed at email time instead of being persisted at booking time. `pricePerDayUsed` is passed (page:778)
but the priced `days` is not — the mutation re-derives it with different, time-blind math.

### Requirement #3 trace — km included + extra-km opt-in (feature already exists)

The included-km and extra-km features **already exist** in the booking flow — this is mostly a surfacing
task, not a new feature:

- **Included km:** `calculateIncludedKilometers(days) = days * 200` (`lib/vehicle-utils.ts:208`, 200 km/day
  hardcoded). Displayed on the reservation page (`page.tsx:1266`, `:1643`) and on `vehicle-pricing-card.tsx:240`.
  Total shown to the user = `calculateIncludedKilometers(days) + extraKilometersCount * 50` (`page.tsx:1643`).
  **Not persisted, not in the email.**
- **Extra-km option:** a real bookable paid option. `extraKilometersCount` state (`page.tsx:218`), 50 km
  packages, priced at `additional50kmPrice` per package where `additional50kmPrice = vehicleClass.additional50kmPrice ?? 5`
  (`page.tsx:311`; schema field `vehicleClasses.additional50kmPrice`, `schema.ts:291`, admin-editable on the
  class-ordering page). Max 5000 km (100 packages). Computed via `calculateExtraKilometersPrice`
  (`lib/vehicle-utils.ts:216`). It is folded into `totalPrice` **and** pushed as an `additionalCharges` line
  (`page.tsx:707-716`, description key `payment.additionalCharges.extraKilometers`, present in both
  `messages/en.json:271` and `ro.json:271`).

So the extra-km charge **already reaches the email** as an additional-charge row (rendered by
`pricing_section.tsx:82-97`). What is missing from the email:

1. An explicit **"Included kilometers"** line (total allowance = days×200 + extraCount×50). Currently absent.
2. An explicit, unambiguous **"extra km opted: yes/no + count"** signal. Today it is only implicit in the
   free-text additional-charge description, and `extraKilometersCount` itself is never persisted on the
   reservation document.

### What the reservation document persists today (schema.ts:89-142)

Persisted: `totalPrice`, `additionalCharges[]` (includes the extra-km line), `isSCDWSelected`,
`deductibleAmount`, `protectionCost`, `seasonId`, `seasonalMultiplier`, dates/times/locations, customerInfo.
**Not persisted:** rental `days`, `pricePerDay`, `includedKm`, `extraKilometersCount`. The email is the
only consumer that needs days/pricePerDay and it recomputes them (bugs #1/#2). The confirmation page has the
same problem (AUDIT duplication finding, `confirmation/page.tsx`).

---

## Requirements

1. The SCDW amount in the email must equal the SCDW amount used in the reservation's total, and match what
   the customer saw at checkout — one SCDW value, computed once.
2. The rental-day count in the email must equal the day count the booking was priced with (times-aware
   `calculateRentalDays`), not a time-blind server recompute.
3. The email must show (a) how many kilometers are included in the rental and (b) whether the customer
   opted for extra km (and how many).

## Design

### Guiding principle: persist the priced breakdown, render stored values

The durable fix — aligned with `audit-pricing-security.md` (canonical pricing module) and the AUDIT
confirmation-page finding — is to stop recomputing pricing at email/render time. At booking, persist the
already-computed breakdown on the reservation document and have the email (and confirmation page) render the
stored values.

**Add to the `reservations` schema** (`convex/schema.ts:89`, all as new optional fields for back-compat):
- `rentalDays: v.optional(v.number())` — the priced `calculateRentalDays` result.
- `pricePerDay: v.optional(v.number())` — the seasonal duration-tiered rate actually charged
  (`currentPricePerDay`, already computed at page:720).
- `includedKm: v.optional(v.number())` — total included allowance (days×200 + extra×50), or store base +
  extra separately (see Open questions).
- `extraKilometersCount: v.optional(v.number())` — packages opted (0 = none).

`protectionCost`, `isSCDWSelected`, `deductibleAmount` already exist on the schema and are already emailed —
they only need to be made **consistent with `totalPrice`** (bug #1 fix), not added.

### Fix bug #1 (SCDW): one SCDW value feeding both total and line item

Root fix is to collapse the display path (`calculateTotalPrice`) and submit path (`handleSendReservation`)
onto a single computation so `totalPrice` and `protectionCost` use the **same** SCDW. Options, in order of
preference:

- **Preferred (durable):** extract SCDW + per-day rate into the shared canonical pricing module from
  `audit-pricing-security.md`, compute once, and have both the display summary and the mutation payload read
  the same result. This is the AUDIT-endorsed direction and removes the divergence at the source.
- **Minimal (if the pricing-module work is deferred):** in `handleSendReservation`, stop recomputing
  `currentScdwPrice`/`currentPricePerDay`; reuse the values already produced by `calculateTotalPrice()`
  (`scdwPrice`, `seasonalPricePerDay`, `protectionCost`) that also fed `totalPrice`. This makes the sent
  `protectionCost` and `totalPrice` internally consistent with each other and with the on-screen summary.
  Note: this requires deciding which daily rate is *correct* for SCDW (base-tier vs duration-tier) — a
  product decision (Open question), because today the display uses base-tier and the submit uses
  duration-tier and they must converge on one.

Once the persisted `protectionCost` is consistent with `totalPrice`, the email is automatically correct
because `pricing_section.tsx` already renders `protectionCost` verbatim — no email-template change needed
for bug #1 beyond the upstream consistency fix.

### Fix bug #2 (day count): persist and pass the priced days

- Add `rentalDays` (and `pricePerDay`) to the `createReservation` args and persist them.
- In `createReservation`, **stop** computing `numberOfDays` via `Math.ceil` (`reservations.ts:116-118`);
  use the passed-in `rentalDays` for `rentalDetails.numberOfDays`. Keep a defensive fallback only if
  `rentalDays` is absent (legacy clients).
- `pricePerDay` for the email already uses `args.pricePerDayUsed` (reservations.ts:139) — keep that, but
  drop the `Math.round(totalPrice / numberOfDays)` fallback's dependence on the buggy day count.
- The email template needs no change: `numberOfDays` now arrives correct, so the rental line
  (`pricing_section.tsx` + `calculatePricingBreakdown`) reconciles with the total.

### Requirement #3 (km): surface included + extra km in the email

Data-flow additions:
- Pass `includedKm` (or days for the template to derive) and `extraKilometersCount` from
  `handleSendReservation` → `createReservation` → `sendReservationConfirmationEmail` → email data.
- Extend `convex/emails/types.ts` `RentalDetails` (or `PricingDetails`) and the matching validators in
  `convex/emails.ts` (`rentalDetailsValidator`, line 44) with the km fields.
- Render in the email:
  - **Included km:** a new row in `rental_details_section.tsx` (or `pricing_section.tsx`), e.g.
    "Kilometri incluși / Included kilometers: {includedKm} km".
  - **Extra km:** show the opt-in explicitly. The extra-km **charge** already appears as an
    additional-charge line; add a clear indicator (e.g. include extra packages in the included-km line, or a
    dedicated "Extra kilometers: {count} × 50 km" row). Avoid double-counting the price — the price already
    shows as an additional charge.
- Add email-specific translation strings for the new labels (the templates use inline `isRo` ternaries in
  `UserReservationEmail.tsx:28-69`, mirror that pattern; existing `extraKilometers*` keys in `messages/`
  are for the reservation page, not the email templates, though the additional-charge description text is
  reused verbatim via the persisted `additionalCharges`).

### Admin email path (reservation-email-dialog + inline HTML route)

The admin "Send Email" dialog and its `app/api/send/reservation-email/route.ts` show only `totalPrice` with
no SCDW/day/km breakdown, from a duplicated inline HTML template. Two scopes:
- **In scope for these fixes if the client wants the corrected breakdown in admin-sent mails too:** replace
  the inline HTML template by reusing the canonical `convex/emails` templates (render the same
  `UserReservationEmail` with the persisted breakdown), which also resolves the AUDIT duplication + missing-
  auth findings for that route. This depends on the breakdown being persisted (above).
- **Otherwise:** leave the admin dialog as-is for now; the confirmation email (the customer-facing one) is
  the primary target of requirements #1-#3. Flagged as Open question.

## Implementation steps

1. **Schema:** add optional `rentalDays`, `pricePerDay`, `extraKilometersCount`, `includedKm` to
   `reservations` (`convex/schema.ts:89`).
2. **Pricing consistency (bug #1):** converge the display and submit SCDW computations in
   `app/[locale]/reservation/page.tsx` onto one value (preferably via the canonical pricing module from
   `audit-pricing-security.md`; otherwise reuse `calculateTotalPrice()` outputs in `handleSendReservation`).
   Decide base-tier vs duration-tier rate for SCDW (Open question).
3. **Mutation args + persistence:** extend `createReservation` args (`convex/reservations.ts:27`) with
   `rentalDays`, `pricePerDay`, `extraKilometersCount`, `includedKm`; persist them on the document.
4. **Fix day count (bug #2):** in `createReservation`, use `args.rentalDays` for the email's
   `rentalDetails.numberOfDays` instead of the `Math.ceil` recompute (reservations.ts:116-118).
5. **Email data plumbing:** extend `convex/emails/types.ts` types and `convex/emails.ts` validators with the
   km fields; pass them through `sendReservationConfirmationEmail`.
6. **Email templates:** add included-km + extra-km rows to `rental_details_section.tsx` /
   `pricing_section.tsx` and both `UserReservationEmail.tsx` / `AdminReservationEmail.tsx`; add the inline
   `isRo` labels.
7. **Client submit:** update `handleSendReservation` (`page.tsx:731`) to pass the new fields
   (`rentalDays = days`, `pricePerDay = currentPricePerDay`, `extraKilometersCount`, `includedKm`).
8. **(Optional, pending Open question) Admin path:** replace the inline HTML in
   `app/api/send/reservation-email/route.ts` with the canonical template rendered from persisted data.
9. **Confirmation page alignment:** the reservation confirmation page recomputes days the same way (AUDIT
   finding) — once `rentalDays`/`pricePerDay` are persisted, switch it to stored values so the email,
   confirmation page, and summary all agree. (Coordinate with the pricing/confirmation plan.)

## Dependencies on other plans

- **`audit-pricing-security.md`** — the canonical pricing module is the correct home for the single SCDW /
  per-day computation. Bug #1's durable fix should land on top of it; if that plan is not ready, use the
  minimal in-page consolidation and migrate later. This plan also assumes server-side recompute/validation
  of totals (that plan's scope) will eventually replace trusting client-sent money fields — the persisted
  breakdown fields defined here should be populated by that server-side computation once it exists, not only
  by the client.
- **Confirmation-page / days-persistence work** (AUDIT duplication finding on `confirmation/page.tsx`) —
  shares the `rentalDays`/`pricePerDay` persistence introduced here; coordinate the schema additions so both
  plans use the same fields.
- **Company-identity constants** (`lib/company.ts`, AUDIT duplication finding) — if the admin inline route
  is replaced, reuse the shared identity constants rather than re-hardcoding.

## Open questions

1. **SCDW correct daily rate:** the total currently uses base-tier SCDW, the persisted `protectionCost`
   uses duration-tier SCDW. Which is the intended charge — SCDW on the base (1-day) tier rate, or on the
   duration-tiered rate the customer actually pays? Both paths must converge on this one answer.
2. **Included-km allowance:** 200 km/day is hardcoded in `lib/vehicle-utils.ts`. Confirm 200/day is correct
   and global (not per-class/per-vehicle). If it should be configurable, that is a schema/admin addition
   beyond this plan.
3. **Included-km presentation in the email:** show a single total ("{days×200 + extra×50} km included"), or
   break it into base allowance + extra packages as separate lines?
4. **Extra-km price/packaging confirmation:** extra km is sold in 50 km packages at
   `vehicleClasses.additional50kmPrice` (default 5 EUR), max 5000 km. Confirm these product values are
   correct (they already ship; just validating intent).
5. **Admin email dialog scope:** should the corrected SCDW/day/km breakdown also appear in admin-sent emails
   (requiring replacement of the inline HTML route with the canonical template), or is only the automated
   customer confirmation in scope for now?
6. **Back-compat for existing reservations:** older reservations have no persisted `rentalDays`/`pricePerDay`.
   Keep the time-blind recompute strictly as a fallback for those, or backfill? (Emails are only sent at
   creation time, so this mainly affects the confirmation-page render of old bookings.)

## Size estimate

Medium. The template/plumbing changes (steps 3-7) are mechanical and low-risk. The load-bearing work is the
SCDW consistency fix (step 2), which is small in code but gated on a product decision and ideally rides on
the parallel canonical-pricing plan. Schema additions are additive/optional (no migration required). The
admin-path replacement (step 8) is optional and, if included, adds moderate work plus the auth fix. Roughly
1-2 days if the pricing module lands in parallel; add ~0.5 day if the admin path is in scope.
