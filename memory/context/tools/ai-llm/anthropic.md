---
name: Anthropic
category: ai-llm
projects:
  - xhaka
role: Intelligence jobs, synthesis, and strategic reasoning via Claude
auth_type: api_key
api_base_url: https://api.anthropic.com/v1
rate_limits:
  requests_per_minute: 1000
  tokens_per_minute: 80000
pricing_tier: pay-per-use
free_tier_limits: null
key_features:
  - claude-sonnet-4-6 for Xhaka intelligence subagents
  - 200k context window for large document analysis
  - Tool use / function calling
power_user_features:
  - Extended thinking for complex reasoning tasks
  - Computer use (beta) for browser automation
known_issues:
  - Slower TTFT vs OpenAI on short completions
integration_hooks:
  - Xhaka: OpenClaw default model (anthropic/claude-sonnet-4-6)
alternatives:
  - openai/gpt-4o (already in stack)
  - google/gemini-1.5-flash (already in stack)
docs_url: https://docs.anthropic.com
changelog_url: https://www.anthropic.com/news
last_reviewed: 2026-03-11
notes: ""
---

## Notes

Current default model for Xhaka OpenClaw runtime. 200k context window makes it ideal for large memory synthesis tasks. Monitor for claude-sonnet-5 release.
