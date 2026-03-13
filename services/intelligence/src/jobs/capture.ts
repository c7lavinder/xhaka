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

const XHAKA_REPO = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';
const INBOX_PATH = 'intelligence/inbox';

// ---------------------------------------------------------------------------
// Capture job — polls inbox/, routes items to processed/
// ---------------------------------------------------------------------------

export async function runCapture(): Promise<void> {
  const _startTime = await markJobStart('capture');
  try {
    console.log('[capture] Scanning inbox...');

    const files = await listDirectory(XHAKA_REPO, INBOX_PATH);
    const markdownFiles = files.filter(
      (f) => f.type === 'file' && f.name.endsWith('.md'),
    );

    if (!markdownFiles.length) {
      console.log('[capture] Inbox is empty — nothing to process.');
      await markJobSuccess('capture', _startTime);
      return;
    }

    console.log(`[capture] Found ${markdownFiles.length} file(s) to process.`);

    for (const file of markdownFiles) {
      await processInboxFile(file.path, file.name, file.sha);
    }

    console.log('[capture] Done.');

    await markJobSuccess('capture', _startTime);
  } catch (err) {
    console.error('[capture] Fatal error:', err);
    await markJobFailed('capture', _startTime);
    throw err;
  }
}

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

  const { project, date, tags } = parsed.frontmatter;
  const processedPath = getProcessedPath(fileName, project);

  console.log(
    `[capture] Routing ${fileName} → processed/${project}/ (tags: ${tags.join(', ')})`,
  );

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
