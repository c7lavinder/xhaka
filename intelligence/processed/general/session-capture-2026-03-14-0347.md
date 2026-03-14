# Session Memory Capture 2026-03-14-0347

Captured: Saturday March 14 2026 3:47 AM CST

---

## KEY DECISIONS

### 1. RAG System for Gunner Goes to Manus
- Corey wants RAG layer built into Gunner AI platform
- 4 data sources: call transcripts, AI coach conversations, team actions/responses, conversion data
- Build via Manus using MANUS-Gunner-AI GitHub repo (NOT Claude Code)
- Prompt captured and written to intelligence inbox

### 2. Insights Must Change Behavior, Not Just Be Stored
- Rule from Corey: articles sitting in memory/context/ is NOT enough
- Insights must propagate to core files (SOUL.md, AGENTS.md, agent definitions)
- Partially implemented tonight by Builder

### 3. Claude Skills 2.0 Insights Applied to System Files
Builder pushed 3 commits:
- agents/builder.md: Skill Design Standard added
- agents/auditor.md: Benchmarking Protocol added
- agents/researcher.md: Self-Improvement Loop added
- WORKFLOW.md: Skill Stack Architecture added
- memory/context/ai-systems.md: NEW permanent knowledge file created

### 4. Proposed-Changes System Designed (Not Yet Built)
- Architect wrote spec at: runs/2026-03-14-article-pipeline/03_proposed-changes-spec.md
- Researcher adds 2nd step after insight extraction: evaluate for behavioral impact
- HIGH confidence writes to intelligence/proposed-changes/
- MEDIUM/LOW logs to console only

---

## RULES COREY STATED

1. Every insight must update a file read every session, not just stored
2. RAG build goes to Manus, not Claude Code
3. Work in Manus Gunner repo for Gunner development
4. Articles/knowledge should be sprinkled throughout files, not siloed in inbox

---

## OPEN TASKS

1. PENDING: Builder must implement proposed-changes spec (Architect designed it, Builder has NOT built it). Spec at runs/2026-03-14-article-pipeline/03_proposed-changes-spec.md

2. PENDING: RAG system build in Manus (prompt in inbox, Manus task not yet started)

3. KNOWN GAP: Sentry, PostHog, LangSmith all set up but not wired into Gunner codebase

4. PENDING: Researcher job upgrade (Builder needs to implement evaluateForBehavioralImpact from Architect spec)

---

## CONTEXT

- Session active 3:27 AM to 3:45 AM CST March 14 2026
- Corey reviewed 3 articles: AI engineer roadmap, Local SEO prompts, Claude Skills 2.0
- All 3 captured to intelligence inbox (SHA: 5204edb, 8ba66a6, f060ba7)
- Main codebase: TiDB/MySQL, 98 tables, 40+ pages (Gunner)
- workspace-sync confirmed all files up to date at 3:44 AM
