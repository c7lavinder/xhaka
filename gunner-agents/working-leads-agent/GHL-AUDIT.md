# Working Leads GHL Audit — Feb 16, 2026

## What Exists in GHL

### New Lead Automation Folder (Acquisitions)
| Workflow | Status | Enrolled | What It Does |
|----------|--------|----------|-------------|
| New Lead - Entry Point | Published | 7,082 | Trigger: Pipeline Stage → New Lead. Assigns user, creates task, notifies team |
| Warm Leads | Published | 4,494 | Trigger: Pipeline Stage → Warm. Tags, conditions on source (texts vs other), assigns user, creates task |
| Hot Leads | Published | 2,670 | Trigger: Pipeline Stage → Hot. Similar pattern |
| New Follow Up Lead | Published | 11 | New, minimal enrollment |
| New JV Lead | Published | 23 | JV-specific |

### Warm Leads Workflow Detail
1. **Trigger:** Pipeline Stage Changed (to Warm)
2. **Add Tag** (warm tag)
3. **Condition:** Source = "texts" + 1 other → Branch A | None → Branch B
4. Both branches: **Assign to user** → **Add Task**
5. NO SMS/email sequence in this workflow

### Campaigns
- Only 2 campaigns, both Draft: "Ensure Contact", "Lead Mining Evictions"
- No active drip campaigns

### Follow Up Organization (13,847 enrolled)
Master routing workflow:
- Catches leads idle in Lead Gen
- Routes by pipeline stage (4 Month, 1 Year, Ghosted, Trash, Sold, etc.)
- Adds tags, assigns users, manages wait periods
- Removes from "New Lead Drip" on terminal stages

### Follow Up Automation (4,435 enrolled, 4,413 active)
SMS drip engine for stale opportunities:
- Triggers on stale 1-year and general stale opportunities
- Assigns, waits, conditions by stage

## Key Finding: There IS No Single "New Lead Drip" Workflow

The "New Lead Drip" is a **manual process** by Daniel, guided by SOPs:

### LM Daily SOPs (from KPI Dashboard)
**Qualifying new leads:**
- CALL 2x per morning and 2x per afternoon
- ENSURE sms automation is started
- ENSURE sms automation turned off once conversation is completed
- ONLY check off task if moved from warm/hot column
- MOVE to ghosted after 10 days overdue
- ENSURE task created if moved to follow up columns

**Calling follow up leads:**
- CALL 2x per day
- TEXT follow up messages:
  - "General FU: START automation"
  - "Specific Task: Send manual specific messages DAILY"
- MOVE to different follow up column depending on motivation:
  - 1 Month: Specific task, motivated, ready to sell in 30 days
  - 4 Month: Willing/able to sell in 6 months, specific task if needed
  - 12 Month: Not interested or 6+ months out
- NO ANSWER after 5 days:
  - General FU: Check off once 5 days overdue
  - Specific Task: Push task out 1-3 weeks

**Day Priority Order:**
1. ON TIME for scheduled calls
2. ANSWER incoming calls
3. CALL/START automation for assigned new lead
4. COMPLETE personalized tasks
5. REPLY to incoming texts
6. Reschedule pending apt
7. CONFIRM upcoming apt
8. PERFORM specific tasks
9. CALL/TEXT upcoming follow ups
10. LEAD GENERATION if nothing else

## What the Bot Should Replace

The bot needs to handle everything Daniel does EXCEPT live calls:
1. **Instant first text** when lead arrives (before Daniel can even see it)
2. **SMS drip sequence** — personalized texts at smart intervals
3. **Email sequence** — different content than texts, value-add
4. **Voicemail drops** — pre-recorded messages
5. **Task management** — create, update, complete tasks automatically
6. **Stage moves** — auto-move based on engagement/non-engagement
7. **Daily call list** — tell Daniel exactly who to call today and why
8. **Stop automation** when real conversation starts
9. **Resume automation** when conversation goes cold
10. **Escalation** — if no response after X days, flag for review
