# Gunner — Call History Page Redesign Spec

## Overview
The Call History page needs a redesign to support multiple call types (especially follow-up and offer calls), simplify navigation, and surface more useful information at a glance.

---

## 1. Call Types — Expand to 6

Currently only "Offer" and "Qualification" exist. Expand to:

| Call Type | Description | Scoring Rubric |
|-----------|-------------|----------------|
| **Cold Call** | First contact with a prospect | Lead Generator rubric (exists) |
| **Qualification** | Discovery/info gathering on a known lead | Lead Manager rubric (exists) |
| **Offer** | Presenting or negotiating numbers | Offer rubric (exists) |
| **Follow-Up** | Re-engagement, nurture, checking back in | Follow-Up rubric (NEW — see Section 6) |
| **Seller Callback** | Inbound — seller called us back, high intent | Seller Callback rubric (NEW — see Section 7) |
| **Admin Callback** | Outbound — calling about docs, scheduling, admin tasks | Admin Callback rubric (NEW — see Section 8) |

### Auto-Detection
- Manual call type selection during upload + AI-assisted suggestion from transcript content
- The AI can detect if it's a first contact vs. follow-up vs. offer negotiation vs. admin task from the conversation
- Allow manual override by admin if misclassified
- Pipeline-based auto-detection can be added later when CRM integration deepens

### Separate Scoring Rubrics
**This is critical.** Follow-up and offer calls skip qualification steps by design. Scoring them against the full qualification rubric punishes reps for doing the right thing (e.g., Daniel's 1:50 follow-up that successfully scheduled a walkthrough scored 19% because it "bypassed critical qualification steps").

Each call type maps to its own rubric. The system must route to the correct rubric based on call type.

### Scoring Philosophy
- **Score process, not conversion.** Calls that convert naturally score higher because motivated sellers let reps run the playbook. Adding outcome weight double-counts.
- **Track conversion as a standalone dashboard metric** — don't bake it into individual call scores.
- The interesting coaching moments are: high-scoring calls that didn't convert (seller wasn't ready), low-scoring calls that did (got lucky), and low-scoring calls with motivated sellers (dropped the ball).

---

## 2. Tabs — Simplify to 3

**Current (6 tabs):** Pending, Graded, Admin, Skipped, ✕ (0), 💬 (0)

**New (3 tabs):**

| Tab | Contents |
|-----|----------|
| **All Calls** | Default view. All graded calls, fully filterable. |
| **Needs Review** | Pending (ungraded) + admin-flagged scores. This is the action queue. |
| **Skipped** | Calls under 60 seconds, wrong numbers, voicemails, etc. |

- Remove the Admin tab — admin calls should be filtered out or tagged, not a separate view.
- Remove the mystery icon tabs (✕ and 💬) or fold their function into filters.

---

## 3. Filters — Add Missing Options

**Current filters:** Team Member, Call Type, Score, Direction

**Add:**
- **Date Range** — essential, currently missing entirely. Default to "Last 7 days."
- **Lead Stage** — filter by pipeline stage (e.g., "show me all offer calls on Hot leads this week")
- **Outcome** — filter by call outcome tag (see below)

Keep existing filters: Team Member, Call Type (updated to 6 types), Score, Direction ✅

**Pagination:** 25 calls per page with lazy loading. A week of calls across multiple agents can be 350+ cards — must stay snappy.

---

## 4. Call Card Redesign

### Current Card Layout:
```
Name          [Outbound] [Offer]                    Score
👤 Rep   ⏱ Duration   📞 Time ago                   79%
Call Summary: ...
```

### New Card Layout:
```
Name   [Property Address]   [Outbound] [Follow-Up]    Score
👤 Rep   ⏱ Duration   📞 Time ago   [Appt Set]        79%
Call Summary: ...
```

### Changes:
1. **Property Address** — Add as a tag/pill next to the contact name. In real estate, the property matters as much as the person. Reps and admins should see the address at a glance without clicking into the call. (Already stored from BatchDialer data — just surface it.)

2. **Outcome Tag** — Small colored tag next to the score. AI-extracted from transcript during grading, with manual admin override. Shows what happened on the call:
   - 🟢 **Appt Set** — appointment scheduled
   - 🟢 **Offer Made** — offer presented
   - 🟢 **Callback Scheduled** — agreed to call back
   - 🟡 **Interested** — engaged but no commitment
   - 🟡 **Left VM** — voicemail left
   - 🔴 **No Answer** — didn't pick up
   - 🔴 **Not Interested** — dead lead
   - 🔴 **Dead** — wrong number, disconnected, etc.

   Score = HOW the rep performed. Outcome = WHAT happened. Both visible at a glance.

---

## 5. Summary of UI Changes

| Change | Why |
|--------|-----|
| 6 call types with separate rubrics | Stop penalizing follow-up/offer/callback calls for skipping qualification steps |
| 3 tabs instead of 6 | Cleaner navigation, clear action queue |
| Date range + lead stage + outcome filters | Find the calls that matter fast |
| Pagination (25/page) | Performance with high call volume |
| Property address on card | This is real estate — the property is the deal |
| Outcome tag on card | See what happened without reading the summary |

---

## 6. NEW RUBRIC — Follow-Up Calls

**Purpose:** Re-engagement calls where the lead went cold, said "call me later," or needs nurturing. Full qualification already happened — this is about restarting the conversation and advancing the deal.

**Based on the NAH Follow-Up Script (LMs).**

| # | Criteria | Weight | What to Score |
|---|----------|--------|---------------|
| 1 | **Referenced previous conversation + property** | 10% | Mentioned date of last call, address, what was discussed. Shows the seller they're not just another number. |
| 2 | **Anchored the previous offer** | 15% | "We put an offer on the table at $X." Most reps skip this and dance around price. Script leads with it deliberately. |
| 3 | **Re-confirmed decision maker** | 10% | "Is it still just you making the call, or is anyone else involved?" Deals die when you're talking to the wrong person on follow-up. |
| 4 | **Re-qualified motivation/timeline** | 15% | "You mentioned [motivation]. Is that still the situation? Has anything changed?" Not full re-qualification — just checking for shifts. |
| 5 | **Surfaced roadblocks** | 15% | "What's been the biggest thing holding you back?" Then PAUSED and let them speak. The pause is critical — score whether the rep fills silence or lets the seller process. |
| 6 | **Pushed for a decision** | 20% | The reality check close — "Is that a yes or a no for you today?" Binary by design. Score whether the rep actually asked for the decision, not just "set a next step." |
| 7 | **Handled objection / set concrete next step** | 15% | If no → "What would need to change for this to make sense?" If not ready → "When I check back in, what should I come prepared with?" Must be specific, not vague. |

**Critical Failures (cap score at 50% max):**
- Never referenced the previous offer amount
- Never asked for a decision
- Talked through the seller's silence after the roadblock question
- Didn't identify/confirm who the decision maker is

**Talk Ratio Target:** Seller should talk ≥50% of the time. Rep who fills silence kills the deal.

---

## 7. NEW RUBRIC — Seller Callback

**Purpose:** Inbound calls where the seller called YOU back. This is a high-intent signal — they're ready to talk, have questions, or want to move. The goal is to capitalize on their momentum and lock down next steps.

| # | Criteria | Weight | What to Score |
|---|----------|--------|---------------|
| 1 | **Acknowledged they called back** | 10% | "Thanks for calling back" or "Glad you reached out." Don't treat it like a cold call. |
| 2 | **Asked what prompted the callback** | 15% | "What made you reach out?" Reveals their current headspace — got another offer? Ready to move? Just had questions? Huge intel. |
| 3 | **Matched energy to their intent** | 10% | If they're ready to go, don't slow them down with a full qualification script. If they have questions, answer them. Read the room. |
| 4 | **Filled gaps in info** | 15% | They called back, but you might still be missing property details, timeline, price expectations. Get what you need without interrogating. |
| 5 | **Moved toward commitment** | 20% | Appointment, offer, walkthrough, contract. They called YOU — the momentum is there. Don't waste it. |
| 6 | **Handled their specific questions/concerns** | 15% | They usually call back with something specific on their mind. Did the rep address it directly? |
| 7 | **Set firm next step with timeline** | 10% | Not "we'll be in touch." A date, a time, a specific action. |
| 8 | **Talk ratio — seller talks more** | 5% | They called for a reason. Let them tell you what it is. |

**Critical Failures (cap score at 50% max):**
- Ran a full cold call script on someone who called back
- Didn't ask why they're calling
- Let them hang up without a next step

**Talk Ratio Target:** Seller should talk ≥60%. They called for a reason — let them talk.

---

## 8. NEW RUBRIC — Admin Callback

**Purpose:** Operational calls about documents, scheduling, closing details, title info, walkthrough times. These are NOT sales calls — they're task execution. Scored on a simple checklist.

| # | Criteria | Weight | What to Score |
|---|----------|--------|---------------|
| 1 | **Stated purpose of call clearly** | 20% | Got to the point — "I'm calling about [specific thing]." |
| 2 | **Got the info/action needed** | 30% | Did the call accomplish its objective? Did they get the document, answer, confirmation, or scheduling done? |
| 3 | **Confirmed next step + timeline** | 25% | Clear on what happens next and when. "We'll have the contract over by Thursday" not "we'll send it soon." |
| 4 | **Professional tone** | 10% | Courteous, clear, not rushed or dismissive. |
| 5 | **Kept it tight** | 15% | Didn't ramble, go off-topic, or waste the seller's time. Admin calls should be efficient. |

**No critical failures** — these are low-stakes calls. Just grade whether the task got handled.

**Note:** Admin Callback scores should be tracked but can be excluded from the main leaderboard rankings since they're not sales performance. Track them separately or weight them lower in overall rep scores.

---

## 9. Implementation Priority

1. **Multi-rubric infrastructure** — schema, routing, call type selection UI (build this first)
2. **UI changes** — simplified tabs, new filters, card redesign with property address
3. **Follow-Up + Seller Callback + Admin Callback rubrics** — plug into the infrastructure
4. **Outcome tags** — AI-extracted with manual override (last, since it's additive)

---

*Spec complete. All 3 new rubrics defined. Existing rubrics (Cold Call/Lead Generator, Qualification/Lead Manager, Offer) remain unchanged.*
