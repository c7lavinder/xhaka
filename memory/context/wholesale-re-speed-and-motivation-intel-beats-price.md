# Wholesale Real Estate — Context

## What NAH Does
New Again Houses (NAH) buys distressed properties below market value and assigns the contracts to cash buyers (investors). No renovation, no holding — pure deal flow. Based in Nashville, TN.

## The Pipeline
```
Lead Gen → Initial Contact → Appointment → Offer → Contract → Assign to Buyer → Close
```

## Key Roles
- **Lead Generator (LG):** Cold calls/texts potential sellers. Gets the first conversation. (Alex, Efren, Mirna)
- **Lead Manager (LM):** Nurtures interested leads, sets appointments, handles follow-up. (Daniel, Chris)
- **Acquisition Manager (AM):** Runs the appointment, makes the offer, gets the contract signed. (Kyle)
- **Dispo Manager:** Takes the signed contract, finds a cash buyer, closes the deal. (Esteban)
- **Data Manager:** KPI entry, channel routing. (Jessica)

## Key Metrics
- **Leads:** New contacts entered
- **Apts:** Appointments set
- **Offers:** Offers made
- **Contracts:** Signed purchase agreements
- **Closed:** Deals that funded

## Lead Sources
- BatchDialer (cold call lists)
- BatchLeads (cold SMS lists, data enrichment)
- PPL platforms (Leadzolo, PropertyLeads, MotivatedSellers) — pay per lead, opt-in leads
- GHL (manages all inbound/outbound once in pipeline)
- PropStream (planned — county record data for acquisition machine)

## Markets
- Nashville, TN (primary)
- Chattanooga, TN
- Memphis, TN (secondary)
- Knoxville, TN

## What "Motivated Seller" Means
A property owner who needs to sell quickly — often due to foreclosure, divorce, inheritance, job loss, or property condition. They'll accept below-market offers for speed/certainty.

## GHL Pipeline Structure
### Sales Process Pipeline
- Stages: New Lead → Warm Leads → Hot Leads → Pending Appointment → Walkthrough → Offer Appointment → Made Offer → Under Contract → Purchased → Ghosted → Follow Up (1mo/4mo/12mo)

### Follow-Up Buckets (4 GHL Buckets)
- 1 Month: Selling in ~30 days but something blocking
- 4 Month: Selling in 6 months
- 12 Month: Default for "not right now" / long-term nurture
- Sold/Dead: ONLY legal threats, confirmed sold, or unviable property — low motivation NEVER = dead

### Dispo Pipeline
- Stages: New Deal → Clear to Send → Offers Received → With JV Partner → Need to Terminate → UC with Buyer → Working with Title → Closed

### Buyer Pipeline
- Stages: New Buyer → Showing Scheduled

## Buyer Classification (actual GHL fields)
- **Buyer Tier:** Priority / Qualified / JV Partner / Unqualified / Halted
- **Response Speed:** Lightning / Same Day / Slow / Ghost
- **Buybox:** multi-select (Flipper, etc.)
- **Market(s):** multi-select (Columbia, Nashville, etc.) + Secondary Market field
- **Verified Funding:** checkbox
- **Has Purchased Before:** checkbox
- Ghost and Halted buyers excluded from blast/match results

## Legal/Compliance Notes
- **Twilio compliance:** PPL leads (opted in via newagainhouses.com or PPL platforms) are fair game. Must include company name and "Reply STOP" in templates.
- **Cold texting (BatchLeads):** Higher risk — Twilio suspends accounts for content drift, no opt-out language. Account 1 (Lead Gen) suspended Feb 2026. Account 2 had warning — "New Again Houses" + "Reply STOP" fixes required.
- **Shell names used for cold outreach:** Purple Doors, Volunteer Solutions, EasySaleTN — protects NAH brand during cold contact.
- **DNC:** PPL/inbound leads opted in — DNC rules don't apply to SMS response.

## SMS Rules (Important for Agent Design)
- **Send window:** 9am–6pm in lead's TIMEZONE (not NAH timezone). Set in Outbound Manager.
- **Company name visibility:** Form/PPL source = include company name. SMS/dialer = HIDE company name until qualified.
- **Morning vs evening tone:** Message Crafter receives time-of-day as context — different tone for each.
- **No double drip:** If real conversation happens, stop drip sequence immediately.

## Deal Structures
### Standard Wholesale
- Find motivated seller → get property under contract below market → assign contract to cash buyer for a fee
- Assignment fee = difference between contract price and buyer's purchase price
- NAH typically assigns within 30-45 days of contract

### JV (Joint Venture) Partner
- When deal needs co-wholesaling — route through JV Router agent
- Split fees with JV partner

### "Not Right Now" Routing (non-linear)
- 1mo bucket: selling in 30 days but blocked (POA issues, probate, etc.)
- 4mo bucket: selling in 6 months
- 12mo bucket: anyone else (default for "not right now")

## Known Deal Types / Complications
- **Conservatorship/POA:** Seller's POA must be notarized to be valid. If not, conservatorship required (attorney Derek Malcolm, $1,500 back taxes play). Example: 23 Sycamore Ct.
- **UC or Fully Sold?:** Already-sold sellers might be UC. LM must ask this. If UC → re-engage. If confirmed sold → move to Lost + county records verification.
- **Wrong Number:** GHL opportunity deleted via OpportunityBot.

## Industry Playbooks Used for Training
- **Todd Toback (No Limits REI):** Objection handling, rapport > price, 10-step closing system, "no lead left behind"
- **Chandler Saine:** $100K/mo guide, $300K/mo team building, follow-up systems
- **Steve Trang:** Closing frameworks, price objection handling, OPS
- **Tyson Smith:** Cold calling (1000+ dials/day), virtual wholesaling
- **Courtney Scott:** Marketing > Sales for 2025, PPL strategy

## Industry Benchmarks (from market analysis)
- REsimpli pricing: $149–$599/mo (comparable CRM/automation)
- Gunner positioning: "Gong for wholesalers" — AI call coaching niche
- TAM estimate: $3.6M–$50M+ ARR depending on penetration
- Recommended Gunner pricing: $149/$299/$599 tiers

## AI Acquisition Machine (Planned)
- PropStream → scoring agent → GHL → Bland.ai (voice) → PandaDoc (contracts)
- Focus: inbound via direct mail + marketing (no AI cold calling — TCPA risk)
- Human team handles emotional/complex sellers; AI handles volume + routine
- Break-even: 1 deal covers 6-12 months of costs

---
Last updated: 2026-03-14
