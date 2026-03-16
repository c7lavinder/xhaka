---
title: Growth Frameworks — Scaling Gunner & NAH
category: concepts
tags: [growth, aarrr, flywheel, network-effects, theory-of-constraints, compounding, gunner, nah]
last_updated: 2026-03-16
source: research synthesis
importance: 4
---

# Growth Frameworks — Scaling Gunner & NAH

Growth isn't a tactic. It's a system. The operators who scale aren't doing more things — they're doing fewer things that compound. This file covers the frameworks that separate linear grinders from exponential builders, with direct application to scaling NAH and getting Gunner to 100 customers.

---

## 1. AARRR — The Pirate Metrics Framework

Dave McClure's AARRR framework breaks growth into five measurable levers. Most operators obsess over Acquisition and ignore Retention. That's why they're always on a treadmill.

```
Acquisition → Activation → Retention → Revenue → Referral
```

Each stage has a conversion rate. Growth comes from improving any rate at any stage — but the upstream you fix a leak, the more every downstream improvement is worth.

### AARRR Applied to Gunner

**Acquisition** — How do potential customers first find Gunner?
- Current: Direct outreach by Corey, word of mouth within wholesale RE networks
- Metric to track: Leads generated per week, source-tagged
- Bottleneck signal: Pipeline is thin / Corey is the only one doing outreach
- Fix: Systematize outreach (templated DMs, mastermind talks), add referral incentives

**Activation** — Do new customers reach the "aha moment" quickly?
- Aha moment for Gunner: First graded call appears in the dashboard. The operator sees their LM's score and immediately understands the value.
- Metric: % of new accounts that see a graded call within 72 hours of signup
- Bottleneck signal: Accounts sign up but never connect GHL / never see a grade
- Fix: White-glove onboarding call, in-app prompts, integration wizard

**Retention** — Do customers stay?
- Monthly/Annual churn rate
- Engagement metric: Weekly active operators (viewing dashboards, reviewing scores)
- Bottleneck signal: 60-day churn, customers saying "we just didn't end up using it"
- Fix: Weekly email digest with team call summary. Make the product come to you, not the other way around.

**Revenue** — Are customers paying appropriately?
- MRR, ARPU, expansion revenue (upsells from starter → pro)
- Bottleneck signal: Low ARPU despite good retention — underpriced or not upselling
- Fix: Annual plan promotion, tiered feature gating that creates natural upgrade pressure

**Referral** — Are customers bringing others?
- Viral coefficient: # of new customers generated per existing customer
- Metric: Track referral source on every new signup
- Bottleneck signal: Happy customers but zero inbound referrals
- Fix: Explicit referral program ("Get 2 months free for every operator you bring on")

**The key insight:** If retention is broken, fixing acquisition is throwing money into a leaky bucket. Sequence matters: fix activation and retention before scaling acquisition.

### AARRR Applied to NAH

NAH's AARRR looks different but the logic is identical:

| Stage | NAH Version | Key Metric |
|-------|-------------|------------|
| Acquisition | Motivated sellers hear about NAH | Leads/week by source |
| Activation | Seller picks up the phone / responds to outreach | Contact rate |
| Retention | Seller stays engaged through follow-up sequence | % of leads followed up 5+ times |
| Revenue | Seller accepts an offer | Close rate / deal margin |
| Referral | Seller refers neighbor, family member | % of deals sourced from referral |

NAH's biggest AARRR lever is likely **Activation** (contact rate) and **Retention** (follow-up persistence). Most wholesale operations abandon leads after 2–3 touches. The data consistently shows that deals close at touch 5–12. Fixing persistence is free growth.

---

## 2. Flywheel vs. Funnel Thinking

A funnel is linear: leads go in, some convert, the rest are lost. Each cycle starts over.

A flywheel is circular: each cycle adds momentum to the next. Growth compounds.

### The Funnel Problem

Funnels require constant inputs to generate constant outputs. If you stop pouring leads in, the funnel empties. This is the treadmill problem: every week needs to be re-run from scratch.

### The Flywheel Model

Jeff Bezos famously sketched the Amazon flywheel on a napkin:
- Lower prices → More customers → More volume → More seller selection → Lower prices

Each element in the loop reinforces every other element. The flywheel gets harder to stop the longer it runs.

### Building Gunner's Flywheel

The potential Gunner flywheel:
1. More wholesale operators use Gunner → More real call data
2. More data → Better AI grading models → Better insights
3. Better insights → Better coaching outcomes → Operators close more deals
4. Operators close more deals → They share results at masterminds
5. Sharing at masterminds → More operators try Gunner → Step 1

The key driver that makes this a flywheel (not a funnel): the **data moat**. Every call that gets graded trains Gunner's models. A competitor starting today has zero data. Gunner with 100 customers processing 10,000+ calls has training data that can't be replicated quickly.

**The flywheel implication:** Early customers are more valuable than the revenue they pay. They're feeding the data flywheel. Treat them accordingly — give early customers premium access, co-create features with them, turn them into advocates. Their engagement compounds.

### NAH's Flywheel

NAH doesn't have a pure flywheel today, but one exists in the referral channel:
1. Close deal with motivated seller → Deliver exceptional experience
2. Exceptional experience → Seller refers network
3. Referral network → Higher-quality leads (pre-sold on the concept)
4. Higher-quality leads → Higher close rates → More deals
5. More deals → More satisfied sellers in the market → More referrals

The activation cost of a referred lead is dramatically lower than a cold PPL lead. Building this flywheel requires systematically asking for referrals at closing and making the ask easy.

---

## 3. Network Effects Taxonomy

Network effects are the most powerful growth mechanism in software. The more users in a network, the more valuable it is to every user. This creates a compounding moat.

**Four types of network effects:**

### Direct (Same-Side) Network Effects
More users of the same type make the product more valuable to all users.
- *Example:* WhatsApp — more contacts on WhatsApp makes WhatsApp more useful.
- *Gunner relevance:* Limited. The operator's experience doesn't improve because more operators are on the platform (yet).

### Indirect (Cross-Side) Network Effects
More users on one side make the product more valuable to users on the other side.
- *Example:* Uber — more drivers makes it better for riders; more riders makes it better for drivers.
- *Gunner relevance:* Potential in a marketplace model. If Gunner adds a "hire a verified call coach" feature, more operators attract more coaches; more coaches attract more operators.

### Data Network Effects
More users generate more data, which improves the product for all users.
- *Example:* Waze — more drivers reporting conditions makes routing better for everyone.
- *Gunner relevance:* **This is Gunner's primary network effect.** Every call graded improves the AI model. Every wholesale-specific objection phrase that's categorized makes the grading more accurate. Operators with 100,000 calls in the system get better AI than operators with 10,000.

### Platform Network Effects
A platform creates value by enabling interactions between parties.
- *Example:* App Store — developers and users make each other more valuable.
- *Gunner relevance:* Future state if Gunner opens APIs for third-party integrations or enables coach-to-operator connections.

**Strategic implication:** Gunner should lean into the data network effect. Every product decision that gets more real calls into the system faster builds the moat. This means: make integration easy, make grading fast, give operators a reason to route all their calls through Gunner (not just some).

---

## 4. Compounding vs. Linear Growth Mechanisms

Linear growth: effort in = proportional output out. Hire more people, make more calls, close more deals. Works, but doesn't scale without proportional resource addition.

Compounding growth: effort creates assets that generate future returns without proportional ongoing effort.

**Compounding assets:**
- Content that ranks in search (each piece works forever)
- Customer referral systems (each customer creates future customers)
- Data models that improve with usage (each call makes grading better)
- Brand reputation in a community (compounds with every satisfied customer)
- Playbooks and processes that enable delegation (one-time build, infinite leverage)

**The compounding test:** Ask about any growth activity — "If we stop doing this for 6 months, does the benefit disappear?" If yes, it's linear. If assets remain, it may compound.

### For Gunner:
- Outbound DMs to operators: linear (stop doing it, pipeline dries up)
- Building a case study library: compounding (each case study works forever)
- Developing the GHL integration (reduces churn by reducing friction): compounding
- Creating a Gunner-specific call framework for wholesale RE: compounding (becomes the industry standard)
- Speaking at masterminds: mixed (relationship compounds, each event is linear effort)

### For NAH:
- Cold calling lists: linear
- Building referral relationships with closing attorneys/title companies: compounding
- Systematizing follow-up sequences so no lead is ever dropped: compounding
- Documenting market-specific deal comps and buyer preferences: compounding

**Priority shift implication:** At current scale, Corey must invest in compounding assets even when they don't generate immediate returns. A well-documented playbook built today means delegation is possible in 6 months. Without it, delegation is impossible — which is a growth ceiling.

---

## 5. The ONE Channel Rule

From the Wholesale Playbook: **pick one channel, squeeze it dry before adding another.**

This principle sounds obvious. It's almost universally violated.

Why operators violate it:
- New channels feel like opportunity
- When current channel has friction, a new channel looks easier (it isn't)
- Lack of process discipline

Why it matters:
- Channel mastery requires reps. The 1,000th cold call is dramatically better than the 10th.
- Each channel has second and third-order levers that only appear with deep experience.
- Split attention means you never fully unlock any channel's potential.
- Diagnostic feedback loops break when you're running multiple channels simultaneously (which channel drove this result?)

### Applying ONE Channel to Gunner

**Current phase:** Direct personal outreach by Corey to wholesale operators he knows or can reach.

This is the right channel for Phase 1. It generates feedback, closes first customers, and builds case studies. Don't add channels yet.

**Channel graduation criteria (when to add a second channel):**
- Current channel is producing at least 5 new qualified leads/month consistently
- Conversion rate from lead to close is understood and stable
- There's documented evidence that the current channel is saturating (reaching the same people repeatedly, response rates declining)

**Likely second channel for Gunner:** Mastermind event appearances. High leverage, high trust, reaches operators in buying mode.

### Applying ONE Channel to NAH

NAH is further along and likely runs multiple channels (PPL, BatchDialer, direct mail). The ONE channel rule at NAH's stage means: **don't add new channels; double down on the best-performing existing one.**

Audit current channels quarterly:
- Cost per lead by channel
- Close rate by channel
- Deal margin by channel (PPL leads may close more but at lower margin)

Ruthlessly cut underperforming channels. Every dollar moved from a 2% channel to a 5% channel is 2.5× growth with zero new work.

---

## 6. Theory of Constraints Applied to Growth

Eli Goldratt's Theory of Constraints (TOC) applied to growth: **every system has one binding constraint. Fix that, and growth accelerates. Fix anything else, and growth doesn't change.**

**The Five Focusing Steps:**
1. **Identify** the constraint (the weakest link in the growth chain)
2. **Exploit** the constraint (maximize throughput at the constraint with current resources)
3. **Subordinate** everything else to the constraint (don't optimize non-constraints)
4. **Elevate** the constraint (invest to expand capacity at the constraint)
5. **Repeat** (as soon as the constraint moves, the bottleneck is now somewhere else)

### Finding Gunner's Growth Constraint

Map the growth chain:
`Awareness → Demos → Pilots → Paid Customers → Retained Customers → Referrals`

Constraint diagnostic questions:
- Is the pipeline full of demos but few convert? → Constraint is at Demo → Pilot conversion (likely: product setup friction or unclear value prop)
- Are pilots converting but churn is high? → Constraint is at Pilot → Retained (likely: activation failure, customers not seeing value fast enough)
- Are customers retained but no referrals? → Constraint is at Referral (likely: no formal referral program, operators don't know to refer)
- Is the pipeline thin from the start? → Constraint is at Awareness (likely: too few people know Gunner exists)

**At Gunner's current early stage, the constraint is almost certainly Awareness.** Not enough qualified operators know the product exists. This makes acquisition the right place to focus — not feature development, not pricing optimization, not retention programs. Build the pipeline first.

**For NAH:** The constraint is likely one of three things:
1. **Lead volume** (not enough motivated sellers entering the funnel)
2. **Contact rate** (enough leads but can't reach them)
3. **Close rate** (reaching them but not converting)

Identify which one. Build the entire team's activity around resolving that specific constraint. Don't celebrate higher dial volume if close rate is the constraint.

---

## 7. Growth Equation Summary

Combining all frameworks into a practical decision filter:

**Before any growth activity, ask:**
1. Which AARRR stage does this improve?
2. Does this build flywheel momentum or just fill the funnel?
3. Is this compounding or linear?
4. Is this the ONE channel we're squeezing?
5. Does this address the active constraint, or am I optimizing a non-constraint?

If an activity fails questions 3, 4, and 5 simultaneously — it's probably busy work dressed up as growth.

**The 100-customer Gunner path:**
1. Constraint: Awareness → Fix: Direct outreach + mastermind appearances
2. Constraint shifts to Activation → Fix: Onboarding flow, GHL integration wizard
3. Constraint shifts to Retention → Fix: Weekly digest email, engagement nudges, success reviews
4. Flywheel begins: Data improves grading → Better outcomes → More referrals → More data

Growth isn't mysterious. It's methodical. Pick the constraint, fix it, move to the next one.
