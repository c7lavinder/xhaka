// services/intelligence/src/utils/rollback.ts
// Revert an applied proposed change — restores original file content via GitHub API
// Called by change-evaluator when a REGRESSION verdict is issued

import { getFileContent, updateFile, createFile } from '../lib/github.js';
import { sendTelegram } from './notifier.js';

const REPO = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';
const REVERTS_LOG_PATH = 'intelligence/change-results/reverts.md';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Revert an applied change by restoring the original file content.
 * Never throws — always sends Telegram alert on failure.
 *
 * @param changeFilePath - Repo-relative path to the approved change file
 *                         e.g. "intelligence/proposed-changes/approved/2026-03-14-fix-researcher.md"
 */
export async function revertChange(changeFilePath: string): Promise<void> {
  try {
    console.log(`[rollback] Reverting change: ${changeFilePath}`);

    // 1. Read the change file
    const changeFile = await getFileContent(REPO, changeFilePath);
    if (!changeFile) {
      await sendTelegram(
        `⚠️ Cannot revert \`${changeFilePath}\` — change file not found`,
      );
      console.warn(`[rollback] Change file not found: ${changeFilePath}`);
      return;
    }

    const content = changeFile.content;

    // 2. Extract target file path
    const targetFile = extractTargetFile(content);
    if (!targetFile) {
      await sendTelegram(
        `⚠️ Cannot revert \`${changeFilePath}\` — no Target field found`,
      );
      console.warn(`[rollback] No Target field in ${changeFilePath}`);
      return;
    }

    // 3. Extract original content from ## Current State section
    const originalContent = extractCurrentState(content);
    if (!originalContent) {
      await sendTelegram(
        `⚠️ Cannot revert \`${targetFile}\` — no Current State section found in \`${changeFilePath}\`\n` +
        `Manual intervention required.`,
      );
      console.warn(`[rollback] No ## Current State section in ${changeFilePath}`);
      return;
    }

    // 4. Get current SHA of the target file
    const targetFileData = await getFileContent(REPO, targetFile);
    if (!targetFileData) {
      await sendTelegram(
        `❌ Revert FAILED for \`${targetFile}\` — target file not found on GitHub\n` +
        `Manual intervention required.`,
      );
      console.warn(`[rollback] Target file not found on GitHub: ${targetFile}`);
      return;
    }

    // 5. Restore original content via GitHub API
    await updateFile(
      REPO,
      targetFile,
      originalContent,
      `revert: restore ${targetFile} — regression detected by change-evaluator`,
      targetFileData.sha,
    );

    console.log(`[rollback] ✓ Restored ${targetFile}`);

    // 6. Append to reverts log
    await appendRevertsLog(targetFile, changeFilePath);

    // 7. Send success notification
    await sendTelegram(
      `⏪ Reverted change to \`${targetFile}\` — regression detected`,
    );

    console.log(`[rollback] Done for ${changeFilePath}`);
  } catch (err) {
    const msg = (err as Error).message ?? String(err);
    console.error(`[rollback] Unexpected error reverting ${changeFilePath}:`, msg);

    try {
      await sendTelegram(
        `❌ Revert FAILED for \`${changeFilePath}\` — unexpected error\n` +
        `\`${msg}\`\nManual intervention required.`,
      );
    } catch {
      // Last resort — swallow
    }
  }
}

// ---------------------------------------------------------------------------
// Parsing helpers
// ---------------------------------------------------------------------------

function extractTargetFile(content: string): string | null {
  // Matches "Target: path/to/file.ts" — handles both "Target:" and "Target :"
  const match = content.match(/^Target[:\s]+(.+)$/mi);
  return match ? match[1].trim() : null;
}

/**
 * Extract the content of the ## Current State section.
 * Strips surrounding code fences if present.
 * Returns null if section not found.
 */
function extractCurrentState(content: string): string | null {
  // Match everything between ## Current State and the next ## heading (or end of file)
  const match = content.match(/##\s+Current State\s*\n([\s\S]*?)(?=\n##\s|\s*$)/i);
  if (!match) return null;

  let raw = match[1].trim();

  // Strip opening code fence (```typescript or ```)
  raw = raw.replace(/^```[a-zA-Z]*\n?/, '');
  // Strip closing code fence
  raw = raw.replace(/\n?```\s*$/, '');

  return raw.trim() || null;
}

// ---------------------------------------------------------------------------
// Reverts log
// ---------------------------------------------------------------------------

async function appendRevertsLog(targetFile: string, changeFilePath: string): Promise<void> {
  try {
    const date = new Date().toISOString().split('T')[0];
    const row = `| ${date} | \`${targetFile}\` | \`${changeFilePath}\` | REGRESSION |`;

    const existing = await getFileContent(REPO, REVERTS_LOG_PATH);

    let newContent: string;
    if (existing) {
      // Append row before end of file
      newContent = existing.content.trimEnd() + '\n' + row + '\n';
    } else {
      // Create fresh reverts log
      newContent = `# Reverts Log

Auto-maintained by rollback.ts. Each entry records an automatic revert triggered by a regression detection.

## Log

| Date | Target File | Change File | Reason |
|------|-------------|-------------|--------|
${row}
`;
    }

    if (existing?.sha) {
      await updateFile(
        REPO,
        REVERTS_LOG_PATH,
        newContent,
        `chore: reverts log [${targetFile}]`,
        existing.sha,
      );
    } else {
      await createFile(
        REPO,
        REVERTS_LOG_PATH,
        newContent,
        `chore: reverts log init`,
      );
    }
  } catch (err) {
    // Non-fatal — log write failure should not block the revert success flow
    console.warn('[rollback] Failed to write reverts log:', (err as Error).message);
  }
}
