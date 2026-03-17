# CLAUDE.md — Intelligence Service Builder Context

> Loaded automatically when working in `services/intelligence/`. Read this before touching any file.
> Last updated: 2026-03-16

---

## What This Service Is

`services/intelligence/` is the **autonomous background brain** for Xhaka. It runs 24/7 on Railway, executing 30+ scheduled jobs that keep the entire AI operation running without human intervention. Every job that runs is logged to `data/job-registry.json`. The watchdog job monitors that registry and alerts Corey if anything is stuck or broken.

This is live production infrastructure. Bugs here mean Corey's morning brief doesn't send, intel doesn't get captured, or agent knowledge files go stale. Break this and you'll know — Railway will mark the service unhealthy and Corey will get paged.

---

## What The Service Does (Job Overview)

| Category | Jobs | What They Do |
|----------|------|-------------|
| **Core Loop** | capture, organize, propagate | Capture intel from inbox → route to processed/ → push to agent knowledge files |
| **Intelligence** | researcher, tool-researcher, repo-researcher, morning-brief | Research tasks, tool discovery, daily summaries to Corey |
| **Orchestration** | dispatcher | Reads task queue, routes to specialist agents (researcher, auditor, architect, etc.) |
| **Quality** | inspect, improve, benchmark, change-evaluator, pattern-miner | Self-improvement loops, failure analysis, pattern extraction |
| **Maintenance** | cleanup, synthesize, scribe, daily-log, behavior-sync | Memory maintenance, knowledge synthesis, session logging |
| **Monitoring** | watchdog, heartbeat-check, routing-review, pre-deploy-test | Health checks, alert Corey on failures |
| **On-Demand** | agent-scorecard, feedback, hindsight-sync, voice-ingest | Triggered via task queue by Xhaka |

The **dispatcher** (`src/jobs/dispatcher.ts`) is the routing hub. All on-demand agent work flows through it. When Xhaka queues a task, the dispatcher wakes, reads the queue, and calls the correct job function.

---

## Key Files and Their Purpose

| File | Purpose | Touch? |
|------|---------|--------|
| `src/index.ts` | Entry point, health server on `PORT` | Only for adding health check fields |
| `src/scheduler.ts` | Registers all cron jobs via node-cron | Add new jobs here |
| `src/jobs/dispatcher.ts` | Routes task queue entries to agent functions | Add new agent routes here |
| `src/utils/job-registry.ts` | `markJobStart/Success/Failed` + `EXPECTED_KEYS` | Add new job names to `EXPECTED_KEYS` |
| `src/utils/task-queue.ts` | Queue CRUD — `getPendingTasks`, `completeTask`, etc. | Read to understand queue shape, rarely modify |
| `src/utils/notifier.ts` | Telegram alert system | Use for user-facing notifications |
| `src/lib/github.ts` | Octokit wrapper — `getFileContent`, `updateFile`, `createFile` | Always use this, never raw Octokit |
| `src/lib/openai.ts` | GPT-4o synthesis helpers | Use for AI-powered summarization |
| `src/lib/railway.ts` | Railway GraphQL API client | Use for deployment monitoring jobs |
| `src/utils/smart-scheduler.ts` | `routeModel` — decides which AI model to use | Import for any job calling an AI |
| `src/utils/results-log.ts` | `appendResult` — job output logging | Call from every job that produces output |

---

## The safeRun Pattern — MANDATORY for Every Job

Every job file must follow this exact structure. No exceptions.

```typescript
import { markJobStart, markJobSuccess, markJobFailed } from '../utils/job-registry.js';

export async function runMyJob(): Promise<void> {
  const _startTime = await markJobStart('my-job');

  try {
    console.log('[my-job] Starting...');

    // --- your job logic here ---

    console.log('[my-job] Complete.');
    await markJobSuccess('my-job', _startTime);
  } catch (err) {
    console.error('[my-job] Fatal error:', err);
    await markJobFailed('my-job', _startTime);
    throw err; // re-throw so Railway marks deployment unhealthy
  }
}
```

**Why `throw err` after `markJobFailed`:** Railway watches for non-zero exit codes. Re-throwing propagates the error up to the scheduler, which logs it. The watchdog then detects the failure in job-registry.json and alerts Corey. If you swallow the error, the watchdog stays silent and Corey never knows.

---

## Adding a New Job (Checklist)

When asked to add a new job, follow these steps in order:

1. **Create** `src/jobs/my-job.ts` using safeRun pattern above
2. **Add** the job name to `EXPECTED_KEYS` array in `src/utils/job-registry.ts`
3. **Add** a default entry for it in `DEFAULT_REGISTRY` in `src/utils/job-registry.ts`
4. **Register** in `src/scheduler.ts` — use node-cron syntax with `America/Chicago` timezone
5. **If it's an on-demand job** (triggered by dispatcher): add to `routeToAgent()` switch in `src/jobs/dispatcher.ts`
6. Run `npm run typecheck` — fix all errors
7. Run `npm run build` — verify clean compile

**Cron syntax reference:**
```typescript
// Every 5 minutes
cron.schedule('*/5 * * * *', () => runMyJob(), { timezone: 'America/Chicago' });

// Daily at 6 AM CST
cron.schedule('0 6 * * *', () => runMyJob(), { timezone: 'America/Chicago' });

// Every Monday at 6 AM CST
cron.schedule('0 6 * * 1', () => runMyJob(), { timezone: 'America/Chicago' });

// Every hour
cron.schedule('0 * * * *', () => runMyJob(), { timezone: 'America/Chicago' });
```

---

## Patterns to Follow

### GitHub API Usage

Always use `src/lib/github.ts` wrappers — never raw Octokit:

```typescript
import { getFileContent, updateFile, createFile, listFiles } from '../lib/github.js';

// Read a file
const { content, sha } = await getFileContent('path/to/file.md');

// Update a file (always need the SHA)
await updateFile('path/to/file.md', newContent, sha, 'commit message');

// Create a new file
await createFile('path/to/newfile.md', content, 'commit message');
```

**Rate limit discipline:**
- Never loop over individual files if you can use a tree call
- Add `await new Promise(r => setTimeout(r, 300))` between sequential GitHub writes
- GitHub has a 5,000 req/hour primary limit and a secondary rate limit on fast writes

### OpenAI Usage

```typescript
import { synthesizeContent } from '../lib/openai.js';

// For synthesis/summarization tasks
const result = await synthesizeContent(prompt, content);
```

Use `src/utils/smart-scheduler.ts`'s `routeModel()` to select the right model for the task (fast/cheap vs thorough/expensive).

### Logging Convention

Every log line must include the job name prefix:
```typescript
console.log('[my-job] Starting daily summary...');
console.error('[my-job] Failed to fetch registry:', err.message);
```

This makes Railway logs grep-able. Without the prefix, debugging multi-job runs is impossible.

### Task Queue Tasks (On-Demand Jobs)

If your job is triggered via the task queue (by Xhaka or by other jobs), it receives a `Task` object:

```typescript
import type { Task } from '../utils/task-queue.js';

export async function runMyJob(task?: Task): Promise<string> {
  // task.payload contains the job parameters
  // Return a proof-of-work string (what was done)
  return `Completed: processed ${items.length} items`;
}
```

The dispatcher calls your job and stores the returned string as the proof-of-work in the task entry.

---

## Environment Variables

All env vars are defined in `.env` locally and Railway's variable manager in production. Never hardcode values.

| Variable | Required | Used For |
|----------|----------|---------|
| `GITHUB_TOKEN` | ✅ | All GitHub operations |
| `GITHUB_REPO` | ✅ | `c7lavinder/xhaka` |
| `OPENAI_API_KEY` | ✅ | AI synthesis jobs |
| `RAILWAY_API_TOKEN` | ✅ | Railway monitoring |
| `RAILWAY_SERVICE_ID` | ✅ | Service-specific Railway calls |
| `TELEGRAM_BOT_TOKEN` | ✅ | Corey notifications |
| `TELEGRAM_CHAT_ID` | ✅ | Corey's Telegram ID |
| `PORT` | Optional | Health server (default 3000) |
| `RUN_JOB` | Dev only | One-shot job execution for testing |

Access via: `process.env.GITHUB_TOKEN ?? ''` — never throw if optional, always throw if required.

---

## What NOT to Do

### Never Touch Gunner

`c7lavinder/MANUS-Gunner-AI` is a separate live production system. This intelligence service reads from it (for the `improve` job that analyzes Gunner's git history) but **never writes to it**. Any task that says "update Gunner code" is out of scope — stop and escalate to Xhaka.

### Never Manually Edit data/ Files

`data/job-registry.json`, `data/task-queue.json`, `data/results-log.json` are written by the service at runtime. Manually editing them will cause schema validation failures and may break the watchdog. If you need to reset the registry, use the provided `DEFAULT_REGISTRY` constant — don't hand-edit.

### Never Skip TypeScript Errors

This project runs `"strict": true`. Every type error is real. Do not use `any` or `@ts-ignore` to silence errors — fix the underlying issue. The TypeScript CI workflow (`.github/workflows/ts-check.yml`) will fail your commit if you skip this.

```bash
# Always run before declaring done:
npm run typecheck
npm run build
```

### Never Rewrite Agent Knowledge Files

Files in `agents/*.md` (builder.md, researcher.md, auditor.md, etc.) are managed by the `propagate` job. You may **append** to the `## Intelligence Log` section, but never rewrite or delete existing content. These files are the long-term memory of each agent.

### Never Delete from intelligence/inbox/

The `capture` job handles inbox cleanup. If you delete inbox files manually, the system loses the audit trail of what was processed. The capture job moves files to `intelligence/processed/` after routing — let it do its job.

---

## Common Failure Modes (From Real History)

| Symptom | Root Cause | Fix |
|---------|------------|-----|
| `markJobStart is not a function` | Wrong import path (forgot `.js` extension) | Add `.js` to all local imports |
| GitHub 409 Conflict | Updating file without reading SHA first | Always `getFileContent()` before `updateFile()` |
| GitHub 422 | Committing unchanged content | Check `content !== existingContent` before writing |
| `Cannot read property of undefined` | job-registry missing entry for new job | Add job to `EXPECTED_KEYS` and `DEFAULT_REGISTRY` |
| Scheduler not running job | Job registered but not exported | Verify the function is exported from the job file |
| Railway: service unhealthy | Job threw but didn't re-throw | Add `throw err` after `markJobFailed` |

---

## Before You Say "Done"

Self-audit checklist — verify every item:

- [ ] `npm run typecheck` exits 0
- [ ] `npm run build` exits 0
- [ ] New job added to `EXPECTED_KEYS` in job-registry.ts
- [ ] New job registered in scheduler.ts (if scheduled) or dispatcher.ts (if on-demand)
- [ ] All log lines use `[job-name]` prefix format
- [ ] No hardcoded API keys or env vars
- [ ] No changes to `data/` directory files
- [ ] No changes outside `services/intelligence/` unless task explicitly required it
- [ ] `git status` shows only the files your task was supposed to change

---

*This file is loaded automatically when Builder works in this directory. It is the contract.*
