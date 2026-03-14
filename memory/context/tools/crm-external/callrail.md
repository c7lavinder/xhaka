# CallRail

**Category:** CRM & External
**Status:** 🟢 Active (NAH voicemails)

## Purpose
Call tracking and voicemail management for NAH. Captures inbound calls, voicemails, tracks attribution.

## API Capabilities
- Base URL: `https://api.callrail.com/v3`
- Auth: API key `267bcdd64628abc9c9c4c43e8a46dca2` (header: `Authorization: Token token=...`)
- Pull calls: `/a/{account_id}/calls.json` — filter by date, direction, answered status
- Pull voicemails: calls with `voicemail: true`
- Pull recordings: recording URL in call object
- Webhooks: real-time call events

## Voicemail Bot Use Case
- Pull voicemails via API → transcribe with Whisper → classify intent → route to GHL contact
- Polling: GET /calls?voicemail=true&start_date=... every 15 min
- Or: webhook on call_completed event

## Gotchas
- Recording URLs expire after 24h — download immediately if archiving
- Account ID required for all endpoints — find in CallRail dashboard URL

## Smart Tip
Wire the voicemail webhook first. Real-time beats polling for lead response time. A voicemail that gets a callback in 5 min vs 2 hours is the difference between a deal and a dead lead.
