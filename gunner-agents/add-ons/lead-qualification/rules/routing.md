# Lead Routing Rules

Single source of truth for lead assignment.

## Current Team (NAH)

| Role | Person | GHL User ID | Handles |
|------|--------|-------------|---------|
| Lead Manager (Qual) | Daniel Lozano | TBD | All new lead qualification |
| Acquisition Manager | Kyle Barks | TBD | Appointments, offers, negotiations |
| Lead Manager | Chris Segura | TBD | (Not currently doing new qual) |
| Dispo Manager | Esteban | TBD | Buyer side |
| Data Manager | Jessica | TBD | KPI entry, routing |
| Owner | Corey Lavinder | TBD | Escalations, strategy |

## Routing Logic

### All New Leads
```
New lead arrives
    ↓
Score lead (HOT or WARM)
    ↓
Assign to: Daniel (only LM doing qualification)
    ↓
Create task with appropriate priority
```

### Task Creation

| Score | Task Title | Due In |
|-------|------------|--------|
| HOT | "🔥 Priority Call - HOT Lead" | 15 minutes |
| WARM | "📞 Call - WARM Lead" | 15 minutes |

### Future: Multi-LM Routing

When team scales to multiple LMs doing qualification:

```python
def assign_lead(score, available_lms):
    # Filter LMs with capacity
    lms_with_capacity = [lm for lm in available_lms if lm.open_tasks < 10]
    
    if not lms_with_capacity:
        # All LMs maxed - escalate
        alert_manager("All LMs at capacity")
        return least_loaded_lm(available_lms)
    
    # Round-robin assignment
    next_lm = get_next_in_rotation(lms_with_capacity)
    increment_rotation()
    
    return next_lm
```

## No-Answer Handling

If lead doesn't answer first call:
1. Log call attempt in GHL
2. Trigger "Working Drip" workflow
3. Working Drip sends SMS/email sequence
4. Drip stops when lead replies

**Workflow Location:** CRM Drips folder → "Working Drip"

## Weekend Handling

| Day | Behavior |
|-----|----------|
| Mon-Fri | Normal SLA (15 min) |
| Sat-Sun | No calls, immediate auto-response |

### Weekend Lead Flow
```
Weekend lead arrives
    ↓
Send immediate SMS: "Thanks for reaching out! We received your info 
and will call you first thing Monday morning."
    ↓
Send immediate email: Similar message with more detail
    ↓
Create task (will be overdue Monday AM)
    ↓
Tag: "weekend-lead"
    ↓
Monday 8 AM: Weekend leads sorted to top of call list
```

## Escalation Rules

| Condition | Escalate To | Method |
|-----------|-------------|--------|
| No call attempt in 30 min (weekday) | Corey | Telegram alert |
| Lead replies but no response in 1 hour | Corey | Telegram alert |
| LM marks lead as "needs AM" | Kyle | GHL task + notification |
| Appointment set | Kyle | GHL notification |

## GHL Updates on Assignment

When routing a lead, update GHL:

```json
{
  "tags": ["lead-iq-processed", "hot" or "warm"],
  "customFields": {
    "lead_score": "HOT",
    "score_factors": "Timeline ✓, Motivation ✓, Condition ✓",
    "assigned_at": "2026-02-05T12:00:00Z",
    "assigned_by": "Lead IQ Agent"
  },
  "assignedTo": "daniel_user_id",
  "task": {
    "title": "🔥 Priority Call - HOT Lead",
    "dueDate": "+15 minutes",
    "assignedTo": "daniel_user_id"
  }
}
```
