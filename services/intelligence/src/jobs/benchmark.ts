// services/intelligence/src/jobs/benchmark.ts
// Weekly benchmark job (Wednesday 6 AM CST): measures evaluator consistency
// per job by running the evaluator twice on the same input and comparing scores.
// HIGH_VARIANCE (delta > 20 pts) jobs are flagged in data/benchmark-results.json
// and marked NEEDS_REVIEW in job-registry.

import { TEST_CASES } from '../utils/pre-deploy-tester.js';
import { evaluateJobOutput } from '../utils/evaluator.js';
import { markJobStatus } from '../utils/job-registry.js';
import { getFileContent, updateFile, createFile } from '../lib/github.js';
import { sendTelegram } from '../utils/notifier.js';

const REPO = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';
const BENCHMARK_RESULTS_PATH = 'data/benchmark-results.json';
const VARIANCE_THRESHOLD = 20;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BenchmarkJobResult {
  jobName: string;
  scoreA: number;
  scoreB: number;
  variance: number;
  flagged: boolean; // true if variance > VARIANCE_THRESHOLD
  runAt: string;
}

interface BenchmarkResults {
  [jobName: string]: BenchmarkJobResult[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function todayDateStr(): string {
  const d = new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function buildReportMarkdown(
  results: BenchmarkJobResult[],
  stableCount: number,
  highVarianceCount: number,
  today: string,
): string {
  const rows = results
    .map((r) => {
      const flag = r.flagged ? '⚠️ HIGH_VARIANCE' : '✅ STABLE';
      return `| ${r.jobName} | ${r.scoreA} | ${r.scoreB} | ${r.variance} | ${flag} |`;
    })
    .join('\n');

  return `# Weekly Benchmark Report — ${today}

**${stableCount} jobs stable | ${highVarianceCount} HIGH_VARIANCE**

## Results

| Job | Score A | Score B | Variance | Status |
|-----|---------|---------|----------|--------|
${rows}

## Notes
- Variance threshold: ${VARIANCE_THRESHOLD} points
- HIGH_VARIANCE jobs have been flagged NEEDS_REVIEW in job-registry
- Generated: ${new Date().toISOString()}
`;
}

async function loadBenchmarkResults(): Promise<BenchmarkResults> {
  try {
    const file = await getFileContent(REPO, BENCHMARK_RESULTS_PATH);
    if (!file || !file.content.trim()) return {};
    const parsed = JSON.parse(file.content) as BenchmarkResults;
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

async function saveBenchmarkResults(results: BenchmarkResults): Promise<void> {
  try {
    const file = await getFileContent(REPO, BENCHMARK_RESULTS_PATH);
    const content = JSON.stringify(results, null, 2);
    if (file?.sha) {
      await updateFile(
        REPO,
        BENCHMARK_RESULTS_PATH,
        content,
        `chore: benchmark-results update ${todayDateStr()}`,
        file.sha,
      );
    } else {
      await createFile(
        REPO,
        BENCHMARK_RESULTS_PATH,
        content,
        `chore: benchmark-results init`,
      );
    }
  } catch (err) {
    console.warn('[benchmark] Failed to save benchmark results:', (err as Error).message);
  }
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export async function runBenchmark(): Promise<void> {
  try {
    console.log('[benchmark] Starting weekly consistency benchmark...');

    const today = todayDateStr();
    const runAt = new Date().toISOString();
    const jobResults: BenchmarkJobResult[] = [];

    // Run evaluator twice for each test case
    for (const tc of TEST_CASES) {
      console.log(`[benchmark] Running ${tc.jobName} x2...`);

      let scoreA = 50;
      let scoreB = 50;

      try {
        const evalA = await evaluateJobOutput(tc.jobName, tc.sampleInput);
        scoreA = evalA.score;
      } catch (err) {
        console.warn(`[benchmark] evaluateJobOutput (run A) failed for ${tc.jobName}:`, (err as Error).message);
      }

      // Small delay to avoid sending identical requests back-to-back
      await new Promise<void>((resolve) => setTimeout(resolve, 2000));

      try {
        const evalB = await evaluateJobOutput(tc.jobName, tc.sampleInput);
        scoreB = evalB.score;
      } catch (err) {
        console.warn(`[benchmark] evaluateJobOutput (run B) failed for ${tc.jobName}:`, (err as Error).message);
      }

      const variance = Math.abs(scoreA - scoreB);
      const flagged = variance > VARIANCE_THRESHOLD;

      jobResults.push({ jobName: tc.jobName, scoreA, scoreB, variance, flagged, runAt });

      if (flagged) {
        console.warn(
          `[benchmark] HIGH_VARIANCE: ${tc.jobName} (${scoreA} vs ${scoreB}, delta=${variance})`,
        );
        try {
          await markJobStatus(tc.jobName, 'NEEDS_REVIEW');
        } catch (err) {
          console.warn(`[benchmark] markJobStatus NEEDS_REVIEW failed for ${tc.jobName}:`, (err as Error).message);
        }
      }
    }

    const stableJobs = jobResults.filter((r) => !r.flagged);
    const highVarianceJobs = jobResults.filter((r) => r.flagged);

    // Persist to benchmark-results.json
    const allResults = await loadBenchmarkResults();
    for (const r of jobResults) {
      if (!Array.isArray(allResults[r.jobName])) {
        allResults[r.jobName] = [];
      }
      allResults[r.jobName].push(r);
      // Keep only last 20 entries per job
      if (allResults[r.jobName].length > 20) {
        allResults[r.jobName] = allResults[r.jobName].slice(-20);
      }
    }
    await saveBenchmarkResults(allResults);

    // Write markdown report
    const reportPath = `intelligence/benchmark-reports/${today}.md`;
    const reportContent = buildReportMarkdown(
      jobResults,
      stableJobs.length,
      highVarianceJobs.length,
      today,
    );

    try {
      await createFile(
        REPO,
        reportPath,
        reportContent,
        `benchmark: weekly report ${today}`,
      );
      console.log(`[benchmark] Report written: ${reportPath}`);
    } catch (writeErr) {
      console.warn('[benchmark] Failed to write report:', (writeErr as Error).message);
    }

    // Telegram summary
    const highVarianceNames =
      highVarianceJobs.length > 0
        ? `\n⚠️ HIGH_VARIANCE: ${highVarianceJobs.map((r) => r.jobName).join(', ')}`
        : '';

    await sendTelegram(
      `📊 *Weekly Benchmark: ${stableJobs.length} jobs stable, ${highVarianceJobs.length} jobs HIGH_VARIANCE*${highVarianceNames}`,
    );

    console.log(
      `[benchmark] Done. ${stableJobs.length} stable, ${highVarianceJobs.length} HIGH_VARIANCE.`,
    );
  } catch (err) {
    // Never throws
    console.error('[benchmark] Fatal error (non-throwing):', (err as Error).message);
    try {
      await sendTelegram(
        `🚨 *benchmark* failed unexpectedly: ${(err as Error).message}`,
      );
    } catch {
      // ignore notifier failure
    }
  }
}
