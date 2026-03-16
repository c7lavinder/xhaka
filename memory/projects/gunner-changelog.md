## 2026-03-13 (36 commits)
### ✅ Built
- add @playwright/test dependency — E2E tests ready
- boolean column migration stage 1, Playwright E2E test suite setup
- PostHog complete, Helmet CSP enabled, structured logging in request paths
- onboarding flow — signup redirect, onboarding gate, badge seeding, industry defaults, new-industry guide
- CRM complete — 4 new actions, dynamic GHL pickers, surface hidden actions, inbound field capture
- multi-industry playbooks — generic fallback, taskSort generic, algorithm wiring, seed completeness, new-industry guide
- three-layer CRM sync system with Settings dashboard
- Demo CRM Adapter — continuous test tenant with no destructive seeds
- Day Hub polish — fixed inbox height, per-contact AM/PM chips, task categories playbook, CRM task completion, AI Coach context, KPI card polish, overdue gradient, pagination, Update Workflow, Settings CRM phones
- redesign header with centered nav, Gunner logo, and real user photo avatar
- full calls section overhaul — detail page, next steps engine, AI coach, grading improvements
- infrastructure upgrade — agent orchestration, BullMQ queues, Control Room, test suite, Dockerfile
### 🐛 Fixed
- exclude E2E from vitest, add missing testing-library/dom dep
- DB indexes, extract nextSteps service, agent stub banners, action token refresh
- CRM bridge — webhook events, action router gaps, error handling, 30-day backfill, pagination, reconciliation
- security hardening — session validation, tenant isolation, role hierarchy, rate limiting
- add missing profilePicture column to users table — fixes login crash
- call detail routing (useParams), demo call transcripts + outcomes, grading orphaned calls, outcome badges
- use useParams instead of useRoute in CallDetail — fixes blank screen on /calls/:id
- call detail blank screen, call type labels, grade pending demo calls, wire missing filters
- AuthGuard shows shimmer instead of blank screen during auth redirect
- add call_feedback table, editableContent column, error boundary for CallDetail blank screen
- resolve all compliance violations — grading fallback criteria, Terminology interface, AlgorithmConfig typing, KpiPage metrics; update living docs
- remove seedDemoTenant from startup chain
- remove healthcheck from railway.toml to unblock deploy
- remove healthcheck to unstick Railway deploy loop
- bind server to :: (dual-stack IPv4+IPv6) so Railway healthcheck passes
- force redeploy to unstick Railway container scheduler
### 🔄 Changed
- clean index.ts — strip all debug instrumentation, move /health before middleware
- remove debug instrumentation from index.ts
## 2026-03-14 (10 commits)
### ✅ Built
- add Sync Now button and auto-sync after CRM OAuth connect
### 🐛 Fixed
- run triggerSync in background to prevent HTTP timeout
- add diagnostic logging to GHL call ingestion
- rewrite getCallRecordings to use GHL messages/export endpoint
- saveGhlTokens now merges into existing crmConfig instead of replacing
- CRM Layer 2 save no longer wipes OAuth, show token last 4 chars
- update hardcoded GHL install link client ID
- use correct Railway domain (gunner-production) for OAuth redirect
- use GHL Marketplace install link for OAuth connect button
- startup crash — wrong column name in KPI index, opp ingestion conflict
## 2026-03-16 (0 commits)
_No significant changes._
## 2026-03-16 (0 commits)
_No significant changes._
## 2026-03-16 (0 commits)
_No significant changes._
## 2026-03-16 (0 commits)
_No significant changes._
## 2026-03-16 (0 commits)
_No significant changes._
## 2026-03-16 (0 commits)
_No significant changes._
## 2026-03-16 (0 commits)
_No significant changes._
## 2026-03-16 (0 commits)
_No significant changes._
## 2026-03-16 (0 commits)
_No significant changes._