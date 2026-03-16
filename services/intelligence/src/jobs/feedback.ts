// services/intelligence/src/jobs/feedback.ts
// Human feedback capture — reads feedback-inbox.md, logs entries, flags bad jobs

import { getFileContent, updateFile, createFile } from '../lib/github.js';
import { synthesize } from '../lib/openai.js';
import { markJobStart, markJobSuccess, markJobFailed, markJobStatus } from '../utils/job-registry.js';
import { sendTelegram } from '../utils/notifier.js';

const REPO = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';
const FEEDBACK_INBOX_PATH = 'intelligence/feedback-inbox.md';
const FEEDBACK_LOG_PATH = 'data/feedback-log.json';
const REGISTRY_PATH = 'data/job-registry.json';
const EVAL_LOG_PATH = 'data/evaluation-log.json';

interface FeedbackEntry {
  job: string;
  date: string;
  rating: 'good' | 'ok' | 'bad';
  comment: string;
  processedAt: string;
  linkedRunId?: string | null;
}

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

interface InspectResult {
  rootCauseType: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  summary: string;
  recommendedFix: string;
}

function parseFeedbackInbox(content: string): FeedbackEntry[] {
  const entries: FeedbackEntry[] = [];
  const blocks = content.split(/^---\s*$/m);
  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;
    const jobMatch = trimmed.match(/^job:\s*(.+)$/m);
    const dateMatch = trimmed.match(/^date:\s*(.+)$/m);
    const ratingMatch = trimmed.match(/^rating:\s*(.+)$/m);
    const commentMatch = trimmed.match(/^comment:\s*(.+)$/m);
    if (!jobMatch || !ratingMatch) continue;
    const rating = ratingMatch[1].trim().toLowerCase();
    if (!['good', 'ok', 'bad'].includes(rating)) continue;
    entries.push({
      job: jobMatch[1].trim(),
      date: dateMatch ? dateMatch[1].trim() : new Date().toISOString().split('T')[0],
      rating: rating as 'good' | 'ok' | 'bad',
      comment: commentMatch ? commentMatch[1].trim() : '',
      processedAt: new Date().toISOString(),
      linkedRunId: null,
    });
  }
  return entries;
}

function linkToJobRun(entry: FeedbackEntry, registry: Record<string, RegistryEntry>): string | null {
  const jobEntry = registry[entry.job];
  if (!jobEntry?.lastRun) return null;
  const entryDate = new Date(entry.date).getTime();
  const lastRun = new Date(jobEntry.lastRun as string).getTime();
  const twoDays = 2 * 24 * 60 * 60 * 1000;
  if (Math.abs(entryDate - lastRun) <= twoDays) return jobEntry.lastRun as string;
  return null;
}

function needsReview(jobName: string, allEntries: FeedbackEntry[]): boolean {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentBad = allEntries.filter(
    (e) => e.job === jobName && e.rating === 'bad' && new Date(e.date).getTime() >= sevenDaysAgo,
  );
  return recentBad.length >= 2;
}

async function analyzeRootCauseForJob(
  jobName: string, sourceCode: string,
  evalEntries: EvalEntry[], feedbackEntries: FeedbackEntry[],
): Promise<InspectResult> {
  const systemPrompt = `You are a root cause analyst for an AI operations pipeline.
Given job source code and failure signals, identify the most likely root cause.
Root cause options: instruction_ambiguity, tool_failure, model_behavior_change, routing_issue, data_quality, unknown.
Return ONLY valid JSON (no markdown fences):
{ "rootCauseType": "...", "confidence": "HIGH|MEDIUM|LOW", "summary": "...", "recommendedFix": "..." }`;

  const evalSummary = evalEntries.length > 0
    ? evalEntries.map((e) => `[${e.evaluatedAt?.split('T')[0]}] score=${e.score} grade=${e.grade} — ${e.rationale}`).join('\n')
    : 'No evaluation data available';
  const feedbackSummary = feedbackEntries.length > 0
    ? feedbackEntries.map((f) => `[${f.date}] rating=${f.rating} — ${f.comment}`).join('\n')
    : 'No feedback data available';

  try {
    const raw = await synthesize(systemPrompt,
      `Job: ${jobName}\n## Source (truncated)\n${sourceCode.slice(0, 3000)}\n## Evals\n${evalSummary}\n## Feedback\n${feedbackSummary}`,
      600,
    );
    const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    return JSON.parse(cleaned) as InspectResult;
  } catch {
    return { rootCauseType: 'unknown', confidence: 'LOW', summary: 'Analysis unavailable.', recommendedFix: 'Review job logs manually.' };
  }
}

async function triggerImmediateInspect(jobName: string): Promise<void> {
  try {
    console.log(`[feedback] Triggering immediate inspect for: ${jobName}`);
    const date = new Date().toISOString().split('T')[0];

    await sendTelegram(`🔍 Auto\-inspect triggered for *${jobName}* — bad feedback detected`);

    let evalEntries: EvalEntry[] = [];
    try {
      const evalFile = await getFileContent(REPO, EVAL_LOG_PATH);
      if (evalFile) { const p = JSON.parse(evalFile.content) as unknown; if (Array.isArray(p)) evalEntries = p as EvalEntry[]; }
    } catch { console.warn(`[feedback/inspect] Could not load eval log`); }

    let feedbackEntries: FeedbackEntry[] = [];
    try {
      const fbFile = await getFileContent(REPO, FEEDBACK_LOG_PATH);
      if (fbFile) { const p = JSON.parse(fbFile.content) as unknown; if (Array.isArray(p)) feedbackEntries = p as FeedbackEntry[]; }
    } catch { console.warn(`[feedback/inspect] Could not load feedback log`); }

    let sourceCode = '';
    try {
      const srcFile = await getFileContent(REPO, `services/intelligence/src/jobs/${jobName}.ts`);
      if (srcFile) sourceCode = srcFile.content;
    } catch { console.warn(`[feedback/inspect] Could not read source for ${jobName}`); }

    const jobEvals = evalEntries.filter((e) => e.jobName === jobName).slice(-5);
    const jobFeedback = feedbackEntries.filter((f) => f.job === jobName).slice(-5);
    const result = await analyzeRootCauseForJob(jobName, sourceCode, jobEvals, jobFeedback);

    const evalRaw = jobEvals.length > 0
      ? jobEvals.map((e) => `- [${e.evaluatedAt?.split('T')[0]}] score=${e.score} (${e.grade}): ${e.rationale}`).join('\n')
      : '_No evaluation data_';
    const feedbackRaw = jobFeedback.length > 0
      ? jobFeedback.map((f) => `- [${f.date}] ${f.rating}: ${f.comment}`).join('\n')
      : '_No feedback data_';

    const reportContent = `# Immediate Inspect Report — ${jobName} — ${date}
> Auto-triggered by bad feedback detection (NEEDS_REVIEW flag)

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

    const reportPath = `intelligence/inspect-reports/immediate-${date}-${jobName}.md`;
    await createFile(REPO, reportPath, reportContent, `feedback: immediate inspect report for ${jobName} (${date})`);
    console.log(`[feedback/inspect] ✓ Immediate inspect report written: ${reportPath}`);

    if (result.confidence === 'HIGH') {
      const changeSlug = jobName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
      const changePath = `intelligence/proposed-changes/${date}-immediate-inspect-${changeSlug}.md`;
      const changeContent = `# Proposed Change — ${date}
Source: Immediate Inspect (triggered by bad feedback)
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
      try {
        await createFile(REPO, changePath, changeContent, `feedback: propose fix for ${jobName} after immediate inspect`);
        console.log(`[feedback/inspect] ✓ Proposed change written: ${changePath}`);
      } catch (err) {
        console.warn(`[feedback/inspect] Failed to write proposed change:`, (err as Error).message);
      }
    }

    await sendTelegram(
      `🔍 *Inspect complete* for *${jobName}*: root cause = \`${result.rootCauseType}\` (${result.confidence})\nFix: ${result.recommendedFix.slice(0, 120)}`,
    );
  } catch (err) {
    console.warn(`[feedback/inspect] triggerImmediateInspect failed for ${jobName}:`, (err as Error).message);
  }
}

export async function runFeedback(): Promise<void> {
  const startTime = await markJobStart('feedback');
  try {
    console.log('[feedback] Starting feedback capture job...');

    const inboxFile = await getFileContent(REPO, FEEDBACK_INBOX_PATH);
    if (!inboxFile) {
      console.log('[feedback] No feedback inbox found — skipping.');
      await markJobSuccess('feedback', startTime);
      return;
    }

    const newEntries = parseFeedbackInbox(inboxFile.content);
    if (newEntries.length === 0) {
      console.log('[feedback] No new feedback entries found.');
      await markJobSuccess('feedback', startTime);
      return;
    }

    console.log(`[feedback] Found ${newEntries.length} feedback entry(s).`);

    let registry: Record<string, RegistryEntry> = {};
    try {
      const regFile = await getFileContent(REPO, REGISTRY_PATH);
      if (regFile) registry = JSON.parse(regFile.content) as Record<string, RegistryEntry>;
    } catch { console.warn('[feedback] Could not load registry for run linking'); }

    for (const entry of newEntries) { entry.linkedRunId = linkToJobRun(entry, registry); }

    const logFile = await getFileContent(REPO, FEEDBACK_LOG_PATH);
    let existingEntries: FeedbackEntry[] = [];
    if (logFile) {
      try {
        existingEntries = JSON.parse(logFile.content) as FeedbackEntry[];
        if (!Array.isArray(existingEntries)) existingEntries = [];
      } catch { existingEntries = []; }
    }

    const allEntries = [...existingEntries, ...newEntries];
    const logContent = JSON.stringify(allEntries, null, 2);

    if (logFile?.sha) {
      await updateFile(REPO, FEEDBACK_LOG_PATH, logContent, `feedback: log ${newEntries.length} entry(s)`, logFile.sha);
    } else {
      await createFile(REPO, FEEDBACK_LOG_PATH, logContent, `feedback: init feedback log`);
    }

    const uniqueJobs = [...new Set(newEntries.map((e) => e.job))];
    for (const jobName of uniqueJobs) {
      if (needsReview(jobName, allEntries)) {
        console.warn(`[feedback] ${jobName} has 2+ bad ratings in last 7 days — marking NEEDS_REVIEW`);
        try { await markJobStatus(jobName, 'NEEDS_REVIEW'); }
        catch (err) { console.warn(`[feedback] markJobStatus NEEDS_REVIEW failed for ${jobName}:`, (err as Error).message); }
        await sendTelegram(`🚨 *${jobName}* flagged NEEDS\_REVIEW — 2+ bad ratings in 7 days`);
        // Automatically trigger inspect — no human needed to initiate
        await triggerImmediateInspect(jobName);
      }
    }

    const clearedInbox = `# Feedback Inbox
Drop feedback on job runs here. Processed daily at 8 AM.

Format:
---
job: [jobName]
date: [YYYY-MM-DD]
rating: [good/ok/bad]
comment: [what was wrong or right]
---
`;
    await updateFile(REPO, FEEDBACK_INBOX_PATH, clearedInbox, `feedback: cleared ${newEntries.length} processed entry(s)`, inboxFile.sha);

    console.log(`[feedback] Done. Processed ${newEntries.length} entry(s).`);
    await markJobSuccess('feedback', startTime);
  } catch (err) {
    console.error('[feedback] Fatal error:', err);
    await markJobFailed('feedback', startTime);
    throw err;
  }
}
