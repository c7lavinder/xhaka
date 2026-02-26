# HEARTBEAT.md

## Current State (Updated Feb 23, 2026)

### V1 — FULLY PAUSED
- gunner-engine: CRASHED (intentionally stopped)
- All cron jobs: disabled
- Do NOT restart or monitor v1

### V2 — LIVE (as of Feb 25, 2026)
- **URL**: https://gunner-v2-production.up.railway.app
- **Auditor**: https://gunner-v2-production.up.railway.app/audit
- **Hub**: https://gunner-v2-production.up.railway.app/hub
- **DRY_RUN=false** — LIVE. Data Hygiene → Lead IQ → Initial Outreach → Tasks → Stage moves all writing to GHL
- **NEW_LEAD_DRIP_ENABLED=false** — New Lead Drip is HELD. Not activating on new leads yet.
- Manually moved leads today (Omer, Jason, Carla, Moses, Berlinda) — NOT GHL workflows. Safe.

## Pending Decision
- [ ] **Flip NEW_LEAD_DRIP_ENABLED=true** — when Corey is ready to activate new lead drip on new leads
- [ ] New Lead Drip Agent — built, held pending Corey approval

## Do NOT
- Restart gunner-engine (v1)
- Change NEW_LEAD_DRIP_ENABLED without Corey explicitly saying to turn on the drip
