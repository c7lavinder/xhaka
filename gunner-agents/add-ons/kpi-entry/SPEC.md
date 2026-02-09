# KPI Auto-Entry Bot

## Overview
Automatically populates the KPI spreadsheet by pulling data from GHL, eliminating Jessica's manual data entry. Updates daily metrics, campaign performance, and deal tracking in real-time.

## Current State
- KPI Spreadsheet: "2026 KPIs - Getleadsfaster"
- Manual entry by: Jessica (Data Manager)
- Time spent: Estimated 30-60 min/day
- Risk: Human error, delayed updates, inconsistent timing

## Bot Solution
Automated data sync from GHL → Spreadsheet
- Real-time or scheduled updates
- Zero manual entry
- Consistent, accurate data

---

## Agents

### 1. KPI Coordinator
**Role:** Orchestrates all KPI data collection and entry

**Schedule:**
| Update | Frequency | Time |
|--------|-----------|------|
| Daily metrics | Daily | 7 AM |
| Campaign data | Daily | 7 AM |
| Deal updates | Real-time | On change |
| Weekly rollup | Monday | 6 AM |
| Monthly close | 1st of month | 12 AM |

### 2. Lead Metrics Collector
**Role:** Gathers lead generation metrics

**Metrics Pulled from GHL:**

**By Campaign/Source:**
- Leads generated (new contacts by source)
- Outreach volume (calls, SMS, emails sent)
- Response rate
- Cost per lead (if spend tracked)

**Campaign Sources to Track:**
- Cold Calls (CC)
- SMS
- Webforms
- PPL (Pay Per Lead)
- JV Deals
- PPC
- Cards (direct mail)
- Referrals

**Data Mapping:**
```
GHL → Spreadsheet

Contact.lead_source = "Cold Call" → Campaign INPUT CC tab
Contact.created_date = today → Add to daily count
Contact.tags contains "Hot" → Count as hot lead
```

### 3. Activity Metrics Collector
**Role:** Gathers team activity metrics

**LM Metrics:**
- Calls made (outbound)
- Conversations (calls > 1 min)
- Appointments set
- Conversion rate (convos → apts)

**AM Metrics:**
- Walkthroughs completed
- Offers made
- Contracts signed
- Conversion rate (apts → contracts)

**Source:** GHL call logs, calendar, opportunity stages

**Mapping to LM Spotlight:**
```
Rep: Chris Segura
Date: 2026-02-08

Calls: [count from GHL call log where user=Chris]
Convos: [count where duration > 60s]
Apts Set: [count calendar events created by Chris]
```

### 4. Pipeline Metrics Collector
**Role:** Tracks pipeline movement

**Pipeline Snapshots:**
- New leads (daily intake)
- Working leads (in qualification)
- Hot leads
- Appointments scheduled
- Offers made
- Under contract
- Deals closed

**Stage Velocity:**
- Average days in each stage
- Conversion rate stage-to-stage
- Stuck deals (over threshold)

**Source:** GHL opportunities by pipeline and stage

### 5. Deal Tracker
**Role:** Logs individual deal details

**Fields Captured:**
- Property address
- Lead source
- Acquisition date
- Contract date
- Close date
- Contract price
- Assignment fee
- Buyer name
- Status (UC, For Sale, Assigned, Funded)
- Team assignments (LM, AM)

**Trigger:** 
- New opportunity enters "Under Contract"
- Status changes (For Sale, Assigned, Funded)

**Mapping to Deals Sheet:**
```
New row when: Opportunity.stage = "Under Contract"

Address: Opportunity.property_address
Source: Contact.lead_source
Contract Price: Opportunity.value
LM: Opportunity.lm_assigned
AM: Opportunity.am_assigned
Status: Opportunity.stage
```

### 6. Financial Metrics Collector
**Role:** Tracks revenue and costs

**Revenue Tracking:**
- Gross revenue (deal assignment fees)
- By market (Nashville, Memphis, etc.)
- By source (CC, SMS, PPL, etc.)
- YTD totals

**Cost Tracking (if in system):**
- Marketing spend by channel
- Cost per lead
- Cost per contract
- ROI by channel

**Source:** 
- GHL opportunities (revenue)
- Campaign spend (manual or integrated)

### 7. Spreadsheet Writer
**Role:** Actually writes data to Google Sheets

**Sheets API Integration:**
- Authenticate via service account
- Write to specific cells/ranges
- Append new rows (deals)
- Update existing data (metrics)

**Write Strategies:**

**Overwrite (daily metrics):**
- Find today's row
- Update all columns
- Create row if doesn't exist

**Append (new deals):**
- Add to bottom of Deals sheet
- Let formulas calculate

**Update (deal status changes):**
- Find existing row by address/ID
- Update status column

**Error Handling:**
- Retry on API failure
- Queue writes if sheets unavailable
- Alert on persistent failures

---

## Spreadsheet Structure Reference

### Scoreboard Tab
- P&L summary (auto-calculated from Deals)
- KPIs by source
- Goals vs Actuals
- ROI calculations

### AM Spotlight Tab
- Daily activity by AM
- Goals vs Actuals
- Color coding (red/yellow/green)

### LM Spotlight Tab
- Daily activity by LM
- Calls, convos, apts
- Goals vs Actuals

### Campaign INPUT Tabs
- CC, SMS, Forms, PPL, JV, PPC, Cards, Referrals
- Daily lead counts
- Spend (if tracked)

### Deals Tab
- Individual deal rows
- Full deal details
- Status tracking

---

## Data Validation

### Before Writing:
- Validate data types
- Check for null/empty
- Ensure within expected ranges
- Match against existing structure

### Validation Rules:
| Field | Rule |
|-------|------|
| Calls | Integer, >= 0 |
| Price | Number, > 0 |
| Date | Valid date format |
| Source | Match known sources |
| Stage | Match known stages |

### Anomaly Detection:
- Flag if daily leads > 2x normal
- Flag if calls = 0 on weekday
- Alert on negative revenue
- Alert on impossible values

---

## Reconciliation

### Daily Reconciliation:
Compare GHL totals vs spreadsheet totals
- Leads: GHL contact count vs spreadsheet sum
- Deals: GHL UC count vs spreadsheet UC count

### If Mismatch:
1. Log discrepancy
2. Alert admin
3. Identify missing/extra records
4. Suggest corrections

---

## Integration Points

### Inputs
- GHL Contacts (leads by source, date)
- GHL Opportunities (pipeline, deals)
- GHL Call Logs (activity metrics)
- GHL Calendar (appointments)
- GHL Users (team assignment)

### Outputs
- Google Sheets (KPI spreadsheet)
- Reconciliation reports
- Anomaly alerts

---

## Tenant Configuration

```json
{
  "kpiEntryBot": {
    "enabled": true,
    "spreadsheetId": "1erZTFb87xbxZEct7mZqFCW7Nb-47_t_LNtK-TfkYYas",
    "schedule": {
      "dailyUpdate": "07:00",
      "weeklyRollup": "Monday 06:00",
      "realTimeDealUpdates": true
    },
    "tabMapping": {
      "lmSpotlight": "LM Spotlight",
      "amSpotlight": "AM Spotlight",
      "deals": "Deals",
      "scoreboard": "Scoreboard"
    },
    "sourceMapping": {
      "Cold Call": "CC",
      "SMS Campaign": "SMS",
      "Web Form": "Forms",
      "Pay Per Lead": "PPL"
    },
    "teamMembers": {
      "lms": ["Chris Segura", "Daniel Lozano"],
      "ams": ["Kyle Barks"]
    },
    "alertOnAnomaly": true,
    "reconcileDaily": true
  }
}
```

---

## Error Handling

| Scenario | Action |
|----------|--------|
| Sheets API down | Queue writes, retry hourly |
| GHL API error | Log, skip cycle, alert if persists |
| Data mismatch | Log, alert, don't overwrite |
| Duplicate entry attempt | Skip, log |
| Sheet structure changed | Alert admin, pause writes |

---

## Success Metrics

- Time saved (target: 30+ min/day)
- Data accuracy (target: 99%)
- Update latency (target: <5 min for real-time)
- Reconciliation pass rate (target: 100%)
- Manual intervention rate (target: <1%)
