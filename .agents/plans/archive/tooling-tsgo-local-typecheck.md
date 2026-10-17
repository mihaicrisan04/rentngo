# Plan — tsgo for fast local typechecking (advisory, non-blocking)

Add the native Go TypeScript compiler (`tsgo`, from `@typescript/native-preview`) as a
**fast, advisory** typecheck for local dev and an **informational** CI job — WITHOUT touching
the `typescript@5.9` devDependency or the blocking `tsc --noEmit` gate. Size: **S**.

## Why this shape
- The real `typescript` package is held at 5.9 (7.0 GA breaks typescript-eslint peer
  `<6.1.0`, Next typecheck, Convex ts-morph codegen). `tsgo` ships as a **separate** package
  (`@typescript/native-preview`), so adding it resolves nothing that eslint/Next/Convex pull
  via `require('typescript')` — zero conflict, purely additive.
- Realistic speedup for a mid-size Next app: **~3–7×** vs `npx tsc --noEmit` (validate with a
  real before/after on this repo).

## Key facts (from research)
- Package `@typescript/native-preview` → `tsgo` binary. **Nightly only, no stable tag** —
  versioned `7.0.0-dev.YYYYMMDD.N`. **Pin an exact version**, never `^`/`latest` (floating
  pulls a new nightly every install). Check `npm view @typescript/native-preview dist-tags`
  at implementation time.
- Per-platform binaries via `optionalDependencies` (like esbuild) — `npm install`/`npm ci`
  auto-resolves macOS dev + `ubuntu-latest` CI, no extra config.
- tsconfig compat: `moduleResolution: bundler` ✅, `paths` alias ✅, `plugins:[{name:"next"}]`
  is LSP-only and ignored by the CLI ✅. Point tsgo at its **own** `--tsBuildInfoFile` so it
  never shares/corrupts the `incremental` cache that `tsc` (CI/editor) uses.
- Diagnostics target TS 6/7-era checker semantics, so expect a **small, explainable** diff vs
  5.9 (version drift, not tsgo bugs). Trust it for local nudges, NOT as the merge gate.

## Changes

### 1. devDependency (exact-pinned)
```
"@typescript/native-preview": "7.0.0-dev.20260707.2"   // re-check dist-tags at impl time
```

### 2. package.json scripts (neither exists today)
```json
"typecheck": "tsc --noEmit",
"typecheck:fast": "tsgo --noEmit --tsBuildInfoFile .tsgo-cache/tsconfig.tsbuildinfo"
```
Add `.tsgo-cache/` to `.gitignore`.

### 3. ci.yml — add a SEPARATE non-blocking job (do NOT modify the existing `typecheck` job)
```yaml
  typecheck-fast:
    name: Typecheck (tsgo, informational)
    runs-on: ubuntu-latest
    continue-on-error: true
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npx tsgo --noEmit
```
`continue-on-error: true` = shows in the Checks tab (drift is visible) but never fails the
gate. Branch protection keeps requiring ONLY the original `typecheck` (real `tsc`) job.

### 4. Docs — one line in CLAUDE.md Commands
`npm run typecheck:fast   # tsgo, fast + advisory; run the real `npm run typecheck` before a PR`

### Out of scope (separate later pilot)
- `convex.json` `"typescriptCompiler": "tsgo"` (speeds `convex dev`'s own typecheck of
  `convex/`). Higher-stakes — it becomes a real gate in the dev loop. Pilot separately, diff
  diagnostics, roll back by removing the key. NOT in this PR.

## Ownership boundary (coordination)
- **This task owns:** the `@typescript/native-preview` devDep + `typecheck` / `typecheck:fast`
  scripts in `package.json`, the new `typecheck-fast` CI job in `ci.yml`, `.gitignore`
  (`.tsgo-cache/`), and its one CLAUDE.md line.
- Stacks **on top of mise**: also add a `typecheck:fast` mise task mirroring the script (mise
  already has a `typecheck` task) so the two runners stay in sync.
- The **bun** task (next in the stack) will rewrite how these scripts/CI steps are *invoked*
  (`bun run` / `bun x tsgo`, `oven-sh/setup-bun`) — leave that to bun; author this with npm
  and let bun reconcile.

## Explicit guarantee
The blocking gate is unchanged: `typecheck` job → real `npx tsc --noEmit` against
`typescript@^5` (5.9.x). tsgo touches neither that job, the `typescript` version, nor any
peer dep. Fully additive and advisory.

## Verification
1. `npm ci`, then time `npm run typecheck:fast` vs `npm run typecheck` — confirm real speedup.
2. Diff the two diagnostic outputs — expect zero / fully-explainable differences; investigate
   any before trusting further.
3. Throwaway PR: confirm `typecheck-fast` appears in Checks but branch protection still only
   requires the original `typecheck`.
4. Re-pin the nightly deliberately on a cadence; revisit the whole setup when tsgo stabilizes
   into the `typescript` package proper.
