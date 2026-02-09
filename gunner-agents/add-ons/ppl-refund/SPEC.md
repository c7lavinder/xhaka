# PPL Refund Bot

## Overview
Automates Pay-Per-Lead refund requests. Identifies refund-eligible leads, documents reasons, and files disputes with providers. Recovers money that would otherwise be lost.

## Design Principle: Zero-Config Ready
- Pre-built refund criteria (industry standard)
- Auto-detects PPL leads from source
- Documents issues automatically
- One-click dispute filing (or full auto)

---

## Platform Details (Verified Feb 2026)

### 1. Leadzolo
**URL:** leadzolo.com  
**Return Policy:** https://www.leadzolo.com/lead-return-policy1657028939148  
**Login:** corey@newagainhouses.com  

| Attribute | Value |
|-----------|-------|
| Dispute Window | **7 calendar days** |
| Processing Time | Up to 5 business days |
| Refund Type | Account credit (not cash) |
| Contact | support@leadzolo.com |

**Valid Dispute Reasons:**
| Reason | Description | Evidence Required |
|--------|-------------|-------------------|
| Wrong Lead Type | Property type or zipcode doesn't match bid scope | Bid settings vs lead data |
| Wholesaler Lead | Property under contract, not actual owner | Any proof (call notes, public records) |
| Duplicate Lead | Same lead received multiple times | Lead IDs |
| Not Property Owner | Submitter doesn't own/can't sell property | Tax records, call recording |
| Invalid Contact Info | Disconnected, wrong person, bounced email, fake/nonsense data | Call log, email bounce |
| Other | Anything else | **Must have supporting docs** (call recordings, screenshots, tax records) |

**Filing Method:** Form at return policy URL ("Start" button)

---

### 2. MotivatedSellers
**URL:** motivatedsellers.com  
**Portal:** motivatedsellers.com/leads/app/leads  
**Login:** corey@newagainhouses.com  

| Attribute | Value |
|-----------|-------|
| Dispute Window | **10 calendar days** |
| Processing | Manual review (may contact seller) |
| Lead Cost | $150/lead |
| Refund Type | Account credit |

**Navigation:**
```
Dashboard → My Leads → [view leads]
Settings → Disputes → Open Dispute
```

**Filing Method:** "Open Dispute" button in account settings, links to lead return policy

---

### 3. PropertyLeads
**URL:** propertyleads.com  
**Portal:** propertyleads.com/get-leads/  
**Login:** corey@newagainhouses.com  

| Attribute | Value |
|-----------|-------|
| Dispute Window | TBD (verify in policy) |
| Account Stat | Tracks "Declined Refund %" (currently 4.89%) |
| Lead Type | Motivated Seller US |
| Budget | Resets monthly |

**Navigation:**
```
My Leads → My Leads → Motivated Seller US (view leads)
My Leads → Request Refund (file disputes)
My Leads → Refund Status (check outcomes)
```

**Filing Method:** Inline on Request Refund page
1. Select lead from list
2. Choose reason from dropdown
3. Enter description (required)
4. Click Action button to submit

**Key Insight:** PropertyLeads tracks your declined refund rate — file strategically to maintain good standing.

---

## Automation Logic

### Trigger Sources
Bot monitors GHL for PPL-sourced leads via:
1. **Lead Source field** contains "PPL", "PropertyLeads", "MotivatedSellers", "Leadzolo"
2. **Custom tag** applied at lead creation
3. **Cost field** matches PPL price ($150 for MotivatedSellers, varies by provider)

### Detection Stages

**Stage 1: Immediate Detection (Day 0-1)**
| Issue | Detection | Auto-File? |
|-------|-----------|------------|
| Disconnected number | First call fails + carrier message | ✅ Yes |
| Wrong number | Reaches different person | ✅ Yes |
| Invalid email | Bounce notification | ✅ Yes |
| Fake/nonsense data | Name = celebrity, profanity, gibberish | ✅ Yes |
| Duplicate lead | Same phone/address in last 90 days | ✅ Yes |
| Wrong property type | Listed as commercial, mobile home | ✅ Yes |
| Wrong market | Address outside bid area | ✅ Yes |

**Stage 2: No Response Detection (Day 5-7)**
| Issue | Detection | Auto-File? |
|-------|-----------|------------|
| No answer after 5+ attempts | Call log: 5 calls, 0 connects | ⚠️ Queue for review |
| No SMS response | 2+ texts sent, 0 received | ⚠️ Queue for review |
| Voicemail only | 3+ VMs left, no callback | ⚠️ Queue for review |

**Stage 3: Qualification Detection (Day 1-10)**
| Issue | Detection | Auto-File? |
|-------|-----------|------------|
| Listed on MLS | MLS Monitor alert | ✅ Yes |
| Not the owner | LM notes from call | ⚠️ Queue for review |
| Wholesaler | Discovered during call | ⚠️ Queue for review |
| Not motivated | "Just curious", no urgency | ⚠️ Queue for review |
| Already sold | Property records updated | ✅ Yes |

### Evidence Collection

Bot auto-compiles evidence package:

```
═══════════════════════════════════════════════════════
PPL REFUND REQUEST
═══════════════════════════════════════════════════════

LEAD INFO
─────────────────────────────────────────────────────
Provider:     PropertyLeads
Lead ID:      #45879325
Name:         Deanna Jonker
Phone:        (423) 969-1021
Email:        countrygurl613@gmail.com
Property:     123 Main St, Cleveland TN 37323
Received:     Feb 08, 2026
Deadline:     Feb 15, 2026 (7 days remaining)

ISSUE: Invalid Phone Number - Disconnected
─────────────────────────────────────────────────────

EVIDENCE
─────────────────────────────────────────────────────
• Call #1: Feb 08, 9:15 AM
  Result: "Number disconnected" carrier message
  
• Call #2: Feb 08, 2:30 PM  
  Result: Same disconnected message
  
• SMS #1: Feb 08, 2:35 PM
  Result: Delivery failed

• Skip trace attempted: Feb 08, 3:00 PM
  Result: No alternate number found

CONCLUSION
─────────────────────────────────────────────────────
Phone number is confirmed disconnected. No alternate
contact method available. Lead is unworkable.

REQUEST: Full refund per provider terms (invalid contact)
═══════════════════════════════════════════════════════
```

### Deadline Tracking

| Provider | Window | Alert at |
|----------|--------|----------|
| Leadzolo | 7 days | Day 5 |
| MotivatedSellers | 10 days | Day 7 |
| PropertyLeads | TBD | Day 5 (conservative) |

Bot sends daily alert for leads approaching deadline with unresolved issues.

---

## Filing Workflow

### Option A: Auto-File (Slam Dunks)
For clear-cut cases (disconnected, duplicate, wrong market):
1. Bot detects issue
2. Bot compiles evidence
3. Bot files dispute automatically
4. Bot logs confirmation
5. Human gets notification: "Filed refund for Lead #X - Disconnected number"

### Option B: Approval Queue (Judgment Calls)
For cases needing human review (no response, not motivated):
1. Bot detects issue
2. Bot compiles evidence
3. Bot adds to approval queue
4. Human reviews: Approve / Reject / Edit
5. If approved → Bot files
6. Bot tracks status

### Filing by Platform

**Leadzolo:**
```
1. Navigate to: leadzolo.com/lead-return-policy...
2. Click "Start" button
3. Enter Lead ID
4. Select reason from dropdown
5. Paste evidence in description
6. Attach supporting files if needed
7. Submit
8. Capture confirmation
```

**MotivatedSellers:**
```
1. Navigate to: motivatedsellers.com/leads/app/leads
2. Click Settings → Disputes
3. Click "Open Dispute"
4. Select lead
5. Choose reason
6. Enter description with evidence
7. Submit
8. Capture confirmation
```

**PropertyLeads:**
```
1. Navigate to: propertyleads.com → My Leads → Request Refund
2. Find lead in list
3. Select reason from dropdown
4. Enter description (required) with evidence
5. Click Action button
6. Capture confirmation
7. Check status at: My Leads → Refund Status
```

---

## Status Tracking

| Status | Meaning | Next Action |
|--------|---------|-------------|
| Detected | Issue identified | Review / Auto-file |
| Queued | Awaiting human approval | Review queue |
| Filed | Dispute submitted | Wait for response |
| Under Review | Provider processing | Monitor |
| Approved | Refund granted | Verify credit |
| Denied | Refund rejected | Review for appeal |
| Credited | Money returned | Close case |
| Expired | Missed deadline | Log for reporting |

### Follow-Up Automation
- Day 7 no response → Send follow-up inquiry
- Day 14 no response → Escalate (email support)
- Denied → Flag for human review (appeal?)

---

## Reporting

### Daily Alert (if any deadlines)
```
⚠️ PPL REFUND DEADLINES

EXPIRING TODAY:
• Lead #45879325 (PropertyLeads) - Deanna Jonker
  Issue: No response | Status: Not filed
  → File now or lose eligibility

EXPIRING IN 2 DAYS:
• Lead #991ac3cb (MotivatedSellers) - Ryan Gambill
  Issue: Disconnected | Status: Queued
  → Approve to file
```

### Weekly Summary
```
📊 PPL REFUND REPORT - Week of Feb 3-9, 2026

ACTIVITY
────────────────────────────
New issues detected:    8
Disputes filed:         6
Disputes approved:      4
Disputes denied:        0
Disputes pending:       2

MONEY RECOVERED
────────────────────────────
This week:        $600
Month to date:    $1,200
Year to date:     $3,450

BY PROVIDER
────────────────────────────
PropertyLeads:    $300 (3 leads)
MotivatedSellers: $300 (2 leads)
Leadzolo:         $0   (0 leads)

BY REASON
────────────────────────────
Disconnected:     3
No response:      2
Wrong market:     1

APPROVAL RATE: 100% (4/4)
```

---

## NAH-Specific Configuration

```json
{
  "pplRefundBot": {
    "enabled": true,
    "providers": {
      "leadzolo": {
        "enabled": true,
        "url": "leadzolo.com",
        "login": "corey@newagainhouses.com",
        "disputeWindow": 7,
        "alertDays": 5
      },
      "motivatedsellers": {
        "enabled": true,
        "url": "motivatedsellers.com",
        "login": "corey@newagainhouses.com",
        "disputeWindow": 10,
        "alertDays": 7,
        "leadCost": 150
      },
      "propertyleads": {
        "enabled": true,
        "url": "propertyleads.com",
        "login": "corey@newagainhouses.com",
        "disputeWindow": 7,
        "alertDays": 5
      }
    },
    "automation": {
      "autoFileImmediate": ["disconnected", "duplicate", "wrong_market", "invalid_data"],
      "queueForReview": ["no_response", "not_owner", "wholesaler", "not_motivated"],
      "requireApproval": true
    },
    "detection": {
      "noResponseDays": 5,
      "noResponseAttempts": 5,
      "duplicateWindowDays": 90
    },
    "notifications": {
      "deadlineAlert": true,
      "filingConfirmation": true,
      "weeklyReport": true,
      "slackChannel": null,
      "emailTo": null
    }
  }
}
```

---

## Integration Points

### Inputs
| Source | Data |
|--------|------|
| GHL Contacts | Lead info, source, cost |
| GHL Call Logs | Attempts, outcomes, durations |
| GHL Conversations | SMS sent/received |
| GHL Notes | LM qualification notes |
| MLS Monitor Bot | Listing alerts |
| Skip Trace | Alternate contact attempts |

### Outputs
| Destination | Data |
|-------------|------|
| Provider Portals | Dispute filings |
| GHL Tags | Refund status per lead |
| GHL Notes | Evidence package, filing confirmation |
| Reports | Weekly/monthly summaries |
| Notifications | Deadline alerts, approvals |

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Refund identification rate | >90% of eligible leads |
| Filing accuracy (approval rate) | >80% |
| Money recovered / month | Track trend |
| Time from issue → filing | <24h for auto, <48h for queued |
| Missed deadlines | 0 |
| Provider standing | Maintain <10% decline rate |

---

## Security & Constraints

⚠️ **CRITICAL RESTRICTIONS:**
- **NEVER add or change bids** on any platform
- **ONLY file disputes** — no other portal actions
- All filings logged for audit
- Human approval required for judgment calls
- Credentials stored securely (not in spec)
