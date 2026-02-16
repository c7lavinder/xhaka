# AI Coach — GHL Action Commands (V2 Feature Spec)

**Date:** February 12, 2026
**For:** Manus
**Feature:** Enable AI Coach to execute commands in GHL via natural language

---

## Overview

Expand the AI Coach from coaching-only to coaching + action execution. Users type natural language commands in the AI Coach chat, the AI parses intent, shows a confirmation, and executes via GHL API. All actions route through the correct rep and contact based on the call context.

Designed for multi-tenant — each customer connects their own GHL account. The action layer is universal.

---

## How It Works

### Flow
```
User types command in AI Coach
        ↓
AI detects intent (coaching question vs action request)
        ↓
If action → AI parses: what action, who, what content, when
        ↓
AI shows confirmation card with details
        ↓
User clicks [Confirm] or [Cancel]
        ↓
On confirm → Gunner executes via GHL API
        ↓
Success/failure message shown in chat
```

### Intent Detection
The AI must distinguish between:
- **Coaching:** "How do I handle price objections?" → answer the question
- **Action:** "Add a note to John Smith about the title issue" → execute in GHL
- **Hybrid:** "What should I follow up about?" → coaching answer, then offer "Want me to create a task for that?"

---

## Supported Actions

### 1. Add Note to Contact
**Example commands:**
- "Add a note to John Smith: seller is motivated, wife wants to sell"
- "Summarize that last call and put it in their notes"
- "Note on this contact: needs proof of funds before next call"

**What it does:**
- Creates a note on the contact record in GHL
- Auto-includes: date, rep name, source (Gunner AI Coach)
- If triggered from a call context, can auto-generate summary from transcript

**Confirmation card:**
```
📝 Add Note to John Smith
"Seller is motivated, wife wants to sell. Follow up on 
rental management frustration."
Source: Gunner AI Coach | Added by: Kyle Barks

[Confirm]  [Edit]  [Cancel]
```

---

### 2. Add Note to Opportunity
**Example commands:**
- "Add a note to the deal at 123 Main St: appraisal came back at $180K"
- "Note on this opportunity: seller countered at $95K"

**What it does:**
- Creates a note on the opportunity record in GHL
- Links to the specific deal/opportunity, not just the contact

**Confirmation card:**
```
📝 Add Note to Opportunity
Deal: 123 Main St (John Smith)
"Seller countered at $95K. Original offer was $85K."

[Confirm]  [Edit]  [Cancel]
```

---

### 3. Change Pipeline Stage
**Example commands:**
- "Move John Smith to Hot"
- "Move 123 Main St to Under Contract"
- "This lead is warm, update the pipeline"

**What it does:**
- Moves the contact's opportunity to the specified pipeline stage
- Auto-maps common language to actual stage names (e.g., "hot" → "Hot", "UC" → "Under Contract")

**Confirmation card:**
```
🔄 Move Pipeline Stage
Contact: John Smith (123 Main St)
From: Warm → To: Hot
Pipeline: Sales Process

[Confirm]  [Cancel]
```

---

### 4. Send a Message (SMS)
**Example commands:**
- "Text John Smith: Hey John, just following up on our conversation. Are you free Thursday for a walkthrough?"
- "Send a message to this seller: We can close in 2 weeks if that timeline works"
- "Follow up with Mary Johnson about the inspection"

**What it does:**
- Sends SMS through GHL via the correct rep's conversation thread
- Seller sees it from the same number they've been texting with
- Routes through the assigned rep — not a random Gunner number

**Confirmation card:**
```
💬 Send SMS
From: Kyle Barks → To: John Smith (615-555-1234)
"Hey John, just following up on our conversation. 
Are you free Thursday for a walkthrough?"

⚠️ This will send a real text message.

[Confirm]  [Edit]  [Cancel]
```

**Safety:** SMS confirmation card includes explicit warning. No accidental sends.

---

### 5. Create Task
**Example commands:**
- "Create a task to follow up with John Smith in 10 days"
- "Remind Daniel to call back Mary Johnson on Friday"
- "Task: send contract to seller by end of week, assign to Kyle"

**What it does:**
- Creates a task in GHL assigned to the specified rep
- Parses due date from natural language ("in 10 days", "Friday", "end of week", "February 20th")
- Links to the contact record

**Confirmation card:**
```
✅ Create Task
"Follow up with John Smith about offer"
Assigned to: Daniel Lozano
Due: February 22, 2026
Contact: John Smith (123 Main St)

[Confirm]  [Edit]  [Cancel]
```

---

### 6. Add/Remove Tag
**Example commands:**
- "Tag John Smith as priority"
- "Add the DNC tag to this contact"
- "Remove the hot-lead tag from Mary Johnson"

**What it does:**
- Adds or removes tags on the contact record in GHL

**Confirmation card:**
```
🏷️ Add Tag
Contact: John Smith
Tag: priority

[Confirm]  [Cancel]
```

---

### 7. Update Contact Field
**Example commands:**
- "Update John Smith's asking price to $120K"
- "Set the property condition to fair"
- "Change the lead source to PropertyLeads"

**What it does:**
- Updates a specific field on the contact or opportunity record
- Maps natural language field names to actual GHL custom fields

**Confirmation card:**
```
✏️ Update Field
Contact: John Smith
Field: Asking Price → $120,000

[Confirm]  [Cancel]
```

---

## Context Awareness

The AI Coach knows the context of where the user is in Gunner:

| Context | What AI Knows |
|---------|---------------|
| **Viewing a call** | Contact name, property address, rep, transcript, grade, summary |
| **Viewing a lead** | Contact info, pipeline stage, call history, tags |
| **Dashboard** | Must ask "which contact?" if ambiguous |

**Examples of context-aware commands:**
- While viewing a call: "Put a note on this contact" → AI knows who "this" is
- While viewing a call: "Summarize this and send it to GHL" → AI uses the transcript
- From dashboard: "Text John Smith about the offer" → AI looks up John Smith

If ambiguous (e.g., multiple John Smiths), AI asks for clarification before showing confirmation.

---

## Smart Suggestions

After grading a call, AI Coach can proactively suggest actions:

```
📊 Call graded: 72% (Follow-Up)

Based on this call, I'd suggest:
• 📝 Add note: "Seller reconsidering, wants updated offer by Friday"
• ✅ Create task: "Send updated offer to John Smith" — due Feb 14
• 🔄 Move to: Hot

Want me to do any of these?
```

User clicks one → confirmation card → execute. This bridges V1 coaching into V2 actions naturally.

---

## Routing Logic

### Who Sends
- Actions are executed as the **assigned rep** for that contact/lead
- SMS sends from the rep's GHL conversation thread
- Notes and tasks are attributed to the rep
- If an admin/manager triggers the action, it still routes through the assigned rep (unless they specify otherwise)

### Who Receives
- Determined by the contact record in GHL
- AI matches by name + property address
- If contact doesn't exist in GHL, AI flags it: "I can't find this contact in GHL. Want me to search by phone number or address?"

### Conflict Handling
- Multiple contacts with same name → AI asks to clarify (shows address/phone to disambiguate)
- Contact has no assigned rep → AI asks who to assign
- Contact not in GHL → AI offers to create (if permissions allow)

---

## Permissions

| Role | Allowed Actions |
|------|----------------|
| **Lead Generator** | Add notes, create tasks (own contacts only) |
| **Lead Manager** | Add notes, create tasks, send SMS, add tags (own contacts only) |
| **Acquisition Manager** | All actions, any contact |
| **Admin** | All actions, any contact, can configure |

**Key rule:** Reps can only take actions on their own contacts. Managers/admins can act on any contact.

---

## GHL Integration Requirements

### API Endpoints Needed
| Action | GHL API |
|--------|---------|
| Add note (contact) | POST /contacts/{id}/notes |
| Add note (opportunity) | POST /opportunities/{id}/notes |
| Change pipeline stage | PUT /opportunities/{id}/status |
| Send SMS | POST /conversations/messages |
| Create task | POST /contacts/{id}/tasks |
| Add/remove tag | POST /contacts/{id}/tags |
| Update field | PUT /contacts/{id} |
| Search contact | GET /contacts/search |

### Authentication
- OAuth2 per tenant (preferred) or API key
- Stored securely per tenant — never exposed to AI model
- Token refresh handled automatically

### Onboarding
1. Customer connects GHL account (OAuth flow)
2. Gunner auto-discovers: pipelines, stages, custom fields, team members
3. AI Coach immediately understands the customer's GHL setup
4. No manual field mapping required

---

## Audit Log

Every action executed through AI Coach is logged:

```json
{
  "actionId": "uuid",
  "type": "note | stage_change | sms | task | tag | field_update",
  "requestedBy": "userId",
  "requestText": "Add a note to John Smith about the title issue",
  "targetContact": "contactId",
  "targetOpportunity": "opportunityId (nullable)",
  "payload": { ... },
  "confirmedAt": "timestamp",
  "executedAt": "timestamp",
  "status": "success | failed",
  "error": "string (nullable)"
}
```

Accessible by admins. Full history of every AI-executed action in GHL.

---

## Error Handling

| Error | User Sees |
|-------|-----------|
| Contact not found in GHL | "I can't find [name] in GHL. Try a phone number or address?" |
| GHL API down | "GHL isn't responding right now. I've saved this action — want me to retry in a few minutes?" |
| Permission denied | "You don't have permission to [action] on [contact]. Ask your admin." |
| Rate limited | "GHL is rate limiting requests. I'll queue this and execute in a moment." |
| Field doesn't exist | "I can't find a field called [X] in your GHL setup. Did you mean [suggestion]?" |

Failed actions are saved and can be retried. Nothing is silently lost.

---

## Multi-Tenant Design

| Component | Per Tenant |
|-----------|-----------|
| GHL credentials | Unique OAuth/API key |
| Pipeline/stage names | Auto-discovered |
| Custom fields | Auto-discovered |
| Team members | Auto-discovered |
| Permissions | Configured by admin |
| Audit log | Isolated per tenant |

**Zero custom code per customer.** Connect GHL, auto-discover everything, start working.

---

## Implementation Priority

1. **GHL OAuth connection flow** — onboarding foundation
2. **Auto-discovery** — pipelines, stages, fields, team
3. **Intent detection** — coaching vs action in AI Coach
4. **Confirmation UI** — card with confirm/edit/cancel
5. **Core actions** — notes, tasks, pipeline stage (lowest risk first)
6. **SMS sending** — last (highest risk, needs extra safety)
7. **Smart suggestions** — proactive action prompts after call grading

---

*V2 feature spec. Builds on V1 AI Coach (coaching only) by adding action execution. Users already trust the AI's judgment from V1 coaching — V2 lets it act on that judgment.*
