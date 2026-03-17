// services/intelligence/src/jobs/repo-researcher.ts
// Repo Intelligence job — fetches GitHub repos, extracts patterns, writes knowledge notes
// Triggered by researcher.ts when new URLs appear in intelligence/repo-inbox.md

import {
  getFileContent,
  createFile,
  updateFile,
} from '../lib/github.js';
import { synthesize } from '../lib/openai.js';
import { sendAlert } from '../utils/alert.js';
import { checkEnv } from '../utils/env-check.js';

const XHAKA_REPO = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN ?? '';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RepoFile {
  path: string;
  content: string;
}

interface RepoContext {
  url: string;
  owner: string;
  name: string;
  slug: string;
  readme: string;
  skillMd?: string;
  packageJson?: string;
  additionalFiles: RepoFile[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function todayDateStr(): string {
  return new Date().toISOString().split('T')[0];
}

function repoSlug(url: string): string {
  // https://github.com/owner/repo → owner-repo
  return url
    .replace(/^https?:\/\/github\.com\//, '')
    .replace(/[^a-z0-9-]/gi, '-')
    .toLowerCase()
    .replace(/^-+|-+$/g, '');
}

function parseOwnerRepo(url: string): { owner: string; name: string } | null {
  const match = url.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+?)\/?$/);
  if (!match) return null;
  return { owner: match[1], name: match[2].replace(/\.git$/, '') };
}

async function fetchGitHubFile(
  owner: string,
  repo: string,
  path: string,
): Promise<string | null> {
  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3.raw',
      'User-Agent': 'XhakaResearcher/1.0',
    };
    if (GITHUB_TOKEN) headers['Authorization'] = `token ${GITHUB_TOKEN}`;

    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      { headers, signal: AbortSignal.timeout(10000) },
    );

    if (!res.ok) return null;

    // If JSON response (file object), decode content
    const text = await res.text();
    try {
      const parsed = JSON.parse(text) as { encoding?: string; content?: string };
      if (parsed.encoding === 'base64' && parsed.content) {
        return Buffer.from(parsed.content.replace(/\n/g, ''), 'base64').toString('utf-8');
      }
    } catch {
      // Raw content returned directly
    }
    return text;
  } catch (err) {
    console.warn(`[repo-researcher] fetchGitHubFile ${path}: ${(err as Error).message}`);
    return null;
  }
}

async function fetchRepoContext(url: string): Promise<RepoContext | null> {
  const parsed = parseOwnerRepo(url);
  if (!parsed) {
    console.warn(`[repo-researcher] Could not parse owner/repo from: ${url}`);
    return null;
  }

  const { owner, name } = parsed;

  // Fetch README (try multiple filenames)
  let readme = '';
  for (const fname of ['README.md', 'readme.md', 'README', 'readme.txt']) {
    const content = await fetchGitHubFile(owner, name, fname);
    if (content && content.length > 50) {
      readme = content.slice(0, 8000);
      break;
    }
  }

  if (!readme) {
    console.warn(`[repo-researcher] No README found for ${url}`);
    readme = '(No README found)';
  }

  // Optional enrichment files
  const skillMd = await fetchGitHubFile(owner, name, 'SKILL.md') ?? undefined;
  const packageJson = await fetchGitHubFile(owner, name, 'package.json') ?? undefined;
  const requirementsTxt = await fetchGitHubFile(owner, name, 'requirements.txt') ?? undefined;

  const additionalFiles: RepoFile[] = [];
  if (requirementsTxt) {
    additionalFiles.push({ path: 'requirements.txt', content: requirementsTxt.slice(0, 1000) });
  }

  return {
    url,
    owner,
    name,
    slug: repoSlug(url),
    readme,
    skillMd: skillMd ? skillMd.slice(0, 3000) : undefined,
    packageJson: packageJson ? packageJson.slice(0, 2000) : undefined,
    additionalFiles,
  };
}

// ---------------------------------------------------------------------------
// AI extraction
// ---------------------------------------------------------------------------

async function extractKnowledge(ctx: RepoContext): Promise<string> {
  const systemPrompt = `You are analyzing a GitHub repository for Xhaka — an AI operating system for a wholesale real estate + SaaS business.

Extract a structured knowledge note. Return ONLY the markdown content (no JSON, no fences).`;

  const supplemental: string[] = [];
  if (ctx.skillMd) supplemental.push(`SKILL.md:\n${ctx.skillMd}`);
  if (ctx.packageJson) supplemental.push(`package.json:\n${ctx.packageJson}`);
  for (const f of ctx.additionalFiles) {
    supplemental.push(`${f.path}:\n${f.content}`);
  }

  const userPrompt = `Repo: ${ctx.url}

README content:
${ctx.readme}
${supplemental.length > 0 ? '\n\nAdditional context:\n' + supplemental.join('\n\n') : ''}

Extract a structured knowledge note with these exact sections:

## What It Is
One paragraph: purpose, core problem it solves.

## Architecture Patterns
Key technical patterns, design decisions, or approaches worth borrowing.

## Mental Models
Any frameworks or thinking patterns embedded in the codebase design.

## Application to Xhaka
How could this repo's patterns apply to: NAH operations, Gunner SaaS, or the Xhaka intelligence system?

## Key Files / Entry Points
Which files are most important to understand this codebase.

## Tags
Comma-separated lowercase: architecture, memory, agents, mcp, saas, etc.`;

  return await synthesize(systemPrompt, userPrompt, 2000);
}

// ---------------------------------------------------------------------------
// File writers
// ---------------------------------------------------------------------------

function buildKnowledgeNote(ctx: RepoContext, analysis: string, today: string): string {
  return `# ${ctx.owner}/${ctx.name} — Repo Intelligence

**Source:** ${ctx.url}  
**Analyzed:** ${today}  
**Type:** GitHub Repository

---

${analysis}

---

*Auto-generated by repo-researcher job on ${today}*
`;
}

async function markRepoProcessed(repoUrl: string): Promise<void> {
  const file = await getFileContent(XHAKA_REPO, 'intelligence/repo-inbox.md');
  if (!file) {
    console.warn('[repo-researcher] Could not read repo-inbox.md to mark processed');
    return;
  }

  let content = file.content;

  // Move from Queued to Processed section
  const urlEscaped = repoUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Find the line with this URL (with optional comment)
  const lineRegex = new RegExp(`^- ${urlEscaped}[^\n]*\n?`, 'm');
  const lineMatch = content.match(lineRegex);
  if (!lineMatch) {
    console.warn(`[repo-researcher] URL not found in inbox: ${repoUrl}`);
    return;
  }

  const line = lineMatch[0].trim();
  // Remove from Queued section
  content = content.replace(lineRegex, '');

  // Append to Processed section
  const processedMarker = '## Processed';
  const placeholderLine = '(moved here after researcher runs)';
  if (content.includes(processedMarker)) {
    // Insert after the section header (and remove placeholder if present)
    content = content.replace(placeholderLine, '');
    content = content.replace(
      processedMarker,
      `${processedMarker}\n${line}`,
    );
  } else {
    content += `\n${processedMarker}\n${line}\n`;
  }

  await updateFile(
    XHAKA_REPO,
    'intelligence/repo-inbox.md',
    content,
    `researcher: mark ${repoUrl} as processed`,
    file.sha,
  );
}

// ---------------------------------------------------------------------------
// safeRun wrapper
// ---------------------------------------------------------------------------

async function safeRun<T>(label: string, fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (err) {
    console.error(`[repo-researcher] ${label} failed:`, (err as Error).message);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export async function runRepoResearch(repoUrl: string | undefined): Promise<string> {
  if (!repoUrl) {
    const msg = '[repo-researcher] No URL provided — skipping';
    console.warn(msg);
    return msg;
  }

  const { ok } = checkEnv(['OPENAI_API_KEY']);
  if (!ok) {
    const msg = '[repo-researcher] Missing OPENAI_API_KEY — skipping';
    console.warn(msg);
    return msg;
  }

  console.log(`[repo-researcher] Processing: ${repoUrl}`);

  // 1. Fetch repo context
  const ctx = await safeRun('fetchRepoContext', () => fetchRepoContext(repoUrl));
  if (!ctx) {
    await sendAlert(`⚠️ *Repo Researcher*: Could not fetch context for ${repoUrl}`);
    return `FAILED: could not fetch ${repoUrl}`;
  }

  // 2. Extract knowledge via AI
  const analysis = await safeRun('extractKnowledge', () => extractKnowledge(ctx));
  if (!analysis) {
    await sendAlert(`⚠️ *Repo Researcher*: AI extraction failed for ${repoUrl}`);
    return `FAILED: AI extraction error for ${repoUrl}`;
  }

  // 3. Write knowledge note to memory/context/technology/
  const today = todayDateStr();
  const notePath = `memory/context/technology/${ctx.slug}.md`;
  const noteContent = buildKnowledgeNote(ctx, analysis, today);

  const existing = await getFileContent(XHAKA_REPO, notePath);
  if (existing) {
    await updateFile(XHAKA_REPO, notePath, noteContent, `researcher: update repo note for ${ctx.name}`, existing.sha);
  } else {
    await createFile(XHAKA_REPO, notePath, noteContent, `researcher: add repo note for ${ctx.name}`);
  }
  console.log(`[repo-researcher] ✓ Knowledge note written: ${notePath}`);

  // 4. Mark as processed in inbox
  await safeRun('markRepoProcessed', () => markRepoProcessed(repoUrl));

  return `Analyzed ${ctx.owner}/${ctx.name} → ${notePath}`;
}
