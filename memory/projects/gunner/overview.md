# Gunner — Overview

## What Is Gunner?

Gunner (`getgunner.ai`) is a **multi-tenant SaaS platform for sales team coaching and performance management**. It was built by Corey Lavinder (New Again Houses) to solve a specific problem: wholesale real estate teams make hundreds of calls per week, but nobody is reviewing them. Gunner automates that review with AI.

**One-line pitch:** Drop your calls in from GHL. Get every call graded in seconds, with coaching feedback, scores, and a leaderboard.

## Who It's For

1. **Primary market:** Real estate wholesaling companies (like New Again Houses Nashville)
2. **Secondary market:** Any inside sales team using GoHighLevel as their CRM
3. **Future market:** Any B2B sales team — the playbook system supports full white-labeling for different industries

## Current State (March 2026)

| Dimension | Status |
|-----------|--------|
| Live site | ✅ Running at getgunner.ai |
| API server | ✅ Running (`/health` returns `status: ok`) |
| CRM integration | ⚠️ `crmStatus: degraded` |
| Call grading | ✅ Working |
| Gamification | ✅ Working |
| Billing (Stripe) | ✅ Configured |
| Multi-tenancy | ✅ Full |
| GHL Marketplace app | ✅ OAuth configured |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Tailwind CSS 4, shadcn/ui, TanStack Query |
| **API** | Express 4, tRPC 11 (type-safe RPC) |
| **Database** | TiDB (MySQL-compatible), Drizzle ORM |
| **Auth** | Manus OAuth (OpenID) + email/password, JWT sessions |
| **AI / LLM** | Forge API (OpenAI-compatible wrapper) |
| **Voice** | Deepgram (transcription) via `_core/voiceTranscription.ts` |
| **Payments** | Stripe (subscriptions, webhooks) |
| **Email** | Resend API |
| **Deployment** | Railway (production), Vercel (alternative) |
| **Search** | pgvector RAG pipeline (semantic call search) |
| **Testing** | Vitest (80+ test files) |

## Core Value Proposition

1. **Automatic grading** — GHL webhook fires when a call ends → Gunner transcribes + grades it in the background
2. **Role-specific rubrics** — Different scorecards for Lead Managers, Acquisition Managers, Lead Generators, Dispo, Follow-Ups
3. **Coaching feedback** — Every grade includes strengths, improvements, coaching tips, red flags, objection suggestions
4. **Gamification** — XP, badges, streaks, leaderboard — rep performance becomes a game
5. **AI Coach** — Interactive chat coach that knows all your past calls and scores
6. **White-label SaaS** — Any company can onboard with their own playbook, terminology, rubrics

## Team Structure (NAH Context)

Gunner is actively used by New Again Houses Nashville team:
- **Lead Managers (LMs):** Daniel, Chris — qualify inbound leads, set appointments
- **Acquisition Managers (AMs):** Kyle — present offers, close deals
- **Dispo Manager:** Esteban — buyer-side, selling wholesale deals
- **Lead Generators:** Cold callers generating seller interest
