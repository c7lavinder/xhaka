# Session Memory Capture — 2026-03-19-1147

## Key Decisions

- **Heartbeat model → GPT-4o-mini**: Corey decided to switch heartbeat cron model from `claude-sonnet-4-6` to `openai/gpt-4o-mini` to reduce Claude credit spend. (2026-03-19 11:47 AM CST)

## Open Issues / Tasks

### 🚨 ACTIVE — Gunner CRM Degraded
- `crmStatus: degraded` since at least 4:14 AM CST (7.5+ hours)
- GHL sync broken again — regressed from 2026-03-13 fix
- Builder needed to investigate
- Corey said "should be good now" at 10:16 AM but health check still shows degraded
- Status: **UNRESOLVED as of 11:47 AM**

### 🚨 ACTIVE — xhaka-control-room Crash Loop
- Railpack generating `node server.js` instead of `next start`
- All API routes returning 502, homepage loads but functionality dead
- Two failed fix attempts (commits at 9:41 AM + 10:42 AM UTC)
- `control-room-sync`, `workspace-sync`, `paperclip-sync` crons all showing error status
- Builder needed

### ℹ️ Paperclip-Sync Cron — Blocked (Known)
- KB/vector sync API doesn't exist in Paperclip v0.3.1 yet
- Endpoints (/knowledge, /vectors, /documents) all return 404
- No data loss — memory/context files accessible via file reads and memory_search
- Recommendation: disable or pause cron until Paperclip ships KB plugin

## Context

- Claude credits burning fast due to heartbeat frequency (every 30min) hitting claude-sonnet-4-6
- All crons (control-room-sync, workspace-sync, session-memory-capture) run on gpt-4o-mini
- Main Xhaka chat + heartbeats use Claude
- Corey: "I say we move heartbeat to gpt mini" → decision made

## System Status (as of 11:47 AM CST)

| Service | Status |
|---------|--------|
| xhaka (showcase) | ✅ OK |
| xhaka-intelligence | ✅ OK |
| xhaka-control-room | ⚠️ Crash loop |
| gunner-v2 | ⚠️ crmStatus degraded |
| gunner-postgres | ✅ OK |
| links-and-docs | ✅ OK |
