# Session Memory Capture — 2026-03-20-1101

## Source Sessions
- Main Telegram session: 3cd597d4 (418 messages, ongoing)
- This cron: c2bfcf37 (current session-memory-capture)
- Time window: ~5:30 AM – 11:01 AM CST (2026-03-20)

---

## Key Decisions

1. **ACP spawns are permanently dead** — Paperclip is the only execution layer. No exceptions. Updated in SOUL.md.

2. **CLAUDE.md rewritten** — Builder now receives full company context on every session: who Corey is, NAH business, Gunner (off-limits), hard rules, LEARNINGS.md, gstack workflow, Paperclip protocol, pointers to MEMORY.md and TOOLS.md.

3. **Catch-22 rule codified** — Xhaka broke the no-terminal rule when Paperclip crashed (fixed the black screen server manually). Corey caught it. Rule is now hard: Xhaka CANNOT execute emergency technical fixes even when Paperclip is down. Solve structurally, not manually. If it doesn't happen on the board, it didn't happen.

4. **Paperclip Watchdog** — XHAA-28 created: a ping script that restarts Paperclip server + tunnel automatically if it goes down and sends Telegram alert to Corey. Sitting on board, unassigned.

5. **ngrok abandoned** — Free plan shows browser interstitial that breaks JS asset loading (black screen). Switched to Cloudflare Quick Tunnel as workaround. URL is temporary and will change on Mac mini reboot.

6. **Permanent Cloudflare tunnel INCOMPLETE** — Corey said "let's do that" to cloudflared login at ~5:01 AM. The `cloudflared tunnel login` command ran but SIGTERM'd waiting for browser auth. Still unresolved.

7. **Communication protocol reinforced** — Xhaka: acknowledge receipt, say it's in motion, confirm when done, state what's next. No narration of intermediate steps.

8. **Routing discipline reinforced** — Route by domain, not habit. Non-trivial code tasks: Researcher → Builder → Auditor. Not Builder alone.

9. **Anthropic API credits ran out** — Background cron jobs (session-memory-capture) failed ~5:31 AM. Corey cycled through models: gpt-4o-mini → gemini-flash → gemini-pro. Capture crons recovered on Gemini. Anthropic credits need a top-up.

10. **All 7 Paperclip agents verified clean** — cwd=workspace, dangerouslySkipPermissions=true, PATH set, CLAUDE.md loaded on start. Confirmed during this session.

---

## Rules Corey Stated

1. Xhaka does NOT touch the terminal or execute emergency technical fixes — ever. Not even when Paperclip is down.
2. No step narration — acknowledge receipt, confirm completion, state next step. Nothing in between.
3. Stop defaulting to "Builder" — route by domain. Use the full chain for non-trivial tasks.
4. Agents must have the same context Corey has given Xhaka — full knowledge, not just code access.
5. If it doesn't happen on the board, it didn't happen.

---

## Open Tasks (Unresolved as of 11:01 AM CST)

1. **XHAA-28 (Watchdog)** — sitting on Paperclip board, unassigned. Needs Corey to assign to The Builder.
2. **Permanent Cloudflare Tunnel** — needs Corey to interactively run `cloudflared tunnel login` in terminal on Mac mini and complete browser auth.
3. **Gunner CRM degraded** — flagged at 7:41 AM heartbeat. Needs Builder ticket.
4. **Intelligence pipeline failures** — `capture` and `organize` jobs failing. Needs Builder investigation.
5. **Anthropic API credits** — need top-up to restore background cron functionality.
6. **Tickets XHAA-14 through XHAA-19** — completion status unknown. Auditor should verify.

---

## Context Notes

- Session theme: Migrating from ACP spawns to Paperclip as sole execution layer
- Secondary theme: Giving Builder full company context via CLAUDE.md
- Third theme: Communication style + routing discipline from Xhaka
- Fourth theme: Paperclip infrastructure stability (black screen bug, tunnel woes, watchdog need)
- Xhaka is currently on: google/gemini-3-pro-preview (switched after Anthropic credit outage)
