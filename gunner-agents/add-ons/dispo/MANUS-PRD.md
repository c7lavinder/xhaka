# Dispo Control Room — Manus PRD

**Feature:** Dispo Control Room (Gunner Tab)
**Target:** Manus build
**Priority:** High
**Backend Spec:** See `SPEC.md` (agent automation logic)

---

## Overview

The **Control Room** is a dedicated Gunner tab that gives Dispo Managers complete visibility and control over their deal distribution workflow. Think mission control for wholesale deals — see every deal in flight, every buyer response, every pending action.

---

## User Stories

### As a Dispo Manager (Esteban), I want to:
1. See all active deals being marketed to buyers in one place
2. Know which buyers have been contacted and who's responded
3. Quickly approve/edit outreach drafts before they go out
4. Track buyer interest levels across all deals
5. Know when follow-ups are due or overdue
6. See deal metrics (days on market, response rates, close rates)

### As a Business Owner (Corey), I want to:
1. See dispo performance at a glance
2. Know how long deals sit before getting buyer interest
3. Identify bottlenecks in the dispo process
4. Track buyer quality (who actually closes)

---

## Page Structure

### Tab Location
- Gunner sidebar: **"Control Room"** (with radar/control icon)
- Position: After Leads, before Settings

### Layout: Three-Column Dashboard

```
┌─────────────────────────────────────────────────────────────────────┐
│  🎯 CONTROL ROOM                                      [Filters ▼]   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌──────────────────────┐  ┌───────────────────┐ │
│  │              │  │                      │  │                   │ │
│  │  DEAL QUEUE  │  │    DEAL DETAIL       │  │  BUYER ACTIVITY   │ │
│  │              │  │                      │  │                   │ │
│  │  (Left rail) │  │    (Center panel)    │  │  (Right panel)    │ │
│  │              │  │                      │  │                   │ │
│  └──────────────┘  └──────────────────────┘  └───────────────────┘ │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  📊 METRICS BAR                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Component Details

### 1. Deal Queue (Left Rail)

Scrollable list of active dispo deals, sorted by urgency.

**Card Layout:**
```
┌─────────────────────────────────┐
│ 🏠 123 Main St, Nashville       │
│ $145k → $10k fee                │
│ ─────────────────────────────── │
│ 📤 Sent to 15 buyers            │
│ 🔥 3 interested                 │
│ ⏱️ 2 days active                │
│ ─────────────────────────────── │
│ [NEEDS REVIEW] or [ON TRACK]    │
└─────────────────────────────────┘
```

**Status Badges:**
| Badge | Meaning |
|-------|---------|
| 🟡 NEEDS REVIEW | Drafts ready for approval |
| 🟢 ON TRACK | Outreach sent, responses coming |
| 🔴 STALE | No response in 72h+ |
| 🔵 HOT INTEREST | Buyer ready to commit |
| ✅ UC WITH BUYER | Under contract, pending close |

**Sort Options:**
- Urgency (default — stale first, then needs review)
- Newest first
- Oldest first
- Most interest
- Highest assignment fee

**Filters:**
- Status (checkboxes)
- Date range
- Assignment fee range

---

### 2. Deal Detail (Center Panel)

Expands when a deal is selected from the queue.

**Sections:**

#### Header
```
┌─────────────────────────────────────────────────────────┐
│ 🏠 123 Main St, Nashville TN 37203                      │
│ 3 bed / 2 bath · 1,450 sqft · Built 1985               │
├─────────────────────────────────────────────────────────┤
│ Contract: $145,000  │  ARV: $280,000  │  Fee: $10,000  │
│ Closing Target: Feb 28                                  │
├─────────────────────────────────────────────────────────┤
│ [View Marketing Packet]  [Edit Details]  [Archive]      │
└─────────────────────────────────────────────────────────┘
```

#### Buyer Outreach Table
```
┌──────────────────────────────────────────────────────────────────┐
│ BUYERS CONTACTED (15)                      [+ Add Buyer]         │
├──────────┬───────────┬──────────┬──────────────┬────────────────┤
│ Buyer    │ Tier      │ Sent     │ Response     │ Action         │
├──────────┼───────────┼──────────┼──────────────┼────────────────┤
│ Brian T. │ 🥇 Qual   │ 2h ago   │ "Interested" │ [Send Assign]  │
│ Mike C.  │ 🥈 Qual   │ 2h ago   │ "Address?"   │ [Reply]        │
│ Sarah W. │ 🥉 JV     │ 2h ago   │ —            │ [Follow Up]    │
│ ...      │           │          │              │                │
└──────────┴───────────┴──────────┴──────────────┴────────────────┘
```

**Buyer Row Actions:**
- **Send Assignment** — triggers DocHub paperwork
- **Reply** — opens quick-reply drawer
- **Follow Up** — sends follow-up text
- **Remove** — removes from this deal
- **View Profile** — opens buyer detail modal

#### Activity Timeline
```
┌─────────────────────────────────────────────────────────┐
│ TIMELINE                                                │
├─────────────────────────────────────────────────────────┤
│ 🔵 10:30 AM — Brian Thompson replied "Interested"       │
│ 📤 10:15 AM — Blasts sent to 15 buyers                  │
│ ✅ 10:00 AM — Esteban approved outreach                 │
│ 📝 9:45 AM — Drafts generated for 15 buyers             │
│ 🎯 9:30 AM — Deal matched to 15 buyers                  │
│ 🚀 9:00 AM — Deal entered "Clear to Send Out"           │
└─────────────────────────────────────────────────────────┘
```

---

### 3. Buyer Activity Panel (Right Rail)

Shows real-time buyer activity across ALL deals.

**Live Feed:**
```
┌─────────────────────────────────────────┐
│ 🔴 LIVE BUYER ACTIVITY                  │
├─────────────────────────────────────────┤
│ 🔵 Brian T. replied on 123 Main St      │
│    "Interested, what's the address?"    │
│    2 min ago                            │
│    [View Deal] [Quick Reply]            │
├─────────────────────────────────────────┤
│ 👀 Mike C. opened email for 456 Oak     │
│    5 min ago                            │
├─────────────────────────────────────────┤
│ 📤 Follow-up sent to Sarah W.           │
│    (123 Main St) — Auto 24h             │
│    12 min ago                           │
├─────────────────────────────────────────┤
│ ❌ John D. passed on 789 Elm            │
│    Reason: "Too much rehab"             │
│    15 min ago                           │
└─────────────────────────────────────────┘
```

**Activity Types:**
- 🔵 Reply received (clickable)
- 👀 Email opened
- 📤 Follow-up sent
- ❌ Buyer passed
- ✅ Buyer committed
- 📋 Assignment sent

---

### 4. Metrics Bar (Bottom)

Persistent stats strip across bottom of Control Room.

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 📊 This Week                                                            │
│                                                                         │
│ Active Deals: 8  │  Avg Response Rate: 23%  │  Avg Days to Close: 4.2  │
│ Buyers Contacted: 127  │  Interested: 31  │  Closed: 3 ($28k fees)     │
└─────────────────────────────────────────────────────────────────────────┘
```

**Expandable Detail (click to expand):**
- Response rate by buyer tier
- Top performing buyers (who closes)
- Stale deal alerts
- Week-over-week comparison

---

## Key Interactions

### 1. Approve Outreach Flow

When AI generates buyer outreach drafts:

```
┌─────────────────────────────────────────────────────────┐
│ ⚡ ACTION REQUIRED: Review Outreach                     │
├─────────────────────────────────────────────────────────┤
│ Deal: 123 Main St                                       │
│ Buyers: 15 matched                                      │
│                                                         │
│ Preview:                                                │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ TEXT TO BRIAN T:                                    │ │
│ │ "New deal in Nashville: 3/2, 1,450 sqft, ARV $280k │ │
│ │ Asking $145k, assignment $10k. Interested?"        │ │
│ │                                          [Edit]    │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ [Approve All]  [Review Each]  [Edit Template]          │
└─────────────────────────────────────────────────────────┘
```

### 2. Quick Reply Drawer

Slide-out panel for fast buyer responses:

```
┌─────────────────────────────────────────┐
│ Reply to Brian Thompson                 │
│ RE: 123 Main St                         │
├─────────────────────────────────────────┤
│ Their message:                          │
│ "Interested, what's the address?"       │
├─────────────────────────────────────────┤
│ Your reply:                             │
│ ┌─────────────────────────────────────┐ │
│ │ 123 Main St, Nashville TN 37203.   │ │
│ │ Want me to send the marketing      │ │
│ │ packet?                            │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [Send Text]  [Send Email]  [Cancel]     │
└─────────────────────────────────────────┘
```

### 3. Send Assignment Flow

When buyer commits:

```
┌─────────────────────────────────────────────────────────┐
│ 📋 Send Assignment Agreement                            │
├─────────────────────────────────────────────────────────┤
│ Buyer: Brian Thompson                                   │
│ Company: Thompson Investments LLC                       │
│ Email: brian@thompsoninv.com                           │
│ Deal: 123 Main St                                       │
│ Assignment Fee: $10,000                                 │
├─────────────────────────────────────────────────────────┤
│ Template: NAH Assignment Agreement                      │
│ Platform: DocHub                                        │
├─────────────────────────────────────────────────────────┤
│ [Preview Doc]  [Send for Signature]  [Cancel]           │
└─────────────────────────────────────────────────────────┘
```

---

## Mobile Responsiveness

On mobile/tablet, collapse to single column:
1. Deal Queue becomes top accordion
2. Deal Detail fills screen when selected
3. Buyer Activity moves to a floating badge/drawer
4. Metrics Bar becomes collapsible header

---

## Data Requirements (from GHL via Backend)

| Data | Source | Update Frequency |
|------|--------|------------------|
| Active deals | Dispo Pipeline | Real-time webhook |
| Deal details | Opportunity fields | On view |
| Buyer list | Buyer Pipeline | On match |
| Buyer responses | GHL conversations | Real-time webhook |
| Outreach history | GHL messages | Real-time |
| Email opens | GHL tracking | Near real-time |
| Assignment status | DocHub webhook | On change |

---

## Integration Points

### Backend (Agent System)
- Receives deal when enters "Clear to Send Out"
- Generates buyer matches
- Drafts outreach messages
- Monitors responses
- Triggers follow-ups
- Preps assignment docs

### Frontend (Control Room)
- Displays queue and deal details
- Shows pending actions (approve outreach)
- Enables quick replies
- Shows real-time activity
- Triggers manual actions (send assignment)

### GHL
- Source of all deal/buyer data
- Conversation history
- Pipeline stage changes

### DocHub
- Assignment agreement templates
- Signature tracking

---

## Tenant Configuration (UI)

### Settings Page (Control Room → ⚙️)

```
CONTROL ROOM SETTINGS
─────────────────────────────────────────

📍 Pipeline Mapping
  Dispo Pipeline: [Dispo ▼]
  "Ready to Send" Stage: [Clear to Send Out ▼]
  "Under Contract" Stage: [UC with Buyer ▼]

👥 Buyer Field Mapping
  Markets Field: [Market(s) ▼]
  Buybox Field: [Buybox ▼]
  Tier Field: [Buyer Tier ▼]
  Funding Field: [Verified Funding ▼]

📤 Outreach Settings
  Text Style: [Brief ▼]
  Email Style: [Detailed + Packet ▼]
  
  Auto Follow-Up: [✓] Enabled
    24h: [✓]  48h: [✓]  72h: [✓]

📋 Assignment
  Platform: [DocHub ▼]
  Template: [NAH Assignment Agreement ▼]

[Save Settings]
```

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Time from "Clear to Send" to first buyer contact | < 30 min |
| Response rate to outreach | > 20% |
| Time from interest to assignment sent | < 2 hours |
| Deals closed per week | Tracked, no target |
| Dispo Manager time saved | 50% reduction in manual work |

---

## Phase 1 Scope (MVP)

**Include:**
- [x] Deal queue with status badges
- [x] Deal detail view with buyer table
- [x] Approve outreach flow
- [x] Quick reply drawer
- [x] Activity timeline
- [x] Basic metrics bar

**Defer to Phase 2:**
- [ ] Live buyer activity feed
- [ ] Email open tracking
- [ ] Advanced analytics
- [ ] Buyer performance leaderboard
- [ ] Mobile-optimized view

---

## Design Notes

- **Color scheme:** Match Gunner's existing palette
- **Icons:** Use consistent Gunner icon set
- **Empty states:** Friendly messages ("No deals in queue — nice work!")
- **Loading states:** Skeleton loaders for deal details
- **Error states:** Clear messaging, retry options

---

## Questions for Corey

1. ✅ Name confirmed: "Control Room"
2. Any specific metrics you want prominently displayed?
3. Should buyer tier colors match anything in GHL?
4. Priority: real-time activity feed or detailed analytics?

---

*This PRD is for Manus (frontend). See `SPEC.md` for backend agent logic.*
