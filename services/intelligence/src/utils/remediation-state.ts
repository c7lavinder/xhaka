// utils/remediation-state.ts
// Persists operator remediation state to GitHub so Railway restarts don't lose it.

import { getFileContent, updateFile, createFile } from '../lib/github.js';

const REPO = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';
const STATE_PATH = 'data/remediation-state.json';
const STALE_THRESHOLD_MS = 25 * 60 * 60 * 1000; // 25 hours

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AttemptRecord {
  count: number;
  firstAttemptAt: string;   // ISO 8601
  lastAttemptAt: string;    // ISO 8601
}

export interface ActiveRemediationRecord {
  attempt: number;
  startedAt: string;        // ISO 8601
  failureType: string;
  lastAction: string;
  waitUntil: string;        // ISO 8601
}

export interface RemediationStateFile {
  attempts: Record<string, AttemptRecord>;
  activeRemediations: Record<string, ActiveRemediationRecord>;
}

// ─── Load ────────────────────────────────────────────────────────────────────

export async function loadRemediationState(): Promise<RemediationStateFile> {
  try {
    const file = await getFileContent(REPO, STATE_PATH);
    if (!file) {
      return { attempts: {}, activeRemediations: {} };
    }
    const parsed = JSON.parse(file.content) as RemediationStateFile;
    return cleanupStaleEntries(parsed);
  } catch (err) {
    console.error('[remediation-state] Failed to load — starting fresh:', (err as Error).message);
    return { attempts: {}, activeRemediations: {} };
  }
}

// ─── Save ────────────────────────────────────────────────────────────────────

export async function saveRemediationState(state: RemediationStateFile): Promise<void> {
  try {
    const file = await getFileContent(REPO, STATE_PATH);
    const content = JSON.stringify(state, null, 2);
    const message = 'chore: remediation-state update';

    if (file?.sha) {
      await updateFile(REPO, STATE_PATH, content, message, file.sha);
    } else {
      await createFile(REPO, STATE_PATH, content, message);
    }
  } catch (err) {
    // Non-fatal — log but don't crash operator
    console.error('[remediation-state] Failed to save:', (err as Error).message);
  }
}

// ─── Cleanup ─────────────────────────────────────────────────────────────────

export function cleanupStaleEntries(state: RemediationStateFile): RemediationStateFile {
  const now = Date.now();
  const cleaned: RemediationStateFile = { attempts: {}, activeRemediations: {} };

  for (const [jobId, record] of Object.entries(state.attempts)) {
    const age = now - new Date(record.lastAttemptAt).getTime();
    if (age < STALE_THRESHOLD_MS) {
      cleaned.attempts[jobId] = record;
    }
  }

  for (const [jobId, record] of Object.entries(state.activeRemediations)) {
    const age = now - new Date(record.startedAt).getTime();
    if (age < STALE_THRESHOLD_MS) {
      cleaned.activeRemediations[jobId] = record;
    }
  }

  return cleaned;
}
