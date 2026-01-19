# Changelog

All notable changes to RentNGo are documented here.

## [Unreleased]

### Planned
- Vehicle slug URLs for SEO-friendly car detail pages (see `.claude/plans/vehicle-slug-urls.md`)
- Copy & content review across all translations

## [1.7.0] - 2026-01-19

### Removed
- `payments` table from schema (never implemented)
- `vehicles.class` field (replaced by `classId`)
- `vehicles.pricePerDay` field (replaced by `pricingTiers`)
- `by_class` index from vehicles table
- `hooks/useSeasonalPricing.ts` (replaced by `useDateBasedSeasonalPricing`)
- `VehicleClass` type export from `types/vehicle.ts`
- ~20 lines of TODO comments from `convex/reservations.ts`
- Legacy `pricePerDay` fallbacks from pricing utilities

### Added
- `convex/migrations/clearDeprecatedClassField.ts` - Migration to clear deprecated class field
- `convex/migrations/clearDeprecatedPricePerDay.ts` - Migration to clear deprecated pricePerDay field

### Changed
- Admin vehicle dialogs now use `useDateBasedSeasonalPricing` hook
- `vehicles-table.tsx` now looks up class name via `classId` reference
- Pricing logic in `types/vehicle.ts` now requires `pricingTiers` (no fallback)
- Transfer page titles: removed "VIP" keyword from translations (en/ro)

## [1.6.0] - 2026-01-19

### Removed
- 19 unused component files (~2,500 lines of code):
  - Vehicle: `edit-vehicle-form`, `create-vehicle-form`, `vehicle-image-carrousel` (typo), 4 skeletons
  - UI (shadcn): `input-otp`, `navigation-menu`, `display-cards`, `slideshow`, `collapsible`, `drawer`, `progressive-blur`
  - Admin: `team-switcher`, `nav-projects`
  - Top-level: `location-search-input`, `rental-details-skeleton`, `login-form`

### Changed
- Updated `components/vehicle/index.ts` to remove stale exports

## [1.5.0] - 2026-01-19

### Added
- Sticky glassmorphic booking card on transfer vehicle selection page
- Card uses CSS `position: sticky` to stay at bottom while scrolling
- `TransferBookingFloatingCard` component with glass effect styling
- `onVehiclesLoaded` callback to `TransferVehicleList` component

### Changed
- Transfer vehicle selection page uses full-width vehicle grid
- Continue button always visible via sticky card at bottom of container

## [1.4.0] - 2026-01-19

### Changed
- Renamed admin vehicle classes section from "ordering" to "classes"
- Button: "Manage Ordering" → "Manage Classes"
- Page title: "Class Ordering" → "Vehicle Classes"
- URL: `/admin/vehicles/ordering` → `/admin/vehicles/classes`

## [1.3.0] - 2026-01-19

### Added
- Tiered transfer pricing system with admin-configurable km ranges
- Transfer base fare per vehicle class
- Transfer pricing tiers management in admin panel

### Changed
- Transfer pricing now uses: `base_fare + (extra_km × tier_price × class_multiplier)`
- Simplified client-facing transfer pricing display (distance + total only)

## [1.2.0] - 2026-01-18

### Added
- Sequential calendar flow: return date calendar auto-opens after selecting pickup date

### Changed
- Applied sequential calendar behavior to all reservation pages

## [1.1.0] - 2026-01-18

### Changed
- Default pickup and return time set to 10:00

## [1.0.0] - 2026-01-18

### Added
- Initial PRD documentation
- Vehicle reservations with tiered pricing
- VIP transfer booking with Mapbox integration
- Seasonal pricing system
- Admin dashboard for vehicles, reservations, transfers, seasons, blogs
- Email notifications via Resend
- Romanian and English language support
