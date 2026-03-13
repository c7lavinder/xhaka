# Project: Gunner

## What It Is
AI-powered call coaching SaaS. Grades sales calls, tracks team performance, gamifies improvement. Built by Corey. Currently used by NAH team.

## My Role: OBSERVE + PROMPT ONLY
Xhaka does NOT touch Gunner engineering. All code/deploy work goes to the Builder.
Gunner Railway project (f379b683) is **OFF LIMITS** — never touch without explicit Corey authorization.

## Status: Active Rebuild 🔄

## Infrastructure
- **Repo:** c7lavinder/Gunner (GitHub, main branch)
- **Railway Project:** Gunner (ID: f379b683-e34d-4e0e-a91a-f64d0ab499ea) — OFF LIMITS
- **Live URL:** gunner-production.up.railway.app
- **Target domain:** getgunner.ai (DNS flip pending — held until app stable)
- **Database:** gunner-postgres on Railway (Postgres)
- **xhaka-brain:** Postgres DB in Gunner project — wrongly named, ignore it

## Current State (as of 2026-03-13)
- App is live and deployed ✅
- **crmStatus: connected** ✅ (fixed 2026-03-13 via GHL OAuth fixes)
- GHL OAuth working — calls ingesting ✅
- Corey is rebuilding Gunner visuals + functionality (migrating away from Manus-built UI)
- Build workflow: Xhaka writes Claude Code prompts → Corey pastes to terminal
- Cursor chat retired as planning middleman

## Pending (Builder Tasks)
- Visual rebuild (migrating from Manus-built UI)
- Functionality improvements
- Sentry wiring (DSN configured, not yet in codebase)
- PostHog wiring (project token configured, not yet in codebase)
- LangSmith wiring (API key configured, not yet in codebase)
- DNS flip: getgunner.ai → Railway

## Team Using It
- NAH team (Kyle, Daniel, Chris, Efren, Alex, Mirna, Esteban)
- Login: getgunner.ai via Google auth (xhakalavinder@gmail.com)

## Key Contacts
- Jake Schulz (Neighborhood Fund) — target enterprise client

---
Last updated: 2026-03-13
