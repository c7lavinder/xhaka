# MLS Monitor Bot

## Overview
Monitors MLS status for properties in your pipeline. Alerts when leads list their property, deals get relisted, or status changes. Prevents surprises and enables timely pivots.

## Design Principle: Zero-Config Ready
- Automatically monitors all pipeline properties
- No MLS subscription required (uses public feeds)
- Instant alerts, no setup needed
- Works silently in background

---

## Agents

### 1. Monitor Coordinator
**Role:** Manages property watchlist

**Auto-Watchlist:**
Automatically monitors every property where:
- Lead is in active pipeline
- Deal is under contract
- Recent follow-up (last 90 days)

**Watchlist Size:** Unlimited (client doesn't manage this)

### 2. MLS Scanner
**Role:** Checks listing status

**Data Sources:**
- Zillow (listed status)
- Realtor.com (listing details)
- Redfin (status changes)
- Direct MLS feed (if integrated)

**Check Frequency:**
- Active pipeline: Daily
- Follow-up leads: Weekly
- Under contract: Daily

### 3. Status Detector
**Role:** Identifies status changes

**Statuses Tracked:**
| Status | Meaning |
|--------|---------|
| Not Listed | No active listing |
| Coming Soon | Pre-market |
| Active | Listed for sale |
| Pending | Under contract (not us) |
| Sold | Closed sale |
| Expired | Listing expired |
| Withdrawn | Taken off market |

**Change Detection:**
```
BEFORE: Not Listed
AFTER: Active

CHANGE DETECTED: Property listed!
```

### 4. Alert Manager
**Role:** Sends timely notifications

**Alert Types:**

**🚨 Pipeline Lead Listed:**
```
⚠️ LEAD JUST LISTED

John Smith's property is now on MLS!

Property: 123 Main St, Nashville
List Price: $299,000
Agent: Jane Doe, Keller Williams
DOM: Just listed

Your Status: Hot Lead (Made Offer)
Your Offer: $245,000

Action Needed:
• Call John - acknowledge listing
• Discuss if they want backup offer
• Adjust strategy if needed

[View Listing] [Call John]
```

**🚨 Under Contract - Relisted:**
```
🚨 UC DEAL ON MLS!

A property you have Under Contract just appeared on MLS!

Property: 456 Oak Ave
List Price: $185,000

Your Contract: $175,000

This could mean:
• Seller breach (serious)
• Agent mistake (fixable)
• Old listing (verify)

URGENT: Contact seller and title immediately!
```

**📍 Status Change:**
```
📍 STATUS CHANGE

Property: 789 Pine St (Follow-up lead)
Change: Active → Expired

The listing expired after 90 days!

Seller may be frustrated now.
Good time to re-engage?

[View Lead] [Create Task]
```

**✅ Delisted:**
```
✅ LISTING REMOVED

Property: 321 Elm St (4-month follow-up)
Change: Active → Withdrawn

Listing withdrawn after 45 days.

Seller may be more motivated now!
Consider reaching out.

[Create Task]
```

### 5. Follow-Up Trigger
**Role:** Creates actionable tasks

**Auto-Tasks by Scenario:**

| Scenario | Task Created |
|----------|--------------|
| Lead listed | "Call [name] - property listed" (High priority) |
| Listing expired | "Re-engage [name] - listing expired" |
| Listing withdrawn | "Call [name] - listing withdrawn" |
| UC on MLS | "URGENT: [property] on MLS - investigate" |
| Follow-up delisted | "Re-qualify [name] - off market" |

---

## Alert Priority

**URGENT (immediate SMS + notification):**
- UC deal appears on MLS
- Hot lead lists property

**HIGH (same-day notification):**
- Working lead lists property
- Made offer lead lists

**NORMAL (daily digest):**
- Follow-up lead lists
- Status changes (expired, withdrawn)

**LOW (weekly summary):**
- 1-year follow-up lists
- Archived leads list

---

## Digest Reports

### Daily MLS Summary
```
📋 MLS CHANGES - {{date}}

NEW LISTINGS (your pipeline):
• 123 Main St (Hot Lead) - $299K - ⚠️ Action needed
• 456 Oak Ave (Follow-up) - $185K

STATUS CHANGES:
• 789 Pine St: Active → Expired
• 321 Elm St: Active → Withdrawn

NO CHANGES: 142 properties monitored

[View All]
```

### Re-Engagement Opportunities
```
🎯 RE-ENGAGE OPPORTUNITIES

These leads' listings failed - they may be motivated now:

1. John Smith - 123 Main
   Listed 90 days, expired
   Original convo: "Wanted $300K"
   
2. Jane Doe - 456 Oak
   Listed 60 days, withdrew
   Original convo: "Not motivated"

[Create Follow-up Tasks]
```

---

## Tenant Onboarding

### Required (0 things):
- Works automatically from pipeline data

### Auto-Configured:
- All pipeline properties monitored
- Alerts enabled by default
- Daily checks active

### Optional Customization:
- Adjust alert priorities
- Add/remove from watchlist
- Change check frequency
- Custom alert rules

---

## Integration Points

### Inputs
- GHL Contacts (property addresses)
- GHL Opportunities (pipeline deals)
- Public MLS feeds

### Outputs
- SMS/notification alerts
- GHL tasks (follow-ups)
- GHL notes (listing history)
- Daily/weekly digests

---

## Tenant Configuration

```json
{
  "mlsMonitorBot": {
    "enabled": true,
    "autoConfigured": true,
    "watchlistSource": "pipeline_auto",
    "checkFrequency": {
      "activePipeline": "daily",
      "followUp": "weekly",
      "underContract": "daily"
    },
    "alerts": {
      "urgentSms": ["uc_listed", "hot_lead_listed"],
      "highPriority": ["working_lead_listed", "made_offer_listed"],
      "normalDigest": ["expired", "withdrawn", "follow_up_listed"]
    },
    "autoTasks": {
      "enabled": true,
      "assignTo": "lead_owner"
    }
  }
}
```

---

## Success Metrics

- Alert response time
- Deals saved from MLS competition
- Re-engagement conversion (expired listings)
- False positive rate (target: <5%)
