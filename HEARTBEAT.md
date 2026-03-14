# HEARTBEAT.md — Active System Monitor

> Runs automatically every 30 minutes. Sends Telegram alert only when something needs attention. Silent otherwise.

## Automated Checks (every 30 min)
- [ ] Railway xhaka-intelligence deploy status
- [ ] Gunner health endpoint
- [ ] Any fresh job failures (< 2h old)
- [ ] Pending proposed changes (> 3 = reminder)
- [ ] Morning brief confirmation (6:15-7 AM window)

## Manual Heartbeat (Xhaka session start)
Run when Corey opens a session:
- [ ] Any proposed changes in intelligence/proposed-changes/ to review?
- [ ] Any open decisions waiting on Corey?
- [ ] Are MEMORY.md and PROJECTS.md current?
- [ ] Any Builder tasks in progress or stuck?

## Alert Cooldowns
Same alert type: max once per 2 hours
