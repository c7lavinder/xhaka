// services/intelligence/src/jobs/agent-scorecard.ts
// Weekly agent performance scorecards — runs every Sunday 8 AM CST

import { getFileContent, createFile, getRecentCommits } from '../lib/github.js';
import { markJobStart, markJobSuccess, markJobFailed } from '../utils/job-registry.js';
import { sendTelegram } from '../utils/notifier.js';

const REPO = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';

// ---------------------------------------------------------------------------
// Data types
// ---------------------------------------------------------------------------

interface EvalEntry {
  jobName: string;
  score: number;
  grade: string;
  rationale: string;
  evaluatedAt: string;
}

interface FeedbackEntry {
  job: string;
  date: string;
  rating: 'good' | 'ok' | 'bad';
  comment: string;
  processedAt: string;
}

interface ResultsRow {
  timestamp: string;
  jobName: string;
  status: string;
  durationMs: number;
  score: number | null;
  notes: string;
}

interface AgentStats {
  name: string;
  displayName: string;
  successRate: number;      // 0-100
  avgDuration: number;      // ms
  runsTotal: number;
  lowQualityCount: number;
  compositeScore: number;   // 0-100, higher = better performance
}

interface ResearcherStats extends AgentStats {
  avgQualityScore: number;
  articlesProcessed: number;
  proposedChanges: number;
}

interface BuilderStats extends AgentStats {
  commitsLast7Days: number;
  tsErrorsCaught: number;
}

interface AuditorStats extends AgentStats {
  auditsRun: number;
  issuesFlagged: number;
  issuesMissed: number;   // from feedback with "bad" rating on auditor job
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function sevenDaysAgo(): Date {
  return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
}

function parseResultsTsv(content: string): ResultsRow[] {
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];

  // Skip header
  const rows: ResultsRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split('\t');
    if (parts.length < 4) continue;

    const [timestamp, jobName, status, durationMsStr, scoreStr, notes] = parts;
    rows.push({
      timestamp: timestamp ?? '',
      jobName: jobName ?? '',
      status: status ?? '',
      durationMs: parseInt(durationMsStr ?? '0', 10) || 0,
      score: scoreStr && scoreStr.trim() !== '' ? parseFloat(scoreStr) : null,
      notes: notes?.trim() ?? '',
    });
  }

  return rows;
}

function filterLast7Days<T extends { timestamp?: string; evaluatedAt?: string; date?: string; processedAt?: string }>(
  entries: T[],
): T[] {
  const cutoff = sevenDaysAgo().getTime();
  return entries.filter((e) => {
    const dateStr = e.timestamp ?? e.evaluatedAt ?? e.processedAt ?? e.date ?? '';
    return dateStr ? new Date(dateStr).getTime() >= cutoff : false;
  });
}

function avg(arr: number[]): number {
  if (arr.length === 0) return 0;
  return Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10;
}

function pct(n: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((n / total) * 100);
}

// ---------------------------------------------------------------------------
// Per-agent stats builders
// ---------------------------------------------------------------------------

function buildBaseStats(
  jobName: string,
  displayName: string,
  rows: ResultsRow[],
): AgentStats {
  const jobRows = filterLast7Days(rows).filter((r) => r.jobName === jobName);
  const successRows = jobRows.filter((r) => r.status === 'success');
  const lowQualityCount = jobRows.filter((r) =>
    r.status === 'LOW_QUALITY' || r.notes?.toLowerCase().includes('low_quality'),
  ).length;

  const successRate = pct(successRows.length, jobRows.length);
  const avgDuration = avg(jobRows.map((r) => r.durationMs));
  const compositeScore = Math.max(0, successRate - lowQualityCount * 5);

  return {
    name: jobName,
    displayName,
    successRate,
    avgDuration,
    runsTotal: jobRows.length,
    lowQualityCount,
    compositeScore,
  };
}

function buildResearcherStats(
  rows: ResultsRow[],
  evalEntries: EvalEntry[],
): ResearcherStats {
  const base = buildBaseStats('researcher', 'Researcher', rows);

  // Quality scores from eval log
  const researcherEvals = filterLast7Days(evalEntries).filter((e) => e.jobName === 'researcher');
  const avgQualityScore = avg(researcherEvals.map((e) => e.score));

  // Proxy: count researcher success runs as articles processed
  const recentRows = filterLast7Days(rows).filter((r) => r.jobName === 'researcher' && r.status === 'success');
  const articlesProcessed = recentRows.length;

  // Proposed changes count: from notes field or score proxy
  const proposedChanges = recentRows.filter((r) => (r.score ?? 0) >= 7).length;

  return {
    ...base,
    avgQualityScore,
    articlesProcessed,
    proposedChanges,
  };
}

async function buildBuilderStats(
  rows: ResultsRow[],
  evalEntries: EvalEntry[],
): Promise<BuilderStats> {
  const base = buildBaseStats('improve', 'Builder', rows);

  // Builder commits from GitHub API (last 7 days)
  let commitsLast7Days = 0;
  try {
    const commits = await getRecentCommits(REPO, sevenDaysAgo());
    // Filter to commits that look like builder activity (code changes)
    commitsLast7Days = commits.filter((c) =>
      !c.message.startsWith('chore: job-registry') &&
      !c.message.startsWith('chore: results-log'),
    ).length;
  } catch (err) {
    console.warn('[agent-scorecard] Could not fetch commits:', (err as Error).message);
  }

  // TypeScript errors caught by Auditor: proxy from auditor eval with score < 7
  const auditorEvals = filterLast7Days(evalEntries).filter((e) => e.jobName === 'auditor');
  const tsErrorsCaught = auditorEvals.filter((e) => e.score < 7).length;

  return {
    ...base,
    commitsLast7Days,
    tsErrorsCaught,
  };
}

function buildAuditorStats(
  rows: ResultsRow[],
  evalEntries: EvalEntry[],
  feedbackEntries: FeedbackEntry[],
): AuditorStats {
  const base = buildBaseStats('auditor', 'Auditor', rows);

  const auditorEvals = filterLast7Days(evalEntries).filter((e) => e.jobName === 'auditor');
  const auditsRun = Math.max(base.runsTotal, auditorEvals.length);

  // Issues flagged: count evals where score < 8 (detected something)
  const issuesFlagged = auditorEvals.filter((e) => e.score < 8).length;

  // Issues missed: bad feedback ratings on auditor or inspect jobs (human said "bad")
  const recentFeedback = filterLast7Days(feedbackEntries);
  const issuesMissed = recentFeedback.filter(
    (f) => (f.job === 'auditor' || f.job === 'inspect') && f.rating === 'bad',
  ).length;

  return {
    ...base,
    auditsRun,
    issuesFlagged,
    issuesMissed,
  };
}

// ---------------------------------------------------------------------------
// All-jobs summary stats
// ---------------------------------------------------------------------------

interface AllJobsStats {
  totalRuns: number;
  successRate: number;
  avgDurationMs: number;
  lowQualityCount: number;
  topJobBySuccessRate: string;
  bottomJobBySuccessRate: string;
}

function buildAllJobsStats(rows: ResultsRow[]): AllJobsStats {
  const recentRows = filterLast7Days(rows);
  const totalRuns = recentRows.length;
  const successRows = recentRows.filter((r) => r.status === 'success');
  const lowQualityCount = recentRows.filter((r) => r.status === 'LOW_QUALITY').length;
  const successRate = pct(successRows.length, totalRuns);
  const avgDurationMs = avg(recentRows.map((r) => r.durationMs));

  // Per-job breakdown for top/bottom
  const jobMap = new Map<string, { success: number; total: number }>();
  for (const row of recentRows) {
    const cur = jobMap.get(row.jobName) ?? { success: 0, total: 0 };
    cur.total++;
    if (row.status === 'success') cur.success++;
    jobMap.set(row.jobName, cur);
  }

  let topJobBySuccessRate = 'N/A';
  let bottomJobBySuccessRate = 'N/A';
  let topRate = -1;
  let bottomRate = 101;

  for (const [job, stats] of jobMap.entries()) {
    if (stats.total < 2) continue; // Need at least 2 runs for meaningful rate
    const rate = pct(stats.success, stats.total);
    if (rate > topRate) { topRate = rate; topJobBySuccessRate = `${job} (${rate}%)`; }
    if (rate < bottomRate) { bottomRate = rate; bottomJobBySuccessRate = `${job} (${rate}%)`; }
  }

  return { totalRuns, successRate, avgDurationMs, lowQualityCount, topJobBySuccessRate, bottomJobBySuccessRate };
}

// ---------------------------------------------------------------------------
// Scorecard markdown builder
// ---------------------------------------------------------------------------

function buildScorecardMarkdown(
  date: string,
  researcher: ResearcherStats,
  builder: BuilderStats,
  auditor: AuditorStats,
  allJobs: AllJobsStats,
  topPerformer: string,
  lowestPerformer: string,
  actionItem: string,
): string {
  return `# Agent Performance Scorecard — ${date}
> Auto-generated weekly by agent-scorecard job (Sunday 8 AM CST)

## 📊 Summary
| Metric | Value |
|--------|-------|
| Total runs (7 days) | ${allJobs.totalRuns} |
| Overall success rate | ${allJobs.successRate}% |
| Avg duration | ${Math.round(allJobs.avgDurationMs / 1000)}s |
| LOW_QUALITY count | ${allJobs.lowQualityCount} |
| Top job | ${allJobs.topJobBySuccessRate} |
| Struggling job | ${allJobs.bottomJobBySuccessRate} |

---

## 🔬 Researcher
| Metric | Value |
|--------|-------|
| Success rate | ${researcher.successRate}% |
| Avg quality score | ${researcher.avgQualityScore}/10 |
| Articles processed | ${researcher.articlesProcessed} |
| Proposed changes generated | ${researcher.proposedChanges} |
| LOW_QUALITY count | ${researcher.lowQualityCount} |
| Avg duration | ${Math.round(researcher.avgDuration / 1000)}s |
| Composite score | ${researcher.compositeScore}/100 |

---

## 👷 Builder
| Metric | Value |
|--------|-------|
| Commits (last 7 days) | ${builder.commitsLast7Days} |
| TypeScript errors caught by Auditor | ${builder.tsErrorsCaught} |
| Improve job success rate | ${builder.successRate}% |
| LOW_QUALITY count | ${builder.lowQualityCount} |
| Composite score | ${builder.compositeScore}/100 |

---

## 👮 Auditor
| Metric | Value |
|--------|-------|
| Audits run | ${auditor.auditsRun} |
| Issues flagged | ${auditor.issuesFlagged} |
| Issues missed (from bad feedback) | ${auditor.issuesMissed} |
| Success rate | ${auditor.successRate}% |
| Composite score | ${auditor.compositeScore}/100 |

---

## 🏆 Top Performer
**${topPerformer}**

## 📉 Lowest Performer
**${lowestPerformer}**

## ⚡ Action Item
${actionItem}
`;
}

function deriveTopAndBottom(
  researcher: ResearcherStats,
  builder: BuilderStats,
  auditor: AuditorStats,
): { topPerformer: string; lowestPerformer: string; actionItem: string } {
  const agents = [
    { name: 'Researcher', score: researcher.compositeScore, lowQ: researcher.lowQualityCount },
    { name: 'Builder', score: builder.compositeScore, lowQ: builder.lowQualityCount },
    { name: 'Auditor', score: auditor.compositeScore, lowQ: auditor.lowQualityCount },
  ];

  agents.sort((a, b) => b.score - a.score);
  const top = agents[0];
  const bottom = agents[agents.length - 1];

  const topPerformer = `${top.name} — composite score ${top.score}/100`;
  const lowestPerformer = `${bottom.name} — composite score ${bottom.score}/100`;

  // Action item derived from lowest performer's weaknesses
  let actionItem = 'All agents performing within acceptable range — maintain current configuration.';
  if (bottom.name === 'Researcher' && researcher.avgQualityScore < 6) {
    actionItem = 'Researcher quality scores are low — review article analysis prompt and consider adding more specific instructions.';
  } else if (bottom.name === 'Builder' && builder.tsErrorsCaught > 3) {
    actionItem = 'Builder is producing TypeScript errors — review recent commits and tighten Auditor checks.';
  } else if (bottom.name === 'Auditor' && auditor.issuesMissed > 2) {
    actionItem = 'Auditor is missing issues flagged by feedback — review audit criteria and tighten checks.';
  } else if (bottom.score < 50) {
    actionItem = `${bottom.name} composite score dropped below 50 — manual review recommended.`;
  }

  return { topPerformer, lowestPerformer, actionItem };
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export async function runAgentScorecard(): Promise<void> {
  const startTime = await markJobStart('agent-scorecard');

  try {
    console.log('[agent-scorecard] Starting weekly performance scorecard...');

    const date = todayStr();

    // 1. Load data files
    let evalEntries: EvalEntry[] = [];
    let feedbackEntries: FeedbackEntry[] = [];
    let resultRows: ResultsRow[] = [];

    try {
      const evalFile = await getFileContent(REPO, 'data/evaluation-log.json');
      if (evalFile) {
        const parsed = JSON.parse(evalFile.content) as unknown;
        if (Array.isArray(parsed)) evalEntries = parsed as EvalEntry[];
      }
    } catch {
      console.warn('[agent-scorecard] Could not load evaluation-log.json');
    }

    try {
      const fbFile = await getFileContent(REPO, 'data/feedback-log.json');
      if (fbFile) {
        const parsed = JSON.parse(fbFile.content) as unknown;
        if (Array.isArray(parsed)) feedbackEntries = parsed as FeedbackEntry[];
      }
    } catch {
      console.warn('[agent-scorecard] Could not load feedback-log.json');
    }

    try {
      const tsvFile = await getFileContent(REPO, 'data/results.tsv');
      if (tsvFile) {
        resultRows = parseResultsTsv(tsvFile.content);
      }
    } catch {
      console.warn('[agent-scorecard] Could not load results.tsv');
    }

    // 2. Compute per-agent stats
    const researcher = buildResearcherStats(resultRows, evalEntries);
    const builder = await buildBuilderStats(resultRows, evalEntries);
    const auditor = buildAuditorStats(resultRows, evalEntries, feedbackEntries);
    const allJobs = buildAllJobsStats(resultRows);

    // 3. Derive top/bottom/action
    const { topPerformer, lowestPerformer, actionItem } = deriveTopAndBottom(researcher, builder, auditor);

    // 4. Build + write scorecard
    const markdown = buildScorecardMarkdown(
      date,
      researcher,
      builder,
      auditor,
      allJobs,
      topPerformer,
      lowestPerformer,
      actionItem,
    );

    const filePath = `intelligence/scorecards/${date}.md`;
    await createFile(
      REPO,
      filePath,
      markdown,
      `agent-scorecard: weekly scorecard (${date})`,
    );

    console.log(`[agent-scorecard] ✓ Scorecard written: ${filePath}`);

    // 5. Send 3-line Telegram summary
    const telegramMsg =
      `📊 *Weekly Agent Scorecard — ${date}*\n` +
      `🏆 Top: ${topPerformer}\n` +
      `📉 Low: ${lowestPerformer}\n` +
      `⚡ Action: ${actionItem.slice(0, 120)}`;

    await sendTelegram(telegramMsg);

    console.log('[agent-scorecard] Done.');
    await markJobSuccess('agent-scorecard', startTime);
  } catch (err) {
    console.error('[agent-scorecard] Fatal error:', err);
    await markJobFailed('agent-scorecard', startTime);
    // Never re-throw — scorecard failure shouldn't break anything else
  }
}
