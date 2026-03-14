# CallRail

**Category:** CRM & External
**Status:** 🟢 Active
**Last Updated:** 2026-03-14

## Purpose
Call tracking and voicemail processing for NAH. Captures inbound calls from marketing channels (website, direct mail, etc.), records voicemails, and routes them for processing. The Voicemail Bot uses CallRail as its source.

## Account Details (see TOOLS.md)
- API Key: `267bcdd64628abc9c9c4c43e8a46dca2`
- Base URL: `https://api.callrail.com/v3/`

---

## API Overview

### Authentication
```http
Authorization: Token token=267bcdd64628abc9c9c4c43e8a46dca2
```

### Base URL
```
https://api.callrail.com/v3/a/{account_id}/
```
⚠️ You need your CallRail Account ID. Find it at: callrail.com → Settings → Account Settings → Account ID

---

## Key Endpoints

### Calls
```http
GET /v3/a/{account_id}/calls.json
```
Parameters:
- `start_date`, `end_date` — filter by date range
- `status` — `answered`, `missed`, `voicemail`
- `page`, `per_page` — pagination (max 250/page)

**Fields returned per call:**
- `id` — unique call ID
- `caller_number` — lead's phone
- `called_number` — tracking number called
- `start_time`, `duration` — timing
- `recording` — URL to audio file
- `recording_duration` — length in seconds
- `voicemail` — boolean
- `transcription` — text (if CallRail transcription enabled)
- `tags` — custom tags
- `source` — marketing source (Google, Facebook, Direct Mail, etc.)
- `tracking_number` — which tracking number was called (maps to campaign)

### Voicemails Specifically
```http
GET /v3/a/{account_id}/calls.json?status=voicemail
```

Or filter by `voicemail=true`:
```http
GET /v3/a/{account_id}/calls.json?voicemail=true
```

### Single Call Details
```http
GET /v3/a/{account_id}/calls/{call_id}.json
```
Returns full call detail including recording URL and transcription.

### Download Recording
```http
GET {recording_url}
Authorization: Token token=267bcdd64628abc9c9c4c43e8a46dca2
```
Recording URLs require auth header — they're not publicly accessible.

---

## Webhook System

### Webhook Events
```
call.started        - Call begins ringing
call.answered       - Someone picks up
call.completed      - Call ends (includes duration, recording URL)
call.missed         - Call not answered
```

### Webhook Payload (call.completed)
```json
{
  "event_type": "call.completed",
  "call": {
    "id": "CA123...",
    "start_time": "2026-03-14T10:00:00Z",
    "duration": 42,
    "caller_number": "+16155551234",
    "recording": "https://app.callrail.com/calls/CA123.../recording",
    "voicemail": true,
    "transcription": "Hi, I got a postcard about selling my house..."
  }
}
```

### Webhook Setup
In CallRail → Settings → Integrations → Webhooks:
- URL: Your Xhaka/Gunner endpoint
- Events: Select `call.completed` + `call.missed` (for voicemail bot)
- Retry behavior: CallRail retries on non-200 responses (3 attempts, 30-minute intervals)

---

## Voicemail Bot Implementation Pattern

```typescript
// Webhook handler
app.post('/webhooks/callrail', async (req, res) => {
  const { call } = req.body;
  res.sendStatus(200);  // Acknowledge immediately
  
  if (call.voicemail && call.duration > 5) {
    await processVoicemail(call);
  }
});

async function processVoicemail(call) {
  // 1. Download recording
  const audio = await fetchRecording(call.recording, CALLRAIL_API_KEY);
  
  // 2. Transcribe with Whisper (or use CallRail's built-in transcription)
  const transcript = await transcribeAudio(audio);
  
  // 3. Extract intent with GPT-4o
  const intent = await analyzeVoicemail(transcript, call.caller_number);
  
  // 4. Create/update contact in GHL
  await createGHLContact({ phone: call.caller_number, notes: intent });
  
  // 5. Notify team
  await sendTelegramAlert(`New voicemail from ${call.caller_number}: ${intent.summary}`);
}
```

---

## CallRail Transcription (Built-in Alternative to Whisper)

CallRail offers automatic transcription as a paid add-on:
- Cost: ~$0.05-0.10/minute (⚠️ verify current pricing)
- Quality: Good for phone calls (trained on phone audio)
- Availability: Transcription available in the `transcription` field on the call object
- Tradeoff: Slightly less accurate than Whisper but already done — saves your own transcription costs

**If transcription add-on is enabled on NAH's account:** Check `call.transcription` before calling Whisper — might already be done.

---

## Rate Limits

| Limit | Value |
|-------|-------|
| API calls | 100 requests/minute |
| Concurrent requests | 10 |

For pulling historical call data in bulk, paginate at 250/page with 1-second delays.

---

## Known Gotchas

1. **Recording auth:** Recording URLs are NOT public. Every fetch needs the `Authorization: Token` header. A common mistake is storing the URL and trying to access it without the auth header.

2. **Recording availability lag:** Like GHL, recordings may not be immediately available after call.completed webhook fires. Add a 30-60 second delay before fetching.

3. **Voicemail vs short call:** Duration alone doesn't identify voicemails. Use `voicemail: true` field. A 10-second human answer will have `voicemail: false`.

4. **Account ID required:** Unlike some APIs, CallRail requires the account ID in every URL path. Don't forget it.

5. **API v3 only:** CallRail deprecated v1 and v2. Use v3 exclusively.

6. **Transcription on missed calls:** CallRail transcription only works if recording is enabled. Missed calls go to voicemail only if the number is configured with voicemail — verify NAH's tracking numbers have voicemail enabled.

---

## Smart Use Tips

1. **Source attribution = marketing ROI:** The `source` field on each call tells you which marketing channel (Google Ads, Facebook, direct mail campaign, etc.) generated the call. Pull this daily — it shows Corey which marketing spend is actually producing calls.

2. **Tracking number → campaign mapping:** Each CallRail tracking number maps to a marketing source. Build a lookup table once; don't re-fetch the number list every time.

3. **Webhook + polling:** Same pattern as GHL — webhooks for real-time, nightly poll for reliability. Use call `start_time` as dedup key.

4. **Tag hot voicemails:** After processing a voicemail with intent analysis, use the CallRail API to add a tag to the call (`POST /v3/a/{account_id}/calls/{call_id}/tags.json`). Keeps your CallRail dashboard organized and gives Corey visibility without opening another tool.
