# AI-Visibility / SEO Page Set

Feature plan for making RentNGo discoverable and recommendable by AI assistants
(ChatGPT, Claude, Perplexity, Google AI, etc.). Client ask (translated from
Romanian): *"so that AI models recommend us"*. Four deliverables:

1. `robots.txt` that explicitly welcomes AI crawlers.
2. A generated `/llms.txt` (and optionally `/llms-full.txt`).
3. A "local business" surface (interpretation clarified below).
4. A bilingual `/faq` page with `FAQPage` structured data.

---

## Context (current state)

### robots — `app/robots.ts:1-14`
Single wildcard rule: `userAgent: "*"`, `allow: "/"`, `disallow: ["/admin/", "/api/"]`,
sitemap `https://rngo.ro/sitemap.xml`. Nothing blocks AI crawlers today (the `*`
rule already permits them), but there is **no explicit signal** naming the AI
user-agents, which is what future-proofs intent and reads as "recommend us".

### sitemap — `app/sitemap.ts:1-163`
Dynamic. `createBilingualEntry(path, opts)` helper (`:8-44`) emits `/en` + `/ro`
entries with `alternates.languages`. Static entries for home/cars/transfers/blog/
about/contact/terms/privacy; dynamic entries for vehicles + blogs. **No `/faq`
entry yet.** Base `https://rngo.ro`. A new `/faq` route is one `createBilingualEntry("/faq", …)` line.

### JSON-LD (all emission sites) — hardcoded, drifted, no shared source
All JSON-LD is serialized through `jsonLdScriptContent()` (`lib/metadata.ts:96`,
XSS-safe) and injected via `<script type="application/ld+json">`. Business
identity fields are **copy-pasted inline in every file**:

| File:line | `@type` | Notable hardcoded fields |
|---|---|---|
| `app/[locale]/page.tsx:37-94` (`CarRentalSchema`) | `AutoRental` | name `Rent'n Go`, tel `+40-773-932-961`, email `office@rngo.ro`, airport PostalAddress `400397`, geo `46.7712/23.6236`, `openingHours 00:00-23:59`, priceRange `€€`, sameAs FB/IG/TikTok |
| `app/[locale]/about/layout.tsx:32-75` | `Organization` | same identity + `contactPoint`, `GeoCircle radius 50` |
| `app/[locale]/transfers/layout.tsx:33-114` | `Service` | provider Organization + `hasOfferCatalog` (3 transfer offers) |
| `app/[locale]/contact/layout.tsx:32-65` | `ContactPage`→`Organization` | tel/email/address, `openingHours`, two ContactPoints (no geo/sameAs here) |
| `app/[locale]/cars/[slug]/page.tsx:44-101` | `["Product","Car"]` | dynamic vehicle + hardcoded `AutoRental` seller |
| `app/[locale]/cars/[slug]/page.tsx:121-144` | `BreadcrumbList` | localized breadcrumbs |
| `components/features/blog/blog-structured-data.tsx:18-96` | `BlogPosting`+`BreadcrumbList` | Organization publisher |

Repeated literals: `+40-773-932-961`, `office@rngo.ro`, `https://rngo.ro`,
`https://rngo.ro/logo.png`, airport address + `400397`, geo `46.7712/23.6236`,
and the sameAs trio (FB `share/1Ad82uMtP3`, IG `rentn_go.ro`, TikTok `@rentn.go`).
Known drift (from AUDIT.md): transfer confirmation shows `contact@rngo.ro` vs
`office@rngo.ro` everywhere else. **No `lib/company.ts` exists** — the closest is
`lib/metadata.ts:3-10` (`BASE_URL`, `SITE_NAME`, `DEFAULT_OG_IMAGE`).

### i18n / routing mechanics (to mirror for `/faq`)
- `app/[locale]/layout.tsx`: `const locales = ["ro","en"]` (`:6`),
  `generateStaticParams` (`:8-10`), invalid locale → `notFound()`, `getMessages()`,
  wraps in `LocaleProviders` → `PublicLayout`. **`setRequestLocale` is not used
  anywhere**; pages `await params` then call `getTranslations({locale, namespace})`.
- `i18n.ts`: `getRequestConfig`, imports `./messages/${locale}.json`, tz `Europe/Bucharest`.
- `lib/metadata.ts:37` `buildMetadata({locale, path, title, description, keywords?, …})`
  takes `{ro,en}` LocalizedText, builds canonical + `alternates.languages`
  (ro-RO/en-US/x-default) + OG + twitter. This is the metadata entry point for any new page.
- Two page patterns exist: **layout-emits-schema + `"use client"` page** (about,
  transfers, contact) and **server `page.tsx` emits schema + delegates to
  `*-client.tsx`** (home, cars). Static content page `app/[locale]/terms/page.tsx`
  is a server component with hardcoded Romanian-only copy (not translated).

### messages — an `faq` namespace already exists
`messages/{en,ro}.json` share identical top-level namespaces. **`faq`
(`en.json:627-658`)** already holds `faq.questions.{0..6}.{question, answer}` — 7
generic Q&A (documents, min age, modify/cancel, fuel, additional driver, late
return, insurance). Consumed on the homepage by `FaqSection`
(`components/features/landing/faq.tsx`) via `useTranslations("faq")` in
`app/[locale]/home-page-client.tsx:85,427`. `faq.tsx` also has a dead English
fallback `DEFAULT_CAR_RENTAL_FAQS` (`:11-36`). **Reuse opportunity: the dedicated
`/faq` page can render the same `FaqSection` component.**

### Middleware — `/llms.txt` and `/faq` are safe
Middleware is **`proxy.ts`** (not `middleware.ts`). Matcher (`:64-71`) excludes
paths with common file extensions; more importantly the handler early-returns
`NextResponse.next()` when `pathname.includes('.')` (`:35`) — so any dotted path
skips the next-intl locale redirect. `/llms.txt` therefore resolves like the
existing `app/robots.ts` (`/robots.txt`) and `app/sitemap.ts` (`/sitemap.xml`)
top-level routes. `/faq` (no dot) goes through `intlMiddleware` and is redirected
to `/ro/faq` or `/en/faq` normally — exactly what we want.

---

## Requirements

- **R1 robots**: explicitly `allow: "/"` for the current AI crawler user-agents so
  intent is unambiguous; keep `/admin/` and `/api/` disallowed for all. Since the
  goal is *"models recommend us"*, allow both retrieval/search bots and training
  bots (no opt-out tokens). Stay on Next's typed `MetadataRoute.Robots`.
- **R2 llms.txt**: serve a spec-compliant Markdown `/llms.txt` (H1 = site name,
  first blockquote = one-sentence summary, then sections with links) describing the
  business, fleet, services, pricing model, locations. Generated from Convex fleet
  data + static company info. Optionally `/llms-full.txt` with inlined detail.
- **R3 local business**: enrich/centralize LocalBusiness structured data and/or a
  local landing page (scope clarified in Open questions), built on the audit's
  `lib/company.ts` + shared JSON-LD builders.
- **R4 FAQ page**: bilingual `/[locale]/faq` page, `FAQPage` JSON-LD, i18n via
  messages, sitemap entry, canonical + alternates. Question set drafted below,
  pending client approval.

---

## Design

### R1 — robots.ts (AI crawlers)

Current AI user-agents (verified July 2026 — see Sources). Two functional
classes, both allowed since the goal is inbound recommendation:

- **Retrieval / search** (feed cited AI answers): `OAI-SearchBot`, `ChatGPT-User`,
  `Claude-SearchBot`, `Claude-User`, `PerplexityBot`, `Perplexity-User`,
  `DuckAssistBot`, `Applebot`, `MistralAI-User`, `Google-Extended` is a *token*
  not a crawler — see note.
- **Training** (build model corpora): `GPTBot`, `ClaudeBot`, `CCBot`, `Amazonbot`,
  `meta-externalagent`, `Bytespider`.
- **Opt-out tokens** (`Google-Extended`, `Applebot-Extended`) gate *training* use
  by Google/Apple; since we are opting *in*, we simply do **not** disallow them
  (their default is allow). No need to name them unless we later want to restrict.

Shape the file as a list of rules — one entry per bot allowing `/` and disallowing
`/admin/` + `/api/`, plus the existing `*` catch-all. Define the agent list as a
`const AI_CRAWLERS: string[]` at the top so it is maintainable, then `.map()` into
rules. Keep the sitemap line. Result stays fully static (no Convex).

Rationale for naming them explicitly even though `*` already allows: it is the
documented pattern operators use to signal AI-friendliness, and it is resilient if
someone later tightens the `*` rule. Grouping many agents under one rule with
`userAgent: string[]` is valid in `MetadataRoute.Robots`, so this is compact.

### R2 — /llms.txt (+ optional /llms-full.txt)

New route `app/llms.txt/route.ts` — a `GET` Route Handler returning
`text/plain; charset=utf-8` Markdown. (Route Handler, not a `MetadataRoute`
convention file, because Next has no built-in llms.txt type.)

Spec-compliant skeleton (llmstxt.org):
```
# Rent'n Go — Car Rental & VIP Transfers Cluj-Napoca

> Airport-based car rental and private VIP/airport transfer service in
> Cluj-Napoca, Romania. Fleet rentals with tiered daily pricing, optional
> SCDW insurance, and 24/7 pickup at Cluj "Avram Iancu" International Airport.

Key facts: locations, languages (RO/EN), currency (EUR billed in RON), 24/7.

## Fleet
- [Fiat 500 — from €X/day](https://rngo.ro/en/cars/<slug>): class, fuel, transmission, seats
- … (generated from Convex vehicles)

## Services
- [Car rental](https://rngo.ro/en/cars): tiered daily rates, 200 km/day included…
- [VIP & airport transfers](https://rngo.ro/en/transfers): distance-priced…

## Pages
- [FAQ](https://rngo.ro/en/faq)
- [Contact](https://rngo.ro/en/contact)
- [Terms](https://rngo.ro/en/terms)
```

Data sourcing:
- Static business identity + pricing-model prose from the future `lib/company.ts`
  (Dependency D1). Until then, inline constants and reconcile later.
- Fleet list from Convex via `fetchQuery` (same pattern as `app/sitemap.ts:48-51`).
  Use a **slim projection** query, not `getAllVehicles` full docs — align with the
  audit's "slim slugs-only / projected query" remediation; if that query doesn't
  exist yet, reuse `getAllVehiclesWithClasses` and project in the handler.
- Language: produce **English** as the canonical llms.txt (AI models operate well
  in EN and it maximizes reach). Optionally add a Romanian section or a `/llms.txt`
  that lists both locale URLs. Decide in Open questions.
- Pricing: describe the **model** (tiered daily rate by rental length, seasonal
  multipliers, SCDW optional, 200 km/day, extra km €5/50km standard) rather than
  volatile exact totals; list per-vehicle "from €X/day" using the base tier.

`/llms-full.txt` (optional, `app/llms-full.txt/route.ts`): same generator with
inlined multi-line descriptions per vehicle + full services/FAQ text. Recommend
**deferring** unless the client wants it — llms.txt alone satisfies the ask.

Caching: set `export const revalidate = 3600` (or `dynamic = "force-static"` +
revalidate) so it is regenerated periodically, not per request.

### R3 — Local business page

This requirement is ambiguous; three plausible readings (see Open questions Q3):

- **(a) Structured-data enrichment (recommended, in-repo):** the homepage already
  emits `AutoRental` (`app/[locale]/page.tsx:37-94`). Consolidate all identity
  JSON-LD onto the audit's shared builders (`lib/company.ts` + schema factory),
  fix the `contact@`/`office@` drift, and ensure a complete `LocalBusiness`/
  `AutoRental` node with `address`, `geo`, `openingHoursSpecification`,
  `aggregateRating` (if we have reviews), `hasMap`, `priceRange`, `sameAs`. This is
  the highest-leverage AI-recommendation win and is mostly covered by the parallel
  audit-remediation plan — this plan should **consume** it, not duplicate it.
- **(b) A dedicated local landing page**, e.g. `/[locale]/inchirieri-auto-cluj`
  (or `/cluj-napoca`), with locality copy + `LocalBusiness` JSON-LD, targeting
  "car rental Cluj-Napoca". In-repo, mirrors the terms/about page pattern. Scope
  it only if the client confirms they want a new URL.
- **(c) Google Business Profile** — an off-repo marketing task (claim/verify the
  GBP listing). Likely what a non-technical client means by "local business page",
  but nothing to build here. Flag it as a handoff.

Plan default: do (a) as part of the JSON-LD centralization, list (b) as an
optional follow-up page, and record (c) as an off-repo recommendation.

### R4 — /faq page (bilingual + FAQPage JSON-LD)

Files:
- `app/[locale]/faq/page.tsx` — **server component** (needs `generateMetadata` +
  server-rendered JSON-LD for crawlers). `await params` → `getTranslations`.
- Reuse `components/features/landing/faq.tsx` `FaqSection` for the accordion UI
  (already themed, already used on homepage), passing items from messages.
- Metadata via `buildMetadata({ locale, path: "/faq", title, description })`
  (`lib/metadata.ts:37`) — gives canonical + ro/en alternates automatically.
- Emit `FAQPage` JSON-LD server-side using `jsonLdScriptContent()`:
  `{ "@context":"https://schema.org", "@type":"FAQPage", mainEntity: [{ "@type":"Question", name, acceptedAnswer:{ "@type":"Answer", text }}]}`,
  built by mapping over the localized question array. Answers must be **plain
  text** (schema.org expects text/simple HTML) — keep message strings plain.

i18n wiring:
- Extend messages. The existing `faq` namespace (7 generic Qs) is shared with the
  homepage teaser. Options: **(i)** grow `faq` to the full set and let the homepage
  show a subset, or **(ii)** add a dedicated `faqPage` namespace with `title`,
  `description`, `intro`, and `questions[]`. Recommend **(ii)** to decouple the
  homepage teaser from the full page and avoid regressing the landing section.
- Add both `messages/en.json` and `messages/ro.json` in lockstep (identical keys).

Sitemap: add `...createBilingualEntry("/faq", { changeFrequency: "monthly",
priority: 0.7 })` to `app/sitemap.ts`.

Nav: optionally add a footer link to `/faq` (footer namespace exists).

**Draft FAQ question set** (derived from real site facts in
`app/[locale]/terms/page.tsx` — **for client approval, not final copy**; note the
flagged age inconsistency):

1. What documents do I need to rent a car? *(ID/passport + driving licence held ≥2 years)*
2. What is the minimum age to rent? *(terms + `faq` say **23**; dead landing fallback says 21 — CONFIRM)*
3. Where can I pick up and drop off the car? *(Cluj "Avram Iancu" Airport, Traian Vuia 149-151, 400397; other locations for a delivery fee)*
4. Is there a security deposit? *(blocked €200–€1800 by card/cash by vehicle value, refunded on undamaged return)*
5. What does the SCDW insurance cover? *(reduces deposit to zero, exonerates liability except total-damage 1000–8000€ band, excludes tyres/undercarriage/fuel)*
6. What is the mileage policy? *(200 km/day avg; extra €5/50km standard & business, €8/50km premium)*
7. What is the fuel policy? *(full-to-full; refuel charge if returned with less)*
8. Can I drive the car abroad? *(allowed under conditions, territorial insurance fee per exit)*
9. How do I pay and in what currency? *(RON at BNR sell rate +1%; card or cash; deposit by card/cash)*
10. What is the minimum rental period? *(1 day; longer during holidays & Jun–Sep)*
11. How do the VIP/airport transfers work? *(airport/city/business transport in Cluj county, book by phone/SMS +40 773 932 961, distance-priced)*
12. What happens if I return the car late? *(>2h late → charged an extra day)*

---

## Implementation steps

1. **robots.ts** (`app/robots.ts`): add `AI_CRAWLERS` const + `.map()` allow rules,
   keep `*` + admin/api disallows + sitemap. Verify output at `/robots.txt` in dev.
2. **/faq page**:
   a. Add `faqPage` namespace (title/description/intro + `questions[]`) to
      `messages/en.json` and `messages/ro.json` with approved content.
   b. Create `app/[locale]/faq/page.tsx` (server): `generateMetadata` via
      `buildMetadata`, render `FaqSection` with items from translations, emit
      `FAQPage` JSON-LD via `jsonLdScriptContent`.
   c. Add `/faq` to `app/sitemap.ts`; optional footer link.
   d. `npx tsc --noEmit`; visit `/ro/faq` + `/en/faq`; validate JSON-LD (Rich
      Results Test / schema validator).
3. **/llms.txt** (`app/llms.txt/route.ts`): `GET` handler returning `text/plain`
   Markdown; fetch slim fleet list via `fetchQuery`; assemble spec-compliant
   sections from company constants; set `revalidate`. Verify `/llms.txt` renders
   and links resolve.
4. **Local business (R3)**: after D1 lands, point homepage/about/contact JSON-LD at
   the shared `LocalBusiness`/`AutoRental` builder, fix the email drift, and
   complete the node (openingHoursSpecification, hasMap, priceRange, sameAs).
   (Optional) scaffold a `/inchirieri-auto-cluj` landing page if client approves.
5. Update `CHANGELOG.md` + `prd.md` per CLAUDE.md workflow. Conventional-commit
   titles: `feat: welcome AI crawlers in robots.txt`, `feat: bilingual FAQ page
   with FAQPage schema`, `feat: add /llms.txt for AI discoverability`.

---

## Dependencies on other plans

- **D1 — audit JSON-LD remediation (parallel plan):** the `duplication` finding
  "Company identity data hardcoded in 10+ places" (AUDIT.md High) produces
  `lib/company.ts` constants + shared JSON-LD schema builders. R3 and R2 both want
  these as their single source of truth. **Sequencing:** robots.ts (R1) and the FAQ
  page (R4) are independent and can ship first. `/llms.txt` (R2) and the
  LocalBusiness centralization (R3) should ideally follow D1; if built before,
  inline constants and refactor onto `lib/company.ts` when it lands. Coordinate so
  we don't create an 11th copy of the identity data.
- Slim/projected Convex vehicle query: the audit's performance finding about
  `getAllVehicles` returning full docs recommends a slim slugs/projection query
  (`app/sitemap.ts` is a listed consumer). `/llms.txt` should consume that same
  slim query — align with whoever implements it.

---

## Open questions

1. **(R1) Training bots:** allow *all* AI crawlers including training (`GPTBot`,
   `ClaudeBot`, `CCBot`, `Bytespider`, etc.), or allow only retrieval/search bots
   (`OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot`, …) and stay out of model
   training corpora? "Recommend us" is best served by allowing both; confirm the
   client is comfortable with content being used for training too.
2. **(R2) llms.txt language & scope:** English-only canonical file, or include a
   Romanian section / dual-locale links? And do we want `/llms-full.txt` now or
   defer it?
3. **(R3) "local business page" meaning:** (a) richer LocalBusiness structured
   data only, (b) a new dedicated Cluj-Napoca landing page (needs a URL slug), or
   (c) a Google Business Profile task (off-repo)? Which does the client want?
4. **(R4) FAQ content ownership:** does the client supply the final question set,
   or approve/adjust the 12-question draft above? Final copy must be provided in
   **both** RO and EN.
5. **Age inconsistency to resolve before publishing:** terms + `faq` namespace say
   **minimum age 23**; the dead landing fallback says 21. Which is correct? (Also
   the "<25 surcharge" line in `en.json:635` — still accurate?)
6. **(R2/R3) exact pricing to expose:** OK to publish "from €X/day" per vehicle and
   the €5/€8-per-50km extra-km rates in llms.txt, or keep pricing model-only
   (no numbers) to avoid staleness?
7. **Sitemap/robots for the local landing page** (if R3b chosen): confirm slug so
   it can be added to `app/sitemap.ts`.

---

## Size estimate

| Piece | Effort | Notes |
|---|---|---|
| R1 robots AI crawlers | **XS** (~30 min) | one file, static, no deps |
| R4 FAQ page + JSON-LD + i18n + sitemap | **M** (~half day) | reuses `FaqSection` + `buildMetadata`; bulk is writing/translating 12 bilingual Q&A |
| R2 /llms.txt | **S–M** (~half day) | one route handler; +½ day if `/llms-full.txt` too; depends on slim fleet query |
| R3 LocalBusiness centralization | **S if riding on D1**, **M** standalone | mostly folded into audit remediation; +M if a dedicated landing page is approved |

**Overall: ~1.5–2 dev-days** for R1+R4+R2 assuming content is provided and D1
lands in parallel; R3's dedicated-page option adds ~0.5–1 day.

---

### Sources
- AI user-agents (2026): [No Hacks — AI User-Agent Landscape 2026](https://nohacks.co/blog/ai-user-agents-landscape-2026), [Momentic — Top AI Search Crawlers](https://momenticmarketing.com/blog/ai-search-crawlers-bots), [OpenShadow — AI Bot User Agents 2026](https://www.openshadow.io/guides/ai-bot-user-agents-2026)
- llms.txt spec: [llmstxt.org](https://llmstxt.org/), [llms.txt Complete 2026 Guide — LLM Pulse](https://llmpulse.ai/blog/llms-txt-guide/)
