# GoHighLevel (GHL) — Deep Knowledge Overview

> **NAH Rule:** Xhaka has READ ONLY access. Never write, modify, or delete anything in GHL without explicit Corey approval.
> **Last Updated:** 2026-03-16

---

## What Is GHL?

GoHighLevel (GHL) is an all-in-one CRM and marketing automation platform originally built for marketing agencies. It has become the dominant CRM for wholesale real estate operators because it combines:

- **CRM + pipeline management** — track every lead from first contact to close
- **Multi-channel communication** — SMS, email, calls, voicemail drops, Facebook/Instagram DMs
- **Workflow automation** — trigger-based sequences that run without human input
- **Reporting & analytics** — conversion rates, pipeline velocity, agent activity
- **Power dialer** — built-in outbound calling with auto-dial capabilities

For wholesale RE, GHL replaces what used to require 4-5 separate tools (Podio, Follow Up Boss, CallFire, Mailchimp, etc.).

---

## NAH's GHL Account

- **Account:** New Again Houses Nashville
- **URL:** app.gohighlevel.com
- **Login:** xhakalavinder@gmail.com
- **Deep Understanding Doc:** [Google Doc — Deep understanding of NAH GHL](https://docs.google.com/document/d/1Mv5b0I6ra9jaxZKFpVwkRQf9gVfJ3dc0vyKiy70oTrM/edit)
- **OTP codes go to spam** — check spam for ghl.newagainhouses.com verification emails

---

## Acquisition Pipeline Stages (Wholesale RE)

The standard wholesale acquisition pipeline in GHL moves opportunities left-to-right through stages. NAH's pipeline maps to this model:

| Stage | What It Means | Action Required |
|-------|--------------|-----------------|
| **New Lead** | Raw inbound — form, PPL, voicemail, cold call | Assign to LM, start follow-up sequence |
| **Contacted** | LM has reached the seller by phone or text | Qualify: motivation, timeline, price |
| **Qualified** | Seller has real motivation + realistic expectations | Book appointment or get to offer |
| **Appointment Set** | Property walkthrough or virtual consult scheduled | Prep comps, repair estimates |
| **Offer Made** | Written or verbal offer extended to seller | Follow up daily until decision |
| **Under Contract** | Purchase agreement signed | Dispo kicks in — start buyer outreach |
| **Closed** | Deal funded | Mark Won, trigger review/referral workflow |
| **Dead** | No deal possible | Tag reason (price, no motivation, listed, etc.) |

**Best practice:** Never leave leads in limbo. Dead = Dead. Stale pipelines are lies.

---

## Smart Lists — Segmentation for Follow-Up

Smart Lists are dynamic contact segments that auto-update based on criteria you define. Think of them as saved filters that become a calling/texting list.

**How top operators use Smart Lists:**

- **"No Contact 7+ Days"** — leads sitting in Contacted stage with zero activity
- **"High Equity + Motivated"** — tagged leads that scored above threshold on qualifier
- **"Price Objection"** — leads who said price was the issue; revisit after 30 days
- **"Appointment No-Show"** — missed their walkthrough; needs re-engage sequence
- **"Under $150k ARV"** — micro-segment by deal size for targeted follow-up
- **"Voicemail Only"** — never answered, only left voicemails; try different time/channel

**Building a Smart List:**
1. Contacts → Smart Lists → Add Smart List
2. Define filter rules (tags, pipeline stage, last activity date, custom fields)
3. Save — list auto-populates and updates in real time
4. Assign to LM or attach to a workflow for automated outreach

---

## Automation Workflows — Trigger-Based Follow-Up

GHL Workflows are the engine of the whole system. Every trigger fires a sequence.

**Key triggers used in wholesale RE:**

| Trigger | Workflow Action |
|---------|----------------|
| New contact created (PPL lead) | Instant SMS: "Hi [FirstName], this is [LM] from New Again Houses. I saw you may be interested in selling your property at [Address]. Is that right?" |
| Contact replies to SMS | Alert LM via mobile app notification |
| Lead enters "Contacted" stage | Start 7-day nurture sequence (Day 1, 3, 7 SMS) |
| Appointment missed | Immediate text: "Hey we missed you — want to reschedule?" + LM task |
| Lead goes 14 days without contact | Tag "Dormant" + add to re-engagement Smart List |
| Deal closes (Won) | Trigger review request SMS 3 days after close |
| Contact tagged "Not Now" | Start 90-day drip (monthly check-in SMS) |

**Workflow anatomy:**
- **Trigger** (event) → **Wait** (delay) → **Action** (SMS/email/task/tag) → **Condition** (if replied / if not replied) → **Branch** accordingly

---

## Conversation View — How LMs Use It

The Conversation View is the LM's primary workspace. It shows a unified inbox of all communications with a contact:

- All SMS threads
- All emails  
- All call logs and recordings
- Notes
- Appointment history

**LM daily workflow in GHL:**
1. Open Smart List for today's follow-up contacts
2. Click into Conversation View for each contact
3. Review history — what was said last, what stage they're in
4. Make call via GHL Power Dialer or BatchDialer integration
5. Log disposition (called, left VM, no answer, callback, bad number)
6. Move pipeline stage if appropriate
7. Trigger next step (manual or automated)

**Key feature:** Two-way SMS within the conversation view. LMs can text directly and replies thread automatically.

---

## Power Dialer (GHL Native)

GHL has a built-in Power Dialer for outbound calling:

- Dials one number at a time, auto-advances to next
- Agent can hear ringing and connect instantly when answered
- Voicemail drop: pre-record a VM and drop it with one click when hitting voicemail
- Call recording: all calls recorded by default
- Call notes: log disposition right after hanging up
- Activity logged to contact record automatically

**Limitation:** GHL's native dialer is single-line only. For high-volume cold calling (1,000+ dials/day), teams use BatchDialer instead — which is multi-line predictive.

---

## SMS & Email Sequences for Motivated Sellers

**SMS best practices for motivated sellers:**
- First text must arrive within 5 minutes of lead entry (speed = conversion)
- Keep initial SMS under 160 characters — personal, not corporate
- Never use link shorteners in first message (spam filters)
- Personalize with first name and address when possible
- Best send times: Tuesday–Thursday, 8–11am and 4–6pm local
- Reply rate benchmark: 8-15% for cold SMS; 25%+ for warm leads

**Email sequences:**
- Less important for motivated sellers (they text, not email)
- Use for follow-up sequences on longer-cycle deals
- Subject line = "Your property at [Address]" performs well
- Keep body under 100 words for seller emails

**Voicemail drops:**
- Drop pre-recorded VM when no answer
- Script: first name, your name, company, one sentence of value, call to action
- Effective for PPL leads where seller already knows they requested info

---

## Reporting — Native GHL Metrics

GHL tracks these KPIs natively in the Reporting section:

| Metric | Where to Find |
|--------|--------------|
| Pipeline conversion rate (stage → stage) | Opportunities → Reports |
| Total pipeline value ($) | Opportunities → Pipeline View |
| Leads by source | Contacts → Reports → Source |
| SMS sent/delivered/replied | Conversations → Reports |
| Emails sent/opened/clicked | Email → Reports |
| Call volume + call duration | Calls → Reports |
| Agent activity (calls, tasks completed) | User Reports |
| Appointment show rate | Calendars → Reports |

**What GHL does NOT do natively well:**
- Dials-per-hour (use BatchDialer)
- Cold calling connect rates (use BatchDialer)
- Inbound call attribution by marketing channel (use CallRail)

---

## GHL + BatchDialer Integration

BatchDialer integrates with GHL via the official GHL marketplace integration:

1. In BatchDialer: Settings → Integrations → GoHighLevel
2. Connect via GHL OAuth (select sub-account)
3. Map BatchDialer disposition codes to GHL pipeline stages:
   - "Interested" → moves to Qualified stage
   - "Callback" → creates task + reminder in GHL
   - "Not Interested" → adds tag + pauses workflow
   - "Do Not Call" → adds DNC tag, stops all sequences
4. When a call ends in BatchDialer, contact record in GHL updates automatically
5. Call recording link posts to GHL contact notes

---

## GHL + BatchLeads Integration

BatchLeads (the SMS platform) also integrates with GHL:

- SMS campaigns sent from BatchLeads log back to GHL conversations
- Lead status can push to GHL pipeline
- BatchLeads API key: `06b81a7c-f69c-42c3-bc1f-c8ed55d01e1a`
- Used for outbound SMS blasting to cold lists

---

## Best Practices from Top Wholesale Operators

1. **Speed to lead is everything.** First response within 5 minutes vs 30 minutes can be 10x difference in contact rate. Automate Day 0 SMS.

2. **Dead leads are not dead — they're scheduled.** Every "not now" gets a 90-day re-engagement sequence. Markets shift. Motivation comes back.

3. **Pipelines are not filing cabinets.** If a lead hasn't moved in 21 days, it's either dormant or wrongly staged. Weekly pipeline audits.

4. **Smart Lists are the LM's daily to-do list.** Build: "Called Yesterday — No Answer", "Texted 3x — No Reply", "Callback Today". LMs work lists, not the whole database.

5. **Voicemail drop + text same session.** If no answer → drop VM + send text simultaneously. Double touch in one pass.

6. **Track source on every lead.** BatchLeads, Leadzolo, PropertyLeads, CallRail voicemails — tag source at entry. Report on cost-per-lead monthly.

7. **Never text a lead that said "stop."** GHL manages opt-outs but audit monthly. TCPA exposure is real.

8. **Recording review is part of LM accountability.** Kyle (AM) reviews call recordings in GHL + Gunner weekly. LMs know they're recorded.

---

## NAH-Specific Notes

- **LMs (Chris, Daniel)** — primary GHL users; work conversation view + follow-up sequences daily
- **Kyle (AM)** — reviews pipeline in Opportunities view; moves leads to Offer/Contract stages
- **Esteban (Dispo)** — works the Under Contract → Closed stage; buyer outreach
- **Jessica (Data Manager)** — KPI entry; pulls GHL reports for weekly numbers
- **Corey** — admin; owns all settings, workflows, pipeline config
- **Gunner integration** — GHL calls pull automatically into Gunner for AI coaching and grading
- **Xhaka** — READ ONLY access via xhakalavinder@gmail.com; never modify without Corey approval
