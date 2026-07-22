---
name: dia-browser
description: Attach agent-browser to Mihai's Dia browser only when an existing authenticated session is required, such as Linear, GitHub, Clerk-protected admin pages, or a deployed environment. Also use when the user explicitly requests Dia.
compatibility: macOS with Dia and agent-browser installed.
---

# Using agent-browser with Dia

`agent-browser` uses isolated Chrome for Testing by default. Dia is the user's daily Chromium browser and contains real authenticated sessions.

## Browser choice

- Use isolated Chrome for local public pages, responsive checks, screenshots, clean-profile QA, and untrusted sites.
- Use Dia only when existing authentication is the point: Linear, GitHub, authenticated RentNGo admin pages, or deployed services where signing in again is impractical.

## Attach to Dia

Check whether Dia already exposes CDP on port 9222:

```bash
curl -s --max-time 2 http://127.0.0.1:9222/json/version
```

If it is unavailable, ask the user before interrupting Dia. After approval:

```bash
osascript -e 'quit app "Dia"'
# Wait until pgrep -x Dia no longer returns a process.
open -a Dia --args --remote-debugging-port=9222
```

Pass the CDP port on every command:

```bash
agent-browser --cdp 9222 open https://linear.app
agent-browser --cdp 9222 snapshot -i
```

## Safety

- Dia commands use the user's real cookies. Stay strictly within the requested task.
- Do not perform destructive or externally visible actions without explicit approval.
- `--allowed-domains` does not contain navigation on a pre-existing CDP session.
- Close tabs opened for the task when finished.
- Never restart Dia without asking first.
