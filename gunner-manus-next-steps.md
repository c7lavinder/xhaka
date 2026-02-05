# Gunner White-Label — Next Build Phase

## What's Done (Great Work)

Reviewed the full app. The core is solid:

- ✅ Dashboard + gamification (XP, levels, streaks, badges)
- ✅ AI call grading with detailed feedback
- ✅ Analytics with leaderboards and trends
- ✅ Training section (AI insights, materials, role-specific rubrics)
- ✅ Team Management with role assignments
- ✅ Company Settings (name, URL, custom domain)
- ✅ Stripe billing working (plan display, usage tracking, cancel)
- ✅ GHL integration with team sync
- ✅ Per-role grading rubrics with point system

---

## What's Needed for White-Label Launch

### Priority 1: Self-Serve Signup Flow

Right now login goes through Manus OAuth. We need a public signup that anyone can use:

1. **Landing page at getgunner.ai** — Hero, features, pricing table, testimonials placeholder, "Start Free Trial" CTA
2. **Signup flow:**
   - Email + password (or keep Manus OAuth as option)
   - Select plan (Starter $99 / Growth $249 / Scale $499)
   - Stripe checkout
   - Account created → land in onboarding wizard
3. **Free trial option** — 14 days, card required upfront

### Priority 2: Onboarding Wizard

After signup, guide new customer through setup:

1. **Company info** — Name, timezone
2. **Connect CRM** — Start with GHL, show "coming soon" for others
3. **Define roles** — What roles exist on their team (default suggestions: SDR, Closer, etc.)
4. **Upload training materials** — Or skip for later
5. **Invite team** — Add team members by email, assign roles
6. **Done** — Land on dashboard

**Goal: Under 10 minutes from signup to first call graded.**

### Priority 3: Super Admin Dashboard

I need a view to manage the platform:

- List of all tenants (companies)
- MRR / ARR / new signups / churn
- Tenants with failed payments (flagged)
- Tenants with low usage (churn risk)
- Ability to access any tenant account (support mode)

This should be separate from regular company admin — maybe at admin.getgunner.ai or a /super-admin route with special access.

### Priority 4: Handle Plan Limits

The billing page shows "Unlimited" for Scale. Need to enforce limits for lower tiers:

| Plan | Price | Team Members | Calls/Month |
|------|-------|--------------|-------------|
| Starter | $99/mo | 3 | 500 |
| Growth | $249/mo | 10 | 2,000 |
| Scale | $499/mo | Unlimited | Unlimited |

- Show usage vs limit in billing
- Block adding team members over limit
- Soft cap on calls (warning at 80%, block at 100% or allow overage billing)

---

## Phase 2 (After Launch)

These can wait until we have paying customers:

1. **HubSpot integration** — Second CRM option
2. **Salesforce integration** — For bigger companies
3. **Knowledge base** — Help docs, FAQs, video tutorials
4. **Automated onboarding emails** — Welcome sequence, usage nudges
5. **Public status page** — status.getgunner.ai

---

## Questions

1. What's realistic timeline for Priorities 1-4?
2. Any blockers or concerns with the signup/billing flow?
3. Should we keep Manus OAuth as an option alongside email/password?
4. For super admin — do you want this as a separate app or route within Gunner?

---

Let me know timeline and any questions. Ready to move when you are.
