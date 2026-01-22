# Vehicle Slug Feature Implementation Plan

**Status:** Planned
**Created:** January 19, 2026
**PRD Section:** 3.8

## Overview
Add custom URL slugs to vehicles for SEO-friendly car detail URLs. Change from `/cars/[convex-id]` to `/cars/[slug]`.

## Changes Required

### 1. Database Schema (`convex/schema.ts`)
- Add `slug: v.optional(v.string())` to vehicles table
- Add index: `.index("by_slug", ["slug"])`

### 2. Backend Queries/Mutations (`convex/vehicles.ts`)
- Add `slug` to `create` mutation args
- Add `slug` to `update` mutation args
- Add `getBySlug` query to fetch vehicle by slug
- Add slug uniqueness validation (like blogs do)

### 3. Slug Utilities (`lib/vehicleUtils.ts`)
- Add `generateVehicleSlug(make: string, model: string, year?: number)` function
- Reuse `validateSlug()` pattern from `lib/blogUtils.ts`

### 4. Admin Dialogs
**`components/admin/create-vehicle-dialog.tsx`**
- Add slug input field in Basic Info tab
- Add "Generate" button next to slug input
- Auto-generate slug from make + model + year on button click

**`components/admin/edit-vehicle-dialog.tsx`**
- Add slug input field in Basic Info tab
- Add "Generate" button next to slug input
- Pre-populate with existing slug value

### 5. Car Details Page Routing
**`app/[locale]/cars/[id]/page.tsx`** → rename to **`app/[locale]/cars/[slug]/page.tsx`**
- Change param from `id` to `slug`
- Use `getBySlug` query instead of `getById`
- Update metadata generation to use slug

### 6. Update All Links to Car Details
Files to update:
- `components/vehicle/vehicle-card.tsx` - use `vehicle.slug` instead of `vehicle._id`
- `components/vehicle/vehicle-card-with-preloaded-image.tsx` - use `vehicle.slug`
- `app/[locale]/reservation/page.tsx` - back button link
- `app/sitemap.ts` - sitemap URLs

### 7. Backward Compatibility
- Keep `getById` query for admin/internal use
- Make slug optional initially to support existing vehicles without slugs
- Add migration note to PRD for updating existing vehicles

## File Changes Summary

| File | Action |
|------|--------|
| `convex/schema.ts` | Add slug field + index |
| `convex/vehicles.ts` | Add slug to mutations, add getBySlug query |
| `lib/vehicleUtils.ts` | Add generateVehicleSlug function |
| `components/admin/create-vehicle-dialog.tsx` | Add slug input + generate button |
| `components/admin/edit-vehicle-dialog.tsx` | Add slug input + generate button |
| `app/[locale]/cars/[slug]/page.tsx` | Rename from [id], use slug lookup |
| `components/vehicle/vehicle-card.tsx` | Use slug in URL |
| `components/vehicle/vehicle-card-with-preloaded-image.tsx` | Use slug in URL |
| `app/[locale]/reservation/page.tsx` | Update back button link |
| `app/sitemap.ts` | Use slug in sitemap URLs |
| `prd.md` | Document the feature |

## Design Decision
- **Slug-only URLs**: Old ID-based URLs will no longer work. All vehicles need slugs.
- Slug format: `{make}-{model}-{year}` lowercased with special chars removed (e.g., `bmw-x5-2024`)
- Existing vehicles without slugs won't appear in public listings until slug is added via admin

## Verification
1. Create a new vehicle with auto-generated slug
2. Edit existing vehicle and add/change slug
3. Navigate to car details via slug URL
4. Verify links from vehicle cards work
5. Verify back button from reservation works
6. Check sitemap includes slug URLs
