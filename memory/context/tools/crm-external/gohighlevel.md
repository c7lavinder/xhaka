# GoHighLevel (GHL)

**Category:** CRM & External
**Status:** 🟢 Active
**Last Updated:** 2026-03-14

## Purpose
Primary CRM for New Again Houses. Handles ALL pipeline conversations — inbound/outbound calls and SMS with leads. Also the source system for Gunner's call recordings.

## Usage in Stack
- **NAH:** Contact management, pipeline, call/SMS conversations
- **Gunner:** Pulls call recordings via webhook → transcribes → grades
- **Xhaka:** Operator agent reads GHL for IDs, config verification

---

## API Overview

### Authentication
- **API v1:** Agency/Location API keys (legacy, still works)
- **API v2 (current):** OAuth 2.0 with scopes — use this for new integrations
- **Agency API Key** (in TOOLS.md): Full access to NAH location

### Base URLs
- V1: `https://rest.gohighlevel.com/v1/`
- V2: `https://services.leadconnectorhq.com/` (preferred)

### Rate Limits
- **Standard:** 100 requests/minute per location
- **Burst allowed:** Short spikes above 100 RPM are tolerated
- **429 handling:** GHL retries webhooks automatically on 429 responses (with randomized jitter) for Marketplace apps — but for custom webhooks you must handle retries yourself
- **Recommendation:** Add exponential backoff on any polling loop. Don't hammer the API.

---

## Webhook System

### Webhook Reliability
- GHL sends webhooks on a **best-effort basis** — not guaranteed delivery
- For Marketplace apps: **automatic retry on 429** with jitter (announced 2025)
- For custom location webhooks: **no automatic retry** — if your endpoint is down, you miss the event
- **Recommendation:** Gunner should implement an idempotency check (`call_sid` or similar unique ID) so re-processing a webhook is safe

### Key Webhook Events for Gunner
```
InboundMessage          - SMS/call from lead
OutboundCall.Completed  - Call ended (includes recording URL)
CallStatus              - Real-time call status changes
```

### Call Recording Webhooks — Known Issues

**⚠️ Recording URL delay:** When a call ends, GHL fires `OutboundCall.Completed` immediately, but the recording may not be available at the URL for 30-90 seconds (transcoding lag). 

**Fix pattern:**
```
1. Receive webhook → store call metadata + recording URL
2. Queue a delayed job (90 second delay)
3. Job fetches recording URL → confirm it returns 200
4. If 404 → retry with exponential backoff (max 5 attempts)
5. Then send to Whisper for transcription
```

**⚠️ Recording URL format:** GHL recording URLs are pre-signed S3 URLs with ~1 hour expiry. Fetch and store the audio file immediately after confirmed availability — don't store the URL and fetch later.

**⚠️ Missing recordings:** Not all calls produce recordings. Check: (1) recording enabled for the phone number, (2) call duration > 0 seconds, (3) call type is voice (not voicemail-only). Filter on `duration > 30` to skip accidental pickups.

---

## Key API Endpoints for Gunner/Xhaka

```
GET  /v1/contacts/{id}                    - Contact details
GET  /v1/contacts/?query=...              - Search contacts
GET  /v1/conversations/?locationId=...    - List conversations
GET  /v1/conversations/{id}/messages      - Messages in conversation
GET  /v1/calls/?locationId=...            - Call history (includes recording URLs)
POST /v1/contacts/                         - Create contact
POST /v1/conversations/messages           - Send message
```

### Pulling Call Recordings Programmatically
```typescript
// Get calls from GHL API (polling fallback if webhook missed)
const response = await fetch(
  `https://rest.gohighlevel.com/v1/calls/?locationId=${LOCATION_ID}&startDate=${start}&endDate=${end}`,
  { headers: { Authorization: `Bearer ${GHL_API_KEY}` } }
);
```

---

## GHL for NAH — Key Config Facts

- **Location:** New Again Houses Nashville
- **OTP codes go to spam** — always check spam folder for GHL verification emails
- **Xhaka is READ ONLY** unless Corey explicitly approves an action
- Sub-account vs Agency: Xhaka has access at the sub-account (location) level

---

## Known Gotchas

1. **V1 vs V2 API inconsistency:** Some endpoints only exist in V1, others in V2. Check both docs when something seems missing.

2. **Conversation IDs are not Contact IDs:** They're separate objects. A contact can have multiple conversations.

3. **Webhook IP allowlisting:** GHL doesn't publish a fixed IP range for webhooks — you can't allowlist by IP. Use webhook signature verification instead (HMAC key in webhook settings).

4. **API key scope:** Agency API keys have broad access — treat as a secret. If Gunner ever becomes a public app, use OAuth per-location tokens.

5. **Call recording availability by plan:** Recording is a paid add-on feature. If calls aren't recording, check the GHL subscription tier.

---

## Smart Use Tips

1. **Webhook + polling hybrid:** Set up GHL webhooks for real-time, but also run a nightly poll of the calls API to catch any missed webhooks. Compare by call SID. This is how enterprise integrations stay reliable.

2. **Use Conversations API for context:** Before grading a call, pull the contact's recent conversation history from GHL. This gives the AI context about where the lead is in the pipeline, improving coaching relevance.

3. **Custom Fields:** GHL supports custom contact fields. Consider writing Gunner's call grade back to a custom field on the contact — makes it visible in GHL without needing to open Gunner.
