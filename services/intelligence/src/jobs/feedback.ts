// services/intelligence/src/jobs/feedback.ts
// Human feedback capture — reads feedback-inbox.md, logs entries, flags bad jobs

import { getFileContent, updateFile, createFile } from '../lib/github.js';
import { markJobStart, markJobSuccess, markJobFailed, markJobStatus } from '../utils/job-registry.js';
import { sendTelegram } from '../utils/notifier.js';

const REPO = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';
const FEEDBACK_INBOX_PATH = 'intelligence/feedback-inbox.md';
const FEEDBACK_LOG_PATH = 'data/feedback-log.json';
const REGISTRY_PATH = 'data/job-registry.json';

interface FeedbackEntry {
  job: string;
  date: string; // YYYY-MM-DD
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

// ---------------------------------------------------------------------------
// Parser
// ---------------------------------------------------------------------------

function parseFeedbackInbox(content: string): FeedbackEntry[] {
  const entries: FeedbackEntry[] = [];
  // Split on --- delimiters
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

// ---------------------------------------------------------------------------
// Link feedback entry to nearest job run in registry
// ---------------------------------------------------------------------------

function linkToJobRun(
  entry: FeedbackEntry,
  registry: Record<string, RegistryEntry>,
): string | null {
  const jobEntry = registry[entry.job];
  if (!jobEntry?.lastRun) return null;

  const entryDate = new Date(entry.date).getTime();
  const lastRun = new Date(jobEntry.lastRun).getTime();

  // Only link if lastRun is within 2 days of feedback date
  const twoDays = 2 * 24 * 60 * 60 * 1000;
  if (Math.abs(entryDate - lastRun) <= twoDays) {
    return jobEntry.lastRun;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Check if job needs review (2+ bad ratings in last 7 days)
// ---------------------------------------------------------------------------

function needsReview(jobName: string, allEntries: FeedbackEntry[]): boolean {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentBad = allEntries.filter(
    (e) =>
      e.job === jobName &&
      e.rating === 'bad' &&
      new Date(e.date).getTime() >= sevenDaysAgo,
  );
  return recentBad.length >= 2;
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export async function runFeedback(): Promise<void> {
  const startTime = await markJobStart('feedback');

  try {
    console.log('[feedback] Starting feedback capture job...');

    // 1. Read inbox
    const inboxFile = await getFileContent(REPO, FEEDBACK_INBOX_PATH);
    if (!inboxFile) {
      console.log('[feedback] No feedback inbox found — skipping.');
      await markJobSuccess('feedback', startTime);
      return;
    }

    // 2. Parse entries
    const newEntries = parseFeedbackInbox(inboxFile.content);
    if (newEntries.length === 0) {
      console.log('[feedback] No new feedback entries found.');
      await markJobSuccess('feedback', startTime);
      return;
    }

    console.log(`[feedback] Found ${newEntries.length} feedback entry(s).`);

    // 3. Load registry for run linking
    let registry: Record<string, RegistryEntry> = {};
    try {
      const regFile = await getFileContent(REPO, REGISTRY_PATH);
      if (regFile) registry = JSON.parse(regFile.content) as Record<string, RegistryEntry>;
    } catch {
      console.warn('[feedback] Could not load registry for run linking');
    }

    // 4. Link entries to runs
    for (const entry of newEntries) {
      entry.linkedRunId = linkToJobRun(entry, registry);
    }

    // 5. Load + append feedback log
    const logFile = await getFileContent(REPO, FEEDBACK_LOG_PATH);
    let existingEntries: FeedbackEntry[] = [];
    if (logFile) {
      try {
        existingEntries = JSON.parse(logFile.content) as FeedbackEntry[];
        if (!Array.isArray(existingEntries)) existingEntries = [];
      } catch {
        existingEntries = [];
      }
    }

    const allEntries = [...existingEntries, ...newEntries];
    const logContent = JSON.stringify(allEntries, null, 2);

    if (logFile?.sha) {
      await updateFile(
        REPO,
        FEEDBACK_LOG_PATH,
        logContent,
        `feedback: log ${newEntries.length} entry(s)`,
        logFile.sha,
      );
    } else {
      await createFile(
        REPO,
        FEEDBACK_LOG_PATH,
        logContent,
        `feedback: init feedback log`,
      );
    }

    // 6. Flag jobs with 2+ bad ratings in last 7 days
    const uniqueJobs = [...new Set(newEntries.map((e) => e.job))];
    for (const jobName of uniqueJobs) {
      if (needsReview(jobName, allEntries)) {
        console.warn(`[feedback] ${jobName} has 2+ bad ratings in last 7 days — marking NEEDS_REVIEW`);
        try {
          await markJobStatus(jobName, 'NEEDS_REVIEW');
        } catch (err) {
          console.warn(`[feedback] markJobStatus NEEDS_REVIEW failed for ${jobName}:`, (err as Error).message);
        }
        // Notify Corey
        await sendTelegram(
          `🚨 *${jobName}* flagged NEEDS\_REVIEW — 2+ bad ratings in 7 days`,
        );
      }
    }

    // 7. Clear inbox — leave header only
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

    await updateFile(
      REPO,
      FEEDBACK_INBOX_PATH,
      clearedInbox,
      `feedback: cleared ${newEntries.length} processed entry(s)`,
      inboxFile.sha,
    );

    console.log(`[feedback] Done. Processed ${newEntries.length} entry(s).`);
    await markJobSuccess('feedback', startTime);
  } catch (err) {
    console.error('[feedback] Fatal error:', err);
    await markJobFailed('feedback', startTime);
    throw err;
  }
}
