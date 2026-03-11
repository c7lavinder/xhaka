---
> ⚠️ LEGACY — Historical reference only.
> Do not use for current decisions without checking current project files first.
> Current source of truth: github.com/c7lavinder/Gunner
---

# Base Playbook — Wholesale Real Estate
**Industry:** Residential Wholesale Real Estate  
**Tier:** Industry Floor (applies to ALL wholesale tenants)  
**Last updated:** 2026-02-24

> This is the industry-level floor. It defines how Gunner behaves for ANY wholesale real estate
> operation. Tenant Playbooks extend and override these defaults.
> Zero tenant-specific data lives here.

---

## What Is Wholesale Real Estate

A wholesaler puts a property under contract below market value, then assigns or double-closes
that contract to a cash buyer investor for a fee. The seller is typically distressed — they
trade a discount for speed and certainty. The wholesaler finds, qualifies, and structures the deal.

**Key truth:** Distress = opportunity. Every intelligence module should identify and score
signals of seller distress, not filter them out.

---

## Playbook Identity Variables

These variables are the foundation of every AI prompt, SMS template, and task body in the system.
**No agent or intelligence module hardcodes these values.** They are injected at runtime from config.
Tenant Playbooks set the actual values. This section defines what each variable means.

| Variable | Env Var | Drives | Example (Wholesale) |
|----------|---------|--------|---------------------|
| `companyName` | `PLAYBOOK_COMPANY_NAME` | SMS sign-offs, task bodies, drip templates | "New Again Houses" |
| `companyWebsite` | `PLAYBOOK_COMPANY_WEBSITE` | Drip email footers, credibility messages | "newagainhouses.com" |
| `industryName` | `PLAYBOOK_INDUSTRY_NAME` | AI system prompts (timeline, motivation, coaching) | "Wholesale Real Estate" |
| `contactType` | `PLAYBOOK_CONTACT_TYPE` | AI prompts — who we're talking to | "motivated sellers" |
| `offerType` | `PLAYBOOK_OFFER_TYPE` | Drip templates `{offerType}`, task bodies | "cash offer" |
| `valueProposition` | `PLAYBOOK_VALUE_PROPOSITION` | Drip template `{valueProposition}`, outreach angle | "we buy houses fast for cash" |
| `showCompanyForSources` | `PLAYBOOK_SHOW_COMPANY_FOR_SOURCES` | Which inbound sources include company name in SMS | "form,ppl,referral" |

### Where each variable appears in output

**`contactType`** (e.g. "motivated sellers"):
- All intelligence module system prompts: timeline analyzer, motivation analyzer, re-engagement analyzer
- Message crafter source frame ("This motivated seller submitted their inquiry")
- Response interpreter context string
- Call coaching prompt
- Follow-up messenger prompt
- Task body ("this motivated seller is motivated")

**`industryName`** (e.g. "Wholesale Real Estate"):
- Timeline and motivation AI system prompts
- Re-engagement analysis prompt
- Call coaching scoring context

**`offerType`** (e.g. "cash offer"):
- Drip sequence template variable `{offerType}` — appears in multiple steps
- Initial outreach AI prompt context

**`valueProposition`** (e.g. "we buy houses fast for cash"):
- Drip sequence template variable `{valueProposition}` — used in long-tail reactivation messages

**`companyName`** (e.g. "New Again Houses"):
- Drip sequence `{companyName}` across all steps
- Only shown when `showCompanyForSources` includes the lead's source

**Rule:** If a value is not set in the tenant's env vars, the system falls back to a neutral default
("contact" for contactType, "real estate" for industryName, "offer" for offerType, etc.).
Always set all values during tenant onboarding.

---

## Lead Scoring — Core Factors

**Rule:** `hotThreshold` factors pass = HOT. Fewer = WARM. No COLD — every lead gets worked.

| Factor | Passes When | Data Source | Module |
|--------|-------------|-------------|--------|
| Timeline | ASAP / within 3 months / urgency language | Form field / call transcript | `timeline.ts` |
| Motivation | Distress signal (foreclosure, divorce, inheritance, relocation, etc.) | Form notes / call | `motivation.ts` |
| Price | Asking price ≤ estimated market value (AVM) | Form field / BatchLeads AVM | `price-analyzer.ts` |
| Source | High-quality inbound (form, PPL, referral) | GHL source field | `source-analyzer.ts` |
| Condition | Drive-by grade ≥ pass threshold | Property Condition Bot (Street View) | `condition-scorer.ts` |
| Equity | Estimated equity ≥ pass threshold | BatchLeads | `equity-analyzer.ts` |
| Distress | Vacant OR absentee owner | BatchLeads | `distress-analyzer.ts` |

**Default thresholds (all overridable via env vars):**
- `SCORING_HOT_THRESHOLD=3`
- `SCORING_CONDITION_PASS_GRADE=5.0`
- `SCORING_EQUITY_PASS_THRESHOLD=30000`

**Source auto-pass timeline:** If source is high-value (seller submitted inbound) and no timeline
was provided, auto-pass timeline. Seller submitting = active intent to sell now.
Controlled by `SOURCE_AUTO_PASS_TIMELINE=true`.

---

## Source Quality Classification

Sources are classified by the seller's intent signal, not the platform name.

| Tier | Signal | Keywords (configurable via `SOURCE_HIGH_VALUE` / `SOURCE_MEDIUM_VALUE`) |
|------|--------|-------------------------------------------------------------------------|
| High | Seller came to us (inbound) | form, web form, ppl, pay per lead, referral, inbound |
| Medium | We found them (outbound) | dialer, cold call, sms, text, email blast, list |
| Unknown | No source recorded | — defaults to low quality |

Tenant-specific platform aliases (leadzolo, motivatedsellers, etc.) go in tenant Playbook via env var.

---

## Property Condition — Drive-By Grading

**System:** NAH Franchise Drive-By Grading (from franchise training materials)  
**Used for:** Property condition scoring before a walkthrough  
**Module:** `condition-bot.ts` (vision assessment) + `condition-scorer.ts` (scoring)

**Formula:** `Grade = baseline + Exterior(0–1.5) + Roof(0–0.5) + Windows(0–0.5) + Paint/Siding(0–1.0) + Premium`

| Config Key | Industry Default | Description |
|------------|-----------------|-------------|
| `GRADING_BASELINE` | 2.5 | Every property starts here |
| `GRADING_PREMIUM` | 1.5 | Pre-walkthrough buffer (Stage 3 — always added) |

**Grade interpretation:**
- 2.5 — No visible issues (clean property)
- 4.0 — Minimum after baseline + premium (all zeros from AI)
- 5.0 — Visible damage confirmed
- 6.0–6.5 — Major gut job / teardown territory

**For wholesale:** Higher grade = more distressed = POSITIVE signal. Cheap-to-fix
properties rarely accept wholesale pricing. Distressed properties do.

**Fallback grades (seller description only):**
- "Needs nothing" → 1
- "Needs very little" → 3
- "Needs updating throughout" → 5
- "Needs a ton of work" → 7

---

## Intelligence Modules — Continuous Improvement Architecture

Each factor is its own module with a stable interface (`ScoringFactor` in/out).
Improve any module independently without touching agents.

| Module | Improvement Path |
|--------|-----------------|
| `timeline.ts` | Add more urgency pattern variants; tune AI prompt for nuance |
| `motivation.ts` | Add industry-specific distress signals; improve AI prompt |
| `price-analyzer.ts` | Add Zestimate API, tax-assessed fallback, comps integration |
| `source-analyzer.ts` | Add new platform aliases via `SOURCE_HIGH_VALUE` env var |
| `condition-scorer.ts` | Tune pass threshold via `SCORING_CONDITION_PASS_GRADE` |
| `condition-bot.ts` | Upgrade vision model, add interior photos, multi-angle analysis |
| `equity-analyzer.ts` | Add HELOC balances, lien data, tax-assessed equity as fallback |
| `distress-analyzer.ts` | Add foreclosure filing, tax delinquency, code violations, MLS expiration |

**Adding a new factor:** Create a module returning `ScoringFactor`, import it in `lead-iq.ts`,
add to `factors[]`. No other changes needed.

---

## Data Hygiene — Bot Sequence

Steps run in order. Each is a discrete unit — improve or disable individually.

| Step | Bot | Required? | Notes |
|------|-----|-----------|-------|
| 1 | Config Reader Bot | ✅ | Always first — loads field mappings, scoring config, Playbook |
| 2 | Context Bot | ✅ | Reads current contact state from CRM + DB |
| 3 | Guard Pattern | ✅ | Idempotency + dedup check |
| 4 | Phone Cleaner | ✅ | Normalize to E.164 |
| 5 | Name Formatter | ✅ | Capitalize, trim |
| 6 | Email Formatter | ✅ | Validate format |
| 7 | Source Normalizer | ✅ | Slug normalization, alias resolution |
| 8 | Address Assembler | ✅ | Build address object from CRM fields |
| 9 | Business Name Bot | ✅ | businessName = property street address |
| 10 | Market Identifier | ✅ | City → configured market (cityMap + exact match) |
| 11 | Property Data Bot | ⚠️ | BatchLeads — beds/baths/sqft/AVM/equity/distress flags |
| 12 | Mailing Address Bot | ⏸️ | **PAUSED** — no reliable data source configured |
| 13 | Property Condition Bot | ⚠️ | Street View + Gemini Vision — Drive-By Grading |
| 14 | Field Writer Bot | ✅ | Writes cleaned + enriched values back to CRM |
| 15 | Tag Bot | ✅ | Applies state, market, source, type tags |
| 16 | Note Bot | ✅ | Writes single hygiene summary note |

⚠️ = runs but may return no data (skipped silently if API unavailable/property not found)
⏸️ = intentionally paused pending data source decision

---

## Working Drip — Contact Attempt Sequence Structure

**Purpose:** Contact attempt sequence for unreached leads. NOT a nurture drip.
**Stop condition:** Real conversation confirmed by Response Analyzer.
**Duration:** Playbook-configurable. Default 104 days.

**Key rules (industry-level):**
- Skip Sundays
- Send window enforced by Outbound Manager (9am–6pm tenant timezone)
- Stop at first confirmed real conversation — Response Analyzer classifies
- Drip continues even after Ghosted Agent fires at day N

### Drip Template Variables

All drip message templates use these variables. Values are injected at send time — never hardcoded.

| Variable | Source | Example |
|----------|--------|---------|
| `{firstName}` | CRM contact first name | "Billy" |
| `{userFirstName}` | Assigned LM first name (GHL user lookup) | "Daniel" |
| `{propertyAddress}` | Property street address (no city/state) | "412 Oak St" |
| `{companyName}` | `PLAYBOOK_COMPANY_NAME` | "New Again Houses" |
| `{companyWebsite}` | `PLAYBOOK_COMPANY_WEBSITE` | "newagainhouses.com" |
| `{offerType}` | `PLAYBOOK_OFFER_TYPE` | "cash offer" |
| `{valueProposition}` | `PLAYBOOK_VALUE_PROPOSITION` | "we buy houses fast for cash" |

**Rule:** If any variable resolves to empty, a neutral fallback is used (`{firstName}` → "there",
`{offerType}` → "offer", `{valueProposition}` → "we can help").

---

## Follow-Up Bot — Re-Engagement Sequence (Industry Defaults)

**Purpose:** Re-engage paid-for leads that said "not now" — extract full value from leads already in the database.  
**Triggers on:** Contacts in 1-month, 4-month, or 1-year follow-up pipeline stages.  
**Never DEAD unless:** Legal threat, confirmed sold, unviable property. Low motivation ≠ dead.

### Bucket Cadence (Industry Defaults — override per tenant)

| Bucket | Stage | Touch Interval | Max Touches | Next Bucket |
|--------|-------|---------------|-------------|-------------|
| 1 Month | `1 Month Follow Up` | Every 14 days | 2 | → 4 Month |
| 4 Month | `4 Month Follow Up` | Every 30 days | 4 | → 1 Year |
| 1 Year | `1 Year Follow Up` | Every 60 days | 6 | → Exhausted (tag + close) |

Configurable via env vars: `FOLLOWUP_1MO_INTERVAL_DAYS`, `FOLLOWUP_4MO_MAX_TOUCHES`, etc.

### Message Tones (AI-selected, rule-based)

| Tone | When Used |
|------|-----------|
| `check-in` | Default — neutral, low-pressure |
| `time-sensitive` | Urgency signals detected or timeline changed |
| `empathetic` | Life event in notes (divorce, estate, illness) |
| `rekindle` | Lapsed > 60 days — acknowledge the gap |
| `final-touch` | Last attempt before advancing bucket |

### Closer — Re-Engagement Trigger

When a follow-up contact responds with interest/scheduling intent:
1. Closer Agent fires (triggered by Response Agent intent classification)
2. Contact moved back to `Warm` stage in Sales Process pipeline
3. LM task created (30 min due): "Re-engaged: [name] — call now"
4. Note written: original bucket, motivation score, what they said

### Follow-Up Bot State (DB-backed)

`follow_up_state` table tracks: touch count, last/next contact timestamp, motivation score, bucket, status.
Status values: `active` → `responded` → `closed`

**Dedup window:** 90% of bucket interval. Running the poller frequently is safe — contacts don't get double-contacted.

---

---

## Real Conversation Definition

Used by Response Analyzer to stop drip sequences. Applies across all wholesale tenants.

**Counts:**
- Seller asks a question about the property or process
- Seller provides any information (address, timeline, price, etc.)
- Seller expresses interest or requests contact
- Any substantive exchange

**Does NOT count:**
- Stop / Unsubscribe → unsubscribe flow
- Not interested / Don't contact → unsubscribe flow
- Push-offs (call me later, busy, not now) → drip continues
- Automated replies → drip continues
- One-word unclear responses → drip continues, flag for review

---

## Scope — New Lead Process

Triggers on: `OpportunityCreate` webhook for **seller** leads entering the entry stage.

**Hard stop (halt processing, alert team):**
- No phone AND no email → unreachable, stay in New Lead stage

**Silent exit (wrong event, not an error):**
- Wrong pipeline → not a seller lead
- Wrong stage → already processed
- Duplicate webhook → idempotency hit
- Non-seller contact type → buyers, partners, etc.

---

## Outbound Channels

All outbound communication routes through Outbound Manager — agents never send directly.

### SMS (Primary Channel)
- Always sent. All contacts receive SMS as long as a phone number exists.
- Routed from assigned LM's LC phone number (`fromUserId` on GHL message).
- Send window enforced: business hours only (9am–6pm tenant timezone).

### Email (Secondary Channel)
- Sent alongside SMS **only when the contact has a valid email on file**.
- If no email exists, SMS sends as normal and email is silently skipped — never an error.
- Uses GHL conversation channel (`type: Email`) — routes through location's configured email address.
- Subject line required. HTML body optional (plain text always provided as fallback).
- Drip sequence email templates are defined per-step in `drip-sequence.ts`.
- Email dedup uses same idempotency window as the drip step it belongs to.

### Outbound Manager — Channel Routing
```
sendOutbound({ channel: 'sms' | 'email', subject?, message, ... })
  → channel = 'sms' → SmsBot.send()
  → channel = 'email' → EmailBot.send() — requires subject
```

## Idempotency Windows (Industry Defaults)

| Action | Default Window | Env Override |
|--------|---------------|-------------|
| SMS send | 24 hours | `OUTBOUND_SMS_DEDUP_HOURS` |
| Email send | Same as drip step delay | — |
| Pipeline move | Immediate | — |
| Task creation | 24 hours | — |
| Agent run (full) | 5 minutes | — |

---

## Call Outcome Routing

| Outcome | Next Step |
|---------|-----------|
| Appointment booked | → Acquisitions Supervisor |
| Needs follow-up (short-term) | → Follow Up Supervisor |
| Not a fit | → Follow Up Supervisor (12-month bucket) |
| Voicemail left | DO NOT start Working Drip. LM follows up manually. |

---

## Confidence Thresholds — AI Decisions

| Level | Action |
|-------|--------|
| High (≥ 85%) | Execute automatically |
| Medium (60–84%) | Execute but add uncertainty flag to note |
| Low (< 60%) | Flag for LM confirmation before CRM action |
