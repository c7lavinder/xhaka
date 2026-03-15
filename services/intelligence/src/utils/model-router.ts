// services/intelligence/src/utils/model-router.ts
// Smart Router — selects the right model tier for each task type
//
// Tiers:
//   UTILITY   → deepseek/deepseek-chat   (cheap, fast, routine tasks)
//   STANDARD  → gpt-4o-mini              (balanced quality/cost)
//   PREMIUM   → gpt-4o                   (complex reasoning, high-stakes)

import OpenAI from 'openai';

// ---------------------------------------------------------------------------
// Tier definitions
// ---------------------------------------------------------------------------

export type ModelTier = 'utility' | 'standard' | 'premium';

export const MODEL_MAP: Record<ModelTier, string> = {
  utility:  'deepseek-chat',
  standard: 'gpt-4o-mini',
  premium:  'gpt-4o',
};

// ---------------------------------------------------------------------------
// Cached clients per tier
// ---------------------------------------------------------------------------

let _utilityClient: OpenAI | null = null;
let _standardClient: OpenAI | null = null;
let _premiumClient: OpenAI | null = null;

function getClient(tier: ModelTier): OpenAI {
  if (tier === 'utility') {
    if (!_utilityClient) {
      _utilityClient = new OpenAI({
        apiKey: process.env.DEEPSEEK_API_KEY ?? '',
        baseURL: 'https://api.deepseek.com/v1',
      });
    }
    return _utilityClient;
  }

  if (tier === 'standard') {
    if (!_standardClient) {
      _standardClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? '' });
    }
    return _standardClient;
  }

  // premium
  if (!_premiumClient) {
    _premiumClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? '' });
  }
  return _premiumClient;
}

// ---------------------------------------------------------------------------
// Task → Tier mapping
// ---------------------------------------------------------------------------

export type TaskType =
  | 'summarize'       // utility: quick summaries / digests
  | 'classify'        // utility: tagging, routing, categorization
  | 'format'          // utility: reformatting, normalizing text
  | 'analyze'         // standard: structured analysis
  | 'evaluate'        // standard: rubric-based scoring
  | 'synthesize'      // standard: multi-source synthesis
  | 'reason'          // premium: deep reasoning, trade-offs
  | 'audit'           // premium: code/logic auditing
  | 'plan';           // premium: strategic planning

export function selectTier(task: TaskType): ModelTier {
  switch (task) {
    case 'summarize':
    case 'classify':
    case 'format':
      return 'utility';

    case 'analyze':
    case 'evaluate':
    case 'synthesize':
      return 'standard';

    case 'reason':
    case 'audit':
    case 'plan':
      return 'premium';

    default:
      return 'standard';
  }
}

// ---------------------------------------------------------------------------
// Core call — route by task type
// ---------------------------------------------------------------------------

export interface RouterOptions {
  task: TaskType;
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
  forceTier?: ModelTier;
}

export async function routedCall(opts: RouterOptions): Promise<string> {
  const tier = opts.forceTier ?? selectTier(opts.task);
  const model = MODEL_MAP[tier];
  const client = getClient(tier);

  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: opts.systemPrompt },
      { role: 'user',   content: opts.userPrompt },
    ],
    max_tokens: opts.maxTokens ?? 1000,
    temperature: opts.temperature ?? 0.3,
  });

  return completion.choices[0]?.message?.content?.trim() ?? '';
}

// ---------------------------------------------------------------------------
// Convenience helpers
// ---------------------------------------------------------------------------

/** Utility-tier call — DeepSeek, low cost, fast. */
export async function utilityCall(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 800,
): Promise<string> {
  return routedCall({ task: 'summarize', systemPrompt, userPrompt, maxTokens, forceTier: 'utility' });
}

/** Standard-tier call — GPT-4o-mini, balanced. */
export async function standardCall(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 1000,
): Promise<string> {
  return routedCall({ task: 'analyze', systemPrompt, userPrompt, maxTokens, forceTier: 'standard' });
}

/** Premium-tier call — GPT-4o, high quality. */
export async function premiumCall(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 2000,
): Promise<string> {
  return routedCall({ task: 'reason', systemPrompt, userPrompt, maxTokens, forceTier: 'premium' });
}
