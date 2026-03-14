// services/intelligence/src/jobs/dispatcher.ts
// Event-driven task dispatcher — reads pending tasks from the queue and
// routes them to the appropriate job function. Runs every 1 minute.

import { getPendingTasks, updateTaskStatus, pruneOldTasks, type Task } from '../utils/task-queue.js';
import { markJobStart, markJobSuccess, markJobFailed } from '../utils/job-registry.js';
import { runResearcher } from './researcher.js';

// ---------------------------------------------------------------------------
// Agent -> job function registry
// Add new agents here as they are implemented.
// ---------------------------------------------------------------------------

type JobFn = (payload: unknown) => Promise<void>;

/**
 * Maps "agent/task" strings to job functions.
 * Key format: "<agent>/<task>" or just "<agent>" for a catch-all.
 */
const DISPATCH_MAP: Record<string, JobFn> = {
  // researcher: process-article
  'researcher/process-article': async (payload: unknown) => {
    const p = payload as { path?: string };
    console.log(`[dispatcher] researcher/process-article -> path: ${p?.path ?? '(none)'}`);
    await runResearcher();
  },

  // researcher (catch-all)
  'researcher': async (_payload: unknown) => {
    await runResearcher();
  },

  // auditor placeholder
  'auditor': async (_payload: unknown) => {
    console.warn('[dispatcher] auditor job not yet implemented -- skipping');
  },
};

// ---------------------------------------------------------------------------
// Dispatcher
// ---------------------------------------------------------------------------

export async function runDispatcher(): Promise<void> {
  const _startTime = await markJobStart('dispatcher');

  try {
    console.log('[dispatcher] Reading pending tasks...');

    const pending = await getPendingTasks();

    if (pending.length === 0) {
      console.log('[dispatcher] No pending tasks -- nothing to do.');
      await markJobSuccess('dispatcher', _startTime);
      return;
    }

    console.log(`[dispatcher] Found ${pending.length} pending task(s).`);

    for (const task of pending) {
      await dispatchTask(task);
    }

    // Prune old completed/failed tasks to avoid queue bloat
    await pruneOldTasks();

    await markJobSuccess('dispatcher', _startTime);
  } catch (err) {
    console.error('[dispatcher] Fatal error:', err);
    await markJobFailed('dispatcher', _startTime);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Individual task dispatch
// ---------------------------------------------------------------------------

async function dispatchTask(task: Task): Promise<void> {
  const specificKey = `${task.agent}/${task.task}`;
  const catchAllKey = task.agent;

  const handler = DISPATCH_MAP[specificKey] ?? DISPATCH_MAP[catchAllKey];

  if (!handler) {
    console.warn(
      `[dispatcher] No handler for agent="${task.agent}" task="${task.task}" (id=${task.id}) -- marking failed`,
    );
    await updateTaskStatus(task.id, 'failed');
    return;
  }

  console.log(`[dispatcher] Running task ${task.id}: ${specificKey}`);

  // Mark as running BEFORE executing to prevent double-dispatch
  await updateTaskStatus(task.id, 'running');

  try {
    await handler(task.payload);
    await updateTaskStatus(task.id, 'completed');
    console.log(`[dispatcher] Task ${task.id} completed.`);
  } catch (err) {
    console.error(`[dispatcher] Task ${task.id} failed:`, (err as Error).message);
    await updateTaskStatus(task.id, 'failed');
  }
}
