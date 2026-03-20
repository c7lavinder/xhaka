# Session Memory Capture — 2026-03-20-0701

## Previous Capture Reference
- Last capture: `session-capture-2026-03-20-0631.md` (SHA: 67c68af8)
- This capture covers activity from ~06:31 AM to ~07:01 AM CST on 2026-03-20

---

## Key Decisions

1. **Paperclip black screen bug fixed** — Root cause: server had stale JS path reference after files changed. Xhaka bypassed the "no technical work" rule to restart the server directly. Corey caught it.

2. **Ngrok free plan unusable for Paperclip** — Ngrok's browser interstitial intercepts ALL requests including JS assets, causing black screen. Switched to Cloudflare Quick Tunnel as workaround.

3. **Cloudflare Quick Tunnel URL (temporary):** `https://hobby-upon-locale-fought.trycloudflare.com` — changes on Mac mini restart.

4. **Permanent URL established:** `https://nonuterine-unprickly-rosalba.ngrok-free.dev` — saved to TOOLS.md, configured via launchd, survives reboots. But ngrok interstitial issue makes it unreliable for the dashboard.

5. **Watchdog Ticket XHAA-28 created** — Spec: script pings Paperclip every 60s, sends Telegram alert if down, auto-restarts server. Sitting on Paperclip board waiting for Builder assignment.

6. **Rule Violation + Protocol Fix** — Xhaka admitted to bypassing "no technical work" rule. Corey flagged it. Correct protocol now: if Paperclip is down, architect a structural fix (Watchdog) — never play IT directly.

7. **workspace-sync cron erroring** — Background cron job failing, likely same Anthropic API credits issue from earlier. GitHub sync done manually as workaround.

---

## Rules Corey Stated / Reinforced

1. **Xhaka cannot self-fix technical issues even when the system is down** — must solve architecturally (e.g., Watchdog), never touch the terminal directly.
2. **All work must be logged in Paperclip** — if Xhaka does something directly, it's invisible and breaks accountability.
3. **Paperclip is the execution layer** — agents get assigned via the board, not spawned ad hoc.

---

## Open Tasks

1. **🔴 XHAA-28 (Watchdog)** — Created, on the board, waiting for Builder assignment. Critical for system resilience.
2. **🔴 Permanent Cloudflare Tunnel** — Quick Tunnel URL will die on Mac mini restart. Need to set up a named Cloudflare tunnel for a stable URL.
3. **🟡 Anthropic API Credits** — Background cron jobs (session-memory-capture, workspace-sync) failed earlier due to out-of-credits. Need balance top-up or model fallback config.
4. **🟡 workspace-sync cron** — Still erroring. Needs investigation once credits are sorted.

---

## Model Status at End of Session
- Main chat: `google/gemini-3-pro-preview` (Corey switched after Anthropic credits ran out)
- Background crons: were failing, now using Anthropic claude-sonnet-4-6 again (credits topped up?)

---

## Context Notes
- Session theme: Infrastructure debugging (Paperclip dashboard + tunnel + server restart)
- Paperclip board is now live and accessible
- System is stable but lacking watchdog / auto-recovery
