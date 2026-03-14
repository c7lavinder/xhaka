// services/intelligence/src/jobs/pre-deploy-test.ts
import { markJobStart, markJobSuccess, markJobFailed } from '../utils/job-registry.js';
import { runAllPreDeployTests } from '../utils/pre-deploy-tester.js';
import { createFile } from '../lib/github.js';
import { sendTelegram } from '../utils/notifier.js';

const JOB_NAME = 'pre-deploy-test';
const REPO = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';

export async function runPreDeployTestJob(): Promise<void> {
  const startTime = await markJobStart(JOB_NAME);
  try {
    const today = new Date().toISOString().split('T')[0];
    const hour = new Date().getUTCHours();
    const { passed, results } = await runAllPreDeployTests();

    const report = [
      `# Pre-Deploy Test Results — ${today} ${hour}:00 UTC`,
      '',
      `Overall: ${passed ? '✅ PASSED' : '❌ FAILED'}`,
      '',
      ...results.map(r =>
        `## ${r.jobName}\n- Passed: ${r.passed ? 'yes' : 'no'}\n- Score: ${r.score}/100\n- Recommendation: ${r.recommendation}`,
      ),
    ].join('\n\n');

    await createFile(REPO, `intelligence/test-results/${today}-${hour}.md`, report, `chore: pre-deploy test results ${today}`);

    await sendTelegram(
      `🧪 Pre-deploy tests: ${passed ? '✅ All passed' : `❌ ${results.filter(r => !r.passed).length} failed — check intelligence/test-results/`}`,
    );

    await markJobSuccess(JOB_NAME, startTime);
  } catch (err: unknown) {
    await markJobFailed(JOB_NAME, startTime);
    throw err;
  }
}
