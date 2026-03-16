import cron from 'node-cron';
import { runCapture } from './jobs/capture.js';
import { runPropagate } from './jobs/propagate.js';
import { runImprove } from './jobs/improve.js';
import { runCleanup } from './jobs/cleanup.js';
import { runOrganize } from './jobs/organize.js';
import { runSynthesize } from './jobs/synthesize.js';
import { runToolMonitor } from './jobs/tool-monitor.js';
import { runWatchdog, runWeeklyHeartbeat } from './jobs/watchdog.js';
import { runScribe } from './jobs/scribe.js';
import { runOperator } from './jobs/operator.js';
import { runDailyLog } from './jobs/daily-log.js';
import { runResearcher } from './jobs/researcher.js';
// proactiveScan stub — function referenced in schedule but not yet implemented in researcher.ts
async function proactiveScan(): Promise<void> {
  console.log('[proactive-scan] Not yet implemented — skipping.');
}
import { runFeedback } from './jobs/feedback.js';
import { runInspect } from './jobs/inspect.js';
import { runRoutingReview } from './jobs/routing-review.js';
import { runMorningBrief } from './jobs/morning-brief.js';
import { runAgentScorecard } from './jobs/agent-scorecard.js';
import { runHeartbeatCheck } from './jobs/heartbeat-check.js';
import { runBehaviorSync } from './jobs/behavior-sync.js';
import { runChangeEvaluator } from './jobs/change-evaluator.js';
import { runBenchmark } from './jobs/benchmark.js';
import { runPreDeployTestJob } from './jobs/pre-deploy-test.js';
import { runPatternMiner } from './jobs/pattern-miner.js';
import { runDispatcher } from './jobs/dispatcher.js';
import { getFileContent } from './lib/github.js';
import { getJobTimeout, markJobFailed } from './utils/job-registry.js';

// ---------------------------------------------------------------------------
// Scheduler — registers all cron jobs
// ---------------------------------------------------------------------------

const TIMEZONE = 'America/Chicago';
const REPO = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';

// Jobs excluded from catch-up (high-frequency or already self-recovering)
const CATCHUP_EXCLUDED = new Set(['operator', 'watchdog', 'capture', 'dispatcher', 'researcher', 'daily-log', 'feedback', 'inspect', 'routing-review', 'morning-brief', 'heartbeat-check', 'pre-deploy-test', 'benchmark', 'proactive-scan', 'agent-scorecard', 'behavior-sync', 'change-evaluator', 'pattern-miner']);

// ---------------------------------------------------------------------------
// Hard runtime kill switch — races job fn against a deadline timer
// ---------------------------------------------------------------------------

async function runWithTimeout<T>(fn: () => Promise<T>, jobName: string): Promise<T> {
  const timeout = getJobTimeout(jobName);
  return Promise.race([
    fn(),
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Job ${jobName} exceeded timeout of ${timeout}ms`)),
        timeout,
      )
    ),
  ]);
}

function safeRun(
  jobName: string,
  fn: () => Promise<void>,
): () => void {
  return () => {
    const startTime = Date.now();
    console.log(`[scheduler] Triggering job: ${jobName}`);
    runWithTimeout(fn, jobName).catch((err) => {
      console.error(`[scheduler] Job ${jobName} failed:`, err);
      markJobFailed(jobName, startTime).catch(() => { /* best effort */ });
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

  // --- Organize: daily at 3:00 AM CDT (fallback — dispatcher is primary) ---
  cron.schedule(
    '0 3 * * *',
    safeRun('organize', runOrganize),
    { timezone: TIMEZONE },
  );

  // --- Synthesize: fixed dates to avoid month-boundary gaps ---
  // FIX 4: Changed from '0 7 */5 * *' to explicit dates
  cron.schedule(
    '0 7 1,6,11,16,21,26 * *',
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

  // --- Weekly Heartbeat: every Monday at 8:00 AM CST ---
  cron.schedule(
    '0 8 * * 1',
    safeRun('watchdog-heartbeat', runWeeklyHeartbeat),
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

  // --- Dispatcher: every 5 minutes — primary queue-first engine ---
  cron.schedule(
    '*/5 * * * *',
    safeRun('dispatcher', runDispatcher),
    { timezone: TIMEZONE },
  );

  // --- Daily Log Writer: every 6 hours ---
  cron.schedule(
    '0 */6 * * *',
    safeRun('daily-log', runDailyLog),
    { timezone: TIMEZONE },
  );

  // --- Researcher: daily at 3:00 AM CDT (fallback — dispatcher is primary) ---
  cron.schedule(
    '0 3 * * *',
    safeRun('researcher', runResearcher),
    { timezone: TIMEZONE },
  );

  // --- Feedback: daily at 8:00 AM CST ---
  cron.schedule(
    '0 8 * * *',
    safeRun('feedback', runFeedback),
    { timezone: TIMEZONE },
  );

  // --- Inspect: every Monday at 7:00 AM CST (before improve) ---
  cron.schedule(
    '0 7 * * 1',
    safeRun('inspect', runInspect),
    { timezone: TIMEZONE },
  );

  // --- Routing Review: every Sunday at 7:00 AM CST ---
  cron.schedule(
    '0 7 * * 0',
    safeRun('routing-review', runRoutingReview),
    { timezone: TIMEZONE },
  );

  // --- Morning Brief: daily at 6:00 AM CST ---
  cron.schedule(
    '0 6 * * *',
    safeRun('morning-brief', runMorningBrief),
    { timezone: TIMEZONE },
  );

  // --- Proactive Scan: every Friday at 6:00 AM CST ---
  cron.schedule(
    '0 6 * * 5',
    safeRun('proactive-scan', proactiveScan),
    { timezone: TIMEZONE },
  );

  // --- Agent Scorecard: every Sunday at 8:00 AM CST ---
  cron.schedule(
    '0 8 * * 0',
    safeRun('agent-scorecard', runAgentScorecard),
    { timezone: TIMEZONE },
  );

  // --- Heartbeat Check: every 30 minutes — active system monitor ---
  cron.schedule(
    '*/30 * * * *',
    safeRun('heartbeat-check', runHeartbeatCheck),
    { timezone: TIMEZONE },
  );

  // --- Behavior Sync: daily at 5:50 AM CST (10 min before morning brief) ---
  cron.schedule(
    '50 5 * * *',
    safeRun('behavior-sync', runBehaviorSync),
    { timezone: TIMEZONE },
  );

  // --- Change Evaluator: daily at 9:00 AM CST (15:00 UTC) ---
  cron.schedule(
    '0 15 * * *',
    safeRun('change-evaluator', runChangeEvaluator),
    { timezone: TIMEZONE },
  );

  // --- Benchmark: every Wednesday at 6:00 AM CST ---
  cron.schedule(
    '0 6 * * 3',
    safeRun('benchmark', runBenchmark),
    { timezone: TIMEZONE },
  );

  // --- Pattern Miner: every Thursday at 6:00 AM CST ---
  cron.schedule(
    '0 6 * * 4',
    safeRun('pattern-miner', runPatternMiner),
    { timezone: TIMEZONE },
  );

  console.log('[scheduler] Jobs registered:');
  console.log('  ✓ capture          — every 5 minutes');
  console.log('  ✓ propagate        — daily at 6:00 AM CST');
  console.log('  ✓ improve          — every Monday at 6:00 AM CST');
  console.log('  ✓ cleanup          — every Sunday at 6:00 AM CST');
  console.log('  ✓ organize         — daily at 3:00 AM CDT (fallback)');
  console.log('  ✓ synthesize       — 1st,6th,11th,16th,21st,26th at 7:00 AM CST');
  console.log('  ✓ tool-monitor     — daily at 6:05 AM CST');
  console.log('  ✓ watchdog         — every 10 minutes');
  console.log('  ✓ weekly-heartbeat — every Monday at 8:00 AM CST');
  console.log('  ✓ scribe           — daily at midnight CST');
  console.log('  ✓ operator         — every minute (self-healing)');
  console.log('  ✓ dispatcher       — every 5 minutes (primary queue engine)');
  console.log('  ✓ daily-log        — every 6 hours');
  console.log('  ✓ researcher       — daily at 3:00 AM CDT (fallback)');
  console.log('  ✓ feedback         — daily at 8:00 AM CST');
  console.log('  ✓ inspect          — every Monday at 7:00 AM CST');
  console.log('  ✓ routing-review   — every Sunday at 7:00 AM CST');
  console.log('  ✓ morning-brief    — daily at 6:00 AM CST');
  console.log('  ✓ proactive-scan   — every Friday at 6:00 AM CST');
  console.log('  ✓ agent-scorecard  — every Sunday at 8:00 AM CST');
  console.log('  ✓ heartbeat-check  — every 30 minutes');
  console.log('  ✓ behavior-sync    — daily at 5:50 AM CST');
  console.log('  ✓ change-evaluator — daily at 9:00 AM CST (15:00 UTC)');
  console.log('  ✓ benchmark         — every Wednesday at 6:00 AM CST');
  console.log('  ✓ pre-deploy-test   — manual via RUN_JOB');
  console.log('  ✓ pattern-miner     — every Thursday at 6:00 AM CST');
}

// ---------------------------------------------------------------------------
// Manual trigger — allows running a specific job immediately via env var
// Useful for testing on Railway: set RUN_JOB=capture|propagate|improve|cleanup|organize|synthesize|watchdog|scribe|operator|daily-log|researcher
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
    case 'watchdog-heartbeat':
      await runWeeklyHeartbeat();
      break;
    case 'scribe':
      await runScribe();
      break;
    case 'operator':
      await runOperator();
      break;
    case 'daily-log':
      await runDailyLog();
      break;
    case 'researcher':
      await runResearcher();
      break;
    case 'feedback':
      await runFeedback();
      break;
    case 'inspect':
      await runInspect();
      break;
    case 'routing-review':
      await runRoutingReview();
      break;
    case 'morning-brief':
      await runMorningBrief();
      break;
    case 'proactive-scan':
      await proactiveScan();
      break;
    case 'agent-scorecard':
      await runAgentScorecard();
      break;
    case 'heartbeat-check':
      await runHeartbeatCheck();
      break;
    case 'behavior-sync':
      await runBehaviorSync();
      break;
    case 'change-evaluator':
      await runChangeEvaluator();
      break;
    case 'benchmark':
      await runBenchmark();
      break;
    case 'pre-deploy-test':
      await runPreDeployTestJob();
      break;
    case 'pattern-miner':
      await runPatternMiner();
      break;
    case 'dispatcher':
      await runDispatcher();
      break;
    default:
      throw new Error(
        `Unknown job: ${jobName}. Valid values: capture, propagate, improve, cleanup, organize, synthesize, tool-monitor, watchdog, watchdog-heartbeat, scribe, operator, daily-log, researcher, feedback, inspect, routing-review, morning-brief, heartbeat-check, proactive-scan, agent-scorecard, behavior-sync, change-evaluator, benchmark, pre-deploy-test, pattern-miner, dispatcher`,
      );
  }
}

// ---------------------------------------------------------------------------
// Stale job recovery — resets "running" jobs that exceeded their grace period
// Run this on boot before startScheduler() to unblock crash-stuck jobs
// ---------------------------------------------------------------------------

export async function recoverStuckJobs(): Promise<void> {
  console.log('[scheduler] Checking for stuck jobs...');

  const file = await getFileContent(REPO, 'data/job-registry.json');
  if (!file) {
    console.warn('[scheduler] Could not load job-registry.json for stuck-job recovery');
    return;
  }

  let registry: Record<string, { lastRun: string | null; lastStatus: string | null; gracePeriodMinutes?: number }>;
  try {
    registry = JSON.parse(file.content);
  } catch {
    console.error('[scheduler] job-registry.json parse failed during stuck-job recovery — skipping');
    return;
  }

  const now = Date.now();
  const stuckJobs: string[] = [];

  for (const [jobName, entry] of Object.entries(registry)) {
    if (entry.lastStatus !== 'running') continue;

    const gracePeriodMs = (entry.gracePeriodMinutes ?? 60) * 60 * 1000;
    const lastRun = entry.lastRun ? new Date(entry.lastRun).getTime() : 0;

    if ((now - lastRun) > gracePeriodMs) {
      stuckJobs.push(jobName);
      entry.lastStatus = 'failed';
    }
  }

  if (stuckJobs.length === 0) {
    console.log('[scheduler] No stuck jobs found');
    return;
  }

  console.log(`[scheduler] Resetting ${stuckJobs.length} stuck job(s) to "failed": ${stuckJobs.join(', ')}`);

  const { updateFile } = await import('./lib/github.js');
  await updateFile(
    REPO,
    'data/job-registry.json',
    JSON.stringify(registry, null, 2),
    `chore: reset stuck jobs to failed on boot [${stuckJobs.join(', ')}]`,
    file.sha,
  );

  console.log('[scheduler] Stuck job recovery complete');
}

// ---------------------------------------------------------------------------
// Catch-up — runs missed jobs on boot (FIX 5)
// ---------------------------------------------------------------------------

type RegistryEntry = {
  lastRun: string | null;
  expectedIntervalHours: number;
};

export async function catchUpMissedJobs(): Promise<void> {
  console.log('[scheduler] Checking for missed jobs...');

  const file = await getFileContent(REPO, 'data/job-registry.json');
  if (!file) {
    console.warn('[scheduler] Could not load job-registry.json for catch-up check');
    return;
  }

  let registry: Record<string, RegistryEntry>;
  try {
    registry = JSON.parse(file.content);
  } catch {
    console.error('[scheduler] job-registry.json parse failed during catch-up — skipping');
    return;
  }

  const now = Date.now();
  const missedJobs: string[] = [];

  for (const [jobName, entry] of Object.entries(registry)) {
    if (CATCHUP_EXCLUDED.has(jobName)) continue;

    const thresholdMs = entry.expectedIntervalHours * 1.5 * 60 * 60 * 1000;
    const lastRun = entry.lastRun ? new Date(entry.lastRun).getTime() : 0;
    const overdue = !entry.lastRun || (now - lastRun) > thresholdMs;

    if (overdue) {
      missedJobs.push(jobName);
    }
  }

  if (missedJobs.length === 0) {
    console.log('[scheduler] No missed jobs to catch up');
    return;
  }

  console.log(`[scheduler] Found ${missedJobs.length} missed job(s): ${missedJobs.join(', ')}`);

  for (const jobName of missedJobs) {
    const lastRun = registry[jobName]?.lastRun ?? 'never';
    console.log(`[scheduler] 🔄 Catching up missed job: ${jobName} (last ran: ${lastRun})`);
    
    try {
      await runJobNow(jobName);
    } catch (err) {
      console.error(`[scheduler] Catch-up failed for ${jobName}:`, (err as Error).message);
    }

    // 30-second delay between jobs to avoid hammering APIs
    if (missedJobs.indexOf(jobName) < missedJobs.length - 1) {
      console.log('[scheduler] Waiting 30s before next catch-up job...');
      await new Promise((resolve) => setTimeout(resolve, 30_000));
    }
  }

  console.log('[scheduler] Catch-up check complete');
}
