# Session Memory Capture — 2026-03-19-1549

## Key Findings from Recent Sessions

### 🚨 OPEN ISSUE: Gunner crmStatus DEGRADED
- **Status:** Active since at least 4:14 AM CST (2026-03-19) — multiple heartbeats confirming
- **Symptom:** `/health` returns `{"crmStatus":"degraded"}` — expected "connected"
- **Context:** This was fixed on 2026-03-13 but has regressed
- **Action needed:** Builder should investigate GHL CRM auth/sync regression in gunner-production

### 🚨 OPEN ISSUE: xhaka-control-room Crash Loop
- **Status:** Was in crash loop since ~2 AM CST — hundreds of failed deployments
- **Symptom:** Container starts, logs "Control room running", gets SIGTERM from Railway, restarts
- **Root cause:** Under investigation (Next.js 16.1.6 + Railway config issue)
- **Fix attempted:** nixpacks.toml + railway.json added to repo
- **Current state:** As of 3:44 PM CST, still triggering rebuilds (BUILDING state observed)

### ⚠️ OPEN ISSUE: paperclip-sync Cron Is a No-Op
- Paperclip KB/vector API endpoints (/knowledge, /vectors, /documents) all return 404
- Feature was documented as *future* in Paperclip Discord — not yet shipped
- memory/context/ files are NOT being pushed to Paperclip vectors (but accessible via file reads)
- **Recommendation:** Disable/pause this cron until Paperclip ships the KB plugin

---

## System Health Summary (as of 3:49 PM CST 2026-03-19)

| Service | Status |
|---------|--------|
| gunner-production | ✅ Running (but crmStatus: degraded) |
| xhaka-intelligence | ✅ SUCCESS deploy at 6:43 AM |
| xhaka-control-room | ⚠️ Crash loop / rebuilding |
| xhaka-brain (Postgres) | ✅ DB only — 502 expected |
| All crons | ✅ Healthy (paperclip-sync blocked but not erroring) |
| MEMORY.md | ✅ 126 lines (under 150 limit) |

---

## Cron Schedule (confirmed running)
- paperclip-sync: every 1h
- control-room-sync: every 30m
- workspace-sync: every 30m
- session-memory-capture: every 4h

---

## Context from Memory Files
- Control Room is Next.js 15/16 app (c7lavinder/openclaw-control-room) pulling from GitHub API (c7lavinder/xhaka)
- Old vanilla HTML control room abandoned — too fragile
- GHL crmStatus fix was deployed 2026-03-13 — regression is recent
- Gunner last deploy was SUCCESS 2026-03-13, no new commits since
- xhaka-intelligence last deploy SUCCESS 2026-03-19 at 6:43 AM
