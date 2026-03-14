# BatchLeads

**Category:** CRM & External
**Status:** 🟢 Active (NAH SMS)

## Purpose
SMS outreach platform for NAH lead generation. Sends bulk texts to lists, tracks responses.

## API Capabilities
- Base URL: `https://api.batchleads.io/v1`
- Auth: API key `06b81a7c-f69c-42c3-bc1f-c8ed55d01e1a`
- Pull message stats: sent/delivered/replied counts
- Pull campaign performance
- Contact lookup and skip tracing data

## Data Available
- Messages sent per day
- Reply rates
- Opt-out tracking

## Gotchas
- BatchLeads = SMS outreach ONLY. Not for pipeline conversations (that's GHL).
- TCPA compliance critical — respect opt-outs, maintain DNC list.
- BatchLeads also has skip tracing / property data features — separate from messaging.

## Smart Tip
Reply rate is the key metric. Industry average 2-5%. If below 1%, list quality or message copy needs work.
