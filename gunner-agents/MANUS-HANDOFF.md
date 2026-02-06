# Gunner Expansion — Manus Handoff Package

**Date:** February 5, 2026
**From:** Corey + Xhaka
**To:** Manus

---

## Overview

We've spec'd out several expansions to Gunner. This package contains everything you need to build them.

**Priority Order:**
1. 🔥 **Dispo Dashboard** — New tab in Gunner (most urgent)
2. 📊 **KPI Monitor** — Daily summaries + anomaly alerts
3. 🎯 **Lead IQ Agents** — Automated lead qualification (backend)
4. 📦 **Dispo Assist Agents** — Buyer matching automation (backend)

---

## 1. Dispo Dashboard (NEW TAB)

**File:** `gunner-agents/dispo-dashboard-prd.md`

**What it is:** A new "Dispo" tab in Gunner that gives visibility into disposition operations.

**The Problem:** Corey has zero visibility into what the dispo team does. Can't track buyer engagement, showing feedback, offer status, or team performance.

**Core Features:**
- Inventory overview (all active deals + engagement stats)
- Deal detail view (buyer engagement, offers, showings, agreements)
- Buyer database (3K+ buyers synced from GHL)
- Offer tracking (compare, counter, accept/reject)
- Showing management (schedule, confirm, feedback)
- Assignment agreement workflow (DocHub integration)
- Team performance metrics

**Phase 1 MVP:**
- Overview dashboard
- Inventory table with engagement stats
- Deal detail view
- Activity feed
- GHL integration (read deals, buyers)

**Phase 2:**
- Full buyer management
- Offer tracking
- Showing management
- Assignment agreement via DocHub
- Auto outreach from dashboard

**Technical Notes:**
- 3K buyers is no problem — pagination + indexing
- Webhook-triggered sync from GHL
- Can share components with existing Gunner dashboards

---

## 2. KPI Monitor (REPORTING)

**File:** `gunner-agents/add-ons/kpi-monitor/SPEC.md`

**What it is:** Automated daily summaries and anomaly alerts delivered via Telegram.

**Outputs:**
- **Daily Summary (8 AM):** Leads, calls, pipeline, deals
- **Anomaly Alerts (real-time):** Lead drop, stale deals, SLA breaches
- **Weekly Recap (Monday):** Full performance summary

**Data Sources:**
- GHL Contacts (leads)
- GHL Opportunities (pipeline, deals)
- GHL Call logs (activity)
- GHL Calendars (appointments)

**Can be built as:**
- Standalone Gunner feature
- Or: Powered by backend agents (see Lead IQ / Dispo Assist)

---

## 3. Lead IQ Agents (BACKEND AUTOMATION)

**File:** `gunner-agents/add-ons/lead-qualification/SPEC.md`

**What it is:** AI agents that automatically qualify, score, and route new leads.

**Agents:**
1. Coordinator — orchestrates workflow
2. Data Enricher — pulls Zillow, Redfin, BatchLeads, county data
3. Qualifier — scores on 5 factors (Timeline, Condition, Price, Motivation, Source)
4. Router — assigns to team, creates tasks
5. Watchdog — monitors SLA, escalates at 30 min
6. QA Reviewer — audits 10% for accuracy

**Rules Files:**
- `rules/scoring.md` — 5-factor scoring logic
- `rules/routing.md` — assignment + SLA rules

**Key Rules (NAH-specific, configurable for other tenants):**
- PPL/Form submission = Timeline defaults to HOT
- Condition checked via Google Earth before call
- All leads → Daniel (current solo LM)
- 15 min SLA, escalate to Jessica at 30 min
- Weekend leads get auto-response, priority Monday

**Integration:**
- GHL webhooks trigger on new contact
- Agents update GHL (tags, fields, tasks)
- Alerts via Telegram

---

## 4. Dispo Assist Agents (BACKEND AUTOMATION)

**File:** `gunner-agents/add-ons/dispo/SPEC.md`

**What it is:** AI agents that match deals to buyers, draft outreach, track responses, and prep assignments.

**Agents:**
1. Dispo Coordinator — orchestrates workflow
2. Buyer Matcher — matches by Market + Property Type (required), ranks by Tier, Funding, Speed
3. Outreach Drafter — brief text + detailed email + marketing packet
4. Follow-Up Tracker — auto follow-up at 24h, 48h, 72h
5. Assignment Prepper — DocHub integration
6. Buyer Onboarder — auto-populates buyer info, sends intake forms for missing data
7. Dispo Reviewer — sanity checks

**Trigger:** Deal enters "Clear to Send Out" stage in Dispo Pipeline

**Key Features:**
- Market + Property Type = required match
- Marketing packet auto-generated
- Auto follow-up sequence
- Buyer intake flow for missing info

---

## Multi-Tenant Architecture

All features are designed for multi-tenant from day one.

**Tenant Onboarding:**
- Wizard maps their GHL pipelines, stages, fields
- NAH's setup = default template
- Other customers map their existing GHL structure

**Configuration Schema:** See `gunner-agents/add-ons/dispo/SPEC.md` → Tenant Configuration section

---

## Infrastructure (Already Spec'd)

**Files in `gunner-agents/core/`:**
- `tenant-manager.md` — Multi-tenancy, billing gates
- `message-bus.md` — Agent communication
- `ghl-connector.md` — GHL API integration
- `agent-runner.md` — Execution engine

This is the backend architecture for running AI agents. Can be built incrementally as agent features are added.

---

## Questions for Manus

1. **Dispo Dashboard:** Timeline estimate for Phase 1 MVP?
2. **Component Sharing:** Can Dispo reuse existing Gunner dashboard components?
3. **GHL Sync:** Best approach for real-time updates + rate limit handling?
4. **Agent Backend:** Build into Gunner, or separate service?
5. **DocHub Integration:** Any existing integration to build on?

---

## File Index

```
gunner-agents/
├── README.md                           # Architecture overview
├── MANUS-HANDOFF.md                    # This file
├── dispo-dashboard-prd.md              # Dispo Dashboard PRD
├── core/
│   ├── tenant-manager.md
│   ├── message-bus.md
│   ├── ghl-connector.md
│   └── agent-runner.md
└── add-ons/
    ├── lead-qualification/
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
    ├── comp-analysis/
    │   └── SPEC.md                     # PARKED - needs MasterSuite
    ├── coaching/
    │   └── SPEC.md                     # → Gunner enhancement, not separate
    ├── dispo/
    │   └── SPEC.md
    └── kpi-monitor/
        └── SPEC.md
```

---

## Next Steps

1. Manus reviews this package
2. Clarify any questions
3. Prioritize: Dispo Dashboard MVP first?
4. Build + iterate

---

Let's build it. 🚀
