# Session Memory Capture — 2026-03-15 03:47 CST

## Sessions Covered
- c1fbe43e (2026-03-13 → 2026-03-15) — Main active session, massive (4.8MB)
- Heartbeat/cron sessions (no user content)

---

## Key Decisions

### 2026-03-13 — Gunner CRM Degraded
- CRM flipped from connected → degraded ~10:30 CDT
- Corey: "No, we are working on GHL" — told Xhaka to stand down, handled it himself

### 2026-03-13 — Trust at 10%
- Corey explicitly: "We are not going to work on anything until I can trust you"
- "Right now I have 10% trust"
- Trust-building path: "spending hours hardening up your repo files, establishing discipline"
- Root cause: "any time we have momentum you make a mistake"
- Discipline mantra: "design it, build it, implement it, find gaps, fix it, audit it, fix it"

### 2026-03-13 — Memory & GitHub Protocol Hardened
- Corey: "Absolutely everything should be in github for you to constantly reference"
- Memory must be automatic — not Xhaka's manual responsibility
- Session-capture cron was fixed by Builder
- Memory flush/synthesis system confirmed working

### 2026-03-13 — Cursor Workflow (Corey's Dev Process)
- Corey uses Cursor chat to plan, then copy/paste prompts to Claude Code terminal
- Problem: Cursor can't replicate visuals from screenshots well
- Builder (spawned by Xhaka) is expensive — Cursor with Claude Code in terminal is cheaper

### 2026-03-13 — Matt Lavinder (Dad) Getting Into AI
- Corey shared session_summary_march13 doc about his dad's AI work
- Corey asked: "Is there anything I should tell him that would help him?"

### 2026-03-13 — Xhaka Infrastructure Fixes Completed
- 502 error fixed by Builder
- Job registry stabilized, session-capture cron fixed
- Tool monitor patterns, alert cooldown persistence, Railway build failure all fixed

---

## 2026-03-14 — Major Session

### Strategic Directive — Focus on Xhaka Only
- Corey: "For the next week I only want to focus on you unless I ask for help with something else"
- Not Gunner. Not NAH. Xhaka gaps and improvements only.

### Articles Fed & Processed (10+ articles)
- How to become AI engineer in 6 months
- RAG explanation and implementation
- Claude Skills 2.0 — reusable automation workflows
- AI scalability — right tool at right step
- Human data labeling industry behind frontier models
- Everyone building Claude skills (OpenClaw skills system)
- Skill Graphs > SKILL.md
- Startup creation framework
- AI competitive advantage
- "A year from now two versions of you exist"

### RAG System for Gunner (PENDING)
- Database of all >60 sec calls, questions asked, outcomes
- Goes into Manus Gunner repo (NOT c7lavinder/gunner)
- getgunner.ai = Manus Gunner repo

### Master Skill Library
- Corey: "master skill library in you, in each agent, and in GitHub"
- 37 skills confirmed added to OpenClaw skills/
- Knowledge must disperse from inbox into working files

### Queue System Built
- Corey: "create a queue system where sub-agents are queued, not scheduled"
- Builder built queue scaffold + expanded
- Scribe should run through queue, not just nightly cron

### Xhaka Teams Page
- Visual of ideal team structure deployed to Railway
- Corey: "I like it. I am impressed right now. Firing on all cylinders"

### Cost Optimization — New Models Added
- DeepSeek key: sk-87d892a775764ae29e71e689337efa77
- Builder built DeepSeek router
- Smart routing for cheaper models on lighter tasks
- Available: DeepSeek, Gemini Flash, GPT-4o-mini, GPT-4o, Claude Sonnet

### Wednesday Action Items (LOCKED IN)
- Set up actual Claude Code for Builder (not just Sonnet) — needs mac mini
- Set up OpenAI Codex
- Corey: "remind me on Wednesday to set it up"

### OpenClaw Update
- Corey shared: https://github.com/openclaw/openclaw/releases/tag/v2026.3.13
- Told to update — apply when next available

### 36 Items Build Plan
- All 36 items addressed by team per Corey approval

---

## Rules Corey Stated (Permanent)

1. "Real fix, always" — never patch symptoms, fix root causes
2. Trust must be earned through clean execution, not promises
3. Everything in GitHub — source of truth for Xhaka
4. Gunner Railway project OFF LIMITS without explicit authorization
5. "design it, build it, implement it, find gaps, fix it, audit it, fix it"
6. Focus on vision, not on correcting mistakes mid-stream
7. Multiple agents must collaborate — Xhaka orchestrates, never builds
8. Only Corey gives instructions via Telegram

---

## Open Tasks

- [ ] Wednesday: Set up Claude Code for Builder (mac mini required)
- [ ] Wednesday: Set up OpenAI Codex
- [ ] RAG system for Manus Gunner repo (>60 sec calls)
- [ ] Integrate article insights into system files (not just inbox)
- [ ] Queue system — route scribe + recurring jobs through queue
- [ ] OpenClaw v2026.3.13 update — verify applied
- [ ] Relationship tracker (for AI/Gunner contacts) — no names yet

---

## Context Notes

- Cost is a real concern — burning Anthropic credits fast; alternatives now wired
- Trust trajectory: 10% (Mar 13 morning) → "firing on all cylinders" (Mar 14 evening)
- Corey was out Mar 14 night ("Getting hammered" / "I am drunk" ~00:36-02:42 CST Mar 15)
- Corey is actively learning AI engineering — articles, questions, hands-on Cursor work