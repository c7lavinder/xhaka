# Data Hygiene Bot

## Overview
Automatically maintains CRM data quality: finds duplicates, flags missing fields, merges records, validates data, and keeps the database clean.

## Trigger
- Scheduled daily/weekly scans
- On new contact creation
- Manual trigger for specific cleanup

---

## Agents

### 1. Hygiene Coordinator
**Role:** Orchestrates data cleanup activities

**Scheduled Tasks:**
| Task | Frequency | Time |
|------|-----------|------|
| Duplicate scan | Daily | 2 AM |
| Missing field audit | Weekly | Sunday 3 AM |
| Data validation | Daily | 2:30 AM |
| Stale record review | Weekly | Sunday 4 AM |

### 2. Duplicate Detector
**Role:** Finds and manages duplicate records

**Matching Criteria:**
| Field | Match Type | Weight |
|-------|-----------|--------|
| Phone (normalized) | Exact | 50 |
| Email | Exact | 40 |
| Address (normalized) | Fuzzy (90%) | 35 |
| Full Name | Fuzzy (85%) | 25 |
| Property Address | Fuzzy (90%) | 45 |

**Confidence Scoring:**
- 100+ points = Definite duplicate
- 70-99 points = Likely duplicate (review)
- <70 points = Possible (manual check)

**Duplicate Resolution:**

**Auto-Merge (Definite duplicates):**
- Keep record with most data
- Merge notes, activities, tasks
- Combine tags
- Keep earliest creation date
- Log merge action

**Review Queue (Likely duplicates):**
```
POTENTIAL DUPLICATE FOUND

Record A: John Smith
- Phone: 615-555-1234
- Email: john@email.com
- Created: Jan 15, 2026
- Notes: 3

Record B: John A. Smith  
- Phone: 615-555-1234
- Email: (none)
- Created: Feb 1, 2026
- Notes: 1

Confidence: 85%

[Merge] [Keep Both] [Review Later]
```

### 3. Field Validator
**Role:** Ensures data completeness and validity

**Required Fields by Stage:**

**New Lead:**
- First name ✓
- Phone (valid format) ✓
- Property address ✓
- Lead source ✓

**Working Lead:**
- All above +
- Last contact date ✓
- Assigned to ✓

**Hot Lead:**
- All above +
- Motivation notes ✓
- Timeline ✓
- Price discussed ✓

**Under Contract:**
- All above +
- Contract price ✓
- Closing date ✓
- Seller email ✓

**Missing Field Actions:**
- Flag record with "Missing: [field]" tag
- Create task if critical field missing
- Include in daily report

### 4. Format Standardizer
**Role:** Normalizes data formats

**Phone Formatting:**
- Input: `(615) 555-1234` or `615.555.1234` or `6155551234`
- Output: `615-555-1234`
- Flag invalid formats

**Address Formatting:**
- Standardize abbreviations (St/Street, Ave/Avenue)
- Proper capitalization
- Add zip+4 if available
- Validate against USPS database (optional)

**Name Formatting:**
- Proper capitalization
- Remove extra spaces
- Flag obvious errors ("Test", "Asdf")

**Email Validation:**
- Check format
- Check for typos (.con, @gmial)
- Flag invalid/fake emails

### 5. Stale Record Handler
**Role:** Identifies and routes stale/stuck records

**Stale Criteria:**

| Stage | Stale After | Action |
|-------|-------------|--------|
| New Lead | 7 days no contact | Alert LM |
| Working Lead | 14 days no contact | Review for follow-up |
| Made Offer | 30 days no response | Review for close-out |
| Under Contract | Past closing date | Alert immediately |
| Follow-up buckets | Per bucket rules | (Follow-up bot handles) |

**Stale Record Report:**
```
STALE RECORDS FOUND: {{count}}

New Leads (7+ days untouched): 5
├── John Smith - 615-555-1234 (12 days)
├── Jane Doe - 615-555-5678 (9 days)
└── ... 3 more

Working Leads (14+ days): 3
├── ...

Recommended Actions:
- 5 leads need first contact
- 3 leads need follow-up decision
- 2 offers need close-out
```

### 6. Tag Cleaner
**Role:** Maintains tag consistency

**Tag Issues:**
- Duplicate tags (same meaning, different spelling)
- Orphan tags (no contacts using them)
- Invalid tag combinations
- Case inconsistencies

**Auto-Corrections:**
| Found | Replace With |
|-------|--------------|
| "hot lead" | "Hot Lead" |
| "HOT" | "Hot Lead" |
| "Follow Up" + "Follow-Up" | "Follow Up" |

**Monthly Tag Report:**
- Unused tags (suggest deletion)
- Similar tags (suggest merge)
- Tag usage stats

### 7. Compliance Checker
**Role:** Ensures regulatory compliance

**DNC Compliance:**
- Check against DNC list
- Flag for manual review
- Never auto-delete (legal record)

**Data Retention:**
- Flag records older than retention period
- Suggest archival
- Never auto-delete without approval

**TCPA Compliance:**
- Ensure opt-in recorded
- Track consent timestamps
- Flag missing consent records

---

## Reporting

### Daily Hygiene Report
Sent to: Admin/Manager
Time: 7 AM

```
📊 DATA HYGIENE REPORT - {{date}}

DUPLICATES
- Found: 12
- Auto-merged: 8
- Pending review: 4

MISSING DATA
- Critical fields missing: 15 records
- Phone invalid: 3
- Email invalid: 7

STALE RECORDS
- New leads untouched: 5
- Stuck in pipeline: 8

DATA QUALITY SCORE: 94%

[View Details] [Run Full Scan]
```

### Weekly Deep Dive
- Trend analysis
- Quality score over time
- Top issues by category
- Recommended cleanup actions

---

## Integration Points

### Inputs
- GHL Contacts (all records)
- GHL Opportunities (deal data)
- External validation APIs (USPS, etc.)

### Outputs
- GHL record updates (formatting, merges)
- GHL tags (missing field flags)
- GHL tasks (follow-up on issues)
- Reports (daily/weekly)
- Admin notifications

---

## Tenant Configuration

```json
{
  "dataHygieneBot": {
    "enabled": true,
    "schedule": {
      "duplicateScan": "daily",
      "fieldAudit": "weekly",
      "staleScan": "daily"
    },
    "duplicates": {
      "autoMergeThreshold": 100,
      "reviewThreshold": 70
    },
    "staleThresholds": {
      "newLead": 7,
      "workingLead": 14,
      "madeOffer": 30
    },
    "requiredFields": {
      "newLead": ["first_name", "phone", "property_address", "lead_source"],
      "hotLead": ["motivation", "timeline", "price_discussed"],
      "underContract": ["contract_price", "closing_date", "seller_email"]
    },
    "reporting": {
      "dailyReport": true,
      "weeklyReport": true,
      "sendTo": ["admin@company.com"]
    }
  }
}
```

---

## Error Handling

| Scenario | Action |
|----------|--------|
| Merge conflict | Flag for manual review |
| API validation down | Skip validation, retry later |
| Mass duplicate found (>100) | Alert admin before auto-action |
| Protected record | Never modify, flag only |

---

## Success Metrics

- Data quality score (target: >95%)
- Duplicate rate (target: <2%)
- Missing field rate by stage
- Stale record rate (target: <5%)
- Time to resolve flagged issues
