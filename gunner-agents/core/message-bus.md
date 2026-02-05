# Message Bus

Agent communication layer. Enables agents to send messages, share state, and coordinate work.

## Design

Each tenant has isolated message channels. Agents within a tenant can communicate; agents across tenants cannot.

```
Message Bus
├── tenant_abc123/
│   ├── lead-qualification/
│   │   ├── coordinator
│   │   ├── data-enricher
│   │   ├── qualifier
│   │   ├── router
│   │   ├── watchdog
│   │   └── qa-reviewer
│   └── kpi-monitor/
│       └── ...
└── tenant_def456/
    └── ...
```

## Message Format

```json
{
  "id": "msg_xxx",
  "timestamp": "2026-02-05T12:00:00Z",
  "tenantId": "tenant_abc123",
  "addOn": "lead-qualification",
  "from": "coordinator",
  "to": "data-enricher",
  "type": "task",
  "payload": {
    "action": "enrich_lead",
    "leadId": "contact_123",
    "propertyAddress": "123 Main St, Nashville TN"
  },
  "replyTo": "msg_xxx",
  "priority": "normal"
}
```

## Message Types

| Type | Purpose |
|------|---------|
| `task` | Request an agent to do work |
| `result` | Response with completed work |
| `status` | Progress update |
| `error` | Something went wrong |
| `alert` | Human attention needed |

## Communication Patterns

### Request/Response
```
Coordinator → DataEnricher: "Enrich this lead"
DataEnricher → Coordinator: "Here's the data"
```

### Broadcast
```
Coordinator → [All]: "New lead received, starting workflow"
```

### Chain
```
Coordinator → DataEnricher → Qualifier → Router → GHL
```

## Message Persistence

All messages logged for:
1. **Debugging** - What went wrong?
2. **Audit Trail** - What did agents decide and why?
3. **Training** - Improve agents based on patterns
4. **Customer Visibility** - Show agent conversations in UI

### Retention
- Active conversations: Real-time
- Completed workflows: 90 days
- Archived: 1 year (compressed)

## Implementation Options

| Option | Pros | Cons |
|--------|------|------|
| Redis Pub/Sub | Fast, simple | No persistence |
| PostgreSQL + polling | Durable, queryable | Slower |
| RabbitMQ | Purpose-built, reliable | Extra infra |
| In-memory (dev) | Zero setup | No durability |

**Recommendation:** PostgreSQL for MVP (already have it for Gunner), migrate to RabbitMQ if scale demands.
