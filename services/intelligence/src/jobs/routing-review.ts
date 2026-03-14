// services/intelligence/src/jobs/routing-review.ts
// Routing intelligence — correlates routing decisions with outcomes, proposes improvements

import { getFileContent, createFile } from '../lib/github.js';
import { synthesize } from '../lib/openai.js';
import { markJobStart, markJobSuccess, markJobFailed } from '../utils/job-registry.js';

const REPO = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';
const ROUTING_LOG_PATH = 'runs/routing-log.md';
const EVAL_LOG_PATH = 'data/evaluation-log.json';
const FEEDBACK_LOG_PATH = 'data/feedback-log.json';

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

interface RoutingEntry {
  date: string;
  taskType: string;
  agent: string;
  outcome: string;
  raw: string;
}

interface RoutingAnalysis {
  patterns: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  suggestedChange: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function sevenDaysAgo(): number {
  return Date.now() - 7 * 24 * 60 * 60 * 1000;
}

/**
 * Parse routing log lines in format: [date] [task-type] → [agent] | [outcome]
 * Also handles ASCII arrow "->" as fallback.
 */
function parseRoutingLog(content: string): RoutingEntry[] {
  const entries: RoutingEntry[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Match: [date] [task-type] → [agent] | [outcome]
    const match = trimmed.match(
      /^\[?(\d{4}-\d{2}-\d{2}[^\]]*)\]?\s+\[?([^\]→>|]+?)\]?\s*[→>]\s*\[?([^\]|]+?)\]?\s*\|\s*(.+)$/,
    );

    if (match) {
      entries.push({
        date: match[1].trim(),
        taskType: match[2].trim(),
        agent: match[3].trim(),
        outcome: match[4].trim(),
        raw: trimmed,
      });
    }
  }

  return entries;
}

/**
 * Filter entries from last 7 days.
 */
function filterRecentEntries<T extends { date?: string; evaluatedAt?: string }>(
  entries: T[],
): T[] {
  const cutoff = sevenDaysAgo();
  return entries.filter((e) => {
    const dateStr = e.date ?? e.evaluatedAt ?? '';
    if (!dateStr) return false;
    const ts = new Date(dateStr).getTime();
    return !isNaN(ts) && ts >= cutoff;
  });
}

async function analyzeRoutingPatterns(
  routingEntries: RoutingEntry[],
  evalEntries: EvalEntry[],
  feedbackEntries: FeedbackEntry[],
): Promise<RoutingAnalysis> {
  const systemPrompt = `You are a routing analyst for an AI operations pipeline.
Analyze routing decisions from the past 7 days and correlate them with quality scores and feedback.
Identify patterns like: agents being over/under-used, task types being mis-routed, or routing rules that should change.

Return ONLY valid JSON (no markdown fences):
{
  "patterns": "<specific patterns observed, 2-4 sentences>",
  "confidence": "HIGH | MEDIUM | LOW",
  "suggestedChange": "<specific routing rule change recommendation, or 'no changes needed'>"
}

Confidence:
- HIGH: Clear pattern with 3+ data points supporting a specific routing change
- MEDIUM: Some signal but limited data
- LOW: Insufficient data to draw conclusions`;

  const routingSummary = routingEntries.length > 0
    ? routingEntries.map((r) => r.raw).join('\n')
    : 'No routing log entries in last 7 days';

  const evalSummary = evalEntries.length > 0
    ? evalEntries.map((e) => `[${e.evaluatedAt?.split('T')[0]}] ${e.jobName}: score=${e.score} (${e.grade})`).join('\n')
    : 'No evaluation data';

  const feedbackSummary = feedbackEntries.length > 0
    ? feedbackEntries.map((f) => `[${f.date}] ${f.job}: ${f.rating} — ${f.comment}`).join('\n')
    : 'No feedback data';

  const userPrompt = `## Routing Decisions (last 7 days)
${routingSummary}

## Job Quality Scores (last 7 days)
${evalSummary}

## Human Feedback (last 7 days)
${feedbackSummary}

Analyze and return JSON routing assessment.`;

  try {
    const raw = await synthesize(systemPrompt, userPrompt, 600);
    const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    return JSON.parse(cleaned) as RoutingAnalysis;
  } catch (err) {
    console.warn('[routing-review] OpenAI call failed:', (err as Error).message);
    return {
      patterns: 'Analysis unavailable — OpenAI call failed.',
      confidence: 'LOW',
      suggestedChange: 'Review routing log manually.',
    };
  }
}

function buildReviewReport(
  date: string,
  analysis: RoutingAnalysis,
  routingEntries: RoutingEntry[],
  evalEntries: EvalEntry[],
  feedbackEntries: FeedbackEntry[],
): string {
  const routingRaw = routingEntries.length > 0
    ? routingEntries.map((r) => `- ${r.raw}`).join('\n')
    : '_No routing entries_';

  const evalRaw = evalEntries.length > 0
    ? evalEntries.map((e) => `- [${e.evaluatedAt?.split('T')[0]}] ${e.jobName}: score=${e.score} (${e.grade})`).join('\n')
    : '_No evaluation data_';

  const feedbackRaw = feedbackEntries.length > 0
    ? feedbackEntries.map((f) => `- [${f.date}] ${f.job}: ${f.rating} — ${f.comment}`).join('\n')
    : '_No feedback data_';

  return `# Routing Review — ${date}

## Patterns Observed
${analysis.patterns}

## Confidence
**${analysis.confidence}**

## Suggested Change
${analysis.suggestedChange}

## Raw Data: Routing Decisions (last 7 days)
${routingRaw}

## Raw Data: Evaluation Scores (last 7 days)
${evalRaw}

## Raw Data: Feedback (last 7 days)
${feedbackRaw}
`;
}

function buildProposedChangeMarkdown(
  analysis: RoutingAnalysis,
  date: string,
): string {
  return `# Proposed Routing Change — ${date}
Source: Routing Review job
Target: ROUTING.md (or relevant routing config)
Type: routing-rule-update
Confidence: ${analysis.confidence}

## Patterns Observed
${analysis.patterns}

## Proposed Change
${analysis.suggestedChange}
`;
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export async function runRoutingReview(): Promise<void> {
  const startTime = await markJobStart('routing-review');

  try {
    console.log('[routing-review] Starting routing intelligence review...');

    const date = todayStr();

    // 1. Read routing log
    let routingContent = '';
    try {
      const routingFile = await getFileContent(REPO, ROUTING_LOG_PATH);
      if (routingFile) routingContent = routingFile.content;
    } catch {
      console.warn('[routing-review] Could not read routing log');
    }

    // 2. Read eval + feedback logs
    let allEvalEntries: EvalEntry[] = [];
    let allFeedbackEntries: FeedbackEntry[] = [];

    try {
      const evalFile = await getFileContent(REPO, EVAL_LOG_PATH);
      if (evalFile) allEvalEntries = JSON.parse(evalFile.content) as EvalEntry[];
    } catch {
      console.warn('[routing-review] Could not load eval log');
    }

    try {
      const fbFile = await getFileContent(REPO, FEEDBACK_LOG_PATH);
      if (fbFile) allFeedbackEntries = JSON.parse(fbFile.content) as FeedbackEntry[];
    } catch {
      console.warn('[routing-review] Could not load feedback log');
    }

    // 3. Parse + filter to last 7 days
    const allRoutingEntries = parseRoutingLog(routingContent);
    const recentRouting = filterRecentEntries(allRoutingEntries);
    const recentEval = filterRecentEntries(allEvalEntries);
    const recentFeedback = filterRecentEntries(allFeedbackEntries);

    console.log(
      `[routing-review] Data: ${recentRouting.length} routing, ${recentEval.length} evals, ${recentFeedback.length} feedback`,
    );

    // 4. Analyze patterns
    const analysis = await analyzeRoutingPatterns(recentRouting, recentEval, recentFeedback);

    // 5. Write review report
    const reportPath = `intelligence/routing-reviews/${date}.md`;
    const reportContent = buildReviewReport(
      date,
      analysis,
      recentRouting,
      recentEval,
      recentFeedback,
    );

    try {
      await createFile(
        REPO,
        reportPath,
        reportContent,
        `routing-review: weekly report (${date})`,
      );
      console.log(`[routing-review] ✓ Report written: ${reportPath}`);
    } catch (err) {
      console.warn('[routing-review] Failed to write report:', (err as Error).message);
    }

    // 6. If HIGH confidence — write proposed change
    if (analysis.confidence === 'HIGH') {
      const changePath = `intelligence/proposed-changes/${date}-routing-review.md`;
      const changeContent = buildProposedChangeMarkdown(analysis, date);

      try {
        await createFile(
          REPO,
          changePath,
          changeContent,
          `routing-review: propose routing change (HIGH confidence)`,
        );
        console.log(`[routing-review] ✓ Proposed change written: ${changePath}`);
      } catch (err) {
        console.warn('[routing-review] Failed to write proposed change:', (err as Error).message);
      }
    }

    console.log('[routing-review] Done.');
    await markJobSuccess('routing-review', startTime);
  } catch (err) {
    console.error('[routing-review] Fatal error:', err);
    await markJobFailed('routing-review', startTime);
    throw err;
  }
}
