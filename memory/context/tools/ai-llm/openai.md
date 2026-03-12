---
name: OpenAI
category: ai-llm
projects:
  - gunner
  - xhaka
role: Primary LLM for call grading, summaries, and intelligence jobs
auth_type: api_key
api_base_url: https://api.openai.com/v1
rate_limits:
  requests_per_minute: 3500
  tokens_per_minute: 90000
pricing_tier: pay-per-use
free_tier_limits: null
key_features:
  - GPT-4o for call grading and summaries
  - Whisper for audio transcription
  - Embeddings for semantic search
  - Structured outputs (response_format json_schema)
power_user_features:
  - Assistants API for stateful threads
  - Batch API for cost reduction (async, 50% discount)
  - Fine-tuning for domain-specific grading
known_issues:
  - Official SDK not in package.json — raw fetch() used; migrate to openai npm package
  - Rate limits hit during bulk call processing — implement queue with retry
integration_hooks:
  - Gunner: services/grading/src/openai.ts
  - Xhaka: services/intelligence/src/lib/openai.ts
alternatives:
  - anthropic/claude-sonnet-4 (already in stack)
  - google/gemini-1.5-flash (already in stack)
docs_url: https://platform.openai.com/docs
changelog_url: https://platform.openai.com/docs/changelog
last_reviewed: 2026-03-11
notes: ""
---

## Notes

Raw API usage confirmed — no official SDK installed. Batch API would cut costs ~50% for grading jobs. Monitor changelog weekly for new models and pricing changes.
