# Foundation Hardening Run
**Date:** 2026-03-13
**Objective:** Harden all repo files, establish reliable automation, fill every gap so Xhaka can be trusted to execute complex tasks without breaking things.

**Why this run exists:**
Corey's trust is at 10%. Root cause: discipline failures (touching wrong systems, building directly, not reading first) and stale/inaccurate files that cause bad context. This run fixes all of it permanently.

**Success criteria:**
- Every core file is accurate and current
- Memory pipeline is verified end-to-end
- Agent definitions are built and self-managing
- Local→GitHub sync is automatic
- HEARTBEAT.md monitors everything that matters
- Auditor gives PASS on all files

---

## Phase 2 — Builder Tasks

### 2A: Update all stale memory/project files

**`memory/projects/gunner.md`** — Update:
- crmStatus is now `connected` (fixed 2026-03-13)
- GHL OAuth fixed: saveGhlTokens now merges instead of overwrites
- Live URL is `gunner-production.up.railway.app`
- Manus dependency: Corey is migrating away from Manus-built UI, wants to rebuild visuals + functionality
- Gunner Railway project is OFF LIMITS for Xhaka — never touch without explicit authorization

**`memory/projects/xhaka.md`** — Update:
- Railway Xhaka project ID: 84c0d035-cf53-4edd-b29c-31aeb42caac9
- Services: xhaka (e6f2c6d7), xhaka-intelligence (e6a33162), xhaka-control-room (629682d3), Links and Docs (0498adcb)
- Intelligence jobs actually running: capture, daily-log, organize, propagate, synthesize, improve, cleanup, scribe, operator, tool-monitor, watchdog
- Session-capture cron added 2026-03-13 (OpenClaw native, every 4h)
- xhaka-brain in Gunner project is a Postgres DB — NOT the intelligence service (ignore it)

**`memory/projects/nah.md`** — Review and update if stale

**`memory/people/corey.md`** — Add:
- "Real fix, always" — permanent rule established 2026-03-13
- Gunner Railway is off limits for Xhaka
- Trust level context: Corey needs to see clean execution before handing over complex work

**`memory/decisions/key-decisions.md`** — Add today's decisions:
- 2026-03-13: New Gunner build workflow (Xhaka writes Claude Code prompts → Corey pastes to terminal, Cursor chat retired)
- 2026-03-13: Session-capture cron architecture (OpenClaw→GitHub inbox, not Railway→OpenClaw)
- 2026-03-13: Gunner Railway project is off limits for Xhaka
- 2026-03-13: "Real fix, always" established as permanent operating principle

**`PROJECTS.md`** — Update:
- Gunner: GHL connected, crmStatus ok. Blocker removed. New blocker: Corey working on visual rebuild + functionality improvement (migrating from Manus-built UI)
- Xhaka: Add session-capture cron, intelligence jobs running, agent definitions in progress

**`HEARTBEAT.md`** — Add checks:
- xhaka-intelligence service health (check job-registry for failed/stuck jobs)
- Session-capture cron status (openclaw cron list — is it erroring?)
- MEMORY.md line count (warn if approaching 150)

### 2B: Implement agent definitions from Architect spec

Read the Architect's output (which was delivered in the parent session — see summary below) and create/update these files in `c7lavinder/xhaka/agents/`:
- `agents/README.md` — usage protocol (new file)
- `agents/builder.md` — add Self-Scoping Rules + xhaka scope section + Output Format
- `agents/auditor.md` — add Self-Scoping Rules + xhaka scope section + Output Format
- `agents/operator.md` — complete rewrite with full identity, platforms, self-scoping, output format
- `agents/researcher.md` — complete rewrite with full identity, domains, self-scoping, output format
- `agents/architect.md` — add Self-Scoping Rules + Output Format
- `agents/guide.md` — new file: onboarding/playbook specialist

**Key additions to ALL agent definitions:**
- Self-Scoping Rules section: max API calls before concluding, time budget behavior, scope budget
- Structured output format (not open-ended prose)
- "STOPPED EARLY" protocol if approaching timeout

---

## Phase 3 — Operator Tasks

**Investigate session-memory-capture cron error:**
- Run `openclaw cron list` to see current status
- Run `openclaw cron runs 0bc114f3-c3e2-4684-ba46-708d97ff9d93` to see run history
- Identify why it shows "error" status despite writing a file successfully
- Fix the root cause

---

## Phase 4 — Builder: GitHub as Single Source of Truth

**Corey's directive:** Everything lives in GitHub. Not split between local workspace and GitHub. GitHub is the brain — always current, always accurate, always what Xhaka reads.

**Problem:** Local OpenClaw workspace (`/Users/wholesaleai/.openclaw/workspace/`) and GitHub repo (`c7lavinder/xhaka`) are two separate locations. Changes to one don't automatically go to the other. This causes stale context, split brain, and trust failures.

**Solution to build:**
1. An OpenClaw cron job that runs every 30 minutes and pushes ALL changed workspace files to GitHub:
   - MEMORY.md
   - PROJECTS.md  
   - AGENTS.md
   - HEARTBEAT.md
   - SOUL.md
   - TOOLS.md
   - USER.md
   - IDENTITY.md
   - memory/people/*.md
   - memory/projects/*.md
   - memory/decisions/*.md
   - memory/context/*.md
   - memory/YYYY-MM-DD.md (today's log)

2. The cron compares local file content to GitHub content. If different → push to GitHub. If same → skip.

3. Name it `workspace-sync`. Runs every 30 minutes.

**Result:** GitHub is always current within 30 minutes of any local change. Scribe, agents, and Corey can always trust what's on GitHub.

---

## Phase 5 — Auditor

Read all files in this runs/ folder. Then audit:
1. Every file updated in Phase 2 — is it accurate, complete, current?
2. Every agent definition file — does it have Identity, Scope, Self-Scoping Rules, Output Format?
3. HEARTBEAT.md — does it cover all critical systems?
4. PROJECTS.md — does it match reality?
5. MEMORY.md (both local and GitHub) — are they in sync? Under 150 lines?
6. Session-capture cron — is it healthy?

Output: PASS/FAIL per item. Final verdict: READY or NOT READY.
