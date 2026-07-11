# Feature: Site Copy / Text Update ("texte" from client)

## Status: waiting on copy from client

The actual new copy has not been provided yet. This is a skeleton so the mechanical
work can start the moment the text arrives. Do not invent or draft copy — scope, pages,
and wording all come from the client.

**Existing branches already exist for this work — reconcile before starting new work
(see Dependencies).**

## Context

### How copy flows through the app today

Copy lives in two places, and this split is the crux of the whole task:

1. **`messages/en.json` + `messages/ro.json`** — the intended home for all UI text.
   Both files are 746 lines and share an identical key structure (one is the RO
   translation of the other). Text is namespaced by page/feature; the current
   top-level namespaces are:

   - Page namespaces: `homepage`, `aboutPage`, `contactPage`, `reservationPage`
     (largest, ~6.2KB), `confirmationPage`, `transferPage`, `blogPage`, `blogDetail`,
     `carDetailPage`, `profile`
   - Component/feature namespaces: `common`, `navigation`, `footer`, `search`,
     `filters`, `features`, `testimonials`, `faq`, `vehicleCard`,
     `vehicleSpecifications`, `vehiclePricing`, `vehicleImageCarousel`,
     `pricingTiersTable`, `rentalDetails`, `vehicleSearchForm`, `vehicleListDisplay`

   Consumed via `next-intl`: `useTranslations(ns)` in client components,
   `getTranslations(ns)` in server components. Locale routing is `/[locale]/…`
   (ro default, en); admin routes have no locale and are not part of this copy update
   unless the client says otherwise.

2. **Hardcoded strings in component/page code** — a significant amount of user-facing
   text is NOT in the message files and would be missed by a naive JSON-only swap.
   Per the repo-root `AUDIT.md` i18n findings, hardcoded (mostly English) copy lives in:

   - **Entire transfers flow**: `app/[locale]/transfers/page.tsx`,
     `transfers/booking/page.tsx`, `transfers/vehicles/page.tsx`,
     `transfers/confirmation/[transferId]/page.tsx`, and transfer components
     (`transfer-search-form`, `transfer-vehicle-list`, `transfer-summary-card`,
     `mapbox-location-search`) — labels, toasts, "Missing Transfer Details" /
     "Transfer Not Found" screens
   - **Landing content baked into components**: `testimonials-with-marquee.tsx`
     (~160 lines of RO-only `DEFAULT_TESTIMONIALS`, actually rendered — EN visitors
     see Romanian), `faq.tsx` (dead EN `DEFAULT_CAR_RENTAL_FAQS` fallback)
   - **Legal pages**: `terms/page.tsx` and `privacy/page.tsx` serve hardcoded
     Romanian-only content under BOTH /ro and /en, while their `generateMetadata`
     advertises English titles — an EN meta title over an all-RO page
   - **Reservation flow**: hand-rolled RO/EN plural logic in `reservation/page.tsx`,
     mixed `t()` + hardcoded English in `user-reservations-table.tsx`, SCDW explainer
     in `additional-features-card.tsx`
   - **Misc**: `contact/page.tsx` toasts, `app/[locale]/error.tsx`,
     `blog-list-client.tsx` pluralization, `lib/reservation-utils.ts` (English strings)

   Interpolations already in use (must be preserved when copy is swapped):
   `{days}`, `{plural}`, `{count}`, `{price}`, `{currency}`, `{minDays}`,
   `{location}`, `{day}`, `{savings}`, `{lowestPrice}`. Note `{plural}` is a
   hand-rolled RO plural param, not proper ICU — new RO copy needs care here.

3. **SEO / structured-data text** — page titles, descriptions, and JSON-LD strings
   live in `lib/metadata.ts`, per-page `generateMetadata`, and JSON-LD blocks in
   layouts. Whether the copy update touches these depends on the client (see Open
   questions). Company identity strings (phone, email, address) are hardcoded in
   10+ places and already drifted (per AUDIT) — out of scope unless the client's
   copy changes them.

## Process (mechanical steps once copy arrives)

1. **Reconcile with the existing branches first** (see Dependencies) — decide whether
   to build on `mihaicrisan/rngo-1-replace-copy-on-the-website`, `codex/copy-update`,
   or start fresh from current `main`. Do not do this blind; confirm with the user
   which branch (if any) is the source of truth.
2. **Map each piece of client copy to its target** — page/section → message namespace
   key, or → the specific hardcoded location if it isn't in the JSON yet.
3. **Update both locales in lockstep** — every key changed in `messages/ro.json` must
   have its matching `messages/en.json` change (and vice versa). Keys must stay
   structurally identical across the two files.
4. **Preserve interpolations** — keep `{var}` placeholders intact; don't translate or
   drop them. Watch the hand-rolled `{plural}`/`{day}` RO patterns.
5. **Handle hardcoded strings** — if new copy targets a string that's currently
   hardcoded in a component, either (a) move it into the message files first
   (preferred, see Dependencies) then update, or (b) edit it in place if centralizing
   is out of scope for this pass. Flag which was chosen.
6. **Verify nothing is missed** — after the swap, grep the app for the old copy strings
   to confirm no stale duplicate remains hardcoded somewhere the JSON swap didn't reach.
7. **Verify build + render** — `npx tsc --noEmit` clean; spot-check each affected page
   in both /ro and /en for missing keys (next-intl throws/logs on missing keys) and
   layout overflow from longer strings.
8. **Sign-off** — client/user reviews rendered copy on both locales before merge.

## Dependencies

- **Overlaps with the audit-i18n plan (being written in parallel).** The i18n plan
  centralizes the hardcoded strings listed above into `messages/*.json`. Ideally that
  centralization lands FIRST so new copy has exactly one place to land (the JSON), and
  this task becomes a pure content swap rather than a mix of JSON edits and in-component
  edits. If the copy arrives before centralization, steps 5a/5b above decide per-string.
- **Two existing copy branches already exist and conflict** — must be reconciled:
  - `mihaicrisan/rngo-1-replace-copy-on-the-website` — commit `0a8ca3a` "replace copy
    across the site", newer (2026-05-15), NOT merged to main/develop. Touches
    `messages/en.json`, `messages/ro.json`, and adds large content to
    `terms/page.tsx` + `privacy/page.tsx`. Named after a Linear ticket (rngo-1), so
    likely the "official" branch.
  - `codex/copy-update` — commit `7247468` "Update site copy and translations", older
    (2026-02-03). Touches `about`, `cars`, `contact`, `home`, `terms`, `app/layout.tsx`
    + both message files. AI-agent branch (t3 checkpoints in history).
  - Both edit `messages/en.json`, `messages/ro.json`, and `terms/page.tsx` — they will
    conflict with each other and with any i18n-centralization work.
  - `origin/translations` — 0 commits ahead of main (already merged/superseded, ignore).
- Company-identity extraction (AUDIT dup finding) — only relevant if new copy changes
  phone/email/address; coordinate so it's changed in one place, not 10.

## Open questions (need answers from client / user before starting)

1. **Which pages/sections?** Full site, or a specific subset (e.g. homepage + about +
   legal only)?
2. **RO + EN both, or RO only?** Legal pages (terms/privacy) are currently RO-only even
   under /en — is EN copy being provided for those, or do they stay RO-only (and should
   the EN metadata be corrected)?
3. **Source of truth branch** — should we build on
   `mihaicrisan/rngo-1-replace-copy-on-the-website`, on `codex/copy-update`, or start
   fresh from `main`? These two need reconciling regardless.
4. **Format of delivery** — does the copy arrive as a doc (Google Doc / spreadsheet /
   Figma), or as a git branch/PR the client/another dev already pushed?
5. **Does it include SEO metadata + JSON-LD text?** (page titles, meta descriptions,
   structured-data strings in `lib/metadata.ts` and layouts.) Or UI copy only?
6. **Company identity** — does the new copy change phone / email / address / social
   URLs? (Currently hardcoded in 10+ drifted places.)
7. **Testimonials + FAQ content** — are these being rewritten too? (Currently baked
   into components, RO-only.)
8. **Who signs off** and on what surface (staging URL, both locales)?

## Size estimate: TBD

Cannot estimate until scope (pages, RO/EN, SEO in/out) and the branch-reconciliation
decision are known. Pure JSON swap of existing keys is small; a full-site swap that
also has to centralize the hardcoded transfers/legal/testimonials copy first is
substantially larger and couples to the i18n plan.
