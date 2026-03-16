---
title: paperclip-kb-plugin-our-knowledge-base-is-already-built
learned: 2026-03-16
source: paperclip-discord
importance: 5
tags: [paperclip, knowledge-base, RAG, pgvector, hindsight, memory, episodic]
related: [paperclip.md, cognee.md, mirofish-architecture.md]
---

# Paperclip KB Plugin — We Already Have This

> Paperclip Discord proposal for a KB plugin. Key insight: we already built v1 AND v2.
> Our knowledge files are the institutional KB. Hindsight is the episodic layer we're missing.

## The Two Memory Layers

| Layer | Tool | What it stores | Who writes it | Status |
|---|---|---|---|---|
| Episodic memory | Hindsight (vectorize-io/hindsight-openclaw) | What happened in conversations | Auto-extracted | ❌ Not yet installed |
| Institutional knowledge | Our KB files (memory/context/) | What the company knows | Curated | ✅ Built |
| Simulation | MiroFish + Cognee | Relationships + predictions | System-generated | 🔄 Deferred |

## What Hindsight Does
- Local daemon: PostgreSQL + memory API in one process — no extra infra
- Auto-capture: every conversation stored after each turn
- Auto-extract: facts, entities, relationships extracted in background by gpt-4o-mini
- Auto-inject: relevant memories prepended before each agent response — no tool call needed
- Feedback loop prevention: strips its own tags before re-storing

## The Key Insight
"Memory that works automatically is qualitatively different from memory that depends on model behavior."

Our current memory: agent decides what to save, agent decides when to search. 
Hindsight: happens automatically every turn.

## Our KB Structure (Already Built as v1 + v2)
- `memory/context/books/` — 22 books with behavioral rules (v2: semantic)
- `memory/context/sim/` — 6 digital twins (v2: relational graph)
- `memory/context/technology/` — tool knowledge files (v1: keyword searchable)
- `memory/context/playbooks/` — runbooks and processes (v1: always inject)
- `LEARNINGS.md` — active behavioral rules (v1: always inject)
- `SOUL.md`, `AGENTS.md` — org structure (v1: always inject)

## Paperclip KB v1 Categories (Map to Our Files)
- Code Conventions → agents/builder.md + LEARNINGS.md
- Runbooks → memory/context/playbooks/
- Product → memory/context/sim/ + USER.md + IDENTITY.md  
- Infrastructure → TOOLS.md + memory/context/technology/
- Decisions → memory/decisions/ + key-decisions.md

## Next Steps
1. Install Hindsight → adds episodic memory layer (auto-recall from past conversations)
2. Wire our KB files as Paperclip "always inject" categories when we set up Paperclip
3. pgvector on Supabase → upgrade from keyword to semantic search (v2)
4. Cognee → full relational graph upgrade (v3, deferred)

## Build Order
1. Hindsight install (this week) — episodic memory, zero config
2. Paperclip setup (this week) — wire KB files as always-inject categories
3. pgvector on existing Supabase (next) — hybrid search
4. Cognee (when Gunner hits 100 users) — full graph
