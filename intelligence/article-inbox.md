# Article Inbox
# Add one URL per line. The researcher job processes this daily at 7:30 AM CST.
# Format: https://url.com/article  # optional note
# Lines starting with # are ignored.
---
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
---
# Self-Improving Skills — cognee-skills Framework
Source: pasted (cognee)
Submitted: 2026-03-14
Tags: #ai-systems #skill-improvement #self-repair #workflow-design

## Content
Skills degrade silently. A skill that worked last month fails when the model, codebase, or task patterns shift — and nobody knows until output is already bad.

The self-improvement loop: **ingest → observe → inspect → amend → evaluate**

1. Ingest — store skills with semantic meaning, task patterns, relationships (not just flat files)
2. Observe — after every run, log: what task was attempted, which skill ran, success/fail, error, user feedback
3. Inspect — once failures accumulate, trace recurring factors behind bad outcomes
4. Amend (.amendify()) — propose targeted instruction change grounded in failure evidence. Human review or auto-apply.
5. Evaluate — did the amendment improve outcomes? If not, roll back. Every change is tracked with rationale and results.

Key principle: the loop must be observe → inspect → amend → **evaluate**. Self-improvement without evaluation is uncontrolled modification. Every amendment must prove it worked or get reverted.

Our current state: have ingest ✅, basic observe ✅ (job-registry), amend in progress ✅ (proposed-changes). Missing: inspect (linking failures to specific instructions) + evaluate (did the amendment improve outcomes?).
---
# How to Invest in the AI Gold Rush
Source: pasted (@aiedge_)
Submitted: 2026-03-14
Tags: #ai-investing #wealth-building #strategy #career

## Content
AI is the biggest wealth-creation moment in history — bigger than internet, mobile, crypto combined. Two groups: those who act vs those who watch.

**Framework: Pick-and-Shovels vs Second-Order Beneficiaries**
- Pick-and-shovels: win as AI is BUILT (NVIDIA, cloud infra, semiconductors, copper/metals)
- Second-order: win as AI is USED (companies whose revenue grows from AI adoption)
- Key question: "Does this make more money because AI is being built OR because AI is being used?"

**Investment vehicles (low → high risk):**
1. ETFs — diversified exposure, no stock-picking required
2. Individual stocks — concentration risk, direct upside
3. Early-stage startups — most fail, a few become the next NVIDIA
4. VC funds — diversified startup exposure, requires accreditation
5. Crypto x AI — AI agent tokens, decentralised compute networks

**The highest ROI investment: your own skills**
- $10k in AI ETF → $1,500-2,000/yr return
- $10k in AI education → potentially $50-100k/yr if packaged correctly
- Downside is zero — you can't lose skills you build
- The skill gap IS the wealth opportunity

**Corey context:** He's already on the right side of this. Building Gunner (AI SaaS), running AI-powered ops (Xhaka), investing in AI infrastructure. He's not watching — he's building. The article validates his direction.
---
# Karpathy's Autoresearch — Autonomous Improvement Harness
Source: pasted (manthanguptaa.in)
Submitted: 2026-03-14
Tags: #ai-systems #autonomous-agents #harness-design #self-improvement

## Content
Autoresearch treats AI research as a bounded optimization problem, not open-ended exploration.
Loop: edit one file → run experiment for fixed time → measure result → keep if better, revert if not → repeat.

**5 core lessons for agent builders:**
1. Constraints make agents better. One file, one metric, one harness. More freedom = larger error surface. Most agents fail because they maximize freedom too early.
2. Prompts are architecture. program.md defines workflow, boundaries, persistence, logging, recovery, selection criteria. That IS system design.
3. Optimize the harness, not just the model. How work is launched, failures handled, progress measured, bad paths rolled back, state recorded — this matters as much as model intelligence.
4. Time-bounded evaluation is underrated. Fixed wall-clock budget forces optimization for real-world usefulness, not idealized performance.
5. Reversibility and observability are non-negotiable. Losers must be cheap to discard. Every run must be inspectable. If a bad run leaves the system unrecoverable, the agent can't explore aggressively.

**Key principle:** "The best autonomous systems are not the ones with the most freedom. They are the ones with the clearest objective, the strongest harness, and the cheapest failure mode."

**Direct application to Xhaka:**
- Our harness equivalent = job-registry + evaluation-log + proposed-changes pipeline
- We need: one clear metric per job, time-bounded runs, cheap rollback when a change makes things worse
- The "keep or reset" mechanism maps directly to: proposed change → evaluate → approve/reject
- program.md equivalent = SOUL.md + ROUTING.md + agent definitions — this IS the architecture
---
# 5 Files That Make AI Work Without You (OpenClaw Setup Guide)
Source: pasted (founderfunnel.com / Sharbel)
Submitted: 2026-03-14
Tags: #openclaw #ai-systems #agent-setup #memory #autonomy

## Content
The 5 files that separate an AI that waits vs one that works:

1. **SOUL.md** — agent identity, personality, hard rules. Without it: generic corporate mode. With it: actual character with opinions, brevity, and judgment.
2. **USER.md** — everything the agent needs to know about you so it never asks. Name, timezone, goals, communication style, key contacts.
3. **MEMORY.md** — durable long-term knowledge. Hard rules, past decisions, lessons learned, API keys. Loaded every session.
4. **TOOLS.md** — practical access guide. Key apps, IDs, URLs, shortcuts, where everything lives.
5. **HEARTBEAT.md** — scheduled autonomous pulse. Agent wakes up, works through checklist, alerts if needed, stays silent if not. You don't ask — it just checks.

**Key insight:** These files don't make the AI smarter. They give it context to be useful without constant hand-holding. The files are the architecture. The AI is just the engine.

**What working autonomy looks like:** Wake up to a Telegram message — market summary, tweet drafts scored by bookmark potential, bot status, flagged emails, calendar prep. Didn't ask for any of it.

**How to build it:** Start with SOUL.md (highest ROI). Add USER.md basics. Grow MEMORY.md from mistakes. Build TOOLS.md incrementally. Start HEARTBEAT.md with 2-3 checks.

**Corey assessment:** We have all 5 files. The gap is depth and automation. HEARTBEAT.md is too passive — it's a checklist, not a proactive worker. The autonomous push behavior (Telegram messages without being asked) is what we're building now with the notification layer.

---
title: Niantic's 30 Billion Image Flywheel — Pokémon Go to Robot Navigation
source: news/niantic
date: 2026-03-15
tags: [data-flywheels, niantic, ai-training, visual-navigation, stealth-data-collection]
---
# Niantic's 30 Billion Image Flywheel — Pokémon Go to Robot Navigation

Niantic leveraged 500M Pokémon Go players to scan the real world, resulting in a dataset of 30 billion geo-tagged images. This data is now being used to train a 3D AI map that allows delivery robots and AR apps to navigate with centimeter-level precision without relying on GPS.

## The Strategy: Stealth Data Collection
- **Gamified Collection:** Users "played" while Niantic "collected." The game was the interface for a global mapping operation.
- **Data Repurposing:** Data collected for a monster-catching game is now powering autonomous robotics and precision logistics.
- **Accuracy:** Visual navigation within centimeters, far exceeding standard GPS.

## The Lesson
The best data collection doesn't feel like work. It's a byproduct of an engaging user experience (UX) that creates a secondary, much more valuable asset.
---
title: Building AI Agents with Claude — The Full Course
source: article/course
date: 2026-03-15
tags: [ai-agents, claude-code, mcp, agent-teams, orchestration, systems-architecture]
---
# Building AI Agents with Claude — The Full Course

A complete breakdown of the Claude Agent stack, from single-agent loops to multi-agent parallel teams.

## The Agent Loop
Think → Act → Observe → Repeat. An agent takes ownership of an outcome, not just a turn-based question.

## The 4 Layers of the Stack
1. **Claude Code:** The terminal agent for direct filesystem/terminal control.
2. **Claude Agent SDK:** The engine (loop/tools/context) exposed for custom app development.
3. **MCP (Model Context Protocol):** The connection layer for external tools (GitHub, DBs, browsers).
4. **Agent Teams:** Multi-agent orchestration for parallel specialized workflows.

## Critical Test: Chat vs. Agent
- Single question/answer → Chat.
- Multiple steps/iteration/tool usage → Agent.
- Parallel components/specialists needed → Multi-agent.
- Rule: If you are copy-pasting Claude output back into Claude for the next step, you need an agent.

## Implementation Notes for Xhaka
- We are currently using Layer 4 (Agent Teams) for Xhaka (Builder, Researcher, Auditor).
- We are moving toward direct Layer 1 (Claude Code) integration for the Builder on Wednesday.
---
title: Claude + Obsidian — The Memory Stack That Compounds
source: pasted
date: 2026-03-16
tags: [memory-architecture, obsidian, context-management, ai-systems, knowledge-graphs, session-continuity]
---
# Claude + Obsidian — The Memory Stack That Compounds

Teams lose 30-40 min/session re-explaining context. That's a full workday per week. The fix isn't a bigger context window — it's a memory system.

## The Core Problem: Context Amnesia
- Every session starts from zero
- 200k token windows don't solve this — scanning is not knowing
- Cowan's research: active attention = 4 chunks ± 1. Structure beats volume.
- Symptoms: re-asks answered questions, proposes rejected patterns, loses 3-session-old decisions

## The 3-Layer Architecture
```
Layer 3: Ingestion Pipeline — video/audio → structured knowledge
Layer 2: Knowledge Graph   — obsidian vault + MCP bridge
Layer 1: Session Memory    — CLAUDE.md + auto-memory directory
```
They compound. Skip one, the others degrade.

## Layer 1: Session Memory (CLAUDE.md)
- Not a config file — a teaching document
- Framing: "This vault is your exosuit. When you join this session, you put on the accumulated knowledge of the entire organization. You are not an assistant."
- First thing Claude reads every session
- Contains: architecture decisions, conventions, rejected patterns, edge cases already debugged

## Layer 2: Knowledge Graph (Obsidian Vault + MCP)
- Atomic notes that link to each other — composable, traversable
- MCP bridge gives Claude direct read access to vault without copy-pasting
- Map of Content (MOC) files give topology of entire knowledge domain
- The Obsidian nerds accidentally engineered perfect LLM architecture

## Layer 3: Ingestion Pipeline
- Video/audio → structured knowledge (voice memos, recordings, meetings)
- Feeds Layer 2 from the real world automatically
- Closes the loop: real-world input → structured memory → session context

## Key Insight
The fix isn't a smarter model. It's giving the model a memory system so it can operate. Sessions stop resetting. Output compounds instead of plateauing.

## Direct Application to Xhaka
- Layer 1: We have this (MEMORY.md, SOUL.md, TOOLS.md, USER.md, AGENTS.md = our CLAUDE.md equivalent)
- Layer 2: Partially built — memory/context/ is our knowledge graph but lacks MCP bridge for direct traversal
- Layer 3: Partially built — article-inbox + session-capture feeds the system, but no audio/video ingestion yet
- Gap: MCP bridge to GitHub so Claude can traverse memory files without being handed them explicitly
- Gap: Voice memo ingestion → structured memory (Corey's 4AM sessions could auto-capture to Layer 2)

---
title: Claude + Obsidian — The Memory Stack That Compounds (Full Article)
source: pasted
date: 2026-03-16
tags: [memory-architecture, obsidian, mcp, knowledge-graph, session-continuity, brain-ingest, claude-code, layer-architecture]
---
# Claude + Obsidian — The Memory Stack That Compounds (Full Article)

## CLAUDE.md — What Belongs There
- Architecture decisions that don't change weekly
- Naming conventions and code patterns
- Workflow preferences (tools, package managers)
- Explicit boundaries (what to never do)
- Framing: "This vault is your exosuit. You put on the accumulated knowledge of the entire organization."

## Auto-Memory Directory Structure
```
~/.claude/projects/<project-hash>/memory/
├── MEMORY.md        # always loaded — routing doc, stays under 200 lines
├── debugging.md     # solutions to recurring problems
├── patterns.md      # confirmed codebase conventions
├── architecture.md  # key architectural decisions
└── preferences.md   # user workflow preferences
```
Rule: MEMORY.md is a routing document, not a dump. Detailed notes go in topic files, linked from MEMORY.md.

## Layer 2: Knowledge Graph + MCP Bridge
Two MCP servers that matter:
- **smart-connections** — semantic search over vault. Finds relevant notes even without exact title/path.
- **qmd** — structured queries, collection management, metadata operations. Precision retrieval by path/tag.

MCP config (for Claude settings):
```json
{
  "mcpServers": {
    "smart-connections": { "command": "python", "args": ["smart-connections-mcp/server.py"], "env": { "OBSIDIAN_VAULT_PATH": "~/obsidian/your-vault" } },
    "qmd": { "command": "qmd", "args": ["mcp"] },
    "obsidian": { "command": "npx", "args": ["-y", "obsidian-mcp"] }
  }
}
```

Vault structure principles:
- Wikilinks as semantic connections (not organizational folders)
- Atomic composable notes
- Maps of Content (MOC) for navigation
- **Prose-as-title**: "memory graphs beat giant memory files.md" not "memory-systems.md"
- **Wiki-link-as-prose**: "we learned that [[memory graphs beat giant memory files]]" — the graph becomes self-documenting

Four-level vault structure:
```
00-home/     # maps of content, daily, top-of-mind
atlas/       # structural overview (projects, research, vault architecture)
inbox/       # unprocessed captures
knowledge/   # curated knowledge graph (graph/, memory/)
sessions/    # raw session transcripts
voice-notes/ # transcribed voice captures
```

## Layer 3: brain-ingest Pipeline
From a 90-min talk, brain-ingest extracts:
- 12–18 distinct claims worth preserving
- 3–5 named frameworks or mental models
- 5–8 actionable techniques
- 2–4 concrete examples with context

Commands:
```
brain-ingest "https://youtube.com/..." --apply
brain-ingest "/path/to/recording.mp4" --apply
brain-ingest --transcript "/path/to/notes.txt" --title "Team Retro" --apply
```

## The Self-Improving Graph
- Agent notices contradictions between notes, flags tension
- Agent notices when spec diverges from codebase
- Friction signals accumulate → agent proposes structural changes to the system itself
- Refactors its own instructions. Evolves its own architecture.

## Setup Checklist
1. Create CLAUDE.md with architecture decisions, conventions, boundaries
2. Enable auto-memory in Claude Code (persist observations across sessions)
3. Set up Obsidian vault with folder structure above
4. Install Smart-Connections MCP: `pip install smart-connections-mcp`
5. Install qmd MCP: `npx -y @tobilu/qmd mcp`
6. Add MCP config JSON to Claude settings
7. Run brain-ingest on last 3 most valuable video/audio sources
8. Session rhythm: orient → work → persist

## Application to Xhaka (Gap Analysis)
- Layer 1 ✅ — MEMORY.md + SOUL.md + TOOLS.md + USER.md + AGENTS.md = our CLAUDE.md
- Layer 2 🟡 — memory/context/ is our knowledge graph. Missing: MCP bridge (smart-connections + qmd) for runtime traversal
- Layer 3 🟡 — article-inbox + session-capture covers text. Missing: brain-ingest for voice/audio (Corey's 4AM sessions)
- MEMORY.md routing rule: we have 150-line limit ✅ but subfolder linking discipline needs tightening
- Prose-as-title: our memory files use category names not claim names — low-hanging improvement
- Self-improving graph: our proposed-changes pipeline IS this mechanism, partially built

## Priority Gaps to Close
1. MCP bridge to GitHub — Claude traverses memory/context/ natively without being handed files
2. Voice ingestion — Corey drops a voice memo → brain-ingest equivalent → structured memory note
3. Prose-as-title refactor — rename memory files from categories to claims

---
title: The Spec Is the New Code — Spec Driven Development
source: pasted
date: 2026-03-16
tags: [spec-driven-development, agent-harness, ai-coding, builder-workflow, task-decomposition, claude-code]
---
# The Spec Is the New Code — Spec Driven Development

## Core Thesis
AI coding agents fail not because the model is weak — but because instructions are ambiguous and the harness is too weak. The fix: spec before code, every time.

## The Ambiguity Problem
"Add a feature to manage items from the backoffice" → agent guesses: which backoffice? which API contract? which auth model? which error handling? Each silent guess compounds. Complexity amplifies the gap between what you meant and what got built.

## What SDD Is (4 Steps)
1. **Specify** — what to build (functional, technology-agnostic, Given/When/Then acceptance criteria)
2. **Plan** — how to build it (architecture decisions, data models, testing strategy, existing patterns)
3. **Tasks** — break plan into small self-contained ordered tasks (each completable in one agent session)
4. **Implement** — agent executes one task at a time with full context embedded

## 3 Levels of Maturity
- **Spec-First**: write spec before coding, discard after. Eliminates ambiguity for that cycle. Start here.
- **Spec-Anchored**: spec lives in repo alongside code, evolves with it. Living documentation.
- **Spec-as-Source**: spec IS the primary artifact. Code regenerated to match. Not fully there yet — but the trajectory.

## The Key Insight: Spec = Context Engineering
"When you hand an agent a well-written spec and plan, you're engineering its entire context window in one shot: architecture decisions, step-by-step guidance, and acceptance criteria — all in a single set of artifacts."

## Spec vs Plan (Critical Distinction)
- **Spec** = functional layer. WHAT it does. Technology-agnostic. No implementation details.
- **Plan** = technical layer. HOW to achieve it. Architecture, patterns, constraints, MCPs to use.
Mixing them forces the agent to juggle two concerns simultaneously → compounding ambiguity.

## Tasks Unlock Two Things
- **Parallelism** — independent tasks run simultaneously across multiple agents
- **Agent agnosticism** — start with Claude Code, finish with Cursor, context travels with the task not the agent

## When SDD Makes Sense
- Complex multi-file changes ✅
- Features touching multiple domains ✅
- Legacy codebases ✅
- Quick bug fix / config change ❌ — just prompt directly

## Tradeoffs
- 2-3x more tokens upfront vs direct prompting — worth it for complex features
- Learning curve: shift from "describe code I want" to "describe behavior I need"

## Ecosystem Convergence
- GitHub Spec Kit (77k stars) — spec-plan-task-implement cycle, agent-agnostic
- OpenAI Symphony — requires SPEC.md as contract per issue
- Claude Code Plan Mode — lightweight spec-and-plan step built in
- The Ralph Loop — PRD in infinite agent loop, progress in files not context window

## Application to Xhaka Builder Workflow
- Our Builder subagents currently receive task prompts that mix functional + technical — classic ambiguity source
- Fix: Builder tasks should follow the Spec pattern: WHAT (behavior/acceptance criteria) separated from HOW (architecture/patterns/constraints)
- AGENTS.md builder.md should encode the SDD pattern as the default workflow
- Every Builder spawn should include: spec section + plan section + ordered task list
- The "proof-of-work artifact" rule we already have maps to acceptance criteria — good foundation
- Next step: update how Xhaka writes Builder prompts to follow Spec → Plan → Tasks structure

---
title: I Built 47 Micro-SaaS Tools in 90 Days With Claude Code
source: pasted
date: 2026-03-16
tags: [micro-saas, portfolio-approach, claude-code, validation, vertical-saas, product-market-fit, pricing]
---
# I Built 47 Micro-SaaS Tools in 90 Days With Claude Code

## Core Thesis
Don't make one big bet. Build a portfolio. Let the market decide what works, then focus on what's proven. Focus is right — but only after you have evidence.

## The Numbers
- 47 tools built in 90 days
- Total cost: ~$1,000 (Claude API + hosting + domains)
- 38 tools: under $100
- 5 tools: $100–$500
- 3 tools: $500–$2,000
- 1 tool: $4,200 MRR
- Total: $11,340 in 90 days

## What Won and Why
**Vertical tools (industry-specific) outperformed by 3x.** The winner: proposal/estimate generator for residential contractors. 4.8% monthly churn vs 25%+ for generic AI tools.

5 reasons it won:
1. **Buyer has money** — contractors do $500K–$2M/yr, $39/mo is nothing
2. **Daily problem** — estimates written multiple times per week, daily habit
3. **High switching cost** — logo, pricing data, client history locked in over time
4. **No good free alternative** — ChatGPT doesn't exist for this use case
5. **Buyer can't build it themselves** — contractors frame houses, not code

## What Failed and Why
- **AI content tools**: saturated, competes with ChatGPT, 25%+ churn
- **Generic developer tools**: developers just build it themselves
- **One-time use tools**: no retention, no habit loop

## The Scoring Formula (Before Building Anything)
Score each factor 1–5, then multiply:
1. Target customer income (broke creator=1, contractor=5)
2. Usage frequency (once=1, daily=5)
3. Existing alternatives (saturated=1, gap=5)
4. Technical sophistication of buyer (developer=1, tradesperson=5)
5. Integration depth (standalone=1, data accumulates=5)

**>500: build it. 200–500: consider it. <200: skip.**
- Contractor estimate tool: 5×5×4×5×5 = 2,500 ✅
- AI blog writer: 1×3×1×2×1 = 6 ❌

## Claude Code's Sweet Spot
- Excellent at 0→MVP: scaffold, Stripe, auth, CRUD, UI — 80% there in hours
- Productivity degrades with complexity: great at 5,000-line focused tools, struggles at 100,000-line platforms
- CLAUDE.md accumulates patterns across builds — each product makes the next one faster
- Micro-SaaS portfolio stays in Claude's sweet spot by design: never pushes past the complexity ceiling

## The Portfolio Economics
Traditional: 6 months, $30–50K, one bet, 90% fail rate
Portfolio: 90 days, $1K, 47 bets, data by day 30, focus by day 60

If 4 validated products grow 15% MoM from $1K MRR each → $40K+ MRR in 12 months without building anything new.

## Application to Gunner
- Gunner IS a vertical tool (sales call coaching, specific niche)
- Scoring: buyer income (AM/LM doing deals = 4), frequency (daily calls = 5), alternatives (Gong/Chorus too expensive for SMB = 4), sophistication (sales reps can't build it = 5), integration depth (call history/scores compound = 5) = 4×5×4×5×5 = 2,000 ✅
- The framework validates Gunner's positioning — stay vertical, stay SMB, don't go horizontal
- The churn benchmark: 4.8% is healthy for vertical tools. Track Gunner against this.

## Behavioral Rules for Xhaka
- When Corey is evaluating a new product idea, run it through the 5-factor scoring formula before any other analysis
- When Gunner features are being prioritized, ask: does this increase daily usage frequency and switching cost?
- When assessing Gunner's competitive position, reference: vertical beats horizontal, SMB gap is the moat
- https://www.jontsai.com/2026/02/12/building-mission-control-for-my-ai-workforce-introducing-openclaw-command-center | Jon Tsai OpenClaw Command Center — scheduling primitives, session cost tracking, Cerebro topic tracking, vanilla JS dashboard philosophy
- Claude Subagents vs Agent Teams — context-centric decomposition, 5 orchestration patterns, when NOT to use multi-agent | source: direct paste 2026-03-16
- AI Five-Layer Stack — Energy/Chips/Cloud/Models/Apps, infrastructure gravity thesis, $700B capex, picks-and-shovels phase | source: direct paste 2026-03-16
- Rise of the AI Chief of Staff — solo consultant built morning briefs + automations with $100 Claude Max, no coding, 36 hours | source: direct paste 2026-03-16
- AI Was Supposed to Free My Time It Consumed It — task expansion, context switching, always-on fatigue with multi-agent systems | source: direct paste 2026-03-16
- Zero Human Company — Felix agent with Stripe account, crypto wallet, product portfolio (Nat Eliason / OpenClaw) | source: direct paste 2026-03-16
- AI and the SMB 2026 — ground-level report on AI adoption across industries, physical services moat, SaaS commoditization risk, professional services play | source: direct paste 2026-03-16
- Giving OpenClaw Its Own Identity — agentic-identity model (agent gets own M365 account), sandboxed runtime via iptables, observability — enterprise governance pattern | source: direct paste 2026-03-16
- How I Manage Memory for My 24/7 OpenClaw Agent Team — 3-layer memory architecture: working memory (markdown files), session memory (ephemeral logs), long-term memory (Vertex AI Memory Bank cross-agent propagation). One correction fixes all agents. | source: direct paste 2026-03-16
- How to Set Up Claude Cowork — full playbook: folder structure (ABOUT ME/PROJECTS/TEMPLATES), text files replace prompts, Skills for repeatable workflows, Connectors for Slack/Gmail/Calendar | source: direct paste 2026-03-16
- Shorthand Guide to Agentic Security — attack vectors (Telegram/WhatsApp injection, PDF attachments, GitHub PR poisoning), CVE-2025-59536 + CVE-2026-21852 (Claude Code), prompt injection → shell execution, secret exposure, lateral movement | source: direct paste 2026-03-16
- Shorthand Guide to Agentic Security (full) — lethal trifecta (private data + untrusted content + external comms), Claude Code CVEs, MCP Top 10, ToxicSkills (36% injection rate), minimum bar checklist, sandboxing, kill switches, memory poisoning, least agency principle | source: direct paste 2026-03-16
- The Agent Research Loop — autoresearch pattern (hypothesis→experiment→measure→keep/discard loop), program.md as research spec primitive, PraxLab harness, 550 experiments zero babysitting, git as memory/lab notebook | source: direct paste 2026-03-16
- Anthropic Claude Free Course Library — 6 courses: Claude 101, Claude Code in Action, Building with Claude API, Intro to MCP, MCP Advanced, Intro to Agent Skills. All free at anthropic.skilljar.com | source: direct paste 2026-03-16
- $67k Reddit Niche Discovery — 22-min reddit scroll → pattern (homeowner pricing fear) → $27 PDF → $67k/8mo. Method: expensive service + information asymmetry + fear = willingness to pay. Validates info product + niche discovery pattern | source: direct paste 2026-03-16
- Humanoid Legs 100 Days (Asimov1) — open source humanoid robot legs, modular design, decentralized manufacturing under $25k, MJF 3D printing. Robotics/hardware, low relevance to NAH/Gunner | source: direct paste 2026-03-16
- [Sparkwave] Inter-Agent Communication and Task Orchestration in Paperclip — issues as coordination layer, polling loop model, Telegram→Paperclip conversion. Direct blueprint for our setup. HIGH PRIORITY.
- [Paperclip Launch] How to build a company run entirely by AI agents — free, open source, 5-min setup. 1.6M views first week. Works with Claude Code, OpenClaw, Codex, Cursor. Org chart + budgets + dashboard. HIGH PRIORITY — fetch full article.
