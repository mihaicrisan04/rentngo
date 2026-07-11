# Feature: modificare calendar (calendar modification)

> **Client brief was literally just "modificare calendar" with no further detail.**
> This document is a *skeleton*: it records the current calendar / date-picking
> behavior so the plan can be filled in the moment the client clarifies what they
> want changed. **Do not start building from the Open Questions — they are guesses
> to confirm, not a spec.**

---

## Status: requirements unclear — awaiting client

- What "modificare calendar" means is unknown. See [Open questions](#open-questions).
- Design and Implementation sections below are intentionally left as TBD skeletons.
- Once the client answers, promote the chosen interpretation into Design and delete
  the rest.

---

## Context: current calendar behavior

### The pieces

| Layer | File | Role |
|---|---|---|
| Low-level calendar UI | `components/ui/calendar.tsx` | shadcn wrapper over `react-day-picker`. Supports single + range modes, dropdown caption, `fromYear`/`toYear`. Only single mode is used today. |
| Date+time picker | `components/shared/search-filters/date-time-picker.tsx` | The shared control used across all **public** flows: a `Calendar` popover (date) + a `<select>` of 30-min time slots. |
| Persistence | `lib/search-storage.ts`, `lib/transfer-storage.ts` | localStorage for rental search / transfer search. `DEFAULT_TIME = "10:00"`. |
| Rental-day math | `lib/vehicle-utils.ts` | `calculateRentalDays`, `getMinReturnDate`. |

### The shared DateTimePicker (`date-time-picker.tsx`)

- `mode="single"` calendar (`calendar.tsx:231` via the picker at `date-time-picker.tsx:231`).
- Time slots: generated every 30 min, `00:00`–`23:30` (`date-time-picker.tsx:19-28`).
- Year range in the calendar: current year → current year + 20 (`date-time-picker.tsx:237-238`).
- Date label format: `format(dateState, "EEE, MMM d")` **with no `date-fns` locale passed**
  (`date-time-picker.tsx:222`) → weekday/month always render in English even on the
  Romanian (default) locale. The `Calendar` month dropdown uses
  `toLocaleString("default", …)` (`calendar.tsx:44`), i.e. browser locale, not the app locale.
- Time-slot disabling logic (`date-time-picker.tsx:83-115`):
  - On *today*, past time slots are disabled.
  - For a return picker on the *same day* as pickup, slots at/​before pickup time are disabled.
  - Note: only same-day return is constrained by pickup time; there is **no minimum
    rental duration** beyond that.

### Where the picker is used (all public flows)

| Consumer | File:line | Pickup id | Return id | minDate (pickup / return) |
|---|---|---|---|---|
| Reservation page | `app/[locale]/reservation/page.tsx:903, 967` | `res-pickup-datetime` | `res-return-datetime` | `today` / `pickupDate \|\| today` |
| Transfer search | `components/features/transfers/transfer-search-form.tsx:223, 263` | `pickupDateTime` | `returnDateTime` | `today` / `pickupDate \|\| today` |
| Vehicle search (hero) | `components/features/vehicles/vehicle-search-form.tsx:49, 82` | `pickupDate` | `returnDate` | `today` / `pickupDate \|\| today` |
| Vehicle search (filter bar) | `components/features/vehicles/vehicle-search-filter-form.tsx:214, 258` | (pickup) | (return) | `today` / `pickupDateState \|\| today` |
| Rental details (nav) | `components/shared/navigation/rental-details.tsx:108, 154` | (pickup) | (return) | `today` / `localPickupDate \|\| today` |

- Every consumer passes `disabledDateRanges={(date) => date < today}` (or `< pickupDate`
  for the return picker). **This is the only thing that greys out dates: past dates.**

### Admin flows use a DIFFERENT date mechanism

- Admin reservation and season dialogs do **not** use `DateTimePicker`/`Calendar`. They
  use native HTML inputs: `type="date"` / `type="time"`
  (`components/admin/reservations/create-reservation-dialog.tsx:315,333,351,369`,
  `edit-reservation-dialog.tsx:679…730`, `components/admin/seasons/create-season-dialog.tsx:286,295`).
- Season periods are stored as `startDate`/`endDate` strings (`create-season-dialog.tsx:44-45`).
- Default times in admin default to `"10:00"` (`create-reservation-dialog.tsx:105-106`).

### Constraints in effect today

- **Min date:** today for pickup; pickup date for return (`getMinReturnDate` returns the
  pickup date, so same-day return is allowed — `vehicle-utils.ts:109-112`).
- **Min rental duration:** none. Same-day = 1 day; multi-day adds a day only if return
  time is >2h after pickup time (`calculateRentalDays`, `vehicle-utils.ts:120-132`).
- **Max rental duration / max date:** none (calendar just caps year at +20).
- **Default time:** `10:00` (`search-storage.ts:12`, applied on load `:71-72,92-93`).
- **Locale:** date labels are hardcoded English; calendar dropdown follows browser locale.
  Neither follows the app's `ro`/`en` locale.

### Availability / booked-date blocking — CURRENTLY NONE

- No calendar anywhere blocks dates that are already booked for a given vehicle.
  `disabledDateRanges` is only ever used to block past dates.
- **AUDIT.md finding (bug, `convex/vehicles.ts`):** `vehicles.searchAvailableVehicles`
  declares `startDate`/`endDate`/`deliveryLocation` args but never consults the
  `reservations` table, so it returns vehicles regardless of overlap. It has no in-repo
  callers today (leftover). A `by_dates` index exists but is unused for availability.
- `convex/reservations.ts` has `getReservationsByVehicle` (`:201`) which *could* feed an
  availability check, but nothing wires it into the calendar.

### Known defect in the shared picker (AUDIT.md — wrong-layer)

- `DateTimePicker` imports `searchStorage` and silently persists the chosen date/time by
  **sniffing the `id` string**: `id.includes("pickup")` / `id.includes("return")`
  (`date-time-picker.tsx:122-139, 151-155, 163-165, 183-187`).
- Because the transfer picker ids (`pickupDateTime` / `returnDateTime`) and the vehicle
  search ids (`pickupDate` / `returnDate`) both *contain* those substrings, **selecting a
  transfer date overwrites the user's saved rental search dates in localStorage** —
  cross-feature state bleed. The reservation ids (`res-pickup-datetime`/`res-return-datetime`)
  match too.
- The component also double-persists what parent forms already save.
- AUDIT recommendation: make `DateTimePicker` fully controlled and move persistence into
  the owning forms.

---

## Open questions

**These are candidate interpretations of "modificare calendar" — guesses to confirm with
the client, NOT assumptions to build on.** Pick one (or more) before designing.

1. **Block already-booked dates per vehicle?** Should the reservation / vehicle calendar
   grey out dates already reserved for that specific car? (This is the biggest lift — it
   requires actually implementing the availability check that `searchAvailableVehicles`
   never does, plus per-vehicle reservation lookups feeding `disabledDateRanges`.)
2. **Change minimum rental duration?** Today same-day (1 day) is allowed. Does the client
   want a minimum (e.g. ≥1 night, ≥3 days)? Or a maximum cap?
3. **Visual redesign of the calendar?** Different styling, a range picker (single popover
   selecting pickup→return instead of two separate pickers), inline calendar vs popover,
   month/year layout?
4. **Different time granularity?** Currently 30-min slots, 24h. Client may want hourly
   only, business-hours-only, or per-location time windows.
5. **Season visibility in the calendar?** Should high-season / priced periods be visually
   marked on the calendar so users see why prices change?
6. **Locale correctness?** Should date labels follow the app locale (ro/en) instead of the
   current hardcoded-English behavior? (May be an implicit part of "modificare calendar"
   if the client noticed English dates on the Romanian site.)
7. **Fix the localStorage bleed as part of this?** If they're touching the picker anyway,
   is the id-sniffing persistence bug in scope, or a separate ticket?
8. **Which surfaces?** Public booking only, or also the admin native date inputs (which are
   a completely separate, un-styled mechanism today)?

---

## Design: TBD — pending client answers

_Leave blank until at least one Open Question is answered. Likely axes to decide:_
- Which flow(s) are in scope (public reservation, vehicle search, transfers, admin).
- Whether availability data (`reservations` by vehicle + dates) must be plumbed to the
  calendar, and whether the Convex query gap gets implemented here.
- Whether the shared picker stays shared (and gets made controlled) or forks.

## Implementation steps: TBD — pending client answers

_Placeholder skeleton — fill once Design is set:_
1. Confirm interpretation with client → lock scope.
2. (If availability) implement/verify Convex overlap query + wire per-vehicle disabled dates.
3. (If picker changes) refactor `DateTimePicker` to controlled; move persistence to owners
   (also resolves the id-sniffing bleed).
4. Apply UI/constraint changes across the affected consumers (table above).
5. i18n/locale pass on date formatting if in scope.
6. Test matrix: reservation, both vehicle-search surfaces, transfers, admin dialogs.

## Size estimate: TBD

_Ranges wildly by interpretation:_ a locale/format fix or min-duration tweak is small
(S); a visual/range redesign is medium (M); **real per-vehicle booked-date blocking is
large (L)** because the availability check does not exist server-side today and must be
built, then threaded into every calendar.
