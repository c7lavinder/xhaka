---
title: AI Automation Workflow Patterns for Wholesale Real Estate
category: workflows
tags: [automation, n8n, webhooks, CRM, AI, GHL, lead-routing, queue, dispatcher]
last_updated: 2026-03-16
source: research synthesis
---

# AI Automation Workflow Patterns for Wholesale Real Estate

This document captures the core automation patterns most relevant to NAH's operations — covering how to route leads, trigger follow-ups, handle human approval gates, and translate SOPs into working automations. Specific to GHL + n8n stack.

---

## 1. The Dispatcher Pattern (Queue-Based Task Routing)

### What It Is
A central "dispatcher" workflow receives all incoming events and routes them to specialist sub-workflows based on rules. Think of it as a traffic controller — it never does the work itself, it only decides who does.

### Why It Matters for NAH
Without a dispatcher, every automation becomes its own silo. When GHL fires a webhook, you end up with 10 different workflows all trying to handle the same event. A dispatcher creates one entry point, clean routing logic, and a single place to add rules.

### Pattern Structure

```
[Event Source: GHL Webhook / BatchDialer / BatchLeads / CallRail]
            ↓
    [Dispatcher Node]
     ├── Lead type = PPL → [PPL Intake Workflow]
     ├── Lead type = Cold Call → [Cold Call Workflow]  
     ├── Lead type = Voicemail → [Voicemail Bot Workflow]
     ├── Stage changed → Offer Appointment → [AM Alert Workflow]
     └── Stage changed → Follow Up → [Drip Sequence Selector]
```

### Implementation Rules
- **One entry point per source.** GHL gets one webhook URL. BatchDialer gets one. No one-off webhooks per use case.
- **Route by event type first, then lead attributes.** Avoid deeply nested if/else — use lookup tables or switch nodes.
- **Dead-letter queue:** Any event that doesn't match a route gets logged to a "Unhandled Events" table for review. Never silently drop.
- **Idempotency key:** Every workflow execution should check "did I already process this event?" using a hash of the event ID. GHL webhooks fire duplicates.

### n8n Implementation
Use the **Switch** node as the dispatcher hub. Each output connects to a sub-workflow via the **Execute Workflow** node. Keep the dispatcher workflow < 5 nodes — if it's getting fat, you're mixing routing logic with execution logic.

---

## 2. Human-in-the-Loop (HITL) Approval Gates

### What It Is
Automation that pauses and waits for a human decision before proceeding. Not every automation should run end-to-end without oversight — some actions are irreversible (sending a contract, deleting a lead, making an offer via AI).

### Where HITL Is Required at NAH

| Automation | Auto or HITL? | Why |
|---|---|---|
| Move lead to "Dead" | **HITL (Corey/Kyle)** | Low motivation ≠ dead. Irreversible data loss. |
| Send contract via PandaDoc | **HITL (Kyle)** | Legal document — must be human-verified |
| Assign JV deal to partner | **HITL (Esteban)** | Splits fees — financial consequence |
| Respond to seller re-engage | **HITL (Daniel/Chris)** | Context-sensitive — AI misread possible |
| PPL dispute submission | **HITL (Corey)** | Financial — only disputes, never bid changes |
| Follow-up drip start/stop | **Auto** | Rules-based, low-risk, reversible |
| Lead score update | **Auto** | Informational only |
| KPI aggregation | **Auto** | Read-only, no side effects |

### HITL Pattern

```
[Automation reaches decision point]
        ↓
[Create approval record in DB / Telegram message with Y/N buttons]
        ↓
[Wait node — poll or webhook until response received]
        ↓
   [Approved?]
   ├── Yes → Continue workflow
   └── No → Log rejection reason → End / alternate path
```

### Telegram HITL via Xhaka
Xhaka (Telegram bot) is the natural HITL interface for Corey. Pattern:
1. n8n pauses at a decision point
2. Sends Telegram message: *"Lead John Smith wants $150K on a property ARV $200K. Approve offer at $110K? [Yes] [No] [Counteroffer]"*
3. Waits on a webhook from Telegram
4. Resumes workflow with decision data

**Timeout rule:** All HITL gates must have a timeout (24h default). On timeout → escalate to Corey via separate alert, log as "pending review," do NOT auto-approve.

---

## 3. Webhook-Triggered Workflows

### The GHL Webhook Architecture

GHL fires webhooks on nearly every event. The key ones for NAH:

| GHL Event | Trigger | Workflow to Call |
|---|---|---|
| `contact.created` | New lead enters GHL | Lead Intake + Lead Score |
| `opportunity.stageChange` | Pipeline stage updates | Stage-specific automation (drip start/stop, alerts) |
| `call.completed` | Call logged | Pull to Gunner for scoring |
| `form.submitted` | PPL/web form | PPL Intake Workflow |
| `appointment.booked` | Appointment set | AM Alert + Calendar block |
| `appointment.cancelled` | Apt cancelled | Reschedule drip sequence |

### Webhook Reliability Rules
1. **Acknowledge immediately.** Return HTTP 200 within 2 seconds. All heavy processing goes async. If GHL doesn't get a 200, it retries — causing duplicate processing.
2. **Verify HMAC signature** if GHL provides one. Prevents spoofed webhook attacks.
3. **Store raw payload first.** Log the raw JSON before processing. If your automation fails, you can replay from logs.
4. **Retry queue:** Failed webhook processing should go to a retry queue (max 3 attempts, exponential backoff: 1m, 5m, 30m).

### n8n Webhook Node Best Practice
```
[Webhook Trigger] → [Respond to Webhook: 200 OK] → [Continue processing...]
```
Note the "Respond to Webhook" node fires *immediately* before the rest of the workflow runs. This is the correct pattern — never put processing before the response.

### CallRail Webhook (Voicemail Bot)
```
[CallRail voicemail.completed] 
  → [Fetch recording URL]
  → [Whisper transcription]
  → [GPT: Extract seller intent + phone number]
  → [GHL: Create/update contact]
  → [Dispatcher: Route based on intent]
```

---

## 4. CRM Automation Patterns

### Lead Routing Logic

The lead routing decision tree for NAH:

```
New Lead Arrives
    ↓
PPL or Inbound? 
  Yes → Skip shell name, include company name in first message
  No  → Use shell name (Purple Doors / Volunteer Solutions / EasySaleTN)
    ↓
Time check: Is it 9am–6pm in lead's timezone?
  No  → Queue for send at 9am
  Yes → Send immediately
    ↓
Assign to LM (default: Daniel unless load-balancing active)
    ↓
Start appropriate drip sequence based on source
```

### Follow-Up Sequence Architecture

**The 3-bucket drip model:**

| Bucket | Condition | Sequence |
|---|---|---|
| **1 Month** | Selling in ~30 days, blocked by something | Aggressive: 2x/week touches, alternate SMS+call |
| **4 Month** | Selling in ~6 months | Moderate: weekly check-in, value-add content |
| **12 Month** | Default "not right now" | Light: monthly touch, market updates |

**Sequence stop rules (CRITICAL):**
- Any real 2-way conversation → **immediately kill drip for this contact**
- GHL flag: `real_conversation = true` → stops all sequences
- Failure to stop = harassment risk + Twilio suspension

### Lead Score Automation

Trigger re-score on these events:
- Stage change
- New call logged
- Reply to SMS
- Appointment set or cancelled
- Time since last contact > 30 days (decay score)

Score factors (weighted):
- Motivation signals in conversation (high weight)
- Timeline to sell (high weight)
- Property condition (medium)
- Response speed (medium)
- Equity position (medium)
- Number of contacts (low — can be negative signal if too many)

### GHL Opportunity Management Rules
- **Never move to Dead based on no-response alone.** After 12 months of zero response → move to 12-month bucket, do NOT kill.
- **UC check before Dead:** Always ask "are you already under contract?" before marking sold.
- **Wrong number handling:** Use OpportunityBot to delete the GHL opportunity (not move to Dead).

---

## 5. SOP-to-Automation Translation Framework

### The Translation Process

Converting a human SOP into an automation requires answering these questions in order:

1. **What triggers this process?** (Time-based? Event-based? Manual trigger?)
2. **What decisions are made?** (Rule-based or judgment-based?)
3. **What actions are taken?** (Can a system do this exactly, or does it need context?)
4. **What can go wrong?** (Error states, edge cases, human exceptions)
5. **What does "done" look like?** (Measurable output state)

### The Automation Readiness Score

Rate each SOP step 1–5 on these dimensions:

| Dimension | 1 (Hard to automate) | 5 (Easy to automate) |
|---|---|---|
| **Trigger clarity** | "When it feels right" | Specific event/time |
| **Decision type** | Judgment call | Rule with data |
| **Data availability** | Manual lookup | Already in system |
| **Action reversibility** | Irreversible (contract) | Reversible (tag) |
| **Error tolerance** | Zero tolerance | Errors correctable |

Steps scoring 4+ on all dimensions = automate first.

### Automation Maturity Levels

**Level 1 — Notification:** System observes and pings human. Human does the work.
> *Example: Gunner flags a low-scoring call → Telegram alert to Corey → Corey reviews*

**Level 2 — Recommendation:** System observes, generates recommendation, human approves.
> *Example: Lead score drops → AI suggests "move to 12-month bucket" → LM reviews in 2 clicks*

**Level 3 — Automated with logging:** System acts automatically, logs everything, human can audit.
> *Example: Drip sequence starts automatically when lead enters a stage → LM can pause manually*

**Level 4 — Fully autonomous:** System acts, handles errors, escalates only exceptions.
> *Example: KPI aggregation from BatchDialer API → Dashboard update → No human needed*

**Rule:** Only reach Level 4 for low-risk, high-frequency, easily-reversible processes. Keep humans in the loop for anything with legal, financial, or relationship consequences.

---

## 6. NAH-Specific Automation Stack

### Current Stack
- **GHL:** CRM backbone — all leads, all conversations, all pipelines
- **BatchDialer:** Call metrics, dial sessions
- **BatchLeads:** SMS campaigns, lead data
- **CallRail:** Voicemails, inbound call tracking
- **Gunner:** AI call coaching and scoring
- **n8n (recommended):** Workflow automation layer connecting everything
- **Telegram:** Human-in-the-loop interface for Corey

### Priority Automations to Build (by ROI)

| Priority | Automation | Current State | Effort |
|---|---|---|---|
| 1 | Voicemail → GHL contact creation | Manual | Low |
| 2 | Call logged → Gunner score → LM alert | Manual | Medium |
| 3 | Stage change → correct drip sequence | Partial | Low |
| 4 | KPI pull → dashboard update | Manual (Jessica) | Medium |
| 5 | PPL lead intake → GHL + score | Manual | Low |
| 6 | Appointment set → AM calendar + alert | Partial | Low |
| 7 | Lead decay detection (30 days no contact) | None | Medium |
| 8 | AI Acquisition Machine (PropStream → GHL) | Planned | High |

---

## 7. Error Handling Standards

Every automation must handle these failure modes:

```
[Normal path]
   ↓
[Try block]
   ├── Success → log + continue
   └── Error → 
       ├── Retryable? (network, timeout) → retry queue (max 3)
       └── Not retryable? → dead letter queue → Telegram alert to Corey
```

**What goes in every error log:**
- Timestamp
- Workflow name + node name
- Input data (sanitized — no PII in logs if possible)
- Error message
- Retry count

**No silent failures.** Every automation that fails without an alert is technical debt that becomes a mystery "why didn't that work?" six months later.

---

## Quick Reference: Automation Decision Tree

```
Is this triggered by a specific, observable event?
  No  → Not automatable yet. Document it as a manual SOP first.
  Yes → Continue.

Is the decision rule-based (data-driven)?
  No  → HITL Level 2 (recommendation only)
  Yes → Continue.

Is the action reversible or low-risk?
  No  → HITL Level 1 or 2 (human approval required)
  Yes → Automate with logging (Level 3+)

Is the error consequence low?
  No  → Keep human-supervised
  Yes → Full automation (Level 4)
```
