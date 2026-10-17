# Frontend & Rendering Performance Remediation Plan

## Scope

This plan owns every **frontend / client-rendering / bundle / asset / static-vs-dynamic** finding
in `AUDIT.md` for the public site (`app/[locale]/**`, `app/layout.tsx`, `components/features/**`,
`components/ui/**`, shared search components). Findings claimed here:

- **Critical** — `app/layout.tsx` calls `await headers()` to compute `<html lang>`, a dynamic API in
  the root layout that opts **every route** (home, /cars, /blog, all detail pages) into per-request
  rendering, defeating `generateStaticParams` sitewide. (AUDIT "performance", root layout.)
- **High** — `mapbox-gl` (~1.5 MB parsed / ~230 KB gzip) + its CSS statically imported into three
  transfer routes' initial JS bundles. (AUDIT "performance", transfer-route-map.)
- **High** — 1.9 MB PNG hero loaded as a CSS `background-image` bypassing `next/image` (LCP), plus a
  788 KB `our-story.jpg` source. (AUDIT "performance", background-image.)
- **High** — every vehicle-card image sets `priority` unconditionally; on `/cars` the whole fleet
  preloads eagerly, defeating lazy-loading. (AUDIT "performance", vehicle cards.)
- **Medium** — `blog-content.tsx` compiles MDX in the browser and leaks the toolchain into public
  bundles via the barrel. (AUDIT "performance".)
- **Medium** — testimonials marquee renders 38 cards each pulling a raw third-party Unsplash `<img>`
  eagerly on the landing page. (AUDIT "performance".)
- **Medium** — `app/[locale]/layout.tsx` serializes the entire 26-namespace message catalog into
  every route's RSC payload. (AUDIT "performance".)
- **Medium** — `app/[locale]/transfers/page.tsx` is entirely `"use client"` (SSR text at opacity 0
  until hydration, ships all copy + framer-motion in the bundle) though only the form is
  interactive. (AUDIT "wrong-layer"; i18n side owned by the i18n plan.)
- **Medium/Low** — `cars-page-client.tsx` filter round-trip (effect → parent `setState` → full second
  render), `HomePageClient` searchState lifting, `transfers/booking` single-state re-render, plus two
  Mapbox-request hygiene items (no abort/stale-guard; redundant Directions call on restore). (AUDIT
  "spaghetti"/"performance".)

**Not in this plan (cross-referenced):** Convex query shape / server-side image-URL joins / N+1
subscription fixes → `audit-convex-performance.md` (covers reservation & confirmation waterfalls,
car-detail per-image round-trips, blog-list image N+1, `getAllVehiclesWithClasses` projection). The
reservation page's internal re-render/pricing structure → `audit-reservation-decomposition.md`. Admin
dialog subscription/watch storms → `audit-admin-dialogs.md`. Where a fix here touches a shared
component that convex-perf also edits (e.g. vehicle card image source), the split is: **this plan owns
the client render props (priority, dynamic import, next/image), convex-perf owns how the URL/data is
fetched.**

## Context

Key facts verified against the code (not just AUDIT):

- **`reactCompiler: true`** is enabled in `next.config.ts`. React Compiler auto-memoizes function
  components and hook results, so several "unmemoized re-render" findings (HomePageClient searchState,
  transfers/booking keystrokes, the cars filter double-render) are **already substantially mitigated**.
  This drops their priority to cleanup-only; the ones that remain are *architectural* (an effect
  round-trip, a bundle in the wrong place, an eager network request) that memoization does not fix.
- Build currently runs `next build --webpack` (a separate modernization finding). **No bundle
  analyzer is installed** — verification of bundle-size wins uses the `next build` route table + the
  `First Load JS` column, or a one-off `@next/bundle-analyzer` run.
- Asset sizes on disk (`public/`): `mercedes-background.png` **1870 KB** (2048×1054 RGBA),
  `our-story.jpg` **788 KB**, `og-cars.png` / `og-transfers.png` **1743 KB each**, `maps.png` 708 KB,
  `tudor2.jpg` **5557 KB** (verify if referenced; likely deletable). The OG images are only ever
  fetched by social crawlers so they are lower priority than the hero, but still worth compressing.
- **Routing structure** (load-bearing for the `headers()` fix): `app/layout.tsx` is the single root
  layout and renders `<html>`/`<body>` + `Providers` (Clerk, Convex, Theme) + fonts + GTM + Analytics.
  It sits **above** the `[locale]` segment, so it cannot read the locale param — that is exactly why
  the author reached for `headers()` and the `x-pathname` header set in `proxy.ts:60`.
  `app/[locale]/layout.tsx` adds `LocaleProviders` (next-intl) + `PublicLayout` and already has
  `generateStaticParams`. `app/admin/layout.tsx` is a `"use client"` sidebar shell with no `<html>`.

### Why the `headers()` fix requires a restructure (not a one-liner)

`generateStaticParams` on `[locale]` produces `/ro/*` and `/en/*`, but **both locale subtrees share
one root-layout render**. A single static root layout can only emit one fixed `lang`. So there are
exactly three options:

1. Keep `<html lang>` in the root and feed it a request value (`headers()`/`cookies()`) — the current
   state, which forces dynamic rendering everywhere. Rejected.
2. Hardcode `lang="ro"` in the root — restores static rendering but ships `lang="ro"` on English
   pages (SEO/a11y regression on an SEO-sensitive site). Rejected as the final state.
3. **Move `<html lang={locale}>` below the `[locale]` segment via multiple root layouts.** This is the
   only option that is both fully static *and* per-locale-correct. Recommended.

Next.js supports multiple root layouts when there is **no** top-level `app/layout.tsx`; each top-level
segment then provides its own `<html>`/`<body>`. Here the two top-level segments are `[locale]` and
`admin`. Navigating *between* those two trees becomes a hard navigation (already effectively true —
admin is a separate app), and navigation *within* `[locale]` stays client-side. The cost is
duplicating the shell (fonts, `<body>`, `Providers`, GTM, Analytics, metadataBase) into two files.

## Implementation steps (ordered by impact ÷ effort)

### Step 1 — `mapbox-gl` code-split via `next/dynamic` (High impact, Low effort) — DO FIRST

**Problem:** `transfer-route-map.tsx` does `import mapboxgl from "mapbox-gl"` + `import
"mapbox-gl/dist/mapbox-gl.css"` at module top. It is statically imported by
`transfer-summary-card.tsx` (line 26) which is imported by the transfers **vehicles**, **booking**,
and **confirmation** pages. The whole GL runtime therefore lands in those three routes' initial
bundles even though mapbox is only touched inside a `useEffect`.

**Change:**
- In `transfer-summary-card.tsx`, replace the static import of `TransferRouteMap` with
  `const TransferRouteMap = dynamic(() => import("./transfer-route-map"), { ssr: false, loading: () => <MapSkeleton/> })`.
  `transfer-route-map.tsx` already has a `default` export, so no export change needed.
- Confirm no other module imports `TransferRouteMap` statically (grep). The confirmation and vehicles
  pages reach it only through `TransferSummaryCard`, so this one edit covers all three routes.
- Keep `"mapbox-gl/dist/mapbox-gl.css"` inside `transfer-route-map.tsx` so it is code-split with the
  component (do not hoist it to a layout).

**Files:** `components/features/transfers/transfer-summary-card.tsx` (and verify
`app/[locale]/transfers/{vehicles,booking,confirmation}` don't import the map directly).

**Effect:** removes ~230 KB gzip (~1.5 MB parsed) from the First Load JS of all three transfer routes;
map still renders client-side on demand.

**Verify:** `next build` route table — `First Load JS` for `/[locale]/transfers/vehicles`, `/booking`,
`/confirmation/[transferId]` drops by roughly the mapbox chunk size, and a new async chunk appears.
Optionally confirm with `@next/bundle-analyzer` that `mapbox-gl` moved to its own lazy chunk.

### Step 2 — Index-based `priority` on vehicle-card images (High impact, Low effort)

**Problem:** `vehicle-card-with-preloaded-image.tsx:120` (and the `vehicle-card.tsx` twin at ~125) set
`priority` on every card's `<Image>`. `/cars` renders the entire fleet, so every image emits a
`<link rel=preload>` + eager fetch, saturating the connection and defeating lazy-loading for
below-the-fold cards — the opposite of an LCP win.

**Change:**
- Add an optional `priority?: boolean` (or `index?: number`) prop to
  `VehicleCardWithPreloadedImage`; pass `priority={priority}` to `<Image>` and drop the hardcoded
  `priority`.
- In the list renderers, set `priority` only for the first ~4 cards: the map in
  `vehicle-list-display-with-preloaded-images.tsx` (used by `/cars`) and the `VehicleList` in
  `home-page-client.tsx` (used on the homepage featured grid) pass `priority={index < 4}`.
- If the dead `vehicle-card.tsx` / non-preloaded list twins are removed by the dead-code plan, only
  the `-with-preloaded-image` component needs the prop; otherwise apply to both.

**Files:** `components/features/vehicles/vehicle-card-with-preloaded-image.tsx`,
`components/features/vehicles/vehicle-list-display-with-preloaded-images.tsx`,
`app/[locale]/home-page-client.tsx`, and `vehicle-card.tsx` if still live.

**Effect:** on `/cars`, preload hints drop from N (whole fleet) to ~4; remaining images lazy-load,
freeing bandwidth for above-the-fold content and improving LCP/TBT on the listing page.

**Verify:** view-source / Network panel on `/cars` — only ~4 car images preload eagerly, the rest
`loading="lazy"`; Lighthouse "Defer offscreen images" / LCP on `/cars` improves.

### Step 3 — Hero + story images through `next/image` and compressed (High impact, Medium effort)

**Problem:** `background-image.tsx` renders the 1.9 MB `mercedes-background.png` as a Tailwind
`bg-[url('/mercedes-background.png')]` — no resizing, no AVIF/WebP, no preload/`fetchpriority`, late
discovery after CSS parse. This is the homepage LCP element (and the about page). `our-story.jpg`
(788 KB) already uses `next/image` but is oversized at source.

**Change:**
- **Compress assets first** (biggest single win, independent of code): re-encode
  `mercedes-background.png` to a resized WebP/AVIF (target < 250 KB) and `our-story.jpg` to < 200 KB.
  Consider the same for `og-cars.png`/`og-transfers.png` (1.7 MB → < 300 KB) and check whether
  `tudor2.jpg` (5.5 MB) is referenced at all — if not, delete it.
- **Convert the hero to `next/image`:** replace the CSS-background `<div>` in `background-image.tsx`
  with `<Image src=... fill priority sizes="100vw" style={{objectFit:'cover', objectPosition:'top'}} />`
  inside the existing absolutely-positioned wrapper, keeping the `after:` bottom-gradient overlay as a
  sibling element (it can't stay on the `<Image>`). Keep `aria-hidden`. Because it is `priority`,
  Next emits a preload + high `fetchpriority`, fixing late LCP discovery.
- `our-story.jpg` already uses `<Image fill sizes>`; just swap in the compressed source.

**Files:** `components/ui/background-image.tsx`, `app/[locale]/home-page-client.tsx` (hero uses
`<BackgroundImage>`), `app/[locale]/about/page.tsx`, and the `public/` assets.

**Effect:** hero payload ~1.9 MB → < 250 KB with a proper preload; expected large homepage LCP
improvement. Story/OG compression removes ~1–2 MB of oversized transfer.

**Verify:** Lighthouse mobile on `/ro` before/after — LCP drops and the LCP element is the optimized
`next/image`, not a background div; Network shows the preload of the hero. Confirm the after-gradient
still renders.

### Step 4 — Remove `headers()` from the root layout (Critical impact, High effort)

**Problem:** `app/layout.tsx:102` `await headers()` makes the root layout dynamic, cascading
per-request rendering to all public routes and defeating `generateStaticParams` for home, `/cars`,
`/blog`, and all car/blog detail pages (they hit Convex via `fetchQuery` on every request instead of
being prerendered/ISR'd). See Context above for why a literal swap is impossible.

**Recommended change — split into two root layouts:**
1. Delete `app/layout.tsx`.
2. Create `app/[locale]/layout.tsx` as a **root** layout (server component): render
   `<html lang={locale} suppressHydrationWarning ...>` / `<body className={fonts}>`, the GTM tag,
   `<Analytics/>`, `<SpeedInsights/>`, `Providers`, then the existing `LocaleProviders` +
   `PublicLayout`. `locale` comes from the already-awaited `params`, so **no `headers()`**. Move the
   `metadata`/`metadataBase` export here (locale-aware). Keep `generateStaticParams`.
3. Create/convert `app/admin/layout.tsx` into a **root** layout: a thin server component rendering
   `<html lang="ro">` / `<body>` + `Providers`, wrapping the current client sidebar shell (extract the
   existing client body into e.g. `admin/admin-shell.tsx`).
4. Move `globals.css` import and the shared font instances into a small shared module imported by both
   roots (fonts must be instantiated once per root; importing the same `next/font` module is fine).

**Sequencing note:** the root layout also feeds the "full message catalog" issue (Step 6). Do Step 4
first, then trim namespaces in the new `[locale]` root.

**Files:** `app/layout.tsx` (delete), `app/[locale]/layout.tsx`, `app/admin/layout.tsx` (+ new
`admin/admin-shell.tsx`), `app/providers.tsx`, `proxy.ts` (the `x-pathname` header set at line 60 is
now unused — remove it and its only consumer). Detail pages
`app/[locale]/cars/[slug]/page.tsx` and `app/[locale]/blog/[slug]/page.tsx` need **no** change beyond
confirming their `generateStaticParams` now actually prerenders.

**Effect:** public routes go from **ƒ (Dynamic, server-rendered on demand)** to **● (SSG)** / **○
(Static)** in the build output; home/cars/blog and detail pages are prerendered instead of running
Convex on every request. This is the single largest rendering win in the plan.

**Verify:** capture `next build`'s route-table legend **before and after**. Before: public routes
marked `ƒ`. After: `/[locale]`, `/[locale]/cars`, `/[locale]/blog`, `/[locale]/cars/[slug]`,
`/[locale]/blog/[slug]` marked `●`/`○` with the two locales listed under SSG. Manually confirm
English pages serve `<html lang="en">` and Romanian `<html lang="ro">` in view-source (server HTML,
not post-hydration). Smoke-test Clerk auth + Convex still work under both roots, and admin still
renders.

### Step 5 — `transfers/page.tsx` to a server component (Medium impact, Low/Medium effort)

**Problem:** the whole transfers landing page is `"use client"`; all copy ships in the client bundle
(with framer-motion via `AnimatedGroup`) and the SSR'd text sits at `opacity:0` until hydration
because `AnimatedGroup` starts `hidden` — bad for an indexed SEO page and for LCP.

**Change:** make the page a server component using `getTranslations`; keep `TransferSearchForm` and
the `AnimatedGroup` wrappers as client leaves. The hardcoded-English feature strings are the **i18n
plan's** job — coordinate so this refactor lands the server/client split and the i18n plan moves the
strings into `messages/`. Consider not wrapping the primary heading/first paragraph in `AnimatedGroup`
(or give it a no-animation fallback) so above-the-fold text is visible pre-hydration.

**Files:** `app/[locale]/transfers/page.tsx`, `components/ui/animated-group.tsx` (only if a
non-hidden initial state is added).

**Effect:** less client JS on the transfers landing page; SSR text visible immediately (better LCP +
crawlable content).

**Verify:** view-source shows the transfer copy in server HTML; the page is `●`/`○` in the build
table; JS disabled still shows text.

### Step 6 — Trim message-catalog serialization in the `[locale]` root (Medium impact, Low effort)

**Problem:** `app/[locale]/layout.tsx` passes the full `getMessages()` result (26 namespaces, ~10 KB
gzip) into `NextIntlClientProvider`, so every hard navigation serializes all namespaces into the RSC
payload even though each route uses a few.

**Change:** pass only the namespaces client components actually need per route (e.g. `pick` the shared
+ route-relevant namespaces) and rely on server-side `getTranslations` for server-rendered copy. This
composes with Step 4 (do it in the new root). Keep it conservative — audit which namespaces each
client subtree calls before trimming to avoid runtime "missing message" errors.

**Files:** `app/[locale]/layout.tsx`, `app/providers.tsx` (`LocaleProviders`).

**Effect:** smaller RSC payload per navigation.

**Verify:** RSC payload size for a public navigation shrinks; no `MISSING_MESSAGE` warnings in console
across pages.

### Step 7 — `blog-content.tsx` MDX out of public bundles (Medium impact, Low/Medium effort)

**Problem:** `blog-content.tsx` runs `next-mdx-remote/serialize` + `rehype-highlight`
(lowlight/highlight.js) client-side in a `useEffect` with a loading flash, and it is re-exported from
the `components/features/blog/index.ts` barrel that public blog client components import from —
risking the MDX toolchain leaking into public bundles. A server variant `blog-content-server.tsx`
already exists.

**Change:** restrict the client `blog-content.tsx` to the admin preview and import it **directly**
there, not via the barrel; remove it from the barrel (or ensure public `blog-detail-client` /
`blog-list-client` use the server variant). Public blog rendering should use the server MDX path.

**Files:** `components/features/blog/blog-content.tsx`, `components/features/blog/index.ts`,
`components/features/blog/blog-preview.tsx`, `blog-detail-client.tsx`, `blog-list-client.tsx`.

**Effect:** highlight.js/MDX toolchain kept out of public blog bundles.

**Verify:** bundle analyzer (or `next build` chunk names) confirm `highlight.js`/`next-mdx-remote`
absent from public blog route chunks; admin preview still renders.

### Step 8 — Testimonials marquee images (Medium impact, Low effort)

**Problem:** `testimonials-with-marquee.tsx` renders 19 hardcoded testimonials ×2 = 38 cards, each
with a Radix `AvatarImage` rendering a raw `<img>` from `images.unsplash.com` (Radix preloads via a
JS `Image()` object, so `loading="lazy"` may not defer it) — ~17 unique third-party image requests on
first landing paint. (Moving the testimonial **content** into `messages/` is the i18n plan's job; this
plan owns the **image** loading.)

**Change:** render avatars with `next/image` at a fixed 48px (add the Unsplash host to
`images.remotePatterns` if kept) or a plain lazy `<img loading="lazy" width=48 height=48>` instead of
the Radix avatar's preloading path. Better: self-host/bundle the avatars or drop remote avatars for
initials, eliminating third-party requests entirely.

**Files:** `components/features/landing/testimonials-with-marquee.tsx`,
`components/ui/testimonial-card.tsx`, `components/ui/avatar.tsx` (or config for remote host).

**Effect:** removes ~17 eager third-party image requests from landing first paint.

**Verify:** Network panel on `/ro` shows testimonial avatars deferred (or gone); no
`images.unsplash.com` requests before scroll.

### Step 9 — Cars-page filter round-trip + Mapbox request hygiene (Low impact, Low effort — cleanup)

React Compiler already mitigates the raw re-render cost of these; the remaining value is
architectural/correctness.

- **`cars-page-client.tsx`:** filtering pushes results up via a `useEffect` → parent `setDisplayedVehicles`
  → second full render, and `handleFilterChange` re-joins with `initialVehicles.find()` inside `.map()`
  (O(n·m)) plus an `as VehicleWithImageUrl` cast. Make `useVehicleFilters` return derived data used
  directly in the parent's render (no effect round-trip, no re-join — `Array.filter` preserves object
  references so the image-URL fields are never stripped). Pre-normalize brand strings once.
  *Files:* `app/[locale]/cars/cars-page-client.tsx`, `components/features/vehicles/vehicle-filters.tsx`,
  `hooks/use-vehicle-filters.ts`.
- **`mapbox-location-search.tsx`:** add an `AbortController` (or request-id stale guard) so fast typing
  over a slow network can't render stale suggestions; move `setLoading(true)` inside the debounced
  callback. *File:* `components/shared/search-filters/mapbox-location-search.tsx`.
- **`transfer-search-form.tsx`:** skip the Mapbox Directions call on mount when `distanceKm` +
  `estimatedDurationMinutes` were just restored from storage for the same pickup/dropoff pair — one
  redundant **paid** API round-trip per page view. *File:*
  `components/features/transfers/transfer-search-form.tsx`.
- **`transfers/booking/page.tsx` & `home-page-client.tsx`:** single-component form state /
  searchState-lifting re-render findings — **verify with React Compiler enabled whether any
  perceptible cost remains before investing**. If it does, isolate the form into its own stateful
  subtree; otherwise close as already-mitigated. *Files:* `app/[locale]/transfers/booking/page.tsx`,
  `app/[locale]/home-page-client.tsx`.

**Verify:** `/cars` filter toggles trigger one render pass (React DevTools Profiler); no stale mapbox
suggestions on fast typing; no Directions request when route info is restored from storage.

## Dependencies

- **Step 4 (root-layout split) is the linchpin.** Do it before Step 6 (namespace trimming lives in the
  new `[locale]` root) and before re-measuring any static-rendering claim. Steps 1–3 are independent
  and can land first as fast wins.
- **i18n plan overlap:** Steps 5 and 8 change the *rendering* of `transfers/page.tsx` and the
  testimonials marquee; the i18n plan moves their hardcoded strings into `messages/`. Sequence so the
  server/client refactor and the string extraction don't collide — ideally same PR or i18n first.
- **convex-perf plan overlap:** Step 2 (vehicle-card `priority`) and Step 8 touch components whose
  image **URLs** convex-perf is changing to server-resolved joins. Keep the split clean: this plan
  edits render props only.
- **Dead-code plan overlap:** if `vehicle-card.tsx` (non-preloaded twin) is deleted there, Step 2 only
  needs to touch the `-with-preloaded-image` component.
- **Modernization (`--webpack` / Turbopack):** not owned here, but installing `@next/bundle-analyzer`
  is the cheapest way to verify Steps 1 and 7; note it as a verification prerequisite.

## Open questions

1. **Multiple-root-layout feasibility:** confirm a top-level dynamic segment (`[locale]`) can serve as
   a root layout alongside `admin` with no `app/layout.tsx`. Highly likely, but Step 4 should start
   with a throwaway `next build` on a spike branch before committing to the full move. Fallback if it
   misbehaves: wrap both `[locale]` and `admin` in route groups (`app/(public)/[locale]`,
   `app/(admin)/admin`) each with its own root layout.
2. **Clerk/Convex under two roots:** `Providers` must be instantiated in both roots; verify Clerk
   session + Convex client behave identically and there's no double-provider issue when the admin app
   and public app are separate root trees.
3. **OG/`tudor2.jpg` assets:** confirm whether `tudor2.jpg` (5.5 MB) and `maps.png` (708 KB) are
   referenced anywhere before deleting/compressing.
4. **Message-namespace trimming (Step 6):** needs an audit of which namespaces each client subtree
   consumes; if too risky, defer — it's the smallest win here.

## Size estimate

| Step | Effort | Impact |
|------|--------|--------|
| 1 — mapbox dynamic import | ~30 min | High (bundle) |
| 2 — vehicle-card priority prop | ~30 min | High (LCP/bandwidth) |
| 3 — hero/story next/image + asset compression | ~2–3 h | High (LCP) |
| 4 — root-layout split (remove headers()) | ~0.5–1 day + careful QA | Critical (sitewide static) |
| 5 — transfers page → server component | ~1–2 h (coord w/ i18n) | Medium |
| 6 — message-namespace trimming | ~1–2 h | Medium/Low |
| 7 — blog MDX out of public bundle | ~1–2 h | Medium |
| 8 — testimonials avatars | ~1 h (coord w/ i18n) | Medium |
| 9 — cars filter + mapbox hygiene cleanup | ~2–3 h | Low (mostly mitigated by React Compiler) |

Total: roughly **2–3 focused days**, front-loadable — Steps 1–3 (a half-day) capture most of the
user-visible LCP/bundle win; Step 4 is the biggest single lever but the riskiest and should be its own
PR with before/after build-table evidence.
