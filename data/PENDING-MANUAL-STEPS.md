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

## 🔴 REQUIRED: Delete Railway Paperclip Service
**What:** Wrong architecture — Paperclip is not a Docker service
**Where:** railway.app → Xhaka project → paperclip service → Settings → Delete service
**Why:** Paperclip works via polling crons per agent, not as a deployed container. The ghcr.io image is private and the approach is wrong.
**After deleting:** Builder will wire polling crons properly.

## 🔴 REQUIRED: Wire Paperclip Polling Crons (Builder task — after Railway service deleted)
Each agent needs: `openclaw cron add paperclip-poll --schedule "every 10m" --session isolated --model haiku`
