---
name: working-with-plans
description: Use when creating, reviewing, resuming, classifying, or implementing a RentNGo plan. Linear is authoritative for issue status and priority; repository plans preserve implementation context only.
compatibility: Linear access may require an authenticated browser or configured integration.
---

# Working with plans

Linear is the source of truth for issue status, priority, assignment, and roadmap ordering. Files under `.agents/plans/` are durable implementation context and dated snapshots, not a second issue tracker.

## Before planning or implementation

1. Identify the Linear issue ID. Do not start status-sensitive planned work without one unless the user explicitly asks for an untracked investigation.
2. Check the issue in Linear. Use configured Linear tooling when available; otherwise load `dia-browser` for an authenticated session.
3. If Linear is inaccessible, say so. Verify current code and Git history, but do not infer or change authoritative issue status.
4. Check `.agents/plans/README.md` and any matching local plan for historical context.
5. Treat stale implementation details as hypotheses until verified against current code.

## Local plan lifecycle

- `active/`: unresolved implementation context, including actionable or externally blocked work; Linear determines its actual state.
- `reference/`: investigations and architecture that remain useful but are not executable task state.
- `archive/`: completed, rejected, stale, or superseded plans kept for history.

Every new active plan starts with:

```yaml
---
linear: RNGO-123
linear-url: https://linear.app/... # required when the workspace URL is known
last-verified: YYYY-MM-DD
---
```

Do not add a local status field that can contradict Linear. `last-verified` records freshness, not authority.

## Plan content

Capture intent, constraints, affected areas, implementation sequence, verification, rollout, and unresolved decisions. Keep product scope and business rules in `PRD.md`; keep issue state in Linear.

After shipping, preserve useful architectural findings under `reference/` and move the task plan to `archive/`. Update Linear through the user's configured workflow; do not silently mark work complete only in Markdown.
