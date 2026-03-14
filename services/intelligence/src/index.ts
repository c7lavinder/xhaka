// ---------------------------------------------------------------------------
// Xhaka Intelligence Service — entry point
// ---------------------------------------------------------------------------

import http from 'http';
import { startScheduler, runJobNow, catchUpMissedJobs, recoverStuckJobs } from './scheduler.js';
import { runStartupChecks } from './utils/startup-checks.js';
import { enqueue } from './utils/task-queue.js';
import { getRecentCommits } from './lib/github.js';

// ---------------------------------------------------------------------------
// Env validation
// ---------------------------------------------------------------------------

const REQUIRED_ENV: string[] = [
  'GITHUB_TOKEN',
  'GITHUB_REPO',
  'OPENAI_API_KEY',
];

function validateEnv(): void {
  const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
  if (missing.length) {
    console.error('[startup] Missing required environment variables:', missing.join(', '));
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// Health check server (Railway requires a port to stay alive)
// ---------------------------------------------------------------------------

function startHealthServer(): void {
  const port = parseInt(process.env.PORT ?? '3000', 10);

  const server = http.createServer((req, res) => {
    if (req.url === '/health' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }));
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  });

  server.listen(port, () => {
    console.log(`[startup] Health server listening on port ${port}`);
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log('='.repeat(60));
  console.log('  Xhaka Intelligence Service');
  console.log(`  Started: ${new Date().toISOString()}`);
  console.log('='.repeat(60));

  validateEnv();

  // Start health check server FIRST so Railway can always reach the container
  startHealthServer();

  // Validate external API credentials before starting
  await runStartupChecks();

  // Support immediate job run via RUN_JOB env var (for testing / one-shots)
  const runJob = process.env.RUN_JOB;
  if (runJob) {
    console.log(`[startup] RUN_JOB=${runJob} — running immediately then exiting.`);
    await runJobNow(runJob);
    process.exit(0);
  }

  // Reset any jobs that were stuck "running" when the service last crashed
  await recoverStuckJobs();

  // Register all scheduled jobs
  startScheduler();

  // Catch up any jobs that were missed during downtime
  await catchUpMissedJobs();

  // ── On-Call: Enqueue Auditor for any recent code changes ──────────────────
  // This runs on every deploy — if code changed in the last 2 hours, the Auditor
  // picks it up from the queue and verifies the build.
  await enqueueAuditorForRecentCommits();

  console.log('[startup] Service is running. Waiting for scheduled jobs...');
}

// ---------------------------------------------------------------------------
// Post-deploy auditor trigger
// Enqueues an Auditor task for the most recent commit on startup.
// The Dispatcher will pick it up within 1 minute of boot.
// ---------------------------------------------------------------------------

async function enqueueAuditorForRecentCommits(): Promise<void> {
  try {
    const repo = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';
    const since = new Date(Date.now() - 2 * 60 * 60 * 1000); // last 2 hours
    const commits = await getRecentCommits(repo, since);

    if (commits.length === 0) {
      console.log('[startup] No recent commits — Auditor not triggered.');
      return;
    }

    const latest = commits[0];
    console.log(`[startup] Code change detected: ${latest.sha.slice(0, 8)} — "${latest.message}"`);

    await enqueue('auditor', 'verify-build', {
      commitSha: latest.sha.slice(0, 8),
      commitMessage: latest.message,
      author: latest.author,
      triggeredAt: new Date().toISOString(),
    });

    console.log('[startup] ✅ Auditor task enqueued for recent commit.');
  } catch (err) {
    // Non-fatal — don't block startup
    console.warn('[startup] Could not enqueue Auditor task:', err);
  }
}

main().catch((err) => {
  console.error('[startup] Fatal error:', err);
  process.exit(1);
});
