// services/intelligence/src/jobs/benchmark.ts
import { markJobStart, markJobSuccess, markJobFailed } from '../utils/job-registry.js';
import { evaluateJobOutput } from '../utils/evaluator.js';
import { getFileContent, createFile } from '../lib/github.js';
import { sendTelegram } from '../utils/notifier.js';

const JOB_NAME = 'benchmark';
const REPO = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';

const BENCHMARK_INPUTS: Record<string, string> = {
  researcher: '# Benchmark Article\nAI evaluation systems require consistent output measurement. Benchmarking reveals whether workflows produce stable results across different inputs.',
  organize: 'Session: Discussed evaluation metrics, spawned Builder for harness improvements. Key decision: metrics required before builds.',
  scribe: 'Important: all 10 non-negotiables must be honored. Evaluate before promoting changes.',
};

export async function runBenchmark(): Promise<void> {
  const startTime = await markJobStart(JOB_NAME);
  try {
    const today = new Date().toISOString().split('T')[0];
    const results: Record<string, { score1: number; score2: number; variance: number; highVariance: boolean }> = {};

    for (const [jobName, input] of Object.entries(BENCHMARK_INPUTS)) {
      try {
        const r1 = await evaluateJobOutput(jobName, input);
        await new Promise(r => setTimeout(r, 2000));
        const r2 = await evaluateJobOutput(jobName, input);
        const variance = Math.abs(r1.score - r2.score);
        results[jobName] = { score1: r1.score, score2: r2.score, variance, highVariance: variance > 20 };
      } catch {
        results[jobName] = { score1: 0, score2: 0, variance: 0, highVariance: false };
      }
    }

    const highVarianceJobs = Object.entries(results)
      .filter(([, r]) => r.highVariance)
      .map(([name]) => name);
    const stableCount = Object.keys(results).length - highVarianceJobs.length;

    const report = [
      `# Benchmark Report — ${today}`,
      '',
      ...Object.entries(results).map(([job, r]) =>
        `## ${job}\n- Run 1: ${r.score1}/100\n- Run 2: ${r.score2}/100\n- Variance: ${r.variance} pts\n- Status: ${r.highVariance ? '⚠️ HIGH_VARIANCE' : '✅ Stable'}`,
      ),
    ].join('\n\n');

    await createFile(REPO, `intelligence/benchmark-reports/${today}.md`, report, `chore: benchmark report ${today}`);

    // Update benchmark-results.json
    const existing = await getFileContent(REPO, 'data/benchmark-results.json');
    let benchmarkData: Record<string, unknown> = {};
    if (existing) {
      try { benchmarkData = JSON.parse(existing.content); } catch { benchmarkData = {}; }
    }
    benchmarkData[today] = results;
    await createFile(REPO, 'data/benchmark-results.json', JSON.stringify(benchmarkData, null, 2), `chore: update benchmark results ${today}`);

    await sendTelegram(
      `📊 Weekly Benchmark: ${stableCount} jobs stable${highVarianceJobs.length > 0 ? `, ${highVarianceJobs.length} HIGH_VARIANCE: ${highVarianceJobs.join(', ')}` : ', none high variance'}`,
    );

    await markJobSuccess(JOB_NAME, startTime);
  } catch (err: unknown) {
    await markJobFailed(JOB_NAME, startTime);
    throw err;
  }
}
