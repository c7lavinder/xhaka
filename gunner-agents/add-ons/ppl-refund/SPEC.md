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

## Detection Logic — Fully Automated

### How It Works
```
PPL Lead Arrives in GHL (via webhook)
         ↓
    DAY 0: Immediate Checks
         ↓
    ┌─────────────────────────────────┐
    │ 1. Property Type Check          │
    │    Is it Single Family?         │
    │    NO → Auto-file dispute       │
    └─────────────────────────────────┘
         ↓
    ┌─────────────────────────────────┐
    │ 2. MLS Check                    │
    │    Is property listed on MLS?   │
    │    YES → Auto-file dispute      │
    └─────────────────────────────────┘
         ↓
    DAY 1-4: Monitor Contact Attempts
         ↓
    ┌─────────────────────────────────┐
    │ 3. No Response Check (Day 4)    │
    │    3+ calls AND 2+ SMS          │
    │    AND no response?             │
    │    YES → Auto-file dispute      │
    └─────────────────────────────────┘
```

### Detection Triggers

**Immediate (Day 0) — Auto-file:**
| Check | Condition | Dispute Reason | Evidence |
|-------|-----------|----------------|----------|
| Property Type | NOT single family (mobile home, vacant land, commercial) | Wrong Lead Type | Property data from lead |
| MLS Status | Property is actively listed on MLS | MLS Listed | Zillow/Redfin/MLS link |

**Delayed (Day 4) — Auto-file:**
| Check | Condition | Dispute Reason | Evidence |
|-------|-----------|----------------|----------|
| No Response | 3+ call attempts AND 2+ SMS sent AND 0 responses after 4 days | Invalid Contact Info / No Response | Call log + SMS log from GHL |

### Data Sources for Checks

**Property Type Check:**
- Lead data from PPL (often includes property type)
- Property enrichment API (Zillow, county records)
- GHL custom field if populated

**MLS Check:**
- Query Zillow API for address
- Query Redfin for active listings
- MLS Monitor integration (if available)

**No Response Check:**
- GHL Call Logs (via Gunner from BatchDialer)
- GHL SMS Conversations (via Gunner from BatchLeads)
- Track: attempts made, responses received, days elapsed

---

## Filing System

### Method: Browser Automation (Form Submission)
Bot logs into each PPL provider portal and fills out their dispute forms directly.

---

### Leadzolo Form Automation

**Login URL:** `https://portal.leadzolo.com/app/login`
**Form URL:** `https://www.leadzolo.com/lead-return-policy1657028939148`

**Login Flow:**
```
1. Navigate to portal.leadzolo.com/app/login
2. Enter email in "Email address" field
3. Enter password in "Password" field
4. Check "I agree to the following" checkbox
5. Click "Sign in"
6. Verify redirect to dashboard (portal.leadzolo.com/app/[id])
```

**Dispute Form Fields:**
| Field | Selector/Label | Value Source | Required |
|-------|----------------|--------------|----------|
| Reason | "Select The Reason For The Return" dropdown | Detection logic | ✅ |
| Lead Email | "Lead Email" text input | GHL contact email | ✅ |
| Lead Address | "Lead Address" text input | GHL contact address | ✅ |
| Additional Info | "Additional Information" textarea | Evidence compiler | ❌ |
| Client Name | "Client Name" text input | Tenant company name | ✅ |
| Client Email | "Client Email (Your Leadzolo Portal Login Email)" | Tenant login email | ✅ |
| Supporting Proof | File upload | Screenshots/docs | ❌ |

**Reason Dropdown Options:**
- Wrong Lead Type
- Wholesaler Lead
- Duplicate Lead
- Not The Property Owner
- Invalid Contact Information
- Other

**Submit Flow:**
```
1. Navigate to return policy page
2. Click "Start Return" button (scrolls to form)
3. Select reason from dropdown
4. Fill Lead Email
5. Fill Lead Address
6. Fill Additional Information with evidence
7. Fill Client Name
8. Fill Client Email
9. (Optional) Upload supporting proof
10. Click "Submit"
11. Capture confirmation
```

---

### MotivatedSellers Form Automation

**Login URL:** `https://motivatedsellers.com/leads/signin`
**Portal URL:** `https://motivatedsellers.com/leads/app/leads`

**⚠️ Challenge: reCAPTCHA on login**
Options:
1. Use CAPTCHA solving service (2captcha, Anti-Captcha)
2. Maintain persistent session (reduce login frequency)
3. Manual login trigger (tenant clicks "Connect" once)

**Login Flow:**
```
1. Navigate to motivatedsellers.com/leads/signin
2. Enter email
3. Enter password
4. Complete reCAPTCHA (service or manual)
5. Click "Sign In"
6. Verify redirect to dashboard
```

**Dispute Flow:**
```
1. Navigate to My Leads page
2. Locate lead by name/address/date
3. Click lead to open detail view OR
4. Navigate to Settings → Disputes → Open Dispute
5. Select lead from list
6. Choose reason from dropdown
7. Enter description with evidence
8. Submit
9. Capture confirmation
```

**Reason Options:**
- MLS Listed
- Mobile Home
- Vacant Land
- Wholesaler
- Duplicate
- Wrong Number

---

### PropertyLeads Form Automation

**Login URL:** `https://www.propertyleads.com/login` (verify)
**Portal URL:** `https://www.propertyleads.com/get-leads/`

**Login Flow:**
```
1. Navigate to login page
2. Enter email
3. Enter password
4. Click Sign In
5. Verify redirect to dashboard
```

**Request Refund Page:** `My Leads → Request Refund`

**Form Structure (inline per lead):**
| Column | Purpose |
|--------|---------|
| Lead ID | Identifier |
| Lead Type, Date & Time | Reference |
| Lead Details | Name, Phone, Email |
| Reason | Dropdown selector |
| Description | Text input (required) |
| Action | Submit button |

**Dispute Flow:**
```
1. Navigate to My Leads → Request Refund
2. Find lead in table (by Lead ID or search)
3. Select reason from dropdown for that row
4. Enter description in text field for that row
5. Click Action button for that row
6. Capture confirmation
7. Check status at My Leads → Refund Status
```

**Reason Dropdown Options:** (to be verified in portal)
- Wrong Number
- Disconnected
- Duplicate
- Listed on MLS
- Not Property Owner
- Other

---

### Session Management

**Strategy:** Maintain persistent sessions per tenant per platform
- Store session cookies securely
- Refresh sessions before expiration
- Re-authenticate only when session invalid
- Queue disputes if auth fails, alert tenant

**Session Storage:**
```json
{
  "tenantId": "abc123",
  "sessions": {
    "leadzolo": {
      "cookies": "[encrypted]",
      "lastAuth": "2026-02-09T12:00:00Z",
      "expiresAt": "2026-02-16T12:00:00Z",
      "status": "active"
    },
    "motivatedsellers": {
      "cookies": "[encrypted]",
      "lastAuth": "2026-02-09T12:00:00Z",
      "expiresAt": "2026-02-10T12:00:00Z",
      "status": "active"
    },
    "propertyleads": {
      "cookies": "[encrypted]",
      "lastAuth": "2026-02-09T12:00:00Z",
      "expiresAt": "2026-02-16T12:00:00Z",
      "status": "active"
    }
  }
}
```

---

### Fallback: Manual Queue
If automation fails (CAPTCHA, UI change, auth failure):
1. Tenant sees lead in "Manual Filing Required" queue
2. Pre-compiled evidence shown
3. Direct link to provider's dispute page
4. Tenant can file manually with one click

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
