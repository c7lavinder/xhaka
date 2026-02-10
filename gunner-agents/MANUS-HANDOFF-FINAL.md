# Gunner Agent Suite — Final Build Handoff

**Date:** February 9, 2026  
**From:** Corey + Xhaka  
**To:** Manus  
**Status:** ✅ VALIDATED — Ready to build

---

## Overview

AI agent suite for Gunner CRM. **16 agents** covering the real estate wholesaling workflow from lead to close.

**Design Principles:**
- Zero-config where possible — works out of the box
- Auto-discovery — detects pipelines, stages, team automatically  
- Smart defaults — industry-standard settings pre-configured
- Multi-tenant SaaS — works for any wholesaler, not just NAH

---

## Final Agent List (16 Total)

### ✅ Approved for Build (15)

| # | Agent | Function | Spec Location |
|---|-------|----------|---------------|
| 1 | Lead IQ | Qualifies, scores, routes new leads | `lead-qualification/SPEC.md` |
| 3 | LM Assistant | Post-call automation for Lead Managers | `lm-assistant/SPEC.md` |
| 4 | Follow Up Bot | Intelligent nurture sequences | `follow-up/SPEC.md` |
| 5 | Appointment Bot | Schedules, confirms, manages appointments | `appointment/SPEC.md` |
| 6 | AM Assistant | Post-call automation for Acquisition Managers | `am-assistant/SPEC.md` |
| 7 | Contract Bot | Generates, sends, tracks contracts | `contract/SPEC.md` |
| 10 | Post-Close Bot | Thank you, reviews, referrals | `post-close/SPEC.md` |
| 11 | Data Hygiene | Cleans duplicates, validates data | `data-hygiene/SPEC.md` |
| 12 | KPI Entry | Populates spreadsheets from CRM | `kpi-entry/SPEC.md` |
| 13 | Report Generator | Daily/weekly/monthly reports | `report-generator/SPEC.md` |
| 16 | After-Hours Bot | Engages leads outside business hours | `after-hours/SPEC.md` |
| 17 | **Callback Capture Bot** | Processes cold outreach callbacks | `callback-capture/SPEC.md` |
| 19 | Market Watch | Monitors market trends, provides comps | `market-watch/SPEC.md` |
| 20 | MLS Monitor | Alerts when pipeline properties list | `mls-monitor/SPEC.md` |

### ✅ Already Built (1)

| # | Agent | Function | Location |
|---|-------|----------|----------|
| 22 | PPL Refund | Files refund disputes for bad PPL leads | `ppl-refund/src/` |

### ❌ Scrapped (6)

| # | Agent | Reason |
|---|-------|--------|
| 2 | Pre-Call Brief | Not needed |
| 8 | Showing Bot | Not needed |
| 9 | Title Bot | Not needed |
| 14 | Commission Bot | Not needed |
| 15 | Cash Flow Bot | Not needed |
| 18 | Email Triage | Not useful |

---

## Special Notes Per Agent

### #17 Callback Capture Bot (UPDATED — Replaces Voicemail Bot)

**What it does:** Processes ALL inbound calls from cold outreach callbacks (BatchDialer/BatchLeads). Team currently listens to hundreds of these manually per week.

**Source:** CallRail (all inbound calls — answered + voicemails)

**Flow:**
```
Cold call/text goes out (BatchDialer/BatchLeads)
    ↓
Seller calls back
    ↓
CallRail captures the call
    ↓
Bot listens to recording, classifies lead vs not
    ↓
If lead → Create GHL Opportunity
If not → Ignore completely (no logging)
```

**GHL Output:**
- Pipeline: **Sales Process**
- Stage: **New Lead**
- Source field: Based on which number they called back

**Source Mapping:**
| CallRail Number Name | GHL Source Field |
|---------------------|------------------|
| Cold Texting | Texts |
| BatchDialer | Dialer |

**Data Extraction:**
- Name (if given)
- Phone (from caller ID)
- Address (if given — often not provided)
- Intent summary

**Edge Cases:**
- Caller says "I have something to sell" but no address → Still creates opportunity with phone + name, address blank
- Not a lead (wrong number, spam, etc.) → **No action, completely ignored**

**No task creation needed** — GHL automations trigger off new opportunity in "New Lead" stage

**Dependency:** Corey is routing BatchDialer voicemails → CallRail (in progress, will notify when done)

**API:** CallRail Key: `267bcdd64628abc9c9c4c43e8a46dca2`

---

### #13 Report Generator (FULL SPEC)

**Delivery:** All reports → Corey via email/Gunner dashboard

#### Daily Digest (Every Morning)
| Section | Metrics |
|---------|---------|
| Yesterday's Activity | Calls made, leads generated, appointments set |
| Today's Priorities | Appointments scheduled, deals to follow up, tasks due |
| Red Flags | Dead pipeline (no activity >3 days), missed follow-ups, stuck deals |
| Quick Wins | Hot leads, callbacks requested, easy closes |

#### Weekly Snapshot (Monday AM)
| Section | Metrics |
|---------|---------|
| Lead Flow | New leads by source (Dialer, Texts, PPL), cost per lead, lead quality score |
| Pipeline Health | Leads → Appointments → Contracts → Closes, conversion % at each stage |
| Team Performance | Calls, conversations, appointments by LM; contracts by AM; Gunner avg grade |
| Velocity | Avg days in each stage, stuck deals (>7 days no activity) |
| Money | Deals closed, revenue, avg profit per deal, PPL refunds recovered |

#### Monthly Deep Dive (1st of Month)
| Section | Metrics |
|---------|---------|
| ROI by Channel | Marketing spend vs revenue per source |
| Trend Lines | Month-over-month: lead volume, conversion rates, revenue |
| Team Rankings | Leaderboard with Gunner grades, conversion rates |
| Missed Opportunities | Summary of AI-flagged deals worth revisiting |
| Forecast | Pipeline value weighted by stage probability |
| Recommendations | AI insights on what to improve next month |

---

### #16 After-Hours Bot
- Morning report → **GHL internal chat** to Lead Managers specifically
- Architecture: text/email now, **modular for future AI voice agent**

---

### #12 KPI Entry
- **Manus builds the spreadsheet** — no existing sheet to connect
- NAH-specific version spec: `kpi-entry/SPEC-NAH.md`
- Data sources: BatchDialer + BatchLeads + GHL (all via Gunner)
- "Conversation" = disposition-based, NOT duration-based

---

### #22 PPL Refund (Already Built)
- Full TypeScript + Playwright implementation in `ppl-refund/src/`
- Platforms: Leadzolo, MotivatedSellers, PropertyLeads
- Note: MotivatedSellers has reCAPTCHA — needs CAPTCHA service or manual session

---

## Integrations (All Ready)

### Connected to Gunner ✅
| Source | Data | Status |
|--------|------|--------|
| GHL | Leads, contacts, pipeline, calls | ✅ Connected |
| BatchDialer | Calls made, conversations (disposition-based) | ✅ Connected |
| BatchLeads | SMS sent, SMS received | ✅ Connected |

### API Keys Available ✅
| Service | Purpose | Key |
|---------|---------|-----|
| BatchDialer | Call metrics for KPI Entry | `d98ac867-62b7-439d-8d72-a19004a93e25` |
| BatchLeads | SMS metrics for KPI Entry | `06b81a7c-f69c-42c3-bc1f-c8ed55d01e1a` |
| CallRail | Callback transcription | `267bcdd64628abc9c9c4c43e8a46dca2` |

### PPL Platforms (Browser Automation)
| Platform | Login | Dispute Window |
|----------|-------|----------------|
| Leadzolo | `corey@newagainhouses.com` / `Belmont2026` | 7 days |
| MotivatedSellers | `corey@newagainhouses.com` / `Belmont2026` | 10 days |
| PropertyLeads | `corey@newagainhouses.com` / `Belmont2026!` | ~7 days |

---

## GHL Configuration (NAH)

**Location ID:** `hmD7eWGQJE7EVFpJxj4q`

**Pipeline:** Sales Process
**Starting Stage:** New Lead

**Source Values (for Callback Capture Bot):**
- `Texts` — Callbacks from cold texting
- `Dialer` — Callbacks from cold calling

---

## Build Priority

### Phase 1: Core Deal Flow
1. **Lead IQ** — Leads come in qualified and routed
2. **LM Assistant** — Post-call handled automatically
3. **Appointment Bot** — Appointments confirmed and managed
4. **AM Assistant** — Offer process automated
5. **Follow Up Bot** — Nurture happens without manual work

### Phase 2: Deal Completion
6. **Contract Bot** — Contracts sent and tracked
7. **Post-Close Bot** — Wrap-up automated

### Phase 3: Operations
8. **Data Hygiene** — Clean CRM automatically
9. **KPI Entry** — No more manual spreadsheet work (Manus builds sheet)
10. **Report Generator** — Daily/Weekly/Monthly insights delivered

### Phase 4: Communication & Intelligence
11. **After-Hours Bot** — Never miss a lead
12. **Callback Capture Bot** — Process hundreds of callbacks automatically
13. **Market Watch** — Market insights
14. **MLS Monitor** — Competitive alerts

### Already Done
15. **PPL Refund** — ✅ Built and ready

---

## NAH as Template

NAH (New Again Houses) is the first tenant:

**Team Structure:**
- Lead Managers (LMs): Chris Segura, Daniel Lozano
- Acquisition Manager (AM): Kyle Barks
- Dispo Manager: Esteban
- Data Manager: Jessica

NAH's config becomes the default template for all new tenants.

---

## File Structure

```
gunner-agents/
├── MANUS-HANDOFF-FINAL.md       # This file
├── TENANT-ONBOARDING.md         # Client onboarding flow
│
└── add-ons/
    ├── lead-qualification/SPEC.md    # #1 Lead IQ
    ├── lm-assistant/SPEC.md          # #3 LM Assistant
    ├── follow-up/SPEC.md             # #4 Follow Up Bot
    ├── appointment/SPEC.md           # #5 Appointment Bot
    ├── am-assistant/SPEC.md          # #6 AM Assistant
    ├── contract/SPEC.md              # #7 Contract Bot
    ├── post-close/SPEC.md            # #10 Post-Close Bot
    ├── data-hygiene/SPEC.md          # #11 Data Hygiene
    ├── kpi-entry/SPEC.md             # #12 KPI Entry (generic)
    ├── kpi-entry/SPEC-NAH.md         # #12 KPI Entry (NAH-specific)
    ├── report-generator/SPEC.md      # #13 Report Generator
    ├── after-hours/SPEC.md           # #16 After-Hours Bot
    ├── callback-capture/SPEC.md      # #17 Callback Capture Bot (was Voicemail)
    ├── market-watch/SPEC.md          # #19 Market Watch
    ├── mls-monitor/SPEC.md           # #20 MLS Monitor
    └── ppl-refund/                   # #22 PPL Refund (BUILT)
        ├── SPEC.md
        ├── README.md
        ├── package.json
        ├── tsconfig.json
        └── src/
            ├── index.ts
            ├── types.ts
            ├── detection.ts
            └── platforms/
                ├── leadzolo.ts
                ├── motivatedsellers.ts
                └── propertyleads.ts
```

---

## Gunner V1 Polish (Also Needed)

While building agents, also fix:

1. **TOS/Privacy links** — Dead links in footer (already flagged)
2. **Admin-only tabs** — Hide "Failure to upload" and "AI feedback" from non-admin users
3. **Opportunities Missed** — New dashboard feature (spec at `features/opportunities-missed-SPEC.md`)

---

## Success Criteria

**Phase 1 Complete When:**
- New lead → qualified and assigned (auto)
- LM call → summary, stage move, task (auto)
- Appointment → confirmed, reminded (auto)
- AM meeting → summary, next steps (auto)

**Full Suite Complete When:**
- Lead to close fully automated
- Daily/weekly/monthly reports delivered automatically
- No manual data entry anywhere
- Never miss a callback — hundreds processed automatically
- Know when pipeline properties hit MLS
- PPL refunds filed automatically

---

## Blockers

| Item | Status | Owner |
|------|--------|-------|
| CallRail receiving BatchDialer calls | In Progress | Corey |
| GHL Source values (Texts, Dialer) | Pending | Corey |

Xhaka will ping Corey tomorrow (Feb 10) to confirm CallRail routing is complete.

---

## Let's Build It! 🚀

All specs validated by Corey. Start with Phase 1 and go.

Questions? Ping us.
