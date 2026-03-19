# Manus RAG Build Prompt — Gunner AI Platform

**Source:** Pasted (internal)  
**Published:** 2026-03-14  
**Relevance Score:** 10/10  
**Tags:** gunner, rag, ai-architecture, build-prompt, embeddings

## Summary
RAG system spec for Gunner. 4 data sources: call library (embed graded calls >60s), coach conversation memory, team action tracking, conversion intelligence. TiDB/MySQL with JSON embeddings, cosine similarity in JS, OpenAI text-embedding-3-small.

## Key Insights
- All embeddings tenant-scoped
- AI coach auto-retrieves 3 similar past calls + 2 prior answers when responding
- Conversion patterns visible in coaching system
- Backfill script needed for historical calls

## Status
Build prompt created 2026-03-14. Implementation status: check with Builder.
