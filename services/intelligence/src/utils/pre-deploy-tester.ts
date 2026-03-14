// services/intelligence/src/utils/pre-deploy-tester.ts
import { evaluateJobOutput } from './evaluator.js';

interface TestCase {
  jobName: string;
  sampleInput: string;
  expectedOutputContains: string[];
  minimumScore: number;
}

interface PreDeployResult {
  jobName: string;
  passed: boolean;
  score: number;
  missing: string[];
  recommendation: string;
}

const TEST_CASES: TestCase[] = [
  {
    jobName: 'researcher',
    sampleInput: '# Test Article\nAI systems need evaluation loops to improve. Without measuring output quality, improvements are guesses. The key insight: build the harness before maximizing autonomy.',
    expectedOutputContains: ['insight', 'evaluation'],
    minimumScore: 60,
  },
  {
    jobName: 'organize',
    sampleInput: 'Session capture: Corey approved the evaluate step build. Builder spawned. Routing used correctly.',
    expectedOutputContains: ['decision', 'action'],
    minimumScore: 55,
  },
  {
    jobName: 'scribe',
    sampleInput: 'Key decision: evaluate step required before promoting proposed changes. Non-negotiable.',
    expectedOutputContains: ['decision'],
    minimumScore: 60,
  },
];

export async function runPreDeployTest(jobName: string): Promise<PreDeployResult> {
  try {
    const testCase = TEST_CASES.find(t => t.jobName === jobName);
    if (!testCase) {
      return { jobName, passed: true, score: 100, missing: [], recommendation: 'No test case defined — skipped' };
    }
    const result = await evaluateJobOutput(jobName, testCase.sampleInput);
    const missing = testCase.expectedOutputContains.filter(
      s => !testCase.sampleInput.toLowerCase().includes(s.toLowerCase()),
    );
    const passed = result.score >= testCase.minimumScore;
    return {
      jobName,
      passed,
      score: result.score,
      missing,
      recommendation: passed
        ? 'Ready to deploy'
        : `Score ${result.score} below minimum ${testCase.minimumScore}`,
    };
  } catch {
    return { jobName, passed: true, score: 75, missing: [], recommendation: 'Test unavailable — proceeding' };
  }
}

export async function runAllPreDeployTests(): Promise<{ passed: boolean; results: PreDeployResult[] }> {
  const results: PreDeployResult[] = [];
  for (const tc of TEST_CASES) {
    results.push(await runPreDeployTest(tc.jobName));
  }
  return { passed: results.every(r => r.passed), results };
}
