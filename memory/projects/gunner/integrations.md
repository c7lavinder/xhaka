# Gunner — External Integrations

## 1. GoHighLevel (GHL)

### What It Does
GHL is the primary CRM integration. Gunner connects to GHL to:
- Receive call webhooks (when a call ends, GHL notifies Gunner)
- Resolve team members (GHL user ID → Gunner team member)
- Fetch contact names (GHL Contact API)
- Potentially sync opportunities and pipeline data

### Authentication: Dual-Mode
Gunner supports two GHL auth modes:
1. **Legacy API Key** — direct API key in `crmConfig` JSON per tenant
2. **OAuth 2.0 (GHL Marketplace App)** — preferred, handles token refresh automatically

### OAuth Token Flow (`server/ghlOAuth.ts`)
1. Tenant installs Gunner from GHL Marketplace
2. GHL redirects to Gunner's auth callback with authorization code
3. Gunner exchanges code for `access_token` + `refresh_token`
4. Tokens stored in `ghlOAuthTokens` table per tenant
5. Access tokens expire ~24 hours → Gunner auto-refreshes before expiry (5-min buffer)
6. **Refresh mutex** — per-tenant lock prevents race conditions (GHL refresh tokens are single-use)

### Key Endpoints Used
- `https://services.leadconnectorhq.com/oauth/token` — token exchange/refresh
- `https://marketplace.gohighlevel.com/oauth/chooselocation` — auth URL
- GHL Contact API — fetch contact names
- GHL Calls API — call recordings

### GHL Actions Layer (`server/ghl/`)
Split across 9 domain modules via barrel export:
- `core.ts` — `getCredentialsForTenant`, `ghlFetchWithFallback`, `fetchWithTimeout`
- `contacts.ts` — `searchContacts`, `getContact`, `addTag`, `removeTag`, `updateContact`
- `opportunities.ts` — deal/opportunity management
- `calendar.ts` — appointment booking
- `messages.ts` — SMS/email via GHL
- `notes.ts` — CRM notes
- `pipelines.ts` — pipeline/stage data
- `users.ts` — team user data

### GHL Service (`server/ghlService.ts`)
The main GHL service file — 2,121 lines (god file, known issue). Handles:
- `fetchGHLContactName` — contact name resolution
- Complex GHL API interactions with fallback auth (OAuth → API key)

### Current Status: ⚠️ DEGRADED
`GET /health` returns `{"status":"ok","crmStatus":"degraded"}`. This indicates the GHL CRM connection check is failing for one or more tenants, or the health check logic itself is erroring.

### Webhook Handler (`server/webhook.ts`)
- Receives GHL webhook events
- Normalizes event format (handles multiple GHL payload shapes)
- Resolves tenant by `locationId`
- Resolves team member by `ghlUserId` (primary) or name matching (fallback)
- Creates call record + queues for grading
- For calls without recording → creates "dial-attempt" record for activity tracking

---

## 2. Stripe (Billing)

### What It Does
Full subscription billing for the Gunner white-label platform.

### Plans (`server/stripe/products.ts`)
| Plan | Monthly | Yearly | Users | Calls/mo | CRM Integrations |
|------|---------|--------|-------|----------|-----------------|
| Starter | $199 | $1,990 | 3 | 500 | 1 |
| Growth | $499 | $4,990 | 10 | 2,000 | 2 |
| Scale | $999 | $9,990 | Unlimited | Unlimited | 5 |

**Trial:** 14 days free.

### Files
- `server/stripe/checkout.ts` — checkout session creation
- `server/stripe/products.ts` — plan definitions
- `server/stripe/webhook.ts` — Stripe event handling (subscription created/updated/deleted)
- `server/routers/tenant/billing.ts` — billing tRPC endpoints

### ENV Vars Needed
- `STRIPE_SECRET_KEY` — required in production
- `STRIPE_WEBHOOK_SECRET` — webhook validation

---

## 3. Deepgram (Voice Transcription)

### What It Does
Transcribes call recordings to text. Used in Step 2 of processCall().

### File
`server/_core/voiceTranscription.ts` — wrapper around Deepgram API

### Usage
```typescript
const result = await transcribeAudio({
  audioUrl: recordingUrl,
  language: "en",
  prompt: "Real estate sales call between a lead manager and a property seller..."
});
```

Returns: `{ text, durationSeconds, segments }` with timestamps per segment.

### Context
- Prompt guides Deepgram toward real estate vocabulary
- Segments used for call highlights (Step 11 of processCall)
- Duration recovered from transcription if GHL didn't provide it

---

## 4. Forge API / LLM Provider

### What It Does
All AI calls (grading, coaching, classification, highlights) go through the Forge API — an OpenAI-compatible wrapper.

### File
`server/_core/llm.ts` — `invokeLLM()` wrapper

### ENV Vars
- `BUILT_IN_FORGE_API_URL` — API endpoint
- `BUILT_IN_FORGE_API_KEY` — auth key

### Usage
Structured output (JSON schema) is used for all grading calls — enforces exact output shape, no hallucination on format.

---

## 5. Podio CRM

### What It Does
Alternative CRM integration for tenants not on GHL. Podio is the CRM for some wholesale real estate companies.

### Files
- `podioActions.ts` (1,241 lines) — Podio API actions
- `podioService.ts` (1,105 lines) — Podio API service
- `server/routers/tenant/podio.ts` — Podio tenant settings

### Status
⚠️ Partially built — waiting for a real Podio user to test against. Some UI conditionals deferred.

---

## 6. BatchDialer

### What It Does
Alternative dialer integration. BatchDialer is a power dialer platform.

### File
`server/_core/env.ts` — `batchDialerApiKey` in ENV

### Status
API key configured. Adapter deferred (waiting for real users).

---

## 7. Manus OAuth

### What It Does
Default auth provider. `openId` is the unique identifier per user.

### Flow
1. User visits Gunner
2. If `OAUTH_SERVER_URL` configured → redirect to Manus OAuth
3. Receive `openId` → upsert user record
4. Generate JWT session

### Files
`server/routers/auth.ts`, `server/_core/env.ts`

---

## 8. Google OAuth

### What It Does
"Sign in with Google" for self-serve signup flow.

### ENV Vars
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

---

## 9. Resend (Email)

### What It Does
Transactional email — verification emails, password reset, etc.

### File
`server/db/email.ts` — email send records

---

## 10. Cloudflare Turnstile

### What It Does
Bot protection on signup/login forms.

### File
`server/turnstile.ts`

### ENV Var
`TURNSTILE_SECRET_KEY`

---

## CRM Abstraction Layer

All CRM operations go through `server/crmActions.ts` — provider-agnostic:
- `crmCreateContact`
- `crmCreateOpportunity`
- `crmSendEmail`
- `crmGetPipelines`
- `crmSearchContacts`
- `crmSendSms`

Routes to GHL, Podio, or future adapters based on `tenant.crmType`.

New adapters: implement interface in `server/integrations/types.ts`, register in `server/integrations/registry.ts`.
