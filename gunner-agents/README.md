# Gunner Agent Add-ons

Multi-tenant AI agent system for Gunner SaaS platform.

## Architecture

```
gunner-agents/
├── core/                       # Shared infrastructure (all tenants)
│   ├── message-bus.md          # Agent communication layer
│   ├── agent-runner.md         # Execution engine
│   ├── ghl-connector.md        # GoHighLevel API integration
│   ├── tenant-manager.md       # Multi-tenancy & billing gates
│   └── schemas/                # Shared data schemas
│
├── add-ons/                    # Purchasable modules
│   ├── lead-qualification/     # Lead IQ - $49/mo
│   ├── comp-analysis/          # Comp Agent - $79/mo
│   ├── coaching/               # Coaching Bot - $49/mo
│   ├── dispo/                  # Dispo Assist - $49/mo
│   └── kpi-monitor/            # Ops Monitor - $29/mo
│
└── docs/                       # Documentation
    ├── setup-guide.md
    ├── tenant-onboarding.md
    └── api-reference.md
```

## Design Principles

1. **Tenant Isolation** - Each customer's data completely separated
2. **Single Source of Truth** - Rules live in config files, not hardcoded
3. **Billing-Gated** - Add-ons only run for paying tenants
4. **GHL-First** - Built around GoHighLevel as primary CRM
5. **Observable** - Full audit trail of agent decisions and actions

## Add-on Lifecycle

```
Tenant purchases add-on
        ↓
Stripe confirms payment
        ↓
Tenant configures rules (UI or defaults)
        ↓
Tenant connects GHL (OAuth)
        ↓
Agent runner activates for tenant
        ↓
Webhooks flow → Agents process → Actions execute
        ↓
[If billing lapses]
        ↓
Agent runner deactivates
        ↓
[If billing restored]
        ↓
Agent runner reactivates
```

## Scaling Target

- 100+ tenants
- 20,000+ events/day across all tenants
- <30 second processing time per event
- 99.9% uptime

## Development Status

| Add-on | Status | Est. Completion |
|--------|--------|-----------------|
| Lead Qualification | 🔨 Building | TBD |
| Comp Analysis | ⏳ Queued | TBD |
| Coaching | ⏳ Queued | TBD |
| Dispo | ⏳ Queued | TBD |
| KPI Monitor | ⏳ Queued | TBD |
