# Follow-Up Manager Bot — SPEC

## Purpose
Automatically manage leads in the Follow Up pipeline by analyzing conversations, reassessing motivation after each touchpoint, moving leads between follow-up buckets, generating conversation summaries, and creating specific follow-up tasks.

## Core Logic

### When It Runs
- **Trigger:** Any conversation event (call, SMS, email) with a contact who has an opportunity in the Follow Up pipeline
- **Frequency:** Real-time via conversation poller + daily sweep of Follow Up pipeline for stale leads

### Motivation Assessment
After every meaningful conversation with a follow-up lead, assess motivation on 5 factors:

| Factor | What to Look For |
|--------|-----------------|
| **Timeline** | "Ready now" vs "maybe next year" vs "no plans" |
| **Condition** | Property deteriorating? New damage? Vacancy? |
| **Price Flexibility** | Willing to discuss numbers? Anchored on unrealistic price? |
| **Life Circumstances** | Divorce, death, job loss, tax issues, relocation — any urgency driver |
| **Engagement Level** | Responsive? Asking questions? Or one-word brush-offs? |

Each factor scored 0-2:
- **0** = No signal / negative
- **1** = Some signal / neutral  
- **2** = Strong signal / positive

**Total Score → Bucket:**
| Score | Bucket | Meaning |
|-------|--------|---------|
| 7-10 | **Sales Process (Hot)** | Move back to active pipeline — this lead is ready |
| 4-6 | **1 Month Follow Up** | Warming up — check back soon |
| 2-3 | **4 Month Follow Up** | Not ready yet but not dead — seasonal check-in |
| 0-1 | **12 Month Follow Up** | Long-term nurture — annual touchpoint |

### Stage Movement Rules

**Upgrade (more motivated → shorter follow-up):**
- 12 Month → 4 Month: Responded positively, mentioned timeline, asked about offers
- 4 Month → 1 Month: Expressed interest, discussed price, mentioned urgency
- 1 Month → Sales Process: Ready to talk numbers, wants walkthrough, asking about process

**Downgrade (less motivated → longer follow-up):**
- 1 Month → 4 Month: "Not right now," vague timeline, unresponsive after initial response
- 4 Month → 12 Month: "Maybe next year," no urgency, firm on unrealistic price
- Any → Dead: Confirmed sold, confirmed not selling ever, wrong number, deceased

**Never auto-downgrade to Dead** — flag for review instead.

### Conversation Summary
After each conversation, generate and store:

```
📝 Follow-Up Summary — [Contact Name] — [Date]
Property: [Address]
Current Stage: [Stage] → Recommended: [New Stage]
Motivation Score: [X/10]

Key Points:
- [What they said about timeline]
- [What they said about price/condition]
- [Any life circumstance changes]

Sentiment: [Warming up / Cooling off / Unchanged / Ready]

Next Action: [Specific task with date]
```

**Storage:** Add as GHL contact note (tagged `#follow-up-summary`)

### Task Creation
Every conversation MUST result in a specific next action:

| Scenario | Task |
|----------|------|
| Lead warming up | "Call [Name] — discuss offer. Motivation increasing." Due: [3-5 days] |
| Lead mentioned timeline | "Call [Name] — they said [timeline]. Check in before then." Due: [2 days before their date] |
| Lead cooling off | "Text [Name] — light check-in, no pressure." Due: [based on new bucket] |
| Lead unresponsive | "Try [Name] again — different time of day." Due: [1 week] |
| Lead ready | "URGENT: [Name] ready to move. Schedule walkthrough." Due: [Today/Tomorrow] |

Tasks go to the **assigned LM** (owner of the contact).

### Daily Sweep
Once per day, scan all Follow Up opportunities:
1. **Stale leads** — No contact in 2x the bucket period (e.g., 2 months for 1-Month bucket)
   → Flag as "Overdue Follow-Up" with task to reach out
2. **Upcoming follow-ups** — Leads approaching their follow-up window
   → Create task for LM: "Time to check in with [Name]"
3. **Bucket validation** — Leads sitting in wrong bucket based on last conversation
   → Recommend stage move

## Data Sources
- **Conversations:** GHL conversation messages (SMS, calls via transcripts)
- **Pipeline:** Follow Up pipeline stages + opportunity data
- **Contact:** Source, history, notes, tags
- **Call transcripts:** If available from Gunner call grading

## DRY RUN Behavior
- Log all recommended stage moves with reasoning
- Log conversation summaries
- Log tasks that would be created
- Do NOT actually move stages, create notes, or create tasks until DRY_RUN=false

## Integration Points
- **Conversation poller** — triggers on new messages for Follow Up contacts
- **Pipeline poller** — detects manual stage changes (validate/override bot's recommendation)
- **Nurture engine** — coordinate with existing follow-up agent to avoid duplicate outreach
- **Gunner call grading** — use call transcripts + grades for richer motivation assessment

## Example: Lindsi Connors Scenario
1. Lindsi is PPL lead, had prior rejection
2. New PPL entry comes in → Daniel moves to "4 Month Follow Up"
3. **Without this bot:** Lead sits for 4 months, nobody checks motivation
4. **With this bot:** Bot sees thin conversation, flags it immediately. If someone does call:
   - Bot analyzes the call: "Lindsi mentioned roof damage since last contact, asking about our process"
   - Motivation score: 7/10 → **Move to Sales Process**
   - Task: "Call Lindsi — roof damage creating urgency. Discuss offer. Due: Tomorrow"
   - Summary note added to contact

## Pipeline Stage IDs
_To be auto-discovered from GHL on first run. Bot will map stage names to IDs dynamically._

## Priority
HIGH — directly impacts revenue recovery from follow-up pipeline (where deals go to die).
