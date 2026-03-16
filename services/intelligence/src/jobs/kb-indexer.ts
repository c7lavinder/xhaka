// services/intelligence/src/jobs/kb-indexer.ts
// Walks memory/context/ on GitHub, embeds new/changed files into Supabase pgvector.
// Runs nightly at 2 AM CST. Skips files with unchanged content hash.

import { getFileContent, listDirectory } from '../lib/github.js';
import { upsertEmbedding } from '../lib/embeddings.js';
import { markJobStart, markJobSuccess, markJobFailed } from '../utils/job-registry.js';

const REPO = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';
const KB_PATHS = ['memory/context', 'memory/decisions', 'memory/people', 'memory/projects'];

export async function runKbIndexer(): Promise<string> {
  const start = await markJobStart('kb-indexer');
  let indexed = 0;
  let skipped = 0;
  try {
    for (const basePath of KB_PATHS) {
      const files = await listDirectory(REPO, basePath).catch(() => []);
      for (const file of files) {
        if (!file.name.endsWith('.md')) { skipped++; continue; }
        try {
          const content = await getFileContent(REPO, file.path);
          if (!content) { skipped++; continue; }
          // Extract frontmatter title/category if present
          const titleMatch = content.content.match(/^title:\s*["']?(.+?)["']?\s*$/m);
          const categoryMatch = content.content.match(/^category:\s*["']?(.+?)["']?\s*$/m);
          await upsertEmbedding(
            file.path,
            content.content,
            titleMatch?.[1] ?? file.name.replace('.md', ''),
            categoryMatch?.[1] ?? basePath.split('/').pop() ?? null,
          );
          indexed++;
        } catch (err) {
          console.warn(`[kb-indexer] skipping ${file.path}:`, err);
          skipped++;
        }
      }
    }
    await markJobSuccess('kb-indexer', start, { notes: `indexed=${indexed} skipped=${skipped}` });
    return `kb-indexer: ${indexed} files indexed, ${skipped} skipped`;
  } catch (err) {
    await markJobFailed('kb-indexer', start);
    throw err;
  }
}
