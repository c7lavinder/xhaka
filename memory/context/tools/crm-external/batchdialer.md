---
name: BatchDialer
category: crm-external
projects:
  - xhaka
role: Outbound calling platform — pulls call metrics for KPI entry
auth_type: api_key
api_base_url: https://api.batchdialer.com
rate_limits:
  requests_per_minute: 60
  tokens_per_minute: null
pricing_tier: subscription
free_tier_limits: null
key_features:
  - Predictive and power dialing
  - Call recording
  - Real-time call metrics
  - Agent performance reporting
known_issues:
  - BatchDialer sync had rate limit backoff failure (Mar 10 — marked fail)
  - Deduplication by call SID needs re-test after fix
integration_hooks:
  - Xhaka: API key d98ac867-62b7-439d-8d72-a19004a93e25
  - Purpose: read call metrics for KPI Entry job
alternatives:
  - callrail (already in stack, different use case)
docs_url: https://docs.batchdialer.com
changelog_url: https://batchdialer.com/updates
last_reviewed: 2026-03-11
notes: ""
---

## Notes

API access is read-only for KPI metrics. Rate limit issue identified Mar 10 — backoff logic needed. Deduplication by call SID was failing; fix pending Builder re-test.
