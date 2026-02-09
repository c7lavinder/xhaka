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
| 17 | Voicemail Bot | Transcribes, summarizes, routes VMs | `voicemail/SPEC.md` |
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

### #16 After-Hours Bot
- Morning report → **GHL internal chat** to Lead Managers specifically
- Architecture: text/email now, **modular for future AI voice agent**

### #17 Voicemail Bot
- Source: **CallRail** (not GHL voicemails)
- CallRail API Key: `267bcdd64628abc9c9c4c43e8a46dca2`

### #12 KPI Entry
- NAH-specific version spec: `kpi-entry/SPEC-NAH.md`
- Data sources: BatchDialer + BatchLeads + GHL (all via Gunner)
- "Conversation" = disposition-based, NOT duration-based

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
| CallRail | Voicemail transcription | `267bcdd64628abc9c9c4c43e8a46dca2` |

### PPL Platforms (Browser Automation)
| Platform | Login | Dispute Window |
|----------|-------|----------------|
| Leadzolo | `corey@newagainhouses.com` / `Belmont2026` | 7 days |
| MotivatedSellers | `corey@newagainhouses.com` / `Belmont2026` | 10 days |
| PropertyLeads | `corey@newagainhouses.com` / `Belmont2026!` | ~7 days |

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
9. **KPI Entry** — No more manual spreadsheet work
10. **Report Generator** — Insights delivered automatically

### Phase 4: Communication & Intelligence
11. **After-Hours Bot** — Never miss a lead
12. **Voicemail Bot** — Process all messages
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

**KPI Spreadsheet:** `2026 KPIs - Getleadsfaster` (ID: `1erZTFb87xbxZEct7mZqFCW7Nb-47_t_LNtK-TfkYYas`)

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
    ├── voicemail/SPEC.md             # #17 Voicemail Bot
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

## Success Criteria

**Phase 1 Complete When:**
- New lead → qualified and assigned (auto)
- LM call → summary, stage move, task (auto)
- Appointment → confirmed, reminded (auto)
- AM meeting → summary, next steps (auto)

**Full Suite Complete When:**
- Lead to close fully automated
- Daily reports delivered without asking
- No manual data entry anywhere
- Never miss a voicemail or after-hours lead
- Know when pipeline properties hit MLS

---

## Let's Build It! 🚀

All specs validated by Corey. Start with Phase 1 and go.

Questions? Ping us.
