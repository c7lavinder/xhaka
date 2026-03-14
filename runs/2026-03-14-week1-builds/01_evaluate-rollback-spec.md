# Evaluate & Rollback System Spec
**Date:** 2026-03-14
**Author:** The Architect
**Milestone:** Week 1 Build Sprint

---

## Overview

This spec defines two interlocking systems for the Xhaka intelligence service:

1. **System A — Change Evaluator:** A daily job that checks whether applied proposed changes actually improved job quality. If they caused a regression, it triggers rollback.
2. **System B — Rollback Mechanism:** A utility that reverts a change by restoring the original file content via GitHub API, then alerts Corey.

Together, these systems close the feedback loop: Inspect → Propose → Apply → Evaluate → Confirm or Revert.

---

## System A: Change Evaluator (`change-evaluator.ts`)

### Trigger
- Runs daily at **9:00 AM CST** via the scheduler
- Scheduler entry: `'0 9 * * *'` (CST = UTC-6, so `'0 15 * * *'` UTC)

### Logic Flow

```
1. List files in intelligence/proposed-changes/approved/
2. Filter: only files with applied_at field (i.e., actually applied by Builder)
3. For each applied change:
   a. Parse applied_at and before_score from the change file
   b. Load data/evaluation-log.json
   c. Find the FIRST evaluation entry for that job AFTER applied_at timestamp
   d. That entry's score = after_score
   e. Compute verdict:
      - after_score >= before_score - 5  → IMPROVEMENT (or NEUTRAL if delta < 5)
      - after_score < before_score - 5   → REGRESSION
4. Write verdict file to intelligence/change-results/YYYY-MM-DD-{slug}.md
5. If REGRESSION:
   a. Call revertChange(changeFilePath)
   b. Send Telegram alert
   c. Write proposed revert to intelligence/proposed-changes/
6. Skip files that have already been evaluated (check change-results/ for slug)
```

### Verdict Thresholds
| Condition | Verdict |
|-----------|---------|
| `after >= before + 5` | `IMPROVEMENT` |
| `after >= before - 5` | `NEUTRAL` |
| `after < before - 5` | `REGRESSION` |

> Note: evaluator.ts uses a -10 threshold for keep/reset on rolling baseline.
> This system uses a tighter -5 threshold since we're evaluating a specific intentional change.

### Output File Format
Path: `intelligence/change-results/YYYY-MM-DD-{slug}.md`

```markdown
# Change Evaluation — {slug} — {date}

## Verdict: IMPROVEMENT | NEUTRAL | REGRESSION

| Field        | Value              |
|--------------|--------------------|
| Target File  | {targetFile}       |
| Applied At   | {applied_at}       |
| Before Score | {before_score}     |
| After Score  | {after_score}      |
| Delta        | {delta} pts        |
| Evaluated At | {evaluatedAt}      |

## Notes
{notes}
```

### After-Score Resolution Strategy
- Read `data/evaluation-log.json`
- Filter to entries where `jobName` matches the change's target job
- Find the first entry where `evaluatedAt > applied_at`
- If no after-score entry exists yet: **skip this change** (not yet run post-apply)
  - Log: `[change-evaluator] No post-apply score yet for {slug} — will retry tomorrow`

### Job Name Resolution
Extract job name from the change file's `Target:` field:
- `services/intelligence/src/jobs/researcher.ts` → `researcher`
- Pattern: last path segment without `.ts` extension

### Already-Evaluated Guard
Before processing a change, check if `intelligence/change-results/` already contains a file with matching slug. If yes, skip. This prevents duplicate evaluations.

---

## System B: Rollback Utility (`rollback.ts`)

### Function Signature
```typescript
export async function revertChange(changeFilePath: string): Promise<void>
```

### Logic Flow
```
1. Read the proposed change file from changeFilePath
2. Parse:
   - Target: line → targetFile (repo-relative path)
   - ## Current State section → originalContent (the file's content BEFORE the change)
3. Get current SHA of targetFile from GitHub API
4. Update targetFile with originalContent via GitHub API
   - Commit message: "revert: restore {targetFile} — regression detected by change-evaluator"
5. Append revert log entry to intelligence/change-results/reverts.md
6. Send Telegram: "⏪ Reverted change to {targetFile} — regression detected"
```

### Reverts Log Format
Path: `intelligence/change-results/reverts.md`

```markdown
## Reverts Log

| Date       | Target File         | Change File           | Reason      |
|------------|---------------------|-----------------------|-------------|
| 2026-03-14 | src/jobs/foo.ts     | approved/2026-...md   | REGRESSION  |
```

### Error Handling
- If `## Current State` section is missing from change file: log warning, skip revert, send Telegram alert: "⚠️ Cannot revert {changeFile} — no Current State section found"
- If GitHub API fails: log error, send Telegram: "❌ Revert FAILED for {targetFile} — manual intervention required"
- Never throws — always silently continues after alert

---

## Proposed Change File Format (Updated)

Builder must add the following section to a proposed change file when applying it:

```markdown
## Applied
applied_at: 2026-03-14T15:00:00.000Z
before_score: 72
applied_by: builder
```

Builder must ALSO ensure the change file contains a `## Current State` section with the original file content:

```markdown
## Current State
\`\`\`typescript
// original file content here
\`\`\`
```

> This section is what `rollback.ts` uses to restore the file. If it's missing, rollback is impossible.

---

## File Locations Summary

| File | Purpose |
|------|---------|
| `services/intelligence/src/jobs/change-evaluator.ts` | Daily evaluation job |
| `services/intelligence/src/utils/rollback.ts` | Revert utility |
| `intelligence/proposed-changes/approved/` | Applied changes (with `applied_at` + `before_score`) |
| `intelligence/change-results/YYYY-MM-DD-{slug}.md` | Verdict files |
| `intelligence/change-results/reverts.md` | Running revert log |
| `data/evaluation-log.json` | Source of before/after scores |

---

## Build Order for Builder

1. **`rollback.ts`** — pure utility, no dependencies on new code; can be tested standalone
2. **`change-evaluator.ts`** — depends on `rollback.ts`, `evaluator.ts` (existing), `github.ts` (existing), `notifier.ts` (existing)
3. **Scheduler update** — register `runChangeEvaluator` in the cron scheduler at `0 15 * * *` (UTC = 9 AM CST)
4. **README.md update** — update `intelligence/proposed-changes/README.md` to document the new `## Applied` + `## Current State` sections (already done by Architect)
5. **Manual test** — create a dummy approved change file with `applied_at` in the past, inject a post-apply eval-log entry with a score drop > 5, run evaluator manually, verify revert fires

---

## Risks

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| `## Current State` missing from change file — rollback impossible | MEDIUM | Alert Corey immediately; Builder checklist should include this field |
| After-score not yet in eval-log when evaluator runs | HIGH (early days) | Skip and retry tomorrow — not an error state |
| SHA conflict on GitHub update (stale SHA) | LOW | `updateFile` already has retry-on-422 logic |
| Evaluating the same change twice | LOW | Already-evaluated guard checks `change-results/` before processing |
| Wrong job name extracted from Target path | LOW | Regex pattern is simple; add fallback to full path lookup |
| Threshold too tight (-5) causes false REGRESSION | MEDIUM | Tunable constant — expose as `REGRESSION_THRESHOLD` env var |

---

## Environment Variables Required

| Var | Purpose |
|-----|---------|
| `GITHUB_TOKEN` | GitHub API write access (already used by other jobs) |
| `GITHUB_REPO` | `c7lavinder/xhaka` (already used) |
| `TELEGRAM_BOT_TOKEN` | Telegram alerts (already used) |
| `TELEGRAM_CHAT_ID` | Corey's chat ID (already used) |

No new environment variables needed.
