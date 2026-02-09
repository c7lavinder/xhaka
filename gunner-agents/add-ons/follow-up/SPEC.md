# Follow Up Bot

## Overview
Intelligent follow-up system that mirrors and enhances GHL follow-up workflows. Manages nurture sequences, detects re-engagement signals, and automatically re-qualifies leads when ready.

## Current State (GHL)
- Follow Up Organization workflow (13,847 enrolled)
- 9 disposition paths (1 Month, 4 Month, 1 Year, Ghosted, etc.)
- Follow Up Automation workflow (SMS drip with A/B testing)
- Manual bucket moves based on LM judgment

## Bot Enhancement
- Smarter bucket transitions based on engagement signals
- Auto-detection of "ready to re-engage"
- Sentiment analysis on responses
- Dynamic message personalization
- Re-qualification triggers

---

## Agents

### 1. Follow-Up Coordinator
**Role:** Orchestrates all follow-up activities

**Responsibilities:**
- Monitor all leads in follow-up buckets
- Dispatch appropriate drip sequences
- Watch for engagement signals
- Trigger re-qualification when ready

### 2. Drip Manager
**Role:** Executes follow-up message sequences

**Sequences by Bucket:**

**1 Month Bucket** (high intent, close to ready)
| Day | Channel | Message Type |
|-----|---------|--------------|
| 1 | SMS | Check-in: "Still thinking about selling?" |
| 4 | SMS | Value add: Market update |
| 8 | Email | Case study: Similar seller success |
| 12 | SMS | Soft ask: "Any changes?" |
| 18 | Call | LM outbound (task created) |
| 25 | SMS | Urgency: "End of month, circling back" |
| 30 | → | Re-evaluate bucket |

**4 Month Bucket** (moderate intent, not ready yet)
| Week | Channel | Message Type |
|------|---------|--------------|
| 1 | SMS | "Staying in touch" |
| 4 | Email | Market update |
| 8 | SMS | Check-in |
| 12 | Email | Educational content |
| 16 | SMS + Call Task | Re-qualification attempt |

**1 Year Bucket** (low intent, long nurture)
| Month | Channel | Message Type |
|-------|---------|--------------|
| 1 | Email | "Here if you need us" |
| 3 | SMS | Market update |
| 6 | Email | Success story |
| 9 | SMS | Check-in |
| 12 | Call Task | Annual re-qualification |

**Ghosted Bucket** (no response pattern)
| Attempt | Channel | Message Type |
|---------|---------|--------------|
| 1 | SMS | "Did we lose you?" |
| 7 days | Email | Breakup email |
| 14 days | SMS | Final attempt |
| 21 days | → | Move to 1 Year or Archive |

### 3. Engagement Monitor
**Role:** Watches for signals that lead is warming up

**Signals to Detect:**
- Reply to SMS/email (any response)
- Inbound call
- Email open (multiple opens = interest)
- Link click
- Website visit (if tracked)
- Voicemail left for us
- Property status change (listed → delisted)

**Signal Scoring:**
| Signal | Points |
|--------|--------|
| Direct reply | +50 |
| Inbound call | +75 |
| Email open (3+) | +15 |
| Link click | +25 |
| Property delisted | +40 |
| No activity 30 days | -20 |

**Threshold:** 50+ points = trigger re-qualification

### 4. Response Analyzer
**Role:** Analyzes responses to determine intent and sentiment

**Classification:**
- **Positive:** "Yes, let's talk" / "I'm ready" / "Call me"
- **Neutral:** "Not yet" / "Maybe later" / Questions
- **Negative:** "Stop texting" / "Not interested" / "Remove me"
- **Info Request:** "What's your offer?" / "How does it work?"

**Actions by Classification:**
| Classification | Action |
|----------------|--------|
| Positive | → Hot lead, immediate LM task |
| Neutral | Continue sequence, note response |
| Negative | Stop sequence, move to DNW or 1 Year |
| Info Request | Send info, continue sequence |
| Unsubscribe request | Comply immediately, tag DNC |

### 5. Bucket Transitioner
**Role:** Moves leads between buckets based on rules

**Transition Rules:**

| From | Trigger | To |
|------|---------|-----|
| 1 Month | No response after 30 days | 4 Month |
| 1 Month | Positive response | → Re-qualify (Working Lead) |
| 1 Month | "Not for 6 months" | 4 Month |
| 4 Month | No response after 120 days | 1 Year |
| 4 Month | Positive response | → Re-qualify |
| 4 Month | "Maybe next year" | 1 Year |
| 1 Year | Positive response | → Re-qualify |
| 1 Year | No response after 365 days | Archive |
| Ghosted | Any response | → Assess and route |
| Ghosted | No response 21 days | 1 Year |
| Any | "Not interested" / hostile | DNW |
| Any | Unsubscribe | DNC list |

### 6. Re-Qualification Trigger
**Role:** Initiates re-qualification process when lead shows readiness

**Trigger Conditions:**
- Engagement score hits threshold
- Positive response detected
- Lead requests callback
- Property status changes
- Time-based (end of bucket cycle)

**Actions:**
1. Move to "Working Lead" stage
2. Create high-priority task for LM
3. Generate fresh Pre-Call Brief
4. Notify LM: "Lead re-engaged: [Name] - [Signal]"

---

## Message Personalization

### Variables Available
- `{{first_name}}`
- `{{property_address}}`
- `{{last_contact_date}}`
- `{{original_motivation}}`
- `{{days_since_last_contact}}`
- `{{local_market_trend}}`

### Example Personalized Message
```
Hi {{first_name}}, it's been {{days_since_last_contact}} days since we talked about {{property_address}}. 

I know you mentioned {{original_motivation}} - just checking if anything's changed?

Market update: Nashville prices are {{local_market_trend}} this month.

Reply if you'd like to chat!
```

---

## Compliance

### DNC Handling
- Immediate stop on "STOP" or unsubscribe
- Tag contact as DNC
- Remove from all sequences
- Log compliance action

### Frequency Limits
- Max 2 SMS per week per lead
- Max 1 email per week per lead
- No contact before 8 AM or after 8 PM local time
- Respect holidays

### Opt-Out Language
Every SMS includes: "Reply STOP to opt out"

---

## Tenant Configuration

```json
{
  "followUpBot": {
    "enabled": true,
    "buckets": {
      "oneMonth": {
        "enabled": true,
        "sequence": "aggressive",
        "maxDays": 30
      },
      "fourMonth": {
        "enabled": true,
        "sequence": "moderate",
        "maxDays": 120
      },
      "oneYear": {
        "enabled": true,
        "sequence": "light",
        "maxDays": 365
      },
      "ghosted": {
        "enabled": true,
        "maxAttempts": 3,
        "moveToAfter": "oneYear"
      }
    },
    "engagementThreshold": 50,
    "reQualifyNotify": ["assigned_lm"],
    "respectQuietHours": true,
    "quietHoursStart": "20:00",
    "quietHoursEnd": "08:00",
    "timezone": "America/Chicago"
  }
}
```

---

## Integration with Existing GHL Workflows

### Coexistence Strategy
- Bot monitors GHL workflow actions
- Bot can trigger GHL workflows OR replace them
- Phase 1: Bot monitors + supplements
- Phase 2: Bot replaces GHL drip logic

### Sync Points
- Read: GHL workflow enrollment, stage changes
- Write: Stage moves, tags, tasks, notes

---

## Success Metrics

- Re-engagement rate (leads returning from follow-up)
- Response rate by bucket
- Time to re-qualification
- Unsubscribe rate (keep <2%)
- Conversion rate (follow-up → contract)
