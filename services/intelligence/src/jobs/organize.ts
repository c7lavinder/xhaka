import {
  getFileContent,
  createFile,
  updateFile,
} from '../lib/github.js';
import { synthesize } from '../lib/openai.js';
import { markJobStart, markJobSuccess, markJobFailed } from '../utils/job-registry.js';
import { sendAlert, classifyOpenAIError } from '../utils/alert.js';

const XHAKA_REPO = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';
const DRY_RUN = process.env.DRY_RUN === 'true';

// ---------------------------------------------------------------------------
// Organize job — nightly scan of today's memory log → updates memory subfolders
// ---------------------------------------------------------------------------

interface PersonEntry {
  name: string;
  role?: string;
  notes?: string;
}

interface DecisionEntry {
  date?: string;
  decision: string;
  context?: string;
  outcome?: string;
}

interface ProjectUpdateEntry {
  project: string;
  update: string;
}

interface ExtractedData {
  people: PersonEntry[];
  decisions: DecisionEntry[];
  projectUpdates: ProjectUpdateEntry[];
}

function toSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function todayDateStr(): string {
  return new Date().toISOString().split('T')[0];
}

export async function runOrganize(): Promise<void> {
  const _startTime = await markJobStart('organize');
  try {
    const today = todayDateStr();
    console.log(`[organize] Starting nightly organize for ${today}${DRY_RUN ? ' (DRY RUN)' : ''}...`);

    // 1. Read today's daily log
    const logPath = `memory/${today}.md`;
    const logFile = await getFileContent(XHAKA_REPO, logPath);

    if (!logFile || !logFile.content.trim()) {
      console.log(`[organize] No daily log found at ${logPath} — nothing to organize.`);
      await markJobSuccess('organize', _startTime);
      return;
    }

    // Skip if log has no meaningful content (placeholder only)
    const MEANINGFUL_THRESHOLD = 200;
    const hasNoActivity = logFile.content.includes('No inbox activity') ||
                          logFile.content.includes('No activity');
    if (logFile.content.trim().length < MEANINGFUL_THRESHOLD || hasNoActivity) {
      console.log(`[organize] Daily log has no meaningful content — skipping OpenAI extraction.`);
      await markJobSuccess('organize', _startTime);
      return;
    }

    console.log(`[organize] Found daily log at ${logPath} (${logFile.content.length} chars).`);

    // 2. Extract structured info via OpenAI
    const extracted = await extractFromLog(logFile.content, today);
    console.log(
      `[organize] Extracted: ${extracted.people.length} people, ` +
      `${extracted.decisions.length} decisions, ` +
      `${extracted.projectUpdates.length} project updates.`,
    );

    // 3. Process people
    for (const person of extracted.people) {
      await processPerson(person, today);
    }

    // 4. Process decisions
    if (extracted.decisions.length > 0) {
      await processDecisions(extracted.decisions, today);
    }

    // 5. Process project updates
    for (const update of extracted.projectUpdates) {
      await processProjectUpdate(update, today);
    }

    console.log('[organize] Done.');

    await markJobSuccess('organize', _startTime);
  } catch (err) {
    console.error('[organize] Fatal error:', err);
    await markJobFailed('organize', _startTime);
    // FIX 6: Send alert for failures
    const alertMsg = (err instanceof Error)
      ? `🚨 *Organize failed*\n${classifyOpenAIError(err)}`
      : '🚨 *Organize failed* — unknown error';
    await sendAlert(alertMsg);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// OpenAI extraction
// ---------------------------------------------------------------------------

async function extractFromLog(logContent: string, date: string): Promise<ExtractedData> {
  const systemPrompt = `You are a memory organizer for an AI assistant. Extract structured data from a daily log.

Return ONLY valid JSON with this exact structure (no markdown, no code blocks):
{
  "people": [
    { "name": "Full Name", "role": "their role/title", "notes": "relevant notes about them" }
  ],
  "decisions": [
    { "date": "YYYY-MM-DD", "decision": "what was decided", "context": "why", "outcome": "result or expected outcome" }
  ],
  "projectUpdates": [
    { "project": "Project Name", "update": "what changed or progressed" }
  ]
}

Rules:
- Only include items explicitly mentioned in the log
- Use today's date (${date}) for decisions if no date is specified
- If nothing found for a category, return an empty array
- Be concise — notes/updates should be 1-2 sentences max`;

  const userPrompt = `Daily log for ${date}:

${logContent.slice(0, 8000)}`;

  const raw = await synthesize(systemPrompt, userPrompt, 2000);

  try {
    // Strip any accidental markdown fences
    const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    return JSON.parse(cleaned) as ExtractedData;
  } catch (err) {
    console.error('[organize] Failed to parse OpenAI response as JSON:', err);
    console.error('[organize] Raw response:', raw.slice(0, 500));
    return { people: [], decisions: [], projectUpdates: [] };
  }
}

// ---------------------------------------------------------------------------
// People processing
// ---------------------------------------------------------------------------

async function processPerson(person: PersonEntry, date: string): Promise<void> {
  if (!person.name) return;

  const slug = toSlug(person.name);
  const filePath = `memory/people/${slug}.md`;

  console.log(`[organize] Processing person: ${person.name} (${filePath})`);

  const existing = await getFileContent(XHAKA_REPO, filePath);

  if (existing) {
    // Append update section
    const updateSection = `
## Update — ${date}
- **Role:** ${person.role ?? 'N/A'}
- **Notes:** ${person.notes ?? 'No new notes.'}
`;
    const updatedContent = existing.content + updateSection;

    if (DRY_RUN) {
      console.log(`[organize] DRY RUN — would append update to: ${filePath}`);
      return;
    }

    await updateFile(
      XHAKA_REPO,
      filePath,
      updatedContent,
      `memory/people: update ${slug} (${date})`,
      existing.sha,
    );
    console.log(`[organize] ✓ Updated ${filePath}`);
  } else {
    // Create new profile
    const newContent = `# ${person.name}

**Role:** ${person.role ?? 'Unknown'}
**First Seen:** ${date}

## Profile
${person.notes ?? 'No initial notes.'}

## Update — ${date}
- First mention in daily log.
`;

    if (DRY_RUN) {
      console.log(`[organize] DRY RUN — would create: ${filePath}`);
      return;
    }

    await createFile(
      XHAKA_REPO,
      filePath,
      newContent,
      `memory/people: create profile for ${slug} (${date})`,
    );
    console.log(`[organize] ✓ Created ${filePath}`);
  }
}

// ---------------------------------------------------------------------------
// Decisions processing
// ---------------------------------------------------------------------------

async function processDecisions(decisions: DecisionEntry[], date: string): Promise<void> {
  const decisionsPath = 'memory/decisions/key-decisions.md';
  const existing = await getFileContent(XHAKA_REPO, decisionsPath);

  const newEntries = decisions.map((d) => {
    const entryDate = d.date ?? date;
    return [
      `\n## ${entryDate} — ${d.decision}`,
      d.context ? `**Context:** ${d.context}` : null,
      d.outcome ? `**Outcome:** ${d.outcome}` : null,
    ]
      .filter(Boolean)
      .join('\n') + '\n';
  });

  const appended = newEntries.join('\n');

  if (DRY_RUN) {
    console.log(`[organize] DRY RUN — would append ${decisions.length} decision(s) to ${decisionsPath}`);
    return;
  }

  if (existing) {
    await updateFile(
      XHAKA_REPO,
      decisionsPath,
      existing.content + appended,
      `memory/decisions: add ${decisions.length} decision(s) (${date})`,
      existing.sha,
    );
  } else {
    const header = `# Key Decisions

This file tracks all major decisions made. Maintained automatically by the organize job.
`;
    await createFile(
      XHAKA_REPO,
      decisionsPath,
      header + appended,
      `memory/decisions: create key-decisions.md with ${decisions.length} entry(s) (${date})`,
    );
  }

  console.log(`[organize] ✓ Appended ${decisions.length} decision(s) to ${decisionsPath}`);
}

// ---------------------------------------------------------------------------
// Project updates processing
// ---------------------------------------------------------------------------

async function processProjectUpdate(update: ProjectUpdateEntry, date: string): Promise<void> {
  if (!update.project) return;

  const slug = toSlug(update.project);
  const filePath = `memory/projects/${slug}.md`;

  console.log(`[organize] Processing project update: ${update.project} (${filePath})`);

  const existing = await getFileContent(XHAKA_REPO, filePath);

  if (!existing) {
    console.log(`[organize] No project file found at ${filePath} — skipping.`);
    return;
  }

  // Append to ## Updates section (or add it if missing)
  const updateEntry = `\n### ${date}\n${update.update}\n`;

  let updatedContent: string;
  if (existing.content.includes('## Updates')) {
    updatedContent = existing.content + updateEntry;
  } else {
    updatedContent = existing.content + `\n## Updates\n${updateEntry}`;
  }

  if (DRY_RUN) {
    console.log(`[organize] DRY RUN — would append update to: ${filePath}`);
    return;
  }

  await updateFile(
    XHAKA_REPO,
    filePath,
    updatedContent,
    `memory/projects: update ${slug} (${date})`,
    existing.sha,
  );
  console.log(`[organize] ✓ Updated ${filePath}`);
}
