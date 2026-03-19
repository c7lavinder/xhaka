# Session Memory Capture
Timestamp: 2026-03-19 07:47 AM CST

---

## OPEN ISSUES (Action Required)

### 1. Gunner CRM - crmStatus DEGRADED (Critical, Persistent)
- Status: DEGRADED since at least 4:14 AM CST 2026-03-19 (5+ consecutive heartbeats)
- Expected: crmStatus connected (was fixed 2026-03-13, has regressed)
- Impact: GHL sync broken - calls not pulling into Gunner
- Action Needed: Spawn Builder to investigate GHL crmStatus regression
- Note: Was originally fixed 2026-03-13 with saveGhlTokens merge fix + triggerSync background job

### 2. xhaka-control-room - Crash Loop (Critical)
- Status: In crash loop since ~2:00 AM CST 2026-03-19 (hundreds of failed deploys)
- Root Cause: Railpack building node server.js wrapper instead of next start. Custom server does not serve Next.js API routes, all API routes 502, Railway health check kills container, restart loop
- Symptoms: Home page loads (static), all API routes 502, container starts then gets SIGTERM within seconds
- Two failed fix attempts: commits at 09:41 UTC + 10:42 UTC tried to force Nixpacks, did not resolve
- Action Needed: Spawn Builder to fix Railpack/Nixpacks conflict in xhaka-control-room

### 3. paperclip-sync Cron - Blocked (Non-Critical)
- Status: Cron runs but has no effect - KB/vector sync API does not exist in Paperclip v0.3.1
- Root Cause: The KB plugin is a planned/future Paperclip feature. Cron was set up before the feature shipped.
- Impact: memory/context/ files are NOT being pushed to Paperclip vectors. Files still accessible via file reads + memory_search. No data loss.
- Action Needed: Disable or pause paperclip-sync cron until Paperclip ships KB plugin.

---

## Systems Healthy
- xhaka-intelligence: SUCCESS deploy at 6:43 AM CST (2026-03-19)
- Gunner Railway: Last deploy SUCCESS (2026-03-13), no new commits
- All other crons: healthy
- MEMORY.md: 126 lines (under 150 limit)
- PROJECTS.md: exists and current

---

## Key Facts
- Railway token: available in TOOLS.md
- Gunner production URL: gunner-production.up.railway.app
- Control Room Railway service: 629682d3-c8d4-4907-9845-304587be36b2
- Gunner Railway project: f379b683-e34d-4e0e-a91a-f64d0ab499ea
- GHL crmStatus was fixed 2026-03-13 - regression confirms it is flaky/auth-related

---

## Rules / Decisions Noted
- Xhaka does NOT build, code, or deploy ever. Spawn Builder for any code fix.
- Builder prompts must have 3 sections: SPEC, PLAN, TASKS before spawning.
- GHL read-only unless Corey explicitly approves an action.
- MEMORY.md must not exceed 150 lines.
