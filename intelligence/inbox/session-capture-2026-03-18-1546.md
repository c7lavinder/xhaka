# Session Memory Capture — 2026-03-18-1546

## Key Decisions

### Gunner Architecture — March 18, 2026 (Morning Session)
- **DECISION: Gunner does NOT store/own contacts or properties** — GHL owns contacts and pipeline stages; Gunner enhances, does not compete
- **DECISION: Gunner DOES own** three property-side data layers:
  1. Property details (ARV, asking price, repair estimate, equity — GHL tracks these poorly)
  2. KPI milestone activity (when property hits each stage — ties deals to rep performance)
  3. Buyer activity (push log, who contacted, interest level, AI-generated outreach)
- **DECISION: Inventory page is justified** — admin pipeline snapshot + dispo workflow. Not a CRM, an intelligence layer over GHL
- **DECISION: No rebuild of entire app** — only the configuration layer needs rebuilding; DB schema and call grading/AI logic are solid
- **DECISION: Gunner is real-estate-specific** (not multi-industry SaaS) — saves 60-70% configuration complexity; no abstraction layer needed
- **DECISION: Single unified settings page** to replace scattered gear icons across 5 pages

### Settings Page Structure (Agreed)
1. **Integrations** — GHL connection, API credentials, location ID, sync health
2. **Pipeline** — Map GHL stages → Gunner simplified stages; primary vs dispo pipeline
3. **Team** — Members, roles (LM/AM/LG/Dispo/Admin), hierarchy, permissions, full gamification logic (XP, levels, thresholds)
4. **Calls** — Call types, outcomes + CRM triggers, grading rubrics, AI behavior
5. **Inventory** — Property fields, milestone definitions, task categories
6. **Notifications** — Alerts, coaching triggers, escalation rules

### Gunner Core Identity (Corey stated)
- Gunner = "CRM enhancer and user empowerer" — NOT a CRM
- Config happens once at setup, then disappears — users should never need to touch it again
- Users log in because Gunner tells them something needs attention, not to manage data
- Goal: get team OUT of GHL for day-to-day workflow visibility

## Rules Corey Stated
- Do not build separate industry-specific sites — maintenance nightmare, kills the business
- Do not make Gunner another software to manage — it should feel like it runs itself
- Configuration layer must be built bottom-up (data contract first, UI second) — NOT top-down mockups with disconnected data
- "I do not want to be a CRM" — this is a hard constraint

## Open Tasks
- **Config rebuild (Builder task):** Build single  page with 6 sections, proper data contracts from day one
  - Include full gamification logic (XP, levels) in Team section
  - Include task categories and permissions
  - Wire every setting to the data the live pages actually read
- **Fix failing jobs:**  and  jobs still showing failed status (from 2026-03-12); Corey said "Have team fix that and anything else failing" at 15:45 CDT
  - All other jobs healthy: capture, organize, propagate, tool-monitor, scribe, researcher, watchdog, operator, dispatcher all ✅
- **Inventory page pipeline dropdown empty** — GHL credentials not connected for current test tenant OR token expired; text inputs were hiding this bug before dropdowns were built
- **Manus sync pending** — multiple Builder commits queued for Manus to pick up (CRM stage dropdowns in Day Hub + Calls settings)

## Technical Context
- Settings modals were built as visual shells with no data wiring — root cause of all config bugs fixed today
-  server-side logic is correct;  hits GHL API correctly
- xhaka-intelligence Railway deployment: SUCCESS at 14:21 UTC today
- GitHub auto-sync running; latest commit 19:07 UTC
