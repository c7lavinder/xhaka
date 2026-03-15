// services/intelligence/src/utils/job-registry.ts
// Shared helper for all jobs to report their run status to data/job-registry.json

import { getFileContent, updateFile, createFile } from '../lib/github.js';
import { appendResult } from './results-log.js';

const REPO = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';
const REGISTRY_PATH = 'data/job-registry.json';

type JobStatus = 'success' | 'failed' | 'running' | 'LOW_QUALITY' | 'NEEDS_REVIEW';

interface JobEntry {
  lastRun: string | null;
  lastStatus: JobStatus | null;
  durationMs: number | null;
  expectedIntervalHours: number;
  gracePeriodMinutes: number;
}

type JobRegistry = Record<string, JobEntry>;

// FIX 9: Expected keys for schema validation
const EXPECTED_KEYS = [
  'capture', 'organize', 'propagate', 'tool-monitor',
  'synthesize', 'improve', 'cleanup', 'scribe', 'operator',
  'watchdog', 'daily-log', 'researcher',
  'feedback', 'inspect', 'routing-review', 'morning-brief',
  'heartbeat-check', 'benchmark', 'pre-deploy-test', 'behavior-sync',
  'proactive-scan', 'agent-scorecard', 'change-evaluator',
  'pattern-miner', 'dispatcher', 'auditor', 'architect',
];

// FIX 9: Default registry for corruption recovery
const DEFAULT_REGISTRY: JobRegistry = {
  capture: { lastRun: null, lastStatus: null, durationMs: null, expectedIntervalHours: 24, gracePeriodMinutes: 60 },
  organize: { lastRun: null, lastStatus: null, durationMs: null, expectedIntervalHours: 24, gracePeriodMinutes: 60 },
  propagate: { lastRun: null, lastStatus: null, durationMs: null, expectedIntervalHours: 24, gracePeriodMinutes: 60 },
  'tool-monitor': { lastRun: null, lastStatus: null, durationMs: null, expectedIntervalHours: 24, gracePeriodMinutes: 60 },
  synthesize: { lastRun: null, lastStatus: null, durationMs: null, expectedIntervalHours: 130, gracePeriodMinutes: 120 },
  improve: { lastRun: null, lastStatus: null, durationMs: null, expectedIntervalHours: 168, gracePeriodMinutes: 120 },
  cleanup: { lastRun: null, lastStatus: null, durationMs: null, expectedIntervalHours: 168, gracePeriodMinutes: 120 },
  scribe: { lastRun: null, lastStatus: null, durationMs: null, expectedIntervalHours: 24, gracePeriodMinutes: 120 },
  operator: { lastRun: null, lastStatus: null, durationMs: null, expectedIntervalHours: 1, gracePeriodMinutes: 10 },
  watchdog: { lastRun: null, lastStatus: null, durationMs: null, expectedIntervalHours: 1, gracePeriodMinutes: 30 },
  'daily-log': { lastRun: null, lastStatus: null, durationMs: null, expectedIntervalHours: 6, gracePeriodMinutes: 120 },
  researcher: { lastRun: null, lastStatus: null, durationMs: null, expectedIntervalHours: 24, gracePeriodMinutes: 90 },
  feedback: { lastRun: null, lastStatus: null, durationMs: null, expectedIntervalHours: 24, gracePeriodMinutes: 60 },
  inspect: { lastRun: null, lastStatus: null, durationMs: null, expectedIntervalHours: 168, gracePeriodMinutes: 120 },
  'routing-review': { lastRun: null, lastStatus: null, durationMs: null, expectedIntervalHours: 168, gracePeriodMinutes: 120 },
  'morning-brief': { lastRun: null, lastStatus: null, durationMs: null, expectedIntervalHours: 24, gracePeriodMinutes: 60 },
  'heartbeat-check': { lastRun: null, lastStatus: null, durationMs: null, expectedIntervalHours: 0.5, gracePeriodMinutes: 10 },
  benchmark: { lastRun: null, lastStatus: null, durationMs: null, expectedIntervalHours: 168, gracePeriodMinutes: 120 },
  'pre-deploy-test': { lastRun: null, lastStatus: null, durationMs: null, expectedIntervalHours: 24, gracePeriodMinutes: 60 },
  'behavior-sync': { lastRun: null, lastStatus: null, durationMs: null, expectedIntervalHours: 24, gracePeriodMinutes: 60 },
  'proactive-scan': { lastRun: null, lastStatus: null, durationMs: null, expectedIntervalHours: 168, gracePeriodMinutes: 120 },
  'agent-scorecard': { lastRun: null, lastStatus: null, durationMs: null, expectedIntervalHours: 168, gracePeriodMinutes: 120 },
  'change-evaluator': { lastRun: null, lastStatus: null, durationMs: null, expectedIntervalHours: 24, gracePeriodMinutes: 120 },
  'pattern-miner': { lastRun: null, lastStatus: null, durationMs: null, expectedIntervalHours: 168, gracePeriodMinutes: 120 },
  'dispatcher': { lastRun: null, lastStatus: null, durationMs: null, expectedIntervalHours: 1, gracePeriodMinutes: 5 },
  'auditor': { lastRun: null, lastStatus: null, durationMs: null, expectedIntervalHours: 24, gracePeriodMinutes: 60 },
  'architect': { lastRun: null, lastStatus: null, durationMs: null, expectedIntervalHours: 24, gracePeriodMinutes: 60 },
};

// ---------------------------------------------------------------------------
// Time-bounded execution — max runtime per job in milliseconds
// ---------------------------------------------------------------------------

const JOB_TIMEOUTS: Record<string, number> = {
  'researcher': 120000,      // 2 min
  'organize': 60000,         // 1 min
  'scribe': 90000,           // 90 sec
  'daily-log': 30000,        // 30 sec
  'propagate': 60000,        // 1 min
  'tool-monitor': 180000,    // 3 min
  'feedback': 30000,         // 30 sec
  'inspect': 180000,         // 3 min
  'routing-review': 120000,  // 2 min
  'behavior-sync': 120000,   // 2 min
  'proactive-scan': 120000,  // 2 min
  'agent-scorecard': 60000,  // 1 min
  'pattern-miner': 180000,   // 3 min
  'dispatcher': 300000,      // 5 min (may chain into researcher runs)
  'auditor': 120000,         // 2 min
  'architect': 120000,       // 2 min
};

/**
 * Returns the max runtime in ms for a given job.
 * Defaults to 60000 (1 min) if the job is not in the map.
 */
export function getJobTimeout(jobName: string): number {
  try {
    return JOB_TIMEOUTS[jobName] ?? 60000;
  } catch {
    return 60000;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Mark a job as started — writes running status to registry and returns startTime for duration tracking.
 */
export async function markJobStart(jobName: string): Promise<number> {
  const startTime = Date.now();
  await writeJobStatus(jobName, 'running');
  return startTime;
}

/**
 * Mark a job as successfully completed.
 */
export async function markJobSuccess(jobName: string, startTime: number): Promise<void> {
  const durationMs = Date.now() - startTime;
  await writeJobStatus(jobName, 'success', startTime);
  await appendResult({ jobName, status: 'success', durationMs });
}

/**
 * Mark a job as failed.
 */
export async function markJobFailed(jobName: string, startTime: number): Promise<void> {
  const durationMs = Date.now() - startTime;
  await writeJobStatus(jobName, 'failed', startTime);
  await appendResult({ jobName, status: 'failed', durationMs });
}

/**
 * Set a custom status on a job (e.g., LOW_QUALITY, NEEDS_REVIEW).
 * Does not update lastRun — preserves existing run timestamp.
 */
export async function markJobStatus(jobName: string, status: JobStatus): Promise<void> {
  await writeJobStatus(jobName, status);
}

// ---------------------------------------------------------------------------
// Internal
// ---------------------------------------------------------------------------

async function writeJobStatus(
  jobName: string,
  status: JobStatus,
  startTime?: number,
): Promise<void> {
  try {
    const file = await getFileContent(REPO, REGISTRY_PATH);

    let registry: JobRegistry;
    
    if (file) {
      // Wrap JSON.parse in try/catch
      try {
        registry = JSON.parse(file.content) as JobRegistry;
      } catch (parseErr) {
        console.error('[job-registry] ⚠️ CORRUPTED — JSON.parse failed:', (parseErr as Error).message);
        
        // Alert Corey
        try {
          const { sendAlert } = await import('./alert.js');
          await sendAlert('🚨 job-registry.json is corrupted — JSON parse failed. Rebuilding from defaults.');
        } catch { /* ignore */ }
        
        // Rebuild from defaults instead of bailing out
        registry = { ...DEFAULT_REGISTRY };
      }

      // Self-healing: auto-populate any missing EXPECTED_KEYS with defaults.
      // This permanently prevents "schema invalid" failures when new jobs are added.
      let healed = false;
      for (const key of EXPECTED_KEYS) {
        if (!(key in registry)) {
          console.warn(`[job-registry] Auto-populating missing key: ${key}`);
          registry[key] = DEFAULT_REGISTRY[key] ?? {
            lastRun: null,
            lastStatus: null,
            durationMs: null,
            expectedIntervalHours: 24,
            gracePeriodMinutes: 60,
          };
          healed = true;
        }
      }
      if (healed) {
        console.log('[job-registry] Registry self-healed — missing keys populated');
      }
    } else {
      console.warn('[job-registry] Registry file not found — skipping write');
      return;
    }

    if (!registry[jobName]) {
      // Unknown job — add it with defaults
      console.warn(`[job-registry] Unknown job: ${jobName} — adding with defaults`);
      registry[jobName] = { 
        lastRun: null, 
        lastStatus: null, 
        durationMs: null, 
        expectedIntervalHours: 24, 
        gracePeriodMinutes: 60 
      };
    }

    const now = new Date().toISOString();
    registry[jobName].lastRun = now;
    registry[jobName].lastStatus = status;

    if (startTime !== undefined) {
      registry[jobName].durationMs = Date.now() - startTime;
    }

    const updatedContent = JSON.stringify(registry, null, 2);

    if (file.sha) {
      await updateFile(
        REPO,
        REGISTRY_PATH,
        updatedContent,
        `chore: job-registry [${jobName}=${status}]`,
        file.sha,
      );
    } else {
      await createFile(
        REPO,
        REGISTRY_PATH,
        updatedContent,
        `chore: job-registry [${jobName}=${status}]`,
      );
    }
  } catch (err) {
    // Never crash a job due to registry failure
    console.error('[job-registry] Failed to write status:', (err as Error).message);
  }
}
