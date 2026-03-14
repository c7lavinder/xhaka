// services/intelligence/src/jobs/scribe.ts
// Nightly job (midnight CST): GitHub digest + session extraction + Telegram summary

import OpenAI from 'openai';
import { sendAlert } from '../utils/alert.js';
import { markJobStart, markJobSuccess, markJobFailed } from '../utils/job-registry.js';
import { evaluateJobOutput } from '../utils/evaluator.js';
import {
  getFileContent,
  getRecentCommits,
  createFile,
  updateFile,
} from '../lib/github.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const XHAKA_REPO = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';
const GUNNER_REPO = process.env.GUNNER_REPO ?? 'c7lavinder/Gunner';
const DRY_RUN = process.env.DRY_RUN === 'true';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface CommitSummary {
  built: string[];
  fixed: string[];
  changed: string[];
}

interface SessionExtraction {
  decisions: { summary: string; date: string; context: string; outcome: string }[];
  tasks: { action: string; owner: string; status: string }[];
  rules: { rule: string }[];
  people: { name: string; role: string; notes: string }[];
  project_updates: { project: string; status: string; notes: string }[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/**
 * Append content to an existing repo file (or create it).
 */
async function appendToFile(
  repo: string,
  filePath: string,
  appendContent: string,
  message: string,
): Promise<void> {
  const existing = await getFileContent(repo, filePath);
  if (existing) {
    await updateFile(repo, filePath, existing.content + appendContent, message, existing.sha);
  } else {
    await createFile(repo, filePath, appendContent.trimStart(), message);
  }
}

/**
 * Upsert a repo file: create with createContent if it doesn't exist,
 * otherwise append appendContent.
 */
async function upsertFile(
  repo: string,
  filePath: string,
  createContent: string,
  appendContent: string,
  message: string,
): Promise<void> {
  const existing = await getFileContent(repo, filePath);
  if (existing) {
    await updateFile(repo, filePath, existing.content + appendContent, message, existing.sha);
  } else {
    await createFile(repo, filePath, createContent, message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 1: GitHub Digest
// ─────────────────────────────────────────────────────────────────────────────

async function digestRepo(repo: string): Promise<{ summary: CommitSummary; count: number }> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const commits = await getRecentCommits(repo, since);

  if (!commits || commits.length === 0) {
    return { summary: { built: [], fixed: [], changed: [] }, count: 0 };
  }

  const commitMessages = commits
    .map((c) => `- ${c.sha.slice(0, 7)}: ${c.message.split('\n')[0]}`)
    .join('\n');

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You are a changelog summarizer. Given a list of git commit messages, extract and categorize changes into three arrays: built (new features/additions), fixed (bug fixes, corrections), changed (refactors, updates, config changes). Be concise — each entry max 15 words. Return valid JSON only.',
      },
      {
        role: 'user',
        content: `Repo: ${repo}\nCommits from the last 24 hours:\n${commitMessages}\n\nReturn JSON: { "built": [], "fixed": [], "changed": [] }`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
  });

  let summary: CommitSummary = { built: [], fixed: [], changed: [] };
  try {
    summary = JSON.parse(response.choices[0].message.content ?? '{}') as CommitSummary;
  } catch {
    console.warn('[scribe] Could not parse digest response');
  }

  return { summary, count: commits.length };
}

function formatChangelogEntry(
  repo: string,
  date: string,
  summary: CommitSummary,
  count: number,
): string {
  const lines: string[] = [`\n## ${date} (${count} commits)`];

  if (summary.built.length > 0) {
    lines.push('### ✅ Built');
    summary.built.forEach((item) => lines.push(`- ${item}`));
  }
  if (summary.fixed.length > 0) {
    lines.push('### 🐛 Fixed');
    summary.fixed.forEach((item) => lines.push(`- ${item}`));
  }
  if (summary.changed.length > 0) {
    lines.push('### 🔄 Changed');
    summary.changed.forEach((item) => lines.push(`- ${item}`));
  }
  if (summary.built.length === 0 && summary.fixed.length === 0 && summary.changed.length === 0) {
    lines.push('_No significant changes._');
  }

  return lines.join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2: Session Extraction
// ─────────────────────────────────────────────────────────────────────────────

async function extractSession(dateStr: string): Promise<SessionExtraction | null> {
  let sessionContent: string;
  try {
    const file = await getFileContent(XHAKA_REPO, `memory/${dateStr}.md`);
    if (!file || file.content.trim().length < 50) {
      console.log(`[scribe] No session log (or too short) for ${dateStr} — skipping extraction`);
      return null;
    }
    sessionContent = file.content;
  } catch {
    console.log(`[scribe] Could not read session log for ${dateStr}`);
    return null;
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are an intelligence extraction agent. Given a daily session log from an AI COO system, extract structured data into the following categories:

- decisions: Key decisions made (with context and outcome)
- tasks: Action items (with owner and current status)
- rules: Standing rules or protocols established ("Always do X", "Never do Y")
- people: People mentioned (name, role, relevant notes)
- project_updates: Project status updates (project name, status, notes)

Be thorough but concise. Omit categories with no content. Return valid JSON only matching the exact schema.`,
      },
      {
        role: 'user',
        content: `Daily session log for ${dateStr}:\n\n${sessionContent.slice(0, 8000)}\n\nExtract and return JSON matching this schema exactly:\n{\n  "decisions": [{"summary": "", "date": "${dateStr}", "context": "", "outcome": ""}],\n  "tasks": [{"action": "", "owner": "", "status": ""}],\n  "rules": [{"rule": ""}],\n  "people": [{"name": "", "role": "", "notes": ""}],\n  "project_updates": [{"project": "", "status": "", "notes": ""}]\n}`,
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'session_extraction',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            decisions: { type: 'array', items: { type: 'object', properties: { summary: { type: 'string' }, date: { type: 'string' }, context: { type: 'string' }, outcome: { type: 'string' } }, required: ['summary','date','context','outcome'], additionalProperties: false } },
            tasks: { type: 'array', items: { type: 'object', properties: { action: { type: 'string' }, owner: { type: 'string' }, status: { type: 'string' } }, required: ['action','owner','status'], additionalProperties: false } },
            rules: { type: 'array', items: { type: 'object', properties: { rule: { type: 'string' } }, required: ['rule'], additionalProperties: false } },
            people: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, role: { type: 'string' }, notes: { type: 'string' } }, required: ['name','role','notes'], additionalProperties: false } },
            project_updates: { type: 'array', items: { type: 'object', properties: { project: { type: 'string' }, status: { type: 'string' }, notes: { type: 'string' } }, required: ['project','status','notes'], additionalProperties: false } }
          },
          required: ['decisions','tasks','rules','people','project_updates'],
          additionalProperties: false
        }
      }
    },
    temperature: 0.1,
  });

  try {
    return JSON.parse(response.choices[0].message.content ?? '{}') as SessionExtraction;
  } catch {
    console.warn('[scribe] Could not parse extraction response');
    return null;
  }
}

async function routeExtraction(extraction: SessionExtraction, dateStr: string): Promise<void> {
  // Decisions → memory/decisions/key-decisions.md
  if (extraction.decisions?.length > 0) {
    const block = extraction.decisions
      .map(
        (d) =>
          `\n### ${d.summary}\n- **Date:** ${d.date}\n- **Context:** ${d.context}\n- **Outcome:** ${d.outcome}`,
      )
      .join('\n');
    await appendToFile(
      XHAKA_REPO,
      'memory/decisions/key-decisions.md',
      block,
      `chore(scribe): file ${extraction.decisions.length} decisions [${dateStr}]`,
    );
  }

  // Rules → memory/context/rules.md (upsert)
  if (extraction.rules?.length > 0) {
    const rulesBlock = '\n' + extraction.rules.map((r) => `- ${r.rule}`).join('\n');
    const createContent = `# Standing Rules\n${rulesBlock}\n`;
    await upsertFile(
      XHAKA_REPO,
      'memory/context/rules.md',
      createContent,
      rulesBlock,
      `chore(scribe): add ${extraction.rules.length} rules [${dateStr}]`,
    );
  }

  // People → memory/people/{slug}.md (one file per person)
  if (extraction.people?.length > 0) {
    for (const person of extraction.people) {
      const slug = slugify(person.name);
      const entry = `\n## Update ${dateStr}\n- **Role:** ${person.role}\n- **Notes:** ${person.notes}\n`;
      const createContent = `# ${person.name}\n\n**Role:** ${person.role}\n**First Seen:** ${dateStr}\n${entry}`;
      await upsertFile(
        XHAKA_REPO,
        `memory/people/${slug}.md`,
        createContent,
        entry,
        `chore(scribe): update person [${person.name}] [${dateStr}]`,
      );
    }
  }

  // Project updates → memory/projects/{slug}.md (one file per project)
  if (extraction.project_updates?.length > 0) {
    for (const update of extraction.project_updates) {
      const slug = slugify(update.project);
      const entry = `\n## ${dateStr}\n- **Status:** ${update.status}\n- **Notes:** ${update.notes}\n`;
      const createContent = `# ${update.project}\n${entry}`;
      await upsertFile(
        XHAKA_REPO,
        `memory/projects/${slug}.md`,
        createContent,
        entry,
        `chore(scribe): project update [${update.project}] [${dateStr}]`,
      );
    }
  }

  // Tasks → append to today's daily log
  if (extraction.tasks?.length > 0) {
    const tasksBlock =
      '\n## Tasks\n' +
      extraction.tasks.map((t) => `- [ ] ${t.action} *(${t.owner})* — ${t.status}`).join('\n') +
      '\n';
    await appendToFile(
      XHAKA_REPO,
      `memory/${dateStr}.md`,
      tasksBlock,
      `chore(scribe): append tasks [${dateStr}]`,
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

export async function runScribe(): Promise<void> {
  const startTime = await markJobStart('scribe');
  const dateStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD (Railway uses TZ=America/Chicago)

  console.log(`[scribe] Starting nightly run for ${dateStr}`);

  // Track errors so Step 3 always fires
  let digestError: Error | null = null;
  let extractionError: Error | null = null;
  let totalCommits = 0;
  let decisionsCount = 0;
  let rulesCount = 0;

  // ── Step 1: GitHub Digest (isolated) ─────────────────────────────────────
  try {
    console.log('[scribe] Step 1: GitHub digest...');
    const [xhakaResult, gunnerResult] = await Promise.all([
      digestRepo(XHAKA_REPO),
      digestRepo(GUNNER_REPO),
    ]);

    const xhakaEntry = formatChangelogEntry(XHAKA_REPO, dateStr, xhakaResult.summary, xhakaResult.count);
    const gunnerEntry = formatChangelogEntry(GUNNER_REPO, dateStr, gunnerResult.summary, gunnerResult.count);

    if (!DRY_RUN) {
      await appendToFile(
        XHAKA_REPO,
        'memory/projects/xhaka-changelog.md',
        xhakaEntry,
        `chore(scribe): xhaka digest [${dateStr}]`,
      );
      await appendToFile(
        XHAKA_REPO,
        'memory/projects/gunner-changelog.md',
        gunnerEntry,
        `chore(scribe): gunner digest [${dateStr}]`,
      );
    } else {
      console.log('[scribe] DRY_RUN — skipping changelog writes');
      console.log('[scribe] xhaka entry:', xhakaEntry);
      console.log('[scribe] gunner entry:', gunnerEntry);
    }

    totalCommits = xhakaResult.count + gunnerResult.count;
    console.log(`[scribe] Digested ${totalCommits} total commits`);
  } catch (err) {
    digestError = err as Error;
    console.error('[scribe] Step 1 failed (non-fatal):', digestError.message);
  }

  // ── Step 2: Session Extraction (isolated) ────────────────────────────────
  try {
    console.log('[scribe] Step 2: Session extraction...');
    const extraction = await extractSession(dateStr);
    if (extraction) {
      decisionsCount = extraction.decisions?.length ?? 0;
      rulesCount = extraction.rules?.length ?? 0;

      if (!DRY_RUN) {
        await routeExtraction(extraction, dateStr);
      } else {
        console.log('[scribe] DRY_RUN — would route:', JSON.stringify(extraction, null, 2));
      }
    }
  } catch (err) {
    extractionError = err as Error;
    console.error('[scribe] Step 2 failed (non-fatal):', extractionError.message);
  }

  // ── Step 3: Telegram Summary — ALWAYS FIRES (proof of life) ─────────────
  console.log('[scribe] Step 3: Telegram summary...');
  
  let statusLine: string;
  if (digestError || extractionError) {
    statusLine = `⚠️ Partial run — digest: ${digestError ? '✗' : '✓'}, extraction: ${extractionError ? '✗' : '✓'}`;
  } else {
    statusLine = `✅ ${decisionsCount} decisions filed, ${totalCommits} commits digested, ${rulesCount} rules captured`;
  }

  const summary =
    `📋 *Nightly Scribe* — ${dateStr}\n` +
    statusLine + `\n` +
    `🕐 _System alive at ${new Date().toISOString()}_`;

  try {
    await sendAlert(summary);
  } catch (alertErr) {
    console.error('[scribe] Failed to send Telegram summary:', (alertErr as Error).message);
  }

  // Mark job status based on whether all steps succeeded
  if (digestError || extractionError) {
    // Partial success — mark as success but errors are logged
    console.warn('[scribe] Completed with errors');
    // Evaluate scribe output quality
    try {
      const scribeOutput =
        `Scribe: ${decisionsCount} decisions filed, ${totalCommits} commits digested, ${rulesCount} rules captured.` +
        (digestError ? ` digestError: ${digestError.message}` : '') +
        (extractionError ? ` extractionError: ${extractionError.message}` : '');
      const evalResult = await evaluateJobOutput('scribe', scribeOutput);
      console.log(`[scribe] Evaluation: score=${evalResult.score} grade=${evalResult.grade}`);
    } catch (evalErr) {
      console.warn('[scribe] Evaluation step failed (non-fatal):', (evalErr as Error).message);
    }
    await markJobSuccess('scribe', startTime);
  } else {
    // Evaluate even on partial success
    try {
      const scribeOutput =
        `Scribe partial: ${decisionsCount} decisions, ${totalCommits} commits.` +
        (digestError ? ` digestError: ${digestError.message}` : '') +
        (extractionError ? ` extractionError: ${extractionError.message}` : '');
      const evalResult = await evaluateJobOutput('scribe', scribeOutput);
      console.log(`[scribe] Evaluation: score=${evalResult.score} grade=${evalResult.grade}`);
    } catch (evalErr) {
      console.warn('[scribe] Evaluation step failed (non-fatal):', (evalErr as Error).message);
    }
    await markJobSuccess('scribe', startTime);
    console.log('[scribe] Done');
  }
}
