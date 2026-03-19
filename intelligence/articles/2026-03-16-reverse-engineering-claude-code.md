# Reverse Engineering Claude Code — Full Analysis

**Source:** Pasted  
**Published:** 2026-03-16  
**Relevance Score:** 9/10  
**Tags:** claude-code, prompt-engineering, system-prompt, tengu-flags, ai-architecture

## Summary
Claude Code's system prompt is 15+ modular sections assembled at runtime. "Tengu" = internal feature flag system (37 flags via GrowthBook/Statsig, 560 telemetry events via OpenTelemetry → Datadog). Anthropic ships features into binary weeks before enabling publicly.

## Key Insights
- System prompt collapses to 1 sentence with CLAUDE_CODE_SIMPLE=true
- 15-20k tokens of scaffolding per turn before user says anything
- Bash sandbox is real — genuine allow/deny + network restrictions
- "The binary is packaging. The prompt is the product."
- CVE-2025-59536 + CVE-2026-21852 — prompt injection → shell execution vulnerabilities

## Why It Matters
Understanding Claude Code's architecture makes Builder prompts more effective and reveals what the agent is actually doing under the hood.
