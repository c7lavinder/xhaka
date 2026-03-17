# Gunner — Rebuild Plan

## Strategic Assessment

Gunner is **further along than it looks**. The core business logic (grading rubrics, coaching philosophy, 17-step pipeline) is solid and well-thought-out. The main problems are **architectural accumulation** — god files, mixed concerns, and a schema that grew organically without a plan. A full rewrite is not needed. A targeted refactor with a few key structural improvements would make Gunner maintainable at 10x the current codebase size.

---

## What to KEEP (Working, Well-Designed)

### 1. All Grading Rubrics (KEEP AS-IS)
The rubrics in `server/grading.ts` are the core IP of the product. They encode:
- The 10-Step Close methodology
- Role-specific scoring (LM, AM, LG, Dispo, Follow-Up)
- Critical failure logic
- Red flags
- Coaching philosophy (PMAS, 5 Communication Techniques)

**Action:** Extract rubrics into their own file (`server/rubrics/`), but keep content identical.

### 2. The 17-Step processCall Pipeline (KEEP, REFACTOR STRUCTURE)
The step-by-step logic is correct and battle-tested. The problem is it's all in one 700-line function.

**Action:** Keep the steps, refactor into pipeline orchestrator + individual step functions.

### 3. Multi-Tenancy Model (KEEP)
The tenant isolation is well-designed. Every table has `tenantId`. All queries are scoped. The playbook system allows true white-labeling.

**Action:** Keep as-is.

### 4. tRPC Architecture (KEEP)
Type-safe end-to-end API is the right call for a TypeScript stack. tRPC 11 with React Query is production-grade.

**Action:** Keep as-is.

### 5. Gamification System (KEEP)
Badges, XP, streaks, leaderboard are a core product differentiator. Well-implemented.

**Action:** Keep as-is.

### 6. GHL OAuth Token Management (KEEP)
The refresh mutex pattern in `ghlOAuth.ts` is genuinely good engineering — prevents the single-use refresh token race condition.

**Action:** Keep as-is.

### 7. RAG Pipeline (KEEP)
Semantic search over graded calls gives the AI coach real context. Good architecture in `server/rag/`.

**Action:** Keep as-is.

### 8. Database Schema (KEEP, SPLIT CAUTIOUSLY)
The schema is comprehensive. The main issue is it's 330 exports in one file.

**Action:** Plan a careful split into domain files over multiple PRs, each with full test coverage.

---

## What to REWRITE (Broken, Fragile, Poorly Structured)

### 1. Fix CRM Degraded Status (URGENT — Production Bug)
**Problem:** `crmStatus: degraded` in production health check.
**Action:**
1. SSH into Railway and check logs for GHL OAuth errors
2. Check `ghlOAuthTokens` table for expired/missing tokens
3. Identify which tenants are failing and re-authorize
4. Add better health check logging so degraded reason is surfaced

### 2. Split `server/grading.ts` Into Modules
**Problem:** 2500+ line file mixing rubrics, pipeline, classification, call type detection.
**Proposed split:**
```
server/
├── rubrics/
│   ├── lead_manager.ts
│   ├── acquisition_manager.ts
│   ├── lead_generator.ts
│   ├── follow_up.ts
│   ├── dispo.ts
│   ├── admin.ts
│   └── index.ts (barrel)
├── grading/
│   ├── grade.ts         (gradeCall function)
│   ├── classify.ts      (classifyCall)
│   ├── detect_type.ts   (detectCallType)
│   ├── pipeline.ts      (processCall orchestrator)
│   └── steps/           (individual step functions)
│       ├── step1_duration.ts
│       ├── step2_transcribe.ts
│       ├── step2_5_contact_name.ts
│       ├── step3_classify.ts
│       └── ... etc
```
**Risk:** Low if done carefully with barrel exports for backward compat.

### 3. Fix mysqlEnum Boolean Columns
**Problem:** `isActive: mysqlEnum("isActive", ["true", "false"])` pattern everywhere instead of `boolean()`
**Action:** Gradually migrate in non-breaking PRs: add new boolean column, backfill, drop old enum column.
**Priority:** Low — code works, just ugly.

### 4. Fix callSource Bug
**Problem:** `callSource: event.source === "ghl" ? "ghl" : "ghl"` — always writes "ghl"
**Fix:** `callSource: (event.source as "ghl" | "batchdialer" | "podio") ?? "ghl"`
**Risk:** Very low — 2-line fix.

### 5. Pipeline Retry Logic for LLM Failures
**Problem:** If LLM fails mid-pipeline, call gets stuck in intermediate status
**Action:** Add exponential backoff retry for Steps 2-5, dead letter queue for permanently stuck calls

---

## Suggested Rebuild Order

**Phase 1: Unblock Production (Days 1-3)**
1. Fix CRM degraded status (check OAuth tokens in Railway)
2. Fix callSource attribution bug (trivial)
3. Add more descriptive health check (surface WHY crmStatus is degraded)

**Phase 2: Structural Cleanup (Week 2-3)**
4. Extract rubrics into `server/rubrics/` (low risk, high readability gain)
5. Refactor processCall steps into individual functions
6. Add LLM failure retry/dead-letter for stuck calls

**Phase 3: Schema (Week 4+)**
7. Plan schema.ts split — identify domain boundaries
8. Execute split in 3-4 PRs (calls domain, tenant domain, gamification domain, etc.)
9. Migrate mysqlEnum boolean columns over time

**Phase 4: Feature Completeness**
10. Complete Phase 9 inbox features (read/snooze/archive)
11. CRM field mapping (Phase 10)
12. Property auto-population from GHL contacts
13. Mobile responsive inbox + appointments

---

## Risks & Gotchas

### 1. schema.ts 71 Importers
Any incorrect schema split will cause TypeScript compilation failures across 71 files. Must be done carefully with barrel exports. Never break existing import paths.

### 2. GHL Refresh Token Single-Use
GHL refresh tokens are single-use. The refresh mutex in `ghlOAuth.ts` is critical. Never remove or bypass it. Multiple concurrent refreshes will permanently invalidate the tenant's connection.

### 3. processCall Idempotency
`processCall()` checks for existing grades before running. This is critical — must be preserved in any refactor. The pipeline is called from webhooks that could fire multiple times.

### 4. Call Type Resolution
The call type routing (role → call type → rubric) goes through the playbook resolver with multiple fallback paths. Any changes to this chain need careful testing across tenant configurations.

### 5. Critical Failure Capping
The 50% score cap for critical failures (Follow-Up, Dispo rubrics) is applied AFTER LLM scoring. Any rubric refactor must preserve this logic.

### 6. TiDB / MySQL Specifics
Gunner uses TiDB (MySQL-compatible). Some Drizzle patterns may not work the same as standard Postgres. Check `BIBLE.md` section "TiDB Quirks" before any migration work.

### 7. Tenant Rubric Override
If a tenant has a custom rubric defined, it overrides the system rubric in `gradeCall()`. This is Step S13 in the grading function. Any rubric refactor must not break this override path.

---

## Summary Table

| Component | Keep/Rewrite | Priority |
|-----------|-------------|----------|
| Grading rubrics (content) | KEEP | — |
| processCall pipeline (structure) | REFACTOR | Medium |
| Multi-tenancy model | KEEP | — |
| tRPC + React stack | KEEP | — |
| GHL OAuth + mutex | KEEP | — |
| CRM degraded (prod bug) | FIX NOW | 🔴 Urgent |
| ghlService.ts (2121 lines) | REFACTOR | Low |
| schema.ts (330 exports) | SPLIT GRADUALLY | Medium |
| mysqlEnum booleans | MIGRATE GRADUALLY | Low |
| callSource bug | TRIVIAL FIX | Low |
| LLM retry logic | ADD | Medium |
| Frontend test coverage | ADD | Medium |
| Mobile responsiveness | ADD | Low |
