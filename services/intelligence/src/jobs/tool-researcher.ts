import {
  getFileContent,
  createFile,
  updateFile,
} from '../lib/github.js';
import { synthesize } from '../lib/openai.js';
import { checkEnv, warnMissingEnv } from '../utils/env-check.js';

const XHAKA_REPO = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';

// ---------------------------------------------------------------------------
// Tool Researcher — fetches docs for a single tool and writes knowledge/overview.md
// Triggered by researcher/research-tool task with payload: { tool, url, category }
// ---------------------------------------------------------------------------

function toolSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function fetchDocContent(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; XhakaResearcher/1.0)' },
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) {
      console.warn(`[tool-researcher] HTTP ${response.status} for ${url}`);
      return null;
    }
    const html = await response.text();
    if (html.length < 100) return null;

    // Strip HTML tags and collapse whitespace
    let text = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return text.slice(0, 15000);
  } catch (err) {
    console.warn(`[tool-researcher] Fetch failed for ${url}: ${(err as Error).message}`);
    return null;
  }
}

async function generateToolKnowledge(tool: string, url: string, content: string): Promise<string> {
  const systemPrompt = `You are building a knowledge base for a wholesale real estate + SaaS business (New Again Houses + Gunner AI platform).
Write a structured knowledge note for the tool: ${tool}.
Return ONLY the markdown document — no preamble, no fences.`;

  const userPrompt = `Tool: ${tool}
Docs URL: ${url}

Documentation content:
${content.slice(0, 12000)}

Write a structured knowledge note with these exact sections:

## What It Is
One paragraph: purpose, core problem it solves.

## Setup Guide
Step-by-step setup for our specific use case (NAH operations + Gunner SaaS).
Be concrete — mention Railway, Supabase, GHL integrations where relevant.

## Key Features We Should Use
Most relevant features for our stack. Bullet list.

## Best Practices
How to get the most out of this tool. Bullet list.

## Gotchas & Warnings
Common mistakes, rate limits, costs, things to watch out for. Bullet list.

## Integration Points
How this connects to: Railway, GitHub, OpenAI, GHL, Gunner.

## Tags
Comma-separated lowercase tags.`;

  return await synthesize(systemPrompt, userPrompt, 2000);
}

async function markToolProcessed(tool: string, url: string, category: string): Promise<void> {
  const inboxFile = await getFileContent(XHAKA_REPO, 'intelligence/tool-research-inbox.md');
  if (!inboxFile) return;

  // Find and comment out the matching line
  const oldLine = `- ${tool} | ${url} | ${category}`;
  if (!inboxFile.content.includes(oldLine)) return;

  const newContent = inboxFile.content.replace(
    oldLine,
    `<!-- processed ${new Date().toISOString().split('T')[0]} --> ~~${oldLine}~~`,
  );

  await updateFile(
    XHAKA_REPO,
    'intelligence/tool-research-inbox.md',
    newContent,
    `researcher: mark ${tool} as processed in tool-research-inbox`,
    inboxFile.sha,
  );
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export async function runToolResearch(
  tool: string,
  url: string,
  category: string,
): Promise<string> {
  const { ok, missing } = checkEnv(['OPENAI_API_KEY']);
  if (!ok) {
    warnMissingEnv('tool-researcher', missing);
    return 'Skipped — missing OPENAI_API_KEY';
  }

  if (!tool || !url || !category) {
    throw new Error(`tool-researcher: missing required payload fields. Got: tool=${tool} url=${url} category=${category}`);
  }

  console.log(`[tool-researcher] Processing: ${tool} (${category}) from ${url}`);

  // 1. Fetch docs content
  const content = await fetchDocContent(url);
  if (!content || content.length < 200) {
    console.warn(`[tool-researcher] Could not fetch meaningful content from ${url} — writing stub`);
    const stub = `# ${tool} — Knowledge Stub\n\n> Auto-generated stub. Docs could not be fetched from ${url}.\n> Update this file manually or re-queue after confirming the URL.\n\n## Tags\n${category}\n`;
    const slug = toolSlug(tool);
    const knowledgePath = `memory/context/tools/${category}/${slug}/knowledge/overview.md`;
    await createFile(XHAKA_REPO, knowledgePath, stub, `researcher: stub knowledge for ${tool} (fetch failed)`);
    return `Stub written for ${tool} (fetch failed)`;
  }

  // 2. Generate knowledge note via OpenAI
  let knowledge: string;
  try {
    knowledge = await generateToolKnowledge(tool, url, content);
  } catch (err) {
    throw new Error(`[tool-researcher] OpenAI generation failed for ${tool}: ${(err as Error).message}`);
  }

  // Prepend title + metadata
  const today = new Date().toISOString().split('T')[0];
  const fullDoc = `# ${tool} — Knowledge Overview\n\n> Generated: ${today}  \n> Source: ${url}  \n> Category: ${category}\n\n${knowledge}\n`;

  // 3. Write knowledge/overview.md
  const slug = toolSlug(tool);
  const knowledgePath = `memory/context/tools/${category}/${slug}/knowledge/overview.md`;
  await createFile(
    XHAKA_REPO,
    knowledgePath,
    fullDoc,
    `researcher: tool knowledge for ${tool} from ${url}`,
  );
  console.log(`[tool-researcher] ✓ Knowledge written: ${knowledgePath}`);

  // 4. Mark as processed in inbox
  try {
    await markToolProcessed(tool, url, category);
  } catch (err) {
    console.warn(`[tool-researcher] Could not mark ${tool} as processed:`, (err as Error).message);
  }

  return `Knowledge written for ${tool} at ${knowledgePath}`;
}
