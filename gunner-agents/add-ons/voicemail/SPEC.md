# Voicemail Bot

## Overview
Processes incoming voicemails: transcribes, summarizes, extracts key info, creates tasks, and alerts appropriate team members. Never miss important call-backs.

## Trigger
- New voicemail received in GHL
- Missed call with voicemail

---

## Agents

### 1. Voicemail Coordinator
**Role:** Orchestrates voicemail processing

**Flow:**
```
Voicemail Received
    ↓
Transcribe audio
    ↓
Extract key info
    ↓
Classify urgency
    ↓
Match to existing contact
    ↓
Create task
    ↓
Alert appropriate person
    ↓
Log to contact record
```

### 2. Transcriber
**Role:** Converts voicemail audio to text

**Transcription Sources:**
- GHL built-in transcription
- Whisper API (if higher quality needed)
- External transcription service

**Output:**
```
VOICEMAIL TRANSCRIPT
--------------------
Duration: 0:42
Quality: Good
Confidence: 95%

"Hi, this is John Smith calling about the house on Main Street. 
I talked to someone last week about selling and wanted to follow up. 
My number is 615-555-1234. I'm available anytime today. Thanks."
```

**Quality Handling:**
- If confidence <80%: Flag for manual review
- If unintelligible: Note "Poor audio quality"
- If background noise: Attempt noise reduction first

### 3. Info Extractor
**Role:** Pulls key information from transcript

**Extracted Fields:**
| Field | Example |
|-------|---------|
| Caller name | John Smith |
| Phone number | 615-555-1234 |
| Property mentioned | Main Street |
| Reason for call | Follow up on selling |
| Callback preference | Available anytime today |
| Urgency signals | None |
| Sentiment | Neutral/positive |

**Extraction Output:**
```json
{
  "callerName": "John Smith",
  "phoneNumber": "615-555-1234",
  "propertyAddress": "Main Street (partial)",
  "callReason": "follow_up",
  "previousContact": true,
  "callbackWindow": "today, anytime",
  "urgency": "normal",
  "sentiment": "positive"
}
```

### 4. Urgency Classifier
**Role:** Determines how quickly callback is needed

**Urgency Levels:**

**URGENT:**
- "Call back ASAP"
- "Emergency"
- "Need to sell this week"
- "Contract expiring"
- "Other buyer interested"

**HIGH:**
- "Today if possible"
- "Important"
- "Time sensitive"
- "Decision ready"

**NORMAL:**
- Standard follow-up
- Questions
- Information requests

**LOW:**
- "When you get a chance"
- "No rush"
- General inquiries

**Urgency Actions:**
| Level | Response Time | Alert |
|-------|---------------|-------|
| Urgent | 15 min | SMS + Call |
| High | 1 hour | SMS |
| Normal | Same day | Task only |
| Low | Next day OK | Task only |

### 5. Contact Matcher
**Role:** Links voicemail to existing contact record

**Matching Logic:**
1. Phone number exact match → Link
2. Name + partial address match → Suggest
3. New caller → Create contact or flag

**Match Output:**
```
CONTACT MATCH: ✅ Found

Existing Contact: John Smith
Phone: 615-555-1234
Property: 123 Main St, Nashville
Stage: Made Offer
Last Contact: 5 days ago
Notes: Waiting on wife decision

Context: Likely calling about offer decision
```

**New Contact:**
```
CONTACT MATCH: ❌ Not Found

Creating new contact...
Name: John Smith
Phone: 615-555-1234
Source: Inbound Call
Status: New Lead

Action: Assign to on-duty LM
```

### 6. Task Creator
**Role:** Creates follow-up tasks from voicemails

**Task Template:**
```
📞 CALLBACK: {{caller_name}}

Phone: {{phone_number}}
Property: {{property_address}}

Voicemail Summary:
{{summary}}

Callback Window: {{callback_preference}}
Urgency: {{urgency_level}}

[Play Voicemail] [View Contact]
```

**Assignment Logic:**
- Existing contact → Assigned owner
- New contact → On-duty LM
- Urgent → Available team member

### 7. Alert Agent
**Role:** Notifies appropriate team members

**Alert by Urgency:**

**Urgent Alert (SMS + notification):**
```
🚨 URGENT CALLBACK NEEDED

John Smith - 615-555-1234
"Other buyer interested, need decision today"

Property: 123 Main St (Made Offer stage)

Call immediately!
```

**High Alert (SMS):**
```
📞 Callback needed today

John Smith - 615-555-1234
RE: 123 Main St
"Ready to discuss offer"

Requested: Call today
```

**Normal (Task only + optional notification):**
```
New voicemail from John Smith (615-555-1234)
RE: Follow up on Main Street property
Task created - due today
```

### 8. Summary Writer
**Role:** Creates concise voicemail summaries for records

**Summary Format:**
```
📞 VOICEMAIL - {{date}} {{time}}

From: {{caller_name}} ({{phone}})
Duration: {{duration}}
Urgency: {{urgency}}

Summary: {{one_line_summary}}

Key Points:
• {{point_1}}
• {{point_2}}

Callback: {{callback_preference}}

[▶️ Play Recording]
```

**Example:**
```
📞 VOICEMAIL - Feb 8, 2026 3:42 PM

From: John Smith (615-555-1234)
Duration: 0:42
Urgency: Normal

Summary: Following up on Main St property discussion from last week.

Key Points:
• Wants to continue conversation about selling
• Available anytime today

Callback: Today, anytime

[▶️ Play Recording]
```

---

## Voicemail Categories

### Seller Callbacks
- Follow-up on previous conversation
- Ready to make decision
- Questions about offer/process
- Scheduling/rescheduling

### New Inquiries
- First-time caller
- Responding to marketing
- Referral mention

### Buyer Calls
- Interest in property
- Showing requests
- Offer questions

### Other
- Wrong number
- Spam/solicitation
- Vendor/partner

**Category Detection → Routing:**
| Category | Route To |
|----------|----------|
| Seller - Existing | Assigned AM/LM |
| Seller - New | On-duty LM |
| Buyer | Dispo team |
| Other | Ignore or admin |

---

## Integration Points

### Inputs
- GHL voicemail recordings
- GHL call logs (missed calls)
- GHL contact database

### Outputs
- GHL contact notes (summary)
- GHL tasks (callbacks)
- Team SMS/notifications
- Voicemail transcript storage

---

## Tenant Configuration

```json
{
  "voicemailBot": {
    "enabled": true,
    "transcriptionService": "ghl_native",
    "alertThresholds": {
      "urgent": {
        "keywords": ["ASAP", "emergency", "urgent", "other buyer"],
        "alertMethod": ["sms", "push"],
        "responseTarget": 15
      },
      "high": {
        "keywords": ["today", "important", "decision"],
        "alertMethod": ["sms"],
        "responseTarget": 60
      },
      "normal": {
        "alertMethod": ["task"],
        "responseTarget": 240
      }
    },
    "routing": {
      "existingContact": "assigned_owner",
      "newContact": "on_duty_lm",
      "buyer": "dispo_team"
    },
    "workingHours": {
      "start": "08:00",
      "end": "19:00"
    },
    "afterHoursHandling": "queue_for_morning"
  }
}
```

---

## Error Handling

| Scenario | Action |
|----------|--------|
| Transcription fails | Flag for manual review, attach audio |
| Poor audio quality | Note in summary, attempt anyway |
| Contact not found | Create new, flag for verification |
| No callback number | Search contact DB, flag if not found |
| Spam detected | Log, don't create task |

---

## Success Metrics

- Transcription accuracy (target: >95%)
- Time to process voicemail (target: <2 min)
- Urgent callback response time
- Callback completion rate
- Missed callback rate (target: <5%)
