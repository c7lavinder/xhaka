# Session Memory Capture
**Timestamp:** 2026-03-18 11:46 CST (2026-03-18 04:46 UTC)
**Sessions Captured:** c1fbe43e (main Telegram session, Mar 17 evening/night)

---

## KEY DECISIONS

### Gunner UI Architecture Overhaul (Mar 17 evening)
- **Decision:** All configuration belongs on its respective page gear icon, NOT in PlaybookHub or Org Settings.
- **Decision:** Org Settings only holds what has no clear page home (leftover config).
- **Decision:** PlaybookHub is to be rebuilt as a pure intelligence layer — 4 layers: Software / Industry / Tenant / User. Each layer has 3 tabs: Manual Input / System Knowledge / Final Output.
- **Decision:** Gear modals use existing CSS design tokens (--g-bg-surface, --g-text-primary, etc.) so they auto-switch with user light/dark preference. NOT hardcoded dark.
- **Decision:** Gear modals are click-first (toggles, chips, dropdowns, color pickers, drag handles). No raw text inputs unless unavoidable.
- **Decision:** All gear modal saves use `useMutation` + `queryClient.invalidateQueries` for instant page update — no page reloads.

### Per-Page Config Spec (Corey defined):
- **Day Hub gear:** KPI tracking per role + triggers, Primary identifier (CRM field dropdown), Appointment types + CRM match + assigned user, Task category types + AI priority algorithm builder
- **Calls gear:** Call types, outcomes, skip duration, grading settings, rubrics
- **Inventory gear:** Pipeline stage matching (GHL → Gunner), pipeline details, KPI source configuration
- **KPI page gear:** Source + market config, spend inputs, volume inputs
- **Team page gear:** Users/roles/permissions, gamification (badges, XP, levels)

### Onboarding Wizard
- **Decision:** Keep a slim onboarding wizard — 3 steps only (bare minimum). Don't drop new tenants into raw settings.

### Priority Algorithm (Day Hub)
- **Decision:** Tenant sets baseline priority rules, each user can override their own on top of tenant defaults.
- **Example rule type:** "New leads > 7 days old rank below due follow-ups" (similar to Manus priority logic).
- **Status:** New feature — no DB table or UI exists yet. Must be built from scratch.

### GHL Stage Mapping Bug (Mar 17, ~6pm CDT)
- **Decision/Fix:** Stage mapping was using old `fetchPipelinesForTenant` (silent fail path). Switched to `getPipelinesForTenant` which uses `ghlFetchWithFallback` with OAuth support.
- **Commit:** `0c46a51`

### Onboarding Guide (Mar 17, ~5:55pm CDT)
- **Decision/Fix:** `onboarding-guide.html` must be in `client/public/` (not root `public/`) to be served as static without auth by Vite build.
- **Commit:** `92e5df3`

### Duplicate Stage Mapping UI
- **Decision/Fix:** Removed duplicate StageMappingSection from TenantSettings.tsx Integrations tab. Canonical version lives in CrmSettingsTab.
- **Commit:** `6556f39`

---

## RULES COREY STATED

1. **Gear modals must be light** (follow CSS tokens/user theme, not hardcoded dark).
2. **Gear modals must be slick** — maps, colors, click-not-type, organized. Simple.
3. **Page updates immediately after saving** — no reload.
4. **Each page owns its config** — config lives on the page it's relevant to.
5. **PlaybookHub = intelligence, NOT settings.** No config tabs there.
6. **Builder stopped when wrong** — Builder was killed and relaunched when it had wrong design direction (dark hardcoded). Process: stop immediately, correct spec, relaunch.

---

## OPEN TASKS

### 🔴 IN PROGRESS
- **Builder session `wild-canyon`** — Building all 5-commit gear modal redesign (SDD written, corrected for CSS tokens). 9 tasks total:
  1. Shared modal shell + Calls gear
  2. Inventory + Day Hub gear (incl. priority algorithm builder — new from scratch)
  3. KPI page + Team page gear
  4. Org Settings cleanup (remove moved config)
  5. DB migrations for new tables + onboarding slim to 3 steps
- **Manus deploy needed** — Commits pushed to GitHub, Manus needs to pull + redeploy for live at getgunner.ai

### 🟡 FOLLOW UP NEEDED
- **PlaybookHub 4-layer rebuild** — Spec discussed but NOT yet sent to Builder. This is a separate major build after gear modals complete.
- **"Generate Highlights" → 0 highlights** — Identified on a real call with full transcript. Logged as potential transient LLM issue. Needs monitoring/retest after deploy.
- **NAH post-onboarding config** — Corey was walking through app to configure NAH as a real tenant. Incomplete — stopped when gear modal overhaul decision was made. Resume once gear modals are live.
- **Appointment types table** — Needs new DB table + UI (doesn't exist yet).
- **Primary identifier (CRM field dropdown)** — Needs DB + UI (hardcoded to "Property" currently).

### 🟢 COMPLETED TODAY (Mar 17)
- GHL stage mapping pipeline fetch fixed (commit `0c46a51`)
- Onboarding guide moved to correct public dir (commit `92e5df3`)
- Duplicate stage mapping section removed (commit `6556f39`)
- Per-page config architecture spec defined by Corey
- Gear modal SDD written and corrected

---

## CONTEXT

- **Gunner Builder:** Using Claude Code via `wild-canyon` sub-agent session. Auth confirmed as `corey@newagainhouses.com`, `subscriptionType: max` ($200/mo plan) — NOT burning Xhaka API credits.
- **Production URL:** getgunner.ai (Railway deployment, requires Manus git pull + redeploy to pick up new commits)
- **Repo:** c7lavinder/Gunner on GitHub, `main` branch = live
