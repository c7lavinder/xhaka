# NAH GHL System Documentation

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 📋 LEAD MANAGEMENT SYSTEM

This section covers how leads flow through the system from first contact to closed deal.

### Lead Statuses (0-6)

Every lead has a status number that indicates where they are in the sales process:

| Status | Name | Meaning |
|--------|------|---------|
| 0 | Follow Up | All follow-ups, no active deals |
| 1 | New Lead | Untouched, needs first contact |
| 2 | Working Lead | In qualification process |
| 3 | Apt Set | Qualified, appointment scheduled |
| 4 | Made Offer | Offer presented to seller |
| 5 | Under Contract | Deal signed, ready for dispo |
| 6 | Purchased | Closed and funded |

### Follow-Up Statuses

Leads in Status 0 (Follow Up) are further categorized:

**1 Month Follow-Up:**
• Wants to sell within 30 days
• Has motivation AND discounted price
• One good call away from an appointment

**4 Month Follow-Up:**
• Doesn't want to sell for 60+ days
• OR only motivation is price (not discounted enough)
• Worth periodic check-ins

**12 Month Follow-Up:**
• Not motivated
• Don't spend time actively working them
• May re-engage later

### Lead Qualification (Hot vs Warm)

Jessica (Data Manager) qualifies leads using 5 factors:

1. Timeline - When do they want to sell?
2. Condition - What shape is the property in?
3. Price - Are they realistic on price?
4. Motivation - Why are they selling?
5. Source - Where did the lead come from?

**Scoring:**
• 3+ factors positive = HOT lead
• Less than 3 = WARM lead

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🏗️ PIPELINE ECOSYSTEM

GHL has 6 pipelines that work together:

### 1. Sales Process Pipeline (173 opportunities)
The main pipeline for active leads through closing.

**Stages:**
• New Lead → Warm → Hot → Apt Scheduled → Made Offer → Under Contract → Purchased

**Also includes follow-up buckets:**
• 1 Month, 4 Month, 1 Year
• Ghosted, Not Closed, Sold, DNW (Do Not Work)

### 2. Follow Up Pipeline
Separate nurture buckets for long-term follow-up.

### 3. Dispo Pipeline (105 opportunities)
Deals under contract being sold to buyers.

**Stages:**
• New Deal → Clear to Send → Sent to Buyers → Offers Received → UC w/ Buyer → Working w/ Title → Closed

**Note:** When a deal hits Stage 5 (Under Contract) in Sales Process, it automatically creates an opportunity in the Dispo Pipeline.

### 4. Buyer Pipeline (3,293 buyers)
All registered buyers in the system.

### 5. JV Deals Pipeline
Joint venture deals with partners.

### 6. Lead Mining Pipeline
For prospecting and list building.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 📝 CUSTOM FIELDS REFERENCE

### Buyer Info Fields (on Contact record)

| Field | Type | Options/Notes |
|-------|------|---------------|
| Buyer Tier | Dropdown | A, B, C |
| Verified Funding | Yes/No | Have we confirmed they can close? |
| Has Purchased Before | Yes/No | Track record with us |
| Response Speed | Dropdown | Fast, Moderate, Slow |
| Last Contact Date | Date | When we last spoke |
| Buyer Notes | Text | Free-form notes |
| Market(s) | Multi-select | Nashville, Memphis, Knoxville, Chattanooga, Huntsville, Birmingham |
| Buybox | Multi-select | Flipper, Landlord, Builder, Multi Family, Turn Key |

### Deal Info Fields (on Opportunity record)

| Field | Type | Options/Notes |
|-------|------|---------------|
| Market | Dropdown | Nashville, Memphis, Knoxville, Chattanooga, Huntsville, Birmingham |
| Property Type | Multi-select | Flipper, Landlord, Builder, Multi Family, Turn Key |
| ARV | Monetary | After Repair Value |
| Repair Estimate | Number | Estimated repair costs |
| Contract Price | Monetary | What we're buying for |
| Asking Price | Monetary | What we want from buyer |
| Deal Summary | Text | Beds/baths/sqft/specs |
| Photos Link | Text | Link to property photos |
| Access Instructions | Text | How to access for showing |

### Mailing Address Fields (on Contact record)

| Field | Type |
|-------|------|
| Mailing Street | Text |
| Mailing City | Text |
| Mailing State | Text |
| Mailing Zip | Text |

**Note:** Buybox (buyer) and Property Type (deal) use identical options so we can match deals to buyers automatically.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 👥 TEAM ROLES

### Lead Manager (LM)
**Primary goal:** Disqualify fast OR set appointments for motivated sellers

**Responsibilities:**
• First contact with leads
• Qualify leads using 7-part script
• Set appointments for Acquisition Managers
• Never make offers on calls - just set appointments

**Key skills:**
• Rapid disqualification (under 4 minutes for bad fits)
• Building rapport
• Handling objections
• Price anchoring (50-60% of Zestimate)

### Acquisition Manager (AM)
**Primary goal:** Close deals with qualified sellers

**Responsibilities:**
• Conduct walkthrough appointments
• Present offers to sellers
• Negotiate and close contracts
• Get properties under contract

### Data Manager (Jessica)
**Primary goal:** Qualify leads and maintain data quality

**Responsibilities:**
• Score leads as Hot or Warm (5-factor system)
• Maintain CRM data accuracy
• Support reporting and KPIs

### Dispo Manager (Esteban)
**Primary goal:** Sell deals to buyers quickly and profitably

**Responsibilities:**
• Manage buyer relationships
• Match deals to buyers
• Negotiate with buyers
• Close assignments

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 📚 LM TRAINING OVERVIEW

Five training documents cover everything a Lead Manager needs to know:

### 1. Process Mastery
• How leads flow through the system
• Lead statuses (0-6)
• Follow-up statuses
• Two CRM systems: GHL + MasterSuite

### 2. Script Mastery
The 7-part call structure:
1. Intro - Verify right person
2. Setting Expectations - What the call looks like
3. Confirm Property Condition - Beds/baths/repairs
4. Confirm Roadblocks - Decision makers, tenants, timeline
5. MOTIVATION - The most important part (why are they selling?)
6. Price - Get their number, don't give yours first
7. Setting Expectations for Next Call - If fit, set appointment

**Price Anchoring:** "Other investors are buying similar properties for around $X" (50-60% of Zillow Zestimate)

### 3. Good Appointment Mastery
5 criteria for a quality appointment:
1. True Motivation - Real pain driving the sale
2. Discounted Price - Below market expectations
3. Walkthrough Apt - In-person property visit
4. Offer Call - Follow-up to present numbers
5. Ready to Decide - All decision makers present

### 4. Disqualification Mastery
**Goal:** Get bad fits off the phone in under 4 minutes

**Red flag keywords:**
• "You called me first"
• "I'm just hearing offers"
• "This is an unsolicited call"
• Short responses, won't cooperate

**RED Sellers:** Hostile or rude. Build rapport or push away.

### 5. Objections Mastery
Three categories of objections:

**Price Objections:**
• "That's too low" → "What were you hoping I would say?"
• Won't give a price → "Do you have a 10k-15k range in mind?"

**Timeline Objections:**
• Needs 60-90 days → Offer to help with movers
• Probate situation → Start process, agreement in place
• Tenant situation → Write flexible closing date

**Other People Involved:**
• Decision maker not available → Schedule when both can talk
• Use 3rd party stories to build credibility

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🔄 KEY AUTOMATIONS

### Stage-Based Triggers
• When lead hits Status 5 (Under Contract) in Sales Process → Auto-creates opportunity in Dispo Pipeline
• Drip campaigns trigger based on lead status changes

### SMS Drip Campaigns
Automated text sequences based on:
• New lead welcome
• Follow-up bucket assignment
• Status changes

**Note:** Pipeline renaming is safe - automations use internal IDs, not names.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🔗 RELATED SYSTEMS

### MasterSuite
Separate software for property analysis and notes. Not part of GHL.
• Property valuation
• Deal analysis
• Comparable sales

### InvestorLift
Buyer marketing platform (requires paid plan for API access).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Questions? Ask Corey or Esteban.

Last Updated: February 2, 2026
