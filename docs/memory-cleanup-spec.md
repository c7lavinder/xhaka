# Memory Cleanup Job — Spec

## Purpose
The `memory/` folder grows every session with daily files. Without cleanup, it becomes noise.
This job keeps memory lean, structured, and useful.

## Rules

### Retention Policy
- **< 30 days old:** Keep as-is in `memory/`
- **30–180 days old:** Move to `memory/archive/YYYY-MM/`
- **> 180 days old:** Delete (still in git history if ever needed)

### Summarization
- After archiving a month's files, generate a `memory/archive/YYYY-MM-summary.md`
- Summary format:
  ```
  # [Month Year] — Summary
  ## Key Decisions
  ## Projects Advanced
  ## Rules Established
  ## Open Items Carried Forward
  ```
- Use OpenAI to generate the summary from the archived files

### Execution
- **Schedule:** Weekly, Sunday 6 AM CST
- **Dry run env var:** `DRY_RUN=true` skips actual deletes/moves
- **Log every action:** moved, summarized, deleted

## Files Exempt from Cleanup
- `memory/LEARNINGS.md` — permanent
- `memory/corey-domains.md` — permanent
- `memory/research-state-engine.md` — permanent
- `memory/heartbeat-state.json` — permanent
- `memory/important/` folder — permanent
- `memory/gunner-roadmap.md` — permanent

## Implementation
Add as a new job: `services/intelligence/src/jobs/cleanup.ts`
Register in scheduler with `node-cron` on Sunday 6 AM CST.
