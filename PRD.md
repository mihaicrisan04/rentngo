# RentNGo - Product Requirements Document

**Version:** 2.0
**Last Updated:** January 20, 2026
**Status:** Active

---

## 1. Product Overview

### 1.1 Description

RentNGo is a car rental platform with VIP transfer services serving the Romanian market. The platform enables customers to:
- Browse and reserve rental vehicles
- Book VIP transfer services (airport transfers, city transfers)
- View seasonal pricing and promotions
- Manage reservations through user profiles

### 1.2 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, TypeScript |
| Backend | Convex (database + serverless) |
| Authentication | Clerk |
| Styling | TailwindCSS, Radix UI |
| Email | React Email + Resend |
| Maps | Mapbox GL |

### 1.3 Supported Languages

- Romanian (default)
- English

---

## 2. Current Features

### 2.1 Vehicle Reservations

**Booking Flow:**
1. Browse vehicles on `/cars` page
2. Select vehicle and dates/times
3. Choose pickup and return locations
4. Enter personal information
5. Select protection options and extras
6. Choose payment method and confirm

**Pricing Components:**
- Base price (tiered by rental duration - longer = cheaper per day)
- Seasonal multiplier (configured per time period)
- Location fees (pickup and return)
- SCDW protection (optional damage waiver)
- Additional items (snow chains, child seats)

**Defaults:**
- Default location: Aeroport Cluj-Napoca
- Default pickup time: 10:00
- Default return time: 10:00

**Day Calculation:**
- Same-day rental counts as 1 day
- If return time exceeds pickup time by 2+ hours, an extra day is charged

### 2.2 VIP Transfers

**Booking Flow:**
1. Enter pickup and dropoff locations (Mapbox search)
2. Select date, time, and passenger count
3. Choose one-way or round-trip
4. Select vehicle from available options
5. Enter customer info and confirm

**Current Pricing Formula:**
- Under 20km: Base fare only (no distance charge)
- 20km or more: Distance × price per km (no base fare)
- Round trip: 2× one-way price

**Issues with Current Formula:**
- No base fare for long distances
- No minimum fare for very short trips
- No round-trip discount incentive

### 2.3 Seasonal Pricing

- Admin configures seasons with date periods and multipliers
- Multipliers range from 0.8 (20% off) to 1.5 (50% markup)
- System selects season with most overlap to rental dates
- Multiplier stored in reservation for historical accuracy

### 2.4 Admin Dashboard

| Feature | Description |
|---------|-------------|
| Overview | Stats, charts, recent activity |
| Vehicles | Add/edit vehicles, manage images |
| Reservations | View and manage all bookings |
| Transfers | View and manage transfer bookings |
| Seasons | Configure seasonal pricing periods |
| Blogs | Create and publish blog posts |

### 2.5 Email Notifications

- Reservation confirmation (to customer + admin)
- Transfer confirmation (to customer + admin)
- Status change notifications (planned)

---

## 3. Planned Changes

### 3.1 Default Pickup/Drop Times ✅ COMPLETED

**Implementation Date:** January 18, 2026

Both pickup and return times now default to **10:00** for car rental reservations. Users can still change the time if needed.

---

### 3.2 Sequential Calendar Flow ✅ COMPLETED

**Implementation Date:** January 18, 2026

When user selects a pickup date, the return date calendar automatically opens. This creates a smoother booking flow and reduces clicks.

**Behavior:**
- User clicks pickup date → calendar opens
- User selects date → pickup calendar closes → return calendar opens automatically
- Works consistently across all reservation pages

**Pages Updated:**
- Homepage (`vehicle-search-filter-form.tsx`) - Already had this behavior
- `/cars` page (`vehicle-search-form.tsx`) - Added
- `/cars/[id]` page (`rental-details.tsx`) - Added
- `/reservation` page - Added

---

### 3.3 Transfer Pricing Update ✅ COMPLETED

**Implementation Date:** January 19, 2026

**New Tiered Pricing System:**

The transfer pricing now uses a tiered system with global km-range pricing tiers and vehicle class multipliers.

**Pricing Formula:**
```
total_price = base_fare + max(total_km - 15, 0) × tier_price_per_km × class_multiplier
```

For round trips: `total_price × 2`

**Components:**
- **Base fare**: Always included, covers first 15km (configured per vehicle class in `vehicleClasses.transferBaseFare`)
- **Tier price per km**: From `transferPricingTiers` table based on extra km range
- **Class multiplier**: Applied on top of tier pricing (configured per vehicle class in `vehicleClasses.transferMultiplier`)

**Default Tier Configuration (Admin Editable):**

| Extra KM Range | Price per KM |
|----------------|--------------|
| 0-25 km        | €1.60        |
| 25-65 km       | €1.20        |
| 65-185 km      | €1.00        |
| 185-285 km     | €0.97        |
| 285-385 km     | €0.95        |
| 385+ km        | €0.90        |

**Admin Configuration:**
- Access via **Admin > Transfers > Pricing Tiers** button
- Add, edit, delete, and toggle tiers
- Seed default tiers if none exist
- Configure class multipliers in **Admin > Vehicles > Classes**

**Files Changed:**
- `convex/schema.ts` - Added `transferPricingTiers` table and `transferMultiplier` to vehicleClasses
- `convex/transferPricing.ts` - New module with CRUD and calculation functions
- `convex/transfers.ts` - Updated `getTransferVehiclesWithImages` to use new pricing
- `convex/vehicleClasses.ts` - Added `transferMultiplier` field
- `components/admin/transfer-pricing-dialog.tsx` - New admin dialog
- `app/admin/transfers/page.tsx` - Added pricing tiers button
- `components/transfer/transfer-vehicle-card.tsx` - Simplified display (distance + total only)
- `components/transfer/transfer-summary-card.tsx` - Simplified display
- `app/[locale]/transfers/booking/page.tsx` - Uses server-side pricing
- `app/[locale]/transfers/confirmation/[transferId]/page.tsx` - Simplified display
- `convex/emails/components/transfer_pricing_section.tsx` - Simplified display

**Client Display:**
- Shows only distance (X km) and total price (€Y.YY)
- No pricing breakdown or per-km rates shown to customers

---

### 3.4 Copy & Content Update

**Status:** Planned

**Scope:**
- Review all text in `messages/en.json` and `messages/ro.json`
- Ensure consistent tone and brand voice
- Fix grammatical or translation errors
- Make error messages helpful and actionable

**Sections to Review:**
- Homepage (hero, FAQ, CTAs)
- About page (company story, values)
- Reservation flow (form labels, confirmation)
- Transfer flow (search, booking)
- Common elements (buttons, navigation)
- Validation messages

---

### 3.5 Codebase Cleanup

**Status:** In Progress

#### 3.5.1 Remove Unused Components ✅ COMPLETED

**Implementation Date:** January 19, 2026

Removed 19 unused component files totaling ~2,500 lines of code (~9.8% of components directory):

| Category | Files Removed | Lines |
|----------|---------------|-------|
| Vehicle components | 7 | ~1,323 |
| UI components (shadcn) | 7 | ~702 |
| Admin components | 2 | ~180 |
| Top-level components | 3 | ~297 |

**Files Deleted:**
- `edit-vehicle-form.tsx`, `create-vehicle-form.tsx` (admin uses dialogs)
- `vehicle-image-carrousel.tsx` (typo version, unused)
- 4 vehicle skeleton components (never imported)
- 7 shadcn UI components (installed but never used)
- `team-switcher.tsx`, `nav-projects.tsx` (admin sidebar unused)
- `location-search-input.tsx`, `rental-details-skeleton.tsx`, `login-form.tsx`

Updated `components/vehicle/index.ts` to remove stale exports.

#### 3.5.2 Deprecated Fields Cleanup ✅ COMPLETED

**Implementation Date:** January 19, 2026

Removed deprecated vehicle fields and dead code:

**Schema Changes:**
- ✅ Removed `payments` table (never implemented)
- ✅ Removed `vehicles.class` field (replaced by `classId`)
- ✅ Removed `vehicles.pricePerDay` field (replaced by `pricingTiers`)
- ✅ Removed `by_class` index

**Code Changes:**
- ✅ Deleted `hooks/useSeasonalPricing.ts` (replaced by `useDateBasedSeasonalPricing`)
- ✅ Updated admin dialogs to use date-based seasonal pricing hook
- ✅ Updated `vehicles-table.tsx` to lookup class name via `classId`
- ✅ Removed `class` from vehicle form schemas and Convex mutations
- ✅ Removed `pricePerDay` from vehicle form schemas and Convex mutations
- ✅ Removed `minPrice`/`maxPrice` filtering from vehicle queries
- ✅ Removed `VehicleClass` type from `types/vehicle.ts`
- ✅ Removed legacy `pricePerDay` fallbacks from pricing utilities
- ✅ Removed ~20 lines of TODO comments from `convex/reservations.ts`

**Migrations Added:**
- `convex/migrations/clearDeprecatedClassField.ts`
- `convex/migrations/clearDeprecatedPricePerDay.ts`

**Deployment Note:** Run migrations before deploying schema changes.

#### 3.5.3 Remaining Items

**Incomplete Features:**
- Promotional codes (field exists but no logic - keep for future implementation)

#### 3.5.4 Component Directory Restructuring ✅ COMPLETED

**Implementation Date:** January 20, 2026

**Problem:**
~130 component files were organized by type rather than feature, with 14 files scattered at the top level.

**New Feature-Based Structure:**
```
components/
├── ui/                    # Design system (47 files, unchanged)
├── shared/                # Cross-cutting utilities
│   ├── auth/              # user-button, user-ensurer, user-profile-form
│   ├── search-filters/    # date-time-picker, location-picker, mapbox
│   ├── email/             # Consolidated email templates (9 files)
│   ├── providers/         # convex-client-provider
│   └── navigation/        # language-selector, rental-details
├── features/              # Feature-specific components
│   ├── vehicles/          # Vehicle components (15 files)
│   ├── reservations/      # Checkout + user reservations (4 files)
│   ├── transfers/         # Transfer booking (6 files)
│   ├── blog/              # Blog display (9 files)
│   └── landing/           # Landing page blocks (3 files)
├── admin/                 # Reorganized by resource
│   ├── vehicles/          # Vehicle CRUD (5 files)
│   ├── reservations/      # Reservation management (4 files)
│   ├── transfers/         # Transfer pricing (1 file)
│   ├── vehicle-classes/   # Class management (2 files)
│   ├── seasons/           # Season management (5 files)
│   └── blog/              # Blog management (3 files)
│   └── nav-main.tsx, nav-user.tsx, admin-sidebar.tsx
└── layout/                # Layout wrapper (1 file)
```

**Changes Made:**
- Created `shared/` directory for cross-feature utilities
- Created `features/` directory for feature-specific components
- Reorganized `admin/` into resource-based subdirectories
- Moved 14 scattered top-level components to proper homes
- Consolidated email templates from 2 locations into `shared/email/`
- Added barrel exports (index.ts) for cleaner imports
- Updated all import paths across the codebase

**Benefits Achieved:**
- Clear feature boundaries
- Easier onboarding (find all vehicle code in one place)
- Parallel structure between `features/` and `admin/`
- Barrel exports enable cleaner imports like `from '@/components/features/vehicles'`

#### 3.5.5 React Performance Optimization

**Status:** Planned

**Scope:**
Apply Vercel React best practices for performance optimization across the codebase.

**Areas to Review:**
- Component memoization (`React.memo`, `useMemo`, `useCallback`)
- Bundle splitting and lazy loading for routes/components
- Image optimization with `next/image`
- Data fetching patterns (avoid waterfalls, use streaming)
- Client vs Server component boundaries
- Reducing unnecessary re-renders
- Proper use of Suspense boundaries
- Font loading optimization

**Reference:** `/vercel-react-best-practices` skill

#### 3.5.6 Email Components Consolidation ✅ COMPLETED

**Implementation Date:** January 20, 2026

**Status:** Done

**Problem:**
Email templates existed in two places:
- `components/shared/email/` (Next.js app) - UNUSED
- `convex/emails/` (Convex backend) - ACTIVE

**Solution Implemented:**
- Audited `components/shared/email/` - confirmed all 10 files were unused legacy code
- Removed the deprecated `/api/send/request-confirmation` route (only consumer of shared/email)
- Deleted entire `components/shared/email/` directory (10 files)
- Kept `convex/emails/` as the single source of truth for email templates
- `/api/send/reservation-email` route retained (uses inline HTML, no shared/email dependency)

**Tasks:**
- [x] Audit `components/shared/email/` - check if any components are actually imported/used
- [x] If unused, remove the entire `shared/email/` directory
- [x] If partially used, consolidate everything into `convex/emails/`
- [x] Update any remaining imports

#### 3.5.7 File Naming Convention Cleanup

**Status:** Planned

**Problem:**
Some files use camelCase naming (`fileNameEtc.tsx`) instead of the project standard kebab-case (`file-name-etc.tsx`).

**Standard:** All files should use kebab-case: `my-component.tsx`, not `MyComponent.tsx` or `myComponent.tsx`

**Tasks:**
- [ ] Scan codebase for files not following kebab-case convention
- [ ] Rename files to kebab-case
- [ ] Update all imports referencing renamed files
- [ ] Verify build passes

#### 3.5.8 Time Picker Native Select Visibility (Windows Dark Theme)

**Status:** Planned

**Problem:**
The native `<select>` component used for time pickers has a visual bug in dark theme on Windows. Available time slots render with white font on a light/white background, making them nearly invisible. Unavailable times render correctly and are visible.

This appears to be caused by the dark theme styling not properly overriding native select dropdown colors on Windows, where the OS renders the dropdown background differently than on macOS.

**Affected Components:**
- Time picker selects in reservation flow
- Time picker selects in transfer booking flow

**Tasks:**
- [ ] Reproduce the issue on Windows in dark theme
- [ ] Identify which CSS styles affect native select text/background color on Windows
- [ ] Fix the font/background color combination to ensure available times are clearly visible in dark theme
- [ ] Test on Windows to verify the fix
- [ ] Ensure fix doesn't break styling on other platforms (macOS, iOS, Android)
- [ ] Test in both light and dark themes

#### 3.5.9 Translation Files Cleanup

**Status:** Planned

**Problem:**
The translation files in `messages/` (en.json, ro.json) may contain:
- Duplicate keys or redundant translations
- Unused translation keys (orphaned after code changes)
- Inconsistent structure between languages
- Overly nested or poorly organized sections

**Tasks:**
- [ ] Audit all translation keys in `messages/en.json` and `messages/ro.json`
- [ ] Search codebase for each translation key usage to identify unused keys
- [ ] Remove unused/orphaned translation keys
- [ ] Identify and consolidate duplicate translations
- [ ] Restructure for better organization if needed
- [ ] Ensure both language files have identical structure
- [ ] Verify all translations still work after cleanup

---

### 3.6 Transfer Vehicle Selection UX Improvement ✅ COMPLETED

**Implementation Date:** January 19, 2026

**Problem:**
The "Continue to Booking" button on the transfer vehicle selection page was hidden at the bottom and required scrolling to find.

**Solution Implemented:**
- **Sticky Floating Card:** A glassmorphic card using CSS `position: sticky` with `bottom: 0`
  - Sticks to the bottom of the viewport while scrolling within the page container
  - Naturally scrolls away when the container ends (before the footer)
  - Shows selected vehicle image (desktop only), name, seats, and total price
  - Empty state prompts user to select a vehicle with disabled continue button
  - Glass effect with `bg-background/80 backdrop-blur-xl`
  - Safe area padding for iPhone home indicator
  - Responsive: compact on mobile, more spacious on desktop

**Files Changed:**
- `components/transfer/transfer-booking-sidebar.tsx` - New `TransferBookingFloatingCard` component
- `components/transfer/transfer-vehicle-list.tsx` - Added `onVehiclesLoaded` callback to expose vehicles data
- `app/[locale]/transfers/vehicles/page.tsx` - Simplified layout (full-width vehicle grid + sticky floating card)
- `messages/en.json` - Added `selectPrompt` translation
- `messages/ro.json` - Added `selectPrompt` translation

**Layout Changes:**
- Vehicle grid takes full page width
- Floating card is centered with `max-w-2xl` container
- Pure CSS sticky positioning (no JavaScript needed)

---

### 3.7 Rename Vehicle Classes Admin Section ✅ COMPLETED

**Implementation Date:** January 19, 2026

**Problem:**
The current "Class Ordering" / "Manage Ordering" button and page names are confusing. This section should be a general vehicle classes management area.

**Changes Made:**
- Renamed folder from `ordering/` to `classes/`
- Button text: "Manage Ordering" → "Manage Classes"
- Page title: "Class Ordering" → "Vehicle Classes"
- Page subtitle: "Drag and drop to reorder vehicle classes" → "Manage and reorder vehicle classes"
- Updated breadcrumb logic in `layout.tsx`
- Updated all internal navigation links

**Files Changed:**
- `app/admin/vehicles/page.tsx` - Updated button text and URL
- `app/admin/vehicles/classes/page.tsx` (renamed from ordering) - Updated titles and navigation
- `app/admin/vehicles/classes/[classId]/page.tsx` - Updated back button URLs
- `app/admin/layout.tsx` - Updated breadcrumb route detection

---

### 3.8 Vehicle Slug URLs ✅ COMPLETED

**Implementation Date:** January 20, 2026

**Problem:**
Car detail URLs currently use Convex IDs (e.g., `/cars/jh7abc123`), which are not SEO-friendly or memorable.

**Solution Implemented:**
- Added customizable `slug` field to vehicles schema with unique index
- Changed car detail URLs from `/cars/[id]` to `/cars/[slug]`
- Added slug input in admin vehicle dialogs with auto-generate button (sparkle icon)
- Slug format: `{make}-{model}-{year}` (e.g., `bmw-x5-2024`)
- Backwards compatible: existing vehicles without slugs fall back to `_id`

**Files Changed:**
- `convex/schema.ts` - Added `slug` field + `by_slug` index
- `convex/vehicles.ts` - Added slug to create/update mutations, added `getBySlug` query with validation
- `lib/vehicleUtils.ts` - Added `generateVehicleSlug()` and `validateVehicleSlug()` functions
- `components/admin/vehicles/create-vehicle-dialog.tsx` - Added slug input with generate button
- `components/admin/vehicles/edit-vehicle-dialog.tsx` - Added slug input with generate button
- `app/[locale]/cars/[slug]/page.tsx` - Renamed from `[id]`, uses `getBySlug` query
- `components/features/vehicles/vehicle-card.tsx` - Uses `slug || _id` for URLs
- `components/features/vehicles/vehicle-card-with-preloaded-image.tsx` - Uses `slug || _id` for URLs
- `app/[locale]/reservation/page.tsx` - Back link uses `slug || vehicleId`
- `app/sitemap.ts` - Uses `slug || _id` for vehicle URLs

**Admin Experience:**
- Slug field appears after model in create/edit dialogs
- Click sparkle button to auto-generate from make, model, year
- Validation ensures lowercase with hyphens only (regex: `^[a-z0-9]+(?:-[a-z0-9]+)*$`)
- Real-time slug uniqueness validation with 500ms debounce
  - Shows "Checking availability..." while validating
  - Shows error message and red border if slug exists
  - Submit button disabled while checking or when slug exists
- `checkSlugExists` query added for real-time validation

---

### 3.9 Vehicle Class Multiplier Management ✅ COMPLETED

**Implementation Date:** January 20, 2026

**Problem:**
The transfer multiplier for vehicle classes is configured via the database (`vehicleClasses.transferMultiplier`), but there's no dedicated UI to manage it.

**Solution Implemented:**
Added Transfer Multiplier field to the vehicle class detail page (`/admin/vehicles/classes/[classId]`) using the existing inline edit pattern.

**UI Changes:**
- Separated pricing settings into two sections:
  - **Rental Pricing**: Extra 50km Price (for car rentals)
  - **Transfer Pricing**: Base Fare + Rate Multiplier (for VIP transfers)
- Each field has inline editing with save button and loading state
- Validation ensures multiplier is a positive number

**Files Changed:**
- `app/admin/vehicles/classes/[classId]/page.tsx` - Added transfer multiplier state, handler, and UI

---

### 3.10 Transfer Email - Vehicle Details

**Status:** Planned

**Problem:**
The transfer confirmation email doesn't include any information about the selected vehicle. The transfer entry has a `vehicleId` reference that can be used to fetch vehicle details.

**Scope:**
Add a vehicle details section to the transfer confirmation email, similar to how the reservation email includes vehicle info.

**Tasks:**
- [ ] Fetch vehicle details in transfer email template using `transfer.vehicleId`
- [ ] Add vehicle section showing: make, model, year, image (if available)
- [ ] Style consistently with reservation email vehicle section
- [ ] Test email rendering with vehicle details

**Files to Modify:**
- `convex/emails/transfer-confirmation.tsx`
- Potentially add a vehicle details component if reusable

---

### 3.11 Transfer Booking - Terms & Privacy Links

**Status:** Planned

**Problem:**
The transfer booking page doesn't have links to Terms & Conditions and Privacy Policy, unlike the car reservation page which has proper links.

**Scope:**
Add Terms & Conditions and Privacy Policy links to the transfer booking page, matching the style used in the reservation flow.

**Tasks:**
- [ ] Identify how T&C and Privacy links are implemented in reservation page
- [ ] Add similar links to the transfer booking page
- [ ] Ensure links open in new tab and are properly translated
- [ ] Match styling with existing implementation

**Files to Modify:**
- `app/[locale]/transfers/booking/page.tsx`

---

### 3.12 Transfer Vehicle Seats Configuration

**Status:** Planned

**Problem:**
Currently, transfer vehicle filtering uses the vehicle's registered seat count. However, for transfers, the available passenger capacity may differ (e.g., a 5-seat car might only accommodate 4 passengers for transfers due to luggage space).

**Scope:**
Add a separate `transferSeats` field to vehicles that can be configured independently of the regular seat count, used specifically for transfer passenger filtering.

**Requirements:**
- New `transferSeats` field on vehicles schema
- Only visible in admin when "Is Transfer Vehicle" is checked
- Default value: falls back to regular `seats` if not set
- Used for passenger count filtering on transfer vehicle selection
- Refactor admin vehicle settings dialog layout for better organization

**Tasks:**
- [ ] Add `transferSeats` field to vehicles schema (optional number)
- [ ] Update vehicle create/update mutations to handle `transferSeats`
- [ ] Update admin vehicle dialog:
  - [ ] Only show `transferSeats` field when `isTransferVehicle` is checked
  - [ ] Refactor dialog layout for better organization of transfer-specific fields
  - [ ] Default to showing regular `seats` value as placeholder
- [ ] Update transfer vehicle query to filter by `transferSeats ?? seats`
- [ ] Test filtering works correctly with new field

**Files to Modify:**
- `convex/schema.ts` - Add `transferSeats` field
- `convex/vehicles.ts` - Update mutations and queries
- `components/admin/vehicles/create-vehicle-dialog.tsx`
- `components/admin/vehicles/edit-vehicle-dialog.tsx`
- `convex/transfers.ts` - Update `getTransferVehiclesWithImages` filtering

---

## 4. Implementation Priorities

| Priority | Change | Status | Impact |
|----------|--------|--------|--------|
| P1 | Default Pickup/Drop Times | ✅ Done | UX improvement |
| P1 | Sequential Calendar Flow | ✅ Done | UX improvement |
| P1 | Transfer Pricing Update | ✅ Done | Revenue impact |
| P2 | Copy & Content Update | Planned | Brand consistency |
| P2 | Transfer Vehicle Selection UX | ✅ Done | UX improvement |
| P2 | Rename Vehicle Classes Admin | ✅ Done | Admin clarity |
| P2 | Vehicle Slug URLs | ✅ Done | SEO improvement |
| P3 | Codebase Cleanup | In Progress | Maintainability |
| P3 | Component Directory Restructuring | ✅ Done | Maintainability |
| P3 | Email Components Consolidation | ✅ Done | Maintainability |
| P3 | File Naming Convention Cleanup | Planned | Consistency |
| P3 | Time Picker Select Visibility (Windows Dark Theme) | Planned | Cross-platform UX |
| P3 | Translation Files Cleanup | Planned | Maintainability |
| P3 | React Performance Optimization | Planned | Performance |
| P2 | Vehicle Class Multiplier Management | ✅ Done | Admin UX |
| P2 | Transfer Email - Vehicle Details | Planned | Customer communication |
| P2 | Transfer Booking - T&C Links | Planned | Legal compliance |
| P2 | Transfer Vehicle Seats | Planned | Transfer filtering |

---

## 5. Key Business Rules

### Reservation Rules
- Minimum rental: 1 day
- Locations: Predefined list with fixed fees
- Payment: Cash on delivery, card on delivery, or card online
- Status flow: pending → confirmed → completed (or cancelled)

### Transfer Rules
- Uses real-time distance calculation via Mapbox
- Supports one-way and round-trip
- Payment: Cash or card on delivery only
- Status flow: Same as reservations

### Seasonal Pricing Rules
- Multiple seasons can be active simultaneously
- Season with most overlap to rental dates applies
- Default multiplier is 1.0 (no change)

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-18 | Initial PRD creation |
| 1.1 | 2026-01-18 | Completed default times feature, cleaned up document |
| 1.2 | 2026-01-18 | Added sequential calendar flow across all reservation pages |
| 1.3 | 2026-01-19 | Completed transfer pricing overhaul with tiered pricing system |
| 1.4 | 2026-01-19 | Renamed Vehicle Classes admin section (ordering → classes) |
| 1.5 | 2026-01-19 | Added sticky sidebar and mobile bottom bar to transfer vehicle selection page |
| 1.6 | 2026-01-19 | Completed unused component removal (~2,500 lines) |
| 1.7 | 2026-01-20 | Component directory restructuring, email consolidation |
| 1.8 | 2026-01-20 | Implemented vehicle slug URLs for SEO-friendly car detail pages |
| 1.9 | 2026-01-20 | Added planned tasks: Windows dark theme time picker fix, class multiplier management |
| 2.0 | 2026-01-20 | Completed class multiplier management UI; added planned tasks: transfer email vehicle details, transfer T&C links, transfer seats configuration |
