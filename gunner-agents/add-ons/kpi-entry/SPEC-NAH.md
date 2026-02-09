# KPI Auto-Entry Bot — NAH Specific

## Overview
Automatically populates NAH's KPI spreadsheet by pulling data from GHL, BatchDialer, and BatchLeads. Eliminates manual data entry, updates daily metrics in real-time.

**This is a custom build for New Again Houses.**  
For generic Gunner version (GHL-only), see `SPEC.md`.

---

## Data Sources

### 1. GHL (Primary CRM)
| Data Point | GHL Location |
|------------|--------------|
| New leads by source | Contact.lead_source + created_date |
| Pipeline stages | Opportunities by stage |
| Appointments set | Calendar events |
| Appointments completed | Calendar events (past + completed tag) |
| Offers made | Opportunity stage = "Made Offer" |
| Under contract | Opportunity stage = "Under Contract" |
| Deals closed | Opportunity stage = "Closed/Funded" |
| Assignment fees | Opportunity.value |
| Team assignments | Opportunity.assigned_to |

### 2. BatchDialer (Calling Platform)
| Data Point | BatchDialer Location |
|------------|---------------------|
| Calls made (by rep) | Agent activity report |
| Conversations (calls >1 min) | Call logs with duration |
| Connect rate | Calculated: conversations / calls |
| Talk time | Total duration by rep |
| Call dispositions | Call results/outcomes |
| Callback scheduled | Disposition = "Callback" |

**Integration Method:** 
- Primary: BatchDialer API (if available)
- Fallback: Zapier webhook → GHL custom fields
- Manual: Daily CSV export (last resort)

### 3. BatchLeads (SMS Platform)
| Data Point | BatchLeads Location |
|------------|---------------------|
| SMS sent (by rep) | Campaign activity |
| SMS responses | Inbound messages |
| Response rate | Calculated: responses / sent |
| Opt-outs | Opt-out count |
| Leads from SMS | Contacts marked as responded |

**Integration Method:**
- Primary: BatchLeads API (if available)
- Fallback: Zapier webhook → GHL custom fields
- Manual: Daily CSV export (last resort)

---

## NAH Spreadsheet Structure

**Spreadsheet:** "2026 KPIs - Getleadsfaster"

### Tabs to Populate:

**Scoreboard**
- P&L summary (auto-calculated from Deals)
- KPIs by source
- Goals vs Actuals
- ROI by channel

**LM Spotlight** (Lead Managers: Chris, Daniel)
| Column | Source |
|--------|--------|
| Date | Auto |
| Rep Name | GHL User |
| Calls | BatchDialer |
| Convos | BatchDialer (calls >60s) |
| Apts Set | GHL Calendar |
| Goal % | Calculated |

**AM Spotlight** (Acquisition Manager: Kyle)
| Column | Source |
|--------|--------|
| Date | Auto |
| Rep Name | GHL User |
| Walkthroughs | GHL Calendar (type=walkthrough) |
| Offers Made | GHL Opportunities |
| Contracts | GHL Opportunities (UC stage) |

**Campaign INPUT Tabs**
| Tab | Data Source |
|-----|-------------|
| CC (Cold Call) | BatchDialer - calls tagged "cold call" |
| SMS | BatchLeads - campaign results |
| Forms | GHL - web form submissions |
| PPL | GHL - leads with PPL source |
| JV | GHL - leads with JV source |
| PPC | GHL - leads with PPC source |
| Cards | GHL - leads with direct mail source |
| Referrals | GHL - leads with referral source |

**Deals**
| Column | Source |
|--------|--------|
| Address | GHL Opportunity |
| Source | GHL Contact.lead_source |
| Contract Date | GHL Opportunity |
| Close Date | GHL Opportunity |
| Contract Price | GHL Opportunity.value |
| Assignment Fee | GHL Opportunity.custom_field |
| Buyer | GHL Opportunity.custom_field |
| LM | GHL Opportunity.assigned_to (history) |
| AM | GHL Opportunity.assigned_to (current) |
| Status | GHL Opportunity.stage |

---

## Integration Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ BatchDialer │     │ BatchLeads  │     │    GHL      │
│  (calls)    │     │   (SMS)     │     │   (CRM)     │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       │ API/Zapier        │ API/Zapier        │ API
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │  KPI Entry Bot  │
                  │   (Aggregator)  │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ Google Sheets   │
                  │ "2026 KPIs"     │
                  └─────────────────┘
```

---

## Schedule

| Update | Frequency | Time |
|--------|-----------|------|
| LM Activity (calls, convos) | Daily | 7:00 AM |
| AM Activity (walkthroughs) | Daily | 7:00 AM |
| Lead counts by source | Daily | 7:00 AM |
| Pipeline snapshot | Daily | 7:00 AM |
| Deal updates | Real-time | On stage change |
| Weekly rollup | Monday | 6:00 AM |
| Monthly close | 1st of month | 12:00 AM |

---

## Data Mapping: BatchDialer → Spreadsheet

### Call Metrics
```
BatchDialer API Response:
{
  "agent": "Chris Segura",
  "date": "2026-02-08",
  "calls_made": 52,
  "calls_connected": 8,
  "avg_duration": 145,
  "total_talk_time": 1160
}

Maps to LM Spotlight:
| Date | Rep | Calls | Convos | ...
| 2026-02-08 | Chris | 52 | 8 | ...
```

### Conversation Definition
- BatchDialer: Call duration > 60 seconds AND status = "Connected"
- This matches NAH's definition of a "conversation"

---

## Data Mapping: BatchLeads → Spreadsheet

### SMS Metrics
```
BatchLeads API Response:
{
  "campaign": "February Cold Outreach",
  "date": "2026-02-08",
  "sent": 500,
  "delivered": 485,
  "responses": 23,
  "opt_outs": 5
}

Maps to Campaign INPUT SMS:
| Date | Sent | Delivered | Responses | Opt-Outs | Response Rate |
| 2026-02-08 | 500 | 485 | 23 | 5 | 4.7% |
```

---

## Data Mapping: GHL → Spreadsheet

### Lead Counts by Source
```
GHL Query:
contacts WHERE created_date = today GROUP BY lead_source

Results:
- Cold Call: 8
- SMS: 12
- Web Form: 3
- PPL: 5

Maps to Campaign INPUT tabs (daily row in each)
```

### Pipeline Snapshot
```
GHL Query:
opportunities GROUP BY stage

Results:
- New: 45
- Working: 120
- Hot: 23
- Appointment Set: 12
- Made Offer: 8
- Under Contract: 5
- Closed: 1 (today)

Maps to Scoreboard pipeline section
```

### Deal Entry
```
Trigger: Opportunity.stage changed to "Under Contract"

Pull:
- Address: opportunity.property_address
- Contact: opportunity.contact_id → contact.lead_source
- Value: opportunity.value
- Assigned: opportunity.assigned_to

Create new row in Deals tab
```

---

## Team Configuration

### Lead Managers (LMs)
| Name | GHL User ID | BatchDialer Agent |
|------|-------------|-------------------|
| Chris Segura | [ghl_id] | chris@newagainhouses.com |
| Daniel Lozano | [ghl_id] | daniel@newagainhouses.com |

### Acquisition Managers (AMs)
| Name | GHL User ID |
|------|-------------|
| Kyle Barks | [ghl_id] |

---

## Credentials Needed

### BatchDialer
- API Key (if available)
- Or: Zapier account connected
- Account: [need from Corey]

### BatchLeads
- API Key (if available)
- Or: Zapier account connected
- Account: [need from Corey]

### Google Sheets
- Service account with edit access to "2026 KPIs - Getleadsfaster"
- Spreadsheet ID: 1erZTFb87xbxZEct7mZqFCW7Nb-47_t_LNtK-TfkYYas

### GHL
- Already connected via Gunner

---

## Reconciliation

### Daily Check (7:30 AM)
Compare totals:
- BatchDialer calls vs spreadsheet calls
- BatchLeads sent vs spreadsheet sent
- GHL leads vs spreadsheet leads

### If Mismatch:
1. Log discrepancy details
2. Alert Corey/Jessica
3. Show: Expected vs Actual vs Difference
4. Suggest which records are missing

---

## Error Handling

| Scenario | Action |
|----------|--------|
| BatchDialer API down | Use cached data, flag in report |
| BatchLeads API down | Use cached data, flag in report |
| GHL API error | Retry 3x, then alert |
| Spreadsheet API down | Queue writes, retry hourly |
| Data mismatch | Log, alert, don't overwrite |
| Missing team member data | Create row with zeros, flag |

---

## Questions for Corey

1. **BatchDialer access** — Can you share API credentials or connect via Zapier?
2. **BatchLeads access** — Same question
3. **Spreadsheet access** — Need service account added as editor
4. **Definition of "conversation"** — Calls >60 seconds, or different threshold?
5. **Historical data** — Start fresh from today, or backfill?

---

## Next Steps

1. Get BatchDialer + BatchLeads credentials
2. Test API access (or set up Zapier)
3. Map exact column positions in spreadsheet
4. Build and test with one day's data
5. Go live with daily automation
