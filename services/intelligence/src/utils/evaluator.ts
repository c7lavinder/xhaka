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
