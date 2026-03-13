# pgvector

## What It Is
A PostgreSQL extension that adds vector similarity search, enabling embedding-based queries directly in the database.

## How Corey Uses It
Powers the semantic memory layer for Gunner and Xhaka — storing embeddings of call transcripts, lead notes, and agent memory chunks so AI agents can retrieve contextually relevant data without leaving the Supabase stack. Enable via `create extension vector;` in Supabase SQL editor.

## Pricing
Free — open-source extension. Runs inside Supabase at no additional cost.

## Key Links
- Docs: https://github.com/pgvector/pgvector#readme
- Changelog: https://github.com/pgvector/pgvector/releases
- GitHub: https://github.com/pgvector/pgvector

## Alternatives Worth Watching
- Pinecone — managed vector DB, simpler ops but adds cost and another service to maintain
- Qdrant — high-performance vector DB, worth watching if pgvector hits scale limits

## Last Updated
2026-03-13
