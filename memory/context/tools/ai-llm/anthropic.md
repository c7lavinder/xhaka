# Anthropic Claude

**Category:** AI & LLM
**Status:** 🟢 Active
**Last Updated:** 2026-03-14

## Purpose
Primary AI model powering Xhaka — the COO agent. Handles all reasoning, strategy, memory management, and agent orchestration.

## Usage in Stack
- **Xhaka:** Claude Sonnet 4.6 (main agent), claude-sonnet-4-6 API ID
- **Gunner (potential):** Claude for call analysis as alternative/supplement to GPT-4o

---

## Current Models (March 2026)

| Model | API ID | Input | Output | Context | Max Output |
|-------|--------|-------|--------|---------|------------|
| **Claude Opus 4.6** | claude-opus-4-6 | $5/MTok | $25/MTok | 1M tokens | 128k tokens |
| **Claude Sonnet 4.6** | claude-sonnet-4-6 | $3/MTok | $15/MTok | 1M tokens | 64k tokens |
| **Claude Haiku 4.5** | claude-haiku-4-5 | $1/MTok | $5/MTok | 200k tokens | 64k tokens |

**🚨 BIG NEWS (March 13, 2026):** 1M token context window is now GA at **standard pricing** for Opus 4.6 and Sonnet 4.6. No long-context premium. A 900k-token request costs the same per-token rate as a 9k-token request.

---

## Model Selection Guide for Corey's Stack

### Xhaka (COO Agent)
**Use: Sonnet 4.6**
- Fast enough for real-time Telegram responses
- 1M context = can hold months of memory in context
- $3/$15 per MTok — 40% cheaper than Opus with 90% of the intelligence
- Opus 4.6 only makes sense for: complex multi-week planning sessions, deep strategic analysis, or when Sonnet fails on a task

### Gunner (Call Coaching)
**Use: Claude Haiku 4.5 for bulk grading, Sonnet 4.6 for detailed feedback**
- Haiku is dramatically cheaper for simple scoring tasks (did they use a hook? did they ask discovery questions?)
- Sonnet for the paragraph-level coaching feedback a rep actually reads
- Opus overkill for call analysis — don't use it

### Agent Orchestration / Complex Reasoning
**Use: Opus 4.6**
- When you need extended thinking
- Multi-step planning with tool use
- Anything where wrong answers have real consequences

---

## Key Features

### Extended Thinking
All three models support extended thinking (like chain-of-thought but built-in). Useful for:
- Complex deal analysis
- Multi-variable decisions in Xhaka
- NOT needed for routine call grading

### Adaptive Thinking
Opus 4.6 and Sonnet 4.6 both support adaptive thinking — automatically decides how much "thinking" to spend based on complexity. Enable this for Xhaka; it's more efficient than always using full extended thinking.

### Prompt Caching
- Cache prefix: after 1024 tokens (minimum cacheable block)
- Cached reads: 90% discount on input tokens
- Cache TTL: 5 minutes (ephemeral) or up to 1 hour (explicit)
- **Critical for Xhaka:** MEMORY.md + SOUL.md + AGENTS.md are loaded every session. At 5000+ tokens, caching these saves ~$0.015 per session. Across 50 sessions/day = ~$0.75/day.

### Batch API
- 50% discount, async, up to 24hr turnaround
- Same quality as real-time
- Perfect for Gunner bulk call processing

---

## Known Gotchas

1. **Model versioning:** `claude-sonnet-4-6` is the alias — it auto-updates to the latest Sonnet 4.6 patch. Use the dated version ID (e.g., `claude-sonnet-4-6-20260101`) in production to avoid surprise behavior changes.

2. **Output token limits differ:** Opus 4.6 maxes at 128k output tokens; Sonnet 4.6 at 64k. For Xhaka generating long reports or memory syntheses, use Opus.

3. **Tool use + extended thinking:** If you use tools + extended thinking together, the thinking tokens are NOT included in the tool input (they're stripped). This is by design but can be surprising when debugging.

4. **Rate limits:** Tier 1 (default): 50 RPM. For Gunner at scale, request tier upgrade proactively. Don't wait until you hit limits.

5. **Haiku 4.5 context:** Only 200k tokens — fine for call grading (calls rarely exceed 20k tokens), but can't do the long-memory operations that Sonnet/Opus can.

---

## vs GPT-4o for Gunner

| Dimension | Claude Sonnet 4.6 | GPT-4o |
|-----------|-------------------|--------|
| Call analysis quality | Slightly better nuance | Good |
| Instruction following | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Structured output | JSON mode available | Native JSON schema |
| Price | $3/$15 per MTok | $2.50/$10 per MTok |
| Context | 1M tokens | 128k tokens |

GPT-4o is slightly cheaper for call grading. For long-context work (e.g., "analyze this rep's last 6 months of calls"), Claude wins on context.

---

## Smart Use Tips

1. **For Xhaka memory synthesis:** Use 1M context to load ALL recent daily logs + MEMORY.md + project files in one shot. Let the model see everything rather than doing retrieval. At $3/MTok input, loading 100k tokens of memory = $0.30/synthesis run.

2. **Haiku for triage:** Route incoming Telegram messages through Haiku first to classify intent (is this a coding task? a strategy question? a GHL lookup?). Cost: fractions of a cent. Only use Sonnet/Opus for the actual work.

3. **Prompt caching + batch:** Combine both for maximum savings on Gunner bulk grading.

---

## Account Details
- API access via standard Anthropic API key
- Models available on AWS Bedrock and GCP Vertex AI too (useful if you want to consolidate billing)
