// services/intelligence/src/utils/job-registry.ts
// Shared helper for all jobs to report their run status to data/job-registry.json

import { getFileContent, updateFile, createFile } from '../lib/github.js';

const REPO = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';
const REGISTRY_PATH = 'data/job-registry.json';

type JobStatus = 'success' | 'failed' | 'running';

interface JobEntry {
  lastRun: string | null;
  lastStatus: JobStatus | null;
  durationMs: number;
  expectedIntervalHours: number;
  gracePeriodMinutes: number;
}

type JobRegistry = Record<string, JobEntry>;

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
  await writeJobStatus(jobName, 'success', startTime);
}

/**
 * Mark a job as failed.
 */
export async function markJobFailed(jobName: string, startTime: number): Promise<void> {
  await writeJobStatus(jobName, 'failed', startTime);
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
      registry = JSON.parse(file.content);
    } else {
      console.warn('[job-registry] Registry file not found — skipping write');
      return;
    }

    if (!registry[jobName]) {
      console.warn(`[job-registry] Unknown job: ${jobName} — skipping`);
      return;
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
