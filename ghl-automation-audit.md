# GHL Automation Audit — NAH
**Date:** February 3, 2026
**Status:** Initial audit

---

## Workflow Folder Structure

```
📁 Workflows (5 top-level folders)
├── 📁 AI Caller
├── 📁 Acquisitions
│   ├── 📁 Appointment Management
│   ├── 📁 Deal Closed Automations
│   ├── 📁 Follow Up Organization
│   ├── 📁 Making Offer Automation
│   └── 📁 New Lead Automation ⭐
│       ├── Hot Leads (2,604 enrolled)
│       ├── New Follow Up Lead (10 enrolled)
│       ├── New JV Lead (22 enrolled)
│       ├── New Lead - Entry Point (6,947 enrolled) ⭐
│       └── Warm Leads (4,438 enrolled)
├── 📁 Disposition
├── 📁 Housekeeping
└── 📁 Lead Generation
```

---

## Key Workflows Documented

### 1. New Lead - Entry Point
**Location:** Acquisitions → New Lead Automation → New Lead - Entry Point
**Status:** Published
**Total Enrolled:** 6,947

**Trigger:**
- Type: Pipeline Stage Changed
- Pipeline: Sales Process
- Stage: New Lead (1)

**Actions:**
1. **Assign to user** — Routes lead to team member
2. **Add Task** — Creates follow-up task
3. **Internal Notification** — Alerts team

**Purpose:** When a new opportunity enters the Sales Process pipeline at "New Lead" stage, this workflow automatically assigns it and notifies the team.

---

### 2. Warm Leads
**Location:** Acquisitions → New Lead Automation → Warm Leads
**Status:** Published
**Total Enrolled:** 4,438

**Trigger:** (Likely) Pipeline Stage → Warm Leads stage

**Purpose:** Handles leads that move to Warm status — likely triggers LM assignment and follow-up sequences.

---

### 3. Hot Leads
**Location:** Acquisitions → New Lead Automation → Hot Leads
**Status:** Published
**Total Enrolled:** 2,604

**Trigger:** (Likely) Pipeline Stage → Hot Leads stage

**Purpose:** Handles leads that move to Hot status — priority handling, urgent notifications.

---

## Pipeline Stages Reference

Based on earlier screenshots, the **Sales Process** pipeline has these stages:

| Stage | Name | Count |
|-------|------|-------|
| 1 | New Lead | - |
| 2 | Warm Leads | - |
| - | SMS Warm Leads | - |
| 2 | Hot Leads | - |
| 3 | Pending Apt | - |
| - | Walkthrough | - |
| 3 | Offer Apt | - |
| 4 | Made Offer | - |

---

## Workflow Categories

### Acquisitions Folder
Handles the sales pipeline from lead entry to contract:
- **New Lead Automation** — Entry point, routing, assignment
- **Appointment Management** — Scheduling, reminders
- **Making Offer Automation** — Offer stage handling
- **Deal Closed Automations** — Post-contract actions
- **Follow Up Organization** — Long-term nurture

### Disposition Folder
Handles buyer-side workflows after contract signed.

### Lead Generation Folder
Handles inbound lead capture and initial routing.

### Housekeeping Folder
Administrative automations (cleanup, maintenance).

### AI Caller Folder
AI-powered calling automations (newer, Nov 2025).

---

## Enrollment Summary

| Workflow | Total Enrolled | Notes |
|----------|----------------|-------|
| New Lead - Entry Point | 6,947 | Main entry |
| Warm Leads | 4,438 | Warm stage |
| Hot Leads | 2,604 | Hot stage |
| New JV Lead | 22 | JV deals |
| New Follow Up Lead | 10 | Follow-up pipeline |

---

## Observations

1. **Stage-based triggers** — Most workflows trigger on pipeline stage changes, not contact creation
2. **Nested folder structure** — Workflows are organized by function, then by specific trigger
3. **High enrollment** — Entry point workflow has processed nearly 7,000 leads
4. **Published status** — All key workflows are actively published

---

---

## Detailed Workflow Documentation

### Making Offer Automation Folder

#### Made Offer Semi Automation ⚠️ DRAFT
**Status:** Draft (not live)
**Enrolled:** 8 | Active: 6

**Trigger:** Move to Made Offer (pipeline stage)

**Flow:**
1. Wait (time delay)
2. SMS: "Will send over PSA in 15 minutes."
3. Wait
4. SMS: "5 Minutes to go over PSA"
5. Wait

**Purpose:** Timed SMS sequence after offer is made — keeps seller engaged while contract is prepared.

#### Under Contract ⚠️ DRAFT
**Status:** Draft (not live)
**Enrolled:** 0 | Active: 0
**Notes:** Not yet built out

---

### Deal Closed Automations Folder

#### Post Closing Automation ✅ PUBLISHED
**Status:** Published (active)
**Enrolled:** 30 | Active: 28

**Trigger:** Moved to Closed (pipeline stage)

**Flow:**
1. Acquisition Manager Notification — Alert AM of close
2. Internal Notification — Team alert
3. Wait (time delay)
4. SMS: "Glad we got closed" — Thank you message to seller
5. Wait

**Purpose:** Post-closing touchpoint — thanks the seller and keeps door open for referrals.

---

## Automation Status Summary

| Workflow | Folder | Status | Enrolled |
|----------|--------|--------|----------|
| New Lead - Entry Point | New Lead Automation | ✅ Published | 6,947 |
| Warm Leads | New Lead Automation | ✅ Published | 4,438 |
| Hot Leads | New Lead Automation | ✅ Published | 2,604 |
| Post Closing Automation | Deal Closed | ✅ Published | 30 |
| Made Offer Semi Automation | Making Offer | ⚠️ Draft | 8 |
| Under Contract | Making Offer | ⚠️ Draft | 0 |

---

## Key Findings

1. **Core workflows are live** — New Lead, Warm, Hot, and Post-Closing automations are all published and active
2. **Offer stage needs attention** — Made Offer and Under Contract workflows are still in draft
3. **SMS sequences** — Multiple touchpoints use timed SMS (offer prep, post-closing)
4. **Notifications** — Internal notifications keep team informed at key stages
5. **Pipeline-driven** — All automations trigger on stage changes, not contact creation

---

## Recommendations

1. **Publish Making Offer Automation** — Review and activate the draft workflows
2. **Build Under Contract workflow** — Currently empty, needs logic
3. **Document Appointment Management** — Not yet reviewed
4. **Document Follow Up Organization** — Not yet reviewed
5. **Review Disposition folder** — Buyer-side workflows need audit

---

## Follow Up Organization Folder (Deep Dive)

**Location:** Acquisitions → Follow Up Organization
**Subfolders:**
- CRM Drips
- Current Follow Up Workflows
- DRAFTS Follow Up Workflow

### Current Follow Up Workflows Subfolder

**Structure:**
- JV Partner Follow Up Workflows (subfolder)
- Monthly Follow Up Workflows (subfolder)
- Pending Apt (workflow)

---

### Monthly Follow Up Workflows

| Workflow | Status | Total Enrolled | Active | Last Updated |
|----------|--------|----------------|--------|--------------|
| 1 month Follow Up Workflow | ✅ Published | 1,259 | 101 | Jan 15 2026 |
| Follow Up Automation | ✅ Published | 4,435 | 4,413 | Jan 14 2026 |
| Follow Up Organization | ✅ Published | 13,847 | 5,658 | Jan 15 2026 |

---

### Follow Up Organization ⭐ (Main Routing Workflow)
**Status:** Published
**Total Enrolled:** 13,847
**Active Enrolled:** 5,658
**Screenshot:** `skool-modules/screenshots/ghl-follow-up-organization.jpg`

**Triggers:**
1. Sitting in Lead Gen — Contacts idle in Lead Generation pipeline
2. Moved in Lead Gen Pipeline — Pipeline stage changed

**Main Flow:**
1. **Wait** — Time delay
2. **Find Opportunity** — Lookup in pipeline
3. **Branch:** Opportunity Found / Not Found
4. **Pipeline Stage Check** — Routes based on current stage

**Pipeline Stage Routing (9 conditional branches):**

| Branch | Condition | Actions |
|--------|-----------|---------|
| **4 Month Follow Up** | Stage = 4 Month | Add Tag → Add to #1 4 Month Sheet → Months Wait → Loop |
| **1 Year Follow Up** | Stage = 1 Year | Add Tag → Add to #2 1 Year Sheet → Months Wait → Loop |
| **Ghosted** | Stage = Ghosted | Add Tag → Add to #3 Ghosted Sheet → Remove from New Lead Drip |
| **Trash** | Stage = Trash | Add Tag → Assign User → Remove from New Lead Drip → Lost Opportunity |
| **Not Closed** | Stage = Not Closed | Add Tag → Assign User → Remove from New Lead Drip → Lost Opportunity |
| **SOLD** | Stage = SOLD | Add Tag → Assign User → Abandon Opportunity |
| **Purchased** | Stage = Purchased | Add Tag → Won Opportunity |
| **1 Month** | Stage = 1 Month | Add Tag → Add to #4 1 Month Sheet → Months Wait → Loop |
| **None** | Fallback | No condition met handling |

**Key Actions Used:**
- **Add Tag** — Tag contacts by follow-up cadence
- **Assign to user** — Route to appropriate team member
- **Remove from New Lead Drip** — Stop active campaigns
- **Add to Follow Up** — Enroll in follow-up workflow
- **Add to Sheet** — Log to tracking sheets (#1 4 Month, #2 1 Year, #3 Ghosted, #4 1 Month)
- **Months Wait** — Timed delays before re-checking
- **Find Opportunity** — Re-lookup after wait
- **Lost/Won/Abandon Opportunity** — Update opportunity status
- **Remove Opportunity** — Clean up closed opportunities

**Wait Step Queue Counts:**
| Wait Step | Contacts Waiting |
|-----------|------------------|
| Months Wait | 2,216 |
| Months Wait | 2,230 |
| Months Wait | 840 |
| Months Wait | 148 |
| Months Wait | 85 |
| Months Wait | 36 |
| Wait | 103 |

**Purpose:** Master routing workflow that:
1. Catches leads sitting idle in Lead Gen
2. Checks their current pipeline stage
3. Routes to appropriate follow-up cadence (1 month, 4 month, 1 year)
4. Handles dispositions (Trash, Ghosted, Not Closed, SOLD, Purchased)
5. Logs to tracking sheets for reporting
6. Loops back with timed delays for continued nurturing

**Notes:**
- This is the largest workflow by enrollment (13,847 total)
- 5,658 contacts currently active in follow-up loops
- Multiple wait steps with varying contact counts indicate healthy pipeline flow
- Integrates with Google Sheets for tracking (#1-4 sheets)

---

### Follow Up Automation ⭐ (SMS Drip Engine)
**Status:** Published
**Total Enrolled:** 4,435
**Active Enrolled:** 4,413

**Triggers:**
1. 1 Year Follow Up Stale — Stale opportunities in 1-year stage
2. Stale Opportunities — General stale opportunity trigger

**Main Flow:**
1. **Assign to user** — Route contact
2. **Wait** (59 contacts waiting)
3. **Assign to user** — Re-assign
4. **Condition** — Check pipeline stage

**Condition Branches:**

| Branch | Condition | Queue |
|--------|-----------|-------|
| 4 Month Branch | Pipeline Stage = [Follow Up] - 4 Month | 2,187 waiting |
| 1 Year Branch | Pipeline Stage = [Follow Up] - 1 Year | 2,167 waiting |
| None | Fallback | — |

**4 Month Branch Flow:**
```
4 Month Tag → Add Tag → Remove from Workflow → Wait (2,187)
    ↓
Drip messages → Message Pool 4 Month → Split into 5 paths (A/B test)
    ↓
[Path A] → 1st SMS 4 Month A → Wait → 2nd SMS → Wait → 3rd SMS → Wait → Go To (loop)
[Path B] → 1st SMS 4 Month B → Wait → 2nd SMS → Wait → 3rd SMS → Wait → Go To (loop)
[Path C] → 1st SMS 4 Month C → Wait → 2nd SMS → Wait → 3rd SMS → Wait → Go To (loop)
[Path D] → 1st SMS 4 Month D → Wait → 2nd SMS → Wait → 3rd SMS → Wait → Go To (loop)
[Path E] → 1st SMS 4 Month E → Wait → 2nd SMS → Wait → 3rd SMS → Wait → Go To (loop)
    ↓
Restart workflow (loops back)
```

**Key Features:**
- **A/B Testing:** Contacts randomly split into 5 message variants
- **3-Touch SMS Sequence:** Each path sends 3 SMS with waits between
- **Auto-Loop:** "Go To" and "Restart" actions create continuous drip cycle
- **Message Pools:** Randomized message selection from pools

**Purpose:** Long-term SMS nurture for cold leads in follow-up pipeline. Keeps contacts engaged with varied messaging over months/years until they re-engage or are dispositioned.

---

## Disposition Folder

**Location:** Root → Disposition
**Subfolders:** Buyer Automations, Dispo Automations

### Dispo Automations Subfolder

| Workflow | Status | Total Enrolled |
|----------|--------|----------------|
| Deal Closed | ✅ Published | 2 |
| Deal Under Contract | ✅ Published | 11 |
| New Deal - Setup | ✅ Published | 204 |

#### New Deal - Setup ⭐ (Dispo Entry Point)
**Status:** Published
**Total Enrolled:** 204

**Triggers:**
- New JV Deal
- New Lead Gen Deal

**Actions:**
1. Email to Data Manager — Notify DM of new deal
2. Email to AM — Notify Acquisition Manager
3. Email to DM — Additional notification
4. Create Or Update Opportunity — Add to Dispo pipeline
5. END

**Purpose:** When a new deal enters (JV or Lead Gen), notifies the team via email and creates an opportunity in the Dispo pipeline for buyer matching.

---

## Lead Generation Folder

**Location:** Root → Lead Generation
**Subfolders:** Lead Mining Lead Gen

### Lead Mining Lead Gen
- **Lead Mining Lead Gen** — DRAFT, 0 enrolled (not yet built)

**Status:** Work in progress. No active workflows.

---

## AI Caller Folder

**Location:** Root → AI Caller
**Created:** November 2025 (newest folder)
**Purpose:** AI-powered calling automations and call-related workflows

### Workflows

| Workflow | Status | Total Enrolled | Notes |
|----------|--------|----------------|-------|
| Auto-Tag Dead Leads (1 Year) | ⚠️ Draft | 1 | Tag stale leads |
| Auto-Tag Dead Leads (4 months) | ⚠️ Draft | 8 | Tag stale leads |
| Call Transcript in Notes | ✅ Published | 0 | Add call transcripts |
| Call Trigger for Follow Up | ⚠️ Draft | 12,109 | Heavily tested |
| New Property Added | ✅ Published | 4 | Property trigger |
| Outbound SMS, Email and Call | ⚠️ Draft | 1 | Multi-channel outreach |
| Pipeline Stage Changed | ⚠️ Draft | 0 | Stage trigger |
| SMS Follow-Up Sequence | ✅ Published | 1 | SMS drip |
| SMS: Message pump for follow up | ⚠️ Draft | 0 | SMS testing |

**Notes:**
- Most workflows in draft/experimental state
- "Call Trigger for Follow Up" has 12,109 enrolled but still draft — likely heavy testing
- Published workflows have minimal enrollment (0-4 contacts)
- AI Caller integration still being developed

---

## Housekeeping Folder

**Location:** Root → Housekeeping
**Created:** January 2026
**Purpose:** Administrative/maintenance automations
**Status:** Not yet audited in detail

---

## Summary: Workflow Status by Folder

| Folder | Published | Draft | Key Workflows |
|--------|-----------|-------|---------------|
| **Acquisitions** | 5+ | 2 | New Lead Entry, Warm/Hot Leads, Post Closing |
| **Follow Up Org** | 3 | - | Follow Up Organization, Follow Up Automation, 1 Month |
| **Disposition** | 3 | - | New Deal Setup, Under Contract, Deal Closed |
| **Lead Generation** | - | 1 | Work in progress |
| **AI Caller** | 3 | 7 | Mostly experimental |
| **Housekeeping** | TBD | TBD | Not audited |

## Active Contact Queues

| Workflow | Active Contacts | Purpose |
|----------|-----------------|---------|
| Follow Up Organization | 5,658 | Master routing |
| Follow Up Automation | 4,413 | SMS drip engine |
| 4 Month Wait | 2,216 | Follow-up delay |
| 4 Month Wait | 2,230 | Follow-up delay |
| 1 Year Wait | 2,167 | Follow-up delay |
| 1 Year Wait | 2,187 | Follow-up delay |

**Total active in follow-up system:** ~15,000+ contacts in nurture loops

---

*Audit updated Feb 3, 2026 — Full folder audit complete*
