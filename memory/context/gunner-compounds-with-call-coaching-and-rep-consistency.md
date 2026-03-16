# Gunner — Permanent Context

## What It Is
AI-powered call coaching platform built for wholesale real estate teams. Corey's SaaS product and the asset that scales without him.

## Repositories
- **Active:** `c7lavinder/MANUS-Gunner-AI` — all engineering happens here via Manus
- **Legacy/reference:** `c7lavinder/Gunner`

## Stack
- **Database:** TiDB (MySQL-compatible, cloud-native, ~98 tables)
- **Frontend:** React 19
- **Transcription:** OpenAI Whisper
- **Grading:** OpenAI (grades calls against playbook rubrics)
- **Billing:** Stripe
- **Hosting:** Railway project `f379b683`

## What It Does
1. Ingests calls from GHL, BatchDialer, and Podio
2. Transcribes via Whisper
3. Grades each call against configurable playbook rubrics
4. Delivers coaching feedback to reps and managers
5. Gamifies improvement (levels, scores, leaderboards)
6. Supports multi-tenant white-label deployment

## Current State (as of March 12, 2026)
- **Wave 5 complete** — core platform stable and in use by NAH
- **RAG system in progress** — being built inside Manus
  - Call embeddings for semantic search
  - Coach conversation memory
  - Task feedback tracking
  - Conversion intelligence
  - **TiDB constraint:** no pgvector → cosine similarity computed in JS
  - **Embedding model:** `text-embedding-3-small`

## Key Integrations
| Integration | Purpose |
|---|---|
| GHL | Call ingestion, pipeline data |
| BatchDialer | Cold call ingestion |
| Podio | Additional call source |
| Stripe | Billing / multi-tenant |
| Gamification | Levels, scores, leaderboards |

## Xhaka's Role
**Strategic observer ONLY.**
- Never touch Gunner code
- Never touch Railway project `f379b683` (production — hands off)
- Never set env vars, trigger redeploys, or modify anything in the Gunner project
- The Builder handles all engineering via Manus
- Report observations to Corey; Builder executes

## Why It Matters
Gunner is the asset that lets NAH (and future tenants) run without Corey in every call. NAH is the proving ground. If Gunner works there, it scales everywhere.
