import {
  getFileContent,
  listDirectory,
  updateFile,
  createFile,
} from '../lib/github.js';
import { synthesize } from '../lib/openai.js';
import { markJobStart, markJobSuccess, markJobFailed } from '../utils/job-registry.js';
import { sendAlert, classifyOpenAIError } from '../utils/alert.js';

const XHAKA_REPO = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';
const DRY_RUN = process.env.DRY_RUN === 'true';

// ---------------------------------------------------------------------------
// Synthesize job — every 5 days: distill recent logs → update MEMORY.md + projects
// ---------------------------------------------------------------------------

function todayDateStr(): string {
  return new Date().toISOString().split('T')[0];
}

function dateNDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

function toSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export async function runSynthesize(): Promise<void> {
  const _startTime = await markJobStart('synthesize');
  try {
    console.log(`[synthesize] Starting synthesis${DRY_RUN ? ' (DRY RUN)' : ''}...`);

    // 1. Collect last 5 days of daily logs
    const recentLogs = await collectRecentLogs(5);
    console.log(`[synthesize] Collected ${recentLogs.length} daily log(s) from last 5 days.`);

    if (recentLogs.length === 0) {
      console.log('[synthesize] No recent logs found — nothing to synthesize.');
    }

    // 2. Read current MEMORY.md
    const memoryFile = await getFileContent(XHAKA_REPO, 'MEMORY.md');
    const currentMemory = memoryFile?.content ?? '';
    console.log(`[synthesize] Current MEMORY.md: ${currentMemory.length} chars.`);

    // 3. Update MEMORY.md via gpt-4o
    await updateMemoryFile(recentLogs, currentMemory, memoryFile?.sha ?? null);

    // 4. Update project files via gpt-4o-mini
    await updateProjectFiles(recentLogs);

    console.log('[synthesize] Done.');

    await markJobSuccess('synthesize', _startTime);
  } catch (err) {
    console.error('[synthesize] Fatal error:', err);
    await markJobFailed('synthesize', _startTime);
    // FIX 6: Send alert for failures
    const alertMsg = (err instanceof Error)
      ? `🚨 *Synthesize failed*\n${classifyOpenAIError(err)}`
      : '🚨 *Synthesize failed* — unknown error';
    await sendAlert(alertMsg);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Collect recent daily logs
// ---------------------------------------------------------------------------

async function collectRecentLogs(days: number): Promise<{ date: string; content: string }[]> {
  const logs: { date: string; content: string }[] = [];

  for (let i = 0; i < days; i++) {
    const date = dateNDaysAgo(i);
    const path = `memory/${date}.md`;
    const file = await getFileContent(XHAKA_REPO, path);
    if (file && file.content.trim()) {
      logs.push({ date, content: file.content });
      console.log(`[synthesize] Found log: ${path}`);
    }
  }

  return logs;
}

// ---------------------------------------------------------------------------
// Update MEMORY.md
// ---------------------------------------------------------------------------

async function updateMemoryFile(
  recentLogs: { date: string; content: string }[],
  currentMemory: string,
  currentSha: string | null,
): Promise<void> {
  const today = todayDateStr();
  const fiveDaysAgo = dateNDaysAgo(5);

  const combinedLogs = recentLogs
    .map((l) => `## Daily Log — ${l.date}\n\n${l.content}`)
    .join('\n\n---\n\n');

  const systemPrompt = `You are Xhaka's memory synthesizer. You maintain MEMORY.md — the central context file for an AI COO assistant serving a wholesale real estate business.

CRITICAL RULES:
1. Return ONLY the complete updated MEMORY.md content — no preamble, no explanation, no markdown code fences
2. Keep the total output UNDER 150 lines
3. Preserve ALL existing section headers and structure
4. Update content within sections — do NOT add or remove headers
5. For ACTIVE PRIORITIES: reflect what matters most RIGHT NOW based on recent logs
6. For KEY DECISIONS: keep only the most recent/relevant decisions (archive older ones by removing them — they're in git history)
7. For SYSTEM section: include any infrastructure/tooling changes from recent logs
8. If a section has no updates from recent logs, preserve it as-is
9. Be concise — every line must earn its place`;

  const userPrompt = `Current MEMORY.md (${currentMemory.length} chars):
${currentMemory.slice(0, 6000)}

---

Recent daily logs (${fiveDaysAgo} to ${today}):
${combinedLogs.slice(0, 10000)}

---

Today's date: ${today}

Synthesize the above into an updated MEMORY.md. Keep it under 150 lines. Return ONLY the file content.`;

  console.log('[synthesize] Calling gpt-4o to update MEMORY.md...');
  const updatedMemory = await synthesize(systemPrompt, userPrompt, 3000);

  if (!updatedMemory.trim()) {
    console.warn('[synthesize] OpenAI returned empty response for MEMORY.md — skipping write.');
    return;
  }

  const lineCount = updatedMemory.split('\n').length;
  console.log(`[synthesize] Updated MEMORY.md: ${lineCount} lines.`);

  if (DRY_RUN) {
    console.log('[synthesize] DRY RUN — would write MEMORY.md');
    console.log('[synthesize] Preview (first 20 lines):');
    console.log(updatedMemory.split('\n').slice(0, 20).join('\n'));
    return;
  }

  if (currentSha) {
    await updateFile(
      XHAKA_REPO,
      'MEMORY.md',
      updatedMemory,
      `memory: synthesize — update MEMORY.md (${today})`,
      currentSha,
    );
  } else {
    await createFile(
      XHAKA_REPO,
      'MEMORY.md',
      updatedMemory,
      `memory: synthesize — create MEMORY.md (${today})`,
    );
  }

  console.log('[synthesize] ✓ MEMORY.md updated.');
}

// ---------------------------------------------------------------------------
// Update project files
// ---------------------------------------------------------------------------

async function updateProjectFiles(
  recentLogs: { date: string; content: string }[],
): Promise<void> {
  const projectEntries = await listDirectory(XHAKA_REPO, 'memory/projects');
  const projectFiles = projectEntries.filter(
    (f) => f.type === 'file' && f.name.endsWith('.md'),
  );

  if (projectFiles.length === 0) {
    console.log('[synthesize] No project files found — skipping project updates.');
    return;
  }

  console.log(`[synthesize] Updating ${projectFiles.length} project file(s)...`);

  const combinedLogs = recentLogs
    .map((l) => `### ${l.date}\n${l.content.slice(0, 1000)}`)
    .join('\n\n');

  const today = todayDateStr();

  for (const projectFile of projectFiles) {
    await updateProjectFile(projectFile.path, projectFile.sha, combinedLogs, today);
  }
}

async function updateProjectFile(
  filePath: string,
  fileSha: string,
  combinedLogs: string,
  today: string,
): Promise<void> {
  const file = await getFileContent(XHAKA_REPO, filePath);
  if (!file) {
    console.warn(`[synthesize] Could not read ${filePath} — skipping.`);
    return;
  }

  const projectName = filePath.split('/').pop()?.replace('.md', '') ?? filePath;

  const systemPrompt = `You are updating a project status file for an AI assistant's memory system.

Given the current project file and recent daily logs, update ONLY the "Status" and "Current State" sections.

Rules:
1. Return the COMPLETE updated file content — no code fences, no explanation
2. Only change the "Status" and "Current State" sections (or add them if missing)
3. Keep all other content exactly as-is
4. Be concise — Status should be 1 line, Current State should be 2-4 sentences max
5. If the recent logs contain no mention of this project, preserve existing content unchanged`;

  const userPrompt = `Project: ${projectName}

Current file content:
${file.content.slice(0, 3000)}

---

Recent logs (last 5 days):
${combinedLogs.slice(0, 4000)}

Today: ${today}

Return the complete updated project file.`;

  console.log(`[synthesize] Updating project: ${filePath}...`);
  const updatedContent = await synthesize(systemPrompt, userPrompt, 1500);

  if (!updatedContent.trim()) {
    console.warn(`[synthesize] OpenAI returned empty response for ${filePath} — skipping.`);
    return;
  }

  if (DRY_RUN) {
    console.log(`[synthesize] DRY RUN — would write: ${filePath}`);
    return;
  }

  await updateFile(
    XHAKA_REPO,
    filePath,
    updatedContent,
    `memory/projects: synthesize update ${projectName} (${today})`,
    file.sha,
  );

  console.log(`[synthesize] ✓ Updated ${filePath}`);
}
