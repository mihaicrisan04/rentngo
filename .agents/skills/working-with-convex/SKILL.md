---
name: working-with-convex
description: Required workflow before changing Convex schema, functions, auth, migrations, indexes, generated clients, or deployment behavior in RentNGo. Ensures official Convex skills and generated guidance are current and applies repository-specific safety rules.
compatibility: Requires Bun, npx, and the Convex CLI.
---

# Working with Convex

Use Convex's official Agent Skills for Convex work. Do not rely on model memory when current official guidance is available.

## Before implementation

1. Refresh Convex's generated guidance and official skills:

   ```bash
   mise run agents:refresh-convex
   ```

   This runs the official updater, restores the repository's agent-agnostic Claude adapters, and validates the result.

2. Confirm installed AI guidance:

   ```bash
   bunx convex ai-files status
   ```

3. Run the repository integrity check if any adapter was changed manually:

   ```bash
   mise run agents:check
   ```

4. Read `convex/_generated/ai/guidelines.md` and invoke the relevant official skill:
   - `convex`: route unfamiliar Convex tasks.
   - `convex-migration-helper`: schema and data migrations.
   - `convex-performance-audit`: indexes, pagination, and query performance.
   - `convex-setup-auth`: Clerk or authorization integration.
   - `convex-create-component`: reusable Convex components.
   - `convex-quickstart`: only for project setup or major integration changes.

If an update changes files unrelated to official skills, generated Convex guidance, or the managed Convex section in `AGENTS.md`, stop and inspect before continuing. Never allow an installer to replace canonical repository policy or the `CLAUDE.md` symlink.

## Repository constraints

- Every public and internal Convex function has both `args` and `returns` validators.
- Authorization and ownership checks are server-side. Privileged helpers remain internal.
- Authoritative booking and transfer prices are recomputed server-side.
- Prefer indexes and bounded reads over in-memory filtering and unbounded collection.
- Treat migrations as production-sensitive; verify idempotency, deployment order, and rollback implications.
- Never edit `convex/_generated/` manually.

## Completion

Run focused tests, `mise run typecheck`, and `mise run agents:check`. Report whether the official skills or generated guidance were updated.
