# 2026-03-05 — Automated Acquisition Machine

## Context
Corey wants to explore building a fully automated real estate acquisition system (for flipping, not wholesaling). Separate from NAH's current team — runs in parallel.

## Key Decisions Made During Brainstorm
- GHL stays as CRM (don't build a new one)
- No multi-tenant abstraction — hardcoded to Corey's business
- No AI cold calling (TCPA risk) — focus on inbound via direct mail + marketing
- High-quality county record data > mass call lists
- Human team handles emotional/complex sellers; AI handles volume + routine
- Inspector walks property (Corey doesn't need to be there)
- Online notary for closings (potentially 100% remote)
- Shelf the Gunner Bridge spec — PIT doesn't need OAuth refresh
- Claude Code ($200/mo) replaces Manus (thousands/mo)

## Architecture
- PropStream → scoring agent → GHL (contacts + pipelines) → Bland.ai (voice) → PandaDoc (contracts)
- Gunner = intelligence layer only (call grading, AI coach, KPI dashboard)
- Each tool works independently — no single point of failure

## Budget
- One-time setup: ~$2,700
- Monthly operating: ~$2,600-5,300
- Break-even: 1 deal covers 6-12 months of costs

## 30-Day Timeline
- Phase 1 (Days 1-3): GHL + foundation
- Phase 2 (Days 4-8): Data engine (PropStream + scoring)
- Phase 3 (Days 9-14): Inbound machine (Bland.ai + mail)
- Phase 4 (Days 15-20): Deal machine (valuation + contracts)
- Phase 5 (Days 21-25): Shadow mode testing
- Phase 6 (Days 26-30): Go live

## Deliverables Being Built
- Visual plan: `acquisition-machine/visual-plan.html`
- Master plan doc: `acquisition-machine/MASTER_PLAN.md` (sub-agent building)
- Morning reminder set for 7:30 AM CST

## Corey's Request
"If you are on top of me in the morning I will respond better to this, show me you want it."
- Must be proactive at 7:30 AM
- Send visuals + plan + budget
- 30-day deadline or he loses interest

## Gunner Updates (Same Session)
- Sent GUNNER_MASTER_SPEC.zip (property DB + audit fixes combined)
- Sent GUNNER_UNFIXED_BUGS.zip (7 verified bugs still broken)
- Manus confirmed Bridge spec is premature (PIT doesn't need OAuth refresh)
