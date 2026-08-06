---
linear: RNGO-36
linear-url: https://linear.app/mihaicrisan/issue/RNGO-36/featadmin-dashboard-ui-revamp-viewport-locked-shell-scroll-only-in
last-verified: 2026-08-06
---

# Admin dashboard: viewport-locked shell, Linear-style content container

Verified against `develop` @ 498089f (all RNGO-20 PRs merged — admin dashboards already use shared `StatCard`/`ChartCard`/`DashboardSkeleton`, transfers table extracted to `components/admin/transfers/transfer-table.tsx`).

## Intent

Shift the admin from "whole document scrolls" to the Linear/Vercel/Stripe model: sidebar + breadcrumb header pinned to the viewport, page content living inside a rounded, elevated container that is the only scroll surface (or delegates to inner panels like table bodies). Pure UI/UX; zero behavior changes.

## Current state (verified)

- `app/admin/admin-shell.tsx:66-96` — `SidebarProvider > AdminSidebar + SidebarInset`. Nothing constrains height; body scrolls; the h-16 breadcrumb header scrolls away.
- `components/admin/admin-sidebar.tsx` passes **no `variant`** → default `"sidebar"` look (flat, full-bleed).
- `components/ui/sidebar.tsx:307-319` — `SidebarInset` already has the inset-variant styles built in: `md:peer-data-[variant=inset]:m-2 … rounded-xl shadow-sm`. **The Linear look is one prop away**: `<Sidebar variant="inset">`.
- Admin routes inheriting the shell: `/admin` (dashboard, 214 lines), `affiliates`, `blogs`, `coupons`, `reservations` (210), `seasons`, `transfers` (211), `vehicles` (55), `vehicles/classes` + `[classId]`.
- No page currently opts into internal scrolling; tables render full-length and push the page.
- `app/admin/layout.tsx` — separate root layout; AdminShell is inside `Suspense` (usePathname + cacheComponents); `LocaleProviders locale="en"` pins intl.

## Target architecture

### Phase 1 — shell (one file, the whole visible win)

`app/admin/admin-shell.tsx`:

```tsx
<SidebarProvider>
  <AdminSidebar />                                     {/* add variant="inset" in admin-sidebar.tsx */}
  <SidebarInset className="h-svh min-w-0 overflow-hidden flex flex-col">
    <header className="h-16 shrink-0 …">               {/* unchanged content; always visible */}
    <main className="flex-1 min-h-0 overflow-y-auto p-4 pt-0 flex flex-col gap-4">
      {children}
    </main>
  </SidebarInset>
</SidebarProvider>
```

- `variant="inset"` on the `Sidebar` root inside `components/admin/admin-sidebar.tsx` (the component spreads props to `Sidebar`, so it may be a passthrough prop or a one-line edit at its root).
- `h-svh` not `h-screen` (mobile URL bar). Note the inset variant adds `m-2` — with `h-svh` that overflows by 1rem vertically; use `h-[calc(100svh-1rem)]` **or** rely on the variant margin + `overflow-hidden` on a `h-svh` flex wrapper — decide in code; simplest correct form wins. Check whether `SidebarProvider`'s own wrapper (`min-h-svh` on `.group/sidebar-wrapper`) already provides the outer frame.
- Every flex ancestor between `SidebarInset` and the scroll container needs `min-h-0`. This is the classic silent failure.
- Default scroll surface = `<main>`. All 9 sections keep working with zero page edits; scrolling just relocates from body to the pane.

### Phase 2 — sticky table headers (shared components)

Once tables scroll inside a container, add `sticky top-0 z-10 bg-…` to `<thead>` in the shared table components only:
- `components/admin/reservations/reservation-table.tsx`
- `components/admin/transfers/transfer-table.tsx`
- `components/admin/vehicles/vehicles-table.tsx`
- `components/admin/seasons/seasons-table.tsx`
- coupons/affiliates/blogs tables if they use the same `Table` primitive (verify; add to `components/ui/table.tsx` only if it can be opt-in via className, do NOT change the public-site tables' behavior).

Sticky works against the nearest scroll container, so in phase 1 (main-pane scrolling) headers stick to the top of the pane under the breadcrumb header — already a win. Full effect arrives with phase 3.

### Phase 3 — opt-in full-height pages (the data-dense payoff)

For reservations, transfers, vehicles (heaviest tables): page root becomes `flex flex-col h-full min-h-0`; stat cards + filter toolbar `shrink-0`; the table wrapper gets `flex-1 min-h-0 overflow-y-auto`. Only the table body scrolls; toolbar and pagination stay fixed. Do these three pages one PR each or one combined PR — each is a small, mechanical container-class change now that RNGO-20 extracted the tables.

Dashboard `/admin`, classes pages, blogs/coupons/affiliates/seasons: stay on default pane scrolling (phase 1 behavior). No internal scrolling needed.

### Phase 4 — polish (optional, cheap)

- Scroll shadow / fade at the pane's top edge when scrolled (signals scrollability).
- Confirm the custom `::-webkit-scrollbar` rules in `app/globals.css` apply to the inner containers.
- The inset card in dark mode: verify the `shadow-sm` + background tokens read as an elevated surface (Linear uses a slightly lighter card on dark background — check `bg-background` vs `bg-sidebar` contrast; the shadcn inset variant colors the sidebar area with `bg-sidebar` behind the card automatically).

## Gotchas (carry from the ticket, all still apply)

- `min-h-0` on every flex ancestor of a scroll container — THE failure mode.
- Radix popovers/selects/dialogs/toasts portal to body → unaffected by `overflow-hidden` ancestors; still verify a long dropdown near the pane bottom.
- Mobile: sidebar collapses to a Sheet; verify no scroll-trap at 390px, momentum scroll on iOS.
- cacheComponents: no render-time `new Date()`/UUID in anything new; AdminShell stays inside the layout's existing `Suspense`.
- Drag-reorder on the classes pages (`useSortableReorder`, dnd-kit): auto-scroll during drag must work inside the new scroll container — dnd-kit's auto-scroller detects scrollable ancestors, but verify with a long class list.

## Implementation sequence

1. PR 1 (`feat(admin): viewport-locked shell + inset sidebar`) — admin-shell.tsx + admin-sidebar.tsx variant. Verify all 9 sections + `[classId]` render and scroll in the pane, desktop + mobile, sidebar collapsed/expanded.
2. PR 2 (`feat(admin): sticky table headers`) — shared table components.
3. PR 3 (`feat(admin): full-height table pages`) — reservations, transfers, vehicles.
4. PR 4 (optional polish) — scroll shadows, scrollbar/dark-mode audit.

Estimate: PR 1 = S (half-day incl. verification), PR 2 = S, PR 3 = M (~1 day), PR 4 = S. Total ~2–2.5 dev-days.

## Verification

- No body-level scroll on any admin route; breadcrumbs/header always visible.
- Dialogs (create/edit vehicle, blog editor), dropdowns, date pickers, toasts all render/position correctly inside scroll containers.
- Drag-reorder on both classes pages incl. auto-scroll mid-drag.
- 390px mobile + desktop, both sidebar states, dark + light.
- `bun run build` green (regression gate for cacheComponents prerendering).
- Screenshots before/after per section to `.agents/artifacts/`.
- Admin is Clerk-gated: browser verification needs an authenticated session (dia-browser) or a dev bypass; plan for it up front, don't discover it at the end.

## Unresolved decisions

- Exact `h-svh` vs calc form for the inset margin (decide in code, phase 1).
- Whether `Table` primitive gets a shared opt-in sticky-header prop vs per-component classes (phase 2).
- Whether pagination rows sit inside or below the scrolling table body on full-height pages (phase 3; Linear keeps them fixed below — recommend that).
