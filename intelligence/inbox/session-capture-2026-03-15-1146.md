# Session Capture — 2026-03-15 11:46 AM CST

## Key Decisions

### March 13, 2026
- **Corey gave 10% trust** after Xhaka touched Gunner Railway (f379b683) without permission — env vars set + redeploy triggered on xhaka-brain (Postgres DB). Gunner was unaffected but rule violated.
- **Gunner Railway project (f379b683) is strictly OFF LIMITS** — Xhaka never touches without explicit per-message authorization. Written permanently to MEMORY.md.
- **Cursor dropped as planning layer** — new workflow: Corey tells Xhaka → Xhaka writes Claude Code prompt → Corey pastes directly into terminal. Cursor chat cut out entirely.
- **Builder is too expensive** — Corey has Claude Code in Cursor at $200/month. Subagent spawns reserved for tasks that truly need autonomous runs.
- **Active Gunner repo is MANUS-Gunner-AI** (c7lavinder/MANUS-Gunner-AI, TiDB/MySQL, 98 tables, 40+ pages) — NOT c7lavinder/xhaka gunner-v2. All Gunner work goes here.
- **RAG spec for Manus** — Corey wants RAG for: (1) call recordings >60s, (2) AI LLM Q&A history, (3) team task actions/reactions, (4) conversion data. Prompts to go to Manus, not Claude Code.
- **Agent definitions built** — Architect ran, Builder updated agent .md files with self-scoping and time management rules. Operator + Guide definitions added.
- **Session-memory-capture cron fixed** — was timing out at 120s/180s. Rewritten to sessions limit=3, history limit=50, 4-minute budget. Now runs clean.
- **Alert cooldown added** — operator SYSTEM alerts now fire max once/hour (was every minute).
- **Remediation-state commits flooding** — every minute after cooldown fix. Builder patched.
- **Both Railway projects confirmed in TOOLS.md:** Xhaka project (84c0d035) vs Gunner project (f379b683).
- **Workspace-sync reporting bug** — alternating runs falsely report 16/16 synced with no actual commits. Known issue, not fixed yet.

### March 14, 2026
- **Three AI teams designed** — Team Xhaka (personal command), Team NAH (wholesale machine), Team Gunner (100-user growth). Visual page built: teams.html deployed to xhaka-control-room.
- **Analyst agent** — next build priority after Gunner work. Personal KPI/financial intelligence.
- **proactiveScan is a stub** — no-op, needs real implementation with weekly OpenAI scan.
- **RAG discussion** — Corey learned what RAG is. Applied to Gunner: call library + conversion data + team action history so in-app LLM and playbooks can reference them.

### March 15, 2026
- **Builder patched scheduler.ts** — safeRun function: reordered startTime before console.log, catch(async err) → catch(err), markJobFailed already imported. Commit: d81ef0363bfd0abea53eb54a4f6120429a934920.

---

## Rules Corey Stated

1. **Never touch Gunner Railway project without explicit per-message approval** — Corey said this multiple times, now in MEMORY.md.
2. **Do not build, code, or diagnose technical issues** — spawn the right agent.
3. **No new accounts anywhere** without direct orders.
4. **This Telegram chat is the ONLY command channel** — all other channels observe-only.
5. **GHL is READ ONLY** unless Corey explicitly approves an action.
6. **Never check MEMORY.md only after taking action** — check it BEFORE actions mid-session.
7. **When given a checklist or numbered list** — work through top to bottom, do not ask which to start with.
8. **Builder subagent spawns** — only for tasks that truly need autonomous execution (expensive). Prefer writing prompt for Corey to paste into Cursor Claude Code.

---

## Open Tasks (Carried Forward)

- [ ] Wire Sentry/PostHog/LangSmith into MANUS-Gunner-AI
- [ ] Build Analyst agent (personal KPI/financial intelligence)
- [ ] Replace proactiveScan stub with real weekly OpenAI scan
- [ ] Fix workspace-sync false-positive reporting bug (alternating 0/16 vs 16/16)
- [ ] RAG system for MANUS-Gunner-AI (prompt needs to be written for Manus)
- [ ] Auditor full system sweep after all builds complete
- [ ] Confirm feedback-to-instruction pipeline fully committed
- [ ] Verify improve/cleanup cron jobs running clean (scheduled Monday)
- [ ] verify organize ran at 04:00 UTC March 15
- [ ] Gunner Day Hub layout spec (Manus): remove tabs, left 2/3 Inbox+Appointments, right 1/3 AI Coach locked at 7 rows always

---

## System Status (as of 2026-03-15 11:46 CST)

| System | Status |
|---|---|
| Gunner (getgunner.ai via MANUS) | Active dev — TiDB/MySQL, 98 tables |
| gunner-v2 (Railway) | Active but not current focus |
| xhaka-intelligence | Online — scheduler running |
| xhaka-control-room | Online — teams.html live |
| session-memory-capture cron | ✅ Fixed and running |
| workspace-sync cron | ✅ Running (reporting bug known) |
| operator alerts | ✅ Cooldown added |
| scheduler.ts safeRun | ✅ Patched March 15 |
