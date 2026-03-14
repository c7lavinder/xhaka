import {
  listDirectory,
  getFileContent,
  createFile,
  deleteFile,
} from '../lib/github.js';
import {
  parseIntelFile,
  getProcessedPath,
} from '../lib/router.js';
import { markJobStart, markJobSuccess, markJobFailed } from '../utils/job-registry.js';
import { enqueue } from '../utils/task-queue.js';

const XHAKA_REPO = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';
const INBOX_PATH = 'intelligence/inbox';
const ARTICLE_INBOX_PATH = 'intelligence/article-inbox.md';

// ---------------------------------------------------------------------------
// Capture job — polls inbox/, routes items to processed/
// Also watches article-inbox.md and enqueues researcher when items are present
// ---------------------------------------------------------------------------

export async function runCapture(): Promise<void> {
  const _startTime = await markJobStart('capture');
  try {
    console.log('[capture] Scanning inbox...');

    // 1. Process intelligence/inbox/ markdown files
    const files = await listDirectory(XHAKA_REPO, INBOX_PATH);
    const markdownFiles = files.filter(
      (f) => f.type === 'file' && f.name.endsWith('.md'),
    );

    if (markdownFiles.length > 0) {
      console.log(`[capture] Found ${markdownFiles.length} file(s) to process.`);
      for (const file of markdownFiles) {
        await processInboxFile(file.path, file.name, file.sha);
      }
    } else {
      console.log('[capture] Inbox is empty.');
    }

    // 2. Check article-inbox.md — enqueue researcher immediately if items exist
    await checkArticleInbox();

    console.log('[capture] Done.');
    await markJobSuccess('capture', _startTime);
  } catch (err) {
    console.error('[capture] Fatal error:', err);
    await markJobFailed('capture', _startTime);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Process a single inbox file — route to processed/ and enqueue agent tasks
// ---------------------------------------------------------------------------

async function processInboxFile(
  filePath: string,
  fileName: string,
  sha: string,
): Promise<void> {
  console.log(`[capture] Processing: ${fileName}`);

  const fileData = await getFileContent(XHAKA_REPO, filePath);
  if (!fileData) {
    console.warn(`[capture] Could not read ${filePath} — skipping.`);
    return;
  }

  let parsed;
  try {
    parsed = parseIntelFile(fileData.content);
  } catch (err) {
    console.error(`[capture] Failed to parse ${fileName}:`, err);
    // Move to general/unroutable so it doesn't loop
    const fallbackPath = `intelligence/processed/general/${fileName}`;
    await createFile(
      XHAKA_REPO,
      fallbackPath,
      fileData.content,
      `intelligence: route ${fileName} → general (parse error)`,
    );
    await deleteFile(
      XHAKA_REPO,
      filePath,
      `intelligence: remove ${fileName} from inbox (parse error)`,
      sha,
    );
    return;
  }

  const { project, date, tags, urgency } = parsed.frontmatter;
  const processedPath = getProcessedPath(fileName, project);

  console.log(
    `[capture] Routing ${fileName} → processed/${project}/ (tags: ${tags.join(', ')}, urgency: ${urgency})`,
  );

  // ── Task queue triggers ─────────────────────────────────────────────────

  // High-urgency items or explicit "goal" tags → Architect drafts a spec
  const isGoal = tags.includes('goal') || tags.includes('spec') || urgency === 'high';
  if (isGoal) {
    console.log(`[capture] 🎨 High-urgency item detected — enqueuing Architect task`);
    await safeEnqueue('architect', 'draft-spec', {
      goalTitle: parsed.synthesis || fileName.replace('.md', ''),
      goalBody: parsed.raw,
      sourceFile: filePath,
      project,
    });
  }

  // Write to processed/
  await createFile(
    XHAKA_REPO,
    processedPath,
    fileData.content,
    `intelligence: capture ${date} [${project}] → ${project}/`,
  );

  // Remove from inbox
  await deleteFile(
    XHAKA_REPO,
    filePath,
    `intelligence: remove ${fileName} from inbox`,
    sha,
  );

  console.log(`[capture] ✓ ${fileName} routed to processed/${project}/`);
}

// ---------------------------------------------------------------------------
// Check article-inbox.md — enqueue researcher if entries are present
// ---------------------------------------------------------------------------

async function checkArticleInbox(): Promise<void> {
  try {
    const inboxFile = await getFileContent(XHAKA_REPO, ARTICLE_INBOX_PATH);
    if (!inboxFile || !inboxFile.content.trim()) {
      console.log('[capture] article-inbox.md is empty — researcher idle.');
      return;
    }

    // Count non-empty, non-comment, non-header lines that look like URLs or items
    const lines = inboxFile.content
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#') && !l.startsWith('<!--'));

    if (lines.length === 0) {
      console.log('[capture] article-inbox.md has no actionable entries.');
      return;
    }

    console.log(`[capture] 📰 article-inbox.md has ${lines.length} item(s) — enqueuing Researcher`);
    await safeEnqueue('researcher', 'process-article-inbox', {
      trigger: 'article-inbox-watch',
      itemCount: lines.length,
    });
  } catch (err) {
    console.warn('[capture] Could not check article-inbox.md:', err);
  }
}

// ---------------------------------------------------------------------------
// Safe enqueue — non-fatal wrapper
// ---------------------------------------------------------------------------

async function safeEnqueue(
  agent: Parameters<typeof enqueue>[0],
  task: string,
  payload: Record<string, unknown>,
): Promise<void> {
  try {
    await enqueue(agent, task, payload);
  } catch (err) {
    console.warn(`[capture] Failed to enqueue ${agent}/${task}:`, err);
  }
}
