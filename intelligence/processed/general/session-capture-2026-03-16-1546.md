# Session Memory Capture
**Date:** 2026-03-16-1546 (America/Chicago)

---

## Key Decisions

### Claude Code Setup (2026-03-16)
- **Decision:** Xhaka installed Claude Code 2.1.76 directly (no need for physical Mac mini visit)
- **Decision:** Old Gunner agent files (20 total) quarantined to  — contained prompt injection (soft hyphen U+00AD), hardcoded passwords, DROP TABLE patterns
- **Decision:** Clean security setup created:  with 14 deny rules, new  for Xhaka context, clean agent stubs for Builder, Auditor, Researcher
- **Decision:** Researcher committed  playbook to c7lavinder/xhaka (SHA: 0bcdc4ac) and  (SHA: f51a86e2)
- **Decision:** Paperclip wired — Xhaka joined as CEO agent, API key saved, skill installed in OpenClaw

### Agent Architecture Clarification (2026-03-16)
- **Decision:** Xhaka must NEVER do the work — always write spec → spawn specialist → report back. Corey called this out explicitly when Xhaka slipped into doing mode.
- **Rule (Corey):** "Okay, but it should not be you doing the work, we need agents doing the work" — stated 15:11 CDT
- **Decision:** Bootstrap exception acknowledged: Paperclip wiring required manual work first. Won't recur once Wednesday setup is complete.

### Gap Analysis (2026-03-16, ~15:33 CDT)
Corey asked: "What are the gaps between now and being able to start building out agents that actually work in the two businesses?"
Key gaps identified:
1. Builder has no Claude Code execution environment yet (being fixed today)
2. Operator has no tools (no GHL/BatchDialer/CallRail access as a real agent)
3. CLAUDE.md was stale (Gunner context, not Xhaka)
4. No Paperclip → no issue tracking for agent work
5. Researcher inbox backed up (KB not fully processed)

---

## Open Tasks

- [ ] **MCP tools install**: GitNexus (), Superpowers (plugin marketplace), gstack (Garry Tan 10-role workflow) — see 
- [ ] **Compound Engineering plugin** — install and test end-to-end with Paperclip
- [ ] **Operator agent build** — needs real tool access (GHL, BatchDialer, CallRail) once Builder is fully operational
- [ ] **Researcher KB backlog** — process remaining Claude Code articles in inbox
- [ ] **First end-to-end test** — verify Builder → Paperclip issue → execution → report flow works
- [ ] **AgentShield re-scan** — run after all new agents deployed to verify clean grade

---

## Rules Corey Stated (2026-03-16)

1. "It should not be you doing the work, we need agents doing the work" — Xhaka must direct, not execute
2. Physical Mac mini visit was considered but Xhaka confirmed remote install possible — Corey approved: "Yes"

---

## Context

- **Workspace:** 
- **GitHub repo:** 
- **Claude Code version:** 2.1.76 (latest as of 2026-03-16)
- **Paperclip:** Live, Xhaka agent connected as CEO role
- **Sessions captured:** c1fbe43e (main Telegram), 1906f18e (workspace-sync cron), c903cdb1 (researcher subagent)
