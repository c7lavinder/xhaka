# Opportunities Dashboard — Feature Spec (V1)

**Date:** February 12, 2026
**For:** Manus
**Feature:** Three-tier opportunity detection on the main dashboard

---

## Overview

A single dashboard section that surfaces three types of opportunities using color-coded tiers. Designed to be simple, actionable, and zero-config for new tenants — no custom setup required to start getting value.

---

## Design Principle: Zero-Config Onboarding

This feature must work out of the box for any new Gunner customer with minimal setup:
- Detection logic runs on data Gunner already collects (transcripts, grades, call duration, timestamps)
- No CRM integration required for V1 — all detection is internal to Gunner
- Default thresholds ship with sensible defaults (configurable later by admin)
- No training period needed — starts flagging from day one based on rules, not learned behavior

---

## Dashboard Section

### Location
Main dashboard, below Recent Calls or alongside Team Leaderboard.

### Layout
```
┌──────────────────────────────────────────────────────────────┐
│ 🔍 Opportunities                                View All →  │
│    Leads that need attention                                 │
│                                                              │
│  [🔴 Missed (3)]  [🟡 Warning (5)]  [🟢 Possible (2)]      │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │ 🔴 John Smith   [123 Main St]                  2d ago  │  │
│ │ 👤 Chris Segura                                         │  │
│ │                                                         │  │
│ │ ⚠️ Seller mentioned divorce but rep didn't explore.     │  │
│ │ Disqualified on price without anchoring.                │  │
│ │                                                         │  │
│ │ 💡 Call back, dig into life situation. Anchor before    │  │
│ │ discussing numbers.                                     │  │
│ │                                                  [✓] [🗑]│  │
│ └─────────────────────────────────────────────────────────┘  │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │ 🟡 Mary Johnson  [456 Oak Ave]                  1d ago  │  │
│ │ 👤 Daniel Lozano                                        │  │
│ │                                                         │  │
│ │ ⚠️ Seller texted "I'm interested" 26 hours ago.        │  │
│ │ No response from team.                                  │  │
│ │                                                         │  │
│ │ 💡 Respond immediately. Lead is going cold.             │  │
│ │                                                  [✓] [🗑]│  │
│ └─────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

- Tier filter tabs at top (🔴 🟡 🟢) — click to filter, show counts
- Default view: all tiers mixed, sorted by priority score
- Click card → view call details or lead info
- ✓ = handled (moves to history)
- 🗑 = dismiss (moves to history)

---

## Tier 1: 🔴 Missed Opportunities

**Definition:** The call happened and the rep dropped the ball. A lead with potential was lost due to poor execution.

### Detection Rules

| Rule | Trigger | Default Threshold |
|------|---------|-------------------|
| **Premature DQ** | Call ended in DQ AND duration < threshold AND no motivation questions detected | < 3 min |
| **Unexplored Motivation** | Motivation keyword detected in transcript but rep didn't follow up | See keyword list |
| **Weak Objection Handling** | Soft objection detected, rep accepted without handling | See objection list |
| **No Clear Outcome** | Call ended without appointment, firm follow-up, or clear DQ | N/A |
| **Grade vs Signal Gap** | Call graded D/F but AI detected real motivation signals | Grade ≤ 40% + signal detected |

### Motivation Keywords (default set)
```
tired, headache, divorce, separation, inherited, probate, 
behind on payments, can't afford, tenant issues, need to move, 
foreclosure, tax lien, vacant, condemned, code violations,
overwhelmed, stressed, upside down, owe more than
```

### Soft Objections (default set)
```
need to talk to [spouse/partner/family/wife/husband]
working with a realtor/agent
not the right time / maybe later
need to think about it
call me back [without specific date]
```

**Card shows:** Why it was flagged + suggested action from AI.

---

## Tier 2: 🟡 Warning

**Definition:** Operational drop — nothing wrong with the call, but the lead is slipping through the cracks due to lack of follow-through.

### Detection Rules

| Rule | Trigger | Default Threshold |
|------|---------|-------------------|
| **Slow Response** | New lead received, no outbound call or text within threshold | 15 min |
| **Unanswered Callback** | Inbound call from known lead, no return call within threshold | 2 hours |
| **Unresponded Interest** | Lead replied to SMS/text with positive intent, no team response | 1 hour |
| **Stale Lead** | Lead in active pipeline with no activity (calls, texts, notes) | 7 days |
| **No-Show / No Confirm** | Appointment on calendar, no confirmation sent AND no show notes | 24 hours before appt |

### How Detection Works (V1 — Internal Only)
- **Call data:** Gunner already tracks inbound/outbound calls with timestamps
- **Stale leads:** Based on last call activity per contact in Gunner (not CRM)
- **Appointments:** Only if synced into Gunner (skip if not available)
- **SMS/text responses:** Only if Gunner has SMS data (BatchDialer/BatchLeads integration). If not connected, these rules are inactive — no errors, just fewer flags.

**Card shows:** What's stale/dropped + how long it's been + suggested action.

---

## Tier 3: 🟢 Possible Opportunities

**Definition:** The AI sees potential the team might not have recognized. Not a mistake — just a lead worth a second look.

### Detection Rules

| Rule | Trigger | Default Threshold |
|------|---------|-------------------|
| **Price Close to Market** | Seller stated a price within X% of estimated market value (Zestimate, tax assessed, or Gunner's internal estimate if available) | Within 15% |
| **Motivation + Cold Status** | Motivation signals detected in transcript but lead marked as cold/dead/not interested | Any motivation keyword + cold status |
| **Engaged but No Conversion** | Lead had 3+ calls, showed interest on at least one, but no appointment or offer | 3+ calls + interest signal |
| **Repeat Contact** | Seller has called or texted back multiple times without resolution | 2+ inbound contacts |

### Price Detection (V1 — Simple)
- AI extracts any dollar amount the seller mentions in transcript
- Compares to property's tax assessed value (if available from data source) or any known estimate
- If no market data available, this rule is inactive for that lead — **no guessing**
- Future: deeper comp analysis, Zestimate API, etc.

**Card shows:** What the AI noticed + why it thinks there's potential + suggested action.

---

## Scoring & Priority

Each flagged item gets a priority score (0-100) to determine display order:

| Factor | Points |
|--------|--------|
| 🔴 Missed tier | +20 base |
| 🟡 Warning tier | +10 base |
| 🟢 Possible tier | +5 base |
| Strong motivation keyword | +25 |
| Multiple signals stacked | +15 |
| Lead is recent (< 3 days) | +15 |
| Price within market range | +10 |
| Multiple unanswered contacts from seller | +10 |

**Dashboard shows top 10 across all tiers, sorted by score.** "View All" shows the complete list.

---

## Permissions

| Role | Visibility |
|------|------------|
| Lead Generator | Own leads only |
| Lead Manager | Own leads only |
| Acquisition Manager | Team-wide |
| Admin | Team-wide |

---

## User Actions

### Per Card
- **✓ Check off** → Handled, moves to history
- **🗑 Dismiss** → Not relevant, moves to history
- **Click card** → View call detail or lead info

### History
Accessible via "View All → History" tab:

| Lead | Tier | Action | By | Date |
|------|------|--------|----|------|
| John Smith | 🔴 Missed | ✓ Handled | Kyle Barks | 2/12 |
| Mary Johnson | 🟡 Warning | 🗑 Dismissed | Corey | 2/11 |

---

## Data Model

### New Fields (per flagged item)

```json
{
  "opportunityId": "uuid",
  "contactName": "string",
  "propertyAddress": "string",
  "tier": "missed | warning | possible",
  "priorityScore": 0-100,
  "triggerRules": ["premature_dq", "unexplored_motivation"],
  "reason": "string (AI-generated explanation)",
  "suggestion": "string (AI-generated next step)",
  "relatedCallId": "uuid (nullable)",
  "flaggedAt": "timestamp",
  "status": "active | handled | dismissed",
  "resolvedBy": "userId (nullable)",
  "resolvedAt": "timestamp (nullable)"
}
```

---

## Default Configuration (per tenant)

Ships with sensible defaults. Admin can adjust thresholds but doesn't have to.

```json
{
  "opportunities": {
    "enabled": true,
    "maxDashboardDisplay": 10,
    "minPriorityScore": 20,
    "lookbackDays": 30,
    "tiers": {
      "missed": {
        "enabled": true,
        "shortCallThreshold": 180,
        "minGradeForGap": 40
      },
      "warning": {
        "enabled": true,
        "responseSlaMinutes": 15,
        "callbackSlaMinutes": 120,
        "textResponseSlaMinutes": 60,
        "staleLeadDays": 7
      },
      "possible": {
        "enabled": true,
        "priceProximityPercent": 15,
        "minCallsForEngaged": 3
      }
    },
    "motivationKeywords": [
      "tired", "headache", "divorce", "separation", "inherited",
      "probate", "behind on payments", "can't afford", "tenant issues",
      "need to move", "foreclosure", "tax lien", "vacant", "condemned",
      "code violations", "overwhelmed", "stressed", "upside down"
    ]
  }
}
```

**Onboarding flow:** Feature is ON by default with these settings. New customer sees flags immediately from their first graded calls. No setup required.

---

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Same lead flagged in multiple tiers | Show highest tier only (🔴 > 🟡 > 🟢) |
| Lead already re-contacted after flag | Auto-resolve if new call detected |
| Lead marked as won/closed | Don't flag |
| Lead in active pipeline with recent activity | Don't flag as stale |
| No market data available for price comparison | Skip price proximity rule for that lead |
| SMS integration not connected | Warning tier SMS rules inactive (no errors) |
| Admin dismisses | Dismissed for all users |

---

## Implementation

### Phase 1 (V1 — Ship This)
- Three-tier detection with default rules
- Dashboard section with filter tabs and priority sort
- Card UI with property address, AI reason, suggestion
- ✓ and 🗑 actions with history
- Default config that works out of the box
- Role-based visibility

### Phase 2 (V2 — Quarterback View)
- Dedicated tab with expanded sections
- "Hot Right Now" and "Needs Decision" categories
- Learning from admin check-off vs dismiss patterns
- Deeper CRM integration for richer signals
- Analytics on flag-to-action conversion rates

---

## Success Metrics

- % of flags acted on (✓) vs dismissed (🗑) — healthy ratio indicates useful flags
- Leads re-contacted after flagging → conversion rate
- Reduction in stale pipeline leads over time
- Time to first response improvement (Warning tier)

---

*V1 spec complete. Designed for zero-config onboarding and multi-tenant deployment. V2 Quarterback view builds on top of this foundation.*
