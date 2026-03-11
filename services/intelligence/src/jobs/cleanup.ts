import {
  listDirectory,
  getFileContent,
  createFile,
  deleteFile,
  getFileLastCommitDate,
} from '../lib/github.js';
import { synthesize } from '../lib/openai.js';

const XHAKA_REPO = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';
const MEMORY_PATH = 'memory';
const DRY_RUN = process.env.DRY_RUN === 'true';

// Files permanently exempt from cleanup
const EXEMPT_FILES = new Set([
  'LEARNINGS.md',
  'corey-domains.md',
  'research-state-engine.md',
  'heartbeat-state.json',
  'gunner-roadmap.md',
]);

// Subdirectory names (under memory/) that are fully exempt
const EXEMPT_DIRS = new Set(['important', 'archive', 'daily']);

// Age thresholds
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DAYS_30_MS = 30 * MS_PER_DAY;
const DAYS_180_MS = 180 * MS_PER_DAY;

// ---------------------------------------------------------------------------
// Cleanup job — archives and prunes stale memory files
// ---------------------------------------------------------------------------

export async function runCleanup(): Promise<void> {
  console.log(`[cleanup] Starting memory cleanup${DRY_RUN ? ' (DRY RUN)' : ''}...`);

  const now = new Date();
  const entries = await listDirectory(XHAKA_REPO, MEMORY_PATH);

  // Only top-level files; skip exempt dirs and exempt filenames
  const eligible = entries.filter((f) => {
    if (f.type === 'dir') return false;
    if (EXEMPT_FILES.has(f.name)) return false;
    return true;
  });

  // Also skip anything whose path contains an exempt dir segment
  const toProcess = eligible.filter((f) => {
    const segments = f.path.split('/');
    return !segments.some((seg) => EXEMPT_DIRS.has(seg));
  });

  console.log(`[cleanup] ${toProcess.length} eligible file(s) to evaluate.`);

  const archivedByMonth = new Map<string, string[]>();

  for (const file of toProcess) {
    // Determine file age — prefer filename date, fall back to last commit date
    const fileDate =
      parseDateFromName(file.name) ??
      (await getFileLastCommitDate(XHAKA_REPO, file.path));

    if (!fileDate) {
      console.warn(`[cleanup] Cannot determine date for ${file.name} — skipping.`);
      continue;
    }

    const ageMs = now.getTime() - fileDate.getTime();
    const ageDays = Math.floor(ageMs / MS_PER_DAY);

    if (ageMs < DAYS_30_MS) {
      console.log(`[cleanup] KEEP    ${file.name} (${ageDays}d old)`);
      continue;
    }

    const monthKey = toMonthKey(fileDate); // YYYY-MM

    if (ageMs <= DAYS_180_MS) {
      // Archive: move to memory/archive/YYYY-MM/
      const archivePath = `${MEMORY_PATH}/archive/${monthKey}/${file.name}`;
      console.log(`[cleanup] ARCHIVE ${file.name} → archive/${monthKey}/ (${ageDays}d old)`);

      if (!DRY_RUN) {
        const fileData = await getFileContent(XHAKA_REPO, file.path);
        if (!fileData) {
          console.warn(`[cleanup] Could not read ${file.path} — skipping.`);
          continue;
        }

        await createFile(
          XHAKA_REPO,
          archivePath,
          fileData.content,
          `memory: archive ${file.name} → archive/${monthKey}/`,
        );

        await deleteFile(
          XHAKA_REPO,
          file.path,
          `memory: remove ${file.name} from memory/ (archived to ${monthKey})`,
          file.sha,
        );
      }

      const bucket = archivedByMonth.get(monthKey) ?? [];
      archivedByMonth.set(monthKey, [...bucket, file.name]);
    } else {
      // Delete: >180 days — still in git history if ever needed
      console.log(`[cleanup] DELETE  ${file.name} (${ageDays}d old)`);

      if (!DRY_RUN) {
        await deleteFile(
          XHAKA_REPO,
          file.path,
          `memory: delete ${file.name} (${ageDays}d old, >180d threshold)`,
          file.sha,
        );
      }
    }
  }

  // After all moves, generate summaries for newly-archived months (if none exists yet)
  for (const [monthKey, archivedFiles] of archivedByMonth.entries()) {
    await maybeGenerateSummary(monthKey, archivedFiles);
  }

  console.log('[cleanup] Done.');
}

// ---------------------------------------------------------------------------
// Summary generation
// ---------------------------------------------------------------------------

async function maybeGenerateSummary(
  monthKey: string,
  newlyArchived: string[],
): Promise<void> {
  const summaryPath = `${MEMORY_PATH}/archive/${monthKey}-summary.md`;

  // Skip if summary already exists
  const existing = await getFileContent(XHAKA_REPO, summaryPath);
  if (existing) {
    console.log(`[cleanup] Summary already exists for ${monthKey} — skipping.`);
    return;
  }

  console.log(
    `[cleanup] Generating summary for ${monthKey} (${newlyArchived.length} file(s) archived this run)...`,
  );

  if (DRY_RUN) {
    console.log(`[cleanup] DRY RUN — would write: ${summaryPath}`);
    return;
  }

  // Read all files in the archive folder for this month
  const archiveDirPath = `${MEMORY_PATH}/archive/${monthKey}`;
  const archiveEntries = await listDirectory(XHAKA_REPO, archiveDirPath);

  let combinedContent = '';
  for (const entry of archiveEntries) {
    if (entry.type !== 'file' || !entry.name.endsWith('.md')) continue;
    const data = await getFileContent(XHAKA_REPO, entry.path);
    if (data) {
      combinedContent += `

---
## ${entry.name}

${data.content}`;
    }
  }

  if (!combinedContent) {
    console.warn(`[cleanup] No readable content in archive/${monthKey}/ — skipping summary.`);
    return;
  }

  const [year, month] = monthKey.split('-');
  const monthLabel = new Date(
    parseInt(year, 10),
    parseInt(month, 10) - 1,
  ).toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const summaryContent = await synthesize(
    `You are summarizing a month of AI memory files for a wholesale real estate business.
Extract the most important signal from the files. Be concise and factual. No filler.
Format your response EXACTLY as follows (use the exact headers, no extra text before/after):

# ${monthLabel} — Summary

## Key Decisions
- [bullet list of major decisions made this month]

## Projects Advanced
- [bullet list of projects that progressed]

## Rules Established
- [bullet list of new rules, protocols, or standards set]

## Open Items Carried Forward
- [bullet list of things still in progress or unresolved]`,
    `Here are the memory files from ${monthLabel}:
${combinedContent.slice(0, 20000)}`,
    1500,
  );

  console.log(`[cleanup] Writing summary: ${summaryPath}`);
  await createFile(
    XHAKA_REPO,
    summaryPath,
    summaryContent,
    `memory: generate ${monthKey} archive summary`,
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Extract a Date from filenames like "2026-02-15.md" or "2026-02-15-audit.md" */
function parseDateFromName(name: string): Date | null {
  const match = name.match(/^(\d{4}-\d{2}-\d{2})/);
  if (!match) return null;
  // Use noon UTC to avoid timezone-driven off-by-one on the day boundary
  const d = new Date(`${match[1]}T12:00:00Z`);
  return isNaN(d.getTime()) ? null : d;
}

/** Format Date as YYYY-MM */
function toMonthKey(d: Date): string {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${yyyy}-${mm}`;
}
