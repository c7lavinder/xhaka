# Buyer Tagging SOP

**Owner:** Esteban (primary), Xhaka (support)
**Last Updated:** February 3, 2026
**Status:** Active

---

## Purpose

Tag priority buyers with structured data so we can:
1. Quickly identify who to call first when a deal comes in
2. Match deals to buyers automatically (future AI automation)
3. Generate targeted buyer lists by market, buybox, and tier

---

## When to Use This

- Onboarding a new buyer
- Updating an existing buyer's info after a purchase or conversation
- Batch-tagging priority buyers (current project: top 50-100)

---

## How to Access Buyer Info

### Option A: From a Contact
1. Open the buyer's **Contact** record in GHL
2. Scroll to the **Buyer Info** section (custom fields)

### Option B: From an Opportunity
1. Open any **Opportunity** associated with the buyer
2. Click into the linked Contact
3. Navigate to the **Buyer Info** section

---

## Fields to Fill Out

| Field | What It Means | Example Values |
|-------|---------------|----------------|
| **Buyer Tier** | Priority level for outreach | A (call first), B (solid), C (backup) |
| **Verified Funding** | Have we confirmed they can close? | Yes / No / Pending |
| **Has Purchased Before** | Have they bought from us? | Yes / No |
| **Response Speed** | How fast do they respond/decide? | Fast (same day), Medium (2-3 days), Slow (week+) |
| **Last Contact Date** | When did we last talk to them? | [Date] |
| **Market(s)** | What areas do they buy in? | Nashville, Memphis, Chattanooga, etc. |
| **Buybox** | What property types/specs? | SFR, <$200K, 3+bed, etc. |
| **Buyer Notes** | Anything else relevant | "Prefers off-market only" / "Cash, closes in 10 days" |

---

## How This Connects to Deals

The **Deal** custom fields (Market, Property Type, ARV, etc.) will eventually match against **Buyer** fields:

- Deal comes in → System checks which buyers match Market + Buybox
- Generates a list of buyers to blast, sorted by Tier
- Future: AI drafts personalized messages per buyer

**The better the buyer data, the smarter the automation.**

---

## Step-by-Step: Tagging a Buyer

1. **Open the buyer** (Contact or via Opportunity)
2. **Scroll to Buyer Info section**
3. **Fill in each field** based on what you know:
   - If unsure, leave blank or put "Unknown"
   - If info is outdated, update it
4. **Click Save**
5. **Move to next buyer**

---

## Priority Tagging Project (Current)

**Goal:** Tag the top 50-100 priority buyers this week

**How to prioritize:**
- Buyers who have purchased from us before
- Buyers who respond fast and close reliably
- Buyers active in our main markets

**Don't worry about:**
- Cold/unresponsive buyers (skip for now)
- Buyers outside our active markets

---

## Tips

- **When in doubt, ask the buyer.** A quick "Hey, still buying in Nashville? What's your ideal deal look like?" gets you the data.
- **Update after every transaction.** Closed a deal with them? Update Last Contact Date, Has Purchased Before, and any notes.
- **Tier A is sacred.** Only buyers who actually close fast and reliably should be Tier A.

---

## Common Questions

**What if a buyer operates in multiple markets?**
List all markets separated by commas: `Nashville, Memphis, Chattanooga`
The system will match them to deals in ANY of those markets.

**What if their buybox is complex?**
Put the key criteria in Buybox field, details in Buyer Notes:
- Buybox: `SFR, <$250K, 3+bed`
- Notes: `Prefers brick, no major foundation issues, will stretch to $300K for right deal`

**What if I don't know their funding status?**
Set Verified Funding to `Pending` and add a note: "Need to verify POF"
Next time you talk to them, ask and update.

**What if they haven't bought from us but bought elsewhere?**
Has Purchased Before = `No` (means from us)
Add in Notes: "Active buyer, closed 3 deals last quarter with other wholesalers"

**What if a buyer used to be Tier A but ghosted us?**
Downgrade to Tier B or C. Add note with context: "Was A-tier, ghosted on last 2 deals (Jan 2026)"

**What if the contact has both seller and buyer info?**
That's fine — GHL can hold both. Just fill out the Buyer Info section. The Seller info is separate.

**What if I'm missing info?**
Leave it blank. Blank fields = motivation to gather that info on the next interaction.
- Don't guess or mark "Pending" — blank is the signal
- When you see blanks, that's your prompt to ask on the next call
- Fill it in as soon as you learn it

**How do I know what info to trust?**
Older info = less reliable. If Last Contact Date was 6+ months ago, treat everything as "needs verification."

---

## Updating Along the Buyer Pipeline

**Buyer data isn't one-and-done.** Update it as they move through stages:

| Pipeline Stage | What to Update |
|----------------|----------------|
| **New Buyer** | Markets, Buybox (whatever they tell you initially) |
| **Qualified** | Verified Funding → Yes, Tier, Response Speed |
| **Priority** | Tier → A, confirm all fields are filled, detailed Buybox |
| **JV Partner** | Notes (JV terms, split, how they operate), Tier → A |
| **Not Qualified** | Notes (why — no funds? wrong market? flaky?), Tier → C or remove |

**Why this matters:**
- Stale data = wasted time calling wrong buyers
- Updated data = AI can match deals accurately
- Every stage change is a prompt to fill in gaps

**Rule of thumb:** When a buyer moves stages, update their info.

---

## Questions?

Slack Esteban or Xhaka.
