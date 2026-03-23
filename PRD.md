# RentNGo - Product Requirements Document

**Last Updated:** January 22, 2026

---

## Product Overview

RentNGo is a car rental platform with VIP transfer services for the Romanian market. Built with Next.js 15, Convex, and Clerk. Supports Romanian (default) and English.

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

---

## Planned Tasks

| Priority | Task | Description |
|----------|------|-------------|
| P2 | Copy & Content Update | Review translations for tone, grammar, consistency |
| P2 | Replace next lint | next lint deprecated in Next.js 16; migrate to ESLint CLI |
| P3 | Time Picker Dark Theme Fix | White-on-white text on Windows in dark mode |
| P3 | React Performance Optimization | Apply Vercel best practices (memoization, splitting, etc.) |
| ~~P3.1~~ | ~~└─ Memoize Expensive Components~~ | ✅ Completed Jan 22 |
| P3.2 | └─ Lazy State Initialization | Use function form for useState with expensive initial values |
| P3.3 | └─ Functional setState Updates | Use functional setState for stable callbacks and prevent stale closures |
| P3.4 | └─ CSS content-visibility for Lists | Apply content-visibility: auto to vehicle/blog grids for faster initial render |

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
