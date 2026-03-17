# Session Memory Capture — 2026-03-17-0046 CDT

## Capture Source
- Cron job: session-memory-capture
- Timestamp: 2026-03-17 00:46 CDT (04:46 UTC)
- Session analyzed: c1fbe43e (main Telegram/Corey session, 1995 messages)

---

## Key Decisions — Tonight (2026-03-16 11PM CDT)

### Gunner is 95% Complete on Manus
- Corey: "Gunner version on Manus is about 90-95% complete"
- Decision: Instead of jumping to rebuild, finish the Manus version first
- Plan: Walk through every page, catalog all issues, then build a finalized plan

### Gunner Architecture — Multi-Tenant Mandate
- The entire website must be CRM agnostic, industry agnostic, tenant agnostic, user agnostic
- Settings/onboarding must let admins map their own GHL stage names to Gunner KPI triggers
- No hardcoded stage names in the codebase

### KPI Box Trigger Logic — Finalized by Corey
- Calls = all outgoing calls from team (BatchDialer/GHL)
- Convos/Graded Calls = all Gunner-graded calls
- Appointments = GHL stage mapped to Appointment during onboarding (not hardcoded)
- Offers = GHL stage mapped to Made Offer during onboarding
- Contracts = GHL stage mapped to Under Contract during onboarding
- KPIs reset daily but must support historical view (go back in time)
- Editing a KPI box must also update Inventory page and keep both in sync

### Settings/Playbook Pages
- Current state: super confusing
- Must be redesigned to be clear and navigable
- Stage-to-KPI mapping happens here during onboarding

### Inbox Panel
- AI is solid — no changes needed to logic
- Appointments panel needs: scrollable list + status buttons (Confirmed / Showed / Canceled / No Show)

### Rule Corey Stated
- Do not start working until we are completely done with the full website. Just keep track of everything, then build the plan afterwards.
- Pattern: listen first, catalog all issues, then build the plan

---

## Open Tasks

### Immediate (Tonight)
- Continue listening as Corey walks through every Gunner page — DO NOT BUILD YET
- Capture all issues Corey identifies across all pages
- After full walkthrough: compile master build plan for Gunner finish

### Corey Must Do (Blocked on Him)
- Complete Claude Code auth at Mac mini terminal (30 sec): export PATH and run claude auth login
- Run pgvector SQL in Supabase: https://tvjkgumckwapybpjyrkw.supabase.co
- Set SUPABASE_SERVICE_KEY in Railway xhaka-intelligence env vars
- Update Railway xhaka-control-room source to c7lavinder/xhaka, root dir services/control-room
- matt.md and will-riddle.md people files are thin — needs Corey input

### Gunner Rebuild (Post-Walkthrough)
- Compile full issues list from Corey walkthrough
- Write Builder spec with SPEC + PLAN + TASKS sections
- Rebuild requires Claude Code auth to complete first

---

## Gunner Page Issues Captured So Far (Partial — walkthrough in progress as of 11:46 PM CDT)

### Day Hub
1. KPI triggers are fuzzy — need crisp GHL stage mapping via onboarding settings
2. Convos box uses wrong trigger (should be graded calls, not callOutcome=appointment_set)
3. Editing KPIs must sync to Inventory page (one source of truth)
4. Settings/playbook page that houses KPI config is confusing and needs redesign

### Inbox
5. AI analysis is solid — keep as-is

### Appointments Panel
6. Needs to be scrollable
7. Needs status buttons: Confirmed / Showed / Canceled / No Show

(Walkthrough still in progress — more issues will be captured)

---

## Context

### Gunner Status (as of tonight)
- Site: getgunner.ai (live, real data)
- Dark/light mode: both working
- Day Hub: 270 calls, 25 convos, 6 appts, live task list
- Dispo Command Center: 356 properties live
- Known issue: CRM shows degraded = likely expired GHL OAuth token
- Known issue: grading.ts is 1500-line God File — needs refactor
- Zero tests in codebase

### Three-Repo Architecture (locked)
- c7lavinder/xhaka — Xhaka COO brain
- c7lavinder/NAH — New Again Houses business ops
- c7lavinder/MANUS-Gunner-AI — Gunner SaaS (Builder owns)

### Infrastructure
- GitHub Actions CI: ts-check.yml — tsc on every push, Telegram alert on failure
- xhaka-intelligence: Railway SUCCESS
- xhaka-control-room: Railway SUCCESS (Speakeasy theme live)
- Model: gpt-4o-mini for Xhaka main session (cost control)

