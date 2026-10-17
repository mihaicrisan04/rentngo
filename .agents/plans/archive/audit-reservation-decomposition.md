# Reservation Flow Decomposition — Remediation Plan

## Scope

This plan covers the reservation-checkout cluster from `AUDIT.md`:

- **CRITICAL (file-size)** — `app/[locale]/reservation/page.tsx` is an 1888-line `'use client'` God-component: 19 `useState` hooks, localStorage persistence, pricing computed twice (a display path via `calculateTotalPrice()` and a divergent submit path in `handleSendReservation`), Zod validation, submission orchestration, and all card JSX. `calculateTotalPrice()` runs unmemoized in the render body on every keystroke.
- **HIGH (dead-code)** — an abandoned decomposition ships as dead code (`PersonalInfoCard`, `PaymentMethodCard`, `AdditionalFeaturesCard`, the `index.ts` barrel, `useReservationForm`, `useReservationPricing`, `lib/reservation-utils.ts`), imported by nothing live and drifted dangerously.
- **HIGH (duplication)** — `confirmation/page.tsx` reimplements rental-day math (`computeRentalDays`) with divergent rounding; `pricePerDayUsed` is sent to `createReservation` but never persisted, so the confirmation breakdown can silently disagree with the stored `totalPrice`.
- **HIGH (duplication)** — `transfers/booking/page.tsx` re-implements the checkout: a 3rd copy of the payment-methods list, a verbatim terms-acceptance locale ternary, and the same contact-input-plus-error pattern.
- Folded-in mediums: reservation-page i18n gaps (hand-rolled `zi`/`zile` plurals, terms ternary instead of `t.rich`) and the SCDW display drift on `additional-features-card` (the pricing math itself is owned by `audit-pricing-security.md`; only the display wiring is mine).

**Out of scope (owned elsewhere, referenced as dependencies):** the canonical pricing module and the persisted-breakdown schema (`audit-pricing-security.md`); the shared `calculateSCDW` extraction (same); the `DateTimePicker` cross-feature localStorage bleed (`wrong-layer` finding on `date-time-picker.tsx`); the reservation-page two-level query waterfall and the confirmation-page 3-level waterfall (both `performance` findings — server-side joins, tracked separately, though this plan leaves the page shaped to adopt them).

## Context

Verified against the code:

- The **live page is the source of truth**. It uses the correct seasonal pricing (`calculateVehiclePricingWithSeason` + `getPriceForDurationWithSeason` from `lib/vehicle-utils.ts`), an i18n Zod schema (`createReservationSchema(t)`), rich terms links, and proper location defaults (`searchStorage.getDefaultLocation()`).
- The **dead `useReservationPricing`** (`hooks/use-reservation-pricing.ts`) is unsalvageable on the money path: it uses raw `differenceInDays` instead of `calculateRentalDays` (ignores pickup/return times and the same-day rule), applies **no seasonal multiplier**, omits warranty/deductible, computes SCDW off the base (not seasonal) rate, and types `vehicle?: any`.
- The **dead `AdditionalFeaturesCard`** hardcodes English ("SCDW Insurance (Non-refundable)", "Non-refundable insurance", "+50 km for X EUR each") and displays SCDW from `getBasePricePerDay(vehicle)` (no seasonal multiplier) — divergent from the live page which uses the seasonal-adjusted rate.
- The **dead `useReservationForm`** is structurally reasonable (clean state ownership, isolated localStorage, a better list-based `formProgress`) but initializes locations to `""` instead of the default location, and nothing (not even its interfaces) is imported by live code — the grep for importers of the whole dead cluster returns empty. It is a fully closed dead island.
- `lib/reservation-utils.ts` carries a hardcoded-English `paymentMethods` array, an untranslated `validateReservationForm`, and drifted `getStatusColor`/`getPaymentMethodLabel` copies — all dead.
- The **`index.ts` barrel** re-exports the three dead cards plus `UserReservationsTable`, but the only live consumer (`app/[locale]/profile/page.tsx`) imports `UserReservationsTable` **directly** from `./user-reservations-table`, not via the barrel. So the barrel is dead as an entry point and safe to delete/rebuild.
- The **divergence bug is concrete**: in the render path SCDW uses `calculateSCDW(days, Math.round(getBasePricePerDay(vehicle) * seasonalMultiplier))` (page.tsx:414); the submit path recomputes with `currentPricePerDay = seasonalPricePerDay || Math.round(getBasePricePerDay(vehicle) * seasonalMultiplier)` (page.tsx:720-724) — a *duration-tiered* seasonal rate vs a *base* seasonal rate. Displayed SCDW and persisted `protectionCost` can disagree.
- **Persistence gap**: the `reservations` table (`schema.ts:89-148`) stores `seasonalMultiplier` and `seasonId` but **not** `days` or `pricePerDay`. `createReservation` receives `pricePerDayUsed` (used only for the email) and drops it. The confirmation page therefore recomputes both from current vehicle tiers via its own `computeRentalDays` (divergent rounding) + `getPriceForDurationWithSeason`.

## Decision: revive vs rebuild the dead cluster

**Recommendation: delete-and-extract-fresh.** Delete all seven dead files, then extract new hooks/components from the live page's known-good logic.

Justification:

1. **The dead cluster's pricing is wrong on the money path**, and pricing is exactly what this decomposition must get right. Reviving `useReservationPricing` means rewriting it wholesale anyway (add times/same-day day-math, seasonal multiplier, warranty, deductible, tiered SCDW base). There is nothing to revive there.
2. **Reviving is the more error-prone path.** The dead cards and hook have silently drifted from the live implementation line by line (English strings, base-vs-seasonal SCDW, wrong location defaults, `any` types). "Revive and fix" requires diffing every drifted line against the live page to know what to correct — which is strictly more work, and more mistakes, than extracting from the live page that already encodes the correct behavior.
3. **The drift is a latent landmine.** While the files sit unimported they are harmless, but they use the same names (`use-reservation-form.ts`, `use-reservation-pricing.ts`, `additional-features-card.tsx`) a future extraction would want. Deleting first frees those names and removes the "someone swaps the import and ships wrong SCDW numbers" risk.
4. **What's genuinely worth keeping is cheap to re-derive**: the prop-shape skeleton (state + setters + errors), the list-based `formProgress` (which also fixes the Low-severity `totalRequiredFields = 9` magic-number bug), and the `PersonalInfo` / `AdditionalFeatures` / `FormErrors` interface shapes. These are a few dozen lines re-created fresh in Step 3 — no need to inherit the broken parts to keep the good ones.

Net: delete 7 files, rebuild from the live page. `UserReservationsTable` stays (live) and its direct import is unaffected.

## Target architecture

### File tree

```
app/[locale]/reservation/
  page.tsx                         # THIN: Suspense + URL vehicleId + guards + layout composing cards (~180 lines)

hooks/
  use-reservation-form.ts          # NEW — owns all form state, localStorage, hydration, Clerk autofill, formProgress
  use-reservation-pricing.ts       # NEW — memoized PURE pricing derivation; single source of truth for display + submit

lib/
  reservation-schema.ts            # createReservationSchema(t) + Zod-issue → FormErrors mapping (moved out of page)
  checkout-payment-methods.ts      # method IDs + translation-key config (shared reservation + transfer)

components/features/reservations/
  rental-details-card.tsx          # locations + DateTimePickers (currently inline page JSX)
  vehicle-summary-card.tsx         # vehicle image/name/seasonal per-day price
  additional-features-card.tsx     # REWRITTEN, i18n — snow chains, child seats, extra km
  personal-info-card.tsx           # sign-in prompt + name/email/phone/flight/message (wraps shared ContactFields)
  payment-method-card.tsx          # payment radio + terms (wraps shared checkout components)
  reservation-summary-card.tsx     # protection toggle + pricing breakdown + submit button
  user-reservations-table.tsx      # UNCHANGED (live)
  index.ts                         # rebuilt barrel for the new cards + UserReservationsTable

components/features/checkout/      # NEW — shared, parametrized, used by reservation AND transfer booking
  checkout-payment-methods.tsx     # translated payment radio group (kills the 3 copies)
  terms-acceptance.tsx             # t.rich terms/privacy links (kills the locale ternary duplication)
  contact-fields.tsx               # name/email/phone (+ optional flight) inputs with error slots
```

### State ownership map

- **`useReservationForm()`** owns *all* mutable form state and its side effects:
  - rental details: `deliveryLocation`, `pickupDate`, `pickupTime`, `restitutionLocation`, `returnDate`, `returnTime`, and the two calendar-open flags;
  - `personalInfo` (name/email/phone/message/flightNumber);
  - `paymentMethod`, `termsAccepted`;
  - `additionalFeatures` (isSCDWSelected, snowChains, childSeat1to4, childSeat5to12, extraKm);
  - `isHydrated`, `errors`, and a derived `formProgress` (list-based, fixes the magic-number bug).
  - **localStorage is isolated here**: the load-on-hydrate effect and the save-on-change effect live in this hook and nowhere else. Clerk autofill effect lives here too.
  - Returns state + setters (grouped) so cards receive only the slice they need.
- **`useReservationPricing(formState, vehicle, seasonalMultiplier, additional50kmPrice)`** is a **pure, memoized derivation** — no queries, no effects. It returns the full `PricingCalculation` (basePrice, days, pricePerDay, location fees, warrantyAmount, scdwPrice, protectionCost, deductibleAmount, per-feature prices, totalPrice, seasonal fields). It wraps the canonical pricing function (see Dependencies). **The page and the submit handler both read this single object** — the submit path never recomputes. This is the fix for the display-vs-submit divergence and the unmemoized-render finding.
- **`page.tsx`** is a thin coordinator: reads `vehicleId` from the URL, calls `useReservationForm()`, `useDateBasedSeasonalPricing(pickupDate, returnDate)`, the vehicle/class/image queries, and `useReservationPricing(...)`, renders the guards, and lays out the cards passing hook slices down. `handleSendReservation` reads `pricing.*` directly.

## Implementation steps

Each step is an independently reviewable, independently shippable PR that leaves the page working. Order is mostly sequential (2→3→4 build the substrate) but the card extractions (5) are five small parallelizable PRs, and Step 1 can land immediately.

### Step 1 — `chore: remove abandoned reservation decomposition`
Delete the 7 dead files: `personal-info-card.tsx`, `payment-method-card.tsx`, `additional-features-card.tsx`, `hooks/use-reservation-form.ts`, `hooks/use-reservation-pricing.ts`, `lib/reservation-utils.ts`, and trim `index.ts` to only `UserReservationsTable`. No behavior change — the live page has its own inline copies of everything. Verify `npx tsc --noEmit` is clean and grep confirms no live importer of any deleted symbol (already verified empty). **Files:** the 7 above + `components/features/reservations/index.ts`.

### Step 2 — `refactor: extract reservation schema + payment-method config to lib`
Move `createReservationSchema(t)` and the Zod-issue→`FormErrors` mapping into `lib/reservation-schema.ts`. Extract the payment-method config into `lib/checkout-payment-methods.ts` as `{ id, labelKey, descriptionKey, disabled }[]` (translation keys, **not** hardcoded English) plus a derived `PaymentMethod` union type (also fixes the stringly-typed `paymentMethod as ...` cast — a `type-safety` finding). Page imports both; state still lives in the page. **Manual test:** validation still surfaces the same per-field messages; payment options render identically. **Files:** `page.tsx`, `lib/reservation-schema.ts`, `lib/checkout-payment-methods.ts`.

### Step 3 — `refactor: extract useReservationForm hook`
Create `hooks/use-reservation-form.ts` fresh (correct default locations from `searchStorage`, list-based `formProgress`). Move the 19 `useState` hooks, the hydrate/load effect, the save effect, and the Clerk autofill effect into it. Page destructures the hook. **Manual test:** localStorage round-trips (reload keeps selections), Clerk autofill fills name/email/phone once signed in, progress bar tracks all fields, no double-persist regression. **Files:** `page.tsx`, `hooks/use-reservation-form.ts`.

### Step 4 — `refactor: single memoized pricing hook (fix display/submit divergence)`  ← money step
Create `hooks/use-reservation-pricing.ts` as a memoized wrapper over the pricing plan's pure `computeReservationPricing` (from `@/lib/pricing`), and route **both** the render summary and `handleSendReservation` through it. The hook feeds `seasonalMultiplier`/`seasonId` from the existing `useDateBasedSeasonalPricing` output (unchanged), maps form state to the module's `input` shape, memoizes on that input, and returns its breakdown plus a loading flag. Delete `calculateTotalPrice()` from the render body and delete the submit-path recompute (`currentWarrantyAmount`/`currentPricePerDay`/`currentScdwPrice`/`currentProtectionCost`/`currentDeductibleAmount`). The submit payload reads `pricing.protectionCost`, `pricing.deductibleAmount`, `pricing.pricePerDay`, `pricing.days`, `pricing.basePrice`, `pricing.totalPrice`, and `pricing.extrasBreakdown` (which replaces the hand-built `additionalCharges` array). **Consistency constraint (from the pricing plan):** the server recompute regenerates `additionalCharges` from `extrasBreakdown` and overwrites whatever the client sends, so the client submit must build `additionalCharges` from `pricing.extrasBreakdown` **verbatim** — no hand-composed `t(...)` strings the server can't reproduce. The pure module cannot call next-intl, so per-charge prose is not persisted at all: `extrasBreakdown` items are structured `{ code, params, amount }` (Open question #4, resolved), and the submit builds `additionalCharges` from them verbatim so the server recompute reproduces the identical array. **Manual test (critical):** with a >3-day rental under a seasonal multiplier ≠ 1, confirm displayed SCDW == persisted `protectionCost` == `scdwPrice` in the summary; confirm total matches; toggle SCDW/standard and re-verify; verify a same-day and a 1-day rental. **Files:** `page.tsx`, `hooks/use-reservation-pricing.ts`. **Dependency:** consumes `lib/pricing` from the pricing plan. If that module has not landed when this step starts, wrap the current `lib/vehicle-utils` helpers behind the *same return shape* and swap the import when it lands (one-line change) — the shape is locked, so no downstream rework.

### Step 5 — `refactor: extract reservation cards` (5 small PRs)
Pull inline JSX into presentational, `React.memo`-wrapped components, one per PR so the page shrinks reviewably:
1. `rental-details-card.tsx` (locations + DateTimePickers + their error slots).
2. `vehicle-summary-card.tsx` (image/name/year/seasonal per-day price + the `zi/zile` line → replace with next-intl ICU plural, an i18n finding).
3. `additional-features-card.tsx` **rewritten with i18n** (snow chains, child seats, extra km) — fixes the hardcoded-English SCDW/extra-km strings and shows the seasonal rate consistent with the pricing hook.
4. `personal-info-card.tsx` (sign-in prompt + fields) — wraps shared `ContactFields` once Step 6 exists (until then, inline).
5. `reservation-summary-card.tsx` (protection toggle + breakdown + submit button) — replace hand-rolled plural fragments with ICU plurals.
Rebuild `index.ts` to export the new cards. **Manual test after each:** that card renders and behaves identically; page total unchanged. **Files:** each card + `page.tsx` + `index.ts`.

### Step 6 — `refactor: shared checkout components (reservation + transfer)`
Create `components/features/checkout/{checkout-payment-methods,terms-acceptance,contact-fields}.tsx`, driven by the `lib/checkout-payment-methods.ts` config and `t.rich` for terms links. Wire the reservation `payment-method-card` and `personal-info-card` to them. Then migrate `transfers/booking/page.tsx` to the same three components — removing its 3rd payment-methods copy, its terms ternary, and its bespoke contact inputs, and giving the transfer flow translated payment labels (an i18n finding). Keep transfer pricing untouched (it uses the server `calculateTransferPriceByVehicle` query; the shared components are UI-only). **Manual test:** both reservation and transfer submit correctly; transfer payment labels now localized; terms links open. **Files:** the 3 new checkout components, `payment-method-card.tsx`, `personal-info-card.tsx`, `transfers/booking/page.tsx`, `lib/checkout-payment-methods.ts`. **Coordinate** with the transfer-i18n and transfer-booking-perf findings which also touch `transfers/booking/page.tsx`.

### Step 7 — `refactor: confirmation renders persisted breakdown`
The pricing plan adds three optional fields to the `reservations` table — `pricePerDay`, `rentalDays`, `basePrice` (all `v.optional(v.number())`, backward compatible) — and `createReservation` starts persisting them from its **server-side recompute** (today's `pricePerDayUsed` arg is dropped in favor of the recomputed value). So the *persistence* is owned by the pricing plan; my work is the *rendering*: rewrite `confirmation/page.tsx` to read `reservation.rentalDays` / `reservation.pricePerDay` / `reservation.basePrice` directly (the rest of the breakdown — `protectionCost`, `deductibleAmount`, `seasonId`, `seasonalMultiplier`, `additionalCharges` — already lives on the doc). Delete the local `computeRentalDays` reimplementation and the `getPriceForDurationWithSeason` recompute. This page also translates each structured charge's `code`+`params` at render (via the shared `reservationCharges` catalog, replacing the current raw `charge.description` display) — the codes/keys are shared with the email templates and owned by the i18n cluster, so all three surfaces read the same catalog. **Keep a read-time fallback** to the legacy recompute (and legacy `description` strings) when the new fields are absent — old docs are not backfilled. **Manual test:** create a reservation, then change the vehicle's pricing tiers, then reload the confirmation — the breakdown still matches the stored `totalPrice` (no drift); open a pre-existing reservation (fields absent) and confirm the fallback renders sensibly. **Files:** `confirmation/page.tsx` (mine); `convex/reservations.ts` + `convex/schema.ts` owned by the pricing plan. **Hard dependency** on the pricing plan's schema + createReservation changes landing first.

## Dependencies

**Boundary with `audit-pricing-security.md` — confirmed with that plan's agent.** The split is clean: they own the pure module + the schema + the server-side recompute in `createReservation`; I own the client hook that wraps the module and all confirmation rendering. Confirmed contract:

- **Module:** `lib/pricing/` (pure TS, no React/next; Convex imports it too). Client entry `computeReservationPricing(input) → breakdown`, with `input` = `{ vehicle, startDate, endDate, pickupTime, restitutionTime, pickupLocation, restitutionLocation, seasonalMultiplier, seasonId?, isSCDWSelected, extras: { snowChains, childSeat1to4, childSeat5to12, extraKm }, per50kmPrice }` and the return `{ days, pricePerDay, basePrice, deliveryFee, returnFee, totalLocationFees, protectionCost, deductibleAmount, extrasBreakdown[], totalExtras, totalPrice, seasonalMultiplier, seasonId? }`. `vehicle` is structural — `Doc<"vehicles">` satisfies it. `pricePerDay` = duration-tier × season, rounded (a product sign-off on tier-vs-base is pending, but **only the value could change, not the signature**, so building against the shape is safe).
- **Schema:** three new **optional** fields on `reservations` — `pricePerDay`, `rentalDays`, `basePrice` (`v.optional(v.number())`); `createReservation` persists them from its server recompute. Old docs are not backfilled → my confirmation rendering keeps a legacy fallback.

Sequencing:

- Steps 1, 2, 3, 5, 6 are **fully independent** of the pricing plan.
- Step 4 (the divergence fix) consumes `lib/pricing`. If the module hasn't landed when Step 4 starts, wrap the current `lib/vehicle-utils` helpers behind the **locked return shape** and swap the import later (one line) — no downstream rework, since the shape is fixed.
- Step 7 (**confirmation rendering**) **hard-depends** on the pricing plan's schema + `createReservation` changes landing first. Only true blocker; sequenced last.
- **`reservation/page.tsx` single-owner agreement — confirmed.** The pricing plan's "unify the two pricing paths" work and my Step 4 are the *same edit* to that file, so **I own all edits to `reservation/page.tsx`**; the pricing plan's footprint there is zero. It delivers `lib/pricing` + the schema + the server recompute; my Step 4 hook is the sole consumer that rewires the page's pricing onto it. Their plan's Step 2 is updated to note the page-side rewire belongs to this decomposition.
- **i18n cluster (`plan-audit-i18n`) — soft dependency on Steps 4 & 7, resolved.** The shared `reservationCharges` catalog is owned there and its key/param names are now **locked** (see Open question #4 for the final list). Step 4's submit builder and Step 7's confirmation rendering pin those exact keys. Remaining i18n-side items (RO copy client sign-off; email ICU-formatter confirmation) do not affect my surfaces — the confirmation page uses next-intl `t()`, which is ICU-native. If the catalog JSON hasn't landed in `messages/*.json` when Steps 4/7 merge, they can reference the locked keys and the i18n consolidation fills the values.
- **Within this plan:** Step 2 → 3 → 4 are sequential (each builds the substrate the next assumes). Step 5's cards depend on the hooks from 3–4. Step 6 depends on Step 2's config and slots cleanly after the reservation cards exist. Step 1 can land first, standalone.
- **Adjacent, out of scope, flag on touch:** the `DateTimePicker` cross-feature localStorage bleed (another `wrong-layer` finding) sits under the rental-details card — do not "fix" it here, but Step 5's card extraction should not deepen the coupling. The reservation-page query waterfall and confirmation 3-level waterfall are separate `performance` findings; Steps 4/7 leave the page shaped to adopt the server-side joins later.

## Open questions

1. ~~Canonical pricing module~~ — **resolved.** `lib/pricing` `computeReservationPricing`, signature locked (see Dependencies). I own the client `useReservationPricing` hook; they own the pure module.
2. ~~Persisted-breakdown shape~~ — **resolved.** Optional `pricePerDay` / `rentalDays` / `basePrice` on `reservations`; render directly, legacy fallback for old docs.
3. ~~`reservation/page.tsx` ownership~~ — **resolved.** Confirmed I own all edits to that file; the pricing plan's footprint there is zero (it delivers `lib/pricing` + schema + server recompute only). My Step 4 hook is the sole page-side pricing rewire.
4. ~~`additionalCharges` i18n vs server overwrite~~ — **resolved: structured codes.** `extrasBreakdown` items are structured `{ code, params, amount }`; the server persists them and is the authority on the array; the confirmation page (mine) and the email templates (pricing plan, `convex/emails/templates`) translate `code`+`params` against a shared catalog. Client and server stay byte-identical because both derive from the same codes; no locale prose is persisted. **Confirmed contract:**
   - `code ∈ { pickupLocationFee, returnLocationFee, snowChains, childSeat1to4, childSeat5to12, extraKm }`
   - params: `pickupLocationFee`/`returnLocationFee` → `{ location: string }`; `snowChains` → `{ days }`; `childSeat1to4`/`childSeat5to12` → `{ count, days }`; `extraKm` → `{ km }`.
   - `extrasBreakdown` is the full non-base/non-protection line-item list (location fees **and** physical extras), so `totalPrice = basePrice + protectionCost + sum(extrasBreakdown.amount)`; scalar `deliveryFee`/`returnFee`/`totalLocationFees`/`totalExtras` are also exposed for convenience but the array is authoritative and what gets persisted.
   - Schema (pricing-plan-owned, additive): `additionalCharges` item becomes `{ description?: string (legacy), code?, params?, amount }`; readers prefer `code`+`params`, fall back to legacy `description` for old docs.
   - **Shared catalog — LOCKED** by the i18n cluster (`plan-audit-i18n`): new top-level `reservationCharges` namespace, label-only (no amount/arithmetic in the string), ICU plurals. Final keys/params to pin on the confirmation page: `pickupLocationFee {location}`, `returnLocationFee {location}`, `snowChains {days}`, `childSeat1to4 {count, days}`, `childSeat5to12 {count, days}`, `extraKm {km}`. RO strings carry `one/few/other` plural categories (RO CLDR: few = 2–19, other = 20+ → "de zile"); `count` renders as a literal `×{count}` (1–3, no plural). Consumed identically by confirmation page (me), email templates (pricing plan), and submit; it supersedes and deletes the current `reservationPage.payment.additionalCharges` keys once Step 4 drops the client prose builder. Confirmation-page render: `t('reservationCharges.' + charge.code, charge.params)` for the label, `charge.amount` in its own column. **Not my concern but tracked:** the RO copy is a draft pending client sign-off (in the i18n plan), and the i18n/pricing pair is confirming the email render path is ICU-capable (may add a shared `formatCharge()` helper on the email side) — neither affects my confirmation page, which uses next-intl `t()` (ICU-native). Two corrections I flagged so the new copy doesn't inherit today's bugs: (a) the current keys at `reservationPage.payment.additionalCharges` bake the price math into the string (`… = {price} EUR`), which double-renders against the separate amount column — the new copy must drop the `{price}` suffix; (b) they hard-code singular ("{days} zi"/"{days} day"), the hand-rolled-plural i18n bug — the new keys must use ICU `plural`. The old `reservationPage.payment.additionalCharges` keys are deleted once Step 4 removes the client-side `additionalCharges` builder.
5. **`pricePerDay` tier-vs-base** — the pricing plan flagged a pending product sign-off on whether the canonical daily rate is duration-tier × season or base × season. Confirmed it is a single already-rounded integer with no separate display rounding, so summary card, submit payload, and persisted value are the identical number; only that value could shift once product decides — signature-stable, does not block.
6. **Shared-checkout home** — `components/features/checkout/` (recommended) vs `components/shared/`. Recommending `features/checkout` since it's checkout-domain, not generic UI.
7. **Transfer booking asymmetry** — transfer pricing is server-computed (`calculateTransferPriceByVehicle`) while reservation is client-computed. The shared checkout components are UI-only (payment/terms/contact), so this asymmetry is fine; no attempt to unify the two pricing paths.

## Size estimate

**Large — ~9 PRs, sequenced but individually small.**

| Step | PR | Rough size |
|---|---|---|
| 1 | delete dead cluster | XS (deletions only) |
| 2 | schema + payment config to lib | S |
| 3 | `useReservationForm` hook | M |
| 4 | single pricing hook (divergence fix) | M — highest-risk, needs careful manual pricing tests |
| 5 | 5 card extractions | 5 × S |
| 6 | shared checkout + transfer migration | M |
| 7 | persist + confirmation | S (gated on pricing plan) |

The 1888-line page should land near ~180 lines. The critical correctness win (Step 4) is decoupled from the pricing plan and can proceed early; the only hard external gate is Step 7 on the persisted-breakdown schema.
