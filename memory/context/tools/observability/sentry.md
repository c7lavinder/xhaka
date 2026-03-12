---
name: Sentry
category: observability
projects:
  - gunner
role: Error tracking — auto-creates GitHub issues when prod breaks
auth_type: dsn
api_base_url: https://sentry.io/api
rate_limits:
  requests_per_minute: null
  tokens_per_minute: null
pricing_tier: free-tier
free_tier_limits: 5000 errors/month, 50 replays/month
key_features:
  - Real-time error capture with stack traces
  - GitHub integration — auto-create issues on new errors
  - Performance monitoring (transactions, spans)
  - Release tracking with source maps
power_user_features:
  - Crons monitoring for scheduled job health checks
  - Uptime monitoring
  - Code coverage tracking
known_issues:
  - DSN missing from prod env was flagged as critical by Auditor (Mar 09)
  - Fix verified by Builder Mar 09 — test error thrown and captured
integration_hooks:
  - Gunner: @sentry/node SDK
  - DSN: https://bf7b317b546428d656836b66e2642c6c0e4511015785988096.ingest.us.sentry.io/4511015798243328
  - Login: corey@newagainhouses.com
alternatives:
  - rollbar (simpler setup)
  - bugsnag (better mobile support)
docs_url: https://docs.sentry.io
changelog_url: https://sentry.io/changelog
last_reviewed: 2026-03-11
notes: ""
---

## Notes

Project created, DSN wired Mar 09. Critical gap (missing DSN in prod) patched. Consider enabling Crons monitoring for intelligence service jobs — provides automatic dead man's switch alerting if daily jobs stop running.
