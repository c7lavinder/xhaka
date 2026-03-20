# HEARTBEAT.md — Pulse Check

> Run on every session start. Check what matters. Raise anything that needs attention.

## Checklist

### 🏗️ Gunner (Product)
- [ ] Any failed Railway deployments? (check xhaka-intelligence and xhaka-control-room)
- [ ] Gunner CRM status: `curl https://gunner-v2-production.up.railway.app/health` — alert if `crmStatus` is not "ok"
- [ ] Any Builder tasks in progress or stuck?

### 🏠 New Again Houses (Operations)
- [ ] Any leads stuck in pipeline?
- [ ] Any team performance issues visible in GHL or Gunner?
- [ ] Any KPI inputs overdue?

### 🧠 Xhaka (System Health)
- [ ] Is MEMORY.md current? (check last synthesis date)
- [ ] Are there open decisions waiting on Corey?
- [ ] Read `data/job-registry.json` — for every job where `lastStatus` is `failed` or `running` for >30 min, alert with job name + last run time
- [ ] Check for jobs that are overdue: weekly jobs (improve, cleanup, synthesize) not run in >8 days = alert
- [ ] MEMORY.md under 150 lines?
- [ ] Local workspace synced to GitHub?

### 🔔 Escalation Rules (CRITICAL — follow exactly)
- If an issue was already reported in the PREVIOUS heartbeat and is still unresolved: **do NOT repeat the alert**. Say once: "[job] still unresolved — waiting on Corey" and move on.
- If something NEW broke since last heartbeat: alert clearly once with proposed action.
- Max 3 alerts per heartbeat. If more than 3 things are wrong, surface only the top 3 by severity.
- Never send 14 identical alerts. That is noise, not signal.

## Response Protocol
- All clear → `HEARTBEAT_OK`
- Anything needs attention → specific alert with proposed action (one per issue, no repeats)

<!-- loop verified: 2026-03-20 -->
