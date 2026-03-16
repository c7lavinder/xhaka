import OpenAI from 'openai';

// ---------------------------------------------------------------------------
// OpenAI client — synthesis calls for intel propagation and improvement runs
// ---------------------------------------------------------------------------
// Hardened: 3-tier fallback (GPT-4o → GPT-4o-mini → Gemini Flash)
//           Exponential backoff for 429 errors (1 s, 2 s, 4 s)
//           Auto-switch to Gemini after consecutive OpenAI failures
// ---------------------------------------------------------------------------

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY ?? 'AIzaSyChM6aVZ-l-L8dK9VkDnoeXyCLWhonbypY';

let _client: OpenAI | null = null;

function client(): OpenAI {
  if (!_client) {
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _client;
}

// ---------------------------------------------------------------------------
// Cost estimates (USD per 1 K tokens — output only, rough)
// ---------------------------------------------------------------------------
const COST_PER_1K: Record<string, number> = {
  'gpt-4o':           0.005,
  'gpt-4o-mini':      0.00015,
  'gemini-1.5-flash': 0.000075,
};

function estimateCost(model: string, maxTokens: number): number {
  return ((COST_PER_1K[model] ?? 0) * maxTokens) / 1000;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRateLimit(err: unknown): boolean {
  if (typeof err !== 'object' || err === null) return false;
  const status = (err as Record<string, unknown>).status;
  const code   = (err as Record<string, unknown>).code;
  return status === 429 || code === 'rate_limit_exceeded';
}

/** Call a single OpenAI model with up to 3 exponential-backoff retries on 429. */
async function tryOpenAIModel(
  model: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number,
): Promise<string> {
  const delays = [1000, 2000, 4000];

  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const completion = await client().chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userPrompt },
        ],
        max_tokens: maxTokens,
        temperature: 0.3,
      });
      return completion.choices[0]?.message?.content?.trim() ?? '';
    } catch (err) {
      if (isRateLimit(err) && attempt < 3) {
        const delay = delays[attempt];
        console.warn(
          `[openai] Rate-limit on ${model} — backing off ${delay} ms (attempt ${attempt + 1}/3)`,
        );
        await sleep(delay);
        continue;
      }
      throw err; // non-429 error or exhausted retries
    }
  }
  /* istanbul ignore next */
  throw new Error(`[openai] Exhausted retries for ${model}`);
}

/** Call Gemini Flash via REST (no extra package required). */
async function callGemini(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number,
): Promise<string> {
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent` +
    `?key=${GEMINI_API_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
        },
      ],
      generationConfig: { maxOutputTokens: maxTokens, temperature: 0.3 },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`[openai] Gemini API error ${response.status}: ${body}`);
  }

  const data = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface SynthesisResult {
  text: string;
  modelUsed: string;
  estimatedCost: number;
}

/**
 * 3-tier fallback synthesis:
 *   1. GPT-4o        (with backoff on 429)
 *   2. GPT-4o-mini   (with backoff on 429)
 *   3. Gemini Flash  (after consecutive OpenAI failures)
 */
export async function synthesize(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 1000,
): Promise<SynthesisResult> {
  const openaiModels = ['gpt-4o', 'gpt-4o-mini'] as const;
  let consecutiveOpenAIFailures = 0;

  for (const model of openaiModels) {
    try {
      const text = await tryOpenAIModel(model, systemPrompt, userPrompt, maxTokens);
      return { text, modelUsed: model, estimatedCost: estimateCost(model, maxTokens) };
    } catch (err) {
      consecutiveOpenAIFailures++;
      console.warn(
        `[openai] ${model} failed (consecutive OpenAI failures: ${consecutiveOpenAIFailures}):`,
        (err as Error).message,
      );
    }
  }

  // All OpenAI tiers failed → auto-switch to Gemini
  console.warn(
    `[openai] ${consecutiveOpenAIFailures} consecutive OpenAI failures — ` +
    `auto-switching to Gemini Flash for this run.`,
  );

  const text = await callGemini(systemPrompt, userPrompt, maxTokens);
  return {
    text,
    modelUsed: 'gemini-1.5-flash',
    estimatedCost: estimateCost('gemini-1.5-flash', maxTokens),
  };
}

// ---------------------------------------------------------------------------
// Specific synthesis helpers (return plain strings for backward compatibility)
// ---------------------------------------------------------------------------

export async function generateAgentEntry(
  agentName: string,
  agentContext: string,
  intelItem: string,
): Promise<string> {
  const system = `You are updating an AI agent's knowledge file. The agent is: ${agentName}.

Your job: given a piece of intelligence, write a concise entry to append to the agent's "## Intelligence Log" section.

Rules:
- Keep it under 100 words
- Be specific and actionable — not generic
- Format exactly like this (no code blocks, just the markdown):

### YYYY-MM-DD: [Short Title]
[2-4 sentences: what this means for this specific agent's work]

Output ONLY the entry. No preamble, no explanation.`;

  const user = `Agent context (last 500 chars of their file):
${agentContext.slice(-500)}

New intelligence item:
${intelItem}

Today's date: ${new Date().toISOString().split('T')[0]}`;

  const result = await synthesize(system, user, 300);
  return result.text;
}

export async function generateBuilderLesson(
  failureContext: string,
): Promise<string> {
  const system = `You are analyzing engineering failures to extract rules for an AI coding agent called "The Builder".

Your job: given a failure (reverted commit, failed build, crash), write ONE new row for the Builder's failure patterns table.

Format EXACTLY like this (markdown table row, no code block):
| [What went wrong in 5 words] | [What happened — 1 sentence] | [The fix — 1 sentence] |

Output ONLY the table row. No preamble.`;

  const user = `Failure context:
${failureContext}`;

  const result = await synthesize(system, user, 200);
  return result.text;
}

export async function generateOperatorLesson(
  crashContext: string,
): Promise<string> {
  const system = `You are analyzing Railway deployment crashes to extract lessons for an AI operations agent called "The Operator".

Your job: given crash context, write a concise "Known Issue" entry.

Format EXACTLY like this (no code block):

### [Short issue title]
**Symptom:** [What the crash/error looked like]
**Root Cause:** [Why it happened]
**Resolution:** [How to fix or prevent it]

Output ONLY the entry. No preamble.`;

  const user = `Crash context:
${crashContext}`;

  const result = await synthesize(system, user, 300);
  return result.text;
}
