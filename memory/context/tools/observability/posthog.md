# PostHog

**Category:** Observability
**Status:** 🟡 Account Created — NOT Wired Into Gunner
**Last Updated:** 2026-03-14

## Purpose
Product analytics for Gunner — tracks how the NAH team uses Gunner, feature adoption, drop-offs, and engagement patterns.

## Current Status
- ✅ Account created (corey@newagainhouses.com)
- ✅ Project token available: `phc_FEpR6FvjwCN5ZqUDVn0Y9yCxdpCf7iXPQz1bUs07gcZ`
- ✅ Project ID: `336916`
- ❌ **NOT installed in Gunner codebase**
- ❌ Zero events flowing

**🚨 URGENT: You're flying blind on Gunner usage. You don't know which features the team uses, what they ignore, or where they drop off.**

---

## Quick Wiring — Gunner Next.js

### Install
```bash
npm install posthog-js posthog-node
```

### Client-side (React components / pages)
```typescript
// lib/posthog.ts
import posthog from 'posthog-js';

export function initPostHog() {
  if (typeof window !== 'undefined') {
    posthog.init('phc_FEpR6FvjwCN5ZqUDVn0Y9yCxdpCf7iXPQz1bUs07gcZ', {
      api_host: 'https://us.i.posthog.com',
      person_profiles: 'identified_only',
    });
  }
}

// In _app.tsx or layout.tsx
initPostHog();
```

### Server-side (API routes)
```typescript
import { PostHog } from 'posthog-node';

const posthog = new PostHog('phc_FEpR6FvjwCN5ZqUDVn0Y9yCxdpCf7iXPQz1bUs07gcZ', {
  host: 'https://us.i.posthog.com',
  flushAt: 20,
  flushInterval: 10000,
});

// Track an event
posthog.capture({
  distinctId: userId,
  event: 'call_graded',
  properties: { callId, grade, duration }
});
```

---

## Events to Track for a Call Coaching SaaS

These are the events that actually matter for Gunner. Prioritize in this order:

### Tier 1 — Must Have (wire these first)
```typescript
// User logs in
posthog.capture({ distinctId: userId, event: 'user_signed_in' });

// Rep views their call grade
posthog.capture({ distinctId: userId, event: 'call_grade_viewed', properties: {
  callId, grade, repId, duration
}});

// Rep plays back call recording
posthog.capture({ distinctId: userId, event: 'call_recording_played', properties: {
  callId, repId
}});

// Rep reads coaching feedback
posthog.capture({ distinctId: userId, event: 'coaching_feedback_read', properties: {
  callId, feedbackSectionId
}});
```

### Tier 2 — High Value
```typescript
// Manager views leaderboard
posthog.capture({ distinctId: userId, event: 'leaderboard_viewed' });

// Manager views rep's call history
posthog.capture({ distinctId: userId, event: 'rep_history_viewed', properties: { repId }});

// Call processed successfully (server-side)
posthog.capture({ distinctId: 'system', event: 'call_processed', properties: {
  callId, processingTimeMs, grade, transcriptTokens
}});

// Call processing failed (server-side)
posthog.capture({ distinctId: 'system', event: 'call_processing_failed', properties: {
  callId, error, stage  // stage: 'webhook' | 'transcription' | 'grading'
}});
```

### Tier 3 — Nice to Have
```typescript
// GHL webhook received
// Session duration
// Feature flags triggered
// Error boundaries hit
```

---

## Identify Users (Critical for Attribution)
```typescript
// On login / session start
posthog.identify(userId, {
  email: user.email,
  name: user.name,
  role: user.role,  // 'rep' | 'manager' | 'admin'
  team: 'NAH'
});
```

Without `identify()`, all events show as anonymous. Do this on login.

---

## Key Dashboards to Build in PostHog

1. **Daily Active Users** — is the team actually logging in?
2. **Calls Graded Per Day** — is Gunner processing calls?
3. **Average Grade Trend** — is team improving week over week?
4. **Feature Funnel:** Sign in → View Dashboard → View Call Grade → Read Feedback
5. **Rep Engagement Heatmap** — which reps review their grades vs ignore them?

---

## Pricing

| Plan | Price | Events/Month | Notes |
|------|-------|-------------|-------|
| Free | $0 | 1M events | More than enough for NAH team |
| Scale | $0 + usage | Beyond 1M | Pay-as-you-go |

NAH team is ~5 people using Gunner. At 50 events/session/day, that's ~7,500 events/month. **Free plan is more than sufficient.**

---

## Smart Use Tips

1. **Session recordings:** PostHog includes session recording (like FullStory) on the free plan. Enable it to see exactly how reps interact with Gunner UI — invaluable for UX decisions.

2. **Feature flags:** PostHog has built-in feature flags. Use this to roll out new Gunner features to one rep first before releasing to the whole team.

3. **Correlation with Sentry:** When Sentry captures an error, you can cross-reference with PostHog session replays by timestamp to see exactly what the user was doing. Combine both tools.
