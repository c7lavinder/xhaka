// services/intelligence/src/utils/model-router.ts
// Cost Optimizer — Smart Routing.
// Maps agent/task combos to the cheapest model capable of the job.
// Auto-promotes to the next tier when quality scores fall below threshold
// or when a task has previously failed.

import { getFileContent } from '../lib/github.js';

const REPO = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';
const PRICING_PATH = 'data/model-pricing.json';
const EVAL_LOG_PATH = 'data/evaluation-log.json';

// ---------------------------------------------------------------------------
// Tier definitions
// ---------------------------------------------------------------------------

export enum Tier {
  UTILITY   = 'UTILITY',    // Cheap, fast — simple data ops
  LOGICAL   = 'LOGICAL',    // Mid-range — reasoning, code review
  STRATEGIC = 'STRATEGIC',  // Full power — architecture, complex builds
}

export const TIER_MODELS: Record<Tier, string> = {
  [Tier.UTILITY]:   'google/gemini-3-flash-preview',
  [Tier.LOGICAL]:   'anthropic/claude-haiku-3-5',
  [Tier.STRATEGIC]: 'anthropic/claude-sonnet-4-6',
};

const TIER_ORDER: Tier[] = [Tier.UTILITY, Tier.LOGICAL, Tier.STRATEGIC];

/** Promote one tier upward (caps at STRATEGIC). */
export function upgradeTier(tier: Tier): Tier {
  const idx = TIER_ORDER.indexOf(tier);
  return idx < TIER_ORDER.length - 1 ? TIER_ORDER[idx + 1]! : Tier.STRATEGIC;
}

// ---------------------------------------------------------------------------
// Default agent → tier assignments
// ---------------------------------------------------------------------------

const AGENT_TIER_MAP: Record<string, Tier> = {
  // UTILITY — lightweight data capture and formatting
  capture:     Tier.UTILITY,
  organize:    Tier.UTILITY,
  'daily-log': Tier.UTILITY,

  // LOGICAL — reasoning, code review, writing
  researcher:  Tier.LOGICAL,
  auditor:     Tier.LOGICAL,
  scribe:      Tier.LOGICAL,

  // STRATEGIC — architecture and complex coding
  architect:   Tier.STRATEGIC,
  builder:     Tier.STRATEGIC,
};

// ---------------------------------------------------------------------------
// Pricing
// ---------------------------------------------------------------------------

interface ModelPricing {
  input:  number; // USD per million input tokens
  output: number; // USD per million output tokens
  tier:   string;
}

type PricingMap = Record<string, ModelPricing>;

// Module-level cache (valid for the lifetime of one Railway process run)
let _pricing: PricingMap | null = null;

async function getPricing(): Promise<PricingMap> {
  if (_pricing) return _pricing;

  try {
    const file = await getFileContent(REPO, PRICING_PATH);
    if (file?.content) {
      _pricing = JSON.parse(file.content) as PricingMap;
      return _pricing;
    }
  } catch {
    console.warn('[model-router] Could not load model-pricing.json — using built-in defaults');
  }

  // Hardcoded fallback — mirrors data/model-pricing.json
  _pricing = {
    'google/gemini-3-flash-preview': { input: 0.10, output: 0.40, tier: 'utility'   },
    'anthropic/claude-haiku-3-5':    { input: 0.80, output: 4.00, tier: 'logical'   },
    'anthropic/claude-sonnet-4-6':   { input: 3.00, output: 15.0, tier: 'strategic' },
  };
  return _pricing;
}

// ---------------------------------------------------------------------------
// Evaluation log
// ---------------------------------------------------------------------------

interface EvalEntry {
  agent?:     string;
  task?:      string;
  jobName?:   string;
  score:      number;
  timestamp:  string;
}

/** Returns the most recent quality score for agent/task, or null if not found. */
async function getLastQualityScore(agent: string, task: string): Promise<number | null> {
  try {
    const file = await getFileContent(REPO, EVAL_LOG_PATH);
    if (!file?.content) return null;

    const raw = file.content.trim();
    if (raw === '' || raw === '[]') return null;

    const entries = JSON.parse(raw) as EvalEntry[];
    if (!Array.isArray(entries) || entries.length === 0) return null;

    const matches = entries
      .filter(
        (e) =>
          (e.agent === agent && e.task === task) ||
          e.jobName === `${agent}/${task}`,
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return matches.length > 0 ? (matches[0]?.score ?? null) : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface ModelSelection {
  model:  string;
  tier:   Tier;
  reason: string;
}

/**
 * Returns the optimal model for a given agent + task combo.
 *
 * Decision order:
 *   1. If `overrideModel` is supplied → use it, skip all routing logic.
 *   2. Look up the default tier for the agent.
 *   3. If the last evaluation score for this agent/task was < 60 → promote one tier.
 *   4. Return the model for the resolved tier.
 */
export async function getModelForTask(
  agent:         string,
  task:          string,
  overrideModel?: string,
): Promise<ModelSelection> {

  // --- Hard override (existing jobs retain control) ---
  if (overrideModel) {
    const pricing = await getPricing();
    const rawTier = pricing[overrideModel]?.tier?.toUpperCase() as Tier | undefined;
    const tier    = rawTier && (Object.values(Tier) as string[]).includes(rawTier)
      ? rawTier as Tier
      : Tier.LOGICAL;
    return { model: overrideModel, tier, reason: 'manual override' };
  }

  // --- Default tier lookup ---
  const baseTier: Tier = AGENT_TIER_MAP[agent] ?? AGENT_TIER_MAP[task] ?? Tier.LOGICAL;

  // --- Quality-based upgrade ---
  const lastScore = await getLastQualityScore(agent, task);
  let tier   = baseTier;
  let reason = `default tier for agent="${agent}"`;

  if (lastScore !== null && lastScore < 60) {
    tier   = upgradeTier(baseTier);
    reason = `auto-upgraded ${baseTier}→${tier} (last eval score: ${lastScore})`;
    console.log(`[model-router] ⬆️  ${agent}/${task}: ${baseTier} → ${tier} (score=${lastScore})`);
  }

  return { model: TIER_MODELS[tier], tier, reason };
}

/**
 * Estimates the USD cost of a single LLM call.
 * Pricing is stored per-million-tokens in model-pricing.json.
 *
 * @param model         Full model identifier  (e.g. "anthropic/claude-haiku-3-5")
 * @param inputTokens   Estimated prompt token count
 * @param outputTokens  Estimated completion token count
 * @returns             Estimated cost in USD, rounded to 6 decimal places
 */
export async function estimateCost(
  model:        string,
  inputTokens:  number,
  outputTokens: number,
): Promise<number> {
  const pricing = await getPricing();
  const price   = pricing[model];

  if (!price) {
    console.warn(`[model-router] No pricing entry for model: ${model}`);
    return 0;
  }

  const cost = (inputTokens / 1_000_000) * price.input
             + (outputTokens / 1_000_000) * price.output;

  return Math.round(cost * 1_000_000) / 1_000_000;
}

/**
 * Typical token budgets per tier — used for cost estimation when
 * real token counts are unavailable.
 */
export const TIER_TOKEN_BUDGET: Record<Tier, { input: number; output: number }> = {
  [Tier.UTILITY]:   { input:   500, output:  200 },
  [Tier.LOGICAL]:   { input:  1500, output:  600 },
  [Tier.STRATEGIC]: { input:  3000, output: 1200 },
};
