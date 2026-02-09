# LM Assistant Bot

## Overview
Automates all post-call tasks for Lead Managers: summarizes calls, updates pipeline stages, creates follow-up tasks, and schedules appointments.

## Trigger
- Call ends (detected via GHL call log or Gunner call completion)
- Call recording available for processing

---

## Agents

### 1. LM Coordinator
**Role:** Orchestrates post-call workflow

**Flow:**
```
Call Ends
    ↓
Wait for recording (max 5 min)
    ↓
Dispatch to Call Analyzer
    ↓
Receive analysis
    ↓
Dispatch to Stage Router
    ↓
Dispatch to Task Creator
    ↓
Dispatch to Appointment Scheduler (if qualified)
    ↓
Compile summary → GHL notes
    ↓
Notify LM of completion
```

### 2. Call Analyzer
**Role:** Analyzes call recording/transcript to extract key information

**Extracts (CRITICAL — must capture all):**

| Category | What to capture |
|----------|-----------------|
| **Motivation** | Why selling? (inherited, divorce, tired landlord, foreclosure, relocating, etc.) |
| **Decision makers** | Who's on title? Who else needs to approve? (spouse, sibling, attorney) |
| **Roadblocks** | What could kill the deal? (unrealistic price, needs to talk to someone, emotional attachment, tenant issues) |
| **Call outcome** | Connected, VM, no answer, hostile, callback scheduled |
| **Price discussed** | Seller's ask, anchor we gave, gap |
| **Timeline** | How fast do they need to sell? |
| **Property condition** | What they said about repairs, vacancy, tenant status |
| **Next steps** | What was agreed — callback date, appointment set, info to send |
| **Seller sentiment** | Cooperative, hesitant, hostile, motivated |

**Uses:**
- Gunner transcript (if available)
- Gunner call grade (if available)
- Raw audio analysis (if needed)

**Output:**
```json
{
  "outcome": "connected",
  "duration": "8:32",
  "sentiment": "cooperative",
  "motivation": "strong",
  "motivationReason": "inherited, wants to sell fast",
  "timeline": "30 days",
  "askingPrice": 185000,
  "anchorGiven": 150000,
  "condition": "needs roof, HVAC, cosmetic updates",
  "decisionMakers": ["John Smith", "Mary Smith (sister)"],
  "objections": ["price too low", "needs to talk to sister"],
  "nextSteps": "call back Thursday after talking to sister",
  "appointmentSet": false,
  "qualificationScore": "HOT"
}
```

### 3. Stage Router
**Role:** Determines correct pipeline stage based on call outcome

**Stage Logic:**

| Outcome | Motivation | Next Stage |
|---------|-----------|------------|
| Appointment set | Any | Walkthrough Scheduled |
| Qualified, callback scheduled | Strong | Hot Leads |
| Qualified, callback scheduled | Moderate | Warm Leads |
| Needs follow-up | Weak | 4 Month Follow Up |
| Not interested | None | 1 Year Follow Up |
| Wrong number / disconnected | N/A | Trash |
| Already listed | N/A | Not Closed |
| No answer (1st attempt) | Unknown | Working Lead |
| No answer (3+ attempts) | Unknown | Ghosted |
| Hostile/DNW | N/A | DNW (Do Not Work) |

**Actions:**
- Move opportunity to new stage
- Update contact tags
- Log stage change reason

### 4. Task Creator
**Role:** Creates appropriate follow-up tasks based on call outcome

**Task Templates:**

| Outcome | Task | Due |
|---------|------|-----|
| Callback scheduled | "Call [Name] - [Reason]" | Scheduled date |
| Appointment set | "Confirm apt with [Name]" | 24h before apt |
| No answer | "Attempt #X - [Name]" | Next business day |
| Needs sister approval | "Follow up - waiting on sister" | Date discussed |
| Sent info | "Follow up on info sent" | 2 days |
| Left voicemail | "Follow up VM - [Name]" | Next day |

**Assigns to:** Same LM who made the call

### 5. Appointment Scheduler
**Role:** Books appointments on calendar when qualified

**Trigger:** Call Analyzer indicates appointment set = true

**Actions:**
1. Check AM (Kyle) calendar availability
2. Book appointment slot
3. Create GHL calendar event with:
   - Seller name & phone
   - Property address
   - Call summary
   - Key motivations
   - Price expectations
4. Send confirmation SMS to seller
5. Notify AM of new appointment

**Appointment SMS Template:**
```
Hi [First Name], this is [Company]. Confirming your appointment:

📅 [Date] at [Time]
📍 [Property Address]

[AM Name] will meet you there. Reply YES to confirm or call us to reschedule.
```

### 6. Summary Writer
**Role:** Writes human-readable call summary for GHL notes

**Format:**
```
📞 CALL SUMMARY - [Date] [Time]
LM: [Rep Name] | Duration: [X:XX]
Gunner Score: [Grade]

OUTCOME: [Connected/VM/No Answer]
MOTIVATION: [Strong/Moderate/Weak] - [Reason]
TIMELINE: [X days/months]

PRICE DISCUSSION:
- Seller asking: $[X]
- We anchored: $[X]
- Gap: $[X]

PROPERTY NOTES:
[Condition notes from call]

DECISION MAKERS:
- [Name 1] (on call)
- [Name 2] (needs to consult)

OBJECTIONS:
- [Objection 1]
- [Objection 2]

NEXT STEPS:
[What was agreed]

→ Moved to: [Stage]
→ Task created: [Task description] (due [date])
→ Appointment: [Yes - Date/Time] or [No]
```

---

## Integration Points

### Inputs
- GHL call logs (trigger)
- Gunner call transcript
- Gunner call grade
- GHL contact record
- GHL calendar (for scheduling)

### Outputs
- GHL contact notes (summary)
- GHL opportunity stage update
- GHL task creation
- GHL calendar event
- SMS to seller (appointment confirmation)
- Notification to LM (completion)
- Notification to AM (new appointment)

---

## Tenant Configuration

```json
{
  "lmAssistant": {
    "enabled": true,
    "autoStageMove": true,
    "autoTaskCreate": true,
    "autoAppointmentBook": true,
    "appointmentConfirmationSms": true,
    "notifyAmOnAppointment": true,
    "stageMapping": {
      "appointmentSet": "Walkthrough Scheduled",
      "hotCallback": "Hot Leads",
      "warmCallback": "Warm Leads",
      "fourMonthFollowUp": "4 Month",
      "oneYearFollowUp": "1 Year",
      "trash": "Trash",
      "ghosted": "Ghosted",
      "dnw": "DNW"
    },
    "assignedAm": "Kyle Barks",
    "calendarId": "[GHL Calendar ID]"
  }
}
```

---

## Error Handling

| Scenario | Action |
|----------|--------|
| Recording not available | Wait 5 min, retry, then process without (use call log data only) |
| Transcript unclear | Flag for manual review, create generic follow-up task |
| Calendar conflict | Suggest next available slot, alert LM |
| Stage move fails | Retry, alert on failure |
| SMS send fails | Log error, create manual task to confirm |

---

## Success Metrics

- Post-call processing time (target: <2 min)
- Stage accuracy (spot-check vs manual)
- Task completion rate
- Appointment show rate
- LM time saved per call (target: 3-5 min)
