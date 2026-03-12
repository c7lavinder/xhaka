// ---------------------------------------------------------------------------
// Xhaka Intelligence Service — entry point
// ---------------------------------------------------------------------------

import http from 'http';
import { startScheduler, runJobNow, catchUpMissedJobs } from './scheduler.js';
import { runStartupChecks } from './utils/startup-checks.js';

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

  // Validate external API credentials before starting
  await runStartupChecks();

  // Support immediate job run via RUN_JOB env var (for testing / one-shots)
  const runJob = process.env.RUN_JOB;
  if (runJob) {
    console.log(`[startup] RUN_JOB=${runJob} — running immediately then exiting.`);
    await runJobNow(runJob);
    process.exit(0);
  }

  // Start health check server so Railway doesn't kill the container
  startHealthServer();

  // Register all scheduled jobs
  startScheduler();

  // Catch up any jobs that were missed during downtime
  await catchUpMissedJobs();

  console.log('[startup] Service is running. Waiting for scheduled jobs...');
}

main().catch((err) => {
  console.error('[startup] Fatal error:', err);
  process.exit(1);
});
