---
name: PostHog
category: observability
projects:
  - gunner
role: Product analytics — tracks how team uses Gunner, feature usage, drop-offs
auth_type: api_key
api_base_url: https://us.posthog.com
rate_limits:
  requests_per_minute: 1000
  tokens_per_minute: null
pricing_tier: free-tier
free_tier_limits: 1M events/month free
key_features:
  - Event tracking with properties
  - Session recordings
  - Feature flags
  - Funnels, retention, and cohort analysis
power_user_features:
  - Data pipelines to Supabase/S3
  - A/B testing with feature flags
  - SQL access to event data (paid)
known_issues:
  - Account created but not yet wired into Gunner codebase
  - Event taxonomy designed (call_graded, playbook_opened, lead_viewed) but not instrumented
integration_hooks:
  - Gunner: posthog-node SDK (or posthog-js for frontend)
  - Project token: phc_FEpR6FvjwCN5ZqUDVn0Y9yCxdpCf7iXPQz1bUs07gcZ
  - Project ID: 336916
  - Region: US Cloud
alternatives:
  - mixpanel (more powerful analytics, higher cost)
  - amplitude (enterprise analytics)
docs_url: https://posthog.com/docs
changelog_url: https://posthog.com/changelog
last_reviewed: 2026-03-11
notes: ""
---

## Notes

Account created, project token and ID confirmed. Builder wired 4 events into Gunner frontend (Mar 09) — call_graded, playbook_opened, lead_viewed, and one more. Event taxonomy finalized by Researcher. Next step: verify events arriving in PostHog UI.
