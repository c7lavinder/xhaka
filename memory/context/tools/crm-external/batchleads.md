# BatchLeads

**Category:** CRM & External
**Status:** 🟡 Monitored (API access, read-only for KPI)
**Last Updated:** 2026-03-14

## Purpose
Real estate data and SMS marketing platform for NAH. Used for list building (skip tracing property owners), and outbound SMS campaigns to motivated sellers. Separate from GHL SMS (which handles warm leads).

## Account Details (see TOOLS.md)
- API Key: `06b81a7c-f69c-42c3-bc1f-c8ed55d01e1a`
- Platform: batchleads.io

---

## What BatchLeads Does

1. **List Building:** Pull lists of property owners by criteria (absentee owners, pre-foreclosure, tax delinquent, etc.)
2. **Skip Tracing:** Find phone numbers and emails for property owners from addresses
3. **SMS Campaigns:** Mass text property owners with motivated seller messages
4. **Lead Management:** Track responses, opt-outs, and conversions

---

## API Overview

### Authentication
```http
Authorization: Bearer 06b81a7c-f69c-42c3-bc1f-c8ed55d01e1a
```

⚠️ BatchLeads API documentation is limited. The following is based on their known capabilities — verify endpoints against their developer docs.

### Key Endpoints

```
GET  /api/v1/campaigns           - List SMS campaigns
GET  /api/v1/campaigns/{id}      - Campaign details + stats
GET  /api/v1/messages            - SMS message history
GET  /api/v1/contacts            - Lead contacts
GET  /api/v1/contacts/{id}       - Contact details (phone, address, status)
POST /api/v1/contacts/search     - Search/filter contacts
```

---

## What Data is Available

### SMS Campaign Stats (Key for KPI)
- Messages sent per campaign
- Delivery rate
- Response rate
- Opt-out rate
- Conversion tags (interested, not interested, call back, etc.)

### Contact/Lead Data
- Property address
- Owner name
- Phone numbers (from skip trace)
- Email (if available)
- Campaign assignment
- Response history
- Opt-out status

### Skip Trace Results
- Phone numbers (cell, landline)
- Confidence score per number
- Relatives (for additional contact paths)

---

## Key KPI Metrics Xhaka Pulls

1. **SMS sends per day** — volume by campaign
2. **Response rate** — responses / sends (healthy range: 3-8%)
3. **Opt-out rate** — critical to monitor (high opt-outs = list quality problem)
4. **Leads with "interested" tag** — how many warm responses per campaign
5. **Skip trace success rate** — % of addresses that returned valid phones

---

## Rate Limits

⚠️ Rate limits not publicly documented. Treat as conservative:
- Recommended: Max 60 requests/minute
- Add delays in batch operations
- Use date-range filters when pulling message history

---

## SMS Compliance Notes (Important for NAH)

1. **TCPA compliance:** BatchLeads handles opt-out processing — if a contact replies STOP, they're automatically opted out. Never send to opted-out contacts.

2. **10DLC registration:** As of 2023+, all SMS campaigns to US numbers require 10DLC brand/campaign registration. ⚠️ Verify NAH's 10DLC is registered and approved in BatchLeads — non-registered campaigns have 90%+ filtering by carriers.

3. **Daily SMS limits:** Carrier limits (not BatchLeads limits): ~2,000 SMS/day per 10DLC campaign. Above this = filtering risk.

---

## BatchLeads vs BatchDialer — How They Work Together

```
BatchLeads Flow:
1. Pull list (absentee owners in Nashville)
2. Skip trace → get phone numbers  
3. SMS campaign → "Interested in selling?"
4. Responses come back

BatchDialer Flow:
1. Import hot-response list from BatchLeads
2. Cold call campaign for non-responders
3. Connect → handle live

Both feed into GHL:
→ Any motivated seller → create contact in GHL → pipeline begins
```

Xhaka should cross-reference BatchLeads responses with new GHL contacts to measure the full funnel.

---

## Known Gotchas

1. **Phone number freshness:** Skip traced numbers go stale. Numbers older than 6 months have meaningfully lower answer rates. BatchLeads shows skip trace date — factor this in.

2. **List deduplication:** If you pull lists multiple times with overlapping criteria, you'll get duplicate contacts. BatchLeads has dedup tools but they're not perfect. Add your own dedup by address.

3. **API vs Export:** For bulk data pulls (1000+ records), the API may be slow. BatchLeads has a CSV export feature — for large historical analyses, export is faster than API pagination.

4. **Response attribution:** BatchLeads tracks which campaign a response came from, but if a lead responds to multiple campaigns, attribution can be fuzzy.

---

## Smart Use Tips

1. **Response tagging automation:** Set up BatchLeads automations to auto-tag responses (STOP → opt-out, YES/interested/call me → hot lead). Then Xhaka can pull only hot-tagged contacts daily.

2. **Skip trace ROI tracking:** BatchLeads charges per skip trace. Track which lists produce the highest skip trace → valid phone rate. Stop skip tracing low-quality lists.

3. **SMS template A/B test:** BatchLeads supports sending different message variants to list segments. Run 2-3 message variations and compare response rates. Xhaka can pull the comparison data.
