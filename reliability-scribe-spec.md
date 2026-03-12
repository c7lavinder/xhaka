# Reliability + Scribe Spec
**Repo:** `c7lavinder/xhaka`
**Author:** The Architect
**Date:** 2026-03-11

---

## Overview

Two systems are defined here:

1. **Watchdog + Reliability** — Job health monitoring with missed-run alerts and health checks
2. **The Scribe** — Nightly memory extraction: GitHub digests + session intelligence routing

---

## File Structure

```
c7lavinder/xhaka/
├── data/
│   └── job-registry.json                          ← Job health state (persistent)
├── docs/
│   └── reliability-scribe-spec.md                 ← This file
├── services/
│   └── intelligence/
│       └── src/
│           ├── jobs/
│           │   ├── capture.ts                      ← Updated: writes to job-registry
│           │   ├── organize.ts                     ← Updated: writes to job-registry
│           │   ├── propagate.ts                    ← Updated: writes to job-registry
│           │   ├── tool-monitor.ts                 ← Updated: writes to job-registry
│           │   ├── synthesize.ts                   ← Updated: writes to job-registry
│           │   ├── improve.ts                      ← Updated: writes to job-registry
│           │   ├── cleanup.ts                      ← Updated: writes to job-registry
│           │   ├── watchdog.ts                     ← NEW: Missed-job alerter
│           │   └── scribe.ts                       ← NEW: Nightly memory extractor
│           ├── utils/
│           │   ├── alert.ts                        ← NEW: Shared Telegram alert fn
│           │   └── github.ts                       ← Existing: GitHub API wrapper
│           └── scheduler.ts                        ← Updated: +watchdog, +scribe crons
└── memory/
    ├── YYYY-MM-DD.md                               ← Daily session logs (Scribe reads these)
    ├── decisions/
    │   └── key-decisions.md                        ← Scribe appends decisions here
    ├── context/
    │   └── rules.md                                ← Scribe appends rules here (create if missing)
    ├── people/
    │   └── {slug}.md                               ← Scribe writes/updates per-person files
    └── projects/
        ├── xhaka-changelog.md                      ← Scribe appends GitHub digest (xhaka)
        ├── gunner-changelog.md                     ← Scribe appends GitHub digest (Gunner)
        └── {slug}.md                               ← Scribe appends project_updates
```

---

## System 1: Watchdog + Reliability

### A. `data/job-registry.json`

**Schema:**
```json
{
  "capture": {
    "lastRun": null,
    "lastStatus": "success",
    "durationMs": 0,
    "expectedIntervalHours": 24,
    "gracePeriodMinutes": 60
  },
  "organize": {
    "lastRun": null,
    "lastStatus": "success",
    "durationMs": 0,
    "expectedIntervalHours": 24,
    "gracePeriodMinutes": 60
  },
  "propagate": {
    "lastRun": null,
    "lastStatus": "success",
    "durationMs": 0,
    "expectedIntervalHours": 24,
    "gracePeriodMinutes": 60
  },
  "tool-monitor": {
    "lastRun": null,
    "lastStatus": "success",
    "durationMs": 0,
    "expectedIntervalHours": 24,
    "gracePeriodMinutes": 60
  },
  "synthesize": {
    "lastRun": null,
    "lastStatus": "success",
    "durationMs": 0,
    "expectedIntervalHours": 168,
    "gracePeriodMinutes": 120
  },
  "improve": {
    "lastRun": null,
    "lastStatus": "success",
    "durationMs": 0,
    "expectedIntervalHours": 24,
    "gracePeriodMinutes": 60
  },
  "cleanup": {
    "lastRun": null,
    "lastStatus": "success",
    "durationMs": 0,
    "expectedIntervalHours": 24,
    "gracePeriodMinutes": 60
  }
}
```

**Field definitions:**
| Field | Type | Description |
|---|---|---|
| `lastRun` | ISO string \| null | UTC timestamp of last successful or failed run |
| `lastStatus` | `"success"` \| `"failed"` \| `"running"` | Most recent terminal status |
| `durationMs` | number | How long the job took (0 if never run) |
| `expectedIntervalHours` | number | How often the job should run |
| `gracePeriodMinutes` | number | Extra buffer before alerting |

---

### B. `services/intelligence/src/utils/alert.ts`

No external dependencies. Raw fetch to Telegram Bot API.

```typescript
// services/intelligence/src/utils/alert.ts

const TELEGRAM_API = 'https://api.telegram.org';

/**
 * Send a Telegram alert to Corey.
 * Uses raw fetch — no external deps.
 * @param message - Markdown-formatted string
 */
export async function sendAlert(message: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn('[alert] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set — skipping alert');
    return;
  }

  if (process.env.DRY_RUN === 'true') {
    console.log('[alert] DRY_RUN — would send:', message);
    return;
  }

  const url = `${TELEGRAM_API}/bot${token}/sendMessage`;
  const body = JSON.stringify({
    chat_id: chatId,
    text: message,
    parse_mode: 'Markdown',
  });

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('[alert] Telegram API error:', res.status, text);
  }
}
```

---

### C. `services/intelligence/src/jobs/watchdog.ts`

Runs every 10 minutes. Checks job registry for overdue jobs and pings health endpoint.

```typescript
// services/intelligence/src/jobs/watchdog.ts

import { sendAlert } from '../utils/alert';
import { getRepoFile } from '../utils/github';

const HEALTH_URL = 'https://xhaka-production.up.railway.app/health';
const JOB_REGISTRY_PATH = 'data/job-registry.json';
const REPO = 'c7lavinder/xhaka';

interface JobEntry {
  lastRun: string | null;
  lastStatus: 'success' | 'failed' | 'running';
  durationMs: number;
  expectedIntervalHours: number;
  gracePeriodMinutes: number;
}

type JobRegistry = Record<string, JobEntry>;

/**
 * Check if a job is overdue based on its registry entry.
 */
function isOverdue(entry: JobEntry): boolean {
  if (!entry.lastRun) return true; // Never ran = overdue

  const lastRunMs = new Date(entry.lastRun).getTime();
  const nowMs = Date.now();
  const intervalMs = entry.expectedIntervalHours * 60 * 60 * 1000;
  const graceMs = entry.gracePeriodMinutes * 60 * 1000;

  return nowMs - lastRunMs > intervalMs + graceMs;
}

/**
 * Format hours since last run as a human-readable string.
 */
function hoursSince(isoTimestamp: string): number {
  const ms = Date.now() - new Date(isoTimestamp).getTime();
  return Math.round(ms / (1000 * 60 * 60) * 10) / 10; // 1 decimal
}

/**
 * Run the health check against the production endpoint.
 */
async function checkHealth(): Promise<void> {
  try {
    const res = await fetch(HEALTH_URL, { method: 'GET' });
    if (!res.ok) {
      await sendAlert(
        `🚨 *HEALTH CHECK FAILED* — \`${HEALTH_URL}\` returned HTTP ${res.status}`
      );
    }
  } catch (err) {
    await sendAlert(
      `🚨 *HEALTH CHECK ERROR* — \`${HEALTH_URL}\` unreachable: ${(err as Error).message}`
    );
  }
}

/**
 * Main watchdog job. Called by scheduler every 10 minutes.
 */
export async function runWatchdog(): Promise<void> {
  console.log('[watchdog] Running at', new Date().toISOString());

  // 1. Health check
  await checkHealth();

  // 2. Load job registry
  let registry: JobRegistry;
  try {
    const raw = await getRepoFile(REPO, JOB_REGISTRY_PATH);
    registry = JSON.parse(raw);
  } catch (err) {
    await sendAlert(`🚨 *WATCHDOG ERROR* — Could not read job-registry.json: ${(err as Error).message}`);
    return;
  }

  // 3. Check each job
  for (const [jobName, entry] of Object.entries(registry)) {
    if (isOverdue(entry)) {
      const hoursAgo = entry.lastRun
        ? `${hoursSince(entry.lastRun)}h ago`
        : 'never';

      const message =
        `🚨 *MISSED JOB* — ${jobName} last ran ${hoursAgo} (expected every ${entry.expectedIntervalHours}h)`;

      console.warn(`[watchdog] ${message}`);
      await sendAlert(message);
    }
  }

  console.log('[watchdog] Done');
}
```

**Cron schedule:** `*/10 * * * *`

---

### D. Job Registry Writer Utility

Add this shared helper so all jobs can write their status without duplicating logic:

```typescript
// services/intelligence/src/utils/job-registry.ts

import { getRepoFile, updateRepoFile } from './github';

const REPO = 'c7lavinder/xhaka';
const PATH = 'data/job-registry.json';

type JobStatus = 'success' | 'failed' | 'running';

/**
 * Mark a job as started (status: 'running').
 */
export async function markJobStarted(jobName: string): Promise<number> {
  return Date.now(); // Returns startTime for duration tracking
}

/**
 * Write job completion status to job-registry.json.
 * @param jobName - Key in job-registry.json
 * @param status - 'success' | 'failed'
 * @param startTime - Timestamp from markJobStarted()
 */
export async function writeJobStatus(
  jobName: string,
  status: JobStatus,
  startTime?: number
): Promise<void> {
  try {
    const raw = await getRepoFile(REPO, PATH);
    const registry = JSON.parse(raw);

    if (!registry[jobName]) {
      console.warn(`[job-registry] Unknown job: ${jobName}`);
      return;
    }

    const now = new Date().toISOString();
    registry[jobName].lastRun = now;
    registry[jobName].lastStatus = status;

    if (startTime) {
      registry[jobName].durationMs = Date.now() - startTime;
    }

    await updateRepoFile(REPO, PATH, JSON.stringify(registry, null, 2), `chore: update job-registry [${jobName}=${status}]`);
  } catch (err) {
    console.error('[job-registry] Failed to write status:', err);
    // Do NOT re-throw — registry failure should never crash a job
  }
}
```

---

### E. Updating Existing Jobs

Each job file should wrap its main logic with this pattern:

```typescript
// Template for any job file (capture, organize, propagate, etc.)
import { writeJobStatus } from '../utils/job-registry';

export async function runJobName(): Promise<void> {
  const startTime = Date.now();
  try {
    // --- existing job logic here ---

    await writeJobStatus('jobName', 'success', startTime);
  } catch (err) {
    console.error('[jobName] Error:', err);
    await writeJobStatus('jobName', 'failed', startTime);
    throw err; // Re-throw so scheduler sees the failure
  }
}
```

**Apply to all 7 jobs:** `capture`, `organize`, `propagate`, `tool-monitor`, `synthesize`, `improve`, `cleanup`

---

## System 2: The Scribe

### A. `services/intelligence/src/jobs/scribe.ts`

Runs nightly at midnight CST. Three phases: GitHub digest → session extraction → Telegram summary.

```typescript
// services/intelligence/src/jobs/scribe.ts

import OpenAI from 'openai';
import { sendAlert } from '../utils/alert';
import { writeJobStatus } from '../utils/job-registry';
import {
  getRepoFile,
  getRecentCommits,
  appendToRepoFile,
  upsertRepoFile,
} from '../utils/github';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const XHAKA_REPO = 'c7lavinder/xhaka';
const GUNNER_REPO = 'c7lavinder/Gunner';
const DRY_RUN = process.env.DRY_RUN === 'true';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface CommitSummary {
  built: string[];
  fixed: string[];
  changed: string[];
}

interface SessionExtraction {
  decisions: { summary: string; date: string; context: string; outcome: string }[];
  tasks: { action: string; owner: string; status: string }[];
  rules: { rule: string }[];
  people: { name: string; role: string; notes: string }[];
  project_updates: { project: string; status: string; notes: string }[];
}

// ─────────────────────────────────────────────
// Step 1: GitHub Digest
// ─────────────────────────────────────────────

/**
 * Fetch commits from the last 24 hours for a repo and summarize them.
 */
async function digestRepo(repo: string): Promise<{ summary: CommitSummary; count: number }> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const commits = await getRecentCommits(repo, since);

  if (!commits || commits.length === 0) {
    return { summary: { built: [], fixed: [], changed: [] }, count: 0 };
  }

  const commitMessages = commits
    .map((c: { sha: string; commit: { message: string } }) =>
      `- ${c.sha.slice(0, 7)}: ${c.commit.message.split('\n')[0]}`
    )
    .join('\n');

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a changelog summarizer. Given a list of git commit messages, extract and categorize changes into three arrays: built (new features/additions), fixed (bug fixes, corrections), changed (refactors, updates, config changes). Be concise — each entry max 15 words. Return valid JSON only.`,
      },
      {
        role: 'user',
        content: `Repo: ${repo}\nCommits from the last 24 hours:\n${commitMessages}\n\nReturn JSON: { "built": [], "fixed": [], "changed": [] }`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
  });

  const summary = JSON.parse(response.choices[0].message.content ?? '{}') as CommitSummary;
  return { summary, count: commits.length };
}

/**
 * Format a CommitSummary into markdown for appending to changelog.
 */
function formatChangelogEntry(repo: string, date: string, summary: CommitSummary, count: number): string {
  const lines: string[] = [
    `\n## ${date} (${count} commits)`,
  ];

  if (summary.built.length > 0) {
    lines.push('### ✅ Built');
    summary.built.forEach(item => lines.push(`- ${item}`));
  }
  if (summary.fixed.length > 0) {
    lines.push('### 🐛 Fixed');
    summary.fixed.forEach(item => lines.push(`- ${item}`));
  }
  if (summary.changed.length > 0) {
    lines.push('### 🔄 Changed');
    summary.changed.forEach(item => lines.push(`- ${item}`));
  }

  if (summary.built.length === 0 && summary.fixed.length === 0 && summary.changed.length === 0) {
    lines.push('_No significant changes._');
  }

  return lines.join('\n');
}

// ─────────────────────────────────────────────
// Step 2: Session Extraction
// ─────────────────────────────────────────────

/**
 * Convert a string to a URL-safe slug.
 */
function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/**
 * Extract structured intelligence from today's daily log using gpt-4o.
 */
async function extractSession(dateStr: string): Promise<SessionExtraction | null> {
  let sessionContent: string;
  try {
    sessionContent = await getRepoFile(XHAKA_REPO, `memory/${dateStr}.md`);
  } catch {
    console.log(`[scribe] No session log found for ${dateStr} — skipping extraction`);
    return null;
  }

  if (!sessionContent || sessionContent.trim().length < 50) {
    console.log(`[scribe] Session log for ${dateStr} is empty or too short — skipping`);
    return null;
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are an intelligence extraction agent. Given a daily session log from an AI COO system, extract structured data into the following categories:

- **decisions**: Key decisions made (with context and outcome)
- **tasks**: Action items (with owner and current status)  
- **rules**: Standing rules or protocols established ("Always do X", "Never do Y")
- **people**: People mentioned (name, role, relevant notes)
- **project_updates**: Project status updates (project name, status, notes)

Be thorough but concise. Omit categories with no content. Return valid JSON only matching the exact schema.`,
      },
      {
        role: 'user',
        content: `Daily session log for ${dateStr}:\n\n${sessionContent}\n\nExtract and return JSON matching this schema exactly:
{
  "decisions": [{"summary": "", "date": "${dateStr}", "context": "", "outcome": ""}],
  "tasks": [{"action": "", "owner": "", "status": ""}],
  "rules": [{"rule": ""}],
  "people": [{"name": "", "role": "", "notes": ""}],
  "project_updates": [{"project": "", "status": "", "notes": ""}]
}`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1,
  });

  return JSON.parse(response.choices[0].message.content ?? '{}') as SessionExtraction;
}

/**
 * Route extracted session data to the correct memory files.
 */
async function routeExtraction(extraction: SessionExtraction, dateStr: string): Promise<void> {
  // Decisions → memory/decisions/key-decisions.md
  if (extraction.decisions?.length > 0) {
    const decisionsBlock = extraction.decisions.map(d =>
      `\n### ${d.summary}\n- **Date:** ${d.date}\n- **Context:** ${d.context}\n- **Outcome:** ${d.outcome}`
    ).join('\n');
    await appendToRepoFile(XHAKA_REPO, 'memory/decisions/key-decisions.md', decisionsBlock,
      `chore(scribe): file ${extraction.decisions.length} decisions [${dateStr}]`);
  }

  // Rules → memory/context/rules.md (create if not exists)
  if (extraction.rules?.length > 0) {
    const rulesBlock = extraction.rules.map(r => `- ${r.rule}`).join('\n');
    await upsertRepoFile(XHAKA_REPO, 'memory/context/rules.md',
      `# Standing Rules\n\n${rulesBlock}`,
      `\n${rulesBlock}`,
      `chore(scribe): add ${extraction.rules.length} rules [${dateStr}]`);
  }

  // People → memory/people/{slug}.md (one file per person)
  if (extraction.people?.length > 0) {
    for (const person of extraction.people) {
      const slug = slugify(person.name);
      const entry = `\n## Update ${dateStr}\n- **Role:** ${person.role}\n- **Notes:** ${person.notes}`;
      const header = `# ${person.name}\n`;
      await upsertRepoFile(XHAKA_REPO, `memory/people/${slug}.md`, header, entry,
        `chore(scribe): update person [${person.name}] [${dateStr}]`);
    }
  }

  // Project updates → memory/projects/{slug}.md
  if (extraction.project_updates?.length > 0) {
    for (const update of extraction.project_updates) {
      const slug = slugify(update.project);
      const entry = `\n## ${dateStr}\n- **Status:** ${update.status}\n- **Notes:** ${update.notes}`;
      const header = `# ${update.project}\n`;
      await upsertRepoFile(XHAKA_REPO, `memory/projects/${slug}.md`, header, entry,
        `chore(scribe): project update [${update.project}] [${dateStr}]`);
    }
  }

  // Tasks → append to today's daily log under ## Tasks
  if (extraction.tasks?.length > 0) {
    const tasksBlock = '\n## Tasks\n' + extraction.tasks.map(t =>
      `- [ ] ${t.action} *(${t.owner})* — ${t.status}`
    ).join('\n');
    await appendToRepoFile(XHAKA_REPO, `memory/${dateStr}.md`, tasksBlock,
      `chore(scribe): append tasks [${dateStr}]`);
  }
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────

export async function runScribe(): Promise<void> {
  const startTime = Date.now();
  const now = new Date();

  // Use CST: UTC-6 (or UTC-5 during DST). Let Railway handle TZ via env.
  const dateStr = now.toISOString().slice(0, 10); // YYYY-MM-DD

  console.log(`[scribe] Starting nightly run for ${dateStr}`);

  try {
    // ── Step 1: GitHub Digest ──────────────────
    const [xhakaResult, gunnerResult] = await Promise.all([
      digestRepo(XHAKA_REPO),
      digestRepo(GUNNER_REPO),
    ]);

    const xhakaEntry = formatChangelogEntry(XHAKA_REPO, dateStr, xhakaResult.summary, xhakaResult.count);
    const gunnerEntry = formatChangelogEntry(GUNNER_REPO, dateStr, gunnerResult.summary, gunnerResult.count);

    if (!DRY_RUN) {
      await appendToRepoFile(XHAKA_REPO, 'memory/projects/xhaka-changelog.md', xhakaEntry,
        `chore(scribe): xhaka digest [${dateStr}]`);
      await appendToRepoFile(XHAKA_REPO, 'memory/projects/gunner-changelog.md', gunnerEntry,
        `chore(scribe): gunner digest [${dateStr}]`);
    } else {
      console.log('[scribe] DRY_RUN — would append changelog entries');
    }

    const totalCommits = xhakaResult.count + gunnerResult.count;

    // ── Step 2: Session Extraction ─────────────
    let decisionsCount = 0;
    let rulesCount = 0;

    const extraction = await extractSession(dateStr);
    if (extraction) {
      decisionsCount = extraction.decisions?.length ?? 0;
      rulesCount = extraction.rules?.length ?? 0;

      if (!DRY_RUN) {
        await routeExtraction(extraction, dateStr);
      } else {
        console.log('[scribe] DRY_RUN — would route:', JSON.stringify(extraction, null, 2));
      }
    }

    // ── Step 3: Telegram Summary ───────────────
    const summary =
      `📋 *Nightly Scribe* — ${dateStr}\n` +
      `✅ ${decisionsCount} decisions filed\n` +
      `🔨 ${totalCommits} commits digested\n` +
      `📌 ${rulesCount} rules captured`;

    await sendAlert(summary);

    await writeJobStatus('scribe', 'success', startTime);
    console.log('[scribe] Done');

  } catch (err) {
    console.error('[scribe] Fatal error:', err);
    await writeJobStatus('scribe', 'failed', startTime);
    await sendAlert(`🚨 *SCRIBE FAILED* — ${dateStr}: ${(err as Error).message}`);
    throw err;
  }
}
```

---

### B. Scheduler Updates (`services/intelligence/src/scheduler.ts`)

```typescript
// Add to existing scheduler.ts

import { runWatchdog } from './jobs/watchdog';
import { runScribe } from './jobs/scribe';

// Existing cron registrations remain unchanged, add:
cron.schedule('*/10 * * * *', async () => {
  console.log('[scheduler] Running watchdog');
  await runWatchdog();
});

cron.schedule('0 0 * * *', async () => {
  console.log('[scheduler] Running scribe (nightly)');
  await runScribe();
}, {
  timezone: 'America/Chicago', // Midnight CST
});

// Add to runJobNow() switch:
// case 'watchdog': await runWatchdog(); break;
// case 'scribe': await runScribe(); break;
```

---

## OpenAI Prompts (Copy-Pasteable)

### Commit Digest Prompt (gpt-4o-mini)

**System:**
```
You are a changelog summarizer. Given a list of git commit messages, extract and categorize changes into three arrays: built (new features/additions), fixed (bug fixes, corrections), changed (refactors, updates, config changes). Be concise — each entry max 15 words. Return valid JSON only.
```

**User:**
```
Repo: {repo}
Commits from the last 24 hours:
{commitMessages}

Return JSON: { "built": [], "fixed": [], "changed": [] }
```

---

### Session Extraction Prompt (gpt-4o)

**System:**
```
You are an intelligence extraction agent. Given a daily session log from an AI COO system, extract structured data into the following categories:

- decisions: Key decisions made (with context and outcome)
- tasks: Action items (with owner and current status)
- rules: Standing rules or protocols established ("Always do X", "Never do Y")
- people: People mentioned (name, role, relevant notes)
- project_updates: Project status updates (project name, status, notes)

Be thorough but concise. Omit categories with no content. Return valid JSON only matching the exact schema.
```

**User:**
```
Daily session log for {dateStr}:

{sessionContent}

Extract and return JSON matching this schema exactly:
{
  "decisions": [{"summary": "", "date": "{dateStr}", "context": "", "outcome": ""}],
  "tasks": [{"action": "", "owner": "", "status": ""}],
  "rules": [{"rule": ""}],
  "people": [{"name": "", "role": "", "notes": ""}],
  "project_updates": [{"project": "", "status": "", "notes": ""}]
}
```

---

## Alert Message Templates

| Trigger | Template |
|---|---|
| Missed job | `🚨 *MISSED JOB* — {jobName} last ran {X}h ago (expected every {Y}h)` |
| Job never ran | `🚨 *MISSED JOB* — {jobName} last ran never (expected every {Y}h)` |
| Health check fail | `🚨 *HEALTH CHECK FAILED* — \`{url}\` returned HTTP {status}` |
| Health check error | `🚨 *HEALTH CHECK ERROR* — \`{url}\` unreachable: {error}` |
| Registry unreadable | `🚨 *WATCHDOG ERROR* — Could not read job-registry.json: {error}` |
| Scribe failed | `🚨 *SCRIBE FAILED* — {date}: {error}` |
| Nightly summary | `📋 *Nightly Scribe* — {date}\n✅ {N} decisions filed\n🔨 {N} commits digested\n📌 {N} rules captured` |

---

## Memory Routing Logic

The Scribe routes extracted items to these locations. This table is the ground truth for `routeExtraction()`:

| Extraction key | Target path | Action | Notes |
|---|---|---|---|
| `decisions` | `memory/decisions/key-decisions.md` | Append | H3 heading per decision |
| `rules` | `memory/context/rules.md` | Upsert | Create file if missing; append bullet list |
| `people[*]` | `memory/people/{slugify(name)}.md` | Upsert | One file per person; header on create, update block on existing |
| `project_updates[*]` | `memory/projects/{slugify(project)}.md` | Upsert | One file per project |
| `tasks` | `memory/{YYYY-MM-DD}.md` | Append | Under `## Tasks` section in today's log |

**Slugify rules:** lowercase, replace non-alphanumeric runs with `-`, trim leading/trailing `-`.

---

## Environment Variables

### Required on Railway (Xhaka project)

| Variable | Value | Purpose |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | OpenClaw's bot token | Watchdog + Scribe alerts |
| `TELEGRAM_CHAT_ID` | `8031111945` | Corey's Telegram user ID |
| `OPENAI_API_KEY` | Existing | gpt-4o-mini (digest) + gpt-4o (extraction) |
| `GITHUB_TOKEN` | Existing (`ghp_...`) | Read commits, read/write memory files |
| `DRY_RUN` | `true` \| `false` | Set `true` to log-only, skip writes/alerts |

### Optional

| Variable | Default | Purpose |
|---|---|---|
| `TZ` | `America/Chicago` | Ensures scribe cron fires at midnight CST |

---

## Implementation Notes

1. **`getRepoFile` / `updateRepoFile` / `appendToRepoFile` / `upsertRepoFile`** — The existing `github.ts` likely has `getRepoFile`. The Builder needs to add:
   - `getRecentCommits(repo, since)` — GitHub List Commits API with `?since=` param
   - `appendToRepoFile(repo, path, content, commitMsg)` — get file, base64-decode, append, put back
   - `upsertRepoFile(repo, path, createContent, appendContent, commitMsg)` — create if 404, else append

2. **Watchdog skips alerting if `lastStatus === 'running'`** — prevents false alerts during slow jobs. Add this check to `isOverdue()` if needed.

3. **Scribe uses CST timezone** — Set `TZ=America/Chicago` on Railway or rely on `timezone` option in node-cron.

4. **job-registry.json is committed back to the repo** — This means every job writes a commit. The Builder may want to batch or use a Railway volume instead if commit noise becomes a problem. Document the trade-off.

5. **Rate limits** — gpt-4o-mini (digest) is fast and cheap. gpt-4o (extraction) is one call per day. No batching needed.

---

## Acceptance Criteria

### Watchdog
- [ ] `data/job-registry.json` exists with all 7 jobs
- [ ] `watchdog.ts` runs on `*/10 * * * *` cron
- [ ] Overdue jobs trigger Telegram alert in correct format
- [ ] Health check to `/health` fires every 10 min; non-200 alerts
- [ ] All 7 existing jobs write to job-registry on completion and error
- [ ] `alert.ts` has no external deps; respects `DRY_RUN`

### Scribe
- [ ] `scribe.ts` runs at midnight CST daily
- [ ] Fetches commits from both `xhaka` and `Gunner` repos
- [ ] Summarizes via gpt-4o-mini; appends to correct changelog files
- [ ] Reads today's daily log; extracts via gpt-4o Structured Outputs
- [ ] Routes decisions, rules, people, project_updates, tasks to correct files
- [ ] Sends nightly Telegram summary with correct counts
- [ ] Respects `DRY_RUN=true`
- [ ] Both jobs appear in `runJobNow()` switch
