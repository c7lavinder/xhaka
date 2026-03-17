# Gunner — Known Issues & Technical Debt

## 🔴 Active Issues (Production Impact)

### 1. CRM Status Degraded
- **What:** `/health` returns `{"status":"ok","crmStatus":"degraded"}`
- **Impact:** CRM integration (GHL connection) is not fully operational for one or more tenants
- **Likely Cause:** GHL OAuth token expired or invalid, tenant CRM config missing credentials, or health check queries a failing external endpoint
- **Location:** `api/index.ts` health check endpoint, `server/ghlOAuth.ts`
- **Fix Direction:** Check GHL OAuth token validity for all production tenants, verify `ghlOAuthTokens` table has valid non-expired tokens

---

## 🟡 Technical Debt (Code Quality Issues)

### 2. God Files — Oversized Modules

| File | Lines | Issue |
|------|-------|-------|
| `server/grading.ts` | ~2500+ | Contains all 7 rubrics + processCall pipeline + gradeCall + classifyCall + detectCallType. Should be split into rubrics.ts, pipeline.ts, classification.ts |
| `server/ghlService.ts` | 2,121 | All GHL service logic in one file. The ghl/ directory split helps but this file persists |
| `server/podioActions.ts` | 1,241 | Large single file for Podio actions |
| `server/podioService.ts` | 1,105 | Large single file for Podio service |
| `drizzle/schema.ts` | 330 exports | Entire DB schema in one file. Split deferred due to 71 importers — high-risk refactor |

### 3. schema.ts Cannot Be Split Yet
- **What:** `drizzle/schema.ts` has 330 exports and 71 files that import from it
- **Impact:** Any incorrect split breaks TypeScript compilation across the whole project
- **Deferred:** Explicitly marked as deferred in `todo.md` due to risk

### 4. mysqlEnum for Boolean Values
- **What:** Many columns use `mysqlEnum("col", ["true","false"])` instead of `boolean()`
- **Example:** `crmConnected: mysqlEnum("crmConnected", ["true", "false"])`, `isRead: mysqlEnum("isRead", ["true", "false"])`, etc.
- **Impact:** Awkward string comparisons instead of boolean checks. Historical design decision, hard to migrate.
- **Scope:** Affects tenants, users, teamMembers, calls, and several other tables

### 5. No Test Coverage for Frontend
- **What:** 80+ Vitest test files exist but all test server-side logic only
- **Impact:** Frontend regressions go undetected until manual testing
- **Coverage:** Backend has good test coverage (webhook, grading, tenant, billing, etc.)

### 6. callSource Only Has "ghl"
- **What:** `calls.callSource` enum has `ghl | batchdialer | podio` but the webhook handler only writes `"ghl"` regardless of source
- **Location:** `server/webhook.ts` line: `callSource: event.source === "ghl" ? "ghl" : "ghl"`
- **Impact:** Source attribution is always GHL even for other sources

### 7. Legacy Aliases (seller_callback, admin_callback)
- **What:** `seller_callback` and `admin_callback` are kept as aliases for `ADMIN_CALLBACK_RUBRIC`
- **Impact:** Backward compatibility debt. New code should not use these aliases.
- **Location:** `server/grading.ts` rubricMap

### 8. batchLeadsEnrichment Column is DEPRECATED
- **What:** `calls.batchLeadsEnrichment` column kept for historical data — BatchLeads integration was removed
- **Impact:** Dead column in schema
- **Also:** `tenants.lastBatchLeadsSync` is marked DEPRECATED in schema

### 9. TypeScript Strict Mode Issues
- **What:** Some `as any` casts in webhook and processCall for dynamic imports
- **Location:** `server/webhook.ts`, `server/grading.ts`
- **Impact:** Reduced type safety in critical paths

---

## 🟠 UX / Product Issues

### 10. Mobile Not Fully Responsive
- **What:** Inbox and appointments not responsive on mobile
- **Deferred:** Listed in todo.md

### 11. Dropdowns Not Searchable
- **What:** Dropdowns referencing external data (pipelines, stages, calendars) not all searchable
- **Deferred:** Listed in todo.md

### 12. Roleplay Scenario Cards Blank
- **What:** Training tab has blank Roleplay Scenario cards
- **Status:** Hidden for now, deferred

### 13. Phase 9 Inbox Features Incomplete
- **What:** Mark as read / snooze / archive are partially built (schema columns added, no full UI)
- **Impact:** No inbox management features for reps

---

## 🔵 Architecture / Design Concerns

### 14. processCall() is 700+ Lines
- **What:** The `processCall()` function in `grading.ts` handles 17 steps across 700+ lines in a single function
- **Risk:** Very hard to test individual steps, hard to reason about failure modes
- **Ideal:** Each step as a separate testable function, pipeline as an orchestrator

### 15. No Retry/Circuit Breaker on LLM Calls
- **What:** LLM calls in grading fail silently in some cases
- **Impact:** Failed transcriptions or grades result in stuck calls (status never reaches "completed")
- **Existing mitigation:** `webhookRetryQueue` for GHL engine webhooks, but not for LLM pipeline itself

### 16. Contact Name Resolution Is 3-Try Waterfall Inside processCall
- **What:** Steps 2.5 tries 3 methods in sequence, all in processCall() body
- **Impact:** Adds latency, complex code in pipeline, hard to test in isolation

### 17. Playbook System Complexity
- **What:** The playbook/resolvePlaybookKeys system is complex with many fallback paths
- **Files involved:** `server/playbooks.ts`, `server/resolvePlaybookKeys.ts`, `server/playbookResolver.ts`, `shared/playbooks.ts`, `shared/softwarePlaybook.ts`
- **Impact:** Hard to understand what a tenant's effective playbook config is at any given moment

---

## 🟢 Recently Fixed (For Context)

- Schema.ts split attempted → deferred due to 71 importers (too risky)
- db.ts split into 9 domain files (completed, 3010 → domain modules)
- ghlActions.ts split into 9 ghl/ modules (completed, 2849 → domain modules)
- ARCHITECTURE.md, CONVENTIONS.md, CONTRIBUTING.md → merged into BIBLE.md (consolidation)
- 4,708 completed todo items archived to CHANGELOG.md
