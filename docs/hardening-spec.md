# Xhaka Intelligence Service — Hardening Spec

**Author:** The Architect  
**Date:** 2026-03-11  
**Based on:** Researcher audit findings  
**Status:** Ready for Builder implementation  

---

## Overview

This document specifies all 10 hardening fixes for the Xhaka intelligence service running on Railway. Each fix includes exact TypeScript types, file paths, cron strings, and schemas. The Builder should implement these in priority order: CRITICAL → HIGH → MEDIUM.

---

## Current Architecture (for context)

```
services/intelligence/
  src/
    index.ts            ← entry point, env validation, health server
    scheduler.ts        ← all cron registrations + runJobNow()
    jobs/
      capture.ts        ← every 5 min
      propagate.ts      ← daily 6 AM
      improve.ts        ← Monday 6 AM
      cleanup.ts        ← Sunday 6 AM
      organize.ts       ← daily 11 PM
      synthesize.ts     ← every ~5 days 7 AM (BUGGY — see FIX 4)
      tool-monitor.ts   ← daily 6:05 AM
      watchdog.ts       ← every 10 min
      scribe.ts         ← daily midnight
      operator.ts       ← every minute (self-healing)
    utils/
      alert.ts          ← Telegram sendAlert()
      job-registry.ts   ← markJobStart/Success/Failed
    lib/
      github.ts         ← getFileContent, updateFile, createFile, etc.
      railway-api.ts    ← getLatestDeployment, redeployService, rollbackDeployment
      openai.ts         ← synthesize(), generateBuilderLesson(), etc.
data/
  job-registry.json     ← per-job lastRun, lastStatus, expectedIntervalHours
memory/
  context/
    operator-log.md     ← append-only operator action log (UNBOUNDED — see FIX 7)
  projects/
    xhaka-changelog.md  ← daily digest
    gunner-changelog.md ← daily digest
  decisions/
  people/
```

---

## FIX 1 — State Persistence (CRITICAL)

### Problem
`activeRemediations` and `attemptTracker` are JavaScript `Map` objects in operator.ts memory. Every Railway restart (deploy, crash, scale event) wipes them. This allows:
- A job that failed 3× in one window to start the counter over after restart
- Active remediation state to be forgotten mid-attempt

### New Files

#### `data/remediation-state.json` (initial content to commit)
```json
{
  "attempts": {},
  "activeRemediations": {}
}
```

#### `services/intelligence/src/utils/remediation-state.ts` (NEW)

```typescript
// utils/remediation-state.ts
// Persists operator remediation state to GitHub so Railway restarts don't lose it.

import { getFileContent, updateFile, createFile } from '../lib/github.js';

const REPO = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';
const STATE_PATH = 'data/remediation-state.json';
const STALE_THRESHOLD_MS = 25 * 60 * 60 * 1000; // 25 hours

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AttemptRecord {
  count: number;
  firstAttemptAt: string;   // ISO 8601
  lastAttemptAt: string;    // ISO 8601
}

export interface ActiveRemediationRecord {
  attempt: number;
  startedAt: string;        // ISO 8601
  failureType: string;
  lastAction: string;
  waitUntil: string;        // ISO 8601
}

export interface RemediationStateFile {
  attempts: Record<string, AttemptRecord>;
  activeRemediations: Record<string, ActiveRemediationRecord>;
}

// ─── Load ────────────────────────────────────────────────────────────────────

export async function loadRemediationState(): Promise<RemediationStateFile> {
  try {
    const file = await getFileContent(REPO, STATE_PATH);
    if (!file) {
      return { attempts: {}, activeRemediations: {} };
    }
    const parsed = JSON.parse(file.content) as RemediationStateFile;
    return cleanupStaleEntries(parsed);
  } catch (err) {
    console.error('[remediation-state] Failed to load — starting fresh:', (err as Error).message);
    return { attempts: {}, activeRemediations: {} };
  }
}

// ─── Save ────────────────────────────────────────────────────────────────────

export async function saveRemediationState(state: RemediationStateFile): Promise<void> {
  try {
    const file = await getFileContent(REPO, STATE_PATH);
    const content = JSON.stringify(state, null, 2);
    const message = 'chore: remediation-state update';

    if (file?.sha) {
      await updateFile(REPO, STATE_PATH, content, message, file.sha);
    } else {
      await createFile(REPO, STATE_PATH, content, message);
    }
  } catch (err) {
    // Non-fatal — log but don't crash operator
    console.error('[remediation-state] Failed to save:', (err as Error).message);
  }
}

// ─── Cleanup ─────────────────────────────────────────────────────────────────

export function cleanupStaleEntries(state: RemediationStateFile): RemediationStateFile {
  const now = Date.now();
  const cleaned: RemediationStateFile = { attempts: {}, activeRemediations: {} };

  for (const [jobId, record] of Object.entries(state.attempts)) {
    const age = now - new Date(record.lastAttemptAt).getTime();
    if (age < STALE_THRESHOLD_MS) {
      cleaned.attempts[jobId] = record;
    }
  }

  for (const [jobId, record] of Object.entries(state.activeRemediations)) {
    const age = now - new Date(record.startedAt).getTime();
    if (age < STALE_THRESHOLD_MS) {
      cleaned.activeRemediations[jobId] = record;
    }
  }

  return cleaned;
}
```

### Modified Files

#### `services/intelligence/src/jobs/operator.ts`

**Changes:**
1. Remove the `const activeRemediations = new Map<...>()` and `const attemptTracker = new Map<...>()` globals.
2. Add to top of `runOperator()`:
   ```typescript
   import { loadRemediationState, saveRemediationState } from '../utils/remediation-state.js';
   
   // At start of runOperator():
   const persistedState = await loadRemediationState();
   // Hydrate Maps from persisted state
   for (const [jobId, record] of Object.entries(persistedState.activeRemediations)) {
     activeRemediations.set(jobId, record as RemediationState);
   }
   for (const [jobId, record] of Object.entries(persistedState.attempts)) {
     attemptTracker.set(jobId, {
       count: record.count,
       windowStart: new Date(record.firstAttemptAt).getTime(),
     });
   }
   ```
3. After every `activeRemediations.set()` or `activeRemediations.delete()` call, persist:
   ```typescript
   await saveRemediationState({
     attempts: Object.fromEntries(
       [...attemptTracker.entries()].map(([k, v]) => [k, {
         count: v.count,
         firstAttemptAt: new Date(v.windowStart).toISOString(),
         lastAttemptAt: new Date().toISOString(),
       }])
     ),
     activeRemediations: Object.fromEntries(
       [...activeRemediations.entries()].map(([k, v]) => [k, v as ActiveRemediationRecord])
     ),
   });
   ```

### Schema (exact)
```json
{
  "attempts": {
    "<jobName>": {
      "count": 0,
      "firstAttemptAt": "2026-03-11T00:00:00.000Z",
      "lastAttemptAt": "2026-03-11T00:00:00.000Z"
    }
  },
  "activeRemediations": {
    "<jobName>": {
      "attempt": 1,
      "startedAt": "2026-03-11T00:00:00.000Z",
      "failureType": "unknown",
      "lastAction": "restart",
      "waitUntil": "2026-03-11T00:03:00.000Z"
    }
  }
}
```

---

## FIX 2 — Startup Validation (CRITICAL)

### Problem
`index.ts` validates that env vars are *set* but not that they're *valid*. An expired GitHub token, revoked Telegram token, or exhausted OpenAI balance all fail silently at first job run.

### New File

#### `services/intelligence/src/utils/startup-checks.ts` (NEW)

```typescript
// utils/startup-checks.ts
// Validates all external API credentials on service startup.
// Runs all checks regardless of individual failures (no short-circuit).
// Called in index.ts before startScheduler().

import { sendAlert } from './alert.js';
import fs from 'fs/promises';
import path from 'path';

const STARTUP_LOG_PATH = path.resolve('data/startup-errors.log');

// ─── Types ───────────────────────────────────────────────────────────────────

interface CheckResult {
  service: string;
  ok: boolean;
  message: string;
}

// ─── Individual Checks ───────────────────────────────────────────────────────

async function checkGitHub(): Promise<CheckResult> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';

  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (res.status === 401) {
      return { service: 'GitHub', ok: false, message: '🚨 GitHub token expired or invalid' };
    }
    if (res.status === 404) {
      return { service: 'GitHub', ok: false, message: '🚨 GitHub repo not found — check GITHUB_REPO' };
    }
    if (!res.ok) {
      return { service: 'GitHub', ok: false, message: `🚨 GitHub API error: ${res.status}` };
    }
    return { service: 'GitHub', ok: true, message: 'GitHub ✓' };
  } catch (err) {
    return { service: 'GitHub', ok: false, message: `🚨 GitHub network error: ${(err as Error).message}` };
  }
}

async function checkTelegram(): Promise<CheckResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    return { service: 'Telegram', ok: false, message: 'TELEGRAM_BOT_TOKEN not set' };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getMe`, {
      method: 'POST',
    });

    if (res.status === 401) {
      // Can't alert via Telegram if Telegram is broken — log to file instead
      return { service: 'Telegram', ok: false, message: '⚠️ Telegram token invalid or revoked (401)' };
    }
    if (!res.ok) {
      return { service: 'Telegram', ok: false, message: `⚠️ Telegram API error: ${res.status}` };
    }
    return { service: 'Telegram', ok: true, message: 'Telegram ✓' };
  } catch (err) {
    return { service: 'Telegram', ok: false, message: `⚠️ Telegram network error: ${(err as Error).message}` };
  }
}

async function checkOpenAI(): Promise<CheckResult> {
  const key = process.env.OPENAI_API_KEY;

  if (!key) {
    return { service: 'OpenAI', ok: false, message: '🚨 OPENAI_API_KEY not set' };
  }

  try {
    const res = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${key}` },
    });

    if (res.status === 401) {
      return { service: 'OpenAI', ok: false, message: '🚨 OpenAI API key invalid or revoked' };
    }
    if (res.status === 429) {
      return { service: 'OpenAI', ok: false, message: '🚨 OpenAI credits exhausted or rate limited' };
    }
    if (!res.ok) {
      return { service: 'OpenAI', ok: false, message: `🚨 OpenAI API error: ${res.status}` };
    }
    return { service: 'OpenAI', ok: true, message: 'OpenAI ✓' };
  } catch (err) {
    return { service: 'OpenAI', ok: false, message: `🚨 OpenAI network error: ${(err as Error).message}` };
  }
}

async function checkRailway(): Promise<CheckResult> {
  const token = process.env.RAILWAY_API_TOKEN;

  if (!token) {
    // Non-fatal — Railway token is optional for read-only checks
    return { service: 'Railway', ok: true, message: 'Railway token not set — skipping (non-fatal)' };
  }

  try {
    const res = await fetch('https://backboard.railway.app/graphql/v2', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: '{ me { id } }' }),
    });

    if (!res.ok) {
      return { service: 'Railway', ok: false, message: `⚠️ Railway API error: ${res.status} (non-fatal)` };
    }
    return { service: 'Railway', ok: true, message: 'Railway ✓' };
  } catch (err) {
    return { service: 'Railway', ok: false, message: `⚠️ Railway network error: ${(err as Error).message} (non-fatal)` };
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

export async function runStartupChecks(): Promise<void> {
  console.log('[startup-checks] Running credential validation...');

  // Run ALL checks — don't short-circuit
  const results = await Promise.allSettled([
    checkGitHub(),
    checkTelegram(),
    checkOpenAI(),
    checkRailway(),
  ]);

  const checks: CheckResult[] = results.map((r) =>
    r.status === 'fulfilled'
      ? r.value
      : { service: 'unknown', ok: false, message: `Check threw: ${(r.reason as Error).message}` }
  );

  const failures = checks.filter((c) => !c.ok);
  const telegramOk = checks.find((c) => c.service === 'Telegram')?.ok ?? false;

  // Log all results
  for (const check of checks) {
    if (check.ok) {
      console.log(`[startup-checks] ✓ ${check.message}`);
    } else {
      console.error(`[startup-checks] ✗ ${check.message}`);
    }
  }

  if (failures.length === 0) {
    console.log('[startup-checks] All checks passed ✓');
    return;
  }

  // Non-Telegram failures: attempt Telegram alert (if Telegram is working)
  for (const failure of failures) {
    if (failure.service === 'Telegram') {
      // Can't send Telegram alert — write to file
      try {
        await fs.appendFile(
          STARTUP_LOG_PATH,
          `[${new Date().toISOString()}] ${failure.message}\n`,
        );
        console.error('[startup-checks] Telegram failure logged to startup-errors.log');
      } catch {
        console.error('[startup-checks] Could not write startup-errors.log');
      }
    } else if (telegramOk) {
      // Alert via Telegram for non-Telegram failures
      try {
        const { sendAlert } = await import('./alert.js');
        await sendAlert(`🚨 *Startup Check Failed*\n${failure.message}`);
      } catch {
        console.error('[startup-checks] Could not send Telegram alert');
      }
    } else {
      console.error(`[startup-checks] Could not alert for: ${failure.message} (Telegram also down)`);
    }
  }
}
```

### Modified File: `services/intelligence/src/index.ts`

Add after `validateEnv()` and before `startScheduler()`:

```typescript
import { runStartupChecks } from './utils/startup-checks.js';

// In main():
validateEnv();
await runStartupChecks();   // ← ADD THIS LINE

// Support immediate job run...
```

### Startup Check Sequence (exact order)
1. GitHub (`GET /repos/c7lavinder/xhaka`) — fatal if 401
2. Telegram (`POST /getMe`) — non-alertable if fails; writes to `data/startup-errors.log`
3. OpenAI (`GET /models`) — fatal if 401 or 429
4. Railway (GraphQL ping `{ me { id } }`) — non-fatal warning only

All 4 checks run regardless of individual failures. `Promise.allSettled` ensures no short-circuit.

---

## FIX 3 — Daily "I'm Alive" Heartbeat (CRITICAL)

### Problem
If Telegram silently breaks (bot revoked, chat changed, network block), the only indication is Corey noticing silence. There's no backup signal.

### Changes

#### `services/intelligence/src/jobs/scribe.ts` — Step 3 hardening

The existing Step 3 already sends a Telegram summary. Harden it to **always fire** even when Steps 1 or 2 fail:

```typescript
// Current structure (problematic):
try {
  // Step 1: GitHub digest
  // Step 2: Session extraction
  // Step 3: Telegram summary  ← only reached if 1+2 succeed
  await markJobSuccess('scribe', startTime);
} catch (err) {
  await markJobFailed('scribe', startTime);
  await sendAlert(`🚨 SCRIBE FAILED...`);
}

// Fixed structure:
let digestError: Error | null = null;
let extractionError: Error | null = null;

// Step 1: GitHub digest (isolated)
try {
  // ... digest logic
} catch (err) {
  digestError = err as Error;
  console.error('[scribe] Step 1 failed (non-fatal):', digestError.message);
}

// Step 2: Session extraction (isolated)
try {
  // ... extraction logic
} catch (err) {
  extractionError = err as Error;
  console.error('[scribe] Step 2 failed (non-fatal):', extractionError.message);
}

// Step 3: Telegram summary — ALWAYS FIRES (proof of life)
const statusLine = digestError || extractionError
  ? `⚠️ Partial run — digest: ${digestError ? '✗' : '✓'}, extraction: ${extractionError ? '✗' : '✓'}`
  : `✅ ${decisionsCount} decisions, ${totalCommits} commits, ${rulesCount} rules`;

const summary =
  `📋 *Nightly Scribe* — ${dateStr}\n` +
  statusLine + `\n` +
  `🕐 _System alive at ${new Date().toISOString()}_`;

await sendAlert(summary);  // ← Always fires
await markJobSuccess('scribe', startTime);
```

#### `services/intelligence/src/jobs/watchdog.ts` — Weekly heartbeat

Add a weekly "system healthy" message. The watchdog already runs every 10 minutes and presumably sends alerts on failures. Add a new exported function:

```typescript
export async function runWeeklyHeartbeat(): Promise<void> {
  const jobNames = [
    'capture', 'propagate', 'improve', 'cleanup',
    'organize', 'synthesize', 'tool-monitor', 'watchdog',
    'scribe', 'operator',
  ];
  const message =
    `💚 *Xhaka Weekly Heartbeat*\n` +
    `All ${jobNames.length} jobs nominal.\n` +
    `System has been running continuously.\n` +
    `_${new Date().toISOString()}_`;
  await sendAlert(message);
  console.log('[watchdog] Weekly heartbeat sent');
}
```

#### `services/intelligence/src/scheduler.ts` — New cron entry

```typescript
import { runWatchdog, runWeeklyHeartbeat } from './jobs/watchdog.js';

// ADD to startScheduler():
// --- Weekly heartbeat: every Monday at 8:00 AM CST ---
cron.schedule(
  '0 8 * * 1',
  safeRun('watchdog-heartbeat', runWeeklyHeartbeat),
  { timezone: TIMEZONE },
);
```

**Cron strings:**
- Watchdog (existing): `'*/10 * * * *'`
- Weekly heartbeat (new): `'0 8 * * 1'` (Monday 8 AM CST)

---

## FIX 4 — Synthesize Cron Fix (HIGH)

### Problem
`'0 7 */5 * *'` means "day 1, 6, 11, 16, 21, 26, 31 — then skip to day 5 of next month." In February this creates a **10-day gap** (Feb 26 → Mar 5). The `*/5` pattern steps from 0 mod 5, but day 1 is where month starts.

Actual gaps with `*/5`:
- Jan 31 → Feb 5 = 5 days ✓
- Feb 26 → Mar 5 = **7 days** (8 days in a leap year) ✗

### Fix

**`services/intelligence/src/scheduler.ts`:**
```typescript
// BEFORE:
cron.schedule('0 7 */5 * *', safeRun('synthesize', runSynthesize), { timezone: TIMEZONE });

// AFTER:
cron.schedule('0 7 1,6,11,16,21,26 * *', safeRun('synthesize', runSynthesize), { timezone: TIMEZONE });
```

This fires on fixed dates: 1st, 6th, 11th, 16th, 21st, 26th of every month. Maximum gap is 5 days. February is handled correctly (Feb 26 → Mar 1 = 3 days, then Mar 6 = next).

**`data/job-registry.json`** — update synthesize entry:
```json
"synthesize": {
  "lastRun": null,
  "lastStatus": null,
  "durationMs": 0,
  "expectedIntervalHours": 130,
  "gracePeriodMinutes": 120
}
```

Rationale: 5 days = 120h + 10h grace buffer = 130h. Previous value of `168` (7 days) was too lenient.

---

## FIX 5 — Catch-Up on Boot (HIGH)

### Problem
If Railway is down at midnight (deploy, crash, maintenance), `scribe` is silently skipped. The cron fires once, Railway is down, the fire is lost. Node-cron does **not** queue missed jobs.

### New Function in `services/intelligence/src/scheduler.ts`

```typescript
import { getFileContent } from './lib/github.js';

// Jobs excluded from catch-up (high-frequency or already self-recovering)
const CATCHUP_EXCLUDED = new Set(['operator', 'watchdog', 'capture']);

type RegistryEntry = {
  lastRun: string | null;
  expectedIntervalHours: number;
};

export async function catchUpMissedJobs(): Promise<void> {
  console.log('[scheduler] Checking for missed jobs...');

  const REPO = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';
  const file = await getFileContent(REPO, 'data/job-registry.json');
  if (!file) {
    console.warn('[scheduler] Could not load job-registry.json for catch-up check');
    return;
  }

  let registry: Record<string, RegistryEntry>;
  try {
    registry = JSON.parse(file.content);
  } catch {
    console.error('[scheduler] job-registry.json parse failed during catch-up — skipping');
    return;
  }

  const now = Date.now();

  for (const [jobName, entry] of Object.entries(registry)) {
    if (CATCHUP_EXCLUDED.has(jobName)) continue;

    const thresholdMs = entry.expectedIntervalHours * 1.5 * 60 * 60 * 1000;
    const lastRun = entry.lastRun ? new Date(entry.lastRun).getTime() : 0;
    const overdue = !entry.lastRun || (now - lastRun) > thresholdMs;

    if (overdue) {
      console.log(`[scheduler] 🔄 Catching up missed job: ${jobName}`);
      try {
        await runJobNow(jobName);
      } catch (err) {
        console.error(`[scheduler] Catch-up failed for ${jobName}:`, (err as Error).message);
      }
    }
  }

  console.log('[scheduler] Catch-up check complete');
}
```

### Modified: `services/intelligence/src/index.ts`

```typescript
import { startScheduler, runJobNow, catchUpMissedJobs } from './scheduler.js';

// In main(), after startScheduler():
startScheduler();
await catchUpMissedJobs();  // ← ADD THIS
```

**Excluded jobs:** `operator` (runs every minute, self-manages), `watchdog` (every 10 min), `capture` (every 5 min).

**Catch-up threshold:** `expectedIntervalHours * 1.5` — generous enough to ignore brief outages, aggressive enough to catch a full missed cycle.

---

## FIX 6 — OpenAI Silent Failures (HIGH)

### Problem
In `improve.ts`, each lesson call is wrapped in an inner `try/catch` that swallows OpenAI errors. The outer function then marks success. `organize.ts`, `synthesize.ts`, and `cleanup.ts` don't send Telegram alerts when they catch errors — they just log to console.

### Helper Function (add to `services/intelligence/src/utils/alert.ts`)

```typescript
/**
 * Detect OpenAI quota/rate issues from error messages.
 */
export function classifyOpenAIError(err: Error): string {
  const msg = err.message.toLowerCase();
  if (msg.includes('insufficient_quota') || msg.includes('quota')) {
    return '🚨 OpenAI credits exhausted — top up at platform.openai.com/billing';
  }
  if (msg.includes('429') || msg.includes('rate limit') || msg.includes('too many requests')) {
    return '🚨 OpenAI rate limit hit — back off and retry';
  }
  return `🚨 OpenAI error: ${err.message}`;
}
```

### Modified: `services/intelligence/src/jobs/improve.ts`

```typescript
// BEFORE — inner try/catch swallows the error:
for (const commit of failureCommits.slice(0, 10)) {
  try {
    const row = await generateBuilderLesson(context);
    // ...
  } catch (err) {
    console.error('[improve] OpenAI failed for commit lesson:', err);
    // ← Error swallowed. Job continues. Marked success at end.
  }
}

// AFTER — let OpenAI errors propagate to outer catch:
for (const commit of failureCommits.slice(0, 10)) {
  // No inner try/catch — OpenAI failure propagates to outer catch → markJobFailed + alert
  const row = await generateBuilderLesson(context);
  if (row.trim()) {
    newRows.push(row.trim());
  }
}
```

The existing outer `catch` block already calls `markJobFailed` and throws. This is the correct behavior.

### Modified: `services/intelligence/src/jobs/synthesize.ts`

```typescript
import { classifyOpenAIError } from '../utils/alert.js';
import { sendAlert } from '../utils/alert.js';

// In catch block of runSynthesize():
} catch (err) {
  console.error('[synthesize] Fatal error:', err);
  await markJobFailed('synthesize', _startTime);
  const alertMsg = (err instanceof Error)
    ? `🚨 *Synthesize failed*\n${classifyOpenAIError(err)}`
    : '🚨 *Synthesize failed* — unknown error';
  await sendAlert(alertMsg);  // ← ADD THIS
  throw err;
}
```

### Modified: `services/intelligence/src/jobs/organize.ts`

Same pattern — add `await sendAlert(...)` to the catch block before `markJobFailed`.

### Modified: `services/intelligence/src/jobs/cleanup.ts`

Same pattern — add `await sendAlert(...)` to the catch block before `markJobFailed`.

---

## FIX 7 — operator-log.md Rotation (HIGH)

### Problem
`operator-log.md` is append-only. GitHub API rejects files > 1MB. At ~200 bytes per entry, 5,000 entries (~18 months of operator runs) will hit the limit.

### Modified: `services/intelligence/src/jobs/cleanup.ts`

Add `rotateOperatorLog()` and call it during the cleanup run:

```typescript
import { getFileContent, updateFile, createFile } from '../lib/github.js';

const REPO = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';
const OPERATOR_LOG_PATH = 'memory/context/operator-log.md';
const OPERATOR_LOG_SIZE_LIMIT = 50 * 1024; // 50KB

interface RotateTarget {
  path: string;
  archivePath: (yearMonth: string) => string;
  sizeLimit: number;
  freshHeader: string;
}

const ROTATE_TARGETS: RotateTarget[] = [
  {
    path: OPERATOR_LOG_PATH,
    archivePath: (ym) => `memory/archive/${ym}/operator-log.md`,
    sizeLimit: 50 * 1024,  // 50KB
    freshHeader:
      '# Operator Log\n\n' +
      '| Timestamp | Job | Action | Outcome | Attempt | Detail |\n' +
      '|-----------|-----|--------|---------|---------|--------|\n',
  },
  {
    path: 'memory/projects/xhaka-changelog.md',
    archivePath: (ym) => `memory/archive/${ym}/xhaka-changelog.md`,
    sizeLimit: 100 * 1024,  // 100KB
    freshHeader: '# Xhaka Changelog\n\n',
  },
  {
    path: 'memory/projects/gunner-changelog.md',
    archivePath: (ym) => `memory/archive/${ym}/gunner-changelog.md`,
    sizeLimit: 100 * 1024,  // 100KB
    freshHeader: '# Gunner Changelog\n\n',
  },
];

export async function rotateOperatorLog(): Promise<void> {
  const yearMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

  for (const target of ROTATE_TARGETS) {
    try {
      const file = await getFileContent(REPO, target.path);
      if (!file) continue;

      const byteSize = Buffer.byteLength(file.content, 'utf8');
      if (byteSize < target.sizeLimit) {
        console.log(`[cleanup] ${target.path} is ${byteSize} bytes — no rotation needed`);
        continue;
      }

      console.log(`[cleanup] Rotating ${target.path} (${byteSize} bytes > ${target.sizeLimit})`);

      // 1. Archive current to memory/archive/YYYY-MM/
      const archivePath = target.archivePath(yearMonth);
      try {
        const existingArchive = await getFileContent(REPO, archivePath);
        if (existingArchive) {
          await updateFile(
            REPO, archivePath,
            existingArchive.content + '\n\n---\n\n' + file.content,
            `chore(cleanup): archive rotation — append to ${archivePath}`,
            existingArchive.sha,
          );
        } else {
          await createFile(
            REPO, archivePath,
            file.content,
            `chore(cleanup): archive rotation — ${target.path} → ${archivePath}`,
          );
        }
      } catch (err) {
        console.error(`[cleanup] Failed to archive ${target.path}:`, (err as Error).message);
        continue; // Don't truncate if archive failed
      }

      // 2. Write fresh file with header only
      await updateFile(
        REPO, target.path,
        target.freshHeader,
        `chore(cleanup): rotate ${target.path} — archived to ${archivePath}`,
        file.sha,
      );

      console.log(`[cleanup] ✓ Rotated ${target.path} → ${archivePath}`);
    } catch (err) {
      console.error(`[cleanup] Rotation check failed for ${target.path}:`, (err as Error).message);
    }
  }
}

// Call rotateOperatorLog() inside runCleanup() before markJobSuccess
```

---

## FIX 8 — Daily Session Log Writer (HIGH)

### Problem
`scribe.ts` calls `extractSession(dateStr)` which reads `memory/YYYY-MM-DD.md`. Nothing writes that file. The entire memory extraction pipeline is built on a missing foundation.

### New File: `services/intelligence/src/jobs/daily-log.ts` (NEW)

```typescript
// jobs/daily-log.ts
// Runs every 6 hours: reads intelligence/inbox/*.md files and appends to today's memory log.
// This is the write path that feeds scribe.ts.

import { getFileContent, updateFile, createFile, listDirectory } from '../lib/github.js';
import { markJobStart, markJobSuccess, markJobFailed } from '../utils/job-registry.js';

const REPO = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';
const INBOX_PATH = 'intelligence/inbox';

export async function runDailyLog(): Promise<void> {
  const startTime = await markJobStart('daily-log');
  const dateStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const logPath = `memory/${dateStr}.md`;

  console.log(`[daily-log] Running for ${dateStr}...`);

  try {
    // List inbox directory
    let inboxFiles: { name: string; path: string; sha: string; type: string }[];
    try {
      inboxFiles = await listDirectory(REPO, INBOX_PATH);
    } catch {
      console.log('[daily-log] Inbox directory does not exist yet — nothing to process');
      await markJobSuccess('daily-log', startTime);
      return;
    }

    const mdFiles = inboxFiles.filter(
      (f) => f.type === 'file' && f.name.endsWith('.md')
    );

    if (mdFiles.length === 0) {
      console.log('[daily-log] No .md files in inbox — nothing to process');
      await markJobSuccess('daily-log', startTime);
      return;
    }

    console.log(`[daily-log] Found ${mdFiles.length} inbox file(s)`);

    let appendContent = '';

    for (const inboxFile of mdFiles) {
      const file = await getFileContent(REPO, inboxFile.path);
      if (!file || !file.content.trim()) continue;

      appendContent +=
        `\n\n---\n` +
        `<!-- inbox: ${inboxFile.name} @ ${new Date().toISOString()} -->\n\n` +
        file.content.trim() +
        '\n';

      console.log(`[daily-log] Appended: ${inboxFile.name}`);
    }

    if (!appendContent) {
      await markJobSuccess('daily-log', startTime);
      return;
    }

    // Append to today's log
    const existing = await getFileContent(REPO, logPath);
    if (existing) {
      await updateFile(
        REPO,
        logPath,
        existing.content + appendContent,
        `chore(daily-log): append ${mdFiles.length} inbox item(s) [${dateStr}]`,
        existing.sha,
      );
    } else {
      const header = `# Session Log — ${dateStr}\n`;
      await createFile(
        REPO,
        logPath,
        header + appendContent,
        `chore(daily-log): create session log [${dateStr}]`,
      );
    }

    console.log(`[daily-log] ✓ Wrote to ${logPath}`);
    await markJobSuccess('daily-log', startTime);
  } catch (err) {
    console.error('[daily-log] Fatal error:', err);
    await markJobFailed('daily-log', startTime);
    throw err;
  }
}
```

### Modified: `services/intelligence/src/scheduler.ts`

```typescript
import { runDailyLog } from './jobs/daily-log.js';

// ADD to startScheduler():
// --- Daily log writer: every 6 hours ---
cron.schedule(
  '0 */6 * * *',
  safeRun('daily-log', runDailyLog),
  { timezone: TIMEZONE },
);
```

**Cron string:** `'0 */6 * * *'` — fires at 0:00, 6:00, 12:00, 18:00 CST

### Modified: `services/intelligence/src/jobs/scheduler.ts` → `runJobNow()`

```typescript
case 'daily-log':
  await runDailyLog();
  break;
```

### Modified: `data/job-registry.json` — add daily-log entry

```json
"daily-log": {
  "lastRun": null,
  "lastStatus": null,
  "durationMs": 0,
  "expectedIntervalHours": 6,
  "gracePeriodMinutes": 30
}
```

### Modified: `services/intelligence/src/jobs/scribe.ts` — guard missing log

In `extractSession()`, the existing code already handles missing files gracefully:
```typescript
if (!file || file.content.trim().length < 50) {
  console.log(`[scribe] No session log (or too short) for ${dateStr} — skipping extraction`);
  return null;
}
```
✓ Already safe. No change needed. Confirm this guard exists and document that it's intentional.

---

## FIX 9 — job-registry.json Corruption Guard (MEDIUM)

### Problem
`job-registry.ts` calls `JSON.parse(file.content)` without a try/catch. A partial GitHub write (network timeout mid-push) or bit-flip would crash every job that reads the registry.

### Modified: `services/intelligence/src/utils/job-registry.ts`

#### Default registry constant

```typescript
// Default registry — used when JSON is unparseable
const DEFAULT_REGISTRY: JobRegistry = {};

const EXPECTED_KEYS = [
  'capture', 'organize', 'propagate', 'tool-monitor',
  'synthesize', 'improve', 'cleanup', 'scribe',
];
```

#### Updated `writeJobStatus()` — wrap JSON.parse

```typescript
async function writeJobStatus(
  jobName: string,
  status: JobStatus,
  startTime?: number,
): Promise<void> {
  try {
    const file = await getFileContent(REPO, REGISTRY_PATH);

    let registry: JobRegistry;
    if (file) {
      try {
        registry = JSON.parse(file.content) as JobRegistry;

        // Schema validation — verify expected keys exist
        const hasValidStructure = EXPECTED_KEYS.every((key) => key in registry);
        if (!hasValidStructure) {
          console.error('[job-registry] Registry missing expected keys — schema invalid');
          // Alert but don't crash. Use what we have.
          try {
            const { sendAlert } = await import('./alert.js');
            await sendAlert('⚠️ job-registry.json schema invalid — expected keys missing');
          } catch { /* ignore */ }
        }
      } catch (parseErr) {
        console.error('[job-registry] ⚠️ CORRUPTED — JSON.parse failed:', (parseErr as Error).message);
        // Alert Corey
        try {
          const { sendAlert } = await import('./alert.js');
          await sendAlert('🚨 job-registry.json is corrupted — JSON parse failed. Manual fix required.');
        } catch { /* ignore */ }
        // Return empty registry — do NOT write back, do NOT overwrite the corrupt file
        return;
      }
    } else {
      console.warn('[job-registry] Registry file not found — skipping write');
      return;
    }

    // ... rest of writeJobStatus unchanged
```

---

## FIX 10 — npm Lockfile + Dependency Pinning (MEDIUM)

### Current `package.json` audit

All dependencies use `^` (caret) ranges — they allow minor + patch bumps on `npm install`:

| Package | Current | Risk Level | Notes |
|---------|---------|------------|-------|
| `openai` | `^4.82.0` | 🔴 HIGH | OpenAI makes breaking SDK changes frequently |
| `node-cron` | `^3.0.3` | 🟡 MEDIUM | v4.x is in development, likely breaking |
| `@octokit/rest` | `^21.1.1` | 🟡 MEDIUM | Octokit v22 could change auth patterns |
| `typescript` | `^5.8.2` | 🟢 LOW | TS is stable, but strict mode changes possible |
| `tsx` | `^4.19.3` | 🟢 LOW | Dev only |
| `@types/node` | `^22.13.10` | 🟢 LOW | Types only |
| `@types/node-cron` | `^3.0.11` | 🟢 LOW | Types only |

### Recommended changes to `services/intelligence/package.json`

Pin high-risk packages exactly:

```json
"dependencies": {
  "@octokit/rest": "21.1.1",
  "node-cron": "3.0.3",
  "openai": "4.82.0"
},
"devDependencies": {
  "@types/node": "22.13.10",
  "@types/node-cron": "3.0.11",
  "tsx": "4.19.3",
  "typescript": "5.8.2"
}
```

### `package-lock.json`

A `package-lock.json` is **not present** in the repo. This is a significant risk — Railway's `npm install` resolves ranges at deploy time.

**Action:** Run `npm install` in `services/intelligence/` and commit the generated `package-lock.json`. This locks the entire dependency tree including transitive dependencies.

### Modified: `services/intelligence/src/jobs/improve.ts` — weekly dependency check

Add to the weekly improve run (after existing logic):

```typescript
async function checkOutdatedDependencies(): Promise<void> {
  // Read current package.json from repo
  const pkgFile = await getFileContent(XHAKA_REPO, 'services/intelligence/package.json');
  if (!pkgFile) return;

  const pkg = JSON.parse(pkgFile.content);
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const highRiskDeps = ['openai', 'node-cron', '@octokit/rest'];

  const notes: string[] = [];
  for (const depName of highRiskDeps) {
    if (deps[depName]) {
      notes.push(`- ${depName}: currently pinned at ${deps[depName]}`);
    }
  }

  if (notes.length > 0) {
    // Append dependency note to operator log
    await appendOperatorLog({  // or write to a notes file
      timestamp: new Date().toISOString(),
      job: 'improve',
      action: 'classify',
      outcome: 'pending',
      attempt: 0,
      detail: `Dependency check: ${notes.join('; ')}`,
    });
  }
}
```

---

## Implementation Order for the Builder

| Priority | Fix | Estimated Complexity |
|----------|-----|---------------------|
| 1 | FIX 2 — Startup checks | Medium (new file) |
| 2 | FIX 1 — State persistence | Medium (new util + operator.ts wiring) |
| 3 | FIX 4 — Synthesize cron | Trivial (1 string change + JSON update) |
| 4 | FIX 9 — Registry corruption guard | Small (wrap JSON.parse) |
| 5 | FIX 3 — Heartbeat | Small (scribe restructure + new cron) |
| 6 | FIX 6 — OpenAI silent failures | Small (remove inner try/catch + add alerts) |
| 7 | FIX 5 — Catch-up on boot | Medium (new function + index.ts call) |
| 8 | FIX 7 — Log rotation | Medium (new cleanup function) |
| 9 | FIX 8 — Daily log writer | Medium (new job file + scheduler wiring) |
| 10 | FIX 10 — Lockfile + pinning | Small (package.json edits + npm install) |

---

## Summary of All File Changes

### New Files
| Path | Purpose |
|------|---------|
| `data/remediation-state.json` | Persisted operator state |
| `services/intelligence/src/utils/remediation-state.ts` | Load/save/cleanup remediation state |
| `services/intelligence/src/utils/startup-checks.ts` | API credential validation on boot |
| `services/intelligence/src/jobs/daily-log.ts` | Inbox → daily memory log writer |

### Modified Files
| Path | Changes |
|------|---------|
| `services/intelligence/src/index.ts` | Call `runStartupChecks()` + `catchUpMissedJobs()` |
| `services/intelligence/src/scheduler.ts` | Add heartbeat cron, daily-log cron, `catchUpMissedJobs()` |
| `services/intelligence/src/jobs/operator.ts` | Hydrate Maps from persisted state, save after changes |
| `services/intelligence/src/jobs/scribe.ts` | Isolate Steps 1+2, always fire Step 3 |
| `services/intelligence/src/jobs/synthesize.ts` | Add `sendAlert()` to catch block |
| `services/intelligence/src/jobs/organize.ts` | Add `sendAlert()` to catch block |
| `services/intelligence/src/jobs/cleanup.ts` | Add `rotateOperatorLog()` |
| `services/intelligence/src/jobs/improve.ts` | Remove inner try/catch from lesson loop |
| `services/intelligence/src/jobs/watchdog.ts` | Add `runWeeklyHeartbeat()` export |
| `services/intelligence/src/utils/job-registry.ts` | Wrap JSON.parse, add schema validation |
| `services/intelligence/src/utils/alert.ts` | Add `classifyOpenAIError()` helper |
| `services/intelligence/package.json` | Pin all versions exactly |
| `data/job-registry.json` | Update synthesize `expectedIntervalHours` to 130; add daily-log entry |

### Generated (by Builder)
| Path | How |
|------|-----|
| `services/intelligence/package-lock.json` | `npm install` in services/intelligence/ |

---

## Environment Variables Required

No new env vars needed. All fixes use existing:
- `GITHUB_TOKEN` — GitHub API auth
- `GITHUB_REPO` — repo name (default: `c7lavinder/xhaka`)
- `TELEGRAM_BOT_TOKEN` — Telegram alerts
- `TELEGRAM_CHAT_ID` — Corey's chat
- `OPENAI_API_KEY` — OpenAI calls
- `RAILWAY_API_TOKEN` — Railway GraphQL ping (optional, non-fatal if missing)
- `RAILWAY_SERVICE_ID` — used by operator
- `RAILWAY_ENVIRONMENT_ID` — used by operator

---

*Spec complete. Builder takes this doc and implements. Architect reviews output.*
