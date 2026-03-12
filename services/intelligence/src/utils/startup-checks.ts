// utils/startup-checks.ts
// Validates all external API credentials on service startup.
// Runs all checks regardless of individual failures (no short-circuit).
// Called in index.ts before startScheduler().

import { sendAlert } from './alert.js';
import { getFileContent, updateFile, createFile } from '../lib/github.js';

const REPO = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';
const STARTUP_LOG_PATH = 'data/startup-errors.log';

// ─── Types ───────────────────────────────────────────────────────────────────

interface CheckResult {
  service: string;
  ok: boolean;
  message: string;
}

// ─── Individual Checks ───────────────────────────────────────────────────────

async function checkGitHub(): Promise<CheckResult> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';

  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (res.status === 401) {
      return { service: 'GitHub', ok: false, message: '🚨 GitHub token expired or invalid (401)' };
    }
    if (res.status === 403) {
      return { service: 'GitHub', ok: false, message: '🚨 GitHub token forbidden (403) — check permissions' };
    }
    if (res.status === 404) {
      return { service: 'GitHub', ok: false, message: '🚨 GitHub repo not found — check GITHUB_REPO' };
    }
    if (!res.ok) {
      return { service: 'GitHub', ok: false, message: `🚨 GitHub API error: ${res.status}` };
    }
    return { service: 'GitHub', ok: true, message: 'GitHub ✓' };
  } catch (err) {
    return { service: 'GitHub', ok: false, message: `🚨 GitHub network error: ${(err as Error).message}` };
  }
}

async function checkTelegram(): Promise<CheckResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    return { service: 'Telegram', ok: false, message: '⚠️ TELEGRAM_BOT_TOKEN not set' };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getMe`, {
      method: 'POST',
    });

    if (res.status === 401) {
      // Can't alert via Telegram if Telegram is broken — log to file instead
      return { service: 'Telegram', ok: false, message: '⚠️ Telegram token invalid or revoked (401)' };
    }
    if (!res.ok) {
      return { service: 'Telegram', ok: false, message: `⚠️ Telegram API error: ${res.status}` };
    }
    return { service: 'Telegram', ok: true, message: 'Telegram ✓' };
  } catch (err) {
    return { service: 'Telegram', ok: false, message: `⚠️ Telegram network error: ${(err as Error).message}` };
  }
}

async function checkOpenAI(): Promise<CheckResult> {
  const key = process.env.OPENAI_API_KEY;

  if (!key) {
    return { service: 'OpenAI', ok: false, message: '🚨 OPENAI_API_KEY not set' };
  }

  try {
    const res = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${key}` },
    });

    if (res.status === 401) {
      return { service: 'OpenAI', ok: false, message: '🚨 OpenAI API key invalid or revoked' };
    }
    if (res.status === 429) {
      return { service: 'OpenAI', ok: false, message: '🚨 OpenAI credits exhausted or rate limited' };
    }
    if (!res.ok) {
      return { service: 'OpenAI', ok: false, message: `🚨 OpenAI API error: ${res.status}` };
    }
    return { service: 'OpenAI', ok: true, message: 'OpenAI ✓' };
  } catch (err) {
    return { service: 'OpenAI', ok: false, message: `🚨 OpenAI network error: ${(err as Error).message}` };
  }
}

async function checkRailway(): Promise<CheckResult> {
  const token = process.env.RAILWAY_API_TOKEN;

  if (!token) {
    // Non-fatal — Railway token is optional for read-only checks
    return { service: 'Railway', ok: true, message: 'Railway token not set — skipping (non-fatal)' };
  }

  try {
    const res = await fetch('https://backboard.railway.app/graphql/v2', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: '{ me { id } }' }),
    });

    if (!res.ok) {
      return { service: 'Railway', ok: false, message: `⚠️ Railway API error: ${res.status} (non-fatal)` };
    }
    return { service: 'Railway', ok: true, message: 'Railway ✓' };
  } catch (err) {
    return { service: 'Railway', ok: false, message: `⚠️ Railway network error: ${(err as Error).message} (non-fatal)` };
  }
}

// ─── Log to GitHub File ──────────────────────────────────────────────────────

async function logToStartupErrorsFile(message: string): Promise<void> {
  try {
    const entry = `[${new Date().toISOString()}] ${message}\n`;
    const file = await getFileContent(REPO, STARTUP_LOG_PATH);
    
    if (file?.sha) {
      await updateFile(REPO, STARTUP_LOG_PATH, file.content + entry, 'chore: startup error log', file.sha);
    } else {
      await createFile(REPO, STARTUP_LOG_PATH, entry, 'chore: startup error log init');
    }
  } catch {
    console.error('[startup-checks] Could not write startup-errors.log to GitHub');
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

export async function runStartupChecks(): Promise<void> {
  console.log('[startup-checks] Running credential validation...');

  // Run ALL checks — don't short-circuit
  const results = await Promise.allSettled([
    checkGitHub(),
    checkTelegram(),
    checkOpenAI(),
    checkRailway(),
  ]);

  const checks: CheckResult[] = results.map((r) =>
    r.status === 'fulfilled'
      ? r.value
      : { service: 'unknown', ok: false, message: `Check threw: ${(r.reason as Error).message}` }
  );

  const failures = checks.filter((c) => !c.ok);
  const telegramOk = checks.find((c) => c.service === 'Telegram')?.ok ?? false;

  // Log all results
  for (const check of checks) {
    if (check.ok) {
      console.log(`[startup-checks] ✓ ${check.message}`);
    } else {
      console.error(`[startup-checks] ✗ ${check.message}`);
    }
  }

  if (failures.length === 0) {
    console.log('[startup-checks] All checks passed ✓');
    return;
  }

  // Non-Telegram failures: attempt Telegram alert (if Telegram is working)
  for (const failure of failures) {
    if (failure.service === 'Telegram') {
      // Can't send Telegram alert — write to GitHub file
      await logToStartupErrorsFile(failure.message);
      console.error('[startup-checks] Telegram failure logged to startup-errors.log');
    } else if (telegramOk) {
      // Alert via Telegram for non-Telegram failures
      try {
        await sendAlert(`🚨 *Startup Check Failed*\n${failure.message}`);
      } catch {
        console.error('[startup-checks] Could not send Telegram alert');
      }
    } else {
      // Both Telegram and this service are down — log to file
      await logToStartupErrorsFile(failure.message);
      console.error(`[startup-checks] Could not alert for: ${failure.message} (Telegram also down)`);
    }
  }
}
