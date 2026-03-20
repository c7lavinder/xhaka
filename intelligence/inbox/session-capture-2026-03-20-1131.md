# Session Memory Capture — 2026-03-20-1131

## Source Sessions
- Main Telegram session: 3cd597d4-f591-45cf-b9d3-2b919afe58ec
- Previous memory cron: c2bfcf37 (completed capture at 1101)
- Workspace-sync cron: 8b940459 (no new content — all files already in sync)

---

## Key Decisions

1. ACP spawns permanently dead — Paperclip issues only. No exceptions. SOUL.md updated.

2. CLAUDE.md rewritten — Builder now gets full company context on every session: who Corey is, what NAH does, what Gunner is (off-limits), hard rules, LEARNINGS.md behavioral rules, gstack workflow, Paperclip protocol.

3. Catch-22 rule codified — Xhaka cannot execute emergency technical fixes even when Paperclip is down. Correct protocol: spawn The Operator via Paperclip to diagnose. If system is down, alert Corey and wait. Never bypass the board.

4. Paperclip black screen fixed — Root cause: server had stale JS cached from Monday restart. Server was killed and restarted. Xhaka broke the rule by doing this directly (acknowledged). Will not happen again.

5. ngrok abandoned — Black screen issue was caused by ngrok injecting a browser warning page that blocked JavaScript. Switched to Cloudflare Quick Tunnel.

6. Cloudflare Quick Tunnel (temporary) — https://hobby-upon-locale-fought.trycloudflare.com (changes on restart; permanent URL still not set up).

7. XHAA-28 Watchdog ticket created — Paperclip board ticket for Builder: write a ping script + Telegram alert for when Paperclip goes down. Out-of-band recovery mechanism.

8. Anthropic API credits ran out — Background cron jobs (memory capture) briefly failed at ~06:01 AM CDT due to Anthropic out-of-credits. Later runs worked (credits were presumably topped up).

9. Paperclip verified working — All 7 agents fully wired: Builder, Researcher, Auditor, Architect, Guide, Operator, Librarian. All passed loop tests tonight.

---

## Rules Corey Stated

1. Board-or-it-didn't-happen — If Xhaka does a technical fix directly and it's not logged in Paperclip, that's a violation. No exceptions, even in emergencies.

2. No narration — Acknowledge receipt, confirm done, state next. Nothing in between.

3. Route by domain — Stop defaulting to Builder alone. Non-trivial: Researcher → Builder → Auditor.

4. Agents need same context as Xhaka — Specialists must have company context, not just raw capability.

5. Never build, code, or debug — Xhaka is COO not an engineer. Emergency or not.

---

## Open Tasks

1. OPEN: Permanent cloudflared tunnel — Corey needs to run cloudflared tunnel login on Mac mini (interactive, opens browser). Still not done.

2. OPEN: XHAA-28 Watchdog — Ticket exists on Paperclip board. Builder needs to be assigned and execute.

3. OPEN: Gunner CRM degraded — crmStatus: degraded. Flagged multiple times this morning. Still unresolved. Needs Builder.

4. OPEN: capture + organize intelligence jobs failing — Failed at 07:40 AM CDT. Needs Builder investigation.

5. OPEN: Paperclip issues XHAA-14 through XHAA-19 — unknown completion status.

---

## Context Notes

- Session window: ~midnight to ~11:30 AM CST on 2026-03-20
- Major themes: Paperclip as sole execution layer, Cloudflare tunnel for Paperclip, CLAUDE.md upgrade, Catch-22 gap closed with Watchdog ticket
- Corey model-hopped during session: gpt-4o-mini, gemini-flash, sonnet, gemini-pro — testing model responses
- Corey: "Stay in mini" at 05:35 AM (wanted gpt-4o-mini)
- All prior session captures backed up to GitHub (0401, 0431, 0501, 0631, 1101)
