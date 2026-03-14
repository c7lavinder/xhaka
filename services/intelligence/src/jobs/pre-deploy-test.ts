// services/intelligence/src/jobs/pre-deploy-test.ts
// Manual-only job: runs pre-deploy test harness and writes results to GitHub.
// Trigger: runJobNow('pre-deploy-test') — no cron schedule.

import { runAllPreDeployTests } from '../utils/pre-deploy-tester.js';
import { createFile } from '../lib/github.js';
import { sendTelegram } from '../utils/notifier.js';

const REPO = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function nowDateHourStr(): string {
  const d = new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const hh = String(d.getUTCHours()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}-${hh}`;
}

interface TestResultRow {
  jobName: string;
  passed: boolean;
  score: number;
  missing: string[];
  recommendation: string;
}

function buildResultMarkdown(
  allPassed: boolean,
  results: TestResultRow[],
  testedAt: string,
): string {
  const statusLine = allPassed
    ? '## ✅ All tests passed'
    : '## ❌ One or more tests failed';

  const rows = results
    .map((r) => {
      const status = r.passed ? '✅ PASS' : '❌ FAIL';
      const missing = r.missing.length > 0 ? `missing: ${r.missing.join(', ')}` : 'all tokens present';
      return `| ${r.jobName} | ${status} | ${r.score} | ${missing} |`;
    })
    .join('\n');

  const recommendations = results
    .map((r) => `- ${r.recommendation}`)
    .join('\n');

  return `# Pre-Deploy Test Results
Tested at: ${testedAt}

${statusLine}

## Results

| Job | Status | Score | Tokens |
|-----|--------|-------|--------|
${rows}

## Recommendations
${recommendations}
`;
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export async function runPreDeployTest(): Promise<void> {
  try {
    console.log('[pre-deploy-test] Starting pre-deploy test harness...');

    const summary = await runAllPreDeployTests();

    // Write results to GitHub
    const dateHour = nowDateHourStr();
    const resultPath = `intelligence/test-results/${dateHour}.md`;
    const content = buildResultMarkdown(summary.allPassed, summary.results, summary.testedAt);

    try {
      await createFile(
        REPO,
        resultPath,
        content,
        `test: pre-deploy results ${dateHour} [${summary.allPassed ? 'PASS' : 'FAIL'}]`,
      );
      console.log(`[pre-deploy-test] Results written: ${resultPath}`);
    } catch (writeErr) {
      console.warn('[pre-deploy-test] Failed to write results file:', (writeErr as Error).message);
    }

    // Send Telegram summary
    const passCount = summary.results.filter((r) => r.passed).length;
    const failCount = summary.results.length - passCount;
    const icon = summary.allPassed ? '✅' : '❌';
    const lines = summary.results.map(
      (r) => `  • ${r.jobName}: ${r.passed ? '✅' : '❌'} score=${r.score}`,
    );

    const telegramMsg =
      `${icon} *Pre-Deploy Test: ${summary.allPassed ? 'ALL PASS' : 'FAILURES DETECTED'}*\n` +
      `${passCount}/${summary.results.length} passed\n\n` +
      lines.join('\n') +
      (failCount > 0
        ? `\n\n⚠️ Review \`${resultPath}\` before deploying.`
        : `\n\n🟢 Safe to deploy.`);

    await sendTelegram(telegramMsg);

    console.log(
      `[pre-deploy-test] Done. ${passCount}/${summary.results.length} tests passed.`,
    );
  } catch (err) {
    // Never throws — log and notify
    console.error('[pre-deploy-test] Fatal error (non-throwing):', (err as Error).message);
    try {
      await sendTelegram(
        `🚨 *pre-deploy-test* failed unexpectedly: ${(err as Error).message}`,
      );
    } catch {
      // ignore notifier failure
    }
  }
}
