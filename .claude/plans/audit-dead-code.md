# Remediation Plan — Dead Code & Dependency Cleanup

Source: `AUDIT.md` (thermo-nuclear audit). Branch: `audit/thermo-nuclear-code-review`.
This plan owns the dead-code removal, unused-dependency removal, and the two
modernization findings. It is deletion-heavy and low-risk: the goal is to shrink the
tree without changing any live behavior. Every deletion below was re-verified on
2026-07-10 (grep evidence inline); the executor MUST re-run each verification command
at execution time because sibling audit branches move code.

## Scope

**In scope (claimed from AUDIT.md):**
- The `-with-preloaded-images` fork orphans + dead `components/features/vehicles/index.ts` barrel (High dead-code)
- The `lib/` email stack vs live `convex/emails/` (High dead-code)
- Dead hooks/libs: `use-vehicle-list`, `use-vehicle-details`, `use-homepage-featured-vehicles`, `lib/flight-validation.ts`, `lib/google.ts` (Medium dead-code)
- Unused deps `@clerk/react@^6`, `@googlemaps/google-maps-services-js` (Medium dead-code)
- `VehicleSearchFilterForm` dead dual controlled/uncontrolled fallback (~130 lines) (Medium dead-code)
- `vehicles.searchAvailableVehicles` misleading dead query (High bug — implement-or-delete)
- `car-detail-client.tsx` unreachable `if (!vehicle)` branch + one-shot `buildReservationUrl` useCallback (Low dead-code)
- Admin Settings surface: dead `app/admin/settings/page.tsx` + commented sidebar nav (Low dead-code)
- **Modernization 1:** framer-motion + motion both installed → consolidate on `motion` (Medium)
- **Modernization 2:** `--webpack` flag on Next 16 → migrate MDX config, enable Turbopack (Medium)

**Cross-referenced, NOT claimed here (owned by sibling plans):**
- The reservation-page decomposition cluster (`PersonalInfoCard`, `PaymentMethodCard`,
  `AdditionalFeaturesCard`, `components/features/reservations/index.ts`,
  `use-reservation-form.ts`, `use-reservation-pricing.ts`, `lib/reservation-utils.ts`,
  and the line-538 AI-artifact comment) → **`audit-reservation-decomposition.md`**. That
  cluster is a "make-canonical-or-delete" decision entangled with the 1888-line
  reservation page rewrite, so it stays with that plan even though it is tagged
  dead-code. Coordinate before deleting any of those files.
- `lib/season-utils.ts` vs `convex/seasons.ts` dead parallel pricing logic →
  **`audit-pricing-security.md`** (pricing-critical; extract-or-delete decision there).
- `faq.tsx` dead `DEFAULT_CAR_RENTAL_FAQS` English fallback → **i18n plan** (bundled with
  the testimonials/FAQ i18n move).
- The broader `getPaymentMethodLabel` / StatusBadge / formatter consolidation duplication
  findings → duplication/email plans. Deleting `lib/email-utils.ts` here removes one of
  the four `getPaymentMethodLabel` copies as a side effect; flag it to the duplication owner.

## Deletion inventory

Legend for the verify column: run the command; **it must print `NONE` / no output**
(other than the file's own definition) for the deletion to be safe.

### Whole-file deletions (16 files, ~1,290 lines)

| # | File (lines) | Evidence of deadness | Verify before deleting |
|---|---|---|---|
| 1 | `lib/email-factory.ts` (90) | No importer anywhere; only pulls from `types/email.ts` (also dead). Live path is `convex/emails/{types,utils}.ts`. | `rg -n "lib/email-factory" -g '*.ts' -g '*.tsx'` |
| 2 | `lib/email-utils.ts` (82) | No importer; self-references `types/email.ts`. Duplicate of `convex/emails/utils.ts`. | `rg -n "lib/email-utils" -g '*.ts' -g '*.tsx'` |
| 3 | `types/email.ts` (71) | Referenced ONLY by the two dead files above → deletable as a unit with them. | `rg -n "types/email" -g '*.ts' -g '*.tsx'` (only lines 1–2 should be the two dead files) |
| 4 | `components/features/vehicles/index.ts` (15) | Barrel; **zero importers** of `features/vehicles` as a barrel path. Every live component is imported by direct file path. | `rg -n "features/vehicles['\"]" -g '*.ts' -g '*.tsx'` |
| 5 | `components/features/vehicles/vehicle-card.tsx` (229) | Reachable only via dead `vehicle-list-display.tsx` (row 6) and the dead barrel. Live grid uses `vehicle-card-with-preloaded-image.tsx`. | `rg -n "vehicles/vehicle-card\"" -g '*.tsx'` (only hit: dead `vehicle-list-display.tsx`) |
| 6 | `components/features/vehicles/vehicle-list-display.tsx` (239) | No importer (barrel only). Live list is `vehicle-list-display-with-preloaded-images.tsx`. | `rg -n "vehicles/vehicle-list-display\"" -g '*.tsx'` |
| 7 | `components/features/vehicles/vehicle-card-skeleton.tsx` (38) | Imported only by dead `vehicle-list-display.tsx` + dead barrel. | `rg -n "vehicle-card-skeleton" -g '*.tsx'` |
| 8 | `components/features/vehicles/vehicle-filters-skeleton.tsx` (59) | No importer (barrel only). | `rg -n "vehicle-filters-skeleton" -g '*.tsx'` |
| 9 | `components/features/vehicles/vehicle-search-form-skeleton.tsx` (49) | No importer (barrel only). | `rg -n "vehicle-search-form-skeleton" -g '*.tsx'` |
| 10 | `components/features/vehicles/vehicle-image.tsx` (33) | No importer. `vehicles-table.tsx` has its own local `VehicleImage` component; car detail uses `vehicle-image-carousel-with-preloaded-images.tsx`. | `rg -n "vehicles/vehicle-image\"" -g '*.tsx'` |
| 11 | `hooks/use-vehicle-list.ts` (62) | No importer; superseded by server `fetchQuery`. | `rg -n "use-vehicle-list" -g '*.ts' -g '*.tsx'` |
| 12 | `hooks/use-vehicle-details.ts` (99) | No importer; holds a dead `calculateVehiclePricing` import (feeds the duplication finding). | `rg -n "use-vehicle-details" -g '*.ts' -g '*.tsx'` |
| 13 | `hooks/use-homepage-featured-vehicles.ts` (63) | No importer. | `rg -n "use-homepage-featured-vehicles" -g '*.ts' -g '*.tsx'` |
| 14 | `lib/flight-validation.ts` (114) | All exports unimported. | `rg -n "flight-validation" -g '*.ts' -g '*.tsx'` |
| 15 | `lib/google.ts` (29) | Unused `'use server'` Places autocomplete; sole importer of `@googlemaps/...`. | `rg -n "lib/google\b" -g '*.ts' -g '*.tsx'` |
| 16 | `app/admin/settings/page.tsx` (15) | Placeholder page; sidebar nav item is commented out (`admin-sidebar.tsx:61-63`), reachable only by typing the URL. | `rg -n "admin/settings" -g '*.ts' -g '*.tsx'` |

### Partial (dead-code excised from live files)

| File | Action | Verify |
|---|---|---|
| `convex/vehicles.ts` | Delete the exported `searchAvailableVehicles` query — declares `startDate`/`endDate`/`deliveryLocation` args it never uses, never consults `reservations`, and has **zero callers**. See Decision D2. | `rg -n "searchAvailableVehicles" -g '*.ts' -g '*.tsx'` → only the definition |
| `components/features/vehicles/vehicle-search-filter-form.tsx` (289) | Remove the dead dual-mode fallback: 6 internal `useState`, 6 setter shims, 2 localStorage effects, 4 `initial*` props (~130 lines). Sole call site `home-page-client.tsx` always passes `searchState` + `updateSearchField`; make the controlled props required. | `rg -n "vehicle-search-filter-form|VehicleSearchFilterForm" -g '*.tsx'` → only `home-page-client.tsx` |
| `components/admin/admin-sidebar.tsx` | Delete the commented-out Settings nav block (lines ~61-63). `Settings2` is not actually imported, so no import to touch. | `rg -n "Settings2" components/admin/admin-sidebar.tsx` → only the commented line |
| `app/[locale]/cars/[slug]/car-detail-client.tsx` | Remove the unreachable `if (!vehicle)` branch (line ~113 — `vehicle` is a required non-null prop and the server page already calls `notFound()`); inline the one-shot `buildReservationUrl` useCallback (defined line ~98, called once line ~105) as a plain template string. | Manual read of the file around lines 98-115 |

### Dependency removals (3 deps)

| Dep | Evidence | Order constraint |
|---|---|---|
| `@clerk/react@^6` | **Zero** source references (`rg "@clerk/react"` → NONE). Legacy Clerk runtime sitting next to `@clerk/nextjs@^7`. | Anytime |
| `@googlemaps/google-maps-services-js` | Only importer is `lib/google.ts`. | **Must delete `lib/google.ts` first** (batch 3) |
| `framer-motion` | Consolidation onto `motion` (same v12.38.0). See modernization batch M1. | **Must migrate 7 import sites first** |

## Decisions needed

**D1 — vehicle-card / vehicle-list-display pairs: DELETE the dead originals (recommended), do not unify.**
The audit framed this as "delete OR unify each pair into one component taking an `imageUrl`
prop." Recommendation: **delete**. The `-with-preloaded-images` variants are the sole live
path (home grid + cars grid), the originals are fully unreferenced, and unifying would mean
editing live components to gain zero runtime benefit while risking the two live grids. Pure
deletion removes ~440 lines with no behavior change.
*Optional cosmetic follow-up (out of this cleanup, do not bundle):* rename the surviving
`vehicle-card-with-preloaded-image.tsx` / `vehicle-list-display-with-preloaded-images.tsx`
to drop the now-meaningless `-with-preloaded-images` suffix. This is a rename-only churn
commit and touches 2 live import sites; defer unless the team wants it.

**D2 — `searchAvailableVehicles`: DELETE (recommended), do not implement.**
Implementing the reservation-overlap check is a *feature* (date-range availability
filtering) with product implications, not cleanup. No caller exists. Deleting removes a
misleading public contract now; if availability filtering is wanted it should be designed
in a dedicated feature plan with the `by_dates` index. Flag to the product owner rather
than silently implement.

**D3 — Modernization M2 (Turbopack) is opt-in and the riskiest item here.**
It swaps the bundler (`reactCompiler` currently runs through Babel-under-webpack; MDX
rehype/remark plugins must be re-specified as string names for Turbopack). Recommend
running it **last, as its own PR**, and only if the team wants it now — the payoff is dev
speed, and the blast radius (MDX rendering on blog pages, reactCompiler behavior) warrants
its own verification pass. If in doubt, ship batches 1–M1 and leave M2 as a follow-up.

## Implementation steps (batched)

Gate after **every** batch: `npx tsc --noEmit` must be clean (this is the CI merge gate).
Run `npm run build` after the last deletion batch and after each modernization batch.
Re-run the per-file verify command from the inventory immediately before each `git rm`.

**Batch 1 — `chore: remove dead lib email stack`**
`git rm lib/email-factory.ts lib/email-utils.ts types/email.ts`.
Gate: `npx tsc --noEmit`. (Note to duplication owner: one `getPaymentMethodLabel` copy is now gone.)

**Batch 2 — `refactor: delete orphaned vehicle-card fork and dead barrel`**
`git rm` rows 4–10 (index.ts, vehicle-card, vehicle-list-display, vehicle-card-skeleton,
vehicle-filters-skeleton, vehicle-search-form-skeleton, vehicle-image). Per D1.
Gate: `npx tsc --noEmit`.

**Batch 3 — `chore: remove dead hooks and libs`**
`git rm hooks/use-vehicle-list.ts hooks/use-vehicle-details.ts hooks/use-homepage-featured-vehicles.ts lib/flight-validation.ts lib/google.ts`.
Gate: `npx tsc --noEmit`.

**Batch 4 — `chore: drop unused deps @clerk/react and @googlemaps`**
`npm uninstall @clerk/react @googlemaps/google-maps-services-js`. Depends on Batch 3
(google.ts gone). Commit the `package.json` + `package-lock.json` change.
Gate: `npx tsc --noEmit`.

**Batch 5 — `refactor: remove dead searchAvailableVehicles query`** (per D2)
Delete the query from `convex/vehicles.ts`. Gate: `npx tsc --noEmit`.

**Batch 6 — `refactor: drop VehicleSearchFilterForm dead uncontrolled fallback`**
Make `searchState` + `updateSearchField` required props; delete the 6 `useState`, setter
shims, 2 localStorage effects, and 4 `initial*` props. Verify `home-page-client.tsx` still
type-checks (it already passes both props). Gate: `npx tsc --noEmit`.

**Batch 7 — `chore: remove dead admin settings page`**
`git rm app/admin/settings/page.tsx`; delete the commented Settings block in
`components/admin/admin-sidebar.tsx`. Gate: `npx tsc --noEmit`.

**Batch 8 — `refactor: drop unreachable car-detail not-found branch`**
Remove `if (!vehicle)` block; inline `buildReservationUrl`. Gate: `npx tsc --noEmit` +
`npm run build` (this is the final deletion batch — confirm the whole tree still builds).

**Batch M1 — `refactor: consolidate framer-motion onto motion`** (Modernization 1)
Rewrite `from "framer-motion"` → `from "motion/react"` in the 7 importers:
`lib/animations.ts`, `components/features/landing/feature-section-with-hover-effects.tsx`,
`components/features/landing/faq.tsx`, `components/admin/blog/create-blog-dialog.tsx`,
`components/admin/blog/edit-blog-dialog.tsx`, `components/ui/animated-group.tsx`,
`app/[locale]/about/page.tsx`. Before committing, confirm every named export used in those
files exists in `motion/react` (v12 is the successor package at the same 12.38.0 version;
`motion`, `AnimatePresence`, `useScroll`, variants, etc. all re-export). Then
`npm uninstall framer-motion`. Gate: `npx tsc --noEmit` + `npm run build`, and spot-check an
animated surface (about page, FAQ accordion, blog dialog) renders/animates.

**Batch M2 — `build: enable Turbopack, drop --webpack`** (Modernization 2 — opt-in, per D3, own PR)
In `next.config.ts` move the MDX `remarkPlugins`/`rehypePlugins` to string-name form for
Turbopack compatibility (`remark-gfm`, `rehype-highlight`, `rehype-slug`,
`[rehype-autolink-headings, {behavior:"wrap"}]`). Drop `--webpack` from `dev:frontend` and
`build` in `package.json`. Gate: `npm run build` **and** `npm run dev`, then manually verify
a blog detail page renders MDX (code highlighting, autolinked headings, GFM tables) and
reactCompiler still applies. If MDX breaks under Turbopack, revert this batch only — it is
independent of 1–M1.

## Dependencies

- **Batch order:** 4 depends on 3; dep removal in M1 depends on the 7 import rewrites.
- **Cross-plan:** Do not touch the reservation-decomposition files (owned by
  `audit-reservation-decomposition.md`) or `lib/season-utils.ts` (owned by
  `audit-pricing-security.md`). If those plans land first and delete their files, re-run
  the verify greps here — nothing in this plan imports them, so no conflict is expected.
- All batches are independent commits behind the same PR except M2, which should be its own PR.

## Open questions

1. **D2** — confirm nobody wants `searchAvailableVehicles` implemented as availability
   filtering before deleting. Default: delete.
2. **M2 (Turbopack)** — is enabling it in scope now, or defer? Default: ship as a separate,
   optional PR after the rest.
3. **D1 optional rename** — rename the surviving `-with-preloaded-images` components after
   the fork deletion? Cosmetic; default: skip.
4. The reservation-page dead-code cluster and `lib/season-utils.ts` are intentionally
   excluded — confirm the sibling plans are actually handling them so nothing falls through.

## Size estimate

- **16 whole files deleted** (~1,290 lines) — batches 1–3, 7.
- **3 dependencies removed** — `@clerk/react`, `@googlemaps/google-maps-services-js`,
  `framer-motion`.
- **4 live files edited for dead-code excision** — `convex/vehicles.ts` (query),
  `vehicle-search-filter-form.tsx` (~130 lines), `admin-sidebar.tsx`, `car-detail-client.tsx`.
- **7 files edited** for the framer-motion→motion consolidation (import-line only).
- **2 config files** for Turbopack (`next.config.ts`, `package.json`).
- Effort: batches 1–8 are ~1–2 hours of mechanical deletion + typecheck. M1 ~30 min. M2 is
  the wildcard (~1 hour if MDX cooperates under Turbopack, revertable if not).
- Net: roughly **1,400+ lines removed**, 3 deps gone, zero intended behavior change through Batch M1.
