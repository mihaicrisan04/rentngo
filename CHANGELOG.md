# Changelog

All notable changes to RentNGo are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
From v2.4.0 onward, version sections below the `[Unreleased]` heading are generated
automatically by [release-please](https://github.com/googleapis/release-please) from
[Conventional Commits](https://www.conventionalcommits.org/).

## [2.5.0](https://github.com/mihaicrisan04/rentngo/compare/rentngo-v2.4.0...rentngo-v2.5.0) (2026-10-17)


### Added

* add migrations for deprecated vehicle fields ([5aaee43](https://github.com/mihaicrisan04/rentngo/commit/5aaee43bd774058570e247a70aae43a0188a6910))
* add SEO-friendly vehicle slug URLs with real-time validation ([b04609c](https://github.com/mihaicrisan04/rentngo/commit/b04609c093469a8553fda4587d1e7b3463505626))
* add sticky booking card to transfer vehicle selection ([69106ec](https://github.com/mihaicrisan04/rentngo/commit/69106ecaa568f287ddd571c480fbe01f25bccb6b))
* add Terms & Privacy links to transfer booking page ([3d5e683](https://github.com/mihaicrisan04/rentngo/commit/3d5e683638a8d65e578034d755ecfc6f7a1b6c47))
* add transfer multiplier management UI to vehicle class page ([9366355](https://github.com/mihaicrisan04/rentngo/commit/93663555565a72e44e91ef484998e303d89bd134))
* add transfer vehicle seats configuration for accurate passenger filtering ([df89e6c](https://github.com/mihaicrisan04/rentngo/commit/df89e6cd01bd84ad06bf9f520ccc06aa159e8347))
* add vehicle details section to transfer confirmation emails ([52c9100](https://github.com/mihaicrisan04/rentngo/commit/52c9100220bf75d69a4edb72d40b93c97009e632))
* added a px-49 to the header and a mx-49 to the footer to be more central ([916ce71](https://github.com/mihaicrisan04/rentngo/commit/916ce71e1519631de7ebc7e2343409e1ec32f060))
* added engine capacity to the vehicle schema ([005ca07](https://github.com/mihaicrisan04/rentngo/commit/005ca0752552211187ae8eeb1187ae45bbe1d35e))
* **admin:** full-height table pages — fixed toolbars, scrolling table body ([#95](https://github.com/mihaicrisan04/rentngo/issues/95)) ([ce0a982](https://github.com/mihaicrisan04/rentngo/commit/ce0a9822303aa2143a33f7261ec73b409b4cc91c))
* **admin:** linear-style table ux ([#96](https://github.com/mihaicrisan04/rentngo/issues/96)) ([ef834ee](https://github.com/mihaicrisan04/rentngo/commit/ef834ee421536ac5b816499015304ff13eedea7c))
* **admin:** overview needs-attention row — upcoming, pending, recent ([#99](https://github.com/mihaicrisan04/rentngo/issues/99)) ([ed2e1c1](https://github.com/mihaicrisan04/rentngo/commit/ed2e1c14cf45d3fe204e7d71acff0d19188961f1))
* **admin:** polish set — undo toasts, optimistic updates, empty states ([#97](https://github.com/mihaicrisan04/rentngo/issues/97)) ([cbf5efb](https://github.com/mihaicrisan04/rentngo/commit/cbf5efba1df2c0fc9b0936b4c882d1c28741f136))
* **admin:** sticky table headers ([#100](https://github.com/mihaicrisan04/rentngo/issues/100)) ([d58d5ff](https://github.com/mihaicrisan04/rentngo/commit/d58d5ffdf8b8367a933ce0e5f16bb9840c7689bd))
* **admin:** viewport-locked shell with inset sidebar ([#93](https://github.com/mihaicrisan04/rentngo/issues/93)) ([12630b3](https://github.com/mihaicrisan04/rentngo/commit/12630b39f749311ee0d683b6b7542b8f1f39dd04))
* affiliate referral program with configurable tiers and consent-gated attribution ([#51](https://github.com/mihaicrisan04/rentngo/issues/51)) ([43a2ec7](https://github.com/mihaicrisan04/rentngo/commit/43a2ec78473f17a5d954e5f6954358b1468408d2))
* AI-crawler robots allows, llms.txt, bilingual FAQ page, company constants + LocalBusiness JSON-LD ([#48](https://github.com/mihaicrisan04/rentngo/issues/48)) ([96d7289](https://github.com/mihaicrisan04/rentngo/commit/96d7289b58f3ab0f0a845911546b946c6ec85b16))
* **app:** enable Instant Navigations — cacheComponents + partialPrefetching (RNGO-35) ([3836e7b](https://github.com/mihaicrisan04/rentngo/commit/3836e7b91ceef64f93a48373c239d7ae5d9b85d8))
* **app:** enable Instant Navigations (cacheComponents + partialPrefetching) ([e7e7a3c](https://github.com/mihaicrisan04/rentngo/commit/e7e7a3cefd95fb5fddbeea7faef8a590b9dbaacc))
* card design work in progress ([c4ad9db](https://github.com/mihaicrisan04/rentngo/commit/c4ad9db27a92411eb55117d156c7ebfc4ef93ff1))
* **cars:** "from X €" badge on car cards without dates ([#122](https://github.com/mihaicrisan04/rentngo/issues/122)) ([207f147](https://github.com/mihaicrisan04/rentngo/commit/207f147a08fad115336f8143934dc8499b5904ca))
* change the form a little and added a website icon ([3400808](https://github.com/mihaicrisan04/rentngo/commit/3400808b1e7e35ae4ccbe6f6e99f7e4001119fc7))
* change the selector for the locations to be more efficient and useable by utilizing the command ([fc5d061](https://github.com/mihaicrisan04/rentngo/commit/fc5d061e42af0372dc501abc97849f562f184f78))
* **contact:** always-visible quick contact bubbles ([#117](https://github.com/mihaicrisan04/rentngo/issues/117)) ([5ae4a0f](https://github.com/mihaicrisan04/rentngo/commit/5ae4a0f57359791528fd66f5c957dd3dce2644e4))
* **convex:** scheduled gc for orphaned storage files ([#76](https://github.com/mihaicrisan04/rentngo/issues/76)) ([0223a66](https://github.com/mihaicrisan04/rentngo/commit/0223a6662cd7254fa74cdcb5ba4c224e1f8072da))
* coupon codes with server-side validation and atomic redemption ([#50](https://github.com/mihaicrisan04/rentngo/issues/50)) ([4b9f1b0](https://github.com/mihaicrisan04/rentngo/commit/4b9f1b083072115a1651da91d2efba5ce03eea0a))
* english terms page and ANPC badges in the footer ([#133](https://github.com/mihaicrisan04/rentngo/issues/133)) ([e6d96a3](https://github.com/mihaicrisan04/rentngo/commit/e6d96a34b7f67cb268f08c478b0838ec5a995898))
* finish localization and secure transfer bookings ([#70](https://github.com/mihaicrisan04/rentngo/issues/70)) ([11415b5](https://github.com/mihaicrisan04/rentngo/commit/11415b513caf9ad382213518031a4fb0b95dde30))
* implement sequential calendar flow and default times ([b0067d2](https://github.com/mihaicrisan04/rentngo/commit/b0067d234cf99318423b5ddba2c4abac43c1f17e))
* implement tiered transfer pricing system ([5786bee](https://github.com/mihaicrisan04/rentngo/commit/5786beefd3a5cb9b70c2ad43ebec6efc1fd5b947))
* noindex non-production deployments and env-driven email differentiation ([f592196](https://github.com/mihaicrisan04/rentngo/commit/f59219646c1888dd6496750df4c1056d5f0208b3))
* **referral:** admin approvals queue, history, wallet top-ups (RNGO-55) ([#115](https://github.com/mihaicrisan04/rentngo/issues/115)) ([22c9e6b](https://github.com/mihaicrisan04/rentngo/commit/22c9e6b7baf590dea17293c6360358a7f4301c01))
* **referral:** first-rental-only discount, typed codes, self-service enrolment (RNGO-54) ([#114](https://github.com/mihaicrisan04/rentngo/issues/114)) ([71f2687](https://github.com/mihaicrisan04/rentngo/commit/71f2687923ce7b6cb42803382ca9b03408a6a553))
* **referral:** mint wallet credit on admin-approved conversions (RNGO-52) ([#113](https://github.com/mihaicrisan04/rentngo/issues/113)) ([50b4e23](https://github.com/mihaicrisan04/rentngo/commit/50b4e23c204e0a6b1892512d782f1e9c97f0cd03))
* **referral:** redeem wallet credit at checkout (RNGO-53) ([#112](https://github.com/mihaicrisan04/rentngo/issues/112)) ([8d9c952](https://github.com/mihaicrisan04/rentngo/commit/8d9c952b04a8ff6525d3de5eb26f8fcaede1909f))
* **referral:** wallet and sharing on the profile, referral block in emails (RNGO-56) ([#116](https://github.com/mihaicrisan04/rentngo/issues/116)) ([cc8f7e0](https://github.com/mihaicrisan04/rentngo/commit/cc8f7e05840c46ba1d3de302fc87c517ce6aa668))
* **referral:** wallet schema, credit math and widen migration (RNGO-51) ([#111](https://github.com/mihaicrisan04/rentngo/issues/111)) ([fc53872](https://github.com/mihaicrisan04/rentngo/commit/fc53872b16d9b6b25e48a39bccf060d673665ce8))
* replace hardcoded admin IDs with Clerk role-based auth ([bd7b396](https://github.com/mihaicrisan04/rentngo/commit/bd7b39676f95361002ec6c3aa13f006df1e60a3e))
* **seo:** localized fleet URLs ([#120](https://github.com/mihaicrisan04/rentngo/issues/120)) ([4477487](https://github.com/mihaicrisan04/rentngo/commit/4477487d2545fb39482d1b6437e8e38c21b0aae6))
* server-authoritative pricing engine with shared lib/pricing module ([#45](https://github.com/mihaicrisan04/rentngo/issues/45)) ([d591cd7](https://github.com/mihaicrisan04/rentngo/commit/d591cd7cb583e67cb5624667bdf6f668c03b6179))
* show included + extra km in reservation emails, localized SCDW label ([#46](https://github.com/mihaicrisan04/rentngo/issues/46)) ([d3db19e](https://github.com/mihaicrisan04/rentngo/commit/d3db19ed2aa4533339dcb749dfacf0d7eff6f4b5))
* **testimonials:** google rating, reviews link, drop stock testimonials ([#118](https://github.com/mihaicrisan04/rentngo/issues/118)) ([346edc8](https://github.com/mihaicrisan04/rentngo/commit/346edc8d97af5c6cbc6c14ed84ae23afb8dec20f))


### Fixed

* added engine details in the vehicle card component ([b7e83b2](https://github.com/mihaicrisan04/rentngo/commit/b7e83b24b1edcd71ec60f45a8d142d1e303579f3))
* admin ordering crash, datetime picker state bleed, mapbox coord fabrication, localized nav ([#43](https://github.com/mihaicrisan04/rentngo/issues/43)) ([3d3f1ce](https://github.com/mihaicrisan04/rentngo/commit/3d3f1ce730022f498191c69db3359646fb88d6ee))
* **admin:** full-height blogs table, truncated titles, sticky actions ([#102](https://github.com/mihaicrisan04/rentngo/issues/102)) ([5aa6ef3](https://github.com/mihaicrisan04/rentngo/commit/5aa6ef34a4747ba06a5cc8dac3d75a44126205d3))
* bump next + react (May 2026 security release) ([#57](https://github.com/mihaicrisan04/rentngo/issues/57)) ([827ca36](https://github.com/mihaicrisan04/rentngo/commit/827ca3680dc5f5eabc7bd899d362d50f4c28ee62))
* correct typo in reservation-email-dialog filename ([39b579c](https://github.com/mihaicrisan04/rentngo/commit/39b579cfdbb4a044962859a433f06b8d30b3701a))
* **deps:** next 16.4 and react 19.3 for the next.js security advisories ([#126](https://github.com/mihaicrisan04/rentngo/issues/126)) ([fc3ee92](https://github.com/mihaicrisan04/rentngo/commit/fc3ee926a1127f77d7351a68bea3c0dc7711f9a1))
* drop --webpack from mise dev:frontend task ([#64](https://github.com/mihaicrisan04/rentngo/issues/64)) ([d303ab4](https://github.com/mihaicrisan04/rentngo/commit/d303ab46da37c2049b05e85a4984cbc2b914d186))
* fix type compatibility for te vehicles from the ui ([351abf7](https://github.com/mihaicrisan04/rentngo/commit/351abf7f026819381829a6a17edd77faf3e5813b))
* image previews ([3ab7140](https://github.com/mihaicrisan04/rentngo/commit/3ab7140218bc8c70c72f3613796fd730b5137416))
* image uploads via Convex upload URLs instead of bytes through action args ([#42](https://github.com/mihaicrisan04/rentngo/issues/42)) ([09f3cdc](https://github.com/mihaicrisan04/rentngo/commit/09f3cdc615e5e5a1eb039170428bf0d33d6054aa))
* **mobile:** 3 contact bubbles bottom-right, no sideways scroll, drop stale search dates ([#124](https://github.com/mihaicrisan04/rentngo/issues/124)) ([0d111f2](https://github.com/mihaicrisan04/rentngo/commit/0d111f2e3146f257f63e5765ff64037f9451f380))
* petrol/benzina validator mismatch + refactor: shared Convex validators ([#89](https://github.com/mihaicrisan04/rentngo/issues/89)) ([9268ff6](https://github.com/mihaicrisan04/rentngo/commit/9268ff691e6b98c65570b20adb57def7c2cf3afb))
* profile, footer and faq UI polish ([#52](https://github.com/mihaicrisan04/rentngo/issues/52)) ([fb6c34e](https://github.com/mihaicrisan04/rentngo/commit/fb6c34ec99b7b6b1cc20817c83e0bd1605740bb1))
* **referral:** discount the rental price only, not SCDW and add-ons ([#119](https://github.com/mihaicrisan04/rentngo/issues/119)) ([541f676](https://github.com/mihaicrisan04/rentngo/commit/541f6764287c0d4ed18d7cb6b5873ed83a6733ba))
* require admin auth on Convex writes, booking ownership checks, PII query auth ([#41](https://github.com/mihaicrisan04/rentngo/issues/41)) ([59943c3](https://github.com/mihaicrisan04/rentngo/commit/59943c34c4ffd35b750c9c2ff41d4f0a0a3b9601))
* **seo:** clean up the urls search console flags as unindexable ([#121](https://github.com/mihaicrisan04/rentngo/issues/121)) ([4ed9778](https://github.com/mihaicrisan04/rentngo/commit/4ed9778faeaef5b2fc45ecf3deef7cdce20543c8))
* **seo:** single-hop redirects for the old /cars urls ([#123](https://github.com/mihaicrisan04/rentngo/issues/123)) ([1f19ea9](https://github.com/mihaicrisan04/rentngo/commit/1f19ea9732f35611690311f20a14b6db2a360dd2))
* show admin edits on cached public pages (cars, homepage, blog) ([#125](https://github.com/mihaicrisan04/rentngo/issues/125)) ([39fdddc](https://github.com/mihaicrisan04/rentngo/commit/39fdddc30ee79fa366336a7f8910dd1f2ed7db41))
* sitemap base url fix from .com to .ro ([8fb5f8e](https://github.com/mihaicrisan04/rentngo/commit/8fb5f8e2de59b020058283e5bc1979553123b6c8))
* sitemap base url fix from .com to .ro ([bce70ff](https://github.com/mihaicrisan04/rentngo/commit/bce70fffc0295983a86de791c8c5fa0634ef995c))
* store reservation vehicle id in localStorage, not the url ([#54](https://github.com/mihaicrisan04/rentngo/issues/54)) ([528b81a](https://github.com/mihaicrisan04/rentngo/commit/528b81a0f063a21d4cced66008aa418315727f15))
* support-email drift + locale-losing profile nav ([#84](https://github.com/mihaicrisan04/rentngo/issues/84)) ([4f09bd6](https://github.com/mihaicrisan04/rentngo/commit/4f09bd6fd9b3c83a4a9d8b090d192eb2cc3ae383))
* sync clerk users to convex via webhooks ([#66](https://github.com/mihaicrisan04/rentngo/issues/66)) ([bda7465](https://github.com/mihaicrisan04/rentngo/commit/bda746593b8bf9b1bcac75c1b10845c2478023d5))
* **ui:** defer render-time new Date() in booking widgets to post-hydration ([47c00d2](https://github.com/mihaicrisan04/rentngo/commit/47c00d24466c454b8972b0461b1adc75b15fc32c))
* **ui:** lint-clean useToday via useSyncExternalStore + justified purity disable ([09f08f9](https://github.com/mihaicrisan04/rentngo/commit/09f08f935fee49066d3f44836ff0495dc24483db))
* undefined index for car classes ([b23d5a1](https://github.com/mihaicrisan04/rentngo/commit/b23d5a138e34b8dce175cc886f7376e34105cb65))
* undefined index for car classes ([2ec2a4d](https://github.com/mihaicrisan04/rentngo/commit/2ec2a4dc66c72150eff8e17294b15a5e9cc66d68))
* upgrade Next.js to 15.5.7 for CVE-2025-66478 security patch ([7f29c73](https://github.com/mihaicrisan04/rentngo/commit/7f29c73b2d11d72203b83bf329253e62a0f2b252))
* url-encode order_by param in clerk backfill action ([#67](https://github.com/mihaicrisan04/rentngo/issues/67)) ([d3fa07e](https://github.com/mihaicrisan04/rentngo/commit/d3fa07eca3dae51d6c46e1faa94a9dde8d469f16))
* **webhooks:** svix 2.8 without breaking clerk user sync ([#127](https://github.com/mihaicrisan04/rentngo/issues/127)) ([6ab3e78](https://github.com/mihaicrisan04/rentngo/commit/6ab3e78a6820a161b5c6b19b34e4ca11fb329357))


### Performance

* **admin:** bound dashboard statistics ([32bfaf8](https://github.com/mihaicrisan04/rentngo/commit/32bfaf80333bf0bf903ddd08d5744cb6b9ec4a54))
* **admin:** bound dashboard statistics ([b1cdd6f](https://github.com/mihaicrisan04/rentngo/commit/b1cdd6f48482c287773946b1b50542251c37e934))
* **admin:** paginate booking lists ([b57b1c8](https://github.com/mihaicrisan04/rentngo/commit/b57b1c86cb4a95059fbae308f749ff6c58d60f1b))
* **admin:** paginate booking lists ([8eecf56](https://github.com/mihaicrisan04/rentngo/commit/8eecf56f64b2942c3b5ed26314e81d0826ac0138))
* **bookings:** allocate numbers with counters ([6096c0a](https://github.com/mihaicrisan04/rentngo/commit/6096c0a99bdbe4a11ca94714d2238a2132372418))
* **bookings:** allocate numbers with counters ([70ad48b](https://github.com/mihaicrisan04/rentngo/commit/70ad48b7d8bdbc16e33b7043bb59657904cfbc71))
* **convex:** index blog and vehicle queries ([16eb367](https://github.com/mihaicrisan04/rentngo/commit/16eb3673a6066aa22e6a3744df8b309e4d1439cc))
* **convex:** index blog and vehicle queries ([24d9e8b](https://github.com/mihaicrisan04/rentngo/commit/24d9e8b2fc0c8c37f7a0fa7ca523a1875b59e915))
* **convex:** maintained aggregates for all-time dashboard totals ([#78](https://github.com/mihaicrisan04/rentngo/issues/78)) ([dd6fc55](https://github.com/mihaicrisan04/rentngo/commit/dd6fc55443fb21670b3dd4b09afd43b1fa49e4ce))
* restore static rendering, code-split mapbox, optimize LCP images ([#47](https://github.com/mihaicrisan04/rentngo/issues/47)) ([b13f9c0](https://github.com/mihaicrisan04/rentngo/commit/b13f9c072aab5e87b42df44f8bb8e7e8da3de7e3))
* switch dev server to turbopack ([#63](https://github.com/mihaicrisan04/rentngo/issues/63)) ([1cbe25f](https://github.com/mihaicrisan04/rentngo/commit/1cbe25f2b550d7198c05fd78336d1b045b3ff60d))


### Changed

* admin UI dedup — pricing fields, dashboard cards, breadcrumbs ([#92](https://github.com/mihaicrisan04/rentngo/issues/92)) ([4dae8c9](https://github.com/mihaicrisan04/rentngo/commit/4dae8c981aeb1ac5c4b998bdb19a7413fa2a285a))
* **admin:** make tables the visual focus ([#98](https://github.com/mihaicrisan04/rentngo/issues/98)) ([bbc030e](https://github.com/mihaicrisan04/rentngo/commit/bbc030e77ed977fe9b92a0b299bbd872ef57c907))
* **admin:** shared season form + thin dialog wrappers ([#77](https://github.com/mihaicrisan04/rentngo/issues/77)) ([de9d803](https://github.com/mihaicrisan04/rentngo/commit/de9d8037739251e35f09e4f1396f8d8e22928f45))
* consolidate translation files and remove unused keys ([1539485](https://github.com/mihaicrisan04/rentngo/commit/153948583a7406f2f04c6ece8899f2a3d3e0675c))
* convert file names to kebab-case ([1ca0ead](https://github.com/mihaicrisan04/rentngo/commit/1ca0ead0e6d582f96861a0c623d1b544bd72fa0f))
* createLocalStorage factory + shared search defaults ([#85](https://github.com/mihaicrisan04/rentngo/issues/85)) ([96ef68c](https://github.com/mihaicrisan04/rentngo/commit/96ef68c4c56daeab43487ffe8234e34d3a8abfea))
* decompose reservation page onto shared pricing module + persisted confirmation ([#49](https://github.com/mihaicrisan04/rentngo/issues/49)) ([1be3b3e](https://github.com/mihaicrisan04/rentngo/commit/1be3b3e21627eea0391c26d3ef5932576e4dfca1))
* finish company-identity migration onto lib/company.ts ([#88](https://github.com/mihaicrisan04/rentngo/issues/88)) ([c280aba](https://github.com/mihaicrisan04/rentngo/commit/c280aba7e3e51485b5f00e633ff994eeabff5b03))
* parameterize vehicle filters by category config ([#86](https://github.com/mihaicrisan04/rentngo/issues/86)) ([e7f224f](https://github.com/mihaicrisan04/rentngo/commit/e7f224f979e8d0cc1f7ec8cec31006564cc3a18f))
* remove dead code and unused dependencies ([#44](https://github.com/mihaicrisan04/rentngo/issues/44)) ([9c81317](https://github.com/mihaicrisan04/rentngo/commit/9c81317e10d1bba190d749d935ca055e238513c5))
* remove deprecated field usage and dead code ([c1d1a42](https://github.com/mihaicrisan04/rentngo/commit/c1d1a42a1e14bd1d56daceec17e5d125599d3abe))
* rename vehicle classes admin section ([8de6a2e](https://github.com/mihaicrisan04/rentngo/commit/8de6a2eb2f5766df1b233fe773e308488a5ac7c1))
* restructure components directory to feature-based organization ([85704be](https://github.com/mihaicrisan04/rentngo/commit/85704bef971487f743c4229b5772de6f3ae1537c))
* shared StatusBadge + formatting helpers ([#91](https://github.com/mihaicrisan04/rentngo/issues/91)) ([1335cf6](https://github.com/mihaicrisan04/rentngo/commit/1335cf62b1cf9ad8a2d11c347bf17fb498c4144b))
* transfer + car-detail storage-lifecycle dedup ([#87](https://github.com/mihaicrisan04/rentngo/issues/87)) ([b20b0cc](https://github.com/mihaicrisan04/rentngo/commit/b20b0cce0a1340f13e5e6be8431bb255acab82bc))
* type-safety + component leftovers ([#90](https://github.com/mihaicrisan04/rentngo/issues/90)) ([498089f](https://github.com/mihaicrisan04/rentngo/commit/498089f51ef510e5f53ff0b2df8ca84af6cb745f))
* uniform layout for reservation, car detail and transfers pages ([#53](https://github.com/mihaicrisan04/rentngo/issues/53)) ([d4f77f6](https://github.com/mihaicrisan04/rentngo/commit/d4f77f6bdfb2291a947757d024f721ab5e9cbc9c))

## [Unreleased]

### Fixed
- Clerk→Convex user sync (RNGO-32): users are now synced server-side via Clerk webhooks (`POST /webhooks/clerk` Convex HTTP action, Svix-verified) handling `user.created`/`user.updated`/`user.deleted`, with an idempotent `getOrCreateCurrentUser` safety net in renter-facing booking mutations; `user.deleted` and self-serve account removal soft-delete + anonymize the row (`deletedAt` + PII scrub) so booking references stay valid; client-side `UserEnsurer`/`ensureUser` removed; one-off Clerk backfill action added (`migrations/backfillClerkUsers`). Awaiting deploy + Clerk dashboard/webhook-secret config.

### Infrastructure
- Dev environment: `develop` branch now deploys to a dedicated Convex deployment (`develop`, same project) and is served at dev.rngo.ro; upgraded `convex` to 1.42.1 and `@convex-dev/resend` to 0.2.5
- Non-production deployments are excluded from search indexing (robots.txt + noindex meta), and dev emails are visibly differentiated (env-driven sender name, `[DEV]` subject prefix, site-URL-aware logo)

## [2.4.0] - 2026-06-02

### Added
- **Google Tag Manager**: wired in root layout via `@next/third-parties/google` `GoogleTagManager`, configured by `NEXT_PUBLIC_GTM_ID`
  - Only renders when env var is set
  - Direct Google Ads gtag removed from `app/layout.tsx` — Ads conversions are now configured as a tag inside the GTM container (`NEXT_PUBLIC_GOOGLE_ADS_ID` no longer used by app code)

- **Bilingual blog support**: blogs now have separate Romanian and English content
  - Schema: `title_ro/en`, `description_ro/en`, `content_ro/en`, `readingTime_ro/en`
  - Public queries accept `locale` arg, return locale-resolved fields
  - Admin queries return both language variants for editing
  - Admin create/edit dialogs have RO/EN content tabs
  - Preview tab has locale toggle
  - Static generation and sitemap work with locale-aware queries
  - Migration script: `npx convex run migrations/bilingualBlogs`


- **SEO overhaul**: comprehensive SEO improvements following Next.js best practices
  - Created shared `buildMetadata()` helper (`lib/metadata.ts`) eliminating duplicated metadata across all pages
  - Added `jsonLdScriptContent()` utility with XSS escaping for all JSON-LD structured data
  - Dynamic `<html lang>` attribute based on locale (was hardcoded to "ro")
  - Added `x-default` hreflang to all page alternates
  - Moved JSON-LD structured data from client components to server-rendered layouts (transfers, contact, about)
  - Added `generateStaticParams` for car detail and blog detail pages
  - Added breadcrumb JSON-LD schema for car detail pages
  - Added `noindex` metadata for transactional pages (reservation, profile)
  - Fixed blog `keywords` type (was string, now string[])

- **Barrel import optimization**: Added `optimizePackageImports` to next.config.ts
  - Configured for `lucide-react` (80 files) and `date-fns` (8 files)
  - Reduces cold start by 200-800ms, speeds up dev server boot
  - Automatically transforms barrel imports to direct imports at build time

- **Dynamic import admin dialogs**: Converted 10 admin dialogs to lazy-load with `next/dynamic`
  - CreateVehicleDialog, EditVehicleDialog
  - CreateBlogDialog, EditBlogDialog
  - CreateReservationDialog, EditReservationDialog, ReservationEmailDialog
  - CreateSeasonDialog, EditSeasonDialog
  - TransferPricingDialog, CreateClassDialog
  - Dialogs now load on-demand when opened, reducing initial page bundle

- **Memoize expensive components**: Applied React.memo() and useMemo() optimizations
  - Components wrapped with React.memo(): VehicleCard, TransferVehicleCard, BlogCard, FilterCheckboxItem, VehiclePricingCard, TransferBookingFloatingCard
  - Calculations memoized with useMemo(): pricing tip in VehiclePricingCard, vehicle grouping in VehicleListDisplay, reservation pricing hook, pagination in UserReservationsTable, featured vehicles hook
  - Prevents unnecessary re-renders in list-rendered components and expensive calculations

## [2.3.0] - 2026-01-20

### Added
- **Transfer vehicle seats configuration**: Added `transferSeats` field for accurate passenger capacity filtering
  - New `transferSeats` field on vehicles schema (optional number)
  - Field only visible in admin when "Is Transfer Vehicle" is checked
  - Filtering logic: uses `transferSeats` if set, otherwise falls back to `seats - 2`
  - Transfer vehicle cards and emails show `transferSeats ?? seats`
  - Admin dialogs show regular seats value as placeholder for reference

### Changed
- Transfer vehicle filtering now uses effective capacity (`transferSeats ?? (seats - 2)`) instead of adding +2 buffer
- Transfer confirmation emails pass effective seats for vehicle info section
- Transfer vehicle list component now passes `transferSeats` to vehicle cards

### Fixed
- Removed cursor-pointer from terms acceptance text on transfer booking page (only checkbox and links are clickable)

## [2.2.0] - 2026-01-20

### Added
- **Transfer booking Terms & Privacy links**: Added links to Terms & Conditions and Privacy Policy
  - Links open in new tab with proper `rel="noopener noreferrer"`
  - Locale-based translations (Romanian/English)
  - Styling matches the reservation page implementation
  - Added border-top separator for visual distinction from payment methods

## [2.1.0] - 2026-01-20

### Added
- **Transfer email vehicle details**: Added full vehicle information to transfer confirmation emails
  - Extended `TransferVehicleInfo` type with type, seats, transmission, fuelType
  - Reused `VehicleInfoSection` component from reservation emails
  - Both user and admin transfer emails now display vehicle details
  - Includes Romanian and English translations for vehicle section labels

## [2.0.0] - 2026-01-20

### Added
- **Vehicle class transfer multiplier UI**: Admin can now edit transfer multiplier per class
  - Added "Transfer Pricing" section to class detail page (`/admin/vehicles/classes/[classId]`)
  - Includes Base Fare and Rate Multiplier fields with inline editing
  - Separated pricing settings into "Rental Pricing" and "Transfer Pricing" sections

### Changed
- Class detail page pricing UI reorganized for better clarity
  - "Rental Pricing" section: Extra 50km Price
  - "Transfer Pricing" section: Base Fare, Rate Multiplier

## [1.9.0] - 2026-01-20

### Added
- **Vehicle slug URLs**: SEO-friendly car detail page URLs
  - Added `slug` field to vehicles schema with unique index
  - Car detail pages now use `/cars/[slug]` instead of `/cars/[id]`
  - Admin dialogs include slug input with auto-generate button (sparkle icon)
  - Slug format: `{make}-{model}-{year}` (e.g., `bmw-x5-2024`)
  - Added `getBySlug` query with uniqueness validation
  - Added `generateVehicleSlug()` and `validateVehicleSlug()` utilities

### Changed
- Vehicle cards now link to slug-based URLs (falls back to `_id` for backwards compatibility)
- Reservation page back button uses slug-based URL
- Sitemap generates slug-based URLs for vehicles

## [1.8.1] - 2026-01-20

### Removed
- **Email components consolidation**: Removed unused legacy email system
  - Deleted `components/shared/email/` directory (10 files) - legacy code from before Convex migration
  - Deleted deprecated `/api/send/request-confirmation` route (only consumer of shared/email)
  - Production email system lives in `convex/emails/` (self-contained with 4 templates and 8 components)
  - Kept `/api/send/reservation-email` route (used by admin for manual resends, has inline HTML)

## [1.8.0] - 2026-01-20

### Changed
- **Component directory restructuring**: Reorganized ~130 components from type-based to feature-based structure
  - Created `shared/` directory with `auth/`, `search-filters/`, `providers/`, `navigation/`
  - Created `features/` directory with `vehicles/`, `reservations/`, `transfers/`, `blog/`, `landing/`
  - Reorganized `admin/` into resource-based subdirectories: `vehicles/`, `reservations/`, `transfers/`, `vehicle-classes/`, `seasons/`, `blog/`
  - Moved 14 scattered top-level components to proper locations
  - Added barrel exports (index.ts) for cleaner imports
  - Updated all import paths across the codebase

## [1.7.0] - 2026-01-19

### Removed
- `payments` table from schema (never implemented)
- `vehicles.class` field (replaced by `classId`)
- `vehicles.pricePerDay` field (replaced by `pricingTiers`)
- `by_class` index from vehicles table
- `hooks/useSeasonalPricing.ts` (replaced by `useDateBasedSeasonalPricing`)
- `VehicleClass` type export from `types/vehicle.ts`
- ~20 lines of TODO comments from `convex/reservations.ts`
- Legacy `pricePerDay` fallbacks from pricing utilities

### Added
- `convex/migrations/clearDeprecatedClassField.ts` - Migration to clear deprecated class field
- `convex/migrations/clearDeprecatedPricePerDay.ts` - Migration to clear deprecated pricePerDay field

### Changed
- Admin vehicle dialogs now use `useDateBasedSeasonalPricing` hook
- `vehicles-table.tsx` now looks up class name via `classId` reference
- Pricing logic in `types/vehicle.ts` now requires `pricingTiers` (no fallback)
- Transfer page titles: removed "VIP" keyword from translations (en/ro)

## [1.6.0] - 2026-01-19

### Removed
- 19 unused component files (~2,500 lines of code):
  - Vehicle: `edit-vehicle-form`, `create-vehicle-form`, `vehicle-image-carrousel` (typo), 4 skeletons
  - UI (shadcn): `input-otp`, `navigation-menu`, `display-cards`, `slideshow`, `collapsible`, `drawer`, `progressive-blur`
  - Admin: `team-switcher`, `nav-projects`
  - Top-level: `location-search-input`, `rental-details-skeleton`, `login-form`

### Changed
- Updated `components/vehicle/index.ts` to remove stale exports

## [1.5.0] - 2026-01-19

### Added
- Sticky glassmorphic booking card on transfer vehicle selection page
- Card uses CSS `position: sticky` to stay at bottom while scrolling
- `TransferBookingFloatingCard` component with glass effect styling
- `onVehiclesLoaded` callback to `TransferVehicleList` component

### Changed
- Transfer vehicle selection page uses full-width vehicle grid
- Continue button always visible via sticky card at bottom of container

## [1.4.0] - 2026-01-19

### Changed
- Renamed admin vehicle classes section from "ordering" to "classes"
- Button: "Manage Ordering" → "Manage Classes"
- Page title: "Class Ordering" → "Vehicle Classes"
- URL: `/admin/vehicles/ordering` → `/admin/vehicles/classes`

## [1.3.0] - 2026-01-19

### Added
- Tiered transfer pricing system with admin-configurable km ranges
- Transfer base fare per vehicle class
- Transfer pricing tiers management in admin panel

### Changed
- Transfer pricing now uses: `base_fare + (extra_km × tier_price × class_multiplier)`
- Simplified client-facing transfer pricing display (distance + total only)

## [1.2.0] - 2026-01-18

### Added
- Sequential calendar flow: return date calendar auto-opens after selecting pickup date

### Changed
- Applied sequential calendar behavior to all reservation pages

## [1.1.0] - 2026-01-18

### Changed
- Default pickup and return time set to 10:00

## [1.0.0] - 2026-01-18

### Added
- Initial PRD documentation
- Vehicle reservations with tiered pricing
- VIP transfer booking with Mapbox integration
- Seasonal pricing system
- Admin dashboard for vehicles, reservations, transfers, seasons, blogs
- Email notifications via Resend
- Romanian and English language support
