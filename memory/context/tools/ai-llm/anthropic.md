# Anthropic / Claude

**Category:** AI & LLM
**Status:** 🟢 Active (Xhaka runtime)

## Purpose
Xhaka runs on Claude Sonnet (via OpenClaw). Used for strategic reasoning, session memory capture, agent orchestration.

## Current Models
- Claude Sonnet 4.5: Xhaka's default. Best balance of intelligence + speed + cost for COO-level work.
- Claude Opus 4: Highest capability. Use for complex architectural decisions, not routine tasks.
- Claude Haiku 3.5: Fastest, cheapest. Good for simple classification, quick lookups.

## When to Use Anthropic vs OpenAI in Gunner
- Use OpenAI for: transcription (Whisper), embeddings, high-volume grading
- Use Anthropic for: complex coaching analysis, nuanced feedback, anything requiring reasoning chains

## Gotchas
- Claude has strong safety filters — aggressive coaching language may get softened. Test prompts before deploying.
- 200k context window on Sonnet/Opus — can fit entire call histories in one prompt.

## Smart Tip
For Gunner's AI coach: Claude Sonnet produces more nuanced, empathetic coaching feedback than GPT-4o. Worth testing on the coaching response quality.

## Configuration
- Managed by OpenClaw runtime
- Docs: https://docs.anthropic.com
