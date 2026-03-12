---
name: Stripe
category: payments
projects:
  - gunner
role: Payment processing for Gunner SaaS subscriptions
auth_type: api_key
api_base_url: https://api.stripe.com/v1
rate_limits:
  requests_per_minute: 100
  tokens_per_minute: null
pricing_tier: pay-per-use
free_tier_limits: null
key_features:
  - Subscription billing (monthly/annual)
  - Checkout Sessions for hosted payment pages
  - Customer portal for self-serve subscription management
  - Webhooks for payment events
power_user_features:
  - Usage-based billing for per-call-graded pricing
  - Stripe Tax for automatic sales tax
  - Connect for multi-tenant marketplace (future)
known_issues:
  - Not yet integrated — Gunner is pre-monetization
  - Webhook endpoint needs to be registered before go-live
integration_hooks:
  - Gunner: planned for subscription gating
alternatives:
  - lemon squeezy (simpler for indie SaaS, built-in affiliate)
  - paddle (better for international/VAT)
docs_url: https://stripe.com/docs
changelog_url: https://stripe.com/blog/changelog
last_reviewed: 2026-03-11
notes: ""
---

## Notes

Pre-integration stage. When Gunner is ready to monetize, wire up Checkout + Customer Portal first. Consider usage-based billing (per call graded) as a compelling pricing model for wholesale teams.
