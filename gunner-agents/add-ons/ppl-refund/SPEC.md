# PPL Refund Bot — Gunner Add-on

## Overview
Automates Pay-Per-Lead refund requests for Gunner tenants. Identifies refund-eligible leads from GHL, documents reasons, and files disputes with PPL providers. Recovers money that would otherwise be lost.

**Add-on Type:** Multi-tenant SaaS feature  
**User Effort:** ~2 min setup (select platforms, enter credentials)  
**Value:** Automated money recovery from bad PPL leads

---

## Tenant Onboarding Flow

### Step 1: Enable Add-on
Tenant clicks "Enable" on PPL Refund Bot in Gunner add-ons marketplace.

### Step 2: Select Platforms (checkboxes)
```
Which PPL platforms do you use?

☑️ PropertyLeads (propertyleads.com)
☑️ MotivatedSellers (motivatedsellers.com)
☑️ Leadzolo (leadzolo.com)
☐ Other (specify)
```

### Step 3: Enter Credentials (per platform)
```
PropertyLeads
─────────────────────────
Email: [________________________]
Password: [________________________]
☑️ Save credentials (encrypted)

MotivatedSellers  
─────────────────────────
Email: [________________________]
Password: [________________________]
☑️ Save credentials (encrypted)

Leadzolo
─────────────────────────
Email: [________________________]
Password: [________________________]
☑️ Save credentials (encrypted)
```

### Step 4: Configure Preferences
```
Automation Level
─────────────────────────
○ Full Auto — File disputes automatically for clear-cut cases
● Semi-Auto — Queue all disputes for my approval before filing
○ Manual — Just detect and alert me, I'll file myself

Notifications
─────────────────────────
☑️ Alert me when disputes are filed
☑️ Alert me when disputes are approved/denied
☑️ Weekly summary report
```

### Step 5: Done
```
✅ PPL Refund Bot is now active!

We'll monitor your GHL leads and identify refund opportunities.
You'll see dispute-eligible leads in your Gunner dashboard.
```

---

## Platform Details

### PropertyLeads
| Attribute | Value |
|-----------|-------|
| Website | propertyleads.com |
| Dispute Window | 7 days (estimated) |
| Lead Cost | Varies by market |
| Filing Method | Portal form or email |
| Support Email | support@propertyleads.com |

**Valid Dispute Reasons:**
- Wrong number / disconnected
- Wrong person
- Duplicate lead
- Listed on MLS
- Not property owner
- Invalid/fake information

**Portal Navigation:**
```
My Leads → Request Refund → Select lead → Choose reason → Enter description → Submit
My Leads → Refund Status → Check outcomes
```

---

### MotivatedSellers
| Attribute | Value |
|-----------|-------|
| Website | motivatedsellers.com |
| Dispute Window | **10 days** |
| Lead Cost | $150/lead (standard) |
| Filing Method | Portal or email |
| Support Email | support@motivatedsellers.com |
| Returns Page | motivatedsellers.com/returns |

**Valid Dispute Reasons:**
- MLS Listed
- Mobile Home
- Vacant Land
- Wholesaler
- Duplicate
- Wrong Number

**Portal Navigation:**
```
Dashboard → My Leads → [view leads]
Settings → Disputes → Open Dispute → Select lead → Submit
```

---

### Leadzolo
| Attribute | Value |
|-----------|-------|
| Website | leadzolo.com |
| Portal | portal.leadzolo.com |
| Dispute Window | **7 days** |
| Processing Time | Up to 5 business days |
| Refund Type | Account credit |
| Support Email | support@leadzolo.com |
| Return Policy | leadzolo.com/lead-return-policy1657028939148 |

**Valid Dispute Reasons:**
| Reason | Description |
|--------|-------------|
| Wrong Lead Type | Property type or zipcode doesn't match bid scope |
| Wholesaler Lead | Property under contract, not actual owner |
| Duplicate Lead | Same lead received multiple times |
| Not Property Owner | Submitter doesn't own/can't sell property |
| Invalid Contact Info | Disconnected, wrong person, bounced email, fake data |
| Other | Requires supporting documentation |

**Return Form Fields:**
| Field | Type | Required |
|-------|------|----------|
| Reason for Return | Dropdown | ✅ |
| Lead Email | Text | ✅ |
| Lead Address | Text | ✅ |
| Additional Information | Textarea | ❌ |
| Client Name | Text | ✅ |
| Client Email (Portal Login) | Text | ✅ |
| Supporting Proof | File upload | ❌ |

---

## Detection Logic

### How It Works
1. **GHL Integration:** Bot monitors tenant's GHL contacts tagged as PPL leads
2. **Source Detection:** Identifies which platform lead came from (lead source field)
3. **Issue Detection:** Checks for refund-eligible conditions
4. **Evidence Collection:** Compiles call logs, notes, SMS history from GHL
5. **Filing:** Submits dispute via email (most reliable) or portal

### Detection Triggers

**Immediate (Day 0-1) — Auto-file eligible:**
| Issue | Detection Method | Evidence |
|-------|------------------|----------|
| Disconnected number | First call = carrier disconnect message | Call log |
| Wrong number | Reaches different person | Call notes |
| Invalid email | Bounce notification | Email bounce |
| Fake/nonsense data | Name = celebrity, profanity, gibberish | Lead data |
| Duplicate lead | Same phone/address in last 90 days | Lead IDs |
| Wrong property type | Commercial, mobile home, land | Property data |
| Wrong market | Address outside bid area | Lead address vs GHL location |

**Delayed (Day 5-7) — Queue for approval:**
| Issue | Detection Method | Evidence |
|-------|------------------|----------|
| No answer 5+ attempts | Call log: 5 calls, 0 connects | Call log |
| No SMS response | 2+ texts sent, 0 received | SMS log |
| Voicemail only | 3+ VMs, no callback | Call log |

**Qualification-based (Day 1-10) — Queue for approval:**
| Issue | Detection Method | Evidence |
|-------|------------------|----------|
| Listed on MLS | MLS Monitor alert | MLS screenshot |
| Not the owner | LM notes | Call notes |
| Wholesaler | Discovered during call | Call notes |
| Already sold | Property records | Public records |

---

## Filing System

### Primary Method: Email Submission
Most reliable for multi-tenant SaaS. Works across all platforms.

**Email Template:**
```
To: [platform support email]
Subject: Lead Dispute Request - [Lead ID] - [Company Name]

Hello,

We are requesting a refund for the following lead:

LEAD INFORMATION
────────────────────────────────────
Lead ID: [Lead ID if known]
Lead Name: [Name]
Phone: [Phone]
Email: [Lead Email]
Property Address: [Address]
Date Received: [Date]

REASON FOR DISPUTE
────────────────────────────────────
[Reason]: [Description]

EVIDENCE
────────────────────────────────────
[Auto-compiled evidence from GHL]

• Call attempt 1: [Date/Time] - [Outcome]
• Call attempt 2: [Date/Time] - [Outcome]
• SMS sent: [Date/Time] - [Response status]
[Additional evidence as applicable]

Per your return policy, this lead qualifies for a refund.

Please confirm receipt and process this dispute.

Thank you,
[Company Name]
[Portal Email]
[Phone]
```

### Secondary Method: Portal Form (where available)
For platforms with stable portal forms, bot can fill and submit directly.

### Fallback: Manual Queue
If automation fails, tenant sees lead in "Manual Filing Required" queue with pre-compiled evidence.

---

## Tenant Dashboard

### Disputes Overview
```
┌─────────────────────────────────────────────────────────────────┐
│ PPL Refund Bot                                    [Settings] ⚙️ │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  💰 MONEY RECOVERED                                             │
│  ─────────────────────────────────────────────────────────────  │
│  This Month: $600        YTD: $3,450                           │
│                                                                 │
│  📊 DISPUTE STATS                                               │
│  ─────────────────────────────────────────────────────────────  │
│  Pending: 3    Filed: 12    Approved: 10    Denied: 2          │
│  Approval Rate: 83%                                            │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ NEEDS ATTENTION (2)                              [Review All]   │
├─────────────────────────────────────────────────────────────────┤
│ ⚠️  Ryan Gambill — MotivatedSellers — No response 5 days       │
│     Deadline: 3 days remaining                    [Review]      │
│                                                                 │
│ ⚠️  Deanna Jonker — PropertyLeads — Disconnected number        │
│     Deadline: 5 days remaining                    [Review]      │
├─────────────────────────────────────────────────────────────────┤
│ RECENTLY FILED (3)                                              │
├─────────────────────────────────────────────────────────────────┤
│ ✅  Kenneth Stansberry — Leadzolo — Wrong market — Approved    │
│ ⏳  Larry Shaw — MotivatedSellers — Duplicate — Pending        │
│ ❌  Michelle Mays — PropertyLeads — Not motivated — Denied     │
└─────────────────────────────────────────────────────────────────┘
```

### Dispute Detail View
```
┌─────────────────────────────────────────────────────────────────┐
│ DISPUTE: Ryan Gambill                                          │
├─────────────────────────────────────────────────────────────────┤
│ Platform: MotivatedSellers                                     │
│ Lead Received: Feb 9, 2026                                     │
│ Dispute Deadline: Feb 19, 2026 (3 days remaining)              │
│ Status: ⏳ Awaiting Approval                                    │
├─────────────────────────────────────────────────────────────────┤
│ LEAD INFO                                                       │
│ Name: Ryan Gambill                                              │
│ Phone: (423) 920-2252                                           │
│ Email: ryangambill7@gmail.com                                   │
│ Address: 1255 Eagle Park Rd NE, Cleveland, TN 37323            │
│ Cost: $150                                                      │
├─────────────────────────────────────────────────────────────────┤
│ ISSUE DETECTED                                                  │
│ Type: No Response After 5 Days                                  │
│ Confidence: High                                                │
├─────────────────────────────────────────────────────────────────┤
│ EVIDENCE (auto-compiled from GHL)                               │
│ • Call #1: Feb 9, 9:15 AM — No answer, left VM                 │
│ • Call #2: Feb 9, 2:30 PM — No answer                          │
│ • SMS #1: Feb 9, 2:35 PM — Delivered, no response              │
│ • Call #3: Feb 10, 10:00 AM — No answer, left VM               │
│ • Call #4: Feb 11, 11:00 AM — No answer                        │
│ • Call #5: Feb 12, 9:00 AM — No answer                         │
│ • SMS #2: Feb 12, 9:05 AM — Delivered, no response             │
│                                                                 │
│ Total: 5 calls, 2 SMS over 5 days — 0 responses                │
├─────────────────────────────────────────────────────────────────┤
│                      [Approve & File]  [Reject]  [Edit]         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Deadline Management

| Platform | Window | Alert Tenant At |
|----------|--------|-----------------|
| Leadzolo | 7 days | Day 5 |
| MotivatedSellers | 10 days | Day 7 |
| PropertyLeads | 7 days (est.) | Day 5 |

**Daily Deadline Alert:**
```
⚠️ PPL REFUND DEADLINES

EXPIRING TODAY:
• Lead #45879325 (PropertyLeads) - Deanna Jonker
  Issue: Disconnected | Status: Not filed
  → [File Now] or lose eligibility

EXPIRING IN 2 DAYS:
• Lead #991ac3cb (MotivatedSellers) - Ryan Gambill  
  Issue: No response | Status: Queued
  → [Approve to File]
```

---

## Reporting

### Weekly Summary (emailed to tenant)
```
📊 PPL REFUND REPORT — Week of Feb 3-9, 2026

ACTIVITY
────────────────────────────────────
New issues detected:    8
Disputes filed:         6
Disputes approved:      4
Disputes denied:        0
Disputes pending:       2

MONEY RECOVERED
────────────────────────────────────
This week:        $600
Month to date:    $1,200
Year to date:     $3,450

BY PLATFORM
────────────────────────────────────
PropertyLeads:    $300 (3 leads)
MotivatedSellers: $300 (2 leads)
Leadzolo:         $0   (0 leads)

BY REASON
────────────────────────────────────
Disconnected:     3
No response:      2
Wrong market:     1

APPROVAL RATE: 100% (4/4)

[View Full Report in Gunner →]
```

---

## Technical Architecture

### Data Flow
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   GHL       │────▶│   Gunner    │────▶│  PPL Email  │
│  (tenant)   │     │  PPL Bot    │     │  Providers  │
└─────────────┘     └─────────────┘     └─────────────┘
      │                    │                    │
      │                    ▼                    │
      │            ┌─────────────┐              │
      └───────────▶│  Evidence   │◀─────────────┘
                   │  Compiler   │   (status updates)
                   └─────────────┘
```

### Tenant Configuration Schema
```json
{
  "pplRefundBot": {
    "enabled": true,
    "tenantId": "abc123",
    "platforms": {
      "propertyleads": {
        "enabled": true,
        "email": "user@company.com",
        "password": "[encrypted]",
        "disputeWindow": 7
      },
      "motivatedsellers": {
        "enabled": true,
        "email": "user@company.com", 
        "password": "[encrypted]",
        "disputeWindow": 10
      },
      "leadzolo": {
        "enabled": true,
        "email": "user@company.com",
        "password": "[encrypted]",
        "disputeWindow": 7
      }
    },
    "automation": {
      "level": "semi-auto",
      "autoFileReasons": ["disconnected", "duplicate", "wrong_market"],
      "queueReasons": ["no_response", "not_owner", "wholesaler"]
    },
    "detection": {
      "noResponseDays": 5,
      "noResponseAttempts": 5,
      "duplicateWindowDays": 90
    },
    "notifications": {
      "onFiled": true,
      "onResolved": true,
      "weeklyReport": true,
      "deadlineAlerts": true
    }
  }
}
```

### GHL Integration Points
| GHL Object | Data Used |
|------------|-----------|
| Contacts | Lead info, source, phone, email, address |
| Contact Notes | LM notes about lead issues |
| Call Logs | Attempts, outcomes, durations |
| Conversations | SMS sent/received |
| Tags | PPL source, dispute status |
| Custom Fields | Lead cost, lead ID, platform |

---

## Security

### Credential Storage
- All PPL platform credentials encrypted at rest (AES-256)
- Credentials never logged or exposed in UI after initial entry
- Tenant can update/delete credentials anytime

### Access Control
- Each tenant only sees their own disputes
- Admin cannot see tenant credentials (only masked)
- Audit log of all dispute filings

### Constraints
⚠️ **Bot NEVER:**
- Adds or changes bids on any platform
- Modifies lead data in PPL portals
- Takes actions beyond dispute filing

---

## Success Metrics (per tenant)

| Metric | Target |
|--------|--------|
| Refund identification rate | >90% of eligible |
| Approval rate | >80% |
| Missed deadlines | 0 |
| Time to file (from detection) | <24h auto, <48h queued |

### Gunner-wide Metrics
| Metric | Tracking |
|--------|----------|
| Total $ recovered (all tenants) | Monthly |
| Avg recovery per tenant | Monthly |
| Most common dispute reasons | Weekly |
| Platform approval rates | Weekly |
