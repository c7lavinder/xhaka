# Gunner White-Label — Project Tracker

**Owner:** Xhaka
**Builder:** Manus
**Status:** Phase 1 Planning

---

## Current State

- ✅ App live at getgunner.ai
- ✅ Single-tenant (NAH only)
- ✅ GHL integration working
- ✅ AI grading functional
- ✅ White-label brief complete (`gunner-whitelabel-brief.md`)

---

## Phase 1: MVP White-Label

### Deliverables
| Item | Status | Notes |
|------|--------|-------|
| Multi-tenancy (data isolation) | ⬜ Pending | |
| Stripe billing integration | ⬜ Pending | 3 tiers: $99/$249/$499 |
| Onboarding wizard | ⬜ Pending | <10 min to first graded call |
| NAH migrated as tenant | ⬜ Pending | First customer |
| Self-serve signup flow | ⬜ Pending | No demo calls |
| Basic admin dashboard | ⬜ Pending | Per-tenant + super admin |

### Open Questions for Manus

**Must answer before building:**

1. **Timeline** — What's realistic for Phase 1? Weeks? Months?

2. **Stripe experience** — Have you done Stripe Billing/Subscriptions before? Any concerns?

3. **Multi-tenancy approach** — Shared DB with tenant_id scoping, or separate DBs per tenant? Recommendation?

4. **GHL multi-account** — Current integration works for NAH. Any issues scaling to multiple GHL accounts with different OAuth tokens?

5. **Current architecture** — Quick overview of tech stack? (DB, hosting, frameworks) Need to understand what we're working with.

6. **Universal AI learning** — The anonymization pipeline for shared learning across tenants — is this feasible? What's needed?

---

## Communication Log

| Date | Direction | Summary |
|------|-----------|---------|
| 2026-02-03 | → Manus | Initial questions sent (pending) |

---

## Feature Backlog (Corey's Ideas)

**Dashboard Drill-Down** (2026-02-03)
- Click on any dashboard metric count → see list of calls that make up that number
- Example: Click "Appointments Set: 7" → shows the 7 calls where appointments were set
- Applies to: Calls Made, Conversations, Appointments Set, Offers Accepted, etc.
- Makes metrics actionable, not just numbers

**Auto-Route Activity to Lead Source** (2026-02-03)
- When AM/LM logs an offer or appointment with an address, system looks up lead source from CRM
- Auto-populates the correct campaign/channel report
- Eliminates manual data entry step (currently done weekly by data manager)
- Requires: Lead source tracked on CRM contacts

**Training Library — Call Snippet Extraction** (2026-02-03)
- Upload existing call recordings → auto-transcribe → AI finds valuable moments
- Auto-extracts: objection handling, closing techniques, rapport building, red flags
- Searchable library with tags and clips
- Use case: "Here's what your top performers do differently" with proof clips
- Could analyze graded calls to surface best examples automatically
- Feeds into team onboarding/training content

**Missed Opportunity Scanner** (2026-02-04)
- AI scans calls for signals the rep might have missed
- Detects: subtle motivation cues, prices that indicate potential, soft buying signals
- Flags missed opportunities to managers/supervisors automatically
- Captures the "experienced ear" knowledge (stuff Corey notices that newer reps don't)
- Use case: Manager gets alert "Call #4521 — seller mentioned $85k, rep didn't follow up on below-market price"
- Turns Gunner from post-call grading into active deal-saver
- Could include: confidence score, timestamp of missed moment, suggested follow-up action

**Smart Call Classification + Connect Rate Analytics** (2026-02-04)
- AI listens to first few seconds of each call → properly classifies outcome
- Categories: voicemail (carrier vs personal), disconnected, wrong number, no answer, gatekeeper, actual conversation
- GHL misclassifies these — AI gets it right by actually listening
- Tracks connect rates over time, flags anomalies ("Daniel's rate dropped 40% this week")
- Diagnoses causes: bad list data, spam-flagged numbers, wrong calling times, area code patterns
- Use case: "150 dials, 20 conversations — 85 were carrier voicemails on 615 list, possible spam flag"
- Gives managers actionable data instead of just "low connects"

---

## Phase 2 (After MVP)
- HubSpot integration
- Salesforce integration
- Industry templates
- Custom badges per tenant

## Phase 3 (Scale)
- API access
- Advanced analytics
- Reseller/agency tier

---

## Notes

- Self-serve only — no demo calls, no custom pricing
- Single codebase — all tenants get updates together
- Target: 100 customers without touching anything manually
