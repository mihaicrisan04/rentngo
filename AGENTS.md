# Repository Guide

RentNGo is a Romanian and English car-rental and VIP-transfer platform built with Next.js 16, React 19, Convex, and Clerk.

## Start Here

- Read this file before changing code. Read `PRD.md` only when the task affects product scope or an item tracked there.
- Inspect the existing implementation and nearby tests before proposing a new abstraction.
- Never read `.env*`, credentials, or secret files. Ask for a value if one is required.
- Do not manually edit generated files under `convex/_generated/` or `.next/`; use the owning generator when an update is required.
- Keep unrelated user changes intact. Do not use destructive Git commands.

## Commands

The project uses Bun as package manager and script runner while Node remains the runtime. `mise` pins both tools and loads local development environment variables.

```bash
bun install                 # install dependencies
mise dev                    # frontend + Convex development
mise lint                   # ESLint
mise run typecheck          # authoritative TypeScript check
mise test                   # unit tests
mise run check              # lint + format check + typecheck + tests
mise build                  # production build
```

Without mise, use the equivalent `bun run dev`, `bun run lint`, `bun run typecheck`, `bun run test`, and `bun run build` scripts. `bun run typecheck:fast` is advisory only. Do not pass `--bun` to Next.js or Convex commands.

Run the narrowest relevant check while iterating, then the broader checks affected by the change. Report which checks ran and any pre-existing failures. User-visible frontend changes require desktop and mobile browser verification when browser tooling is available.

## Browser Verification

- Use the `agent-browser` skill for browser automation and UI verification. Isolated Chrome for Testing is the default.
- Use the `dia-browser` skill only when the user requests Dia or an existing authenticated session is required.
- Verify user-visible changes on desktop and mobile. Check both locales when routing, copy, formatting, or localized behavior changes.
- Save temporary screenshots and recordings under `.agents/artifacts/`; do not commit them unless requested.

## Architecture

- `app/[locale]/`: localized public routes; Romanian is default and English is also supported.
- `app/admin/`: admin routes without a locale prefix.
- `components/`: React UI, organized into feature, admin, and shared areas.
- `convex/`: schema, queries, mutations, actions, HTTP handlers, migrations, and email logic.
- `lib/pricing/`: canonical pure pricing calculations. Keep authoritative price validation server-side.
- `messages/en.json` and `messages/ro.json`: translations; keep both locales in sync.
- `proxy.ts`: request routing and access control integration.

Preserve server/client boundaries. Do not expose secrets, customer PII, authorization decisions, or authoritative pricing to client-only enforcement.

## Code Conventions

- TypeScript is strict. Prefer existing types and path aliases such as `@/components`, `@/lib`, `@/types`, and `@/hooks`.
- Keep changes small and local. Extract only when code is genuinely reusable or materially clearer.
- Use functional React components and interfaces named `XxxProps` for component props.
- Add `"use client"` only when client behavior requires it. Hooks must remain at the top level.
- Follow existing Tailwind and Radix patterns. Use CVA for component variants.
- Avoid comments unless they explain a non-obvious constraint that clearer code cannot express.
- Follow nearby naming and file organization rather than introducing a parallel convention.

## Convex

Before changing Convex code, load `working-with-convex`, check that Convex's official Agent Skills and AI files are current, and invoke the relevant official Convex skill. Read `convex/_generated/ai/guidelines.md`. Repository policy additionally requires both `args` and `returns` validators for every public and internal Convex function; use `v.null()` when no value is returned.

- Use current `query`, `mutation`, `action`, `internalQuery`, `internalMutation`, and `internalAction` syntax.
- Use indexes instead of filtering database queries where an index is appropriate.
- Use `Id<"table">` and `Doc<"table">` from `convex/_generated/dataModel`.
- Keep privileged operations internal and enforce authorization in backend functions.
- Treat migrations as production-sensitive. Confirm idempotency and deployment order before running them.

## Delivery

- Branch flow is feature branch to `develop` to `main`; do not push directly to protected branches.
- Commit and PR titles use Conventional Commits because release-please derives releases from them.
- Do not manually edit package versions, `.release-please-manifest.json`, or generated release sections in `CHANGELOG.md`.
- Linear is the source of truth for issue status, priority, assignment, and roadmap ordering. Check Linear before starting or resuming planned work.
- Update `PRD.md` only when durable product scope or business rules change. Put implementation context in `.agents/plans/`, not in always-loaded instructions.
- Add or update focused tests for behavior changes. Never weaken or skip tests merely to make a change pass.

## Agent Files

- `AGENTS.md` is the canonical cross-tool repository contract.
- `.agents/skills/` contains portable, on-demand Agent Skills.
- `.agents/plans/` contains durable implementation context, not authoritative task status. Load `working-with-plans` and verify the linked issue in Linear before following a plan.
- `.claude/`, `.cursor/`, `.github/`, and other vendor directories contain adapters or genuinely tool-specific settings only.
- Keep mandatory policy in code, tests, hooks, or CI rather than relying on prose instructions alone.

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
