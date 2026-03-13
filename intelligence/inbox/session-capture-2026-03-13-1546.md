# Session Capture — 2026-03-13 3:46 PM CST

## Decisions
- **New Gunner build workflow:** Cursor chat retired as planning layer. Xhaka writes precise Claude Code prompts → Corey pastes directly into terminal. Cuts out the double-translation problem.
- **Session-capture cron established:** Runs every 4h via OpenClaw, pulls session history, writes to GitHub `intelligence/inbox/`. Fired and confirmed working at 11:46 AM CST.
- **workspace-sync cron established:** Runs every 30 min, compares all 16 core files against GitHub and pushes any diffs. Running clean.
- **"Real fix, always"** — Corey stated this as a permanent rule. Never patch over a broken process. Fix the root cause.
- **Full team for all builds:** Operator diagnoses → Builder fixes → Auditor validates. No shortcuts.
- **GitHub is the single source of truth.** All memory files, decisions, rules go to GitHub immediately — not just locally.
- **Agent definitions build queued** as a major next project (Architect spec complete, Builder execution pending).
- **Xhaka must NEVER touch Gunner Railway project** without explicit authorization from Corey. Hard rule written to MEMORY.md.
- **Builder = Claude Code in Cursor terminal** for cost efficiency. Spawned subagents are expensive; use them for Xhaka-side work only.
- **Two separate Railway projects confirmed:** Gunner Project (gunner-v2, gunner-postgres) and Xhaka Platform Project (xhaka-intelligence, xhaka-brain postgres). TOOLS.md updated.
- **Trust is at 10%.** Corey's path to trust: harden repo files, establish automation, fill all gaps, prove discipline over time. Foundation work takes priority over new features.

## Rules / Corey Preferences
- "Real fix, always" — never patch, always fix the root cause
- Never touch Gunner Railway project without explicit authorization
- Always use the full team (Operator → Builder → Auditor) for any build
- Memory must be automatic — not relying on Xhaka to remember mid-session
- GitHub is the brain. Everything goes there immediately.
- Do not ask questions you can find yourself — check the repo first
- Do not use Cursor chat as a planning layer — it adds noise
- Building foundation/hardening is prerequisite to complex work
- Agents must be self-scoped and self-managing — not requiring babysitting
- When given a task, work through it without asking where to start

## People
- **Matt Lavinder** — Corey's dad, building AI ops for New Again Franchises (NAF), Bristol Sportsplex, podcast. AI assistants: Nora (NAF), Max (personal), Pia (Sportsplex).
- **Will Riddle** — hands-on AI builder for Matt
- **Ben Harrison** — infrastructure/director for Matt's AI setup; potential bottleneck risk
- **Kyle, Chris, Daniel** — NAH team (AMs/LMs), on Gunner leaderboard
- **Esteban** — Dispo Manager
- **Jessica** — Data Manager

## Project Updates
- **Gunner GHL CRM:** Was degraded this morning. Corey resolved directly in GHL. Builder committed 3 fixes: saveGhlTokens merges into crmConfig, CRM Layer 2 no longer wipes OAuth, hardcoded client ID corrected. Status: connected.
- **xhaka Intelligence Service:** Confirmed running in Xhaka Platform project (xhaka-intelligence). xhaka-brain is just a Postgres DB — not an app. 4 job bugs fixed: capture.ts early return, github.ts SHA 422, propagate/improve/cleanup stuck-state recovery on boot.
- **updateFile race condition fixed:** SHA goes stale between read and write when concurrent writes happen → 422 crash. Now retries with fresh SHA on 422.
- **Tool profiles populated:** Researcher created 10 new tool profile files across all categories.
- **Foundation hardening complete:** 12 files updated — MEMORY.md, PROJECTS.md, memory subfolders, HEARTBEAT.md, agent definitions.
- **workspace-sync anomaly:** Ran 0/16 for 4 consecutive runs then suddenly 16/16 — may be false-positive in comparison logic. Actual GitHub content verified correct.
- **SYSTEM alert flood:** Watchdog firing every minute on 5 failing jobs. Normal — stops when jobs run clean.

## Open Tasks
- [ ] Gunner visual reference site — Corey never provided it. Required before any Gunner UI work.
- [ ] Agent definitions build — Architect spec done, Builder not yet executed. High priority.
- [ ] xhaka web dashboard 502 — Non-blocking. Needs dedicated Builder session with Railway logs.
- [ ] TELEGRAM_BOT_TOKEN — set on wrong Railway service. Needs to go on xhaka-intelligence in Xhaka Platform project.
- [ ] propagate job overdue — missed 6 AM CST run. Builder spawned to manually trigger.
- [ ] improve/cleanup/tool-monitor — won't re-run until tomorrow (tool-monitor 6 AM) or Monday.
- [ ] workspace-sync 16/16 anomaly — investigate false-positive in comparison logic.
- [ ] memory/important/ — still empty, should contain permanently flagged items.
- [ ] Full 24h pipeline verification — daily-log runs today ~noon, Scribe tonight midnight. Confidence check tomorrow.
- [ ] Trust at 10% — Corey needs to see consistent discipline before complex work begins.
