// services/intelligence/src/utils/task-queue.ts
// Persistent task queue backed by data/task-queue.json in the GitHub repo.
// Provides push/read/update operations for the event-driven dispatcher.

import { getFileContent, updateFile, createFile } from '../lib/github.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface Task {
  id: string;
  agent: string;
  task: string;
  payload: unknown;
  status: TaskStatus;
  createdAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  updatedAt?: string | null;
  proofOfWork?: string | null;   // Artifact summary logged after task completion
}

interface QueueFile {
  tasks: Task[];
}

// ---------------------------------------------------------------------------
// Internal constants
// ---------------------------------------------------------------------------

const REPO = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';
const QUEUE_PATH = 'data/task-queue.json';
const MAX_COMPLETED_TASKS = 50; // Keep only the most recent completed/failed tasks

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function readQueueFile(): Promise<{ queue: QueueFile; sha: string | null }> {
  const file = await getFileContent(REPO, QUEUE_PATH);

  if (!file) {
    return { queue: { tasks: [] }, sha: null };
  }

  try {
    const queue = JSON.parse(file.content) as QueueFile;
    if (!Array.isArray(queue.tasks)) {
      console.warn('[task-queue] Malformed task-queue.json — resetting to empty queue');
      return { queue: { tasks: [] }, sha: file.sha };
    }
    return { queue, sha: file.sha };
  } catch {
    console.error('[task-queue] Failed to parse task-queue.json — resetting to empty queue');
    return { queue: { tasks: [] }, sha: file.sha };
  }
}

async function writeQueueFile(queue: QueueFile, sha: string | null, message: string): Promise<void> {
  const content = JSON.stringify(queue, null, 2);

  if (sha === null) {
    // File doesn't exist yet — create it
    await createFile(REPO, QUEUE_PATH, content, message);
  } else {
    await updateFile(REPO, QUEUE_PATH, content, message, sha);
  }
}

function generateId(): string {
  return `task_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Push a new task onto the queue with status='pending'.
 */
export async function pushTask(
  opts: Pick<Task, 'agent' | 'task' | 'payload'>,
): Promise<Task> {
  const { queue, sha } = await readQueueFile();

  const newTask: Task = {
    id: generateId(),
    agent: opts.agent,
    task: opts.task,
    payload: opts.payload,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  queue.tasks.push(newTask);

  await writeQueueFile(
    queue,
    sha,
    `task-queue: push ${opts.agent}/${opts.task} [${newTask.id}]`,
  );

  console.log(`[task-queue] Pushed task ${newTask.id}: ${opts.agent}/${opts.task}`);
  return newTask;
}

/**
 * Read all pending tasks from the queue.
 */
export async function getPendingTasks(): Promise<Task[]> {
  const { queue } = await readQueueFile();
  return queue.tasks.filter((t) => t.status === 'pending');
}

/**
 * Read all tasks from the queue.
 */
export async function getAllTasks(): Promise<Task[]> {
  const { queue } = await readQueueFile();
  return queue.tasks;
}

/**
 * Update the status of a task by ID.
 * Uses a fresh read+write cycle to avoid race conditions.
 */
export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus,
): Promise<void> {
  const { queue, sha } = await readQueueFile();

  const task = queue.tasks.find((t) => t.id === taskId);
  if (!task) {
    console.warn(`[task-queue] updateTaskStatus: task ${taskId} not found`);
    return;
  }

  task.status = status;
  if (status === 'running') task.startedAt = new Date().toISOString();
  if (status === 'completed' || status === 'failed') task.completedAt = new Date().toISOString();

  await writeQueueFile(
    queue,
    sha,
    `task-queue: update ${taskId} -> ${status}`,
  );

  console.log(`[task-queue] Task ${taskId} (${task.agent}/${task.task}) -> ${status}`);
}

/**
 * Mark a task complete and log the proof-of-work artifact.
 * Call this after an agent successfully finishes its work.
 */
export async function completeTask(
  taskId: string,
  proofOfWork: string,
  status: 'completed' | 'failed' = 'completed',
): Promise<void> {
  const { queue, sha } = await readQueueFile();

  const task = queue.tasks.find((t) => t.id === taskId);
  if (!task) {
    console.warn(`[task-queue] completeTask: task ${taskId} not found`);
    return;
  }

  task.status = status;
  task.completedAt = new Date().toISOString();
  task.proofOfWork = proofOfWork;

  await writeQueueFile(
    queue,
    sha,
    `task-queue: ${status} ${task.agent}/${task.task} [${taskId}] — ${proofOfWork.slice(0, 60)}`,
  );

  console.log(`[task-queue] ✓ ${status}: ${task.agent}/${task.task} [${taskId}] — ${proofOfWork.slice(0, 80)}`);
}

/**
 * Prune completed/failed tasks, keeping only the most recent MAX_COMPLETED_TASKS.
 * Active (pending/running) tasks are always preserved.
 * Call this periodically to keep the queue file tidy.
 */
export async function pruneOldTasks(maxAgeMs?: number): Promise<number> {
  const { queue, sha } = await readQueueFile();
  const before = queue.tasks.length;

  // Separate active tasks from terminal tasks
  const activeTasks = queue.tasks.filter(
    (t) => t.status !== 'completed' && t.status !== 'failed',
  );
  const terminalTasks = queue.tasks.filter(
    (t) => t.status === 'completed' || t.status === 'failed',
  );

  // Sort terminal tasks newest-first by completedAt (fallback: createdAt)
  terminalTasks.sort((a, b) => {
    const aTime = new Date(a.completedAt || a.createdAt).getTime();
    const bTime = new Date(b.completedAt || b.createdAt).getTime();
    return bTime - aTime;
  });

  // Keep only the most recent MAX_COMPLETED_TASKS
  const keptTerminal = terminalTasks.slice(0, MAX_COMPLETED_TASKS);

  queue.tasks = [...activeTasks, ...keptTerminal];

  const pruned = before - queue.tasks.length;
  if (pruned > 0) {
    await writeQueueFile(queue, sha, `task-queue: pruned ${pruned} old task(s) (kept last ${MAX_COMPLETED_TASKS})`);
    console.log(`[task-queue] Pruned ${pruned} old task(s) — kept ${keptTerminal.length} recent completed/failed`);
  }

  return pruned;
}

// ---------------------------------------------------------------------------
// Backward-compat alias (matches the 3-arg enqueue(agent, task, payload) API
// used in capture.ts and other callers prior to the Task interface migration)
// ---------------------------------------------------------------------------

export async function enqueue(
  agent: string,
  task: string,
  payload: Record<string, unknown>,
): Promise<Task> {
  return pushTask({ agent, task, payload });
}
