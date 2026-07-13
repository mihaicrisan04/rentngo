# CLAUDE.md

## Important: PRD Workflow

**Always read `prd.md` at the start of any session.** This document tracks tasks and their status.

When making changes to the codebase:
1. Check if the change relates to a planned item in the PRD
2. After implementing, move the task to "Completed" with date and brief note
3. Add new tasks to "Planned" section
4. Update `CHANGELOG.md` with a summary of changes

**Keep the PRD concise and task-focused:**
- Use tables for task lists (not long paragraphs)
- Brief notes only (1 line per task)
- No detailed implementation specs - those belong in code comments or separate docs
- Focus on: what was done, what's planned, current status

## Git & Release Conventions

Releases are automated with **release-please** (config in `release-please-config.json`,
version tracked in `.release-please-manifest.json`). The version history on GitHub
(tags + Releases) is generated from commit messages, so commit/PR hygiene is what makes
it work — treat the rules below as required, not optional.

**Conventional Commits — always.** Every commit and PR title MUST follow
[Conventional Commits](https://www.conventionalcommits.org/), because release-please
derives the version bump and CHANGELOG from them:
- `feat: ...` → minor bump (lands under **Added**)
- `fix: ...` → patch bump (lands under **Fixed**)
- `perf:` → Performance · `refactor:` → Changed
- `feat!: ...` or a `BREAKING CHANGE:` footer → major bump
- `chore:` / `ci:` / `build:` / `docs:` / `test:` / `style:` → no release (hidden from CHANGELOG)
- A commit with none of these prefixes is invisible to release-please and silently
  dropped from the changelog — never use freeform commit subjects.

**Branch & merge flow:**
- Feature branches → `develop` → `main`. Releases are cut from `main` only.
- PRs are **squash-merged**, and the **PR title is the Conventional Commit** that ends up
  in history. Write the PR title accordingly (e.g. `feat: bilingual blog support`).
- Never commit or push directly to `main` or `develop` — always via PR.

**Do NOT edit by hand** (release-please owns them): version in `package.json`,
`.release-please-manifest.json`, and the auto-generated version sections of
`CHANGELOG.md`. To ship a release, merge the `chore(release): x.y.z` PR that
release-please opens on `main`. Manual changelog notes (if any) go under `[Unreleased]`.

**Before opening a PR**, make sure the CI gate passes — `npx tsc --noEmit` must be clean
(the `.github/workflows/ci.yml` typecheck job blocks merge). `npm run lint` is not yet a
gate (pre-existing errors tracked in `prd.md`), but don't add new lint errors.

## Project Overview

RentNGo is a car rental platform with VIP transfer services for the Romanian market. Built with Next.js 16, Convex, and Clerk v7 authentication. Supports Romanian (default) and English.

## Commands

This project uses [mise](https://mise.jdx.dev) for tool version management, env vars, and task running. See `mise.toml` for all tasks.

```bash
mise dev             # Start development (frontend + backend)
mise build           # Build for production
mise lint            # Run linter
mise run check       # Lint + format check + typecheck
mise run convex:deploy  # Deploy backend
```

Fallback (no mise installed):

```bash
npm run dev          # Start development (frontend + backend)
npm run build        # Build for production
npm run lint         # Run linter
npx convex deploy    # Deploy backend
```

## Project Structure

```
app/
├── [locale]/        # Public routes with i18n (ro/en)
│   ├── cars/        # Vehicle browsing
│   ├── reservation/ # Booking flow
│   └── transfers/   # VIP transfers
├── admin/           # Admin dashboard (no i18n)

convex/              # Backend functions & schema
components/          # React components
hooks/               # Custom React hooks
lib/                 # Utilities
messages/            # Translations (en.json, ro.json)
```

## Key Concepts

**Routing**: Public pages use `/[locale]/` prefix. Admin routes have no locale prefix.

**Database**: Convex with tables for users, vehicles, vehicleClasses, reservations, transfers, seasons, blogs.

**Authentication**: Clerk with admin access controlled by hardcoded user IDs in `middleware.ts`.

**Pricing**:
- Vehicles use `pricingTiers` array (tiered daily rates based on rental length)
- Seasonal multipliers applied from `seasons` table
- Transfers priced by distance via Mapbox

**Defaults**:
- Default location: "Aeroport Cluj-Napoca"
- Default pickup/return time: 10:00

## Convex Conventions

- Use `query`, `mutation`, `action` wrappers with `args` and `returns` validators
- Reference functions via `api.filename.functionName`
- Use indexes for filtering (defined in `schema.ts`)
- For detailed guidelines, see `.cursor/rules/convex_rules.mdc`

## Environment Variables

```
NEXT_PUBLIC_CONVEX_URL
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
CLERK_JWT_ISSUER_DOMAIN
RESEND_API_KEY
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
NEXT_PUBLIC_GTM_ID
```

<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->
