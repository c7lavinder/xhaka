# Follow Up Workflow Audit — Feb 15, 2026

## Workflow Architecture (GHL)

**Location:** Automation → Acquisitions → Follow Up Organization → Current Follow Up Workflows → Monthly Follow Up Workflows

### Three Active Published Workflows

---

## 1. "1 month Follow Up Workflow"
- **Status:** Published | **Total Enrolled:** 1,271 | **Active:** 87
- **Created:** Oct 13, 2023 | **Updated:** Jan 15, 2026

### Trigger
- **Type:** Pipeline stage changed
- **Pipeline:** Sales Process
- **Stage:** 1 Month Follow Up

### Flow
```
1. [TRIGGER] Lead moves to "1 Month Follow Up" in Sales Process
2. [ADD TAG] → "1 month"
3. [WAIT] → 26 days (Mon-Fri only, 9AM-5PM window)
4. [CONDITION] → Is Pipeline Stage still [Sales Process] - 1 Month Follow Up?
   ├── YES → [ADD TASK] "Follow Up Call — 1 Month"
   │         Description: "Follow up call for {{contact.company_name}}. If lead, change 
   │         Mastersuite status to 1 and schedule appointment. If not a lead, keep 
   │         in 1 month or move to corresponding follow up campaign. Call 2"
   │         Assigned to: Contact's Assigned User
   │         Due in: 5 days
   │         │
   │         ↓
   │         [WAIT] → 14 days
   │         [CONDITION] → Still in 1 Month Follow Up?
   │         ├── YES → [GO TO] loops back (creates recurring cycle)
   │         └── NO → [END]
   │
   └── NO → [REMOVE FROM WORKFLOW]
```

### Key Observations
- **Cadence:** First task at Day 26, then every ~14 days if still in 1 Month
- **Business hours only:** Weekdays 9AM-5PM
- **Self-cleaning:** If lead moves out of 1 Month stage, workflow stops
- **Task creates manual accountability** — assigned to contact's user, due in 5 days
- **Task description tells them what to do:** Either schedule appointment or move to appropriate follow-up bucket

---

## 2. "Follow Up Automation"
- **Status:** Published | **Total Enrolled:** 4,537 | **Active:** 4,515
- **Created:** Oct 29, 2025 | **Updated:** Jan 14, 2026

### Triggers (2)
1. **"1 Year Follow Up Stale"**
   - Type: Stale Opportunities
   - Pipeline: Follow Up
   - Duration: 10 days stale
   - Stage: 1 Year Follow Up

2. **"Stale Opportunities"**
   - Type: Stale Opportunities
   - Pipeline: Follow Up
   - Duration: 10 days stale
   - Stage: 4 Month Follow Up

### Flow
```
1. [TRIGGER] Contact stale for 10 days in 4 Month or 1 Year Follow Up
2. [ASSIGN TO USER]
3. [WAIT] (40 contacts currently waiting)
4. [ASSIGN TO USER] (reassign)
5. [CONDITION] → Which pipeline stage?
   ├── 4 MONTH BRANCH → Pipeline Stage is [Follow Up] - 4 Month Follow Up
   │   ├── [4 MONTH TAG]
   │   ├── [WAIT] (2,249 contacts waiting)
   │   ├── [DRIP MESSAGES]
   │   ├── [MESSAGE POOL 4 MONTH] → randomized content
   │   ├── Splits into Path A/B/C/D/E (A/B testing)
   │   │   ├── [1ST SMS 4 MONTH A/B/C/D/E] → sends varied first text
   │   │   ├── [WAIT]
   │   │   ├── [2ND SMS 4 MONTH A/B/C/D/E] → sends varied second text  
   │   │   ├── [WAIT]
   │   │   └── [3RD SMS 4 MONTH A/B/C/D/E] → sends varied third text
   │   ├── [WAIT]
   │   └── [GO TO] → loops back (restart cycle)
   │
   ├── 1 YEAR BRANCH → Pipeline Stage is [Follow Up] - 1 Year Follow Up
   │   ├── [ADD TAG]
   │   ├── [WAIT] (2,226 contacts waiting)
   │   ├── [DRIP MESSAGES]
   │   ├── [MESSAGE POOL 4 MONTH] (reused)
   │   ├── Same Path A-E structure with SMS variants
   │   ├── [WAIT]
   │   └── [GO TO] → loops back
   │
   └── NONE → [REMOVE FROM WORKFLOW]
```

### Key Observations
- **Sophisticated A/B testing** — 5 message paths (A-E) with randomized SMS content
- **3 SMS touchpoints per cycle** — 1st, 2nd, 3rd SMS with waits between each
- **Both 4 Month and 1 Year use same drip structure** but likely different timing
- **Stale trigger = 10 days** — catches contacts that haven't been touched in 10 days
- **Loops indefinitely** via Go To / Restart — keeps cycling as long as contact stays in bucket
- **Massive scale:** 4,515 active contacts currently in this workflow
- **2,249 in 4 Month wait + 2,226 in 1 Year wait** = nearly all active contacts are in a wait state

---

## 3. "Follow Up Organization"
- **Status:** Published | **Total Enrolled:** 14,267 | **Active:** 5,780
- **Created:** Jan 14, 2026 | **Updated:** Jan 15, 2026
- *(Not audited in detail yet — likely handles routing/sorting into correct buckets)*

---

## Other Workflows in System

### Pending Apt (Published)
- **Total Enrolled:** 595 | **Active:** 1
- In: Current Follow Up Workflows folder
- Likely handles pending appointment follow-up

### CRM Drips (folder)
- Updated Jan 15, 2026 — likely contains additional drip sequences

### DRAFTS Follow Up Workflow (folder)
- Draft status — work in progress

---

## Follow Up Pipeline Stages (from earlier audit)

| Stage | Opportunities | Notes |
|-------|--------------|-------|
| New Lead | 0 | Entry/routing |
| New Offer | 0 | Entry/routing |
| New Walkthrough | 0 | Entry/routing |
| 4 Month Follow Up | 2,234 | Main nurture pool |
| 1 Year Follow Up | 2,288 | Long-term nurture |
| Purchased | 104 | Historical — closed |
| Agreement Not Closed | 88 | Fell through — re-engage? |
| SOLD | 495 | Historical — completed |
| Ghosted | 0 | Empty — not being used? |
| Trash | 0 | |
| **Total** | **7,365** | |

---

## The Gap Corey Identified

**Current system:**
1. Lead enters pipeline → automation creates task
2. Team calls for 3-5 days
3. No answer → check off task
4. Wait for next automation cycle (26 days for 1 Month, ~10 days stale trigger for 4 Month/1 Year)
5. New task/SMS fires → repeat

**What's missing:**
- **No visibility into what happened during the task window** — did they call 1x or 5x? Call + text + voicemail? Or just call once and check it off?
- **No disposition enforcement** — task gets checked off without requiring "why" or "what next"
- **No accountability metrics** — Corey can't see who's actually working leads vs checking boxes
- **SMS drips fire regardless** — the automated texts go out on schedule, but manual follow-up (calls) is a black box
- **Ghosted bucket unused** — 0 contacts in Ghosted means nobody is formally flagging unresponsive leads

---

## Follow Up Bot Design Implications

The Follow Up Bot should **NOT replace** this automation — it should **complement** it by:

1. **Monitoring task completion quality** — when a task gets checked off, verify: were calls actually made? Were texts sent? How many attempts?
2. **Enforcing disposition** — require team to log outcome when completing a task (lead/no answer/wrong number/not interested/callback requested)
3. **Filling the gap between automated SMS and manual calls** — the drip handles texts, but who's tracking the call cadence?
4. **Reporting to Corey** — dashboard showing: tasks created vs completed, average attempts per lead, disposition breakdown, leads going stale without action
5. **Escalating anomalies** — team member checking off 10 tasks in 5 minutes? Nobody called the lead but task is done? Flag it.

### What the bot mimics:
- Same pipeline stage awareness (trigger on stage changes and stale opportunities)
- Same wait/check/act loop structure
- Same business hours window (Mon-Fri, 9AM-5PM)
- Same bucket-specific cadences (1 Month = tighter, 4 Month = longer, 1 Year = quarterly)

### What the bot adds:
- Visibility layer Corey doesn't have today
- Quality enforcement on manual touchpoints
- Disposition tracking and accountability
- Real-time alerting vs periodic automation cycles
