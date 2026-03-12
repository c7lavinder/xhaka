---
name: Railway
category: dev-infrastructure
projects:
  - gunner
  - xhaka
role: Deployment platform — hosts Xhaka intelligence service and Gunner backend
auth_type: api_key
api_base_url: https://backboard.railway.app/graphql/v2
rate_limits:
  requests_per_minute: 60
  tokens_per_minute: null
pricing_tier: subscription
free_tier_limits: $5/month hobby credit
key_features:
  - Auto-deploy from GitHub on push
  - Environment variable management
  - Persistent volumes
  - Cron job scheduling via railway.toml
power_user_features:
  - TCP proxy for database connections
  - Metrics and log streaming
  - Private networking between services
known_issues:
  - nginx buffering must be disabled for SSE (X-Accel-Buffering no header required)
  - Cron expressions in railway.toml override app-level schedulers
integration_hooks:
  - API token: 107983f5-06cc-40b3-92d6-833004dee064
  - Project ID: f379b683-e34d-4e0e-a91a-f64d0ab499ea
  - Service ID: b14d0504-8190-419a-80c5-7dd64dfefcc1 (gunner-engine)
  - Environment ID: 8f2d6455-5535-43d0-b198-b1248c949c0f (production)
alternatives:
  - render (comparable, better free tier)
  - fly.io (more control, more complexity)
  - heroku (legacy, more expensive)
docs_url: https://docs.railway.app
changelog_url: https://railway.app/changelog
last_reviewed: 2026-03-11
notes: ""
---

## Notes

Full API access. Intelligence service runs here. SSE streaming requires X-Accel-Buffering: no header to prevent Railway/nginx from buffering the response. railway.toml present in services/intelligence/.
