# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RentNGo is a car rental platform with VIP transfer services built with Next.js 15, React 19, Convex (backend + database), and Clerk (authentication). The application supports English and Romanian localization.

## Core Commands

### Development
```bash
npm run dev                # Run frontend + backend concurrently
npm run dev:frontend       # Run only Next.js frontend
npm run dev:backend        # Run only Convex backend
npm run predev             # Wait for Convex + open dashboard
```

### Build & Deploy
```bash
npm run build              # Build Next.js application
npm start                  # Start production server
npm run lint               # Run ESLint
```

### Convex Commands
```bash
npx convex dev             # Run Convex in development mode
npx convex dashboard       # Open Convex dashboard
npx convex deploy          # Deploy backend to production
```

## Architecture

### Tech Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript (strict mode)
- **Backend**: Convex (database + serverless functions)
- **Authentication**: Clerk (JWT-based with Convex integration)
- **Styling**: TailwindCSS 4, Radix UI, HeroUI
- **Forms**: React Hook Form + Zod validation
- **Email**: React Email + Resend
- **Internationalization**: next-intl (English/Romanian)
- **Maps**: Mapbox GL (for transfer location search and distance calculation)

### Application Structure

```
app/
├── [locale]/              # Localized routes (ro/en)
│   ├── layout.tsx         # Locale-specific layout with i18n
│   ├── cars/              # Vehicle browsing and details
│   ├── reservation/       # Reservation flow
│   ├── transfers/         # VIP transfer booking flow
│   ├── blog/              # Blog posts
│   └── ...                # Other public pages
├── admin/                 # Admin dashboard (no i18n)
│   ├── vehicles/          # Vehicle management
│   ├── reservations/      # Reservation management
│   ├── transfers/         # Transfer management
│   ├── seasons/           # Seasonal pricing management
│   └── ...                # Other admin pages
├── layout.tsx             # Root layout with Providers
└── providers.tsx          # Client providers (Clerk, Convex, Theme)

convex/
├── schema.ts              # Convex database schema
├── auth.config.ts         # Clerk auth configuration
├── vehicles.ts            # Vehicle CRUD operations
├── reservations.ts        # Reservation CRUD operations
├── transfers.ts           # Transfer booking operations
├── seasons.ts             # Seasonal pricing operations
├── users.ts               # User management
├── blogs.ts               # Blog post operations
├── vehicleClasses.ts      # Vehicle class management
└── featuredCars.ts        # Homepage featured cars

components/
├── ui/                    # Reusable UI components (Radix, custom)
├── admin/                 # Admin-specific components
├── reservation/           # Reservation flow components
├── transfer/              # Transfer flow components
├── blog/                  # Blog-related components
├── email/                 # Email template components
└── layout/                # Layout components

lib/
├── utils.ts               # Utility functions (cn, etc.)
├── reservationUtils.ts    # Reservation business logic
├── seasonUtils.ts         # Season calculation logic
├── vehicleUtils.ts        # Vehicle filtering/sorting
├── emailFactory.ts        # Email generation
├── mapbox.ts              # Mapbox integration
└── ...                    # Other utilities

hooks/
├── useReservationForm.ts  # Reservation form state management
├── useReservationPricing.ts # Real-time pricing calculations
├── useSeasonalPricing.ts  # Seasonal pricing logic
├── useVehicleFilters.ts   # Vehicle filtering logic
├── useVehicleList.ts      # Vehicle listing with filters
└── ...                    # Other custom hooks
```

### Routing & Internationalization

- **Public routes**: Use `[locale]` dynamic segment (e.g., `/ro/cars`, `/en/cars`)
- **Admin routes**: No i18n prefix (e.g., `/admin/vehicles`)
- Middleware handles locale detection and admin authentication
- Default locale is Romanian (`ro`), secondary is English (`en`)
- Translations stored in `messages/en.json` and `messages/ro.json`

### Authentication & Authorization

- **Clerk** provides authentication via JWT tokens
- **Admin access**: Hardcoded user IDs in `middleware.ts` (line 8-12)
- User records synced to Convex `users` table via `UserEnsurer` component
- Admin routes redirect non-authenticated/non-admin users to home

### Data Model (Convex Schema)

Key tables:
- **users**: User profiles with Clerk integration
- **vehicles**: Car inventory with pricing tiers, features, images
- **vehicleClasses**: Categories for vehicles (Economy, Luxury, etc.)
- **reservations**: Booking records with customer info, dates, pricing
- **transfers**: VIP transfer bookings with pickup/dropoff locations
- **seasons**: Seasonal pricing multipliers with date periods
- **blogs**: Blog posts with MDX content
- **featuredCars**: Homepage featured vehicles (3 slots)

### Key Design Patterns

1. **Convex Functions**:
   - Always use new function syntax with `args` and `returns` validators
   - Use `query` for reads, `mutation` for writes, `action` for external API calls
   - Internal functions use `internalQuery`, `internalMutation`, `internalAction`
   - Function references: `api.filename.functionName` (public) or `internal.filename.functionName` (private)

2. **Seasonal Pricing**:
   - Global seasonal multipliers applied via `currentSeason` table
   - Stored in reservations for historical accuracy
   - Calculated in `useSeasonalPricing` and `useReservationPricing` hooks

3. **Pricing Tiers**:
   - Vehicles have `pricingTiers` array with `minDays`, `maxDays`, `pricePerDay`
   - Lower price per day for longer rentals
   - Legacy `pricePerDay` field deprecated in favor of `pricingTiers`

4. **Transfers**:
   - Uses Mapbox for location search and distance calculation
   - Pricing based on distance (km) with minimum fare
   - Vehicles marked with `isTransferVehicle: true` and `transferPricePerKm`
   - Supports one-way and round-trip bookings

5. **Image Management**:
   - Images stored in Convex `_storage` system
   - Vehicle images: `images` array + `mainImageId` for primary image
   - Image uploads via `ctx.storage.generateUploadUrl()` in mutations

6. **Email Notifications**:
   - Templates in `components/email/` using React Email
   - Sent via Resend API from Convex actions
   - Tracks sent emails in `emailLogs` table

## Code Conventions

### TypeScript
- Strict mode enabled
- Use `Id<'tableName'>` for Convex document IDs
- Define prop interfaces: `interface ComponentNameProps { ... }`
- Use discriminated unions with `as const` for literals
- Import aliases: `@/components`, `@/lib`, `@/hooks`, `@/types`

### React Components
- Client components: Add `"use client"` directive at top
- Server components by default (no directive)
- Hooks called before early returns
- Props destructured in function signature

### Convex Backend
- **Always** include `args` and `returns` validators for all functions
- Use `v.null()` for functions that return nothing
- Use `withIndex` for filtering (NOT `.filter()` without index)
- Use `.unique()` for single document queries
- Use `.paginate()` for paginated queries with `paginationOptsValidator`
- Error handling: Throw errors for validation failures
- Index naming: Include all fields (e.g., `by_field1_and_field2`)

### Styling
- TailwindCSS for all styling
- Use `cn()` utility from `lib/utils.ts` for conditional classes
- CVA (class-variance-authority) for variant-based components

## Important Files

- `convex/schema.ts`: Complete database schema with all tables and indexes
- `middleware.ts`: Clerk auth + next-intl locale routing + admin authorization
- `app/providers.tsx`: Root providers (Clerk, Convex, Theme, i18n)
- `.cursor/rules/convex_rules.mdc`: Comprehensive Convex development guidelines
- `AGENTS.md`: Additional agent-specific guidelines (similar to this file)

## Convex Best Practices

Reference `.cursor/rules/convex_rules.mdc` for detailed Convex guidelines. Key points:

- Use new function syntax with `query`, `mutation`, `action` wrappers
- Always validate arguments and return values
- Use `internalQuery/Mutation/Action` for private functions
- Call functions via `ctx.runQuery/Mutation/Action` with function references from `api` or `internal`
- Use file-based routing (function in `convex/example.ts` → `api.example.functionName`)
- Define indexes in schema for all filter operations
- Use `v.id(tableName)` validator for document IDs
- Use `Id<'tableName'>` TypeScript type for document IDs
- Use `ctx.db.system.get()` for `_storage` file metadata (NOT deprecated `ctx.storage.getMetadata`)

## Common Workflows

### Adding a New Vehicle Class
1. Create entry in `vehicleClasses` table via admin UI or Convex mutation
2. Set `sortIndex` for ordering in UI
3. Update vehicles to reference new `classId`

### Creating a Reservation
1. User selects vehicle, dates, locations via reservation form
2. `useReservationPricing` calculates real-time pricing (base + seasonal + protection)
3. Submit to `convex/reservations.ts` mutation
4. Sends confirmation email via Resend action
5. Redirects to confirmation page with reservation details

### Managing Featured Cars
1. Admin selects 3 vehicles for homepage slots (1, 2, 3)
2. Stored in `featuredCars` table with slot number
3. Homepage queries featured cars and displays in hero section

### Transfer Booking Flow
1. User enters pickup/dropoff locations using Mapbox search
2. Selects date, time, passengers
3. System calculates distance and pricing
4. Select transfer vehicle from available options
5. Complete booking with customer info
6. Confirmation email sent

## Environment Variables

Required environment variables (check `.env.local`):
- `NEXT_PUBLIC_CONVEX_URL`: Convex deployment URL
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk public key
- `CLERK_SECRET_KEY`: Clerk secret key
- `CLERK_JWT_ISSUER_DOMAIN`: Clerk JWT issuer for Convex integration
- `RESEND_API_KEY`: Resend email API key
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`: Mapbox access token for transfers
