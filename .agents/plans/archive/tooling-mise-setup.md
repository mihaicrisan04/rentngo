# Plan — Finish the mise setup (RNGO-8 / PR #37)

**Status of the existing work:** PR #37 (`mihaicrisan/rngo-8-setup-mise`) already contains a
complete, well-structured `mise.toml` (tool pin + `.env.local` loading + a full task
runner). It's **CONFLICTING and 25 commits behind develop**, and it pins **node 23.11.1**,
which clashes with what the July 2026 dep sweep standardized on. This is a *finish + reconcile*
job, not a from-scratch one. Size: **S (easy)**.

## Goal
Land mise as the local toolchain + task runner, rebased cleanly on develop, with the node
version reconciled to the rest of the repo.

## What PR #37 already has (keep)
- `mise.toml` `[tools] node`, `[env] _.file = ".env.local"`
- tasks: `dev` (+ hidden `dev:frontend`/`dev:backend`), `build`, `lint`, `lint:fix`,
  `format`, `format:check`, `check` (depends lint+format:check+typecheck), `typecheck`,
  `convex:deploy`, `convex:dashboard`, `start`, all with aliases.
- `CLAUDE.md` command section referencing mise.

## Changes to make

### 1. Reconcile the node version (decision)
The dep sweep set `.nvmrc = 22`, `engines.node = ">=22"`, and CI `node-version: 22` (LTS).
PR #37 pins `node = "23.11.1"` (non-LTS, what the user happens to run locally).
- **Recommended:** change `mise.toml` to `node = "22"` so mise, `.nvmrc`, `engines`, and CI
  all agree on the LTS line. Keep `.nvmrc` (setup-node in CI reads a hardcoded `22`; `.nvmrc`
  stays as the human-facing pin and matches mise).
- Alternative (only if the user wants bleeding edge everywhere): bump `.nvmrc`, `engines`,
  and both CI jobs to `23` — more churn, drops off LTS. Not recommended.

### 2. Rebase onto develop + resolve doc conflicts
- `git rebase origin/develop`; the conflicts are in `CLAUDE.md` and `PRD.md` (both changed
  heavily on develop). Re-apply the mise command references on top of the current docs —
  don't drop the newer content. `mise.toml` itself should apply cleanly.
- Update the `CLAUDE.md` "Commands" block to present mise tasks as the primary path
  (`mise run dev`/`mise dev`, `mise build`, `mise check`, …) with the raw npm commands kept
  as the fallback.

### 3. Small correctness touch-ups
- `predev` parity: package.json's `predev` runs `convex dev --until-success && convex dashboard`
  before dev. The mise `dev` task skips this. Add it back so `mise dev` matches `npm run dev`
  — e.g. a hidden `dev:setup` task (`convex dev --until-success`) in `dev`'s `depends`, or a
  pre-step. Keep it minimal.
- Leave the `typecheck` task on `tsc --noEmit` for now; the **tsgo plan** adds a separate
  `typecheck:fast` task — do NOT add tsgo here (ownership boundary, see coordination).

## Ownership boundary (so it doesn't collide with bun/tsgo)
- **This task owns:** `mise.toml`, the `CLAUDE.md` Commands section, `PRD.md`.
- Does **not** touch `.github/workflows/ci.yml` or `package.json` scripts (matches PR #37's
  original scope). Those belong to the bun/tsgo tasks.
- If bun lands later, a one-line follow-up updates the mise `dev` task's `npm-run-all` call —
  handled in the bun plan, not here.

## Verification
- `mise install` resolves node 22.
- `mise tasks` lists the expected tasks; `mise run lint`, `mise run typecheck`,
  `mise run build` all succeed.
- `mise run dev` brings up frontend + backend (and the convex setup step).
- `mise.toml` node matches `.nvmrc` / `engines`.
- `npx tsc --noEmit` still clean (CI gate unaffected).

## PR
- Title stays `setup mise` (or `chore: setup mise for tooling + task running`).
- Rebased on develop, RNGO-8 → Done on merge.
