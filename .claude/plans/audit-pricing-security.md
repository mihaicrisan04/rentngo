# Remediation Plan — Pricing Integrity + Security

Highest-priority audit workstream. Prerequisite for the coupon and affiliate features
(both need an authoritative server-side price to discount/attribute against) and it
overlaps the email-fixes plan (both want a persisted price breakdown on the documents).

Source: `AUDIT.md`. All findings below were re-verified against current code on branch
`audit/thermo-nuclear-code-review`.

---

## Scope (findings covered)

**Pricing integrity**
- CRITICAL (wrong-layer) — `createReservation` / `createTransfer` are public, unauthenticated
  mutations that trust client-supplied money fields (`totalPrice`, `protectionCost`,
  `deductibleAmount`, `baseFare`, `distancePrice`, `seasonalMultiplier`) and store them
  verbatim, even emailing the client-chosen price. All pricing rules live only in client
  code. → Recompute authoritatively inside the create mutations from a shared pure module.
- CRITICAL (duplication) — the SCDW formula is copy-pasted in 4 files, fed **four different
  daily-rate inputs**, so the SCDW shown differs from what's charged and what admins
  recompute. → One canonical implementation.
- Duplication — transfer pricing formula in **3 copies** (`transferPricing.ts`
  `calculateTransferPrice` + `calculateTransferPriceByVehicle` + an inline copy in
  `transfers.getTransferVehiclesWithImages`).
- Duplication — `lib/season-utils.ts` is a line-for-line mirror of
  `convex/seasons.getMultiplierForDateRange`; the Convex query has zero callers (dead server
  copy of pricing-critical logic).
- Wrong-layer — `LOCATION_DATA` / `getLocationPrice` (revenue-bearing delivery fees) are
  hardcoded inside the shared UI component `location-picker.tsx`; `lib/vehicle-utils.ts`
  imports them from a component (inverted lib→component dependency), so the server can't see
  fees.
- Duplication (confirmation divergence) — `pricePerDayUsed` is passed to `createReservation`
  but never persisted, so the confirmation page recomputes price-per-day from *current* tiers/
  season and can silently disagree with the stored `totalPrice`. → Persist the breakdown.

**Security**
- CRITICAL — admin Convex writes (vehicles, blogs, seasons, transferPricing, vehicleClasses)
  have **zero auth**; enforcement lives only in Next middleware, which direct Convex calls
  bypass. 28 mutations/actions to gate (enumerated below).
- Duplication — `transfers.ts` hand-rolls the identity→`by_clerk_id`→`role` check 6 times with
  inconsistent failure modes; `cancelTransfer` skips it entirely.
- HIGH — `cancelTransfer` / `cancelReservation` don't verify ownership; `getTransferById`,
  `getTransfersByVehicle`, `getReservationsByVehicle` expose customer PII publicly.
- HIGH — `app/api/send/reservation-email/route.ts` is an unauthenticated open email-sender.

Related but **out of scope here** (cross-referenced only): the 1888-line reservation-page
decomposition, admin-dialog duplication, N+1 image queries, pagination. Those are the
maintainability/perf clusters; this plan only touches those files where the money path
forces it.

---

## Context (verified facts that shape the design)

**The SCDW formula is identical in all 4 copies** — the divergence is purely the daily rate
fed in. Confirmed formula:
```ts
function calculateSCDW(days: number, dailyRate: number): number {
  const base = dailyRate * 2;              // 1–3 days
  if (days <= 3) return base;
  const blocks = Math.ceil((days - 3) / 3);
  return base + 6 + 5 * (blocks - 1);      // +6 first extra block, +5 each after
}
```
The four daily-rate inputs actually in use:

| Site | daily rate fed to SCDW | tier | seasonal |
|---|---|---|---|
| `reservation/page.tsx` display (`calculateTotalPrice`, ~L414) | `round(getBasePricePerDay(v) * mult)` | base | yes |
| `reservation/page.tsx` submit (`handleSendReservation`, ~L720) | `seasonalPricePerDay` = `getPriceForDurationWithSeason(v,days,mult)` | **duration** | yes |
| `additional-features-card.tsx` (L91,101) | `getBasePricePerDay(v)` | base | **no** |
| `edit-reservation-dialog.tsx` suggested total (L338) | `getPriceForDurationWithSeason(v,days,effMult)` | duration | yes |
| `edit-reservation-dialog.tsx` persisted `protectionCost` (L393) | `getBasePricePerDay(v)` | base | **no** |
| `hooks/use-reservation-pricing.ts` (dead, L76) | `getBasePricePerDay(v)` | base | **no** |

So within a single booking the SCDW **displayed** (base×season) differs from the SCDW
**persisted** (duration×season); the persisted `totalPrice` and `protectionCost` are already
internally inconsistent. Picking one canonical daily rate is a product decision (see Open
Questions) — recommendation: **duration-tier × season**, matching what the rental subtotal
itself uses.

**The warranty/deductible table exists in exactly one place** — `calculateWarranty(vehicle)`
in `reservation/page.tsx` (~L327-354): uses `vehicle.warranty` if set, else falls back by
`vehicle.type` (economy 300 / compact 400 / midsize|intermediate 500 / standard|fullsize 600
/ suv|premium 800 / luxury 1000 / default 500). The admin edit dialog has **no** table and
treats deductible as a manual free-text field. `deductibleAmount = isSCDWSelected ? 0 :
warranty`; `protectionCost = isSCDWSelected ? scdw : 0`.

**Extras and location fees are consistent across copies**: snow chains `days*3`, each child
seat `count*days*3`, extra km `floor(km/50) * per50kmPrice`, location fees via
`getLocationPrice(name)` (exact-string match against `LOCATION_DATA`, unknown → 0).

**Rental days**: `calculateRentalDays(pickup, restitution, pickupTime, restitutionTime)` in
`lib/vehicle-utils.ts` — same-day = 1; +1 day if return hour > pickup hour + 2. (The dead
`use-reservation-pricing.ts` uses raw `differenceInDays` instead — a divergence to delete.)

**Transfer pricing** (3 identical copies): `BASE_KM_INCLUDED=15`, `DEFAULT_BASE_FARE=25`,
`DEFAULT_MULTIPLIER=1.0`, `DEFAULT_PRICE_PER_KM=1.0`. `extraKm = max(distanceKm-15, 0)`; if 0
→ baseFare; else find active tier by extraKm range → `baseFare + extraKm*tierPrice*classMult`;
round-trip doubles. baseFare/multiplier come from the vehicle's `vehicleClass`. Note:
`transferPricing.ts` **already** has server-side compute queries — `createTransfer` just
doesn't call them.

**Convex CAN import from outside `convex/`.** Confirmed: `convex/tsconfig.json` includes
`./**/*` (convex-relative) but TS still typechecks imported modules, and Convex's esbuild
bundler pulls in any pure TS it can resolve. The live constraint is **purity** — a module
imported by Convex must not import React, `next/*`, or browser globals. This is exactly why
`LOCATION_DATA` must leave `location-picker.tsx` (a component) and `getMultiplierForDateRange`
must become a pure function. The `@/` path alias is a Next tsconfig feature Convex bundling
does **not** read, so the Convex side must import the shared module by **relative path**
(`../lib/pricing/...`) while the Next side uses `@/lib/pricing`.

**Auth helper baseline**: `convex/users.ts` exports only `getCurrentUser` and
`getCurrentUserOrThrow` — there is **no** admin helper. `featuredCars.ts` is the reference
pattern (`getCurrentUserOrThrow` + `role === "admin"` throw). None of the six admin-write
files import it today.

**Guest-flow constraint**: `getTransferById` has exactly one caller — the **public** transfer
confirmation page (`transfers/confirmation/[transferId]/page.tsx:45`), which a guest lands on
right after booking. Guest bookings have no `userId`. Blindly requiring auth here breaks every
guest transfer. `getTransfersByVehicle`, `getReservationsByVehicle`, `cancelTransfer`,
`cancelReservation` have **no** frontend callers — safe to tighten freely.

---

## Design

### 1. Shared pure pricing module — `lib/pricing/`

A directory of pure TS (no React, no `next/*`, no browser globals) that is the single source
of truth, imported by the client for display (`@/lib/pricing`) and by Convex for authoritative
recompute (`../lib/pricing`). It takes **already-fetched data as inputs** (vehicle doc, season
docs, tier docs, a location-fee lookup) and returns a breakdown — it never touches the DB or
the network, so both sides feed it the same shapes.

```
lib/pricing/
  constants.ts   # SCDW block costs (6/5), BASE_KM_INCLUDED=15, DEFAULT_BASE_FARE=25,
                 #   DEFAULT_MULTIPLIER, DEFAULT_PRICE_PER_KM, extras rates (3/day), 50km pkg,
                 #   DEFAULT_PICKUP_TIME "10:00", DEFAULT_LOCATION
  locations.ts   # LOCATION_DATA + getLocationPrice(name)  (moved out of location-picker.tsx)
  tiers.ts       # getBasePriceTier / getBasePricePerDay / getPriceForDuration /
                 #   getPriceForDurationWithSeason  (moved from types/vehicle.ts)
  rental-days.ts # calculateRentalDays  (moved from lib/vehicle-utils.ts)
  seasons.ts     # calculateMultiplierForDateRange + date helpers (moved from lib/season-utils.ts,
                 #   typed off the season doc shape)
  scdw.ts        # calculateSCDW(days, dailyRate) + calculateWarranty(vehicle) with the type table
  transfer.ts    # computeTransferPrice({ distanceKm, transferType, baseFare, classMultiplier,
                 #   tiers }) -> { baseFare, extraKm, distanceCharge, totalPrice, pricePerKm }
  reservation.ts # computeReservationPricing(input) -> full ReservationBreakdown
  index.ts       # re-exports; the two top-level entry points below
```

Two top-level entry points return the complete, itemized breakdown that both display and
persistence use:

```ts
// pure — no ctx, no fetch
computeReservationPricing(input: {
  vehicle: VehiclePricingData;            // pricingTiers, warranty, type
  startDate: Date; endDate: Date; pickupTime: string; restitutionTime: string;
  pickupLocation: string; restitutionLocation: string;
  seasonalMultiplier: number; seasonId?: Id<"seasons">;
  isSCDWSelected: boolean;
  extras: { snowChains: boolean; childSeat1to4: number; childSeat5to12: number; extraKm: number };
  per50kmPrice: number;
}): {
  days: number;
  pricePerDay: number;          // duration-tier × season (rounded) — the canonical rate
  basePrice: number;            // days × pricePerDay
  deliveryFee: number; returnFee: number; totalLocationFees: number;
  protectionCost: number;       // SCDW (0 if not selected) — uses pricePerDay (canonical)
  deductibleAmount: number;     // warranty (0 if SCDW)
  extrasBreakdown: { description: string; amount: number }[];
  totalExtras: number;
  totalPrice: number;
  seasonalMultiplier: number; seasonId?: Id<"seasons">;
}

computeTransferPricing(input: {
  distanceKm: number; transferType: "one_way" | "round_trip";
  vehicleClass: { transferBaseFare?: number; transferMultiplier?: number } | null;
  tiers: TransferTier[];
}): { baseFare: number; extraKm: number; distanceCharge: number; pricePerKm: number; totalPrice: number }
```

`VehiclePricingData` / `TransferTier` are structural types compatible with both `Doc<"vehicles">`
and the query projections, so no coupling to a specific fetch path.

**This kills, in one move:** the 4 SCDW copies, the 3 transfer-formula copies, the dead
`season-utils` mirror, the `types/vehicle.ts` pricing logic, and the inverted
`vehicle-utils → location-picker` dependency.

### 2. How the create mutations validate — **recompute-and-overwrite** (recommended)

Server is the source of truth. In `createReservation` / `createTransfer`:
1. Fetch authoritative inputs from `ctx.db` (vehicle doc, active seasons, transfer tiers,
   vehicle class).
2. Call the same pure entry point the client uses.
3. **Store the server-computed money fields**, ignoring the client's numbers for what gets
   persisted.
4. **Soft mismatch check**: compare the client-submitted `totalPrice` to the recomputed one;
   if `abs(diff) > €0.5`, log a structured warning (and, for `card_online`, reject with a
   clear error so a real client bug surfaces).

Why overwrite rather than reject-on-mismatch as the primary behavior: during the migration
window the client and server can round in slightly different orders, and a hard reject would
turn a rounding difference into a failed booking. Overwrite is always safe (attacker's number
never lands), and the soft check gives telemetry. Once the mismatch log is quiet for a release,
tighten `card_online` to hard-reject. This also lets us **drop the money args entirely** from
the mutation signature in a later step (client stops sending `totalPrice`, `protectionCost`,
etc.) — but keep them accepted-and-ignored during migration for a zero-downtime rollout.

### 3. Persisted breakdown (new optional schema fields)

Add optional fields so the confirmation pages and emails render **stored** values instead of
recomputing against drifted current tiers/season. All `v.optional(...)` → **fully backward
compatible**; existing docs simply lack them and readers fall back to the legacy recompute.

`reservations` table — add:
```
pricePerDay: v.optional(v.number()),      // canonical daily rate actually charged
rentalDays: v.optional(v.number()),
basePrice: v.optional(v.number()),        // days × pricePerDay, pre-extras/location
```
(`protectionCost`, `deductibleAmount`, `seasonId`, `seasonalMultiplier`, `additionalCharges`
already exist and already capture the rest of the breakdown.)

`transfers` table — already stores `baseFare`, `distancePrice`, `pricePerKm`, `distanceKm` —
sufficient; no new fields needed, we just start writing the server-recomputed values.

### 4. Admin auth — `requireAdmin(ctx)` helper

Add to `convex/users.ts`:
```ts
export const requireAdmin = async (ctx: QueryCtx | MutationCtx): Promise<Doc<"users">> => {
  const user = await getCurrentUserOrThrow(ctx);
  if (user.role !== "admin") throw new Error("User not authorized (admin only).");
  return user;
};
```
Call it as the first line of every admin write. Chosen over a `customMutation`/`adminMutation`
wrapper (convex-helpers) because the repo doesn't use custom functions yet and the one-line
helper matches the existing `featuredCars.ts` idiom with the least churn — a wrapper can come
later as a pure refactor. Also migrate the 6 hand-rolled checks in `transfers.ts` to it.

### 5. PII queries + ownership + email route

- `getTransferById`: **keep guest-readable** (allow when `transfer.userId == null`); when a
  `userId` is set, require caller to be that user or an admin. Preserves the guest confirmation
  page while closing enumeration of registered-user PII.
- `getTransfersByVehicle`, `getReservationsByVehicle`: no callers → make admin-only
  (`requireAdmin`).
- `cancelTransfer`: add the missing check — owner (`transfer.userId == user._id`) or admin.
- `cancelReservation`: already authenticates; add the ownership comparison it's missing.
- `app/api/send/reservation-email/route.ts`: add server-side `auth()` from
  `@clerk/nextjs/server` + admin-role verification; reject non-admins. The only caller is an
  admin dialog whose same-origin fetch already carries Clerk cookies, so no client change
  needed. (Reusing the canonical `convex/emails/templates` instead of the inline 140-line HTML
  is a follow-up owned by the email-fixes plan.)

---

## Implementation steps (ordered for safe rollout)

Client and server must never disagree mid-migration. The ordering below keeps display and
persistence reading the *same* module at every step; the security work is an independent track.

**Step 0 — Product decision on canonical SCDW daily rate** (blocks Step 2's behavior).
Recommend duration-tier × season. This *changes* some SCDW prices vs today's display — get
sign-off before it ships. (See Open Questions.)

**Step 1 — Extract the pure module, no behavior change.**
- Create `lib/pricing/` by *moving* existing implementations verbatim: `LOCATION_DATA`/
  `getLocationPrice` out of `location-picker.tsx`; the tier helpers out of `types/vehicle.ts`;
  `calculateRentalDays` and the two `calculateVehiclePricing*` out of `lib/vehicle-utils.ts`;
  the season math out of `lib/season-utils.ts`; the transfer formula factored to one
  `computeTransferPrice`.
- Point `location-picker.tsx`, `lib/vehicle-utils.ts`, `hooks/use-date-based-seasonal-pricing.ts`
  and `transferPricing.ts`'s two queries + `transfers.getTransferVehiclesWithImages` at the new
  module.
- Files: `lib/pricing/*` (new), `components/shared/search-filters/location-picker.tsx`,
  `types/vehicle.ts`, `lib/vehicle-utils.ts`, `lib/season-utils.ts` (delete),
  `convex/seasons.ts` (delete dead `getMultiplierForDateRange`), `convex/transferPricing.ts`,
  `convex/transfers.ts`.
- Gate: `npx tsc --noEmit` clean. No pricing values change yet.

**Step 2 — Unify the client call sites on the module + fix the SCDW divergence.**
- `reservation/page.tsx`: **owned by the reservation-decomposition workstream, NOT this plan.**
  Agreed with that owner (to avoid two parallel rewrites of the 1888-line file): their
  `useReservationPricing` hook is the sole client consumer of `computeReservationPricing`, wraps
  it once (memoized), and feeds both the summary UI and the submit payload from the same object —
  which is what removes the base-vs-duration SCDW divergence. This plan's only responsibility
  here is delivering the module the hook consumes.
- `edit-reservation-dialog.tsx`: replace the suggested-price path and the SCDW `useEffect` with
  the module so the suggested total and the persisted `protectionCost` use the same rate. (This
  file is admin-side and not part of the decomposition — owned here.)
- Delete the abandoned dead cluster (`use-reservation-pricing.ts`, `additional-features-card.tsx`'s
  private copy) or repoint it — the decomposition owner deletes what its restructure supersedes;
  at minimum the dead SCDW copies go.
- Files (this plan): `components/admin/reservations/edit-reservation-dialog.tsx`,
  `hooks/use-reservation-pricing.ts` (delete). `app/[locale]/reservation/page.tsx` and its
  `additional-features-card.tsx` are edited by the decomposition workstream.
- Gate: manual check that displayed totals match the old values except the intended SCDW change.

**Step 3 — Server-side authoritative recompute + persist breakdown.**
- Add optional schema fields (§3). Deploy schema first (additive, safe).
- `createReservation`: fetch vehicle + active seasons; call `computeReservationPricing`;
  overwrite money fields; persist `pricePerDay`/`rentalDays`/`basePrice`; soft mismatch check;
  pass server values (not client) into the confirmation email. Keep accepting the legacy money
  args (ignored) so the current client keeps working.
- **`additionalCharges` = structured codes, not prose** (decided with the decomposition owner).
  `additionalCharges` line items are shown on confirmation pages and in emails, so they carry
  display text. The server recompute regenerates the array but can't call next-intl / know the
  user's locale, so prose would either regress RO (product default) to English or drift from the
  client. Resolution: `extrasBreakdown` items are **locale-free structured codes**; the edges
  (confirmation page + email templates + `messages/*.json`) translate `code + params` at render
  time. No locale prose ever lands in persistence, so client-submit and server-recompute are
  byte-identical by construction.

  `extrasBreakdown` item shape (module return + persisted array):
  ```ts
  { code: ChargeCode; params: ChargeParams; amount: number }
  type ChargeCode =
    | "pickupLocationFee" | "returnLocationFee"   // params: { location: string }
    | "snowChains"                                 // params: { days: number }
    | "childSeat1to4" | "childSeat5to12"           // params: { count: number; days: number }
    | "extraKm";                                   // params: { km: number }  (i18n catalog var: km)
  ```
  `extrasBreakdown` is the full non-base / non-protection line-item list (location fees + physical
  extras); `totalPrice = basePrice + protectionCost + sum(extrasBreakdown.amount)`. The scalar
  `deliveryFee`/`returnFee`/`totalLocationFees`/`totalExtras` remain as convenience fields but the
  breakdown array is authoritative.

  **Schema change (owned here) — additive, backward compatible.** `additionalCharges` item
  becomes `{ description: v.optional(v.string()), code: v.optional(chargeCodeValidator),
  params: v.optional(chargeParamsValidator), amount: v.number() }`: existing docs keep only
  `description` (still valid); new docs write `code` + `params`. Readers prefer `code`+`params`
  when present, else fall back to the legacy `description` prose.

  **Ownership split**: this plan owns the schema shape change and the email-side translation of
  codes (`convex/emails/templates`, which already receives the reservation `locale`); the
  decomposition owner owns confirmation-page translation; the **i18n cluster owner owns the copy
  itself** (exact wording + ICU plurals) and lands it in the `messages/*.json` consolidation. All
  three surfaces share one new top-level `reservationCharges` namespace, one key per `ChargeCode`.

  **Email render mechanism** (verified): the email path is a Convex **Node action**
  (`convex/emails.ts` is `"use node"`) rendering React Email; today it localizes via a hand-built
  `labels` object chosen by an `isRo` boolean, with inline JS-ternary plurals (`days === 1 ? "zi"
  : "zile"`) — i.e. no ICU, and it carries the same RO-plural bug. `additionalCharges` already
  renders `amount` in a separate column from the label (the label-only rule is structurally
  satisfied — we just swap the `description` prose for a translated `code+params` label). To
  consume the shared ICU `reservationCharges` keys identically to the confirmation page, the email
  side gains an ICU formatter (`intl-messageformat`, the same engine next-intl uses); because it's
  a Node action with full-ICU, `Intl.PluralRules('ro')` resolves correctly with **no polyfill**.
  This plan owns wiring that formatter into the email templates.

  Two corrections the new keys must NOT inherit from the current copy (verified by the
  decomposition owner against the live catalog — the existing keys live under
  `reservationPage.payment.additionalCharges` and are **superseded/deleted**, not reused, when the
  client-side `additionalCharges` builder is removed):
  - **No baked-in price math.** Today's strings embed the amount (e.g. `"... {days} zi × 3 EUR =
    {price} EUR"`), but confirmation + email render `description` and `amount` in separate columns,
    so the amount double-renders. New keys take **no `{price}` param** — the `amount` field is
    rendered on its own.
  - **ICU plurals, not hard-coded singular.** Current copy hard-codes `"{days} zi"` / `"{days}
    day"` (the audit's hand-rolled-plural bug). New keys use ICU, e.g.
    `{days, plural, one {# zi} other {# zile}}` (and the same for the child-seat `days`, in both
    RO and EN).
- `createTransfer`: call `computeTransferPricing` (or the existing `calculateTransferPrice`
  logic, now shared); overwrite `baseFare`/`distancePrice`/`totalPrice`/`pricePerKm`; soft
  mismatch check; email uses server values. `distanceKm`/coordinates still come from the client
  (Mapbox) — note the separate Medium bug where a failed geocode fabricates `{0,0}`; flag to the
  transfer-flow owner, out of scope here.
- Files: `convex/schema.ts`, `convex/reservations.ts`, `convex/transfers.ts`, `lib/pricing/*`.
- Gate: book a reservation + transfer end-to-end; confirm persisted totals equal displayed
  totals and the email shows the same numbers.

**Step 4 — Render persisted breakdown on confirmation + emails.**
- Confirmation pages read stored `pricePerDay`/`rentalDays`/`basePrice` (fall back to legacy
  recompute when absent). Delete `computeRentalDays` reimplementation in
  `reservation/confirmation/page.tsx`.
- Coordinate with the email-fixes plan (shared breakdown source).
- Files: `app/[locale]/reservation/confirmation/page.tsx`,
  `app/[locale]/transfers/confirmation/[transferId]/page.tsx`, `convex/emails.ts`.

**Step 5 (independent track, can land in parallel from Step 1) — Security hardening.**
- Add `requireAdmin` to `convex/users.ts`.
- Wrap all 28 admin writes (flat list below). For `vehicles.uploadImages` (an action calling
  public `api.vehicles.update`), add the admin check in the action itself.
- Migrate the 6 hand-rolled checks in `transfers.ts` to `requireAdmin`; add owner/admin check to
  `cancelTransfer`; add ownership check to `cancelReservation`.
- Harden `getTransferById` (guest-safe), make `getTransfersByVehicle` /
  `getReservationsByVehicle` admin-only.
- Auth the email route.
- Files: `convex/users.ts`, `convex/vehicles.ts`, `convex/blogs.ts`, `convex/vehicleClasses.ts`,
  `convex/seasons.ts`, `convex/transferPricing.ts`, `convex/transfers.ts`, `convex/reservations.ts`,
  `app/api/send/reservation-email/route.ts`, `proxy.ts` (no change needed, just verified).

**28 admin writes to wrap (all currently NO AUTH):**
- vehicles.ts: `create` (L140), `update` (L211), `remove` (L281), `uploadImages` (L304, action),
  `reorderImages` (L356), `removeImage` (L393), `setMainImage` (L436), `reorder` (L578)
- blogs.ts: `setFeatured` (L148), `unsetFeatured` (L170), `create` (L329), `update` (L391),
  `remove` (L439), `uploadImages` (L463, action), `removeImage` (L484)
  — **exclude `incrementViews` (L579)**: it's the public view counter, must stay open.
- vehicleClasses.ts: `create` (L102), `update` (L152), `remove` (L222), `reorder` (L256)
- seasons.ts: `create` (L299), `update` (L326), `setCurrent` (L358), `clearCurrent` (L392),
  `deleteSeason` (L405)
- transferPricing.ts: `createTier` (L64), `updateTier` (L122), `deleteTier` (L187),
  `seedDefaultTiers` (L352)

Each file needs `import { requireAdmin } from "./users";` added.

**Adjacent fix to fold in while rewriting the create mutations** (audit CRITICAL performance,
not strictly pricing/security): both `createReservation` (L80) and `createTransfer` (L64)
`.collect()` the entire table to compute the next sequential number, which OCC-conflicts under
concurrent bookings and serializes the money path. Since Step 3 rewrites these handlers anyway,
switch to a `by_number` index read `.order("desc").first()` or a counter doc. Small add; flag
to team lead if they'd rather keep it in the perf cluster.

---

## Dependencies (what depends on THIS)

- **Coupons** (`plan-coupons`): needs an authoritative pre-discount `totalPrice` computed
  server-side to apply a discount and re-validate — must build on the Step 3 recompute, not the
  client total. The `computeReservationPricing` breakdown is the surface a coupon hooks into.
- **Affiliate** (`plan-affiliate`): commission is a percentage of the real booking total;
  attribution must read the server-computed, persisted `totalPrice`/breakdown, else commissions
  are attacker-settable. Depends on Steps 3–4.
- **Email fixes** (`plan-email-fixes`): both this plan and email-fixes want the persisted
  breakdown (Step 4) so emails render stored values. Coordinate the schema fields (§3) and the
  breakdown shape so we add them once. Emails already send from the create mutations, so Step 3
  is where server values start flowing into email.
- **Reservation-page decomposition** (maintainability cluster): Steps 1–2 edit the 1888-line
  `reservation/page.tsx`. Sequence with whoever owns the decomposition so the memoized pricing
  hook (`computeReservationPricing`) becomes the single hook that decomposition consumes, rather
  than two conflicting rewrites of the same file.

---

## Open questions

1. **Canonical SCDW daily rate** (blocks Step 2): duration-tier × season (recommended, matches
   the rental subtotal) vs base-tier × season (what today's *display* shows) vs raw base (what
   the admin dialog *persists*). This changes real prices — needs product sign-off.
2. **Hard-reject threshold**: at what point do we flip `card_online` from soft-log to
   hard-reject on price mismatch, and what epsilon (proposed €0.5)? Cash/card-on-delivery can
   stay overwrite-only indefinitely.
3. **Should the client stop sending money args entirely** (cleaner, type-safe) or keep sending
   them accepted-and-ignored for one release before removal? Recommend keep-then-remove for a
   zero-downtime deploy.
4. **Backfill** the new breakdown fields on existing reservations, or rely on the read-time
   legacy fallback forever? Fallback is sufficient; backfill is optional polish.
5. **`getReservationsByVehicle` / `getTransfersByVehicle`**: confirm no planned feature needs a
   *public* availability check before making them admin-only (currently zero callers).

---

## Size estimate

Medium-large, but cleanly splittable into two parallel tracks.

- **Pricing track (Steps 1–4)**: ~M. Step 1 (extraction) is mechanical but wide (touches ~8
  files); the risk is in Steps 2–3 where behavior converges and the 1888-line page must be
  edited carefully. Net line count *drops* (removing 4 SCDW copies + 3 transfer copies + the
  dead season mirror). Ships as 3–4 PRs (extract / unify client / server recompute+persist /
  confirmation+email).
- **Security track (Step 5)**: ~S–M but high-value and low-risk — mostly adding one `requireAdmin`
  line to 28 functions plus 5 targeted query/route changes. One PR, independent of the pricing
  track, can merge first for immediate risk reduction.

Recommend landing Step 5 (security) first as its own PR — it's the fastest reduction of live
exposure — then the pricing track in sequence.
