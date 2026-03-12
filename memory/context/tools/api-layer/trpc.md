---
name: tRPC
category: api-layer
projects:
  - gunner
role: End-to-end typesafe API layer between Gunner frontend and backend
auth_type: none
api_base_url: null
rate_limits:
  requests_per_minute: null
  tokens_per_minute: null
pricing_tier: open-source
free_tier_limits: unlimited
key_features:
  - Full TypeScript type safety from server to client (no code gen)
  - React Query integration for data fetching
  - Subscriptions via WebSocket or HTTP
  - Middleware for auth, logging
power_user_features:
  - Input validation with Zod
  - Context propagation (auth, db)
  - Batching multiple queries in one HTTP request
known_issues:
  - tRPC v11 has breaking changes from v10 — check migration guide before upgrading
integration_hooks:
  - Gunner: @trpc/server + @trpc/client
alternatives:
  - graphql (more flexible, more complexity)
  - openapi + zod (better for public APIs)
docs_url: https://trpc.io/docs
changelog_url: https://github.com/trpc/trpc/releases
last_reviewed: 2026-03-11
notes: ""
---

## Notes

Preferred API layer for Gunner V2 internal routes. Eliminates API schema drift between frontend and backend. v11 released — check breaking changes before upgrade.
