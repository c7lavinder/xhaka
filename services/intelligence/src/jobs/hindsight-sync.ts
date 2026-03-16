// services/intelligence/src/jobs/hindsight-sync.ts
// Pushes today's session results to Hindsight for episodic memory storage.
// Hindsight auto-extracts facts, entities, relationships via gpt-4o-mini.
// Runs daily at 11 PM CST — after all other jobs have run.
//
// NOTE: Hindsight service not yet deployed. Gracefully no-ops until
// HINDSIGHT_URL env var is set and the service is live.

import { getFileContent } from '../lib/github.js';
import { markJobStart, markJobSuccess, markJobFailed } from '../utils/job-registry.js';

const HINDSIGHT_URL = process.env.HINDSIGHT_URL;
const REPO = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';

interface HindsightMemory {
  source: string;
  content: string;
  timestamp: string;
  tags: string[];
}

export async function runHindsightSync(): Promise<string> {
  const start = await markJobStart('hindsight-sync');

  try {
    // Guard: skip gracefully if Hindsight not configured
    if (!HINDSIGHT_URL) {
      console.log('[hindsight-sync] HINDSIGHT_URL not set — skipping (service not yet deployed)');
      await markJobSuccess('hindsight-sync', start, { notes: 'skipped: HINDSIGHT_URL not configured' });
      return 'hindsight-sync: skipped — HINDSIGHT_URL not set';
    }

    const today = new Date().toISOString().split('T')[0];

    // Pull today's session captures from data/results.tsv
    const resultsFile = await getFileContent(REPO, 'data/results.tsv').catch(() => null);

    if (!resultsFile?.content) {
      console.log('[hindsight-sync] results.tsv not found or empty — nothing to sync');
      await markJobSuccess('hindsight-sync', start, { notes: 'no results to sync' });
      return 'hindsight-sync: no results.tsv to read';
    }

    // Parse TSV rows — filter for today's entries
    const rows = resultsFile.content.split('\n').filter((r: string) => r.trim() && r.includes(today));

    if (rows.length === 0) {
      console.log(`[hindsight-sync] No entries for ${today} — skipping`);
      await markJobSuccess('hindsight-sync', start, { notes: `no entries for ${today}` });
      return `hindsight-sync: no entries for ${today}`;
    }

    console.log(`[hindsight-sync] Syncing ${rows.length} entries to Hindsight...`);

    // Build memory payloads
    const memories: HindsightMemory[] = rows.map((row: string) => {
      const cols = row.split('\t');
      return {
        source: 'xhaka-intelligence',
        content: cols.slice(2).join(' ').trim() || row,
        timestamp: cols[0] ?? new Date().toISOString(),
        tags: [cols[1] ?? 'general'],
      };
    });

    // POST each memory to Hindsight, non-fatal on individual failures
    let synced = 0;
    for (const memory of memories) {
      try {
        const response = await fetch(`${HINDSIGHT_URL}/api/memories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(memory),
          signal: AbortSignal.timeout(10_000),
        });
        if (response.ok) {
          synced++;
        } else {
          console.warn(`[hindsight-sync] POST returned ${response.status} — skipping entry`);
        }
      } catch (postErr) {
        console.warn('[hindsight-sync] POST error (non-fatal):', postErr instanceof Error ? postErr.message : postErr);
      }
    }

    console.log(`[hindsight-sync] Synced ${synced}/${memories.length} memories`);
    await markJobSuccess('hindsight-sync', start, { notes: `synced=${synced} total=${memories.length}` });
    return `hindsight-sync: ${synced}/${memories.length} memories synced`;

  } catch (err) {
    await markJobFailed('hindsight-sync', start);
    throw err;
  }
}
