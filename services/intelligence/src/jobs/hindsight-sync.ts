// services/intelligence/src/jobs/hindsight-sync.ts
// Pushes today's session summary to Hindsight for episodic memory storage.
// Hindsight auto-extracts facts, entities, relationships via gpt-4o-mini.
// Runs daily at 11 PM CST — after all other jobs have run.

import { markJobStart, markJobSuccess, markJobFailed } from '../utils/job-registry.js';

const HINDSIGHT_URL = process.env.HINDSIGHT_URL ?? 'http://localhost:3200';

export async function runHindsightSync(): Promise<string> {
  const start = markJobStart('hindsight-sync');
  try {
    // TODO: pull today's session captures from data/results.tsv
    // TODO: POST to Hindsight /api/memories endpoint
    // TODO: log extracted entities count
    
    console.log('[hindsight-sync] stub — Hindsight not yet wired');
    await markJobSuccess('hindsight-sync', start, { notes: 'stub' });
    return 'hindsight-sync: stub complete';
  } catch (err) {
    await markJobFailed('hindsight-sync', start);
    throw err;
  }
}
