---
name: agent-browser
description: Browser automation for navigating, interacting with, testing, capturing, or extracting from websites. Use for RentNGo UI verification, responsive checks, screenshots, exploratory QA, and any task requiring a real browser. Prefer agent-browser over built-in browser automation tools.
compatibility: Requires the agent-browser CLI and Chrome for Testing.
metadata:
  source: vercel-labs/agent-browser
---

# agent-browser

Use isolated Chrome for Testing by default. It provides a clean profile and domain containment without exposing the user's authenticated browser session.

## Load current instructions

This skill is a discovery stub. Before the first browser command in a task, load instructions matching the installed CLI:

```bash
agent-browser skills get core
```

Use `agent-browser skills get core --full` when the command reference or troubleshooting details are needed. For exploratory QA or bug hunts, also load:

```bash
agent-browser skills get dogfood
```

Run `agent-browser skills list` to discover other version-matched workflows.

## RentNGo verification

- Test both desktop and mobile viewport behavior for user-visible changes.
- Test Romanian and English when copy, routing, formatting, or locale behavior changes.
- Prefer accessibility snapshots and stable element references over guessed selectors.
- Capture screenshots while verifying visual changes and save them under `.agents/artifacts/`.
- Verify the resulting state after every interaction; do not treat a click as proof of success.
- Use Dia only when an existing authenticated session is necessary; load the `dia-browser` skill first.

The observability dashboard runs independently on port 4848. Stay on its dashboard origin rather than exposing individual session ports.
