# Session Memory Capture
**Date:** 2026-03-16 (Monday)
**Captured:** 2026-03-16-1946 CST

---

## Key Decisions

- **Gunner rebuild strategy:** Do NOT patch Gunner on Manus codebase. Wait until Claude Code subscription auth is done, then rebuild properly with Builder. No wasted effort patching what will be redone.
- **Model switch:** Corey switched main session to gpt-4o-mini to reduce token burn. Use lighter models for routine conversation.
- **Gunner repo:** Active codebase is `c7lavinder/MANUS-Gunner-AI`, `production` branch. Deploys to Railway at `gunner-production.up.railway.app`.
- **Parallel agents policy:** Running 6-8 parallel subagents on Sonnet is too expensive. Default to sequential execution and smaller models unless speed matters.

---

## Rules Corey Stated

1. **Do not break Gunner** — read-only review only until a clear plan exists and Corey approves. Quote: "Do not have broken work on it."
2. **Claude Code auth required before Builder work** — someone must physically run `export PATH="$HOME/.npm-global/bin:$PATH" && claude auth login` at the Mac mini terminal before Builder can run on the $200/mo plan.
3. **Token burn awareness** — Corey is watching costs. Be efficient. Fewer parallel agents, smaller models, no unnecessary browser automation.
4. **Manus is for momentum, Claude Code is for precision** — Manus rebuilds around problems; Claude Code fixes the exact issue.

---

## Open Tasks

- [ ] **Claude Code subscription auth** — BLOCKED on physical terminal access. Buddy needs to run the auth command at Mac mini. Critical before any Builder work.
- [ ] **Gunner rebuild** — Full UI/foundation/quality rebuild with Builder + Architect. Waiting on Claude Code auth first. Auditor report already captured (March 16).
- [ ] **Gunner CRM degraded status** — Health endpoint returns `crmStatus: "degraded"` in production. Flagged by Auditor. Not blocking anything until rebuild.
- [ ] **Control Room deployment** — Was deploying as of 23:15 UTC on March 16. Verify it completed successfully.

---

## Context Notes

- Corey is exhausted and overwhelmed with NAH business operations on top of Gunner development
- Building Gunner through Manus has been progress-heavy but fragile — little bugs hard to fix
- The agent stack (Claude Code, Paperclip, NAH repo, Control Room) was fully rebuilt on March 16
- Team: Kyle (AM), Chris & Daniel (LMs), Esteban (Dispo), Jessica (Data/KPIs)
- Railway services (xhaka-intelligence, xhaka-control-room, xhaka showcase) confirmed healthy as of March 16 evening
