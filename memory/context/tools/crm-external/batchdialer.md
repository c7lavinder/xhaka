# BatchDialer

**Category:** CRM & External
**Status:** 🟡 Monitored (API access, read-only for KPI)
**Last Updated:** 2026-03-14

## Purpose
Cold calling platform for NAH's LEAD GENERATION — outbound cold calls to potential sellers. Separate from GHL (which handles warm/pipeline contacts). Xhaka pulls call metrics from BatchDialer for daily KPI Entry.

## Account Details (see TOOLS.md)
- API Key: `d98ac867-62b7-439d-8d72-a19004a93e25`
- Developer docs: `developer.batchservice.com`

---

## API Overview

### Authentication
```http
Authorization: Bearer d98ac867-62b7-439d-8d72-a19004a93e25
Content-Type: application/json
```

### Base URL
```
https://api.batchdialer.com/v1/
```
⚠️ Verify exact base URL — BatchDialer's dev docs are at `developer.batchservice.com` but API host may differ.

---

## What Data is Available via API

### Call Data (Most Important for Xhaka KPI)
```
GET /v1/calls
GET /v1/calls/{callId}
```
Fields available per call:
- `callId` — unique identifier
- `agentId` / `agentName` — who made the call
- `duration` — seconds
- `status` — answered, no-answer, busy, voicemail, dropped
- `disposition` — lead outcome (callback, not interested, hot lead, etc.)
- `recordingUrl` — audio file URL
- `timestamp` — call datetime
- `campaignId` / `campaignName`
- `contactPhone` — lead's number

### Agent Performance
```
GET /v1/agents
GET /v1/agents/{agentId}/stats
```
- Calls attempted
- Calls connected
- Connection rate %
- Total talk time
- Dispositions breakdown

### Campaign Stats
```
GET /v1/campaigns
GET /v1/campaigns/{campaignId}/stats
```
- Total dials
- Connect rate
- Contacts reached
- Callbacks set

---

## Key KPI Metrics Xhaka Pulls

For daily KPI entry, pull these metrics:
1. **Total dials per agent per day** — from agent stats
2. **Connect rate** — connects / dials
3. **Callbacks set** — disposition count for "callback" 
4. **Talk time** — total minutes by agent
5. **Campaign performance** — which lists are converting

### Sample KPI Pull Pattern
```typescript
const today = new Date().toISOString().split('T')[0];

const agentStats = await fetch(
  `https://api.batchdialer.com/v1/agents/stats?date=${today}`,
  { headers: { Authorization: `Bearer ${BATCHDIALER_API_KEY}` } }
);
```

---

## Rate Limits

⚠️ BatchDialer API rate limits are not publicly documented. Based on typical patterns:
- Estimated: 60-120 requests/minute
- Add 1-second delays between requests in polling loops
- Use date-range filters to minimize number of calls needed

---

## Call Volume Limits (Operational)
- Maximum recommended: 75-100 dials per number per day (spam filter threshold)
- Local presence matching available (shows local area code to leads)
- Spam label risk increases above 75 calls/number/day

---

## What Xhaka Can Automate

1. **Daily KPI snapshot:** Pull yesterday's stats at 7am CST → format → post to Telegram or GHL note
2. **Agent performance alerts:** If any rep's connect rate drops below threshold → alert Corey
3. **Campaign comparison:** Weekly report comparing which BatchDialer campaigns are producing hot leads

---

## Known Gotchas

1. **Recording URL expiry:** Like GHL, recording URLs may be time-limited pre-signed URLs. Download and store audio if you need it for Gunner processing. ⚠️ Verify TTL.

2. **Disposition names vary by account:** Disposition labels are configured per-account. Verify exact disposition names in NAH's BatchDialer account before hardcoding them in Xhaka logic.

3. **Agent ID vs Agent Name:** Use agent IDs for programmatic logic — names can change, IDs are stable.

4. **Timezone on timestamps:** ⚠️ Verify whether timestamps are UTC or account timezone. Wrong timezone = wrong daily totals.

5. **API availability:** BatchDialer's API is less mature than GHL's. Expect occasional 500 errors — add retry logic.

---

## Smart Use Tips

1. **Don't scrape the UI:** BatchDialer has a web dashboard. Don't use browser automation to pull stats — always use the API. More reliable and doesn't risk account lockout.

2. **Cache daily stats:** Once you pull yesterday's stats, cache them. Don't re-pull historical data every time Xhaka runs.

3. **Cross-reference with GHL:** BatchDialer generates the cold call leads → hot ones move to GHL pipeline. Compare BatchDialer "callback set" count vs GHL "new contact" count — the gap shows how many callbacks aren't being properly created in GHL.
