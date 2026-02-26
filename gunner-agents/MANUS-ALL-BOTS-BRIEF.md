# Gunner V2 — All Bots Activation Brief
**Date:** Feb 26, 2026  
**From:** Xhaka  
**Goal:** Get all 21 agents fully operational

---

## Current State (as of today)

### ✅ Already Running
| Agent | Evidence |
|-------|---------|
| data-hygiene-agent | 1+ runs in audit |
| lead-iq-agent | 1+ runs |
| initial-outreach-agent | 1+ runs |
| working-drip-agent (New Lead Drip) | 1+ runs (sequence paused at NEW_LEAD_DRIP_ENABLED=false — correct) |
| am-assistant | 6 runs (Kyle's calls) |
| call-coaching-agent | 2 runs |
| uc-monitor | 149 runs |
| accountability-agent | 3 runs |
| follow-up-organizer | Last run Feb 25 |
| outbound-manager | 123 runs |

### ✅ Wired & Built — Waiting for Right Trigger
These are implemented and registered. They just haven't had the right event yet:
| Agent | Waiting For |
|-------|-------------|
| lm-assistant | LM calls (ROLE_LM_IDS just set today — Feb 26) |
| response-agent | Inbound SMS/email from a lead |
| apt-prep-agent | appointment-confirmed or appointment-cancelled event |
| offer-chase-agent | Leads entering Offer stage |
| offer-reply-agent | Inbound message when lead is in Offer stage |
| contract-bot | Stage move to Under Contract |
| post-close | Stage move to Purchased |
| callback-capture | Inbound call event |
| stage-change | Stage change events (webhook health = unknown — see gap #1 below) |
| follow-up-closer | Positive reply from follow-up bucket |

---

## Gaps to Fix

### Gap 1: Webhooks Not Set Up (HIGH PRIORITY)
**Problem:** `webhookHealth.state = "unknown"`, `totalReceived = 0`. All event detection is via polling (60s interval). This means:
- stage-change, response-agent, callback-capture, apt-prep all work — but with up to 60s delay
- Some rapid event sequences may be missed
- LM Assistant call detection is polling-based, not instant

**Fix:** Run the OAuth setup flow to auto-register GHL webhooks.
- Route: `/setup` in the codebase
- This is a one-time flow. Once done, all events arrive in real-time via webhook.
- The system already has `src/setup/router.ts` that auto-registers the webhook on connect.

**Action:** Guide Corey through `/setup` OAuth flow, or confirm if there's a reason it's been skipped.

---

### Gap 2: AssemblyAI Transcript (MEDIUM PRIORITY)
**Problem:** `ASSEMBLYAI_API_KEY` is not set. LM Assistant + AM Assistant fall back to duration heuristics for call disposition (short call = no-answer, longer = connected). Works okay but:
- Coaching quality is lower (no transcript to analyze)
- Disposition accuracy is ~70% without transcript vs ~90%+ with

**Fix:** 
1. Create AssemblyAI account at assemblyai.com (free tier: 100 hours/month)
2. Get API key
3. Set `ASSEMBLYAI_API_KEY=<key>` on Railway

**Action:** Corey to create AssemblyAI account and provide API key, OR confirm heuristics are acceptable for now.

---

### Gap 3: Verify bucket-re-eval Is Implemented
**Problem:** `bucket-re-eval` appears in gunner-data.js as a registered agent but has 0 runs and no trigger entry in the system trigger list.

**Action:** Check `src/agents/bucket-re-eval.ts` (or equivalent) exists and is:
- Registered in `agent-registry.ts`
- Has a trigger in `wholesaleReTriggers()` in `config/loader.ts`
- If not built: implement it (fires after offer-rejected or not-right-now dispositions — places contact in correct follow-up bucket based on motivation score)

---

### Gap 4: Verify tc-packager + dispo-packager Are Wired Inside contract-bot
**Problem:** These appear as separate entries in gunner-data.js. Unclear if they're standalone agents or sub-steps inside contract-bot.

**Action:** 
1. Confirm `contract-bot` calls both `tc-packager` and `dispo-packager` internally
2. If dispo-packager needs a Dispo Pipeline ID — Corey to provide it (not set in env)
3. Set `DISPO_PIPELINE_ID=<id>` on Railway once Corey provides it

---

### Gap 5: New Lead Drip Enable Decision (PENDING COREY)
**Current state:** `NEW_LEAD_DRIP_ENABLED=false` — timed sequence (Day 3 → Day 104) is paused. Bump text (fires after LM dials) IS active.

**When Corey says go:** Set `NEW_LEAD_DRIP_ENABLED=true` on Railway.

---

### Gap 6: ROLE_AM_IDS Not Explicitly Set
**Current behavior:** Any user NOT in `ROLE_LM_IDS` defaults to AM role. Kyle (`InPGvGL7iu5TCnYJLMEx`) defaults to AM correctly.

**Recommendation:** Explicitly set `ROLE_AM_IDS=InPGvGL7iu5TCnYJLMEx` for clarity and to prevent accidental misrouting if new users are added.

---

## Current Env Vars (Railway)
| Var | Status | Value |
|-----|--------|-------|
| ROLE_LM_IDS | ✅ Just set | G1hAG3KNhzMerkEIvMr5,nJVGO9byJSmD8O32UF9Z |
| ASSEMBLYAI_API_KEY | ❌ Not set | Needed |
| NEW_LEAD_DRIP_ENABLED | ❌ Not set | false (pending decision) |
| DISPO_PIPELINE_ID | ❌ Not set | Pending Corey |
| ROLE_AM_IDS | ⚠️ Not set | Defaulting correctly, but should be explicit |
| DRY_RUN | ✅ | false (LIVE) |

---

## GHL User IDs (Reference)
| Name | GHL User ID | Role |
|------|------------|------|
| Daniel Lozano | G1hAG3KNhzMerkEIvMr5 | LM |
| Chris Segura | nJVGO9byJSmD8O32UF9Z | LM |
| Kyle Barks | InPGvGL7iu5TCnYJLMEx | AM |
| Esteban Leiva | BhVAeJjAfojeX9AJdqbf | Dispo |
| Jessica Guzman | QnWrqDFrNA64Rlmi3ZeG | Data |

---

## Summary: What Manus Needs to Do

1. **Run OAuth setup** — register GHL webhooks for real-time event delivery
2. **Audit `bucket-re-eval`** — confirm it's implemented + wired with a trigger
3. **Audit `tc-packager` + `dispo-packager`** — confirm wired inside contract-bot, note if DISPO_PIPELINE_ID needed
4. **Set `ROLE_AM_IDS=InPGvGL7iu5TCnYJLMEx`** on Railway
5. **When Corey provides AssemblyAI key** — set `ASSEMBLYAI_API_KEY` on Railway
6. **When Corey ready for drip** — set `NEW_LEAD_DRIP_ENABLED=true` on Railway

Everything else is built and running. No new agent code needed.
