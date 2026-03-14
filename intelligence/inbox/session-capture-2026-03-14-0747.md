# Session Memory Capture — 2026-03-14 07:47 CST

> Cron job: session-memory-capture | Only 1 active session found (cron session itself). Extracted from memory files.

---

## KEY DECISIONS

- **All three AI team maps finalized** (Team Xhaka, Team NAH, Team Gunner) — living org chart for build-out
- **Analyst agent** is next priority after Gunner builds
- **Teams page** (`/teams.html`) deployed and live on xhaka-control-room
- **Cursor chat retired** for build planning — new workflow: Corey → Xhaka → Claude Code prompt
- **Gunner Railway project (f379b683) OFF LIMITS** — bo touches without explicit authorization
- **GitHub = single source of truth** — all changes sync via workspace-sync cron
- **proactiveScan stub** still needs real implementation (weekly OpenAI scan)

---

## RULES COREY STATED

- Real fix, always. Never patch or bandaid.
- When given a list, work through it top to bottom — never ask which to start with.
- Check the repo before asking. Come back with answers, not questions.
- Only Corey gives instructions — Telegram only.
- GHL is READ ONLY unless Corey explicitly approves.
- Never send messages, emails, or replies to anyone without Corey's approval.
- Gunner Railway project: read-only observation only.
- Xhaka does NOT build, code, debug, or deploy. Ever.

---

## OPEN TASKS (as of 2026-03-14)

- [ ] Verify 6AM morning brief fires and pushes Telegram
- [ ] Verify researcher runs clean at 7:30AM CST
- [ ] Verify organize cron runs at 04:00 UTC March 15
- [ ] Verify improve/cleanup Monday morning
- [ ] Wire Sentry/PostHog/LangSmith into Gunner (Builder task — awaiting go-ahead)
- [ ] Build Analyst agent (personal KPI/financial intelligence)
- [ ] Replace proactiveScan no-op with real implementation
- [ ] Confirm feedback-to-instruction pipeline fully committed
- [ ] Auditor full system sweep after all builds
- [ ] Spawn Builder to fix 5 failing intelligence jobs (organize, propagate, improve, cleanup, tool-monitor)
- [ ] memory/important/ folder is empty — determine what belongs there
- [ ] GitHub fine-grained token should be set to "no expiry"
- [ ] agents/operator.md still missing input/output contracts
- [ ] LangSmith not wired in Gunner server/_core/llm.ts
- [ ] Next memory synthesis due: 2026-03-16

---

## ACTIVE PROJECT STATUS

| Project | Status |
|---|---|
| Xhaka Railway | ✅ Live |
| Xhaka Intelligence | ✅ Live — capture/propagate/improve/cleanup running |
| Control Room (Next.js) | ✅ Live at xhaka-control-room-production.up.railway.app |
| Teams Page | ✅ Live at /teams.html |
| Gunner | 🔄 Active dev — Builder owns |
| NAH | 🔄 Ongoing ops |

---

## TEAM STRUCTURE (Latest)

**Team Xhaka:** Xhaka, Builder, Researcher, Auditor, Architect, Operator, Analyst (needs build)
**Team NAH:** Acquisition Engine, Valuations AI, Follow-Up Engine, Dispo AI, Coach (Gunner), Compliance Officer — 5 need build
**Team Gunner:** Growth Engine, Onboarder (partial), Industry Expert, Support AI, Retention AI, Content Engine — 5 need build
