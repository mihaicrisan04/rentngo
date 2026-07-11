# Remediation Plan — Miscellaneous Bugs & Boundary Fixes (catch-all)

This plan is the **catch-all** for the thermo-nuclear audit. It owns every AUDIT.md
finding that no other in-flight plan claims: the standalone correctness bugs, the
wrong-layer / boundary violations, and all the small-to-medium duplication, type-safety,
and spaghetti cleanups. The five other audit plans own the big thematic clusters
(pricing/security, convex/perf, reservation decomposition, admin dialogs, frontend perf,
i18n, dead-code). Where a finding straddles a boundary, it is listed under its owner with
a cross-reference here.

Do NOT touch: the reservation page body (owned by reservation-decomp), the six admin
create/edit dialogs' internals (admin-dialogs), Convex query performance / server-join
queries (convex-perf), and hardcoded-string extraction into messages/*.json (i18n). This
plan may add *shared modules* those plans then consume, and coordinates on shared files.

---

## Scope & coverage map

Every AUDIT.md finding, by section line, with its owner. `MINE` = claimed by this plan.

### Critical (6) — none mine
- L11 SCDW formula dup → **pricing-security**
- L12 reservation God-component → **reservation-decomp**
- L13 booking-number `.collect()` → **convex-perf**
- L14 `headers()` in root layout → **frontend-perf**
- L15 admin Convex writes unauthenticated → **pricing-security**
- L16 client-trusted money fields → **pricing-security**

### High (30)
- L20 VehicleOrderingPage setState-in-render crash → **MINE** (Batch A)
- L21 image uploads raw bytes → **convex-perf** (Convex side) + **admin-dialogs** (client side)
- L22 `searchAvailableVehicles` unused args / no overlap check → **MINE** (Batch A, delete)
- L23 blog queries bypass `by_status` index → **convex-perf**
- L24 vehicles no `by_class` index → **convex-perf**
- L25 abandoned reservation decomposition dead code → **reservation-decomp**
- L26 `-with-preloaded-images` vehicle fork dead → **dead-code**
- L27 lib email stack dead → **dead-code**
- L28 confirmation `computeRentalDays` dup → **reservation-decomp**
- L29 company identity hardcoded 10+ places → **MINE** (Batch D)
- L30 transfers/booking re-implements checkout → **reservation-decomp**
- L31 admin dialog pairs 90% copy-paste → **admin-dialogs**
- L32 transfer pricing formula 3 copies → **pricing-security**
- L33 transfers.ts hand-rolled admin check 6x → **pricing-security**
- L34 `lib/season-utils` mirrors `convex/seasons` → **pricing-security**
- L35 edit-reservation-dialog 1265 lines → **admin-dialogs**
- L36 hardcoded English across transfers flow → **i18n**
- L37 mapbox-gl static import bloats bundles → **frontend-perf**
- L38 homepage hero PNG bypasses next/image → **frontend-perf**
- L39 vehicle card `priority` unconditional → **frontend-perf**
- L40 table N+1 `VehicleInfo` → **convex-perf**
- L41 admin list queries unpaginated → **convex-perf**
- L42 admin stats full-table scans → **convex-perf**
- L43 edit-reservation `form.watch` storms → **admin-dialogs**
- L44 cancel* ownership + PII queries → **pricing-security**
- L45 reservation-email route unauthenticated → **pricing-security**
- L46 `blogs.getBySlug` `as any` → **convex-perf**
- L47 admin dashboard client-side aggregates → **convex-perf**
- L48 DateTimePicker localStorage bleed → **MINE** (Batch C)
- L49 LOCATION_DATA in shared component → **MINE** (Batch E)

### Medium (53)
- L53 edit-reservation price-clobber effect → **admin-dialogs**
- L54 image-upload-preview blob leaks → **admin-dialogs**
- L55 mapbox-location-search fabricates `{0,0}` → **MINE** (Batch B)
- L56 `window.location.href` non-localized nav → **MINE** (Batch A)
- L57 `.filter()` where indexes exist → **convex-perf**
- L58 missing `returns` validators → **convex-perf**
- L59 VehicleSearchFilterForm dead dual mode → **dead-code**
- L60 dead hooks/libs + unused deps → **dead-code**
- L61 `getStatusBadge` dup across 8 files → **MINE** (Batch F)
- L62 `formatDate`/`formatPrice` dup → **MINE** (Batch F)
- L63 transfers vehicles/booking guard dup → **MINE** (Batch H)
- L64 car-detail-client hand-rolls searchStorage → **MINE** (Batch H)
- L65 about page local animation-variants copy → **MINE** (Batch L)
- L66 `formatDuration` re-implemented 3x → **MINE** (Batch F)
- L67 admin transfers/reservations dashboards dup → **MINE** (Batch I)
- L68 VehicleOrderingPage triple pricing-field → **MINE** (Batch I)
- L69 classes dnd-kit scaffold dup → **MINE** (Batch I)
- L70 admin dialogs raw Radix Tabs dup → **admin-dialogs**
- L71 create/edit reservation dialog pricing divergence → **admin-dialogs**
- L72 `handleNumberInput` dup across dialogs → **admin-dialogs**
- L73 blogs `localizeBlog` locale-projection dup → **MINE** (Batch J)
- L74 vehicle literal unions duplicated in validators → **MINE** (Batch J)
- L75 `calculateVehiclePricing`/`WithSeason` collapse → **MINE** (Batch E)
- L76 search-storage/transfer-storage machinery dup → **MINE** (Batch C)
- L77 `getPaymentMethodLabel` 4x + slug validators dup → **MINE** (Batch F)
- L78 `use-vehicle-filters` stamped 4x → **MINE** (Batch G)
- L79 hand-rolled plural logic → **i18n**
- L80 terms/privacy Romanian-only under both locales → **i18n**
- L81 testimonials/faq baked content → **i18n**
- L82 framer-motion + motion both declared → **dead-code**
- L83 reservation page query waterfall → **reservation-decomp** (+ convex-perf)
- L84 confirmation page 3-level waterfall → **reservation-decomp**
- L85 car detail per-image round-trips → **convex-perf**
- L86 blog list image N+1 → **convex-perf**
- L87 `getAllVehiclesWithClasses` over-fetch → **convex-perf**
- L88 deprecated `getAllVehicles` 7 call sites → **convex-perf**
- L89 per-image admin subscriptions → **convex-perf**
- L90 dialogs eager subscriptions while closed → **admin-dialogs**
- L91 blog dialogs re-render per keystroke → **admin-dialogs**
- L92 blog-content.tsx MDX compiled in browser → **frontend-perf**
- L93 testimonials marquee unsplash images → **frontend-perf**
- L94 HomePageClient searchState re-renders → **frontend-perf**
- L95 `calculateTotalPrice` spaghetti → **reservation-decomp** (+ pricing-security)
- L96 cars page filter pipeline dead work → **MINE** (Batch G)
- L97 AdminLayout breadcrumb magic special case → **MINE** (Batch I)
- L98 dialog shadow-state vs useFieldArray → **admin-dialogs**
- L99 `stripUndefined` idiom 5 variants → **MINE** (Batch J)
- L100 rental-details.tsx prop mirroring → **MINE** (Batch L)
- L101 checkout stringly-typed paymentMethod → **MINE** (Batch K)
- L102 locale contract stringly-typed/duplicated → **MINE** (Batch K)
- L103 fuel-type petrol vs benzina inconsistency → **MINE** (Batch K)
- L104 transfers landing page all `'use client'` → **frontend-perf**
- L105 types/vehicle.ts hosts pricing logic → **MINE** (Batch E)

### Low (14)
- L109 AI tool-call artifact in reservation comment → **reservation-decomp**
- L110 formProgress magic-number count → **reservation-decomp**
- L111 `getCurrentUserReservations` unpaginated → **convex-perf**
- L112 car-detail-client unreachable `!vehicle` branch → **MINE** (Batch H, same file as L64)
- L113 admin Settings dead surface → **dead-code**
- L114 DEFAULT_TIME/DEFAULT_LOCATION hardcoded dup → **MINE** (Batch C)
- L115 `--webpack` legacy bundler → **dead-code** (modernization)
- L116 featuredCars sequential gets + over-fetch → **convex-perf**
- L117 `getAllAdmin` blogs unpaginated → **convex-perf**
- L118 mapbox-location-search no AbortController/stale guard → **MINE** (Batch B)
- L119 transfer-search-form redundant Directions call → **MINE** (Batch B)
- L120 transfers/booking re-renders + inline vehicle object → **frontend-perf**
- L121 layout ships full message catalog → **frontend-perf**
- L122 `zodResolver(schema) as any` coercion 3x → **MINE** (Batch K)

**Coverage argument:** 103 findings total. Owned elsewhere: pricing-security (10),
convex-perf (18), reservation-decomp (8), admin-dialogs (11), frontend-perf (10),
i18n (5), dead-code (7). That is 69. The remaining **34 are claimed here** (Batches A–L).
Every AUDIT.md line above has exactly one owner.

---

## Fix batches

Each batch is independently shippable as one squash-merged PR. Conventional-commit type
in the heading is the PR title prefix. Batches are ordered so shared modules land before
their consumers, but only C↔A, E↔ pricing-security, and the storage batches have hard
ordering; the rest are independent.

### Batch A — Correctness bugs (`fix:`)

**A1 · VehicleOrderingPage setState-during-render crash (L20)**
- Bug: `app/admin/vehicles/classes/[classId]/page.tsx:197-199` runs
  `if (vehicles && items.length === 0) setItems([...vehicles])` in the render body. For a
  class with zero vehicles, `vehicles` is `[]` (truthy) and `items.length === 0` never
  becomes false → React throws "Too many re-renders" and the page crashes in exactly the
  empty-state case. It also never resyncs after `items` is non-empty (stale after a vehicle
  is added/removed elsewhere).
- Fix: replace the in-render sync with a `useEffect` keyed on `[vehicles]` that sets items
  from the query result (guarding the drag-in-progress case), or derive the ordered list
  from the query with local drag state layered on top. Prefer deriving: keep `items` only
  as an optimistic override during drag, fall back to `vehicles` otherwise.
- Files: `app/admin/vehicles/classes/[classId]/page.tsx`.
- Verify: open a class page for a class with **0 vehicles** — page renders the empty state,
  no crash; add a vehicle to a class, revisit — list reflects it.

**A2 · Non-localized `window.location.href` navigation (L56)**
- Bug: `app/[locale]/profile/page.tsx:43` navigates to `"/login"` — a route that does not
  exist (sign-in is Clerk's `SignInButton` modal) → the profile sign-in button 404s.
  `app/[locale]/about/page.tsx:274` navigates to `"/contact"` — full reload plus a
  middleware locale-redirect hop that drops the `/[locale]` prefix.
- Fix: about → locale-aware `next/navigation` `Link`/`useRouter().push` to the localized
  contact route (use the `Link` wrapper the rest of the app uses so the locale prefix is
  preserved). profile → replace the `/login` navigation with Clerk `<SignInButton>` (mode
  modal) matching how sign-in is triggered elsewhere.
- Files: `app/[locale]/about/page.tsx`, `app/[locale]/profile/page.tsx`.
- Verify: from `/en/about` click contact → lands on `/en/contact` with no full reload;
  from profile while signed out, sign-in button opens the Clerk modal (no 404).

**A3 · Delete misleading `searchAvailableVehicles` query (L22)**
- Bug: `convex/vehicles.searchAvailableVehicles` declares `startDate`/`endDate`/
  `deliveryLocation` args, never reads them, and never consults `reservations`, so it
  returns vehicles regardless of date overlap — a public query with a false contract. It
  has no in-repo callers (leftover migration code).
- Fix: **delete it** (no live caller; the real availability check lives in the reservation
  flow). If a future caller is anticipated, instead implement the overlap check via the
  `by_dates` index — but default to deletion.
- Files: `convex/vehicles.ts`.
- Cross-ref: **convex-perf** L57 also lists `searchAvailableVehicles` among `.filter()`
  offenders and **dead-code** L60 catalogs dead functions — coordinate so only one PR
  removes it; if convex-perf deletes it first, drop A3.
- Verify: `npx tsc --noEmit` clean; grep confirms zero references.

### Batch B — Mapbox & transfer-search hardening (`fix:`)

**B1 · Route mapbox-location-search through `lib/mapbox.ts`; stop fabricating `{0,0}` (L55, L118)**
- Bug: `components/shared/search-filters/mapbox-location-search.tsx` embeds raw Search Box
  `suggest`/`retrieve` fetches, the session-token lifecycle, and the debounce inline
  (lines 63-165), bypassing `lib/mapbox.ts` + `getMapboxToken()`. On `retrieve` failure it
  **fabricates `coordinates: { lng: 0, lat: 0 }`** (line 156) while reporting the selection
  as successful — those coords flow into `getRouteInfo`/transfer pricing, yielding a bogus
  0-km base fare with no visible error. It also has `language: "en"` hardcoded (line 82),
  fires `setLoading(true)` synchronously per keystroke (line 74), and has no in-flight
  abort or stale-response guard (L118) so fast typing can render suggestions for an older
  query.
- Fix:
  - Add `suggest(query, sessionToken, signal)` and `retrieve(mapboxId, sessionToken)`
    helpers to `lib/mapbox.ts` (alongside the existing `getRouteInfo`/`getMapboxToken`),
    reading the token via `getMapboxToken()` and taking `language` as a parameter.
  - In the component, call those helpers; on `retrieve` failure **surface an error**
    (return `null`/toast) instead of emitting `{0,0}`. The parent must treat a null
    selection as "no coordinates" and block price calculation.
  - Add an `AbortController` in the debounce effect cleanup (or a request-id guard) and
    move `setLoading(true)` inside the debounced callback.
- Files: `components/shared/search-filters/mapbox-location-search.tsx`, `lib/mapbox.ts`,
  `components/features/transfers/transfer-search-form.tsx` (handle null selection).
- Cross-ref: **i18n** L36 owns extracting this component's user-facing strings
  ("Searching locations...", "No locations found.", placeholders) into messages/*.json;
  do the structural refactor here and leave the strings for i18n, or coordinate a single
  pass. `language:"en"` should become the active locale — flag to i18n.
- Verify: select a transfer location, then simulate a retrieve failure (throttle/deny the
  retrieve request) — the UI shows an error and does NOT produce a 0-km price; fast-type a
  query and confirm suggestions match the final input.

**B2 · Skip redundant Directions call on restore (L119)**
- Bug: `transfer-search-form.tsx` re-fires the (paid) Mapbox Directions call on mount even
  when `distanceKm`/`estimatedDurationMinutes` were just restored from the same
  localStorage entry — one wasted round-trip per page view.
- Fix: when stored route info exists for the same pickup/dropoff pair, skip recalculation;
  only call Directions when the location pair changes or route info is absent.
- Files: `components/features/transfers/transfer-search-form.tsx`.
- Cross-ref: touches the same file as Batch C's persistence move — sequence B after C, or
  do the persistence change and this guard together.
- Verify: reload the booking flow with a stored transfer search — Network shows no
  Directions request; change the dropoff — one request fires.

### Batch C — DateTimePicker controlled + storage layering (`refactor:`)

**C1 · Make DateTimePicker fully controlled; move persistence to owning forms (L48)**
- Bug: `components/shared/search-filters/date-time-picker.tsx` writes directly to the
  car-rental `searchStorage` via magic-string sniffing (`id.includes("pickup")` /
  `id.includes("return")`, lines 122-138, 151-155, 163-165, 183-187). The transfer form's
  picker ids are `pickupDateTime` / `returnDateTime`
  (`transfer-search-form.tsx:224,264`), which contain those substrings — so **selecting a
  transfer date overwrites the user's saved rental search**. It also double-persists what
  parent forms already save.
- Fix: strip all `searchStorage` imports and `updateField` calls from the picker; it
  becomes a pure controlled component (already exposes `dateState`/`setDateState`/
  `timeState`/`setTimeState`). Each owning form persists in its own change handler to its
  own store (rental forms → `searchStorage`, transfer form → `transferStorage`). Keep the
  date-validation call, but return the validated value to the parent rather than writing
  storage from inside the picker.
- Files: `components/shared/search-filters/date-time-picker.tsx`,
  `components/features/transfers/transfer-search-form.tsx`, plus the rental search forms
  that consume the picker (home/cars search form, car-detail form). `lib/search-storage.ts`.
- Cross-ref: overlaps Batch H (transfer/car-detail storage lifecycle) — land C first so
  the picker is controlled, then H wires the per-form persistence cleanly.
- Verify: enter a rental search on the home page; navigate to transfers, pick transfer
  dates; return to home — the rental search is intact (no bleed). Both pickers still
  persist their own values across reload.

**C2 · `createLocalStorage<T>` factory for search & transfer storage (L76)**
- Bug: `lib/search-storage.ts` and `lib/transfer-storage.ts` duplicate the SSR guard, JSON
  parse/stringify, Date↔ISO conversion, identical `validateAndFixDate`, and
  save/load/clear/updateField machinery.
- Fix: extract a generic `createLocalStorage<T>(key, defaults, dateFields)` factory holding
  the shared core; both modules become thin configs over it. Preserve the public API each
  currently exposes so consumers don't change.
- Files: `lib/search-storage.ts`, `lib/transfer-storage.ts`, new
  `lib/create-local-storage.ts` (or colocate).
- Verify: `npx tsc --noEmit`; smoke-test both flows persist/restore/clear as before.

**C3 · Export `DEFAULT_TIME` / `DEFAULT_LOCATION` (L114)**
- Bug: the documented default pickup/return time `"10:00"` and default location are private
  constants in `lib/search-storage.ts`, forcing re-hardcoding in both admin reservation
  dialogs.
- Fix: export them (or move to a shared `lib/constants.ts`) and have the dialogs import
  them.
- Files: `lib/search-storage.ts`, `components/admin/reservations/create-reservation-dialog.tsx`,
  `components/admin/reservations/edit-reservation-dialog.tsx`.
- Cross-ref: **admin-dialogs** owns the dialog files — coordinate a one-line import swap or
  hand them the exported constant and let admin-dialogs wire the dialog side.
- Verify: dialogs still default to 10:00 / default location.

### Batch D — Company identity + JSON-LD consolidation (`refactor:`)

**D1 · `lib/company.ts` + shared JSON-LD builders (L29)**
- Bug: phone `+40 773 932 961`, email, street address, geo coords, and social URLs are
  hardcoded in 10+ places (JSON-LD in `page.tsx`, `about/layout.tsx`, `transfers/layout.tsx`,
  `contact/layout.tsx`, `cars/[slug]/page.tsx`; inline text in contact/terms/privacy/both
  confirmation pages; `messages/*.json`; `convex/emails.ts`; the reservation-email route).
  **Copies have drifted**: `transfers/confirmation/[transferId]/page.tsx:445` shows
  `contact@rngo.ro` while everywhere else uses `office@rngo.ro`.
- Fix: create `lib/company.ts` exporting a single `COMPANY` constants object (name, phone,
  email, address, geo, socials) plus JSON-LD builders (`buildOrganizationSchema`,
  `buildLocalBusinessSchema`, etc.). Replace the JSON-LD literals and inline contact text
  with references. **Fix the drift to `office@rngo.ro`.** Leave `messages/*.json` display
  strings to i18n but source their values from the same constants where practical
  (translation files can't import TS — document that the canonical value lives in
  `lib/company.ts` and the JSON must match).
- Files: `lib/company.ts` (new); `app/[locale]/page.tsx`, `app/[locale]/about/layout.tsx`,
  `app/[locale]/transfers/layout.tsx`, `app/[locale]/contact/layout.tsx`,
  `app/[locale]/cars/[slug]/page.tsx`, `app/[locale]/contact/page.tsx`,
  `app/[locale]/terms/page.tsx`, `app/[locale]/privacy/page.tsx`,
  `app/[locale]/reservation/confirmation/page.tsx`,
  `app/[locale]/transfers/confirmation/[transferId]/page.tsx`,
  `app/api/send/reservation-email/route.ts`, `convex/emails.ts`.
- Cross-ref: **pricing-security** owns auth on the reservation-email route (L45) and
  **dead-code** owns the lib email stack (L27) — do not restructure the email route's
  template here, only swap the identity constants. `convex/emails.ts` can import from
  `lib/company.ts` (Convex can import outside `convex/`). The confirmation pages are also
  touched by reservation-decomp/i18n — coordinate on merge order.
- Verify: view-source each page's JSON-LD renders identical structured data; grep shows a
  single `contact@rngo.ro`→`office@rngo.ro` fix and no remaining literal phone/email
  outside `lib/company.ts` + `messages/*.json`.

### Batch E — Pricing/location layering (`refactor:`)

**E1 · Move LOCATION_DATA / getLocationPrice out of the UI component (L49)**
- Bug: `components/shared/search-filters/location-picker.tsx:14-36` hardcodes
  `LOCATION_DATA` (pickup/return locations with **delivery fees in EUR** — revenue-bearing
  business data) and `getLocationPrice`, and `lib/vehicle-utils.ts:2` +
  `hooks/use-reservation-pricing.ts:3` import `getLocationPrice` **from the component** —
  an inverted lib→component dependency. Fees are invisible to the server.
- Fix: move `LOCATION_DATA` + `getLocationPrice` into `lib` (e.g. `lib/locations.ts`); the
  picker imports from lib and receives the list as data. Update `lib/vehicle-utils.ts` and
  the hook to import from lib.
- Files: `components/shared/search-filters/location-picker.tsx`, `lib/vehicle-utils.ts`,
  `hooks/use-reservation-pricing.ts`, new `lib/locations.ts`.
- Cross-ref: **pricing-security** L16 wants location fees available server-side for total
  recomputation — putting the data in `lib` (importable by both) is a prerequisite; if
  they'd rather host it in Convex, coordinate. This batch does the *layering* move; leave
  server-side recompute to pricing-security.
- Verify: reservation price with a non-airport delivery/return location matches pre-change;
  `npx tsc --noEmit` clean.

**E2 · Move pricing logic out of `types/vehicle.ts` into `lib/vehicle-utils.ts` (L105)**
- Bug: `types/vehicle.ts` correctly derives `Vehicle` types from the Convex `Doc` but then
  hosts ~80 lines of pricing business logic (`getBasePriceTier`, `getPriceForDuration`,
  `getTotalPrice`, `getPriceRange`, `getBasePricePerDay` which *throws* on missing tiers) —
  making a "types" module a runtime failure source, while `lib/vehicle-utils.ts` is the
  established home for pricing helpers.
- Fix: move those functions into `lib/vehicle-utils.ts`; keep only type derivations in
  `types/vehicle.ts`. Update imports at call sites.
- Files: `types/vehicle.ts`, `lib/vehicle-utils.ts`, and all importers of the moved
  functions.
- Cross-ref: pricing-security is consolidating pricing — hand them the canonical location
  so their server module and this share one home; coordinate to avoid a merge collision in
  `lib/vehicle-utils.ts`.
- Verify: `npx tsc --noEmit`; car detail / reservation price ranges unchanged.

**E3 · Collapse `calculateVehiclePricing` + `calculateVehiclePricingWithSeason` (L75)**
- Bug: `lib/vehicle-utils.ts` has two near-identical ~40-line functions; the seasonal
  variant defaults the multiplier to 1.0 and subsumes the plain one. Only live callers of
  the plain variant are in `edit-reservation-dialog.tsx` (a dead import lingers in
  `use-vehicle-details.ts`, owned by dead-code).
- Fix: collapse into one function with a defaulted `seasonalMultiplier = 1.0`; update the
  five call sites in `edit-reservation-dialog.tsx`.
- Files: `lib/vehicle-utils.ts`, `components/admin/reservations/edit-reservation-dialog.tsx`.
- Cross-ref: **admin-dialogs** owns edit-reservation-dialog internals — either they call
  the collapsed function, or land E3 first and let them consume it. Coordinate the dialog
  edit. **pricing-security** touches the same file for SCDW/season.
- Verify: edit-reservation suggested prices identical with and without an active season.

### Batch F — Shared formatting & status helpers (`refactor:`)

**F1 · Canonical translated `StatusBadge` (L61)**
- Bug: `getStatusColor`/`getStatusBadge`/`getStatusLabel` with an inline `statusConfig` map
  and silent fallback is copy-pasted across `app/admin/transfers/page.tsx`,
  `components/admin/reservations/reservation-table.tsx`,
  `components/features/reservations/user-reservations-table.tsx`, both confirmation pages,
  `components/admin/vehicles/vehicles-table.tsx`, `components/admin/seasons/seasons-table.tsx`,
  with drift (hardcoded English vs i18n labels; the reservation confirmation omits
  `completed`). `lib/reservation-utils.ts` holds a dead untranslated variant.
- Fix: extract one `<StatusBadge status kind />` component (or a typed status-map + hook)
  using `next-intl` labels, covering the full status set; delete the copies.
- Files: the 8 files above + a new `components/shared/status-badge.tsx` (or `lib`).
- Cross-ref: **i18n** owns the label strings — define the translation keys with them;
  **dead-code** owns removing the dead `lib/reservation-utils.ts` variant. Confirmation
  pages overlap reservation-decomp.
- Verify: each surface shows the same translated label/color per status, including
  `completed` on the reservation confirmation.

**F2 · Shared `formatDate` / `formatPrice` (L62)**
- Bug: copy-pasted across `app/admin/transfers/page.tsx`,
  `components/features/reservations/user-reservations-table.tsx`,
  `components/admin/reservations/reservation-table.tsx` with **diverged output** — prices
  `€X.XX` vs `X.XX EUR`; dates `format("MMM d, yyyy")` vs `toLocaleDateString()`.
- Fix: extract `formatPrice`/`formatDate` into `lib` (pick one canonical currency + date
  format), update the three files.
- Files: the three above + `lib/format.ts` (or extend an existing lib).
- Verify: all three tables render one consistent price/date format.

**F3 · Import `formatDuration` from lib everywhere (L66)**
- Bug: `lib/mapbox.ts:89` exports canonical `formatDuration`, but
  `transfer-summary-card.tsx` re-implements it, `transfer-search-form.tsx` inlines the same
  hours/minutes formatting in JSX, and `transfers/confirmation/[transferId]/page.tsx`
  carries a dead local copy.
- Fix: import `formatDuration` from `lib/mapbox.ts` in the summary card and search form;
  delete the dead confirmation copy.
- Files: `components/features/transfers/transfer-summary-card.tsx`,
  `components/features/transfers/transfer-search-form.tsx`,
  `app/[locale]/transfers/confirmation/[transferId]/page.tsx`.
- Verify: duration displays unchanged across the transfer flow.

**F4 · Consolidate `getPaymentMethodLabel` + slug helpers (L77)**
- Bug: `getPaymentMethodLabel` exists 4x (identical in `lib/email-utils.ts` and
  `convex/emails/utils.ts`, a drifted switch in `lib/reservation-utils.ts`, plus inline
  labels in the reservation confirmation page and the paymentMethods array). Slug
  validators/generators in `lib/blog-utils.ts` and `lib/vehicle-utils.ts` share an
  identical regex + near-identical slugification.
- Fix: one canonical `getPaymentMethodLabel` (one casing) and one slug helper module; point
  all sites at them.
- Files: `lib/email-utils.ts`, `convex/emails/utils.ts`, `lib/reservation-utils.ts`,
  `app/[locale]/reservation/confirmation/page.tsx`, `lib/blog-utils.ts`,
  `lib/vehicle-utils.ts`.
- Cross-ref: **dead-code** L27 is deleting the `lib/email-*` stack (`lib/email-utils.ts`)
  and reservation-decomp/i18n touch the confirmation labels — sequence after dead-code
  settles which email module survives, then point the label helper at the surviving module.
- Verify: payment labels identical in confirmation UI and emails; blog/vehicle slugs
  unchanged.

### Batch G — Vehicle filters simplification (`refactor:`)

**G1 · Parameterize `use-vehicle-filters` by category (L78)**
- Bug: `hooks/use-vehicle-filters.ts` (300 lines) stamps four structurally identical
  option-count memos, four toggle callbacks, four remove callbacks, and 4x active-filter
  arithmetic (brand/fuel/transmission/type); `vehicle-filters.tsx` repeats the four chip +
  checkbox blocks. Adding a fifth category needs ~10 edits.
- Fix: drive the hook off a category-key config (collapses to ~80 lines); render the UI as a
  single `map` over categories.
- Files: `hooks/use-vehicle-filters.ts`, `components/features/vehicles/vehicle-filters.tsx`.

**G2 · Remove the cars-page filter effect round-trip (L96)**
- Bug: `app/[locale]/cars/cars-page-client.tsx` pushes filter results to the parent via a
  `useEffect` (render → effect → parent setState → full second render per toggle),
  duplicates them into `displayedVehicles` state, and `handleFilterChange` re-joins with
  `initialVehicles.find()` inside `.map()` (O(n·m)) plus an `as VehicleWithImageUrl` cast —
  pure compensation for a non-generic prop signature. The brand predicate re-runs
  `normalizeString` per vehicle per selected brand.
- Fix: make `useVehicleFilters` generic and call it directly in the parent; render derived
  data without the effect/second-state round-trip; pre-normalize brands once.
- Files: `app/[locale]/cars/cars-page-client.tsx`,
  `components/features/vehicles/vehicle-filters.tsx`, `hooks/use-vehicle-filters.ts`.
- Cross-ref: **frontend-perf** owns broader cars-page render perf (L94 sibling on home) —
  this is the filter-pipeline-specific fix; keep scope to the filter round-trip.
- Verify: toggling a filter updates the grid with a single render pass; results identical
  to before.

_G1 and G2 touch the same two files — ship as one PR._

### Batch H — Public-page storage-lifecycle dedup (`refactor:`)

**H1 · `useTransferSearch` hook + shared "missing details" guard (L63)**
- Bug: `transfers/vehicles/page.tsx` and `transfers/booking/page.tsx` each re-implement:
  load `transferStorage` in an effect, track `isHydrated`, render a spinner, then a
  near-identical "Missing Transfer Details" fallback with duplicated required-field checks;
  booking duplicates the 4-field check a third time in `handleSubmit`.
- Fix: extract a `useTransferSearch` hook (mirroring `hooks/use-vehicle-search.ts`) plus one
  guard component; both pages consume them.
- Files: `app/[locale]/transfers/vehicles/page.tsx`,
  `app/[locale]/transfers/booking/page.tsx`, `lib/transfer-storage.ts`, new
  `hooks/use-transfer-search.ts`.
- Cross-ref: **reservation-decomp** owns transfers/booking *checkout* dedup (L30) and
  **i18n** owns the "Missing Transfer Details" strings (L36); this batch owns the *guard
  + hook structure*. Coordinate the shared booking-page edit. Depends on Batch C
  (transferStorage persistence moved to the form).
- Verify: both transfer pages hydrate and guard identically; missing-details fallback still
  shows when storage is empty.

**H2 · car-detail-client reuses `useVehicleSearch` (L64) + dead-branch cleanup (L112)**
- Bug: `app/[locale]/cars/[slug]/car-detail-client.tsx` hand-rolls `searchStorage`
  hydration/persistence (RentalState + isHydrated + load-in-effect + save-on-update),
  duplicating the canonical `useVehicleSearch` used by home/cars. It also has an unreachable
  `if (!vehicle)` branch (vehicle is a required non-null prop; the server page already calls
  `notFound()`; earlier lines dereference it) and `buildReservationUrl` is a `useCallback`
  invoked once inline per render.
- Fix: reuse `useVehicleSearch` (extend it with a bulk-update method if needed, minus the
  date-adjustment logic the detail page doesn't want); delete the unreachable branch; inline
  `buildReservationUrl` as a plain template string.
- Files: `app/[locale]/cars/[slug]/car-detail-client.tsx`, `hooks/use-vehicle-search.ts`.
- Cross-ref: depends on Batch C (DateTimePicker controlled) so persistence lands cleanly in
  the hook. **dead-code** may also flag the branch — coordinate so one PR removes it.
- Verify: car detail search state persists/restores like home/cars; reserve URL builds
  correctly; page still 404s for unknown slugs (server-side).

### Batch I — Admin dashboard / ordering UI dedup (`refactor:`)

**I1 · Shared dashboard components (L67)**
- Bug: `app/admin/transfers/page.tsx` (647 lines) and `app/admin/reservations/page.tsx` are
  near-identical dashboards — same 4-stat-card grid, same BarChart+LineChart cards with
  identical props, duplicated multi-card skeletons.
- Fix: extract shared `StatCard`, chart-card, and `DashboardSkeleton` components; move the
  inlined transfers table into `components/admin/transfers/` mirroring `ReservationsTable`.
- Files: `app/admin/transfers/page.tsx`, `app/admin/reservations/page.tsx`, new shared
  components under `components/admin/`.
- Cross-ref: **convex-perf** L42/L47 rewrite the *data* these dashboards consume
  (server-side stats) — this batch is UI-only; coordinate so both don't rewrite the same
  page simultaneously (land convex-perf's query change, then the UI extraction, or vice
  versa with a rebase).
- Verify: both dashboards render identical stats/charts to before.

**I2 · `PricingField` component for VehicleOrderingPage (L68)**
- Bug: `app/admin/vehicles/classes/[classId]/page.tsx` triplicates one pricing-field concept
  — three value-string states, three `isSaving` booleans, three near-identical
  parse/validate/save handlers hitting the same mutation, three ~31-line Input+Button cards
  (lines 100-194, 296-403).
- Fix: extract a single config-driven `PricingField` (label, description, unit, value,
  validation, mutation key) rendered three times.
- Files: `app/admin/vehicles/classes/[classId]/page.tsx`, new
  `components/admin/vehicles/pricing-field.tsx`.
- Cross-ref: same file as A1 (crash fix) and L89 (per-image subscription, convex-perf) —
  land A1 first; keep I2 scoped to the pricing cards.
- Verify: all three pricing fields save and validate as before.

**I3 · Shared dnd-kit sortable helper (L69)**
- Bug: `app/admin/vehicles/classes/page.tsx` and `.../classes/[classId]/page.tsx` duplicate
  the entire dnd-kit scaffold — identical `SortableCard` wrapper, `useSensors` config, and
  `handleDragEnd` (arrayMove + optimistic setItems + index-mapped mutation + revert-on-error
  toast).
- Fix: extract a `useSortableReorder`/`<SortableList>` helper taking items + a reorder
  mutation; both pages consume it.
- Files: `app/admin/vehicles/classes/page.tsx`,
  `app/admin/vehicles/classes/[classId]/page.tsx`, new `hooks/use-sortable-reorder.ts` (or
  `components/admin/sortable-list.tsx`).
- Cross-ref: `[classId]/page.tsx` is heavily touched by A1/I2 — sequence I3 after them or
  bundle all three class-page edits into one PR.
- Verify: drag-reorder works and reverts on error on both class pages.

**I4 · AdminLayout breadcrumb route-config (L97)**
- Bug: `app/admin/layout.tsx` builds breadcrumbs with a magic special case —
  `pathSegments.includes("classes")` plus a hardcoded `index === 3` to swap in the class
  display name — coupling the shared layout to one route's URL depth; it breaks the moment
  another dynamic segment is added.
- Fix: move label resolution to a route-config map or per-segment resolver.
- Files: `app/admin/layout.tsx`.
- Verify: breadcrumbs correct on class pages and unaffected on other admin routes.

_I2/I3 share `[classId]/page.tsx`; I4 is standalone. Group I2+I3 (+A1) into the
class-pages PR, ship I1 and I4 separately._

### Batch J — Convex validator / mutation hygiene (`refactor:`)

**J1 · Shared vehicle literal-union validators (L74)**
- Bug: vehicle literal unions (type/fuelType/transmission/status) are duplicated in
  `schema.ts` and ~5x across `vehicles.ts` **with drift** — `getAll`/`searchAvailableVehicles`
  accept `fuelType: 'petrol'` not in the schema; `getAllVehiclesWithClasses` hand-maintains
  an ~87-line returns validator with a stale `class` union. Same pattern for
  status/paymentMethod/customerInfo across `reservations.ts`, `transfers.ts`, `emails.ts`
  (only `pricingTierValidator` is shared today).
- Fix: define shared `v.union(...)` validator constants (one per enum) in a
  `convex/validators.ts` (or extend the existing shared file) and reference them from schema
  + function args + returns. Reconcile the `petrol`/`benzina` drift here in lockstep with K3.
- Files: `convex/vehicles.ts`, `convex/schema.ts`, `convex/reservations.ts`,
  `convex/transfers.ts`, `convex/emails.ts`, `convex/validators.ts` (new/extended).
- Cross-ref: **convex-perf** L58 adds missing `returns` validators to these same files —
  strong overlap; coordinate so shared validators land first and convex-perf's returns work
  references them (or merge the two efforts). **pricing-security** also edits
  `reservations.ts`/`transfers.ts` args.
- Verify: `npx tsc --noEmit`; deploy Convex — no schema/validator errors; a vehicle with
  each fuelType saves.

**J2 · `localizeBlog` helper (L73)**
- Bug: the locale-projection block with the `_ro`/`_en` fallback (title/description/
  readingTime + content in `getBySlug`) is copy-pasted in `getAll`, `getFeatured`,
  `getPublished`, `getBySlug`, and `getAllAdmin`.
- Fix: extract a `localizeBlog(blog, locale)` helper next to the existing `resolveSlug`.
- Files: `convex/blogs.ts`.
- Cross-ref: **convex-perf** L46 rewrites `getBySlug`/`getAlternateSlug` (the `as any`
  typed helper) and L23/L86 rework the same blog queries for indexes + image resolution —
  heavy overlap in `convex/blogs.ts`. Coordinate a single blogs.ts refactor pass or
  sequence carefully; `localizeBlog` composes cleanly with `findBlogBySlug`.
- Verify: blog list/detail render identical localized fields in ro and en.

**J3 · One `stripUndefined` helper for update mutations (L99)**
- Bug: the "strip undefined then patch" idiom is re-implemented 5 ways —
  `reservations.updateReservationDetails` (18 sequential ifs),
  `transfers.updateTransferDetails` (Record loop), per-field ifs in
  `users`/`vehicleClasses`/`transferPricing`, and `seasons.update`'s **miswritten**
  `Object.fromEntries(...).filter(([value]) => ...)` which destructures the KEY as `value`,
  making it a no-op (latent because Convex omits unsupplied optional args).
- Fix: one shared `stripUndefined(obj)` helper (in `convex/lib` or a shared module) used by
  all five; this also corrects the latent `seasons.update` bug.
- Files: `convex/seasons.ts`, `convex/reservations.ts`, `convex/transfers.ts`,
  `convex/users.ts`, `convex/vehicleClasses.ts`, `convex/transferPricing.ts`, shared helper.
- Cross-ref: **pricing-security** adds `requireAdmin` to several of these same mutations
  and **convex-perf** edits args/returns — coordinate to avoid churn collisions in the
  mutation bodies.
- Verify: partial updates (some fields omitted) behave identically; a season partial update
  now actually strips undefined without clobbering.

### Batch K — Type-safety cleanups (`refactor:`)

**K1 · Derive the paymentMethod union once; drop checkout casts (L101)**
- Bug: `paymentMethod` is held as plain string and cast to the union at mutation time in the
  reservation page and transfers booking page (union duplicated across the zod schema, the
  paymentMethods config, and the casts); `selectedVehicleId` is cast `as Id<"vehicles">`;
  the `seasonId` cast papers over `lib/season-utils.ts` typing season ids as plain string;
  `created?.reservationId ?? created` is dead (createReservation has a returns validator).
- Fix: derive a `PaymentMethod` type from the paymentMethods config (single source), type
  the form with it, drop the mutation-time casts; type season/vehicle ids off `Id<>`.
- Files: `app/[locale]/reservation/page.tsx`, `app/[locale]/transfers/booking/page.tsx`,
  `lib/transfer-storage.ts`, `lib/season-utils.ts`.
- Cross-ref: reservation page owned by **reservation-decomp**, booking checkout by
  reservation-decomp, `lib/season-utils.ts` by **pricing-security** (they may delete it as
  the dead server-mirror per L34). Sequence after those settle; if `season-utils` is
  deleted, the seasonId typing follows the surviving module. Do the config-derived type +
  cast removal; leave page structure to the owners.
- Verify: `npx tsc --noEmit` with the casts removed; checkout submits succeed.

**K2 · Export `locales` + `Locale` from `i18n.ts` (L102)**
- Bug: `const locales = ['ro','en']` exists in both `i18n.ts` (unexported) and
  `app/[locale]/layout.tsx`, each with an `includes(locale as any)` check; unvalidated
  `locale as "ro" | "en"` casts appear in the blog server pages and client components.
- Fix: export a single `locales` const + `Locale` type + a narrowing helper
  (`isLocale`/`assertLocale`) from `i18n.ts`; replace the duplicate array and the casts.
- Files: `i18n.ts`, `app/[locale]/layout.tsx`, `app/[locale]/blog/page.tsx`,
  `app/[locale]/blog/[slug]/page.tsx`, `components/features/blog/blog-detail-client.tsx`,
  `components/features/blog/blog-list-client.tsx`.
- Cross-ref: **i18n** and **convex-perf** (blog pages) touch these files — coordinate; this
  is a small type-contract export they can both build on.
- Verify: `npx tsc --noEmit`; locale routing unchanged.

**K3 · Reconcile fuel-type `petrol` vs `benzina` (L103)**
- Bug: `edit-vehicle-dialog`'s zod schema allows `'petrol'` and falls back to it for
  vehicles with undefined fuelType, though its Select only offers
  diesel/electric/hybrid/benzina and the Convex schema excludes `'petrol'` — saving such a
  vehicle **untouched is rejected by the updateVehicle validator at runtime**. `'petrol'`
  also lingers in `vehicles.ts`'s list-filter validator and `types/email.ts`.
- Fix: consolidate on the canonical `FuelType` from `types/vehicle.ts`; pick one of
  petrol/benzina and remove the other everywhere (schema, dialog schema + fallback,
  vehicles.ts filter validator, types/email.ts).
- Files: `components/admin/vehicles/edit-vehicle-dialog.tsx`,
  `components/admin/vehicles/create-vehicle-dialog.tsx`, `convex/vehicles.ts`,
  `types/email.ts`, `types/vehicle.ts`, `convex/schema.ts` (verify).
- Cross-ref: **admin-dialogs** owns the vehicle dialog internals and **J1** shares the
  fuelType validator — do K3's enum reconciliation together with J1's shared validator so
  the value is defined once. dead-code owns `types/email.ts` removal if the email stack
  dies — sequence accordingly.
- Verify: create + edit a benzina vehicle and save untouched — no validator rejection;
  `npx tsc --noEmit`.

**K4 · Standardize zod coercion typing (L122)**
- Bug: `zodResolver(schema) as any` with an eslint-disable appears 3x
  (`transfer-pricing-dialog` twice, `create-class-dialog` once) to paper over the
  `z.coerce` input/output mismatch; other dialogs avoid coercion via regex-string fields +
  manual `parseInt` — two competing conventions.
- Fix: standardize on typed coercion — type the forms with `z.input<typeof schema>` /
  `useForm<Input, unknown, Output>` and drop the `as any` + eslint-disable.
- Files: `components/admin/transfers/transfer-pricing-dialog.tsx`,
  `components/admin/vehicle-classes/create-class-dialog.tsx`.
- Cross-ref: **admin-dialogs** owns the coercion-vs-string-field convention decision for
  the six main dialogs — align on one convention with them before applying, so the whole
  admin surface converges.
- Verify: forms submit with coerced numbers; no `as any`, lint clean for these files.

### Batch L — Component simplifications (`refactor:`)

**L1 · Remove duplicated animation variants in about page (L65)**
- Bug: `app/[locale]/about/page.tsx` defines a local `sectionAnimationVariants` that is a
  verbatim copy of `contactAnimationVariants` from `lib/animations.ts`, and its name
  **collides** with the canonical `sectionAnimationVariants` export other pages import
  (different timings).
- Fix: delete the local copy and import `contactAnimationVariants` (NOT the canonical
  `sectionAnimationVariants`, whose timings differ) to preserve the page's current
  animation.
- Files: `app/[locale]/about/page.tsx`, `lib/animations.ts`.
- Cross-ref: about page also touched by A2 (nav) and **dead-code** L82 (framer-motion/motion
  consolidation) — coordinate imports.
- Verify: about page animations visually unchanged.

**L2 · rental-details.tsx: render from props, drop shadow state (L100)**
- Bug: `components/shared/navigation/rental-details.tsx` mirrors all 6 props into 6 local
  `useState` kept in sync by 6 one-liner `useEffect`s, then writes every change to both
  local state and the parent — a fully controlled component simulating uncontrolled state
  (12 redundant hooks + drift risk).
- Fix: render directly from props and call `onUpdateDetails` on change; delete the 6
  states + 6 effects.
- Files: `components/shared/navigation/rental-details.tsx`.
- Verify: editing rental details still updates the parent live; no stale/drift.

---

## Implementation steps

1. **Land shared modules first** so consumers can import them:
   - Batch D (`lib/company.ts`), Batch E1 (`lib/locations.ts`), Batch C2
     (`createLocalStorage`), Batch F (`lib/format.ts`, StatusBadge, payment/slug helpers).
2. **Then the controlled-component + storage batches**: C1 (DateTimePicker) → H1/H2
   (transfer/car-detail lifecycle) → B2 (Directions guard). B1 (mapbox lib helpers) can go
   any time after B's lib additions.
3. **Independent correctness fixes** (Batch A) can ship first and in parallel — they touch
   isolated files.
4. **Convex hygiene** (Batch J) must be coordinated with convex-perf and pricing-security
   (shared files) — agree an ordering before starting; prefer landing shared validators
   (J1) before their returns-validator/auth passes.
5. **Type-safety** (Batch K) mostly follows the owners of its files (reservation-decomp,
   pricing-security, admin-dialogs) — do K2 (locale export) early (low-risk, widely useful),
   K1/K3/K4 after their file-owners settle.
6. **UI dedup batches** (G, I, L) are independent; sequence the `[classId]/page.tsx` edits
   (A1 + I2 + I3) into one PR to avoid repeated conflicts on that file.
7. Every PR: `npx tsc --noEmit` clean (CI gate), no new lint errors, conventional-commit PR
   title with the type shown per batch. Use `/verify` on batches with runtime surface
   (A, B, C, G, H).

## Dependencies

- **Batch C1 → H1, H2, B2**: DateTimePicker must be controlled before per-form persistence
  is wired.
- **Batch F4 (payment/slug) ← dead-code L27**: wait until the surviving email module is
  known before pointing the label helper at it.
- **Batch J1 ↔ convex-perf L58 / pricing-security**: shared validators should precede (or
  merge with) the returns-validator + auth passes on the same Convex files.
- **Batch E ↔ pricing-security**: LOCATION_DATA + pricing-helper homes must be agreed so
  the server-recompute work (pricing-security) and this layering move don't collide in
  `lib/vehicle-utils.ts`.
- **Batch K1/K3 ↔ admin-dialogs, reservation-decomp, pricing-security**: type derivations
  live in files those plans own; sequence after their structural edits.
- **Batch I1 ↔ convex-perf L42/L47**: dashboard UI extraction vs server-stats rewrite touch
  the same admin pages — agree merge order.
- **`[classId]/page.tsx`**: A1, I2, I3 all edit it — bundle.

## Open questions

1. **searchAvailableVehicles (A3)**: delete outright, or is a reservation-overlap availability
   query planned soon? Default: delete. Confirm no upcoming feature needs it.
2. **petrol vs benzina (K3)**: which value is canonical for the DB going forward? A data
   migration may be needed if existing rows store `petrol`. Confirm with data owner.
3. **messages/*.json company values (D1)**: translation JSON can't import `lib/company.ts` —
   accept that the phone/email in messages must be kept in sync manually (documented), or is
   a build-time codegen step desired? Default: document + manual sync.
4. **season-utils fate (K1 seasonId typing)**: pricing-security (L34) may delete
   `lib/season-utils.ts` as a dead server-mirror. If deleted, K1's season-id typing follows
   the surviving module — confirm ownership before K1.
5. **Shared-file merge choreography**: `convex/blogs.ts`, `convex/reservations.ts`,
   `convex/transfers.ts`, and the confirmation pages are each edited by 2–3 plans. Propose a
   short sync to agree an ordering (likely: convex-perf structural → this plan's helpers →
   pricing-security auth).

## Size estimate

~34 findings across 12 batches. Rough effort:
- **Small / low-risk (≤~1h each):** A1, A2, A3, C3, F3, I4, L1, L2, K2, K4 — mechanical.
- **Medium (~2–4h each):** B1+B2, C1, C2, D1, E1, E2, E3, F1, F2, F4, G1+G2, H1, H2, I1,
  I2, I3, J2, J3, K1, K3.
- **Larger / coordination-heavy:** J1 (shared Convex validators, entangled with convex-perf
  + pricing-security), D1 (12 files), F1 (8 files).

Total: roughly **1.5–2.5 engineer-weeks** if batches are parallelized across the noted
dependencies, with the critical path being the Convex-hygiene coordination (Batch J) and
the storage/controlled-component chain (C → H → B). No batch is individually large; the
cost is breadth (many files) and the cross-plan choreography on shared Convex files and the
confirmation pages.
