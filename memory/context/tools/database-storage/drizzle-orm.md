---
name: Drizzle ORM
category: database-storage
projects:
  - gunner
role: TypeScript ORM for Supabase/PostgreSQL — type-safe queries and schema migrations
auth_type: none
api_base_url: null
rate_limits:
  requests_per_minute: null
  tokens_per_minute: null
pricing_tier: open-source
free_tier_limits: unlimited
key_features:
  - SQL-like TypeScript query builder
  - Schema-first migrations with drizzle-kit
  - Lightweight (no heavy abstractions)
  - Supabase/neon/postgres compatible
power_user_features:
  - drizzle-kit push for rapid schema sync in development
  - Prepared statements for performance
  - JSON column support for flexible schemas
known_issues:
  - Complex joins verbose compared to Prisma
  - Smaller ecosystem than Prisma
integration_hooks:
  - Gunner: database schema and queries
alternatives:
  - prisma (more mature, heavier)
  - knex (lower-level query builder)
docs_url: https://orm.drizzle.team/docs
changelog_url: https://github.com/drizzle-team/drizzle-orm/releases
last_reviewed: 2026-03-11
notes: ""
---

## Notes

Preferred ORM for Gunner V2 due to lightweight nature and strong Supabase/postgres compatibility. Schema migrations managed via drizzle-kit. Type safety prevents schema drift at query level.
