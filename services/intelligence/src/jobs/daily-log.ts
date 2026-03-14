// jobs/daily-log.ts
// Runs every 6 hours: reads intelligence/inbox/*.md files and appends to today's memory log.
// This is the write path that feeds scribe.ts.

import { getFileContent, updateFile, createFile, listDirectory, deleteFile } from '../lib/github.js';
import { markJobStart, markJobSuccess, markJobFailed } from '../utils/job-registry.js';
import { evaluateJobOutput } from '../utils/evaluator.js';
import { sendAlert } from '../utils/alert.js';

const REPO = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';
const INBOX_PATH = 'intelligence/inbox';
const PROCESSED_PATH = 'intelligence/processed';

function getTimestamp(): string {
  // Format as HH:MM CST
  return new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/Chicago',
  });
}

export async function runDailyLog(): Promise<void> {
  const startTime = await markJobStart('daily-log');
  const dateStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const logPath = `memory/${dateStr}.md`;
  const timestamp = getTimestamp();

  console.log(`[daily-log] Running for ${dateStr}...`);

  try {
    // List inbox directory
    let inboxFiles: { name: string; path: string; sha: string; type: string }[];
    try {
      inboxFiles = await listDirectory(REPO, INBOX_PATH);
    } catch {
      console.log('[daily-log] Inbox directory does not exist yet — creating timestamp entry');
      // Still touch today's log with a timestamp
      await touchDailyLog(logPath, dateStr, timestamp);
      await markJobSuccess('daily-log', startTime);
      return;
    }

    const mdFiles = inboxFiles.filter(
      (f) => f.type === 'file' && f.name.endsWith('.md')
    );

    if (mdFiles.length === 0) {
      console.log('[daily-log] No .md files in inbox — creating timestamp entry');
      await touchDailyLog(logPath, dateStr, timestamp);
      await markJobSuccess('daily-log', startTime);
      return;
    }

    console.log(`[daily-log] Found ${mdFiles.length} inbox file(s)`);

    let appendContent = '';

    for (const inboxFile of mdFiles) {
      const file = await getFileContent(REPO, inboxFile.path);
      if (!file || !file.content.trim()) continue;

      appendContent +=
        `\n\n---\n` +
        `<!-- inbox: ${inboxFile.name} @ ${new Date().toISOString()} -->\n\n` +
        file.content.trim() +
        '\n';

      console.log(`[daily-log] Appended: ${inboxFile.name}`);

      // Move file to processed directory
      try {
        const processedPath = `${PROCESSED_PATH}/${inboxFile.name}`;
        await createFile(
          REPO,
          processedPath,
          file.content,
          `chore(daily-log): move ${inboxFile.name} to processed`,
        );
        await deleteFile(
          REPO,
          inboxFile.path,
          `chore(daily-log): remove ${inboxFile.name} from inbox`,
          inboxFile.sha,
        );
        console.log(`[daily-log] Moved ${inboxFile.name} to processed/`);
      } catch (moveErr) {
        console.warn(`[daily-log] Could not move ${inboxFile.name} to processed:`, (moveErr as Error).message);
      }
    }

    if (!appendContent) {
      await touchDailyLog(logPath, dateStr, timestamp);
      await markJobSuccess('daily-log', startTime);
      return;
    }

    // Append to today's log
    const existing = await getFileContent(REPO, logPath);
    if (existing) {
      await updateFile(
        REPO,
        logPath,
        existing.content + appendContent,
        `chore(daily-log): append ${mdFiles.length} inbox item(s) [${dateStr}]`,
        existing.sha,
      );
    } else {
      const header = `# Session Log — ${dateStr}\n`;
      await createFile(
        REPO,
        logPath,
        header + appendContent,
        `chore(daily-log): create session log [${dateStr}]`,
      );
    }

    console.log(`[daily-log] ✓ Wrote to ${logPath}`);

    // Evaluate daily-log output quality
    try {
      const logContent = appendContent || `timestamp entry for ${dateStr}`;
      const evalResult = await evaluateJobOutput('daily-log', logContent);
      console.log(`[daily-log] Evaluation: score=${evalResult.score} grade=${evalResult.grade}`);
    } catch (evalErr) {
      console.warn('[daily-log] Evaluation step failed (non-fatal):', (evalErr as Error).message);
    }

    await markJobSuccess('daily-log', startTime);
  } catch (err) {
    console.error('[daily-log] Fatal error:', err);
    await sendAlert(`🚨 daily-log failed: ${(err as Error).message}`);
    await markJobFailed('daily-log', startTime);
    throw err;
  }
}

/**
 * Touch today's daily log with a timestamp entry if no inbox activity.
 */
async function touchDailyLog(logPath: string, dateStr: string, timestamp: string): Promise<void> {
  const entry = `\n_[${timestamp} CST] — No inbox activity_\n`;
  
  try {
    const existing = await getFileContent(REPO, logPath);
    if (existing) {
      await updateFile(
        REPO,
        logPath,
        existing.content + entry,
        `chore(daily-log): timestamp entry [${dateStr}]`,
        existing.sha,
      );
    } else {
      const header = `# Session Log — ${dateStr}\n`;
      await createFile(
        REPO,
        logPath,
        header + entry,
        `chore(daily-log): create session log [${dateStr}]`,
      );
    }
    console.log(`[daily-log] ✓ Created/updated ${logPath} with timestamp`);
  } catch (err) {
    console.warn('[daily-log] Could not touch daily log:', (err as Error).message);
  }
}
