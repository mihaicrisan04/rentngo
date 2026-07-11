# RentNGo - Product Requirements Document

**Last Updated:** June 2, 2026

---

## Product Overview

RentNGo is a car rental platform with VIP transfer services for the Romanian market. Built with Next.js 16, Convex, and Clerk v7. Supports Romanian (default) and English.

**Core Features:**
- Vehicle browsing and reservations with tiered pricing
- VIP transfer bookings with distance-based pricing
- Seasonal pricing multipliers
- Admin dashboard for managing all resources
- Email notifications for bookings

---

## Completed Tasks ✅

| Task | Date | Notes |
|------|------|-------|
| Default Pickup/Drop Times | Jan 18 | Both default to 10:00 |
| Sequential Calendar Flow | Jan 18 | Return calendar opens after pickup selection |
| Transfer Pricing Update | Jan 19 | Tiered km pricing + class multipliers |
| Remove Unused Components | Jan 19 | ~2,500 lines removed |
| Deprecated Fields Cleanup | Jan 19 | Removed `class`, `pricePerDay`, `payments` table |
| Transfer Vehicle Selection UX | Jan 19 | Sticky floating card for selection |
| Rename Vehicle Classes Admin | Jan 19 | "Ordering" → "Classes" |
| Component Directory Restructuring | Jan 20 | Feature-based organization |
| Email Components Consolidation | Jan 20 | Single source in `convex/emails/` |
| Vehicle Slug URLs | Jan 20 | SEO-friendly `/cars/[slug]` routes |
| Vehicle Class Multiplier Management | Jan 20 | UI in class detail page |
| Transfer Email - Vehicle Details | Jan 20 | Full vehicle info in confirmation |
| Transfer Booking - T&C Links | Jan 20 | Terms & Privacy links added |
| Transfer Vehicle Seats Config | Jan 20 | Separate `transferSeats` field |
| Admin Role Authorization | Jan 22 | Clerk publicMetadata role check in middleware |
| File Naming Cleanup | Jan 22 | 24 files renamed to kebab-case, typo fixed |
| Translation Files Cleanup | Jan 22 | Removed unused namespaces, consolidated keys, ~18% reduction |
| Barrel Import Optimization | Jan 22 | Added optimizePackageImports for lucide-react, date-fns in next.config.ts |
| Dynamic Import Admin Dialogs | Jan 22 | 10 admin dialogs now lazy-loaded with next/dynamic |
| Memoize Expensive Components | Jan 22 | React.memo() for 6 components, useMemo() for 5 calculations |
| Reduce getImageUrl Calls | Jan 22 | Moved imageUrl into queries (getAllVehiclesWithClasses, getFeaturedVehicles) |
| SEO Overhaul | Mar 23 | Shared metadata helper, dynamic html lang, x-default hreflang, JSON-LD XSS escaping, server-rendered structured data, generateStaticParams for cars/blog, noindex for transactional pages, breadcrumb schema for car details |
| Major Dependency Upgrades | Mar 23 | Next.js 16.2, Clerk v7, Zod v4, Recharts v3, date-fns v4, Resend v6, next-mdx-remote v6, Vercel analytics/speed-insights v2. Removed unused HeroUI (-189 packages). 0 vulnerabilities. |
| React Compiler | Mar 23 | Enabled `reactCompiler: true` — auto-memoization for all components |
| Error Boundaries | Mar 23 | Added global-error.tsx, [locale]/error.tsx, admin/error.tsx |
| CSS content-visibility | Mar 23 | Applied to vehicle and blog grid cards for faster initial paint |
| Migrate to proxy.ts | Mar 23 | Renamed middleware.ts → proxy.ts per Next.js 16 convention |
| View Transitions | Mar 23 | Enabled cross-fade page transitions via React 19.2 View Transitions API |
| Replace next lint | Mar 23 | Lint script now uses ESLint CLI directly (next lint removed in Next.js 16) |
| Google Tag Manager | May 19 | GTM via `@next/third-parties` in root layout (`NEXT_PUBLIC_GTM_ID`); direct Google Ads gtag removed — now managed inside GTM |
| Release Automation | Jun 2 | release-please (Conventional Commits → release PR, tag, GitHub Release). Reconciled `package.json` to 2.4.0 to match CHANGELOG |
| CI Quality Gate | Jun 2 | GitHub Actions runs `tsc --noEmit` on PRs to main/develop. Build verified via Vercel preview |
| Fix ESLint Config | Jun 2 | `npm run lint` was crashing (FlatCompat + ESLint 9.39); switched to Next 16 native flat-config exports — lint runs again |
| Fix Broken Image Uploads | Jul 11 | Direct-to-storage uploads via `files.generateUploadUrl` + per-file POST; narrow `vehicles.addImages` persist; deleted bytes-through-args actions; blob-URL leak fix (RNGO-11) |
| Dead Code Cleanup | Jul 11 | 16 files (~1,290 lines) deleted: vehicle-card fork orphans, lib email stack, dead hooks/libs, admin settings page; dead `searchAvailableVehicles` query, VehicleSearchFilterForm uncontrolled fallback; deps removed: `@clerk/react`, `@googlemaps/google-maps-services-js`, `framer-motion` (consolidated on `motion`) (RNGO-15) |

---

## Planned Tasks — Convex Hardening

Tasks from a full audit of Convex functions against official guidelines and best practices.

### P0 — Security & Correctness

| Task | Description |
|------|-------------|
| Auth guards on admin mutations | `vehicles`, `seasons`, `blogs`, `vehicleClasses`, `transferPricing` mutations are all public with zero auth — anyone can create/delete data. Add auth checks or convert to `internalMutation` |
| Stop accepting `userId` as argument | `createReservation` and `createTransfer` accept `userId` in args — must derive from `ctx.auth.getUserIdentity()` server-side per Convex guidelines |
| Replace `.filter()` with `.withIndex()` | `.filter()` causes full table scans. Violations in `vehicles.getAll`, `searchAvailableVehicles`, `getByClass`, `blogs.getAll`, `featuredCars.setFeaturedCar`, `vehicleClasses.remove`. Add missing indexes (`classId`, `transmission`, `fuelType`, `vehicleId` on featuredCars) |
| Switch `identity.subject` → `tokenIdentifier` | All user lookups use `identity.subject` — guidelines say to prefer `tokenIdentifier` as the canonical stable identifier |

### P1 — Performance & Scalability

| Task | Description |
|------|-------------|
| Reservation/transfer number via counter doc | `createReservation` and `createTransfer` `.collect()` the entire table to compute `max + 1`. Use a dedicated counter document instead |
| Bound unbounded `.collect()` calls | Multiple queries collect full tables with no limits — `getAllVehicles`, `searchAvailableVehicles`, `getAllVehiclesWithClasses`, `getAllReservations`, `getAllTransfers`, stats/chart queries. Add `.take(n)` or pagination |
| Standardize auth pattern | `transfers.ts` does raw `ctx.auth` + manual user lookup everywhere. `reservations.ts` uses `getCurrentUser` helpers. Standardize on the helper pattern across all files |

### P2 — Code Quality

| Task | Description |
|------|-------------|
| Add `returns` validators | Many functions missing `returns` — inconsistent with others that have them. Add across `vehicles.ts`, `reservations.ts`, `transfers.ts`, `featuredCars.ts` |
| Fix `seasons.ts` broken filter | `Object.entries(updates).filter(([value]) => ...)` — destructuring bug, checks key instead of value. Should be `([_, value])` |
| Remove `as any` casts | `reservations.ts:83` uses `(r as any).reservationNumber`, `blogs.ts:286` uses `any` for updates object. Use proper types |
| Add lint to CI gate | Resolve the ~75 pre-existing `npm run lint` errors (mostly `no-explicit-any`, overlaps the `as any` / `v.any()` tasks above), then add a blocking `npm run lint` step to `.github/workflows/ci.yml` |

---

## In Progress

| Task | Description |
|------|-------------|
| Bilingual Blog Content | Blogs have separate RO/EN title, description, content, readingTime. Public queries accept locale, admin UI has RO/EN tabs. Migration: `npx convex run migrations/bilingualBlogs` |

---

## Planned Tasks — July 2026 Roadmap

Full plans in `.claude/plans/` (one file per workstream); tackle order + client decisions needed in `.claude/plans/00-priorities.md`. Based on the 103-finding audit in `AUDIT.md` + client feature requests.

| Priority | Task | Plan |
|----------|------|------|
| P0 | Security: auth on 28 admin Convex writes, ownership checks, PII queries, email route | `audit-pricing-security.md` |
| P1 | Server-side pricing engine (`lib/pricing`) + persisted breakdown | `audit-pricing-security.md` |
| P1 | Email fixes: SCDW, day count, included/extra km | `feature-email-fixes.md` |
| P1 | Convex perf: counter doc, indexes, pagination, stats | `audit-convex-performance.md` (absorbs "Convex Hardening" section above) |
| P2 | Reservation page decomposition; admin dialog dedup; frontend perf; i18n extraction; misc bug batches | `audit-*.md` |
| P3 | AI-SEO pages (robots/llms.txt/FAQ/local business) | `feature-ai-seo.md` |
| P3 | Coupon codes (blocked by pricing engine) | `feature-coupons.md` |
| P3 | Affiliate program (blocked by coupons engine) | `feature-affiliate-program.md` |
| P4 | Copy update (waiting on client copy) · Calendar changes (waiting on clarification) | `feature-copy-update.md`, `feature-calendar.md` |

## Planned Tasks — Other

| Priority | Task | Description |
|----------|------|-------------|
| P2 | Copy & Content Update | Review translations for tone, grammar, consistency |
| P3 | Time Picker Dark Theme Fix | White-on-white text on Windows in dark mode |
| P3.2 | Lazy State Initialization | Use function form for useState with expensive initial values |
| P3.3 | Functional setState Updates | Use functional setState for stable callbacks and prevent stale closures |
| P4 | Turbopack Migration | Remove --webpack flag once @next/mdx supports rehype/remark plugins in Turbopack |

---

## Key Business Rules

**Reservations:**
- Minimum 1 day rental
- Same-day = 1 day; return 2+ hours late = extra day
- Payment: cash, card on delivery, or card online

**Transfers:**
- Distance via Mapbox; supports one-way and round-trip
- Pricing: base fare (covers first 15km) + tiered per-km rate × class multiplier
- Payment: cash or card on delivery only

**Seasonal Pricing:**
- Season with most overlap applies
- Default multiplier: 1.0

---

## Revision History

| Version | Date | Summary |
|---------|------|---------|
| 1.0 | Jan 18 | Initial PRD |
| 2.0 | Jan 20 | Major features complete |
| 3.0 | Jan 22 | Simplified to task-focused format |
| 3.1 | Jan 22 | Admin role authorization via Clerk publicMetadata |
| 3.2 | Jan 22 | File naming cleanup; added lint migration task |
| 3.3 | Jan 22 | Translation files cleanup and consolidation |
| 3.4 | Jan 22 | Barrel import optimization; added React perf subtasks |
| 3.5 | Jan 22 | Dynamic import admin dialogs |
| 3.6 | Jan 22 | Reduced getImageUrl calls - imageUrl now included in queries |
| 4.0 | Mar 23 | Major dependency upgrades + post-upgrade improvements |
| 4.1 | Mar 23 | Added Convex Hardening phase from full guidelines audit |
| 4.2 | Jun 2 | Release automation (release-please) + CI typecheck gate + ESLint config fix |
