---
linear: unlinked
last-verified: 2026-07-22
verification-source: repository-only
---

# Convex Backend Performance & Convention Remediation

## Scope

This plan covers the Convex backend performance and convention cluster from `AUDIT.md`. Each item was verified against the current code.

**Critical**
- Booking-number generation `.collect()`s the entire `reservations`/`transfers` table on every booking. `createReservation` (`convex/reservations.ts:80-86`) reads all reservations and reduces for the max; `createTransfer` (`convex/transfers.ts:64-69`) does the same with `Math.max(...allTransfers.map(...))`. Cost grows with lifetime bookings, will eventually exceed Convex transaction read limits, and pulling the whole table into the mutation's read set makes every concurrent booking OCC-conflict and retry — serializing the money path against the entire table.

**High**
- Blog queries bypass the existing `by_status` index: `getAll` (`convex/blogs.ts:37-41`), `getFeatured` (`:82-90`), `getPublished` (`:116-125`), and `getAlternateSlugs` (`:565-568`) all use `.filter()`, reading full bilingual bodies including drafts. `setFeatured` (`:153-156`) scans on unindexed `isFeatured`. `generateStaticParams` (`app/[locale]/blog/[slug]/page.tsx:61-70`) calls `getAll` twice at build, pulling full projections just for slugs.
- `vehicles` table has no `classId` index → `vehicles.getByClass` (`:556-559`) and the in-use check in `vehicleClasses.remove` (`:237-240`) do `.filter()` full-table scans.
- Unpaginated admin list queries: `getAllReservations` (`convex/reservations.ts:252-262`) and `getAllTransfers` (`convex/transfers.ts:208-228`) `.collect()` whole tables including customer PII; clients paginate client-side with `.slice()` (`reservation-table.tsx:137`, `admin/transfers/page.tsx:261`). Transfers also JS-sorts instead of using `by_pickup_date`.
- Four admin stats queries full-table-scan on reactive queries: `getReservationStats`, `getMonthlyChartData` (`convex/reservations.ts:411-530`), `getTransferStats`, `getMonthlyTransferChartData` (`convex/transfers.ts:383-543`). Reservation vs transfer implementations are copy-pasted.
- N+1 per-row `useQuery(api.vehicles.getById)` in 3 table surfaces via inline `VehicleInfo` components declared in the parent body (`reservation-table.tsx:112`, `admin/transfers/page.tsx:178`, `user-reservations-table.tsx:54`) — remount every render.
- Image uploads pass raw bytes through action args exceeding Convex's ~16MiB arg / ~1MiB per-value limits; `vehicles.uploadImages` (`:304-353`) persists via the public `api.vehicles.update`, `blogs.uploadImages` (`:463-482`) uses `v.array(v.any())` plus an unused `blogId`.

**Medium**
- Widespread `.filter()` where indexes exist: `vehicles.getAll` (`:63-76`), `searchAvailableVehicles` (`:509-526`), `featuredCars.setFeaturedCar` (`:90-93`).
- Missing `returns` validators across `vehicles.ts`, `transfers.ts`, `reservations.ts`, all of `featuredCars.ts`, and `blogs.getPublished`.
- `blogs.getBySlug`/`getAlternateSlug` use `withIndex(indexName as any, (q: any) => ...)`; `incrementViews` triplicates the locale lookup.
- Admin dashboard (`app/admin/page.tsx`) client-side aggregation over full `getAllVehicles`/`getAllReservations`.

## Context

- Auth: `getCurrentUser`/`getCurrentUserOrThrow` live in `convex/users.ts:214-238`. `reservations.ts` and `featuredCars.ts` use them; `transfers.ts` hand-rolls the identity→`by_clerk_id`→`role==='admin'` check inline six times. The **auth wrapper / `requireAdmin` helper is owned by `audit-pricing-security.md`** (in flight). Several functions this plan paginates already carry inline admin checks; land the auth wrapper **before or together with** these refactors so we don't rewrite the same signatures twice. Where this plan adds new admin mutations (e.g. image persistence), gate them with whatever `requireAdmin(ctx)` helper that plan introduces.
- `getAllVehiclesWithClasses` (`vehicles.ts:697-746`) already demonstrates the server-side join + `ctx.storage.getUrl` pattern to copy for vehicle-info joins and image-URL resolution.
- Convex system index `by_creation_time` is available on every table for `_creationTime` range scans (`.withIndex("by_creation_time", q => q.gte("_creationTime", cutoff))`).
- `paginationOptsValidator` + `usePaginatedQuery` is the established pagination path (already used by `vehicles.getAll` and `blogs.getPublished`).
- Not in scope (owned by `audit-pricing-security.md`): auth wrappers themselves, client-supplied price recompute/validation in the create mutations, and the transfer-pricing formula dedup (`calculateTransferPrice` triplication). The image-upload **UI** side (dialog wiring, `useAction(... as any)` removal) is owned by `audit-admin-dialogs.md`; this plan owns the Convex endpoints those dialogs will call.

## Design

### 1. Booking numbers → counter document (Critical)
Add a `counters` table and allocate numbers from it instead of scanning the table.

```ts
counters: defineTable({
  name: v.string(),   // "reservationNumber" | "transferNumber"
  value: v.number(),  // last-issued number
}).index("by_name", ["name"]),
```

Allocation helper (in a shared `convex/counters.ts`, called from both create mutations):
```ts
async function nextNumber(ctx: MutationCtx, name: string, seed: number): Promise<number> {
  const counter = await ctx.db.query("counters")
    .withIndex("by_name", q => q.eq("name", name)).unique();
  if (!counter) {
    await ctx.db.insert("counters", { name, value: seed });
    return seed;
  }
  const next = counter.value + 1;
  await ctx.db.patch(counter._id, { value: next });
  return next;
}
```
Seeds preserve current starting points: reservations `10000`, transfers `1`.

**Why counter over desc-indexed read:** both approaches shrink the mutation's read set from the whole table to one document, and both intrinsically serialize concurrent bookings (unavoidable — sequential numbering *must* order). The counter wins on two points: (a) its read/write set is exactly one known document, so the only OCC conflicts are with other bookings (correct and minimal), whereas a `by_number` index `.order("desc").first()` takes a read dependency on the tail of the index range; (b) a counter never reuses a number after a booking is deleted, while `max + 1` from a live scan or index read can reissue a number that a deleted booking held. The cost is one extra hot document write per booking, which is fine at booking volumes. A one-time backfill seeds the counter from the current max so existing numbers are never re-issued.

### 2. Blog indexes (High)
- `getAll`: `.withIndex("by_status", q => q.eq("status","published")).order("desc")` — the `by_status` index sorts by `_creationTime` within the status key, so `.order("desc")` preserves current output.
- `getAlternateSlugs`: same `by_status` switch (still returns only slug pairs).
- Add `by_featured` index on `["isFeatured"]`.
  - `getFeatured`: `.withIndex("by_featured", q => q.eq("isFeatured", true)).first()`, then assert `status === "published"` (at most one featured doc, so this is O(1)).
  - `getPublished`: keep `by_status` eq `published`, `.order("desc")`, and post-filter `isFeatured !== true` in the page map (at most one excluded doc; safe with pagination because at most one row is dropped).
  - `setFeatured`: replace the unindexed scan of previously-featured with `.withIndex("by_featured", q => q.eq("isFeatured", true))`.
- Add a slim `getPublishedSlugs` query returning `[{ slug }]` per locale (using `by_status`) for `generateStaticParams`, replacing the double `getAll` at build.

### 3. `classId` index (High)
Add composite `by_class_and_sort` on `["classId","classSortIndex"]`:
- `getByClass`: `.withIndex("by_class_and_sort", q => q.eq("classId", args.classId))` returns rows already ordered by `classSortIndex` (index order), dropping the JS `.sort`. Note `classSortIndex` is optional; `undefined` sorts before numeric values — acceptable and matches the current `?? 0`-then-sort intent closely (flag in review).
- `vehicleClasses.remove`: `.withIndex("by_class_and_sort", q => q.eq("classId", id)).first()` for the in-use check.

### 4. Paginate admin lists + server-side vehicle join (High)
Convert `getAllReservations` and `getAllTransfers` to `.paginate()` and join vehicle make/model/year on the returned page only (bounded to page size, so no N+1 blow-up):
```ts
export const getAllReservations = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    await requireAdmin(ctx); // from audit-pricing-security
    const result = await ctx.db.query("reservations").order("desc").paginate(args.paginationOpts);
    return { ...result, page: await Promise.all(result.page.map(async (r) => {
      const vehicle = await ctx.db.get(r.vehicleId);
      return { ...r, vehicle: vehicle && { make: vehicle.make, model: vehicle.model, year: vehicle.year } };
    })) };
  },
});
```
- `getAllTransfers`: same shape but drive ordering off `by_pickup_date`: `.withIndex("by_pickup_date").order("desc").paginate(...)` (matches the current JS `pickupDate` desc sort).
- `getCurrentUserReservations`: paginate on `by_user` + join vehicle info (Low finding in AUDIT.md, folded in here since it shares the join helper).
- Clients (`reservation-table.tsx`, `admin/transfers/page.tsx`, `user-reservations-table.tsx`): switch to `usePaginatedQuery`, delete the inline `VehicleInfo` components and `.slice()` pagination, and read `reservation.vehicle.make` etc. from the joined payload.
- **Dashboard decoupling:** `app/admin/page.tsx` and the stats card in `admin/transfers/page.tsx` must stop consuming the list query for counts — move them onto the stats queries (section 5). A paginated list can no longer supply `reservations.length`.

### 5. Stats queries: bound the scans + dedup (High)
Two-tier approach:

**Tier A (do now) — bound the reactive scans by time range and dedup:**
- Time-windowed metrics (current-month revenue, last-month comparison, 6-month chart) only need recent rows. Replace `.query(t).collect()` with a `by_creation_time` range scan for reservations (`gte` six-months-ago) and a `by_pickup_date` range scan for transfers. This caps the reactive re-execution cost to the recent window instead of the whole table.
- Extract the shared monthly-bucketing + growth math into a `convex/lib/stats.ts` pure helper operating on `{ timestamp, revenue, counts-by-status }`, and have both the reservation and transfer stats/chart queries call it. Removes the copy-paste between `reservations.ts` and `transfers.ts`.

**Tier B (larger, flag as follow-up) — all-time totals & status counts:**
`totalReservations`/`totalTransfers` and the active/pending status counts cannot be date-bounded, so a bounded scan can't produce them correctly. Options, in order of preference:
- Maintained counters in the `counters` table (or a dedicated `stats` doc), incremented/decremented in the create/update-status/cancel/delete mutations. Scales to any table size; reactive cost is O(1). This is the correct end state but touches every write path — size it as its own change.
- Interim: add a `by_status` index to `reservations` (transfers already has one) and use it for the status counts via bounded `.take()` caps, accepting that all-time total remains a full count until the counter lands.

Given this is the money-path dashboard, recommend Tier A now and scheduling Tier B (maintained counters) as an immediate follow-up; both create mutations already touch the `counters` table (section 1), so extending it for stats is incremental.

### 6. Image upload flow (High, Convex side)
Replace byte-through-args with the upload-URL pattern:
- Add `generateUploadUrl` mutation to `vehicles.ts` and `blogs.ts` (`return await ctx.storage.generateUploadUrl();`), gated by `requireAdmin`.
- Client (owned by `audit-admin-dialogs.md`) POSTs each file directly to the returned URL and receives a `storageId`.
- Add narrow admin-gated persist mutations to replace the actions:
  - `vehicles.addImages({ vehicleId, imageIds: v.array(v.id("_storage")), insertAtIndex })` — moves the ordering/insert logic out of the deleted `uploadImages` action and patches `images` directly (no `ctx.runQuery`/`ctx.runMutation` hop).
  - Blog images persist through the existing `create`/`update` (`coverImage`, `images`) — delete `blogs.uploadImages` and its unused `blogId` arg.
- Delete `vehicles.uploadImages` (action) and `blogs.uploadImages` (action). Removing them also removes the public unauthenticated `api.vehicles.update` write path used for image persistence.

### 7. `.filter()` → `withIndex` cleanups (Medium)
- `searchAvailableVehicles`: this query is dead (no in-repo callers) and its date/location args are ignored (High bug in AUDIT.md). Prefer **deleting it**; if kept, drive `status` off `by_status` and post-filter type/transmission/fuelType.
- `vehicles.getAll` (paginated): multiple optional filters can't all be indexed. Drive the index off the single most-selective supplied filter (`status`, else `type`) via `withIndex` and post-filter the rest. **Caution:** switching a paginated query onto an index changes its `_creationTime`-desc ordering, and post-filtering inside pagination can yield short pages — verify the admin vehicles table still renders/paginates correctly, or leave `getAll` as-is if the ordering guarantee matters more than the scan cost (it is admin-only and bounded by page size). Lower priority than the list-query pagination.
- `featuredCars.setFeaturedCar`: `vehicleId` scan is bounded to ≤3 rows — convention-only; add a `by_vehicle` index only if touched anyway.

### 8. Returns validators (Medium)
Add `returns` validators to the public functions currently missing them, matching the repo convention (`.cursor/rules/convex_rules.mdc`): most of `vehicles.ts` (`getById`, `getBySlug`, `create`, `update`, `remove`, `setMainImage`, `getImageUrl`, `getAllVehicles`), nearly all of `transfers.ts` (`getTransferById`, `getCurrentUserTransfers`, `getAllTransfers`, `getTransfersByVehicle`, `getTransferVehicles`, `getTransferVehiclesWithImages`, the update/cancel/delete mutations' `{ success }` shapes), `reservations.ts` (`getReservationById`, `getCurrentUserReservations`, the `getReservationsBy*` queries, and the `{ success, message }` mutation shapes), all six `featuredCars.ts` functions, and `blogs.getPublished`. Where a query returns a joined shape (sections 4-5), the validator must include the joined fields.

### 9. Typed blog slug lookup (Medium)
Extract `findBlogBySlug(ctx, slug, locale)` into `convex/blogs.ts` with an explicit `if (locale === "ro") ... else ...` on `by_slug_ro`/`by_slug_en` plus the legacy `by_slug` fallback, returning the typed `Doc<"blogs"> | null`. Replace the two `withIndex(indexName as any, (q: any) => ...)` casts in `getBySlug`/`getAlternateSlug` and the duplicated typed lookup in `incrementViews` with calls to it.

## Implementation steps (ordered)

1. **Schema migrations** (`convex/schema.ts`): add `counters` table + `by_name`; add `blogs` `by_featured` index; add `vehicles` `by_class_and_sort` index; (Tier B, if taken) add `reservations` `by_status` index. Deploy schema first — indexes must exist before queries reference them.
2. **Counter backfill** (`convex/counters.ts` + an `internalMutation` `seedBookingCounters`): read current max `reservationNumber`/`transferNumber` (one-time full scan is acceptable here) and insert counters at those values so no number is re-issued. Run once via `npx convex run`.
3. **Booking numbers** (`convex/reservations.ts`, `convex/transfers.ts`, `convex/counters.ts`): replace the `.collect()` max logic in both create mutations with `nextNumber(ctx, ...)`.
4. **Blog indexes** (`convex/blogs.ts`, `app/[locale]/blog/[slug]/page.tsx`): switch `getAll`/`getFeatured`/`getPublished`/`getAlternateSlugs`/`setFeatured` to `withIndex`; add `getPublishedSlugs`; point `generateStaticParams` at it; add the `findBlogBySlug` helper (step also covers section 9).
5. **`classId` index consumers** (`convex/vehicles.ts` `getByClass`, `convex/vehicleClasses.ts` `remove`): switch to `by_class_and_sort`.
6. **Auth wrapper coordination**: confirm `requireAdmin(ctx)` from `audit-pricing-security.md` has landed (or land it here if that plan is behind) before rewriting the list/stats/upload signatures.
7. **Paginate lists + join** (`convex/reservations.ts`, `convex/transfers.ts`; clients `reservation-table.tsx`, `admin/transfers/page.tsx`, `user-reservations-table.tsx`): add `paginationOpts`, join vehicle info, switch clients to `usePaginatedQuery`, delete inline `VehicleInfo` components and `.slice`.
8. **Stats Tier A** (`convex/reservations.ts`, `convex/transfers.ts`, new `convex/lib/stats.ts`): bound scans by `by_creation_time`/`by_pickup_date` range; extract shared bucketing helper; dedup.
9. **Dashboard rewire** (`app/admin/page.tsx`): drop `getAllVehicles`/`getAllReservations`; consume `getReservationStats` + `getMonthlyChartData`; add a vehicle-count query (or extend stats) and a last-7-days series server-side. Remove inline client aggregation.
10. **Image uploads** (`convex/vehicles.ts`, `convex/blogs.ts`): add `generateUploadUrl` + `vehicles.addImages`; delete both `uploadImages` actions and `blogs` unused `blogId`. Coordinate the client cutover with `audit-admin-dialogs.md`.
11. **`.filter()` cleanups** (`convex/vehicles.ts`, `convex/featuredCars.ts`): delete or index `searchAvailableVehicles`; index-drive `vehicles.getAll` if pursued.
12. **Returns validators** (sweep across the five files), including the joined shapes from steps 7-8.
13. **Stats Tier B** (follow-up change): maintained counters in create/update-status/cancel/delete mutations for all-time totals and status counts.

## Dependencies

- **`audit-pricing-security.md` (in flight)** — provides `requireAdmin(ctx)`. Land it before/with steps 7-10 so admin queries/mutations aren't re-signatured twice. Its price-recompute work also edits `createReservation`/`createTransfer`, the same functions step 3 touches — sequence step 3 and the pricing recompute to land together or in a known order to avoid conflicts.
- **`audit-admin-dialogs.md` (in flight)** — owns the upload UI. Step 10's Convex endpoints (`generateUploadUrl`, `addImages`) are the contract that plan consumes; agree the mutation signatures before either side merges.
- Schema/index deploys (steps 1-2) must precede any query referencing new indexes.
- Backfill (step 2) must run before step 3 switches to the counter, or the first post-deploy booking could collide with an existing number.

## Open questions

1. **Counter vs desc-index for booking numbers** — plan recommends the counter (no number reuse, minimal read set). Confirm number reuse after deletion is genuinely unacceptable (it is for invoice-like references); if reuse is fine, the desc-index read avoids the `counters` table and backfill.
2. **Stats Tier B scope** — is a maintained-counter rewrite of every reservation/transfer write path in scope for this cluster, or should it be its own tracked task? Tier A alone leaves all-time totals scanning until then.
3. **`vehicles.getAll` index switch** — the ordering change under pagination may be user-visible in the admin vehicles table. Confirm whether the scan cost justifies changing ordering, or leave as-is (admin-only, page-bounded).
4. **`searchAvailableVehicles`** — delete (recommended, it's dead + misleading) or implement the date-overlap check using `by_dates`? Deletion is the perf/convention win; implementing is a feature decision.

## Size estimate

Large. Roughly: schema + counter + backfill (S); blog indexes + slug helper (S-M); classId index (S); list pagination + join + 3 client rewrites (M); stats Tier A + dedup + dashboard rewire (M); image upload endpoints (M, gated on dialogs plan); returns validators sweep (M, mechanical); Tier B maintained counters (M-L, follow-up). Best split into several PRs along the step boundaries — schema/counter, blog+class indexes, list pagination+join, stats+dashboard, image uploads, validators sweep — rather than one mega-change, and interleaved with the two in-flight plans at the shared functions.
