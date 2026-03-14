# 01_architect-spec.md — Article Intelligence Pipeline
**Architect:** Xhaka AI (subagent)  
**Date:** 2026-03-14  
**Brief:** N/A (file not yet created — designed from task description + codebase patterns)  
**Status:** READY FOR BUILDER

---

## Overview

The Article Intelligence Pipeline adds a `researcher` job to the xhaka intelligence service. It reads article URLs from a GitHub-hosted inbox file, fetches each article, uses OpenAI to extract structured insights, and stores them as individual markdown files + a rolling digest — all via the existing GitHub operations pattern.

---

## 1. Files to Create or Modify

### CREATE (new files)
| File | Purpose |
|------|---------|
| `services/intelligence/src/jobs/researcher.ts` | New job — full implementation |
| `intelligence/article-inbox.md` | Feed of URLs pending processing |
| `intelligence/article-digest.md` | Rolling log of processed article summaries |

### MODIFY (existing files)
| File | What changes |
|------|-------------|
| `services/intelligence/src/scheduler.ts` | Import + schedule `runResearcher` |
| `services/intelligence/src/index.ts` | No direct change needed (scheduler handles registration) |
| `data/job-registry.json` | Add `researcher` entry |
| `HEARTBEAT.md` | Add researcher health check line |
| `WORKFLOW.md` | Add researcher to job table |

> ⚠️ NOTE: `index.ts` imports `startScheduler` which already auto-includes all jobs registered in scheduler.ts. Only scheduler.ts needs changing for job registration.

---

## 2. TypeScript Interfaces

All interfaces live at the top of `services/intelligence/src/jobs/researcher.ts`.

```typescript
// -----------------------------------------------------------------------
// Article inbox item — one URL entry parsed from article-inbox.md
// -----------------------------------------------------------------------
interface InboxItem {
  url: string;
  addedDate: string;   // ISO date string parsed from inbox line
  note?: string;       // Optional annotation after the URL
}

// -----------------------------------------------------------------------
// Structured output returned by OpenAI for a single article
// -----------------------------------------------------------------------
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

// -----------------------------------------------------------------------
// Final output written to disk for each article
// -----------------------------------------------------------------------
interface ProcessedArticle {
  url: string;
  fetchedAt: string;       // ISO timestamp
  analysis: ArticleAnalysis;
  rawLength: number;       // Character count of fetched HTML
}
```

---

## 3. Exact Function Signatures

```typescript
// Entry point — called by scheduler
export async function runResearcher(): Promise<void>

// Parse the inbox file into a list of InboxItem objects
function parseInbox(content: string): InboxItem[]

// Fetch raw HTML/text from a URL — returns null on failure
async function fetchArticleContent(url: string): Promise<string | null>

// Strip HTML tags and boilerplate — returns clean text
function extractText(html: string): string

// Call OpenAI to extract structured ArticleAnalysis from article text
async function analyzeArticle(url: string, text: string): Promise<ArticleAnalysis>

// Build the markdown file content for a processed article
function buildArticleMarkdown(item: InboxItem, processed: ProcessedArticle): string

// Build the single-line digest entry for article-digest.md
function buildDigestLine(item: InboxItem, analysis: ArticleAnalysis, date: string): string

// Convert URL to a safe filename slug
function urlToSlug(url: string): string

// Get today's date string YYYY-MM-DD
function todayDateStr(): string
```

---

## 4. Step-by-Step Logic

### `runResearcher()` — Main Orchestrator

```
1. _startTime = await markJobStart('researcher')

2. Read 'intelligence/article-inbox.md' via getFileContent()
   - If null or empty → log "inbox empty" → markJobSuccess → RETURN

3. items = parseInbox(inboxFile.content)
   - If items.length === 0 → log "no items to process" → markJobSuccess → RETURN

4. Log "[researcher] Found N articles to process"

5. processed = []   // track successfully handled items
   failed = []      // track failed items (kept in inbox for retry)

6. FOR each item in items (process sequentially — no parallelism):
   a. Log "[researcher] Fetching: {url}"
   b. html = await fetchArticleContent(item.url)
      - If null → push to failed[] → CONTINUE (don't crash entire job)
   c. text = extractText(html)
      - If text.length < 200 → log "too short/empty" → push to failed[] → CONTINUE
   d. analysis = await analyzeArticle(item.url, text)
      - If throws → push to failed[] → CONTINUE
   e. Build article filename: intelligence/articles/{today}-{urlToSlug(url)}.md
   f. articleContent = buildArticleMarkdown(item, { url, fetchedAt, analysis, rawLength })
   g. await createFile(XHAKA_REPO, articleFilePath, articleContent, commit message)
   h. digestLine = buildDigestLine(item, analysis, today)
   i. Append digestLine to intelligence/article-digest.md:
      - Read existing digest (may be null)
      - Append line
      - createFile() with updated content (createFile handles upsert via SHA)
   j. Push item to processed[]
   k. Log "[researcher] ✓ Processed: {url} (score: {relevanceScore})"

7. Rebuild inbox with only failed[] items:
   - If failed.length === 0 → inbox becomes empty placeholder
   - Write back to 'intelligence/article-inbox.md' via updateFile()
   - Commit message: "researcher: cleared N articles from inbox"

8. Log summary: "[researcher] Done. N processed, M failed."

9. await markJobSuccess('researcher', _startTime)
```

---

### `parseInbox(content: string): InboxItem[]`

```
Inbox format (each non-comment line):
  https://example.com/article  # optional note

1. Split content by newlines
2. For each line:
   - Trim whitespace
   - Skip if empty or starts with '#'
   - Skip if starts with 'http' but is the header placeholder
3. Split on first whitespace: url = parts[0], note = parts[1..].join(' ').replace('#','').trim()
4. Validate URL starts with 'http'
5. Return array of InboxItem objects
   - addedDate defaults to todayDateStr() (inbox doesn't track dates)
```

---

### `fetchArticleContent(url: string): Promise<string | null>`

```
1. Try: fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(15000) })
2. If response.ok is false → log warning → return null
3. text = await response.text()
4. If text.length < 100 → return null
5. Return text
6. Catch any error → log `[researcher] Fetch failed for {url}: {err.message}` → return null
```

---

### `extractText(html: string): string`

```
1. Remove <script> and <style> blocks (regex)
2. Remove all HTML tags (regex strip)
3. Decode common HTML entities (&amp; &lt; &gt; &quot; &#39;)
4. Collapse multiple whitespace/newlines to single space
5. Trim
6. Return first 12,000 characters (OpenAI context limit management)
```

---

### `analyzeArticle(url: string, text: string): Promise<ArticleAnalysis>`

```
systemPrompt:
  "You are an intelligence analyst for a wholesale real estate operation.
   Analyze the provided article and return ONLY valid JSON (no markdown fences).
   Schema:
   {
     title: string,
     source: string,
     publishedDate: string | "unknown",
     summary: string (2-3 sentences),
     keyInsights: string[] (3-5 items),
     relevance: string (1-2 sentences explaining relevance to wholesale RE),
     relevanceScore: number (1-10),
     tags: string[] (3-5 lowercase)
   }"

userPrompt:
  "URL: {url}\n\nArticle text:\n{text.slice(0, 10000)}"

1. raw = await synthesize(systemPrompt, userPrompt, 1500)
2. cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
3. Try: parsed = JSON.parse(cleaned)
4. Validate required fields exist (title, summary, keyInsights, relevanceScore)
   - If missing → throw new Error('Malformed OpenAI response')
5. Clamp relevanceScore to 1-10 range
6. Return parsed as ArticleAnalysis
7. On JSON.parse failure → log raw.slice(0,300) → throw
```

---

### `buildArticleMarkdown(item, processed): string`

```
Returns:

# {analysis.title}

**Source:** {analysis.source}  
**URL:** {item.url}  
**Published:** {analysis.publishedDate ?? 'unknown'}  
**Fetched:** {processed.fetchedAt}  
**Relevance Score:** {analysis.relevanceScore}/10  
**Tags:** {analysis.tags.join(', ')}

## Summary
{analysis.summary}

## Key Insights
{analysis.keyInsights.map(i => `- ${i}`).join('\n')}

## Why It Matters
{analysis.relevance}
```

---

### `buildDigestLine(item, analysis, date): string`

```
Returns single line:
"- [{date}] [{score}/10] [{analysis.title}]({item.url}) — {analysis.summary.slice(0,120)}...\n"
```

---

### `urlToSlug(url: string): string`

```
1. Remove protocol (http:// or https://)
2. Replace non-alphanumeric chars with hyphens
3. Lowercase
4. Truncate to 60 chars
5. Strip leading/trailing hyphens
```

---

## 5. Exact Changes to `scheduler.ts`

```diff
--- a/services/intelligence/src/scheduler.ts
+++ b/services/intelligence/src/scheduler.ts
@@ -11,6 +11,7 @@ import { runScribe } from './jobs/scribe.js';
 import { runOperator } from './jobs/operator.js';
 import { runDailyLog } from './jobs/daily-log.js';
+import { runResearcher } from './jobs/researcher.js';
 import { getFileContent } from './lib/github.js';

@@ -last cron in startScheduler() block, before closing brace +@@ 
+  // --- Researcher: daily at 7:30 AM CST (after propagate + tool-monitor settle) ---
+  cron.schedule(
+    '30 7 * * *',
+    safeRun('researcher', runResearcher),
+    { timezone: TIMEZONE },
+  );
```

> ⚠️ NOTE: `index.ts` does NOT need changes. It calls `startScheduler()` which auto-picks up the new job. Do not touch `index.ts`.

---

## 6. Exact Changes to `data/job-registry.json`

Add `researcher` entry to the JSON object. Place it after `"daily-log"`:

```json
"researcher": {
  "lastRun": null,
  "lastStatus": null,
  "durationMs": null,
  "expectedIntervalHours": 24,
  "gracePeriodMinutes": 90
}
```

Also add `"researcher"` to the `EXPECTED_KEYS` array in `job-registry.ts`:

```diff
--- a/services/intelligence/src/utils/job-registry.ts
+++ b/services/intelligence/src/utils/job-registry.ts
@@ const EXPECTED_KEYS = [
   'capture', 'organize', 'propagate', 'tool-monitor',
   'synthesize', 'improve', 'cleanup', 'scribe', 'operator',
-  'watchdog', 'daily-log',
+  'watchdog', 'daily-log', 'researcher',
 ];
```

And add to `DEFAULT_REGISTRY`:

```diff
+  researcher: { lastRun: null, lastStatus: null, durationMs: null, expectedIntervalHours: 24, gracePeriodMinutes: 90 },
```

---

## 7. Exact Changes to `HEARTBEAT.md`

In the `### 🧠 Xhaka (System Health)` section, add after the intelligence jobs line:

```diff
 - [ ] Intelligence jobs healthy? (check data/job-registry.json for failed/stuck jobs)
+- [ ] Researcher job healthy? (check last article in intelligence/article-digest.md)
+- [ ] Article inbox empty? (check intelligence/article-inbox.md — add URLs to trigger research)
```

---

## 8. Exact Changes to `WORKFLOW.md`

In the jobs section (or add a new section if none exists), add:

```diff
+## Intelligence Jobs
+
+| Job | Schedule | Purpose |
+|-----|----------|---------|
+| researcher | Daily 7:30 AM CST | Fetch + analyze article URLs from intelligence/article-inbox.md |
+
+To queue an article for research, add its URL to `intelligence/article-inbox.md`.
+Format: one URL per line, optional `# note` after the URL.
+Example: `https://example.com/article # wholesale market update`
```

---

## 9. Initial State Files

### `intelligence/article-inbox.md` (create this file)

```markdown
# Article Inbox
# Add one URL per line. The researcher job processes this daily at 7:30 AM CST.
# Format: https://url.com/article  # optional note
# Lines starting with # are ignored.
```

### `intelligence/article-digest.md` (create this file)

```markdown
# Article Digest
<!-- Auto-maintained by researcher job. Newest entries at bottom. -->
```

---

## 10. Edge Cases

### If URL fetch fails (network error, timeout, 404, 403)
- `fetchArticleContent` catches all errors and returns `null`
- Item is pushed to `failed[]` — stays in inbox for next run
- Job continues processing remaining URLs
- Final commit message includes count of failures
- **No alert sent** for individual URL failures (noise); alert only if ALL items fail

### If OpenAI returns malformed JSON
- `analyzeArticle` catches JSON.parse error
- Logs first 300 chars of raw response for debugging
- Throws the error, causing item to be pushed to `failed[]`
- Item stays in inbox for next run
- Job continues with remaining URLs

### If inbox is empty
- `parseInbox` returns `[]`
- `runResearcher` logs "no items to process"
- Calls `markJobSuccess` immediately and returns
- No GitHub writes, no OpenAI calls
- This is the normal state after a successful run

### If article text is too short (paywalled, redirect, JS-rendered)
- `extractText` returns short string
- `runResearcher` checks `text.length < 200`
- Item pushed to `failed[]` — stays in inbox
- Consider: after 3 consecutive failures for same URL, manually remove it

### If GitHub write fails (SHA conflict)
- `createFile` in `github.ts` already handles SHA conflicts via upsert
- If write fails completely, job continues (article is lost but job doesn't crash)
- `markJobFailed` is called only if a fatal/unrecoverable error occurs

### If `intelligence/article-digest.md` doesn't exist yet
- `getFileContent` returns null
- Use `createFile` with the header + first entry (builder: `createFile` handles upsert — see github.ts line ~110)

---

## 11. Builder Constraints

| Constraint | Value |
|------------|-------|
| Max GitHub reads | 6 (inbox + digest + job-registry + heartbeat + workflow + researcher.ts read-before-write) |
| Max GitHub commits | 5 per run (researcher job itself commits per article + inbox clear) |
| Max OpenAI calls per run | 1 per inbox item (no batching — sequential) |
| Max article text sent to OpenAI | 10,000 chars per article |
| HTTP fetch timeout | 15 seconds per URL |
| Expected output format | One `.md` file per article in `intelligence/articles/`, one line in `intelligence/article-digest.md` |
| TypeScript target | Same as existing jobs — ESM modules, `.js` imports, no default exports |

### Import pattern (copy from organize.ts exactly):
```typescript
import { getFileContent, createFile, updateFile } from '../lib/github.js';
import { synthesize } from '../lib/openai.js';
import { markJobStart, markJobSuccess, markJobFailed } from '../utils/job-registry.js';
import { sendAlert, classifyOpenAIError } from '../utils/alert.js';
```

### No new dependencies needed.
- Uses native `fetch` (Node 18+) — no `axios` or `node-fetch`
- All GitHub ops via existing `../lib/github.js`
- All OpenAI via existing `../lib/openai.js`'s `synthesize()`

---

## ARCHITECT REPORT

### Files Read
1. `runs/2026-03-13-foundation-hardening/00_objective.md` (directory listing only — file listed)
2. `services/intelligence/src/jobs/organize.ts` — full file (job pattern)
3. `services/intelligence/src/scheduler.ts` — full file (scheduler registration pattern)
4. `services/intelligence/src/lib/github.ts` — full file (available ops)
5. `services/intelligence/src/utils/job-registry.ts` + `data/job-registry.json` — both (registry pattern)
6. `HEARTBEAT.md` + `WORKFLOW.md` — both (for exact update targets)

> Note: `runs/2026-03-14-article-pipeline/00_brief.md` returned 404 — does not exist yet. Spec designed from task description + codebase context. If Corey wrote a brief separately, Builder should check that path first and adjust.

### Spec Written To
`runs/2026-03-14-article-pipeline/01_architect-spec.md`

### Key Design Decisions
1. **Sequential processing** — articles processed one-at-a-time. Avoids rate-limit bursts on OpenAI and GitHub. Predictable commit history.
2. **Inbox-stays-on-failure** — failed URLs are NOT cleared from inbox. They retry on next run. This is the correct behavior for transient errors (network hiccups, paywalls).
3. **No new npm packages** — native `fetch` (Node 18+) replaces `axios`. Zero dependency additions. Reduces build risk.
4. **Schedule: 7:30 AM CST** — after `propagate` (6am) and `tool-monitor` (6:05am) have run. Before Corey typically starts his day. Relevant intel ready when he opens Telegram.
5. **`createFile` for both create + update** — `github.ts`'s `createFile` already does upsert (checks for existing SHA). No need to call `getFileContent + updateFile` on digest; just `createFile` with full rebuilt content.
6. **Digest format** — append-only, single-line per article. Scans easily, works as a git-diffable log.
7. **`gracePeriodMinutes: 90`** — slightly more than the 60-min default for capture/organize. Article fetches can be slow if URLs are heavy.

### Risks/Warnings for Builder
1. **`00_brief.md` is missing** — This spec was designed without the actual brief. If Corey created it after this run started, read it before building and adjust accordingly.
2. **JavaScript-rendered pages** — Many modern news sites render via JS. `fetch()` returns the pre-render HTML shell, not the article text. `extractText()` may return near-empty strings. This will push items to `failed[]`. Consider a note in WORKFLOW.md that JS-heavy sites won't work.
3. **Paywalled URLs** — Sites like WSJ, Bloomberg will return 200 but minimal content. `text.length < 200` guard handles this but Builder should test with a known-paywalled URL.
4. **Commit volume** — If 10 articles are in inbox, that's ~11 commits in one run (10 article files + 1 inbox clear). This is fine but watchdog might flag it. Not a blocking issue.
5. **`synthesize()` signature** — Verify the exact signature of `synthesize` in `lib/openai.ts` before writing the call. Based on `organize.ts` usage: `synthesize(systemPrompt, userPrompt, maxTokens)`. Confirm this matches.
6. **Article filename collisions** — If two URLs produce the same slug (unlikely but possible), `createFile` will upsert and overwrite. Acceptable behavior.
7. **`EXPECTED_KEYS` in job-registry.ts** — Must add `'researcher'` or the watchdog will flag it as schema invalid after first run.

---

# ADDENDUM — ROUTING.md System
**Added:** 2026-03-14 (same run, Corey addition)  
**Purpose:** Force Xhaka to route every task through the org chart before acting — no cowboy solo work.

---

## A. New File: `ROUTING.md` (workspace root)

Builder creates this file at `ROUTING.md` in the repo root. Full content below — write it verbatim:

```markdown
# ROUTING.md — Agent Decision Table

> Xhaka reads this at the start of every task.
> Step 0 is non-negotiable: identify task type → assign agent → log it → spawn.

---

## Decision Table

| Task Type | Keywords / Signals | Agent | Notes |
|-----------|-------------------|-------|-------|
| Code / Build | "write code", "create file", "fix bug", "implement", "refactor", "deploy", "schema", "endpoint", "PR", "commit", any .ts/.py/.js/.sql change | **Builder** | Even "small" changes. No exceptions. |
| Code Review / QA | "review", "check code", "audit", "lint", "test", "verify build", "post-build", "does this follow RULES" | **Auditor** | Always post-build. Also on-demand. |
| Research / Intel | "find", "research", "what tools", "industry news", "trends", "look up", "competitor", "best practice", "benchmark" | **Researcher** | Don't Google it yourself. Spawn Researcher. |
| UI / Dashboard | "dashboard", "front end", "HTML", "CSS", "chart", "graph", "font", "layout", "page", "visual", "display", "UI" | **Architect** | All visual output goes through Architect. |
| GHL / Config | "GHL", "go high level", "twilio", "webhook", "pipeline stage", "workflow trigger", "contact field", "get the ID", "check the setting" | **Operator** | Read-only unless Corey explicitly approves write. |
| Onboarding / Playbook | "onboard", "playbook", "configure", "wizard", "new team member", "setup guide", "JSON config" | **Guide** | Playbook JSON and onboarding flows. |
| Strategy / Planning | "what should we do", "priority", "roadmap", "decision", "tradeoff", "options", "recommend", "think through" | **Xhaka (self)** | This is Xhaka's lane. No spawning needed. |
| Memory / Logging | "remember", "log this", "save to memory", "update MEMORY.md", "daily log", "what did we decide" | **Xhaka (self)** | Direct file writes. No specialist needed. |
| Comms / Messaging | "send this", "draft a message", "reply to", "email", "Telegram", "text", "what should I say" | **Xhaka (self)** | Draft only. Corey approves before sending. |
| Unknown / Ambiguous | Doesn't fit a clear category | **Xhaka (self)** | Clarify with Corey before routing. Ask one question. |

---

## Routing Protocol (Mandatory — Step 0)

Before any action on any task:

1. **Read this table.** Identify the task type.
2. **Assign the agent.** If ambiguous, default to clarifying with Corey.
3. **Log it.** Write one line to `runs/routing-log.md`:
   ```
   | YYYY-MM-DD HH:MM | <task description, ≤15 words> | <Agent> | <one-sentence reason> |
   ```
4. **Spawn or act.** Execute the routing decision.

---

## Hard Rules

- **Xhaka never codes.** If the task involves writing, modifying, or debugging code → Builder. Every time.
- **Xhaka never does visual work.** If the task involves HTML/CSS/charts → Architect. Every time.
- **Logging is not optional.** A task without a routing-log entry didn't happen correctly.
- **Multi-step tasks get one routing entry** at the start — not one per sub-step.
- **Routing log is append-only.** Never delete entries.

---

## Escalation

If a task spans multiple agents (e.g., "build a dashboard that pulls from GHL"):
- Break it into sub-tasks.
- Route each sub-task separately.
- Log each routing decision.
- Example:
  - Sub-task 1: Operator → pull GHL field IDs
  - Sub-task 2: Builder → wire API endpoint
  - Sub-task 3: Architect → build dashboard page
```

---

## B. New File: `runs/routing-log.md`

Builder creates this file as the initial routing log. Full content:

```markdown
# Routing Log

> Auto-maintained by Xhaka. One entry per task, written before spawning any agent.
> Format: | Date | Task | Agent | Reason |
> Never delete entries. Append only.

| Date | Task Description | Agent Assigned | Reason |
|------|-----------------|---------------|--------|
| 2026-03-14 | Build article intelligence pipeline researcher job | Builder | Code implementation task — new TypeScript job file |
| 2026-03-14 | Design article pipeline + ROUTING.md system spec | Architect (self) | Architecture/design task — producing spec, no code written |
```

---

## C. Changes to `SOUL.md`

Add the following block immediately after the `## 🚨 THE ONE RULE THAT CANNOT BE BROKEN` section and before `## Core Truths`:

```diff
+## 🗺️ STEP 0 — ROUTING (MANDATORY, EVERY TASK)
+
+**Before doing anything on any task:**
+1. Open ROUTING.md
+2. Identify the task type from the decision table
+3. Assign the correct agent
+4. Write one line to `runs/routing-log.md`
+5. Then act
+
+**Never skip Step 0. Not for "quick" tasks. Not for "obvious" tasks. Not ever.**
+Routing log = proof the org chart is being respected.
+If it's not logged, it didn't happen right.
```

Show the exact insertion point to Builder:
- File: `SOUL.md` in the workspace root
- Find the line: `**When given a checklist or numbered list: work through it top to bottom. Do not ask Corey which one to start with. Just start.**`
- Insert the new `## 🗺️ STEP 0` block on the NEXT blank line after that line, before `---` and `## Core Truths`

---

## D. Changes to `HEARTBEAT.md`

In the `### 🧠 Xhaka (System Health)` section, add after the intelligence jobs lines:

```diff
 - [ ] Intelligence jobs healthy? (check data/job-registry.json for failed/stuck jobs)
+- [ ] Routing log current? (check runs/routing-log.md — last entry should be recent)
```

---

## E. Auditor Integration

The Auditor's post-build review checklist (to be enforced in every `04_auditor_report.md`) must include:

```markdown
### Routing Compliance Check
- [ ] Does `runs/routing-log.md` have an entry for this task?
- [ ] Was the correct agent assigned per ROUTING.md decision table?
- [ ] Did Xhaka write any code directly? (FAIL if yes)
- [ ] Did Xhaka do any visual/UI work directly? (FAIL if yes)
```

> Builder: add this checklist block to `WORKFLOW.md` under a new `## Auditor Checklist` section so future Auditor spawns know what's expected.

---

## F. Summary of All Files Builder Must Touch (ROUTING addendum)

| File | Action | Notes |
|------|--------|-------|
| `ROUTING.md` | CREATE | Full content in Section A above — write verbatim |
| `runs/routing-log.md` | CREATE | Full content in Section B above — write verbatim |
| `SOUL.md` | MODIFY | Insert Step 0 block per Section C — exact insertion point specified |
| `HEARTBEAT.md` | MODIFY | Add routing log check per Section D |
| `WORKFLOW.md` | MODIFY | Add Auditor Checklist section per Section E |

---

## G. Edge Cases for Routing System

### If Xhaka forgets to log before acting
- No automated enforcement exists — this is a behavioral rule
- The Auditor catches it post-build and marks FAIL on routing compliance
- A FAIL here means the run's `04_auditor_report.md` includes a routing violation notice

### If a task genuinely doesn't fit the table
- Route to "Unknown / Ambiguous" → Xhaka handles directly
- Still requires a routing-log entry: `| date | task | Xhaka (self) | Ambiguous — clarified with Corey |`

### If `runs/routing-log.md` doesn't exist yet
- First task of the system creates it
- Builder seeds it with the entries in Section B
- All future entries are appended by Xhaka directly (no agent spawn needed for logging)

### If routing-log.md grows very large
- No auto-archive needed — it's a flat table, GitHub handles large files fine
- After 500 entries (~6 months), Xhaka can archive to `runs/routing-log-archive-YYYY.md` and start fresh

