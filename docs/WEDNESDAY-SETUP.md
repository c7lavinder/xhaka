# WEDNESDAY SETUP — Claude Code Command Center

> **Audience:** Person physically at the Mac mini (`/Users/wholesaleai`) running terminal commands.
> **Goal:** Get Builder (Claude Code) wired, secured, and connected to our stack by end of session.
> **Rule:** Execute every section in order. Do not skip ahead. Each step unlocks the next.

---

## Section 0: Pre-Flight (Do This First, Touch Nothing Else)

### 0.1 — Security Scan

Before installing anything new, scan the current state:

```bash
npx ecc-agentshield scan
```

**What this does:** AgentShield scans your `.claude/` directory — settings.json, any existing plugins, MCP configs — and grades the security posture A through F using a three-agent Opus pipeline.

**Grade breakdown:**
| Grade | Meaning | Action |
|-------|---------|--------|
| **A** | Deny rules present, no dangerous permissions, MCP servers allowlisted | Proceed |
| **B** | Minor gaps (weak deny rules, one MCP unreviewed) | Fix before continuing |
| **C** | No deny rules OR dangerous flag in use | STOP — fix Section 2 first |
| **D** | Missing settings file + active dangerous permissions | STOP — fix Section 2 first |
| **F** | No config at all, or known vulnerable pattern found | STOP — rebuild from scratch |

**If scan finds issues, auto-fix safe ones:**
```bash
npx ecc-agentshield scan --fix
```

**For full deep analysis (3 Opus agents, slowest but most thorough):**
```bash
npx ecc-agentshield scan --opus --stream
```

---

### 0.2 — Check Claude Version

```bash
claude --version
```

**Required:** `≥ 2.0.65` (CVE-2026-21852 patch — prompt injection via malicious repo files)

**If outdated:**
```bash
npm update -g @anthropic-ai/claude-code
# Verify:
claude --version
```

**If Claude Code isn't installed at all, go to Section 1 first, then come back.**

---

## Section 1: Core Installation

### 1.1 — Install Claude Code

```bash
npm install -g @anthropic-ai/claude-code
```

**Why npm, not brew:** The npm package gets security patches faster. Claude Code CVEs are patched in npm within hours; brew taps can lag days.

### 1.2 — Verify Installation

```bash
claude --version
which claude
claude --help
```

Expected output: version number ≥ 2.0.65, binary at `/opt/homebrew/bin/claude` or `/usr/local/bin/claude`.

### 1.3 — First-Run Authentication

```bash
claude
```

On first run, Claude Code will open a browser to authenticate with Anthropic. Complete the OAuth flow. Your API key gets stored at `~/.claude/credentials.json`.

**Verify auth worked:**
```bash
claude -p "echo hello"
```

Expected: `hello` (or similar). If you see an auth error, re-run `claude` without flags to re-authenticate.

### 1.4 — Set Working Directory for Builder

When spawning Builder for xhaka tasks, always navigate to the repo first:

```bash
cd /Users/wholesaleai/.openclaw/workspace
# OR for direct repo work:
cd /path/to/local/xhaka-checkout
```

Claude Code uses the current directory as its working directory. All relative paths, git operations, and file edits happen relative to where you launch it.

---

## Section 2: Security Hardening (NON-NEGOTIABLE — Do Before Any Real Work)

### WHY This Comes Before Code

Builder has terminal access. Without deny rules, a malicious prompt injected via a file it reads could instruct it to delete files, push to production, or exfiltrate secrets. This is not hypothetical — CVE-2026-21852 was exactly this vector. Hardening takes 5 minutes and prevents irreversible damage.

### 2.1 — Create Global Settings File

This applies to ALL Claude Code sessions on this machine:

```bash
mkdir -p ~/.claude
cat > ~/.claude/settings.json << 'EOF'
{
  "permissions": {
    "allow": [
      "Bash(git status)",
      "Bash(git diff*)",
      "Bash(git log*)",
      "Bash(git add*)",
      "Bash(git commit*)",
      "Bash(git checkout*)",
      "Bash(git branch*)",
      "Bash(npm run*)",
      "Bash(npm install*)",
      "Bash(npm test*)",
      "Bash(npx gitnexus*)",
      "Bash(npx tsc*)",
      "Bash(cat *)",
      "Bash(ls *)",
      "Bash(find *)",
      "Bash(grep *)",
      "Read(*)",
      "Write(*)",
      "Edit(*)"
    ],
    "deny": [
      "Bash(git push --force*)",
      "Bash(git push*origin main*)",
      "Bash(git push*origin master*)",
      "Bash(rm -rf*)",
      "Bash(sudo *)",
      "Bash(curl * | bash*)",
      "Bash(wget * | bash*)",
      "Bash(chmod 777*)",
      "Bash(git reset --hard HEAD~*)",
      "Bash(dropdb*)",
      "Bash(drop table*)",
      "Bash(psql*DROP*)",
      "Bash(railway down*)",
      "Bash(pm2 delete*)"
    ]
  },
  "env": {
    "DISABLE_TELEMETRY": "true"
  }
}
EOF
```

### 2.2 — Create Project-Level Settings for xhaka Repo

Place this in the repo root. It's git-tracked so all team members inherit it:

```bash
mkdir -p .claude
cat > .claude/settings.json << 'EOF'
{
  "permissions": {
    "deny": [
      "Bash(git push*origin main*)",
      "Bash(git push --force*)",
      "Bash(rm -rf src*)",
      "Bash(rm -rf services*)",
      "Bash(railway down*)"
    ]
  }
}
EOF
```

**Why two settings files?** Global (`~/.claude/`) protects the machine. Project (`.claude/`) protects the specific repo and travels with the code to any developer's machine.

### 2.3 — The Bash Sandbox

Claude Code's bash sandbox is **not a container** — it runs your actual shell. What it does:
- Every `Bash()` tool call goes through the permissions engine first
- `deny` rules are enforced before execution — Claude cannot override them
- `allow` rules skip the manual approval prompt (Builder doesn't pause and ask)
- Anything not in allow or deny requires explicit user approval at runtime

**Verify the sandbox is working:**
```bash
# Run Claude Code and try a denied command
claude -p "run: rm -rf /tmp/test-sandbox-verify"
```

Expected: Claude Code should refuse with a permissions error, not execute the command.

### 2.4 — Audit Script (Run Anytime)

```bash
#!/bin/bash
echo "=== Claude Code Security Audit ==="
[ -f ~/.claude/settings.json ] && echo "[OK] Global settings found" || echo "[WARN] No global settings"
grep -q '"deny"' ~/.claude/settings.json 2>/dev/null && echo "[OK] Deny rules present" || echo "[WARN] No deny rules in global settings"
[ -f .claude/settings.json ] && echo "[OK] Project settings found" || echo "[INFO] No project settings"
echo "Current claude version: $(claude --version)"
echo "=== Audit complete ==="
```

---

## Section 3: CLAUDE.md — The Most Important File

### What CLAUDE.md Does

CLAUDE.md is Builder's permanent context. It's injected into every session as a system-level reminder — the first thing Claude Code reads before any task. Think of it as the briefing Builder gets every single morning:
- What repo this is, what it does
- What patterns to follow
- What it is NEVER allowed to do
- Where the dangerous code lives that it shouldn't touch

**Without CLAUDE.md:** Builder starts every session cold. It guesses at patterns, violates conventions, and needs correction constantly.

**With CLAUDE.md:** Builder walks in knowing the architecture, the rules, and the boundaries. Consistent output across every session.

### What to Put In It

The golden rule: **architecture decisions that don't change weekly**. Not tutorials. Not "how to install Node." The knowledge that if Builder got it wrong, you'd waste hours fixing it.

- Naming conventions and code patterns
- What NOT to do (most important section)
- Which branches are dangerous
- Which services are off-limits
- The testing requirement
- The GitNexus impact check requirement

### 3.1 — Create CLAUDE.md for c7lavinder/xhaka

Create this file at the **repo root** (`/path/to/xhaka/CLAUDE.md`):

```markdown
# CLAUDE.md — Builder Context for c7lavinder/xhaka

> This file is loaded automatically every session. Read it before touching any code.
> Last updated: 2026-03-16

---

## What This Repo Is

`c7lavinder/xhaka` is the command center for Corey's AI-powered operations. It contains:

- **services/intelligence/** — The 24/7 background scheduler that runs 30+ jobs (capture, propagate, researcher, dispatcher, scribe, etc.). Deployed on Railway.
- **services/control-room/** — The Next.js dashboard Corey uses to see system health. Deployed on Railway.
- **services/hindsight/** — Analytics service (in progress).
- **agents/*.md** — Knowledge files for each specialist agent (Builder, Researcher, Auditor, etc.). These get auto-updated by the intelligence service.
- **intelligence/inbox/** — Where Xhaka drops files to be processed. The capture job picks these up every 5 minutes.
- **memory/context/technology/** — KB articles and research. Read-only for Builder.
- **data/** — Runtime state files (job-registry.json, task-queue.json, results-log.json). These are written by the intelligence service, not by you.

---

## Repository Structure

```
c7lavinder/xhaka/
├── services/
│   ├── intelligence/          ← Primary service — your main workspace
│   │   ├── src/
│   │   │   ├── jobs/          ← One file per scheduled job
│   │   │   ├── lib/           ← Shared clients (github.ts, openai.ts, railway.ts)
│   │   │   ├── utils/         ← Shared helpers (job-registry.ts, task-queue.ts, etc.)
│   │   │   ├── scheduler.ts   ← node-cron registration
│   │   │   └── index.ts       ← Entry point + health server
│   │   └── package.json
│   └── control-room/          ← Next.js dashboard — only touch if task explicitly says so
├── agents/                    ← Knowledge files — only append, never rewrite
├── intelligence/inbox/        ← Drop zone — never delete files here
├── data/                      ← Runtime state — never manually edit
└── docs/                      ← Specs and playbooks
```

---

## Branch Rules

| Repo | Branch | Rule |
|------|--------|------|
| `c7lavinder/xhaka` | `main` | Only branch. Commits go here directly. PRs optional. |
| `c7lavinder/MANUS-Gunner-AI` | `main` | **NEVER COMMIT HERE.** Gunner's main is production. |
| `c7lavinder/MANUS-Gunner-AI` | `production` | **NEVER TOUCH.** This is live Gunner. |
| `c7lavinder/MANUS-Gunner-AI` | `dev` or feature branch | Only safe branch for Gunner work. |

**Gunner (`MANUS-Gunner-AI`) is a separate live production system. Never touch it unless explicitly told to AND given a feature branch.**

---

## Code Standards

### TypeScript — Strict Mode
- This is a strict TypeScript project (`"strict": true` in tsconfig.json)
- No `any` types without an explicit comment explaining why
- No `// @ts-ignore` — fix the type error instead
- Run `npm run typecheck` before declaring a task complete

### The safeRun Pattern
Every job must use try/catch and call the appropriate registry helper:

```typescript
export async function runMyJob(): Promise<void> {
  const _startTime = await markJobStart('my-job');
  try {
    // ... do work ...
    await markJobSuccess('my-job', _startTime);
  } catch (err) {
    console.error('[my-job] Fatal error:', err);
    await markJobFailed('my-job', _startTime);
    throw err;
  }
}
```

**Why:** `markJobStart/Success/Failed` writes to `data/job-registry.json`. The watchdog job reads this to detect stuck/failed jobs and alert Corey. If you skip this, the watchdog goes blind.

### Dispatcher-First Pattern
New agent capabilities are registered in `src/jobs/dispatcher.ts` before they exist anywhere else. The task queue drives execution — agents don't self-trigger.

### Error Handling
- Never swallow errors silently
- Always log the job name prefix: `[job-name] message`
- Use `throw err` after `markJobFailed` so Railway marks the deployment unhealthy

### GitHub API Rate Limits
- The intelligence service makes many GitHub API calls. Prefer batched operations.
- Never loop over every file individually if you can get a tree in one call
- Add 200-500ms delays between sequential GitHub writes to avoid secondary rate limits

---

## GitNexus — Run Before Every Edit

The AGENTS.md in this repo contains GitNexus instructions. Follow them.

**Before editing any function, class, or method:**
```
gitnexus_impact({target: "functionName", direction: "upstream"})
```

**If impact returns HIGH or CRITICAL:** Stop. Report to Xhaka before proceeding.

**Before committing:**
```
gitnexus_detect_changes({scope: "staged"})
```

**To re-index after adding new files:**
```bash
npx gitnexus analyze
```

---

## What You Are Allowed to Do

- Edit any file in `services/intelligence/`
- Add new jobs to `src/jobs/` following the safeRun pattern
- Add new utility functions to `src/utils/`
- Update `src/jobs/dispatcher.ts` to route new task types
- Commit to `main` in this repo (c7lavinder/xhaka)
- Run `npm test`, `npm run typecheck`, `npm run build`
- Append to `agents/*.md` files (never rewrite sections that already exist)
- Create new `docs/` files when explicitly tasked

## What You Are NOT Allowed to Do

- Touch anything in `c7lavinder/MANUS-Gunner-AI` (Gunner is off-limits unless you have a branch)
- Push to `origin main` with `--force` (ever)
- Rewrite existing sections in `agents/*.md` files
- Manually edit `data/job-registry.json` or `data/task-queue.json`
- Delete files from `intelligence/inbox/`
- Skip `npm run typecheck` and `npm run build` before reporting completion
- Create new `.md` or README files unless explicitly asked
- Modify tests to make them pass — fix the code instead

---

## Acceptance Criteria Template (Use This for Every Task)

Before starting any task, confirm these acceptance criteria exist in your task:
- [ ] What endpoint/function/behavior is being changed?
- [ ] What does success look like (concrete output or behavior)?
- [ ] Which tests must pass?
- [ ] Which files must NOT be touched?

If any are missing, stop and ask for clarification before writing code.

---

## Self-Audit Before Reporting Complete

Before saying "done," verify:
1. `npm run typecheck` exits 0
2. `npm run build` exits 0
3. `gitnexus_detect_changes()` shows only expected files changed
4. No d=1 (WILL BREAK) dependents were left updated
5. All tasks in your todo list are marked complete

---

*This file is the contract. If it conflicts with a task prompt, the task prompt wins — but flag the conflict.*
```

### 3.2 — Where to Put CLAUDE.md

| Scope | Location | Loaded When |
|-------|----------|-------------|
| Global (all projects) | `~/.claude/CLAUDE.md` | Every session on this machine |
| Project (this repo) | `xhaka/CLAUDE.md` | Every session in this repo |
| Subdirectory | `services/intelligence/CLAUDE.md` | When Builder is working in that directory |

For our setup: repo-level `CLAUDE.md` + `services/intelligence/CLAUDE.md` (created in Section 4 of this playbook).

---

## Section 4: MCP Tools Installation

MCP (Model Context Protocol) servers give Builder capabilities beyond what's built into Claude Code. Each MCP server runs as a local process that Builder communicates with via a standardized protocol.

### How MCP Config Works

MCP servers are registered in `~/.claude.json` (global) or `.mcp.json` (project-specific). The command `claude mcp add` is the easiest way to register them.

---

### 4.1 — GitNexus (Code Intelligence — Install This First)

**What it does for us:** GitNexus builds a call graph of the entire xhaka codebase — 6,909 symbols, 19,447 relationships, 300 execution flows (per current AGENTS.md). Before Builder edits any function, it can query "who calls this?" and get an exact blast radius. Without GitNexus, Builder edits code blind. With it, Builder knows if touching `markJobFailed` will break 14 other jobs.

**Install the MCP server:**
```bash
claude mcp add gitnexus -- npx -y gitnexus@latest mcp
```

**Index the xhaka repo (run from repo root):**
```bash
cd /path/to/xhaka
npx gitnexus analyze
```

This creates the knowledge graph locally. Takes 2-5 minutes on first run. Creates a `.gitnexus/` directory in the repo.

**Verify it's working:**
```bash
npx gitnexus status
```

Expected output: index freshness timestamp, symbol count, relationship count.

**How Builder uses it:**

The AGENTS.md already contains the full GitNexus protocol. The key commands Builder must run before any edit:

```
# Before editing a function:
gitnexus_impact({target: "runDispatcher", direction: "upstream"})

# Before committing:
gitnexus_detect_changes({scope: "staged"})

# When exploring unfamiliar code:
gitnexus_query({query: "job registration scheduler"})
```

**Re-index after adding new files:**
```bash
npx gitnexus analyze
```

---

### 4.2 — Superpowers (Agentic Skills Framework)

**What it does for us:** Superpowers (by obra) installs a skills framework that gives Builder an auto-triggered workflow methodology. Instead of Builder improvising how to approach a task, Superpowers injects structured skills at session start — plan-before-code, test-after-edit, self-audit-before-done. It's the discipline layer that makes Builder work autonomously for hours without deviating from the plan.

**Install via Claude Code's plugin system:**
```bash
# Open Claude Code interactively:
claude

# Inside the Claude Code session, run:
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace
```

**Verify it installed:**
```bash
claude -p "/skills list"
```

Expected: List of available skills (getting-started, plan, review, etc.)

**What Builder gets after install:**
- A session-start hook that bootstraps the skills system
- `/plan` skill — forces structured planning before code
- `/review` skill — code review checklist
- Automatic discipline enforcement — Claude works for hours without going off-script

**Note:** Superpowers works via Claude Code's plugin system (not MCP). It hooks into session start and teaches Claude Code how to have skills.

---

### 4.3 — gstack (Workflow Roles — Garry Tan's Setup)

**What it does for us:** gstack (by Garry Tan, YC President) packages Claude Code into 10 specialist roles: CEO plan reviewer, engineering manager, release manager, QA engineer, browser automator, doc engineer, and more. For our setup, the most useful are `/plan-eng-review` (engineering spec review before Builder starts) and `/ship` (one-command deployment flow).

**Install:**
```bash
# Clone gstack into your Claude skills directory
git clone https://github.com/garrytan/gstack ~/.claude/skills/gstack

# Run setup (builds the binary and registers skills)
cd ~/.claude/skills/gstack && ./setup
```

**Add to project CLAUDE.md** (add this section):
```markdown
## gstack Skills Available
Use these gstack skills in this project:
- `/plan-ceo-review` — Does the plan solve the right problem?
- `/plan-eng-review` — Is the engineering approach sound?
- `/review` — Code review before commit
- `/ship` — One-command ship flow
- `/qa` — QA checklist
- `/retro` — Post-task retrospective

If gstack skills aren't responding: `cd ~/.claude/skills/gstack && ./setup`
```

**Verify:**
```bash
# Inside a Claude Code session:
/skills list
# Should show gstack skills alongside Superpowers skills
```

**How Builder uses gstack for our workflow:**
1. Xhaka writes the SPEC/PLAN/TASKS
2. Builder runs `/plan-eng-review` on the PLAN section before writing code
3. Builder runs `/review` before committing
4. Builder runs `/qa` before reporting done
5. Builder runs `/ship` to deploy (wraps Railway deploy commands)

---

## Section 5: Compound Engineering Plugin

**What it does for us:** The Compound Engineering Plugin (by Every/Dan Shipper) is a philosophy-as-code tool. It makes each unit of engineering work compound into the next — patterns, decisions, and lessons from one task get automatically captured and injected into future tasks. Think of it as GitNexus for knowledge rather than code structure.

For OpenClaw specifically: the `--to openclaw` flag converts the Claude Code plugin format into OpenClaw's skill format, so the same compound engineering patterns are available when Xhaka spawns subagents.

**Install for Claude Code:**
```bash
# Inside a Claude Code session:
/plugin marketplace add EveryInc/compound-engineering-plugin
/plugin install compound-engineering
```

**Install for OpenClaw (run in terminal):**
```bash
bunx @every-env/compound-plugin install compound-engineering --to openclaw
```

**What this unlocks:**
- Automatic documentation of patterns as you work
- Each Builder task builds on lessons from previous tasks
- Reduces repeated mistakes without explicit CLAUDE.md updates
- The compound effect: task 10 is faster and more reliable than task 1

**Verify (inside Claude Code session):**
```bash
/plugin list
# compound-engineering should appear
```

---

## Section 6: Paperclip Integration

Paperclip is the issue-tracking and agent orchestration layer. It's the mechanism that converts a Corey → Xhaka → Builder handoff into a structured, trackable, asynchronous workflow.

### The Architecture

```
Corey (Telegram)
    ↓
Xhaka (OpenClaw) — receives request, writes spec
    ↓
Xhaka creates Paperclip issue → assigns to Builder
    ↓
Paperclip wakes Builder (wakeOnAssignment: true)
    ↓
Builder checks out issue → status: in_progress
    ↓
Builder executes (reads code, edits, commits, tests)
    ↓
Builder marks issue done → adds proof-of-work comment
    ↓
Xhaka receives completion → reports to Corey
```

### 6.1 — Verify Paperclip is Running

```bash
curl -fsS http://127.0.0.1:3100/api/health
```

Expected: `{"status":"ok","..."}`. If connection refused, start it:

```bash
# Find paperclip location:
find /Users/wholesaleai -name "paperclipai" -maxdepth 6 2>/dev/null
ls ~/paperclip 2>/dev/null

# Start it:
cd ~/paperclip && pnpm paperclipai run
```

### 6.2 — Wire Builder to Paperclip

See the full wiring guide at `memory/context/technology/paperclip-xhaka-wiring-guide.md`. The short version:

1. Paperclip UI → `http://localhost:3100` → Company Settings → Generate OpenClaw Invite Prompt
2. Paste invite into Telegram chat → Xhaka connects
3. Register Builder as `claude_local` adapter agent (see wiring guide for full JSON)
4. Set ANTHROPIC_API_KEY in Paperclip secrets manager

### 6.3 — Verify the Full Loop

**Create a test issue manually:**
```bash
# Get company ID first:
curl http://localhost:3100/api/companies -H "Authorization: Bearer {your-token}"

# Create test issue:
curl -X POST http://localhost:3100/api/companies/{companyId}/issues \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "title": "TEST: Verify Builder loop",
    "description": "Add a comment to README.md saying Builder loop verified on YYYY-MM-DD",
    "status": "todo",
    "priority": "low",
    "assigneeAgentId": "{builder_agent_id}"
  }'
```

**Trigger Builder immediately:**
```bash
curl -X POST http://localhost:3100/api/agents/{builder_id}/heartbeat/invoke \
  -H "Authorization: Bearer {token}"
```

**Success looks like:**
- Issue status changes from `todo` → `in_progress` → `done`
- README.md gets a commit with the test comment
- Builder leaves a completion comment in the issue
- Xhaka reports back to Corey in Telegram

---

## Section 7: First Real Test

### The Test Task

Run this end-to-end to confirm everything is wired:

```bash
# From xhaka repo root
claude
```

Inside the Claude Code session:
```
I want you to:
1. Run `npx gitnexus status` and tell me the index freshness
2. Run `npm run typecheck` in services/intelligence and tell me the result  
3. Look at services/intelligence/src/jobs/dispatcher.ts and tell me which agents it can currently route to
4. Do NOT edit any files — this is a read-only verification task
```

**What success looks like:**
- GitNexus reports index freshness (not stale)
- TypeScript check exits 0 (no type errors)
- Builder correctly identifies all routable agents from dispatcher.ts
- No files were modified (verify with `git status`)

### If Something Breaks

| Symptom | Fix |
|---------|-----|
| `claude: command not found` | `npm install -g @anthropic-ai/claude-code` |
| `gitnexus: not found` | `npm install -g gitnexus` then `npx gitnexus analyze` |
| TypeScript errors in intelligence | Those are pre-existing. Note them, don't fix unless tasked |
| Permission denied on bash command | Check `.claude/settings.json` deny rules |
| GitNexus index stale | `npx gitnexus analyze` from repo root |

---

## Section 8: Ongoing Discipline

### Before Every Builder Task

**Checklist for Xhaka (before spawning Builder):**
- [ ] Is this a build task? (>2 lines of code change) → Yes: write a proper spec
- [ ] Does the spec have SPEC + PLAN + TASKS sections?
- [ ] Does SPEC have acceptance criteria?
- [ ] Does PLAN have: architecture decisions, constraints, TypeScript patterns, files NOT to touch?
- [ ] Are TASKS ordered, atomic, and self-contained?
- [ ] Is the GitNexus index fresh? (Builder will check, but Xhaka should know)

**Checklist for Builder (before starting):**
- [ ] Read CLAUDE.md
- [ ] Run `npx gitnexus status` — if stale, run `npx gitnexus analyze`
- [ ] Run `gitnexus_impact()` on every symbol in the task before editing

### Commit Discipline

**Max commits per task: 3-5**

| Commit # | What it contains |
|----------|-----------------|
| 1 | Core implementation (the main change) |
| 2 | Tests or type fixes required by #1 |
| 3 | Documentation or CLAUDE.md updates if pattern is new |
| 4-5 | Bug fixes discovered during testing |

**Never in one commit:** Multiple unrelated features, implementation + unrelated cleanup, "WIP" or "misc fixes"

**Commit message format:**
```
feat(intelligence): add voice-ingest job with dispatcher routing

- Adds src/jobs/voice-ingest.ts with safeRun pattern
- Registers voice-ingest in dispatcher.ts routing table  
- Adds 'voice-ingest' to job-registry.ts expected keys

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

### How to Write a Proper Builder Spec

**SPEC** (what it does — no implementation details):
```
SPEC:
Add a job that runs daily at 8 PM CST and sends a summary of the day's 
completed tasks to Corey via Telegram.

ACCEPTANCE CRITERIA:
- [ ] Job runs daily at 8 PM CST (verify in scheduler.ts)
- [ ] Message includes: jobs run, success/fail counts, any failures with error text
- [ ] Job uses markJobStart/Success/Failed pattern
- [ ] npm run typecheck exits 0 after implementation
- [ ] Does NOT touch control-room/ or agents/ or data/ files
```

**PLAN** (how to build it — implementation decisions):
```
PLAN:
- New file: src/jobs/daily-summary.ts
- Import: job-registry.ts (getJobRegistry), notifier.ts (sendTelegramMessage)
- Pattern: same safeRun structure as dispatcher.ts
- Register in scheduler.ts as '0 20 * * * America/Chicago'
- Register in EXPECTED_KEYS in job-registry.ts
- No new dependencies — use existing lib/http.ts for Telegram
- Do NOT modify existing jobs

Use TodoWrite to track all tasks.
```

**TASKS** (ordered, atomic):
```
TASKS:
1. [PARALLEL] Read src/utils/job-registry.ts AND src/utils/notifier.ts to understand API
2. [SEQUENTIAL] Create src/jobs/daily-summary.ts with safeRun pattern
3. [SEQUENTIAL] Add 'daily-summary' to EXPECTED_KEYS in job-registry.ts
4. [SEQUENTIAL] Register job in scheduler.ts
5. [SEQUENTIAL] Run npm run typecheck — fix any errors
6. [SEQUENTIAL] Run npm run build — verify clean compile
7. Confirm: git status shows only the 3 new/modified files expected
```

### What Xhaka Does vs What Builder Does

| Task | Xhaka | Builder |
|------|-------|---------|
| Define what to build | ✅ | ❌ |
| Write SPEC/PLAN/TASKS | ✅ | ❌ |
| Write code | ❌ | ✅ |
| Make architectural decisions mid-task | ❌ (pause, ask Xhaka) | ❌ |
| Run tests | ❌ | ✅ |
| Commit to git | ❌ | ✅ |
| Push to Railway (deploy) | ❌ | ✅ (only when task says to) |
| Report completion | ❌ | ✅ |
| Summarize for Corey | ✅ | ❌ |

**The hard rule: If Builder is making architectural decisions, something went wrong. The spec was ambiguous. Pause, clarify with Xhaka, rewrite the task.**

---

## Quick Reference Card

```bash
# Security scan
npx ecc-agentshield scan

# Check version
claude --version

# Index codebase
cd /path/to/xhaka && npx gitnexus analyze

# Check index freshness
npx gitnexus status

# Launch Builder (interactive)
claude

# Launch Builder (one-shot task)
claude -p "your task here"

# Install GitNexus MCP
claude mcp add gitnexus -- npx -y gitnexus@latest mcp

# Health check Paperclip
curl -fsS http://127.0.0.1:3100/api/health

# Type check intelligence service
cd services/intelligence && npm run typecheck

# Build intelligence service
cd services/intelligence && npm run build
```

---

*Built from: claude-code-system-prompt-analysis.md, ai-tool-prompts-comparison.md, paperclip-xhaka-wiring-guide.md, and live research — March 2026.*
