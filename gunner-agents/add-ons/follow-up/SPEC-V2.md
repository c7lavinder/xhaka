# Follow Up Bot — V2 Spec

**Agent #4 — Gunner Add-On**
**Last Updated:** Feb 15, 2026

---

## Purpose

**Replace GHL's static follow-up workflows entirely** with an intelligent follow-up system that manages the full lifecycle — task creation, SMS outreach, cadence management, disposition tracking, and team accountability.

**Core problem:** GHL workflows run rigid loops with canned templates on fixed timers. Team members check off tasks with zero accountability. Operators have no visibility into what actually happened. The Follow Up Bot takes over the entire follow-up process — doing everything the workflows do, but personalized, adaptive, and fully tracked.

---

## Design Principles

### 1. Auto-Discovery (Zero Config Install)
The bot must work on **any GHL account** without manual pipeline mapping. On install:
- Scan all pipelines and stages
- Identify follow-up/nurture stages by pattern matching (name contains: follow up, nurture, drip, month, year, ghosted, etc.)
- Detect active workflows tied to those stages
- Map task templates associated with follow-up workflows
- Present findings to admin for confirmation: "I found these follow-up stages — is this right?"

### 2. Config Layer, Not Code Changes
All thresholds and expectations are set via admin panel:
- Expected touches per cycle (per stage)
- Stale threshold (days without activity)
- Red flag rules (customizable)
- Business hours (for SLA calculations)
- Team member assignments

### 3. GHL-Native Data Only (Core)
Core accountability runs on data every GHL account has:
- **Tasks** — created, assigned, completed, completion time
- **Conversations** — SMS sent/received, call logs
- **Pipeline activity** — stage changes, timestamps
- **Contact activity** — last activity date, assigned user
- **Notes** — logged by team members

No dependency on BatchDialer, BatchLeads, or any third-party tool for core functionality.

### 4. Optional Integrations (Power Users)
Enhanced metrics available when connected:
- BatchDialer → exact dial count, call duration, disposition
- BatchLeads → SMS campaign metrics, delivery rates
- CallRail → voicemail detection, call recordings
- Google Sheets → KPI cross-reference

---

## Architecture

### Data Model

```
FollowUpCycle {
  contactId: string
  contactName: string
  assignedUser: string
  pipelineStage: string          // "1 Month Follow Up", "4 Month", etc.
  cycleStart: datetime           // when automated task was created
  cycleEnd: datetime | null      // when task was completed
  automatedTaskId: string
  manualTasks: Task[]            // manual tasks created between cycles
  attempts: Attempt[]            // all logged touchpoints
  disposition: string | null     // what happened (required on completion)
  redFlags: RedFlag[]
}

Attempt {
  type: "call" | "sms" | "voicemail" | "email" | "note"
  timestamp: datetime
  direction: "outbound" | "inbound"
  userId: string
  duration: number | null        // for calls
  source: "ghl" | "batchdialer" | "batchleads" | "callrail"
}

RedFlag {
  type: string
  severity: "warning" | "critical"
  message: string
  timestamp: datetime
}
```

### Red Flag Rules (Default)

| Rule | Severity | Trigger |
|------|----------|---------|
| Ghost Check | Critical | Task completed with 0 logged attempts |
| Speed Check | Warning | Task completed in < 2 minutes |
| Stale Lead | Critical | Lead in 1 Month with 0 touches in 5+ days |
| Stale Lead (4M) | Warning | Lead in 4 Month with 0 touches in 15+ days |
| Low Effort | Warning | Fewer than expected attempts per cycle |
| No Manual Tasks | Warning | 1 Month lead with 0 manual tasks between automated ones |
| Channel Gap | Warning | Only calls, no texts (or vice versa) — single channel |
| Quick Dismiss | Critical | Lead moved to lower bucket within 48h of entering current one |

All rules configurable. Admin can add custom rules, disable defaults, adjust thresholds.

---

## Core Features

### 1. Intelligent SMS Outreach (Replaces GHL Drip Workflows)
The bot sends follow-up texts itself — not canned templates, but **contextual messages:**
- Reads full conversation history before composing
- References their property, situation, what they said last time
- Varies tone and approach across attempts (friendly → direct → urgency → soft close)
- Adapts channel: if texts aren't working, creates call task instead
- Respects DND, business hours, weekend pauses
- **Multi-touch per cycle:** 1st text → wait → 2nd text → wait → 3rd text (mirrors existing workflow pattern but with personalized content)

Example:
```
Canned (current): "Hey {{first_name}}, we're still interested in your property. Give us a call!"
Bot (personalized): "Hey James, last time we talked you mentioned wanting to wait until spring 
to decide on Brookside Dr. Spring's here — has anything changed on your end?"
```

### 2. Smart Task Creation (Replaces GHL Automated Tasks)
The bot creates tasks for the team with **full context:**
```
Title: Follow Up Call — James Hall (1 Month, Cycle 3)
Description: 
- Property: 423 Brookside Dr
- Last contact: Jan 20 — said "text me an offer" 
- Bot sent 2 texts since (no reply)
- Recommended action: Call and reference the offer request
- Attempt #7 overall, #3 this cycle
Assigned to: Daniel
Due in: 2 days
```

Not just "follow up call for {{company_name}}" — actual intelligence about what to do and why.

### 3. Adaptive Cadence Management (Replaces Fixed Wait Timers)
Instead of rigid 26-day or 14-day loops:
- **Responsive leads:** Tighten cadence — they replied once, don't let them cool off
- **Cold leads:** Widen cadence — 3 attempts with no response, space it out
- **Re-engaged leads:** Spike cadence — they texted back after 60 days, go NOW
- **Stage-aware defaults:** 1 Month = aggressive, 4 Month = moderate, 1 Year = light
- **Channel rotation:** Call → text → voicemail drop → different text approach
- All overridable by admin per stage

### 4. Full Lifecycle Management
```
Lead enters follow-up stage
    ↓
Bot detects stage change (webhook or poll)
    ↓
Bot reads conversation history, scores lead, picks approach
    ↓
CYCLE START:
    ├── Send personalized SMS #1
    ├── Wait (adaptive — 2-5 days based on lead behavior)
    ├── Check: did they respond? → YES: alert team, create hot task
    ├── No response → Send SMS #2 (different angle)
    ├── Wait
    ├── Check again → Still nothing → Send SMS #3 (final attempt this cycle)
    ├── Create task for team member with full context
    ├── Wait for task completion
    ├── On completion: bot auto-reads activity and dispositions
    │   ├── Appointment Set → move stage, alert team
    │   ├── Callback Requested → bot schedules next touch automatically
    │   ├── Not Interested → move to Ghosted
    │   ├── No Answer → continue cycling
    │   ├── Wrong Number → flag for cleanup
    │   └── Zero activity detected → 🚩 flag to operator
    ├── If task not completed in X days → escalate
    └── LOOP (until disposition or stage change)
```

### 5. Team Accountability Dashboard
Per team member, per time period:
- Tasks completed
- Average attempts per lead
- Average time to first attempt (from task creation)
- Disposition breakdown
- Red flag count
- Channel mix (% calls vs % texts vs % voicemail)
- **Bot attempts vs human attempts** — see what the bot did vs what the team did

### 6. Lead Health Score
For each lead in a follow-up stage:
- Days in current stage
- Total attempts this cycle (bot + human)
- Last touch date and outcome
- Expected touches vs actual touches
- Conversation sentiment (positive/neutral/negative/silent)
- Health: 🟢 On Track | 🟡 Behind | 🔴 Critical

### 7. Auto-Disposition (Zero Friction)
Team does nothing extra. When a task is completed, the bot:
1. Scans call logs, texts, conversations, notes from the task window
2. Reads conversation content with AI to determine what happened
3. Auto-logs the disposition:
   - **Outbound calls + no conversation** → No Answer
   - **Conversation where lead declined** → Not Interested → move to Ghosted
   - **Conversation where lead said "call back later/next month"** → Callback → bot schedules next touch
   - **Appointment created on calendar** → Appointment Set → move stage
   - **Lead asked for offer/info** → Hot Lead → escalate immediately
   - **Task completed, zero activity found** → 🚩 No Attempt → flag to operator
   - **Wrong number / DNC detected in conversation** → flag for cleanup
4. All dispositions logged automatically — visible on dashboard, feeds reporting
5. Operator only gets involved when red flags fire

### 9. Cycle Summary Notes
When a follow-up cycle completes (task checked off, stage change, or cycle timer expires), the bot writes a **GHL note** on the contact summarizing everything that happened during that cycle:

```
📋 Follow Up Summary (1 Month Cycle)
Contact: Nancy Williams | 7105 Smokey Hill Rd
Period: Feb 1 - Feb 15, 2026

Attempts:
- Feb 1: SMS sent "Hi Nancy, checking in about your property..."
- Feb 3: Call attempt (no answer, 12s)
- Feb 5: SMS sent "Just following up..."
- Feb 7: Call attempt (voicemail left, 45s)
- Feb 10: SMS sent "Hi Nancy, still interested in discussing..."
- Feb 12: Call attempt (no answer, 8s)
- Feb 14: Task completed by Daniel

Result: No response after 3 calls, 3 SMS over 14 days
Disposition: → Moving to 4 Month Follow Up
```

**Why this matters:**
- 6 months later, anyone pulling up this contact sees exactly what happened each cycle
- No guessing whether a lead was actually worked or just moved along
- Builds a full paper trail: bot attempts + team attempts + outcomes
- Feeds the operator dashboard and reporting engine
- Critical for handoffs — if a new LM takes over, they see the full history

**What goes in the note:**
- Every outbound SMS (first 60 chars of message)
- Every call attempt (duration, outcome: answered/voicemail/no answer)
- Every inbound message from the seller
- Task assignment and completion
- Auto-disposition result
- Stage movement (if any)

The note is posted as an internal note (not visible to seller) with a `[Gunner]` prefix tag for easy filtering.

### 8. Operator Alerts
- Daily summary: team performance, red flags, leads needing attention
- Real-time alerts for critical red flags
- Weekly trend: are follow-up metrics improving or declining?
- **"Money left on the table" metric** — leads that responded but weren't followed up on

---

## NAH-Specific Configuration (Reference Implementation)

### Pipeline Mapping
```json
{
  "followUpStages": [
    {
      "pipeline": "Sales Process",
      "stage": "1 Month Follow Up",
      "expectedTouchesPerCycle": 6,
      "cycleLengthDays": 26,
      "staleThresholdDays": 5,
      "requireManualTasks": true
    },
    {
      "pipeline": "Follow Up",
      "stage": "4 Month Follow Up",
      "expectedTouchesPerCycle": 3,
      "cycleLengthDays": 60,
      "staleThresholdDays": 15,
      "requireManualTasks": false
    },
    {
      "pipeline": "Follow Up",
      "stage": "1 Year Follow Up",
      "expectedTouchesPerCycle": 2,
      "cycleLengthDays": 120,
      "staleThresholdDays": 30,
      "requireManualTasks": false
    }
  ],
  "businessHours": {
    "days": ["Mon", "Tue", "Wed", "Thu", "Fri"],
    "start": "09:00",
    "end": "17:00",
    "timezone": "America/Chicago"
  },
  "integrations": {
    "batchDialer": true,
    "batchLeads": true,
    "callRail": true
  }
}
```

### NAH Workflow Reference
*(What the bot REPLACES — these workflows get turned off once bot is live)*

**1 Month Follow Up Workflow:**
- Trigger: Stage change → 1 Month in Sales Process
- Tag "1 month" → Wait 26 days (M-F 9-5) → Check stage → Create task → Wait 14 days → Loop
- Task: "Follow Up Call — 1 Month" — due 5 days, assigned to contact's user

**Follow Up Automation (4 Month + 1 Year):**
- Trigger: Stale 10 days in 4 Month or 1 Year (Follow Up pipeline)
- Assign user → Wait → Branch by stage
- Both branches: Tag → Wait → 3 SMS drips (A/B tested, 5 paths) → Loop
- Automated SMS handles the drip; bot monitors the manual call layer

---

## Multi-Tenant / White-Label Considerations

### Onboarding Flow (New Customer)
1. Connect GHL account (OAuth)
2. Bot scans pipelines, stages, workflows
3. Bot presents: "Here's what I found — which stages are your follow-up buckets?"
4. Admin confirms/adjusts stage mapping
5. Bot asks: "What's your expected follow-up cadence for each?" (with smart defaults)
6. Bot asks: "Want to connect any additional data sources?" (BatchDialer, etc.)
7. Bot begins monitoring — first report in 24 hours

### What Varies Per Customer
- Pipeline/stage names
- Number of follow-up buckets
- Expected cadences
- Team size and assignments
- Business hours
- Disposition options (can add custom)
- Red flag thresholds
- Connected integrations

### What's Universal
- Auto-discovery engine
- Task completion monitoring
- Activity tracking (GHL native)
- Red flag detection logic
- Dashboard/reporting structure
- Disposition enforcement pattern
- Escalation flow

---

## Pricing Tier Alignment

| Feature | Starter ($99) | Pro ($249) | Enterprise ($499) |
|---------|--------------|-----------|-------------------|
| Auto-discovery | ✅ | ✅ | ✅ |
| Activity feed | Last 24h | Full history | Full history |
| Red flags | 3 default rules | All rules + custom | All rules + custom |
| Team dashboard | Basic | Full | Full + benchmarking |
| Disposition enforcement | ❌ | ✅ | ✅ |
| Third-party integrations | ❌ | 1 integration | Unlimited |
| Custom alerts | ❌ | ❌ | ✅ |
| API access | ❌ | ❌ | ✅ |

---

## Implementation Priority

### Phase 1: Take Over the Loop (Ship First)
- Auto-discover follow-up stages
- Detect stage changes and stale opportunities (same triggers as existing workflows)
- Send personalized SMS (replace canned drips)
- Create contextual tasks (replace generic automated tasks)
- Adaptive wait timers
- Basic red flags
- **Existing GHL workflows turned OFF after bot is confirmed working**

### Phase 2: Accountability Layer
- Disposition enforcement on task completion
- Team dashboard with per-member metrics
- Lead health scores
- Operator alerts and daily summaries
- "Money left on the table" tracking

### Phase 3: Intelligence
- Conversation sentiment analysis — adjust approach based on tone
- Channel optimization — "this lead responds to texts not calls"
- Cadence optimization — learn from conversion data what timing works
- Predictive: which leads are most likely to convert with one more touch?
- Re-engagement detection: lead texts back after months → instant hot alert

---

## Technical Notes

### GHL API Endpoints Needed
- `GET /opportunities/search` — find follow-up stage opportunities
- `GET /contacts/{id}/tasks` — task history per contact
- `GET /conversations/{id}/messages` — conversation history
- `GET /contacts/{id}/notes` — notes logged
- `GET /contacts/{id}/activities` — activity timeline
- `GET /opportunities/{id}/` — pipeline stage, timestamps
- Webhooks: `opportunity.stage_changed`, `task.completed`, `note.created`

### Polling vs Webhooks
- **Webhooks preferred** for real-time: task completed, stage changed
- **Polling fallback** for activity scanning (conversations, call logs)
- **Hourly scan** for stale lead detection
- **Daily rollup** for dashboard metrics

---

## Deployment: Replacing Existing Workflows

### Cutover Process (NAH)
1. Bot deployed and monitoring in parallel (read-only) for 48-72 hours
2. Verify bot detects same triggers, same contacts, same timing as existing workflows
3. Side-by-side comparison: bot's proposed SMS vs workflow's canned SMS
4. Admin approval → flip switch
5. GHL workflows paused (not deleted — rollback safety net)
6. Bot takes over full follow-up lifecycle
7. After 2 weeks stable → workflows can be archived

### Cutover Process (New Customer)
1. Connect GHL → auto-discovery
2. Bot scans existing follow-up workflows and learns their patterns
3. Bot proposes: "I'll handle your follow-up with these cadences and this approach"
4. Admin approves → bot takes over
5. Existing workflows paused

### Rollback
If bot has issues, re-enable GHL workflows. Bot stores all state — no data loss on rollback.

---

*This spec was built by auditing NAH's actual GHL follow-up workflows on Feb 15, 2026. The workflow architecture is documented in `/audits/follow-up-workflow-audit.md`. The bot is built on the Gunner engine infrastructure (Railway), not Manus.*
