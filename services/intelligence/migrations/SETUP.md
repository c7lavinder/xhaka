# Database Migrations

## 001_pgvector — Knowledge Embeddings

Run in Supabase SQL editor: https://tvjkgumckwapybpjyrkw.supabase.co/project/tvjkgumckwapybpjyrkw/sql

Copy contents of `001_pgvector.sql` and execute.

This enables:
- pgvector extension
- knowledge_embeddings table
- ivfflat index for fast cosine similarity search
- match_knowledge() function for semantic queries
