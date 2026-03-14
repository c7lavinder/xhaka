# Article Inbox
# Add one URL per line. The researcher job processes this daily at 7:30 AM CST.
# Format: https://url.com/article  # optional note
# Lines starting with # are ignored.
---
# How to Become an AI Engineer in 6 Months
Source: pasted
Submitted: 2026-03-14
Tags: #ai-strategy #engineering #roadmap

## Content
Month 1: Python, Git, CLI, JSON/APIs/HTTP/async, SQL, pandas, FastAPI/Flask
Month 2: LLM fundamentals — prompting, system/user instructions, structured outputs, tool calling, streaming, conversation state, cost/latency/tokens, failure handling, prompt injection
Month 3: RAG — embeddings, chunking, vector DBs, metadata filtering, reranking, hallucination reduction, citations
Month 4: Agents — agent loops, tool selection, state management, retries, when NOT to use agents, evals, task success metrics
Month 5: Deployment — FastAPI prod patterns, Docker, background jobs, queues, auth, logging, observability, prompt versioning, cost monitoring, caching
Month 6: Specialize — choose Direction 1 (AI product engineer: LLM apps/RAG/agents/deployment), Direction 2 (Applied ML: fine-tuning/evals/open-source), or Direction 3 (AI automation: workflow orchestration/business process/multi-tool systems/CRM/ops)

Key principle: learn each topic then immediately test in real work. By month 6 you'll have built products you can show.
---
# Manus RAG Build Prompt — Gunner AI Platform
Source: pasted
Submitted: 2026-03-14
Tags: #gunner #rag #ai-architecture #build-prompt

## Content
Task: Build RAG system into Gunner AI platform (MANUS-Gunner-AI repo).

4 data sources needed:
1. Call library — embed all graded calls >60s so AI can reference real NAH examples when coaching
2. Coach conversation memory — embed every Q&A so AI builds on past answers
3. Team action tracking — track whether team completed/dismissed/modified AI-suggested tasks
4. Conversion intelligence — analyze which call behaviors correlate with closed deals, inject patterns into coaching prompts

Technical: TiDB/MySQL (no pgvector), store embeddings as JSON text, cosine similarity in JS, OpenAI text-embedding-3-small (1536 dims), everything tenant-scoped.

Success: AI coach auto-retrieves 3 similar past calls + 2 prior answers when responding, conversion patterns visible in coaching system, backfill script for historical calls.
---
# Claude as Chief of SEO — 8-Part Local SEO Prompt System
Source: pasted (Sarvesh / Alventramarketing.com)
Submitted: 2026-03-14
Tags: #seo #local-seo #google-business-profile #ai-systems #prompt-engineering

## Content
8-part local SEO system using AI as Chief of SEO. Load business context once, never repeat. Key prompts:

1. GBP Category Audit — competitors' primary/secondary categories vs yours. Adding one category can unlock new map pack rankings.
2. GBP Attributes Audit — extract every attribute (veteran-owned, 24/7, free estimates) competitors have that you're missing.
3. Competitor Review Teardown — review velocity matters more than total count. Track reviews/month and what customers mention (keywords + neighborhoods).
4. Review Response Strategy — keyword-rich responses are free SEO real estate. Template system: 5-star, 4-star, 3-star, 1-2 star variants.
5. GBP Posts Strategy — competitors aren't posting. 2-3x/week with neighborhood-specific content builds local authority.
6. Services Section Optimization — service descriptions are the only copy you control on GBP. Cross-reference site vs GBP for gaps.
7. GBP Description Optimization — 750 chars of prime real estate. Test 3 versions: keyword-focused, conversion-focused, balanced.
8. GBP Photo Audit — consistency beats volume. 3-5 quality photos/week signals active business. Before-afters, team, trucks in neighborhoods.

Key principle: AI does the research in minutes. Human makes the strategic decisions. Load context once, every prompt gets sharper.
Execution order: Week 1 (categories + attributes) → Week 2 (services + description) → Week 3 (reviews) → Week 4+ (posts + photos, ongoing).
---
# Claude Skills 2.0 — Reusable AI Workflows (Article 1)
Source: pasted (Julian Goldie SEO)
Submitted: 2026-03-14
Tags: #ai-systems #automation #workflow-design #skill-building

## Content
Claude Skills 2.0 converts prompts into reusable workflow modules via skill.md files.
skill.md structure: description → numbered steps → examples → rules/constraints.
Composability: skills stack into pipelines. One input triggers multiple automated steps.
Evaluation system: test with sample inputs before going live.
Auto-refinement: Claude modifies its own skill.md when evaluation finds problems — self-improving feedback loop.
Benchmarking: run same workflow multiple times, compare outputs for consistency. High variance = instructions need improvement.
Key shift: from one-off prompts to structured, reusable, testable automation systems.
Application: our intelligence pipeline (session-capture → daily-log → organize → scribe) IS a skill stack. Missing: evaluation layer and benchmarking.

---
# Claude Skills 2.0 — Reusable AI Workflows (Article 2, expanded version)
Source: pasted (Julian Goldie SEO)
Submitted: 2026-03-14
Tags: #ai-systems #automation #workflow-design #skill-building

## Content
Same core framework. Additional emphasis on: self-improving workflows reduce maintenance burden at scale. Teams building tested workflows move faster than competitors. Early adoption of composable skill systems creates compounding advantage.
Key quote: "Instead of guessing whether the instructions work, the system verifies them through evaluation."
