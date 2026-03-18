# Session Memory Capture — 2026-03-18-0746

**Captured:** Wednesday, March 18, 2026 — 7:46 AM CST

---

## Key Decisions

- **Corey approved fixing intelligence service bugs** (Mar 18, ~7:43 AM) — explicitly said "Yes and then fix any other gaps"
- **RAILWAY_API_TOKEN** was set on xhaka-intelligence service by Xhaka (env var fix, no code change needed)
- **Builder spawned** to fix three code-level bugs in services/intelligence/src/

---

## Bugs Fixed (Builder Task — Mar 18, 7:45 AM)

### Bug 1: Job Registry Schema Validation Too Strict (CRITICAL)
- **File:** services/intelligence/src/utils/job-registry.ts
- **Root cause:** New job keys (dispatcher, auditor, architect) added to validation but not present in live GitHub file → all job writes blocked since Mar 14
- **Fix:** Merge defaults for missing keys instead of flagging as corruption

### Bug 2: Results Log SHA Conflict (HIGH)
- **File:** services/intelligence/src/utils/results-log.ts
- **Root cause:** Concurrent jobs read same SHA, second+ write fails with GitHub optimistic lock
- **Fix:** Retry up to 3x with fresh SHA fetch on conflict error

### Bug 3: Article Inbox Bloat (MEDIUM)
- **Files:** services/intelligence/src/jobs/capture.ts + researcher.ts
- **Root cause:** Researcher does not clear article-inbox.md after processing; inbox grew to 370 items
- **Fix:** Researcher clears file after processing; capture guards against re-enqueue if researcher already queued

---

## Open Tasks / Status

- **Builder running** as of 7:45 AM — needs to complete build + push + Railway redeploy
- **Intelligence jobs stuck since Mar 14** (capture, organize) and Mar 12 (improve, cleanup) — should unblock once Builder push lands
- **session-memory-capture cron** was in error status — currently running (this capture)
- **Workspace sync** confirmed all 8 config files in sync with GitHub (no changes needed, Mar 18 7:44 AM)

---

## Rules Stated by Corey (This Session)

- No new rules stated — existing protocols apply
- Confirmed: Xhaka should diagnose and fix without asking for each step

---

## Context

- xhaka-intelligence Railway service: e6a33162-f5ff-4916-a875-0a4fb86c934c
- Repo: c7lavinder/xhaka
- All other Railway services (control-room, xhaka, gunner-v2) — healthy
- MEMORY.md at 111 lines (under 150 limit)
