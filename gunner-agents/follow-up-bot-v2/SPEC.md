# Follow-Up Bot V2 — Spec

> $199/mo bundle — 3 engines
> Engine toggle: `ENGINE_FOLLOW_UP=active`

## Overview

Replaces GHL's 3 follow-up workflows with a unified, intelligent follow-up system aligned to NAH's 4 buckets:

| Bucket | Timeline | GHL Stage | Follow Up Pipeline Stage |
|--------|----------|-----------|--------------------------|
| **1 Month** | Recently worked, check back soon | 1 Month Follow Up | 1 Month Follow Up |
| **4 Month** | Medium-term, stay in touch | 4 Month Follow Up | 4 Month Follow Up |
| **12 Month** | Long-term, light touches | 1 Year Follow Up | 1 Year Follow Up |
| **Sold/Dead** | Terminal — stop all outreach | SOLD / DO NOT WANT | — |

## Architecture — 3 Engines

### Engine 1: Entry Router
**What:** Detects when a lead enters follow-up territory and routes to the correct bucket.

**Triggers:**
- Sales Process stage change → follow-up stage (1 Month, 4 Month, 1 Year, Ghosted, DO NOT WANT, SOLD, Purchased, Agreement not closed)
- Stale opportunity detection (mirrors GHL's "Sitting in Lead Gen" — 10 days stale in Sales Process)

**Routing logic (mirrors GHL Workflow 3):**

| Sales Process Stage | → Action |
|---------------------|----------|
| 1 Month Follow Up | Tag "1 month" → remove from Working Drip → move to Follow Up pipeline 1 Month stage |
| 4 Month Follow Up | Tag "4 month" → remove from Working Drip → assign user → move to Follow Up pipeline 4 Month stage |
| 1 Year Follow Up | Tag "1 year" → remove from Working Drip → assign user → move to Follow Up pipeline 1 Year stage |
| Ghosted Lead | Tag "ghosted" → remove from Working Drip → mark lost → move to Follow Up pipeline |
| DO NOT WANT | Tag "dnw" → remove from Working Drip → mark lost → abandon opportunity |
| Agreement not closed | Tag "not closed" → remove from Working Drip → move to Follow Up pipeline |
| SOLD | Tag "sold" → remove from Working Drip → mark won |
| Purchased | Tag "purchased" → remove from Working Drip → move to Follow Up pipeline |

**Also does:**
- Removes from Working Drip (stops active outreach)
- Logs to Google Sheets equivalent (KPI tracking)
- Creates/moves Follow Up pipeline opportunity

### Engine 2: Organizer
**What:** Keeps follow-up leads in the right bucket based on ongoing signals. Creates tasks. Cleans data.

**Runs:**
- On new conversation (conversation poller) for Follow Up pipeline contacts
- Daily sweep at 7am CST for stale/overdue leads

**Core logic:**
1. **Motivation scoring** (0-10, 5 factors: timeline, condition, price, circumstances, engagement)
2. **Delta analysis** — compare current signals vs last summary. Detect warming, cooling, dishonesty.
3. **Competitor detection** — under contract, working with another buyer → schedule check-back task
4. **MLS detection** — listed with agent → schedule MLS check task
5. **Bucket recommendation** — based on motivation score:
   - 7+ → RE-ENGAGED: upgrade back to Sales Process (Hot)
   - 4-6 → WARMING UP: move to 1 Month, increase touch frequency
   - 2-3 → STILL COLD: keep in 4 Month or 12 Month, light touches
   - 0-1 → DEAD: stop messaging, archive
6. **Task creation** — specific tasks with dates, assigned to the right person
7. **Task chaining** — close old follow-up tasks before creating new ones

**Outcome signals (used by Messenger + Gunner V2 app):**
- 🔥 **RE-ENGAGED** → Appointment Booker → Walkthrough with AM
- 📈 **WARMING UP** → Increase intensity, more frequent touches
- ❄️ **STILL COLD** → Light touches, longer intervals
- 💀 **DEAD** → Stop messaging, archive

### Engine 3: Messenger
**What:** Sends adaptive follow-up SMS using proven templates. Reads signals from Organizer.

**Message templates (from GHL — proven):**

#### 4 Month / 12 Month SMS Drip (3 rounds)

**Round 1 — 5 variants (randomized):**
- A: `Hi {{first_name}}, we had a chat about {{address}} a few months back. Are you still looking to sell?`
- B: `Hi {{first_name}}, it is {{user_name}} with New Again Houses. Were you able to sell {{address}}? Are you still looking to sell?`
- C: `Hi {{first_name}}, it is {{user_name}} with New Again Houses. We had spoken a few months back about {{address}}. Is now a good time to start the process of selling?`
- D: `{{first_name}}, checking back in to see if you are still looking to sell {{full_address}}? We had spoken a few months back. — {{user_name}} with New Again Houses.`
- E: `Hey {{first_name}}, were you still exploring options to sell {{address}}? {{user_name}} w/ New Again Houses.`

**Round 2 (all paths):**
> Is selling {{full_address}} still an option?

**Round 3 (all paths):**
> Should I mark you as not selling {{full_address}}? Or is there a better time to discuss it?

**Timing:**
- 1 Month bucket: Start drip after 26 days in bucket (mirrors GHL)
- 4 Month bucket: Start drip after 10 days stale, wait between rounds
- 12 Month bucket: Same templates, longer waits between rounds
- Sold/Dead: NO messages

**Adaptive behavior (V2 enhancement over GHL):**
- Reads Message Intelligence signals — if a template variant has low response rate, weight it down
- Reads Organizer outcome — if WARMING UP, shorten wait between rounds
- If RE-ENGAGED, stop drip immediately (hand off to Sales Process)
- If DEAD, stop drip and archive

**Reply handling:**
- Real reply → stop drip, trigger Organizer re-assessment
- Brush-off → continue drip (next round)
- DNC → stop drip, flag contact, add DNC tag

## GHL Workflows to Disable After Go-Live

| Workflow | ID | Status |
|----------|----|--------|
| 1 Month Follow Up Workflow | `73b74257-3332-444e-83c5-d313659c1abf` | Published → Disable |
| Follow Up Automation | `0927d584-e878-427d-8824-835c8c986140` | Published → Disable |
| Follow Up Organization | `9c959627-91b0-4207-93e5-9da1ead7605a` | Published → Disable |

## Data Flow

```
Lead falls out of active sales
  → Entry Router (bucket assignment, tag, remove from Working Drip)
  → Organizer (motivation score, delta, tasks)
  → Messenger (SMS drip per bucket schedule)
  → Reply comes in
  → Organizer re-assesses
  → Outcome: RE-ENGAGED / WARMING UP / STILL COLD / DEAD
```

## Key Differences from GHL Workflows

1. **Adaptive messaging** — GHL uses static round-robin. We read signals.
2. **Delta analysis** — GHL doesn't track motivation changes over time.
3. **Competitor/MLS detection** — GHL doesn't detect these patterns.
4. **Task chaining** — GHL creates tasks but never closes old ones.
5. **Unified engine** — GHL has 3 separate workflows that sometimes conflict. We have one system.
6. **Outcome-based routing** — GHL follows fixed paths. We route based on actual behavior.
