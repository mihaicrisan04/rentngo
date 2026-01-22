# CLAUDE.md

## Important: PRD Workflow

**Always read `prd.md` at the start of any session.** This document tracks tasks and their status.

When making changes to the codebase:
1. Check if the change relates to a planned item in the PRD
2. After implementing, move the task to "Completed" with date and brief note
3. Add new tasks to "Planned" section
4. Update `CHANGELOG.md` with a summary of changes

**Keep the PRD concise and task-focused:**
- Use tables for task lists (not long paragraphs)
- Brief notes only (1 line per task)
- No detailed implementation specs - those belong in code comments or separate docs
- Focus on: what was done, what's planned, current status

## Project Overview

RentNGo is a car rental platform with VIP transfer services for the Romanian market. Built with Next.js 15, Convex, and Clerk authentication. Supports Romanian (default) and English.

## Commands

```bash
npm run dev          # Start development (frontend + backend)
npm run build        # Build for production
npm run lint         # Run linter
npx convex deploy    # Deploy backend
```

## Project Structure

```
app/
├── [locale]/        # Public routes with i18n (ro/en)
│   ├── cars/        # Vehicle browsing
│   ├── reservation/ # Booking flow
│   └── transfers/   # VIP transfers
├── admin/           # Admin dashboard (no i18n)

convex/              # Backend functions & schema
components/          # React components
hooks/               # Custom React hooks
lib/                 # Utilities
messages/            # Translations (en.json, ro.json)
```

## Key Concepts

**Routing**: Public pages use `/[locale]/` prefix. Admin routes have no locale prefix.

**Database**: Convex with tables for users, vehicles, vehicleClasses, reservations, transfers, seasons, blogs.

**Authentication**: Clerk with admin access controlled by hardcoded user IDs in `middleware.ts`.

**Pricing**:
- Vehicles use `pricingTiers` array (tiered daily rates based on rental length)
- Seasonal multipliers applied from `seasons` table
- Transfers priced by distance via Mapbox

**Defaults**:
- Default location: "Aeroport Cluj-Napoca"
- Default pickup/return time: 10:00

## Convex Conventions

- Use `query`, `mutation`, `action` wrappers with `args` and `returns` validators
- Reference functions via `api.filename.functionName`
- Use indexes for filtering (defined in `schema.ts`)
- For detailed guidelines, see `.cursor/rules/convex_rules.mdc`

## Environment Variables

```
NEXT_PUBLIC_CONVEX_URL
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
CLERK_JWT_ISSUER_DOMAIN
RESEND_API_KEY
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
```
