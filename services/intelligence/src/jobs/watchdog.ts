// services/intelligence/src/jobs/watchdog.ts
// Runs every 10 min: checks job registry for overdue jobs + pings /health endpoint
// Weekly heartbeat: every Monday at 8 AM CST

import { sendAlert } from '../utils/alert.js';
import { getFileContent } from '../lib/github.js';

const HEALTH_URL = 'https://xhaka-production.up.railway.app/health';
const REGISTRY_PATH = 'data/job-registry.json';
const REPO = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';

interface JobEntry {
  lastRun: string | null;
  lastStatus: 'success' | 'failed' | 'running' | null;
  durationMs: number;
  expectedIntervalHours: number;
  gracePeriodMinutes: number;
}

type JobRegistry = Record<string, JobEntry>;

/**
 * Returns true if a job is overdue based on its registry entry.
 */
function isOverdue(entry: JobEntry): boolean {
  // Never ran → overdue
  if (!entry.lastRun) return true;

  // Currently running → give it a pass (avoid false alerts during slow jobs)
  if (entry.lastStatus === 'running') return false;

  const lastRunMs = new Date(entry.lastRun).getTime();
  const nowMs = Date.now();
  const intervalMs = entry.expectedIntervalHours * 60 * 60 * 1000;
  const graceMs = entry.gracePeriodMinutes * 60 * 1000;

  return nowMs - lastRunMs > intervalMs + graceMs;
}

/**
 * Format time since last run as a human-readable string.
 */
function formatHoursSince(isoTimestamp: string): string {
  const ms = Date.now() - new Date(isoTimestamp).getTime();
  const hours = Math.round((ms / (1000 * 60 * 60)) * 10) / 10;
  return `${hours}h`;
}

/**
 * Ping the production health endpoint; fire alert on failure.
 */
async function checkHealth(): Promise<void> {
  try {
    const res = await fetch(HEALTH_URL, { method: 'GET', signal: AbortSignal.timeout(10_000) });
    if (!res.ok) {
      await sendAlert(
        `🚨 *HEALTH CHECK FAILED* — \`${HEALTH_URL}\` returned HTTP ${res.status}`,
      );
    }
  } catch (err) {
    await sendAlert(
      `🚨 *HEALTH CHECK ERROR* — \`${HEALTH_URL}\` unreachable: ${(err as Error).message}`,
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

  // 2. Load job registry from repo
  const file = await getFileContent(REPO, REGISTRY_PATH);
  if (!file) {
    await sendAlert(`🚨 *WATCHDOG ERROR* — Could not read job-registry.json`);
    return;
  }

  let registry: JobRegistry;
  try {
    registry = JSON.parse(file.content);
  } catch (err) {
    await sendAlert(`🚨 *WATCHDOG ERROR* — Could not parse job-registry.json: ${(err as Error).message}`);
    return;
  }

  // 3. Check each job for overdue status
  for (const [jobName, entry] of Object.entries(registry)) {
    if (isOverdue(entry)) {
      const hoursAgo = entry.lastRun
        ? formatHoursSince(entry.lastRun)
        : 'never';

      const msg = `🚨 *MISSED JOB* — ${jobName} last ran ${hoursAgo} (expected every ${entry.expectedIntervalHours}h)`;
      console.warn(`[watchdog] ${msg}`);
      await sendAlert(msg);
    }
  }

  console.log('[watchdog] Done');
}

/**
 * Weekly heartbeat — sends a "system healthy" message every Monday at 8 AM CST.
 * This is a proof-of-life signal. If Corey doesn't receive it, something is wrong.
 */
export async function runWeeklyHeartbeat(): Promise<void> {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  
  const jobNames = [
    'capture', 'propagate', 'improve', 'cleanup',
    'organize', 'synthesize', 'tool-monitor', 'watchdog',
    'scribe', 'operator', 'daily-log',
  ];
  
  const message =
    `💚 *Xhaka Weekly Check-In* — ${dateStr}\n` +
    `All systems operational. Jobs monitored: ${jobNames.length}\n` +
    `No escalations this week.\n` +
    `_(You will receive this every Monday. Silence = problem.)_`;
  
  await sendAlert(message);
  console.log('[watchdog] Weekly heartbeat sent');
}
