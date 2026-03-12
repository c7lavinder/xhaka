# Project: Gunner

## What It Is
AI-powered call coaching SaaS. Grades sales calls, tracks team performance, gamifies improvement. Built by Corey. Currently used by NAH team.

## My Role: OBSERVE ONLY
Xhaka does not touch Gunner engineering. All code/deploy work goes to the Builder.

## Status: Active Development 🔄

## Infrastructure
- **Repo:** c7lavinder/Gunner (GitHub, main branch)
- **Railway Project:** Gunner (ID: f379b683-e34d-4e0e-a91a-f64d0ab499ea)
- **Live URL:** gunner-v2-production.up.railway.app
- **Target domain:** getgunner.ai (DNS flip pending — held until app stable)
- **Database:** gunner-postgres on Railway (Postgres)

## Current State (as of 2026-03-11)
- App is live and deployed ✅
- Manus dependencies fully eliminated ✅
- `crmStatus: "degraded"` — GHL webhooks not pointing to Railway URL
- Calls ingesting: 0 (GHL webhook not configured)
- Opps ingesting: 20 (NAH) + 5 (tenant 450029) ✅
- DNS flip to getgunner.ai: on hold

## Pending (Builder Tasks)
- Wire GHL webhook URL to Railway domain
- Set REAL_GHL_API_KEY and REAL_GHL_LOCATION_ID env vars
- DNS flip: getgunner.ai → Railway
- Revert Builder's unauthorized merge of manus-migration → main
- Sentry, PostHog, LangSmith wiring

## Team Using It
- NAH team (Kyle, Daniel, Chris, Efren, Alex, Mirna, Esteban)
- Login: getgunner.ai via Google auth (xhakalavinder@gmail.com)

## Key Contacts
- Jake Schulz (Neighborhood Fund) — target enterprise client

---
Last updated: 2026-03-11
