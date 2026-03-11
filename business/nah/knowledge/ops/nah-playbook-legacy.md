---
> ⚠️ LEGACY — Historical reference only.
> Do not use for current decisions without checking current project files first.
> Current source of truth: github.com/c7lavinder/Gunner
---

# NAH Playbook — New Again Houses (Nashville)
**Tenant:** New Again Houses Nashville  
**Industry:** Wholesale Real Estate  
**Base Playbook:** `playbooks/base/WHOLESALE-RE.md`  
**Last updated:** 2026-02-24

> This file is the **tenant ceiling** — NAH-specific overrides and extensions on top of the
> wholesale real estate industry floor (`base/WHOLESALE-RE.md`).
> Industry rules that apply to all wholesalers live in the base Playbook.
> Only NAH-specific values live here.

---

## Identity

| Field | Value |
|-------|-------|
| Company name | New Again Houses |
| Short name | NAH |
| Industry | Wholesale real estate |
| Contact type | motivated sellers |
| Primary address field | Property street address |
| CRM business name field | Property address (used for pipeline card visibility) |

---

## Playbook Identity Variables (NAH Values)

These values are loaded from Railway env vars at startup. Every AI prompt, template, and output string
uses these — no agent hardcodes NAH-specific language.

| Env Var | NAH Value | What It Drives |
|---------|-----------|----------------|
| `PLAYBOOK_COMPANY_NAME` | `New Again Houses` | Drip `{companyName}`, task bodies |
| `PLAYBOOK_COMPANY_WEBSITE` | `newagainhouses.com` | Drip `{companyWebsite}`, email footers |
| `PLAYBOOK_INDUSTRY_NAME` | `Wholesale Real Estate` | AI system prompts (timeline, motivation, coaching) |
| `PLAYBOOK_CONTACT_TYPE` | `motivated sellers` | AI prompts — who we're talking to |
| `PLAYBOOK_OFFER_TYPE` | `cash offer` | Drip `{offerType}`, outreach context |
| `PLAYBOOK_VALUE_PROPOSITION` | `we buy houses fast for cash` | Drip `{valueProposition}`, reactivation messages |
| `PLAYBOOK_SHOW_COMPANY_FOR_SOURCES` | `form,ppl,referral` | Which sources show company name in SMS |

> Changing any of these in Railway → redeploy → immediately reflected in all agent behavior.
> No code changes required.

---

---

## Company Name Visibility (All Outbound Messages)

| Source | Show Company Name? |
|--------|-------------------|
| form | ✅ Yes — seller opted in, high intent |
| PPL | ✅ Yes — seller opted in, high intent |
| sms | ❌ No — protect identity until qualified |
| dialer | ❌ No — protect identity until qualified |
| other / unknown | ❌ No — default to hide |

Rule applies to **every** message type: initial outreach, drip, returning leads. Never hardcoded.

---

## NAH Scoring Overrides (vs. Industry Floor)

| Config Key | Industry Default | NAH Value | Reason |
|------------|-----------------|-----------|--------|
| `SCORING_HOT_THRESHOLD` | 3 | 3 | Same as industry |
| `SCORING_CONDITION_PASS_GRADE` | 5.0 | 5.0 | NAH sees distressed stock — grade 5+ = confirmed damage |
| `SCORING_EQUITY_PASS_THRESHOLD` | 30000 | 30000 | Nashville market floor |
| `SOURCE_AUTO_PASS_TIMELINE` | true | true | PPL/form = active intent |
| `GRADING_BASELINE` | 2.5 | 2.5 | Franchise standard |
| `GRADING_PREMIUM` | 1.5 | 1.5 | Stage 3 pre-walkthrough buffer |

**Source keywords (NAH platforms added via `SOURCE_HIGH_VALUE`):**
`form, web form, ppl, pay per lead, leadzolo, motivatedsellers, propertyleads, referral, inbound`

---

## Lead Scoring (Lead IQ)

**Threshold:** 3+ factors = HOT. Fewer = WARM. No COLD.

| Factor | Signal | Source |
|--------|--------|--------|
| Timeline | Urgency language, deadline, life event | Form notes / call transcript |
| Motivation | Distress, financial pressure, must-sell language | Form notes / call transcript |
| Price | Asking price ≤ Zestimate (fallback: tax assessed value) | Form field / notes / BatchLeads |
| Source | PPL > dialer > SMS (quality baseline) | Normalized source tag |
| Condition | Distressed condition = positive wholesale signal | Property Condition Bot grade |

**Price baseline:** Zestimate if available from BatchLeads. Tax assessed value if no Zestimate. Asking price at or below baseline = passes.

---

## Task Templates (Lead IQ Output)

### 🔴 HOT Lead Task

```
🔴 HOT LEAD — {contact.firstName} {contact.lastName} at {contact.address}
Score: {score}/5 | Signals: {passedFactors}

⚡ THIS LEAD IS READY TO MOVE — ACT NOW.

📋 THIS CALL MATTERS:
• Signals detected: {passedFactors} — strong signals on this {contactType}. Match their energy.
• Get the full picture in one call: condition, timeline, asking price, decision makers
• Goal: get something ON THE CALENDAR before you hang up

📞 CALL NOW — NOT IN 15 MINUTES. NOW.
• Double dial immediately if no answer
• Automation is running alongside you
• HOT leads do not wait — they go cold fast

📅 LEAVE THIS CALL WITH ONE OF THESE:
• ✅ Walkthrough scheduled
• ✅ Offer call confirmed with AM
• ✅ Firm callback date — nothing vague, nothing open-ended

🚨 DO NOT:
• End the call without a next step locked
• Move to follow-up without exhausting every option first
• Let someone else get to this lead first
```

---

### 🟡 WARM Lead Task

```
🟡 WARM LEAD — {contact.firstName} {contact.lastName} at {contact.address}
Score: {score}/5 | Signals: {passedFactors}

📋 QUALIFY THIS LEAD:
• Understand their full situation — condition, motivation, timeline, price, decision makers
• Fill in what Data Hygiene couldn't get from the form
• End the call knowing: is there a deal here? What does the path to an offer look like?

📞 CALL CADENCE:
• Call within 15 minutes of receiving this task
• Double dial — if no answer, automation runs alongside you
• HOT leads are top priority, but don't let WARM leads sit

📅 NEXT STEPS — PICK ONE:
• Motivated + available → schedule walkthrough or offer call for AM
• Interested, not sure → book callback, keep warm
• Not ready → move to follow-up based on their timeline
• Not a fit → move to 12-month follow-up
```

---

## Outreach Voice & Tone

**Industry voice:** Conversational, direct, helpful. Not salesy. Sound like a person, not a company.

**Time-of-day message tones:**

| Scenario | Tone |
|----------|------|
| Within minutes of submission | Immediate, energetic — "just got your info" |
| Same morning | Fresh, light — early day energy |
| Afternoon | Standard, direct |
| Evening | Casual, relaxed |
| Overnight (queued → 8am) | Acknowledges the gap — "saw your info come through last night — reaching out first thing" |

**Returning lead tiers:**

| Time since last contact | Tone |
|------------------------|------|
| < 7 days | "Got your info again — still here when you're ready" |
| 7–90 days | Warmer than fresh, acknowledges prior contact without being awkward |
| > 90 days | Near-fresh — slightly varied from original, not copy-pasted |

---

## Working Drip Schedule (Contact Attempt Sequence)

**Duration:** 104 days  
**Skip days:** Sundays (resume Monday)  
**Send window:** 9am–6pm  
**Stop condition:** Real conversation confirmed by Response Analyzer

| Day | Action | Notes |
|-----|--------|-------|
| 0 | SMS (source-specific) + Email | Branch by source: dialer, sms, form, general |
| 0.5 | SMS bump | 6h–1d after Day 0 |
| 1 | SMS + Email | Source-specific messages |
| 2 | SMS (breakup tone) + Email | "I assume you've changed your mind" |
| 3 | SMS | Unified from here — all sources same message |
| 4 | SMS | 1d after Day 3 |
| 5 | SMS | 6h after Day 4 |
| 6 | SMS + Email | 6h after Day 5 |
| 7 | SMS | 3d after Day 6 |
| 8 | SMS | 1d after Day 7 |
| 9 | SMS | 3d after Day 8 |
| 10 | SMS | 1d after Day 9 |
| 11 | SMS | 3d after Day 10 |
| 12 | SMS | 2d after Day 11 |
| 13 | SMS + Email | 1d after Day 12 |
| 14 | SMS (final breakup) | 1d after Day 13 |
| 24 | SMS + Email | 11d after Day 14 |
| 34 | SMS + Email | 10d after Day 24 |
| 44 | SMS + Email | 10d after Day 34 |
| 54 | SMS | 10d after Day 44 |
| 74 | SMS | 20d after Day 54 |
| 104 | SMS (final) | 30d after Day 74 — END |

---

## Ghosted Agent

**Trigger:** 12 days from when Working Drip (6b) starts — from first double-dial  
**Action:** Tag contact as ghosted, move pipeline stage to Ghosted, check off Lead IQ task  
**Drip behavior:** Continues running its full 104-day schedule after ghosting — LM stops calling, SMS continues  

---

## Call Script

> Script content defined separately. Call Analyzer and Gunner Analyzer both reference this to grade adherence.

**Call types recognized:**
- Real conversation — qualification call
- Voicemail left (detection may be ambiguous — flag if unclear)
- No answer — no voicemail
- Callback request
- Lead texted / messaged back

**Qualification targets (extracted by Call Analyzer):**
- Property address (if missing)
- Timeline to sell
- Motivation / reason for selling
- Asking price / price expectations
- Property condition (seller's perspective)
- Decision makers involved
- Objections raised

---

## Call Outcome Routing

| Outcome | Next Step |
|---------|-----------|
| Appointment booked | → Acquisitions Supervisor |
| Needs follow-up (short-term) | → Follow Up Supervisor |
| Not a fit | → Follow Up Supervisor (12-month bucket) |
| Voicemail left | → Do NOT start Working Drip. LM follows up manually. |

---

## Assignee Routing (Assignment Bot)

| Stage / Event | Assigned To |
|---------------|------------|
| New lead enters (Lead IQ) | Daniel Lozano |
| Appointment booked | AM (Kyle Barks) |

---

## Escalation

| Trigger | Action | Contact |
|---------|--------|---------|
| No LM call within 15 min | Flag | Config: escalationContact |
| No LM call within 30 min | Alert | Config: escalationContact |
| No outreach sent within 5 min | Flag | Watchdog log |

---

## Business Rules

- **Business days:** Monday–Saturday (Watchdog skips Sunday for call SLA monitoring)
- **SMS skip days:** Sunday (Working Drip skips, resumes Monday)
- **Send window:** 9am–6pm (Outbound Manager enforces)
- **Lead IQ task:** ONE task per contact per cycle. Never duplicated. Stays open until real conversation or Ghosted Agent closes it.
- **No COLD score:** Every lead is HOT or WARM. Low score = WARM task, not no task.

---

## Scope & Eligibility — Hard Stop Criteria

What causes a full halt (contact stays in stage, team alerted, requires human resolution):

| Condition | Action |
|-----------|--------|
| No phone AND no email | Hard stop — unreachable. Log + alert team. Contact stays in New Lead. |

What fails silently (wrong pipeline, duplicate webhook, out-of-scope contact type):

| Condition | Action |
|-----------|--------|
| Wrong pipeline | Exit silently — not a seller lead |
| Wrong stage | Exit silently — already processed |
| Duplicate webhook (idempotency) | Exit silently — already ran |
| Out-of-scope contact type | Exit silently — buyer, partner, etc. |

> Different industries may require additional hard stop conditions (e.g. missing company name for B2B). Add here per tenant.

---

## Idempotency Windows

| Action | Window |
|--------|--------|
| SMS send | 24 hours |
| Pipeline stage move | Immediate (no window — one-shot) |
| Task creation | 24 hours |
| Agent run (full process) | 24 hours |

> Adjust per tenant if needed. Tighter windows reduce risk of duplicates; wider windows reduce false positives on retries.

---

## Data Hygiene — NAH Bot Sequence (Current State)

See base Playbook for the full industry sequence. NAH-specific status:

| Step | Bot | Status | Notes |
|------|-----|--------|-------|
| 1 | Config Reader Bot | ✅ Live | Loads scoring config, playbook config, field mappings |
| 2 | Context Bot | ✅ Live | CRM contact + DB flags |
| 3 | Guard Pattern | ✅ Live | 5-min idempotency window |
| 4 | Phone Cleaner | ✅ Live | E.164 normalization |
| 5 | Name Formatter | ✅ Live | Capitalize, trim |
| 6 | Email Formatter | ✅ Live | Validate format |
| 7 | Source Normalizer | ✅ Live | Slug + alias resolution |
| 8 | Address Assembler | ✅ Live | From CRM fields (address1, city, state, zip) |
| 9 | Business Name Bot | ✅ Live | businessName = property street address (GHL card visibility) |
| 10 | Market Identifier | ✅ Live | City → Nashville/Columbia/etc. via MARKET_CITY_MAP + exact match |
| 11 | Property Data Bot | ⚠️ Live | BatchLeads — runs but most PPL leads not found in database |
| 12 | Mailing Address Bot | ⏸️ Paused | No reliable data source — BatchLeads coverage insufficient |
| 13 | Property Condition Bot | ✅ Live | Street View + Gemini Vision — Drive-By Grading (baseline 2.5 + premium 1.5) |
| 14 | Field Writer Bot | ✅ Live | businessName only (all other fields skipped — no GHL fields mapped yet) |
| 15 | Tag Bot | ✅ Live | source:ppl, state:TN, market:Nashville |
| 16 | Note Bot | ✅ Live | Full hygiene note with condition grade breakdown |

**DB Flags written (for Lead IQ):** `propertyCondition`, `estimatedEquity`, `estimatedValue`, `isVacant`, `isAbsenteeOwner`

---

## Real Conversation — Definition (Response Analyzer)

Response Analyzer uses this definition to classify an inbound reply:

**Counts as real conversation (stop drip, check off task):**
- Seller asks a question about the property or process
- Seller confirms or provides any information (address, timeline, etc.)
- Seller expresses interest or asks to be called
- Seller agrees to an appointment or callback
- Any substantive back-and-forth exchange

**Does NOT count as real conversation (drip continues):**
- "Stop" / "Unsubscribe" / "Remove me" → unsubscribe flow
- "Not interested" / "Don't contact me" → unsubscribe flow
- "Call me later" / "Not now" / "Busy" → push-off, drip continues
- Automated reply / out-of-office → drip continues
- One-word responses with no clear intent → drip continues, flag for LM review

> Other industries define their own engagement thresholds here. The Response Analyzer reads this definition — it has no hardcoded notion of what "real" means.

---

## Call Analyzer — Confidence Threshold

| Confidence Level | Action |
|-----------------|--------|
| High (≥ 85%) | Execute automatically — move stage, create task, assign |
| Medium (60–84%) | Execute but flag — LM sees a note that AI is less certain |
| Low (< 60%) | Flag for LM confirmation before any CRM action |

> Threshold values are Playbook-configurable. Conservative tenants raise the threshold; high-volume tenants may lower it.

---

## Follow-Up Bot — NAH Configuration

NAH uses the Sales Process pipeline for all follow-up stages (not the separate Follow Up pipeline).

### Buckets (Sales Process pipeline stages)

| Bucket | GHL Stage | Stage ID | Cadence | Max Touches |
|--------|-----------|----------|---------|-------------|
| 1 Month | `1 Month Follow Up` | `0f7ddf92-ff79-44cb-97e8-61bf9b8db8fe` | Every 14 days | 2 |
| 4 Month | `4 Month Follow Up` | `e0fbea34-7bf8-48ad-9a47-fed2dfd60b06` | Every 30 days | 4 |
| 1 Year | `1 Year Follow Up` | `733adecd-0d2f-4312-a92d-8bbc02e02dc5` | Every 60 days | 6 |

### Follow-Up Bot Rules (NAH)

- **DEAD = ONLY:** legal threats, confirmed sold, unviable property. Low motivation is NEVER dead.
- **Tone selection:** AI-driven based on contact history, days lapsed, life events in notes
- **Closer trigger:** Response Agent classifies `interested` or `scheduling` intent → Closer fires
- **Re-entry:** Closer moves contact to `Warm` stage in Sales Process, creates LM task (30 min)
- **Exhausted:** After max touches in 1-year bucket → note written, state closed, no tag applied

### Poller Schedule

| Poller | Interval | Env Var |
|--------|----------|---------|
| Follow-Up Organizer | Every 6 hours | `FOLLOW_UP_POLL_INTERVAL_MS` |

---

## Tenant Configuration Reference

> Complete reference of all env vars that control NAH behavior. Set in Railway → Gunner V2 → Variables.

### Playbook Identity

| Env Var | NAH Value |
|---------|-----------|
| `PLAYBOOK_COMPANY_NAME` | `New Again Houses` |
| `PLAYBOOK_COMPANY_WEBSITE` | `newagainhouses.com` |
| `PLAYBOOK_INDUSTRY_NAME` | `Wholesale Real Estate` |
| `PLAYBOOK_CONTACT_TYPE` | `motivated sellers` |
| `PLAYBOOK_OFFER_TYPE` | `cash offer` |
| `PLAYBOOK_VALUE_PROPOSITION` | `we buy houses fast for cash` |
| `PLAYBOOK_SHOW_COMPANY_FOR_SOURCES` | `form,ppl,referral` |

### CRM

| Env Var | NAH Value |
|---------|-----------|
| `GHL_ACCESS_TOKEN` | `pit-bfb34a58-...` (PIT token) |
| `GHL_LOCATION_ID` | `hmD7eWGQJE7EVFpJxj4q` |
| `TENANT_ID` | `hmD7eWGQJE7EVFpJxj4q` |
| `TENANT_NAME` | `New Again Houses` |
| `DEFAULT_ASSIGNEE_ID` | `G1hAG3KNhzMerkEIvMr5` (Daniel Lozano) |

### Pipeline Stage IDs

| Env Var | Stage | ID |
|---------|-------|----|
| `STAGE_ID_NEW_LEAD` | New Lead | `a977dd60-4ef9-40e1-9d8a-b62aaa6bb88f` |
| `STAGE_ID_WARM` | Warm | *(set in Railway)* |
| `STAGE_ID_HOT` | Hot | *(set in Railway)* |
| `STAGE_ID_APPOINTMENT` | Appointment | *(set in Railway)* |
| `STAGE_ID_GHOSTED` | Ghosted | *(set in Railway)* |
| `STAGE_ID_LOST` | Lost | *(set in Railway)* |
| `STAGE_ID_FU_1MO` | 1 Month Follow Up | `0f7ddf92-ff79-44cb-97e8-61bf9b8db8fe` |
| `STAGE_ID_FU_4MO` | 4 Month Follow Up | `e0fbea34-7bf8-48ad-9a47-fed2dfd60b06` |
| `STAGE_ID_FU_1YR` | 1 Year Follow Up | `733adecd-0d2f-4312-a92d-8bbc02e02dc5` |

### Pipeline IDs

| Env Var | Pipeline | ID |
|---------|----------|----|
| `PIPELINE_ID_SALES` | Sales Process | `tOqQbembKlIoPiXbepP3` |

### Markets

| Env Var | NAH Value |
|---------|-----------|
| `MARKETS` | `Nashville,Columbia,Knoxville,Chattanooga,Morristown,Tri Cities,Global` |
| `MARKET_CITY_MAP` | `{"Franklin":"Nashville","Brentwood":"Nashville","Murfreesboro":"Nashville",...}` |

### Scoring

| Env Var | NAH Value |
|---------|-----------|
| `SCORING_HOT_THRESHOLD` | `3` |
| `SCORING_CONDITION_PASS_GRADE` | `5.0` |
| `SCORING_EQUITY_PASS_THRESHOLD` | `30000` |
| `SOURCE_AUTO_PASS_TIMELINE` | `true` |

### External APIs

| Env Var | Purpose |
|---------|---------|
| `AI_MODEL` | `gemini-2.0-flash` |
| `GEMINI_API_KEY` | Gemini vision + text (condition bot, all AI) |
| `GOOGLE_MAPS_API_KEY` | Geocoding + Street View (condition bot, timezone) |
| `BATCHLEADS_API_KEY` | Property data enrichment |

### Operational

| Env Var | NAH Value |
|---------|-----------|
| `DRY_RUN` | `true` (flip to `false` to go live) |
| `WEBHOOK_BASE_URL` | `https://gunner-v2-production.up.railway.app` |

### Config (Non-Playbook)

| Config Key | NAH Value | Description |
|------------|-----------|-------------|
| targetPipeline | Sales Process | Pipeline that triggers New Lead Process |
| entryStage | New Lead | Stage that fires the webhook |
| warmStage | Warm | Stage name for WARM leads |
| hotStage | Hot | Stage name for HOT leads |
| ghostedStage | Ghosted | Stage name for ghosted leads |
| escalationContact | Jessica Guzman | Who gets SLA alerts |
| businessDays | Mon–Sat | Days Watchdog monitors |
| assignee.newLead | Daniel Lozano | Default assignee on new lead |
| assignee.aptBooked | Kyle Barks | Assignee when appointment booked |
