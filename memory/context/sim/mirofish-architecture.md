---
title: mirofish-document-to-simulation-is-the-pattern-worth-building
learned: 2026-03-16
source: article
importance: 5
tags: [simulation, digital-twins, graphrag, oasis, multi-agent, god-view, deferred]
related: [twin-kyle.md, twin-daniel.md, twin-chris.md, environment.md]
status: DEFERRED — build when Gunner hits 100 users
---

# MiroFish Architecture — The God View Engine

> Built by Guo Hangjiang (BaiFu), 20 years old, Beijing. 10 days. $4.1M committed.
> One undergraduate. One simulation engine. #1 on GitHub global trending March 7, 2026.

## What It Does (Core Pipeline)

```
Document → GraphRAG → Knowledge Graph → Agent Generation → OASIS Simulation → God's Eye View
```

1. **Ingest** — feed any document (article, policy, novel, financial report)
2. **Extract** — GraphRAG pulls every entity + relationship into a knowledge graph
3. **Generate** — spawn thousands of AI agents, each with unique biography, personality, social connections, behavioral logic
4. **Simulate** — OASIS engine runs the agents: they form groups, develop opinion leaders, create herd effects, shift positions over time
5. **Inject** — "God's Eye View": drop a variable into the running simulation
6. **Observe** — watch the entire digital world reorganize in real time

## Tech Stack (All Open Source)
- **Simulation engine:** OASIS (by CAMEL-AI) — agents that form groups, develop leaders, create herd effects
- **Memory:** Zep Cloud — long-term agent memory that persists across simulation steps
- **Knowledge graphs:** GraphRAG — relational entity extraction, not flat files
- **Deploy:** Docker Compose one-click setup
- **License:** AGPL-3.0 — fully open source, forkable
- **Repo:** github.com/666ghj/MiroFish

## Real Demos
1. **Dream of the Red Chamber** — loaded first 80 chapters of a classical Chinese novel with a lost ending. Generated character agents with authentic personalities. Simulated the missing conclusion.
2. **Fed Rate Hike** — simulated how retail investors, institutional players, and analysts each react. Tracked where group sentiment converges. Mapped full opinion trajectory.

## Why This Matters for Xhaka

### Our Current State
- 5 Digital Twins: Kyle, Daniel, Chris, Esteban, Seller Persona (flat markdown files)
- Knowledge graph: flat markdown files in memory/context/
- No simulation engine yet

### The MiroFish Upgrade Path
1. **GraphRAG layer** — upgrade from flat markdown to relational graph. Every knowledge file becomes a node with typed relationships to other nodes. "Kyle closes on rapport" → links to "motivated seller decides in first 3 minutes on trust" → links to "Chris self-image ceiling at 36%"
2. **OASIS simulation backbone** — drop in via Docker Compose. Already open source.
3. **Zep Cloud for twin memory** — Digital Twins gain persistent memory across simulation runs
4. **God's Eye View for NAH/Gunner** — inject a scenario, watch the twins respond

### Scenario Examples (When Ready)
- "Nashville wholesale deals dry up for 90 days" → how does each team member respond? Where does the pipeline break?
- "Gong drops to $29/month" → how do Gunner prospects respond? What's the churn risk?
- "Chris gets coaching from Psycho-Cybernetics framework" → simulate his self-image shift and score trajectory
- "Interest rates spike 2%" → how does motivated seller behavior change? What deal structures still work?

## The Honest Constraints
- No published benchmarks comparing predictions to real outcomes (illustrations, not evidence)
- Massive LLM API costs at scale (thousands of agents = thousands of API calls)
- Agent personalities inherit training data biases
- Simulated humans ≠ real humans — surfaces scenarios you might miss, doesn't deliver certainties

## The Super-Individual Thesis
Chen Tianqiao's bet: one person with AI leverage can build what used to require an entire company.
Guo proved it in 10 days.
This is the Gunner thesis too. One vertical SaaS, one founder, AI as force multiplier.

## Build Order (When We Have Capacity)
1. GraphRAG layer on existing knowledge graph (upgrade memory/context/ from flat to relational)
2. Fork MiroFish + wire to our Digital Twins as seed agents
3. OASIS via Docker Compose on Railway
4. Zep Cloud API key + wire to twin memory
5. God's Eye View interface — simple input + visualization

**Status: DEFERRED — focus is data collection first. Revisit when Gunner hits 100 users.**
