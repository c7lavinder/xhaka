# Sentry

**Category:** Observability
**Status:** 🟡 DSN Set Up — NOT Wired Into Gunner Codebase
**Last Updated:** 2026-03-14

## Purpose
Error tracking for Gunner production. Automatically captures runtime errors, API failures, and can create GitHub issues when production breaks.

## Current Status
- ✅ Sentry project created
- ✅ DSN available (in TOOLS.md)
- ❌ **NOT installed in Gunner codebase**
- ❌ No error capture happening
- ❌ No GitHub integration configured

**🚨 URGENT: Every production error in Gunner is invisible right now. Wire this in.**

---

## What Needs to Happen — Exact Steps

### Step 1: Install the SDK
```bash
# In Gunner's Next.js repo
npm install @sentry/nextjs
```

### Step 2: Run the Sentry Wizard (easiest path)
```bash
npx @sentry/wizard@latest -i nextjs
```
This auto-creates all config files. Answer the prompts with your DSN.

### Step 3: Manual Setup (if wizard fails)
Create these 3 files in the project root:

**`sentry.client.config.ts`** (browser errors)
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [Sentry.replayIntegration()],
});
```

**`sentry.server.config.ts`** (server-side / API route errors)
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
});
```

**`sentry.edge.config.ts`** (edge runtime, if used)
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
});
```

**`instrumentation.ts`** (in project root or `src/`)
```typescript
import * as Sentry from '@sentry/nextjs';
import type { Instrumentation } from 'next';

export const onRequestError: Instrumentation.onRequestError = (...args) => {
  Sentry.captureRequestError(...args);
};
```

### Step 4: Update `next.config.ts`
```typescript
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig = { /* your existing config */ };

export default withSentryConfig(nextConfig, {
  org: 'your-sentry-org',
  project: 'gunner',
  silent: true,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
});
```

### Step 5: Add ENV vars to Railway
```
NEXT_PUBLIC_SENTRY_DSN=https://bf7b317b546428d656836b66e2642c6c0e4511015785988096.ingest.us.sentry.io/4511015798243328
SENTRY_DSN=https://bf7b317b546428d656836b66e2642c6c0e4511015785988096.ingest.us.sentry.io/4511015798243328
SENTRY_AUTH_TOKEN=<get from sentry.io/settings/auth-tokens>
```

### Step 6: GitHub Integration
In Sentry → Settings → Integrations → GitHub:
- Connect `c7lavinder/xhaka` (or Gunner's repo)
- Enable "Create GitHub Issues" for new errors
- Set threshold: auto-create issue after 5+ occurrences

---

## What Sentry Captures Automatically (after wiring)

- Unhandled exceptions in API routes
- React component render errors (via error boundaries)
- Network request failures
- Performance traces for API calls
- User sessions with error replay

---

## What to Add Manually (High Value for Gunner)

```typescript
// 1. Catch errors in GHL webhook handler
try {
  await processGHLWebhook(payload);
} catch (error) {
  Sentry.captureException(error, {
    tags: { source: 'ghl_webhook', callId: payload.callId },
    extra: { payload }
  });
  throw error;
}

// 2. Track AI processing failures
Sentry.addBreadcrumb({
  message: 'Starting Whisper transcription',
  data: { callId, duration: call.duration }
});

// 3. Set user context for errors
Sentry.setUser({ id: userId, email: userEmail });
```

---

## Pricing

| Plan | Price | Events/Month | Notes |
|------|-------|-------------|-------|
| Free | $0 | 5k errors, 10k performance | Fine for early Gunner |
| Team | $26/mo | 50k errors | When you have paying customers |

Start on free. Upgrade when you hit limits.

---

## Smart Use Tips

1. **Source maps:** Enable source map upload in `withSentryConfig` — stack traces will show original TypeScript, not compiled JS. Essential for debugging prod.

2. **Sampling in production:** Set `tracesSampleRate: 0.1` in prod (10% of requests) to avoid blowing through free quota on performance traces. Keep error capture at 100%.

3. **GitHub integration = free oncall:** Once connected, Sentry auto-creates GitHub issues with full context when new errors hit. You won't need to manually check Sentry — just watch your GitHub issues.
