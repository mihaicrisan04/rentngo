# Affiliate / Referral Marketing Program — Implementation Plan

Status: draft plan (no code written). Target repo: RentNGo (Next.js 16 App Router,
Convex, Clerk v7, next-intl). Branch context: `audit/thermo-nuclear-code-review`.

Client requirement (gist): a user gets a shareable link (`rngo.ro/my-name`) that
remembers the referral when clicked; if the visitor books, it counts as a conversion;
the referred customer gets a fixed discount; the referrer accumulates a conversion
counter and unlocks tiered rewards (e.g. 6 conversions → 5% discount for the referrer).
Everything — global settings, each tier, and per-user overrides — must be configurable.

---

## Context (what exists today)

### Routing / middleware
- The middleware lives in **`proxy.ts`** (Next.js 16 names it `proxy.ts`, not
  `middleware.ts`). It wraps `clerkMiddleware` around `next-intl`'s `createMiddleware`
  with `locales: ['ro','en']`, `defaultLocale: 'ro'`, `localePrefix: 'always'`
  (`proxy.ts:22-27`).
- Flow (`proxy.ts:29-63`): admin routes (`/admin(.*)`), `/api/`, `/_next/`, and any
  path containing `.` **skip** i18n. `/admin` additionally enforces Clerk admin role via
  `sessionClaims.metadata.role === "admin"`. **Every other path** is handed to
  `intlMiddleware`, which redirects e.g. `/my-name` → `/ro/my-name`.
- Consequence for vanity URLs: a bare `rngo.ro/my-name` is redirected to `/ro/my-name`,
  which resolves against `app/[locale]/` where **no matching route exists → 404**. There
  is no top-level catch-all today.
- Top-level (non-locale) routes: only `app/admin/` and `app/api/`. Everything else lives
  under `app/[locale]/`: `about, blog, cars, contact, privacy, profile, reservation,
  terms, transfers` (+ `error.tsx`, `home-page-client.tsx`, `layout.tsx`, `page.tsx`).
- `i18n.ts:5` hardcodes `locales = ['ro','en']` (duplicated in `app/[locale]/layout.tsx`
  per AUDIT.md type-safety finding).

### Reservation creation (the conversion event)
- `createReservation` mutation: `convex/reservations.ts:27-154`. Args include the money
  fields `totalPrice` (`:42`), `deductibleAmount` (`:53`), `protectionCost` (`:54`),
  `promoCode` (`:50`), plus `customerInfo {name,email,phone,...}` (`:43-49`) and an
  (ignored) `userId` arg (`:29`).
- **Guest bookings are allowed.** The handler calls `getCurrentUser(ctx)` (nullable, not
  `...OrThrow`) at `:77` and sets `userId: currentUser?._id || undefined` (`:90`). A
  not-signed-in visitor books with `userId: undefined`; `customerInfo.email` is always
  captured.
- **`promoCode` is stored but never validated or applied** (`:102`, echoed to email
  `:142`). `totalPrice` is computed **entirely client-side and trusted** — see AUDIT.md
  Critical "wrong-layer" finding.
- Reservation status is hard-set to `"pending"` on create (`:99`).

### Reservation UI / auth
- `app/[locale]/reservation/page.tsx` is a client component. Sign-in is **optional**: when
  `!user` it shows a soft `SignInButton` prompt (`:1292-1303`), no submission gate.
- Current Convex user via `useQuery(api.users.get)` (`:226`); Clerk user via `useUser()`.
- The reservation call passes `userId: currentUser ? currentUser._id : undefined`
  (`:732`) and `promoCode: undefined, // TODO: Add promo code functionality` (`:758`).
  **No promo/referral input field exists in the customer flow today.**

### Promotions / coupons (dead scaffolding)
- A `promotions` table is defined (`convex/schema.ts:225-235`: `code`, `type`
  percentage|fixed, `value`, `expiryDate`, `usageCount`, `maxUsage?`, `active`; indexes
  `by_code`, `by_active`) but **there is no `convex/promotions.ts` and the table is never
  read or written anywhere.** Redemption must be built from scratch (this is the coupon
  plan's job — see Dependencies).

### Users
- `getCurrentUser` / `getCurrentUserOrThrow`: `convex/users.ts:214-238`. Clerk→row mapping
  is `clerkId = identity.subject` via the `by_clerk_id` index. `email` is required on the
  row (`convex/schema.ts:10`).
- **No Clerk webhook.** Rows are created lazily by the `ensureUser` mutation
  (`convex/users.ts:30-98`), invoked client-side from `hooks/use-ensure-user.ts` after
  Clerk loads (mounted via `components/shared/auth/user-ensurer.tsx`). Default
  `role: "renter"`.

### Status lifecycle
- Statuses: `pending | confirmed | cancelled | completed` (`convex/reservations.ts:8-13`).
- `updateReservationStatus` (`:265-286`): owner-or-admin; drives pending→confirmed→
  completed with no ordering enforcement.
- `cancelReservation` (`:366-387`): soft-cancel → `status: "cancelled"`; non-admins
  blocked from cancelling `completed`/`cancelled` rows.
- `deleteReservationPermanently` (`:390-408`): admin-only hard delete.

### Profile & admin surfaces to reuse
- `app/[locale]/profile/page.tsx`: client component, shows profile header +
  `UserProfileForm` + `<UserReservationsTable/>` (backed by
  `api.reservations.getCurrentUserReservations`, `convex/reservations.ts:188-198`). Good
  host for an affiliate-facing dashboard tab.
- `app/admin/settings/page.tsx`: an **empty placeholder stub** ("Admin settings interface
  will go here") — ready to host global affiliate config.
- Admin CRUD pattern to mirror: `app/admin/seasons/` + `convex/seasons.ts` (admin-gated
  mutations via `getCurrentUserOrThrow` + `role === "admin"`). Singleton config pattern to
  mirror: `currentSeason` table (`convex/schema.ts:269-274`).

---

## Requirements

Functional:
1. A referrer obtains a shareable link tied to a unique human-readable **slug**.
2. Clicking the link lands the visitor on the site and **remembers the referral** across
   the browsing session up to an attribution window.
3. A reservation made by an attributed visitor is recorded as a **conversion** for that
   referrer.
4. The **referred customer receives a configured discount** on that reservation.
5. The referrer sees a **conversion counter** and unlocks **tiered rewards**
   (conversions → discount for the referrer's own future bookings).
6. **Full configurability**: global settings, every tier, and per-user overrides, all via
   admin UI.

Non-functional / constraints:
- Discount math **must be server-side** (AUDIT.md Critical: client totals are currently
  trusted; the pricing engine is being moved server-side in `audit-pricing-security.md`).
- Must work for **guest checkout** (no auth) and for signed-in users.
- Must not break locale routing or existing top-level routes.
- Conversions must survive cancellations (pending → confirmed/voided).
- Basic fraud protection (self-referral, admin void).

---

## Design

### 1. Vanity URL routing

**Recommendation: ship `rngo.ro/r/<slug>` as the primary, robust scheme, and treat bare
`rngo.ro/<slug>` as an optional enhancement gated by a reserved-word list.**

Why `/r/` first:
- The bare-slug scheme collides with i18n and with every current/future top-level route
  name. `intlMiddleware` redirects `/<slug>` → `/ro/<slug>`, and a bare slug is
  indistinguishable from `about`, `cars`, `blog`, a locale code (`ro`/`en`), `admin`,
  `sitemap.xml`, etc. Supporting it safely requires a **reserved-word list that must be
  kept in sync with the router forever** — a standing footgun as routes are added.
- A dedicated `/r/` prefix has zero collision surface, needs no reserved list, and is
  trivial to reason about. The cost is a slightly longer link.

**Mechanism (`/r/<slug>`):**
- Add a **top-level, non-i18n route handler** `app/r/[slug]/route.ts` (a `GET` Route
  Handler, sibling to `admin`/`api` so it bypasses `intlMiddleware`). Also add `/r/` to
  the skip-i18n branch in `proxy.ts:31-35` so the locale middleware never touches it.
- The handler:
  1. Looks up the affiliate by slug in Convex (`api.affiliates.getBySlug`).
  2. If found and active: sets a first-party cookie (see Attribution) and records a
     `referralVisit` (fire-and-forget, for analytics/fraud).
  3. Redirects (`302`) to `/` (which `intlMiddleware` sends to `/ro`), preserving any
     `?utm_*` and a `?ref` fallback if desired.
  4. If not found: redirect to `/` without a cookie (silent).

**Optional bare `rngo.ro/<slug>` enhancement (only if client insists on the short form):**
- In `proxy.ts`, **before** delegating to `intlMiddleware`, intercept single-segment
  paths whose first segment is **not** in a `RESERVED_SLUGS` set (`ro, en, admin, api,
  _next, about, blog, cars, contact, privacy, profile, reservation, terms, transfers,
  sitemap.xml, robots.txt, favicon.ico, r`) and `rewrite` them to `/r/<slug>`. The Route
  Handler stays the single source of truth. Slug creation must reject any value in
  `RESERVED_SLUGS`.
- Tradeoff: prettier links, but the reserved list is load-bearing and must be updated
  whenever a top-level or `[locale]`-level route is added. Do **not** do a Convex lookup
  inside `proxy.ts` (edge, latency on every request) — keep the middleware to a pure
  in-memory reserved-list check and rewrite; the DB lookup stays in the handler.

### 2. Attribution

**Cookie, not localStorage.** Rationale:
- The discount is applied **server-side** (mandated by the audit). localStorage is not
  sent to the server; a cookie is, and it also survives across tabs and has native
  expiry for the attribution window. localStorage would force a client round-trip and be
  invisible to any server-side pricing path.

Cookie spec:
- Name `rngo_ref`. Value: signed/opaque JSON `{ slug, visitId, ts }` (or just the slug +
  a server-verified lookup). `SameSite=Lax`, `Secure`, `Path=/`, `Max-Age` = attribution
  window (**default proposal: 30 days** — confirm in Open Questions).
- **Not `httpOnly`** if the client-side reservation mutation must read it to pass the slug
  as a mutation arg. **Preferred alternative:** keep it `httpOnly` and read it in a
  **Convex mutation via a server action / cookie forwarded through a server component**,
  so the referral can't be tampered with client-side. Since `createReservation` is
  currently called directly from the client component, the cleanest path is: a thin
  server action (or the reservation server wrapper introduced by the pricing-engine work)
  reads the `httpOnly` cookie and passes `referralSlug` into the mutation. **Decision:
  prefer httpOnly + server read; fall back to non-httpOnly only if the reservation flow
  stays fully client-side.** Flag the tamperability tradeoff.
- **Last-click wins**: a new referral visit overwrites the cookie. This is the standard
  affiliate default and is simplest. (First-click alternative → Open Questions.)

Guest vs signed-in:
- Attribution keys on the **cookie**, independent of auth. At conversion the referral slug
  travels with the reservation regardless of `userId`.
- For the referred **discount**, the identity that matters is `customerInfo.email` (always
  present) — used for self-referral checks and dedupe.
- If the visitor signs up/logs in later, no special handling is needed: the cookie still
  drives attribution at booking time. (Whether a signup itself — not a booking — should
  count is out of scope; conversion = reservation.)

### 3. Conversion definition & lifecycle

- **A conversion row is created when a reservation is created with a valid, non-fraudulent
  referral**, in `status: "pending"` — mirroring the reservation's own `pending` state.
- Transition rules (hooked into the existing status functions):
  - Reservation → `confirmed` (`updateReservationStatus`, `convex/reservations.ts:265`):
    conversion → `confirmed`. **Only confirmed conversions count toward the referrer's
    tier counter.**
  - Reservation → `cancelled` (`cancelReservation`, `:366`): conversion → `voided`.
  - Reservation → `completed`: conversion stays `confirmed` (already counted).
- This "pending-conversion" state means a cancellation before confirmation never inflates
  the counter, and the counter is derived from **confirmed** conversions only.
- The **referred discount** is applied at reservation-create time (server-side), so it
  exists on the reservation even while the conversion is still pending; if the reservation
  is cancelled the discount is moot (no booking).

### 4. Reward redemption (referrer's earned tier discount)

The referrer's reward is a discount on **their own future reservation**. Two candidate
designs:
- **(A) Dynamic, count-derived (recommended):** at `createReservation`, if the booking
  user is a registered affiliate, the server resolves their **current confirmed conversion
  count → tier → discount** and applies it via the shared discount engine. Always in sync
  with the counter; no separate issuance/expiry bookkeeping.
- (B) Issued credit/coupon: each tier unlock mints a one-time coupon. More control
  (expiry, single-use) but more moving parts and reconciliation.

**Recommendation: (A)**, implemented **through the shared discount-application engine that
the coupon plan introduces** (`feature-coupons.md`). Concretely, propose a single server
function:

```
applyDiscounts(ctx, { basePrice, userId, referralSlug, couponCode }) -> {
  finalPrice, breakdown: { referredDiscount, referrerReward, coupon }, appliedIds }
```

so that (a) affiliate discounts and coupon discounts share one code path, (b) **stacking
rules are defined in exactly one place**, and (c) it lives **inside the server-side pricing
engine** from `audit-pricing-security.md`. Both plans must agree on this interface — see
Dependencies.

Open behavioural questions (amounts, whether the reward applies every booking at a tier vs
once vs as a depleting credit, and whether the referred discount stacks with coupons) are
deferred to Open Questions — do not assume.

### 5. Fraud basics

- **Self-referral:** reject/void a conversion when the referred `customerInfo.email`
  matches the referrer's email, or the booking `userId` equals the affiliate's `userId`.
  No discount, no counter increment.
- **Same-device:** best-effort — if the browser that clicked the link is the affiliate's
  own logged-in session, or the visit's `ipHash` matches recent affiliate activity, flag
  the conversion for review rather than auto-confirm. (Store `ipHash`/`uaHash` on
  `referralVisits`; keep raw values out of the DB for GDPR.)
- **Admin void:** an admin mutation `voidConversion(conversionId)` sets `status: "voided"`
  and decrements/recomputes the counter. Voided conversions never count.
- **Duplicate/abuse caps:** optional per-email one-referred-discount cap and per-affiliate
  daily conversion rate flag (Open Questions).

### 6. Schema

New Convex tables (`convex/schema.ts`) + `convex/affiliates.ts` and
`convex/affiliateConfig.ts`:

- **`affiliates`**
  - `slug: v.string()` (unique; validated against `RESERVED_SLUGS` and a `^[a-z0-9-]+$`
    pattern), `userId: v.optional(v.id("users"))`, `displayName: v.optional(v.string())`,
    `status: v.union("active","suspended")`, `conversionCount: v.number()` (denormalized,
    confirmed-only), `createdAt: v.number()`,
  - `overrides: v.optional(v.object({ ... }))` — per-user overrides for referred-discount
    and/or a custom tier set / custom reward.
  - Indexes: `by_slug`, `by_user`.
- **`affiliateSettings`** (singleton, mirrors `currentSeason`): `enabled: v.boolean()`,
  `referredDiscountType: v.union("percentage","fixed")`, `referredDiscountValue:
  v.number()`, `attributionWindowDays: v.number()`, `attributionModel:
  v.union("last_click","first_click")`, plus fraud toggles.
- **`affiliateTiers`**: `threshold: v.number()` (confirmed conversions required),
  `rewardType: v.union("percentage","fixed")`, `rewardValue: v.number()`,
  `sortIndex: v.number()`, `isActive: v.boolean()`. Index `by_sort_index`.
- **`conversions`**: `affiliateId: v.id("affiliates")`, `reservationId:
  v.id("reservations")`, `referredEmail: v.string()`, `referredUserId:
  v.optional(v.id("users"))`, `status: v.union("pending","confirmed","voided")`,
  `referredDiscountApplied: v.number()`, `createdAt`, `confirmedAt: v.optional(v.number())`.
  Indexes: `by_affiliate`, `by_reservation`, `by_status`.
- **`referralVisits`** (analytics/fraud, optional but recommended): `affiliateId`,
  `ts: v.number()`, `ipHash: v.optional(v.string())`, `uaHash: v.optional(v.string())`.
  Index `by_affiliate`.

Admin UI:
- **Global settings + tier editor** on `app/admin/settings/page.tsx` (fill the stub),
  mirroring the seasons admin CRUD pattern; admin-gated Convex mutations
  (`convex/affiliateConfig.ts`) using `getCurrentUserOrThrow` + `role === "admin"`.
- **Per-affiliate management**: a new `app/admin/affiliates/` route (list + detail),
  mirroring `app/admin/seasons/` — create/suspend affiliates, set slug, set per-user
  overrides, view conversions, void conversions.

Affiliate-facing dashboard:
- Add an **affiliate tab/section on `app/[locale]/profile/page.tsx`** showing: the user's
  shareable link (`rngo.ro/r/<slug>` with copy button), confirmed conversion counter,
  current tier + next-tier progress, and their earned reward. Data from a new owner-scoped
  query `api.affiliates.getMyAffiliate` + `getMyConversions`. Slug claiming/creation flow
  is an Open Question (self-serve vs admin-provisioned).

---

## Implementation steps (ordered)

1. **Schema** — add `affiliates`, `affiliateSettings`, `affiliateTiers`, `conversions`,
   `referralVisits` tables + indexes to `convex/schema.ts`.
2. **Config backend** — `convex/affiliateConfig.ts`: admin-gated get/update for
   `affiliateSettings` (singleton) and CRUD + reorder for `affiliateTiers`. Seed defaults.
3. **Affiliate backend** — `convex/affiliates.ts`: `getBySlug` (public, minimal fields),
   `createAffiliate`/`suspend`/`setOverrides` (admin), `getMyAffiliate`,
   `getMyConversions` (owner-scoped), `voidConversion` (admin), and a
   `recordReferralVisit` mutation.
4. **Vanity routing** — add `app/r/[slug]/route.ts` handler (lookup → set `rngo_ref`
   cookie → record visit → redirect). Add `/r/` to the skip-i18n branch in `proxy.ts`.
   (Optional) add the `RESERVED_SLUGS` bare-slug rewrite in `proxy.ts`.
5. **Attribution read** — introduce a server read of the `rngo_ref` cookie in the
   reservation submit path (server action or the pricing-engine's server wrapper), passing
   `referralSlug` into `createReservation`.
6. **Discount engine hook** — implement `applyDiscounts(...)` in the **shared server-side
   pricing module** (coordinate with `audit-pricing-security.md` +
   `feature-coupons.md`). Wire referred-discount + referrer-reward resolution into it.
7. **Conversion creation** — in `createReservation` (`convex/reservations.ts:27`), after
   pricing, if a valid non-fraudulent `referralSlug` is present, insert a `conversions`
   row (`pending`) and store the referred discount on the reservation.
8. **Conversion lifecycle** — hook `updateReservationStatus` (`:265`) and
   `cancelReservation` (`:366`) to flip the linked conversion to `confirmed`/`voided` and
   recompute the affiliate's `conversionCount`.
9. **Admin UI** — fill `app/admin/settings/page.tsx` (global settings + tier editor); add
   `app/admin/affiliates/` (list/detail/overrides/void). Add sidebar entry in
   `components/admin/admin-sidebar.tsx`.
10. **Affiliate dashboard** — add the affiliate section to
    `app/[locale]/profile/page.tsx` (link + counter + tier progress). New components under
    `components/features/affiliate/`.
11. **i18n** — add `messages/en.json` + `messages/ro.json` keys for all new
    customer-facing strings (dashboard, referred-discount line on checkout). Romanian is
    default — no hardcoded English (per AUDIT.md i18n findings).
12. **Reservation UI** — surface the applied referred-discount in the price summary
    (`app/[locale]/reservation/page.tsx`), replacing the `promoCode: undefined // TODO`
    path (`:758`) with the referral/coupon inputs from the shared discount work.

---

## Dependencies on other plans

- **`audit-pricing-security.md` (server-side pricing engine) — HARD BLOCKER.** Discounts
  must be recomputed and applied on the server; today `createReservation` trusts
  client-supplied `totalPrice` (`convex/reservations.ts:42`, AUDIT.md Critical). The
  affiliate discount (referred + referrer reward) can only be trusted once pricing is
  server-authoritative. Do not apply real discounts before this lands.
- **`feature-coupons.md` (coupon engine) — SHARED ENGINE.** Recommend a single
  `applyDiscounts(...)` function owning stacking rules, consumed by both plans. The
  `promotions` table (`convex/schema.ts:225-235`) is dead scaffolding the coupon plan will
  activate; the referral reward should reuse the same redemption/validation primitives
  rather than duplicating them. The two plans must agree on the `applyDiscounts` signature
  and the stacking rules.
- **`ensureUser` flow** (`convex/users.ts:30-98`, `hooks/use-ensure-user.ts`): if slug
  provisioning happens at signup, it hooks here; otherwise admin-provisioned. No Clerk
  webhook exists.

---

## Open questions (unspecified — do NOT assume)

1. **Referred discount amount/type** — fixed EUR vs percentage, and the default value.
2. **Tier table** — the full tiers beyond the "6 conversions → 5%" example (thresholds,
   reward values, how many tiers, caps).
3. **Referrer reward semantics** — does the earned tier discount apply to **every** booking
   while at that tier, **once** per tier unlocked, or as a **depleting credit**? Expiry?
4. **Stacking** — does the referred discount stack with coupons? Does the referrer reward
   stack with coupons or with a referred discount on the same booking? Max total discount?
5. **Guest-checkout attribution retention** — is a 30-day window acceptable? First-click vs
   last-click? Should attribution also require the same email across visits?
6. **Slug moderation/claiming** — self-serve slug claiming from the profile page vs
   admin-only provisioning; profanity/impersonation moderation; slug change/transfer rules;
   uniqueness collisions.
7. **Bare `rngo.ro/<slug>` vs `rngo.ro/r/<slug>`** — does the client accept the `/r/`
   prefix (recommended), or require bare vanity (needs the reserved-word list + ongoing
   maintenance)?
8. **GDPR / consent** — the attribution cookie is marketing, not strictly necessary under
   EU/Romanian law; does it require a consent banner / opt-in before being set? What is the
   data-retention policy for `referralVisits` (ipHash/uaHash)?
9. **Cookie tamperability** — accept a non-httpOnly cookie read client-side (simpler,
   spoofable attribution) vs httpOnly + server read (needs a server action in the
   reservation submit path)?
10. **Payout / reward beyond discount** — is the referrer reward always a discount on their
    own booking, or is cash/credit payout ever in scope?
11. **Self-conversion for signups** — does a referred **signup** (no booking) ever count,
    or is a paid reservation always required?

---

## Size estimate

**XL.** Spans new schema (5 tables) + two new backend modules, edge/middleware routing, a
new attribution mechanism, admin config UI (settings + per-affiliate management), an
affiliate-facing dashboard, i18n, and — critically — it is **gated on two other large
workstreams** (server-side pricing engine + shared coupon/discount engine) that it cannot
correctly ship ahead of. The routing + schema + dashboard slice alone is ~L; the discount
application is what pushes it to XL because it must land on top of the pricing rework.
