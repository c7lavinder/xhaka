# Agent Runner

Execution engine for all agents. Manages agent lifecycle, coordinates workflows, handles errors.

## Responsibilities

1. **Agent Instantiation** - Spin up agents for each tenant/add-on
2. **Workflow Orchestration** - Coordinate multi-agent workflows
3. **State Management** - Track workflow progress
4. **Error Recovery** - Handle failures gracefully
5. **Observability** - Log everything for debugging/audit

## Architecture

```
Agent Runner
├── Scheduler
│   └── Polls for pending work
├── Executor Pool
│   └── Runs agent logic (AI calls, tool use)
├── State Store
│   └── Tracks workflow progress
└── Logger
    └── Records all activity
```

## Agent Definition

Each agent is defined declaratively:

```json
{
  "name": "data-enricher",
  "addOn": "lead-qualification",
  "description": "Enriches leads with property data from external sources",
  "triggers": ["task:enrich_lead"],
  "tools": ["ghl_read", "propstream_lookup", "zillow_lookup"],
  "model": "claude-sonnet",
  "systemPrompt": "You are a data enrichment agent...",
  "timeout": 60,
  "retries": 2
}
```

## Workflow Execution

### Event-Driven Flow
```
1. GHL webhook fires (new lead)
        ↓
2. Event router sends to Lead Qualification
        ↓
3. Coordinator agent receives, plans workflow
        ↓
4. Coordinator dispatches tasks to workers
        ↓
5. Workers execute in parallel where possible
        ↓
6. Results flow back to Coordinator
        ↓
7. Coordinator makes final decision, updates GHL
        ↓
8. Workflow marked complete
```

### State Machine
```
PENDING → RUNNING → COMPLETED
              ↓
           FAILED → RETRYING → COMPLETED
                        ↓
                    DEAD_LETTER (alert human)
```

## Concurrency Model

- **Per-tenant isolation**: Tenant A's agents don't block Tenant B
- **Per-workflow isolation**: Lead #1 workflow doesn't block Lead #2
- **Parallel workers**: Within a workflow, independent tasks run in parallel

```python
async def run_workflow(tenant_id: str, workflow_id: str, event: dict):
    # Create workflow state
    state = create_workflow_state(tenant_id, workflow_id)
    
    # Run coordinator
    coordinator = get_agent(tenant_id, "coordinator")
    plan = await coordinator.plan(event)
    
    # Execute tasks (parallel where possible)
    for task_group in plan.task_groups:
        results = await asyncio.gather(*[
            execute_task(tenant_id, task) 
            for task in task_group
        ])
        state.update(results)
    
    # Final decision
    decision = await coordinator.decide(state)
    
    # Execute actions
    await execute_actions(tenant_id, decision.actions)
    
    # Mark complete
    complete_workflow(workflow_id)
```

## Error Handling

### Retry Strategy
```python
@retry(max_attempts=3, backoff=exponential(base=2))
async def execute_task(tenant_id: str, task: Task):
    try:
        return await task.execute()
    except RateLimitError:
        raise Retry(delay=60)
    except AuthError:
        await refresh_token(tenant_id)
        raise Retry(delay=5)
    except Exception as e:
        log_error(tenant_id, task, e)
        raise
```

### Dead Letter Queue
Tasks that fail all retries go to dead letter queue:
- Alert tenant admin
- Log full context for debugging
- Allow manual retry or skip

## Observability

### Logs
Every agent action logged:
```json
{
  "timestamp": "2026-02-05T12:00:00Z",
  "tenantId": "tenant_abc123",
  "workflowId": "wf_xxx",
  "agent": "qualifier",
  "action": "score_lead",
  "input": {"leadId": "contact_123"},
  "output": {"score": "HOT", "factors": {...}},
  "durationMs": 1250,
  "tokensUsed": 450
}
```

### Metrics
- Workflows completed per hour (by tenant, by add-on)
- Average workflow duration
- Error rate
- AI token consumption
- GHL API calls

### Dashboards
- Real-time workflow monitor
- Error rate alerts
- Cost tracking (AI + API)
