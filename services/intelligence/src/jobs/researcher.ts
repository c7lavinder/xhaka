import {
  getFileContent,
  createFile,
  updateFile,
} from '../lib/github.js';
import { synthesize } from '../lib/openai.js';
import { markJobStart, markJobSuccess, markJobFailed, markJobStatus } from '../utils/job-registry.js';
import { sendAlert, classifyOpenAIError } from '../utils/alert.js';
import { checkEnv, warnMissingEnv } from '../utils/env-check.js';
import { evaluateJobOutput, compareWithBaseline, recordJobBaseline } from '../utils/evaluator.js';
import { pushTask, getAllTasks } from '../utils/task-queue.js';
import { sendTelegram } from '../utils/notifier.js';

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

interface BehavioralProposal {
  targetFile: string;          // e.g. "SOUL.md", "ROUTING.md", "agents/builder.md"
  changeType: 'addition' | 'edit' | 'new-section';
  currentState: string;        // What the file currently says, or "doesn't exist"
  proposedChange: string;      // Exact text to add or modify
  why: string;                 // One sentence — what behavior this improves
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  insightSource: string;       // The insight text that triggered this proposal
}

interface BehavioralEvaluationResult {
  proposals: BehavioralProposal[];
  evaluatedAt: string;         // ISO timestamp
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

// ---------------------------------------------------------------------------
// Behavioral impact evaluation
// ---------------------------------------------------------------------------

async function evaluateForBehavioralImpact(
  articleTitle: string,
  keyInsights: string[],
  articleUrl: string,
): Promise<BehavioralEvaluationResult> {
  const systemPrompt = `You are a behavioral systems analyst for an AI COO named Xhaka.
Xhaka operates via a set of core files that define identity, routing, agent roles, and daily behavior:
- SOUL.md — core identity, rules, vibe, what Xhaka is/isn't
- ROUTING.md — who handles what task (never skip routing)
- AGENTS.md — agent roster and responsibilities
- HEARTBEAT.md — daily morning routine and review checklist
- agents/builder.md, agents/auditor.md, agents/researcher.md, WORKFLOW.md — per-agent instructions

Your job: for each insight provided, decide if it suggests a BETTER WAY to prompt, route, build, audit, or organize that Xhaka is NOT currently doing.

Return ONLY valid JSON (no markdown fences). Schema:
{
  "proposals": [
    {
      "targetFile": "string — e.g. SOUL.md or ROUTING.md",
      "changeType": "addition | edit | new-section",
      "currentState": "string — what the file currently says, or 'doesn't exist'",
      "proposedChange": "string — exact text to add or modify",
      "why": "string — one sentence, what behavior this improves",
      "confidence": "HIGH | MEDIUM | LOW",
      "insightSource": "string — the insight that triggered this"
    }
  ]
}

Confidence guidelines:
- HIGH: The insight directly and unambiguously maps to a missing rule, protocol, or behavior in a core file. The change is specific and low-risk.
- MEDIUM: The insight is relevant but the mapping is interpretive or the change is large/uncertain.
- LOW: Loosely related, speculative, or the file already handles this well enough.

If no proposals are warranted, return { "proposals": [] }.
Do NOT invent proposals for their own sake. Fewer, better proposals beat many weak ones.`;

  const userPrompt = `Article: "${articleTitle}"
URL: ${articleUrl}

Key Insights:
${keyInsights.map((ins, i) => `${i + 1}. ${ins}`).join('\n')}

Evaluate each insight. Return only proposals where confidence is HIGH, MEDIUM, or LOW.
Include all three tiers in the JSON — the caller will filter by confidence.`;

  let raw: string;
  try {
    raw = await synthesize(systemPrompt, userPrompt, 2000);
  } catch (err) {
    console.warn('[researcher] evaluateForBehavioralImpact: OpenAI call failed — skipping proposals:', (err as Error).message);
    return { proposals: [], evaluatedAt: new Date().toISOString() };
  }

  const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();

  let parsed: BehavioralEvaluationResult;
  try {
    parsed = JSON.parse(cleaned) as BehavioralEvaluationResult;
  } catch (_err) {
    console.warn('[researcher] evaluateForBehavioralImpact: JSON parse failed — skipping proposals');
    return { proposals: [], evaluatedAt: new Date().toISOString() };
  }

  if (!Array.isArray(parsed.proposals)) {
    return { proposals: [], evaluatedAt: new Date().toISOString() };
  }

  parsed.evaluatedAt = new Date().toISOString();
  return parsed;
}

function buildProposedChangeMarkdown(
  proposal: BehavioralProposal,
  articleTitle: string,
  today: string,
): string {
  return `# Proposed Change — ${today}
Source: ${articleTitle}
Target File: ${proposal.targetFile}
Type: ${proposal.changeType}

## Current State
${proposal.currentState}

## Proposed Change
${proposal.proposedChange}

## Why
${proposal.why}

## Confidence
${proposal.confidence}
`;
}

async function writeProposedChanges(
  proposals: BehavioralProposal[],
  articleTitle: string,
  articleSlug: string,
  today: string,
): Promise<number> {
  const highConfidence = proposals.filter((p) => p.confidence === 'HIGH');

  // Log MEDIUM/LOW inline (do not write files)
  const skipped = proposals.filter((p) => p.confidence !== 'HIGH');
  if (skipped.length > 0) {
    console.log(`[researcher] Skipped ${skipped.length} MEDIUM/LOW proposals for "${articleTitle}":`);
    skipped.forEach((p) => console.log(`  - [${p.confidence}] ${p.targetFile}: ${p.why}`));
  }

  let written = 0;
  for (const proposal of highConfidence) {
    const targetSlug = proposal.targetFile.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const filePath = `intelligence/proposed-changes/${today}-${articleSlug}-${targetSlug}.md`;
    const content = buildProposedChangeMarkdown(proposal, articleTitle, today);

    try {
      await createFile(
        XHAKA_REPO,
        filePath,
        content,
        `researcher: propose change to ${proposal.targetFile} from "${articleTitle}"`,
      );
      console.log(`[researcher] ✓ Proposed change written: ${filePath}`);
      written++;
    } catch (err) {
      console.warn(`[researcher] Failed to write proposal ${filePath}:`, (err as Error).message);
    }
  }

  return written;
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

      // Evaluate insights for behavioral impact
      const behaviorEval = await evaluateForBehavioralImpact(
        analysis.title,
        analysis.keyInsights,
        item.url,
      );

      const proposalCount = await writeProposedChanges(
        behaviorEval.proposals,
        analysis.title,
        slug,
        today,
      );

      if (proposalCount > 0) {
        console.log(`[researcher] → ${proposalCount} HIGH-confidence proposal(s) written for "${analysis.title}"`);
        // Notify Corey for each proposed change
        const highProposals = behaviorEval.proposals.filter((p) => p.confidence === 'HIGH');
        for (const proposal of highProposals) {
          await sendTelegram(
            `🔬 *Proposed change ready for review:*\n"${analysis.title}" → \`${proposal.targetFile}\`\n_${proposal.why}_`,
          );
        }
      }

      processed.push(item);
      console.log(`[researcher] ✓ Processed: ${item.url} (score: ${analysis.relevanceScore})`);

      // Evaluate digest output quality + keep-or-reset
      try {
        const evalResult = await evaluateJobOutput('researcher', articleContent);
        console.log(`[researcher] Evaluation: score=${evalResult.score} grade=${evalResult.grade}`);

        // Record baseline score for future comparisons
        await recordJobBaseline('researcher', evalResult.score);

        // Keep-or-Reset: compare against rolling average of last 3 runs
        const decision = await compareWithBaseline('researcher', evalResult.score);
        if (decision === 'reset') {
          await sendTelegram(
            `⏪ researcher output regressed (score: ${evalResult.score}). Previous version was better. Flagging for inspection.`,
          );
          await markJobStatus('researcher', 'NEEDS_REVIEW');
        }
      } catch (evalErr) {
        console.warn('[researcher] Evaluation step failed (non-fatal):', (evalErr as Error).message);
      }
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


    // ---------------------------------------------------------------------------
    // Repo inbox processing — queue any new GitHub repo URLs for analysis
    // ---------------------------------------------------------------------------
    const repoInboxFile = await getFileContent(XHAKA_REPO, 'intelligence/repo-inbox.md');
    if (repoInboxFile && repoInboxFile.content.trim()) {
      const repoLines = repoInboxFile.content.split('\n')
        .filter((l) => l.trim().startsWith('- https://github.com/'))
        .map((l) => l.trim().replace(/^- /, '').split('#')[0].trim())
        .filter((l) => l.length > 0);

      if (repoLines.length > 0) {
        const allTasks = await getAllTasks();
        const thirtyMinAgo = Date.now() - 30 * 60 * 1000;
        for (const repoUrl of repoLines) {
          const alreadyQueued = allTasks.some(
            (t) =>
              t.agent === 'repo-researcher' &&
              t.task === 'process-repo' &&
              (t.payload as Record<string, unknown>)?.url === repoUrl &&
              (t.status === 'pending' || t.status === 'running' ||
                (t.status === 'completed' && new Date(t.completedAt ?? 0).getTime() > thirtyMinAgo)),
          );
          if (!alreadyQueued) {
            await pushTask({ agent: 'repo-researcher', task: 'process-repo', payload: { url: repoUrl } });
            console.log(`[researcher] ↳ Queued repo for analysis: ${repoUrl}`);
          }
        }
        console.log(`[researcher] Repo inbox: ${repoLines.length} URL(s) checked.`);
      }
    }


    // ---------------------------------------------------------------------------
    // Tool research inbox processing — queue tools for doc fetching
    // ---------------------------------------------------------------------------
    const toolInboxFile = await getFileContent(XHAKA_REPO, 'intelligence/tool-research-inbox.md');
    if (toolInboxFile && toolInboxFile.content.trim()) {
      // Match lines: - ToolName | https://... | category (not already processed/commented)
      const toolLines = toolInboxFile.content.split('\n')
        .filter((l) => l.trim().startsWith('- ') && l.includes(' | ') && !l.includes('~~'))
        .map((l) => l.trim().replace(/^- /, '').trim())
        .filter((l) => l.length > 0);

      if (toolLines.length > 0) {
        const allTasks = await getAllTasks();
        const thirtyMinAgo = Date.now() - 30 * 60 * 1000;
        for (const line of toolLines) {
          const parts = line.split(' | ').map((p) => p.trim());
          if (parts.length < 3) continue;
          const [toolName, toolUrl, toolCategory] = parts;
          if (!toolUrl.startsWith('http')) continue;

          const alreadyQueued = allTasks.some(
            (t) =>
              t.agent === 'researcher' &&
              t.task === 'research-tool' &&
              (t.payload as Record<string, unknown>)?.tool === toolName &&
              (t.status === 'pending' || t.status === 'running' ||
                (t.status === 'completed' && new Date(t.completedAt ?? 0).getTime() > thirtyMinAgo)),
          );
          if (!alreadyQueued) {
            await pushTask({
              agent: 'researcher',
              task: 'research-tool',
              payload: { tool: toolName, url: toolUrl, category: toolCategory },
            });
            console.log(`[researcher] ↳ Queued tool for research: ${toolName} (${toolCategory})`);
          }
        }
        console.log(`[researcher] Tool inbox: ${toolLines.length} tool(s) checked.`);
      }
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
