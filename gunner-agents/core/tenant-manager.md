# Tenant Manager

Handles multi-tenancy, billing gates, and tenant configuration.

## Responsibilities

1. **Tenant Registry** - Track all active tenants and their subscriptions
2. **Billing Gates** - Check if tenant is authorized for each add-on
3. **Configuration Store** - Manage tenant-specific rule configurations
4. **GHL Credentials** - Securely store OAuth tokens per tenant

## Data Model

### Tenant Record
```json
{
  "tenantId": "tenant_abc123",
  "companyName": "New Again Houses Nashville",
  "createdAt": "2026-02-05T12:00:00Z",
  "billing": {
    "stripeCustomerId": "cus_xxx",
    "status": "active",
    "plan": "growth",
    "addOns": ["lead-qualification", "kpi-monitor"]
  },
  "ghl": {
    "locationId": "hmD7eWGQJE7EVFpJxj4q",
    "accessToken": "encrypted_xxx",
    "refreshToken": "encrypted_xxx",
    "tokenExpiresAt": "2026-02-06T12:00:00Z"
  },
  "settings": {
    "timezone": "America/Chicago",
    "alertChannel": "telegram",
    "alertTarget": "8031111945"
  }
}
```

### Add-on Authorization Check
```python
def is_addon_authorized(tenant_id: str, addon_name: str) -> bool:
    tenant = get_tenant(tenant_id)
    
    # Check billing status
    if tenant.billing.status != "active":
        return False
    
    # Check if add-on is purchased
    if addon_name not in tenant.billing.addOns:
        return False
    
    # Check GHL connection
    if not tenant.ghl.accessToken:
        return False
    
    return True
```

## Billing Events (Stripe Webhooks)

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Create tenant, enable purchased add-ons |
| `customer.subscription.updated` | Update add-on list |
| `customer.subscription.deleted` | Disable all add-ons |
| `invoice.payment_failed` | Mark billing status as "past_due" |
| `invoice.paid` | Restore billing status to "active" |

## Grace Period

When payment fails:
1. Immediately: Mark status as `past_due`
2. Day 1-3: Agents continue running (grace period)
3. Day 3: Send warning email
4. Day 7: Disable all add-ons
5. Day 30: Archive tenant data

## Configuration Isolation

Each tenant has isolated configuration:
```
/tenant-configs/
  /tenant_abc123/
    lead-qualification.json
    comp-analysis.json
    ...
  /tenant_def456/
    lead-qualification.json
    ...
```

Agents ONLY read their tenant's config. No cross-contamination.
