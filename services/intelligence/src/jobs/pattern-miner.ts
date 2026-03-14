// services/intelligence/src/jobs/pattern-miner.ts
// Weekly job: mines recurring patterns from session transcripts over the last 7 days

import { markJobStart, markJobSuccess, markJobFailed } from '../utils/job-registry.js';
import { getFileContent, listDirectory, createFile, updateFile } from '../lib/github.js';
import { sendTelegram } from '../utils/notifier.js';
import { synthesize } from '../lib/openai.js';

const XHAKA_REPO = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';
const JOB_NAME = 'pattern-miner';

async function createOrUpdateFile(path: string, content: string, message: string): Promise<void> {
  const existing = await getFileContent(XHAKA_REPO, path);
  if (existing) {
    await updateFile(XHAKA_REPO, path, content, message, existing.sha);
  } else {
    await createFile(XHAKA_REPO, path, content, message);
  }
}

export async function runPatternMiner(): Promise<void> {
  const _startTime = await markJobStart(JOB_NAME);
  try {
    const today = new Date().toISOString().split('T')[0];

    // Read recent session captures
    let captures = '';
    try {
      const files = await listDirectory(XHAKA_REPO, 'intelligence/processed/general');
      const cutoff = Date.now() - 7 * 86400000;
      const recentFiles = files
        .filter((f) => f.type === 'file')
        .filter((f) => {
          try {
            const datePart = f.name
              .replace('session-capture-', '')
              .replace('.md', '')
              .replace(/-([0-9]{4})$/, 'T$1');
            return new Date(datePart).getTime() > cutoff;
          } catch {
            return false;
          }
        })
        .slice(0, 10);

      for (const f of recentFiles) {
        try {
          const file = await getFileContent(XHAKA_REPO, `intelligence/processed/general/${f.name}`);
          if (file) captures += file.content + '\n\n---\n\n';
        } catch { /* skip */ }
      }
    } catch { /* skip if directory doesn't exist yet */ }

    if (!captures || captures.length < 100) {
      console.log('[pattern-miner] Not enough capture data — skipping analysis');
      await markJobSuccess(JOB_NAME, _startTime);
      return;
    }

    const analysis = await synthesize(
      'You are an analytical assistant. Analyze session transcripts and identify recurring patterns. Output structured markdown with clear section headers.',
      `Analyze these session transcripts from the past 7 days. Identify:\n1. Recurring topics Corey keeps coming back to\n2. Recurring frustrations or blockers\n3. Decisions that keep getting revisited\n4. Patterns in what gets built vs what stays broken\n\nBe specific. Output as structured markdown with clear section headers.\n\nTranscripts:\n${captures.slice(0, 8000)}`,
      1500,
    );

    await createOrUpdateFile(
      `intelligence/patterns/${today}.md`,
      `# Pattern Report — ${today}\n\n${analysis}`,
      `chore: pattern mining report ${today}`,
    );

    const highSignalCount = (analysis.match(/\*\*|##/g) ?? []).length;
    await sendTelegram(`🔁 Pattern report ready — ${highSignalCount} patterns identified. Check intelligence/patterns/${today}.md`);

    await markJobSuccess(JOB_NAME, _startTime);
  } catch (err: any) {
    await markJobFailed(JOB_NAME, _startTime);
    throw err;
  }
}
