# Gunner V2 — Kickoff Brief for Manus

**From:** Corey
**Date:** Feb 12, 2026

---

## The Big Picture

V1 is done. Call grading, AI Coach, Pipeline Signals, gamification, analytics — all live. Ready to onboard users. Bug fixes and patches will continue on the V1 project.

V2 turns Gunner from a call coaching tool into a full business operating system. Five pillars:

---

## Pillar 1: Agent Suite ($49/mo or $99/mo add-ons)

Full AI agent suite plugged into every part of the wholesaling workflow. Each agent is an add-on — easy to onboard, plug and play. Not all-or-nothing.

### Agents to Build (15 spec'd, more to come):

| # | Agent | What It Does | Spec |
|---|-------|-------------|------|
| 1 | Lead IQ | Qualifies, scores, routes new leads | `add-ons/lead-qualification/SPEC.md` |
| 3 | LM Assistant | Post-call automation for Lead Managers | `add-ons/lm-assistant/SPEC.md` |
| 4 | Follow Up Bot | Intelligent nurture sequences | `add-ons/follow-up/SPEC.md` |
| 5 | Appointment Bot | Scheduling, confirmations, no-show handling | `add-ons/appointment/SPEC.md` |
| 6 | AM Assistant | Post-call automation for Acquisition Managers | `add-ons/am-assistant/SPEC.md` |
| 7 | Contract Bot | Generate, send, track contracts | `add-ons/contract/SPEC.md` |
| 10 | Post-Close Bot | Thank you, reviews, referrals | `add-ons/post-close/SPEC.md` |
| 11 | Data Hygiene | Clean/deduplicate CRM data | `add-ons/data-hygiene/SPEC.md` |
| 12 | KPI Entry | Auto-populate spreadsheets (Manus builds sheet) | `add-ons/kpi-entry/SPEC.md` + `SPEC-NAH.md` |
| 13 | Report Generator | Daily/weekly/monthly reports | `add-ons/report-generator/SPEC.md` |
| 16 | After-Hours Bot | Engage leads outside business hours | `add-ons/after-hours/SPEC.md` |
| 17 | Callback Capture | AI processes inbound callbacks from cold outreach | `add-ons/callback-capture/SPEC.md` |
| 19 | Market Watch | Market trends and comps | `add-ons/market-watch/SPEC.md` |
| 20 | MLS Monitor | Alert when pipeline properties list on MLS | `add-ons/mls-monitor/SPEC.md` |
| — | Voicemail Bot | Pull from CallRail, transcribe, match to GHL, alert team | `add-ons/voicemail/SPEC.md` |

**Already Built:** PPL Refund Bot (`add-ons/ppl-refund/src/`) — TypeScript + Playwright

### Build Priority:
**Phase 1 — Core Deal Flow:** Lead IQ → LM Assistant → Appointment Bot → AM Assistant → Follow Up Bot
**Phase 2 — Deal Completion:** Contract Bot → Post-Close Bot
**Phase 3 — Operations:** Data Hygiene → KPI Entry → Report Generator
**Phase 4 — Communication & Intel:** After-Hours → Callback Capture → Market Watch → MLS Monitor

### Integrations Ready:
| Service | API Key | Purpose |
|---------|---------|---------|
| GHL | `pit-e58461e4-1672-4249-9bc0-c465decf7f26` | Leads, pipeline, calls, contacts |
| BatchDialer | `d98ac867-62b7-439d-8d72-a19004a93e25` | Call metrics |
| BatchLeads | `06b81a7c-f69c-42c3-bc1f-c8ed55d01e1a` | SMS metrics |
| CallRail | `267bcdd64628abc9c9c4c43e8a46dca2` | Voicemails, call logs |

### NAH Team (first tenant — becomes default template):
- Lead Managers: Daniel Lozano, Chris Segura
- Acquisition Manager: Kyle Barks
- Dispo Manager: Esteban
- Data Manager: Jessica Guzman

Full agent handoff doc with all edge cases, GHL config, and special notes: `MANUS-HANDOFF-FINAL.md`

---

## Pillar 2: Smarter AI / LLM Intelligence

Make the AI in Gunner genuinely learn and improve over time. Three areas:

### AI Coach Learning System
- Capture before/after when users edit AI-generated SMS, tasks, notes
- Build per-user preference profiles from edit patterns
- Inject preferences as context at session start
- Team-wide defaults for new users with no history
- No ML/fine-tuning needed — just a feedback capture loop + context injection

### Pipeline Signals V2
Expanding beyond V1's 14 rules. New detections:

- **Rule 1 enabled** — Lead moved to follow-up without a call (was disabled in V1 — too noisy)
- **Seller gave timeline/meeting window, agent left it open-ended** — e.g., seller says "I'll be in town in March" and agent responds "reach out anytime" with no appointment set (see real example: Robin Phelps in `signals-v2-examples.md`)
- **Offer made, seller didn't say no, team went silent** — no counter or follow-up within 48h
- **Multiple leads from same property address** — different household members calling separately
- **High seller talk-time ratio but got DQ'd** — seller was engaged, team dismissed too fast
- **Callback window detection** — seller said "call me back in [timeframe]," check if it happened

### Team Intelligence
- AI learns each team member's patterns, strengths, weaknesses
- Personalized coaching recommendations based on individual trends
- Know who needs what kind of coaching without manual review

---

## Pillar 3: Underwriting / Deal Analysis

Gunner moves from call coaching into deal intelligence. **Two versions:**

### NAH Version
- Uses **MasterSuite** (NAH franchise underwriting tool)
- ARV calculation, repair estimates, construction budgets
- NAH franchise "Drive-By Grading" system baked in
- Full spec: `add-ons/arv-assistant/SPEC.md` (includes training data)

### Non-NAH Version
- Uses a different underwriting method/tool for wholesalers outside the NAH system
- Needs to be defined — different data sources, different grading criteria
- Goal: any wholesaler can plug Gunner into their deal analysis workflow

---

## Pillar 4: Dispo Dashboard

Full visibility into buyer-side activity. Solves: "I have to trust my dispo manager a lot and I do not like that."

### What It Shows:
- **Today's Activity** — deals sent out, buyers contacted, responses received, hot interest
- **Inventory Status** — all active deals and their buyer engagement levels
- **Buyer Interest** — who's interested, who passed, why
- **Buyer Feedback Patterns** — why deals aren't moving
- **Dispo Team Metrics** — performance over time

### User Roles:
- Owner (Corey): Full dashboard, all metrics, settings
- Dispo Manager (Esteban): Activity view, deal management, buyer outreach

Full PRD with wireframes and data requirements: `dispo-dashboard-prd.md`
Manus-ready spec: `add-ons/dispo/MANUS-PRD.md`

---

## Pillar 5: Control Room / KPI Management

The business accountability dashboard — one screen that tells the owner if the machine is running.

### What It Shows:
- Real-time KPI tracking and daily number management
- SLA breach detection and alerts
- Team performance at a glance
- Pipeline bottleneck identification
- Trend tracking — getting better or worse?
- Stuck leads and why they're stuck

### Related Specs:
- Control Room PRD: `add-ons/control-room/MANUS-PRD.md`
- The Pulse (monitoring framework): `add-ons/pulse/SPEC.md`

This isn't a workflow tool — it's the instrument panel you check every morning.

---

## Architecture Notes

### Scalability is Non-Negotiable
This isn't a tool for one team. This is a platform that needs to handle hundreds of tenants, thousands of agents running simultaneously, and millions of data points. Every architecture decision should be made with scale in mind — not "what works for NAH" but "what works for 500 wholesaling operations."

### Agent Design Philosophy: High Floor, High Ceiling
Every agent needs to:
- **High Floor** — Work out of the box with zero configuration. A new user activates an agent and it immediately adds value. No setup wizards, no 30-minute onboarding calls, no "configure your settings first." Smart defaults handle 80% of cases.
- **High Ceiling** — Scale to handle complex, high-volume operations. Power users can customize rules, thresholds, triggers, and workflows. The agent grows with the business. What works for a 2-person team also works for a 20-person team doing 500 calls/day.

### Every Touchpoint is an Automation Opportunity
Look at the entire wholesaling process end-to-end — every manual step, every decision point, every handoff between people. If a human is doing it repetitively, an agent should be doing it or at least assisting. The 15 agents listed here are the starting set. The platform needs to be built so adding new agents is easy — plug-in architecture, shared data layer, common integration points. We will keep finding new things to automate.

### 10-Minute Onboarding — This is the Bar
A new customer should go from signing up to having agents running in 10 minutes. Not 10 minutes of reading docs. Not 10 minutes on a call with us. 10 minutes of clicking buttons and watching things work.

That means:
- **Connect GHL → agents auto-discover everything** (pipelines, stages, team members, custom fields)
- **Smart defaults for every setting** — thresholds, SLAs, schedules, templates all pre-configured for wholesaling
- **One-click agent activation** — toggle an agent on, it starts working. No configuration screens unless the user wants to customize.
- **Guided but fast** — if there's a setup flow, it's 3-5 screens max, not a wizard with 20 steps
- **No training required** — if someone needs a tutorial to use an agent, the UX is wrong

The entire onboarding spec is in `TENANT-ONBOARDING.md`.

### Other Principles:
- **Add-on model** — agents are modular, not monolithic. Users pick what they need.
- **Zero-config where possible** — agents auto-discover pipelines, stages, team from GHL
- **NAH is the first tenant** — their config becomes the default template
- **The suite will grow** — these 15 agents are the starting set, not the final list
- **Plugin architecture** — adding a new agent should be straightforward, not a rewrite

---

## Files Included

All specs, PRDs, and reference docs are in the `gunner-agents/` directory:

```
gunner-agents/
├── MANUS-HANDOFF-FINAL.md      # Full agent suite handoff (V1 version)
├── MANUS-V2-KICKOFF.md         # This file
├── v2-roadmap.md               # 5-pillar roadmap
├── signals-v1-spec.md          # Pipeline Signals V1 (14 rules — reference)
├── signals-v2-examples.md      # Real missed opportunity examples
├── dispo-dashboard-prd.md      # Dispo dashboard full PRD
├── TENANT-ONBOARDING.md        # Client onboarding flow
├── GUNNER-DEV-GUIDE.md         # Developer guide
│
└── add-ons/                    # Individual agent specs
    ├── lead-qualification/     # Lead IQ
    ├── lm-assistant/           # LM Assistant
    ├── follow-up/              # Follow Up Bot
    ├── appointment/            # Appointment Bot
    ├── am-assistant/           # AM Assistant
    ├── contract/               # Contract Bot
    ├── post-close/             # Post-Close Bot
    ├── data-hygiene/           # Data Hygiene
    ├── kpi-entry/              # KPI Entry (generic + NAH)
    ├── report-generator/       # Report Generator
    ├── after-hours/            # After-Hours Bot
    ├── callback-capture/       # Callback Capture
    ├── voicemail/              # Voicemail Bot
    ├── market-watch/           # Market Watch
    ├── mls-monitor/            # MLS Monitor
    ├── ppl-refund/             # PPL Refund (BUILT)
    ├── arv-assistant/          # ARV Assistant + training data
    ├── dispo/                  # Dispo agents + rules
    ├── control-room/           # Control Room PRD
    ├── pulse/                  # The Pulse (KPI monitoring)
    ├── coaching/               # AI Coaching agents + rules
    └── comp-analysis/          # Comp Analysis agents + rules
```

---

## Questions for You (Manus)

1. Can the V2 Manus project handle background job scheduling (hourly scans, automated agent runs, webhook listeners) at scale — not for 1 tenant but for hundreds?
2. Database architecture — can we handle 15+ agents per tenant, hundreds of tenants, all reading/writing concurrently? What's the scaling strategy?
3. What are the hard limits of the Manus platform? We need to know the walls before we hit them mid-build.
4. Recommended approach for the add-on billing model ($49/$99 tiers) within the app?
5. What does the agent plugin architecture look like? Adding a new agent should be plug-and-play for us as developers — shared data layer, common hooks, standard patterns. Not a custom build every time.
6. How do we handle multi-tenant data isolation at scale? Each tenant's agents should only see their data, period.

---

Let's build it.
