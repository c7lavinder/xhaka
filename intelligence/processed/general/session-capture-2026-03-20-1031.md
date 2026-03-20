# Session Memory Capture — 2026-03-20-1031

## Source Sessions
- Main Telegram session: 3cd597d4-f591-45cf-b9d3-2b919afe58ec (416 messages, 5:01 AM to ~10:31 AM CST)
- Previous cron captures: 0501, 0631, 0701, 0731, 0801, 0831, 0901, 0931, 1001 (all committed)

---

## Key Decisions (since last capture at 10:01 AM)

No new Corey messages since 10:01 AM. This capture covers the same morning session.

**Previously locked decisions (consolidated):**
1. CLAUDE.md fully rewritten — Builder/specialists now get full company context on every session: NAH mission, Gunner (off-limits), rules, routing protocol, Paperclip protocol.
2. ACP spawns are dead — Paperclip is the only execution layer. SOUL.md updated. No exceptions.
3. Catch-22 rule codified — Xhaka cannot execute manual emergency fixes even when Paperclip is down. Structural solutions only. "If it doesn't happen on the board, it didn't happen."
4. Paperclip verified clean — 7 agents, all configs correct (cwd=workspace, dangerouslySkipPermissions=true, PATH set, CLAUDE.md loaded).
5. Cloudflare Quick Tunnel activated as ngrok replacement — temporary URL changes on restart. Still pending permanent tunnel login.
6. Protocol breach flagged — Xhaka broke the no-terminal rule during the "black screen" incident (Paperclip down). Corey caught it, rule reinforced hard.
7. Watchdog ticket XHAA-28 created on Paperclip board — spec for ping-based health check with Telegram alert when Paperclip goes silent.
8. Anthropic API credits ran out — background cron jobs failed. System switched to Gemini/OpenAI for main chat. Cron jobs now back on gpt-4o-mini.

---

## Rules Corey Stated

1. No manual terminal work from Xhaka — ever. Even in emergencies. Structural solutions only.
2. ACP spawns = dead. Paperclip issues only.
3. Route by domain — Researcher, Auditor, Architect, Operator, Builder. Not "Builder" as default.
4. Non-trivial code: Researcher → Builder → Auditor chain.
5. Xhaka does not narrate steps — acknowledge receipt, confirm done, state what's next.
6. Agents must have same context Xhaka has — not just raw capability.

---

## Open Tasks (as of 10:31 AM CST)

1. OPEN — XHAA-28 (Watchdog): Sitting on Paperclip board, needs Corey to assign to Builder and hit Start.
2. OPEN — Permanent Cloudflare tunnel: cloudflared tunnel login timed out at 7:41 AM. Corey needs to run it in a terminal on Mac mini (opens browser for auth). Paperclip still on temporary URL.
3. OPEN — workspace-sync cron: Recurring failures (API/credit related). Job is trying to sync config files to GitHub. Needs investigation.
4. OPEN — Gunner CRM degraded: crmStatus="degraded" persists. Flagged multiple times. Needs Builder assignment.
5. OPEN — intelligence pipeline: capture + organize jobs failing. Need Builder investigation.

---

## Context Notes

- Corey hasn't sent a Telegram message since ~5:01 AM CST. Likely sleeping.
- All morning captures (0501 through 1001) successfully committed to GitHub.
- Daily personal question cron fired at 9:00 AM CST — asked Corey about Nashville social circle (friend group / 5-year vision). No response yet.
- workspace-sync cron erroring but GitHub is manually current.
- System running stable: xhaka-intelligence and xhaka Railway deploys both healthy.
