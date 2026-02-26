# HEARTBEAT.md

## Current State (Updated Feb 26, 2026)

### V1 — FULLY PAUSED
- gunner-engine: CRASHED (intentionally stopped)
- All cron jobs: disabled
- Do NOT restart or monitor v1

### V2 — DRY_RUN=true (PAUSED — Feb 26, 2026)
- **URL**: https://gunner-v2-production.up.railway.app
- **Auditor**: https://gunner-v2-production.up.railway.app/audit
- **Hub**: https://gunner-v2-production.up.railway.app/hub
- **DRY_RUN=true** — SMS was hitting sellers unexpectedly. Paused until review queue is built.
- **NEW_LEAD_DRIP_ENABLED=false** — New Lead Drip is HELD. Not activating on new leads yet.
- Initial outreach SMS is fine to auto-send. All other SMS needs Kyle review first.

## Pending Decision
- [ ] **Flip DRY_RUN=false** — ONLY after Manus ships message review queue (see MANUS-MESSAGE-REVIEW-QUEUE.md)
- [ ] **Flip NEW_LEAD_DRIP_ENABLED=true** — when Corey is ready, after review queue is live

## Do NOT
- Restart gunner-engine (v1)
- Flip DRY_RUN=false without review queue built and deployed
- Change NEW_LEAD_DRIP_ENABLED without Corey explicitly approving
