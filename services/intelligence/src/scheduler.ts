import cron from 'node-cron';
import { runCapture } from './jobs/capture.js';
import { runPropagate } from './jobs/propagate.js';
import { runImprove } from './jobs/improve.js';
import { runCleanup } from './jobs/cleanup.js';
import { runOrganize } from './jobs/organize.js';
import { runSynthesize } from './jobs/synthesize.js';
import { runToolMonitor } from './jobs/tool-monitor.js';
import { runWatchdog } from './jobs/watchdog.js';
import { runScribe } from './jobs/scribe.js';
import { runOperator } from './jobs/operator.js';

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

  // --- Cleanup: every Sunday at 6:00 AM CST ---
  cron.schedule(
    '0 6 * * 0',
    safeRun('cleanup', runCleanup),
    { timezone: TIMEZONE },
  );

  // --- Organize: daily at 11:00 PM CST ---
  cron.schedule(
    '0 23 * * *',
    safeRun('organize', runOrganize),
    { timezone: TIMEZONE },
  );

  // --- Synthesize: every 5 days at 7:00 AM CST ---
  cron.schedule(
    '0 7 */5 * *',
    safeRun('synthesize', runSynthesize),
    { timezone: TIMEZONE },
  );

  // --- Tool Monitor: daily at 6:05 AM CST (5 min after propagate to avoid race) ---
  cron.schedule(
    '5 6 * * *',
    safeRun('tool-monitor', runToolMonitor),
    { timezone: TIMEZONE },
  );

  // --- Watchdog: every 10 minutes ---
  cron.schedule(
    '*/10 * * * *',
    safeRun('watchdog', runWatchdog),
    { timezone: TIMEZONE },
  );

  // --- Scribe: daily at midnight CST ---
  cron.schedule(
    '0 0 * * *',
    safeRun('scribe', runScribe),
    { timezone: TIMEZONE },
  );

  // --- Operator: every minute — self-healing agent ---
  cron.schedule(
    '* * * * *',
    safeRun('operator', runOperator),
    { timezone: TIMEZONE },
  );

  console.log('[scheduler] Jobs registered:');
  console.log('  ✓ capture      — every 5 minutes');
  console.log('  ✓ propagate    — daily at 6:00 AM CST');
  console.log('  ✓ improve      — every Monday at 6:00 AM CST');
  console.log('  ✓ cleanup      — every Sunday at 6:00 AM CST');
  console.log('  ✓ organize     — daily at 11:00 PM CST');
  console.log('  ✓ synthesize   — every 5 days at 7:00 AM CST');
  console.log('  ✓ tool-monitor — daily at 6:05 AM CST');
  console.log('  ✓ watchdog     — every 10 minutes');
  console.log('  ✓ scribe       — daily at midnight CST');
  console.log('  ✓ operator     — every minute (self-healing)');
}

// ---------------------------------------------------------------------------
// Manual trigger — allows running a specific job immediately via env var
// Useful for testing on Railway: set RUN_JOB=capture|propagate|improve|cleanup|organize|synthesize|watchdog|scribe|operator
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
    case 'cleanup':
      await runCleanup();
      break;
    case 'organize':
      await runOrganize();
      break;
    case 'synthesize':
      await runSynthesize();
      break;
    case 'tool-monitor':
      await runToolMonitor();
      break;
    case 'watchdog':
      await runWatchdog();
      break;
    case 'scribe':
      await runScribe();
      break;
    case 'operator':
      await runOperator();
      break;
    default:
      throw new Error(
        `Unknown job: ${jobName}. Valid values: capture, propagate, improve, cleanup, organize, synthesize, tool-monitor, watchdog, scribe, operator`,
      );
  }
}
