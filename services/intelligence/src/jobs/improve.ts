import { getRecentCommits, getFileContent, updateFile } from '../lib/github.js';
import { getRecentFailureSummary } from '../lib/railway.js';
import { generateBuilderLesson, generateOperatorLesson } from '../lib/openai.js';
import { markJobStart, markJobSuccess, markJobFailed } from '../utils/job-registry.js';
import { sendAlert, classifyOpenAIError } from '../utils/alert.js';

const XHAKA_REPO = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';
const WATCH_REPO = process.env.WATCH_REPO ?? 'c7lavinder/xhaka';
const RAILWAY_SERVICE_ID = process.env.RAILWAY_SERVICE_ID ?? '';
const AGENTS_PATH = 'agents';
const FAILURE_PATTERNS_HEADING = '## Common Failure Patterns (Don\'t Repeat These)';
const KNOWN_ISSUES_HEADING = '## Known Issues';
const LESSONS_HEADING = '## Lessons Learned';

// ---------------------------------------------------------------------------
// Improve job — weekly Monday 6 AM CST
// Pulls git history + Railway logs, extracts lessons, updates agent files
// ---------------------------------------------------------------------------

export async function runImprove(): Promise<void> {
  const _startTime = await markJobStart('improve');
  try {
    console.log('[improve] Starting weekly improvement run...');

    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const date = new Date().toISOString().split('T')[0];

    await runBuilderImprovement(since, date);
    await runOperatorImprovement(since, date);

    console.log('[improve] Done.');

    await markJobSuccess('improve', _startTime);
  } catch (err) {
    console.error('[improve] Fatal error:', err);
    await markJobFailed('improve', _startTime);
    // FIX 6: Send alert for OpenAI failures
    const alertMsg = (err instanceof Error)
      ? '\u{1F6A8} *Improve failed*\n' + classifyOpenAIError(err)
      : '\u{1F6A8} *Improve failed* \u2014 unknown error';
    await sendAlert(alertMsg);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Builder improvement — scan git history for failures
// ---------------------------------------------------------------------------

async function runBuilderImprovement(since: Date, date: string): Promise<void> {
  console.log('[improve] Scanning git history for failures...');

  const commits = await getRecentCommits(WATCH_REPO, since);
  const failureCommits = commits.filter((c) =>
    /^(fix:|revert:|hotfix:|fixup!)/i.test(c.message),
  );

  console.log(
    `[improve] Found ${failureCommits.length} fix/revert/hotfix commit(s) in ${WATCH_REPO}.`,
  );

  if (!failureCommits.length) {
    console.log('[improve] No builder failures to process.');
    return;
  }

  const builderPath = `${AGENTS_PATH}/builder.md`;
  const builderData = await getFileContent(XHAKA_REPO, builderPath);
  if (!builderData) {
    console.warn('[improve] builder.md not found — skipping builder improvement.');
    return;
  }

  const newRows: string[] = [];

  // FIX 6: Removed inner try/catch — let OpenAI errors propagate to outer catch
  for (const commit of failureCommits.slice(0, 10)) {
    // Cap at 10 to manage tokens
    const context = `Commit SHA: ${commit.sha.slice(0, 8)}
Message: ${commit.message}
Author: ${commit.author}
Date: ${commit.date.toISOString()}
URL: ${commit.url}`;

    const row = await generateBuilderLesson(context);
    if (row.trim()) {
      newRows.push(row.trim());
      console.log(`[improve] ✓ Generated lesson from: ${commit.message.slice(0, 60)}`);
    }
  }

  if (!newRows.length) return;

  const updatedContent = appendToBuilderTable(builderData.content, newRows);
  await updateFile(
    XHAKA_REPO,
    builderPath,
    updatedContent,
    `intelligence: weekly improvement run — ${newRows.length} builder lesson(s) [${date}]`,
    builderData.sha,
  );

  console.log(`[improve] ✓ Updated builder.md with ${newRows.length} new lesson(s).`);
}

// ---------------------------------------------------------------------------
// Operator improvement — scan Railway deploy failures
// ---------------------------------------------------------------------------

async function runOperatorImprovement(since: Date, date: string): Promise<void> {
  console.log('[improve] Scanning Railway logs for deploy failures...');

  if (!RAILWAY_SERVICE_ID) {
    console.log('[improve] RAILWAY_SERVICE_ID not configured — skipping Railway failure log pull.');
    return;
  }

  let failureSummary: string;
  try {
    failureSummary = await getRecentFailureSummary(RAILWAY_SERVICE_ID, since);
  } catch (err) {
    console.warn('[improve] Could not fetch Railway failure summary:', err);
    return;
  }

  if (!failureSummary || failureSummary.startsWith('No failed deployments')) {
    console.log('[improve] No Railway failures to process.');
    return;
  }

  const operatorPath = `${AGENTS_PATH}/operator.md`;
  const operatorData = await getFileContent(XHAKA_REPO, operatorPath);
  if (!operatorData) {
    console.warn('[improve] operator.md not found — skipping operator improvement.');
    return;
  }

  // FIX 6: Let OpenAI errors propagate to outer catch
  const lesson = await generateOperatorLesson(failureSummary);

  if (!lesson.trim()) return;

  const updatedContent = appendToOperatorKnownIssues(operatorData.content, lesson);
  await updateFile(
    XHAKA_REPO,
    operatorPath,
    updatedContent,
    `intelligence: weekly improvement run — Railway issue logged [${date}]`,
    operatorData.sha,
  );

  console.log('[improve] ✓ Updated operator.md with Railway known issue.');
}

// ---------------------------------------------------------------------------
// Content manipulation helpers
// ---------------------------------------------------------------------------

function appendToBuilderTable(content: string, newRows: string[]): string {
  // Find the failure patterns table and append rows before the next ## section
  const tableEnd = findTableEnd(content, FAILURE_PATTERNS_HEADING);

  if (tableEnd === -1) {
    // No table found — fall back to appending a Lessons Learned section
    const section = ensureSection(content, LESSONS_HEADING);
    const addition = '
' + newRows.join('
') + '
';
    return section.trimEnd() + addition;
  }

  const before = content.slice(0, tableEnd);
  const after = content.slice(tableEnd);
  return before + newRows.join('
') + '
' + after;
}

function appendToOperatorKnownIssues(content: string, lesson: string): string {
  const withSection = ensureSection(content, KNOWN_ISSUES_HEADING);
  const idx = withSection.lastIndexOf(KNOWN_ISSUES_HEADING);
  const insertAt = idx + KNOWN_ISSUES_HEADING.length;
  return (
    withSection.slice(0, insertAt) +
    '

' +
    lesson.trim() +
    '
' +
    withSection.slice(insertAt)
  );
}

function findTableEnd(content: string, headingMarker: string): number {
  const headingIdx = content.indexOf(headingMarker);
  if (headingIdx === -1) return -1;

  // Walk past the table — find the last | line before the next ## or end
  const afterHeading = content.slice(headingIdx);
  const lines = afterHeading.split('
');

  let lastTableLineIdx = -1;
  let charCount = headingIdx;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (i > 0 && line.startsWith('## ')) break; // Next section
    if (line.startsWith('|')) lastTableLineIdx = charCount + line.length + 1;
    charCount += line.length + 1;
  }

  return lastTableLineIdx === -1 ? -1 : lastTableLineIdx;
}

function ensureSection(content: string, heading: string): string {
  if (content.includes(heading)) return content;
  return content.trimEnd() + `

${heading}
`;
}