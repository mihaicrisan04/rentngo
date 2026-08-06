# Implementation Plans

Linear is the source of truth for status, priority, assignment, and roadmap ordering. These files preserve implementation context only.

Before using a plan, load the `working-with-plans` skill and verify its issue in Linear. The classifications below were reconciled against repository code, `PRD.md`, `CHANGELOG.md`, and Git history on 2026-07-22. Linear could not be checked because the available Dia session was not authenticated, so these classifications are not authoritative issue statuses.

## Active Context

| Plan                                 | Linear            | Repository assessment                                                                                  |
| ------------------------------------ | ----------------- | ------------------------------------------------------------------------------------------------------ |
| `active/clerk-convex-user-sync.md`   | RNGO-32           | Live on dev; production configuration remains pending                                                   |
| `active/audit-convex-performance.md` | Unlinked          | Some work shipped; indexes, pagination, and bounded reads remain relevant                              |
| `active/audit-admin-dialogs.md`      | Unlinked          | Requires Linear and code verification before implementation                                            |
| `active/audit-i18n.md`               | Unlinked          | Requires Linear and code verification before implementation                                            |
| `active/audit-misc-bugs.md`          | Unlinked          | Treat as a finding inventory, not an executable batch                                                  |
| `active/feature-calendar.md`         | Unlinked          | Blocked on product clarification in the repository snapshot                                            |
| `active/feature-copy-update.md`      | Unlinked          | Blocked on approved client copy in the repository snapshot                                             |
| `archive/feature-admin-viewport-shell.md` | RNGO-36      | Shipped 2026-08-06 (PRs #93, #100, #95–#99); archived                                                  |

Unlinked plans must be connected to a Linear issue before implementation unless the user explicitly directs otherwise.

## Directories

- `active/`: still-actionable or unresolved implementation context; Linear decides whether work is actually active.
- `reference/`: durable investigations and architectural material that are not task state.
- `archive/`: completed, stale, or superseded plans retained for history.

Do not recreate a Markdown backlog or priorities file. Query Linear instead.
