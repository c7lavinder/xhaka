# Pipeline Signals V1 — Full Spec (from Manus, Feb 12 2026)

## What Are Pipeline Signals?

Gunner's automated deal-monitoring system. Continuously scans GHL pipeline, CRM conversations, and call transcripts to detect deals the team might be missing. Categorized by urgency, enriched with AI descriptions, presented with recommended next steps.

## How Detection Works

Runs automatically every hour. Admins can trigger manually via "Scan Pipeline" button.

### Four Phases:
1. **Pipeline Scan** — Pulls opportunities from Sales Process + Follow Up pipelines. Checks for stale stages, missed follow-ups after offers, SLA breaches.
2. **Conversation Scan** — Pulls 50 most recent GHL conversations. Checks for repeat inbound with no response, follow-up leads re-engaging with no reply, active negotiation language.
3. **Transcript Enrichment** — Scans Gunner call DB (last 7-14 days). Looks at transcripts for price mentions, motivation keywords, callback requests, long conversations that got DQ'd.
4. **Dedup & Save** — Removes duplicates, checks existing flags, generates AI description, saves new signals.

## Three Tiers

| Tier | Color | Priority Score | Meaning |
|------|-------|---------------|---------|
| MISSED | Red | 70-85 | Deals slipping through cracks — act now |
| AT RISK | Amber | 55-70 | Leads going cold — needs attention within 24h |
| WORTH A LOOK | Blue | 45-65 | Potential deals deserving a second look |

## All 14 Detection Rules

### TIER 1: MISSED (URGENT)

**Rule 1: Lead Moved to Follow Up Without a Call**
- Lead moved from active → follow-up within last 7 days
- Zero calls in 48h before the move
- ⚠️ Currently DISABLED — too noisy without GHL stage history

**Rule 2: Repeat Inbound — No Response**
- Seller sent 2+ inbound messages in past week
- Team has not made any outbound call in response

**Rule 3: Follow Up Lead Reached Out — No Response**
- Lead in follow-up stage sent inbound message
- 4+ hours with no response (conversation still unread)

**Rule 4: Offer Made — No Follow Up**
- Lead in "Made Offer" or "Offer Apt Scheduled" stage
- 48+ hours since stage change, no outbound call since

**Rule 5: New Lead — No Call Within 15 Min**
- New lead entered pipeline
- 15 min passed, no outbound call logged
- Enforces speed-to-lead SLA

**Rule 6: Seller Stated Price — No Follow Up**
- Transcript scan (2-4 days ago) for price mentions
- Seller stated a price, no follow-up in 48h

### TIER 2: AT RISK

**Rule 7: Motivated Seller — Only 1 Call**
- Transcripts (3-7 days ago) with motivation keywords: divorce, foreclosure, inherited, estate, relocating, bad tenants, code violations, fire damage, tax lien, need to sell fast, etc.
- Only 1 call total, no follow-up in 72h

**Rule 8: Stale in Active Stage**
- Lead in "Pending Apt" or "Walkthrough" for 5+ days
- No recent call activity

**Rule 9: DQ'd Lead Had Selling Signals**
- Lead moved to dead/ghosted within last 14 days
- Transcript review found 2+ selling signals (timeline, condition, life events, "send me an offer," etc.)

**Rule 10: Walkthrough Done — No Offer Sent**
- Lead in walkthrough stage, 24+ hours since stage change
- Hasn't moved to offer stage

**Rule 11: Multiple Contacts — Same Property**
- Last 30 days of calls, property addresses with 2+ different GHL contacts
- Different household members reaching out separately

### TIER 3: WORTH A LOOK

**Rule 12: Callback Requested — None Made**
- Transcripts (last 7 days) with callback requests ("call me back tomorrow," etc.)
- No follow-up call or outbound SMS logged (checks Gunner DB + GHL conversations)

**Rule 13: Long Conversation — DQ'd After One Attempt**
- Call lasted 3+ minutes (engaged seller)
- Outcome was "not interested" or "dead"
- Substantial transcript, only 1 call to that contact

**Rule 14: Active Engagement in Follow Up**
- Contact in follow-up stage with inbound messages within 72h
- Contains negotiation/engagement keywords: consider, counter, negotiate, interested, next step, changed my mind, etc.

## AI Descriptions

Every signal gets an AI-written description:
- Only states facts from data — never assumes
- Neutral language ("no follow-up has been logged" not "the team dropped the ball")
- Includes contact name, pipeline stage, timeline, team member
- One specific, actionable next step

## Pipeline Stage Classification

**Active:** New Lead, Warm Leads, SMS Warm Leads, Hot Leads, Pending Apt, Walkthrough Apt Scheduled, Offer Apt Scheduled, Made Offer, Under Contract, Purchased

**Follow Up:** 1 Month Follow Up, 4 Month Follow Up, 1 Year Follow Up, Follow Up, New Offer, New Walkthrough

**Dead:** Ghosted Lead, Ghosted, Agreement Not Closed, Do Not Want, Sold, Trash

## Deduplication

1. Within a scan: Same contact + same rule = one signal
2. Across scans: Checks for existing active signal or one handled/dismissed within 30 days → skips
3. Dismissed signals don't reappear for 30 days

## UI

- Three summary cards (Missed / At Risk / Worth a Look)
- Tab filtering
- Signal cards with rule label, tier badge, contact, address, stage, team member, source, AI reason, timestamp
- Expandable details: recommended next step, priority score, last activity, trigger rules
- Actions: "On It" (handled) / "Not a Deal" (dismiss)
- "Show Resolved" toggle
- "Scan Pipeline" button (admin only)

## Scheduling

- Automatic: Every 60 minutes
- Manual: Admin "Scan Pipeline" button

## Developer Reference

| Component | File | Size |
|-----------|------|------|
| Detection engine | server/opportunityDetection.ts | ~1,700 lines |
| API routes | server/routers.ts | opportunities router |
| Frontend | client/src/pages/Opportunities.tsx | ~546 lines |
| Scheduler | server/ghlService.ts | integrated with GHL sync |
| DB schema | drizzle/schema.ts | opportunities table |

### API Endpoints (tRPC)
- opportunities.list — Fetch with tier/status filtering
- opportunities.counts — Active counts by tier
- opportunities.resolve — Mark handled/dismissed
- opportunities.runDetection — Manual scan (admin only)

---

## V2 Additions (Saved for Later)

See `signals-v2-examples.md` for real examples.

Additional rules to add:
- Offer made but no counter/follow-up within 48h — seller didn't say no, team just went silent
- New lead with no first call within 15 min SLA — flag here too, not just escalate
- Walkthrough completed but no offer sent within 24h — Kyle did the work, then it stalled
- Multiple leads from same property address — nobody connected the dots
- Seller said "call me back in [timeframe]" — check if callback happened
- Leads where seller did most of the talking (high talk-time ratio) but got DQ'd
