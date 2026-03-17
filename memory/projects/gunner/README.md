# Gunner — Project Knowledge Index

> Last updated: March 2026 by Xhaka (AI Recon Agent)

This directory contains the definitive knowledge base for the Gunner AI platform (`getgunner.ai`). Built by Corey Lavinder for coaching wholesale real estate sales teams.

## Files

| File | Description |
|------|-------------|
| [overview.md](./overview.md) | What Gunner is, who it's for, current state, tech stack |
| [architecture.md](./architecture.md) | Full technical architecture, data flow, DB schema, API routes |
| [features.md](./features.md) | Every feature: what it does, where it lives, current status |
| [grading-system.md](./grading-system.md) | AI grading deep dive: all rubrics, scoring, 17-step pipeline |
| [integrations.md](./integrations.md) | All external integrations: GHL, Stripe, voice, LLM |
| [known-issues.md](./known-issues.md) | Everything broken or suboptimal |
| [rebuild-plan.md](./rebuild-plan.md) | What to keep, what to rewrite, rebuild order, risks |

## Quick Facts

- **Live app:** https://getgunner.ai (prod: gunner-production.up.railway.app)
- **Repo:** github.com/c7lavinder/MANUS-Gunner-AI (main branch)
- **Status:** Production ✅ | CRM integration: ⚠️ Degraded
- **Stack:** React 19 + Express + tRPC 11 + Drizzle ORM + TiDB/MySQL
- **Business model:** Multi-tenant SaaS, Stripe billing ($199/$499/$999/mo)
