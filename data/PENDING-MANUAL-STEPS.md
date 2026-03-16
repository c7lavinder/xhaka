# Pending Manual Steps

## 🔴 REQUIRED: Supabase pgvector Migration
**What:** Enable semantic search on knowledge base
**Where:** https://tvjkgumckwapybpjyrkw.supabase.co/project/tvjkgumckwapybpjyrkw/sql
**SQL file:** `services/intelligence/migrations/001_pgvector.sql`
**Steps:**
1. Open Supabase SQL editor at URL above
2. Copy contents of `001_pgvector.sql`
3. Click Run
4. Confirm: `knowledge_embeddings` table exists
**Why it matters:** Without this, kb-indexer fails silently at 2 AM and books/knowledge never become searchable.

## Status
- [ ] pgvector migration run
- [ ] SUPABASE_SERVICE_KEY set in Railway xhaka-intelligence env vars
