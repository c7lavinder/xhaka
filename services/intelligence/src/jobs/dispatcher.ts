// services/intelligence/src/jobs/dispatcher.ts
// On-Call Dispatcher — reads pending tasks from the queue and routes them
// to the appropriate specialist agent. Runs every minute.
//
// Supported agents: researcher | auditor | architect | voice-ingest | librarian | repo-researcher
// All agents log a proof-of-work artifact back to the task entry on completion.

import { getPendingTasks, updateTaskStatus, completeTask, pruneOldTasks, type Task } from '../utils/task-queue.js';
import { markJobStart, markJobSuccess, markJobFailed } from '../utils/job-registry.js';
import { runResearcher } from './researcher.js';
import { runAuditor } from './auditor.js';
import { runArchitect } from './architect.js';
import { runVoiceIngest } from './voice-ingest.js';
import { runLibrarian } from './librarian.js';
import { runRepoResearch } from './repo-researcher.js';

// ---------------------------------------------------------------------------
// Dispatcher
// ---------------------------------------------------------------------------

export async function runDispatcher(): Promise<void> {
  const _startTime = await markJobStart('dispatcher');

  try {
    console.log('[dispatcher] Checking task queue...');

    const pending = await getPendingTasks();

    if (pending.length === 0) {
      console.log('[dispatcher] Queue empty — all agents idle.');
      await markJobSuccess('dispatcher', _startTime);
      return;
    }

    console.log(`[dispatcher] Found ${pending.length} pending task(s).`);

    // Process tasks one at a time — serialized to avoid GitHub rate limits
    const MAX_PER_RUN = 5;
    const toProcess = pending.slice(0, MAX_PER_RUN);

    for (const task of toProcess) {
      await dispatchTask(task);
    }

    // Prune old completed/failed tasks to keep queue file tidy
    await pruneOldTasks();

    await markJobSuccess('dispatcher', _startTime);
  } catch (err) {
    console.error('[dispatcher] Fatal error:', err);
    await markJobFailed('dispatcher', _startTime);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Route a single task to the correct agent
// ---------------------------------------------------------------------------

async function dispatchTask(task: Task): Promise<void> {
  console.log(`[dispatcher] ▶️ Routing task ${task.id}: ${task.agent}/${task.task}`);

  // Mark as running BEFORE executing — prevents double-dispatch if dispatcher reruns
  await updateTaskStatus(task.id, 'running');

  try {
    const proof = await routeToAgent(task);
    await completeTask(task.id, proof, 'completed');
    console.log(`[dispatcher] ✅ Task ${task.id} completed.`);
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error(`[dispatcher] ❌ Task ${task.id} failed:`, errMsg);
    await completeTask(task.id, `FAILED: ${errMsg}`, 'failed');
  }
}

// ---------------------------------------------------------------------------
// Agent routing table
// ---------------------------------------------------------------------------

async function routeToAgent(task: Task): Promise<string> {
  const key = `${task.agent}/${task.task}`;
  const payload = task.payload as Record<string, unknown>;

  switch (task.agent) {

    // ── Researcher ─────────────────────────────────────────────────────────
    case 'researcher': {
      console.log(`[dispatcher] → Researcher: ${task.task}`);
      await runResearcher();
      return `Researcher processed article-inbox.md at ${new Date().toISOString()}. Triggered by task ${task.id}.`;
    }

    // ── Auditor ────────────────────────────────────────────────────────────
    case 'auditor': {
      console.log(`[dispatcher] → Auditor: ${task.task}`);
      const result = await runAuditor(payload);
      return result;
    }

    // ── Architect ──────────────────────────────────────────────────────────
    case 'architect': {
      console.log(`[dispatcher] → Architect: ${task.task}`);
      const result = await runArchitect(payload);
      return result;
    }

    // ── Voice Ingest ───────────────────────────────────────────────────────
    case 'voice-ingest': {
      console.log(`[dispatcher] → Voice Ingest: ${task.task}`);
      await runVoiceIngest();
      return `Voice ingest completed at ${new Date().toISOString()}. Triggered by task ${task.id}.`;
    }

    // ── Librarian ──────────────────────────────────────────────────────────
    case 'librarian': {
      console.log(`[dispatcher] → Librarian: ${task.task}`);
      await runLibrarian();
      return `Librarian audit completed at ${new Date().toISOString()}. Report: intelligence/librarian-reports/${new Date().toISOString().split('T')[0]}.md. Triggered by task ${task.id}.`;
    }


    // ── Repo Researcher ────────────────────────────────────────────────────
    case 'repo-researcher': {
      console.log(`[dispatcher] → Repo Researcher: ${task.task} — ${String(payload?.url)}`);
      const result = await runRepoResearch(String(payload?.url ?? ''));
      return `Repo researcher: ${result} at ${new Date().toISOString()}. Triggered by task ${task.id}.`;
    }

        // ── Unknown ────────────────────────────────────────────────────────────
    default: {
      const msg = `No handler for agent="${task.agent}" task="${task.task}" — skipped`;
      console.warn(`[dispatcher] ⚠️ ${msg}`);
      throw new Error(msg);
    }
  }

  // TypeScript needs this (unreachable but satisfies return type)
  void key;
}
