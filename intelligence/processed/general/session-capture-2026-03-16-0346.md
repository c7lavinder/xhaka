# Session Memory Capture — 2026-03-16-0346

**Captured:** 2026-03-16 03:46 CDT (cron job)
**Sessions reviewed:** Main Telegram session (2026-03-13 to 2026-03-16), Architect subagent (03:20), Researcher subagent (03:08), Workspace-sync cron

---

## KEY DECISIONS

### 1. Single Repo — c7lavinder/xhaka is the ONE source of truth
- Corey explicitly said: "Why is there another repo, all that information needs to go to our one and only repo"
- Decision: Everything consolidates into c7lavinder/xhaka. openclaw-control-room repo gets archived.
- Services/control-room Next.js app migrated from openclaw-control-room → xhaka/services/control-room/

### 2. No Browser Dashboard as Primary Interface
- Corey: "I would prefer for you just to communicate to me"
- Decision: Telegram is the primary interface. Browser dashboard is secondary reference only.
- Morning briefs, job alerts, Builder completions, weekly digests all come to Telegram.

### 3. Paperclip Integration — Investigate and Implement
- Corey found github.com/paperclipai/paperclip — open-source orchestration for AI companies
- Corey: "yes 1 and make sure the team deeply investigates so we harness its potential"
- Decision: Researcher sent to do deep investigation. Paperclip CLI v0.2.7 installed locally.
- Key quote: "If OpenClaw is an employee, Paperclip is the company."
- Real Estate Leads Clipmart template exists — 7 agents for NAH use case.

### 4. Smart Scheduler — Build Now
- Jon Tsai article showed advanced scheduling primitives Xhaka is missing
- Corey: "Build this week, brotha have it built now" 
- Decision: Builder spawned to build smart-scheduler.ts with:
  - run-if-not-run-since (prevent duplicate runs)
  - skip-if-last-run-within (debounce)
  - conflict-avoidance (researcher + organize cant overlap)
  - LLM router (GPT-4o for heavy, GPT-4o-mini for medium/light)
  - Cost tracker (reads results.tsv, surfaces in morning brief)

### 5. Jon Tsai Architecture Insights Applied
- Source: https://www.jontsai.com/2026/02/12/building-mission-control-for-my-ai-workforce-introducing-openclaw-command-center
- "Bring work to where humans are" — Telegram as primary channel (confirmed by Corey)
- He is ~18 months ahead; key patterns to adopt:
  - Advanced scheduling primitives (in progress)
  - Agent self-management and meta-work
  - Priority queues and conflict avoidance

---

## RULES COREY STATED

1. **One repo only** — c7lavinder/xhaka is the single source of truth. No fragmentation.
2. **Communicate to me directly** — no browser dashboards as primary interface. Telegram only.
3. **Build now, not "this week"** — when Corey says build it, build it immediately.

---

## OPEN TASKS

- [ ] **Architect** — Complete migration of Next.js control-room from openclaw-control-room → c7lavinder/xhaka/services/control-room/ (was in progress at 03:20)
- [ ] **Builder** — smart-scheduler.ts build (spawned ~03:05, status unknown)
- [ ] **Researcher** — Deep Paperclip investigation (spawned ~03:07, completed files: memory/context/technology/paperclip.md + memory/context/sim/paperclip-org-chart.md)
- [ ] **Xhaka** — After Researcher delivers Paperclip report, present full implementation plan to Corey
- [ ] **Operator** — Update Railway: point control-room service at c7lavinder/xhaka with root dir services/control-room (after Architect completes migration)
- [ ] **Xhaka** — Archive/deprecate openclaw-control-room repo after migration confirmed
- [ ] **Morning Brief** — Determine if NAH pipeline data + Gunner team scores should be included (Corey was asked, not yet answered)

---

## CONTEXT

- Paperclip CLI v0.2.7 installed locally — ready for onboarding
- Real Estate Leads Clipmart template confirmed to exist (7 agents, matches NAH use case)
- Control-room was deploying to wrong repo entire time — all HTML commits went to xhaka, live site pulls from openclaw-control-room. Last deploy failed March 12.
- Workspace-sync cron: all 8 config files already in sync with GitHub as of 03:44.
