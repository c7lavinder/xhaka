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

```json
{
  "tenantId": "tenant_xxx",
  "addOn": "dispo",
  "config": {
    "triggerStage": "under_contract",
    "matchCriteria": {
      "prioritizeVerified": true,
      "prioritizeRepeat": true,
      "excludeGhosts": true,
      "maxBuyersToMatch": 20
    },
    "outreachStyle": "detailed",
    "autoFollowUp": false,
    "assignmentTemplate": "standard_v1"
  }
}
```

---

## Next Steps

1. **Corey confirms rules above** ✋ WAITING
2. Write agent system prompts
3. Build workflow logic
4. Test with real deals
5. Integrate with GHL pipelines
