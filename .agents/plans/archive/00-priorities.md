# Priority Order — July 2026 Roadmap

Synthesis of the 14 plans in this directory (8 audit remediation + 6 client features).
Strategy agreed with Mihai: **clean the audit base first, then build features on it** —
especially since both big features (coupons, affiliate) hard-depend on server-side
pricing, which is audit work.

## Phase 0 — Stop the bleeding (independent, ship first)

| # | Work | Plan | Why now |
|---|------|------|---------|
| 1 | Security PR: `requireAdmin` on all 28 unguarded admin writes, ownership checks on cancels, auth on PII queries + email API route | `audit-pricing-security.md` (security track) | Live exposure: anyone can call admin mutations / read customer PII today. Independent of everything else — fastest cut. |
| 2 | Image upload fix: `generateUploadUrl` + per-file POST (Convex side + client side) | `audit-convex-performance.md` (upload mutations) → `audit-admin-dialogs.md` (step 1) | Live breakage: realistic uploads exceed Convex arg limits and fail today. Convex mutations land first — they're the contract the UI consumes. |
| 3 | Crash + data-bleed quick wins: VehicleOrderingPage setState-in-render, DateTimePicker localStorage bleed, mapbox `{0,0}` fabrication, /login 404 | `audit-misc-bugs.md` (early batches) | User-visible bugs, small independent batches. |

## Phase 1 — Pricing integrity (the base for coupons/affiliate/emails)

| # | Work | Plan | Notes |
|---|------|------|-------|
| 4 | `lib/pricing` pure module + recompute-and-overwrite in create mutations + persist breakdown (`pricePerDay`, `rentalDays`, `basePrice`) | `audit-pricing-security.md` (pricing track) | ⚠️ Needs client decision first: canonical SCDW rate (see Decisions below). Module contract already locked with the decomposition plan. |
| 5 | Email fixes: SCDW line, day count, included-km + extra-km rows | `feature-email-fixes.md` | Rides directly on #4's persisted breakdown. Client-visible win — the "mail pricing bug". km data already exists; mostly template surfacing. |
| 6 | Convex perf: booking-number counter, indexes, pagination, stats, N+1 joins | `audit-convex-performance.md` | Counter change touches the same mutations as #4 — land ordered with it. |

## Phase 2 — Structure & performance cleanup (parallelizable tracks)

| # | Work | Plan | Notes |
|---|------|------|-------|
| 7 | Dead code: 16 files (~1,290 lines) + 3 deps (`@clerk/react`, `@googlemaps/…`, `framer-motion`) | `audit-dead-code.md` | Cheap, anytime; reduces noise for everything after. |
| 8 | Frontend perf: mapbox code-split, hero image, priority images (fast wins), then the root-layout `headers()` fix restoring static rendering | `audit-frontend-performance.md` | Independent track, big SEO impact. Root-layout split is the linchpin step. |
| 9 | Reservation page decomposition: delete dead cluster, 9 incremental PRs → ~180-line page + shared checkout for transfers | `audit-reservation-decomposition.md` | Parallel with #4 except its step 7 (confirmation persistence) which waits on #4's schema. Sole owner of `reservation/page.tsx`. |
| 10 | Admin dialogs: reservation dialog extraction (needs #4's pricing module), then vehicles/blogs/seasons form dedup | `audit-admin-dialogs.md` | Step 1 (uploads) already shipped in Phase 0. |
| 11 | i18n extraction: ~90–110 keys, transfers flow + components | `audit-i18n.md` | Land BEFORE the copy update so new copy has one place to go. RO drafts need client sign-off. |
| 12 | Remaining misc batches (company constants `lib/company.ts`, LOCATION_DATA to lib, validators, etc.) | `audit-misc-bugs.md` | 12 independently-shippable batches; validator batch needs merge-ordering with #4/#6. |

## Phase 3 — Client features

| # | Work | Plan | Blocked on |
|---|------|------|-----------|
| 13 | AI-SEO: robots.ts AI-crawler allows + FAQ page (can ship even during Phase 1–2), then llms.txt + LocalBusiness after `lib/company.ts` | `feature-ai-seo.md` | FAQ copy sign-off; "local business page" meaning. ~1.5–2 days. |
| 14 | Coupons: `coupons`+`couponRedemptions` tables, atomic redemption in create mutations, admin CRUD, checkout inputs | `feature-coupons.md` | Hard-blocked by #4. Replaces the dead `promotions` table/`promoCode` plumbing. Size L. |
| 15 | Affiliate program: `/r/<slug>` links (bare `rngo.ro/<slug>` as gated enhancement), attribution, conversion tracking, tiers, admin + affiliate dashboards | `feature-affiliate-program.md` | Hard-blocked by #4 and #14 (shared `applyDiscounts` engine). Size XL. |
| 16 | Copy update ("texte") | `feature-copy-update.md` | Waiting on client copy + reconciliation of the two existing conflicting copy branches. Do after #11. |
| 17 | Calendar changes | `feature-calendar.md` | Waiting on client clarification — 8 questions in the plan. |

## Decisions needed from the client (blocking)

1. **Canonical SCDW rate** — shown price (base×season) and charged price (duration×season) genuinely differ today; picking one changes real prices. Recommended in plan: duration×season. Blocks Phase 1.
2. **Coupons scope** — rentals only or transfers too; stacking with affiliate discounts; EUR fixed amounts; per-user limits (12 questions in `feature-coupons.md`).
3. **Affiliate config** — discount amounts, tier table, guest attribution, GDPR/consent for the tracking cookie (open questions in `feature-affiliate-program.md`).
4. **"Local business page"** — structured data vs a new Cluj landing page vs Google Business Profile; AI crawlers: retrieval-only or training bots too; FAQ copy ownership.
5. **"Modificare calendar"** — what change is actually wanted (8 candidate interpretations in `feature-calendar.md`).
6. **Copy** — scope, RO/EN, and which of the two existing copy branches (if either) is the source of truth.
7. **Min driver age** — terms/FAQ say 23, a code fallback says 21; which is right.

## PRD reconciliation

The PRD's "Convex Hardening" section (P0–P2) is absorbed by `audit-pricing-security.md`
and `audit-convex-performance.md`, which cover all of its items with more detail
(auth guards, userId-from-ctx, withIndex, counter doc, pagination, returns validators,
`as any` cleanup). Treat those two plans as the authoritative version.
