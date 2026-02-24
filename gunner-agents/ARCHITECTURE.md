# Gunner Architecture Spec
*Single source of truth. Nothing gets built that contradicts this.*

---

## The Most Important Distinction in This Entire System

### What is a Bot?
A bot does **one singular thing** — exceptionally well, with maximum effectiveness and efficiency.

- One input. One output. One job.
- No decisions. No orchestration. No awareness of anything outside its job.
- Stateless. Fast. Replaceable.
- Can be called by any agent, in any order, in any context.
- If you can describe what it does in more than one sentence, it's not a bot — split it.

```
✅ Bot:  CallTranscriptBot   — takes a recording URL, returns transcript text
✅ Bot:  SentimentBot        — takes message text, returns sentiment + signals
✅ Bot:  SMSBot              — takes a message + recipient, sends it
❌ Not a bot: anything that calls another bot, makes a branching decision,
              or does two things even if they seem related
```

### What is an Agent?
An agent **combines the output of multiple bots** to complete a task.

- Reads the Playbook. Makes decisions. Knows the goal.
- Calls the right bots in the right order.
- Decides what to do with each bot's output.
- Produces a meaningful outcome (lead processed, call logged, drip activated).
- Never does the actual work — bots do the work.

```
✅ Agent: LMAssistantAgent   — after a call, calls 10+ bots, decides next steps
✅ Agent: PipelineEntryAgent — on new lead, runs hygiene → scoring → outreach
❌ Not an agent: anything that only does one thing (that's a bot)
```

### The Test
Ask: "Could I swap this out independently and improve it without touching anything else?"
- **Yes** → it's a bot. Keep it pure.
- **No** → it's doing too much. Split it.

---

## Core Architecture

```
PLAYBOOKS       — what "good" looks like, industry rules, NAH config
    ↓
AGENTS          — orchestrators: read Playbook, call bots, make decisions
    ↓
BOTS            — one job, done exceptionally well, CRM-agnostic
    ↓
CRM ADAPTER     — translates bot calls into CRM-specific API calls
    ↓
CRM             — GHL, HubSpot, Salesforce, Pipedrive, etc.
```

Bots never talk to a CRM directly. Ever.
Bots never call other bots. Ever.
Agents never contain industry-specific logic. Ever.
Agents never call CRM APIs directly. Ever.
Intelligence lives in Playbooks. Execution lives in Bots. Decisions live in Agents.

---

---

## Bot vs Agent Audit

Everything we've built or spec'd — checked against the definition.

### ✅ True Bots (one job, done well)
| Name | One Job |
|---|---|
| SMSBot | Send a text |
| EmailBot | Send an email |
| NoteBot | Write a note to a contact |
| TaskBot | Create a task |
| TagBot | Add/remove tags |
| PipelineBot | Move a contact to a stage |
| FieldWriterBot | Write custom fields |
| CoreFieldWriterBot | Write standard CRM fields |
| ConditionBot | Address → numeric property grade |
| TimezoneResolverBot | Address → IANA timezone |
| MessageCrafterBot | Context + scenario → message text |
| LeadScorerBot | Contact context + Playbook → score + tier |
| CallScorerBot | Transcript + Playbook → call score |
| CallTranscriptBot | Recording URL → transcript text |
| CallRecordingBot | Call ID → recording URL |
| CallDurationBot | Call ID → duration in seconds |
| CallDispositionBot | Transcript → outcome label |
| DoubleDialCheckerBot | Contact ID + timestamp → bool + gap |
| CallAttemptCounterBot | Contact ID → total dial count |
| ResponseTrackerBot | Contact ID → last response details |
| ConversationThreadBot | Contact ID → full message thread |
| UnreadMessageBot | Contact ID → unread count + age |
| ContactActivityBot | Contact ID → full touchpoint history |
| StageVelocityBot | Opportunity ID → days in stage |
| PipelineHistoryBot | Contact ID → all stage history |
| LeadAgeBot | Contact ID → days since created |
| CommunicationGapBot | Contact ID → days since last outreach |
| AppointmentStatusBot | Contact ID → appointment status |
| TaskCompletionBot | Contact ID → open/overdue tasks |
| EnrollmentStatusBot | Contact ID → active sequences |
| FormSubmissionBot | Submission ID → parsed fields |
| UserAvailabilityBot | User ID → available bool |
| OptOutTrackerBot | Contact ID → opted out bool + details |
| DNCCheckerBot | Phone → on DNC list bool |
| DuplicateDetectorBot | Contact ID → duplicate IDs |
| PPLEligibilityBot | Contact ID → dispute window status |
| ChannelPreferenceBot | Contact ID → best channel |
| EngagementScoreBot | Contact ID → 0–10 score |
| VoicemailBot | Recording URL → transcript |
| SentimentBot | Message text → sentiment + signals |
| MotivationAnalyzerBot | Conversation thread → motivation score |
| DeadLeadClassifierBot | Contact context → dead/cold/dormant |
| EscalationBot | Contact context → escalate bool + reason |
| HandoffBot | Contact context → LM→AM brief |
| CoachingBot | Call score + Playbook → coaching feedback |
| AppointmentSetterBot | Context → booking message |
| PriceAnalyzerBot | ARV + repair + ask → price factor |
| ReEngagementBot | Dormant contact → re-engagement strategy |
| ObjectionHandlerBot | Objection text → suggested response |
| WorkingDripBot | Contact ID + action → drip state change |
| CampaignEnrollmentBot | Contact ID + campaign → enrolled/removed |
| SmartListBot | Contact ID + list → added/removed |
| DNCBot | Contact ID → quarantined + sequences stopped |
| DuplicateMergerBot | Contact IDs → merged record |
| DocumentBot | Contact ID + template → document sent |
| ReviewRequestBot | Contact ID → review request sent |
| ContextBot | Contact ID → assembled contact context |

### ❌ Misclassified — These Are Agents, Not Bots
| Currently Called | What It Actually Is | Why |
|---|---|---|
| DataHygieneBot | **DataHygieneAgent** | Calls 8+ bots, makes decisions, produces multiple outputs |

### DataHygieneAgent — Correct Breakdown
What it currently does that proves it's an agent:
1. Cleans and normalizes fields → `FieldCleanerBot`
2. Resolves property market from city → `MarketResolverBot`
3. Enriches property data via BatchLeads → `PropertyEnricherBot`
4. Grades property condition via Street View + Gemini → `ConditionBot` ✅
5. Resolves contact timezone → `TimezoneResolverBot` ✅
6. Writes mailing address fields → `FieldWriterBot` ✅
7. Writes business name (= street address) → `CoreFieldWriterBot` ✅
8. Applies state/market/source/type tags → `TagBot` ✅
9. Writes hygiene note → `NoteBot` ✅

Two bots we need to add from this audit:
- `FieldCleanerBot` — takes raw contact fields → returns normalized/cleaned versions
- `MarketResolverBot` — takes city → returns configured market name
- `PropertyEnricherBot` — takes address → returns property data (beds/bath/sqft/type)

Everything else it calls already exists as a proper bot.

---

## Layer 1: Standard Data Models

These are the only data shapes that exist above the adapter layer.
No GHL field names. No HubSpot property keys. Pure concepts.

### CRMContact
```typescript
interface CRMContact {
  id: string
  firstName: string
  lastName: string
  name: string
  phone: string
  email: string
  address: string
  city: string
  state: string
  postalCode: string
  timezone: string
  source: string                    // where the lead came from
  assignedUserId: string
  tags: string[]
  customFields: Record<string, any> // CRM-specific custom fields, mapped by logical name
  createdAt: string
  updatedAt: string
}
```

### CRMOpportunity
```typescript
interface CRMOpportunity {
  id: string
  contactId: string
  pipelineId: string
  pipelineStageId: string
  pipelineName: string             // logical name (salesProcess, followUp, dispo)
  stageName: string                // logical name (newLead, warm, hot, purchased, etc.)
  status: 'open' | 'won' | 'lost'
  assignedUserId: string
  monetaryValue: number
  createdAt: string
  updatedAt: string
}
```

### CRMConversation
```typescript
interface CRMConversation {
  id: string
  contactId: string
  assignedUserId: string
  unreadCount: number
  lastMessageAt: string
  channels: ('sms' | 'email' | 'call' | 'facebook' | 'instagram' | 'whatsapp' | 'gmb')[]
}
```

### CRMMessage
```typescript
interface CRMMessage {
  id: string
  conversationId: string
  contactId: string
  direction: 'inbound' | 'outbound'
  channel: 'sms' | 'email' | 'call' | 'facebook' | 'instagram' | 'whatsapp' | 'gmb'
  body: string
  status: 'sent' | 'delivered' | 'read' | 'failed'
  timestamp: string
  userId?: string                  // who sent it (outbound)
}
```

### CRMCall
```typescript
interface CRMCall {
  id: string
  contactId: string
  userId: string                   // who made/received the call
  direction: 'inbound' | 'outbound'
  duration: number                 // seconds
  status: 'completed' | 'missed' | 'voicemail' | 'busy' | 'failed'
  recordingUrl?: string
  transcript?: string
  disposition?: string             // what the rep marked it as
  startedAt: string
  endedAt: string
}
```

### CRMTask
```typescript
interface CRMTask {
  id?: string
  contactId: string
  title: string
  body?: string
  assignedUserId: string
  dueAt: string
  status: 'open' | 'completed' | 'overdue'
  completedAt?: string
}
```

### CRMNote
```typescript
interface CRMNote {
  id: string
  contactId: string
  body: string
  userId?: string
  createdAt: string
}
```

### CRMUser
```typescript
interface CRMUser {
  id: string
  firstName: string
  lastName: string
  name: string
  email: string
  phone?: string                   // direct line / LC phone
  role: string
}
```

### CRMAppointment
```typescript
interface CRMAppointment {
  id: string
  contactId: string
  userId: string
  title: string
  startAt: string
  endAt: string
  status: 'booked' | 'confirmed' | 'showed' | 'no_show' | 'cancelled' | 'rescheduled'
  calendarId: string
}
```

### CRMFormSubmission
```typescript
interface CRMFormSubmission {
  id: string
  contactId: string
  formId: string
  formName: string
  fields: Record<string, any>      // field label → value
  submittedAt: string
}
```

---

## Layer 2: Standard Event Taxonomy

Every CRM fires events differently. The Event Normalizer translates all of them
into these standard events before any agent ever sees them.

```typescript
type StandardEventType =
  // Opportunity
  | 'opportunity.created'
  | 'opportunity.stage_changed'
  | 'opportunity.stale'
  | 'opportunity.won'
  | 'opportunity.lost'

  // Contact
  | 'contact.created'
  | 'contact.updated'
  | 'contact.opted_out'
  | 'contact.duplicate_detected'

  // Messaging
  | 'message.inbound'
  | 'message.unread_threshold'

  // Calls
  | 'call.outbound_completed'
  | 'call.inbound_completed'
  | 'call.voicemail_inbound'
  | 'call.voicemail_outbound_detected'

  // Appointments
  | 'appointment.booked'
  | 'appointment.confirmed'
  | 'appointment.no_show'
  | 'appointment.cancelled'
  | 'appointment.rescheduled'

  // Tasks
  | 'task.overdue'
  | 'task.completed'

  // Forms
  | 'form.submitted'

  // Tags
  | 'tag.added'
  | 'tag.removed'

  // Time-based (emitted by internal scheduler, not CRM)
  | 'timer.ghosted_threshold'
  | 'timer.stage_stale'
  | 'timer.followup_due'
  | 'timer.drip_step_due'
  | 'timer.ppl_window_closing'
  | 'timer.task_overdue_check'
  | 'timer.kpi_daily'
```

### Standard CRMEvent envelope
```typescript
interface CRMEvent {
  id: string                       // unique event ID (for dedup)
  type: StandardEventType
  contactId: string
  opportunityId?: string
  callId?: string
  appointmentId?: string
  taskId?: string
  formSubmissionId?: string
  meta: Record<string, any>        // event-specific data (old stage, new stage, tag name, etc.)
  receivedAt: string
  source: string                   // 'webhook' | 'poller' | 'scheduler'
  tenantId: string
}
```

### Event Normalizer (per CRM)
Each CRM adapter implements a normalizer that maps raw payloads to CRMEvent:

```typescript
interface EventNormalizer {
  canHandle(rawEvent: any): boolean
  normalize(rawEvent: any, tenantId: string): CRMEvent | null
}
```

GHL example mappings:
```
"OpportunityCreate"          → opportunity.created
"OpportunityStageUpdate"     → opportunity.stage_changed
"ContactDndUpdate" (on)      → contact.opted_out
"InboundMessage"             → message.inbound
"CallCompleted" (outbound)   → call.outbound_completed
"AppointmentBooked"          → appointment.booked
```

---

## Layer 3: Full CRM Adapter Interface

Every bot method maps to a method on this interface.
No bot ever calls a CRM API directly.

```typescript
interface CRMAdapter {
  readonly tenantId: string
  readonly crmType: string

  // ─── Contact ───────────────────────────────────────────────────────────────
  getContact(contactId: string): Promise<CRMContact>
  updateContact(contactId: string, fields: Partial<CRMContact>): Promise<void>
  updateContactCoreFields(contactId: string, fields: Record<string, any>): Promise<void>
  updateContactCustomFields(contactId: string, fields: Record<string, any>): Promise<void>
  searchContacts(query: string): Promise<CRMContact[]>
  mergeContacts(primaryId: string, duplicateId: string): Promise<void>

  // ─── Opportunity ───────────────────────────────────────────────────────────
  getOpportunity(opportunityId: string): Promise<CRMOpportunity>
  getOpportunitiesForContact(contactId: string): Promise<CRMOpportunity[]>
  moveStage(opportunityId: string, logicalStageName: string): Promise<void>
  updateOpportunity(opportunityId: string, fields: Partial<CRMOpportunity>): Promise<void>
  getStaleOpportunities(pipelineName: string, stagedAgedDays: number): Promise<CRMOpportunity[]>

  // ─── Conversation & Messages ────────────────────────────────────────────────
  getConversation(contactId: string): Promise<CRMConversation | null>
  getOrCreateConversation(contactId: string): Promise<CRMConversation>
  getMessages(conversationId: string, limit?: number): Promise<CRMMessage[]>
  getUnreadMessages(contactId: string): Promise<CRMMessage[]>
  markConversationRead(conversationId: string): Promise<void>

  // ─── Messaging ─────────────────────────────────────────────────────────────
  sendSMS(params: {
    contactId: string
    message: string
    fromUserId?: string
    fromPhone?: string
  }): Promise<{ messageId: string }>

  sendEmail(params: {
    contactId: string
    subject: string
    body: string
    fromUserId?: string
  }): Promise<{ messageId: string }>

  // ─── Calls ─────────────────────────────────────────────────────────────────
  getCall(callId: string): Promise<CRMCall>
  getCallsForContact(contactId: string, limit?: number): Promise<CRMCall[]>
  getCallRecordingUrl(callId: string): Promise<string | null>
  logCall(contactId: string, callData: Partial<CRMCall>): Promise<void>

  // ─── Tasks ─────────────────────────────────────────────────────────────────
  createTask(task: Omit<CRMTask, 'id' | 'status' | 'completedAt'>): Promise<CRMTask>
  completeTask(taskId: string): Promise<void>
  deleteTask(taskId: string): Promise<void>
  getOpenTasks(contactId: string): Promise<CRMTask[]>
  getOverdueTasks(contactId: string): Promise<CRMTask[]>

  // ─── Notes ─────────────────────────────────────────────────────────────────
  addNote(contactId: string, body: string, userId?: string): Promise<CRMNote>
  getNotes(contactId: string, limit?: number): Promise<CRMNote[]>

  // ─── Tags ──────────────────────────────────────────────────────────────────
  addTags(contactId: string, tags: string[]): Promise<void>
  removeTags(contactId: string, tags: string[]): Promise<void>
  getTags(contactId: string): Promise<string[]>
  getContactsByTag(tag: string): Promise<CRMContact[]>

  // ─── Users ─────────────────────────────────────────────────────────────────
  getUser(userId: string): Promise<CRMUser>
  getUsers(): Promise<CRMUser[]>
  getUserByEmail(email: string): Promise<CRMUser | null>
  getUserByPhone(phone: string): Promise<CRMUser | null>

  // ─── Appointments ──────────────────────────────────────────────────────────
  getAppointment(appointmentId: string): Promise<CRMAppointment>
  getAppointmentsForContact(contactId: string): Promise<CRMAppointment[]>
  createAppointment(params: Omit<CRMAppointment, 'id' | 'status'>): Promise<CRMAppointment>
  updateAppointmentStatus(appointmentId: string, status: CRMAppointment['status']): Promise<void>
  cancelAppointment(appointmentId: string): Promise<void>

  // ─── Sequences / Campaigns ─────────────────────────────────────────────────
  enrollInSequence(contactId: string, sequenceId: string): Promise<void>
  removeFromSequence(contactId: string, sequenceId: string): Promise<void>
  getActiveSequences(contactId: string): Promise<string[]>

  // ─── Smart Lists ───────────────────────────────────────────────────────────
  addToSmartList(contactId: string, listId: string): Promise<void>
  removeFromSmartList(contactId: string, listId: string): Promise<void>

  // ─── Pipelines (discovery — used at onboard) ───────────────────────────────
  getPipelines(): Promise<{ id: string; name: string }[]>
  getStages(pipelineId: string): Promise<{ id: string; name: string }[]>

  // ─── Forms ─────────────────────────────────────────────────────────────────
  getFormSubmission(submissionId: string): Promise<CRMFormSubmission>

  // ─── Compliance ────────────────────────────────────────────────────────────
  isOptedOut(contactId: string): Promise<boolean>
  optOut(contactId: string): Promise<void>

  // ─── Polling (fallback for CRMs without webhook support) ───────────────────
  getNewOpportunities(pipelineName: string, stageName: string, since: Date): Promise<CRMOpportunity[]>
  getRecentInboundMessages(since: Date): Promise<CRMMessage[]>
  getRecentCompletedCalls(since: Date): Promise<CRMCall[]>
  getRecentFormSubmissions(since: Date): Promise<CRMFormSubmission[]>
}
```

---

## Layer 4: TenantConfig — CRM Field Mapping

This is what makes the same bots work across any CRM and any customer.
All CRM-specific IDs live here. Nothing else.

```typescript
interface TenantConfig {
  tenantId: string
  tenantName: string

  crm: {
    type: 'ghl' | 'hubspot' | 'salesforce' | 'pipedrive' | 'custom'
    auth: {
      type: 'api_key' | 'oauth' | 'pit'
      token: string
    }
    locationId?: string            // GHL-specific

    // Logical pipeline name → CRM pipeline ID
    pipelines: {
      salesProcess: string
      followUp: string
      dispo?: string
      buyer?: string
    }

    // Logical stage name → CRM stage ID (per pipeline)
    stages: {
      salesProcess: {
        newLead: string
        warm: string
        hot: string
        appointment: string
        offerMade: string
        underContract: string
        purchased: string
        lost: string
        ghosted?: string
      }
      followUp: {
        oneMonth: string
        fourMonth: string
        twelveMonth: string
        dead: string
      }
    }

    // Logical field name → CRM field ID/key
    contactFields: {
      propertyAddress?: string
      mailingStreet?: string
      mailingCity?: string
      mailingState?: string
      mailingZip?: string
      market?: string
      leadScore?: string
      leadTier?: string
      timezone?: string
      // Add more as needed — only what's actually used
    }

    opportunityFields: {
      arv?: string
      repairEstimate?: string
      contractPrice?: string
      askingPrice?: string
      dealSummary?: string
    }
  }

  team: {
    defaultAssigneeId: string
    users: {
      id: string
      name: string
      role: 'lm' | 'am' | 'dispo' | 'admin'
      phone?: string               // direct line for SMS routing
    }[]
  }

  markets: {
    name: string                   // e.g. "Nashville"
    cities: string[]               // suburbs that map to this market
    timezone: string               // IANA timezone for this market
  }[]

  business: {
    name: string
    timezone: string               // IANA timezone for business hours
    sendWindowStart: number        // hour (0-23) in business timezone
    sendWindowEnd: number
    industry: string               // 'wholesale-re' | 'pest-control' | etc.
  }

  playbook: {
    basePath: string               // e.g. 'playbooks/base/WHOLESALE-RE.md'
    overridePath: string           // e.g. 'playbooks/nah/PLAYBOOK.md'
  }

  integrations: {
    batchDialer?: { apiKey: string }
    batchLeads?: { apiKey: string }
    callRail?: { apiKey: string }
    googleMaps?: { apiKey: string }
    gemini?: { apiKey: string; model: string }
    pplPlatforms?: {
      name: string                 // 'leadzolo' | 'motivatedsellers' | 'propertyleads'
      credentials: { username: string; password: string }
      disputeWindowDays: number
    }[]
  }

  flags: {
    dryRun: boolean
    bypassSendWindow?: boolean
  }
}
```

---

## Layer 5: Adapter Factory

Single entry point. Returns the right adapter at runtime.

```typescript
class CRMAdapterFactory {
  static create(config: TenantConfig): CRMAdapter {
    switch (config.crm.type) {
      case 'ghl':         return new GHLAdapter(config)
      case 'hubspot':     return new HubSpotAdapter(config)
      case 'salesforce':  return new SalesforceAdapter(config)
      case 'pipedrive':   return new PipedriveAdapter(config)
      default:            throw new Error(`Unknown CRM type: ${config.crm.type}`)
    }
  }
}
```

Agents and bots never instantiate adapters directly.
They receive a `CRMAdapter` instance — they don't know which one.

---

## Layer 6: Event Router

Maps standard events to the agent that owns them.
One event → one agent. No ambiguity.

```typescript
const EVENT_ROUTER: Record<StandardEventType, AgentHandler> = {
  'opportunity.created':                PipelineEntryAgent,
  'opportunity.stage_changed':          StageChangeAgent,
  'opportunity.stale':                  StaleLeadAgent,
  'opportunity.won':                    PostCloseAgent,
  'opportunity.lost':                   LeadLifecycleAgent,

  'contact.created':                    PipelineEntryAgent,
  'contact.opted_out':                  ComplianceAgent,
  'contact.duplicate_detected':         DataQualityAgent,

  'message.inbound':                    ResponseAgent,
  'message.unread_threshold':           ResponseAgent,

  'call.outbound_completed':            LMAssistantAgent,
  'call.inbound_completed':             CallbackCaptureAgent,
  'call.voicemail_inbound':             VoicemailAgent,
  'call.voicemail_outbound_detected':   LMAssistantAgent,

  'appointment.booked':                 AppointmentAgent,
  'appointment.confirmed':              AppointmentAgent,
  'appointment.no_show':                AppointmentAgent,
  'appointment.cancelled':              AppointmentAgent,
  'appointment.rescheduled':            AppointmentAgent,

  'task.overdue':                       AccountabilityAgent,
  'task.completed':                     null,             // no-op (logged only)

  'form.submitted':                     PipelineEntryAgent,

  'tag.added':                          TagReactionAgent,
  'tag.removed':                        null,             // no-op currently

  'timer.ghosted_threshold':            GhostedAgent,
  'timer.stage_stale':                  StaleLeadAgent,
  'timer.followup_due':                 FollowUpAgent,
  'timer.drip_step_due':                WorkingDripAgent,
  'timer.ppl_window_closing':           PPLRefundAgent,
  'timer.task_overdue_check':           AccountabilityAgent,
  'timer.kpi_daily':                    KPIEntryAgent,
}
```

---

## Master Bot Registry

### Observation Bots
| Bot | Input | Output |
|---|---|---|
| CallRecordingBot | callId | recordingUrl |
| CallTranscriptBot | recordingUrl | transcript text |
| CallDurationBot | callId | seconds |
| CallDispositionBot | transcript | outcome label |
| DoubleDialCheckerBot | contactId, timestamp | bool, gap minutes |
| CallAttemptCounterBot | contactId | total count, last attempt |
| ResponseTrackerBot | contactId | last response, channel, timestamp |
| ConversationThreadBot | contactId | full thread, all channels |
| UnreadMessageBot | contactId | unread count, oldest age |
| ContactActivityBot | contactId | full touchpoint history |
| StageVelocityBot | opportunityId | days in current stage |
| PipelineHistoryBot | contactId | all stages + timestamps |
| LeadAgeBot | contactId | days since created |
| CommunicationGapBot | contactId | days since last outreach |
| AppointmentStatusBot | contactId | booked/confirmed/showed/no-show |
| TaskCompletionBot | contactId | open tasks, overdue tasks |
| EnrollmentStatusBot | contactId | active sequences/campaigns |
| FormSubmissionBot | submissionId | parsed field map |
| UserAvailabilityBot | userId | on shift, available |
| OptOutTrackerBot | contactId | opted out, channel, when |
| DNCCheckerBot | phone | on DNC list |
| DuplicateDetectorBot | contactId | duplicate IDs if any |
| PPLEligibilityBot | contactId | platform, cost, window open, days left |
| ChannelPreferenceBot | contactId | best channel from response history |
| EngagementScoreBot | contactId | 0–10 composite score |
| VoicemailBot | recordingUrl | transcript text |

### Intelligence Bots
| Bot | Input | Output |
|---|---|---|
| LeadScorerBot | contactContext + Playbook | score, tier, factor breakdown |
| MessageCrafterBot | context + Playbook + scenario | SMS / email text |
| CallScorerBot | transcript + Playbook | score, factor breakdown |
| ConditionBot | address | numeric grade (1–10) |
| TimezoneResolverBot | address | IANA timezone |
| SentimentBot | message text | positive/neutral/negative + signals |
| MotivationAnalyzerBot | conversation thread | motivation score + signals |
| DeadLeadClassifierBot | contactContext | dead / cold / dormant |
| ReEngagementBot | dormant contact + Playbook | strategy |
| ObjectionHandlerBot | objection text + Playbook | suggested response |
| EscalationBot | contactContext + Playbook | escalate to AM? + reason |
| HandoffBot | contactContext + Playbook | LM → AM brief |
| CoachingBot | call score + Playbook | coaching feedback for rep |
| AppointmentSetterBot | context + Playbook | booking message |
| PriceAnalyzerBot | ARV + repair + ask | price factor pass/fail |

### Action Bots
| Bot | Input | Output |
|---|---|---|
| SMSBot | contactId, message, fromUserId | sent / dry-run |
| EmailBot | contactId, subject, body | sent / dry-run |
| NoteBot | contactId, body | note created |
| TaskBot | contactId, title, assignee | task created |
| TagBot | contactId, tags | tags applied |
| PipelineBot | opportunityId, stageName | stage moved |
| FieldWriterBot | contactId, fields | fields updated |
| CoreFieldWriterBot | contactId, coreFields | core fields updated |
| WorkingDripBot | contactId, action | activated/paused/stopped |
| AppointmentBot | contactId, slot | booked/cancelled/rescheduled |
| CampaignEnrollmentBot | contactId, campaignId | enrolled/removed |
| SmartListBot | contactId, listId | added/removed |
| DNCBot | contactId | quarantined, all sequences stopped |
| DuplicateMergerBot | contactId A + B | merged record |
| DocumentBot | contactId, templateId | document sent |
| ReviewRequestBot | contactId | review request sent |

---

## Agent → Bot Map

### PipelineEntryAgent
Trigger: `opportunity.created`, `contact.created`, `form.submitted`
Bots: ContextBot, DataHygieneBot (→ DNCChecker, DuplicateDetector, ConditionBot, TimezoneResolver, FieldWriter, CoreFieldWriter, TagBot, NoteBot), LeadScorerBot, TaskBot, PipelineBot, MessageCrafterBot, SMSBot, WorkingDripBot, NoteBot

### LMAssistantAgent
Trigger: `call.outbound_completed`, `call.voicemail_outbound_detected`
Bots: CallRecordingBot, CallTranscriptBot, CallDurationBot, CallDispositionBot, DoubleDialCheckerBot, CallAttemptCounterBot, CallScorerBot, ContactActivityBot, ResponseTrackerBot, SentimentBot, MotivationAnalyzerBot, MessageCrafterBot, SMSBot, NoteBot, TaskBot, PipelineBot, CoachingBot

### ResponseAgent
Trigger: `message.inbound`, `message.unread_threshold`
Bots: ConversationThreadBot, ResponseTrackerBot, UnreadMessageBot, SentimentBot, MotivationAnalyzerBot, CommunicationGapBot, WorkingDripBot (pause), TaskBot, NoteBot, PipelineBot

### CallbackCaptureAgent
Trigger: `call.inbound_completed`
Bots: CallTranscriptBot, CallDurationBot, CallDispositionBot, MotivationAnalyzerBot, WorkingDripBot, NoteBot, TaskBot

### VoicemailAgent
Trigger: `call.voicemail_inbound`
Bots: VoicemailBot, SentimentBot, MotivationAnalyzerBot, NoteBot, TaskBot

### AppointmentAgent
Trigger: `appointment.*`
Bots: AppointmentStatusBot, ContactActivityBot, MessageCrafterBot, SMSBot, TaskBot, NoteBot, WorkingDripBot, PipelineBot

### GhostedAgent
Trigger: `timer.ghosted_threshold`
Bots: CommunicationGapBot, ContactActivityBot, PipelineHistoryBot, WorkingDripBot, TaskBot, NoteBot

### StaleLeadAgent
Trigger: `opportunity.stale`, `timer.stage_stale`
Bots: StageVelocityBot, ContactActivityBot, CommunicationGapBot, LeadAgeBot, MotivationAnalyzerBot, WorkingDripBot, TaskBot, NoteBot

### AccountabilityAgent
Trigger: `task.overdue`, `timer.task_overdue_check`
Bots: TaskCompletionBot, ContactActivityBot, StageVelocityBot, LeadAgeBot, UserAvailabilityBot, NoteBot, TaskBot

### FollowUpAgent
Trigger: `timer.followup_due`
Bots: StageVelocityBot, ContactActivityBot, MotivationAnalyzerBot, ReEngagementBot, MessageCrafterBot, SMSBot, EmailBot, NoteBot

### PostCloseAgent
Trigger: `opportunity.won`
Bots: ContactActivityBot, MessageCrafterBot, SMSBot, EmailBot, ReviewRequestBot, NoteBot, WorkingDripBot (stop), TagBot

### LeadLifecycleAgent
Trigger: `opportunity.lost`
Bots: DeadLeadClassifierBot, ContactActivityBot, PipelineHistoryBot, MotivationAnalyzerBot, WorkingDripBot, PipelineBot, NoteBot, TagBot

### ComplianceAgent
Trigger: `contact.opted_out`
Bots: OptOutTrackerBot, WorkingDripBot (stop), CampaignEnrollmentBot (remove all), TagBot, NoteBot

### DataQualityAgent
Trigger: `contact.duplicate_detected`
Bots: DuplicateDetectorBot, ContactActivityBot (both records), DuplicateMergerBot, NoteBot

### PPLRefundAgent
Trigger: `timer.ppl_window_closing`
Bots: PPLEligibilityBot, ContactActivityBot, ConversationThreadBot, DNCCheckerBot
(+ Playwright automation for dispute filing)

### KPIEntryAgent
Trigger: `timer.kpi_daily`
Bots: CallAttemptCounterBot, ResponseTrackerBot, StageVelocityBot, CommunicationGapBot, ContactActivityBot (aggregate)

### TagReactionAgent
Trigger: `tag.added`
Bots: TagBot, DNCBot, TaskBot, PipelineBot (conditional based on tag)

---

## Rules (Non-Negotiable)

1. **No CRM imports in bots or agents.** Only `CRMAdapter` interface.
2. **No industry-specific logic in bots.** Playbook provides context.
3. **No hardcoded IDs anywhere.** All IDs come from `TenantConfig`.
4. **One event → one agent.** No two agents own the same event.
5. **Agents orchestrate. Bots execute.** Agents make decisions. Bots do one thing.
6. **Dry-run bypasses real writes.** Every action bot checks `config.flags.dryRun`.
7. **Every action gets audited.** Bot writes `audit_log` entry before returning.
8. **Idempotency guard on entry.** PipelineEntryAgent checks `contact_context` before running.
9. **Playbook is the only source of industry knowledge.** Swap it, everything adapts.
10. **CRMAdapterFactory is the only place CRM type is checked.** Nowhere else.

---

---

## Layer 7: BotRegistry — Agent-to-Bot Discovery

The problem: without a registry, finding the right bot means hunting through files.
The solution: every bot self-registers. Agents declare dependencies upfront. One lookup, done.

### Bot Manifest (how every bot registers itself)
```typescript
interface BotManifest {
  name: string               // 'CallTranscriptBot' — exact, unique
  description: string        // one line: what it does
  category: 'observation' | 'intelligence' | 'action'
  inputSchema: ZodSchema     // validates input at runtime
  outputSchema: ZodSchema    // validates output at runtime
  path: string               // import path from src/
  usedBy: string[]           // which agents depend on this bot
  learnsWith?: string[]      // which LearningSignals this bot reads/writes
}
```

### BotRegistry (central manifest)
```typescript
class BotRegistry {
  private static bots = new Map<string, BotManifest>()

  // Called once at startup — bots self-register
  static register(manifest: BotManifest): void

  // Agent calls this — returns typed bot instances, ready to use
  static load<T extends readonly string[]>(
    names: T,
    context: { crm: CRMAdapter; config: TenantConfig; learning: LearningConfig }
  ): BotKit<T>

  // Reverse lookup — what agents use this bot?
  static whoUses(botName: string): string[]

  // Startup validation — all declared bots exist, schemas valid
  static validate(): ValidationResult

  // Auto-generates bot documentation
  static docs(): BotDocumentation[]
}
```

### How Agents Use It
Every agent declares its bots as a typed constant at the top of the file.
No imports scattered through the file. No hunting. Obvious at a glance.

```typescript
// src/agents/lm-assistant.ts

class LMAssistantAgent {

  // ← Exact bots this agent uses. Declared once. Validated at startup.
  static readonly BOTS = [
    'CallRecordingBot',
    'CallTranscriptBot',
    'CallDurationBot',
    'CallDispositionBot',
    'DoubleDialCheckerBot',
    'CallAttemptCounterBot',
    'CallScorerBot',
    'ContactActivityBot',
    'ResponseTrackerBot',
    'SentimentBot',
    'MotivationAnalyzerBot',
    'MessageCrafterBot',
    'SMSBot',
    'NoteBot',
    'TaskBot',
    'PipelineBot',
    'CoachingBot',
  ] as const

  async run(event: CRMEvent, crm: CRMAdapter, config: TenantConfig, learning: LearningConfig) {
    // One call. All bots resolved, typed, ready.
    const bots = BotRegistry.load(LMAssistantAgent.BOTS, { crm, config, learning })

    // Now just use them — fully typed
    const recording = await bots.CallRecordingBot.run({ callId: event.callId })
    const transcript = await bots.CallTranscriptBot.run({ recordingUrl: recording.url })
    const score = await bots.CallScorerBot.run({ transcript: transcript.text, playbook })
    // ...
  }
}
```

### What You Get From the Registry
- **At startup**: validates every bot in every agent's BOTS list actually exists
- **At runtime**: `bots.SomeBotName` is fully typed — no casting, no guessing
- **For docs**: `BotRegistry.docs()` generates the full bot catalog automatically
- **For debugging**: `BotRegistry.whoUses('MessageCrafterBot')` shows every agent that calls it
- **For new developers**: read the BOTS constant at the top → instantly know what the agent does

### Bot File Structure (standard)
Every bot follows the same pattern. Zero ambiguity.

```
src/
  bots/
    observation/
      call-transcript.bot.ts
      response-tracker.bot.ts
      ...
    intelligence/
      call-scorer.bot.ts
      message-crafter.bot.ts
      ...
    action/
      sms.bot.ts
      task.bot.ts
      ...
```

Each file exports:
1. The bot class (implements `Bot<Input, Output>`)
2. The manifest (self-registration call at module load)
3. Input/output Zod schemas (used by registry for validation)

---

## Layer 8: Intelligence Layer — The System That Makes Everything Better

Intelligence is not a single thing. It is eight pillars working together.
Every bot is continuously shaped by all eight.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        INTELLIGENCE LAYER                            │
│                                                                     │
│  EXPERIENCE   TESTS    RESEARCH   MEMORY   AWARENESS                │
│  What we've   What's   What       Who      What's happening         │
│  learned      valid    could be   this     that nobody asked        │
│               now      better     person   about                    │
│                                   is                                │
│  ─────────────────────────────────────────────────────────────────  │
│  REASONING — connects all five, resolves conflicts, prioritizes     │
│  HUMAN FEEDBACK — qualitative correction from people who know       │
│  PREDICTION — turns past signal into forward-looking action         │
│  ─────────────────────────────────────────────────────────────────  │
│                       LEARNING CONFIG                               │
│                  what every bot reads at runtime                    │
└─────────────────────────────────────────────────────────────────────┘
```

| Pillar | Question It Answers |
|---|---|
| Experience | What happened and what did it mean? |
| Tests | Is this working correctly right now? |
| Research | What could work better? |
| Memory | Who is this person and what's their full story? |
| Awareness | What's happening that nobody asked about? |
| Reasoning | Given all of the above — what matters most, what do we do? |
| Human Feedback | What does the team know that the data can't measure? |
| Prediction | What's likely to happen next and how do we get ahead of it? |

### Pillar 1: Experience
What the system has seen, done, and learned from real runs.

**The Core Loop:**
```
Bot runs → logs output + context to intelligence_log
    ↓
Outcome occurs (responded, booked, closed, lost, ghosted)
    ↓
OutcomeLinker attributes outcome back to bot runs that preceded it
    ↓
ExperienceAnalyzer finds patterns: what inputs → what outcomes
    ↓
LearningConfig updated with winners
    ↓
Every bot reads LearningConfig at runtime → better prompts, weights, timing
```

**What Experience tracks:**
- Which messages got replies vs silence
- Which lead scores actually predicted closes
- Which coaching feedback changed rep behavior
- Which drip timing produced the most responses
- Which send windows outperform baseline
- Which sources convert vs waste time
- How long leads typically take to respond by source/scenario
- Rep performance trends over time (improving, declining, stable)

**Experience accumulates automatically.** No manual input. Every run adds a data point.

---

### Pillar 2: Tests
Continuous validation that every bot is performing its one job correctly.

**Test Types:**

**Accuracy Tests** — Is the bot's output correct?
```
SentimentBot:     run against 200 labeled samples → must score ≥ 90% accuracy
CallScorerBot:    run against 50 human-graded calls → must correlate ≥ 0.85
LeadScorerBot:    predicted tier vs actual close rate → must be directionally correct
ConditionBot:     grade vs human-appraised condition → must be within 1.5 points
MessageCrafterBot: output reviewed against banned phrases, hallucination check
```

**Performance Tests** — Is the bot fast enough?
```
Every bot has a max latency threshold
Observation bots: < 500ms
Intelligence bots: < 3000ms (AI inference allowed)
Action bots: < 1000ms
Violations flagged in IntelligenceDashboard
```

**Consistency Tests** — Does the same input produce reliable output?
```
Run each bot 5x on the same input
AI bots: output must be semantically consistent (not wildly different each run)
Deterministic bots: output must be identical
```

**Regression Tests** — Did a change make a bot worse?
```
Every bot change triggers a test run against a frozen golden dataset
Score must not drop more than 5% vs previous version
Automatic rollback flag if regression detected
```

**Drift Detection** — Is a bot degrading over time without changes?
```
Track bot accuracy metrics weekly
Alert if performance drops more than 10% from baseline
Common causes: AI model behavior drift, data quality changes, market shifts
```

**A/B Tests** — Which approach performs better in production?
```
Run Variant A and Variant B simultaneously on real contacts (split by contact ID hash)
Collect outcomes for both variants
Declare winner when statistical significance reached (min 100 samples per variant)
Winner automatically promoted to default in LearningConfig
```

**Test Registry** — every bot has named tests:
```typescript
interface BotTestSuite {
  botName: string
  accuracyTests: AccuracyTest[]
  performanceThresholds: PerformanceThreshold[]
  consistencyChecks: ConsistencyCheck[]
  goldenDataset: TestCase[]         // frozen samples used for regression
  lastRun: string
  currentScore: number              // 0–100
  trend: 'improving' | 'stable' | 'degrading'
}
```

**Tests run on schedule** (nightly) and on every bot deployment.
Any bot scoring below threshold is flagged before it touches a real contact.

---

### Pillar 3: Research
Active discovery of better approaches. The system doesn't wait to be told — it explores.

**What Research Does:**

**Prompt Research**
```
IntelligenceService generates prompt variants for AI bots
Each variant tested against golden dataset
Top performers become candidates for A/B testing in production
Runs weekly → prompts continuously evolve without manual tuning
```

**Model Research**
```
When new AI models release (Gemini Flash 2.5 → 3.0, etc.):
Run full bot test suite against new model before switching
Compare: accuracy, latency, cost, consistency
Promote if meaningfully better on all dimensions
```

**Data Source Research**
```
Monitor enrichment data source quality over time
Test alternative sources when primary degrades (BatchLeads → Zillow API, etc.)
Track field coverage rates: % of contacts enriched successfully
Alert when coverage drops below threshold
```

**Pattern Research**
```
Weekly: scan intelligence_log for emerging patterns not yet in LearningConfig
E.g.: "PPL leads from Leadzolo responding 40% better on Tuesdays"
Surfaced in IntelligenceDashboard for review
High-confidence patterns automatically promoted to LearningConfig
```

**Industry Research** (future)
```
Monitor wholesale RE market trends
Ingest new playbook content from industry sources
Flag when market conditions shift (e.g., rising rates → motivation patterns change)
```

**Research runs on schedule** and surfaces findings in the Intelligence Dashboard.
Nothing is automatically applied without meeting a confidence threshold.

---

### Pillar 4: Memory
Structured long-term memory at two levels: aggregate (what we know about the population) and individual (what we know about this specific person).

LearningConfig captures population-level patterns. Memory captures the full story of a contact — every call, every response, every silence, how their tone changed, what they said in month 1 vs month 6. Any bot can pull from it.

**Two types:**

**Contact Memory** — everything known about a specific person
```typescript
interface ContactMemory {
  contactId: string
  tenantId: string

  // Full lifecycle timeline
  timeline: {
    timestamp: string
    event: string                    // 'sms_sent', 'call_completed', 'responded', etc.
    summary: string                  // human-readable one-liner
    significance: 'low' | 'medium' | 'high'
    data: Record<string, any>
  }[]

  // What we've learned about this person specifically
  profile: {
    preferredChannel?: string        // how they respond best
    bestTimeToContact?: string       // when they pick up / reply
    communicationStyle?: string      // direct, evasive, warm, hostile
    keyStatements: string[]          // things they've said that matter
    motivationSignals: string[]      // what's driving them
    objections: string[]             // what they've pushed back on
    relationships?: string[]         // mentioned family, partners, etc.
  }

  // Running summary — updated after each significant interaction
  summary: string                    // "Seller in Nashville. Inherited property. Mentioned divorce.
                                     //  Has responded to 2 of 6 messages. Most engaged Tuesday AM.
                                     //  Last call: said 'maybe in a few months.' Drip step 4."

  lastUpdated: string
  totalInteractions: number
  firstContactAt: string
}
```

**Institutional Memory** — what's true about this business/market
```typescript
interface InstitutionalMemory {
  tenantId: string

  // Market-specific knowledge that improves over time
  markets: {
    name: string
    avgDaysToClose: number
    commonObjections: string[]
    bestPerformingSources: string[]
    seasonalPatterns: string[]
    notes: string[]                  // anything the team has flagged
  }[]

  // Source-specific patterns
  sources: {
    name: string
    avgResponseTime: number
    conversionRate: number
    commonMotivations: string[]
    fraudPatterns: string[]          // signals this source has bad data
  }[]

  // Team-level knowledge
  team: {
    userId: string
    strengths: string[]
    commonWeaknesses: string[]
    bestTimeOfDay: string            // when they perform best
    avgCallScore: number
    trend: string
  }[]
}
```

**Memory is updated after every significant event.**
ContextBot always pulls ContactMemory before assembling context — bots see the full story, not just current fields.

---

### Pillar 5: Awareness
Ambient pattern detection. Runs continuously. Surfaces things nobody asked about.

Experience, Tests, and Research are all triggered — they run on schedules or on events.
Awareness is different. It watches everything passively and notices when something is worth flagging.

**What Awareness watches:**

**Contact-Level Signals**
```
- Contact drip running > 45 days with zero opens → is the number still valid?
- Contact responded but nobody followed up within 2 hours → LM dropped the ball
- Contact mentioned the same property detail in 3 separate messages → high motivation signal
- Contact's tone shifted from warm to cold between messages → flag for human review
- Contact in New Lead stage > 24 hours without initial outreach → pipeline failure
```

**Rep-Level Signals**
```
- Rep's call scores declining for 7+ consecutive days → early burnout signal
- Rep double-dialing rate dropped below threshold → accountability gap
- Rep completing tasks same-day dropped → workload or motivation issue
- Rep response time to inbound messages increasing → attention gap
```

**Pipeline-Level Signals**
```
- Response rate dropped 25%+ this week vs 4-week average → something changed
- 5+ contacts all mentioned the same keyword this week → market signal
- PPL leads from one source converting at 0% for 30 days → source quality issue
- Stage conversion rate (Warm→Hot) dropped significantly → scoring drift
```

**System-Level Signals**
```
- Bot latency spiking → infrastructure issue
- AI model returning unexpected output patterns → model drift
- Data enrichment coverage dropping → API or source issue
- Webhook miss rate increasing → integration issue
```

**AwarenessEngine output:**
```typescript
interface AwarenessSignal {
  id: string
  tenantId: string
  category: 'contact' | 'rep' | 'pipeline' | 'system'
  severity: 'info' | 'warning' | 'critical'
  title: string                      // "Response rate dropped 31% this week"
  detail: string                     // full explanation + supporting data
  affectedIds: string[]              // contactIds, userIds, botNames, etc.
  suggestedAction?: string           // what to do about it
  detectedAt: string
  resolvedAt?: string
  autoResolvable: boolean            // can the system fix it without human input?
}
```

Signals surface in the Intelligence Dashboard. Critical signals trigger immediate alerts.
Auto-resolvable signals are handled automatically (e.g., invalid phone → tagged + drip stopped).

---

### Pillar 6: Reasoning
Connects all five pillars. Resolves conflicts. Prioritizes what matters.

Experience, Tests, Research, Memory, and Awareness each produce signals independently.
Reasoning is the meta-layer that synthesizes them and decides what to act on.

**What Reasoning does:**

**Conflict Resolution**
```
Experience says: "Tuesday 10am is best send time"
Awareness says: "This specific contact always responds on Saturday morning"
→ Reasoning: contact-level memory overrides population average. Saturday morning.

Tests say: "LeadScorerBot accuracy dropped 8%"
Research says: "New scoring model is 15% more accurate on golden dataset"
→ Reasoning: test failure + research improvement = promote new model now, don't wait for schedule.

Human Feedback says: "Daniel's coaching feedback is off"
Experience says: "Coaching correlated with 12% score improvement this quarter"
→ Reasoning: surface conflict for human review — don't auto-override experience with single feedback.
```

**Prioritization Engine**
```typescript
interface ReasoningPriority {
  item: string                       // what needs attention
  urgency: 'immediate' | 'today' | 'this_week' | 'backlog'
  impact: 'critical' | 'high' | 'medium' | 'low'
  source: string[]                   // which pillars flagged it
  conflictsWith?: string[]           // anything this contradicts
  recommendedAction: string
  confidence: number                 // 0–1
  requiresHumanApproval: boolean
}
```

**Reasoning runs after every IntelligenceService cycle.**
It produces a ranked priority list surfaced in the Intelligence Dashboard.
High-confidence, non-conflicting items below the human-approval threshold execute automatically.
Everything else waits for Corey.

---

### Pillar 7: Human Feedback
The channel where people who actually know the business correct the system.

The system can measure response rates, booking rates, close rates.
It cannot measure: tone quality, relationship nuance, strategic judgment.
Human Feedback is how those things become training signal.

**Feedback entry points:**

**Rep Feedback** (in Gunner UI after every call)
```
Call score shown to rep → rep can flag:
  ✅ Accurate     — confirms score, adds to training signal
  ❌ Wrong        — override score + explain why
  🤔 Partial      — score right, coaching wrong
Rep feedback weighted by track record: reps who are usually right get more weight
```

**Manager Feedback** (Corey reviewing in dashboard)
```
Lead scores reviewable: override tier + reason
Message quality: thumbs up/down on crafted messages
Awareness signals: confirm, dismiss, or escalate
Anomalies: acknowledge or mark false positive
```

**Outcome Correction**
```
System thinks lead is dead → Corey marks as dormant
System scores call 45% → Corey marks as actually handled well
System flags message as low quality → Corey marks as actually great
Each correction feeds back as a labeled training sample
```

**Feedback Schema**
```typescript
interface HumanFeedback {
  id: string
  tenantId: string
  userId: string                     // who gave the feedback
  targetType: 'call_score' | 'lead_score' | 'message' | 'awareness_signal' | 'prediction'
  targetId: string
  feedbackType: 'confirm' | 'override' | 'partial' | 'flag'
  originalValue: any
  correctedValue?: any
  reason?: string                    // optional explanation
  weight: number                     // 0–1, determined by reviewer track record
  givenAt: string
  incorporatedAt?: string            // when IntelligenceService used it
}
```

**Feedback accumulates.** IntelligenceService incorporates it on next cycle.
Over time, frequent override patterns auto-flag for Research to investigate.

---

### Pillar 8: Prediction
Turns past signal into forward-looking action. The system stops reacting and starts anticipating.

**What gets predicted:**

**Lead-Level Predictions**
```typescript
interface LeadPrediction {
  contactId: string
  predictions: {
    appointmentBookingProbability: number    // 0–1, next 7 days
    responseToNextOutreachProbability: number
    closeInNext30DaysProbability: number
    churnProbability: number                 // likely to go cold
    bestNextAction: string                   // what to do right now
    bestContactWindow: string                // when to reach out
    estimatedDaysToDecision: number
  }
  confidence: number
  basedOn: string[]                          // which signals drove this
  generatedAt: string
}
```

**Rep-Level Predictions**
```
- Rep burnout risk score (0–10) based on score trend + activity patterns
- Predicted call count for the week based on task queue + historical pacing
- Performance forecast: expected avg score this week
```

**Pipeline-Level Predictions**
```
- Expected closes this month based on current pipeline + historical conversion rates
- Leads likely to go cold in next 7 days → prioritize now
- Stage bottleneck forecast: where will pipeline back up next week?
```

**System Predictions**
```
- Data source coverage likely to drop (based on API pattern changes)
- Model drift expected (based on performance trend velocity)
- Which A/B test will likely hit significance first
```

**Prediction Engine:**
```typescript
class PredictionEngine {
  // Runs after every IntelligenceService cycle
  async generateLeadPredictions(tenantId: string): Promise<LeadPrediction[]>
  async generateRepPredictions(tenantId: string): Promise<RepPrediction[]>
  async generatePipelineForecast(tenantId: string): Promise<PipelineForecast>

  // Called by agents at runtime — "should we contact this person right now?"
  async shouldContactNow(contactId: string): Promise<{ should: boolean; reason: string; betterTime?: string }>

  // Called by WorkingDripBot — optimal timing for next step
  async predictOptimalSendTime(contactId: string, stepNumber: number): Promise<Date>
}
```

**Prediction feeds directly into bot decisions at runtime.**
WorkingDripBot asks PredictionEngine for optimal send time before scheduling.
ResponseAgent checks lead prediction before deciding urgency of LM alert.

---

### Database Tables

```sql
-- Every bot run logged here
CREATE TABLE intelligence_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     TEXT NOT NULL,
  contact_id    TEXT NOT NULL,
  bot_name      TEXT NOT NULL,
  agent_name    TEXT NOT NULL,
  input_hash    TEXT NOT NULL,        -- hash of inputs for dedup
  input_summary JSONB NOT NULL,       -- key inputs (scenario, tier, source, hour, etc.)
  output        JSONB NOT NULL,       -- what the bot produced
  learning_version TEXT,              -- which LearningConfig version was active
  ran_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Significant outcomes — linked back to contact
CREATE TABLE outcome_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     TEXT NOT NULL,
  contact_id    TEXT NOT NULL,
  outcome_type  TEXT NOT NULL,        -- see OutcomeType enum below
  value         JSONB,                -- optional data (deal amount, response text, etc.)
  occurred_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- What the system has learned — updated by IntelligenceService
CREATE TABLE learning_config (
  tenant_id     TEXT PRIMARY KEY,
  version       TEXT NOT NULL,        -- bumped on every update
  config        JSONB NOT NULL,       -- see LearningConfig interface below
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Active A/B tests
CREATE TABLE ab_tests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     TEXT NOT NULL,
  bot_name      TEXT NOT NULL,
  parameter     TEXT NOT NULL,        -- what's being tested (e.g. 'messageTemplate')
  variant_a     JSONB NOT NULL,
  variant_b     JSONB NOT NULL,
  started_at    TIMESTAMPTZ NOT NULL,
  ends_at       TIMESTAMPTZ,
  winner        TEXT,                 -- 'a' | 'b' | null (still running)
  result_summary JSONB
);
```

### OutcomeType Enum
```typescript
type OutcomeType =
  | 'responded'           // contact replied to any outreach
  | 'responded_sms'       // specifically SMS response
  | 'responded_call'      // called us back
  | 'appointment_booked'  // booked a walkthrough
  | 'appointment_showed'  // actually showed up
  | 'offer_made'          // offer extended
  | 'offer_accepted'      // offer accepted
  | 'under_contract'      // deal under contract
  | 'closed'              // deal closed / purchased
  | 'lost'                // lead lost
  | 'dead'                // lead classified dead
  | 'opted_out'           // contact opted out
  | 'no_response_7d'      // no response after 7 days
  | 'no_response_30d'     // no response after 30 days
  | 'ghosted'             // hit ghosted threshold
```

### LearningConfig (what bots read)
```typescript
interface LearningConfig {
  version: string
  updatedAt: string

  messaging: {
    // Top performing message examples per scenario — injected as few-shot into MessageCrafterBot
    topExamples: {
      scenario: string              // 'inbound_warm_morning', 'outbound_ppl_afternoon', etc.
      messages: {
        text: string
        responseRate: number        // % that got a reply
        bookingRate: number         // % that led to appointment
        sampleSize: number
      }[]
    }[]

    // Best send times by scenario and contact timezone
    optimalSendWindows: {
      dayOfWeek: number             // 0-6
      hourStart: number             // local hour
      hourEnd: number
      responseRateMultiplier: number // vs baseline
    }[]

    // Phrases that correlate with low response — add to banned list
    lowPerformingPhrases: string[]
  }

  scoring: {
    // Factor weights — recalibrated based on actual close rates
    factorWeights: {
      timeline: number
      motivation: number
      price: number
      source: number
      condition: number
    }

    // What score tier actually predicts — may differ from initial config
    tierCloseRates: {
      hot: number                   // % of HOT leads that closed
      warm: number
    }

    // Source performance — which sources actually convert
    sourceConversionRates: Record<string, number>
  }

  callCoaching: {
    // Coaching points that correlated with score improvement — surfaces in CoachingBot
    effectiveFeedbackPatterns: {
      issue: string
      feedback: string
      avgScoreImprovementAfter: number
      sampleSize: number
    }[]

    // Rep-specific performance patterns — personalized coaching
    repProfiles: {
      userId: string
      commonWeaknesses: string[]
      avgScore: number
      trendDirection: 'improving' | 'declining' | 'stable'
      lastUpdated: string
    }[]
  }

  timing: {
    // How long leads typically sit before responding by source
    medianResponseTimeHours: Record<string, number>

    // Drip step timing that maximizes response rate
    optimalDripIntervals: {
      step: number
      waitHours: number
      responseRateAtThisStep: number
    }[]
  }
}
```

### IntelligenceService (runs on schedule)
```typescript
class IntelligenceService {

  // Runs daily — full analysis cycle
  async analyze(tenantId: string): Promise<LearningConfig>

  // Links outcomes back to bot runs that preceded them
  private async linkOutcomes(tenantId: string, windowDays: number): Promise<OutcomeLink[]>

  // Message performance analysis
  private async analyzeMessagePerformance(tenantId: string): Promise<MessagingLearnings>

  // Scoring calibration — are our scores actually predictive?
  private async calibrateScoring(tenantId: string): Promise<ScoringLearnings>

  // Call coaching effectiveness
  private async analyzeCoachingEffectiveness(tenantId: string): Promise<CoachingLearnings>

  // Drip timing optimization
  private async optimizeDripTiming(tenantId: string): Promise<TimingLearnings>

  // Flag anomalies for human review
  private async detectAnomalies(tenantId: string): Promise<Anomaly[]>
}
```

### How Each Bot Uses LearningConfig

**MessageCrafterBot**
```
1. Reads learning.messaging.topExamples for this scenario
2. Injects top 3 performing messages as few-shot examples in Gemini prompt
3. Reads learning.messaging.optimalSendWindows → adjusts timing recommendation
4. Checks learning.messaging.lowPerformingPhrases → adds to banned list
5. After sending → logs to intelligence_log with scenario/source/tier/hour context
```

**LeadScorerBot**
```
1. Reads learning.scoring.factorWeights → uses learned weights instead of defaults
2. Reads learning.scoring.sourceConversionRates → adjusts source factor score
3. After scoring → logs input summary + tier assignment to intelligence_log
```

**CallScorerBot**
```
1. Reads learning.callCoaching.repProfiles → personalizes scoring focus for this rep
2. Scores call → logs score + rep ID + key transcript signals
```

**CoachingBot**
```
1. Reads learning.callCoaching.effectiveFeedbackPatterns for identified weaknesses
2. Reads rep profile → surfaces personalized, pattern-backed coaching
3. After coaching delivered → logs coaching points to intelligence_log
```

**WorkingDripBot**
```
1. Reads learning.timing.optimalDripIntervals → uses learned step timing
2. After each step → logs step number + response outcome
```

### OutcomeLinker (how outcomes connect to runs)
```typescript
class OutcomeLinker {
  // When a contact responds, links to all bot runs from last 72h for that contact
  async linkResponse(contactId: string, responseAt: Date): Promise<void>

  // When deal closes, links back to all bot runs in the contact lifecycle
  async linkClose(contactId: string, closedAt: Date): Promise<void>

  // Called by ResponseAgent, PostCloseAgent, LeadLifecycleAgent
  // They log outcomes — OutcomeLinker does the attribution
}
```

### A/B Testing Framework
```typescript
class ABTestRunner {
  // Get which variant this contact should see (consistent per contact)
  static getVariant(botName: string, parameter: string, contactId: string): 'a' | 'b'

  // Log which variant was used
  static logVariant(testId: string, contactId: string, variant: 'a' | 'b'): Promise<void>

  // IntelligenceService calls this when a test has enough data
  static declareWinner(testId: string): Promise<ABTestResult>
}
```

Example: testing two message opening lines for PPL inbound leads.
Variant A: "Hey {name}, saw your request come through..."
Variant B: "Hi {name}, got your info..."
After 100 sends each → winner becomes the default in LearningConfig.

### Intelligence Dashboard (Gunner UI)
What Corey sees:
- Response rate by message scenario (trending up/down)
- Lead score accuracy (predicted vs actual close rate)
- Rep performance trends (who's improving, who's not)
- Drip step drop-off (where leads go cold in the sequence)
- Active A/B tests + current results
- Anomalies flagged for review (e.g. response rate dropped 40% this week)

---

## Summary: How Every Bot Gets Smarter

| Bot | Experience | Tests | Research | Memory | Awareness | Reasoning | Human Feedback | Prediction |
|---|---|---|---|---|---|---|---|---|
| MessageCrafterBot | Winning messages injected as examples | Banned phrase + hallucination check | Prompt variants tested weekly | Contact history informs tone | Response rate drops flagged | Resolves timing conflicts | Reps flag wrong tone | Predicts best send window |
| LeadScorerBot | Weights recalibrated vs close rates | Predicted tier vs outcome correlation | New factors researched | Full contact story informs score | Scoring drift detected | Resolves factor conflicts | Overrides feed training | Predicts close probability |
| CallScorerBot | Coaching vs score improvement tracked | Accuracy vs human-graded calls | Model upgrades benchmarked | Rep history personalizes focus | Rep decline trend detected | Weights coaching vs data | Reps flag wrong scores | Rep burnout risk forecast |
| CoachingBot | Which feedback changed behavior | Effectiveness vs score change | New frameworks researched | Rep profile informs coaching | Coaching gap pattern detected | Surfaces feedback conflicts | Managers confirm/override | Predicts rep trajectory |
| WorkingDripBot | Optimal step timing from patterns | Step response rate benchmarks | Interval variants A/B tested | Prior engagement informs timing | Dead drips flagged | Timing vs prediction resolved | Team flags bad timing | Predicts optimal send time |
| SentimentBot | Sentiment patterns per source | Accuracy vs labeled samples | Model drift detection | Tone shifts vs history | Tone pattern anomalies | Weights vs other signals | Corrections feed training | Predicts relationship trajectory |
| ConditionBot | Grade vs actual repair costs | Grade vs human-appraised correlation | New vision models benchmarked | Prior grades for same address | Coverage drop detected | Grade vs price factor resolved | Appraisers override grade | Predicts ARV range |
| MotivationAnalyzerBot | Signals vs actual conversion | Prediction accuracy vs outcomes | New signal patterns researched | Prior stated motivations surfaced | Motivation shift detected | Resolves with sentiment | Team flags wrong reads | Predicts decision timeline |

---

**Every bot starts with what we know.**
**Experience makes it better. Tests keep it honest. Research keeps it ahead.**
**Memory gives it context. Awareness keeps it alert. Reasoning keeps it coherent.**
**Human Feedback keeps it grounded. Prediction keeps it proactive.**

---

*Last updated: 2026-02-23*
*This document is the blueprint. Nothing gets built that contradicts it.*
