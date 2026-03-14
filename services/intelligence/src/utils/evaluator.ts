// services/intelligence/src/utils/evaluator.ts
// Quality evaluation layer — scores job outputs via OpenAI rubric

import { synthesize } from '../lib/openai.js';
import { getFileContent, updateFile, createFile } from '../lib/github.js';
import { markJobStatus } from '../utils/job-registry.js';
import { sendTelegram } from '../utils/notifier.js';

const REPO = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';
const EVAL_LOG_PATH = 'data/evaluation-log.json';
const MAX_ENTRIES = 50;

export interface EvaluationResult {
  jobName: string;
  runId: string; // timestamp ISO string
  score: number; // 0-100
  grade: 'HIGH' | 'MEDIUM' | 'LOW';
  rationale: string;
  evaluatedAt: string;
}

// ---------------------------------------------------------------------------
// Quality thresholds — minimum acceptable score per job
// ---------------------------------------------------------------------------

const JOB_QUALITY_THRESHOLDS: Record<string, number> = {
  'researcher': 65,
  'organize': 60,
  'scribe': 70,
  'daily-log': 50,
  'tool-monitor': 55,
};

/**
 * Returns true if the score meets the minimum quality threshold for the job.
 * If the job is not in the map, defaults to true (no threshold enforced).
 */
export function meetsQualityThreshold(jobName: string, score: number): boolean {
  try {
    const threshold = JOB_QUALITY_THRESHOLDS[jobName];
    if (threshold === undefined) return true;
    return score >= threshold;
  } catch {
    return true;
  }
}

// ---------------------------------------------------------------------------
// Keep-or-Reset — compare new score against rolling baseline
// ---------------------------------------------------------------------------

/**
 * Compare a new job score against the rolling average of the last 3 scores.
 * - If < 3 historical scores: always 'keep' (not enough data)
 * - If new score >= baseline - 10: 'keep' (acceptable or improving)
 * - If new score < baseline - 10: 'reset' (meaningful regression)
 */
export async function compareWithBaseline(
  jobName: string,
  newScore: number,
): Promise<'keep' | 'reset'> {
  try {
    const file = await getFileContent(REPO, EVAL_LOG_PATH);
    if (!file || !file.content.trim()) return 'keep';

    let entries: EvaluationResult[] = [];
    try {
      entries = JSON.parse(file.content) as EvaluationResult[];
      if (!Array.isArray(entries)) return 'keep';
    } catch {
      return 'keep';
    }

    // Filter to this job's history, newest last
    const jobEntries = entries.filter((e) => e.jobName === jobName);
    const last3 = jobEntries.slice(-3);

    if (last3.length < 3) return 'keep'; // not enough data

    const baseline = last3.reduce((sum, e) => sum + e.score, 0) / last3.length;

    return newScore >= baseline - 10 ? 'keep' : 'reset';
  } catch (err) {
    console.warn('[evaluator] compareWithBaseline failed — defaulting to keep:', (err as Error).message);
    return 'keep';
  }
}

/**
 * Record a job score to evaluation-log.json.
 * Separated clearly from evaluateJobOutput for explicit baseline tracking.
 */
export async function recordJobBaseline(jobName: string, score: number): Promise<void> {
  try {
    const runId = new Date().toISOString();
    const result: EvaluationResult = {
      jobName,
      runId,
      score,
      grade: score >= 75 ? 'HIGH' : score >= 50 ? 'MEDIUM' : 'LOW',
      rationale: 'baseline record',
      evaluatedAt: runId,
    };
    await appendEvalLog(result);
  } catch (err) {
    console.warn('[evaluator] recordJobBaseline failed:', (err as Error).message);
  }
}

// ---------------------------------------------------------------------------
// Rubrics
// ---------------------------------------------------------------------------

function getRubric(jobName: string): string {
  switch (jobName) {
    case 'researcher':
      return 'Did this output extract specific, actionable insights? Does it identify concrete implications, not just summaries? Score 0-100.';
    case 'organize':
      return 'Did this output correctly categorize memory entries? Are categories specific and useful? Score 0-100.';
    case 'scribe':
      return 'Did this output promote genuinely important items to MEMORY.md? Are entries concise and high-signal? Score 0-100.';
    case 'daily-log':
      return 'Does this log capture meaningful activity? Is it specific rather than generic? Score 0-100.';
    default:
      return 'Is this output complete, accurate, and useful? Score 0-100.';
  }
}

/**
 * Evaluate a job's output using OpenAI rubric.
 * Never throws — returns score=50/MEDIUM on failure.
 */
export async function evaluateJobOutput(
  jobName: string,
  output: string,
): Promise<EvaluationResult> {
  const runId = new Date().toISOString();

  try {
    const rubric = getRubric(jobName);
    const systemPrompt =
      `You are a quality evaluator for AI job outputs. ${rubric}\n` +
      `Return ONLY valid JSON (no markdown fences):\n` +
      `{"score": <0-100>, "rationale": "<1-2 sentence explanation>"}`;

    const userPrompt = `Job: ${jobName}\n\nOutput:\n${output.slice(0, 8000)}`;

    const raw = await synthesize(systemPrompt, userPrompt, 300);
    const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    const parsed = JSON.parse(cleaned) as { score: number; rationale: string };

    const score = Math.max(0, Math.min(100, Math.round(Number(parsed.score))));
    const grade: 'HIGH' | 'MEDIUM' | 'LOW' =
      score >= 75 ? 'HIGH' : score >= 50 ? 'MEDIUM' : 'LOW';

    const result: EvaluationResult = {
      jobName,
      runId,
      score,
      grade,
      rationale: String(parsed.rationale ?? ''),
      evaluatedAt: new Date().toISOString(),
    };

    await appendEvalLog(result);

    if (score < 50) {
      try {
        await markJobStatus(jobName, 'LOW_QUALITY');
      } catch (err) {
        console.warn('[evaluator] markJobStatus LOW_QUALITY failed:', (err as Error).message);
      }
      // Notify Corey of low-quality job output
      await sendTelegram(
        `⚠️ *${jobName}* scored LOW quality (${score}/100):\n_${result.rationale}_`,
      );
    }

    return result;
  } catch (err) {
    console.warn('[evaluator] Evaluation failed — returning default:', (err as Error).message);
    const result: EvaluationResult = {
      jobName,
      runId,
      score: 50,
      grade: 'MEDIUM',
      rationale: 'evaluation unavailable',
      evaluatedAt: new Date().toISOString(),
    };
    try {
      await appendEvalLog(result);
    } catch {
      // ignore
    }
    return result;
  }
}

async function appendEvalLog(result: EvaluationResult): Promise<void> {
  try {
    const file = await getFileContent(REPO, EVAL_LOG_PATH);
    let entries: EvaluationResult[] = [];

    if (file) {
      try {
        entries = JSON.parse(file.content) as EvaluationResult[];
        if (!Array.isArray(entries)) entries = [];
      } catch {
        entries = [];
      }
    }

    entries.push(result);
    if (entries.length > MAX_ENTRIES) {
      entries = entries.slice(-MAX_ENTRIES);
    }

    const content = JSON.stringify(entries, null, 2);

    if (file?.sha) {
      await updateFile(
        REPO,
        EVAL_LOG_PATH,
        content,
        `chore: evaluation-log [${result.jobName}=${result.score}]`,
        file.sha,
      );
    } else {
      await createFile(
        REPO,
        EVAL_LOG_PATH,
        content,
        `chore: evaluation-log init`,
      );
    }
  } catch (err) {
    console.warn('[evaluator] Failed to append eval log:', (err as Error).message);
  }
}
