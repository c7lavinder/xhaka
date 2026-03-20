# Session Memory Capture — 2026-03-20-0801

## Source Sessions
- Cron session: 0bc114f3 (session-memory-capture) — most recent active session
- Previous main Telegram session: 3cd597d4 (captured in 0501 run, 602 messages)

---

## Key Decisions

1. CLAUDE.md rewritten — Builder now gets full company context on every session start: who Corey is, what NAH does, what Gunner is (off-limits), hard rules, LEARNINGS.md behavioral rules, gstack workflow, Paperclip protocol, pointers to MEMORY.md and TOOLS.md.

2. ACP spawns are dead — Paperclip issues only going forward. Xhaka updated SOUL.md to reflect this. No exceptions.

3. Communication protocol defined — Xhaka acknowledges receipt, says it's in motion, confirms when done, states what's next. No narration of steps in between.

4. Routing corrected — Stop defaulting to Builder. Route by domain: Researcher (knowledge), Auditor (quality), Architect (UI), Librarian (files), Operator (GHL/config), Builder (code). Non-trivial code tasks: Researcher → Builder → Auditor.

5. Paperclip verified clean — All 7 agents have cwd=workspace, dangerouslySkipPermissions=true, PATH set, CLAUDE.md loaded on every start.

6. Cloudflared tunnel login timed out at 7:41 AM — cloudflared tunnel login command ran and waited 2+ minutes for browser auth then SIGTERM'd. Permanent Paperclip URL never established. Paperclip still on temporary URL.

---

## Rules Corey Stated (from prior session, still active)

1. Agents must follow all the knowledge and material Corey has fed Xhaka.
2. Xhaka should not narrate steps — acknowledge receipt, confirm completion, state what's next.
3. Route by domain, not habit. Use full chain for non-trivial tasks.
4. Paperclip is the execution layer, not ACP spawns.

---

## Open Tasks

1. OPEN — Cloudflared fixed URL: Corey needs to run cloudflared tunnel login interactively in terminal on Mac mini. Must have browser open to complete auth. Paperclip running on temporary URL until this is done.

2. OPEN — Gunner CRM degraded: crmStatus = "degraded" flagged at 7:41 AM heartbeat. Unresolved. Needs Builder.

3. OPEN — capture job failing: intelligence/capture job failed at 11:40 UTC (7:40 AM CST). Needs Builder investigation.

4. OPEN — organize job failing: intelligence/organize job failed at 04:00 UTC. Needs Builder investigation.

5. Verify XHAA-14 through XHAA-19 completion status via Auditor.

---

## Context Notes

- 8:01 AM CST, March 20, 2026 — Corey likely asleep (went to bed late)
- Morning heartbeat flagged 3 issues: Gunner CRM degraded, cloudflared timeout, capture+organize job failures
- Prior session (midnight to 5 AM) was major infrastructure day: Paperclip migration, CLAUDE.md rewrite, routing discipline
- No new Corey messages since 5 AM
