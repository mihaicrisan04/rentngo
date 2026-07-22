# Plan — Migrate npm → bun (package manager + script runner)

Switch the package manager and script runner to **bun** for faster installs and script
orchestration, while **keeping Node as the runtime** for dev/build/prod/Convex/Vercel.
Size: **M**. Riskiest of the three tooling tasks → sequenced **last** so it's independently
droppable.

## Core decision: bun-as-PM, NOT bun-as-runtime
`bun install` + `bun run <script>`, but every script still invokes `next`/`convex` via the
default shebang → they run under **Node**. **Never pass `--bun`** to next or convex.

Why (from research):
- Convex CLI under the Bun *runtime* has open bugs — WebSocket `101` failure on `deploy`
  (get-convex/convex-backend#390), `'use node' actions` misdetection with `--bun` (#279).
- Next 16 under the Bun *runtime* has open build bugs (`bun:` URI resolution, standalone
  `react-server-dom-webpack` errors — oven-sh/bun#24829, #26244).
- `bun install` alone is a safe drop-in for `npm ci`, ~5–20× faster, and changes nothing
  about how `next build`/`next start`/`convex` execute.

## Exact changes

### `package.json`
- Add `"packageManager": "bun@1.3.14"` (pin latest at impl time; `setup-bun` + Vercel/Corepack read it).
- Replace `dev` with bun's native parallel runner (built in since 1.3.9, no external tool):
  ```json
  "dev": "bun run --parallel dev:frontend dev:backend"
  ```
- **Remove `npm-run-all`** from devDependencies (only `dev` used it).
- `predev` needs **no change** — bun DOES run `pre<script>`/`post<script>` hooks for the repo's
  own scripts (verified against bun docs; the "bun skips pre/post" claim applies to *dependency*
  lifecycle scripts, not package scripts). `predev` (`convex dev --until-success && convex
  dashboard`) still fires before `dev`. Verify anyway.
- Keep `"test": "vitest run"` unchanged — **do NOT switch to `bun test`** (different runner).
  CI runs it via `bun run test`, still Vitest under Node.
- Keep `engines.node`; optionally add `engines.bun`.
- If eslint's native resolver breaks post-install (see risks), add
  `"trustedDependencies": ["unrs-resolver"]`.

### Lockfile
- `bun install` once → generates **`bun.lock`** (text format, default since bun ≥1.2 — not the
  old binary `bun.lockb`). Commit `bun.lock`, **delete `package-lock.json`**.
- Vercel auto-detects `bun.lock` → uses `bun install`, **zero config** (no `vercel.json` needed).

### `.github/workflows/ci.yml` (both jobs)
Replace `actions/setup-node` + `cache: npm` + `npm ci` with:
```yaml
- uses: oven-sh/setup-bun@v2
  with: { bun-version: latest }   # or pin via packageManager
- run: bun install --frozen-lockfile
```
- typecheck job: `bunx tsc --noEmit` (or `bun run typecheck` if the tsgo task added that script).
- test job: `bun run test` (still `vitest run`).
- **Reconcile with the tsgo task's `typecheck-fast` job** (already added by then): switch its
  `npm ci` → `bun install --frozen-lockfile` and `npx tsgo` → `bunx tsgo`, keep
  `continue-on-error: true`.

### `mise.toml` (owned by the mise task, patched here as the cross-cut)
- Update the mise `dev` task's run line: `npm-run-all --parallel …` → `bun run --parallel
  dev:frontend dev:backend`. One line. (This is the "bun follow-up" the mise plan defers here.)

### Docs
- `README.md`: `npm i` → `bun install`, `npm run dev` → `bun run dev`; also fix the stale
  "next.js 15" → 16 while in there.
- `CLAUDE.md` Commands: `npm run …` → `bun run …`, `npx convex deploy` → `bunx convex deploy`.
- Add a repo convention line: **never pass `--bun` to next/convex scripts** (prevents a future
  "helpful" speed tweak from hitting the runtime bugs above).

## Risks & mitigations
1. **Convex CLI under bun runtime buggy** → always `bunx convex …`, never `--bun`. Test
   `bunx convex deploy` against dev before merge (watch for WS 101).
2. **`unrs-resolver` postinstall not bun-default-trusted** (eslint transitive) → after first
   `bun install`, run `bun run lint`; if native-binding error, `bun pm trust unrs-resolver` +
   commit. Low blast radius (lint isn't a gate).
3. **`bun test` ≠ vitest** → keep `vitest run`; CI uses `bun run test`.
4. **`bun run --parallel` failure/kill semantics thinly documented** → smoke-test `bun run dev`
   starts both servers AND Ctrl+C kills both cleanly (known orphan-process issue #441).
5. **mise binary resolution** — if mise tasks can't find `next`/`convex` on PATH after the PM
   switch, that's a mise-task concern (see coordination); bun doesn't change `.bin` layout.

## Rollback
`git revert` the single tooling commit — delete `bun.lock`, restore `package-lock.json` (or
`npm install`), restore `npm-run-all`, restore CI's setup-node/npm ci. No runtime/prod/Convex
behavior depends on it (runtime stays Node).

## Verification checklist
- [ ] `rm -rf node_modules package-lock.json && bun install` clean (watch unrs-resolver/eslint).
- [ ] `bun run dev` starts next + convex concurrently; `predev` fires first; Ctrl+C kills both.
- [ ] `bun run build` (next build under Node) succeeds, output comparable to npm build.
- [ ] `bunx convex deploy` (no `--bun`) against dev succeeds; `bunx convex dashboard` opens.
- [ ] `bun run test` passes 126/126 (still vitest).
- [ ] `bunx tsc --noEmit` clean.
- [ ] `bun run lint` shows only the same pre-existing errors (no new native-binding failures).
- [ ] CI green on both jobs via `oven-sh/setup-bun@v2` + `bun install --frozen-lockfile`.
- [ ] Vercel preview build log shows bun install auto-detected from `bun.lock`.

## Ownership boundary
- **Owns:** `package.json` (packageManager, `dev` script, remove npm-run-all), `bun.lock`,
  delete `package-lock.json`, both `ci.yml` jobs, `README.md`, `CLAUDE.md` Commands, and the
  one-line `mise.toml` `dev` patch + the tsgo CI job's install/exec lines.
- Because it touches the most, it is sequenced **last** (off the tsgo branch) so it reconciles
  mise's + tsgo's changes rather than colliding with them.
