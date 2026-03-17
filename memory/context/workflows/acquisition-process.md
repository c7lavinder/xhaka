---
title: NAH Acquisition Process — End-to-End Workflow
category: workflows
last_updated: 2026-03-16
sources: [master-wholesale-playbook.md, nah.md, motivated-seller-sim.md]
---

# NAH Acquisition Process
## Complete Workflow: Lead In → Assignment Fee Out

---

## Overview

The NAH acquisition pipeline has 10 stages. LMs own stages 1-4. AMs own stages 5-7. Shared ownership on 8-10 with Corey as escalation point.

```
LEAD INTAKE → FIRST CONTACT → QUALIFICATION → APPOINTMENT → OFFER → 
NEGOTIATION → CONTRACT → DUE DILIGENCE → ASSIGNMENT/DOUBLE CLOSE → DISPOSITION
```

**Golden Rule:** Speed kills in wholesale — for competitors. Speed to lead, speed to appointment, speed to offer. Every 24 hours of delay reduces close probability by ~30%.

---

## Stage 1: Lead Intake

### What Happens
A new lead enters the system from one of several sources. The lead must be captured, tagged by source, and routed within minutes.

### Lead Sources (NAH Stack)
| Source | Tool | Type |
|--------|------|------|
| Cold call | BatchDialer | Outbound — LM calls lists |
| Outbound SMS | BatchLeads | Outbound — texted list responds |
| PPL (Pay Per Lead) | Leadzolo, PropertyLeads, MotivatedSellers | Inbound — seller filled a form |
| Meta Ads | Funnel → GHL | Inbound — seller requested info |
| Voicemail | CallRail | Inbound — seller called a tracked number |
| Direct referral | Manual GHL entry | Warm — referred by past seller/buyer |

### Auto-Routing Logic
- All inbound leads → GHL pipeline stage: **New Lead**
- Auto SMS fires within seconds (set up in GHL automation)
- LM assigned based on capacity (Daniel or Chris)
- Speed-to-lead target: **< 5 minutes** for inbound PPL leads

### Who Owns It
**Jessica (Data)** — verifies lead source is tagged correctly. Flags the 66+ untagged properties currently in inventory.
**LM (Daniel / Chris)** — picks up the lead within their assigned queue.

### Tool
**GHL** — all lead management. Pipeline stage: New Lead.

### Metric
- Speed to first contact (target: < 5 min inbound, < 24hr outbound)
- Lead volume by source
- Cost per lead by channel

---

## Stage 2: First Contact

### What Happens
LM makes first call to the seller. This is the trust window. The first 3 minutes determine if the lead is real.

### Script (Tyson Smith Method)
**Cold call opener:**
> "Hey, is this the owner of [ADDRESS]? Are you interested in selling that property?"

**Inbound/PPL opener:**
> "Hi [Name], I see you reached out about your property at [address]. Tell me a little about what's going on."

### What the LM is Listening For
1. **Tone** — Guarded vs. open
2. **Trigger event** — Any mention of why they're selling
3. **Timeline words** — "soon," "ASAP," "I need to," "before [date]"
4. **Pain language** — "tired of," "I can't afford," "we need to," "the bank"

### If No Answer
- GHL auto-task to call back in 2 hours
- Auto-SMS fires (set in GHL workflow)
- BatchDialer used for cold call lists only — GHL handles all pipeline follow-up

### Who Owns It
**LM (Daniel / Chris)**

### Tool
**GHL** (pipeline leads) | **BatchDialer** (cold call lists only)

### Metric
- Calls made / day per LM
- Contact rate (% of new leads reached)
- Conversations per day
- Gunner score on first-contact calls

---

## Stage 3: Qualification

### What Happens
LM digs into the seller's situation to determine if this is worth passing to Kyle. The MTEQ framework:

**M — Motivated?**
- Is there a real trigger event?
- Can they articulate why they need to sell?
- Would they accept below market in exchange for speed/certainty?

**T — Timeline?**
- When do they need to be done?
- Is there an external deadline (foreclosure, divorce, move date)?
- "Whenever the right offer comes" = not qualified

**E — Equity?**
- Rough ARV estimate vs. what they owe
- Target: 30%+ equity spread for a workable deal
- Low equity → explore creative structures or release

**Q — Condition?**
- Does the property need work?
- Repairs needed are a negotiation lever — capture this info for Kyle

### The Equity + Motivation Matrix
```
High Equity + High Motivation  → 🟢 Pass to Kyle IMMEDIATELY
High Equity + Low Motivation   → 🟡 Nurture — check back in 30-60 days
Low Equity + High Motivation   → 🟠 Escalate to Corey — creative structure?
Low Equity + Low Motivation    → 🔴 DQ and drip automation only
```

### What to Capture in GHL
- Trigger event (in notes)
- Stated timeline
- Rough ARV / owed
- Property condition
- Seller personality type (for Kyle's preparation)

### Who Owns It
**LM (Daniel / Chris)**

### Tool
**GHL** — notes, pipeline stage advancement to "Contacted"

### Metric
- Qualification rate (% of contacts that reach 🟢 or 🟡)
- Pain probing score in Gunner (20% of call grade)
- Pass rate to AM (Kyle) per LM

---

## Stage 4: Appointment Setting

### What Happens
LM books the seller for a deeper conversation with Kyle (AM). The appointment is the commitment mechanism.

### In-Person vs. Virtual
| Type | When to Use | Note |
|------|------------|------|
| **In-person** | High-equity deals, motivated seller, property needs visual assessment | Kyle goes to property |
| **Virtual** | Pre-screened deal, seller is remote, initial offer discussion | Zoom or phone with GHL notes |

### Commitment Techniques (Todd Toback)
The appointment isn't just a scheduled call — it's a commitment from the seller.

1. **Specificity:** "I'll call you Thursday at 2pm CST. Will you be available?"
2. **Confirmation text:** GHL sends confirmation SMS/email automatically
3. **Pre-close:** "After this call, if the numbers work for both of us, are you open to moving forward quickly?"
4. **Agenda setting:** "On that call, I'll ask you a few questions about the property, walk through what a fair offer looks like, and if it makes sense for both of us, we can talk next steps."

### Who Owns It
**LM** sets the appointment | **Kyle (AM)** takes the appointment

### Tool
**GHL** — appointment scheduling, confirmation automation, pipeline stage: "Apt Set"

### Metric
- Appointment set rate (% of qualified leads that book)
- Show rate (% of appointments that actually happen)
- Appointment-to-offer conversion

---

## Stage 5: Offer Presentation (Todd's 10-Step)

### What Happens
Kyle conducts the appointment using Todd Toback's 10-step close system. **The offer is LAST — not first.**

### Todd's 10-Step System

| Step | Action | Key Principle |
|------|--------|--------------|
| 1 | **The Pour** | Build rapport intentionally. Match energy. Find common ground. |
| 2 | **Set Agenda + Ask Permission** | "I'm going to ask a few questions to understand your situation. Is that okay?" |
| 3 | **Qualify: Do they have a problem?** | "What's been the hardest part of this situation?" |
| 4 | **Qualify: Will they trade equity to solve it?** | "If we could make this easy and fast, is price your only concern?" |
| 5 | **Review Commitments** | "If the numbers work, what does next look like? Yes or no? When do we talk again?" |
| 6-8 | **Handle Objections** | Use the 5 techniques (see below) BEFORE making offer |
| 9 | **Make the Offer** | Present the offer with the Certainty + Speed frame |
| 10 | **The Boomerang** | "Are you sure this is right for you? I want to make sure it's a good fit." → Re-affirms emotion → prevents cancellations |

### Kyle's Personality Adaptation (Steve Trang PMAS™)
Detect in first 2-3 minutes:
- **Analytical seller** → Use comps, numbers, ROI comparison
- **Expressive seller** → Lead with empathy, stories, emotional validation
- **Driver seller** → Get to the point fast, no fluff
- **Amiable seller** → Slow down, reassure, no pressure

### Who Owns It
**Kyle (AM)**

### Tool
**GHL** — pipeline stage: "Offer"

### Metric
- Offer rate (% of appointments that receive offer)
- Offer-to-contract conversion
- Gunner score on appointment calls (Kyle's grade)

---

## Stage 6: Negotiation

### What Happens
Seller counters or raises objections. Kyle holds the line using Todd's 5 communication techniques.

### Todd's 5 Communication Techniques

**1. Cushioning**
> "If it doesn't work out, that's totally okay. We want it to be a good fit for you."
*Purpose: Reduces pressure. Seller becomes less defensive.*

**2. Reversing**
Answer questions with questions.
> "What price were you thinking?" → "What's making that number important to you?"
*Purpose: Gets seller to justify their position, often softening it.*

**3. Truth Telling**
> "Look, to be honest, if getting top dollar is your priority, listing with an agent might get you more. The tradeoff is time and certainty. What matters more to you right now?"
*Purpose: Calling their bluff surfaces real motivation.*

**4. Stealth Mismatch**
Give the opposite of what they expect → they gravitate back toward you.
*Purpose: Breaks the push-pull dynamic.*

**5. Getting Commitments**
> "If we can come up to [X], can you sign by [date]?"
*Purpose: Small conditional commitments build momentum toward close.*

### The 5 Main Objections

| Objection | Strategy |
|-----------|----------|
| "I want more money" | Go back to pain. Timeline compression. Todd: double your target assignment fee. |
| "I need more time" | Surface the external deadline. "What happens if this isn't resolved by then?" |
| "I'm getting other offers" | "That's smart. What are you looking for that other offers aren't providing?" Find the gap. |
| "I don't know your company" | Reverse: "Why is that important to you?" → Match their concern with relevant proof. |
| "I need to think about it" | "What specifically needs more thought?" → Surface the real hidden objection. |

### Jerry Norton's 7 Seller Personas (Kyle Uses 3+ Per Call)
| Persona | Use When |
|---------|---------|
| 🔬 Analyst | Seller is data-driven — give comps |
| 💚 Affirmer | Seller is distressed — lead with empathy |
| ⚡ Challenger | Unrealistic expectations — "Help me understand how that works" |
| 😰 Worrier | Indecisive — "What happens if this isn't resolved before foreclosure?" |
| 🎓 Expert | Confused — "If I were in your shoes, here's what I'd do" |
| 😄 Comedian | Tension — humor to humanize |
| 🤷 Idiot | High anchor — "Help me understand. Maybe I'm missing something." |

### Who Owns It
**Kyle (AM)** | **Corey** escalated for stuck deals or creative structures

### Tool
**GHL** — notes updated after every contact

### Metric
- Negotiation-to-contract conversion
- Average negotiation rounds before contract
- Gunner score: objection handling (15% weight)

---

## Stage 7: Contract

### What Happens
Seller agrees to terms. Contract is executed. **The Friction Principle applies.**

### The Friction Principle (Todd Toback)
> "Don't celebrate. Slow it down. The worst thing is 'Let's do it!' Because later he thinks 'I could have got more.' Then his sister calls."

After the verbal yes:
1. **Confirm the terms slowly and clearly** — don't rush the paperwork
2. **Let the seller re-state their motivation** — gets them re-anchored on why they're selling
3. **Acknowledge the decision** — "This is a big step. I want to make sure you're comfortable."
4. **Execute contract promptly but calmly** — DocuSign or in-person
5. **Confirm close date, title company, next steps**

### Contract Components
- Purchase price
- As-is clause
- Inspection period (typically 7-14 days)
- Close date
- Earnest money deposit
- Assignment clause (allows wholesale assignment)

### Who Owns It
**Kyle (AM)** executes | **Corey** reviews deals above threshold

### Tool
**GHL** — pipeline stage: "Contract"

### Metric
- Contract-to-close ratio
- Average days from offer to contract
- Fall-through rate (contracts cancelled)

---

## Stage 8: Due Diligence

### What Happens
Between contract and close, verify the deal is actually what it appears to be.

### Due Diligence Checklist

**Title**
- Order title search through title company
- Verify seller has clear ownership authority
- Check for liens, encumbrances, unpaid taxes
- Confirm property is not in probate without proper executor authority

**Inspection / Condition Verification**
- Walk the property (if not already done)
- Estimate repair costs (ARV - repairs = max offer)
- Flag structural issues that could kill buyer interest
- Update condition notes in GHL

**Comps Verification**
- Pull last 3-6 months sales within 0.5 mile radius
- Confirm ARV used in offer calculation is still accurate
- Identify comp adjustments for condition, size, lot

**Seller Verification**
- Confirm all title holders are on contract
- Verify no court orders preventing sale (bankruptcy, divorce injunction)
- Confirm timeline is still intact — no last-minute changes

### Who Owns It
**Kyle (AM)** coordinates | **Corey** reviews deal math

### Tool
**GHL** — notes and task tracking | Title company (external)

### Metric
- DD completion rate within contract period
- Issues surfaced vs. issues that killed deals
- Average days in DD stage

---

## Stage 9: Assignment / Double Close

### What Happens
NAH transfers its contractual rights to the end buyer (investor/rehabber) for an assignment fee. Or, in cases where assignment is not possible/optimal, a double close is executed.

### Assignment (Standard)
1. NAH has property under contract at price X
2. End buyer agrees to purchase at price X + assignment fee
3. Assignment agreement executed with end buyer
4. End buyer closes with seller directly
5. NAH collects assignment fee at closing (typically $10K-$50K+)

### Double Close (When Needed)
- Seller or lender won't allow assignment
- Seller would be upset knowing the spread
- NAH closes on the property (A→B) then immediately sells to end buyer (B→C)
- Requires transactional funding (short-term)
- More complex but preserves deal and margin

### Who Owns It
**Esteban (Dispo)** drives the assignment side | **Kyle (AM)** maintains seller relationship through close

### Tool
**GHL** — pipeline stage: "Closed" | Title company coordinates both sides

### Metric
- Assignment fee per deal
- Days from contract to assignment agreement
- Double close rate vs. assignment rate

---

## Stage 10: Disposition

### What Happens
Finding the end buyer for the deal. Esteban's domain. This often starts during or before Stage 8 — Dispo and DD run in parallel.

### The Buyer Matching Process
1. **Blast to buyer list** — GHL broadcast or manual outreach to cash buyers who match property profile
2. **Screen buyer** — proof of funds, closed deals history, timeline flexibility
3. **Show property** — virtual walkthrough or in-person
4. **Set terms** — assignment fee, close date, AS-IS acknowledgment
5. **Execute assignment agreement**
6. **Coordinate with title for simultaneous close**

### Building & Maintaining the Buyer List
- Source: REIA events, Bigger Pockets, direct outreach, referrals from past buyers
- Segment by: buy box (zip code, price range, deal type), speed of close, proof of funds status
- Nurture: regular email/text with inventory, market intel
- Rule: Don't over-market to buyers — quality over quantity. One motivated buyer > 100 non-responsive ones.

### Fee Collection
- Assignment fee paid at closing via title company HUD statement
- Double close: NAH receives net proceeds from B→C close
- GHL updated with final revenue figure
- Jessica enters KPI data

### Who Owns It
**Esteban (Dispo)** | **Jessica** for KPI entry post-close

### Tool
**GHL** — pipeline stage: "Closed" | Batching/broadcasting buyer outreach

### Metric
- Days from contract to buyer assignment
- Assignment fee (revenue per deal)
- Buyer response rate
- Deals closed per month
- Revenue per month
- Cost per deal

---

## Pipeline Stage Summary

| GHL Stage | Owner | Key Action | Next Gate |
|-----------|-------|-----------|-----------|
| New Lead | LM | Make contact within 5min | First conversation |
| Contacted | LM | Qualify MTEQ | 🟢 = book apt |
| Apt Set | LM → AM | Confirm appointment | Show up |
| Offer | AM (Kyle) | Todd 10-step, offer LAST | Verbal yes |
| Contract | AM (Kyle) | Execute contract, friction principle | Signed docs |
| Due Diligence | AM + Dispo | Title, comps, inspection | Clean title, confirmed ARV |
| Closed | Dispo (Esteban) | Assign to buyer, collect fee | Wire received |
| DQ | LM | Mark dead, set drip | Auto-follow-up 90 days |

---

## Speed Benchmarks (Target)

| Stage | Target Time |
|-------|------------|
| New lead → first contact (inbound) | < 5 minutes |
| First contact → qualification decision | Same call |
| Qualified → appointment booked | Same or next day |
| Appointment → offer | Same call |
| Offer → contract | 24-48 hours |
| Contract → due diligence complete | 7 days |
| Contract → buyer assigned | 5-10 days |
| Contract → close | 14-21 days |

---

*Sources: Master Wholesale Playbook (Todd Toback, Chandler Saine, Tyson Smith, Steve Trang), NAH project context, motivated seller simulation*
