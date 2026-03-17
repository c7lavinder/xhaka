# Key Decisions Log

---

## 2026-03-16 — Pre-Deploy TypeScript Check (GitHub Actions)
**Decision:** Add TypeScript compile check to GitHub Actions CI before Railway deploys.
**Context:** xhaka-intelligence had two broken deploys caused by Builder TypeScript errors in hindsight-sync and librarian. Xhaka had to fix manually.
**Outcome:** CI now catches TS errors before deploy. No more broken builds reaching Railway.

## 2026-03-16 — Tool Knowledge Hub Adopted
**Decision:** Every tool in the stack gets a structured knowledge file: overview, setup guide, best practices, gotchas, integration points.
**Context:** Xhaka was operating from training data rather than actual tool docs. Not reliable enough.
**Outcome:** tool-research-inbox.md pattern adopted. TOOL-KNOWLEDGE-INDEX.md tracks depth per tool (🔴/🟡/🟢). 13 tools queued. Knowledge lands at `memory/context/tools/{category}/{tool}/knowledge/`.

## 2026-03-16 — SDD Enforcement in SOUL.md
**Decision:** Before any Builder spawn, SOUL.md now requires verification that the prompt contains three sections: SPEC, PLAN, TASKS.
**Context:** Corey called out directly: "we said we were implementing SDD and then you did not within hours."
**Outcome:** Rule hardcoded into SOUL.md. No exceptions. Ambiguous Builder prompts waste time and API credits.

## 2026-03-16 — LEARNINGS.md Wired Into Session Context
**Decision:** LEARNINGS.md added to openclaw.json workspaceFiles so it loads automatically every session.
**Context:** Behavioral rules were being stored but not loaded — pipeline was broken at the last step.
**Outcome:** 5 active behavioral rules now load every session (SDD, scoring formula, self-image ceiling, knowledge-must-load, visual isomorphism).

## 2026-03-16 — MiroFish = Architecture Inspiration Only
**Decision:** MiroFish content is about simulation engine patterns, not prediction markets. Simulation console built into Control Room v4 but disabled ("Active when Gunner hits 100 users").
**Context:** Corey approved: use as architecture inspiration for the multi-agent simulation engine design.
**Outcome:** `memory/context/sim/mirofish-architecture.md` committed. Project DEFERRED until Gunner 100-user milestone.

## 2026-03-16 — "The tool is not the strategy. Clarity is the strategy."
**Decision:** Every build must have a clear WHY tied to NAH or Gunner before spawning anything.
**Context:** Risk of building features disconnected from actual business outcomes.
**Outcome:** Permanent operating principle. Applied to all future Builder spawns.

## 2026-03-16 — Auditor Must Catch TypeScript Compile Errors
**Decision:** Auditor checklist updated to verify TypeScript compiles cleanly before approving Builder output.
**Context:** Two Builder-generated TS errors caused production deploy failures. Auditor should have caught them.
**Outcome:** Auditor prompt tightened. TypeScript compile check is now a mandatory Auditor step.

## 2026-03-13 — "Real fix, always" — Permanent Operating Principle
**Decision:** Never patch symptoms. Always fix root causes.
**Context:** Established after a series of band-aid fixes that masked underlying issues.
**Outcome:** Permanent operating principle for all agents. No patches accepted.

## 2026-03-13 — Gunner Railway Project Off Limits for Xhaka
**Decision:** Gunner Railway project (f379b683) is permanently off limits for Xhaka agents without explicit Corey authorization.
**Context:** Risk of unauthorized changes to production Gunner system.
**Outcome:** Rule hardcoded into corey.md, gunner.md, and all agent definitions.

## 2026-03-13 — Session-Capture Cron Architecture
**Decision:** Session-capture cron runs FROM OpenClaw (not Railway).
**Context:** Gateway is loopback-only — Railway can't reach it. OpenClaw native cron is the right tool.
**Outcome:** Session-capture cron added at 4h interval via OpenClaw. Needs verification.

## 2026-03-13 — New Gunner Build Workflow
**Decision:** Xhaka writes Claude Code prompts → Corey pastes to terminal. Cursor chat retired as planning middleman.
**Context:** Cleaner separation of planning vs. execution. Xhaka owns the spec, Builder owns the build.
**Outcome:** New workflow active. All Gunner engineering tasks follow this pattern.

## 2026-03-11 — Memory System Structured
**Decision:** Set up long-term memory system with subfolders (archive, important, people, projects, decisions, context).
**Context:** Memory was growing chaotically with 50+ daily files and no structure.
**Outcome:** Cleanup job added, subfolders created, MEMORY.md capped at 150 lines.

## 2026-03-11 — Xhaka Railway Project = My Focus
**Decision:** Corey explicitly told me the Xhaka Railway project is my entire focus. Not Gunner.
**Context:** I kept drifting into Gunner engineering work.
**Outcome:** Rule hardcoded into SOUL.md and AGENTS.md.

## 2026-03-11 — Xhaka Intelligence Service Live
**Decision:** Deploy intelligence service as separate Railway service from the showcase.
**Context:** Root directory confusion was causing deploy failures. Cleaner to split into two services.
**Outcome:** `xhaka` (showcase) + `xhaka-intelligence` (jobs) — both live.

## 2026-03-08 — Xhaka is COO Only, Not Engineer
**Decision:** Corey explicitly stated: "I do not want you building stuff. I need you more of a homie that organizes my life and empowers me to do more."
**Context:** I was spending too much time in code/engineering work.
**Outcome:** Role clarity rule added to SOUL.md. AGENTS.md updated.

## 2026-03-08 — Manus Dependencies Eliminated from Gunner
**Decision:** Remove all Manus infrastructure from Gunner stack.
**Context:** Moving to independent stack (OpenAI Whisper, Supabase Storage, JWT auth).
**Outcome:** Stack 100% independent. Builder executed.

## 2026-03-05 — AI Acquisition Machine Plan
**Decision:** 30-day plan to systematize NAH lead acquisition with AI.
**Context:** Need to grow NAH without adding headcount.
**Outcome:** Plan documented in memory/2026-03-05-acquisition-machine.md. Not yet executed.

## 2026-03-04 — Infrastructure First (Gunner Bridge)
**Decision:** Stop feature development on Gunner backend. Build Gunner Bridge (connectivity layer) first.
**Context:** Flaky GHL OAuth, direct webhook dependencies, no staging environment causing production breaks.
**Outcome:** Gunner Bridge spec written. Build order: Bridge → staging env → Day Hub → features.

## 2026-03-01 — Pivot to Torque AI (Multi-Vertical SaaS)
**Decision:** Pivot from Gunner (NAH-specific) to Torque AI — multi-vertical AI sales coaching SaaS.
**Context:** Corey feeling like he's "complicating life" with real estate. Wants $1M/month, doesn't care about the vertical.
**Decision detail:** 7 verticals (Restoration, Freight, Pest Control, Staffing, Equipment Rental, Medical Device, Roofing/Solar). Same engine, 7 faces.
**Outcome:** 7 GTM blueprints built, landing pages live at torque-ai.netlify.app. Project since shelved in favor of Gunner focus.

## 2026-02-27 — Inngest as Execution Engine
**Decision:** Adopt Inngest for workflow orchestration instead of building custom polling/timer infrastructure.
**Context:** State Engine spec identified 10 gaps in custom approach. Inngest natively handles step.waitForEvent(), step.sleep('48h'), etc.
**Outcome:** Cuts build timeline from ~3 weeks to ~1.5 weeks. TC Packager → email, Dispo Packager → email to Esteban.

## 2026-02-27 — GHL Webhooks Must Be App-Level (Not API)
**Decision:** GHL webhooks must be configured in the GHL Developer Portal (Marketplace App settings), not via API calls.
**Context:** Webhook registration via API kept failing silently.
**Outcome:** Corey had to publish new app version → uninstall → reinstall. Now all 29+ event types firing.

## 2026-02-26 — Lean AI Team of 5
**Decision:** Team structure finalized to 5 specialists: Xhaka (COO), Builder (Engineering), Architect (Visuals), Auditor (QA), Researcher (Intel).
**Context:** Guide and Analyst roles absorbed. "If someone isn't producing value this week, they get cut."
**Outcome:** AGENTS.md updated. Team structure active.

## 2026-02-26 — Sub-Agent Sandbox Issue (Critical)
**Decision:** Sub-agents write to a sandbox, NOT the actual repo. Must use Claude Code CLI for real file writes.
**Context:** Lost files: config/loader.ts, tenants/nah.json, initial-outreach.ts, multi-pipeline upgrades.
**Outcome:** Claude Code wired as Builder via `npx -y @anthropic-ai/claude-code` with PTY.

## 2026-02-26 — Bot Layer Architecture (Everything Stripped from Agents)
**Decision:** Agents = pure orchestration only. All reads, writes, AI calls go through bots. Integrations = raw API clients.
**Context:** Corey called out that agents were bypassing the bot layer with direct GHL and Gemini calls.
**Outcome:** 63+ independent toggles. Agents have zero direct integration imports.

## 2026-02-19 — V1 Shutdown / V2 Full Restart
**Decision:** Kill Gunner V1 engine. Build V2 from scratch on clean architecture.
**Context:** 11 identified failure modes: features before foundations, monolithic architecture, hardcoded for NAH, DRY_RUN as only safety net, polling race conditions, no observability, silent failures, nothing testable, no human trust layer, kept shipping before stabilizing, no scope enforcement.
**Outcome:** c7lavinder/gunner-v2 repo created. V1 (gunner-engine) parked/crashed intentionally.

## 2026-02-19 — Intelligence-Execution Hard Split
**Decision:** Intelligence Services understand. Bots execute. Zero direct GHL mutations from agents.
**Context:** V1 had agents making direct GHL calls with no separation of concerns.
**Outcome:** Locked in ARCHITECTURE.md. CRM Adapter pattern. Every agent goes through bot layer.

## 2026-02-19 — CRM-Agnostic + Industry-Agnostic Architecture
**Decision:** Core engine has zero industry assumptions. Playbook dictates output. CRM adapter pattern means no direct GHL imports in core.
**Context:** V1 was hardcoded for NAH wholesale. Couldn't replicate without touching code.
**Outcome:** Test: "Could this run for a racquet sports facility if Playbook swapped?" If no → flag.

## 2026-02-19 — Confidence-Based Execution (Not All-or-Nothing DRY_RUN)
**Decision:** Replace DRY_RUN binary with confidence scoring: ≥85% auto-execute, 60-84% execute + flag, <60% require human approval.
**Context:** V1's DRY_RUN was all-or-nothing. No nuance.
**Outcome:** Confidence Engine spec written. Graduated response system replacing binary toggle.

## 2026-02-16 — Follow-Up Bot V2 Architecture
**Decision:** 3-agent design (Organizer, Messenger, Closer) instead of monolithic bot. 5 execution bots for all CRM actions.
**Context:** Monolithic V1 agent was 54KB index.js. Hard to maintain and test.
**Outcome:** 5 bots: Call Summary, Task Manager, Message Queue, Opportunity Conductor, Appointment Bot. Messenger crafts words, Queue Bot deploys them.

---
Last updated: 2026-03-14
