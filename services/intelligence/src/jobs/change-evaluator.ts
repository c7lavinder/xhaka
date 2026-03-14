// services/intelligence/src/jobs/change-evaluator.ts
// Evaluate applied proposed changes — confirm improvement or trigger rollback
// Runs daily at 9 AM CST (0 15 * * * UTC)

import { getFileContent, listDirectory, createFile } from '../lib/github.js';
import { sendTelegram } from '../utils/notifier.js';
import { revertChange } from '../utils/rollback.js';
import { markJobStart, markJobSuccess, markJobFailed } from '../utils/job-registry.js';

const REPO = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';
const APPROVED_DIR = 'intelligence/proposed-changes/approved';
const RESULTS_DIR = 'intelligence/change-results';
const EVAL_LOG_PATH = 'data/evaluation-log.json';

// How many points of drop before we call it a REGRESSION
const REGRESSION_THRESHOLD = Number(process.env.REGRESSION_THRESHOLD ?? '5');

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Verdict = 'IMPROVEMENT' | 'NEUTRAL' | 'REGRESSION';

interface AppliedChange {
  filePath: string;       // full repo path to the change file
  slug: string;           // filename without .md
  targetFile: string;     // repo-relative path of the file that was changed
  jobName: string;        // extracted from targetFile
  appliedAt: string;      // ISO timestamp
  beforeScore: number;
}

interface EvalEntry {
  jobName: string;
  runId: string;
  score: number;
  grade: string;
  rationale: string;
  evaluatedAt: string;
}

// ---------------------------------------------------------------------------
// Parsing helpers
// ---------------------------------------------------------------------------

/**
 * Parse a proposed change file and extract Applied metadata.
 * Returns null if the file has not been applied yet (no ## Applied section).
 */
function parseAppliedChange(content: string, filePath: string): AppliedChange | null {
  // Must have ## Applied section
  if (!content.includes('## Applied')) return null;

  const appliedAt = extractField(content, 'applied_at');
  const beforeScoreRaw = extractField(content, 'before_score');
  const targetFile = extractField(content, 'Target:') || extractField(content, 'Target');

  if (!appliedAt || !beforeScoreRaw || !targetFile) return null;

  const beforeScore = Number(beforeScoreRaw);
  if (isNaN(beforeScore)) return null;

  // Extract job name: last path segment, strip .ts
  const jobName = targetFile.split('/').pop()?.replace(/\.ts$/, '') ?? targetFile;
  const slug = filePath.split('/').pop()?.replace(/\.md$/, '') ?? filePath;

  return { filePath, slug, targetFile, jobName, appliedAt, beforeScore };
}

function extractField(content: string, field: string): string | null {
  // Matches "field: value" anywhere in the file (case-insensitive field)
  const regex = new RegExp(`^${field}[:\\s]+(.+)$`, 'mi');
  const match = content.match(regex);
  return match ? match[1].trim() : null;
}

// ---------------------------------------------------------------------------
// Core evaluation logic
// ---------------------------------------------------------------------------

function computeVerdict(beforeScore: number, afterScore: number): Verdict {
  const delta = afterScore - beforeScore;
  if (delta < -REGRESSION_THRESHOLD) return 'REGRESSION';
  if (delta >= REGRESSION_THRESHOLD) return 'IMPROVEMENT';
  return 'NEUTRAL';
}

function buildResultMarkdown(
  change: AppliedChange,
  afterScore: number,
  verdict: Verdict,
  evaluatedAt: string,
): string {
  const delta = afterScore - change.beforeScore;
  const deltaStr = delta >= 0 ? `+${delta}` : `${delta}`;
  const verdictEmoji = verdict === 'IMPROVEMENT' ? '✅' : verdict === 'NEUTRAL' ? '➡️' : '🔴';

  return `# Change Evaluation — ${change.slug} — ${evaluatedAt.split('T')[0]}

## Verdict: ${verdictEmoji} ${verdict}

| Field        | Value                        |
|--------------|------------------------------|
| Target File  | ${change.targetFile}         |
| Applied At   | ${change.appliedAt}          |
| Before Score | ${change.beforeScore}        |
| After Score  | ${afterScore}                |
| Delta        | ${deltaStr} pts              |
| Evaluated At | ${evaluatedAt}               |

## Notes
${verdict === 'REGRESSION'
  ? `Score dropped ${Math.abs(delta)} points — exceeds regression threshold of ${REGRESSION_THRESHOLD}. Rollback triggered.`
  : verdict === 'IMPROVEMENT'
  ? `Score improved by ${delta} points. Change confirmed as beneficial.`
  : `Score delta within acceptable range (±${REGRESSION_THRESHOLD} pts). Change retained.`
}
`;
}

function buildRevertProposalMarkdown(change: AppliedChange, afterScore: number): string {
  const date = new Date().toISOString().split('T')[0];
  return `# Proposed Revert — ${date}
Source: change-evaluator (auto-regression detection)
Target: ${change.targetFile}
Type: revert

## Reason
Applied change ${change.slug} caused a regression.
Before: ${change.beforeScore} | After: ${afterScore} | Delta: ${afterScore - change.beforeScore}

## Action
Restore original content via rollback.ts (already triggered automatically).
This file is for audit trail purposes.
`;
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export async function runChangeEvaluator(): Promise<void> {
  const startTime = await markJobStart('change-evaluator');

  try {
    console.log('[change-evaluator] Starting evaluation run...');

    const date = new Date().toISOString().split('T')[0];

    // 1. List approved change files
    const approvedFiles = await listDirectory(REPO, APPROVED_DIR);
    const mdFiles = approvedFiles.filter((f) => f.type === 'file' && f.name.endsWith('.md'));

    if (mdFiles.length === 0) {
      console.log('[change-evaluator] No approved change files found — done.');
      await markJobSuccess('change-evaluator', startTime);
      return;
    }

    console.log(`[change-evaluator] Found ${mdFiles.length} approved file(s)`);

    // 2. Load evaluation log
    let evalEntries: EvalEntry[] = [];
    try {
      const evalFile = await getFileContent(REPO, EVAL_LOG_PATH);
      if (evalFile) {
        evalEntries = JSON.parse(evalFile.content) as EvalEntry[];
        if (!Array.isArray(evalEntries)) evalEntries = [];
      }
    } catch {
      console.warn('[change-evaluator] Could not load evaluation log — skipping run');
      await markJobSuccess('change-evaluator', startTime);
      return;
    }

    // 3. Load existing results to guard against re-evaluation
    let existingResults: string[] = [];
    try {
      const resultFiles = await listDirectory(REPO, RESULTS_DIR);
      existingResults = resultFiles.map((f) => f.name.replace(/\.md$/, ''));
    } catch {
      // Directory may not exist yet — that's fine
    }

    // 4. Process each applied change
    for (const file of mdFiles) {
      try {
        await processChange(file.path, evalEntries, existingResults, date);
      } catch (err) {
        console.warn(`[change-evaluator] Error processing ${file.path}:`, (err as Error).message);
      }
    }

    console.log('[change-evaluator] Done.');
    await markJobSuccess('change-evaluator', startTime);
  } catch (err) {
    console.error('[change-evaluator] Fatal error:', err);
    await markJobFailed('change-evaluator', startTime);
    throw err;
  }
}

async function processChange(
  filePath: string,
  evalEntries: EvalEntry[],
  existingResults: string[],
  date: string,
): Promise<void> {
  // Read file
  const file = await getFileContent(REPO, filePath);
  if (!file) {
    console.warn(`[change-evaluator] Could not read ${filePath}`);
    return;
  }

  // Parse applied metadata
  const change = parseAppliedChange(file.content, filePath);
  if (!change) {
    console.log(`[change-evaluator] ${filePath} — not yet applied, skipping`);
    return;
  }

  // Already evaluated guard
  const expectedResultSlug = `${date}-${change.slug}`;
  if (existingResults.some((r) => r.includes(change.slug))) {
    console.log(`[change-evaluator] ${change.slug} — already evaluated, skipping`);
    return;
  }

  // Find after-score: first eval entry for this job AFTER applied_at
  const appliedTime = new Date(change.appliedAt).getTime();
  const afterEntry = evalEntries
    .filter((e) => e.jobName === change.jobName)
    .sort((a, b) => new Date(a.evaluatedAt).getTime() - new Date(b.evaluatedAt).getTime())
    .find((e) => new Date(e.evaluatedAt).getTime() > appliedTime);

  if (!afterEntry) {
    console.log(`[change-evaluator] No post-apply score yet for ${change.slug} — will retry tomorrow`);
    return;
  }

  const afterScore = afterEntry.score;
  const verdict = computeVerdict(change.beforeScore, afterScore);
  const evaluatedAt = new Date().toISOString();

  console.log(`[change-evaluator] ${change.slug}: before=${change.beforeScore} after=${afterScore} verdict=${verdict}`);

  // Write verdict file
  const resultPath = `${RESULTS_DIR}/${date}-${change.slug}.md`;
  const resultContent = buildResultMarkdown(change, afterScore, verdict, evaluatedAt);

  try {
    await createFile(
      REPO,
      resultPath,
      resultContent,
      `evaluate: ${verdict} for ${change.slug}`,
    );
    console.log(`[change-evaluator] ✓ Result written: ${resultPath}`);
  } catch (err) {
    console.warn(`[change-evaluator] Failed to write result for ${change.slug}:`, (err as Error).message);
  }

  // Handle REGRESSION
  if (verdict === 'REGRESSION') {
    const delta = afterScore - change.beforeScore;
    await sendTelegram(
      `🔴 *Regression detected* in \`${change.jobName}\`\n` +
      `Change: \`${change.slug}\`\n` +
      `Before: ${change.beforeScore} → After: ${afterScore} (${delta} pts)\n` +
      `Triggering automatic rollback...`,
    );

    // Write revert proposal for audit trail
    const revertSlug = change.slug.replace(/^(\d{4}-\d{2}-\d{2}-)/, '');
    const revertPath = `intelligence/proposed-changes/revert-${date}-${revertSlug}.md`;
    const revertContent = buildRevertProposalMarkdown(change, afterScore);
    try {
      await createFile(
        REPO,
        revertPath,
        revertContent,
        `evaluate: revert proposal for regression in ${change.slug}`,
      );
    } catch (err) {
      console.warn('[change-evaluator] Failed to write revert proposal:', (err as Error).message);
    }

    // Trigger rollback
    await revertChange(filePath);
  }
}
