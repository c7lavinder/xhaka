# Gunner V2 — Build Roadmap

*Last updated: 2026-02-25*

---

## The End Goal (don't lose sight of this)

**A setup wizard that slides into any business's existing CRM in 10 minutes.**

- Reads their existing GHL setup (no rebuilding required)
- Has an industry-specific conversation that learns their business
- Generates their `playbook.md` — the brain that drives all AI behavior
- Maps their stages/pipelines/calendars to Gunner's logical concepts
- Different industries get different question sets, different playbooks
- Playbook is editable after setup — change rules in plain English, AI adapts immediately

This is the moat. Not the integrations. Not the AI calls. The playbook system.

---

## Build Order (hold to this)

### Phase 1 — Finish Acquisition ← CURRENT
**Status:** ~95% done

Remaining:
- [ ] AM Assistant post-apt no-same-day-offer path (walkthrough without offer → AM task to run numbers within 24h)
- [ ] Validate call-intel on 5–10 real GHL transcripts
- [ ] Flip DRY_RUN=false (Corey's call)

---

### Phase 2 — Disposition
**Status:** Partially built (TC Packager ✅, Dispo Packager ✅)

Remaining:
- [ ] Buyer outreach pipeline management
- [ ] InvestorLift / buyer list marketing integration
- [ ] Deal tracking through to close
- [ ] Buyer communication automation

---

### Phase 3 — Lead Generation
**Status:** Mostly unbuilt (PPL Refund Bot ✅ standalone)

- [ ] Market Watch Bot — market trends + comps
- [ ] MLS Monitor Bot — alert when pipeline properties list
- [ ] Data import / list stacking flows
- [ ] BatchLeads deeper integration

---

### Phase 4 — KPIs + Reporting
**Status:** Unbuilt

Comes after Dispo + Lead Gen — needs data from all channels to be complete.
- [ ] KPI Entry Bot — auto-pulls from BatchDialer (calls) + BatchLeads (SMS) + GHL (pipeline) + Dispo activity → populates spreadsheet
- [ ] Report Generator — daily/weekly/monthly summaries across ALL phases
- [ ] Dashboard data layer (foundation for future UI)

---

### Phase 5 — The Wizard ← DON'T BUILD EARLY
**Status:** Not started

Only build this after Phases 1–4 are solid. The wizard needs to cover the FULL business workflow — acquisition, KPIs, dispo, and lead gen. Building it early means rebuilding it as new phases come online.

**Wizard outputs:**
1. `{tenantId}/config.json` — their GHL mapping (stage IDs, pipeline IDs, calendars, team)
2. `{tenantId}/playbook.md` — their AI behavior rules (generated from wizard conversation)

**Pre-requisites before building:**
- Multi-tenant foundation (multiple tenants on same deployment)
- All agent categories represented (acquisition ✅, KPIs, dispo, lead gen)
- `/playbook` page built (so tenants can edit after wizard runs)

---

## Version Map

**V1** — GHL workflows + gunner-engine (crashed, intentionally paused)
**V2** — Full agent suite running inside GHL. Automates 90%+ of the business. ← WE ARE HERE
**V3** — The command surface. GHL stays as the data layer. Gunner becomes the operating surface.

### V3 — The Adaptive List (do not build until V2 is complete)

Pipelines are a funnel metaphor. Most of the business doesn't fit a funnel:
- Dispo — simultaneous buyer marketing, not a linear progression
- Follow-up — time-based nurture, not stage-based movement
- Parts of acquisition — messy after the initial call

V3 replaces the pipeline *view* (not GHL itself) with a **role-based adaptive priority list**:
- Not "where is this contact in the funnel?"
- But "what needs to happen right now, and by whom?"

**What it looks like:**

Each team member opens Gunner and sees their list for today — ranked by urgency, deal value, time sensitivity. One-click actions. Click through to GHL for the full record.

LM view: sellers who need callbacks, follow-up sequences expiring, overnight callbacks missed
AM view: pending offers aging out, walkthroughs without numbers run, chase sequences exhausted
Dispo view: buyer inquiries unanswered, deals marketed but no movement, packages not sent

**Foundation already built:**
- `needs-attention.ts` — signal detection engine
- Pipeline Signals — 14 detection rules across 3 tiers (V1, live)
- These expand into the full V3 UI

GHL stays. Gunner becomes the place the team actually works from.

---

## Key Principles (never violate these)

1. **Slides in, doesn't replace** — Gunner works inside their existing GHL, not instead of it
2. **Config-driven, not code-driven** — changing behavior = editing playbook, not deploying code
3. **Zero hardcoded anything** — tenant names, person names, stage IDs all come from config
4. **Industry-aware** — `industry.md` is universal vertical knowledge; `playbook.md` is tenant-specific
5. **Wizard = playbook builder** — the conversation IS the onboarding, the playbook IS the output
