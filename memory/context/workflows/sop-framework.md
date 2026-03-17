---
title: SOP Framework — Documenting and Automating Standard Operating Procedures
category: workflows
tags: [SOPs, automation, documentation, processes, wholesale, GHL, AI, operations]
last_updated: 2026-03-16
source: research synthesis
---

# SOP Framework — Documenting and Automating Standard Operating Procedures

This document defines how NAH documents, prioritizes, and automates SOPs. A written SOP is worth zero if it's not followed. An automated SOP is worth everything — it runs whether the person is available or not.

---

## 1. The SOP Structure

Every SOP at NAH follows this template:

```
---
SOP Name: [Short descriptive name]
Trigger: [What starts this process?]
Owner: [Who is responsible for execution?]
Frequency: [How often does this run?]
Last Updated: [Date]
Status: [Manual | Partially Automated | Fully Automated]
---

## Trigger
[Exact condition that starts this process. Must be specific and observable.]

## Steps
1. [Step 1 — who does what, what tool]
2. [Step 2...]
   ...

## Decision Points
- If [condition A] → [path A]
- If [condition B] → [path B]

## Output / Done State
[What does this look like when it's complete? What record is created?]

## Error Handling
[What do you do if something breaks or goes wrong?]

## Automation Status
- [ ] Trigger is automated
- [ ] Steps 1-N are automated
- [ ] Output logging is automated
- [ ] Errors are alerted
```

### Why This Structure

**Trigger:** Without a precise trigger, people don't know when to start. "When a lead comes in" is not a trigger. "When a GHL contact is created with source = BatchDialer" is a trigger.

**Owner:** One name. Never a team. "The LMs" own nothing — the process will fall through cracks.

**Decision Points:** Most SOPs fail at decision points. Document every fork explicitly — it's where judgment gets introduced and automation gets blocked.

**Done State:** Without this, you'll have half-done SOPs everywhere. "Done" means a specific record exists, a specific stage has changed, or a specific message was sent.

---

## 2. How to Identify Which SOPs to Build First

### The High-Frequency × High-Pain Matrix

Rate every candidate process on two dimensions:

**Frequency:** How often does this happen per week?
- Low: < 5x/week
- Medium: 5–20x/week
- High: 20+/week

**Pain:** How much does it cost when it's done wrong or not done?
- Low: Inconvenient but recoverable
- Medium: Costs time or a lead
- High: Costs a deal, creates legal risk, or damages a relationship

| | Low Pain | Medium Pain | High Pain |
|---|---|---|---|
| **High Frequency** | Automate (quick win) | Automate now | **Priority 1** |
| **Medium Frequency** | Document only | **Priority 2** | Automate |
| **Low Frequency** | Skip for now | Document only | **Priority 3** |

### NAH SOP Priority List

**Priority 1 (High Frequency + High Pain):**
1. Lead intake → GHL contact creation → initial follow-up trigger *(100+ leads/week, wrong handling loses deals)*
2. Appointment set → AM notification → calendar block *(daily, missed appointments cost contracts)*
3. Call completed → Gunner scoring → coaching flag *(daily, manual = nothing gets reviewed)*
4. Stage change → correct drip sequence start/stop *(constant, wrong sequence = harassment or silence)*

**Priority 2 (Medium Frequency + Medium-High Pain):**
5. Voicemail received → transcription → GHL update
6. PPL lead received → intake + duplicate check + assign
7. KPI pull → dashboard update *(daily manual = Jessica bottleneck)*
8. Seller re-engagement (30-day bucket check)

**Priority 3 (Lower Frequency or Lower Pain):**
9. JV deal routing → partner notification
10. Buyer matching for new contract
11. Dispute submission to PPL platforms
12. Monthly data cleanup (dead leads, wrong numbers)

---

## 3. SOP Documentation Examples — NAH Context

### SOP: Lead Intake (PPL Source)

**Trigger:** GHL webhook fires `form.submitted` from newagainhouses.com or PPL platform

**Owner:** System (automated) / LM on call (exception handling)

**Frequency:** Variable — 0–50 leads/day

**Steps:**
1. Receive webhook payload from GHL
2. Check for duplicate: Does a contact exist with this phone number or email?
   - If duplicate → merge or flag for LM review (do NOT create duplicate)
   - If new → proceed
3. Create GHL contact with source tag (Leadzolo / PropertyLeads / MotivatedSellers / Web Form)
4. Set first message flag: include company name (PPL = opted in)
5. Time check: Is it 9am–6pm in the lead's timezone?
   - Yes → Start intake SMS immediately
   - No → Queue for 9am send
6. Assign to LM (load balance: Chris if below quota, else Daniel)
7. Start PPL intake sequence in GHL
8. Log contact ID + source + timestamp in activity log

**Output / Done State:** GHL contact created, source tagged, sequence started, LM assigned, log entry created

**Error Handling:**
- Duplicate detected → alert LM, do not auto-merge
- Timezone lookup fails → default to CST, flag for review
- Sequence fails to start → alert Corey via Telegram

---

### SOP: Call Completed → Gunner Scoring

**Trigger:** GHL webhook `call.completed` OR BatchDialer call log sync

**Owner:** System (automated)

**Frequency:** 50–200 calls/day

**Steps:**
1. Receive call completed event
2. Confirm recording URL is available (wait up to 5 minutes if processing)
3. Push recording URL + rep ID + contact ID to Gunner API
4. Gunner processes and returns score
5. Store score in GHL custom field + Gunner DB
6. Check score against threshold:
   - Score < 45% → create coaching flag → Telegram alert to Corey
   - Score 45–65% → add to weekly coaching review queue
   - Score 65%+ → log normally, no action
7. Update rep's daily score average

**Output / Done State:** Score stored in GHL, rep dashboard updated, coaching flags created if applicable

---

### SOP: Stage Change → Drip Sequence Management

**Trigger:** GHL `opportunity.stageChange`

**Owner:** System (automated)

**Frequency:** High — every stage change for every lead

**Steps:**
1. Receive stage change event
2. Look up current active sequences for this contact
3. Stop any sequences that don't match the new stage
4. Start the correct sequence for the new stage:

| New Stage | Sequence to Start | Sequence to Stop |
|---|---|---|
| New Lead | Initial contact | None |
| Warm Lead | Warm nurture | Initial contact |
| Pending Appointment | Appointment confirmation | Nurture |
| Made Offer | Post-offer follow-up | All others |
| 1 Month Follow Up | 1mo drip | All others |
| 4 Month Follow Up | 4mo drip | All others |
| 12 Month Follow Up | 12mo drip | All others |
| Ghosted | Re-engage sequence | All others |
| Dead | STOP ALL | All sequences |

5. Log sequence change in contact activity

**Critical rule:** If `real_conversation = true` flag exists on contact → STOP before starting any sequence. Route to LM for manual follow-up only.

---

## 4. AI-Enhanced SOPs: Where AI Executes vs. Where Humans Approve

### The AI Execution Decision Framework

```
Can the decision be made from data alone?
  Yes → AI can execute (with logging)
  No  → AI recommends, human approves

Is the action reversible?
  Yes → AI can execute (log for audit)
  No  → Human approval required

What's the consequence of an error?
  Low → AI executes
  Medium → AI executes + human review within 24h
  High → Human approval before any action
```

### NAH SOP Matrix: AI vs. Human

| SOP Step | AI Executes | Human Approves | Notes |
|---|---|---|---|
| Lead deduplication check | ✅ | — | Pure data comparison |
| Source tagging | ✅ | — | Rules-based |
| Timezone detection | ✅ | — | API lookup |
| Send timing queue | ✅ | — | Rules-based |
| LM assignment | ✅ | — | Load-balance algorithm |
| Sequence start | ✅ | — | Rules-based, reversible |
| Sequence stop | ✅ | — | Rules-based, reversible |
| Lead score calculation | ✅ | — | Algorithm, not judgment |
| Move to Dead | — | ✅ (LM/Corey) | Irreversible, nuanced |
| Contract generation | — | ✅ (Kyle) | Legal document |
| JV partner assignment | — | ✅ (Esteban/Corey) | Financial consequence |
| PPL dispute filing | — | ✅ (Corey) | Financial, strategic |
| Offer amount determination | AI assists | ✅ (Kyle) | AI provides comps, human decides |
| Call coaching flags | ✅ | — | Informational, non-binding |

---

## 5. SOP Governance: Keeping SOPs Alive

The most common SOP failure: they're written once and never updated. Six months later, the team is following an outdated process while reality has moved on.

### The SOP Review Cycle

| Trigger | Action |
|---|---|
| Any SOP step fails in production | Update SOP within 24h |
| Team member reports friction | Review and update |
| New tool or integration added | Audit all SOPs touching that tool |
| Monthly review | Spot-check 3 random SOPs against actual practice |

### SOP Owner Accountability
The SOP owner is responsible for keeping it current. If the owner changes roles, SOP ownership transfers explicitly. No ownerless SOPs.

### Version Tracking
Each SOP has a `Last Updated` date. Any SOP older than 90 days with no update gets flagged for review — either it's so stable it's done (note that) or it's been neglected.

---

## 6. From Documentation to Automation — The Migration Path

Not every SOP becomes an automation on day one. The path:

**Step 1: Document it.** Write the SOP in plain language. Get the team to follow the manual version first. Discover the edge cases.

**Step 2: Standardize it.** After 2–4 weeks of manual execution, review what actually happened vs. what was documented. Update the SOP to reflect reality.

**Step 3: Instrument it.** Add data collection to the manual process. Track inputs, outputs, time spent. Build the measurement baseline.

**Step 4: Automate the easy parts.** Start with the trigger detection and logging. Even automating the "someone should know this happened" part saves time.

**Step 5: Automate the execution.** Move from notification → recommendation → execution as confidence builds.

**Step 6: Monitor and refine.** Every automation drifts from reality over time as the business changes. Set a calendar reminder to review each automation quarterly.

### The Danger of Premature Automation
Automating a broken process makes the broken process happen faster and more consistently. Always run the manual version long enough to find the real edge cases before automating.

---

## 7. The SOPs Worth Building This Quarter

Based on NAH's current state (March 2026), in priority order:

1. **Lead intake SOP** — formalize and automate PPL intake + cold lead intake. Jessica is the manual bottleneck. This frees her for higher-value work.

2. **Call → Gunner → coaching flag** — currently calls sit unreviewed for days. Automation routes them to coaching queue within hours.

3. **Drip sequence management** — partial automation exists. Complete it so stage changes reliably start/stop the right sequences.

4. **KPI aggregation** — Jessica manually pulls numbers from BatchDialer, BatchLeads, GHL. API + automation = daily dashboard without manual entry.

5. **Appointment confirmation** — when an appointment is set, automated confirmation SMS/email to seller + calendar invite to Kyle. Currently manual.

These five SOPs represent the highest-leverage automation opportunities for NAH in Q1-Q2 2026.
