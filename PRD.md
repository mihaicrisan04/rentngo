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

---

## Planned Tasks

| Priority | Task | Description |
|----------|------|-------------|
| P2 | Copy & Content Update | Review translations for tone, grammar, consistency |
| P3 | File Naming Cleanup | Convert camelCase files to kebab-case |
| P3 | Time Picker Dark Theme Fix | White-on-white text on Windows in dark mode |
| P3 | Translation Files Cleanup | Remove unused keys, consolidate duplicates |
| P3 | React Performance Optimization | Apply Vercel best practices (memoization, splitting, etc.) |

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
