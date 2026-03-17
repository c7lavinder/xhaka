# Environment Variables — xhaka-intelligence

## Existing

See Railway xhaka-intelligence service for current env vars.

## New (KB v2 — pgvector semantic search)

| Variable | Value | Notes |
|---|---|---|
| `SUPABASE_URL` | `https://tvjkgumckwapybpjyrkw.supabase.co` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | *(from Supabase dashboard)* | Settings → API → service_role key (secret) |

**Set these in Railway:** xhaka-intelligence service → Variables tab.

> ⚠️ `SUPABASE_SERVICE_KEY` bypasses Row Level Security — server-side only, never expose client-side.

## Also Required (if not already set)

| Variable | Purpose |
|---|---|
| `OPENAI_API_KEY` | Used by `embedText()` in embeddings.ts (text-embedding-3-small) |
