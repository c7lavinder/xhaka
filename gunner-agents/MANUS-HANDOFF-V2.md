# Gunner Agent Suite — Complete Handoff Package v2

**Date:** February 8, 2026
**From:** Corey + Xhaka
**To:** Manus

---

## Overview

Complete AI agent suite for Gunner CRM. 22 agents covering the entire real estate wholesaling workflow from lead to close, plus operational support bots.

**Design Principles:**
- Zero-config where possible — works out of the box
- Auto-discovery — detects pipelines, stages, team automatically  
- Smart defaults — industry-standard settings pre-configured
- Progressive complexity — basic works instantly, customization optional

---

## Agent Inventory (22 Total)

### Core Deal Flow (11 agents)
| Agent | Function | Config Needed |
|-------|----------|---------------|
| Lead IQ | Qualifies, scores, routes new leads | None (auto) |
| Pre-Call Brief | Prepares call context for reps | None (auto) |
| LM Assistant | Post-call automation for Lead Managers | None (auto) |
| Follow Up Bot | Intelligent nurture sequences | None (auto) |
| Appointment Bot | Schedules, confirms, manages appointments | None (auto) |
| AM Assistant | Post-call automation for Acquisition Managers | None (auto) |
| Contract Bot | Generates, sends, tracks contracts | DocuSign/DocHub |
| Dispo Assist | Matches deals to buyers, drafts outreach | None (auto) |
| Showing Bot | Coordinates buyer property viewings | None (auto) |
| Title Bot | Tracks closing process, chases docs | Title company contact |
| Post-Close Bot | Thank you, reviews, referrals | None (auto) |

### Operations (6 agents)
| Agent | Function | Config Needed |
|-------|----------|---------------|
| Data Hygiene | Cleans duplicates, validates data | None (auto) |
| KPI Auto-Entry | Populates spreadsheets from CRM | Google Sheets |
| Report Generator | Daily/weekly/monthly reports | None (auto) |
| Commission Bot | Calculates team payouts | None (default splits) |
| Cash Flow Bot | Forecasts revenue from pipeline | None (auto) |
| PPL Refund Bot | Files refund disputes for bad leads | Select providers |

### Communication (3 agents)
| Agent | Function | Config Needed |
|-------|----------|---------------|
| After-Hours Bot | Engages leads outside business hours | Business hours |
| Voicemail Bot | Transcribes, summarizes, routes VMs | None (auto) |
| Email Triage Bot | Sorts, prioritizes, drafts responses | Gmail/Outlook |

### Market Intelligence (2 agents)
| Agent | Function | Config Needed |
|-------|----------|---------------|
| Market Watch Bot | Monitors market trends, provides comps | None (auto) |
| MLS Monitor Bot | Alerts when pipeline properties list | None (auto) |

---

## File Structure

```
gunner-agents/
├── README.md                    # Architecture overview
├── MANUS-HANDOFF-V2.md          # This file
├── TENANT-ONBOARDING.md         # How clients onboard (zero-config)
│
├── core/                        # Shared infrastructure
│   ├── tenant-manager.md
│   ├── message-bus.md
│   ├── ghl-connector.md
│   └── agent-runner.md
│
└── add-ons/
    ├── lead-qualification/      # Lead IQ
    │   ├── SPEC.md
    │   ├── agents/
    │   │   ├── coordinator.md
    │   │   ├── data-enricher.md
    │   │   ├── qualifier.md
    │   │   ├── router.md
    │   │   ├── watchdog.md
    │   │   └── qa-reviewer.md
    │   └── rules/
    │       ├── scoring.md
    │       └── routing.md
    │
    ├── pre-call-brief/SPEC.md
    ├── lm-assistant/SPEC.md
    ├── follow-up/SPEC.md
    ├── appointment/SPEC.md
    ├── am-assistant/SPEC.md
    ├── contract/SPEC.md
    ├── dispo/SPEC.md            # Dispo Assist
    ├── showing/SPEC.md
    ├── title/SPEC.md
    ├── post-close/SPEC.md
    │
    ├── data-hygiene/SPEC.md
    ├── kpi-entry/SPEC.md
    ├── report-generator/SPEC.md
    ├── commission/SPEC.md
    ├── cash-flow/SPEC.md
    ├── ppl-refund/SPEC.md
    │
    ├── after-hours/SPEC.md
    ├── voicemail/SPEC.md
    ├── email-triage/SPEC.md
    │
    ├── market-watch/SPEC.md
    └── mls-monitor/SPEC.md
```

---

## Priority Order for Build

### Phase 1: Core Deal Flow (Week 1-2)
Must work end-to-end before anything else.

1. **Lead IQ** — Leads come in qualified and routed
2. **Pre-Call Brief** — Reps have context before calling
3. **LM Assistant** — Post-call handled automatically
4. **Appointment Bot** — Appointments confirmed and managed
5. **AM Assistant** — Offer process automated
6. **Follow Up Bot** — Nurture happens without manual work

### Phase 2: Deal Completion (Week 2-3)
Closing the loop on deals.

7. **Contract Bot** — Contracts sent and tracked
8. **Dispo Assist** — Buyer matching automated
9. **Showing Bot** — Showings coordinated
10. **Title Bot** — Closing tracked
11. **Post-Close Bot** — Wrap-up automated

### Phase 3: Operations (Week 3-4)
Business health and efficiency.

12. **Data Hygiene** — Clean CRM automatically
13. **KPI Auto-Entry** — No more manual spreadsheet work
14. **Report Generator** — Insights delivered automatically
15. **Commission Bot** — Payouts calculated
16. **Cash Flow Bot** — Revenue forecasted

### Phase 4: Communication & Intelligence (Week 4)
Polish and competitive advantage.

17. **After-Hours Bot** — Never miss a lead
18. **Voicemail Bot** — Process all messages
19. **Email Triage** — Inbox managed
20. **Market Watch** — Market insights
21. **MLS Monitor** — Competitive alerts
22. **PPL Refund** — Money recovered

---

## Tenant Onboarding (Critical)

**See:** `TENANT-ONBOARDING.md`

**Key Points:**
- New client → fully operational in <10 minutes
- Only REQUIRED input: Connect GHL
- Everything else auto-configured with smart defaults
- Progressive customization (don't overwhelm on day 1)

**Onboarding Flow:**
1. Connect GHL (OAuth) — 2 min
2. Review auto-detected config — 30 sec
3. Select agents (defaults pre-checked) — 2 min
4. Confirm preferences (hours, contact) — 1 min
5. Done! Agents active.

---

## Integration Requirements

### Required
- GHL API (OAuth + webhooks)
- Database (tenant configs, agent state)
- Message queue (agent communication)
- Notification service (SMS, email, push)

### Optional (Enable Additional Features)
- DocuSign/DocHub (Contract Bot)
- Gmail/Outlook API (Email Triage)
- Google Sheets API (KPI Entry)
- Twilio (advanced SMS)

---

## Key Technical Decisions

### Multi-Tenancy
- Complete data isolation per tenant
- Shared codebase, per-tenant config
- Billing-gated features (agents only run if paid)

### Agent Architecture
- Event-driven (webhooks trigger agents)
- Stateless execution (state in DB)
- Async processing (queue-based)
- Idempotent operations (safe retries)

### GHL Integration
- OAuth for account access
- Webhooks for real-time events
- API for reads/writes
- Rate limiting handled automatically

### Scaling Target
- 100+ tenants
- 20,000+ events/day across tenants
- <30 second processing per event
- 99.9% uptime

---

## What NAH Provides

NAH (New Again Houses) is the first tenant and template:

- **Verified rules** — Lead qualification, scoring, routing
- **Actual workflows** — How a real wholesaler operates
- **Stage mappings** — What pipeline stages mean
- **Team structure** — LM/AM/Dispo roles

NAH's config becomes the default template for all new tenants.

---

## Questions for Manus

1. **Timeline** — Realistic estimate for Phase 1 (core deal flow)?
2. **Agent Backend** — Node.js workers? Serverless functions? Separate service?
3. **Real-time vs Batch** — Which agents need instant processing?
4. **GHL Webhook Limits** — Any concerns at scale?
5. **Existing Gunner Code** — What can we reuse?

---

## Success Criteria

**Phase 1 Complete When:**
- New lead → qualified and assigned (auto)
- LM call → summary, stage move, task (auto)
- Appointment → confirmed, reminded (auto)
- AM meeting → summary, next steps (auto)
- Deal → tracked through pipeline (auto)

**Full Suite Complete When:**
- Lead to close fully automated
- Daily reports delivered without asking
- Team knows what to do each day
- Cash flow visible at a glance
- No manual data entry anywhere

---

## Let's Build It! 🚀

All specs are in `gunner-agents/add-ons/[agent]/SPEC.md`

Start with Lead IQ → Pre-Call Brief → LM Assistant and go from there.

Ping us with questions. We're here to support.
