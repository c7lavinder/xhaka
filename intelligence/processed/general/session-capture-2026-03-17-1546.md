# Session Capture — 2026-03-17 15:46 CDT

## Source
- Session: c1fbe43e (main Telegram chat, ~2551 messages)
- Date: Tuesday, March 17, 2026

---

## Key Decisions

1. **Gunner 7-Phase Execution Plan** — Corey approved running all 90-issue plan end-to-end, sequentially, efficient and effective.
2. **Nav Cleanup Decisions:**
   - `/analytics` → hide from nav, keep route
   - `/coach-log` → keep (already linked from Calls page)
   - `/team-training` → delete (duplicate)
   - `/leaderboard` → delete (dead page, 17KB)
   - `/social` → hide from nav, keep route
   - `/settings/podio-mapping` → link from Org Settings CRM section when Podio selected
3. **Font size preference:** Corey confirmed 80% zoom view looks better → base font set to 14px (was 16px)
4. **Xhaka on 4o mini is fine for routing/coordination** — Claude Code does the heavy lifting locally
5. **Claude Code auth:** Corey confirmed he set up Claude Code via subscription (not API) on terminal the day prior — not the magic link

## Rules Corey Stated

- "Efficient and effective" — work through the plan top to bottom without stopping
- Xhaka cannot run code manually (on 4o mini, not Builder)
- Claude Code must use subscription account (`corey@newagainhouses.com`), not API credits
- "It is fixing it, no need to fix" — don't double-fix what Manus (the local dev) is already handling
- Settings to have one canonical home (no duplicates across pages)

## Open Tasks / In Progress

- **Phase 6 (Feature Fixes)** — ~6/8 commits done as of 3:47 PM; `warm-seaslug` / `nova-comet` running
- **Phase 7 (Nav & Cleanup)** — `warm-seaslug` running; last phase: delete dead pages, hide orphan routes, visual polish, mobile fixes
- **Corey asked: "Is there a phase 8?"** — unanswered at time of capture; need to confirm whether plan ends at 7

## Phases Completed Today (Gunner 90-Issue Plan)

| Phase | Focus | Status |
|---|---|---|
| 1 | Security (cross-tenant, unified adminProcedure) | ✅ Done — 5 commits |
| 2 | Data Integrity (grading→milestone, webhook unification) | ✅ Done — 5 commits |
| 3 | Settings Wiring (auto-skip, gamification, CRM fields) | ✅ Done — 3 commits |
| 4 | Settings Consolidation (one home per setting) | ✅ Done — 5 commits |
| 5 | Multi-tenant Hardcoding (AI prompts, rubrics, emails) | ✅ Done — 7 commits |
| 6 | Feature Fixes (22 issues) | 🔄 ~6/8 done, wrapping |
| 7 | Nav & Cleanup | 🔄 Running (`warm-seaslug`) |

## Notable Bugs Found (Audits Run Today)

- 90 total issues across 4 audits (settings, sitewide, new-tenant hardcoding, role-based access)
- Critical security holes: cross-tenant data exposure on 3 routes (FIXED Phase 1)
- Gamification settings saved to DB but runtime used hardcoded constants (FIXED Phase 3)
- All AI prompts hardcoded to wholesale/real estate (FIXED Phase 5)
- Anthropic API had active incident ~3:10–3:35 PM CDT causing Claude Code 500s

## Context

- Manus = local developer on Corey's team who pulls and deploys from GitHub
- Gunner = getgunner.ai, AI call coaching platform Corey built
- All code changes go to GitHub repo (c7lavinder), Manus pulls and deploys
