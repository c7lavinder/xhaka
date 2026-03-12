---
name: Google Gemini
category: ai-llm
projects:
  - gunner
  - xhaka
role: Free-tier LLM for Gunner V2 timeline and motivation analysis
auth_type: api_key
api_base_url: https://generativelanguage.googleapis.com/v1beta
rate_limits:
  requests_per_minute: 1500
  tokens_per_minute: null
pricing_tier: free-tier
free_tier_limits: 1500 requests/day (gemini-1.5-flash)
key_features:
  - gemini-1.5-flash for high-volume, cost-sensitive tasks
  - 1M token context window
  - Multimodal (text + vision)
power_user_features:
  - Grounding with Google Search
  - Code execution
known_issues:
  - Free tier quota resets daily — no burst handling beyond 1500 RPD
integration_hooks:
  - Gunner: services/intelligence (timeline + motivation analyzers)
  - API key: AIzaSyChM6aVZ-l-L8dK9VkDnoeXyCLWhonbypY
alternatives:
  - openai/gpt-4o-mini (cheaper paid tier)
docs_url: https://ai.google.dev/docs
changelog_url: https://ai.google.dev/gemini-api/docs/changelog
last_reviewed: 2026-03-11
notes: ""
---

## Notes

Using free tier (1,500 req/day) — covers current NAH volume. If Gunner scales to multi-tenant, move to paid tier. API key sourced from Google AI Studio.
