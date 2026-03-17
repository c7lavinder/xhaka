# Gunner — Feature Inventory

## ✅ Core Features (Working)

### 1. Automatic Call Grading
- **What:** GHL webhook fires on call end → transcription → classification → AI grade
- **File:** `server/grading.ts:processCall()` (17 steps)
- **Status:** ✅ Working

### 2. Role-Specific Rubrics
- **What:** 6 different scorecards based on call type
- **File:** `server/grading.ts` — `LEAD_MANAGER_RUBRIC`, `ACQUISITION_MANAGER_RUBRIC`, `LEAD_GENERATOR_RUBRIC`, `FOLLOW_UP_RUBRIC`, `SELLER_CALLBACK_RUBRIC`, `ADMIN_CALLBACK_RUBRIC`, `DISPO_MANAGER_RUBRIC`
- **Status:** ✅ Working

### 3. AI Coaching Feedback
- **What:** Per-call coaching: strengths, improvements, tips, red flags, objection suggestions
- **File:** `server/grading.ts:gradeCall()`
- **Status:** ✅ Working

### 4. Call Inbox
- **What:** Per-rep inbox showing all graded calls, filter by outcome/type/grade
- **File:** `client/src/pages/CallInbox.tsx`, `server/routers/calls.ts`
- **Status:** ✅ Working

### 5. Call Detail View
- **What:** Full call detail: transcript, grade, per-criterion scores, highlights, coaching
- **File:** `client/src/pages/CallDetail.tsx`
- **Status:** ✅ Working

### 6. Leaderboard
- **What:** Team ranking by call grades, gamification stats
- **File:** `client/src/pages/Leaderboard.tsx`, `server/db/analytics.ts`
- **Status:** ✅ Working

### 7. Gamification (XP + Badges + Streaks)
- **What:** Reps earn XP per graded call, unlock badges for performance milestones, maintain daily streaks
- **File:** `server/gamification.ts`, `server/routers/gamification.ts`
- **Badges:** Universal: On Fire 🔥, Comeback Kid 💪, Consistency King 📅. LM-specific, AM-specific, LG-specific
- **Status:** ✅ Working

### 8. AI Coach Chat
- **What:** Interactive chat coach that knows your history, past calls, scores — gives personalized advice
- **File:** `server/routers/coach.ts`, `client/src/pages/Training.tsx`
- **Status:** ✅ Working

### 9. Multi-Tenancy
- **What:** Full tenant isolation — each company gets their own data, config, playbook
- **File:** `server/tenant.ts`, `drizzle/schema.ts` (tenants table)
- **Status:** ✅ Working

### 10. GHL OAuth Integration
- **What:** GHL Marketplace app OAuth flow — authorize → get token → refresh automatically
- **File:** `server/ghlOAuth.ts`
- **Features:** Per-tenant refresh mutex (prevents race conditions on single-use refresh tokens)
- **Status:** ✅ Working (CRM degraded in prod — see known-issues.md)

### 11. Stripe Billing
- **What:** Subscription management — Starter $199/mo, Growth $499/mo, Scale $999/mo
- **File:** `server/stripe/checkout.ts`, `server/stripe/products.ts`, `server/stripe/webhook.ts`
- **Plans:** Starter (3 users, 500 calls/mo), Growth (10 users, 2K calls/mo), Scale (unlimited)
- **Trial:** 14-day free trial
- **Status:** ✅ Configured

### 12. Playbook System
- **What:** Per-tenant playbook configuration — methodology, rubrics, terminology, KPI targets
- **File:** `server/playbooks.ts`, `shared/playbooks.ts`, `client/src/pages/PlaybookHub.tsx`
- **Status:** ✅ Working

### 13. KPI Tracking
- **What:** Manual KPI entry, funnel counts, scoreboard, source breakdown
- **File:** `server/routers/kpi.ts`, `client/src/pages/KpiPage.tsx`
- **Status:** ✅ Working

### 14. Analytics Dashboard
- **What:** Call stats, weekly trends, team scores, call outcome breakdown
- **File:** `client/src/pages/Analytics.tsx`, `server/db/analytics.ts`
- **Status:** ✅ Working

### 15. RAG-Powered Semantic Search
- **What:** Every graded call is embedded and indexed. AI coach can reference similar past calls.
- **File:** `server/rag/` (embedding.ts, retrieval.ts, ingestion.ts, actionTracking.ts)
- **Status:** ✅ Working

### 16. Call Highlights
- **What:** AI-extracted key moments from call with timestamps, quotes, insights
- **File:** `server/grading.ts` Step 11
- **Status:** ✅ Working

### 17. Next Steps Auto-Generation
- **What:** After grading, AI auto-generates actionable next steps for the rep
- **File:** `server/grading.ts` Step 10
- **Status:** ✅ Working

### 18. Skill Score Tracking
- **What:** Per-rep, per-criterion rolling average scores (e.g. "Rapport Building: 7.2/10 avg")
- **File:** `server/grading.ts` Step 15, `drizzle/schema.ts:userSkillScores`
- **Status:** ✅ Working

### 19. Intelligence Pattern Detection
- **What:** After each call, analyzes for team-wide patterns → feeds into playbook intelligence
- **File:** `server/grading.ts` Step 14, `server/routers/intelligence.ts`
- **Status:** ✅ Working (fire-and-forget)

### 20. Team Management
- **What:** Add/remove team members, assign roles, set GHL user mappings, LC phone numbers
- **File:** `client/src/pages/TeamManagement.tsx`, `server/routers/team.ts`
- **Status:** ✅ Working

### 21. Training Materials Upload
- **What:** Upload PDFs/docs as training materials that feed into grading context
- **File:** `client/src/pages/TeamTraining.tsx`, `server/routers/training.ts`
- **Status:** ✅ Working (Roleplay Scenario cards deferred/hidden)

### 22. Day Hub (Task Center)
- **What:** Daily task list, inbox integration, appointment tracking for reps
- **File:** `client/src/pages/TaskCenter.tsx`, `server/routers/taskCenter.ts`
- **Status:** ✅ Working

### 23. Dispo / Inventory Tracking
- **What:** Property inventory for dispo team, deal tracking, buyer management
- **File:** `client/src/pages/Inventory.tsx`, `server/routers/inventory.ts`
- **Status:** ✅ Working

### 24. Social Media Content
- **What:** Social post generator and content ideas for team
- **File:** `client/src/pages/SocialMedia.tsx`, `server/routers/social.ts`
- **Status:** ✅ Working

### 25. Lead Gen Dashboard
- **What:** Dedicated dashboard for Lead Generator role
- **File:** `client/src/pages/LeadGenDashboard.tsx`
- **Status:** ✅ Working

### 26. Onboarding Wizard
- **What:** Multi-step onboarding: company setup → CRM connect → team members → playbook
- **File:** `client/src/pages/Onboarding.tsx`, `server/routers/tenant/`
- **Status:** ✅ Working

### 27. Super Admin Dashboard
- **What:** Platform-level admin — view all tenants, impersonate, manage billing
- **File:** `client/src/pages/SuperAdmin.tsx`, `client/src/pages/AdminDashboard.tsx`
- **Status:** ✅ Working

### 28. Coach Activity Log
- **What:** Log of all AI coach interactions and actions
- **File:** `client/src/pages/CoachActivityLog.tsx`, `server/routers/coachActions.ts`
- **Status:** ✅ Working

## ⚠️ Partial / Degraded Features

### CRM Integration Status
- **What:** GHL CRM connection showing as degraded
- **File:** `api/index.ts` health check, `server/ghlOAuth.ts`
- **Status:** ⚠️ Degraded — `crmStatus: degraded` in `/health` response

### Inbox Enhancements (Phase 9)
- **What:** Mark as read, snooze, archive actions on call inbox
- **Status:** ⚠️ Partially built — schema columns being added, no full UI yet

### CRM Field Mapping (Phase 10)
- **What:** Dynamic mapping of CRM fields to Gunner fields
- **Status:** ⚠️ In design — schema not yet added

### Property Auto-Population
- **What:** Auto-pull GHL contact address into property record during call sync
- **Status:** ⚠️ Planned

## ❌ Deferred / Blocked Features

| Feature | Reason Deferred |
|---------|----------------|
| Roleplay Scenario cards (Training tab) | Hidden, needs fix |
| Split schema.ts into modules | High-risk (330 exports, 71 importers) |
| Mojo/PhoneBurner/ReadyMode dialers | Waiting for real users |
| Podio UI conditionals | Waiting for real Podio user |
| Training → Playbook merge | Low priority |
| Market data section | Needs market data endpoint |
