---
name: Loops
category: email
projects:
  - gunner
role: Transactional and drip email platform for Gunner user communications
auth_type: api_key
api_base_url: https://app.loops.so/api/v1
rate_limits:
  requests_per_minute: 10
  tokens_per_minute: null
pricing_tier: subscription
free_tier_limits: 1000 contacts free
key_features:
  - Drip email sequences
  - Transactional emails (welcome, password reset)
  - Audience segmentation
  - Event-triggered campaigns
power_user_features:
  - Loops.so SDK for Node.js
  - Contact properties for personalization
  - Unsubscribe management (CAN-SPAM compliant)
known_issues:
  - Drip sequence NOT YET ACTIVE — flagged by Architect
  - LOOPS_API_KEY not confirmed in Railway env vars
integration_hooks:
  - Gunner: planned for user onboarding and weekly digest
alternatives:
  - resend (more developer-focused, simpler API)
  - sendgrid (enterprise, more complex)
docs_url: https://loops.so/docs
changelog_url: https://loops.so/changelog
last_reviewed: 2026-03-11
notes: ""
---

## Notes

⚠️ FLAGGED: Drip not yet active. Confirm LOOPS_API_KEY in Railway environment. Wire up welcome email on user signup as first integration. Event taxonomy from PostHog can drive segmentation.
