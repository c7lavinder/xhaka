---
name: LangSmith
category: observability
projects:
  - gunner
  - xhaka
role: AI observability — tracks every AI agent call, debug traces, and performance monitoring
auth_type: api_key
api_base_url: https://api.smith.langchain.com
rate_limits:
  requests_per_minute: null
  tokens_per_minute: null
pricing_tier: free-tier
free_tier_limits: 5000 traces/month
key_features:
  - Trace every LLM call with inputs, outputs, latency, cost
  - Prompt versioning and A/B testing
  - Dataset and evaluation management
  - Human feedback collection
power_user_features:
  - LangChain integration (automatic tracing)
  - Custom evaluators for call grading quality
  - Shared trace links for debugging with team
known_issues:
  - Not yet integrated — LangSmith tracing guide researched (Mar 09) but not wired in
integration_hooks:
  - Xhaka: API key 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
  - Login: xhakalavinder@gmail.com
alternatives:
  - helicone (simpler proxy-based tracing)
  - braintrust (better eval framework)
docs_url: https://docs.smith.langchain.com
changelog_url: https://smith.langchain.com/changelog
last_reviewed: 2026-03-11
notes: ""
---

## Notes

Account exists, API key confirmed. LangSmith trace viewer widget designed by Architect (Mar 09). Tracing guide researched. Next step: wire LANGCHAIN_TRACING_V2=true and LANGCHAIN_API_KEY into Gunner env, then verify traces appear.
