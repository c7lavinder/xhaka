# Hindsight

## Database Migration Required

Before semantic search can work, run the pgvector migration in Supabase SQL editor:

**URL:** https://tvjkgumckwapybpjyrkw.supabase.co/project/tvjkgumckwapybpjyrkw/sql

**File:** `services/intelligence/migrations/001_pgvector.sql`

Copy the contents of that file and execute it. This enables:
- `vector` extension (pgvector)
- `knowledge_embeddings` table
- `ivfflat` cosine similarity index
- `match_knowledge()` RPC function for semantic queries
