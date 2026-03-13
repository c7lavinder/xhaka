# Foundation Hardening Run — 2026-03-13

**Status:** In Progress  
**Branch:** main  
**Executor:** The Builder (subagent builder-foundation-phase2)

---

## Objective

Harden the xhaka intelligence pipeline foundation. Ensure all jobs:
1. Fail gracefully when required env vars are missing (not silently crash)
2. Correctly report their status to job-registry.json
3. Are resilient to partial failures (don't mark "failed" on a config issue)

---

## Context

As of 2026-03-13, the intelligence service has multiple failing jobs:

| Job | Status | Duration | Root Cause (suspected) |
|-----|--------|----------|----------------------|
| propagate | failed | 0ms | Missing OPENAI_API_KEY or early crash |
| improve | failed | 0ms | Missing OPENAI_API_KEY or early crash |
| cleanup | failed | 0ms | Missing OPENAI_API_KEY or early crash |
| organize | failed | ~11s | Unknown — needs investigation |
| tool-monitor | failed | ~2s | Likely API/config issue |
| watchdog | never run | — | Not writing to job-registry |

The `startup-errors.log` shows 500+ "TELEGRAM_BOT_TOKEN not set" warnings from operator — not a critical failure but worth suppressing in non-alert contexts.

---

## Phases

### Phase 1 — Completed (prior to this run)
- Wrote reliability-scribe-spec.md (System 1: Watchdog + System 2: Scribe)
- Implemented watchdog.ts, scribe.ts, alert.ts
- Added scheduler.ts with all crons registered
- Created job-registry.ts utility

### Phase 2A — Runs Framework
- Create this runs directory structure
- Document current state and hardening objective

### Phase 2B — Job Hardening
- Add `OPENAI_API_KEY` pre-flight guard to jobs that require OpenAI
- Fix `daily-log` expectedIntervalHours inconsistency (registry says 6h, default says 7h → align to 6h)
- Add `watchdog` job to properly track its runs in the registry
- Add env-check utility for reuse across jobs

---

## Success Criteria

- Jobs with missing env vars emit a clear warning and exit cleanly (no "failed" status)
- job-registry.json stays consistent with code defaults
- Watchdog begins appearing in job-registry with successful runs
- Zero unexplained 0ms failures in the registry
