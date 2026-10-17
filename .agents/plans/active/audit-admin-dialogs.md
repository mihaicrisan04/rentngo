---
linear: unlinked
last-verified: 2026-07-22
verification-source: repository-only
---

# Remediation Plan — Admin Dialogs & Upload Flow

## Scope

This plan covers the admin-dashboard dialog cluster from `AUDIT.md`. Findings addressed:

- **HIGH (bug) — image upload ships raw bytes through action args.** `use-image-upload.tsx` reads every file into an `ArrayBuffer` and passes them all in one `uploadImages` action call (`useAction(api.vehicles.uploadImages as any)`), and the same inline pattern is copy-pasted in `create-vehicle-dialog.tsx` and both blog dialogs. Convex caps function args at ~16MiB total while the UI allows 10×10MB files, so realistic uploads fail outright. Vehicle create also persists via the public unauthenticated `api.vehicles.update`. Client-side redesign to `generateUploadUrl()` + direct `POST` per file. **This is a live breakage — do it first.**
- **MEDIUM (bug) — blob URL leaks in `modern-image-upload-preview.tsx`.** Unmount cleanup effect has `[]` deps, so its closure captures the initial `files` prop; URLs created afterwards are never revoked (~10MB/image alive for the tab lifetime). Parent dialogs also reset state without revoking. Fix with a ref-based revoke.
- **HIGH (duplication) — the three create/edit dialog pairs are ~90% copy-paste.** Vehicles (1088/1145 lines, 233 differing), blogs (835/869, 74 differing), seasons (338/373, 77 differing). Extract a shared `<VehicleForm>`/`<BlogForm>`/`<SeasonForm>` + one zod schema per entity; create/edit become thin wrappers.
- **HIGH (file-size) — `edit-reservation-dialog.tsx` (1265 lines).** The `vehicleId+dates→pricing` block repeats 5× with divergent SCDW pricing. Extract `usePriceDetails()` + `PricingBreakdown` + a schema module.
- **HIGH (perf) — reservation-dialog `form.watch` storms.** Top-level watch of 8 fields + ~40 inline watches + O(N) per-`SelectItem` pricing. `useMemo` once per render + `useWatch` subcomponents. `create-reservation-dialog.tsx` has the milder variant.
- **MEDIUM (bug) — auto-recalc `useEffect` clobbers manual price edits.** Two effects in `edit-reservation-dialog.tsx` pass `form.watch([...])` arrays as deps and unconditionally `setValue`. Switch to an RHF watch subscription or explicit-recalc-only.

Secondary duplication these extractions also resolve (Medium findings): shadow-state `pricingTiers`/`periods` arrays mirrored via `setValue`, byte-identical `availableFeatures`/`handleNumberInput`/`handleIntegerInput`, and raw Radix `Tabs` primitives duplicated across all six dialogs.

**Out of scope / owned elsewhere (cross-references):**
- The **Convex server side** of the upload redesign — a `generateUploadUrl` mutation, a narrow storage-ID-persist mutation, and `requireAdmin` on all admin writes — is owned by `audit-convex-performance.md` / `audit-pricing-security.md`. This plan owns only `hooks/use-image-upload.tsx` and the dialog integration; it defines the client→server contract those plans must satisfy.
- The **canonical SCDW / pricing formula** (`calculateSCDW`, `calculateVehiclePricing*`, seasonal math) moves to a shared pricing module owned by `audit-pricing-security.md`. The reservation-dialog `usePriceDetails()` hook consumes that module rather than redefining the formula.
- The **reservation *page*** decomposition (`app/[locale]/reservation/page.tsx`, 1888 lines) is `audit-reservation-decomp.md`. This plan owns only the admin **dialogs** (`create-`/`edit-reservation-dialog.tsx`). Both consume the same canonical pricing module.
- `create-class-dialog.tsx` (vehicle-classes, 236 lines, create-only, no edit twin) is **not** in this cluster — left as-is.

## Context

Verified against the code (line numbers current as of branch `audit/thermo-nuclear-code-review`):

**Confirmed diff sizes** (`diff <create> <edit>`, changed lines): vehicles 233, blogs 74, seasons 77 — matching the audit. Reservations show 945 because they diverge heavily (create 728 / edit 1265); those two are a **decompose-in-place** target, not a create/edit merge.

**Current upload paths (all ship raw bytes):**
- Vehicle *create*: `ModernImageUploadPreview` stages files locally; on submit converts each `File` to `arrayBuffer()`, calls `uploadImages({ vehicleId, images: imageBuffers })` (action, `v.array(v.bytes())`), then `setMainImage`.
- Vehicle *edit*: `ModernImageUpload` → `useImageUpload` hook → same `uploadImages` action, immediate (per-vehicle), plus `DraggableImageList` for reorder/remove/set-main.
- Blog *create*/*edit*: `handleUploadImages` (identical in both) → `blogs.uploadImages({ images })` action (`v.array(v.any())`, unused optional `blogId` arg).
- `convex/vehicles.ts:346` — `uploadImages` action persists via `ctx.runMutation(api.vehicles.update, ...)`, the public mutation.

**Blob leak:** `modern-image-upload-preview.tsx:175-183` — cleanup effect `[]` deps captures initial `files`; only `handleRemoveFile`/`handleClearAll` revoke, and dialogs discard `selectedImageFiles` on close without revoking.

## Design

### A. Upload flow redesign (client side)

Replace the "bytes-through-action-args" path with the standard Convex direct-upload flow. Rewrite `hooks/use-image-upload.tsx` into a single hook used by **all four** call sites (currently there are two divergent client paths: the hook for vehicle-edit, inline arrayBuffer loops for vehicle-create + both blogs).

New per-file upload primitive (client contract the Convex plans must provide):

```
1. url = await generateUploadUrl()            // mutation, admin-guarded
2. res = await fetch(url, { method: "POST", headers: {"Content-Type": file.type}, body: file })
3. { storageId } = await res.json()           // one round trip per file, no 16MiB arg cap
4. persist storageIds via a narrow mutation (vehicles.addImages / blogs.addImages) — NOT api.vehicles.update
```

Hook shape (`useImageUpload`):
- Owns `selectedFiles`, drag state, validation (unchanged), and now `uploadAll(): Promise<Id<"_storage">[]>` that runs step 1–3 per file **in parallel** (`Promise.all`) and returns storage IDs. Persistence (step 4) is the caller's choice so create (defer to after entity insert) and edit (immediate) can both use it.
- Drop the `useAction(... as any)` cast entirely.
- Remove `vehicleId` coupling from the hook — it becomes entity-agnostic (vehicles and blogs share it). Persistence mutations are passed in or called by the wrapper.

`ModernImageUpload` and `ModernImageUploadPreview` converge: they render the same grid/dropzone. Keep one component (`ModernImageUpload`) taking `files` + `onFilesChange` (controlled, the `...Preview` shape) plus an optional `onUpload` for the immediate-upload (edit) case. Fold the two into one to kill the third duplication.

### B. Blob URL leak fix

In `modern-image-upload-preview.tsx` (and the merged component): keep the latest `files` in a `useRef`, update it in an effect on every `files` change, and revoke from the ref in the unmount cleanup:

```ts
const filesRef = useRef(files);
useEffect(() => { filesRef.current = files; }, [files]);
useEffect(() => () => {
  filesRef.current.forEach(f => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
}, []);
```

Additionally, dialogs must revoke on close/submit: route close through the shared component's `handleClearAll` (which already revokes) rather than a bare `setSelectedImageFiles([])`.

### C. Shared entity forms (vehicles / blogs / seasons)

Target file layout per entity (example: vehicles):

```
components/admin/vehicles/
  vehicle-form.tsx        # <VehicleForm> — all shared JSX, tabs, handlers, RHF wiring
  vehicle-schema.ts       # single zod schema + type + shared field constants
  create-vehicle-dialog.tsx   # thin wrapper: Dialog + mode="create"
  edit-vehicle-dialog.tsx     # thin wrapper: Dialog + mode="edit" + data fetch
```

`<XForm>` takes `mode: "create" | "edit"`, an optional entity/record, and `onSubmit`. It renders the shared form body; the wrappers own the `<Dialog>` shell, title/button labels, data fetch, and the submit mutation. Extract these shared modules alongside (they resolve separate Medium findings):
- `lib/admin-form-utils.ts` — `handleNumberInput`, `handleIntegerInput` (byte-identical across 6 dialogs), `availableFeatures` (identical in both vehicle dialogs).
- Migrate raw Radix `Tabs` primitives to the existing `components/ui/tabs.tsx` in all six.
- Replace shadow-state arrays (`pricingTiers`, `periods`) with `useFieldArray` (edit-reservation already demonstrates the correct pattern), deleting the `useState` + `setValue` mirroring and reading `values.*` in `onSubmit`.

**Preserved create-vs-edit differences (must NOT be flattened):**

*Vehicles*
- `slug`: create **required** (`min(1)`); edit **optional** (`.optional().or(z.literal(""))`, refine short-circuits on `""`). → schema takes a `mode` or the wrapper composes a base schema with a create-only `.min(1)` refinement.
- `fuelType`: create enum excludes `"petrol"`; edit includes it (to accept legacy vehicles). UI `<SelectItem>`s are identical (no petrol option in either). → superset enum in shared schema; this also intersects the Medium fuel-type finding — reconcile `petrol` vs `benzina` per `types/vehicle.ts` canonical `FuelType`.
- Form init: create = static empty defaults + reset-on-close effect; edit = `form.reset(...)` from a `useQuery(getById)` result with `pricingTiers: []` then a `setValue` patch (falling back to the default `1/999/50` tier), plus `mainImageId` seeding and an early `return null` when `!vehicle`.
- Image handling: create defers upload to submit (stage → `createVehicle` → `uploadAll` → `setMainImage`); edit uploads immediately against the existing `vehicleId` and additionally renders `DraggableImageList` (reorder/remove/set-main handlers). The shared form exposes both modes; create hides the existing-image manager.
- `<Select>` binding: create uses `defaultValue={field.value}`, edit uses `value={field.value}` (edit hydrates async via `form.reset`). → shared form uses `value=` (the safe superset).
- `onSubmit`: create → `createVehicle` (`slug: values.slug`, then image upload); edit → `updateVehicle` (`id: vehicleId`, `slug: values.slug || undefined`, no image work).
- Wrapper props: create `{open, onOpenChange, onSuccess?}`; edit adds `vehicleId: Id<"vehicles">` and fetches internally.
- Cosmetic (keep): title/button labels, feature-checkbox `id` prefix (`feature-` vs `edit-feature-`), isOwner/isTransferVehicle helper text.

*Blogs*
- `blogSchema`: create has an inert `publishedAt` field the form never binds; edit omits it. → drop from the shared schema (computed in `onSubmit` regardless).
- `LangToggle` + `ImageThumbnail` (verbatim in both) → move into `blog-form.tsx` or a `components/admin/blog/` shared module. `ImageThumbnail`'s per-item `useQuery(getImageUrl)` is an N+1 (Medium finding, owned by `audit-convex-performance.md` batch-URL query) — leave the call shape but note it consumes the batched resolver once available.
- Edit-only: `useEffect` hydration from `useQuery(getById)` with the **legacy `?? legacy.title ??` pre-migration fallback** (must preserve), `blog: BlogAdminListItem | null` prop, `if (!blog) return null`.
- `onSubmit`: create computes `publishedAt = status === "published" ? Date.now() : undefined` and resets form+state; edit computes it only on the draft→published *transition* (`!wasPublished && isNowPublished`), passes `id`, guards `if (!blog) return`, does not reset.
- Status `<Select>`: create `defaultValue`, edit `value` (same async-hydration reason).
- `getLocaleStatus` (8 `form.watch` in `DialogHeader`) → move into a `useWatch` subcomponent (see perf note E) rather than watching in the parent.

*Seasons*
- `seasonSchema` is **byte-identical** — straight extract.
- Form init: create seeds one empty period; edit `form.reset` from `useQuery(getById)` + reset-on-close.
- `periods` is shadow `useState` (not `useFieldArray`) with uncontrolled `<Input>`s bound to state, and `onSubmit` reads the **state array, not the form value** — convert to `useFieldArray` so validation and submission share one source.
- Wrapper props: edit adds `seasonId: Id<"seasons">`. Toast position cosmetic (`bottom-left` vs `bottom-right`).

### D. Reservation dialog decomposition (edit + create)

Not a create/edit merge — they diverge (create: `promoCode`, naive `Math.ceil` day math, no status/additionalCharges; edit: `status`, `additionalCharges` via `useFieldArray`, seasonal-aware `calculateVehiclePricing`). Instead, extract shared **modules** both consume:

```
components/admin/reservations/
  reservation-schema.ts     # base zod object + create/edit extensions
  use-price-details.ts       # usePriceDetails(form) → { days, seasonalPricePerDay, scdw, total, ... }
  pricing-breakdown.tsx      # <PricingBreakdown> — the summary UI, a useWatch subcomponent
  create-reservation-dialog.tsx
  edit-reservation-dialog.tsx
```

- **`reservation-schema.ts`**: a shared base (`vehicleId`, dates, times, locations, `paymentMethod`, `totalPrice`, `customer*`, `isSCDWSelected`, `deductibleAmount`, `protectionCost`) + `createReservationSchema` (adds `promoCode`) + `editReservationSchema` (adds `status`, `additionalCharges`).
- **`usePriceDetails(form)`**: compute `days` + seasonal price-per-day + SCDW + total **once per render via `useMemo`**, replacing the 5 repeated `vehicles.find → calculateVehiclePricing` blocks (edit lines 249-321, 360-390, 583-617, 1120-1163) and the 3 repeated seasonal-multiplier tails. Resolves the SCDW divergence: the audit found `calculateSuggestedPrice` uses **seasonal** per-day (`calculateSCDW(days, seasonalPricePerDay)`) while the SCDW `useEffect` uses **base** (`calculateSCDW(days, getBasePricePerDay(v))`) — the hook computes SCDW **once** off the seasonal price so `protectionCost` and the suggested total agree. The `calculateSCDW`/`calculateVehiclePricing` formulas themselves live in the canonical pricing module (`audit-pricing-security.md`); the hook only orchestrates.
- **`<PricingBreakdown>`**: a `useWatch` subcomponent rendering the breakdown, so the parent dialog no longer re-renders on every pricing-field keystroke.

### E. Reservation dialog perf + clobbering fixes

- Replace the top-level `form.watch([...8 fields])` (edit 195-204) and ~40 inline `form.watch("x")` calls with: `usePriceDetails` (memoized, one calc/render) + `useWatch`-based leaf subcomponents (`<PricingBreakdown>`, the vehicle-price hint, SCDW disabled-state).
- **Per-`SelectItem` pricing (edit 560-574):** every vehicle row calls `getRentalDays()` (5 watches + `find` + full pricing) though the result is identical for all rows. Compute `days` once (from `usePriceDetails`) and pass it down; the per-item price then only does the tier lookup for that vehicle.
- **Auto-recalc clobbering:** delete the two effects (edit 352-357 total-price, 360-413 SCDW) that pass `form.watch([...])` arrays as deps and unconditionally `setValue`. Replace with either (a) apply the suggested price **only** via the explicit "Recalc/Auto" button (create-reservation already does this — the safer default), or (b) an RHF `form.watch(callback)` subscription that recomputes but does **not** overwrite a field the admin has manually edited (track a `dirtyFields` guard). Recommend (a) for symmetry with the create dialog and to guarantee no silent clobber.
- create-reservation-dialog's milder pattern (two scalar watches, explicit-recalc button, `Math.ceil` day math in 3 places) migrates to the same `usePriceDetails`/schema modules so both dialogs agree on day math (edit's `calculateVehiclePricing` honoring pickup/return times becomes the single source; the `Math.ceil` and magic-`50` fallback variants are deleted).

## Implementation steps

Ordered; each step is independently shippable and typechecks (`npx tsc --noEmit`).

1. **Upload flow (live breakage first).**
   - Confirm/agree the Convex contract with `audit-convex-performance.md`: `generateUploadUrl` mutation + narrow `addImages` persist mutations (admin-guarded). This step depends on that server work landing.
   - Rewrite `hooks/use-image-upload.tsx` to `generateUploadUrl` + per-file `POST` + `Promise.all`; return storage IDs; drop the `as any` cast and `vehicleId` coupling.
   - Merge `ModernImageUpload` + `ModernImageUploadPreview` into one controlled component; apply the ref-based blob-revoke fix.
   - Update all four call sites (vehicle create/edit, blog create/edit) to the merged component + new hook; persist via the narrow mutations, never `api.vehicles.update`.
   - Verify: upload of 10×~8MB images succeeds (previously failed at the arg cap); no leaked blob URLs (DevTools memory).
2. **Reservation dialog** (once the canonical pricing module from `audit-pricing-security.md` exists).
   - Extract `reservation-schema.ts`, `use-price-details.ts`, `pricing-breakdown.tsx`.
   - Refactor `edit-reservation-dialog.tsx` onto them; remove the 5 repeated blocks, the two clobbering effects (→ explicit-recalc button), and the watch storm (→ `useWatch` leaves).
   - Align `create-reservation-dialog.tsx` onto the same modules.
3. **Seasons pair** (smallest, identical schema — good warm-up for the form-extraction pattern). Extract `season-schema.ts` + `<SeasonForm>`; convert `periods` to `useFieldArray`; wrappers.
4. **Blogs pair.** Extract `blog-schema.ts` + `<BlogForm>` (with `LangToggle`/`ImageThumbnail`); preserve the legacy hydration fallback and publish-transition logic; move `getLocaleStatus` into a `useWatch` subcomponent.
5. **Vehicles pair.** Extract `vehicle-schema.ts` + `<VehicleForm>`; convert `pricingTiers` to `useFieldArray`; handle the create/edit slug + fuelType + image-mode + `value=`/`defaultValue=` divergences.
6. **Shared cleanup across all six:** `lib/admin-form-utils.ts` (`handleNumberInput`/`handleIntegerInput`/`availableFeatures`); migrate raw Radix `Tabs` → `components/ui/tabs.tsx`.

## Dependencies

- **`audit-convex-performance.md`** (in flight): must provide `generateUploadUrl` + narrow `addImages` persist mutations, and the batched `getImageUrls` resolver for `ImageThumbnail`. Step 1 and blog `ImageThumbnail` depend on it.
- **`audit-pricing-security.md`** (in flight): owns the canonical `calculateSCDW` / `calculateVehiclePricing` / seasonal pricing module that `usePriceDetails` imports, and `requireAdmin` on the upload/persist mutations. Step 2 depends on the pricing module; step 1's security depends on the admin guard.
- **`audit-reservation-decomp.md`**: shares the canonical pricing module — coordinate so the page and the dialogs consume one implementation, not two.
- No dependency between steps 3–6 (the three pairs are independent); they can be parallelized once the pattern is set in step 3.

## Open questions

1. **Merged upload component name/props** — collapse to `ModernImageUpload` with an optional `onUpload` (immediate mode) vs keep two thin exports over one core? Recommend one component; confirm no other importers of `...Preview` exist outside these dialogs (grep showed only the dialogs).
2. **Clobber fix strategy** — explicit-recalc-button (a) vs dirty-guarded subscription (b). Recommend (a) for parity with create-reservation and zero silent overwrite; confirm admins are OK losing the "auto-updates as I type" behavior.
3. **Shared-schema mode handling** — one schema with a `mode` param driving the slug `.min(1)` refinement, vs a base schema `.extend()`ed per wrapper. Recommend `.extend()` (clearer types, no runtime branch).
4. **fuelType `petrol` vs `benzina`** — this reconciliation spans `types/vehicle.ts`, `convex/schema.ts`, and the vehicle dialogs; confirm whether it's folded into this plan's vehicle step or the type-safety finding's own remediation.

## Size estimate

Large (~1–1.5 weeks of focused work), best done as 6 separate PRs matching the steps:
- Step 1 (uploads): M — one hook rewrite + component merge + 4 call sites + blob fix. Gated on Convex-side contract.
- Step 2 (reservation dialogs): L — 1265+728 lines refactored onto 3 new modules; the highest-risk step (pricing correctness). Gated on the pricing module.
- Steps 3–5 (three pairs): S/M/M — seasons small, blogs and vehicles medium; net **deletion** of duplicated code (~230/74/77 differing lines collapse, plus the shared bodies).
- Step 6 (shared utils + Tabs): S — mechanical.

Net effect: removes ~2000+ lines of duplication, fixes a live upload breakage and a memory leak, and eliminates the reservation-dialog re-render storm and manual-edit clobbering.
