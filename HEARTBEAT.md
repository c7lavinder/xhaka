# HEARTBEAT.md — Pulse Check

> Run on every session start. Check what matters. Raise anything that needs attention.

## Checklist

### 🏗️ Gunner (Product)
- [ ] Any failed Railway deployments? (check gunner-production.up.railway.app and xhaka-brain-production.up.railway.app)
- [ ] Any new GitHub commits that need review? (c7lavinder/Gunner)
- [ ] Is GHL connected? (crmStatus should be `connected` — fixed 2026-03-13)
- [ ] Any Builder tasks in progress or stuck?

### 🏠 New Again Houses (Operations)
- [ ] Any leads stuck in pipeline?
- [ ] Any team performance issues visible in GHL or Gunner?
- [ ] Any KPI inputs overdue?

### 🧠 Xhaka (System Health)
- [ ] Is MEMORY.md current?
- [ ] Is PROJECTS.md current?
- [ ] Are there open decisions waiting on Corey?
- [ ] Did auto-sync push latest changes to github.com/c7lavinder/xhaka?
- [ ] Session-capture cron healthy? (openclaw cron list — check for error status)
- [ ] Intelligence jobs healthy? (check data/job-registry.json for failed/stuck jobs)
- [ ] MEMORY.md under 150 lines?
- [ ] Local workspace synced to GitHub?

## Response Protocol
- All clear → `HEARTBEAT_OK`
- Anything needs attention → specific alert with proposed action
