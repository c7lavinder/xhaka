---
name: Supabase
category: database-storage
projects:
  - gunner
role: PostgreSQL database backend for Gunner V2 — calls, analysis results, users
auth_type: api_key
api_base_url: https://tvjkgumckwapybpjyrkw.supabase.co
rate_limits:
  requests_per_minute: 1000
  tokens_per_minute: null
pricing_tier: free-tier
free_tier_limits: 500MB storage, 2GB bandwidth/month, 50k monthly active users
key_features:
  - Managed PostgreSQL with REST API
  - Row Level Security (RLS) policies
  - pgvector extension for embeddings
  - Realtime subscriptions
  - Storage for audio/media files
power_user_features:
  - Edge Functions (Deno runtime)
  - pg_cron for scheduled jobs within Postgres
  - Supabase Auth (JWT-based)
known_issues:
  - pgvector extension needs manual enable via SQL editor (CREATE EXTENSION vector)
  - Free tier pauses after 1 week of inactivity
integration_hooks:
  - Gunner: @supabase/supabase-js client
  - Project URL: https://tvjkgumckwapybpjyrkw.supabase.co
  - Publishable key stored in TOOLS.md
alternatives:
  - neon (serverless postgres, cheaper at scale)
  - planetscale (MySQL, less relevant for vector workloads)
docs_url: https://supabase.com/docs
changelog_url: https://supabase.com/changelog
last_reviewed: 2026-03-11
notes: ""
---

## Notes

Gunner V1.5 project created. Schema migration done — calls table and analysis_results FK established. RLS policies validated by Auditor (Mar 10). Enable pgvector before V2 embedding features go live.
