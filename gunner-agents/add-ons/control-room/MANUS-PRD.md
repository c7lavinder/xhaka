# Control Room — Manus PRD

**Feature:** Control Room (Gunner Tab)
**Target:** Manus build
**Priority:** High
**Related:** KPI Monitor add-on (backend alerts/automation)

---

## Overview

**Control Room** is the business accountability dashboard. One screen that tells the owner: is the machine running? Where are the problems? Who's behind?

This isn't a workflow tool — it's the instrument panel. Corey glances at it and knows if NAH is healthy or if something needs attention.

---

## User Stories

### As an Owner (Corey), I want to:
1. See at a glance if the business is on track
2. Know immediately when SLAs are breached
3. Identify bottlenecks before they become problems
4. Track team performance without digging through GHL
5. See trends over time (getting better or worse?)
6. Know which leads are stuck and why

### As a Manager, I want to:
1. See my team's performance metrics
2. Know what needs immediate attention
3. Track SLA compliance in real-time

---

## Page Structure

### Tab Location
- Gunner sidebar: **"Control Room"** (with radar/command icon)
- Position: First tab (this is the home base)

### Layout: Dashboard Grid

```
┌─────────────────────────────────────────────────────────────────────┐
│  🎛️ CONTROL ROOM                    [Today ▼] [This Week] [Month]   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    HEALTH SCORE: 87%  🟢                     │   │
│  │         "2 items need attention"                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   LEADS      │  │   PIPELINE   │  │    DISPO     │              │
│  │   47 new     │  │   12 active  │  │   3 pending  │              │
│  │   🟢 On pace │  │   🟡 2 stale │  │   🟢 Moving  │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  🚨 ATTENTION NEEDED                                         │   │
│  │  ─────────────────────────────────────────────────────────── │   │
│  │  ⚠️ 2 leads past 15-min SLA (Daniel)                         │   │
│  │  ⚠️ 1 deal stale in pipeline (Kyle)                          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────┐  ┌─────────────────────────────────┐  │
│  │  TEAM PERFORMANCE       │  │  PIPELINE FLOW                   │  │
│  │  ────────────────────── │  │  ───────────────────────────────│  │
│  │  Daniel: 23 calls ✓     │  │  [Funnel visualization]         │  │
│  │  Kyle: 8 appts ✓        │  │  New → Qual → Appt → UC → Close │  │
│  │  Esteban: 3 deals ✓     │  │  47    12     8      3     1    │  │
│  └─────────────────────────┘  └─────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Component Details

### 1. Health Score (Top Banner)

Single number that summarizes business health.

**Calculation:**
- SLA compliance (weighted 40%)
- Pipeline velocity (weighted 30%)
- Response rates (weighted 20%)
- Stuck leads (weighted 10%)

**Display:**
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│              HEALTH SCORE: 87%  🟢                              │
│                                                                 │
│    SLA: 94% ✓    Pipeline: 82%    Response: 89%    Stuck: 2    │
│                                                                 │
│              "2 items need attention"                           │
│                     [View Details]                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Thresholds:**
- 🟢 Green: 80%+ (healthy)
- 🟡 Yellow: 60-79% (needs attention)
- 🔴 Red: <60% (problems)

---

### 2. Department Cards (Summary Row)

Three cards showing each major area at a glance.

#### Leads Card
```
┌─────────────────────────┐
│  📥 LEADS               │
│  ─────────────────────  │
│  47 new today           │
│  ↑ 12% vs last week     │
│                         │
│  SLA: 94% 🟢            │
│  Avg response: 8 min    │
│                         │
│  [View Leads →]         │
└─────────────────────────┘
```

#### Pipeline Card
```
┌─────────────────────────┐
│  🔄 PIPELINE            │
│  ─────────────────────  │
│  12 active deals        │
│  $156k potential fees   │
│                         │
│  2 stale (>7 days) 🟡   │
│  Avg days to close: 14  │
│                         │
│  [View Pipeline →]      │
└─────────────────────────┘
```

#### Dispo Card
```
┌─────────────────────────┐
│  📤 DISPO               │
│  ─────────────────────  │
│  3 deals marketing      │
│  127 buyers contacted   │
│                         │
│  Response rate: 23% 🟢  │
│  1 buyer committed      │
│                         │
│  [View Dispo →]         │
└─────────────────────────┘
```

---

### 3. Attention Needed (Alert Panel)

Real-time list of things that need action NOW.

```
┌─────────────────────────────────────────────────────────────────┐
│  🚨 ATTENTION NEEDED (4)                         [Clear All ✓]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🔴 CRITICAL                                                    │
│  ├─ SLA BREACH: Lead #4521 waiting 32 min (Daniel)             │
│  │  John Smith • PPL • Nashville     [Assign] [View]           │
│  │                                                              │
│  └─ SLA BREACH: Lead #4519 waiting 28 min (Daniel)             │
│     Sarah Jones • Form • Antioch     [Assign] [View]           │
│                                                                 │
│  🟡 WARNING                                                     │
│  ├─ STALE DEAL: 456 Oak St — 9 days no activity (Kyle)         │
│  │  Last: "Waiting on seller docs"   [Ping Kyle] [View]        │
│  │                                                              │
│  └─ LOW RESPONSE: Dispo blast for 789 Elm — 8% response        │
│     Sent 48h ago, only 2 replies     [View Dispo]              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Alert Types:**
| Type | Trigger | Severity |
|------|---------|----------|
| SLA Breach | Lead not contacted in 15 min | 🔴 Critical |
| Escalation | Lead not contacted in 30 min | 🔴 Critical |
| Stale Deal | No pipeline activity in 7+ days | 🟡 Warning |
| Stuck Lead | Lead in same stage 14+ days | 🟡 Warning |
| Low Response | Dispo response rate <10% | 🟡 Warning |
| Missed Follow-up | Scheduled callback missed | 🟡 Warning |

**Actions from Alert:**
- **Assign** — reassign to available team member
- **Ping** — send notification to owner
- **View** — jump to full record
- **Dismiss** — mark as handled (with reason)

---

### 4. Team Performance Panel

Shows who's doing what.

```
┌─────────────────────────────────────────────────────────────────┐
│  👥 TEAM TODAY                                    [This Week ▼] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Daniel (LM)                                                    │
│  ├─ Calls: 23 ✓        Target: 20                              │
│  ├─ Connects: 8        Connect rate: 35%                       │
│  ├─ Appts set: 2                                               │
│  └─ SLA: 94% 🟢        Avg response: 7 min                     │
│                                                                 │
│  Kyle (AM)                                                      │
│  ├─ Appointments: 3    Target: 3 ✓                             │
│  ├─ Offers made: 2                                             │
│  ├─ Contracts: 1       Win rate: 50%                           │
│  └─ Pipeline value: $45k                                       │
│                                                                 │
│  Esteban (Dispo)                                                │
│  ├─ Deals marketed: 2                                          │
│  ├─ Buyers contacted: 47                                       │
│  ├─ Responses: 11      Response rate: 23%                      │
│  └─ Assignments sent: 1                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### 5. Pipeline Flow Visualization

Visual funnel showing where deals are.

```
┌─────────────────────────────────────────────────────────────────┐
│  📊 PIPELINE FLOW                                 [This Month]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│     NEW LEADS        QUALIFIED        APPOINTMENT               │
│    ┌────────┐       ┌────────┐       ┌────────┐                │
│    │   47   │ ───►  │   12   │ ───►  │    8   │                │
│    └────────┘       └────────┘       └────────┘                │
│        │               26%               67%                    │
│        │                                                        │
│        │           UNDER CONTRACT      CLOSED                   │
│        │             ┌────────┐       ┌────────┐               │
│        └──────────►  │    3   │ ───►  │    1   │               │
│                      └────────┘       └────────┘               │
│                          38%              33%                   │
│                                                                 │
│  Conversion: 2.1%  │  Avg cycle: 14 days  │  Fees: $12k MTD   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### 6. Trends (Expandable)

Week-over-week comparison.

```
┌─────────────────────────────────────────────────────────────────┐
│  📈 TRENDS                                         [Expand ▼]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  This Week vs Last Week:                                        │
│                                                                 │
│  Leads:        47 vs 42    ↑ 12% 🟢                            │
│  Appointments:  8 vs 10    ↓ 20% 🟡                            │
│  Contracts:     3 vs  2    ↑ 50% 🟢                            │
│  Closed:        1 vs  1    ── 0%                               │
│  Revenue:     $12k vs $8k  ↑ 50% 🟢                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Interactions

### 1. Drill-Down

Click any number to see the underlying records:
- Click "47 new leads" → filtered lead list
- Click "2 stale" → stale deals only
- Click team member → their activity detail

### 2. Quick Actions from Alerts

Handle issues without leaving Control Room:
- Reassign leads
- Send pings/reminders
- Mark as handled
- Jump to record

### 3. Time Period Toggle

Switch views:
- Today (default)
- This Week
- This Month
- Custom range

---

## Data Requirements

| Data | Source | Update |
|------|--------|--------|
| Lead counts | GHL Contacts | Real-time |
| Pipeline deals | GHL Opportunities | Real-time |
| SLA tracking | Agent Watchdog | Real-time |
| Team activity | GHL user actions | Near real-time |
| Dispo metrics | Dispo add-on | Real-time |
| Historical trends | Aggregated/cached | Hourly |

---

## Integration with KPI Monitor Add-on

The **KPI Monitor** backend add-on powers alerts:
- Monitors SLAs continuously
- Triggers alerts when thresholds breached
- Escalates to Jessica at 30 min
- Sends Slack/text notifications

**Control Room** displays these alerts visually and allows action.

---

## Tenant Configuration

### Settings (Control Room → ⚙️)

```
CONTROL ROOM SETTINGS
─────────────────────────────────────────

📊 Health Score Weights
  SLA Compliance: [40]%
  Pipeline Velocity: [30]%
  Response Rates: [20]%
  Stuck Leads: [10]%

🚨 Alert Thresholds
  SLA Warning: [15] minutes
  SLA Critical: [30] minutes
  Stale Deal: [7] days
  Stuck Lead: [14] days

👥 Team Members
  [+ Add Team Member]
  - Daniel (LM) — Targets: 20 calls, 2 appts
  - Kyle (AM) — Targets: 3 appts, 1 contract
  - Esteban (Dispo) — Targets: 2 deals/week

📈 Goals
  Weekly leads target: [50]
  Monthly contracts target: [8]
  Monthly revenue target: [$50,000]

[Save Settings]
```

---

## Mobile View

On mobile, stack cards vertically:
1. Health Score (always visible)
2. Attention Needed (collapsible, shows count badge)
3. Department cards (horizontal scroll)
4. Team (collapsible)
5. Pipeline flow (simplified)

---

## Phase 1 Scope (MVP)

**Include:**
- [x] Health Score banner
- [x] Three department summary cards
- [x] Attention Needed alert panel
- [x] Basic team performance
- [x] Time period toggle

**Defer to Phase 2:**
- [ ] Pipeline flow visualization
- [ ] Trends with charts
- [ ] Custom alert rules
- [ ] Goal tracking
- [ ] Historical comparisons

---

## Design Notes

- **Data refresh:** Real-time for alerts, 1-min for metrics
- **Color system:** 🟢 Green (good), 🟡 Yellow (warning), 🔴 Red (critical)
- **Mobile-first:** Must be glanceable on phone
- **Empty states:** Celebrate when nothing needs attention ("All clear! 🎉")

---

## Questions for Corey

1. Which metrics matter most for the Health Score?
2. Any team targets I should pre-fill?
3. Do you want weekend hours excluded from SLA tracking?
4. Should alerts also push to your phone, or just show here?

---

*This is the business accountability dashboard. For dispo-specific workflow, see `dispo/MANUS-PRD.md`.*
