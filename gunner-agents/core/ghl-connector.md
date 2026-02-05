# GHL Connector

GoHighLevel API integration layer. Handles authentication, API calls, and webhooks for all tenants.

## Responsibilities

1. **OAuth Management** - Token storage, refresh, re-auth prompts
2. **API Client** - Read/write contacts, opportunities, tasks, etc.
3. **Webhook Receiver** - Receive and route GHL events to correct tenant/agent
4. **Rate Limiting** - Respect GHL API limits, queue requests

## OAuth Flow

```
Tenant clicks "Connect GHL" in Gunner
        ↓
Redirect to GHL OAuth consent screen
        ↓
User authorizes Gunner app
        ↓
GHL redirects back with auth code
        ↓
Exchange code for access_token + refresh_token
        ↓
Store tokens (encrypted) in tenant record
        ↓
Connector ready to make API calls
```

## Token Refresh

```python
def get_valid_token(tenant_id: str) -> str:
    tenant = get_tenant(tenant_id)
    
    if tenant.ghl.tokenExpiresAt > now():
        return tenant.ghl.accessToken
    
    # Token expired, refresh it
    new_tokens = ghl_refresh_token(tenant.ghl.refreshToken)
    
    update_tenant_tokens(tenant_id, new_tokens)
    
    return new_tokens.accessToken
```

## API Operations

### Read Operations
| Operation | GHL Endpoint | Use Case |
|-----------|--------------|----------|
| Get Contact | `GET /contacts/{id}` | Pull lead details |
| Search Contacts | `GET /contacts/search` | Find by phone/email |
| Get Opportunity | `GET /opportunities/{id}` | Deal details |
| List Opportunities | `GET /opportunities` | Pipeline queries |
| Get Pipeline | `GET /pipelines/{id}` | Stage definitions |

### Write Operations
| Operation | GHL Endpoint | Use Case |
|-----------|--------------|----------|
| Update Contact | `PUT /contacts/{id}` | Add tags, custom fields |
| Create Task | `POST /tasks` | Assign follow-up |
| Move Opportunity | `PUT /opportunities/{id}` | Change pipeline stage |
| Add Note | `POST /contacts/{id}/notes` | Log agent reasoning |
| Send SMS | `POST /conversations/messages` | Outbound messaging |

## Webhook Handling

### Webhook URL
```
https://api.getgunner.ai/webhooks/ghl/{tenant_id}
```

### Supported Events
| Event | Trigger | Agent Action |
|-------|---------|--------------|
| `contact.created` | New lead | Start Lead Qualification |
| `opportunity.stage_changed` | Pipeline move | Trigger relevant workflow |
| `task.completed` | Task done | Update workflow state |
| `contact.tag_added` | Tag applied | Conditional routing |

### Event Router
```python
def handle_webhook(tenant_id: str, event: dict):
    # Check tenant is active
    if not is_tenant_active(tenant_id):
        return
    
    # Route to correct add-on based on event type
    if event.type == "contact.created":
        if is_addon_authorized(tenant_id, "lead-qualification"):
            route_to_addon(tenant_id, "lead-qualification", event)
    
    elif event.type == "opportunity.stage_changed":
        # Multiple add-ons might care about this
        for addon in get_active_addons(tenant_id):
            if addon.handles_event(event.type):
                route_to_addon(tenant_id, addon.name, event)
```

## Rate Limiting

GHL API limits: ~100 requests/minute per location

```python
class RateLimiter:
    def __init__(self, tenant_id: str):
        self.tenant_id = tenant_id
        self.window = 60  # seconds
        self.max_requests = 100
        self.queue = []
    
    async def request(self, method, endpoint, data=None):
        await self.wait_for_slot()
        return await self.execute(method, endpoint, data)
```

## Error Handling

| Error | Action |
|-------|--------|
| 401 Unauthorized | Attempt token refresh, then re-auth prompt |
| 429 Rate Limited | Queue and retry with backoff |
| 500 Server Error | Retry 3x with backoff, then alert |
| Connection Error | Retry 3x, then mark tenant GHL as "disconnected" |
