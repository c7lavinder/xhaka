# Gunner V2 — Message Review Queue
**Date:** Feb 26, 2026  
**Priority:** CRITICAL — system is in DRY_RUN=true until this ships  
**Goal:** All outbound SMS except initial outreach requires human review before sending

---

## The Rule

```
Initial Outreach (new lead first text)  →  sends automatically ✅
ALL other SMS                           →  goes to review queue, Kyle approves
```

---

## How It Works (user flow)

1. Agent generates a message (e.g. UC Monitor drafts a reply to a seller)
2. Instead of sending → message saved to `message_queue` table as `pending`
3. GHL task created for Kyle: *"Review pending message for [Seller Name] — approve in Gunner"*
4. Kyle opens `/am` view in Gunner → sees "Pending Messages" section
5. Kyle reads the draft, edits if needed, hits **Send** or **Dismiss**
6. On Send → outbound-manager sends it immediately via GHL
7. On Dismiss → message marked dismissed, contact note logged

---

## Database

```sql
CREATE TABLE message_queue (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       TEXT NOT NULL,
  contact_id      TEXT NOT NULL,
  contact_name    TEXT,
  agent_id        TEXT NOT NULL,         -- which agent generated it
  message         TEXT NOT NULL,         -- the draft text
  channel         TEXT NOT NULL DEFAULT 'sms',
  from_user_id    TEXT,                  -- GHL user ID to send from
  from_name       TEXT,                  -- display name
  status          TEXT NOT NULL DEFAULT 'pending',  -- pending | approved | dismissed | sent | failed
  reviewed_by     TEXT,                  -- GHL user ID who reviewed
  reviewed_at     TIMESTAMPTZ,
  final_message   TEXT,                  -- edited version (if changed)
  sent_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  context         JSONB                  -- any extra context (stage, reason, etc.)
);

CREATE INDEX idx_message_queue_tenant_status ON message_queue(tenant_id, status);
CREATE INDEX idx_message_queue_contact ON message_queue(contact_id);
```

---

## outbound-manager.ts Changes

Add a `requiresReview` flag to `OutboundRequest`:

```ts
export interface OutboundRequest {
  // ... existing fields ...
  requiresReview?: boolean;  // if true, queue instead of send
}
```

In `sendOutbound()`, before the send window check:

```ts
// Route to review queue if required
if (request.requiresReview && !isDryRun()) {
  await queueForReview(request);
  return { sent: false, queued: false, skipped: false, pendingReview: true };
}
```

```ts
async function queueForReview(request: OutboundRequest): Promise<void> {
  const db = getDb();
  const crm = getCRM();
  
  // Save to message_queue
  const [row] = await db.insert(messageQueue).values({
    tenantId: request.tenantId,
    contactId: request.contactId,
    contactName: await crm.getContactName(request.contactId),
    agentId: request.agentId,
    message: request.message,
    channel: request.channel ?? 'sms',
    fromUserId: request.fromUserId,
    fromName: request.senderName,
    context: request.context ?? {},
  }).returning();

  // Create GHL task for AM to review
  const amId = getConfig().roleAmIds[0];  // primary AM
  await crm.createTask({
    contactId: request.contactId,
    title: `Review message for ${row.contactName ?? request.contactId}`,
    body: `Gunner drafted a message that needs your review before sending.\n\nPreview: "${request.message.slice(0, 100)}..."\n\nApprove or edit at: ${process.env['GUNNER_URL'] ?? ''}/am`,
    assignedTo: amId,
    dueDate: new Date(Date.now() + 30 * 60 * 1000), // 30 min
  });

  // Log to audit
  getAuditLog().log({
    tenantId: request.tenantId,
    contactId: request.contactId,
    agent: `outbound:${request.agentId}`,
    action: 'outbound:queued-for-review',
    result: 'success',
    metadata: { messageQueueId: row.id, preview: request.message.slice(0, 100) },
  });
}
```

---

## Which Agents Get `requiresReview: true`

| Agent | requiresReview | Reason |
|---|---|---|
| initial-outreach-agent | ❌ false | Auto-send — first contact, low risk |
| uc-monitor | ✅ true | Directly impacts active sellers |
| lm-assistant | ✅ true | Post-call SMS to leads |
| am-assistant | ✅ true | Post-walkthrough SMS to leads |
| working-drip-agent | ✅ true | All drip texts |
| offer-chase | ✅ true | Offer follow-ups |
| follow-up-organizer | ✅ true | Re-engagement texts |
| response-agent | ✅ true | Auto-replies to inbound |
| apt-prep-agent | ✅ true | Appointment confirmations to sellers |
| callback-capture | ✅ true | Callback notifications |
| post-close | ✅ true | Post-close touches |

Each agent passes `requiresReview: true` in its `sendOutbound()` call.
`initial-outreach` passes `requiresReview: false` (or omits it — false is default).

---

## API Endpoints

```
GET  /api/review/pending              → list all pending messages for tenant
POST /api/review/:id/approve          → mark approved, send immediately
POST /api/review/:id/edit-and-approve → save edited message + send
POST /api/review/:id/dismiss          → mark dismissed, log note to contact
```

### GET /api/review/pending
```json
{
  "pending": [
    {
      "id": "uuid",
      "contactId": "abc123",
      "contactName": "Amanda Arroyo",
      "agentId": "uc-monitor",
      "agentLabel": "UC Monitor",
      "message": "Amanda, glad to hear it! We're moving forward...",
      "fromName": "Kyle",
      "createdAt": "2026-02-26T15:01:00Z",
      "context": { "stage": "underContract", "reason": "seller replied" }
    }
  ],
  "count": 1
}
```

### POST /api/review/:id/approve
- Pulls message from DB
- Calls `sendOutbound()` with `requiresReview: false` (bypass queue this time)
- Updates `status = 'sent'`, `reviewed_by`, `reviewed_at`

### POST /api/review/:id/edit-and-approve
```json
{ "message": "edited message text" }
```
- Saves `final_message`, sends that instead of original
- Same flow as approve

### POST /api/review/:id/dismiss
- Updates `status = 'dismissed'`
- Logs note to GHL contact: "Draft message dismissed by [reviewer]"

---

## /am View Changes

Add a **"📬 Pending Messages"** section at the top of the AM view.

### If no pending messages:
```
✅ No messages pending review
```

### If pending messages exist:
Show a badge count on the tab: **📬 Pending Messages (3)**

Each card shows:
```
┌─────────────────────────────────────────────────────┐
│ 👤 Amanda Arroyo  •  UC Monitor  •  2 min ago       │
│                                                     │
│ "Amanda, glad to hear it! We're moving forward      │
│  smoothly on 5979 Hwy 100. Kyle"                    │
│                                                     │
│  From: Kyle  •  Stage: Under Contract               │
│                                                     │
│  [Edit]  [Dismiss]  [Send ✓]                        │
└─────────────────────────────────────────────────────┘
```

- **Edit** → inline textarea opens, Kyle edits text, then Send
- **Dismiss** → removes card, logs note
- **Send** → sends immediately, card disappears

Auto-refreshes every 30 seconds so new messages appear without reload.

---

## GUNNER_URL Env Var

Set on Railway:
```
GUNNER_URL=https://gunner-v2-production.up.railway.app
```

Used in GHL task body to link Kyle directly to /am view.

---

## Go-Live Checklist

- [ ] Create `message_queue` DB table (migration)
- [ ] Add `requiresReview` to `OutboundRequest` + `queueForReview()` to outbound-manager
- [ ] Update all agents listed above to pass `requiresReview: true`
- [ ] Build 3 API endpoints (`/api/review/pending`, `/approve`, `/edit-and-approve`, `/dismiss`)
- [ ] Add Pending Messages section to `/am` view
- [ ] Set `GUNNER_URL` env var on Railway
- [ ] Set `DRY_RUN=false` on Railway once deployed ← Corey approves this step

---

## What Stays Automatic (no review needed)
- Initial outreach SMS ✅
- GHL tasks (all agents) ✅
- GHL notes ✅
- Stage moves ✅
- Call coaching scores ✅
- Lead scoring ✅
