# Operator Agent Spec
## Xhaka Railway — Autonomous Self-Healing System

**Version:** 1.0.0  
**Date:** 2026-03-11  
**Author:** Architect (Subagent)  
**Status:** Approved for Implementation

---

## Overview

The Operator Agent is a self-healing autonomous system that monitors all registered jobs in the Xhaka Railway project. It runs every 60 seconds, detects failures, classifies the failure type, executes a structured remediation ladder, and escalates to humans only when necessary.

It never touches the database, never commits code, and never deletes services. Its only tools are Railway API calls, log reading, and Telegram alerts.

---

## Environment Variables

```
RAILWAY_API_TOKEN=107983f5-06cc-40b3-92d6-833004dee064
RAILWAY_SERVICE_ID=e6f2c6d7-75a4-4573-b142-63869d0e1b4c   # xhaka-intelligence
RAILWAY_ENVIRONMENT_ID=7dba9cea-edc6-4d8c-8ebd-29c20bf11a2e
```

---

## File: `services/intelligence/src/lib/railway-api.ts`

### TypeScript Types

```typescript
export interface DeploymentInfo {
  id: string;
  status: 'SUCCESS' | 'FAILED' | 'DEPLOYING' | 'CRASHED' | 'REMOVED' | 'SLEEPING';
  canRollback: boolean;
  createdAt: string;
  url?: string;
}

export interface RailwayApiResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}
```

### GraphQL Queries (Verbatim)

```graphql
# getLatestDeployment
query GetLatestDeployment($serviceId: String!, $environmentId: String!) {
  deployments(
    first: 2
    input: {
      serviceId: $serviceId
      environmentId: $environmentId
    }
  ) {
    edges {
      node {
        id
        status
        canRollback
        createdAt
        staticUrl
      }
    }
  }
}

# getDeploymentLogs
query GetDeploymentLogs($deploymentId: String!, $limit: Int!) {
  deploymentLogs(deploymentId: $deploymentId, limit: $limit) {
    message
    timestamp
    severity
  }
}

# restartDeployment (mutation)
mutation RestartDeployment($deploymentId: String!) {
  deploymentRestart(id: $deploymentId)
}

# redeployService (mutation)
mutation RedeployService($serviceId: String!, $environmentId: String!) {
  serviceInstanceRedeploy(
    serviceId: $serviceId
    environmentId: $environmentId
  )
}

# rollbackDeployment (mutation)
mutation RollbackDeployment($deploymentId: String!) {
  deploymentRollback(id: $deploymentId)
}
```

### Implementation

```typescript
import fetch from 'node-fetch';

const RAILWAY_API_URL = 'https://backboard.railway.app/graphql/v2';

async function railwayRequest<T>(
  query: string,
  variables: Record<string, unknown>
): Promise<T> {
  const token = process.env.RAILWAY_API_TOKEN;
  if (!token) throw new Error('RAILWAY_API_TOKEN not set');

  const res = await fetch(RAILWAY_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = (await res.json()) as RailwayApiResponse<T>;
  if (json.errors?.length) {
    throw new Error(`Railway API error: ${json.errors[0].message}`);
  }
  return json.data as T;
}

export async function getLatestDeployment(
  serviceId: string,
  environmentId: string
): Promise<{ current: DeploymentInfo; prior: DeploymentInfo | null }> {
  const data = await railwayRequest<{
    deployments: { edges: Array<{ node: DeploymentInfo }> };
  }>(GET_LATEST_DEPLOYMENT_QUERY, { serviceId, environmentId });

  const edges = data.deployments.edges;
  return {
    current: edges[0]?.node ?? null,
    prior: edges[1]?.node ?? null,
  };
}

export async function getDeploymentLogs(
  deploymentId: string,
  limit = 50
): Promise<string[]> {
  const data = await railwayRequest<{
    deploymentLogs: Array<{ message: string; timestamp: string; severity: string }>;
  }>(GET_DEPLOYMENT_LOGS_QUERY, { deploymentId, limit });

  return data.deploymentLogs.map((l) => `[${l.severity}] ${l.message}`);
}

export async function restartDeployment(deploymentId: string): Promise<boolean> {
  try {
    await railwayRequest(RESTART_DEPLOYMENT_MUTATION, { deploymentId });
    return true;
  } catch {
    return false;
  }
}

export async function redeployService(
  serviceId: string,
  environmentId: string
): Promise<boolean> {
  try {
    await railwayRequest(REDEPLOY_SERVICE_MUTATION, { serviceId, environmentId });
    return true;
  } catch {
    return false;
  }
}

export async function rollbackDeployment(deploymentId: string): Promise<boolean> {
  try {
    await railwayRequest(ROLLBACK_DEPLOYMENT_MUTATION, { deploymentId });
    return true;
  } catch {
    return false;
  }
}
```

---

## File: `services/intelligence/src/jobs/operator.ts`

### TypeScript Types

```typescript
export type FailureType =
  | 'code_bug'
  | 'network_transient'
  | 'missing_env'
  | 'rate_limit'
  | 'railway_infra'
  | 'unknown';

export type RemediationAction =
  | 'restart'
  | 'redeploy'
  | 'rollback'
  | 'escalate'
  | 'wait_retry';

export interface JobEntry {
  id: string;
  name: string;
  serviceId: string;
  environmentId: string;
  lastStatus: 'success' | 'failed' | 'running' | 'unknown';
  lastRun: string; // ISO timestamp
}

export interface RemediationState {
  jobId: string;
  attempt: number;             // 1, 2, or 3
  startedAt: string;           // ISO timestamp
  failureType: FailureType;
  lastAction: RemediationAction;
  waitUntil: string;           // ISO timestamp — don't re-check until this time
}

export interface OperatorLogEntry {
  timestamp: string;
  job: string;
  action: RemediationAction | 'classify' | 'alert';
  outcome: 'success' | 'failed' | 'pending' | 'escalated';
  attempt: number;
  detail?: string;
}
```

### Failure Classification — Regex Patterns

```typescript
export const FAILURE_PATTERNS: Record<FailureType, RegExp> = {
  code_bug:          /TypeError|ReferenceError|SyntaxError|at\s+\w+\s+\(.*:\d+:\d+\)|Error: Cannot|UnhandledPromiseRejection/i,
  network_transient: /ETIMEDOUT|ECONNRESET|ECONNREFUSED|ENOTFOUND|socket hang up|network timeout/i,
  missing_env:       /missing env|undefined.*process\.env|environment variable|is not defined|Cannot read propert(y|ies).*undefined.*env/i,
  rate_limit:        /429|rate.?limit|too many requests|Retry-After/i,
  railway_infra:     /^$/,   // No logs at all — handled by log.length === 0 check
  unknown:           /.*/,   // Fallback
};

export function classifyFailure(logs: string[]): FailureType {
  if (logs.length === 0) return 'railway_infra';

  const logText = logs.join('\n');

  // Order matters — check most critical first
  if (FAILURE_PATTERNS.missing_env.test(logText)) return 'missing_env';
  if (FAILURE_PATTERNS.code_bug.test(logText))     return 'code_bug';
  if (FAILURE_PATTERNS.rate_limit.test(logText))   return 'rate_limit';
  if (FAILURE_PATTERNS.network_transient.test(logText)) return 'network_transient';

  return 'unknown';
}
```

### Remediation State Machine

```
                        ┌─────────────────────────────────────────┐
                        │           JOB FAILURE DETECTED          │
                        └──────────────┬──────────────────────────┘
                                       │
                        ┌──────────────▼──────────────┐
                        │    Classify Failure Type     │
                        │  (read last 50 log lines)    │
                        └──────────────┬──────────────┘
                                       │
             ┌─────────────────────────┼─────────────────────────┐
             │                         │                         │
     missing_env?               code_bug?              3+ jobs failed?
      ┌──────▼──────┐         ┌────────▼────────┐    ┌──────────▼──────────┐
      │  ESCALATE   │         │    ROLLBACK     │    │  ESCALATE (infra)   │
      │  TIER 3     │         │  immediately    │    │  TIER 3             │
      │  (no retry) │         │  then TIER 3   │    │  (no retry)         │
      └─────────────┘         └─────────────────┘   └─────────────────────┘
                                       │
                    ┌──────────────────▼────────────────────┐
                    │           ATTEMPT 1                    │
                    │   Action: serviceInstanceRedeploy      │
                    │   Wait:   3 minutes                    │
                    └──────────────────┬────────────────────┘
                                       │
                          ┌────────────▼────────────┐
                          │  Check lastStatus again  │
                          └────────────┬────────────┘
                                       │
                          ┌────────────▼────────────┐
                          │      success?            │◄── YES → DONE ✅
                          └────────────┬────────────┘
                                    NO │
                    ┌──────────────────▼────────────────────┐
                    │           ATTEMPT 2                    │
                    │   Action: deploymentRedeploy           │
                    │   (most recent deployment)             │
                    │   Wait:   3 minutes                    │
                    └──────────────────┬────────────────────┘
                                       │
                          ┌────────────▼────────────┐
                          │      success?            │◄── YES → DONE ✅
                          │  (Tier 2 log to Xhaka)  │
                          └────────────┬────────────┘
                                    NO │
                    ┌──────────────────▼────────────────────┐
                    │           ATTEMPT 3                    │
                    │   Action: deploymentRollback           │
                    │   (prior stable deployment)            │
                    │   Wait:   3 minutes                    │
                    └──────────────────┬────────────────────┘
                                       │
                          ┌────────────▼────────────┐
                          │      success?            │◄── YES → DONE ✅
                          └────────────┬────────────┘
                                    NO │
                    ┌──────────────────▼────────────────────┐
                    │        TIER 3 ESCALATION               │
                    │   Telegram alert to Corey              │
                    │   Full diagnosis attached              │
                    └───────────────────────────────────────┘

HARD LIMITS:
  - Max 3 attempts per job per 24h window
  - isRunning flag prevents overlapping operator runs
  - network_transient: backoff wait (no redeploy) → retry same action
  - rate_limit: wait Retry-After duration → retry same action
```

### Alert Message Templates

#### Tier 1 — Operator Handles Silently
```
No external alert. Internal operator-log entry only:
{
  "timestamp": "<ISO>",
  "job": "<job-name>",
  "action": "restart",
  "outcome": "pending",
  "attempt": 1
}
```

#### Tier 2 — Xhaka Notified (operator-log.md append)
```markdown
## ⚠️ Tier 2 Alert — {job} — {timestamp}

2 remediation attempts failed.
- Failure type: {failure_type}
- Attempts tried: restart → redeploy
- Next: rollback attempt in progress
- Monitoring...
```

#### Tier 3 — Corey Telegram Alert
```
🚨 *Operator Escalation* — {job}
Failed after 3 attempts.
Diagnosis: {failure_type}
Last error: {last_log_line}
Actions tried: restart → redeploy → rollback
Needs: human intervention
```

Additional Tier 3 triggers:
```
🚨 *Operator Escalation* — IMMEDIATE
{job} has a {missing_env|code_bug} failure.
Cannot auto-remediate.
Last error: {last_log_line}
Needs: human intervention now
```

```
🚨 *Operator Escalation* — RAILWAY INFRA
{N} jobs failed simultaneously: {job1}, {job2}, {job3}
Likely Railway infrastructure issue.
No auto-remediation attempted.
Check: https://status.railway.app
```

---

### Full Implementation: `operator.ts`

```typescript
import cron from 'node-cron';
import fs from 'fs/promises';
import path from 'path';
import {
  getLatestDeployment,
  getDeploymentLogs,
  restartDeployment,
  redeployService,
  rollbackDeployment,
} from '../lib/railway-api';

// ─── Types ─────────────────────────────────────────────────────────────────

export type FailureType =
  | 'code_bug'
  | 'network_transient'
  | 'missing_env'
  | 'rate_limit'
  | 'railway_infra'
  | 'unknown';

export type RemediationAction =
  | 'restart'
  | 'redeploy'
  | 'rollback'
  | 'escalate'
  | 'wait_retry';

export interface JobEntry {
  id: string;
  name: string;
  serviceId: string;
  environmentId: string;
  lastStatus: 'success' | 'failed' | 'running' | 'unknown';
  lastRun: string;
}

export interface RemediationState {
  jobId: string;
  attempt: number;
  startedAt: string;
  failureType: FailureType;
  lastAction: RemediationAction;
  waitUntil: string;
}

export interface OperatorLogEntry {
  timestamp: string;
  job: string;
  action: RemediationAction | 'classify' | 'alert';
  outcome: 'success' | 'failed' | 'pending' | 'escalated';
  attempt: number;
  detail?: string;
}

// ─── Globals ───────────────────────────────────────────────────────────────

let isRunning = false; // Debounce flag — prevents overlapping runs

// In-memory remediation tracker: jobId → RemediationState
const activeRemediations = new Map<string, RemediationState>();

// 24h attempt counter: jobId → { count, windowStart }
const attemptTracker = new Map<string, { count: number; windowStart: number }>();

const WAIT_BETWEEN_ATTEMPTS_MS = 3 * 60 * 1000; // 3 minutes
const MAX_ATTEMPTS_PER_24H = 3;

// ─── Failure Classification ─────────────────────────────────────────────────

const FAILURE_PATTERNS: Record<Exclude<FailureType, 'railway_infra' | 'unknown'>, RegExp> = {
  missing_env:       /missing env|undefined.*process\.env|environment variable.*not (set|found)|is not defined|Cannot read propert(y|ies) .* undefined/i,
  code_bug:          /TypeError|ReferenceError|SyntaxError|at\s+\S+\s+\(.*:\d+:\d+\)|UnhandledPromiseRejection|Error: Cannot/i,
  rate_limit:        /429|rate.?limit|too many requests|Retry-After/i,
  network_transient: /ETIMEDOUT|ECONNRESET|ECONNREFUSED|ENOTFOUND|socket hang up|network timeout/i,
};

function classifyFailure(logs: string[]): FailureType {
  if (logs.length === 0) return 'railway_infra';
  const logText = logs.join('\n');
  if (FAILURE_PATTERNS.missing_env.test(logText))       return 'missing_env';
  if (FAILURE_PATTERNS.code_bug.test(logText))          return 'code_bug';
  if (FAILURE_PATTERNS.rate_limit.test(logText))        return 'rate_limit';
  if (FAILURE_PATTERNS.network_transient.test(logText)) return 'network_transient';
  return 'unknown';
}

// ─── 24h Attempt Guard ──────────────────────────────────────────────────────

function canAttemptRemediation(jobId: string): boolean {
  const now = Date.now();
  const tracker = attemptTracker.get(jobId);

  if (!tracker || now - tracker.windowStart > 24 * 60 * 60 * 1000) {
    attemptTracker.set(jobId, { count: 0, windowStart: now });
    return true;
  }
  return tracker.count < MAX_ATTEMPTS_PER_24H;
}

function incrementAttemptCount(jobId: string): void {
  const tracker = attemptTracker.get(jobId) ?? { count: 0, windowStart: Date.now() };
  tracker.count += 1;
  attemptTracker.set(jobId, tracker);
}

// ─── Logging ────────────────────────────────────────────────────────────────

async function appendOperatorLog(entry: OperatorLogEntry): Promise<void> {
  const logPath = path.resolve(process.cwd(), 'memory/context/operator-log.md');
  const line = `| ${entry.timestamp} | ${entry.job} | ${entry.action} | ${entry.outcome} | ${entry.attempt} | ${entry.detail ?? ''} |\n`;
  await fs.appendFile(logPath, line).catch(() => {/* non-fatal */});
}

// ─── Telegram Alert (Tier 3) ────────────────────────────────────────────────

async function sendTelegramAlert(message: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID ?? '8031111945';
  if (!token) return;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'Markdown' }),
  }).catch(() => {/* non-fatal */});
}

function buildTier3Alert(job: string, failureType: FailureType, lastLogLine: string): string {
  return (
    `🚨 *Operator Escalation* — ${job}\n` +
    `Failed after 3 attempts.\n` +
    `Diagnosis: ${failureType}\n` +
    `Last error: ${lastLogLine}\n` +
    `Actions tried: restart → redeploy → rollback\n` +
    `Needs: human intervention`
  );
}

function buildImmediateEscalationAlert(job: string, failureType: 'missing_env' | 'code_bug', lastLogLine: string): string {
  return (
    `🚨 *Operator Escalation* — IMMEDIATE\n` +
    `${job} has a ${failureType} failure.\n` +
    `Cannot auto-remediate.\n` +
    `Last error: ${lastLogLine}\n` +
    `Needs: human intervention now`
  );
}

function buildInfraAlert(failedJobs: string[]): string {
  return (
    `🚨 *Operator Escalation* — RAILWAY INFRA\n` +
    `${failedJobs.length} jobs failed simultaneously: ${failedJobs.join(', ')}\n` +
    `Likely Railway infrastructure issue.\n` +
    `No auto-remediation attempted.\n` +
    `Check: https://status.railway.app`
  );
}

// ─── Job Registry ───────────────────────────────────────────────────────────

async function readJobRegistry(): Promise<JobEntry[]> {
  const registryPath = path.resolve(process.cwd(), 'job-registry.json');
  const raw = await fs.readFile(registryPath, 'utf-8');
  return JSON.parse(raw) as JobEntry[];
}

// ─── Core Operator Logic ────────────────────────────────────────────────────

async function runOperator(): Promise<void> {
  if (isRunning) return; // Debounce
  isRunning = true;

  try {
    const jobs = await readJobRegistry();
    const failedJobs = jobs.filter((j) => j.lastStatus === 'failed');

    // Hard boundary: 3+ jobs failing = Railway infra issue
    if (failedJobs.length >= 3) {
      const alert = buildInfraAlert(failedJobs.map((j) => j.name));
      await sendTelegramAlert(alert);
      await appendOperatorLog({
        timestamp: new Date().toISOString(),
        job: 'SYSTEM',
        action: 'alert',
        outcome: 'escalated',
        attempt: 0,
        detail: `${failedJobs.length} jobs down simultaneously — infra suspected`,
      });
      return;
    }

    for (const job of failedJobs) {
      const existing = activeRemediations.get(job.id);

      // Skip if remediation is in progress and wait window hasn't elapsed
      if (existing && new Date(existing.waitUntil) > new Date()) continue;

      // Skip if exhausted 24h budget
      if (!canAttemptRemediation(job.id)) continue;

      await remediateJob(job, existing);
    }
  } finally {
    isRunning = false;
  }
}

async function remediateJob(job: JobEntry, existing: RemediationState | undefined): Promise<void> {
  const serviceId = process.env.RAILWAY_SERVICE_ID ?? job.serviceId;
  const environmentId = process.env.RAILWAY_ENVIRONMENT_ID ?? job.environmentId;

  // Get deployment info + logs
  const deployment = await getLatestDeployment(serviceId, environmentId);
  const logs = await getDeploymentLogs(deployment.current.id, 50);
  const failureType = classifyFailure(logs);
  const lastLogLine = logs[logs.length - 1] ?? 'No logs available';

  // Immediate escalation cases
  if (failureType === 'missing_env' || failureType === 'code_bug') {
    const alert = buildImmediateEscalationAlert(job.name, failureType, lastLogLine);
    await sendTelegramAlert(alert);
    await appendOperatorLog({
      timestamp: new Date().toISOString(),
      job: job.name,
      action: 'alert',
      outcome: 'escalated',
      attempt: existing?.attempt ?? 0,
      detail: `Immediate escalation: ${failureType}`,
    });
    activeRemediations.delete(job.id);
    return;
  }

  const attempt = existing ? existing.attempt + 1 : 1;
  incrementAttemptCount(job.id);

  let action: RemediationAction;
  let actionSuccess = false;

  if (attempt === 1) {
    action = 'restart';
    actionSuccess = await redeployService(serviceId, environmentId);
  } else if (attempt === 2) {
    action = 'redeploy';
    actionSuccess = await redeployService(serviceId, environmentId);
  } else if (attempt === 3) {
    action = 'rollback';
    const priorId = deployment.prior?.id;
    actionSuccess = priorId ? await rollbackDeployment(priorId) : false;
  } else {
    // Exhausted all attempts
    const alert = buildTier3Alert(job.name, failureType, lastLogLine);
    await sendTelegramAlert(alert);
    await appendOperatorLog({
      timestamp: new Date().toISOString(),
      job: job.name,
      action: 'alert',
      outcome: 'escalated',
      attempt,
      detail: `All 3 attempts exhausted. ${failureType}`,
    });
    activeRemediations.delete(job.id);
    return;
  }

  const waitUntil = new Date(Date.now() + WAIT_BETWEEN_ATTEMPTS_MS).toISOString();

  activeRemediations.set(job.id, {
    jobId: job.id,
    attempt,
    startedAt: new Date().toISOString(),
    failureType,
    lastAction: action,
    waitUntil,
  });

  await appendOperatorLog({
    timestamp: new Date().toISOString(),
    job: job.name,
    action,
    outcome: actionSuccess ? 'pending' : 'failed',
    attempt,
    detail: `failureType=${failureType}, waitUntil=${waitUntil}`,
  });

  // Tier 2: alert after 2nd failed attempt (logged to operator-log for Xhaka)
  if (attempt === 2) {
    await appendOperatorLog({
      timestamp: new Date().toISOString(),
      job: job.name,
      action: 'alert',
      outcome: 'pending',
      attempt,
      detail: `⚠️ Tier 2: 2 attempts failed. Rollback next. failureType=${failureType}`,
    });
  }
}

// ─── Scheduler Registration ─────────────────────────────────────────────────

export function registerOperatorJob(): void {
  // Runs every minute. isRunning flag prevents overlapping executions.
  cron.schedule('* * * * *', () => {
    runOperator().catch((err) => {
      console.error('[Operator] Unhandled error:', err);
      isRunning = false; // Reset on crash
    });
  });

  console.log('[Operator] Self-healing agent registered. Interval: 60s');
}
```

---

## Scheduler Registration (update `scheduler.ts`)

```typescript
import { registerOperatorJob } from './jobs/operator';

// Add alongside existing job registrations:
registerOperatorJob();
```

---

## Hardcoded Boundaries (enforced in code)

| Rule | Enforcement |
|------|------------|
| Never touch database | No DB client imported in operator.ts |
| Never commit code | No git or GitHub API calls |
| Never delete services | Only restart/redeploy/rollback mutations used |
| Max 3 attempts per job per 24h | `attemptTracker` + `canAttemptRemediation()` |
| No auto-fix for `missing_env` or `code_bug` | Immediate escalation path, no retry |
| No action when 3+ jobs fail | `failedJobs.length >= 3` guard → infra alert |
| No overlapping runs | `isRunning` module-level flag |

---

## Summary

The Operator Agent:
1. **Monitors** job-registry.json every 60 seconds
2. **Classifies** each failure before acting (regex pattern matching on logs)
3. **Remediates** via a 3-step ladder (restart → redeploy → rollback)
4. **Escalates** immediately on `missing_env`, `code_bug`, or 3+ simultaneous failures
5. **Alerts** Corey via Telegram only as a last resort (Tier 3)
6. **Logs** every action to `memory/context/operator-log.md`
7. **Self-limits** to 3 attempts per job per 24h window
8. **Never** touches the database, commits code, or deletes services
