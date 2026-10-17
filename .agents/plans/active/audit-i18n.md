---
linear: unlinked
last-verified: 2026-07-22
verification-source: repository-only
---

# Remediation Plan: i18n Hardcoded Strings

## Scope (findings covered)

This plan closes the **i18n** audit cluster — hardcoded, mostly-English copy on a
Romanian-default product — plus the i18n-relevant slices of several duplication findings.
From `AUDIT.md`:

- **High / `i18n`** — the big one: the entire transfers flow (pages + components),
  `mapbox-location-search` internals **and** its `language:'en'` API param,
  `blog-list-client` pluralization, the SCDW explainer, toasts on booking/contact,
  and `app/[locale]/error.tsx`.
- **Medium / `i18n`** — hand-rolled plural logic in the reservation page (`zi`/`zile`,
  `{plural}` suffix params), the terms-and-conditions locale-ternary JSX, and mixed
  `t()` + hardcoded English in `user-reservations-table`.
- **Duplication findings that carry untranslated strings** — the transfers booking
  payment-method list (a hardcoded-English third copy), and the dead English strings in
  `lib/reservation-utils.ts` (payment labels, validation messages, status labels).

**Explicitly out of scope** (owned by other plans, cross-referenced below):
- `terms/page.tsx` / `privacy/page.tsx` RO-only-content finding and
  `testimonials-with-marquee` / `faq` baked-in content → **`feature-copy-update.md`**
  (client is sending new copy; those are content decisions, not mechanical extraction).
- Splitting the 1888-line reservation page → **`audit-reservation-decomposition.md`**.
  This plan only extracts *strings* from that page; it does not restructure it.
- The `getPaymentMethodLabel` / `getStatusBadge` consolidation → duplication cluster;
  here we only ensure the surviving copy is translated.

## Inventory (file → flows → key counts)

Verified by reading every flagged file. All transfer files are already client components
that call `useTranslations` — they simply bypass it for the strings below. The
`transferPage` namespace already exists and is partially wired; gaps are new sub-keys.

### Transfers flow — pages

| File | Hardcoded strings (what) | ~new keys |
|---|---|---|
| `app/[locale]/transfers/page.tsx` | 4 feature cards (title+desc) in a local `features` array, lines 18–43 | 8 |
| `app/[locale]/transfers/booking/page.tsx` | payment labels+descriptions (44–54), `Invalid email format` (141), 6 toast strings (176, 221–222, 228–229), Missing-Details empty state (257–263), `Back to Vehicle Selection` (277), booking subtitle (286), Luggage label/placeholder/helper (386–398), message tooltip (408), terms-checkbox locale-ternary (483–525) | ~15 (payment reuses existing) |
| `app/[locale]/transfers/vehicles/page.tsx` | `Loading...` (72), Missing-Details empty state (87–94), `Back to Search` (109), `From: `/`To: ` route labels (115, 122) | ~5 (2 shared) |
| `app/[locale]/transfers/confirmation/[transferId]/page.tsx` | `Transfer Not Found` + body (138–140), `Book a New Transfer` (144), field labels Pickup/Dropoff/Date/Time/Passengers/Luggage/Return Trip/Return Date/Return Time (197–274), `{n} bags` / `{n} seats` / `Flight:` prefix (248, 307, 337), hardcoded step-3 `Driver Assignment` + desc (420–422). Dead `formatDuration` (57–63) — delete, don't translate | ~16 |

### Transfers flow — components

| File | Hardcoded strings (what) | ~new keys |
|---|---|---|
| `components/features/transfers/transfer-search-form.tsx` | `💡 Tip:` + 4+passengers banner (309), `Calculating route...` (346), inline `km`/`min`/`h` units (322, 330–331) | ~3 (units shared) |
| `components/features/transfers/transfer-vehicle-list.tsx` | no-vehicles body w/ inline `passenger`/`passengers` (145–147), route-warning banner (192–194), `{n} vehicle(s) available` inline plural (212–213), `km` (168) | ~3 |
| `components/features/transfers/transfer-vehicle-card.tsx` | `Selected` badge (64) + button label (144), `€` currency + `km` units | ~2 (units/currency shared) |
| `components/features/transfers/transfer-summary-card.tsx` | Pickup/Dropoff/Date/Time/Return Trip/Return Date/Return Time (115–169), inline `Passenger`/`Passengers` plural (182), local `formatDuration` units + `km` + `€` | ~0–2 (reuse confirmation + shared units; also dedupes `formatDuration` per duplication finding) |
| `components/features/transfers/transfer-booking-sidebar.tsx` | `Continue` ×2 (99, 116), `€` | 1 |
| `components/shared/search-filters/mapbox-location-search.tsx` | 6 internal strings (token error 187, search placeholder 238, `Searching locations...` 247, `No locations found.` 251, min-chars hint 256, `Clear selection` 294, default placeholder 52) **+ `language: "en"` on line 84** | 6 + locale plumbing |

### Reservation & shared surfaces

| File | Hardcoded strings / anti-pattern | ~new keys |
|---|---|---|
| `app/[locale]/reservation/page.tsx` | hand-rolled plurals: `zi`/`zile`+`day`/`days` rate line (1051–1065), `{plural}` suffix params in `daysCount` (1621–1633) and `basePrice` (1757–1769); terms-checkbox locale-ternary (1496–1540); strays `EUR / Day` (1049), `at` connectors (1591, 1611), `km` (1645), phone placeholder (1367), Suspense `Loading...` (1884) | ~6 (+ rewrite 2 existing keys to ICU) |
| `components/features/reservations/user-reservations-table.tsx` | `From:`/`To:`/`Pickup:`/`Return:`/`Promo:` labels (129–147), `✓ SCDW (Zero deductible)` (152), `✓ Standard Warranty (… EUR deductible)` (155), `Showing X to Y of Z reservations` (169), `{page} of {total}` (181), `Loading...` ×2 (58, 92) | ~10 |
| `components/features/blog/blog-list-client.tsx` | `{n} post`/`posts` inline ternary (102) → ICU plural | 1 |
| `components/features/reservations/additional-features-card.tsx` | SCDW explainer block (68–99) + extra-km footer (288). **DEAD component** — the live SCDW UI is inline in `reservation/page.tsx`. Extract from the live location; delete or wire this file per the decomposition plan | ~13 (at live location) |
| `app/[locale]/contact/page.tsx` | `Phone number copied to clipboard!` toast (35); WhatsApp prefilled message (28); alt texts (217, 279) | ~2 |
| `app/[locale]/error.tsx` | all 4 strings (heading 16, body 17–19, `Try again` 23, `Go home` 26). No `useTranslations` yet | 4 |
| `lib/reservation-utils.ts` | payment labels/descriptions, 12 validation messages, status labels — **all dead code**. Delete, do not translate | 0 (delete) |

**Rough totals:** ~90–110 new message keys → ~180–220 new EN+RO string values, covering
~150 hardcoded occurrences across ~15 files, plus one locale-plumbing change (mapbox).

## Design

### Owned shared deliverable: `reservationCharges` catalog (cross-team)

**Status: FULLY LOCKED. Codes, params, copy, and the email-render formatter all confirmed
with both `plan-audit-reservation-decomp` and `plan-audit-pricing-security`.**
The two peer plans changed reservation `additionalCharges` from persisted locale prose to
structured, server-authoritative entries `{ code, params, amount }`. **This plan owns the
single shared translation catalog** — a new top-level `reservationCharges` namespace in
`messages/en.json` + `messages/ro.json`, consumed identically by three surfaces: the
confirmation page (reservation-decomp), the reservation email templates (pricing-security,
`convex/emails/templates`), and the client submit path.

Two rules that fix the bugs in the current `reservationPage.payment.additionalCharges`
keys (the catalog must NOT inherit them):

1. **Label-only, no amount.** Each surface renders `amount` from the structured entry in
   its own column. The message describes the line item only — no `{price}`, no `= … EUR`
   tail, no inline `× 3 EUR` arithmetic. The current keys bake the price into the string,
   which double-renders the amount next to the surface's own amount column.
2. **ICU plurals, not hardcoded singular.** Current keys emit `{days} day`/`{days} zi`
   always (renders "2 day"/"2 zi"). Use `{days, plural, …}` with RO's `one`/`few`/`other`
   categories — RO CLDR: `one` = 1, `few` = 0 and 2–19, `other` = 20+ (which takes the
   "de zile" form). This is itself one of the cluster's own i18n findings.

**LOCKED codes + params** (from reservation-decomp, agreed with pricing-security — my ICU
variables match these 1:1; note `extraKm` uses `km`, not `kilometers`):

| code | params |
|---|---|
| `pickupLocationFee` | `{ location: string }` |
| `returnLocationFee` | `{ location: string }` |
| `snowChains` | `{ days: number }` |
| `childSeat1to4` | `{ count: number, days: number }` |
| `childSeat5to12` | `{ count: number, days: number }` |
| `extraKm` | `{ km: number }` |

**Final catalog copy** (EN final; RO = draft for client sign-off — functional labels, lower
marketing risk than hero copy, but still flagged in Open questions):

```
// messages/en.json
"reservationCharges": {
  "pickupLocationFee": "Pick-up location fee ({location})",
  "returnLocationFee": "Return location fee ({location})",
  "snowChains": "Snow chains ({days, plural, one {# day} other {# days}})",
  "childSeat1to4": "Child seat (1–4 yrs) ×{count}, {days, plural, one {# day} other {# days}}",
  "childSeat5to12": "Child seat (5–12 yrs) ×{count}, {days, plural, one {# day} other {# days}}",
  "extraKm": "{km} extra km"
}
// messages/ro.json (DRAFT — client review)
"reservationCharges": {
  "pickupLocationFee": "Taxă livrare la {location}",
  "returnLocationFee": "Taxă returnare la {location}",
  "snowChains": "Lanțuri de zăpadă ({days, plural, one {# zi} few {# zile} other {# de zile}})",
  "childSeat1to4": "Scaun copil (1–4 ani) ×{count}, {days, plural, one {# zi} few {# zile} other {# de zile}}",
  "childSeat5to12": "Scaun copil (5–12 ani) ×{count}, {days, plural, one {# zi} few {# zile} other {# de zile}}",
  "extraKm": "{km} km suplimentari"
}
```

`count` on child seats is rendered as `×{count}` (values are 1–3; no plural needed). If
copy later wants a pluralized seat noun, it becomes a second ICU plural on `count`.

**Email render path — RESOLVED (with `plan-audit-pricing-security`).** The confirmation page
and client submit path render via `next-intl` (ICU-native — plurals expand). The email path
today uses a hand-built `labels` object with inline JS-ternary plurals (itself the RO-plural
bug) and is NOT ICU-capable as-is. Agreed resolution = **option (b): the email side adopts
an ICU formatter directly.** Pricing-security owns adding `intl-messageformat`
(`IntlMessageFormat`) in a `formatCharge(code, params, locale)` helper in
`convex/emails/utils.ts` that reads this same `reservationCharges` subtree from
`messages/*.json`. `convex/emails.ts` is a Convex **Node action** (`"use node"`) with full
ICU, so `Intl.PluralRules('ro')` resolves `one`/`few`/`other` natively — no polyfill — and
output is byte-identical to next-intl (same formatjs engine). Their charge renderer
(`pricing_section.tsx`) already puts `amount` in its own column, so the label-only rule
drops in cleanly. **Consequence for this plan: author the keys as pure ICU** (done above);
no non-ICU fork, no shared helper required on the web side (it uses `t(code, params)`
natively). `location` values are raw stored place names (e.g. "Aeroport Cluj-Napoca") passed
straight into `{location}` — not translated.

Consumers (do not duplicate the catalog): `app/[locale]/reservation/confirmation/page.tsx`
(`plan-audit-reservation-decomp`), the reservation email templates under
`convex/emails/templates` (`plan-audit-pricing-security`), and the client submit path. The
legacy `reservationPage.payment.additionalCharges` keys (params
`location`/`days`/`count`/`kilometers`/`price`) are **deleted** in this consolidation once
reservation-decomp's Step 4 drops the client-side additionalCharges prose builder.

**Adjacent (not part of `reservationCharges`, flagged by reservation-decomp):** the
confirmation page's base-rental line uses `confirmationPage.baseRentalLine`
(`{ days, price }`) — already correct ICU (`{days, plural, one {day} other {days}}`), so it
stays as-is; reservation-decomp will feed it persisted `rentalDays`/`pricePerDay` in their
Step 7. The `reservationPage` summary day-count strings (`daysCount`, `basePrice`) are the
same singular/plural family and are already covered by this plan's reservation-page ICU
rewrites (Design → Pluralization). If either `baseRentalLine`'s shape changes, this plan
flags the final key to reservation-decomp so they pin it; no change currently planned.

### Namespace layout (extends existing conventions in `messages/*.json`)

Both files share one key tree (RO is the translation of EN). Follow the existing
page-namespace / component-namespace split. Additions:

- **`transferPage.features`** — `{ premiumVehicles: {title, description}, safe: {…},
  onTime: {…}, anyDestination: {…} }` (new sub-namespace; page.tsx feature array).
- **`transferPage.booking`** — extend with `subtitle`, `luggageLabel`,
  `luggagePlaceholder`, `luggageHelp`, `messageTooltip`, `backToVehicles`,
  and `toasts.{missingInfo, successTitle, successBody, failedTitle, failedBody}`
  (`successBody` interpolates `{number}`).
- **`transferPage.emptyState`** — shared `missingDetails.{title, bodyBooking,
  bodyVehicles, startOver, backToSearch}`, `notFound.{title, body}`. Used by
  booking, vehicles, and confirmation empty screens (dedupes the twice-hardcoded
  "Missing Transfer Details").
- **`transferPage.confirmation`** — extend with `pickup`, `dropoff`, `date`, `time`,
  `passengers`, `luggage`, `bags` (ICU plural on `{count}`), `returnTrip`, `returnDate`,
  `returnTime`, `seats` (ICU plural), `flightPrefix`, and
  `driverAssignment.{title, description}`.
- **`transferPage.searchForm`** — extend with `passengerTip.{label, body}`,
  `calculatingRoute`.
- **`transferPage.vehicleSelection`** — extend with `noVehiclesFor` (ICU plural on
  `{passengers}`), `routeWarning`, `resultCount` (ICU plural on `{count}`),
  `routeFrom`, `routeTo`.
- **`transferPage.vehicleCard`** — `selected`, `select` (button/badge).
- **`common.units`** — `km`, `minutes`, `hours`, `hoursMinutes` (`{h}h {m}min`),
  `currencyEur` or reuse existing `EUR`/`€` convention. Shared across all transfer
  components so unit formatting lives once. Cross-check the existing `lib/mapbox.ts`
  `formatDuration` — prefer wiring that helper to accept translated unit strings rather
  than three inline copies (this also satisfies the `formatDuration` duplication finding).
- **`errorPage`** — new top-level: `{ title, description, tryAgain, goHome }`.
- **`profile.table`** (existing namespace `profile`) — extend with `fromLabel`,
  `toLabel`, `pickupLabel`, `returnLabel`, `promoLabel`, `scdwZeroDeductible`,
  `standardWarranty` (interpolates `{amount}`), `showingRange` (`{from},{to},{total}`),
  `pageOf` (`{page},{total}`), `loading`, `loadingReservations`.
- **`blogPage.postCount`** — `{count, plural, one {# post} other {# posts}}`.
- **`contactPage`** (existing) — `phoneCopied`, `whatsappMessage`.
- **Payment methods** — **reuse the existing `reservationPage.payment.methods.*`**
  (label + description already present for all three methods). The transfers booking page
  should read from a shared source keyed by `method.id`, not its own hardcoded array; the
  dead `lib/reservation-utils.ts` list is deleted. If a truly shared namespace reads
  cleaner, promote to `common.paymentMethods` and point both flows at it (coordinate with
  the payment-method duplication finding owner).

### Server vs client translation API (match neighbors)

Every file in this cluster is already a **client component** (`"use client"`), so all use
**`useTranslations(ns)`** — no `getTranslations` changes are needed here. Specifics:

- Transfer pages/components: add the extra `t(...)` calls; several files need a second
  `useTranslations` for a shared namespace (e.g. `common` for units). `error.tsx` gains
  its first `useTranslations("errorPage")`.
- `mapbox-location-search.tsx` currently has **no** i18n wiring and receives **no
  locale**. It gets label/placeholder as props from the parent form. Plan: add
  `useTranslations` for its internal strings, and make the Mapbox `language` param
  locale-aware via **`useLocale()`** (from `next-intl`) — set `language: locale` on
  line 84. `transfer-search-form.tsx` does not currently call `useLocale`; the locale can
  come from `useLocale()` inside mapbox itself, so no prop drilling is required. Leave
  `country: "RO"` / `proximity` as geographic scoping (not language) unless product wants
  otherwise (open question).
- **Do not** convert `transfers/page.tsx` to a server component here even though a
  `wrong-layer` finding suggests it — that is a separate refactor; keep this plan
  string-only to avoid merge conflicts with that work.

### Pluralization (next-intl ICU)

The codebase already has a correct example (`transferPage.searchForm.passengerCount`,
`reservationPage.vehicleDetails... baseRentalLine`) **and** a pervasive anti-pattern: a
`{plural}` suffix param pre-computed in JS (`daysCount`, `basePrice`, `totalFor`,
`rateFor`, `forDays`, `dayRangePlus`, …). Standardize new work on **ICU inline plurals**:

```
"resultCount": "{count, plural, one {# vehicle available} other {# vehicles available}}"
```

and pass only the count from the component (`t("resultCount", { count })`). Convert the
in-scope hand-rolled cases:
- `blog-list-client` `post`/`posts` → `blogPage.postCount`.
- Reservation `zi`/`zile`+`day`/`days` rate line → one ICU key per locale (RO plural
  category differs — RO uses `one`/`few`/`other`; author the RO message with all three).
- Rewrite `reservationPage.reservationSummary.daysCount` and `.basePrice` to drop the
  `{plural}` param in favor of `{days, plural, …}`, and update the two call sites to stop
  passing `plural`. (The other `{plural}` keys outside this cluster's files are left for
  the copy-update pass to avoid scope creep, but noted as the same debt.)
- Confirmation `{n} bags` / `{n} seats` → ICU plurals.

### Rich text (terms & conditions)

The terms-acceptance blocks (reservation 1496–1540, booking 483–525) are bilingual
locale-ternary JSX with two inline `<Link>`s. `t.rich` is **not yet used anywhere** in the
repo — introduce it here:

```
"termsAcceptance": "I accept the <terms>Terms and Conditions</terms> and <privacy>Privacy Policy</privacy>"
```

rendered with `t.rich("common.termsAcceptance", { terms: (c) => <Link…>{c}</Link>,
privacy: (c) => <Link…>{c}</Link> })`. One shared key in `common` used by both checkouts.

## Implementation steps (by flow, files touched)

Order chosen so shared keys land before consumers, and dead code is removed before
translating (avoids translating strings that then get deleted).

1. **Delete dead code first.** `lib/reservation-utils.ts` (confirm no live imports of the
   label/validation/status exports — inventory found none; `payment-method-card` only uses
   `method.id`). Remove the dead `formatDuration` in the confirmation page and the dead
   local copy in `additional-features-card` per the decomposition plan's disposition.
   *Touches:* `lib/reservation-utils.ts`, `.../confirmation/[transferId]/page.tsx`.

2. **Add shared keys** to `messages/en.json` + `messages/ro.json`: `common.units`,
   `common.termsAcceptance`, `transferPage.emptyState`, `errorPage`, and the plural
   rewrites. RO values are **draft translations flagged for client review** (see Open
   questions). Keep EN and RO key trees identical (a structure-diff check is in
   Verification).

3. **error.tsx** — wire `useTranslations("errorPage")`; replace 4 strings. (Also note the
   non-localized `Link href="/"` for the copy/nav owner, but out of string scope.)

4. **Transfers pages** — booking, vehicles, confirmation, landing: add the new `t(...)`
   calls, point empty-states at `transferPage.emptyState`, point payment at the existing
   `reservationPage.payment.methods` (or shared), replace toasts, replace terms-ternary
   with `t.rich`.

5. **Transfers components** — search-form, vehicle-list, vehicle-card, summary-card,
   booking-sidebar: replace labels/units/plurals; consolidate `formatDuration` on the
   translated `lib/mapbox.ts` helper.

6. **mapbox-location-search** — add `useTranslations` for internal strings and
   `useLocale()`; set `language: locale` on the suggest call (line 84).

7. **Reservation page** — convert the three hand-rolled plural sites to ICU, replace the
   terms-ternary with the shared `t.rich` key, extract the SCDW explainer strings (live
   inline copy) into `reservationPage`, mop up the stray literals. Coordinate line ranges
   with `audit-reservation-decomposition.md` to avoid conflicting edits.

8. **user-reservations-table** and **blog-list-client** — extend `profile`/`blogPage`
   namespaces and replace the mixed/hardcoded strings and the `post`/`posts` ternary.

9. **contact page** — `phoneCopied` toast + `whatsappMessage`.

## Verification (prove no visible English remains on RO pages)

1. **Key-tree parity** — a script asserting `en.json` and `ro.json` have identical key
   sets (recursively) and that no RO value is byte-identical to its EN value except for a
   known allowlist (brand terms, units like `km`). Catches missed RO drafts and keys added
   to one file only. Run in CI-style locally before opening the PR.
2. **Hardcoded-string grep heuristic** — over the files in scope, grep for JSX text nodes
   and toast/label literals that are not inside a `t(`/`t.rich(` call, e.g.
   `rg -n '>[A-Z][a-z]+ [a-z]' <files>` and `rg -n 'toast\.(success|error)\("' <files>`
   to surface any remaining English literal. Also `rg -n "language: ['\"]en['\"]"` must
   return nothing.
3. **Anti-pattern grep** — `rg -n "plural:\s" app components` should return only the
   deliberately-deferred out-of-scope keys; the in-scope call sites must be gone. `rg -n
   "=== ['\"]ro['\"]" app components` should not appear in the terms-checkout blocks.
4. **Manual page sweep with `?locale` forced to `ro`** — load each surface in the RO locale
   and confirm no English is visible:
   - `/ro/transfers` (feature grid, how-it-works)
   - `/ro/transfers/vehicles` with and without a completed search (empty state + `From/To`)
   - `/ro/transfers/booking` (payment methods, luggage, terms checkbox, then trigger the
     success and error toasts)
   - `/ro/transfers/confirmation/<id>` (all field labels, bags/seats plurals, driver step,
     and a not-found id → "Transfer Not Found")
   - mapbox search dropdown: type <2 chars (hint), a query (results in Romanian),
     and force a token/error state
   - `/ro/blog` (post count), `/ro` reservation flow (rate line + summary plurals + terms),
     `/ro/profile` reservations table (labels, pagination), `/ro/contact` (copy toast),
     and a forced runtime error to hit `error.tsx`.
5. **Plural correctness** — check RO `one`/`few`/`other` categories render correctly at
   counts 1, 2, and 5 (RO uses `few` for 2–19), not just the EN `one`/`other`.
6. **Typecheck gate** — `npx tsc --noEmit` clean (the CI gate); watch for `t.rich` render
   prop typing and any newly-required `useLocale` imports.

## Dependencies

- **`feature-copy-update.md` (in flight) — sequencing win, coordinate closely.** That plan
  swaps client-provided copy into the *same* message files and lists the *same* hardcoded
  surfaces. Doing this extraction **first** gives that copy a single place to land: once
  strings are centralized, the copy update becomes a JSON-only edit instead of hunting
  through components. Concretely: land the namespace additions here, then the copy pass
  overwrites values. Agree the namespace names with that plan's owner **before** creating
  keys so we don't create divergent keys for the same string.
- **`audit-reservation-decomposition.md`** — both touch `reservation/page.tsx`. Decide
  ordering: extracting strings first (small, mergeable) then decomposing is lower-risk than
  the reverse. The dead `additional-features-card`/`payment-method-card` disposition is
  owned there; this plan defers to its decision (delete vs. make canonical).
- **Payment-method duplication finding** — align on one shared payment-method source so we
  don't translate three copies. Reuse `reservationPage.payment.methods` or promote to
  `common.paymentMethods`.
- **`lib/mapbox.ts` `formatDuration` duplication finding** — the unit-string consolidation
  here should use the canonical helper, not add a fourth copy.
- **Shared `reservationCharges` catalog (owned here) — cross-team contract, LOCKED.**
  `plan-audit-reservation-decomp` (confirmation page) and `plan-audit-pricing-security`
  (email templates), plus the client submit path, consume this namespace to translate
  structured `{ code, params, amount }` additionalCharges. Codes, params, copy, and the
  email formatter are all confirmed (see "Owned shared deliverable"). Both peers have pinned
  the keys in their own plans. This catalog must land before either consumer migrates off
  the legacy `reservationPage.payment.additionalCharges` keys (which this plan deletes).
- No package changes for the web path: `next-intl` already supports ICU plurals and
  `t.rich`. The email path adds `intl-messageformat` (owned by `plan-audit-pricing-security`,
  in `convex/emails/utils.ts`) — not a dependency of this plan, noted for coordination.

## Open questions

1. **Romanian copy sign-off (blocking for RO values).** New keys need Romanian. This plan
   produces **draft RO translations clearly marked for client review**; final marketing
   wording must come from the client (same source as `feature-copy-update.md`). Which draft
   RO strings are safe to ship provisionally vs. must wait for client copy?
2. **Mapbox geographic scoping** — should `country`/`proximity` stay hardcoded to Romania,
   or also follow locale/market? (Language param is clearly locale-aware; geography is a
   product call.)
3. **Payment-method casing** — existing `reservationPage.payment.methods` uses
   "Cash on delivery" (sentence case) and marks card-online "(coming soon)";
   `confirmationPage.paymentMethods` uses Title Case with no "coming soon". Which is
   canonical once shared? (Coordinate with the duplication owner.)
4. **`{plural}` suffix debt outside this cluster** — do we rewrite all ~10 `{plural}`-param
   keys to ICU now, or only the in-scope ones and leave the rest to the copy pass? (This
   plan does only the in-scope ones.)
5. **Addresses / phone numbers / WhatsApp text** in contact page — treat as
   locale-invariant constants (a `lib/company.ts` per the company-identity duplication
   finding) or as translatable copy? Recommend constants module, not message keys.
6. **`reservationCharges` RO drafts — client sign-off (blocking RO values).** The six RO
   catalog strings are drafts. They are functional line-item labels (lower marketing risk
   than hero copy) so likely safe to ship provisionally, but confirm with the client.
7. **Email render formatter — RESOLVED (no longer open).** `plan-audit-pricing-security`
   owns adding `intl-messageformat` in a `formatCharge(code, params, locale)` helper in
   `convex/emails/utils.ts` (Node action, full ICU, no polyfill). Keys are authored as pure
   ICU; the web side uses next-intl's `t()` natively. See the "Owned shared deliverable"
   section.

## Size estimate

Medium. ~15 files edited + 2 message files, ~90–110 new keys (~180–220 EN+RO values),
one locale-plumbing change (mapbox), a handful of ICU/`t.rich` rewrites, and one dead-file
deletion. Mechanically straightforward and low-risk (no logic changes), but volume-heavy
and gated on RO copy sign-off. Estimate **1–1.5 days** of implementation once namespaces
are agreed with the copy-update owner, excluding client turnaround on Romanian wording.
Best sequenced immediately **before** the copy-update pass.
