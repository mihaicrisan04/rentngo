# Changelog

All notable changes to RentNGo are documented here.

## [Unreleased]

### Planned
- Vehicle slug URLs for SEO-friendly car detail pages (see `.claude/plans/vehicle-slug-urls.md`)
- Copy & content review across all translations
- Codebase cleanup (deprecated fields, unused code)

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
