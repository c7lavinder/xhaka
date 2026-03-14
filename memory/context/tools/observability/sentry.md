# Sentry

**Category:** Observability
**Status:** ⚠️ Account created — NOT wired into Gunner codebase

## Purpose
Error tracking for Gunner. When prod breaks, Sentry catches it and can auto-create GitHub issues.

## Current State
- Account: sentry.io (corey@newagainhouses.com)
- DSN: `https://bf7b317b546428d656836b66e2642c6c0e4511015785988096.ingest.us.sentry.io/4511015798243328`
- Status: PROJECT CREATED. Zero errors being captured. Not installed in Gunner.

## What Needs to Happen
1. `npm install @sentry/node` in Gunner
2. Initialize in `server/index.ts`: `Sentry.init({ dsn: '...', environment: 'production' })`
3. Add error handler middleware after all routes
4. Test by triggering a known error

## What You Get When Wired
- Every unhandled error in production captured with stack trace
- Alerts to email/Slack when new errors appear
- Error frequency tracking — see if a bug is getting worse
- Performance monitoring (slow API routes)

## Gotchas
- Free tier: 5k errors/month. More than enough for current Gunner volume.
- Source maps needed for meaningful stack traces in minified JS.

## Smart Tip
Add `Sentry.captureException(error)` in the grading pipeline catch blocks first. That's where most Gunner failures happen and where you want visibility fastest.
