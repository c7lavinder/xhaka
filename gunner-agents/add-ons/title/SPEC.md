# Title Bot

## Overview
Tracks and coordinates the closing process from executed contract through funding. Monitors timelines, chases missing documents, coordinates with title company, and alerts on delays.

## Scope
- Tracks all deals under contract through closing
- Coordinates document collection from all parties
- Monitors title company progress
- Escalates delays before they become problems

---

## Agents

### 1. Title Coordinator
**Role:** Orchestrates closing process

**Closing Lifecycle:**
```
Contract Executed
    ↓
Send to title company
    ↓
Title search initiated
    ↓
Chase seller documents (ID, HOA docs, etc.)
    ↓
Track buyer funding (if assignment)
    ↓
Title clear → Schedule closing
    ↓
Final walkthrough (if applicable)
    ↓
Closing appointment
    ↓
Funding confirmed
    ↓
Deal closed! 🎉
```

### 2. Title Opener
**Role:** Initiates title process

**On Contract Execution:**
1. Prepare title order package:
   - Executed PSA
   - Seller info (names, contact)
   - Property address
   - Contract price
   - Closing date
   - EMD amount
   - Buyer entity info
   
2. Send to title company:
   - Email to title contact
   - Or: API integration (if supported)
   
3. Request:
   - Title commitment
   - Title search
   - Closing cost estimate

4. Log in deal record:
   - Title order date
   - Title company name
   - Title officer contact
   - Expected closing date

**Title Company Message:**
```
Subject: New Title Order - {{property_address}}

Hi {{title_contact}},

Please open title on the attached property.

Property: {{full_address}}
Seller: {{seller_names}}
Buyer: {{buyer_entity}}
Contract Price: ${{price}}
Target Closing: {{closing_date}}

Attached: Executed Purchase Agreement

Please provide title commitment and closing cost estimate.

Thank you!
```

### 3. Document Chaser
**Role:** Tracks and chases required documents

**Document Checklist:**

**From Seller:**
| Document | When Needed | Status |
|----------|-------------|--------|
| Valid government ID | Before closing | ⏳ |
| HOA docs (if applicable) | 10 days before | ⏳ |
| Payoff letter (if mortgage) | 7 days before | ⏳ |
| W-9 | Before closing | ⏳ |
| Signed deed (at closing) | Closing day | ⏳ |

**From Title:**
| Document | When Expected |
|----------|---------------|
| Title commitment | 5-7 days |
| Title search results | 5-7 days |
| Closing cost estimate | 3-5 days |
| Clear to close | When clear |

**From Buyer (if assignment):**
| Document | When Needed |
|----------|-------------|
| Proof of funds | Before closing |
| EMD | Per contract |
| Signed assignment | Before closing |

**Chase Sequence:**

**Day 5 (no title commitment):**
```
Subject: Title Status - {{address}}

Hi {{title_contact}},

Checking on title status for {{address}}.

Expected closing: {{closing_date}}

Any updates on the title commitment?

Thanks!
```

**Day 10 (seller docs needed):**
```
Hi {{seller_first_name}},

Getting everything ready for closing on {{address}}!

We'll need these from you before closing:
{{#each missing_docs}}
- {{this}}
{{/each}}

Questions? Just reply or call {{company_phone}}.
```

**Day 20 (escalation):**
Alert internal team if docs still missing

### 4. Title Issue Handler
**Role:** Manages title issues/clouds

**Common Issues:**
- Liens (tax, mechanic's, judgment)
- Unpaid HOA dues
- Boundary disputes
- Missing heir claims
- Errors in deed

**Issue Detection:**
Monitor title commitment for exceptions

**Issue Workflow:**
1. Title issue detected
2. Classify severity (minor/moderate/deal-killer)
3. Research resolution options
4. Alert appropriate party:
   - Minor: Track, usually handled by title
   - Moderate: Alert AM, may need seller action
   - Severe: Alert Corey, possible renegotiation

**Issue Notification:**
```
⚠️ TITLE ISSUE - {{address}}

Issue: {{issue_type}}
Severity: {{severity}}

Details: {{issue_details}}

Proposed Resolution: {{resolution}}

Action needed: {{action_required}}
```

### 5. Timeline Monitor
**Role:** Tracks closing timeline and deadlines

**Key Milestones:**
| Milestone | Target | Alert If Late |
|-----------|--------|---------------|
| Title order sent | Day 0 | — |
| Title commitment received | Day 7 | Day 10 |
| Seller docs collected | Day 14 | Day 20 |
| Clear to close | Day 21 | Day 25 |
| Closing scheduled | Day 25 | Day 28 |
| Closing | Per contract | 3 days before |

**Timeline Dashboard:**
Track each deal's progress:
```
{{address}}
Contract: $185,000 | Close: 30 days

[=====>............] 18/30 days

✅ Title ordered (Day 0)
✅ Commitment received (Day 5)
⏳ Seller docs (Day 12) - ID pending
⏳ Clear to close
⏳ Closing scheduled
⏳ Closed
```

**Alerts:**
- Yellow: Behind by 1-3 days
- Red: Behind by 4+ days
- Daily summary of all at-risk closings

### 6. Closing Scheduler
**Role:** Coordinates closing appointment

**When Clear to Close:**
1. Confirm all parties available:
   - Seller(s)
   - Buyer (if attending)
   - Notary/closing agent
   
2. Schedule closing:
   - Mobile notary to seller (preferred)
   - Or: At title office
   
3. Confirm with all parties
4. Send closing reminder (24h before)

**Closing Confirmation:**
```
Hi {{seller_first_name}},

Great news - we're ready to close on {{address}}!

📅 Closing: {{date}} at {{time}}
📍 Location: {{location}}

What to bring:
- Valid government-issued photo ID
- Any keys, garage remotes, etc.

You'll walk away with: ${{seller_proceeds}}

Questions? Call {{company_phone}}

See you there!
```

### 7. Funding Tracker
**Role:** Confirms funding and deal completion

**Post-Closing:**
1. Confirm wire sent (from title)
2. Confirm wire received (seller confirmation)
3. Request recorded deed
4. Update deal status to "Funded/Closed"
5. Trigger Post-Close Bot
6. Archive deal documents

**Funding Confirmation:**
```
🎉 DEAL CLOSED - {{address}}

Closed: {{date}}
Sale Price: ${{price}}
Net to Seller: ${{seller_proceeds}}
Our Assignment Fee: ${{fee}}

Wire confirmed: ✅

Congrats team!
```

---

## Integration Points

### Inputs
- Contract Bot (executed contract trigger)
- GHL opportunity (deal data)
- Title company (status updates)
- Email parsing (title commitments, issues)

### Outputs
- Title company (orders, requests)
- Seller communication (doc requests)
- GHL opportunity (status updates)
- GHL tasks (deadlines, follow-ups)
- Team notifications (issues, closings)
- Post-Close Bot trigger

---

## Tenant Configuration

```json
{
  "titleBot": {
    "enabled": true,
    "defaultTitleCompany": {
      "name": "First American Title",
      "contact": "Jane Doe",
      "email": "jane@firstam.com",
      "phone": "615-555-1234"
    },
    "timeline": {
      "titleCommitmentDays": 7,
      "clearToCloseDays": 21,
      "defaultClosingDays": 30
    },
    "alerts": {
      "yellowThreshold": 3,
      "redThreshold": 5,
      "dailySummary": true,
      "summaryTime": "09:00"
    },
    "requiredSellerDocs": [
      "Government ID",
      "W-9",
      "HOA docs (if applicable)",
      "Mortgage payoff (if applicable)"
    ],
    "closingPreference": "mobile_notary"
  }
}
```

---

## Error Handling

| Scenario | Action |
|----------|--------|
| Title company unresponsive | Escalate after 48h, consider alternate |
| Seller won't provide docs | AM call, explain necessity |
| Title issue discovered | Classify, route to appropriate handler |
| Closing date at risk | Alert team 5 days out |
| Wire delay | Escalate to title company immediately |
| Deal falls through | Close out properly, notify all parties |

---

## Success Metrics

- Average days to close (target: per contract)
- Title issue rate
- On-time closing rate (target: >90%)
- Document collection speed
- Closing reschedule rate (target: <10%)
