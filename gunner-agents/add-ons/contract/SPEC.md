# Contract Bot

## Overview
Automates contract generation, sending, tracking, and chasing. Handles purchase agreements (PSA) from agreed deal through executed contract.

## Trigger
- AM Assistant signals "Agreed" outcome
- Or: Manual trigger from AM/manager

---

## Agents

### 1. Contract Coordinator
**Role:** Orchestrates contract lifecycle

**Lifecycle:**
```
Deal Agreed (trigger)
    ↓
Gather contract data
    ↓
Generate contract from template
    ↓
Send for signature (DocuSign/DocHub)
    ↓
Monitor signature status
    ↓
Chase if unsigned (24h, 48h, 72h)
    ↓
Executed? 
    ↓
Yes → Notify team, update stage, trigger dispo
No (after 7 days) → Escalate to AM
```

### 2. Data Collector
**Role:** Ensures all contract data is complete

**Required Fields:**
- Seller name(s) - exactly as on deed
- Seller email (for DocuSign)
- Seller phone
- Property address (full, formatted)
- Legal description (if available)
- Contract price
- Earnest money deposit (EMD)
- Closing date
- Buyer name (NAH entity)
- Any special terms/contingencies

**Data Sources:**
- AM Assistant output
- GHL contact record
- GHL opportunity record
- County records (for legal description)

**Missing Data Protocol:**
If required field missing → Ask AM via SMS:
```
Contract almost ready for {{address}}.

Missing: Seller email for DocuSign

Reply with seller's email, or SKIP to send via text link.
```

### 3. Contract Generator
**Role:** Creates contract document from template

**Template System:**
- Base PSA template (standard)
- Addendum templates (as needed)
- Auto-fill from collected data

**Populated Fields:**
```
PURCHASE AND SALE AGREEMENT

Date: {{current_date}}

SELLER: {{seller_names}}
BUYER: {{buyer_entity}} and/or assigns

PROPERTY: {{property_address}}
Legal Description: {{legal_description}}

PURCHASE PRICE: ${{contract_price}}
EARNEST MONEY: ${{emd_amount}}

CLOSING DATE: {{closing_date}}
CLOSING LOCATION: {{title_company}}

SPECIAL TERMS:
{{special_terms}}
```

**Output:** PDF contract ready for signature

### 4. Signature Manager
**Role:** Sends contract and manages signature collection

**Platforms Supported:**
- DocuSign (primary)
- DocHub
- PandaDoc
- HelloSign

**Sending Flow:**
1. Upload generated contract to platform
2. Add signature fields:
   - Seller signature(s)
   - Seller date(s)
   - Seller initials (each page)
3. Send to seller email
4. If no email: Send text link (DocuSign SMS)
5. Log "Contract sent" with tracking ID

**Confirmation to Seller:**
```
Hi {{first_name}}, your purchase agreement for {{property_address}} has been sent!

📄 Check your email ({{seller_email}}) for the DocuSign link.

Questions? Call us at {{company_phone}}.
```

### 5. Signature Tracker
**Role:** Monitors contract status

**Statuses:**
- Sent (waiting for view)
- Viewed (seller opened)
- Partially signed (multi-signer)
- Completed (fully executed)
- Declined
- Expired

**Status Updates:**
Poll DocuSign API every hour OR use webhooks

**Notifications:**
| Event | Notify |
|-------|--------|
| Viewed | AM (good sign!) |
| Signed | AM + Corey + Dispo |
| Declined | AM (immediate) |
| No activity 24h | Chase sequence starts |

### 6. Chase Agent
**Role:** Follows up on unsigned contracts

**Chase Sequence:**

**24 Hours - Soft Reminder:**
```
Hi {{first_name}}, just checking if you had a chance to review the contract for {{address}}?

The DocuSign link is in your email. Let me know if you need it resent!
```

**48 Hours - Direct Ask:**
```
Hi {{first_name}}, following up on the contract for {{address}}.

Any questions I can answer? We're excited to move forward with you!

Reply or call: {{company_phone}}
```

**72 Hours - Urgency:**
```
{{first_name}}, wanted to make sure everything's okay.

The contract for {{address}} is waiting for your signature. Is there anything holding you back?

I'm here to help - just reply or call me.
```

**5 Days - AM Call Task:**
Create task: "Call {{seller}} - contract unsigned 5 days"

**7 Days - Escalation:**
Alert manager: "Contract stale - {{address}} unsigned 7 days"

### 7. Completion Handler
**Role:** Processes executed contracts

**On Signature Complete:**
1. Download executed PDF
2. Store in:
   - GHL contact documents
   - Dropbox/Google Drive (if configured)
   - Deal folder
3. Update GHL:
   - Opportunity stage → "Under Contract"
   - Add "Contract Signed" tag
   - Update opportunity value
   - Note: "Contract executed {{date}}"
4. Notify team:
   - AM: "✅ Contract signed! {{address}}"
   - Corey: "🎉 New UC: {{address}} @ ${{price}}"
   - Dispo: "New deal for dispo: {{address}}"
5. Trigger Dispo pipeline entry
6. Create title company task

---

## Contract Types

### Purchase Agreement (PSA)
Standard seller contract
- Used for: Direct acquisitions
- Template: NAH standard PSA

### Assignment Agreement
Assigning deal to end buyer
- Used for: Wholesaling to buyer
- Handled by: Assignment Bot (in Dispo flow)

### Addendums
Optional add-ons:
- Financing contingency
- Inspection contingency  
- Extended closing
- Personal property inclusion
- Seller leaseback

---

## Multi-Signer Support

**Scenario:** Multiple owners on deed

**Flow:**
1. Identify all required signers
2. Add signature fields for each
3. Send to all simultaneously (or sequentially)
4. Track individual signature status
5. Complete only when ALL signed

**Notification:**
```
Contract update for {{address}}:

✅ John Smith - Signed
⏳ Mary Smith - Awaiting signature

Mary's reminder sent. Will update you when fully executed!
```

---

## Integration Points

### Inputs
- AM Assistant (trigger + deal data)
- GHL contact/opportunity (seller info)
- County records API (legal description)

### Outputs
- DocuSign/DocHub (contract sending)
- GHL opportunity (stage, documents)
- GHL tasks (follow-ups)
- Team notifications
- Dispo pipeline trigger
- File storage (Drive/Dropbox)

---

## Tenant Configuration

```json
{
  "contractBot": {
    "enabled": true,
    "signaturePlatform": "docusign",
    "docusignAccountId": "[ACCOUNT_ID]",
    "templates": {
      "psa": "[TEMPLATE_ID]",
      "addendums": {
        "financing": "[TEMPLATE_ID]",
        "inspection": "[TEMPLATE_ID]"
      }
    },
    "buyerEntity": "New Again Houses Nashville LLC",
    "defaultTitleCompany": "First American Title",
    "chaseSequence": {
      "reminder24h": true,
      "reminder48h": true,
      "reminder72h": true,
      "amTaskDay5": true,
      "escalateDay7": true
    },
    "storage": {
      "ghl": true,
      "googleDrive": true,
      "driveFolderId": "[FOLDER_ID]"
    },
    "notifications": {
      "onSent": ["am"],
      "onViewed": ["am"],
      "onSigned": ["am", "owner", "dispo"],
      "onDeclined": ["am", "owner"]
    }
  }
}
```

---

## Error Handling

| Scenario | Action |
|----------|--------|
| Missing seller email | Request from AM, offer SMS link alternative |
| DocuSign API error | Retry 3x, then alert admin |
| Template not found | Alert admin, pause contract |
| Seller declines | Immediate AM notification, create follow-up task |
| Invalid email bounce | Alert AM, request correct email |

---

## Success Metrics

- Time from agreement to contract sent (target: <2h)
- Signature rate (target: >85%)
- Average time to signature (target: <48h)
- Chase effectiveness (% signed after chase)
- Decline rate (target: <5%)
