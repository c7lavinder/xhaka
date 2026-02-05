# GUNNER V1 LAUNCH — PRIORITY BLOCKERS

Manus, we're pushing to launch and get paying customers in the next 2 weeks. Credits are limited, so we need to focus on what's blocking revenue. Everything else waits.

---

## CRITICAL BLOCKERS (must complete first)

### 1. Multi-Tenancy
- Data isolation between customers — User A cannot see User B's calls
- Tenant-scoped dashboards
- Each customer's GHL OAuth token stored separately

### 2. Billing / Stripe — EXACT FLOW REQUIRED

```
Signup (email/password)
    ↓
6-step onboarding (company setup, connect GHL, build excitement)
    ↓
PAYWALL: "Start your 3-day free trial" — Stripe card entry required
    ↓
Card submitted → Trial starts → Dashboard unlocked
    ↓
Day 4: Auto-charge unless canceled
```

- User CANNOT access dashboard until card is entered
- Onboarding builds curiosity, paywall captures commitment
- 3 tiers: $99 / $249 / $499 per month
- Subscription management: upgrade, downgrade, cancel
- Failed payment handling (retry + dunning emails)

**This is not optional. No card = no dashboard. Period.**

### 3. Authentication
- Signup flow (email/password minimum)
- Login / logout
- Password reset
- Invite team members (if tier includes multiple seats)

### 4. Onboarding (6 steps before paywall)
- Step 1: Welcome / what to expect
- Step 2: Company name + basic info
- Step 3: Connect GHL via OAuth OR choose manual upload
- Step 4: Preview of what grading looks like (build excitement)
- Step 5: Quick win / show sample graded call
- Step 6: "Ready to start" — leads directly into paywall

User must complete onboarding → hit paywall → enter card → THEN access dashboard.

### 5. Legal Pages
- Terms of Service
- Privacy Policy
- Checkbox at signup agreeing to both

---

## NEXT PRIORITY (after blockers)

### 6. Email Notifications
- Welcome email on signup
- Trial ending reminder (day 2 of 3)
- Call graded notification
- Weekly summary email

---

## Questions I need answered

1. What's your realistic timeline for the 5 blockers above?
2. Is this flow crystal clear? Onboarding → Paywall → Card → Dashboard. No shortcuts.
3. What's currently built vs. what's missing?
4. Any blockers on your end?

Focus on blockers only — everything else is Phase 2. Let's get this live.
