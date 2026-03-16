// services/intelligence/src/jobs/morning-brief.ts
// Runs daily at 6:00 AM CST — compiles and sends a morning summary to Corey.
// Covers: job health, evaluation scores, proposed changes, inspection reports,
// article digest, and feedback inbox.
// Never throws — if any section fails to load, it's skipped gracefully.

import { getFileContent, listDirectory, getRecentCommits, getFileLastCommitDate } from '../lib/github.js';
import { markJobStart, markJobSuccess, markJobFailed } from '../utils/job-registry.js';
import { sendTelegram } from '../utils/notifier.js';
import { getTodayCostEstimate } from '../utils/smart-scheduler.js';

const REPO = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';

interface JobEntry {
  lastRun: string | null;
  lastStatus: string | null;
  durationMs: number | null;
  expectedIntervalHours: number;
  gracePeriodMinutes: number;
}

interface EvaluationResult {
  jobName: string;
  runId: string;
  score: number;
  grade: string;
  rationale: string;
  evaluatedAt: string;
}

function getDateLabel(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/Chicago',
  });
}

// ---------------------------------------------------------------------------
// Section builders — each returns a string or null if nothing to surface
// ---------------------------------------------------------------------------

async function buildJobHealth(): Promise<string | null> {
  try {
    const file = await getFileContent(REPO, 'data/job-registry.json');
    if (!file) return null;

    const registry: Record<string, JobEntry> = JSON.parse(file.content);
    const badStatuses = ['failed', 'LOW_QUALITY', 'NEEDS_REVIEW'];
    const flagged = Object.entries(registry)
      .filter(([, entry]) => entry.lastStatus && badStatuses.includes(entry.lastStatus))
      .map(([name, entry]) => `  • ${name}: ${entry.lastStatus}`);

    if (flagged.length === 0) {
      return 'JOB HEALTH\n✅ All jobs healthy';
    }
    return `JOB HEALTH\n⚠️ Issues detected:\n${flagged.join('\n')}`;
  } catch {
    return null;
  }
}

async function buildEvaluationScores(): Promise<string | null> {
  try {
    const file = await getFileContent(REPO, 'data/evaluation-log.json');
    if (!file) return null;

    const log: EvaluationResult[] = JSON.parse(file.content);
    if (!Array.isArray(log) || log.length === 0) return null;

    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    const recent = log.filter((e) => new Date(e.evaluatedAt).getTime() > cutoff);
    if (recent.length === 0) return null;

    // Latest score per job in the past 24h
    const byJob: Record<string, EvaluationResult> = {};
    for (const entry of recent) {
      if (!byJob[entry.jobName] || entry.evaluatedAt > byJob[entry.jobName].evaluatedAt) {
        byJob[entry.jobName] = entry;
      }
    }

    const lines = Object.values(byJob).map((e) => {
      const flag = e.score < 65 ? ' ⚠️' : '';
      return `  • ${e.jobName}: ${e.score}/100 (${e.grade})${flag}`;
    });

    return `OVERNIGHT SCORES\n${lines.join('\n')}`;
  } catch {
    return null;
  }
}

async function buildActionNeeded(): Promise<string | null> {
  const parts: string[] = [];

  // Proposed changes — files directly under proposed-changes/ (not in approved/ or rejected/)
  try {
    const entries = await listDirectory(REPO, 'intelligence/proposed-changes');
    const pending = entries.filter((f) => f.type === 'file');
    if (pending.length > 0) {
      parts.push(`🔬 ${pending.length} proposed change${pending.length === 1 ? '' : 's'} waiting for review`);
    }
  } catch {
    // skip section
  }

  // Inspection reports written in past 24h — use recent commits as proxy
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const commits = await getRecentCommits(REPO, since, 'intelligence/inspect-reports');
    if (commits.length > 0) {
      parts.push(`🔍 ${commits.length} inspection report${commits.length === 1 ? '' : 's'} written overnight`);
    }
  } catch {
    // skip section
  }

  if (parts.length === 0) return null;
  return `ACTION NEEDED\n${parts.join('\n')}`;
}

async function buildArticleDigest(): Promise<string | null> {
  try {
    const lastCommitDate = await getFileLastCommitDate(REPO, 'intelligence/article-digest.md');
    if (!lastCommitDate) return null;

    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    if (lastCommitDate.getTime() < cutoff) return null;

    const file = await getFileContent(REPO, 'intelligence/article-digest.md');
    if (!file || !file.content.trim()) return null;

    const tail = file.content.slice(-200).trim();
    if (!tail) return null;

    // Use last non-empty line as one-line summary
    const lines = tail.split('\n').map((l) => l.trim()).filter(Boolean);
    const summary = lines[lines.length - 1] ?? tail;
    return `📰 Article Digest updated: ${summary.slice(0, 120)}`;
  } catch {
    return null;
  }
}

async function buildFeedbackInbox(): Promise<string | null> {
  try {
    const file = await getFileContent(REPO, 'intelligence/feedback-inbox.md');
    if (!file || !file.content.trim()) return null;

    // Count content blocks between --- delimiters (skip header block)
    const sections = file.content.split(/^---$/m);
    const entries = sections.slice(1).filter((s) => s.trim().length > 0);
    if (entries.length === 0) return null;

    return `💬 ${entries.length} feedback entr${entries.length === 1 ? 'y' : 'ies'} waiting to be processed`;
  } catch {
    return null;
  }
}

async function buildTodaysFocus(): Promise<string | null> {
  try {
    // Pull queue to find highest-priority pending tasks
    const queueFile = await getFileContent(REPO, 'data/task-queue.json');
    const queue = queueFile ? JSON.parse(queueFile.content) : { tasks: [] };
    const pending = (queue.tasks || []).filter((t: { status: string }) => t.status === 'pending');

    const lines: string[] = ["🎯 *Today's Focus*"];

    if (pending.length > 0) {
      const top3 = pending.slice(0, 3);
      top3.forEach((t: { agent: string; task: string }) => {
        lines.push(`• ${t.agent}/${t.task}`);
      });
    } else {
      lines.push('• Queue clear — system running autonomously');
    }

    return lines.join('\n');
  } catch {
    return null;
  }
}

async function buildSystemLoad(): Promise<string | null> {
  try {
    const queueFile = await getFileContent(REPO, 'data/task-queue.json');
    const queue = queueFile ? JSON.parse(queueFile.content) : { tasks: [] };
    const pending = (queue.tasks || []).filter((t: { status: string }) => t.status === 'pending').length;
    const running = (queue.tasks || []).filter((t: { status: string }) => t.status === 'running').length;

    const loadEmoji = pending > 20 ? '🔴' : pending > 10 ? '🟡' : '🟢';
    return `${loadEmoji} *System Load:* ${pending} queued · ${running} running`;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Main runner
// ---------------------------------------------------------------------------

export async function runMorningBrief(): Promise<void> {
  const startTime = await markJobStart('morning-brief');
  const dateLabel = getDateLabel();

  console.log(`[morning-brief] Running for ${dateLabel}...`);

  try {
    // Run all sections concurrently — failures are caught inside each builder
    const [jobHealth, evalScores, actionNeeded, articleDigest, feedbackInbox, todaysFocus, systemLoad] =
      await Promise.allSettled([
        buildJobHealth(),
        buildEvaluationScores(),
        buildActionNeeded(),
        buildArticleDigest(),
        buildFeedbackInbox(),
        buildTodaysFocus(),
        buildSystemLoad(),
      ]).then((results) => results.map((r) => (r.status === 'fulfilled' ? r.value : null)));

    // Cost summary — never throws
    const costData = await getTodayCostEstimate().catch(() => ({ totalUsd: 0, jobCount: 0, breakdown: {} }));
    const costSection = costData.jobCount > 0
      ? `\n💰 *Today\'s AI Cost:* ~$${costData.totalUsd} across ${costData.jobCount} job runs`
      : '';

    // Determine if there's anything worth a full brief
    const hasIssues = jobHealth != null && jobHealth.includes('⚠️');
    const hasScores = evalScores != null;
    const hasActions = actionNeeded != null;
    const hasDigest = articleDigest != null;
    const hasFeedback = feedbackInbox != null;
    const anythingToReport = hasIssues || hasScores || hasActions || hasDigest || hasFeedback;

    let message: string;

    if (!anythingToReport) {
      const loadLine = systemLoad ? `\n\n${systemLoad}` : '';
      const focusLine = todaysFocus ? `\n\n${todaysFocus}` : '';
      message = `🌅 Morning Brief — ${dateLabel}${focusLine}${loadLine}\n\nAll clear. Nothing needs your attention today.${costSection}\n\n— Xhaka`;
    } else {
      const sections = [todaysFocus, systemLoad, jobHealth, evalScores, actionNeeded, articleDigest, feedbackInbox].filter(Boolean) as string[];
      message = `🌅 Morning Brief — ${dateLabel}\n\n${sections.join('\n\n')}${costSection}\n\n— Xhaka`;
    }

    // Enforce Telegram 4096-char limit
    if (message.length > 4096) {
      message = message.slice(0, 4080) + '\n…[truncated]';
    }

    await sendTelegram(message);
    console.log('[morning-brief] ✓ Brief sent');

    await markJobSuccess('morning-brief', startTime);
  } catch (err) {
    // Never rethrow — morning brief failure must not crash the scheduler
    console.error('[morning-brief] Fatal error:', (err as Error).message);
    await markJobFailed('morning-brief', startTime);
  }
}
