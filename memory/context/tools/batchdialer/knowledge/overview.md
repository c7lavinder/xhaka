# BatchDialer — Deep Knowledge Overview

> **Last Updated:** 2026-03-16
> **NAH API Key:** `d98ac867-62b7-439d-8d72-a19004a93e25`
> **Purpose at NAH:** Cold calling platform. Pull call data for KPI Entry.

---

## What Is BatchDialer?

BatchDialer is a cloud-based outbound calling platform purpose-built for real estate investors and cold calling teams. It's part of the Batch ecosystem (BatchLeads + BatchDialer + PropStream integration).

**Core capability:** Dial dozens to hundreds of contacts per hour using predictive multi-line dialing, while equipping agents with property context, scripts, and real-time coaching tools.

---

## Dialing Modes

### Preview Dialer
- Dials **one number at a time**
- Agent sees full contact/property info before dialing
- Agent clicks "Call" manually when ready
- Best for: warm leads, high-value prospects, complex conversations requiring research
- Typical output: 30–60 dials/hour per agent
- Lower volume but higher quality conversations

### Predictive Dialer
- Dials **multiple lines simultaneously** (up to 3–5 lines per agent)
- System algorithmically predicts agent availability and dials ahead
- Agent is connected when a human answers — no wait time
- Best for: large cold lists, high-volume campaigns, skip-traced lists
- Typical output: 80–200+ dials/hour per agent
- Higher volume, shorter average call duration

### Rapid Fire Mode
- Turbo version of predictive — maximizes call volume
- Auto-dials next contact immediately when previous call ends
- Best for: bulk list burning, maximum exposure campaigns

### Voicemail Drop
- Pre-record a voicemail message
- When call hits voicemail detection, system drops the recording automatically
- Agent doesn't wait for the beep — instantly moves to next dial
- Script template: "Hi [FirstName], this is [Agent] from New Again Houses in Nashville. We buy houses as-is, cash, in any condition. If you've thought about selling, give me a call at [Number]. Thanks."
- Increases dials/hour by 20–30% by eliminating voicemail wait time

---

## Campaign Setup — Step by Step

### Step 1: Prepare Lead List
- Source skip-traced lists from BatchLeads, PropStream, or other providers
- Export as CSV with columns: First Name, Last Name, Address, Phone 1, Phone 2, Phone 3 (max 3–5 numbers per contact per best practice)
- Clean list: remove DNC numbers, duplicates, bad formats
- **Best practice:** Upload no more than 3–5 phones per contact. Fewer is better — quality over quantity.

### Step 2: Import Contacts
- BatchDialer → Contacts → Import CSV
- Map fields: name, address, phone numbers, notes
- Or push directly from BatchLeads via native integration (PropStream → Push to BatchDialer)
- System validates numbers and flags potential DNC entries

### Step 3: Create Campaign
- Campaigns → New Campaign
- Name it (e.g., "NAH Nashville Absentee - Mar 2026")
- Select dialing mode (Preview or Predictive)
- Assign calling list(s)
- Assign agents
- Set schedule (days + hours — e.g., Mon–Fri, 9am–6pm local time)
- Set max dials per phone number per day (recommended: 75–100)
- Upload or select call script
- Upload voicemail drop recording
- Set disposition codes

### Step 4: Configure Disposition Codes
Standard codes used in wholesale RE campaigns:

| Code | Meaning | Downstream Action |
|------|---------|-------------------|
| **Interested / Hot Lead** | Wants to sell, open to offer | Push to GHL as Qualified |
| **Callback** | Wants to talk, not available now | Schedule callback task |
| **Not Interested** | Explicitly not selling | Tag + pause outreach |
| **Wrong Number** | Number mismatch | Remove from list |
| **Do Not Call** | Requested no contact | DNC tag — legal compliance |
| **No Answer** | Rang through, no pickup | Retry up to 3x per session |
| **Left Voicemail** | VM dropped | Don't call again same day |
| **Language Barrier** | Can't communicate | Flag for language-specific agent |
| **Deceased / Vacant** | Property context issue | Remove from active list |

---

## Key Metrics

| Metric | Definition | Target Benchmark |
|--------|-----------|-----------------|
| **Dials/Hour** | Total calls attempted per agent per hour | 80–150 (predictive) / 30–60 (preview) |
| **Contact Rate** | % of dials where a human answers | 8–15% on cold skip-traced lists |
| **Connect Rate** | % of contacts who engage in conversation (don't hang up in <5 sec) | 60–75% of contacts |
| **Conversion Rate** | % of conversations that produce a qualified lead | 1–3% of dials |
| **Talk Time %** | % of shift spent in live conversation vs idle | Target >40% |
| **Voicemail Rate** | % of dials that hit voicemail | ~30–45% on cell numbers |
| **DNC Rate** | % of contacts who opt out | <2% is healthy |
| **Appointments/Hour** | Appointments booked per agent hour | 0.1–0.3 (1 per 3–10 hours) |

---

## Tyson Smith / 1,000+ Dials/Day Methodology

Top wholesale cold calling operators (including the methodology NAH benchmarks against) run high-volume operations using these principles:

**Volume Strategy:**
- 1,000+ dials/day requires 4–6 callers running predictive mode simultaneously
- At 150 dials/hour/agent × 7 hours = ~1,050 dials per caller per day
- With 2 agents: 2,100 dials/day is achievable

**List Strategy:**
- Fresh skip-traced lists perform best first 2–3 sessions; then contact rate drops
- Rotate lists: if contact rate drops below 5%, pull new list
- Segment by motivation: absentee owners, pre-foreclosure, tax delinquent, high equity — each list has different talk track

**Script Management:**
- Keep opener under 10 seconds: name, company, purpose
- One clear question to establish conversation: "Are you the owner of [Address]?"
- Pain probe: "Have you ever thought about selling that property?"
- Don't oversell on cold call — goal is lead capture, not close

**In-Call Coaching:**
- BatchDialer supports supervisor monitor (listen only) and whisper (agent hears coach, lead doesn't)
- Used for real-time coaching during live calls
- Managers can barge if needed

---

## GHL Integration (Detailed)

BatchDialer pushes data to GHL in real time:

1. **Setup:** BatchDialer → Settings → Integrations → GoHighLevel → OAuth connect → select GHL sub-account
2. **Contact sync:** When a call is dispositioned, BatchDialer creates or updates the contact in GHL
3. **Disposition mapping:** Each BatchDialer disposition maps to a GHL action:
   - Hot Lead → GHL stage: Qualified + tag: BatchDialer-Hot
   - Callback → GHL task created with callback time
   - Not Interested → GHL tag: Not-Interested + workflow pause
   - DNC → GHL DNC tag + all sequences stop
4. **Call recording:** Recording URL posts to GHL contact's Notes field
5. **Custom fields:** Property data (address, equity, owner name) passes to GHL contact record

---

## BatchDialer API

**Base URL:** `https://api.batchdialer.com/v1/`
**Auth:** API key in header: `Authorization: Bearer {api_key}`
**NAH API Key:** `d98ac867-62b7-439d-8d72-a19004a93e25`

### Key Endpoints Used by Xhaka for KPI Entry

```
GET /v1/campaigns
  Returns: list of campaigns with id, name, status, created_at

GET /v1/campaigns/{campaign_id}/stats
  Returns: dials, contacts_reached, conversations, appointments, 
           talk_time_seconds, voicemails_dropped, dnc_count
  Use: Pull daily/weekly KPIs for Jessica's KPI entry

GET /v1/calls
  Params: start_date, end_date, agent_id, campaign_id
  Returns: individual call records with duration, disposition, recording_url,
           agent_name, contact_phone, start_time

GET /v1/agents
  Returns: agent list with id, name, extension

GET /v1/agents/{agent_id}/stats
  Params: start_date, end_date
  Returns: per-agent dials, talk_time, dispositions breakdown
```

### What the API Returns for KPI Entry

The KPI data Xhaka pulls from BatchDialer:
- **Dials today/this week** (total campaign dials)
- **Contacts reached** (humans answered)
- **Conversations** (calls >30 seconds)
- **Hot leads / callbacks** (disposition counts)
- **Per-agent breakdown** (for LM performance tracking)

---

## Integration with BatchLeads

BatchLeads (SMS platform) and BatchDialer share the same Batch ecosystem:

- Lists created in BatchLeads can be pushed directly to BatchDialer campaigns
- BatchLeads API key for NAH: `06b81a7c-f69c-42c3-bc1f-c8ed55d01e1a`
- When a BatchLeads SMS reply comes in, the contact can be flagged and auto-added to a BatchDialer callback queue
- Unified contact record: call and text history in same Batch system

---

## Common Pitfalls

1. **Too many phones per contact.** If you upload 10 numbers per contact, you're wasting dials on old/wrong numbers and angering people. Cap at 3–5 verified numbers.

2. **Not setting call schedules.** TCPA requires calls between 8am–9pm in the recipient's local time zone. BatchDialer has timezone detection — use it. Calling at 7am gets you a lawsuit.

3. **Ignoring contact rate decline.** If your contact rate drops below 5%, the list is exhausted. Don't keep burning it. Pull fresh.

4. **Phone number flagging.** Carriers flag numbers as "Spam Likely" if too many calls per day. BatchDialer has built-in reputation monitoring and auto-replaces flagged numbers. Register numbers using STIR/SHAKEN. Rotate calling numbers daily.

5. **No voicemail drop.** Agents sitting through voicemail greetings kill dials/hour. Always have a VM drop loaded.

6. **Using predictive mode on warm leads.** Predictive mode starts the call before the agent is fully ready. On warm leads (PPL, callbacks), use Preview mode so agent can review context before connecting.

7. **Not mapping dispositions to GHL.** If BatchDialer and GHL aren't synced, the same lead gets called again by LMs working the GHL pipeline. Double-touch annoys sellers. Sync is non-negotiable.

8. **Skipping list DNC scrub.** Always run lists through DNC.com or state DNC registry before importing. BatchDialer has built-in DNC checking — enable it.

---

## Reporting Dashboard (Real-Time)

BatchDialer's real-time reporting shows supervisors live campaign stats:

- Agents currently on call vs idle
- Calls in progress
- Dispositions being logged
- Queue depth (contacts remaining)
- Today's cumulative stats

Access: BatchDialer → Reports → Campaign Overview / Agent Performance
