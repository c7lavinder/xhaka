# Railway

**Category:** Dev Infrastructure
**Status:** 🟢 Active
**Last Updated:** 2026-03-14

## Purpose
Cloud hosting platform for all Xhaka and Gunner services. Auto-deploys on GitHub push with watch path filtering.

## Usage in Stack
- **Xhaka:** xhaka-intelligence, xhaka-control-room, xhaka (showcase)
- **Gunner:** gunner-v2 (backend), gunner-postgres (DB)
- See TOOLS.md for service IDs and Railway API token

---

## Current Pricing (2026)

| Plan | Monthly Fee | Free Credits | Sleep Behavior |
|------|-------------|-------------|----------------|
| **Free** | $0 | $1/month | ✅ Services sleep after inactivity |
| **Hobby** | $5/month | $5 credit included | ❌ No sleep (always on) |
| **Pro** | $20/month | $5 credit included | ❌ No sleep |
| **Enterprise** | Custom | Custom | ❌ No sleep |

**Resource billing (above free credits):**
- vCPU: ~$0.000463/vCPU/minute
- RAM: ~$0.000231/GB/minute
- Egress: $0.10/GB after 100GB

**Hobby plan math:** $5/month fee + $5 credit = effectively $10 of compute before you pay extra. A small Node.js service (0.5 vCPU, 512MB) costs ~$5-8/month on Hobby. **You're likely running in the free credit range.**

---

## Sleep Behavior

**Free tier only — Hobby/Pro services do NOT sleep.**

On the free tier:
- Services sleep after ~10 minutes of no incoming HTTP requests
- Cold start on next request: 10-30 seconds
- **Gunner webhook receiver cannot be on free tier** — GHL webhooks will time out during cold start

⚠️ **Verify:** Confirm all production services are on Hobby or Pro. The Gunner backend receiving GHL webhooks MUST stay awake.

---

## Healthcheck Config

Railway uses healthchecks to determine if a deployment is ready. Configure in `railway.toml` or via Dashboard:

```toml
[deploy]
healthcheckPath = "/health"
healthcheckTimeout = 300  # seconds to wait before marking failed
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3
```

Add a simple `/health` endpoint to Gunner backend:
```typescript
app.get('/health', (req, res) => res.json({ status: 'ok', ts: Date.now() }));
```

Without a healthcheck, Railway deploys immediately even if the app is still initializing (DB connections, etc.). With healthcheck, traffic only routes after the endpoint responds 200.

---

## Environment Variable Management

### Best Practices
1. **Never hardcode secrets** — always use Railway env vars
2. **Shared Variables:** Railway supports linking env vars across services in the same project. Set `DATABASE_URL` once at the project level and reference it in all services.
3. **Reference syntax:** `${{shared.DATABASE_URL}}` in service env vars to reference project-level vars

### Railway CLI (useful for Xhaka Operator agent)
```bash
# Install
npm i -g @railway/cli

# Login
railway login

# Link to project
railway link

# View current env vars
railway variables

# Set a variable
railway variables set KEY=value

# Open shell in deployed service
railway shell
```

### API Access (already have token in TOOLS.md)
```bash
# Get service env vars via API
GET https://backboard.railway.app/graphql/v2
Authorization: Bearer <token>
# Use GraphQL queries for service management
```

---

## Deployment Config

Railway uses `railway.toml` in the repo root (or per-service directory):

```toml
[build]
builder = "NIXPACKS"  # or DOCKERFILE

[deploy]
startCommand = "node dist/index.js"
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
```

**Watch paths** (defined in Dashboard → Service → Settings → Source):
- Set watch paths to only redeploy when relevant files change
- e.g., Gunner backend: `/apps/gunner/**` — avoids redeploying on dashboard-only changes

---

## Known Gotchas

1. **Build cache:** Railway caches node_modules aggressively. If you change package.json but builds still use old deps, force a fresh deploy by clearing build cache in Dashboard → Service → Settings.

2. **Port binding:** Railway injects `PORT` env var. Your app MUST listen on `process.env.PORT` (not hardcoded 3000). 
   ```typescript
   app.listen(process.env.PORT || 3000)
   ```

3. **Nixpacks detection:** Railway auto-detects Node.js projects. If it picks the wrong build command, override in `railway.toml` `startCommand`.

4. **Volume persistence:** Railway volumes persist between deploys but are NOT backed up by default. Don't store anything critical on Railway volumes without a backup strategy.

5. **Free tier removal:** Railway removed their completely free tier in mid-2023 — you need at least a Hobby plan ($5/mo) for production services. Free trial gives $5 credit for new accounts.

---

## Smart Use Tips

1. **Use Railway's built-in Postgres** instead of self-managed for small services. It's $0.000231/GB/min — a 1GB DB costs ~$10/month. vs Supabase free tier (500MB, fine for Gunner at early stage).

2. **Deploy previews:** Railway can auto-deploy PRs to ephemeral environments. Useful for testing Gunner changes before merging to main.

3. **Private networking:** Services in the same Railway project can communicate via private network (no egress charges). Use `service.railway.internal` hostnames instead of public URLs for inter-service calls.

4. **Metrics built-in:** Railway Dashboard shows CPU, memory, and request metrics per service without any extra setup. Check this before adding heavy observability tooling.
