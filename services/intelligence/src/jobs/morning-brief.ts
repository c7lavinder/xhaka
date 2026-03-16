// services/intelligence/src/jobs/morning-brief.ts
// Runs daily at 6:00 AM CST — signal-only brief. Max 15 lines.
// Leads with decisions needed, then alerts, then focus, then one-line status.
// Never throws — if any section fails to load, it's skipped gracefully.

import { getFileContent } from '../lib/github.js';
import { markJobStart, markJobSuccess, markJobFailed } from '../utils/job-registry.js';
import { sendTelegram } from '../utils/notifier.js';
import { getTodayCostEstimate } from '../utils/smart-scheduler.js';

const REPO = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';

// ---------------------------------------------------------------------------
// Helper: open decisions from memory/decisions/key-decisions.md
// ---------------------------------------------------------------------------

async function getOpenDecisions(): Promise<string[]> {
  try {
    const f = await getFileContent(REPO, 'memory/decisions/key-decisions.md');
    if (!f) return [];
    return f.content.split('\n')
      .filter(l => l.includes('PENDING') || l.includes('⏳') || l.includes('waiting on Corey'))
      .map(l => l.replace(/^[#\-\*\s]+/, '').trim())
      .filter(l => l.length > 10)
      .slice(0, 3);
  } catch { return []; }
}

// ---------------------------------------------------------------------------
// Helper: recent failures from data/results.tsv (last 24h)
// ---------------------------------------------------------------------------

async function getAlerts(): Promise<string[]> {
  try {
    const f = await getFileContent(REPO, 'data/results.tsv');
    if (!f) return [];
    const lines = f.content.trim().split('\n').slice(1); // skip header
    const yesterday = Date.now() - 24 * 60 * 60 * 1000;
    const recentFails = lines
      .filter(l => {
        const parts = l.split('\t');
        return parts[2] === 'failed' && new Date(parts[0]).getTime() > yesterday;
      })
      .map(l => {
        const parts = l.split('\t');
        return `${parts[1]} failed at ${new Date(parts[0]).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
      });
    return recentFails.slice(0, 3);
  } catch { return []; }
}

// ---------------------------------------------------------------------------
// Helper: top 3 pending queue items
// ---------------------------------------------------------------------------

async function buildTodaysFocus(): Promise<string | null> {
  try {
    const queueFile = await getFileContent(REPO, 'data/task-queue.json');
    const queue = queueFile ? JSON.parse(queueFile.content) : { tasks: [] };
    const pending = (queue.tasks || []).filter((t: { status: string }) => t.status === 'pending');

    const lines: string[] = ["🎯 *Today's Focus:*"];
    if (pending.length > 0) {
      pending.slice(0, 3).forEach((t: { agent: string; task: string }) => {
        lines.push(`  • ${t.agent}/${t.task}`);
      });
    } else {
      lines.push('  • Queue clear — running autonomously');
    }
    return lines.join('\n');
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Helper: one-line system load
// ---------------------------------------------------------------------------

async function buildSystemLoad(): Promise<string | null> {
  try {
    const queueFile = await getFileContent(REPO, 'data/task-queue.json');
    const queue = queueFile ? JSON.parse(queueFile.content) : { tasks: [] };
    const pending = (queue.tasks || []).filter((t: { status: string }) => t.status === 'pending').length;
    const running = (queue.tasks || []).filter((t: { status: string }) => t.status === 'running').length;
    const loadEmoji = pending > 20 ? '🔴' : pending > 10 ? '🟡' : '🟢';
    return `${loadEmoji} *Status:* ${pending} queued · ${running} running`;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Main runner
// ---------------------------------------------------------------------------

export async function runMorningBrief(): Promise<void> {
  const startTime = await markJobStart('morning-brief');

  console.log('[morning-brief] Running...');

  try {
    const [openDecisions, alerts, focus, load] = await Promise.all([
      getOpenDecisions(),
      getAlerts(),
      buildTodaysFocus(),
      buildSystemLoad(),
    ]);

    const costData = await getTodayCostEstimate().catch(() => ({ totalUsd: 0, jobCount: 0 }));

    // NEW FORMAT — tight, signal-only
    const sections: string[] = [];

    // Header
    sections.push(`🌅 *Morning Brief — ${new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}*`);
    sections.push('');

    // 1. DECISIONS NEEDED
    if (openDecisions.length > 0) {
      sections.push('🔴 *Decisions Needed:*');
      openDecisions.forEach(d => sections.push(`  • ${d}`));
      sections.push('');
    }

    // 2. ALERTS
    if (alerts.length > 0) {
      sections.push('⚠️ *Alerts:*');
      alerts.forEach(a => sections.push(`  • ${a}`));
      sections.push('');
    }

    // 3. TODAY'S FOCUS
    if (focus) {
      sections.push(focus);
      sections.push('');
    }

    // 4. SYSTEM STATUS (one line)
    if (load) sections.push(load);

    // 5. COST (one line)
    if (costData.jobCount > 0) {
      sections.push(`💰 *Est. cost today:* ~$${costData.totalUsd}`);
    }

    let message = sections.join('\n');

    // Enforce Telegram 4096-char limit
    if (message.length > 4096) {
      message = message.slice(0, 4080) + '\n…[truncated]';
    }

    await sendTelegram(message);
    console.log('[morning-brief] ✓ Brief sent');

    await markJobSuccess('morning-brief', startTime);
  } catch (err) {
    console.error('[morning-brief] Fatal error:', (err as Error).message);
    await markJobFailed('morning-brief', startTime);
  }
}
