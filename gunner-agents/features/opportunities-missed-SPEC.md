# Opportunities Missed — Dashboard Feature Spec

**Date:** February 9, 2026  
**For:** Manus  
**Feature:** New dashboard section identifying potentially missed leads

---

## Overview

Add an "Opportunities Missed" section to the Gunner dashboard that uses AI to identify leads that may have been disqualified prematurely or where subtle motivation signals were missed. Helps catch deals that fell through the cracks.

---

## Problem Statement

Reps sometimes:
- Disqualify too quickly without extracting motivation
- Miss subtle buying signals in conversation
- Give up on price objections without proper anchoring
- Don't dig into "need to talk to spouse" or other soft objections
- End calls without clear next steps

These leads get marked as dead but may still have potential. Currently there's no way to surface them for a second look.

---

## Solution

AI reviews all graded calls and flags leads where:
1. Disqualification happened without full qualification
2. Motivation signals were mentioned but not explored
3. Objections weren't fully handled before ending
4. Call ended without clear outcome (soft DQ)

Surface these on the dashboard for manager review and potential re-engagement.

---

## Dashboard Section Design

### Location
Below "Recent Calls" on main dashboard, or as a dedicated card alongside Team Leaderboard.

### Section Header
```
🔍 Opportunities Missed
Leads that may deserve a second look
```

### Card Layout (per lead)
```
┌─────────────────────────────────────────────────────┐
│ John Smith                              2 days ago  │
│ Called by: Chris Segura                             │
│                                                     │
│ ⚠️ WHY FLAGGED:                                     │
│ "Seller mentioned wife is tired of maintaining      │
│ rental property, but rep didn't explore this        │
│ motivation. Disqualified on price without           │
│ anchoring."                                         │
│                                                     │
│ 💡 SUGGESTED ACTION:                                │
│ "Call back and dig into rental management           │
│ frustration. Use price anchor before discussing     │
│ numbers."                                           │
│                                                     │
│ [Listen to Call]  [View Contact]  [Dismiss]         │
└─────────────────────────────────────────────────────┘
```

### Empty State
```
✨ No missed opportunities detected
Your team is doing a thorough job qualifying leads!
```

---

## Detection Logic

### Trigger Conditions (flag if ANY match)

**1. Premature Disqualification**
- Call < 3 minutes AND ended in DQ
- No motivation questions asked before DQ
- Price discussed before property condition gathered

**2. Unexplored Motivation Signals**
Keywords/phrases detected but not followed up:
- "tired of..."
- "headache"
- "divorce" / "separation"
- "inherited" / "probate"
- "behind on payments"
- "need to move"
- "can't afford repairs"
- "tenant issues"
- Seller mentioned a problem but rep didn't ask "tell me more" or "how has that affected you?"

**3. Weak Objection Handling**
- Seller said "need to talk to [spouse/partner/family]" → rep didn't confirm decision-maker or set firm callback
- Seller mentioned realtor/agent → rep didn't handle objection
- Seller gave high price → rep accepted without anchoring
- "Not right now" / "maybe later" → no firm follow-up set

**4. No Clear Outcome**
- Call ended without: appointment, clear DQ, or scheduled follow-up
- Rep said "I'll follow up" without specific date/time
- Seller said "call me back" without commitment

**5. AI Confidence Gap**
- Call graded D or F
- But AI detected potential motivation signals in transcript
- Gap between what was said vs what was done

---

## Scoring & Prioritization

Each flagged lead gets an "opportunity score" (0-100):

| Factor | Points |
|--------|--------|
| Strong motivation keyword detected | +30 |
| Multiple motivation signals | +20 |
| Short call with no qualification | +15 |
| Price objection without anchor | +15 |
| No follow-up scheduled | +10 |
| Recent lead (< 7 days) | +10 |

**Display Priority:**
- Show top 5 by score on dashboard
- "View All" link to full list

---

## Data Requirements

### Inputs
- Call transcripts (already have)
- Call grades (already have)
- Call duration (already have)
- Call outcome/disposition (need to confirm available)
- Contact record from GHL (already synced)

### New Fields to Track
- `opportunityFlag`: boolean
- `opportunityScore`: number (0-100)
- `opportunityReason`: string (AI explanation)
- `opportunitySuggestion`: string (recommended action)
- `opportunityDismissed`: boolean (user dismissed)
- `opportunityDismissedBy`: userId
- `opportunityDismissedAt`: timestamp

---

## User Actions

### On Each Card
1. **Listen to Call** → Opens call detail page
2. **View Contact** → Opens GHL contact (or internal contact view)
3. **Dismiss** → Removes from list (with optional reason)
4. **Reassign** → Assign to different rep for callback (optional v2)

### Dismiss Flow
```
Are you sure you want to dismiss this opportunity?

○ Already re-contacted
○ Confirmed not a fit
○ Bad contact info
○ Other: [____________]

[Cancel] [Dismiss]
```

Dismissed opportunities don't reappear but are logged for analytics.

---

## Analytics (Future)

Track over time:
- Opportunities flagged per week
- Opportunities acted on vs dismissed
- Re-contacted leads → conversion rate
- Which reps generate most missed opportunities
- Which miss patterns are most common

---

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Same lead flagged multiple times | Show most recent call only |
| Lead already re-contacted | Don't flag again (check for newer calls) |
| Lead marked as won/closed | Don't flag |
| Lead in active pipeline | Don't flag (already being worked) |
| Admin dismisses | Dismissed for all users |

---

## Configuration (per tenant)

```json
{
  "opportunitiesMissed": {
    "enabled": true,
    "maxDisplayed": 5,
    "minScore": 40,
    "lookbackDays": 30,
    "autoFlagShortCalls": true,
    "shortCallThreshold": 180,
    "motivationKeywords": [
      "tired", "headache", "divorce", "inherited", 
      "probate", "behind", "can't afford", "tenant"
    ]
  }
}
```

---

## Implementation Notes

### Phase 1 (MVP)
- Flag based on call duration + grade + keyword detection
- Simple dashboard card (top 5)
- Dismiss functionality
- Link to call detail

### Phase 2 (Enhanced)
- Deeper AI analysis of transcript flow
- Opportunity scoring refinement
- Reassign to different rep
- Analytics dashboard
- Re-contact tracking

---

## Success Metrics

- % of flagged opportunities that get re-contacted
- Conversion rate of re-contacted opportunities
- Reduction in "quick DQ" calls over time
- User engagement with feature (views, actions taken)

---

## Questions for Corey

1. Should dismissed opportunities be visible to anyone, or just the dismisser?
2. Should reps see their own missed opportunities, or only managers?
3. Any specific motivation keywords to add for your market?
4. Want email/SMS alert when high-score opportunity is flagged?

---

## Mockup Reference

```
┌──────────────────────────────────────────────────────────────┐
│ 🔍 Opportunities Missed                          View All → │
│    Leads that may deserve a second look                      │
├──────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────┐ ┌─────────────────────────┐     │
│ │ John Smith        2d    │ │ Mary Johnson      4d    │     │
│ │ Chris Segura            │ │ Daniel Lozano           │     │
│ │                         │ │                         │     │
│ │ ⚠️ Rental frustration   │ │ ⚠️ Mentioned divorce    │     │
│ │ not explored            │ │ but wasn't probed       │     │
│ │                         │ │                         │     │
│ │ [Call] [View] [✕]       │ │ [Call] [View] [✕]       │     │
│ └─────────────────────────┘ └─────────────────────────┘     │
└──────────────────────────────────────────────────────────────┘
```

---

Ready to build. 🚀
