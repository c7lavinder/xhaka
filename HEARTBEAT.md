# HEARTBEAT.md

## Current State (Updated Feb 23, 2026)

### V1 — FULLY PAUSED
- gunner-engine: CRASHED (intentionally stopped)
- All cron jobs: disabled
- Do NOT restart or monitor v1

### V2 — PIPELINE LIVE (DRY-RUN MODE)
- **URL**: https://gunner-v2-production.up.railway.app
- **Auditor**: https://gunner-v2-production.up.railway.app/audit
- Steps 2→3→4→5 running (Data Hygiene → Lead IQ → Initial Outreach → Working Drip)
- **DRY_RUN=true** — preview mode, nothing writes to GHL
- 4 hot leads ran through successfully in preview (Billy, Rachel, Opal, Charles)
- Corey reviewing dry-run output before approving go-live

## Pending Decision
- [ ] **Flip DRY_RUN=false** — LOCKED. Do NOT change without Corey explicitly saying "go live"
- [x] Fix blank property address in SMS — deployed (e2ac35c)
- [x] Fix company name "New Again Houses Nashville" → "New Again Houses" — deployed
- [ ] Working Drip Agent (Step 6b) — DB-backed 104-day sequence (built, not fully tested)
- [ ] Data Hygiene all 7 outputs — deployed (f55bf5b), needs dry-run review before go-live

## Do NOT
- Restart gunner-engine (v1)
- Change DRY_RUN under ANY circumstances — Corey must explicitly say "go live" or "flip dry run off"
- Send any messages to the 4 existing leads (Billy, Rachel, Opal, Charles)
