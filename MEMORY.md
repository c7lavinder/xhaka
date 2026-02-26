# MEMORY.md — Long-Term Memory

*Last updated: 2026-02-23 (evening)*

---

## Corey Lavinder — Who I'm Working For

**Business:** Wholesale real estate (New Again Houses - Nashville)
**Role:** Founder/operator of NAH Nashville franchise
**Dad:** Owns the NAH franchise system (50+ locations) — Corey taking over is "inevitable"

### How Corey Operates
- Direct, busy, capable — doesn't need hand-holding
- Time and attention are sacred
- Does best with organizational layer around him so he can sprint
- Hates babysitting systems — things must run without him
- Cash is tight — profitability isn't optional, it's survival

### The Bigger Picture
Wholesaling is the engine, not the end goal:
1. **Building houses** — where real profit is ($50-100K/house)
2. **Lead gen products** — has ideas, understands it well
3. **Gunner** — AI call coaching platform, central to his direction
4. **Franchise succession** — taking over dad's 50+ location system

**$1M/month profit goal** — multiple businesses doing $250-300K each

---

## NAH Team

| Name | Role | Notes |
|------|------|-------|
| Kyle Barks | Acquisition Manager (AM) | Runs walkthroughs, makes offers |
| Daniel Lozano | Lead Manager (LM) | Currently handles ALL qualification |
| Chris Segura | Lead Manager (LM) | Newer, lower call scores |
| Esteban | Dispo Manager | Buyer relationships, selling deals |
| Jessica Guzman | Data Manager | KPI entry, lead routing, escalation contact |

---

## Gunner — getgunner.ai

**What it is:** AI-powered call coaching platform Corey built with Manus
**Login:** Google auth via xhakalavinder@gmail.com
**Access:** Full (admin)

**What it does:**
- Grades sales calls against proven methodologies
- Gamifies improvement (XP, badges, streaks, leaderboards)
- Integrated with GHL — auto-pulls NAH team calls
- Team stats visible (Daniel 49%, Kyle 43%, Chris 37% last check)

**Connected integrations:**
- GHL ✅
- BatchDialer ✅ (connected 2/9)
- BatchLeads ✅ (connected 2/9)

### Add-On Marketplace Model
- Every engine = toggleable add-on behind paywall
- Each independently toggleable via `ENGINE_<NAME>=active`

### 5 Execution Bots (agents think, bots do)
1. **Call Summary** → `addContext()` — $49/mo — notes/context
2. **Task Manager** → `createTask()` — $49/mo — tasks + dedup
3. **Message Queue** → `queueMessage()` — $49/mo — ALL outbound SMS + email (dedup, send windows, handoff detection)
4. **Opportunity Conductor** → `movePipeline()`, `assignUser()`, `activateEngine()`, `transferContact()` — $49/mo — CRM state + agent directing
5. **Appointment Bot** → `scheduleAppointment()` — $49/mo — scheduling + reminders + no-show (DRY RUN)

**Agent directing:** Opportunity Conductor controls which engines own which contact. `isEngineActive(contactId, engine)` = single authority.
**Rule:** Zero direct GHL mutations from agents. Only `ghl.addTag()` direct. Everything else through execution bots.

### Full Seller Lead Chain (CRITICAL — always reference LEAD-FLOW.md)
```
Sales Process → New Lead stage (SELLERS ONLY — not buyers/partners)
  → 1. Data Hygiene (clean/enrich/verify)
  → 2. Lead IQ (score → tag → assign → move to Warm/Hot → task → email)
  → 3. New Lead Responder (immediate SMS)
  → 4. Team member calls
  → 5. No answer → Working Drip (104-day sequence)
```
- Pipeline poller is the ONLY trigger for seller processing
- Contact poller = observation only (catches all contact types)
- LEAD-FLOW.md = single source of truth (`gunner-agents/LEAD-FLOW.md`)

### Gunner Agent Suite (22 agents spec'd)

**Approved & Ready (15 agents):**
1. Lead IQ — qualification scoring
3. LM Assistant — post-call automation
4. Follow Up Bot — intelligent nurture
5. Appointment Bot — scheduling, no-show handling
6. AM Assistant — post-call automation
7. Contract Bot — generate, send, track
10. Post-Close Bot — thank you, reviews, referrals
11. Data Hygiene Bot — clean data
12. KPI Entry Bot — auto-populate spreadsheets
13. Report Generator — daily/weekly/monthly
16. After-Hours Bot — engage leads after hours
17. Callback Capture Bot — AI listens to callbacks, creates opportunities
19. Market Watch Bot — trends, comps
20. MLS Monitor Bot — alert when pipeline properties list
22. PPL Refund Bot — file disputes (ALREADY BUILT in TypeScript + Playwright)

**Scrapped:**
- #2 Pre-Call Brief
- #8 Showing Bot
- #9 Title Bot
- #14 Commission Bot
- #15 Cash Flow Bot
- #18 Email Triage

### Version Map (Corey's definition)
- **V1** = current state (GHL workflows + gunner-engine live, CRASHED/paused)
- **V2** = automate 90%+ of business (all bots, full suite, marketplace) — **IN PROGRESS**
- **V3** = move away from funnel/pipeline view entirely (new UX)

### Gunner V2 Live Status (as of Feb 23, 2026 — evening)
- **URL**: https://gunner-v2-production.up.railway.app
- **Auditor**: https://gunner-v2-production.up.railway.app/audit
- **Service ID**: `38646fdb-45aa-4c50-a742-ffb4540d2268`
- **DRY_RUN**: currently `true` — Corey reviewing before going live
- **Pipeline running**: Steps 2→3→4→5 (Data Hygiene → Lead IQ → Initial Outreach → Working Drip) — 8 leads processed clean
- **AI model**: gemini-2.5-flash (current Railway `AI_MODEL`)
- **GHL token**: pit-bfb34a58-a87d-4a4d-835a-5019f257a46c
- **GHL_LOCATION_ID**: `hmD7eWGQJE7EVFpJxj4q`
- **PIPELINE_SALES_ID**: `tOqQbembKlIoPiXbepP3` (Sales Process)
- **PIPELINE_FOLLOW_UP_ID**: `grDjCVlwUKx4ShCiOqGi`
- **Stage IDs (confirmed from Railway)**:
  - `newLead` → `a977dd60-4ef9-40e1-9d8a-b62aaa6bb88f`
  - `warm` → `34b88324-9bb1-4110-8531-d4271c6c1567`
  - `hot` → `84c5583f-7b6b-494a-83b2-df9e54db3c8c`
  - `appointment` → `09016bf4-c573-4bf5-941b-2a2fb146a9af` ("Pending Apt" in GHL)
  - `offer` → `4ab2cfdb-4848-4e1a-b2cc-5e8fd5de0789`
  - `underContract` → `d71ec692-9af8-44cc-bd58-5831c130ac8b`
  - `purchased` → `23c35caa-1846-403e-86c7-a1a2ab748e58`
  - `ghosted` → `dc8a2451-8349-4c84-8e98-2dffccd5ca9b`
  - `notAFit` / `lost` → `b8590254-6256-4a48-831e-67d808f5125f` / `b157bae8-5e6a-4f45-94c4-02d1410a5761`
  - `oneMonthFU` → `0f7ddf92-ff79-44cb-97e8-61bf9b8db8fe`
  - `fourMonthFU` → `e0fbea34-7bf8-48ad-9a47-fed2dfd60b06`
  - `oneYearFU` → `733adecd-0d2f-4312-a92d-8bbc02e02dc5`
- **Webhook bug fixed**: `opportunity-created` events now route to `handleNewLead`; `isNewLeadStage()` checks both name AND stageId
- **All bugs resolved**: blank address, company name, UTC timezone, global market fallback, sender phone, dry-run path
- **Next**: LM Assistant Supervisor build, then go-live decision

### Follow-Up Bot V2 ($199/mo bundle, 3 agents)
1. **Organizer** — bucket mgmt (1mo/4mo/12mo), motivation scoring, delta analysis, tasks, notes
2. **Messenger** — crafts personalized re-engagement SMS + email, NOT static templates. GHL templates = floor.
3. **Closer** — converts re-engaged leads back to Sales Process, books appointments (STUB, needs work)
- DEAD = ONLY legal threats, confirmed sold, unviable property. Low motivation NEVER = dead.
- GHL follow-up workflows extracted to `gunner-agents/follow-up-workflows/GHL-FOLLOWUP-CONTENT.md`

### Gunner V1 Fixes Identified
- TOS/Privacy links dead → Manus fixing
- Admin-only tabs visible to all → needs fix
- "Opportunities Missed" renamed to **Pipeline Signals** (Feb 12)

### Pipeline Signals (Feb 12)
- **V1 LIVE** — 14 detection rules across 3 tiers (Missed/At Risk/Worth a Look)
- Pulls from GHL pipeline + conversations + call transcripts
- Runs hourly, admin can trigger manually
- Rule 1 (Lead moved to follow-up without call) DISABLED — too noisy, deferred to V2
- Conversation scan capped at 50 — monitor if signals get missed on busy days
- Full spec saved: `gunner-agents/signals-v1-spec.md`
- Real example saved: `gunner-agents/signals-v2-examples.md` (Robin Phelps case)
- AI Coach contactId bug fixed (was undefined during action execution)
- AI Coach preference/learning system discussed — V1 approach: capture before/after edits, build per-user preference profiles, inject at session start

### Phase 1 Bot/Registry — COMPLETE (Feb 23, 2026)
- **BotRegistry** at `src/registry/index.ts` — 22 bots (8 action + 14 observation) registered and validated at boot
- **14 observation bots** in `src/bots/observation/`: conversation, response tracker, unread, gap, stage velocity, age, activity, recording, transcript (GHL+AssemblyAI), duration, disposition, attempt counter, double-dial checker, task completion
- **CRM interface extended**: `getUnreadMessages`, `getCallsForContact`, `getCallRecordingUrl`, `getUser/s`, `getNewLeadContacts`, `CRMCall`, `CRMUser` types
- **ARCHITECTURE.md completed** — `/Users/wholesaleai/.openclaw/workspace/gunner-agents/ARCHITECTURE.md`
- **`src/intelligence/call/quality-scorer.ts`** — full implementation: AI scoring + rule-based fallback, A–F grade, 6 factors (Rapport/Discovery/Timeline/Motivation/Objection Handling/Next Step), scorable flag

### Follow-Up Bot — BUILT (Feb 23, 2026 evening)
- **Organizer**: `src/agents/follow-up/organizer.ts` — polls 1mo/4mo/1yr stages, runs re-engagement analysis, sends personalized SMS, advances buckets
- **Messenger**: `src/agents/follow-up/messenger.ts` — AI-crafted SMS (5 tones: check-in, time-sensitive, empathetic, rekindle, final-touch)
- **Closer**: `src/agents/follow-up/closer.ts` — fires on positive reply, moves back to Warm, creates LM task
- **Poller**: `src/core/follow-up-poller.ts` — runs every 6h (FOLLOW_UP_POLL_INTERVAL_MS)
- **DB table**: `follow_up_state` — tracks touch count, last/next contact, motivation score, bucket, status
- **Cadence**: 1mo: 14 days / 2 max → 4mo: 30 days / 4 max → 1yr: 60 days / 6 max → close
- **Trigger endpoints**: POST /api/audit/followup-trigger, ?force=true, GET /api/audit/followup-state
- **Wired**: server.ts + response.ts (Closer fires on interested/scheduling intent)

### LM Assistant — NEXT PRIORITY (not yet built)
- **Location**: `src/supervisors/lm-assistant.ts`
- **Pattern**: follow `src/supervisors/new-lead.ts` (124 lines)
- **Also needs**: `src/intelligence/call/disposition.ts`, `sentiment.ts` (stubs), `src/agents/call-coaching.ts`, `src/core/call-poller.ts`
- **Disposition routing**: 7 outcomes (no-answer/voicemail, no-answer/no-voicemail, conversation-no-apt, apt-set, not-interested, already-sold, wrong-number)
- **CallCoachingAgent fires on EVERY call** regardless of disposition

### Gunner Gaps to Verify (Reminder fired 2/10)
1. Chris Segura linked to account? — YES, visible on leaderboard (36%, 168 calls as of 2/12)
2. Analytics working for admins?

### Gunner Team Stats (Feb 12)
- Kyle Barks: 69%, 89 calls (up from 43%)
- Daniel Lozano: 47%, 138 calls (down from 49%)
- Chris Segura: 36%, 168 calls (down from 37%)

---

## GHL — GoHighLevel

**Account:** New Again Houses Nashville
**URL:** app.gohighlevel.com
**Login:** xhakalavinder@gmail.com / Belmont2026!
**Access:** READ ONLY (unless Corey explicitly approves)

### Pipeline Structure
1. **Sales Process** — active leads through closing (New Lead → Warm → Hot → Apt → Offer → UC → Purchased)
2. **Follow Up Pipeline** — nurture buckets
3. **Dispo Pipeline** — deals under contract being sold to buyers
4. **Buyer Pipeline** — 3,293 buyers
5. **JV Deals** — joint ventures
6. **Lead Mining** — prospecting

### Custom Fields Created (Feb 1)
**Buyer Info (Contact):** Buyer Tier, Verified Funding, Has Purchased Before, Response Speed, Last Contact Date, Buyer Notes, Market(s), Buybox

**Deal Info (Opportunity):** Market, Property Type, ARV, Repair Estimate, Contract Price, Asking Price, Deal Summary, Photos Link, Access Instructions

### Lead Scoring (Hot/Warm)
5 factors: Timeline, Condition, Price, Motivation, Source
- 3+ factors = HOT
- No "COLD" score — only HOT and WARM

---

## PPL Platforms (Pay Per Lead)

**Rule:** DISPUTES ONLY — never add or change bids

| Platform | Login | Lead Cost | Dispute Window |
|----------|-------|-----------|----------------|
| Leadzolo | corey@newagainhouses.com / Belmont2026 | $8-135 | 7 days |
| MotivatedSellers | corey@newagainhouses.com / Belmont2026! | $150 | 10 days |
| PropertyLeads | corey@newagainhouses.com / Belmont2026! | $125 | varies |

### Dispute Learnings
- Leadzolo: Skip entirely — discounted leads, no refunds on mobile homes
- MotivatedSellers: reCAPTCHA on login blocks automation
- PropertyLeads: Track declined refund rate (NAH at 4.89%)
- Always verify GHL conversation first — real engagement = valid lead
- Ask Corey before filing disputes

### First Dispute Filed (2/9)
**Black Campbell** — MotivatedSellers — $150 potential refund
- Reason: Inaccurate Contact Info (Jamaican phone, placeholder email)

---

## Other Integrations

| Platform | API Key | Purpose |
|----------|---------|---------|
| BatchDialer | d98ac867-62b7-439d-8d72-a19004a93e25 | Call metrics |
| BatchLeads | 06b81a7c-f69c-42c3-bc1f-c8ed55d01e1a | SMS metrics |
| CallRail | 267bcdd64628abc9c9c4c43e8a46dca2 | Voicemails, call logs |

---

## Dispo Process — Master Reference

**Source:** Lucidchart "DISPO LEAD GEN Process Map" — `https://lucid.app/lucidchart/8596ccb3-5e9b-418d-aefc-514d8b148adf/edit`
**Corey says:** "All of dispo goes back to this chart." Mostly updated as of Feb 15, 2026.
**Core principle:** Maximum exposure in first 48 hours. Good deals sell themselves.

### Deal Packaging Pipeline (left → right)
1. Expectations w/ Seller Set
2. High Quality Pictures
3. Property Details and numbers (ARV, repairs, contract price)
4. Property Website Created
5. **Start Marketing** (green light) → splits into two tracks

### Track 1: Buyer Hunts (active outbound)
| Channel | Actions |
|---------|---------|
| InvestorLift | Create property page → marketing campaigns → add buyer to list |
| Mevlo | Download Realtor/Redfin numbers → create messages CSV |
| Zillow Rentals | Look up property → filter rentals → see if listed by owner |
| MLS/Listed Flips | Filter listed/sold → find contact of agent |
| Facebook Groups | Join groups → look for wholesaler posts |
| Mass Campaigns | Bulk outreach across channels |

### Track 2: Buyer Lists (existing database)
| Platform | Action |
|----------|--------|
| Privy | Navigate to active buyers in market |
| OpenDeal | Navigate to qualified buyers in market |
| JV Partners | Navigate to JVs in area |

### Current Posting Platforms (confirmed Feb 15)
InvestorLift, Mevlo, Facebook

### Dispo Team Roles (Page 3)
- **Owner (Corey):** Final decision maker, ensures lead gen engine firing, monitors books
- **Dispo Admin:** Creates marketing campaigns, sends contracts, sends buyer/seller details to TC, monitors TC progress, tracks KPIs
- **TC (Transaction Coordinator):** Opens escrow, handles title issues, maintains buyer/seller communication, ensures closing date performance
- **Dispo Mgnr (Esteban):** Executes marketing campaigns, creates buyer opportunities, qualifies buyers in CRM, schedules showings, generates offers, ensures executed agreements

### Full extraction saved at:
`gunner-agents/add-ons/buyer-lead-gen/dispo-process-map.md`

---

## Projects & Status

### Skool Course — "Ensuring a Deal a Month"
**Status:** Content drafted, 10 modules, 75+ lessons
**Positioning:** How to enter any market and close a deal every month
**Price point:** ~$99/mo
**Files:** `skool-modules/`, `skool-full-course-build.md`

### Gunner White-Label
**Status:** Brief written for Manus
**Goal:** Multi-tenant SaaS ($99/$249/$499 tiers)
**File:** `gunner-whitelabel-brief.md`

### GHL Documentation
**Status:** In progress
**Google Doc:** "Deep understanding of NAH GHL"
**Purpose:** Team onboarding, eventually franchise standard

### ARV Assistant
**Status:** Full spec complete
**What it does:** Grades properties from Street View, calculates construction budget
**Training:** NAH Franchise "Drive-By Grading" system
**File:** `gunner-agents/add-ons/arv-assistant/SPEC.md`

---

## Standing Rules

- **Playbooks update with every build** — `playbooks/base/WHOLESALE-RE.md` (industry floor) and `playbooks/nah/PLAYBOOK.md` (NAH ceiling) must stay in sync with the code. Any new agent, config var, template variable, or behavioral rule gets documented in the appropriate playbook in the same commit it's built. No exceptions.
  - New env var → add to NAH Playbook env var table + base Playbook if industry-level
  - New agent → document its trigger, behavior, and config in the relevant playbook section
  - New template variable → add to Drip Template Variables table in base Playbook
  - New intelligence factor → add to Lead Scoring table in base Playbook

---

## Key Decisions Made

- **Buyer fields on Contact, Deal fields on Opportunity** — clean separation in GHL
- **All leads → Daniel** — only LM doing qualification currently
- **15 min SLA** on new leads, escalation to Jessica at 30 min
- **Course focus:** NOT "how to run NAH" but "how to enter any market and get consistent deals"
- **Multi-tenant from day one** — everything built for Gunner is architected for resale
- **Zero-config where possible** — bots auto-discover pipelines, stages, team
- **BatchLeads for property data** — beds/baths/sqft/type pulled via BatchLeads API (key in TOOLS.md). RentCast dropped.
- **All agents industry-agnostic** — Playbook dictates output. Swap Playbook = new industry, zero code changes. Locked in ARCHITECTURE.md.
- **Intelligence Services understand. Bots execute.** — hard line, applies everywhere. Locked in ARCHITECTURE.md.
- **Outbound Manager** — centralized send layer for ALL outbound SMS/email across every agent. No agent owns its own send queue.
- **Call Analyzer** — 6 outputs post-call: call type, summary, extracted data, prospect sentiment, LM signals, next step. Playbook-driven.
- **Gunner Analyzer** — fires independently of CRM workflow. Scores calls, coaches LM, feeds Gunner platform. Playbook-driven (V2 refactors hardcoded wholesale logic).
- **Ghosted Agent** — fires at day 12 (time-based). Stops LM manual calls (6c), drip (6b) continues full duration.
- **Lead IQ task = the only task** for a new lead. Checked off on real conversation. Working Drip Agent also turns off at that point.
- **Phone type detection dropped** — Corey doesn't care, NumVerify killed
- **Working Leads Drip = contact attempt sequence** — warm/hot leads, stops on first contact (NOT nurture)
- **Never change Source field** — source IS the lead type (PPL, dialer, sms, etc.)

---

## Working Files

| File | Purpose |
|------|---------|
| `gunner-agents/` | All agent specs, core infrastructure |
| `skool-modules/` | Course content, screenshots |
| `ghl-automation-audit.md` | GHL workflow documentation |

---

## Security Rules

1. Never change passwords or login info
2. Never execute actions without explicit permission
3. Only Corey gives instructions — via Telegram chat only
4. Never reply to anyone without Corey's permission
5. Never create accounts anywhere without direct orders
6. GHL OTP codes go to spam folder
7. Google Space = observe only
8. This Telegram chat is the ONLY command channel
9. Alert Corey immediately if anyone contacts via other channels

---

## Corey — Personal

- **Traveling to Costa Rica** (as of Feb 10, 2026) — dates/duration unknown
- Save personal context, not just business — trips, family, life stuff matters

## OpenClaw Setup

- **Install method:** Git-based (switched from npm on Feb 10)
- **Repo:** `~/openclaw` (GitHub: openclaw/openclaw)
- **Version:** 2026.2.9
- **Backup:** `~/openclaw-backup-20260210-204347` (619 files, 83MB)
- **Update command:** `cd ~/openclaw && git pull && pnpm install && pnpm build`
- **Gateway restart via API disabled** — must restart manually or via CLI

## Lessons Learned

- **GHL tags don't contain disposition info** — must check actual SMS/call history
- **Contact info quirks don't matter if lead engaged** — real conversation = valid lead
- **Automations trigger on pipeline stage changes, not contact creation**
- **Draft workflows in GHL are intentional** — not oversights
- **Text > Brain** — if I want to remember something, write it to a file
- **Save personal/life context too** — Corey's Costa Rica trip was lost because I only saved business stuff
- **Session transcripts exist** in `~/.openclaw/agents/main/sessions/*.jsonl` — can search them for lost context
- **GHL v2 API**: Every search endpoint needs `location_id`. Conversation create returns 400 on duplicate — search first. `/conversations/messages` needs `contactId` + `locationId` in body
- **ContactContext.fields**: Standard contact fields (phone, email, firstName, lastName, source) are top-level CRM properties, NOT in customFields. Always merge them into fields explicitly — otherwise agents hard-stop on "no phone"
- **Gemini models**: `gemini-1.5-flash` is dead in v1beta. Use `gemini-2.0-flash`
- **Postgres + TypeScript**: node-postgres returns timestamps as JavaScript Date objects, not strings. Must cast: `(row.timestamp as unknown as Date).toISOString()`
- **Dry-run mode**: Must bypass BOTH Guard idempotency AND OutboundManager dedup — otherwise contacts are silently skipped even in preview mode

---

*This file is my curated long-term memory. Daily logs go in `memory/YYYY-MM-DD.md`.*

---

## Updates — Feb 24, 2026

### Business Rules (confirmed by Corey in process map review)
- **Drip trigger**: first text fires within 5 min of LM's double dial — NOT on a timer
- **Send window**: 9am–6pm in the LEAD's timezone (not NAH timezone)
- **No-answer/voicemail**: no task created — existing overdue task IS the pressure
- **Appointment set**: drip CANCELLED (not paused). No AM task. GHL automation handles prep
- **Real conversation**: Lead IQ task checked off + follow-up text sent from LM's number
- **Follow-up buckets are NOT linear**: 1mo = selling in ~30 days but blocked; 4mo = selling in 6 months; 12mo = anyone else. LM places directly based on call
- **Already sold**: always verify UC vs. sold via transcript + county records. If UC → re-engage. Auto-move to Lost only if confirmed sold
- **Wrong number**: opportunity deleted from GHL
- **Coaching**: stays in Gunner app only. GHL gets call summary (what/facts/next step)
- **Follow-up exhausted**: NO tag applied
- **"Not interested"** label changed to **"Not right now"** everywhere

### Bot Registry — 28 bots (13 action, 15 observation)
New bots added Feb 24:
- ContactNotesBot (observation) — reads GHL contact notes
- InboundMessageBot (observation) — inbound messages since timestamp
- OpportunityBot (action) — deletes opportunities, dry-run aware

### New Agents Added Feb 24
- `src/agents/ghosted-agent.ts` — Day 14: moves to Ghosted stage, applies tag, checks off Lead IQ task
- `src/agents/already-sold-agent.ts` — audits transcript (UC vs sold), county records task, coaching flag, auto-moves to Lost

### Pending Extractions (known violations)
- `already-sold-agent.ts` `auditTranscript()` → extract to `src/intelligence/call/sold-verifier.ts`

---

## Updates — Feb 24, 2026 (evening)

### Gunner V2 Call Intelligence Architecture (LOCKED)

**Unified `call-intel.ts`** — one AI call per transcript (replaces 3 separate classifiers)
- Returns: `disposition`, `confidence`, `followUpBucket?`, `bucketReason?`, `motivationScore`, `sellerSignals[]`, `objections[]`, `appointmentDetails?`, `coachingFlags[]`, `callSummary`, `source`, `callMode`
- `followUpBucket` returned for BOTH `not-right-now` AND `conversation-no-apt`
- Used by: `lm-assistant.ts`, `am-assistant.ts`, `callback-capture.ts`
- `callback-requested` disposition removed — folded into `conversation-no-apt`
- Dead = ONLY confirmed sold, legal threat, or condemned. Low motivation = NEVER dead.

**Knowledge System**
- `config/knowledge/industry.md` — universal wholesale RE rules (no deploy needed to edit)
- `config/playbooks/nah.md` — NAH-specific rules (no deploy needed to edit)
- `src/intelligence/call/knowledge-loader.ts` — assembles system prompt, cached

### New Agents / Supervisors (Feb 24 evening)
- `src/supervisors/stage-change.ts` — routes GHL `stage-changed` events (UC/Purchased/Lost/Ghosted/Appointment)
- `src/agents/callback-capture.ts` — inbound call handler, mirrors LM Assistant
- `src/agents/contract-bot.ts` — UC trigger: AI SMS + Kyle task + 24h escalation
- `src/agents/post-close.ts` — 3-touch DB sequence (24h/48h/7d) via `sequence_state` table
- `src/core/inbound-call-poller.ts` — 3min poll for completed inbound calls

### Follow-Up Cadence (all buckets → 6 touches)
- `1mo`: 15-day intervals × 6 (Day 15/30/45/60/75/90 — 90 days total) → then graduates to 4mo
- `4mo`: 60-day intervals × 6 (Day 60/120/180/240/300/360 — 12 months total) → then graduates to 1yr
- `1yr`: 180-day intervals × 6 (Month 6/12/18/24/30/36 — 36 months total) → closes out
- Bucket re-eval on any non-positive seller response (pending implementation in `response.ts`)

### Latest Commit (Feb 24 evening)
- `260c0de` — "fix: conversation-no-apt cancels drip + AI bucket placement"
- Cadence change saved to organizer.ts (commit pending at session end)

### Gunner Build Roadmap (locked Feb 25)
- Full roadmap at `gunner-agents/ROADMAP.md`
- Phase 1: Finish Acquisition (current) → Phase 2: Dispo → Phase 3: Lead Gen → Phase 4: KPIs → Phase 5: WIZARD
- KPIs are Phase 4 (not 2) — need data from Dispo + Lead Gen to be complete
- **Wizard is the end goal** — 10-min deploy into any GHL, generates tenant playbook via industry-specific conversation
- Do NOT build wizard early — needs all phases represented first

### Key Business Context (Corey corrections — Feb 24 night)
- **Offer Reply most common = STALL**: "still waiting", "not ready yet", "dealing with something" — reset chase, don't cancel
- **UC Monitor**: TC work is OUTSIDE GHL. Real fires = seller communication post-contract (anxiety, dispute, confusion, closing questions). NOT inspection findings (flows TO seller). NOT access requests (buyer-side).
- **V2 completion criteria**: Bots built + EACH ROLE HAS A VIEW. Team won't trust what they can't see. Role view = live activity feed + "needs your attention" section per person.

### New Agents (Feb 24 late)
- **Offer Reply Agent** (`src/agents/offer-reply-agent.ts`) — 5 outcomes: accept/counter/stall/reject/unclear
- **UC Monitor** (`src/agents/uc-monitor.ts`) — 3-tier routing: auto-reply/TC/AM. Every 30 min.
- **UC Message Classifier** (`src/intelligence/uc/uc-message-classifier.ts`) — concern/dispute/closing-logistics/confusion/general
- **UC Auto Reply Crafter** (`src/intelligence/uc/uc-auto-reply.ts`)
- `resetOfferChase()` added to offer-chase.ts
- `'tc'` added to TeamRole union

### Still Pending (carry forward)
- **AM walkthrough-no-offer path** — ✅ BUILT (commit `2e0178a`) — creates 24h task for AM to run numbers and return with offer
- **Wire TC/Dispo send medium** — when Corey ready
- **Dispo Pipeline IDs** — Corey to provide
- **Flip DRY_RUN=false** — Corey explicit only
- **Role views** — ✅ BUILT: `/lm` and `/am` pages live (commits `fe883fb`). Phase 1 Acquisition is COMPLETE.
- **Auditor Agent Guide** — ✅ BUILT: "🤖 Agent Guide" tab in auditor covers all 22 agents in plain English (commit `7c2e527`)
- **5 design mockups sent to Corey** — `/design-1.html` through `/design-5.html` for auditor rebuild. Awaiting design choice.
- **DRY_RUN=true confirmed** on Railway. Working drip `dryRun:false` in metadata is a display artifact — no real messages sending.
- **"Unknown Lead" fix** — Pipeline API now does batch CRM lookup for missing names; drip logs contactName going forward (commit `cce1e06`)
- **Disable CRM automation workflows** for walkthroughs/offer calls before go-live

### Latest Commits (as of Feb 24 late night)
- `b3fe4ef` — full visual audit: stall outcome added, all GHL refs in descriptions cleaned
- `168a1e4` — code audit: hardcoded names/GHL refs removed (KylePrepInput→AMPrepInput, BUCKET_TO_GHL→BUCKET_TO_STAGE, etc.)
- `6084519` — UC Monitor categories corrected to real wholesale context
- `8d18552` — UC Monitor 3-tier routing (auto-reply/TC/AM)
- `1f13fd8` — UC Monitor added to process-map inside Closing Automation phase
- `fa6ef83` — Offer Reply Agent + UC Monitor redesigned from Corey corrections
- `971751f` — initial Offer Reply Agent + UC Monitor + stage-aware Response Agent

---

## Gunner V2 — Trigger Architecture (Feb 25 evening, locked)

### Core Principles (NEVER violate these)
1. **One poller per data source** — never per agent. `crm-sync.ts` is the only GHL event poller.
2. **Agents don't know their triggers** — `triggers.ts` reads from playbook, agents just run
3. **Triggers live in the playbook** — industry-specific + tenant-specific. Not in code.
4. **Webhooks primary, polling fallback** — OAuth auto-registers, polling catches misses
5. **Everything rate-limited through `api-throttle.ts`** — all GHL calls go through one throttle

### Trigger Flow (as of latest commit `d43393e`)
```
GHL webhook → recordWebhookReceived() → eventBus.emit(GunnerEvent)
           OR
CRM sync (adaptive: 1–5 min based on webhook health) → eventBus.emit()
           ↓
triggers.ts: reads config.playbook().triggers[] → isFeatureEnabled() → meetsConditions() → agent-registry.ts → handler()
```

### Adding an Agent (the only correct way)
1. Write the agent function
2. Register `name → handler` in `src/core/agent-registry.ts`
3. Add trigger entry to `wholesaleReTriggers()` in `config/loader.ts` OR set `TRIGGERS_JSON` env var
Zero other files change.

### Key Files
- `src/core/event-bus.ts` — typed pub/sub
- `src/core/crm-sync.ts` — unified GHL poller (one session/cycle)
- `src/core/triggers.ts` — playbook-driven trigger wiring
- `src/core/agent-registry.ts` — name → handler map
- `src/core/api-throttle.ts` — global rate limiter (per-tenant)
- `src/core/webhook-health.ts` — webhook liveness tracking
- `src/core/config/loader.ts` — `wholesaleReTriggers()`, `genericTriggers()`
- `src/setup/router.ts` — OAuth flow auto-registers webhook on connect

### Rate Limit Config (all env vars, no hardcoding)
- `API_RATE_LIMIT_RPS=5` — sustained req/sec
- `API_RATE_LIMIT_BURST=10` — burst capacity
- `API_RETRY_MAX=5` — retries on 429/5xx
- `API_RETRY_BASE_MS=5000` — base backoff
- `WEBHOOK_HEALTHY_WINDOW_MS=900000` — 15 min = healthy
- `CRM_SYNC_INTERVAL_MS=120000` — fallback if webhook health unavailable

### Current NAH State (Feb 25)
- PIT token → polling only (no webhooks yet)
- To activate webhooks: run /setup OAuth flow (2 min, one-time)
- 6 leads stuck in New Lead (Connie/Daryel/Charles/James/Kent/Elizabeth) — will auto-process on next clean sync

