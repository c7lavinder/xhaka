# Session Memory Capture — 2026-03-18-0346

**Captured:** Wednesday, March 18, 2026 — 3:46 AM CST
**Source Sessions:** c1fbe43e (main Telegram session, Mar 13–18, 2026 — massive multi-day session)

---

## Key Decisions

### Architecture: Gunner Per-Page Gear Icons
- **Decision:** Each Gunner page gets its own gear icon (⚙️) for settings — replaces PlaybookHub and Org Settings as config source of truth
- **Pages covered:** Inventory, Calls, Day Hub, KPI, Team
- **Date decided:** ~Mar 17–18, 2026
- **Status:** All 5 gear icons fully built and committed

### PlaybookHub Redesign
- **Decision:** PlaybookHub stripped of all config tabs, rebuilt as pure intelligence layer
- **Architecture:** 4 layers × 3 sub-tabs (Manual Input / System Findings / Output)
- **4 layers:** Software, Industry, Tenant, User
- **Dead code removed:** TrainingTab, PlaybookTab, GamificationTab, KPIsTab, BenchmarksTab

### Intelligence Pipeline (Xhaka memory system)
- **Decision (Mar 13):** All session memory flows OpenClaw → GitHub inbox → Railway daily-log → Scribe
- **Architecture confirmed:** session-capture cron (4h) pushes to `intelligence/inbox/`, daily-log picks up, Scribe propagates to `MEMORY.md`
- **Reality check:** Pipeline was broken at launch (SHA conflicts, stuck jobs) — all fixed same day

### Build Workflow Change
- **Decision (Mar 13):** Stop using Cursor chat as middleman. Corey → Xhaka → Claude Code terminal directly
- **Reason:** Two AI layers playing telephone loses fidelity
- **Status:** Active workflow going forward

### Agent Architecture
- **Open task:** Build each specialist agent (Builder, Auditor, Operator, Researcher, Architect) as a proper defined agent with built-in scope, operating constraints, and methodology — not one-off prompts
- **Trigger:** Corey said "can you not create an agent that does this properly"

---

## Rules Corey Stated

1. **"Real fix, always."** — Don't compensate for broken processes. Fix the process.
2. **Cursor chat retired for build work** — Xhaka writes the Claude Code prompt, Corey pastes to terminal
3. **Pages are now the source of truth** for all config — not PlaybookHub, not Org Settings
4. **Move order for config migration:**
   1. Verify gear icons have ALL data from PlaybookHub + Org Settings
   2. THEN remove those sections from PlaybookHub/Org Settings
5. **Before spawning Builder:** Spec must have 3 sections: SPEC (what + acceptance criteria), PLAN (architecture + patterns + constraints), TASKS (ordered, self-contained)
6. **Ensure runs get completed** — don't spawn and abandon, monitor to completion

---

## Open Tasks / Outstanding Items

### Gunner
- [ ] Manus needs to deploy `cf3dd91` (latest commit with all gear + PlaybookHub fixes) — Corey should verify this is live
- [ ] Verify all 5 gear icons show correctly in deployed build (Corey was reviewing screenshots at 12:42 AM — pre-latest-commit)
- [ ] Team gear: confirm invite tab, hierarchy, call type mapping, role descriptions, permissions all render correctly after latest deploy

### Xhaka Intelligence
- [ ] Build each specialist agent as a proper defined agent (not one-off prompts) — Architect specs, Builder implements
- [ ] Web dashboard (xhaka-brain) still returning 502 — non-blocking but not resolved
- [ ] tool-monitor job: verify it's running cleanly after Builder fix (schema mismatch fixed in `.last-scan.json`)

### Monitoring Gap
- [ ] No monitoring on the intelligence pipeline itself — if session-capture cron or daily-log breaks silently, nobody knows
- [ ] watchdog job in Railway intelligence service shows `lastRun: never` — still not wired up

---

## People Context

- **Matt (Corey's dad):** Building AI operations layer for NAF/Bristol Sportsplex/podcast. Agents: Nora (NAF), Max (personal), Pia (Sportsplex). Team: Will Riddle + Ben Harrison. Using OpenClaw setup similar to Xhaka.
- **Kyle** — AM (Acquisition Manager)
- **Chris, Daniel** — LMs (Lead Managers)
- **Esteban** — Dispo Manager
- **Jessica** — Data Manager

---

## Commits Landed Tonight (Mar 17–18)
- `6063104` — Inventory gear fixes + Org Settings cleanup
- `4160886` — Calls gear call types + role labels
- `7586b38` — Day Hub KPI trigger toggles
- `357ffe3` — Calls rubrics inline + outcomes edit
- `c5de875` — KPI gear role-aware + spend inputs
- `cf3dd91` — Team gear (invite, hierarchy, call type mapping) + PlaybookHub rebuild (4-layer intelligence)
