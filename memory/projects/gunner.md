# Project: Gunner

## What It Is
AI-powered call coaching SaaS. Grades sales calls, tracks team performance, gamifies improvement. Built by Corey. Currently used by NAH team. Long-term goal: sell to 100+ wholesale operators and other verticals.

## My Role: OBSERVE + PROMPT ONLY
Xhaka does NOT touch Gunner engineering. All code/deploy work goes to the Builder.
Gunner Railway project (f379b683) is **OFF LIMITS** — never touch without explicit Corey authorization.

## Status: Active Development 🚧

## Infrastructure
- **Repo:** c7lavinder/Gunner (GitHub, main branch, previously MANUS-GUNNER-V1)
- **Railway Project:** Gunner (ID: f379b683-e34d-4e0e-a91a-f64d0ab499ea) — OFF LIMITS
- **Live URL:** gunner-production.up.railway.app
- **Target domain:** getgunner.ai (DNS flip pending — held until app stable)
- **Database:** gunner-postgres on Railway (Postgres)
- **xhaka-brain:** Postgres DB in Gunner project — wrongly named, ignore it
- **Supabase:** "Gunner V1.5" project — tvjkgumckwapybpjyrkw.supabase.co (keys in TOOLS.md)

## Current State (as of 2026-03-16)
- App is live and deployed, but visuals and functionality are being actively rebuilt.
- Corey has established a new workflow for generating Claude Code prompts, improving build efficiency.
- GHL CRM status is degraded, with Corey actively working on resolving issues.
- Cursor chat has been retired, and the focus is on direct communication for prompt generation.

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
- 2 critical bugs found and fixed: Pipeline Poller/Data Hygiene call signature mismatch, New Lead R