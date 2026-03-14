# PostHog

**Category:** Analytics
**Status:** ⚠️ Account created — NOT wired into Gunner codebase

## Purpose
User analytics for Gunner. Tracks how team uses the platform, feature usage, drop-offs, engagement.

## Current State
- Account: posthog.com (corey@newagainhouses.com, Google auth)
- Project Token: `phc_FEpR6FvjwCN5ZqUDVn0Y9yCxdpCf7iXPQz1bUs07gcZ`
- Project ID: `336916`
- Region: US Cloud
- Status: PROJECT CREATED. Zero events being captured. Not installed in Gunner.

## What to Track for a Coaching SaaS
Priority events to wire first:
- `call_graded` — {teamMemberId, score, grade, callType, duration}
- `coach_message_sent` — {userId, questionLength, responseTime}
- `leaderboard_viewed` — {userId, timeOnPage}
- `feedback_submitted` — {callId, rating}
- `login` — {userId, role}

## What You Get When Wired
- Which features team actually uses vs ignores
- Drop-off points in the coaching flow
- Most active users (and who's disengaged)
- Feature flags for gradual rollouts

## Smart Tip
PostHog has session recording — you can watch actual user sessions. Invaluable for understanding where the UX breaks before users complain.

## Configuration
- Token in Railway env vars when ready
- Docs: https://posthog.com/docs
