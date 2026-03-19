# Session Memory Capture — 2026-03-18-1946

**Captured at:** Wednesday, March 18, 2026 — 7:46 PM CST
**Sessions reviewed:** 3 most recent real sessions (00acbe83, 4601ddf7-deleted, 1bca7cad)

---

## Key Decisions

- **Gunner = CRM enhancer, not a CRM** — does not own contacts or pipeline (from prior captured session)
- **Inventory page justified** as intelligence/admin layer, not competing CRM (from prior captured session)
- **No full rebuild of Gunner** — only configuration layer needs rebuilding (from prior captured session)
- **Corey approved spawning the Builder** to fix xhaka-intelligence production bugs (session 00acbe83)
- **RAILWAY_API_TOKEN env var** was missing from xhaka-intelligence service — added immediately without needing Builder

---

## Rules Corey Stated

- "Yes and then fix any other gaps" — Corey approved fixing all related production issues, not just the specific ones shown
- "Can you have claude code try again" — preference for Claude Code (ACP) for code fixes; however, Claude Code not installed so subagent handled it
- Timeline: Corey was active Wed 2026-03-18 7:43–7:53 AM CDT reviewing these fixes

---

## Open Tasks / What Was Fixed

### ✅ Completed Today (2026-03-18 AM)

1. **Job registry schema bug** — `job-registry.ts` fixed: missing keys now merge from defaults instead of triggering corruption flag. This unblocked ALL job status writes.
2. **Results log SHA conflict** — `results-log.ts`: 3-retry loop with 100-300ms jitter on GitHub optimistic lock failures
3. **Researcher inbox SHA conflict** — `researcher.ts`: SHA-conflict-safe retry when clearing article-inbox.md
4. **Duplicate enqueue guard** — `capture.ts`: skips researcher enqueue if one already in queue
5. **RAILWAY_API_TOKEN** — Set on xhaka-intelligence Railway service (was missing, operator job was failing)

### ✅ Auditor Subagent (4601ddf7 — PM session, deleted)

6. **`improve` + `cleanup` timeout extension** — Both jobs added to JOB_TIMEOUTS (300s each) since they make 10+ GitHub/OpenAI API calls and were hitting the 60s default timeout
7. **`failureSummary` empty bug** — Fixed: empty failure summary now shows "Job failed (no error captured)" instead of blank

### Infrastructure Status (as of 7:46 PM CST)

- `capture` — was failed since Mar 14, fix deployed Mar 18 AM
- `organize` — was failed since Mar 14, fix deployed Mar 18 AM  
- `improve` — failed since Mar 12, additional timeout fix applied PM
- `cleanup` — failed since Mar 12, additional timeout fix applied PM
- `propagate`, `scribe`, `researcher`, `tool-monitor` — were fine throughout
- `session-memory-capture` cron — was in error status, appears to be running now

---

## Context / Background

- All xhaka-intelligence fixes pushed to main on 2026-03-18 (~7:47 AM CDT commit `9a8bf36e3`)
- Railway auto-deploys from main — services should have restarted post-push
- Workspace sync (MEMORY.md, HEARTBEAT.md, etc.) confirmed identical to GitHub — no sync needed in recent runs
- No new Corey-to-Xhaka conversations after 7:53 AM until this capture window
