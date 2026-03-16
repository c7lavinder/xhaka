# Session Memory Capture — 2026-03-16 07:46 CDT

## Sessions Covered
- c1fbe43e — Primary Corey session (2026-03-13 through 2026-03-16)
- b2b2db19 — Current cron session (2026-03-16)

---

## KEY DECISIONS

### Architecture
- **Queue-first, cron-fallback** — all jobs triggered via dispatcher task queue; cron is safety net only. No exceptions.
- **Single repo rule** — everything goes to `c7lavinder/xhaka`. No separate repos. `openclaw-control-room` repo merged into main repo under `services/control-room/`.
- **TypeScript + pgvector on Supabase** (not Python/Cognee) — Option B chosen. No second Python service.
- **Telegram is the primary interface** — Control Room is lightweight reference only. All meaningful communication comes to Corey via Telegram.
- **Real fix, always** — Corey's principle. Don't compensate for broken processes; fix the process.

### Build Workflow
- **SDD (Spec-Driven Development)** enforced: every Builder prompt must have SPEC (what + acceptance criteria), PLAN (architecture + patterns), TASKS (ordered, self-contained). No exceptions.
- **Never split agents by role — split by context** (from Claude subagents article).
- **Multi-agent builds require serialization for shared files** — no parallel Builders writing to the same files.
- **Pre-deploy TypeScript check** (GitHub Actions `tsc --noEmit`) required before Railway deploys.

### Team
- **Xhaka does NOT build/code** — only coordinates and spawns specialists.
- **7th specialist added: The Librarian** — knowledge custodian, runs nightly, enforces file taxonomy, rejects banned content, validates frontmatter.
- **Build order for complex tasks:** Operator diagnose → Builder fix → Auditor verify.

### System
- **Control Room** = lightweight static reference at `xhaka-control-room-production.up.railway.app`
- **Morning brief format** = signal-only, max 15 lines: decisions needed, alerts, top 3 queue items, system load
- **MiroFish / simulation engine** = PARKED. Collect data now, build simulation later.

---

## RULES COREY STATED

1. **"Real fix, always."** — Don't patch around broken processes. Fix the root cause.
2. **"Build now, not later"** — Stop deferring if it can be done tonight.
3. **"Not just the builder"** — Complex builds need multiple specialists working together.
4. **"Queue first"** — Everything triggered via queue; cron is fallback only.
5. **"All info goes to one repo"** — `c7lavinder/xhaka` is the single source of truth.
6. **"You communicate to me"** — Telegram is primary; no need to build elaborate dashboards.
7. **"Make sure team is building, not you"** — Xhaka coordinates; specialists execute.
8. **"Polymarket / betting content"** — banned. Never reference again.

---

## OPEN TASKS / PENDING

### Requires Corey Action (Manual Steps)
1. **Supabase pgvector** — run `001_pgvector.sql` at `https://tvjkgumckwapybpjyrkw.supabase.co/project/tvjkgumckwapybpjyrkw/sql`
2. **Railway env var** — add `SUPABASE_SERVICE_KEY = sb_secret_E58gx6PLR6y5nxEwJt6MjQ_KOlBpMXH` to xhaka-intelligence service

### Wednesday (Claude Code Setup Day)
- Install Superpowers plugin → enforces SPEC→PLAN→EXECUTE automatically
- Install gstack (Garry Tan's setup) → `/browse`, `/qa`, `/ship` commands
- Install GitNexus MCP → already indexed (6,902 nodes, 19,448 edges)
- Use Claude Code in Action course (already identified) as prep

### System Improvements In Flight / Recently Built
- Smart Scheduler (Jon Tsai patterns) — `run-if-not-run-since`, conflict-avoidance, LLM router — ✅ LIVE
- Pre-deploy TypeScript check (GitHub Actions) — ✅ built
- Morning brief upgrade — Today's Focus + System Load — ✅ built
- Security hardening — untrusted content guardrail, injection detection — ✅ built
- Librarian agent — ✅ built (nightly knowledge audit)
- pgvector semantic search — ✅ code committed, pending manual Supabase setup
- Paperclip — ✅ being deployed as Railway service
- Hindsight episodic memory — ✅ built (hindsight-sync.ts)
- Agency-agents (21 agents) — ✅ pulled into knowledge base
- Book library (22 books) — ✅ committed with NAH/Gunner application sections
- LEARNINGS.md — ✅ 5 active behavioral rules, loads every session
- Anti-AI writing style rules — ✅ added to SOUL.md
- IDEAS.md — ✅ created for idea capture

### Research / Repos Queued for Researcher
- Cognee (Python, pgvector alternative) — in repo-inbox
- InsForge — semantic layer for coding agents
- GitNexus — ✅ indexed locally already
- OpenViking — context DB for AI agents
- Lightpanda — headless browser for Researcher
- Paperclip — ✅ deeply investigated
- MiroFish — architecture documented in `memory/context/sim/`
- Claude Code 2.0 system prompt (57KB) — Researcher running analysis
- system-prompts-and-models-of-ai-tools — Manus, Cursor, Windsurf, Devin analysis
- 10 AI learning repos — fully analyzed by Researcher
- agency-agents — 25 agents extracted

### Deferred (Needs Claude Code First)
- Compound Engineering Plugin (EveryInc)
- MCP Advanced Topics setup
- Superpowers + gstack install

---

## PEOPLE & PROJECTS

### NAH Team Context
- Kyle — AM, 70% Gunner score
- Daniel — LM, 67% Gunner score
- Chris — LM, 36% Gunner score (self-image ceiling per Psycho-Cybernetics framework)
- Esteban — Dispo, 64% Gunner score
- Jessica — Data Manager

### Gunner Status
- Wave 5 complete
- GHL OAuth wired and working
- Positioned as data flywheel (Niantic/Pokémon GO model)
- Gunner scoring formula ~2,000 = build threshold validated

### Master Wholesale Playbook
- Uploaded and committed to `memory/context/playbooks/`
- Contains 5 coaches, Gunner grading rubric, objection responses, Bland.ai config

---

## KEY KNOWLEDGE ADDED TO SYSTEM

- 22 books with NAH/Gunner application sections
- SDD framework (Spec-Driven Development)
- MiroFish simulation architecture (parked, but documented)
- Digital Twins for Kyle, Daniel, Chris, Esteban, Motivated Seller
- AI-layer stack analysis (Layer 5 = applications = Gunner's position)
- "Never build what AI already commoditizes" principle
- Data flywheel thesis (Gunner = Niantic model)
- Anti-AI writing style rules
- Damage containment principle for agent permissions
- Agentic security guardrails (prompt injection defense)
