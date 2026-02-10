# Callback Capture Bot — Spec

**Agent #17** (Replaces Voicemail Bot)  
**Priority:** HIGH — Eliminates manual listening to hundreds of calls/week

---

## Overview

Processes ALL inbound calls from cold outreach callbacks. Sellers call back the BatchDialer/BatchLeads numbers, CallRail captures the recording, this bot listens and creates GHL opportunities for real leads.

---

## Flow

```
Cold call/text goes out (BatchDialer/BatchLeads)
    ↓
Seller calls back
    ↓
CallRail captures call (webhook fires on completion)
    ↓
Bot receives recording + metadata
    ↓
AI transcribes and classifies:
    - Is this a lead? (someone wanting to sell)
    - Extract: name, phone, address (if given), intent
    ↓
If lead → Create GHL Opportunity
If not lead → No action (ignore completely)
```

---

## Trigger

**CallRail Webhook** — fires on call completion

Payload includes:
- Recording URL
- Caller phone number
- Called number (determines source)
- Call duration
- Tracking number name

---

## Source Mapping

Map the CallRail tracking number to GHL source field:

| CallRail Number Name | GHL Source |
|---------------------|------------|
| Cold Texting | Texts |
| BatchDialer | Dialer |

---

## Lead Classification

**Is a Lead:**
- Mentions wanting to sell property
- Asks about buying their house
- Responds to cold outreach positively
- Even vague: "I got something I want to sell"

**Not a Lead:**
- Wrong number
- Spam/robocall
- Hang up (no conversation)
- Angry/do not call requests
- Already spoke with team (check for existing contact)

---

## Data Extraction

Extract whatever is available from the call:

| Field | Required | Notes |
|-------|----------|-------|
| Phone | Yes | From caller ID |
| Name | If given | May be partial (first name only) |
| Address | If given | Often NOT provided — that's okay |
| Intent | Yes | AI summary of what they want |
| Call Recording | Yes | Link to CallRail recording |

---

## GHL Opportunity Creation

**Pipeline:** Sales Process  
**Stage:** New Lead  
**Source:** Based on CallRail number (see mapping above)

**Fields to populate:**
- Contact: First Name, Last Name (if available)
- Contact: Phone (from caller ID)
- Contact: Address (if provided)
- Opportunity: Name = "{First Name} - Callback" or "Unknown - Callback"
- Opportunity: Source = "Texts" or "Dialer"
- Custom Field: Call Recording URL
- Custom Field: AI Intent Summary
- Custom Field: Call Date/Time

**No task creation** — GHL automations trigger off new opportunity in "New Lead" stage

---

## Duplicate Handling

Before creating opportunity:
1. Search GHL for existing contact by phone number
2. If exists AND has active opportunity → Skip (already in pipeline)
3. If exists but NO active opportunity → Create new opportunity on existing contact
4. If not exists → Create new contact + opportunity

---

## Edge Cases

| Scenario | Action |
|----------|--------|
| No address given | Create anyway with phone + name |
| No name given | Use "Unknown Seller" |
| Existing contact, no opportunity | Add opportunity to existing contact |
| Existing contact with opportunity | Skip — already being worked |
| Very short call (<5 sec) | Likely hang-up, skip |
| Voicemail (not answered) | Process same as answered call |

---

## Non-Lead Handling

**No action whatsoever.**

- No logging
- No review queue
- No notifications
- Just ignore

This keeps the system clean and focused on leads only.

---

## Integration Requirements

### CallRail
- API Key: `267bcdd64628abc9c9c4c43e8a46dca2`
- Webhook endpoint needed in Gunner
- Need access to recording URL

### GHL
- Location ID: `hmD7eWGQJE7EVFpJxj4q` (NAH)
- Pipeline: Sales Process
- Stage: New Lead
- Source values: "Texts", "Dialer"

---

## Multi-Tenant Configuration

Each tenant configures:
- CallRail API key
- CallRail number → source mapping
- GHL location/pipeline/stage
- Custom field mappings

---

## Metrics to Track

- Callbacks processed / day
- Leads created / day
- Lead creation rate (% of callbacks that are leads)
- Processing time (webhook → opportunity created)

---

## Dependency

**Blocked until:** Corey routes BatchDialer voicemails to CallRail

Xhaka will follow up Feb 10 to confirm routing is complete.

---

## Success Criteria

- [ ] Webhook receives CallRail call completions
- [ ] AI accurately classifies leads vs non-leads (>90%)
- [ ] Opportunities created with correct source mapping
- [ ] Existing contacts detected (no duplicates)
- [ ] Processing time <30 seconds per call
- [ ] Zero manual listening required
