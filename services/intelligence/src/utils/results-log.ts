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
  try {
    const row = [
      new Date().toISOString(),
      entry.jobName,
      entry.status,
      String(entry.durationMs),
      entry.score !== undefined ? String(entry.score) : '',
      entry.notes ?? '',
    ].join('\t');

    const file = await getFileContent(REPO, RESULTS_PATH);

    if (file) {
      const base = file.content.endsWith('\n') ? file.content : file.content + '\n';
      const newContent = base + row + '\n';
      await updateFile(
        REPO,
        RESULTS_PATH,
        newContent,
        `chore: results-log [${entry.jobName}=${entry.status}]`,
        file.sha,
      );
    } else {
      const content = HEADER + '\n' + row + '\n';
      await createFile(
        REPO,
        RESULTS_PATH,
        content,
        `chore: results-log init`,
      );
    }
  } catch (err) {
    // Never let a logging failure crash a job
    console.warn('[results-log] Failed to append result:', (err as Error).message);
  }
}
