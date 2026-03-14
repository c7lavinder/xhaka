import {
  getFileContent,
  createFile,
  updateFile,
} from '../lib/github.js';
import { synthesize } from '../lib/openai.js';
import { markJobStart, markJobSuccess, markJobFailed } from '../utils/job-registry.js';
import { sendAlert, classifyOpenAIError } from '../utils/alert.js';
import { checkEnv, warnMissingEnv } from '../utils/env-check.js';

const XHAKA_REPO = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';

// ---------------------------------------------------------------------------
// Researcher job — processes article URLs from intelligence/article-inbox.md
// Fetches each article, extracts structured insights via OpenAI, writes results
// ---------------------------------------------------------------------------

interface InboxItem {
  url: string;
  addedDate: string;   // ISO date string parsed from inbox line
  note?: string;       // Optional annotation after the URL
}

interface ArticleAnalysis {
  title: string;           // Article title (inferred if not explicit)
  source: string;          // Domain/publication name
  publishedDate?: string;  // Best guess at publish date (YYYY-MM-DD or "unknown")
  summary: string;         // 2-3 sentence summary of what the article says
  keyInsights: string[];   // 3-5 bullet-point takeaways
  relevance: string;       // Why this matters for wholesale real estate / Corey
  relevanceScore: number;  // 1-10 (10 = highly relevant to wholesale RE)
  tags: string[];          // 3-5 lowercase topic tags
}

interface ProcessedArticle {
  url: string;
  fetchedAt: string;       // ISO timestamp
  analysis: ArticleAnalysis;
  rawLength: number;       // Character count of fetched HTML
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function todayDateStr(): string {
  return new Date().toISOString().split('T')[0];
}

function urlToSlug(url: string): string {
  return url
    .replace(/^https?:\/\//, '')
    .replace(/[^a-z0-9]/gi, '-')
    .toLowerCase()
    .slice(0, 60)
    .replace(/^-+|-+$/g, '');
}

function parseInbox(content: string): InboxItem[] {
  const lines = content.split('\n');
  const items: InboxItem[] = [];
  const today = todayDateStr();

  for (const line of lines) {
    const trimmed = line.trim();
    // Skip empty lines and comment lines
    if (!trimmed || trimmed.startsWith('#')) continue;
    // Must start with http
    if (!trimmed.startsWith('http')) continue;

    const parts = trimmed.split(/\s+/);
    const url = parts[0];
    const note = parts.slice(1).join(' ').replace(/^#\s*/, '').trim() || undefined;

    items.push({ url, addedDate: today, note });
  }

  return items;
}

async function fetchArticleContent(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; XhakaResearcher/1.0)' },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      console.warn(`[researcher] HTTP ${response.status} for ${url}`);
      return null;
    }

    const text = await response.text();
    if (text.length < 100) return null;

    return text;
  } catch (err) {
    console.warn(`[researcher] Fetch failed for ${url}: ${(err as Error).message}`);
    return null;
  }
}

function extractText(html: string): string {
  let text = html;
  // Remove script and style blocks
  text = text.replace(/<script[\s\S]*?<\/script>/gi, ' ');
  text = text.replace(/<style[\s\S]*?<\/style>/gi, ' ');
  // Remove all HTML tags
  text = text.replace(/<[^>]+>/g, ' ');
  // Decode common HTML entities
  text = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "\'")
    .replace(/&nbsp;/g, ' ');
  // Collapse whitespace
  text = text.replace(/\s+/g, ' ').trim();
  // Return first 12,000 chars
  return text.slice(0, 12000);
}

async function analyzeArticle(url: string, text: string): Promise<ArticleAnalysis> {
  const systemPrompt = `You are an intelligence analyst for a wholesale real estate operation.
Analyze the provided article and return ONLY valid JSON (no markdown fences).
Schema:
{
  "title": "string",
  "source": "string",
  "publishedDate": "string or unknown",
  "summary": "string (2-3 sentences)",
  "keyInsights": ["string", "string", "string"],
  "relevance": "string (1-2 sentences explaining relevance to wholesale RE)",
  "relevanceScore": 7,
  "tags": ["string", "string", "string"]
}`;

  const userPrompt = `URL: ${url}\n\nArticle text:\n${text.slice(0, 10000)}`;

  const raw = await synthesize(systemPrompt, userPrompt, 1500);

  const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();

  let parsed: ArticleAnalysis;
  try {
    parsed = JSON.parse(cleaned) as ArticleAnalysis;
  } catch (err) {
    console.error('[researcher] JSON parse failed. Raw response:', raw.slice(0, 300));
    throw new Error(`Malformed OpenAI response: ${(err as Error).message}`);
  }

  // Validate required fields
  if (!parsed.title || !parsed.summary || !Array.isArray(parsed.keyInsights) || parsed.relevanceScore === undefined) {
    throw new Error('Malformed OpenAI response — missing required fields');
  }

  // Clamp relevanceScore to 1-10
  parsed.relevanceScore = Math.max(1, Math.min(10, parsed.relevanceScore));

  return parsed;
}

function buildArticleMarkdown(item: InboxItem, processed: ProcessedArticle): string {
  const { analysis } = processed;
  return `# ${analysis.title}

**Source:** ${analysis.source}  
**URL:** ${item.url}  
**Published:** ${analysis.publishedDate ?? 'unknown'}  
**Fetched:** ${processed.fetchedAt}  
**Relevance Score:** ${analysis.relevanceScore}/10  
**Tags:** ${analysis.tags.join(', ')}

## Summary
${analysis.summary}

## Key Insights
${analysis.keyInsights.map((i) => `- ${i}`).join('\n')}

## Why It Matters
${analysis.relevance}
`;
}

function buildDigestLine(item: InboxItem, analysis: ArticleAnalysis, date: string): string {
  const truncatedSummary = analysis.summary.length > 120
    ? analysis.summary.slice(0, 120) + '...'
    : analysis.summary;
  return `- [${date}] [${analysis.relevanceScore}/10] [${analysis.title}](${item.url}) — ${truncatedSummary}\n`;
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export async function runResearcher(): Promise<void> {
  const { ok, missing } = checkEnv(['OPENAI_API_KEY']);
  if (!ok) {
    warnMissingEnv('researcher', missing);
    return; // Skip cleanly — not a job failure
  }

  const _startTime = await markJobStart('researcher');
  try {
    console.log('[researcher] Starting article research job...');

    // 1. Read inbox
    const inboxFile = await getFileContent(XHAKA_REPO, 'intelligence/article-inbox.md');
    if (!inboxFile || !inboxFile.content.trim()) {
      console.log('[researcher] Inbox empty — nothing to process.');
      await markJobSuccess('researcher', _startTime);
      return;
    }

    // 2. Parse inbox
    const items = parseInbox(inboxFile.content);
    if (items.length === 0) {
      console.log('[researcher] No items to process in inbox.');
      await markJobSuccess('researcher', _startTime);
      return;
    }

    console.log(`[researcher] Found ${items.length} article(s) to process.`);

    const processed: InboxItem[] = [];
    const failed: InboxItem[] = [];
    const today = todayDateStr();

    // 3. Process each item sequentially
    for (const item of items) {
      console.log(`[researcher] Fetching: ${item.url}`);

      // Fetch
      const html = await fetchArticleContent(item.url);
      if (!html) {
        console.warn(`[researcher] Fetch returned null for ${item.url} — queuing for retry.`);
        failed.push(item);
        continue;
      }

      // Extract text
      const text = extractText(html);
      if (text.length < 200) {
        console.warn(`[researcher] Article too short (${text.length} chars) for ${item.url} — may be paywalled or JS-rendered.`);
        failed.push(item);
        continue;
      }

      // Analyze
      let analysis: ArticleAnalysis;
      try {
        analysis = await analyzeArticle(item.url, text);
      } catch (err) {
        console.error(`[researcher] Analysis failed for ${item.url}:`, (err as Error).message);
        failed.push(item);
        continue;
      }

      // Write article file
      const slug = urlToSlug(item.url);
      const articleFilePath = `intelligence/articles/${today}-${slug}.md`;
      const fetchedAt = new Date().toISOString();
      const articleContent = buildArticleMarkdown(item, { url: item.url, fetchedAt, analysis, rawLength: html.length });

      await createFile(
        XHAKA_REPO,
        articleFilePath,
        articleContent,
        `researcher: add article ${slug} (${today})`,
      );

      // Append to digest
      const digestLine = buildDigestLine(item, analysis, today);
      const digestFile = await getFileContent(XHAKA_REPO, 'intelligence/article-digest.md');
      const digestHeader = `# Article Digest\n<!-- Auto-maintained by researcher job. Newest entries at bottom. -->\n\n`;
      const digestContent = digestFile
        ? digestFile.content + digestLine
        : digestHeader + digestLine;

      await createFile(
        XHAKA_REPO,
        'intelligence/article-digest.md',
        digestContent,
        `researcher: append digest entry for ${slug} (${today})`,
      );

      processed.push(item);
      console.log(`[researcher] ✓ Processed: ${item.url} (score: ${analysis.relevanceScore})`);
    }

    // 4. Rebuild inbox with only failed items
    let newInboxContent: string;
    if (failed.length === 0) {
      newInboxContent = `# Article Inbox\n# Add one URL per line. The researcher job processes this daily at 7:30 AM CST.\n# Format: https://url.com/article  # optional note\n# Lines starting with # are ignored.\n`;
    } else {
      const failedLines = failed.map((f) => f.note ? `${f.url}  # ${f.note}` : f.url).join('\n');
      newInboxContent = `# Article Inbox\n# Add one URL per line. The researcher job processes this daily at 7:30 AM CST.\n# Format: https://url.com/article  # optional note\n# Lines starting with # are ignored.\n\n${failedLines}\n`;
    }

    await updateFile(
      XHAKA_REPO,
      'intelligence/article-inbox.md',
      newInboxContent,
      `researcher: cleared ${processed.length} article(s) from inbox (${failed.length} failed, kept for retry)`,
      inboxFile.sha,
    );

    // 5. Alert if ALL failed
    if (failed.length > 0 && processed.length === 0) {
      await sendAlert(`⚠️ *Researcher job*: All ${failed.length} article(s) failed to process. Check URLs in intelligence/article-inbox.md.`);
    }

    console.log(`[researcher] Done. ${processed.length} processed, ${failed.length} failed.`);
    await markJobSuccess('researcher', _startTime);
  } catch (err) {
    console.error('[researcher] Fatal error:', err);
    await markJobFailed('researcher', _startTime);
    const alertMsg = (err instanceof Error)
      ? `🚨 *Researcher failed*\n${classifyOpenAIError(err)}`
      : '🚨 *Researcher failed* — unknown error';
    await sendAlert(alertMsg);
    throw err;
  }
}
