// services/intelligence/src/jobs/inspect.ts
// Root cause analysis — reads flagged jobs, correlates signals, writes inspect reports

import { getFileContent, createFile } from '../lib/github.js';
import { synthesize } from '../lib/openai.js';
import { markJobStart, markJobSuccess, markJobFailed } from '../utils/job-registry.js';
import { sendTelegram } from '../utils/notifier.js';

const REPO = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';
const REGISTRY_PATH = 'data/job-registry.json';
const EVAL_LOG_PATH = 'data/evaluation-log.json';
const FEEDBACK_LOG_PATH = 'data/feedback-log.json';

interface RegistryEntry {
  lastRun: string | null;
  lastStatus: string | null;
  [key: string]: unknown;
}

interface EvalEntry {
  jobName: string;
  runId: string;
  score: number;
  grade: string;
  rationale: string;
  evaluatedAt: string;
}

interface FeedbackEntry {
  job: string;
  date: string;
  rating: string;
  comment: string;
  processedAt: string;
}

interface InspectResult {
  rootCauseType: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  summary: string;
  recommendedFix: string;
}

const FLAGGED_STATUSES = new Set(['FAILED', 'failed', 'LOW_QUALITY', 'NEEDS_REVIEW']);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function getLastN<T>(arr: T[], n: number): T[] {
  return arr.slice(-n);
}

async function analyzeRootCause(
  jobName: string,
  sourceCode: string,
  evalEntries: EvalEntry[],
  feedbackEntries: FeedbackEntry[],
): Promise<InspectResult> {
  const systemPrompt = `You are a root cause analyst for an AI operations pipeline.
Given job source code and failure signals (evaluation scores + feedback), identify the most likely root cause.

Root cause options:
- instruction_ambiguity: The job's prompt or instructions are unclear or under-specified
- tool_failure: An external tool/API is unreliable or returning bad data
- model_behavior_change: The AI model's behavior has drifted or changed
- routing_issue: Tasks are being sent to the wrong job or agent
- data_quality: Input data is noisy, missing, or malformed
- unknown: Cannot determine from available signals

Return ONLY valid JSON (no markdown fences):
{
  "rootCauseType": "<one of the options above>",
  "confidence": "HIGH | MEDIUM | LOW",
  "summary": "<2-3 sentence summary of the evidence>",
  "recommendedFix": "<specific, actionable recommendation>"
}

Confidence guidelines:
- HIGH: Clear, unambiguous signal from multiple sources pointing to one root cause
- MEDIUM: Plausible inference but signals are mixed or incomplete
- LOW: Limited signals, mostly speculation`;

  const evalSummary = evalEntries.length > 0
    ? evalEntries.map((e) => `[${e.evaluatedAt?.split('T')[0]}] score=${e.score} grade=${e.grade} — ${e.rationale}`).join('\n')
    : 'No evaluation data available';

  const feedbackSummary = feedbackEntries.length > 0
    ? feedbackEntries.map((f) => `[${f.date}] rating=${f.rating} — ${f.comment}`).join('\n')
    : 'No feedback data available';

  const userPrompt = `Job: ${jobName}

## Source Code (truncated to 3000 chars)
${sourceCode.slice(0, 3000)}

## Recent Evaluation Scores (last 5)
${evalSummary}

## Recent Feedback (last 5)
${feedbackSummary}

Analyze and return JSON root cause assessment.`;

  try {
    const raw = await synthesize(systemPrompt, userPrompt, 600);
    const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    const parsed = JSON.parse(cleaned) as InspectResult;
    return parsed;
  } catch (err) {
    console.warn(`[inspect] OpenAI call failed for ${jobName}:`, (err as Error).message);
    return {
      rootCauseType: 'unknown',
      confidence: 'LOW',
      summary: 'Analysis unavailable — OpenAI call failed.',
      recommendedFix: 'Review job logs manually.',
    };
  }
}

function buildInspectReport(
  jobName: string,
  date: string,
  result: InspectResult,
  evalEntries: EvalEntry[],
  feedbackEntries: FeedbackEntry[],
): string {
  const evalRaw = evalEntries.length > 0
    ? evalEntries.map((e) => `- [${e.evaluatedAt?.split('T')[0]}] score=${e.score} (${e.grade}): ${e.rationale}`).join('\n')
    : '_No evaluation data_';

  const feedbackRaw = feedbackEntries.length > 0
    ? feedbackEntries.map((f) => `- [${f.date}] ${f.rating}: ${f.comment}`).join('\n')
    : '_No feedback data_';

  return `# Inspect Report — ${jobName} — ${date}

## Root Cause
**Type:** ${result.rootCauseType}
**Confidence:** ${result.confidence}

## Evidence
${result.summary}

## Recommended Fix
${result.recommendedFix}

## Raw Signals
### Evaluation Scores
${evalRaw}

### Feedback Ratings
${feedbackRaw}
`;
}

function buildProposedChangeMarkdown(
  jobName: string,
  result: InspectResult,
  date: string,
): string {
  return `# Proposed Change — ${date}
Source: Inspect job (root cause analysis)
Target: services/intelligence/src/jobs/${jobName}.ts
Type: fix

## Root Cause
**Type:** ${result.rootCauseType}
**Confidence:** ${result.confidence}

## Evidence
${result.summary}

## Recommended Fix
${result.recommendedFix}
`;
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export async function runInspect(): Promise<void> {
  const startTime = await markJobStart('inspect');

  try {
    console.log('[inspect] Starting root cause analysis job...');

    const date = todayStr();

    // 1. Load registry
    const regFile = await getFileContent(REPO, REGISTRY_PATH);
    if (!regFile) {
      console.warn('[inspect] No registry found — nothing to inspect.');
      await markJobSuccess('inspect', startTime);
      return;
    }

    let registry: Record<string, RegistryEntry>;
    try {
      registry = JSON.parse(regFile.content) as Record<string, RegistryEntry>;
    } catch {
      console.error('[inspect] Registry parse failed — skipping.');
      await markJobSuccess('inspect', startTime);
      return;
    }

    // 2. Find flagged jobs
    const flaggedJobs = Object.entries(registry)
      .filter(([, entry]) => entry.lastStatus && FLAGGED_STATUSES.has(entry.lastStatus))
      .map(([name]) => name);

    if (flaggedJobs.length === 0) {
      console.log('[inspect] No flagged jobs found — nothing to inspect.');
      await markJobSuccess('inspect', startTime);
      return;
    }

    console.log(`[inspect] Found ${flaggedJobs.length} flagged job(s): ${flaggedJobs.join(', ')}`);

    // 3. Load eval log + feedback log
    let evalEntries: EvalEntry[] = [];
    let feedbackEntries: FeedbackEntry[] = [];

    try {
      const evalFile = await getFileContent(REPO, EVAL_LOG_PATH);
      if (evalFile) evalEntries = JSON.parse(evalFile.content) as EvalEntry[];
    } catch {
      console.warn('[inspect] Could not load eval log');
    }

    try {
      const fbFile = await getFileContent(REPO, FEEDBACK_LOG_PATH);
      if (fbFile) feedbackEntries = JSON.parse(fbFile.content) as FeedbackEntry[];
    } catch {
      console.warn('[inspect] Could not load feedback log');
    }

    // 4. Inspect each flagged job
    for (const jobName of flaggedJobs) {
      console.log(`[inspect] Analyzing: ${jobName}`);

      // Read source file
      let sourceCode = '';
      try {
        const srcFile = await getFileContent(
          REPO,
          `services/intelligence/src/jobs/${jobName}.ts`,
        );
        if (srcFile) sourceCode = srcFile.content;
      } catch {
        console.warn(`[inspect] Could not read source for ${jobName}`);
      }

      // Filter eval + feedback for this job (last 5 of each)
      const jobEvals = getLastN(
        evalEntries.filter((e) => e.jobName === jobName),
        5,
      );
      const jobFeedback = getLastN(
        feedbackEntries.filter((f) => f.job === jobName),
        5,
      );

      // Analyze root cause
      const result = await analyzeRootCause(jobName, sourceCode, jobEvals, jobFeedback);

      // Write inspect report
      const reportPath = `intelligence/inspect-reports/${date}-${jobName}.md`;
      const reportContent = buildInspectReport(jobName, date, result, jobEvals, jobFeedback);

      try {
        await createFile(
          REPO,
          reportPath,
          reportContent,
          `inspect: root cause report for ${jobName} (${date})`,
        );
        console.log(`[inspect] ✓ Report written: ${reportPath}`);
        // Notify Corey
        await sendTelegram(
          `🔍 *Inspect report* for *${jobName}*: root cause = \`${result.rootCauseType}\` (${result.confidence})\nCheck \`intelligence/inspect-reports/\``,
        );
      } catch (err) {
        console.warn(`[inspect] Failed to write report for ${jobName}:`, (err as Error).message);
      }

      // If HIGH confidence — also write proposed change
      if (result.confidence === 'HIGH') {
        const changeSlug = jobName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
        const changePath = `intelligence/proposed-changes/${date}-inspect-${changeSlug}.md`;
        const changeContent = buildProposedChangeMarkdown(jobName, result, date);

        try {
          await createFile(
            REPO,
            changePath,
            changeContent,
            `inspect: propose fix for ${jobName} (HIGH confidence)`,
          );
          console.log(`[inspect] ✓ Proposed change written: ${changePath}`);
        } catch (err) {
          console.warn(`[inspect] Failed to write proposed change for ${jobName}:`, (err as Error).message);
        }
      }
    }

    console.log('[inspect] Done.');
    await markJobSuccess('inspect', startTime);
  } catch (err) {
    console.error('[inspect] Fatal error:', err);
    await markJobFailed('inspect', startTime);
    throw err;
  }
}
