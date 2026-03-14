// services/intelligence/src/jobs/behavior-sync.ts
// Runs daily at 5:50 AM CST — 10 minutes before morning brief.
// Reads approved changes, learnings, and pattern reports from the last 7 days.
// Synthesizes them into concrete behavioral rules and appends to LEARNINGS.md.
// Sends Telegram alert only when HIGH-priority rules are generated.
// Never throws — any failure is logged and swallowed.

import { getFileContent, listDirectory, updateFile } from '../lib/github.js';
import { synthesize } from '../lib/openai.js';
import { markJobStart, markJobSuccess, markJobFailed } from '../utils/job-registry.js';
import { checkEnv, warnMissingEnv } from '../utils/env-check.js';
import { sendTelegram } from '../utils/notifier.js';

const REPO = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';
const REQUIRED_ENV = ['GITHUB_TOKEN', 'OPENAI_API_KEY'];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function todayCST(): string {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'America/Chicago',
  }).replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$1-$2');
}

function sevenDaysAgo(): Date {
  return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
}

/** Read all files in a directory that were modified in the last 7 days (best-effort). */
async function readRecentFiles(dirPath: string, maxFiles = 10): Promise<string> {
  try {
    const files = await listDirectory(REPO, dirPath);
    if (!files.length) return '';

    const cutoff = sevenDaysAgo();
    const recent = files
      .filter((f) => f.type === 'file')
      .slice(0, maxFiles); // cap to avoid token blowout

    const contents: string[] = [];

    for (const f of recent) {
      try {
        const data = await getFileContent(REPO, f.path);
        if (!data?.content) continue;

        // Use filename date heuristic to filter recency (YYYY-MM-DD prefix)
        const dateMatch = f.name.match(/^(\d{4}-\d{2}-\d{2})/);
        if (dateMatch) {
          const fileDate = new Date(dateMatch[1]);
          if (fileDate < cutoff) continue;
        }

        contents.push(`--- ${f.path} ---\n${data.content.slice(0, 2000)}`);
      } catch {
        // skip unreadable files silently
      }
    }

    return contents.join('\n\n');
  } catch {
    return '';
  }
}

/** Read a single file, return empty string on any failure. */
async function readFileSafe(path: string, maxChars = 4000): Promise<string> {
  try {
    const data = await getFileContent(REPO, path);
    return data?.content?.slice(0, maxChars) ?? '';
  } catch {
    return '';
  }
}

/** Check whether rules string contains HIGH-priority signals. */
function isHighPriority(rules: string): boolean {
  return /\[HIGH\]/i.test(rules) || /high.priority/i.test(rules);
}

// ---------------------------------------------------------------------------
// Core job
// ---------------------------------------------------------------------------

export async function runBehaviorSync(): Promise<void> {
  const _startTime = await markJobStart('behavior-sync');

  try {
    console.log('[behavior-sync] Starting knowledge→behavior sync...');

    // --- Env check ---
    const { ok, missing } = checkEnv(REQUIRED_ENV);
    if (!ok) {
      warnMissingEnv('behavior-sync', missing);
      await markJobSuccess('behavior-sync', _startTime); // missing config ≠ job failure
      return;
    }

    // --- Gather inputs ---
    console.log('[behavior-sync] Reading approved changes (last 7 days)...');
    const approvedChanges = await readRecentFiles('intelligence/proposed-changes/approved', 8);

    console.log('[behavior-sync] Reading LEARNINGS.md...');
    const learnings = await readFileSafe('memory/LEARNINGS.md', 5000);

    console.log('[behavior-sync] Reading pattern reports (last 7 days)...');
    const patterns = await readRecentFiles('intelligence/patterns', 5);

    const hasInput = approvedChanges || learnings || patterns;
    if (!hasInput) {
      console.log('[behavior-sync] No inputs found — nothing to synthesize. Exiting.');
      await markJobSuccess('behavior-sync', _startTime);
      return;
    }

    // --- Build prompt ---
    const userPrompt = [
      approvedChanges
        ? `## Approved Changes (last 7 days)\n${approvedChanges}`
        : '',
      learnings
        ? `## Recent Learnings\n${learnings.slice(-3000)}`
        : '',
      patterns
        ? `## Pattern Reports\n${patterns}`
        : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    // --- Call OpenAI ---
    console.log('[behavior-sync] Synthesizing behavioral rules...');
    const rules = await synthesize(
      `You are a behavioral architect for an AI system called Xhaka.
Your job: given approved changes, learnings, and pattern reports, write 3-5 specific behavioral rules that Xhaka should follow in conversations.
Format each rule as: "- [RULE]: [description]"
If a rule is especially important, prefix it with [HIGH]: "- [HIGH][RULE]: [description]"
Be concrete and specific — not generic platitudes.
Output ONLY the rules. No preamble, no explanation.`,
      userPrompt,
      600,
    );

    if (!rules?.trim()) {
      console.warn('[behavior-sync] OpenAI returned empty rules — skipping append.');
      await markJobSuccess('behavior-sync', _startTime);
      return;
    }

    console.log(`[behavior-sync] Generated ${rules.split('\n').filter((l) => l.trim().startsWith('-')).length} rules.`);

    // --- Append to LEARNINGS.md ---
    const today = todayCST();
    const section = `\n\n## Auto-Generated Rules (${today})\n\n${rules.trim()}\n`;

    const learningsFile = await getFileContent(REPO, 'memory/LEARNINGS.md');
    if (!learningsFile) {
      console.warn('[behavior-sync] LEARNINGS.md not found — cannot append rules.');
      await markJobFailed('behavior-sync', _startTime);
      return;
    }

    const updatedContent = learningsFile.content + section;

    await updateFile(
      REPO,
      'memory/LEARNINGS.md',
      updatedContent,
      `chore(behavior-sync): append auto-generated rules ${today}`,
      learningsFile.sha,
    );

    console.log('[behavior-sync] Rules appended to LEARNINGS.md successfully.');

    // --- Alert only on HIGH-priority rules ---
    if (isHighPriority(rules)) {
      const highLines = rules
        .split('\n')
        .filter((l) => /\[HIGH\]/i.test(l))
        .join('\n');
      await sendTelegram(
        `🧠 *Behavior Sync — HIGH Priority Rules Generated (${today})*\n\n${highLines}\n\n_Full rules appended to memory/LEARNINGS.md_`,
      );
      console.log('[behavior-sync] Telegram alert sent for HIGH-priority rules.');
    }

    await markJobSuccess('behavior-sync', _startTime);
    console.log('[behavior-sync] Done.');
  } catch (err) {
    // Never throws — swallow and log
    console.error('[behavior-sync] Error (swallowed):', (err as Error).message);
    try {
      await markJobFailed('behavior-sync', _startTime);
    } catch {
      // ignore registry failure
    }
  }
}
