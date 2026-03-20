# Session Capture — 2026-03-20-0401

## Source Sessions
- Main Telegram session (3cd597d4) — ~1:11 AM–3:50 AM CST
- Workspace sync cron (59071575) — completed successfully

---

## Key Decisions

1. **Paperclip is the execution layer, not just a board** — agents fire on assignment, not cron
2. **All agents must be event-driven** — `wakeOnAssignment: true` mandatory; cron only if no triggering event possible (hard rule added to SOUL.md)
3. **Paperclip fully wired and confirmed working** — end-to-end loop verified: XHAA-20, XHAA-21 completed with zero intervention
4. **Claude CLI location** — `/Users/wholesaleai/.npm-global/bin/claude` (v2.1.76); PATH must include `~/.npm-global/bin` in adapterConfig for all Paperclip agents
5. **Paperclip skill installed** — `paperclip` skill in `.claude/skills/` enables agents to interact with board; required for agent task awareness
6. **`dangerouslySkipPermissions: true`** set on all agents — prevents interactive approval prompts mid-run
7. **`git push origin main` removed from deny list** — Builder can now ship fully autonomously; force push still blocked
8. **gstack upgraded v0.4.4 → v0.9.0** — new skills: `/careful`, `/freeze`, `/unfreeze`, `/guard`, `/investigate`, `/office-hours`, `/design-consultation`, `/design-review`; vendored into repo at `.claude/skills/gstack/`
9. **gstack now in repo** — 164 files pushed to `c7lavinder/xhaka`; any Builder session auto-has all skills
10. **NAH and Gunner = separate Paperclip companies in future** — not yet, but confirmed direction
11. **Paperclip skill + Paperclip agents are peers** — Builder/Auditor/Researcher/Architect/Librarian/Operator are equals, no hierarchy
12. **Auditor as independent checker is still aspirational** — not yet firing autonomously; acknowledged gap
13. **Railway jobs NOT migrating to Paperclip crons** — keep event-driven intelligence scheduler on Railway
14. **Will Riddle Monday meeting = low stakes** — just showing the world exists, not a formal demo; no prep needed beyond Control Room being live
15. **Paperclip board is the single source of truth** — "If it isn't in Paperclip, it doesn't exist"

---

## Rules Corey Stated

1. **Agents must be event-driven, not cron-driven** — no exceptions; cron only if zero triggering event possible (stated explicitly, added to SOUL.md)
2. **Xhaka does NOT touch Gunner code** — Builder sent to fix Gunner CRM was a rule violation; Corey called it out
3. **Do not ask Corey which test to run or how** — just do it yourself; "Can you do the test not me" (verbatim)
4. **Everything has to work 100% autonomously** — agents fire automatically on assignment; Auditor must be on top of Builder continuously

---

## Fixes Shipped Tonight

- ✅ **cron race condition** — `improve` + `cleanup` staggered to 6:30 AM (was 6:00 AM same as `propagate`); commit `c7lavinder/xhaka`
- ✅ **TypeScript CI restored** — `package-lock.json` regenerated; first passing CI in weeks
- ✅ **HEARTBEAT.md updated** — now reads `job-registry.json`, hard rules against re-alerting
- ✅ **session-memory-capture cron** — changed from every 4h to every 30min (max 30min context loss on restart)
- ✅ **Control Room Next.js fix** — Express → Next.js; Builder pushed, Railway deploying
- ✅ **Gunner CRM health check** — fixed 2h webhook window false alarm (commit pushed to `c7lavinder/Gunner` production branch; Railway deploy needed manually)
- ✅ **SOUL.md updated** — event-driven rule + "push without asking" mandate added
- ✅ **gstack v0.9.0 vendored** — all 21 skills in repo
- ✅ **Paperclip agents wired** — all 6 agents: claude_local, cwd, PATH, promptTemplate, instructionsFilePath, dangerouslySkipPermissions
- ✅ **Paperclip skill installed** — agents can now read assignments and coordinate
- ✅ **End-to-end loop verified** — XHAA-20 and XHAA-21 completed fully autonomously

---

## Open Tasks

### Immediate
- [ ] **Gunner CRM Railway redeploy** — Corey needs to trigger manually in Railway → Gunner project → gunner-v2 → Deploy (commit `7744e7c3` is on `production` branch, waiting)
- [ ] **Permanent Paperclip tunnel URL** — Quick tunnel changes on restart; named Cloudflare tunnel needed for stable URL (PAPERCLIP-SETUP.md has instructions)
- [ ] **Auditor actually firing independently** — currently just a registered slot; needs proper heartbeat config to auto-review after every Builder commit
- [ ] **autoresearch skill** — needs Builder to build it based on `github.com/karpathy/autoresearch`; NOT a git clone, must be adapted as a Claude Code skill
- [ ] **Railway Paperclip instance cleanup** — `paperclip-production-a104.up.railway.app` was deployed March 16; local instance is canonical now; Railway one should be removed/suspended
- [ ] **Gunner Settings Page SDD** — still needs to be written and Builder spawned

### Backlog
- [ ] Separate Paperclip companies: NAH + Gunner
- [ ] Builder max turns review — currently 40 (set tonight); may need tuning per task type
- [ ] Session transcript resume (SDD written at `docs/sdds/session-transcript-resume.md`)
- [ ] Duplicate old Paperclip company `d80d949e` cleanup (Xhak Intellegence Co, archived)

---

## Paperclip Current State

- **Server:** Running locally at `http://127.0.0.1:3100`
- **Tunnel:** `https://governor-win-oaks-technique.trycloudflare.com` (temporary, changes on restart)
- **Company:** Xhaka Intelligence Co (`a72a0d42-623c-47b2-af2c-6fad3ee3be02`)
- **Agents:** 8 registered, all idle, 0 errors
- **Issue prefix:** XHAA-
- **Goals:** NAH $300k/mo + Gunner 100 customers (active)
- **Last verified loop:** XHAA-21 — fully autonomous, zero intervention required
