# BatchDialer

**Category:** CRM & External
**Status:** 🟢 Active (NAH cold calling)

## Purpose
Cold calling platform for NAH lead generation. Agents dial lists, system tracks outcomes.

## API Capabilities
- Base URL: `https://api.batchdialer.com/v1`
- Auth: API key header `X-API-Key: d98ac867-62b7-439d-8d72-a19004a93e25`
- Pull call logs: `/calls` — filter by date, agent, campaign, outcome
- Pull agent stats: `/agents/{id}/stats`
- Pull campaign data: `/campaigns`
- Disposition codes: answered/no-answer/voicemail/callback/dnc

## Data Available for KPI Entry
- Calls made per agent per day
- Talk time (seconds)
- Disposition breakdown
- Campaign performance

## Rate Limits
- ⚠️ Verify limits before bulk pulls. Standard tiers: ~100 req/min.

## Gotchas
- BatchDialer = outbound cold calling ONLY. Not for pipeline conversations (that's GHL).
- Never mix BatchDialer metrics with GHL conversation metrics. Different funnels.

## Smart Tip
Pull daily at 6 PM CST after calling hours end. Gives clean day's data for KPI entry without partial counts.
