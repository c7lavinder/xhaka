# AM Assistant Bot

## Overview
Automates all post-appointment and post-offer-call tasks for Acquisition Managers: summarizes meetings, updates pipeline stages, creates follow-up tasks, and triggers contract generation/sending when deals are agreed.

## Trigger
- AM marks appointment as complete (via quick action)
- Or: Scheduled appointment time + 1 hour passes
- Or: Call recording ends (for offer calls)

---

## Agents

### 1. AM Coordinator
**Role:** Orchestrates post-appointment workflow

**Flow:**
```
Appointment/Call Completes
    ↓
Dispatch to Outcome Collector
    ↓
Receive outcome data
    ↓
Dispatch to Stage Router
    ↓
Dispatch to Task Creator
    ↓
If "Agreed" → Dispatch to Contract Trigger
    ↓
Compile summary → GHL notes
    ↓
Notify AM of completion
    ↓
If deal → Notify team (Corey, Dispo)
```

### 2. Outcome Collector
**Role:** Gathers appointment/call outcome data

**Collection Method:**
AM receives quick-action prompt after appointment:

```
How did it go at {{property_address}}?

1️⃣ Agreed - sending contract
2️⃣ Made offer - thinking about it
3️⃣ Made offer - countered
4️⃣ Made offer - rejected
5️⃣ Need more info / follow-up
6️⃣ No-show
7️⃣ Property issues (condition worse than expected)
8️⃣ Not a fit - disqualify

Reply with number, then I'll ask follow-up questions.
```

**Follow-up Questions by Outcome:**

**Agreed (1):**
- Contract price: $____
- Closing timeline: ____ days
- Earnest money: $____
- Any special terms?

**Made offer - thinking (2):**
- Offer amount: $____
- When will they decide?
- What's holding them back?

**Made offer - countered (3):**
- Our offer: $____
- Their counter: $____
- What's the gap issue?

**Made offer - rejected (4):**
- Our offer: $____
- Why rejected?
- Any path forward?

**Need more info (5):**
- What info needed?
- When following up?

**Property issues (7):**
- What's the issue?
- New ARV estimate?
- Still worth pursuing?

### 3. Stage Router
**Role:** Determines correct pipeline stage based on outcome

**Stage Logic:**

| Outcome | Next Stage |
|---------|------------|
| Agreed | Under Contract |
| Made offer - thinking | Made Offer |
| Made offer - countered | Made Offer |
| Made offer - rejected | Made Offer (or Follow-Up based on convo) |
| Need more info | Made Offer |
| No-show | Pending Apt (no-show protocol) |
| Property issues | Re-evaluate (LM task) |
| Not a fit | Disqualified / DNW |

**Actions:**
- Move opportunity to new stage
- Update opportunity value (contract price if agreed)
- Log stage change with reason
- Update tags

### 4. Task Creator
**Role:** Creates appropriate follow-up tasks

**Task Templates:**

| Outcome | Task | Due | Assigned |
|---------|------|-----|----------|
| Agreed | "Send contract to {{name}}" | Immediate | AM |
| Agreed | "Follow up on signed contract" | +24h | AM |
| Made offer - thinking | "Follow up on offer - {{name}}" | Decision date or +48h | AM |
| Made offer - countered | "Respond to counter - {{name}}" | +24h | AM |
| Made offer - rejected | "Re-approach or close out - {{name}}" | +72h | AM |
| Need more info | "Get {{info_needed}} for {{name}}" | As discussed | AM |
| Property issues | "Re-evaluate {{address}}" | +24h | LM |

### 5. Contract Trigger
**Role:** Initiates contract process when deal agreed

**Trigger:** Outcome = Agreed

**Actions:**
1. Gather contract data:
   - Seller name(s)
   - Property address
   - Contract price
   - Earnest money amount
   - Closing date
   - Special terms
   
2. Pass to Contract Bot (separate agent)

3. Log "Contract initiated" in notes

4. Create task: "Confirm contract sent"

5. Notify team:
   - Corey: "🎉 New deal! {{address}} - ${{price}}"
   - Dispo: "Heads up - new deal coming: {{address}}"

### 6. Summary Writer
**Role:** Writes comprehensive appointment summary

**Format:**
```
🏠 APPOINTMENT SUMMARY - {{date}}
AM: {{am_name}}
Property: {{property_address}}

OUTCOME: {{outcome}}

{{#if agreed}}
✅ DEAL AGREED
Contract Price: ${{contract_price}}
Earnest Money: ${{earnest_money}}
Closing: {{closing_days}} days
Special Terms: {{special_terms}}
{{/if}}

{{#if offer_made}}
💰 OFFER DETAILS
Our Offer: ${{our_offer}}
{{#if counter}}Their Counter: ${{counter}}{{/if}}
{{#if rejected}}Status: Rejected - {{rejection_reason}}{{/if}}
{{/if}}

PROPERTY CONDITION:
{{condition_notes}}

SELLER SENTIMENT:
{{sentiment}}

NEXT STEPS:
{{next_steps}}

→ Moved to: {{new_stage}}
→ Task created: {{task_description}}
{{#if contract_triggered}}→ Contract process initiated{{/if}}
```

---

## Quick-Action Interface

### Mobile-Friendly Input
AM gets SMS or app notification after appointment:

**Step 1: Outcome**
```
Appointment complete? Quick update for {{address}}:

1=Agreed 2=Thinking 3=Countered 4=Rejected 5=FollowUp 6=NoShow 7=Issues 8=DQ
```

**Step 2: Details (based on outcome)**
```
Got it - Agreed! 🎉

Contract details:
Price: (reply with amount)
```

```
Closing timeline? (reply: 30, 45, 60 days, or custom)
```

**Step 3: Confirmation**
```
Confirm deal details:
- Price: $185,000
- EMD: $2,500
- Close: 30 days

Reply YES to proceed, or EDIT to change.
```

---

## Offer Tracking

### Offer History
Each offer tracked in opportunity record:
- Offer date
- Offer amount
- Response (pending/accepted/countered/rejected)
- Counter amount (if applicable)
- Notes

### Multiple Offers
Support for negotiation back-and-forth:
- Log each offer/counter
- Track spread reduction over time
- Alert if negotiation stalls (no movement in 7 days)

---

## Integration Points

### Inputs
- GHL Calendar (appointment completion)
- AM quick-action responses
- Call recordings (for offer calls)
- Gunner transcript (if offer call recorded)

### Outputs
- GHL opportunity updates (stage, value)
- GHL contact notes (summary)
- GHL tasks (follow-ups)
- Contract Bot trigger
- Team notifications (Slack/SMS)

---

## Tenant Configuration

```json
{
  "amAssistant": {
    "enabled": true,
    "outcomeCollection": "sms_quick_action",
    "autoStageMove": true,
    "autoTaskCreate": true,
    "autoContractTrigger": true,
    "notifications": {
      "dealAgreed": {
        "notify": ["owner", "dispo_manager"],
        "channel": "sms"
      }
    },
    "stageMapping": {
      "agreed": "Under Contract",
      "madeOffer": "Made Offer",
      "noShow": "Pending Apt",
      "disqualified": "Not Closed"
    },
    "defaultEmd": 2500,
    "defaultClosingDays": 30
  }
}
```

---

## Error Handling

| Scenario | Action |
|----------|--------|
| No AM response after 2h | Reminder SMS |
| No AM response after 24h | Alert manager, create review task |
| Incomplete data | Prompt for missing fields |
| Contract trigger fails | Alert AM, create manual task |
| Stage move fails | Retry, alert on persistent failure |

---

## Success Metrics

- Post-appointment completion rate (target: >95%)
- Average time from appointment to update (target: <1h)
- Offer → Contract conversion rate
- Average negotiation rounds
- Contract trigger accuracy
- Time saved per appointment (target: 5-10 min)
