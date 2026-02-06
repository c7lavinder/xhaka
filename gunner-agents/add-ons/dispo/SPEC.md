# Dispo Assist Add-on

**Product Name:** Dispo Assist
**Price:** $49/mo
**Status:** 🔨 Designing

## Purpose

Help the Dispo Manager (Esteban) match deals to buyers faster. When a property goes under contract, agents automatically match it to the buyer list, draft outreach, track responses, and prep assignment paperwork.

---

## Agents

| Agent | Role | Responsibility |
|-------|------|----------------|
| **Dispo Coordinator** | Lead | Receives new contracts, orchestrates buyer matching and outreach |
| **Buyer Matcher** | Worker | Cross-references property criteria against buyer list, ranks matches |
| **Outreach Drafter** | Worker | Writes personalized buyer blast emails/texts based on property details |
| **Follow-Up Tracker** | Worker | Monitors buyer responses, flags hot interest, tracks who passed |
| **Assignment Prepper** | Worker | Prepares assignment paperwork, calculates fees, drafts docs |
| **Buyer Onboarder** | Worker | Auto-populates buyer info, sends intake forms, collects missing data |
| **Dispo Reviewer** | Reviewer | Reviews buyer matches for accuracy, catches mismatches |

---

## Workflow

```
Trigger: Deal moves to "Under Contract" in Sales Pipeline
        ↓
[1] Dispo Coordinator receives notification
        ↓
[2] Coordinator pulls deal details from GHL opportunity
        ↓
[3] Coordinator → Buyer Matcher: "Find matching buyers"
        ↓
[4] Buyer Matcher queries Buyer Pipeline, filters by:
    - Market (does buyer buy in this area?)
    - Buybox (price range, property type)
    - Verified Funding
    - Response Speed
    - Tier (Qualified, JV Partner)
        ↓
[5] Matcher returns ranked list of top 10-20 buyers
        ↓
[6] Coordinator → Outreach Drafter: "Draft blast"
        ↓
[7] Drafter creates personalized messages for each buyer
        ↓
[8] Esteban reviews matches + drafts, approves/edits
        ↓
[9] Blasts sent (or Esteban sends manually)
        ↓
[10] Follow-Up Tracker monitors responses
        ↓
[11] When buyer commits → Assignment Prepper generates docs
        ↓
[12] Dispo Reviewer sanity-checks before close
```

---

## ⚠️ RULES TO VERIFY - Corey please confirm

### Buyer Matching Criteria

Buyers are in GHL Buyer Pipeline. Matching based on:

| Field | Match Logic | Priority |
|-------|-------------|----------|
| **Market(s)** | Buyer's markets include property's area | REQUIRED |
| **Property Type** | Buyer wants this property type (SFH, land, multi, etc.) | REQUIRED |
| **Buybox** | Property fits buyer's price range | High |
| **Buyer Tier** | Prioritize: Qualified > JV Partner > Not Ready | Medium |
| **Verified Funding** | Prioritize verified buyers | Medium |
| **Response Speed** | Prioritize Lightning > Same Day > Slow | Medium |
| **Has Purchased Before** | Bonus points for repeat buyers | Low |

**Key filters:** Market + Property Type must match. Everything else is ranking.

✅ VERIFIED by Corey 2026-02-05

---

### Buyer Info Fields (from GHL)

These are the fields you just had Esteban start filling out:

| Field | Used For |
|-------|----------|
| Buyer Tier | Filter/rank |
| Verified Funding | Filter/rank |
| Has Purchased Before | Bonus ranking |
| Response Speed | Ranking |
| Last Contact Date | Avoid stale buyers |
| Buyer Notes | Context for personalization |
| Market(s) | Geographic match |
| Buybox | Criteria match |

---

### Buyer Auto-Onboarding (NEW)

When a new buyer enters the system (or existing buyer has missing info):

**Step 1: Auto-Populate**
Pull from existing data:
- Name, phone, email (from GHL contact)
- Company name (from BatchLeads/skip trace if available)
- Purchase history (from GHL deals)

**Step 2: Identify Gaps**
Check required fields:
- Markets ❓
- Buybox (price range, property types) ❓
- Verified Funding ❓
- Response Speed ❓

**Step 3: Send Intake Form**
Auto-text/email to buyer:
```
Hey [Name], want to make sure we send you 
the right deals. Quick questions:

1. What markets/areas do you buy in?
2. Price range? (e.g., $50k-$150k)
3. Property types? (SFH, multi, land, etc.)
4. Do you have proof of funds ready?

Reply here or fill out: [form link]
```

**Step 4: Track & Follow-Up**
- Response received → Parse and populate fields
- No response 48h → Follow-up text
- No response 72h → Flag for Esteban manual outreach

**Benefit:** Buyers get matched to right deals. Esteban doesn't chase for basic info.

✅ ADDED per Corey suggestion 2026-02-05

**Any fields missing for matching?**

---

### Outreach Message Style

**Two channels, two styles:**

**TEXT BLAST (Brief)**
```
New deal in [area]: 3/2, 1,450 sqft, ARV $280k
Asking $145k, assignment $10k
Interested? Reply or call [number]
```

**EMAIL BLAST (Detailed + Marketing Packet)**
```
Hey [Buyer Name],

Got a new one that fits your buybox:

📍 123 Main St, Nashville TN 37203
🏠 3 bed / 2 bath, 1,450 sqft
📅 Built 1985, needs moderate rehab
💰 Contract price: $145,000
📈 ARV: $280,000 (comps attached)
🔧 Est. repairs: $45,000
💵 Assignment fee: $10,000

Closing target: Feb 28

[MARKETING PACKET ATTACHED]

Interested? Reply ASAP - sending to 
other buyers today.

- Esteban
NAH Dispo
```

**Marketing Packet includes:**
- Property photos (Google Earth + any provided)
- Comp analysis
- Repair estimate
- Deal summary sheet

✅ VERIFIED by Corey 2026-02-05

---

### Response Tracking

When buyers respond, what matters?

| Response | Action |
|----------|--------|
| "Interested" / "Send more info" | Flag as HOT, Esteban follows up |
| "What's the address?" | Send details, track |
| "Pass" / "Not for me" | Log reason, remove from this deal |
| "Under contract with buyer" | Move to negotiation |
| No response in 24h | **Auto follow-up** |

**Auto Follow-Up Sequence:**
- 24h no response → Follow-up text: "Still available, interested?"
- 48h no response → Final follow-up: "Last chance before we move on"
- 72h no response → Mark as "No Response" for this deal

✅ VERIFIED by Corey 2026-02-05

---

### Assignment Paperwork

**Platform:** DocHub
**Template:** Exists ✓

**Required info to send agreement:**
- Buyer Name
- Company Name
- Buyer Email

**Process:**
1. Buyer confirms they want the deal
2. Assignment Prepper pulls buyer info from GHL
3. Populates DocHub template
4. Sends for signature via DocHub

**Trigger for assignment:** TBD — need to determine what stage/action triggers this. Options:
- Esteban manually triggers when buyer verbally commits
- Stage change in Dispo Pipeline (e.g., "UC with Buyer")
- Buyer responds with specific keyword

✅ VERIFIED by Corey 2026-02-05

---

### Trigger Point

**Dispo Pipeline → "Clear to Send Out" stage**

When deal enters this stage:
1. Dispo Assist activates
2. Creates marketing packet
3. Matches buyers
4. Drafts text + email blasts
5. Esteban reviews and sends

✅ VERIFIED by Corey 2026-02-05

---

## Output: Buyer Match Report

What Esteban receives:

```
🏠 NEW DEAL FOR DISPO: 123 Main St, Nashville

DEAL SUMMARY
- Contract price: $145,000
- ARV: $280,000
- Assignment target: $10,000
- Closing: Feb 28

TOP MATCHED BUYERS (10)

1. 🥇 Brian Thompson — Lightning — Verified — Bought 3x
   Markets: Nashville, Antioch | Buybox: SFH <$200k
   Notes: "Loves fixer-uppers, closes fast"
   → Draft: "Hey Brian, got another fixer in Nashville..."

2. 🥈 Mike Chen — Same Day — Verified — Bought 1x
   Markets: Nashville | Buybox: SFH $100-250k
   Notes: "New investor, eager, needs hand-holding"
   → Draft: "Hi Mike, have a deal that fits your criteria..."

3. 🥉 Sarah Williams — Same Day — Verified — New
   Markets: Nashville, Franklin | Buybox: Any <$300k
   Notes: "JV partner, splits fees"
   → Draft: "Sarah, got one for us to look at together..."

[... 7 more buyers ...]

ACTIONS
[ ] Review matches
[ ] Edit/approve drafts
[ ] Send blasts
[ ] Track responses

Generated by Dispo Assist | 2026-02-05 7:30 PM
```

---

## Tenant Configuration

### Onboarding Wizard Flow

When a new Gunner customer enables Dispo:

**Step 1: Connect GHL**
```
"Select your dispo/disposition pipeline:"
→ Dropdown of customer's GHL pipelines
→ NAH default: "Dispo"
```

**Step 2: Map Pipeline Stages**
```
"Which stage means 'ready to send to buyers'?"
→ NAH: "Clear to Send Out"

"Which stage means 'under contract with buyer'?"
→ NAH: "UC with Buyer"

"Which stage means 'deal closed'?"
→ NAH: "Deal Closed"
```

**Step 3: Map Buyer Fields**
```
"Where do you store buyer's target markets?"
→ NAH: Custom field "Market(s)"

"Where do you store buyer's purchase criteria?"
→ NAH: Custom field "Buybox"

"Where do you store buyer tier/qualification?"
→ NAH: Custom field "Buyer Tier"

"Where do you store verified funding status?"
→ NAH: Custom field "Verified Funding"

"Where do you store response speed rating?"
→ NAH: Custom field "Response Speed"
```

**Step 4: Map Deal Fields**
```
"Where is the property address stored?"
→ NAH: Contact field "Address" or Opportunity custom field

"Where is contract price stored?"
→ NAH: Opportunity field "Monetary Value" or custom field

"Where is ARV stored?"
→ NAH: Custom field "ARV"

"Where is assignment fee stored?"
→ NAH: Custom field "Assignment Fee"
```

**Step 5: Outreach Preferences**
```
"Default outreach style:"
→ Brief text + Detailed email (recommended)

"Enable auto follow-up?"
→ Yes (24h, 48h, 72h sequence)
```

### Configuration Schema

```json
{
  "tenantId": "tenant_xxx",
  "addOn": "dispo",
  "config": {
    "ghlMappings": {
      "dispoPipeline": "pipeline_id_xxx",
      "stages": {
        "clearToSend": "stage_id_1",
        "ucWithBuyer": "stage_id_2",
        "dealClosed": "stage_id_3"
      },
      "buyerFields": {
        "markets": "custom_field_markets",
        "buybox": "custom_field_buybox",
        "tier": "custom_field_buyer_tier",
        "verifiedFunding": "custom_field_verified_funding",
        "responseSpeed": "custom_field_response_speed",
        "propertyType": "custom_field_property_type"
      },
      "dealFields": {
        "address": "contact_address",
        "contractPrice": "opportunity_monetary_value",
        "arv": "custom_field_arv",
        "assignmentFee": "custom_field_assignment_fee",
        "closingDate": "custom_field_closing_date"
      }
    },
    "matching": {
      "requiredFields": ["markets", "propertyType"],
      "rankingFields": ["tier", "verifiedFunding", "responseSpeed"],
      "excludeGhosts": true,
      "maxBuyersToMatch": 20
    },
    "outreach": {
      "textStyle": "brief",
      "emailStyle": "detailed",
      "includeMarketingPacket": true,
      "autoFollowUp": {
        "enabled": true,
        "intervals": [24, 48, 72]
      }
    },
    "assignment": {
      "platform": "docHub",
      "templateId": "template_xxx",
      "triggerStage": "ucWithBuyer"
    }
  }
}
```

### NAH Default Values (Template)

| Setting | NAH Value |
|---------|-----------|
| Dispo Pipeline | "Dispo" |
| Clear to Send Stage | "Clear to Send Out" |
| UC with Buyer Stage | "UC with Buyer" |
| Markets Field | "Market(s)" |
| Buybox Field | "Buybox" |
| Buyer Tier Field | "Buyer Tier" |
| Verified Funding Field | "Verified Funding" |
| Response Speed Field | "Response Speed" |
| Property Type Field | (needs to be created) |

**Note:** New customers can use NAH's field structure as a template, or map their existing fields.

---

## Next Steps

1. ~~**Corey confirms rules above**~~ ✅ DONE
2. Write agent system prompts
3. Build workflow logic
4. Test with real deals
5. Integrate with GHL pipelines
6. ~~Create Manus PRD for Dispo Dashboard UI~~ ✅ DONE — See `MANUS-PRD.md`

---

## Related Documents

- **Frontend PRD:** `MANUS-PRD.md` — Control Room UI spec for Manus
- **Backend Spec:** This file — Agent automation logic
