# Gunner — AI Grading System Deep Dive

## Overview

Gunner grades sales calls using a multi-step AI pipeline. Every call goes through the same 17-step `processCall()` function. The grading LLM receives a role-specific rubric, the transcript, training materials, custom rules, and recent feedback — then scores each criterion and produces coaching output.

## Grade Thresholds

| Grade | Score Range |
|-------|------------|
| A | 90% – 100% |
| B | 80% – 89% |
| C | 70% – 79% |
| D | 60% – 69% |
| F | Below 60% |

**Critical Failure Cap:** Follow-Up, Seller Callback, and Dispo rubrics have a 50% score cap if any critical failure is detected (e.g., never asked for a decision, didn't know basic deal details).

## The 17-Step processCall() Pipeline

```
processCall(callId)
│
├── Pre-checks:
│   ├── Load call record → 404? bail
│   ├── No recording URL? → archive as admin_call, return
│   ├── Already graded? → skip (idempotent)
│   └── Plan limit check → over limit? → status: limit_reached, return
│
├── Context loading (tenant industry, knowledge context)
│
├── Step 1:  DURATION CHECK
│   ├── <30s → instant skip (no transcription)
│   ├── 30-60s → transcribe → generate summary → skip grading
│   └── 60s+ → proceed
│
├── Step 2:  TRANSCRIBE (Deepgram)
│   ├── status: transcribing
│   └── recovers duration from transcript if GHL didn't provide it
│
├── Step 2.5: RESOLVE CONTACT NAME
│   ├── Try 1: contactCache table (previous lookup)
│   ├── Try 2: GHL Contact API
│   └── Try 3: LLM transcript extraction
│
├── Step 3:  CLASSIFY CALL
│   ├── Uses LLM with structured output
│   ├── Categories: conversation, admin_call, voicemail, no_answer, callback_request, wrong_number, too_short
│   └── Only "conversation" proceeds to grading
│
├── Step 4:  GRADE (only for "conversation")
│   ├── Resolves team member role → selects rubric
│   ├── Loads: training materials, custom rules, recent feedback, tenant rubrics
│   ├── Handles critical failure capping
│   └── Returns GradingResult with scores + coaching
│
├── Step 5:  SAVE GRADE (callGrades table)
│
├── Step 6:  MARK COMPLETE + SAVE OUTCOME
│   └── Updates calls.status = completed, calls.callOutcome
│
├── Step 7:  AWARD XP (processCallViewRewards)
│
├── Step 8:  EVALUATE BADGES (evaluateBadgesForCall)
│   └── Runs in chronological call order to correctly track streaks
│
├── Step 9:  FIRE WEBHOOK (Gunner Engine webhook, fire-and-forget)
│
├── Step 10: AUTO-GENERATE NEXT STEPS (fire-and-forget)
│
├── Step 11: GENERATE CALL HIGHLIGHTS
│   └── Key moments with timestamps, quotes, insights
│
├── Step 12: UPDATE USER PLAYBOOK PERFORMANCE PROFILE
│
├── Step 13: PROACTIVE AI COACHING SUGGESTION (fire-and-forget)
│
├── Step 14: INTELLIGENCE PATTERN DETECTION (fire-and-forget)
│
├── Step 15: UPDATE SKILL SCORES (fire-and-forget)
│   └── Per-criterion rolling averages in userSkillScores
│
├── Step 16: RAG EMBED (fire-and-forget)
│   └── Embed graded call for semantic search
│
└── Step 17: INDEX RECORDING IN LIBRARY (fire-and-forget)
```

## Call Classification Logic

Before grading, every call is classified using AI:

| Classification | Meaning | Grade? |
|---------------|---------|--------|
| `conversation` | Active sales conversation | ✅ Yes |
| `admin_call` | Post-sale logistics (signing docs, scheduling) | ❌ No |
| `voicemail` | Rep left a voicemail | ❌ No |
| `no_answer` | No answer or quick disconnect | ❌ No |
| `callback_request` | Brief "call me back" | ❌ No |
| `wrong_number` | Explicitly stated wrong number | ❌ No |
| `too_short` | <60s with real content | ❌ No |

**Key classification rules:**
- If call mentions signing purchase agreement → `admin_call`
- If offer was already made and they're discussing next steps → `admin_call`
- `wrong_number` ONLY if explicitly stated

## Call Type Detection (detectCallType)

For real conversations, a second LLM call detects the SPECIFIC call type to choose the right rubric:

| Call Type Code | Rubric Used | When |
|---------------|-------------|------|
| `cold_call` | Lead Generator Rubric | Cold outbound to gauge seller interest |
| `qualification` | Lead Manager Rubric | Qualifying a lead, setting appointment |
| `follow_up` | Follow-Up Rubric | Re-engaging a cold lead |
| `offer` | Acquisition Manager Rubric | Presenting an offer to a seller |
| `admin` | Admin Callback Rubric | Operational task calls |
| `seller_callback` | Admin Callback Rubric | Seller called back (legacy alias) |
| `admin_callback` | Admin Callback Rubric | Admin callback (legacy alias) |
| `dispo_buyer_pitch` | Dispo Manager Rubric | Pitching a deal to a buyer |

The role → call type mapping is also resolved dynamically from the tenant's playbook configuration.

## Rubric Summaries

### 1. Lead Manager Rubric (Qualification Calls)
Total max points: 100

| Criterion | Max | Description |
|-----------|-----|-------------|
| Rapport Building | 10 | The Pour — strategic connection, detect PMAS personality |
| Setting Agenda & Permission | 10 | Tell them how call goes, ask permission |
| Pain Probing / Motivation Extraction | 20 | **MOST IMPORTANT** — surface real reason for selling |
| Personality Adaptation | 15 | Use 3+ seller personas per call |
| Objection Handling | 15 | 5 Communication Techniques |
| Price Discussion | 10 | Don't give price first, use anchor |
| Commitment Setting | 15 | Summarize in their words, lock next step |
| Energy & Confidence | 5 | Professional posture, matched pace |

**Red Flags:** Giving price first, rushing motivation, no personality adaptation, no commitment set, script-reading detected.

### 2. Acquisition Manager Rubric (Offer Calls)
Total max points: 100

| Criterion | Max | Description |
|-----------|-----|-------------|
| Rapport Building | 10 | The Pour |
| Setting the Stage | 10 | Set Agenda & Ask Permission |
| Pain Probing / Motivation Restatement | 20 | Revisit motivation using their own words |
| Personality Adaptation | 15 | 3+ seller personas |
| Objection Handling | 15 | 5 Communication Techniques |
| Offer Delivery | 15 | **Offer comes LAST** — after commitments |
| Commitment Setting | 10 | The Boomerang (pull back after yes) |
| Energy & Confidence | 5 | No celebration after signing (Friction Principle) |

**Critical Red Flags:** Rushing to price, not confirming all decision makers, celebrating after signing.

### 3. Lead Generator Rubric (Cold Calls)
Total max points: 100

| Criterion | Max | Description |
|-----------|-----|-------------|
| Introduction & Permission | 15 | 2-line opener: "owner of [ADDRESS]? Interested in selling?" |
| Interest Discovery | 25 | Gauge seller interest quickly |
| Building Rapport | 20 | Strategic connection |
| Objection Handling | 15 | Car Analogy for "what's your offer?", etc. |
| Warm Transfer / Handoff Setup | 15 | Tell seller LM will follow up (LG does NOT set appointments) |
| Energy & Confidence | 10 | Volume mindset |

**Important:** LGs do NOT set appointments — they gauge interest. Penalize for trying to do the LM's job.

### 4. Follow-Up Rubric (Re-engagement Calls)
Total max points: 100 (capped at 50% on critical failure)

| Criterion | Max | Description |
|-----------|-----|-------------|
| Referenced Previous Conversation & Property | 10 | Show they're not just a number |
| Anchored the Previous Offer | 15 | "We put an offer on the table at $X" |
| Re-confirmed Decision Maker | 10 | "Still just you making the call?" |
| Re-qualified Motivation/Timeline | 15 | Quick check for changes |
| Surfaced Roadblocks | 15 | "What's been holding you back?" + PAUSE |
| Pushed for a Decision | 20 | Binary: "Is that a yes or no for you today?" |
| Handled Objection / Set Concrete Next Step | 15 | Specific, not vague |

**Critical Failures (cap at 50%):** Never referenced previous offer, never asked for decision, talked through seller's silence, didn't confirm decision maker.
**Talk ratio target:** Seller ≥50%.

### 5. Seller Callback / Admin Callback Rubrics
- Simple checklists for operational calls
- No critical failures
- Tracked but can be excluded from leaderboard rankings

### 6. Dispo Manager Rubric (Buyer Pitch Calls)
Total max points: 100 (capped at 50% on critical failure)

| Criterion | Max | Description |
|-----------|-----|-------------|
| Deal Presentation | 20 | ARV, repairs, asking price, assignment fee |
| Buyer Fit Assessment | 15 | Buy box, budget, strategy, timeline |
| Urgency Creation | 15 | Other buyers, inspection deadline |
| Objection Handling | 15 | Price too high, repairs, area, timing |
| Negotiation Skill | 15 | Hold firm, strategic concessions |
| Close & Next Steps | 10 | Showing, verbal commit, contract |
| Professional Tone & Efficiency | 10 | Peer-to-peer, not desperate |

**Critical Failures (cap at 50%):** Didn't know basic deal details, agreed below contract price, let buyer hang up without next step.

## Coaching Philosophy Embedded in Grading

All rubrics are built on the **10-Step Close methodology**:
1. The Pour (Rapport)
2. Set Agenda & Ask Permission
3. Pain Probing
4. Equity Trade
5. Review Commitments
6-8. Objection Handling (5 Communication Techniques)
9. The Offer (comes LAST)
10. The Boomerang (after yes, pull back)

**7 Seller Personas (PMAS):** Analyst, Affirmer, Challenger, Worrier, Expert, Comedian, Closer

**5 Communication Techniques:** Cushioning, Reversing, Truth Telling, Stealth Mismatch, Getting Commitments

**Key grading principle:** Early disqualification is REWARDED, not penalized. A clean 3-minute DQ of a dead lead scores B or better.

## Context Size Safeguards

- Transcript capped at 30K chars (~7500 tokens)
- Per-material cap: 2K chars
- Total training context cap: 8K chars
- Total rules context cap: 4K chars
- Total knowledge context cap: 4K chars

## GradingResult Structure

```typescript
interface GradingResult {
  overallScore: number;           // 0-100
  overallGrade: "A"|"B"|"C"|"D"|"F";
  criteriaScores: Array<{
    name: string;
    score: number;
    maxPoints: number;
    feedback: string;
  }>;
  strengths: string[];
  improvements: string[];
  coachingTips: string[];
  redFlags: string[];
  objectionHandling: Array<{
    objection: string;
    context: string;
    suggestedResponses: string[];
  }>;
  summary: string;
  callOutcome: CallOutcome;
  followUpScheduled: boolean;
}
```

## Call Outcomes

`none | appointment_set | offer_made | offer_rejected | callback_scheduled | interested | left_vm | no_answer | not_interested | dead`

Note: `callback_scheduled` should almost NEVER be used when a real sales conversation happened. Default to `interested` when in doubt.

Tenants can define custom outcomes via `tenantOutcomes` table — the grading prompt dynamically resolves outcome keys per tenant.
