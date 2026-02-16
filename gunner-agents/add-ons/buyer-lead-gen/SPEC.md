# Buyer Lead Gen Bot — SPEC

**Agent #5 — Gunner Add-On**
**Last Updated:** Feb 15, 2026

---

## Purpose

**Automate dispo buyer outreach** — the most time-consuming part of dispositions. From deal packaging to multi-platform distribution to buyer response tracking, the bot handles the grind so the Dispo Manager focuses on negotiation and closing.

**Core problem:** Dispo teams manually package deals, copy-paste listings across platforms, answer the same buyer questions repeatedly, and track outreach in their heads. The Buyer Lead Gen Bot automates deal packaging, enforces a weekly marketing schedule, auto-responds to buyer FAQs, supports buyer hunts, distributes across platforms, and tracks every buyer interaction back to GHL.

**Design principle:** *"Maximum exposure in first 48 hours. If it's a good deal, it will sell."* — Corey

---

## Design Principles

### 1. Auto-Discovery (Zero Config Install)
On install, the bot must work on **any GHL account** without manual setup:
- Scan all pipelines and identify dispo/buyer-facing stages
- Detect existing buyer lists and contact tags
- Map opportunity custom fields (ARV, Ask, Repair, etc.)
- Identify configured distribution channels
- Present findings to admin: "I found these dispo stages and buyer lists — is this right?"

### 2. Config Layer, Not Code Changes
All settings managed via admin panel:
- Distribution channels (enable/disable per platform)
- Weekly schedule cadence (default: Mon-Fri model)
- FAQ field mappings (which GHL fields answer which questions)
- Express Lane approval flow
- 48-hour escalation thresholds
- Team role assignments

### 3. GHL-Native Data Only (Core)
Core functionality runs on standard GHL data:
- **Opportunities** — deal details, stage, custom fields, photos
- **Contacts** — buyer database, tags, source attribution
- **Conversations** — buyer messages, auto-responses
- **Tasks** — team notifications, action items
- **Notes** — deal history, outreach logs

No dependency on external platforms for core deal management.

### 4. Optional Integrations (Distribution Layer)
Enhanced distribution when connected:
- InvestorLift → marketplace posting, buyer analytics
- Mevlo → deal distribution, comp-enriched listings
- Facebook → group posting (semi-automated)
- InvestorBase → buyer hunt research (manual UI, no API — bot assists around it)

---

## Architecture

### Data Model

```
Deal {
  opportunityId: string
  propertyAddress: string
  askPrice: number
  arv: number
  repairEstimate: number
  margin: number                 // ARV - Ask - Repairs
  beds: number
  baths: number
  sqft: number
  occupancy: "vacant" | "occupied" | "tenant"
  accessInstructions: string
  offerDeadline: datetime | null
  photos: string[]               // GHL file URLs
  comps: Comp[]
  offerTerms: string
  contactInfo: string            // who buyers reach out to
  packageStatus: "incomplete" | "packaged" | "ready_to_market" | "marketed"
  pdfUrl: string | null
  emailTemplateId: string | null
  marketingStartedAt: datetime | null
  scheduleMode: "standard" | "express"
  createdAt: datetime
}

BuyerInteraction {
  buyerId: string                // GHL contact ID
  buyerName: string
  dealId: string                 // opportunity ID
  source: string                 // "investorlift" | "mevlo" | "facebook" | "email_blast" | "buyer_hunt" | "inbound"
  firstContactAt: datetime
  lastContactAt: datetime
  status: "new" | "engaged" | "qualified" | "offer_made" | "under_contract" | "dead"
  qualitySignals: QualitySignal[]
  autoResponses: AutoResponse[]
  notes: string[]
}

QualitySignal {
  type: "has_funding" | "fast_response" | "repeat_buyer" | "asked_for_access" | "made_offer" | "tire_kicker"
  detectedAt: datetime
  confidence: number
}

BuyerHuntOutreach {
  targetName: string
  targetPhone: string | null
  targetEmail: string | null
  sourceProperty: string         // the flip/rental they were found through
  sourcePlatform: string         // "zillow" | "mls" | "redfin" | "facebook"
  scriptUsed: string
  contactedAt: datetime | null
  response: string | null
  ghlContactId: string | null    // created in GHL after contact
}

AutoResponse {
  questionType: string           // "arv" | "occupied" | "repairs" | "access" | "deadline" | etc.
  question: string               // original buyer message
  answer: string                 // bot-generated response
  answeredAt: datetime
  fieldSource: string            // which GHL field provided the answer
  escalated: boolean             // true if bot couldn't answer → routed to human
}
```

### 48-Hour Clock Rules

| Time Elapsed | Status | Action |
|-------------|--------|--------|
| 0h | Marketing started | Deal pushed to first channel per schedule |
| 12h | Check #1 | Log views/responses per platform |
| 24h | Check #2 | If zero buyer interest → alert Dispo Mgnr |
| 36h | Check #3 | If still zero → alert Dispo Admin |
| 48h | Escalation | If no offers → create task for Owner review ("Price adjustment needed?") |

All thresholds configurable per account.

---

## Core Features

### 1. Deal Packaging Auto-Generator

When a GHL opportunity has all required fields populated (photos + numbers + property details):

**Trigger detection:**
- Bot monitors opportunities for field completeness
- Required fields: address, ask price, ARV, repair estimate, photos (≥3), beds, baths, sqft
- Optional but enriching: comps, occupancy, access instructions, offer terms

**Auto-generates:**

| Deliverable | Contents | Format |
|------------|----------|--------|
| **Deal PDF** | Photos, Ask/ARV/Margin, property details, comps, offer terms, contact info | PDF (matches InvestorLift/Mevlo listing format) |
| **Email Template** | Subject line with address + key numbers, body with deal highlights, PDF attached | GHL email template |

**Workflow:**
```
Opportunity fields populated
    ↓
Bot detects completeness → packageStatus = "packaged"
    ↓
Auto-generate PDF from template
    ↓
Auto-generate email template
    ↓
Attach both to GHL opportunity
    ↓
Create task: "Deal packaged — review and approve for marketing"
    ↓
On approval → packageStatus = "ready_to_market"
    ↓
Schedule engine takes over
```

**PDF template:** TBD — will be built with next live deal. Template is configurable per account.

### 2. Weekly Schedule Engine

Default cadence (configurable per account):

| Day | Phase | Bot Actions |
|-----|-------|-------------|
| **Mon** | Exclusive — Day 1 | Push new "ready to market" deals to existing buyer list via email blast. Tag deals as `exclusive`. |
| **Tue** | Exclusive — Day 2 | Follow-up blast to buyer list non-openers. Track open/click rates. |
| **Wed** | Public Blast | Publish to all configured channels (InvestorLift, Mevlo, Facebook, etc.). Remove `exclusive` tag. Start 48-hour clock. |
| **Thu** | Inbound + Hunts | Process inbound buyer leads. Support active buyer hunt outreach. Auto-respond to FAQs. |
| **Fri** | Inbound + Hunts | Continue buyer engagement. Generate end-of-week deal status report. |

**Schedule logic:**
```
New deal marked "ready_to_market"
    ↓
Check: Is today Mon or Tue?
    ├── YES → Push to buyer list as EXCLUSIVE immediately
    ├── NO, is today Wed? → Publish everywhere immediately
    └── NO (Thu/Fri/Weekend) → Queue for next Monday's exclusive push
    
Check: Is deal flagged EXPRESS?
    ├── YES → Bypass schedule, blast all channels immediately
    └── NO → Follow standard schedule
```

**Express Lane rules:**
- Only triggered when Owner (Corey) explicitly approves
- Conditions: short due diligence, high competition, urgent timeline
- Bot logs express lane usage for reporting
- Express is the exception, not the habit

### 3. Buyer FAQ Auto-Responder

Bot auto-answers repetitive buyer questions by pulling data from GHL opportunity fields:

| Question Pattern | GHL Field Source | Example Response |
|-----------------|------------------|------------------|
| "What's the ARV?" | `arv` | "ARV is $285,000 based on recent comps in the area." |
| "Is it occupied?" | `occupancy` | "Property is currently vacant with immediate access." |
| "Repair estimate?" | `repair_estimate` | "Estimated repairs are $45,000. Happy to share our scope." |
| "Can I see it?" / "Access?" | `access_instructions` | "Property is vacant — lockbox on front door. We can schedule a showing." |
| "Offer deadline?" | `offer_deadline` | "We're reviewing offers by Friday 5PM CST." |
| "Beds/baths/sqft?" | `beds`, `baths`, `sqft` | "3 bed / 2 bath, 1,850 sqft." |
| "What's the asking price?" | `ask_price` | "Asking $185,000. ARV is $285K with ~$45K in repairs." |
| "Comps?" | `comps` | "Sending over our comp sheet now. [attaches PDF]" |
| "Assignment or double close?" | `offer_terms` | "We're flexible — can do assignment or double close." |

**Decision logic:**
```
Inbound buyer message received
    ↓
AI classifies: Is this a FAQ or a negotiation/qualification question?
    ├── FAQ → Pull answer from GHL fields → Auto-reply instantly
    │          └── Log auto-response in BuyerInteraction
    └── Not FAQ → Route to Dispo Mgnr (Esteban)
        ├── Negotiation (price discussion, terms, counter-offer)
        ├── Serious qualification (funding proof, timeline, entity info)
        └── Complex question bot can't answer from available data
```

**Escalation triggers (always route to human):**
- Buyer makes an offer or counter-offer
- Buyer asks about contract terms or legal questions
- Buyer mentions proof of funds or entity details
- Buyer requests showing with specific time
- Buyer expresses urgency ("I want to close this week")
- Bot confidence < 80% on answer accuracy

### 4. Buyer Hunt Support

The bot does NOT replace research platforms — it handles the work **around** them:

**After Dispo Mgnr identifies targets (flippers, rental buyers):**
```
Dispo Mgnr finds flipper on Zillow/MLS
    ↓
Enters property address into GHL (or bot monitors platform)
    ↓
Bot auto-researches:
    ├── Find listing agent contact info (Redfin, Realtor.com, county records)
    ├── Find owner/buyer entity info (public records)
    └── Cross-reference against existing GHL contacts (prevent duplicates)
    ↓
Bot generates outreach entry:
    ├── Contact name + phone + email
    ├── Source property (the flip they did)
    ├── Pre-written script: "Hey [name], your client flipped [address] — 
    │   we have a similar project at [deal address]. Interested?"
    └── Logged in GHL as new contact with tags: buyer_hunt, source_platform
    ↓
Dispo Mgnr reviews list → approves outreach
    ↓
Bot sends approved messages or creates call tasks
```

**Duplicate prevention:**
- Before creating any new buyer contact, bot checks GHL for:
  - Same phone number
  - Same email
  - Same name + area (fuzzy match)
- If duplicate found → append new deal interest to existing contact, don't create new

**Outreach tracking:**
- Every contact logged with source deal and source platform
- Track: contacted → responded → interested → qualified → offer
- Cross-deal visibility: "This buyer was contacted about 3 other deals — responded to 1"

### 5. Multi-Platform Distribution

When `packageStatus` = `ready_to_market` and schedule permits:

| Platform | Method | Data Pushed | Tracking |
|----------|--------|-------------|----------|
| **InvestorLift** | API | Full listing (photos, numbers, comps, terms) | Views, buyer inquiries, offers via API |
| **Mevlo** | API | Detailed listing with comps | Views, responses |
| **Facebook Groups** | Semi-auto (generates post, human publishes) | Post copy + photos + link | Manual response logging |
| **Email Blast** | GHL email | Email template + PDF to buyer list | Opens, clicks, replies |

**Platform configuration:**
- Channels are configurable per account — not hardcoded
- Each platform has enable/disable toggle
- Credentials stored per-account in encrypted config
- New platforms can be added without code changes (plugin architecture)

**Distribution workflow:**
```
"ready_to_market" trigger
    ↓
Check schedule: which phase are we in?
    ├── Exclusive (Mon/Tue) → Email blast to buyer list ONLY
    └── Public (Wed+) → Push to ALL enabled channels
    ↓
For each channel:
    ├── Format deal data per platform requirements
    ├── Push listing
    ├── Log distribution event
    └── Start tracking responses
    ↓
48-hour clock begins on first public push
```

### 6. Buyer Response Tracking

All buyer interactions logged back to GHL Buyer Pipeline:

**Source attribution:**
| Source | Detection Method |
|--------|-----------------|
| InvestorLift | API webhook — buyer inquiry event |
| Mevlo | API webhook — buyer response event |
| Facebook | Manual tag when buyer contacts via FB |
| Email blast | GHL — reply to blast email |
| Buyer hunt | Bot-generated outreach → response logged |
| Inbound (organic) | Untagged buyer contact → bot prompts for source |

**Buyer quality scoring:**

| Signal | Score Impact | Detection |
|--------|-------------|-----------|
| Responded within 1 hour | +3 | Timestamp comparison |
| Has proof of funds | +5 | Conversation keyword detection |
| Repeat buyer (bought before) | +5 | GHL contact history |
| Asked for property access | +3 | FAQ auto-responder classification |
| Made verbal offer | +4 | Conversation AI analysis |
| Asked only about price, no follow-up | -2 | Single-question interaction |
| No response after 48h | -3 | Time-based |
| "Just looking" / "send me everything" | -2 | Keyword pattern |

**Buyer pipeline stages (auto-managed):**
```
New Lead → Engaged → Qualified → Offer Made → Under Contract → Closed
                                      ↓
                                    Dead (with reason tag)
```

Bot auto-moves buyers between stages based on interaction signals. Human override always available.

---

## Dispo Team Roles (Bot Respects These)

| Role | Person (NAH) | Bot Interaction |
|------|-------------|-----------------|
| **Owner** | Corey | Approves express lane. Receives 48h escalations. Final pricing decisions. |
| **Dispo Admin** | — | Creates campaigns, sends contracts, monitors KPIs. Receives daily summaries. |
| **TC** | — | No bot interaction until deal under contract. Bot hands off buyer/seller details. |
| **Dispo Mgnr** | Esteban | Primary operator. Reviews auto-responses, qualifies buyers, negotiates. Receives all inbound alerts. |

Bot never bypasses role hierarchy. Express lane requires Owner approval. Negotiation always routes to Dispo Mgnr.

---

## Cycle Summary Notes

When a deal's marketing cycle completes (deal sold, expired, or pulled), the bot writes a **GHL note** on the opportunity:

```
📋 Deal Marketing Summary
Property: 423 Brookside Dr, Nashville TN
Marketing Period: Feb 3 - Feb 7, 2026

Distribution:
- Feb 3 (Mon): Email blast to 147 buyers (EXCLUSIVE) — 62 opens, 8 clicks
- Feb 4 (Tue): Follow-up blast to non-openers — 23 opens, 3 clicks
- Feb 5 (Wed): InvestorLift posted — 89 views, 4 inquiries
- Feb 5 (Wed): Mevlo posted — 34 views, 2 inquiries
- Feb 5 (Wed): Facebook posted — manual

Buyer Interest (11 total):
- 4 from InvestorLift, 2 from Mevlo, 3 from email blast, 2 from buyer hunt
- 3 qualified (proof of funds), 2 made offers
- Winning buyer: Mike Chen (InvestorLift) — $195K cash, 14-day close

Auto-Responses: 18 FAQ answers handled by bot
Escalated to Esteban: 4 conversations (negotiation/qualification)

Result: Under contract @ $195K | 48-hour clock: 43h to first offer
```

Notes posted with `[Gunner]` prefix tag for filtering.

---

## NAH-Specific Configuration (Reference Implementation)

### Pipeline Mapping
```json
{
  "dispoPipeline": {
    "pipeline": "Dispo",
    "stages": {
      "packaging": "Deal Packaging",
      "readyToMarket": "Ready to Market",
      "marketed": "Active Marketing",
      "underContract": "Under Contract",
      "closed": "Closed"
    }
  },
  "buyerPipeline": {
    "pipeline": "Buyer Pipeline",
    "stages": ["New Lead", "Engaged", "Qualified", "Offer Made", "Under Contract", "Closed", "Dead"]
  },
  "schedule": {
    "exclusive": ["Mon", "Tue"],
    "publicBlast": ["Wed"],
    "inboundHunts": ["Thu", "Fri"],
    "timezone": "America/Chicago"
  },
  "distributionChannels": {
    "investorLift": { "enabled": true, "apiKey": "***" },
    "mevlo": { "enabled": true, "apiKey": "***" },
    "facebook": { "enabled": true, "mode": "semi-auto" },
    "emailBlast": { "enabled": true, "buyerListTag": "active_buyer" }
  },
  "escalation": {
    "48hClockEnabled": true,
    "escalateAt": [24, 36, 48],
    "escalateTo": {
      "24": "dispo_mgnr",
      "36": "dispo_admin",
      "48": "owner"
    }
  },
  "faqFields": {
    "arv": "opportunity.arv",
    "ask_price": "opportunity.ask_price",
    "repair_estimate": "opportunity.repair_estimate",
    "beds": "opportunity.beds",
    "baths": "opportunity.baths",
    "sqft": "opportunity.sqft",
    "occupancy": "opportunity.occupancy",
    "access": "opportunity.access_instructions",
    "offer_deadline": "opportunity.offer_deadline",
    "offer_terms": "opportunity.offer_terms"
  },
  "roles": {
    "owner": "corey",
    "dispoAdmin": null,
    "tc": null,
    "dispoMgnr": "esteban"
  },
  "businessHours": {
    "days": ["Mon", "Tue", "Wed", "Thu", "Fri"],
    "start": "09:00",
    "end": "17:00",
    "timezone": "America/Chicago"
  }
}
```

### Current Platforms (NAH)
| Platform | Use | API Available | Bot Role |
|----------|-----|--------------|----------|
| InvestorLift | Marketplace posting + buyer analytics | ✅ | Full automation |
| Mevlo | Deal distribution + comp listings | ✅ | Full automation |
| Facebook Groups | Manual posting | ❌ | Generate post copy, human publishes |
| InvestorBase | Buyer hunt research | ❌ (manual UI) | Assist around it — contact lookup, list generation |

---

## Multi-Tenant / White-Label Considerations

### Onboarding Flow (New Customer)
1. Connect GHL account (OAuth)
2. Bot scans pipelines → identifies dispo/buyer stages
3. Bot presents: "I found these stages and buyer lists — is this right?"
4. Admin confirms stage mapping + team roles
5. Admin configures distribution channels (API keys, FB groups, etc.)
6. Bot asks: "Use default Mon-Fri schedule or custom?"
7. Bot begins monitoring — first deal packaging available immediately

### What Varies Per Customer
- Pipeline/stage names
- Distribution channels and API keys
- Weekly schedule cadence
- Team roles and assignments
- FAQ field mappings (custom fields differ per account)
- Express lane approval flow
- PDF template branding
- Buyer list tags and segmentation

### What's Universal
- Auto-discovery engine
- Deal packaging logic
- Schedule engine framework
- FAQ auto-responder pattern matching
- Buyer hunt outreach workflow
- 48-hour clock logic
- Source attribution tracking
- Buyer quality scoring
- DRY_RUN mode

---

## Pricing Tier Alignment

| Feature | Starter ($99) | Pro ($249) | Enterprise ($499) |
|---------|--------------|-----------|-------------------|
| Deal packaging (PDF + email) | ✅ | ✅ | ✅ |
| Weekly schedule engine | ✅ | ✅ | ✅ |
| FAQ auto-responder | 5 question types | All types + custom | All types + custom |
| Distribution channels | 1 channel | 3 channels | Unlimited |
| Buyer response tracking | Basic | Full + quality scoring | Full + quality scoring |
| Buyer hunt support | ❌ | ✅ | ✅ |
| 48-hour clock + escalation | ❌ | ✅ | ✅ |
| Express lane | ❌ | ✅ | ✅ |
| Multi-deal buyer dedup | ❌ | ✅ | ✅ |
| Custom PDF templates | ❌ | ❌ | ✅ |
| API access | ❌ | ❌ | ✅ |

---

## Implementation Priority

### Phase 1: Deal Packaging + Distribution (Ship First)
- Auto-detect deal completeness in GHL
- Generate deal PDF from template
- Generate email template
- Weekly schedule engine (Mon-Fri cadence)
- Email blast to buyer list (exclusive phase)
- Push to 1 platform (InvestorLift)
- Basic 48-hour clock
- DRY_RUN mode
- **Requires:** Live deal to build PDF template against

### Phase 2: FAQ + Response Tracking
- Buyer FAQ auto-responder (all question types)
- Buyer response logging in GHL
- Source attribution per platform
- Buyer quality scoring
- Buyer pipeline auto-management
- Add Mevlo distribution
- Express lane flow

### Phase 3: Buyer Hunt + Intelligence
- Buyer hunt outreach list generation
- Contact lookup automation (listing agents, owners)
- Cross-deal duplicate prevention
- Pre-written outreach scripts
- Facebook post generation
- Cycle summary notes
- End-of-week deal status reports

### Phase 4: Optimization
- Buyer engagement analytics (which channels convert best)
- Optimal posting time detection
- Buyer list segmentation (by deal type, area, price range)
- Platform ROI tracking
- Predictive: which buyer is most likely to close based on signals

---

## Technical Notes

### GHL API Endpoints Needed
- `GET /opportunities/search` — find dispo pipeline opportunities
- `GET /opportunities/{id}` — deal details, custom fields
- `PUT /opportunities/{id}` — update stage, status, custom fields
- `GET /contacts/search` — buyer list queries
- `POST /contacts` — create buyer contacts from hunt
- `GET /conversations/{id}/messages` — buyer message history
- `POST /conversations/messages` — send auto-responses
- `POST /contacts/{id}/tasks` — create team tasks
- `POST /contacts/{id}/notes` — log cycle summaries
- Webhooks: `opportunity.stage_changed`, `conversation.message_received`, `task.completed`

### Polling vs Webhooks
- **Webhooks preferred** for: new buyer messages (FAQ trigger), stage changes, task completion
- **Polling** for: deal completeness checks (hourly), platform response ingestion, 48-hour clock ticks
- **Scheduled** for: weekly schedule engine (cron-based), daily summary reports

### DRY_RUN Mode
When enabled:
- PDF generated but not attached
- Emails drafted but not sent
- Platform listings formatted but not posted
- Auto-responses composed but not sent (logged for review)
- All actions logged with `[DRY_RUN]` prefix
- Tasks created normally (for team visibility)

---

## Pain Points Solved

| # | Pain Point | Bot Solution |
|---|-----------|-------------|
| 1 | Repetitive buyer questions eating Esteban's time | FAQ auto-responder handles 70%+ of inbound questions instantly |
| 2 | Manual buyer hunt research grind | Bot automates contact lookup, list generation, script creation |
| 3 | Multi-platform posting of same deal info | One-click distribution to all configured channels |
| 4 | No systematic tracking of buyer outreach across deals | Every interaction logged in GHL with source attribution + cross-deal dedup |
| 5 | Deal packaging is manual and slow | Auto-generate PDF + email template from GHL fields in seconds |

---

*This spec was built from NAH's actual dispo process map (Lucidchart export) and team workflow interviews on Feb 15, 2026. The dispo process map is documented in `/gunner-agents/add-ons/buyer-lead-gen/dispo-process-map.md`. The bot is built on the Gunner engine infrastructure (Railway).*
