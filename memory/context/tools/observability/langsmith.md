# LangSmith

**Category:** Observability
**Status:** 🟡 API Key Exists — NOT Wired
**Last Updated:** 2026-03-14

## Purpose
AI observability platform — tracks every LLM call, debug traces, latency, and performance metrics for Gunner's AI pipeline.

## Current Status
- ✅ Account at smith.langchain.com (xhakalavinder@gmail.com)
- ✅ API key: `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`
- ❌ **NOT wired into Gunner codebase**
- ❌ No traces being captured

---

## Quick Wiring — No LangChain Required

LangSmith works with **any LLM calls** — you don't need LangChain. Two approaches:

### Option A: Auto-trace via env vars (easiest — 2 minutes)
Add to Railway env vars:
```bash
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=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
LANGCHAIN_PROJECT=gunner-production
```

If Gunner already uses LangChain or LangGraph anywhere, **this is all you need** — traces auto-appear.

### Option B: Manual SDK wrapping (for direct OpenAI calls)
```bash
npm install langsmith
```

```typescript
import { wrapOpenAI } from 'langsmith/wrappers';
import OpenAI from 'openai';

// Wrap your existing OpenAI client
const client = wrapOpenAI(new OpenAI({ apiKey: process.env.OPENAI_API_KEY }));

// Now all calls through `client` are automatically traced
const response = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: transcript }],
});
```

### Option C: Manual trace wrapping (maximum control)
```typescript
import { traceable } from 'langsmith/traceable';
import { Client } from 'langsmith';

const client = new Client({ apiKey: process.env.LANGCHAIN_API_KEY });

// Wrap your grading function
export const gradeCall = traceable(
  async (transcript: string, repName: string) => {
    // your existing grading logic
    const result = await openai.chat.completions.create({ ... });
    return result;
  },
  { name: 'grade_call', project_name: 'gunner-production', client }
);
```

---

## What Traces Matter Most for Gunner's AI Pipeline

Priority order — trace these first:

### 1. Call Grading Chain (Most Critical)
```
Trace: "call_grading"
Inputs: callId, transcript, repName, callDuration
Outputs: grade (0-100), feedback, keyMoments[]
Metadata: model, tokenCount, latencyMs, cost
```
This tells you: How much does each call grade cost? How long does it take? Which calls get low confidence grades?

### 2. Whisper Transcription
```
Trace: "whisper_transcription"  
Inputs: callId, audioDurationSeconds, fileSize
Outputs: transcript, wordCount
Metadata: latencyMs, cost
```
Track transcription quality issues — if transcripts seem off, you'll see patterns.

### 3. Coaching Feedback Generation
```
Trace: "coaching_feedback_generation"
Inputs: grade, keyMoments[], repHistory
Outputs: feedbackText, actionItems[]
Metadata: model, tokenCount
```

### 4. Full Pipeline Run
Wrap the entire call processing flow as a parent trace with sub-traces for each step. In LangSmith you'll see the waterfall — which step is the bottleneck.

---

## What LangSmith Shows You

- **Latency breakdown:** Is transcription or grading slower?
- **Token usage per call:** Is cost per call growing?
- **Error rates:** Which calls fail and why?
- **Output quality:** Flag calls where grade confidence is low
- **Regression detection:** Compare before/after prompt changes

---

## Key Metrics Dashboard to Build

After wiring, create these charts in LangSmith:

1. **P95 latency per pipeline stage** — alert if grading > 30s
2. **Cost per call** — should be < $0.10 all-in
3. **Daily call volume** — is Gunner processing expected volume?
4. **Error rate by stage** — which step fails most?
5. **Grade distribution** — histogram of call grades (60s? 80s?) — sanity check your grading prompt

---

## Pricing

| Plan | Price | Traces/Month | Notes |
|------|-------|-------------|-------|
| Developer | $0 | 5k traces | Fine for NAH team testing |
| Plus | $39/mo | 100k traces | When Gunner has multiple customers |
| Enterprise | Custom | Unlimited | |

At ~100 calls/day, NAH generates ~100 traces/day = ~3,000/month. **Free plan is sufficient.**

---

## Gotchas

1. **LangSmith ≠ LangChain:** You do NOT need to use LangChain. LangSmith is standalone observability — use it with raw OpenAI calls.

2. **API key rotation:** The `lsv2_` prefix indicates a new-style key (v2). These are project-scoped. If you create a new LangSmith project for Gunner, generate a new key scoped to that project.

3. **Trace retention:** Free plan retains traces for 14 days. Upgrade to Plus for 60-day retention.

4. **PII in traces:** By default, LangSmith stores the full input/output of every LLM call — including call transcripts. These may contain PII (lead names, addresses). Configure `hide_inputs` / `hide_outputs` for sensitive fields in production.

---

## Smart Use Tips

1. **Prompt versioning:** LangSmith has a Prompt Hub where you can version-control Gunner's grading prompts. When you change the prompt, you can A/B compare outputs on the same calls — no guesswork on whether new prompt is better.

2. **Evaluation datasets:** Build a "golden set" of ~20 calls with manually graded correct answers. Run Gunner's AI against this set before and after prompt changes. LangSmith makes this easy.
