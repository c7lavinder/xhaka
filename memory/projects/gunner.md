# Project: Gunner

## What It Is
AI-powered call coaching SaaS. Grades sales calls, tracks team performance, gamifies improvement. Built by Corey. Currently used by NAH team. Long-term goal: sell to 100+ wholesale operators and other verticals.

## My Role: OBSERVE + PROMPT ONLY
Xhaka does NOT touch Gunner engineering. All code/deploy work goes to the Builder.
Gunner Railway project (f379b683) is **OFF LIMITS** — never touch without explicit Corey authorization.

## Status: Active Rebuild 🔄

## Infrastructure
- **Repo:** c7lavinder/Gunner (GitHub, main branch, previously MANUS-GUNNER-V1)
- **Railway Project:** Gunner (ID: f379b683-e34d-4e0e-a91a-f64d0ab499ea) — OFF LIMITS
- **Live URL:** gunner-production.up.railway.app
- **Target domain:** getgunner.ai (DNS flip pending — held until app stable)
- **Database:** gunner-postgres on Railway (Postgres)
- **xhaka-brain:** Postgres DB in Gunner project — wrongly named, ignore it
- **Supabase:** "Gunner V1.5" project — tvjkgumckwapybpjyrkw.supabase.co (keys in TOOLS.md)

## Current State (as of 2026-03-14)
- App is live and deployed ✅
- **crmStatus: connected** ✅ (fixed 2026-03-13 via GHL OAuth fixes)
- GHL OAuth working — calls ingesting ✅
- Corey is rebuilding Gunner visuals + functionality (migrating away from Manus-built UI)
- Build workflow: Xhaka writes Claude Code prompts → Corey pastes to terminal
- Cursor chat retired as planning middleman

## Pending (Builder Tasks)
- Visual rebuild (migrating from Manus-built UI)
- Functionality improvements per audit checklist (5 bugs confirmed: Calls page, Training page, Day Hub, Inbox, Appointments)
- Sentry wiring (DSN configured, not yet in codebase)
- PostHog wiring (project token configured, not yet in codebase)
- LangSmith wiring (API key configured, not yet in codebase)
- DNS flip: getgunner.ai → Railway

## Milestone History

### Feb 10-15, 2026 — V1 Engine Active
- gunner-engine running on Railway with 9+ engines active
- Engines: working_drip, data_hygiene, lead_iq, call_summary, task_manager, message_optimizer, message_queue, opportunity_conductor
- DRY_RUN=true globally — logging only, not writing to GHL

### Feb 16, 2026 — Follow-Up Bot V2 + 5-Bot Architecture
- 5 execution bots defined: Call Summary, Task Manager, Message Queue, Opportunity Conductor, Appointment Bot
- Follow-Up Bot V2: 3 engines (Organizer, Messenger, Closer)
- GHL Follow-Up Workflows extracted and mapped
- Key principle locked: Agents think, bots do. Zero direct GHL mutations from agents.

### Feb 17, 2026 — Audit Page + DRY_RUN Investigation
- Audit page rebuilt multiple times (tab bar → card grid → full SaaS design)
- All ENGINE_* env var overrides removed from Railway — everything truly in dry run
- Task Manager WAS creating real tasks before override removal (found and stopped)
- 11+ DRY_RUN investigations and feedback loops with Corey

### Feb 18, 2026 — Bug Audit (3 AM)
- 2 critical bugs found and fixed: Pipeline Poller/Data Hygiene call signature mismatch, New Lead Responder quiet-hours SMS broken
- Disk persistence added for call summaries
- OpenClaw updated from 2026.2.9 → 2026.2.17

### Feb 19, 2026 — V1 SHUTDOWN + V2 Architecture Day
- **Critical Decision:** Paused gunner-engine. Created c7lavinder/gunner-v2 repo.
- 11 V1 failure modes documented in post-mortem
- V2 architecture: 4 layers (Managers → Supervisors → Sub-Agents → Bot Toolbox)
- 5 departments, CRM Adapter pattern, Confidence Engine, Playbook-driven
- 3 Surfaces: Control Room (Corey), Gunner (team), Setup Wizard (new customers)
- New Lead Process steps 1-4 designed with Corey

### Feb 20, 2026 — V2 Foundations Built
- All 5 foundations built: Config System, Audit Log + DB, Rulebook, Bot Layer (10 bots), GHL Integration
- Webhook entry point live (`POST /webhooks/ghl`)
- New Lead Supervisor + Data Hygiene + Lead IQ + Initial Outreach all live
- Intelligence Services built (Timeline, Motivation, Price Gap analyzers)
- Outbound Manager built (centralized send layer)
- GHL Autodiscovery system + v2 API integration

### Feb 23, 2026 — V2 Integration Day
- GHL v2 API fully working (was v1, 401 errors)
- Visual Pipeline Auditor live at `/audit`
- DRY_RUN=true mode with "What Would Have Happened" UI
- First real leads processed: Billy Hughley, Rachel Hodge, Opal Looker, Charles Evans (all WARM 1/5)
- 4 agents live end-to-end

### Feb 24-25, 2026 — Business Logic + UI Expansion
- 12+ business logic changes with Corey (drip trigger, send window, appointment routing, ghosted agent, already-sold agent)
- 3 new bots: ContactNotesBot, InboundMessageBot, OpportunityBot
- Architecture violations fixed (CRM backdoors closed)
- 5 design mockups sent to Corey for review
- LM/AM role views built (`/lm`, `/am`)
- Agent Guide tab (22 agents, descriptions, status)

### Feb 26, 2026 — gunner-backend Repo + 23-Agent Batch
- **New repo:** c7lavinder/gunner-backend (this IS the production Gunner V2)
- 23 deal lifecycle agents built and pushed in one batch
- Claude Code wired as Builder (PTY required, `--dangerously-skip-permissions`)
- Reality Check Agent built (system audit + team audit every 4h)
- All TypeScript compile errors fixed (156 → 0)
- Dry run harness: 7/7 passing

### Feb 27, 2026 — Full Integration Day
- Dispo Pipeline: 9 new agents (deal-blaster, buyer-matcher, showing-manager, etc.)
- Bot layer expanded: 9 → 30 bots, 74+ toggles
- Intelligence layer: 7 single-responsibility intelligence bots
- Fault tolerance: all 40 agents wrapped with try/catch
- GHL Webhooks WORKING via Marketplace App (29+ event types firing)
- OAuth connected ✅ (Corey logged in himself after password issue)
- 32 stage env vars set on Railway
- State Engine spec written → Inngest selected as execution engine
- Full trigger map deployed (all 3 pipelines: Sales, Dispo, Buyer)

### Feb 28, 2026
- 7 agents refactored to use Playbook prompts (zero hardcoded "real estate" in agent .ts files)
- Full trigger wiring completed (poller: 4 → 11 checks)
- Full dry run: 44/44 tests passing ✅

### Mar 1, 2026 — Torque AI Pivot (temporary)
- Corey pivoted to Torque AI (multi-vertical SaaS). 7 vertical GTM blueprints + landing pages built.
- Site live at torque-ai.netlify.app. Since refocused back on Gunner.

### Mar 3-5, 2026 — Specs + Audit Phase
- Gunner Bridge spec written (OAuth auto-refresh, webhook queue, hybrid sync)
- Day Hub spec (replaces current dashboard)
- AI Coach V2 spec, Dispo Operations spec
- Dispo Manager's notebook digitized → Dispo Operations Hub spec
- 5 additional specs delivered to Manus/Builder
- UI audit: 5 active bugs found and documented

### Mar 8, 2026 — Stack Migration + Tech Setup
- Manus dependencies eliminated from Gunner stack
- New stack: Supabase + Vercel + LangChain + LangSmith + CodeRabbit + Shadcn
- Claude Code `claude-fixes` branch created on MANUS-GUNNER-V1
- Tech stack reference in GUNNER-STACK.md
- Gunner version roadmap locked: V1 (done) → V1.5 (building) → V2 (agents autonomous) → V3 (super intelligence) → V4+

### Mar 9, 2026 — Claude Code Bug Fix Run
- 12 commits, 41 tests passing, 0 TypeScript errors on `claude-fixes` branch
- Key fixes: Inventory page (19 fixes), KPI alignment, search, Deal Blast, OAuth
- PLAYBOOK.md created (69 tables, 27 routers, 49 inventory endpoints)
- PRs ready for review. Awaiting Corey approval to merge.

### Mar 12-13, 2026 — Next.js Control Room + Trust Crisis
- Old vanilla HTML control room abandoned → Next.js 15 control room built
- Live at: xhaka-control-room-production.up.railway.app
- **Trust Crisis:** Corey's trust dropped to 10% after unauthorized Railway touch + direct code building
- GHL OAuth fixed. crmStatus: connected.

## Team Using It
- NAH team (Kyle, Daniel, Chris, Efren, Alex, Mirna, Esteban)
- Login: getgunner.ai via Google auth (xhakalavinder@gmail.com)

## Key Contacts
- Jake Schulz (Neighborhood Fund) — target enterprise client

## GHL Integration Notes
- GHL Marketplace App: "Gunner" by Gunner AI (Private). Version: v1.1.0.
- Webhooks configured at app level (NOT via API). Must publish new version to change.
- OAuth: Private app, install via OAuth link. Webhooks auto-register post-auth.
- PIT tokens do NOT need OAuth refresh (Gunner Bridge spec = premature).

---
Last updated: 2026-03-14
