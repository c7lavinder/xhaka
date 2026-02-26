# Gunner V2 — Action Bot Architecture
**Date:** Feb 26, 2026  
**Priority:** CRITICAL — foundational before any other work  
**Rule:** Every action is a standalone bot. Agents never act directly. Every bot is independently toggleable.

---

## The Core Principle

```
Agent = thinks and decides
Bot   = does one thing and one thing only
```

Agents must NEVER call GHL directly or perform actions inline.
They submit to bots. Bots do the work. Bots can be turned off without touching agent code.

**Wrong:**
```ts
// Inside an agent — NEVER do this
await crm.createTask({ ... });
await crm.sendSms({ ... });
await crm.moveStage({ ... });
```

**Right:**
```ts
// Inside an agent — always submit to a bot
await bots.TaskBot.run({ contactId, title, body, dueDate, assignedTo });
await bots.SMSBot.queue({ contactId, message, fromUserId });
await bots.StageBot.run({ contactId, opportunityId, stageName });
```

---

## Action Bots — Full List

Each bot has:
- A single `run()` method
- Its own `ENABLED` env var (default: `true`)
- Its own audit log entry
- Zero knowledge of which agent called it

| Bot | What It Does | Env Var Toggle |
|-----|-------------|----------------|
| **SMSBot** | Sends outbound SMS via GHL | `SMS_BOT_ENABLED` |
| **EmailBot** | Sends outbound email via GHL | `EMAIL_BOT_ENABLED` |
| **TaskBot** | Creates GHL tasks | `TASK_BOT_ENABLED` |
| **NoteBot** | Writes notes to GHL contact | `NOTE_BOT_ENABLED` |
| **StageBot** | Moves opportunity to a new stage | `STAGE_BOT_ENABLED` |
| **TagBot** | Adds/removes tags on contact | `TAG_BOT_ENABLED` |
| **FieldBot** | Updates custom fields on contact/opportunity | `FIELD_BOT_ENABLED` |
| **CalendarBot** | Creates/cancels GHL calendar events | `CALENDAR_BOT_ENABLED` |
| **CoachingBot** | Posts call score to Gunner platform | `COACHING_BOT_ENABLED` |
| **AssignBot** | Assigns contact/opportunity to a user | `ASSIGN_BOT_ENABLED` |

---

## Bot Interface (every bot follows this pattern)

```ts
interface BotResult {
  success: boolean;
  skipped: boolean;       // bot is disabled or dry-run
  dryRun: boolean;
  reason?: string;
  output?: any;
}

interface ActionBot<TInput> {
  name: string;
  enabled: boolean;       // reads from env var at runtime
  run(input: TInput, ctx: BotContext): Promise<BotResult>;
}
```

### BotContext (passed to every bot)
```ts
interface BotContext {
  tenantId: string;
  contactId: string;
  agentId: string;        // which agent is submitting
  dryRun: boolean;
}
```

---

## Bot Behavior When Disabled

When `SMS_BOT_ENABLED=false` (or any bot's env var is false):
1. Bot logs a `skipped` entry to audit log
2. Returns `{ success: false, skipped: true, reason: 'SMS_BOT_ENABLED=false' }`
3. Agent receives the result, continues without error
4. No exception thrown — agent flow is unaffected

When `DRY_RUN=true`:
- ALL bots skip their GHL write
- All bots log a `dry-run` preview entry to audit
- Auditor shows what would have happened

---

## SMSBot — Full Spec

```ts
interface SMSBotInput {
  contactId: string;
  tenantId: string;
  message: string;
  fromUserId?: string;          // GHL user to send from
  fromName?: string;            // display name
  idempotencyWindowMs?: number; // default: 24h
  allowOutsideWindow?: boolean; // bypass send window (default: false)
  requiresReview?: boolean;     // if true, queue for human review before sending
}
```

**SMSBot flow:**
```
1. Check SMS_BOT_ENABLED — if false, skip
2. Check DRY_RUN — if true, preview only
3. Check requiresReview — if true, write to message_queue, create review task, return
4. Check send window (9am–6pm tenant timezone) — if outside, queue for next window
5. Check dedup (sent to same contact within idempotencyWindowMs) — if dupe, skip
6. Send via GHL conversations API
7. Log to audit
```

**requiresReview behavior:**
- Writes to `message_queue` table (status: pending)
- Creates GHL task for AM: "Review message for [Name] — approve in Gunner /am"
- Returns `{ success: false, skipped: false, pendingReview: true }`
- SMS Bot does NOT send until approved via `/api/review/:id/approve`

---

## TaskBot — Full Spec

```ts
interface TaskBotInput {
  contactId: string;
  title: string;
  body?: string;
  dueDate: Date;
  assignedTo: string;    // GHL user ID
  priority?: 'low' | 'medium' | 'high';
}
```

**TaskBot flow:**
```
1. Check TASK_BOT_ENABLED — if false, skip
2. Check DRY_RUN — if true, preview only
3. Dedup: skip if identical task (same title + contactId) exists within 1h
4. Create task via GHL API
5. Log to audit
```

---

## StageBot — Full Spec

```ts
interface StageBotInput {
  contactId: string;
  opportunityId: string;
  stageName: string;      // logical name (e.g. 'warm', 'hot', 'ghosted')
  reason?: string;        // why the move is happening (logged to audit)
}
```

**StageBot flow:**
```
1. Check STAGE_BOT_ENABLED — if false, skip
2. Check DRY_RUN — if true, preview only
3. Resolve stageName → stageId via config.stageId(stageName)
4. Move opportunity via GHL API
5. Log to audit with reason
```

---

## NoteBot — Full Spec

```ts
interface NoteBotInput {
  contactId: string;
  body: string;
  format?: 'plain' | 'markdown';
}
```

---

## TagBot — Full Spec

```ts
interface TagBotInput {
  contactId: string;
  add?: string[];
  remove?: string[];
}
```

---

## Agent Code Pattern (how agents use bots)

```ts
// Example: LM Assistant after a no-answer call
const bots = getBots();

// Move stage
await bots.StageBot.run({
  contactId, opportunityId,
  stageName: 'warm',
  reason: 'LM called — no answer, first attempt',
}, ctx);

// Create follow-up task
await bots.TaskBot.run({
  contactId,
  title: `Call attempt #${attemptCount + 1} — ${contactName}`,
  body: 'No answer on previous attempt. Double dial.',
  dueDate: nextBusinessDay(),
  assignedTo: repUserId,
}, ctx);

// Add note
await bots.NoteBot.run({
  contactId,
  body: `📞 CALL — No answer. Attempt #${attemptCount + 1}. Drip bump queued.`,
}, ctx);

// Queue SMS for review (does NOT auto-send)
await bots.SMSBot.run({
  contactId, tenantId,
  message: draftMessage,
  fromUserId: repUserId,
  requiresReview: true,
}, ctx);
```

---

## Current Violations to Fix

Every place an agent currently calls any of these directly needs to be replaced with the appropriate bot:

| Current (wrong) | Replace with |
|---|---|
| `sendOutbound(...)` | `bots.SMSBot.run(...)` |
| `crm.createTask(...)` | `bots.TaskBot.run(...)` |
| `crm.addNote(...)` | `bots.NoteBot.run(...)` |
| `crm.moveOpportunity(...)` | `bots.StageBot.run(...)` |
| `crm.addTag(...)` / `crm.removeTag(...)` | `bots.TagBot.run(...)` |
| `crm.updateField(...)` | `bots.FieldBot.run(...)` |
| `crm.createCalendarEvent(...)` | `bots.CalendarBot.run(...)` |
| `gunnerApi.postScore(...)` | `bots.CoachingBot.run(...)` |
| `crm.assignUser(...)` | `bots.AssignBot.run(...)` |

---

## Bot Registry

Central registry in `src/bots/registry.ts`:

```ts
export function getBots(): BotRegistry {
  return {
    SMSBot:      new SMSBot(),
    EmailBot:    new EmailBot(),
    TaskBot:     new TaskBot(),
    NoteBot:     new NoteBot(),
    StageBot:    new StageBot(),
    TagBot:      new TagBot(),
    FieldBot:    new FieldBot(),
    CalendarBot: new CalendarBot(),
    CoachingBot: new CoachingBot(),
    AssignBot:   new AssignBot(),
  };
}
```

Each bot reads its own env var at instantiation:
```ts
class SMSBot implements ActionBot<SMSBotInput> {
  name = 'SMSBot';
  enabled = process.env['SMS_BOT_ENABLED'] !== 'false';  // default: true
  ...
}
```

---

## Railway Env Vars (all default to true — explicit disable as needed)

| Var | Default | Current |
|-----|---------|---------|
| `SMS_BOT_ENABLED` | true | **Set to `false` now** |
| `EMAIL_BOT_ENABLED` | true | true |
| `TASK_BOT_ENABLED` | true | true |
| `NOTE_BOT_ENABLED` | true | true |
| `STAGE_BOT_ENABLED` | true | true |
| `TAG_BOT_ENABLED` | true | true |
| `FIELD_BOT_ENABLED` | true | true |
| `CALENDAR_BOT_ENABLED` | true | true |
| `COACHING_BOT_ENABLED` | true | true |
| `ASSIGN_BOT_ENABLED` | true | true |
| `DRY_RUN` | false | **Set to `false` after this ships** |

---

## Completion Checklist

- [ ] Create `src/bots/sms.ts` (standalone, reads `SMS_BOT_ENABLED`)
- [ ] Create `src/bots/task.ts`
- [ ] Create `src/bots/note.ts`
- [ ] Create `src/bots/stage.ts`
- [ ] Create `src/bots/tag.ts`
- [ ] Create `src/bots/field.ts`
- [ ] Create `src/bots/calendar.ts`
- [ ] Create `src/bots/coaching.ts`
- [ ] Create `src/bots/assign.ts`
- [ ] Create `src/bots/registry.ts`
- [ ] Strip all direct CRM calls from every agent — replace with bot calls
- [ ] Remove `outbound-manager.ts` (replaced by SMSBot + message_queue)
- [ ] Set `SMS_BOT_ENABLED=false` on Railway
- [ ] Set `DRY_RUN=false` on Railway (agents live, SMS off)
- [ ] Confirm auditor shows correct per-bot skip logs when disabled
