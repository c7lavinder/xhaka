# Voicemail Bot

## Overview
Pulls voicemails from **CallRail**, transcribes/summarizes, extracts key info, matches to GHL contacts, creates tasks, and alerts team members. Feeds disposition data to PPL Refund Bot.

## Source
**CallRail** (NOT GHL) — NAH uses CallRail for call tracking and voicemails.

---

## CallRail API Integration

### Authentication
```
Authorization: Token token="267bcdd64628abc9c9c4c43e8a46dca2"
```

### Get Voicemails
```http
GET https://api.callrail.com/v3/a/{account_id}/calls.json?voicemail=true&date_range=today
```

**Key Filters:**
| Filter | Description |
|--------|-------------|
| `voicemail=true` | Only calls with voicemails |
| `answered=false` | Missed calls only |
| `date_range=recent` | Last 30 days (default) |
| `date_range=today` | Today only |
| `start_date` / `end_date` | Custom range |

### Response Fields
```json
{
  "id": 444941612,
  "answered": false,
  "voicemail": true,
  "customer_name": "John Smith",
  "customer_phone_number": "+16155551234",
  "customer_city": "Nashville",
  "customer_state": "TN",
  "tracking_phone_number": "+16155559999",
  "start_time": "2026-02-09T15:30:00.000Z",
  "duration": 45,
  "recording": "https://cdn.callrail.com/v3/a/{account}/calls/{id}/recording.json",
  "recording_duration": 42,
  "recording_player": "https://app.callrail.com/calls/{id}/recording",
  "voicemail_transcription": "Hi, this is John calling about the house...",
  "source": "Google Ads",
  "medium": "paid",
  "campaign": "Nashville Sellers",
  "landing_page_url": "https://newagainhouses.com/sell",
  "company_id": "COM123456",
  "company_name": "New Again Houses Nashville"
}
```

### Get Recording
```http
GET https://api.callrail.com/v3/a/{account_id}/calls/{call_id}/recording.json
```
Returns URL to audio file (MP3/WAV).

### Get Transcription (if available)
CallRail provides `voicemail_transcription` field if transcription is enabled. If not, use Whisper API on the recording.

---

## Trigger Options

### Option A: Polling (Simple)
- Poll CallRail every 5 minutes for new voicemails
- Filter: `voicemail=true&start_date={last_poll_time}`
- Store last processed call ID to avoid duplicates

### Option B: Webhook (Recommended)
CallRail can send webhooks on new calls/voicemails:
```json
{
  "webhook_url": "https://gunner.app/webhooks/callrail",
  "events": ["post_call"]
}
```
Filter for `voicemail: true` in webhook payload.

---

## Processing Flow

```
CallRail Voicemail Received
    ↓
1. Fetch voicemail details from API
    ↓
2. Get/verify transcription
   - Use CallRail transcription if available
   - Fall back to Whisper API if needed
    ↓
3. Extract key info from transcript
   - Caller intent
   - Property mentioned
   - Callback urgency
   - Disposition signals (not selling, wrong number, etc.)
    ↓
4. Match to GHL contact by phone number
   - Found → Link voicemail to contact
   - Not found → Create new contact or flag
    ↓
5. Classify urgency
    ↓
6. Create GHL task for callback
    ↓
7. Alert appropriate team member
    ↓
8. Log summary to GHL contact notes
    ↓
9. Feed disposition data to PPL Refund Bot
```

---

## Agents

### 1. CallRail Poller
**Role:** Fetches new voicemails from CallRail

**Logic:**
```python
def poll_voicemails():
    last_check = get_last_poll_time()
    
    response = callrail.get("/calls.json", params={
        "voicemail": "true",
        "start_date": last_check,
        "per_page": 100
    })
    
    for call in response["calls"]:
        if not already_processed(call["id"]):
            process_voicemail(call)
    
    save_last_poll_time(now())
```

**Frequency:** Every 5 minutes (configurable)

### 2. Transcriber
**Role:** Ensures transcript is available

**Sources (in order):**
1. `voicemail_transcription` from CallRail (if enabled)
2. Whisper API on recording URL
3. Manual review queue (if both fail)

**Output:**
```json
{
  "transcript": "Hi, this is John Smith calling about...",
  "confidence": 0.95,
  "duration_seconds": 42,
  "source": "callrail_native"
}
```

### 3. Info Extractor
**Role:** Pulls key information from transcript

**Extracted Fields:**
| Field | Example |
|-------|---------|
| caller_name | John Smith |
| phone_number | 615-555-1234 |
| property_mentioned | "house on Main Street" |
| call_reason | follow_up / new_inquiry / question |
| callback_preference | "today", "anytime", "after 5pm" |
| urgency_signals | "ASAP", "other buyer", "need decision" |
| disposition_signals | "not selling", "wrong number", "already sold" |
| sentiment | positive / neutral / negative |

**Disposition Detection (for PPL Refund Bot):**
```json
{
  "disposition": "not_selling",
  "confidence": 0.9,
  "evidence": "Caller said 'I changed my mind, not selling anymore'"
}
```

Detected dispositions:
- `not_selling` — "not selling", "changed my mind", "keeping the house"
- `wrong_number` — "wrong number", "don't know what you're talking about"
- `not_owner` — "don't own this", "sold it years ago"
- `already_sold` — "already sold", "under contract"
- `do_not_call` — "stop calling", "remove from list"
- `interested` — positive engagement, wants callback

### 4. GHL Contact Matcher
**Role:** Links voicemail to GHL contact

**Matching Logic:**
1. Search GHL contacts by phone number (exact match)
2. If found → Return contact ID + context
3. If not found → Create new contact or flag for review

**GHL API Call:**
```http
GET /contacts/search?query={phone_number}
Authorization: Bearer {ghl_token}
```

**Match Output:**
```json
{
  "matched": true,
  "contact_id": "abc123",
  "contact_name": "John Smith",
  "pipeline_stage": "Made Offer",
  "assigned_to": "Kyle",
  "last_activity": "2026-02-07",
  "tags": ["ppl", "motivatedsellers", "nashville"]
}
```

### 5. Urgency Classifier
**Role:** Determines callback priority

**Levels:**
| Level | Signals | Response Time | Alert |
|-------|---------|---------------|-------|
| URGENT | "ASAP", "other buyer", "today or never" | 15 min | SMS + Push |
| HIGH | "today", "important", "decision ready" | 1 hour | SMS |
| NORMAL | Standard follow-up, questions | Same day | Task only |
| LOW | "no rush", "when you get a chance" | Next day | Task only |

### 6. Task Creator
**Role:** Creates callback tasks in GHL

**GHL API:**
```http
POST /contacts/{contact_id}/tasks
{
  "title": "📞 Callback: John Smith",
  "body": "Voicemail Summary:\n{{summary}}\n\nCallback: {{preference}}",
  "dueDate": "{{due_date}}",
  "assignedTo": "{{assigned_user_id}}"
}
```

**Assignment Logic:**
- Existing contact → Assigned owner
- New contact → On-duty LM
- Urgent + no owner → First available

### 7. Alert Agent
**Role:** Notifies team members

**Urgent Alert (SMS via GHL):**
```
🚨 URGENT CALLBACK

John Smith - 615-555-1234
"Other buyer interested, needs answer today"

Property: 123 Main St (Made Offer)

Call NOW!
```

**Normal Alert (GHL notification only):**
```
📞 New voicemail from John Smith
RE: 123 Main St
Task created - due today
```

### 8. Summary Writer
**Role:** Logs summary to GHL contact notes

**GHL API:**
```http
POST /contacts/{contact_id}/notes
{
  "body": "📞 VOICEMAIL - Feb 9, 2026 3:42 PM\n\nFrom: John Smith\nDuration: 0:42\nUrgency: Normal\n\nSummary: Following up on Main St offer discussion.\n\nKey Points:\n• Wants to continue conversation\n• Available today anytime\n\n🎧 Recording: {{recording_url}}"
}
```

### 9. PPL Disposition Reporter
**Role:** Feeds disposition data to PPL Refund Bot

When a voicemail indicates a bad lead disposition:
```json
{
  "contact_id": "abc123",
  "phone": "+16155551234",
  "disposition": "not_selling",
  "confidence": 0.9,
  "source": "voicemail",
  "evidence": "Voicemail transcript: 'I changed my mind, not selling the house anymore'",
  "timestamp": "2026-02-09T15:30:00Z",
  "ppl_source": "motivatedsellers",
  "disputable": true
}
```

PPL Refund Bot can then:
1. Match to PPL lead by phone/address
2. Check if within dispute window
3. Queue for dispute filing

---

## Voicemail Categories & Routing

| Category | Detection | Route To |
|----------|-----------|----------|
| Seller - Existing | Contact found, seller tags | Assigned owner |
| Seller - New | No contact, mentions selling | On-duty LM |
| Buyer | Mentions buying, property inquiry | Dispo team |
| Wrong Number | "wrong number", confusion | Log + ignore |
| Spam | Robocall, solicitation | Ignore |
| Not Selling | "not selling", "keep house" | Log disposition → PPL Bot |

---

## Tenant Configuration

```json
{
  "voicemailBot": {
    "enabled": true,
    "source": "callrail",
    "callrail": {
      "apiKey": "{{CALLRAIL_API_KEY}}",
      "accountId": "{{CALLRAIL_ACCOUNT_ID}}",
      "pollIntervalMinutes": 5,
      "useWebhook": false
    },
    "transcription": {
      "preferCallrailNative": true,
      "fallbackToWhisper": true,
      "whisperModel": "whisper-1"
    },
    "urgencyKeywords": {
      "urgent": ["ASAP", "emergency", "other buyer", "today or never"],
      "high": ["today", "important", "decision", "ready to sign"],
      "low": ["no rush", "when you can", "not urgent"]
    },
    "dispositionKeywords": {
      "not_selling": ["not selling", "changed my mind", "keeping", "decided not to"],
      "wrong_number": ["wrong number", "don't know", "never contacted"],
      "not_owner": ["don't own", "sold years ago", "not my house"]
    },
    "alertThresholds": {
      "urgent": { "responseMinutes": 15, "alertMethod": ["sms", "push"] },
      "high": { "responseMinutes": 60, "alertMethod": ["sms"] },
      "normal": { "responseMinutes": 240, "alertMethod": ["task"] }
    },
    "routing": {
      "existingContact": "assigned_owner",
      "newSeller": "on_duty_lm",
      "buyer": "dispo_team"
    },
    "pplIntegration": {
      "enabled": true,
      "feedDispositionsTo": "ppl_refund_bot"
    }
  }
}
```

---

## NAH-Specific Configuration

```json
{
  "callrail": {
    "apiKey": "267bcdd64628abc9c9c4c43e8a46dca2",
    "accountId": "{{NAH_ACCOUNT_ID}}"
  },
  "ghl": {
    "locationId": "hmD7eWGQJE7EVFpJxj4q"
  },
  "team": {
    "lms": ["Daniel", "Chris"],
    "ams": ["Kyle"],
    "dispo": ["Esteban"]
  }
}
```

---

## Integration Points

### Inputs
- CallRail API (voicemails, recordings, transcriptions)
- GHL API (contact lookup, notes, tasks)

### Outputs
- GHL contact notes (voicemail summaries)
- GHL tasks (callbacks)
- Team alerts (SMS/push via GHL)
- PPL Refund Bot (disposition data)

---

## Error Handling

| Scenario | Action |
|----------|--------|
| CallRail API rate limit | Back off, retry with exponential delay |
| Transcription fails | Flag for manual review, still create task |
| GHL contact not found | Create new contact, tag as "voicemail_new" |
| Recording unavailable | Note in summary, process transcript only |
| Webhook missed | Polling catches it on next run |

---

## Success Metrics

- Voicemail processing time (target: <2 min from receipt)
- Transcription accuracy (target: >95%)
- Urgent callback response time (target: <15 min)
- Disposition detection accuracy (feeds PPL refunds)
- Missed callback rate (target: <5%)
- PPL disputes generated from voicemail dispositions

---

## Example: Full Flow

**1. CallRail receives voicemail:**
```json
{
  "id": 123456,
  "voicemail": true,
  "customer_phone_number": "+16155551234",
  "voicemail_transcription": "Hi, this is John. I talked to someone about selling my house on Main Street but I changed my mind. I'm not selling anymore. Please stop calling.",
  "start_time": "2026-02-09T15:30:00Z"
}
```

**2. Info Extractor output:**
```json
{
  "caller_name": "John",
  "disposition": "not_selling",
  "disposition_confidence": 0.95,
  "urgency": "low",
  "callback_needed": false,
  "do_not_call": true
}
```

**3. GHL Contact matched:**
- Contact: John Smith, 123 Main St, Nashville
- Tags: `ppl`, `motivatedsellers`, `nashville`
- Stage: "Made Offer"

**4. Actions taken:**
- ✅ GHL note added with voicemail summary
- ✅ Contact marked DND (do not call)
- ✅ Stage updated to "Dead - Not Selling"
- ✅ PPL Refund Bot notified:
  ```json
  {
    "platform": "motivatedsellers",
    "phone": "+16155551234",
    "disposition": "not_selling",
    "evidence": "Voicemail: 'I changed my mind. I'm not selling anymore.'",
    "action": "queue_for_dispute"
  }
  ```

**5. PPL Refund Bot:**
- Finds matching lead on MotivatedSellers
- Within 10-day window ✓
- Files dispute: "Not Selling" with voicemail transcript as evidence
- Potential refund: $150
