// services/intelligence/src/utils/pre-deploy-tester.ts
// Pre-deploy test harness — validates evaluator pipeline against known-good outputs

import { evaluateJobOutput } from './evaluator.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TestCase {
  jobName: string;
  sampleInput: string;
  expectedOutputContains: string[]; // strings that should appear in output
  minimumScore: number;
}

export interface PreDeployResult {
  jobName: string;
  passed: boolean;
  score: number;
  missing: string[]; // expectedOutputContains strings that were absent
  recommendation: string;
}

export interface PreDeploySummary {
  allPassed: boolean;
  results: PreDeployResult[];
  testedAt: string;
}

// ---------------------------------------------------------------------------
// Test cases — known-good outputs that the evaluator should score well
// ---------------------------------------------------------------------------

export const TEST_CASES: TestCase[] = [
  {
    jobName: 'researcher',
    sampleInput:
      '# Test Article\nAI systems need evaluation loops to improve. Without measuring output quality, improvements are guesses. The key insight: build the harness before maximizing autonomy.',
    expectedOutputContains: ['insight', 'evaluation', 'harness'],
    minimumScore: 60,
  },
  {
    jobName: 'organize',
    sampleInput:
      'Session capture: Corey approved the evaluate step build. Builder spawned. Routing used correctly.',
    expectedOutputContains: ['decision', 'action'],
    minimumScore: 55,
  },
  {
    jobName: 'scribe',
    sampleInput:
      'Key decision: evaluate step required before promoting proposed changes. Non-negotiable.',
    expectedOutputContains: ['decision', 'MEMORY'],
    minimumScore: 60,
  },
];

// ---------------------------------------------------------------------------
// Core functions
// ---------------------------------------------------------------------------

/**
 * Run a single pre-deploy test for the given jobName.
 * Evaluates the test case's sampleInput via the evaluator rubric.
 * Never throws.
 */
export async function runPreDeployTest(jobName: string): Promise<PreDeployResult> {
  try {
    const testCase = TEST_CASES.find((tc) => tc.jobName === jobName);
    if (!testCase) {
      return {
        jobName,
        passed: false,
        score: 0,
        missing: [],
        recommendation: `No test case defined for job: ${jobName}`,
      };
    }

    // Check expectedOutputContains against sampleInput (case-insensitive)
    const lowerInput = testCase.sampleInput.toLowerCase();
    const missing = testCase.expectedOutputContains.filter(
      (token) => !lowerInput.includes(token.toLowerCase()),
    );

    // Evaluate via OpenAI rubric
    let score = 50;
    try {
      const evalResult = await evaluateJobOutput(jobName, testCase.sampleInput);
      score = evalResult.score;
    } catch (evalErr) {
      console.warn(
        `[pre-deploy-tester] evaluateJobOutput failed for ${jobName}:`,
        (evalErr as Error).message,
      );
    }

    const passed = score >= testCase.minimumScore && missing.length === 0;

    let recommendation: string;
    if (passed) {
      recommendation = `✅ ${jobName}: score ${score} >= ${testCase.minimumScore}, all expected tokens present.`;
    } else {
      const issues: string[] = [];
      if (score < testCase.minimumScore) {
        issues.push(`score ${score} < minimum ${testCase.minimumScore}`);
      }
      if (missing.length > 0) {
        issues.push(`missing tokens: ${missing.join(', ')}`);
      }
      recommendation = `❌ ${jobName}: ${issues.join('; ')}. Review evaluator rubric or test input.`;
    }

    return { jobName, passed, score, missing, recommendation };
  } catch (err) {
    console.warn(`[pre-deploy-tester] runPreDeployTest failed for ${jobName}:`, (err as Error).message);
    return {
      jobName,
      passed: false,
      score: 0,
      missing: [],
      recommendation: `Error during test: ${(err as Error).message}`,
    };
  }
}

/**
 * Run all pre-deploy tests and return a summary.
 * Never throws.
 */
export async function runAllPreDeployTests(): Promise<PreDeploySummary> {
  const testedAt = new Date().toISOString();
  const results: PreDeployResult[] = [];

  for (const tc of TEST_CASES) {
    const result = await runPreDeployTest(tc.jobName);
    results.push(result);
  }

  const allPassed = results.every((r) => r.passed);
  return { allPassed, results, testedAt };
}
