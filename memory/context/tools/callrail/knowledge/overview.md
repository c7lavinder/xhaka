# CallRail — Deep Knowledge Overview

> **Last Updated:** 2026-03-16
> **NAH API Key:** `267bcdd64628abc9c9c4c43e8a46dca2`
> **Purpose at NAH:** Call tracking + voicemail source for the Voicemail Bot (Xhaka pulls voicemails via API)

---

## What Is CallRail?

CallRail is a call tracking, recording, and analytics platform. It sits between marketing channels and your phone system, allowing you to:

- Know **exactly which marketing channel** drove each inbound call
- **Record and transcribe** every call automatically
- **Track voicemails** left on your tracking numbers
- Route calls intelligently based on business rules
- Feed call data into your CRM for attribution

For wholesale RE operators, CallRail answers the critical question: *"Which of my marketing channels is actually producing motivated seller calls — and at what cost?"*

---

## How NAH Uses CallRail

**Primary use: Voicemail Bot source**

NAH's inbound seller calls go to CallRail tracking numbers. When sellers don't connect with the team, they leave voicemails. Xhaka's Voicemail Bot:
1. Polls CallRail API for new voicemails
2. Transcribes and analyzes voicemail content
3. Routes to GHL as a new lead if seller expresses motivation
4. Logs the source (which marketing channel generated the call)

**Secondary use: Marketing attribution**
- Each marketing channel (direct mail, PPL platforms, Google ads, driving for dollars) gets its own CallRail tracking number
- When a seller calls, CallRail captures source → feeds to GHL contact record
- Monthly: Jessica pulls source data for KPI reporting

---

## Core CallRail Concepts

### Tracking Numbers
- Virtual phone numbers assigned to specific marketing sources
- When a seller dials that number, CallRail logs the source, records the call, and forwards to the real destination number (team phone or IVR)
- Types:
  - **Source Tracker:** One number = one source (e.g., dedicated number for direct mail campaign)
  - **Session/Keyword Tracker:** Pool of numbers dynamically swapped on website based on visitor source (Google organic vs paid vs Facebook)

### Dynamic Number Insertion (DNI)
- JavaScript placed on website dynamically swaps the displayed phone number based on how the visitor arrived
- Visitor from Google Ads sees tracking number A; visitor from Facebook sees tracking number B
- CallRail records which source drove the call without any manual work

### Destination Number
- The real phone number calls are forwarded to (team's actual line)
- Sellers call tracking number → CallRail records → forwards to destination

### Call Flow Builder
- Drag-and-drop rules for what happens when a call comes in:
  - Ring team phones
  - Play a message
  - Route to different agents based on time of day
  - Record a custom voicemail if no answer
  - Send SMS acknowledgment to caller

---

## Call Attribution — Which Channel Drove Which Call

CallRail provides a source field on every call record. Common sources NAH tracks:

| Source | CallRail Setup |
|--------|---------------|
| Direct Mail (yellow letters, postcards) | Dedicated tracking number per campaign/county |
| Google Ads (PPC) | DNI + keyword tracking on website |
| Leadzolo (PPL) | Unique tracking number for Leadzolo leads |
| PropertyLeads (PPL) | Unique tracking number for PropertyLeads |
| Driving for Dollars | Unique tracking number for DFD campaigns |
| Google Organic | DNI session tracker |
| Signs / Bandit Signs | Unique tracking number per market |

**Why this matters:** If direct mail costs $5,000/month and generates 80 calls but only 3 deals, while Google Ads costs $1,500 and generates 40 calls and 5 deals — you shift budget. Without call tracking, you're guessing.

---

## Voicemail Processing — Xhaka's Voicemail Bot

### How It Works
1. **Seller calls** a NAH tracking number and no one answers
2. **CallRail records** the voicemail to its servers
3. **Xhaka polls** the CallRail API on a scheduled interval (hourly or per job trigger)
4. **New voicemails detected** → fetched and queued for processing
5. **Transcription** — CallRail's built-in transcription OR external transcription service
6. **Analysis** — Xhaka evaluates transcript for: property mention, motivation signals, callback number
7. **GHL entry** — if voicemail qualifies as a lead, Xhaka creates a GHL contact + conversation note
8. **LM notified** — GHL triggers notification to assigned LM

### Qualifying a Voicemail as a Lead
Signs of a motivated seller voicemail:
- Mentions owning a property + wants to sell
- References financial distress (behind on payments, divorce, inherited, relocating)
- Explicitly asks for a call back or offer
- References having called before (warm re-engagement)

Disqualify if:
- Robocall / automated
- Wrong number
- Calling about something unrelated to selling property
- Too vague to act on

---

## CallRail API — Endpoints Used by Xhaka

**Base URL:** `https://api.callrail.com/v3/a/{account_id}/`
**Auth:** `Authorization: Token token="YOUR_API_KEY"`
**NAH API Key:** `267bcdd64628abc9c9c4c43e8a46dca2`

### Listing All Calls (Primary Endpoint)

```
GET /v3/a/{account_id}/calls.json

Params:
  start_date     - filter by date range (YYYY-MM-DD)
  end_date       - filter by date range
  voicemail      - true/false — filter voicemails only
  per_page       - max 250
  relative_pagination - true (recommended for large datasets)

Returns per call:
  id                   - unique call ID
  answered             - true/false
  voicemail            - true/false (KEY FIELD for voicemail bot)
  direction            - inbound/outbound
  duration             - seconds
  start_time           - ISO timestamp
  customer_phone_number - caller's number
  customer_name        - if known
  tracking_phone_number - which of NAH's numbers they called
  recording            - URL to recording audio file
  recording_duration   - seconds
  transcription        - text (requires field selection + Conversation Intelligence plan)
  source               - marketing source attribution
  source_name          - human-readable source name
  company_id           - CallRail company identifier
```

### Filtering Voicemails Only

```
GET /v3/a/{account_id}/calls.json?voicemail=true&start_date=2026-03-15

This is the core Voicemail Bot query. Returns only voicemail calls from specified date.
```

### Retrieving a Single Call

```
GET /v3/a/{account_id}/calls/{call_id}.json

Optional fields param: ?fields=transcription,sentiment,company_name

Returns same fields as listing + any additional requested fields.
```

### Field Selection for Transcription

```
GET /v3/a/{account_id}/calls.json?fields=transcription,voicemail,recording

Transcription field returns the full text of the voicemail or call recording.
Requires: Premium Conversation Intelligence plan.
```

### Pagination (Relative — Recommended)

```
GET /v3/a/{account_id}/calls.json?relative_pagination=true&per_page=250

Response includes:
  next_page      - URL for next batch
  has_next_page  - false when done

Loop until has_next_page = false
```

### Authentication Header

```python
headers = {
    "Authorization": "Token token=267bcdd64628abc9c9c4c43e8a46dca2",
    "Content-Type": "application/json"
}
```

---

## Scoring Inbound Leads by Call Behavior

Not all inbound calls are equal. CallRail data lets us score quality:

| Signal | Score Weight | Meaning |
|--------|-------------|---------|
| Call duration > 60 sec | +3 | Had a real conversation |
| Called back 2+ times | +2 | High motivation |
| Left voicemail | +1 | Made effort to connect |
| Called during business hours | +1 | Serious intent |
| Duration < 10 sec | -2 | Hung up immediately |
| Blocked number | -1 | Can't call back |
| First-time caller | 0 | Neutral |
| Returning caller (prior history) | +2 | Re-engaged |

**High-score calls (5+):** Prioritize for immediate LM callback — hot leads
**Mid-score (2–4):** Standard LM queue
**Low-score (<2):** Voicemail bot processes, creates GHL lead, auto-sequence starts

---

## CallRail + GHL Integration

CallRail integrates natively with GHL:

1. **GHL Settings** → Integrations → CallRail
2. Connect via API key
3. When a tracked call comes in, CallRail fires a webhook to GHL
4. GHL creates/updates contact with:
   - Caller phone number
   - Source/tracking number
   - Call recording link
   - Duration
5. GHL workflow can trigger based on call events:
   - "New call received" → assign to LM + start follow-up sequence
   - "Missed call" → trigger Missed Call Text-Back automation
   - "Voicemail received" → alert Xhaka's voicemail bot queue

**Missed Call Text-Back (GHL native):**
When a seller calls and no one answers, GHL instantly sends an automated SMS:
"Hey! We missed your call at New Again Houses. We buy houses as-is for cash. What's the best time to reach you?"
This captures leads who would otherwise hang up and call a competitor.

---

## Best Practices

1. **One tracking number per source, always.** Never share numbers across campaigns. Attribution breaks if you do.

2. **Record everything.** Call recordings are gold for training, dispute resolution, and Gunner AI coaching integration.

3. **Enable transcription.** Even imperfect transcriptions let Xhaka's voicemail bot analyze content at scale without human listening. Worth the cost.

4. **Poll for new voicemails on a schedule.** Don't rely on webhooks alone (they can fail). Run a fallback scheduled poll every hour to catch anything missed.

5. **Expire old tracking numbers.** If a campaign is dead, retire the number. Don't pay for numbers that aren't generating data.

6. **Tag calls with outcome.** After LM calls back and has a conversation, log outcome back to CallRail (or at minimum to GHL). Closes the attribution loop.

7. **Monitor answer rates by time of day.** CallRail heatmap shows when inbound calls peak. Ensure team coverage aligns with peak hours (often 10am–12pm and 4–6pm).

8. **Use DNI on the NAH website.** Every website visitor sees a unique tracking number. When they call, you know exactly how they found you.

---

## CallRail Plans Relevant to NAH

| Feature | Call Tracking Plan | Conversation Intelligence Plan |
|---------|-------------------|-------------------------------|
| Call tracking + attribution | ✅ | ✅ |
| Call recording | ✅ | ✅ |
| Basic reporting | ✅ | ✅ |
| Voicemail detection | ✅ | ✅ |
| Transcription | ❌ | ✅ |
| Sentiment analysis | ❌ | ✅ |
| Keyword spotting | ❌ | ✅ |

**Recommendation:** Conversation Intelligence plan — transcription is essential for voicemail bot to work without human review of every recording.

---

## API Rate Limits

- CallRail default rate limits apply per API key
- Exceeding limits returns 429 Too Many Requests
- **Strategy:** Cache voicemail data locally. Don't poll more than once per 15 minutes. Use pagination (per_page=250) to minimize request count.
- For historical pulls, paginate with relative_pagination=true and build locally.
