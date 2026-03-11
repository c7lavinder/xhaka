import cron from 'node-cron';
import { runCapture } from './jobs/capture.js';
import { runPropagate } from './jobs/propagate.js';
import { runImprove } from './jobs/improve.js';

// ---------------------------------------------------------------------------
// Scheduler — registers all cron jobs
// ---------------------------------------------------------------------------

const TIMEZONE = 'America/Chicago';

function safeRun(
  jobName: string,
  fn: () => Promise<void>,
): () => void {
  return () => {
    console.log(`[scheduler] Triggering job: ${jobName}`);
    fn().catch((err) => {
      console.error(`[scheduler] Job ${jobName} failed:`, err);
    });
  };
}

export function startScheduler(): void {
  // --- Capture: every 5 minutes (near real-time inbox polling) ---
  cron.schedule(
    '*/5 * * * *',
    safeRun('capture', runCapture),
    { timezone: TIMEZONE },
  );

  // --- Propagate: daily at 6:00 AM CST ---
  cron.schedule(
    '0 6 * * *',
    safeRun('propagate', runPropagate),
    { timezone: TIMEZONE },
  );

  // --- Improve: every Monday at 6:00 AM CST ---
  cron.schedule(
    '0 6 * * 1',
    safeRun('improve', runImprove),
    { timezone: TIMEZONE },
  );

  console.log('[scheduler] Jobs registered:');
  console.log('  ✓ capture    — every 5 minutes');
  console.log('  ✓ propagate  — daily at 6:00 AM CST');
  console.log('  ✓ improve    — every Monday at 6:00 AM CST');
}

// ---------------------------------------------------------------------------
// Manual trigger — allows running a specific job immediately via env var
// Useful for testing on Railway: set RUN_JOB=capture|propagate|improve
// ---------------------------------------------------------------------------

export async function runJobNow(jobName: string): Promise<void> {
  switch (jobName) {
    case 'capture':
      await runCapture();
      break;
    case 'propagate':
      await runPropagate();
      break;
    case 'improve':
      await runImprove();
      break;
    default:
      throw new Error(`Unknown job: ${jobName}. Valid values: capture, propagate, improve`);
  }
}
