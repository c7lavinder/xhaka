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
import { enqueue, getAllTasks } from '../utils/task-queue.js';

const XHAKA_REPO = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';
const INBOX_PATH = 'intelligence/inbox';
const ARTICLE_INBOX_PATH = 'intelligence/article-inbox.md';
const VOICE_INBOX_PATH = 'intelligence/voice-inbox';
const VOICE_PROCESSED_PATH = 'intelligence/voice-processed';

const MS_24H = 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Capture job — polls inbox/, routes items to processed/
// Also watches article-inbox.md and enqueues researcher when items are present
// Also watches voice-inbox/ and enqueues voice-ingest when audio files are present
// Also queues librarian/audit daily if one hasn't run in the last 24 hours
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

    // 3. Check voice-inbox/ — enqueue voice-ingest if unprocessed audio files exist
    await checkVoiceInbox();

    // 4. Queue librarian/audit if none has been created in the last 24 hours
    await checkLibrarianQueue();

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
// Check voice-inbox/ — enqueue voice-ingest if unprocessed audio files exist
// ---------------------------------------------------------------------------

const AUDIO_EXTENSIONS = new Set(['.m4a', '.mp3', '.wav', '.ogg']);

async function checkVoiceInbox(): Promise<void> {
  try {
    const inboxFiles = await listDirectory(XHAKA_REPO, VOICE_INBOX_PATH);
    const audioFiles = inboxFiles.filter(
      (f) => f.type === 'file' && AUDIO_EXTENSIONS.has(f.name.slice(f.name.lastIndexOf('.')).toLowerCase()),
    );

    if (audioFiles.length === 0) {
      console.log('[capture] voice-inbox is empty — voice-ingest idle.');
      return;
    }

    // Check which files have already been processed
    const processedFiles = await listDirectory(XHAKA_REPO, VOICE_PROCESSED_PATH);
    const processedNames = new Set(processedFiles.filter(f => f.type === 'file').map(f => f.name));
    const unprocessed = audioFiles.filter(f => !processedNames.has(f.name));

    if (unprocessed.length === 0) {
      console.log('[capture] All voice-inbox files already processed — voice-ingest idle.');
      return;
    }

    console.log(`[capture] 🎙️ voice-inbox has ${unprocessed.length} unprocessed audio file(s) — enqueuing Voice Ingest`);
    await safeEnqueue('voice-ingest', 'process', {
      trigger: 'voice-inbox-watch',
      fileCount: unprocessed.length,
    });
  } catch (err) {
    console.warn('[capture] Could not check voice-inbox:', err);
  }
}

// ---------------------------------------------------------------------------
// Check librarian queue — enqueue librarian/audit if none has run in 24 hours
// Queue-first architecture: dispatcher is primary engine, cron is safety net.
// ---------------------------------------------------------------------------

async function checkLibrarianQueue(): Promise<void> {
  try {
    const allTasks = await getAllTasks();
    const cutoff = Date.now() - MS_24H;

    const recentLibrarianTask = allTasks.find(
      (t) =>
        t.agent === 'librarian' &&
        t.task === 'audit' &&
        new Date(t.createdAt).getTime() > cutoff,
    );

    if (recentLibrarianTask) {
      console.log(
        `[capture] 📚 Librarian audit already queued/run recently ` +
        `(task ${recentLibrarianTask.id}, status: ${recentLibrarianTask.status}) — skipping.`,
      );
      return;
    }

    console.log('[capture] 📚 No librarian audit in last 24h — enqueuing librarian/audit');
    await safeEnqueue('librarian', 'audit', {
      trigger: 'daily-capture-check',
      queuedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('[capture] Could not check librarian queue:', err);
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
