// services/intelligence/src/jobs/operator.ts
// Autonomous self-healing agent — monitors job-registry, remediates Railway failures

import {
  getLatestDeployment,
  getDeploymentLogs,
  redeployService,
  rollbackDeployment,
} from '../lib/railway-api.js';
import { getFileContent, updateFile, createFile } from '../lib/github.js';
import { sendAlert } from '../utils/alert.js';
import { markJobStart, markJobSuccess, markJobFailed } from '../utils/job-registry.js';
import {
  loadRemediationState,
  saveRemediationState,
  type RemediationStateFile,
  type ActiveRemediationRecord,
} from '../utils/remediation-state.js';

// ─── Types ──────────────────────────────────────────────────────────────────

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

// ─── Globals ─────────────────────────────────────────────────────────────────

let isRunning = false; // Debounce flag — prevents overlapping runs

// These Maps are hydrated from persisted state on each run
let activeRemediations = new Map<string, RemediationState>();
let attemptTracker = new Map<string, { count: number; windowStart: number }>();
let persistedState: RemediationStateFile = { attempts: {}, activeRemediations: {} };

// 1-hour cooldown for remediation-state GitHub commits — prevents commit flood
const STATE_PERSIST_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour
let lastStatePersistAt = 0; // epoch ms — hydrated from persisted state on each run

// 1-hour cooldown for Railway infra alerts — persisted to GitHub so it survives restarts
const INFRA_ALERT_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour
let lastInfraAlertAt = 0; // epoch ms — hydrated from persisted state on each run

const WAIT_BETWEEN_ATTEMPTS_MS = 3 * 60 * 1000; // 3 minutes
const MAX_ATTEMPTS_PER_24H = 3;
const REPO = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';
const REGISTRY_PATH = 'data/job-registry.json';
const OPERATOR_LOG_PATH = 'memory/context/operator-log.md';

// ─── Failure Classification ───────────────────────────────────────────────────

export const FAILURE_PATTERNS: Record<
  Exclude<FailureType, 'railway_infra' | 'unknown'>,
  RegExp
> = {
  missing_env:
    /missing env|undefined.*process\.env|environment variable.*not (set|found)|is not defined|Cannot read propert(y|ies) .* undefined/i,
  code_bug:
    /TypeError|ReferenceError|SyntaxError|at\s+\S+\s+\(.*:\d+:\d+\)|UnhandledPromiseRejection|Error: Cannot/i,
  rate_limit: /429|rate.?limit|too many requests|Retry-After/i,
  network_transient: /ETIMEDOUT|ECONNRESET|ECONNREFUSED|ENOTFOUND|socket hang up|network timeout/i,
};

export function classifyFailure(logs: string[]): FailureType {
  if (logs.length === 0) return 'railway_infra';
  const logText = logs.join('\n');
  if (FAILURE_PATTERNS.missing_env.test(logText)) return 'missing_env';
  if (FAILURE_PATTERNS.code_bug.test(logText)) return 'code_bug';
  if (FAILURE_PATTERNS.rate_limit.test(logText)) return 'rate_limit';
  if (FAILURE_PATTERNS.network_transient.test(logText)) return 'network_transient';
  return 'unknown';
}

// ─── 24h Attempt Guard ────────────────────────────────────────────────────────

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

// ─── State Persistence Helpers ────────────────────────────────────────────────

async function persistCurrentState(): Promise<void> {
  const now = Date.now();
  if (now - lastStatePersistAt < STATE_PERSIST_COOLDOWN_MS) {
    console.log(
      `[operator] Skipping remediation-state commit — within 1h cooldown ` +
      `(next eligible: ${new Date(lastStatePersistAt + STATE_PERSIST_COOLDOWN_MS).toISOString()})`,
    );
    return;
  }

  lastStatePersistAt = now;

  const state = {
    lastPersistedAt: new Date(now).toISOString(),
    lastInfraAlertAt,
    attempts: Object.fromEntries(
      [...attemptTracker.entries()].map(([k, v]) => [k, {
        count: v.count,
        firstAttemptAt: new Date(v.windowStart).toISOString(),
        lastAttemptAt: new Date().toISOString(),
      }])
    ),
    activeRemediations: Object.fromEntries(
      [...activeRemediations.entries()].map(([k, v]) => [k, {
        attempt: v.attempt,
        startedAt: v.startedAt,
        failureType: v.failureType,
        lastAction: v.lastAction,
        waitUntil: v.waitUntil,
      } as ActiveRemediationRecord])
    ),
  } as RemediationStateFile;
  await saveRemediationState(state);
}

// ─── Operator Log (appends to memory/context/operator-log.md via GitHub) ─────

async function appendOperatorLog(entry: OperatorLogEntry): Promise<void> {
  try {
    const line =
      `| ${entry.timestamp} | ${entry.job} | ${entry.action} | ` +
      `${entry.outcome} | ${entry.attempt} | ${entry.detail ?? ''} |\n`;

    const file = await getFileContent(REPO, OPERATOR_LOG_PATH);

    if (file) {
      const updated = file.content + line;
      await updateFile(
        REPO,
        OPERATOR_LOG_PATH,
        updated,
        `chore: operator-log [${entry.job}=${entry.action}]`,
        file.sha,
      );
    } else {
      const header =
        `# Operator Log\n\n` +
        `| Timestamp | Job | Action | Outcome | Attempt | Detail |\n` +
        `|-----------|-----|--------|---------|---------|--------|\n` +
        line;
      await createFile(
        REPO,
        OPERATOR_LOG_PATH,
        header,
        `chore: operator-log init [${entry.job}=${entry.action}]`,
      );
    }
  } catch (err) {
    console.error('[operator] Failed to append operator log:', (err as Error).message);
  }
}

// ─── Alert Message Builders ───────────────────────────────────────────────────

function buildTier3Alert(
  job: string,
  failureType: FailureType,
  lastLogLine: string,
): string {
  return (
    `🚨 *Operator Escalation* — ${job}\n` +
    `Failed after 3 attempts.\n` +
    `Diagnosis: ${failureType}\n` +
    `Last error: ${lastLogLine}\n` +
    `Actions tried: restart → redeploy → rollback\n` +
    `Needs: human intervention`
  );
}

function buildImmediateEscalationAlert(
  job: string,
  failureType: 'missing_env' | 'code_bug',
  lastLogLine: string,
): string {
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

// ─── Job Registry Reader ──────────────────────────────────────────────────────

type RegistryEntry = {
  lastStatus: string | null;
  lastRun: string | null;
  durationMs: number;
  expectedIntervalHours: number;
  gracePeriodMinutes: number;
};

async function readFailedJobs(): Promise<JobEntry[]> {
  const file = await getFileContent(REPO, REGISTRY_PATH);
  if (!file) return [];

  const registry = JSON.parse(file.content) as Record<string, RegistryEntry>;
  const serviceId = process.env.RAILWAY_SERVICE_ID ?? '';
  const environmentId = process.env.RAILWAY_ENVIRONMENT_ID ?? '';

  return Object.entries(registry)
    .filter(([, entry]) => entry.lastStatus === 'failed')
    .map(([name, entry]) => ({
      id: name,
      name,
      serviceId,
      environmentId,
      lastStatus: 'failed' as const,
      lastRun: entry.lastRun ?? new Date().toISOString(),
    }));
}

// ─── Core Remediation Logic ───────────────────────────────────────────────────

async function remediateJob(
  job: JobEntry,
  existing: RemediationState | undefined,
): Promise<void> {
  // Mark operator as running in the job registry — prevents watchdog double-trigger
  const startTime = await markJobStart('operator');

  let jobFailed = false;
  try {
    const serviceId = job.serviceId || process.env.RAILWAY_SERVICE_ID || '';
    const environmentId = job.environmentId || process.env.RAILWAY_ENVIRONMENT_ID || '';

    // Fetch current deployment info — isolated so one Railway failure won't abort the full run
    let deployment: Awaited<ReturnType<typeof getLatestDeployment>>;
    try {
      deployment = await getLatestDeployment(serviceId, environmentId);
    } catch (err) {
      console.error(
        `[operator] Railway error fetching deployment for job=${job.name}:`,
        (err as Error).message,
      );
      return;
    }

    if (!deployment.current) {
      console.warn(`[operator] No deployment found for job: ${job.name}`);
      return;
    }

    // Fetch deployment logs — isolated so a log-fetch failure falls back to empty
    let logs: string[];
    try {
      logs = await getDeploymentLogs(deployment.current.id, 50);
    } catch (err) {
      console.error(
        `[operator] Railway error fetching logs for job=${job.name}:`,
        (err as Error).message,
      );
      logs = [];
    }

    const failureType = classifyFailure(logs);
    const lastLogLine = logs[logs.length - 1] ?? 'No logs available';

    // Immediate escalation — missing_env or code_bug
    if (failureType === 'missing_env' || failureType === 'code_bug') {
      await sendAlert(buildImmediateEscalationAlert(job.name, failureType, lastLogLine));
      await appendOperatorLog({
        timestamp: new Date().toISOString(),
        job: job.name,
        action: 'alert',
        outcome: 'escalated',
        attempt: existing?.attempt ?? 0,
        detail: `Immediate escalation: ${failureType}`,
      });
      activeRemediations.delete(job.id);
      await persistCurrentState();
      return;
    }

    const attempt = existing ? existing.attempt + 1 : 1;
    incrementAttemptCount(job.id);

    let action: RemediationAction;
    let actionSuccess = false;

    if (attempt === 1) {
      // Attempt 1: restart via serviceInstanceRedeploy
      action = 'restart';
      actionSuccess = await redeployService(serviceId, environmentId);
    } else if (attempt === 2) {
      // Attempt 2: full redeploy
      action = 'redeploy';
      actionSuccess = await redeployService(serviceId, environmentId);
    } else if (attempt === 3) {
      // Attempt 3: rollback to prior stable deployment
      action = 'rollback';
      const priorId = deployment.prior?.id;
      actionSuccess = priorId ? await rollbackDeployment(priorId) : false;
    } else {
      // All attempts exhausted — Tier 3 escalation
      await sendAlert(buildTier3Alert(job.name, failureType, lastLogLine));
      await appendOperatorLog({
        timestamp: new Date().toISOString(),
        job: job.name,
        action: 'alert',
        outcome: 'escalated',
        attempt,
        detail: `All 3 attempts exhausted. failureType=${failureType}`,
      });
      activeRemediations.delete(job.id);
      await persistCurrentState();
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

    // Persist state after every change
    await persistCurrentState();

    await appendOperatorLog({
      timestamp: new Date().toISOString(),
      job: job.name,
      action,
      outcome: actionSuccess ? 'pending' : 'failed',
      attempt,
      detail: `failureType=${failureType}, waitUntil=${waitUntil}`,
    });

    // Tier 2 — after 2nd attempt fails, log warning for Xhaka
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

    console.log(
      `[operator] Job=${job.name} attempt=${attempt} action=${action} success=${actionSuccess} waitUntil=${waitUntil}`,
    );
  } catch (err) {
    jobFailed = true;
    await markJobFailed('operator', startTime);
    throw err;
  } finally {
    if (!jobFailed) {
      await markJobSuccess('operator', startTime);
    }
  }
}

// ─── Main Operator Run ────────────────────────────────────────────────────────

export async function runOperator(): Promise<void> {
  if (isRunning) {
    console.log('[operator] Already running — skipping tick');
    return;
  }
  isRunning = true;

  try {
    // Load persisted state from GitHub on every run
    persistedState = await loadRemediationState();
    
    // Hydrate Maps from persisted state
    activeRemediations = new Map();
    attemptTracker = new Map();
    
    for (const [jobId, record] of Object.entries(persistedState.activeRemediations)) {
      activeRemediations.set(jobId, {
        jobId,
        attempt: record.attempt,
        startedAt: record.startedAt,
        failureType: record.failureType as FailureType,
        lastAction: record.lastAction as RemediationAction,
        waitUntil: record.waitUntil,
      });
    }
    
    for (const [jobId, record] of Object.entries(persistedState.attempts)) {
      attemptTracker.set(jobId, {
        count: record.count,
        windowStart: new Date(record.firstAttemptAt).getTime(),
      });
    }

    // Hydrate persist cooldown from saved state — prevents commit flood after restarts
    const persistedStateRaw = persistedState as unknown as Record<string, unknown>;
    if (persistedStateRaw.lastPersistedAt) {
      const savedAt = new Date(persistedStateRaw.lastPersistedAt as string).getTime();
      if (!isNaN(savedAt)) lastStatePersistAt = savedAt;
    }

    // Hydrate infra-alert cooldown — persisted so it survives Railway restarts
    if (persistedStateRaw.lastInfraAlertAt) {
      const savedInfraAt = Number(persistedStateRaw.lastInfraAlertAt);
      if (!isNaN(savedInfraAt)) lastInfraAlertAt = savedInfraAt;
    }

    // ─── Railway Deployment Health Check ─────────────────────────────────────
    // Check the deployment status BEFORE touching the job registry.
    // If the service itself is FAILED/CRASHED, there's no point running jobs —
    // alert immediately and bail out.
    const railwayServiceId = process.env.RAILWAY_SERVICE_ID ?? '';
    const railwayEnvironmentId = process.env.RAILWAY_ENVIRONMENT_ID ?? '';

    try {
      const deploymentHealth = await getLatestDeployment(railwayServiceId, railwayEnvironmentId);
      const deployStatus = deploymentHealth.current?.status;
      const deployId = deploymentHealth.current?.id ?? 'unknown';

      if (deployStatus === 'FAILED' || deployStatus === 'CRASHED') {
        const alertMsg =
          `🚨 *Railway Deploy Failed* — xhaka-intelligence\n` +
          `Status: ${deployStatus}\n` +
          `Deployment ID: ${deployId}\n` +
          `This is a build/code failure — manual intervention needed.\n` +
          `Check: https://railway.app/project/84c0d035-cf53-4edd-b29c-31aeb42caac9`;
        await sendAlert(alertMsg);
        await appendOperatorLog({
          timestamp: new Date().toISOString(),
          job: 'railway-deploy',
          action: 'alert',
          outcome: 'escalated',
          attempt: 0,
          detail: `status=${deployStatus}, deploymentId=${deployId}`,
        });
        console.error(`[operator] Railway deployment ${deployStatus} (id=${deployId}) — returning early`);
        return;
      } else if (deployStatus === 'SLEEPING' || deployStatus === 'BUILDING') {
        console.log(`[operator] Railway deployment status: ${deployStatus} — normal state, continuing`);
      } else if (deployStatus === 'SUCCESS') {
        console.log(`[operator] Railway deployment healthy (${deployStatus}) — proceeding to job registry check`);
      }
    } catch (err) {
      console.warn(
        '[operator] Railway health check failed — skipping, continuing with job registry:',
        (err as Error).message,
      );
    }
    // ─────────────────────────────────────────────────────────────────────────

    const failedJobs = await readFailedJobs();

    if (failedJobs.length === 0) {
      console.log('[operator] All jobs healthy — no action needed');
      return;
    }

    // Hard boundary: 3+ simultaneous failures = Railway infra issue
    if (failedJobs.length >= 3) {
      const now = Date.now();
      if (now - lastInfraAlertAt < INFRA_ALERT_COOLDOWN_MS) {
        console.log(
          `[operator] Infra alert within 1h cooldown — skipping ` +
          `(next eligible: ${new Date(lastInfraAlertAt + INFRA_ALERT_COOLDOWN_MS).toISOString()})`,
        );
        return;
      }
      // Persist before alerting so cooldown survives a restart
      lastInfraAlertAt = now;
      lastStatePersistAt = 0; // bypass persist cooldown — infra alerts must be saved immediately
      await persistCurrentState();
      const alert = buildInfraAlert(failedJobs.map((j) => j.name));
      await sendAlert(alert);
      await appendOperatorLog({
        timestamp: new Date().toISOString(),
        job: 'SYSTEM',
        action: 'alert',
        outcome: 'escalated',
        attempt: 0,
        detail: `${failedJobs.length} jobs down simultaneously — infra suspected`,
      });
      console.warn(`[operator] ${failedJobs.length} jobs failed — Railway infra alert sent`);
      return;
    }

    console.log(`[operator] ${failedJobs.length} failed job(s) detected — remediating`);

    for (const job of failedJobs) {
      const existing = activeRemediations.get(job.id);

      // Skip if within wait window
      if (existing && new Date(existing.waitUntil) > new Date()) {
        console.log(
          `[operator] Job=${job.name} in wait window until ${existing.waitUntil} — skipping`,
        );
        continue;
      }

      // Skip if 24h attempt budget exhausted
      if (!canAttemptRemediation(job.id)) {
        console.log(`[operator] Job=${job.name} hit 24h attempt limit — skipping`);
        continue;
      }

      await remediateJob(job, existing);
    }
  } catch (err) {
    console.error('[operator] Unhandled error:', (err as Error).message);
  } finally {
    isRunning = false;
  }
}


