// services/intelligence/src/utils/results-log.ts
// Operational TSV log — appends one row per job run to data/results.tsv.
// Never throws from appendResult.

import { getFileContent, updateFile, createFile } from '../lib/github.js';

const REPO = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';
const RESULTS_PATH = 'data/results.tsv';
const HEADER = 'timestamp\tjobName\tstatus\tdurationMs\tscore\tnotes';

export interface ResultEntry {
  jobName: string;
  status: 'success' | 'failed' | 'timeout' | 'skipped';
  durationMs: number;
  score?: number;
  notes?: string;
}

/**
 * Appends a TSV row to data/results.tsv.
 * Creates the file with a header row if it doesn't exist yet.
 * Never throws.
 */
export async function appendResult(entry: ResultEntry): Promise<void> {
  const row = [
    new Date().toISOString(),
    entry.jobName,
    entry.status,
    String(entry.durationMs),
    entry.score !== undefined ? String(entry.score) : '',
    entry.notes ?? '',
  ].join('\t');

  const MAX_RETRIES = 3;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const file = await getFileContent(REPO, RESULTS_PATH);

      if (file) {
        const base = file.content.endsWith('\n') ? file.content : file.content + '\n';
        const newContent = base + row + '\n';
        await updateFile(
          REPO,
          RESULTS_PATH,
          newContent,
          `chore: results-log [${entry.jobName}=${entry.status}] [railway skip]`,
          file.sha,
        );
      } else {
        const content = HEADER + '\n' + row + '\n';
        await createFile(
          REPO,
          RESULTS_PATH,
          content,
          `chore: results-log init [railway skip]`,
        );
      }
      return; // success
    } catch (err) {
      const msg = (err as Error).message ?? '';
      // GitHub optimistic lock conflict — fetch fresh SHA and retry
      if (msg.includes('but expected') && attempt < MAX_RETRIES) {
        const jitter = 100 + Math.floor(Math.random() * 200); // 100–300ms
        console.warn(`[results-log] SHA conflict on attempt ${attempt} — retrying in ${jitter}ms`);
        await new Promise((r) => setTimeout(r, jitter));
        continue;
      }
      // Final attempt failed or non-conflict error — log but never throw
      console.warn('[results-log] Failed to append result:', msg);
      return;
    }
  }
}
