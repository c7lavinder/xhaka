# Session Capture -- 2026-03-13 (Full Day)
Generated: 2026-03-13-2346 CST

---

## KEY DECISIONS

### Build Workflow Change
- Cursor chat RETIRED as middleman. New workflow: Corey tells Xhaka, Xhaka writes prompt, Claude Code terminal builds.
- Gunner already has REBUILD-PLAN.md (23 sections) and CLAUDE.md -- foundation exists.

### Infrastructure Architecture
- xhaka-brain is a PostgreSQL DB, NOT the intelligence service.
- Intelligence service is xhaka-intelligence in the Xhaka Platform project (separate from Gunner project).
- TOOLS.md was pointing at wrong Railway project. Fixed.
- GitHub = single source of truth.

### Intelligence Pipeline Built Today
- Session-capture cron (every 4h) auto-feeds GitHub inbox -> daily-log -> Scribe.
- Workspace-sync cron (every 30min) syncs 8 core config files to GitHub.
- Both crons verified working at end of day.

### Agent System
- Agent definitions built (Builder, Auditor, Operator, Researcher, Architect, Guide + README) with self-scoping rules.

### Operational Fixes Deployed
- propagate: ran clean after registry reset.
- remediation-state commit flood: fixed via 1h cooldown with GitHub persistence.
- SYSTEM alert flood: fixed via GitHub-persisted lastInfraAlertAt (survives restarts).
- updateFile 422 race condition: fixed with retry-fresh-SHA.
- tool-monitor schema mismatch: fixed.
- 10 new tool profiles created.
- TELEGRAM_BOT_TOKEN set on correct service (xhaka-intelligence).

---

## RULES COREY STATED (PERMANENT)

1. Real fix, always. No patches, no workarounds.
2. Gunner Railway project (f379b683) is OFF LIMITS without explicit approval.
3. Xhaka does NOT build code directly. Spawn the right agent.
4. GitHub must be single source of truth. Every memory write goes to GitHub immediately.
5. When given a checklist, work through it top to bottom. Do not ask where to start.
6. Include the full team on complex tasks: Operator diagnoses, Builder fixes, Auditor validates.
7. Check the repo before asking Corey anything answerable from the codebase.
8. Cursor chat is retired as a planning layer.

---

## OPEN TASKS

### Waiting on Schedule (fixes deployed):
- organize: nightly -- status at capture: RUNNING (first test of 422 fix)
- tool-monitor: 6 AM UTC daily
- improve + cleanup: Monday (weekly)

### Unresolved:
- xhaka 404 domain -- showcase site still unreachable
- Web dashboard 502 -- cosmetic, non-blocking
- Gunner visual reference site -- blocked on Corey input (never shared)
- Gunner rebuild -- on hold until trust established
- Agent definitions need real-world validation

### Verified Working:
- workspace-sync: 0/8 consistently clean
- session-memory-capture: working
- propagate: ran clean
- capture, watchdog, scribe, synthesize, daily-log, operator: running

---

## PEOPLE

- Matt (Corey's dad): Building AI ops layer for NAF, Bristol Sportsplex, podcast.
  Team: Will Riddle (implementation), Ben Harrison (tech lead).
  Agents: Nora (NAF), Max (personal), Pia (Sportsplex).

---

## TRUST STATUS
Corey: 10% trust at start of session. Root cause: discipline failures (touched Gunner without auth,
built code directly, asked questions answerable from repo). Foundation hardening completed to rebuild.
