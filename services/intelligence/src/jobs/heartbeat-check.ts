// services/intelligence/src/jobs/heartbeat-check.ts
// Active system monitor — runs every 30 minutes.
// Performs real checks and fires Telegram alerts only when something needs attention.
// Silent if all clear. Cooldown: same alert type max once per 2 hours.
// Never throws — all checks wrapped in try/catch.

import { getFileContent, updateFile, createFile, listDirectory } from '../lib/github.js';
import { getLatestDeployment } from '../lib/railway-api.js';
import { markJobStart, markJobSuccess, markJobFailed } from '../utils/job-registry.js';
import { sendAlert } from '../utils/alert.js';

const REPO = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';
const STATE_PATH = 'data/heartbeat-state.json';

// xhaka-intelligence service + production environment (from TOOLS.md)
const INTELLIGENCE_SERVICE_ID = 'e6a33162-f5ff-4916-a875-0a4fb86c934c';
const PRODUCTION_ENV_ID = '8f2d6455-5535-43d0-b198-b1248c949c0f';

const GUNNER_HEALTH_URL = 'https://gunner-production.up.railway.app/health';
const COOLDOWN_MS = 2 * 60 * 60 * 1000; // 2 hours

// ---------------------------------------------------------------------------
// State management — cooldowns persisted to data/heartbeat-state.json
// ---------------------------------------------------------------------------

interface HeartbeatState {
  cooldowns: Record<string, string>; // alertKey -> ISO timestamp of last alert
}

async function loadState(): Promise<{ state: HeartbeatState; sha: string | null }> {
  try {
    const file = await getFileContent(REPO, STATE_PATH);
    if (!file) {
      return { state: { cooldowns: {} }, sha: null };
    }
    const parsed = JSON.parse(file.content) as HeartbeatState;
    if (!parsed.cooldowns || typeof parsed.cooldowns !== 'object') {
      parsed.cooldowns = {};
    }
    return { state: parsed, sha: file.sha };
  } catch {
    return { state: { cooldowns: {} }, sha: null };
  }
}

async function saveState(state: HeartbeatState, sha: string | null): Promise<void> {
  try {
    const content = JSON.stringify(state, null, 2);
    const message = 'chore: heartbeat-state update';
    if (sha) {
      await updateFile(REPO, STATE_PATH, content, message, sha);
    } else {
      await createFile(REPO, STATE_PATH, content, message);
    }
  } catch (err) {
    console.warn('[heartbeat-check] Failed to save state:', (err as Error).message);
  }
}

function isOnCooldown(state: HeartbeatState, alertKey: string): boolean {
  const lastAlertAt = state.cooldowns[alertKey];
  if (!lastAlertAt) return false;
  return (Date.now() - new Date(lastAlertAt).getTime()) < COOLDOWN_MS;
}

function markAlertSent(state: HeartbeatState, alertKey: string): void {
  state.cooldowns[alertKey] = new Date().toISOString();
}

// ---------------------------------------------------------------------------
// Check 1: Railway deploy status for xhaka-intelligence
// ---------------------------------------------------------------------------

async function checkRailwayDeploy(
  state: HeartbeatState,
  alerts: string[],
): Promise<void> {
  const key = 'railway-deploy';
  try {
    const { current } = await getLatestDeployment(INTELLIGENCE_SERVICE_ID, PRODUCTION_ENV_ID);
    if (!current) {
      console.log('[heartbeat-check] Railway: no deployment found');
      return;
    }

    const ok = current.status === 'SUCCESS' || current.status === 'DEPLOYING';
    if (!ok) {
      console.warn(`[heartbeat-check] Railway deploy status: ${current.status}`);
      if (!isOnCooldown(state, key)) {
        alerts.push(
          `🚨 *xhaka-intelligence deploy issue*\nStatus: \`${current.status}\`\nID: \`${current.id}\``,
        );
        markAlertSent(state, key);
      }
    } else {
      console.log(`[heartbeat-check] Railway deploy OK: ${current.status}`);
    }
  } catch (err) {
    console.warn('[heartbeat-check] Railway check failed:', (err as Error).message);
  }
}

// ---------------------------------------------------------------------------
// Check 2: Gunner health endpoint
// ---------------------------------------------------------------------------

async function checkGunnerHealth(
  state: HeartbeatState,
  alerts: string[],
): Promise<void> {
  const key = 'gunner-health';
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    let ok = false;
    let statusCode: number | null = null;

    try {
      const res = await fetch(GUNNER_HEALTH_URL, { signal: controller.signal });
      statusCode = res.status;
      ok = res.ok;
    } finally {
      clearTimeout(timeout);
    }

    if (!ok) {
      console.warn(`[heartbeat-check] Gunner health check failed: HTTP ${statusCode}`);
      if (!isOnCooldown(state, key)) {
        alerts.push(`🚨 *Gunner health check failed*\nHTTP status: \`${statusCode ?? 'timeout'}\`\n${GUNNER_HEALTH_URL}`);
        markAlertSent(state, key);
      }
    } else {
      console.log('[heartbeat-check] Gunner health OK');
    }
  } catch (err) {
    const msg = (err as Error).message;
    const isTimeout = msg.includes('abort') || msg.includes('timeout');
    console.warn(`[heartbeat-check] Gunner health error: ${msg}`);

    const key2 = key;
    if (!isOnCooldown(state, key2)) {
      alerts.push(
        `🚨 *Gunner health check failed*\n${isTimeout ? 'Request timed out (5s)' : `Error: ${msg}`}\n${GUNNER_HEALTH_URL}`,
      );
      markAlertSent(state, key2);
    }
  }
}

// ---------------------------------------------------------------------------
// Check 3: Fresh job failures in job-registry.json
// ---------------------------------------------------------------------------

interface RegistryEntry {
  lastRun: string | null;
  lastStatus: string | null;
  durationMs: number | null;
  expectedIntervalHours: number;
  gracePeriodMinutes: number;
}

async function checkJobFailures(
  state: HeartbeatState,
  alerts: string[],
): Promise<void> {
  const key = 'job-failures';
  try {
    const file = await getFileContent(REPO, 'data/job-registry.json');
    if (!file) {
      console.warn('[heartbeat-check] job-registry.json not found');
      return;
    }

    const registry: Record<string, RegistryEntry> = JSON.parse(file.content);
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;

    const freshFailures = Object.entries(registry).filter(([, entry]) => {
      if (entry.lastStatus !== 'failed') return false;
      if (!entry.lastRun) return false;
      return new Date(entry.lastRun).getTime() > twoHoursAgo;
    });

    if (freshFailures.length > 0) {
      console.warn(`[heartbeat-check] ${freshFailures.length} fresh job failure(s) detected`);
      if (!isOnCooldown(state, key)) {
        const lines = freshFailures
          .map(([name, entry]) => `  • \`${name}\` — failed at ${entry.lastRun ?? 'unknown'}`)
          .join('\n');
        alerts.push(`⚠️ *Fresh job failure(s) detected*\n${lines}`);
        markAlertSent(state, key);
      }
    } else {
      console.log('[heartbeat-check] No fresh job failures');
    }
  } catch (err) {
    console.warn('[heartbeat-check] Job failure check error:', (err as Error).message);
  }
}

// ---------------------------------------------------------------------------
// Check 4: Pending proposed changes (> 3 = remind)
// ---------------------------------------------------------------------------

async function checkProposedChanges(
  state: HeartbeatState,
  alerts: string[],
): Promise<void> {
  const key = 'proposed-changes';
  try {
    const entries = await listDirectory(REPO, 'intelligence/proposed-changes');
    const pending = entries.filter((f) => f.type === 'file');
    const count = pending.length;

    if (count > 3) {
      console.warn(`[heartbeat-check] ${count} proposed changes pending review`);
      if (!isOnCooldown(state, key)) {
        alerts.push(
          `📋 *${count} proposed changes awaiting review*\nCheck \`intelligence/proposed-changes/\` — nothing's been approved or rejected.`,
        );
        markAlertSent(state, key);
      }
    } else {
      console.log(`[heartbeat-check] Proposed changes OK (${count} pending)`);
    }
  } catch (err) {
    console.warn('[heartbeat-check] Proposed changes check error:', (err as Error).message);
  }
}

// ---------------------------------------------------------------------------
// Check 5: Morning brief confirmation (6:15–7:00 AM CST window)
// ---------------------------------------------------------------------------

async function checkMorningBrief(
  state: HeartbeatState,
  alerts: string[],
): Promise<void> {
  const key = 'morning-brief';
  try {
    // Check if current time is in the 6:15–7:00 AM CST window
    const now = new Date();
    const cstOffset = -6 * 60; // CST = UTC-6 (CDT = UTC-5, but use fixed CST as job runs year-round)
    const localMinutes = (now.getUTCHours() * 60 + now.getUTCMinutes() + (cstOffset + 24 * 60)) % (24 * 60);
    const windowStart = 6 * 60 + 15; // 6:15 AM
    const windowEnd = 7 * 60;         // 7:00 AM

    if (localMinutes < windowStart || localMinutes >= windowEnd) {
      // Not in alert window — skip
      return;
    }

    const file = await getFileContent(REPO, 'data/job-registry.json');
    if (!file) return;

    const registry: Record<string, RegistryEntry> = JSON.parse(file.content);
    const morningBrief = registry['morning-brief'];
    if (!morningBrief?.lastRun) {
      if (!isOnCooldown(state, key)) {
        alerts.push('⚠️ *Morning brief did not run today*\nExpected between 6:00–6:15 AM CST.');
        markAlertSent(state, key);
      }
      return;
    }

    // Check if lastRun was today in CST
    const lastRun = new Date(morningBrief.lastRun);
    const todayCst = new Date(now.getTime() + cstOffset * 60 * 1000);
    const lastRunCst = new Date(lastRun.getTime() + cstOffset * 60 * 1000);
    const ranToday =
      lastRunCst.getUTCFullYear() === todayCst.getUTCFullYear() &&
      lastRunCst.getUTCMonth() === todayCst.getUTCMonth() &&
      lastRunCst.getUTCDate() === todayCst.getUTCDate();

    if (!ranToday) {
      console.warn('[heartbeat-check] Morning brief did not run today');
      if (!isOnCooldown(state, key)) {
        alerts.push('⚠️ *Morning brief did not run today*\nLast ran: ' + morningBrief.lastRun);
        markAlertSent(state, key);
      }
    } else {
      console.log('[heartbeat-check] Morning brief OK (ran today)');
    }
  } catch (err) {
    console.warn('[heartbeat-check] Morning brief check error:', (err as Error).message);
  }
}

// ---------------------------------------------------------------------------
// Main runner
// ---------------------------------------------------------------------------

export async function runHeartbeatCheck(): Promise<void> {
  const startTime = await markJobStart('heartbeat-check');
  console.log('[heartbeat-check] Running active system monitor...');

  try {
    const { state, sha } = await loadState();
    const alerts: string[] = [];

    // Run all checks — each is independently try/caught
    await checkRailwayDeploy(state, alerts);
    await checkGunnerHealth(state, alerts);
    await checkJobFailures(state, alerts);
    await checkProposedChanges(state, alerts);
    await checkMorningBrief(state, alerts);

    // ---------------------------------------------------------------------------
    // Cognitive load checks — flags when system complexity is adding burden
    // ---------------------------------------------------------------------------

    // Check 6: Queue depth overload
    try {
      const queueFile = await getFileContent(REPO, 'data/task-queue.json').catch(() => null);
      if (queueFile) {
        const queue = JSON.parse(queueFile.content);
        const pendingCount = (queue.tasks || []).filter((t: { status: string }) => t.status === 'pending').length;
        if (pendingCount > 20) {
          const key = 'queue-overload';
          if (!isOnCooldown(state, key)) {
            alerts.push(`⚠️ Queue overload: ${pendingCount} pending tasks. System may be accumulating faster than processing.`);
            markAlertSent(state, key);
          }
        }
      }
    } catch {
      // never throw from cognitive load checks
    }

    // Check 7: MEMORY.md line count approaching limit
    try {
      const memoryFile = await getFileContent(REPO, 'MEMORY.md').catch(() => null);
      if (memoryFile) {
        const lineCount = memoryFile.content.split('\n').length;
        if (lineCount > 140) {
          const key = 'memory-limit';
          if (!isOnCooldown(state, key)) {
            alerts.push(`⚠️ MEMORY.md approaching limit: ${lineCount}/150 lines. Run synthesis soon.`);
            markAlertSent(state, key);
          }
        }
      }
    } catch {
      // never throw from cognitive load checks
    }

    // Check 8: Results TSV — check if dispatcher has been failing
    try {
      const resultsFile = await getFileContent(REPO, 'data/results.tsv').catch(() => null);
      if (resultsFile) {
        const lines = resultsFile.content.trim().split('\n').slice(-20); // last 20 entries
        const recentFails = lines.filter((l: string) => l.includes('\tfailed\t')).length;
        if (recentFails >= 5) {
          const key = 'results-failures';
          if (!isOnCooldown(state, key)) {
            alerts.push(`⚠️ ${recentFails} job failures in recent runs. Check results.tsv.`);
            markAlertSent(state, key);
          }
        }
      }
    } catch {
      // never throw from cognitive load checks
    }

    // Persist updated cooldowns regardless of alert outcome
    await saveState(state, sha);

    if (alerts.length === 0) {
      console.log('[heartbeat-check] ✅ All clear — silent run');
    } else {
      const message = `🫀 *Heartbeat Alert*\n\n${alerts.join('\n\n')}`;
      const truncated = message.length > 4096 ? message.slice(0, 4080) + '\n…[truncated]' : message;
      await sendAlert(truncated);
      console.log(`[heartbeat-check] 📣 Sent ${alerts.length} alert(s)`);
    }

    await markJobSuccess('heartbeat-check', startTime);
  } catch (err) {
    console.error('[heartbeat-check] Fatal error:', (err as Error).message);
    await markJobFailed('heartbeat-check', startTime);
  }
}
