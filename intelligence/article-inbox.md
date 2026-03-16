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
title: RL Environments and the Hidden Industry of Verifiers
date: 2026-03-14
source: Elliot Arledge (KernelBench v3)
tags: [ai-training, rl, verifiers, evaluation, benchmarking]
---



---
title: RL Environments Part 2 - Minecraft, Tooling Bottlenecks, and the Lab Pipeline
date: 2026-03-14
source: Elliot Arledge (KernelBench v3)
tags: [rl, verification, scaling, tooling, xhaka-infrastructure]
---



---
title: RL Environments Part 3 - The Bounty Model and Automated Verification
date: 2026-03-14
source: Elliot Arledge (KernelBench v3)
tags: [scaling, verification-funnel, reward-hacking, adversarial-attack]
---



---
title: RL Environments Part 4 - Unit Economics, Security, and Frontier Strategy
date: 2026-03-14
source: Elliot Arledge (KernelBench v3)
tags: [unit-economics, security, reputation-systems, scaling-strategy]
---



---
title: From Individual Skills to Skill Systems (Plugins)
date: 2026-03-14
source: Build With AI (Skill Systems vs Plugins)
tags: [architecture, plugins, systems-thinking, workflow-automation]
---



---
title: Skill Systems (Plugins) Part 2 - Connective Patterns & Production Pipelines
date: 2026-03-14
source: Build With AI (Nick Spisak)
tags: [architecture, chaining, orchestration, workflows, shared-context]
---



---
title: 7-Step Startup Framework (Jack Coder)
date: 2026-03-14
source: Twitter @jackcoder0
tags: [startup, mvp, validation, growth, logic-patterns]
---



---
title: Skill Graphs > SKILL.md (Structured Knowledge Systems)
date: 2026-03-14
source: Arscontexta Research
tags: [knowledge-graphs, zettelkasten, architecture, wikilinks, agent-cognition]
---



---
title: Hey Noah AI (Personal Executive Agent Research)
date: 2026-03-14
source: Ashish (HeyNoahAI)
tags: [personal-crm, relationship-capital, executive-assistant, time-management]
---




---
title: Skill Graph for Content — 10 Social Accounts, Zero Manual Posts
source: twitter
date: 2026-03-15
tags: [skill-graph, content-system, ai-agents, automation, claude-code]
---
# Skill Graph for Content — 10 Social Accounts, Zero Manual Posts

Running 10 social media accounts without writing a single post manually using a skill graph: 30+ markdown files wired together that turn an AI agent into a full content team.

## Folder Structure
```
/content-skill-graph
├── index.md (entry point — maps every node)
├── platforms/ (x.md, linkedin.md, ig.md, tiktok.md...)
├── voice/ (brand-voice.md, platform-tone.md)
├── engine/ (hooks.md, repurpose.md, scheduling.md)
└── audience/ (builders.md, casual.md)
```

## How It Works
- Each file = one knowledge node
- Files contain [[wikilinks]] to related nodes
- The agent follows the links automatically
- index.md = the entry point (who you are + node map + execution instructions)

## Key insight on output
NOT 10 copies of the same text reformatted. 10 pieces that each THINK about the topic differently:
- X: contrarian thread, lowercase casual, step-by-step
- LinkedIn: personal narrative, professional tone, 1500 words
- Instagram: 7-slide carousel, visual-first, bold claim on slide 1
- TikTok: 45-sec raw screen recording script
- YouTube: SEO title + structured outline, 8-min format

Same topic. Different angle, hook, voice, structure, format per platform.

## Business impact
Replaced $8-12k/mo in content spend.

## Tool referenced
@arscontexta plugin for Claude Code (generates base structure automatically)

## Core principle
One flat file = a tool. A graph = a team.
---

---
title: MiroFish: The God View Engine — Multi-Agent Simulation
source: twitter/github
date: 2026-03-15
tags: [mirofish, multi-agent-simulation, graphrag, zep-cloud, super-individual]
---
# MiroFish: The God View Engine — Multi-Agent Simulation

MiroFish is a multi-agent simulation engine built by Guo Hangjiang (BaiFu) in 10 days. It generates thousands of autonomous agents with unique personalities, memories, and behaviors to simulate future scenarios based on a single document.

## Core Stack
- **Simulation Engine:** OASIS (by CAMEL-AI)
- **Memory:** Zep Cloud for long-term agent memory
- **Knowledge Representation:** GraphRAG (Knowledge Graphs)
- **Deployment:** Docker Compose one-click setup
- **License:** AGPL-3.0

## Key Capabilities
- **God's Eye View:** Inject variables (rate hikes, CEO resignations) into the simulation to see real-time recalibration.
- **Entity Extraction:** Turns documents into knowledge graphs.
- **Emergent Behavior:** Agents form groups, develop opinion leaders, and create herd effects.

## Use Cases
- Narrative branch prediction (e.g., finishing classical novels).
- Market sentiment simulation (e.g., Fed rate hikes).
- Public opinion analysis.

## Github
https://github.com/666ghj/MiroFish
---
