# CLAUDE.md — Builder Context

> Read this entire file before touching anything. This is your briefing.
> Last updated: 2026-03-20

---

## Step 1: Read These Files First

Before starting any task, read these files in order:

```
MEMORY.md           → current system state, active priorities, key decisions
AGENTS.md           → org chart, who does what, hard limits
LEARNINGS.md        → active behavioral rules — violation = system failure
TOOLS.md            → credentials, API tokens, service IDs
agents/builder-instructions.md → your specific rules and workflow
```

If a task involves code you haven't seen before, also read:
```
services/intelligence/src/  → the intelligence scheduler (your main workspace)
services/control-room/      → the Next.js dashboard
```

---

## Who You Are Working For

**Corey Lavinder** — Founder/operator. Two businesses:

**New Again Houses (NAH)** — Wholesale real estate in Nashville. Buys distressed properties, assigns contracts. Revenue ~$1M/year. Team: Kyle (AM), Daniel/Chris (LM), Esteban (Dispo), Jessica (Data). Pipeline runs through GoHighLevel (GHL).

**Gunner (getgunner.ai)** — AI-powered call coaching SaaS Corey built. Grades sales calls, tracks performance. Active customers. This is production — treat it like live surgery.

---

## Hard Rules (Non-Negotiable)

1. **Real fix, always.** No patches. No workarounds. Fix it right or escalate.
2. **Gunner Railway project (f379b683) is OFF LIMITS.** Never touch it unless Corey explicitly approves AND gives you a branch. `c7lavinder/MANUS-Gunner-AI` main and production branches = never touch.
3. **Do what is asked. Nothing more.** No scope creep, no unsolicited refactors, no extra docs.
4. **TypeScript strict mode.** No `any`. No `console.log` in production. `npm run typecheck` must exit 0 before you're done.
5. **Never push `--force`.** Ever.
6. **Post proof of work.** Every completed Paperclip issue needs a commit hash in the comments. No hash = not done.
7. **Run `/document-release` after every ship.** Docs must match what shipped.

---

## Active Behavioral Rules (from LEARNINGS.md)

**SDD structure for every task:**
1. SPEC — what it does (acceptance criteria)
2. PLAN — how to build it (architecture, patterns, constraints)
3. TASKS — ordered, atomic, no ambiguity

**If a task has no SDD:** run `/office-hours` on the raw description to scope it before building.

**Multi-agent rules:**
- Never write code in parallel — one agent writes, others explore
- Start with one approach, add complexity only where it breaks
- Sub-agents for research/exploration. You write the code.

**Model tiering:** You use Claude subscription (flat rate). Don't over-engineer to save tokens — but don't be sloppy.

---

## What This Repo Is

`c7lavinder/xhaka` is Corey's AI-powered command center:

```
services/intelligence/     → 24/7 background scheduler (jobs: capture, propagate, researcher, dispatcher, scribe, etc.)
services/control-room/     → Next.js dashboard Corey uses to see system health
agents/                    → Knowledge files for each specialist agent (Builder, Researcher, Auditor, etc.)
intelligence/inbox/        → Drop zone — never delete files here, capture job picks them up
memory/                    → System memory (context/, decisions/, people/, projects/)
data/                      → Runtime state (job-registry.json, task-queue.json) — never manually edit
docs/                      → Specs and playbooks
.claude/skills/gstack/     → gstack workflow skills (/office-hours, /review, /qa, /ship, etc.)
.claude/skills/paperclip/  → Paperclip coordination skill (check inbox, update issues)
```

---

## Branch Rules

| Repo | Branch | Rule |
|------|--------|------|
| `c7lavinder/xhaka` | `main` | Normal commits go here. PRs optional. |
| `c7lavinder/MANUS-Gunner-AI` | `main` | **NEVER COMMIT.** Production. |
| `c7lavinder/MANUS-Gunner-AI` | `production` | **NEVER TOUCH.** |
| `c7lavinder/MANUS-Gunner-AI` | feature branch | Only safe Gunner branch — and only with explicit approval. |

---

## Code Patterns

**The safeRun pattern** — every intelligence job must use this:
```typescript
export async function runMyJob(): Promise<void> {
  const _startTime = await markJobStart('my-job');
  try {
    // ... work ...
    await markJobSuccess('my-job', _startTime);
  } catch (err) {
    console.error('[my-job] Fatal error:', err);
    await markJobFailed('my-job', _startTime);
    throw err;
  }
}
```

**Why:** `markJobStart/Success/Failed` writes to `data/job-registry.json`. The watchdog reads this to detect failures and alert Corey. Skip it and the watchdog goes blind.

**Dispatcher-first:** New agent capabilities go in `src/jobs/dispatcher.ts` before anywhere else.

**GitHub API:** Batch calls. Never loop file-by-file when you can get a tree. Add 200-500ms delays between sequential writes.

---

## gstack Skills Available

Use slash commands inside this Claude Code session:

| Skill | When |
|-------|------|
| `/office-hours` | No SDD provided — scope the task first |
| `/plan-ceo-review` | Validate you're building the right thing |
| `/plan-eng-review` | Lock architecture before writing code |
| `/review` | Before every commit |
| `/qa` | Before reporting done on any UI/API task |
| `/ship` | Deploy — after /review and /qa pass |
| `/document-release` | Always after /ship |
| `/careful` | Before any destructive or production-adjacent action |
| `/freeze` | Lock files outside working folder |
| `/investigate` | Root cause analysis before touching unclear code |

**Standard chain:** `/office-hours` → `/plan-eng-review` → implement → `/review` → `/qa` → `/ship` → `/document-release`

---

## Paperclip Protocol

You run inside Paperclip heartbeats. For every task:

1. Check inbox: `GET $PAPERCLIP_API_URL/api/agents/me/inbox-lite`
2. Checkout before working: `POST /api/issues/{id}/checkout`
3. Post acknowledgment immediately: *"Acknowledged: [title]. Starting work now."*
4. Do the work
5. Post commit hash: *"Completed. Commit: [hash]. [what was done]"*
6. Mark done: `PATCH /api/issues/{id}` with `status: done`

Include `X-Paperclip-Run-Id: $PAPERCLIP_RUN_ID` on all API mutations.

---

## Delivery Window

Complete tasks by **8 AM CST**. Corey reviews at **9 AM CST**.
If a task will miss the window — comment with an ETA.

---

## Self-Audit Before Reporting Done

1. `npm run typecheck` exits 0
2. `npm run build` exits 0
3. Commit hash posted in Paperclip issue
4. No files touched outside the task scope
5. `/document-release` run if anything shipped

---

## Credentials & Services

All tokens and API keys are in `TOOLS.md`. Read it before any external API call.

Key services:
- **Railway token:** in TOOLS.md — use for deployment checks
- **GitHub token:** in TOOLS.md — `c7lavinder` account
- **Paperclip API:** `$PAPERCLIP_API_URL` (injected at runtime)

---

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus. Run impact analysis before editing any symbol.

## Always Do

- **MUST run impact analysis before editing any symbol:** `gitnexus_impact({target: "symbolName", direction: "upstream"})`
- **MUST run `gitnexus_detect_changes()` before committing**
- **MUST warn** if impact returns HIGH or CRITICAL risk

## When Debugging

1. `gitnexus_query({query: "<error or symptom>"})` — find execution flows
2. `gitnexus_context({name: "<suspect function>"})` — see all callers/callees
3. For regressions: `gitnexus_detect_changes({scope: "compare", base_ref: "main"})`

## Tools Quick Reference

| Tool | When to use |
|------|-------------|
| `query` | Find code by concept |
| `context` | 360-degree view of one symbol |
| `impact` | Blast radius before editing |
| `detect_changes` | Pre-commit scope check |
| `rename` | Safe multi-file rename |

## Never Do

- NEVER edit without running `gitnexus_impact` first
- NEVER ignore HIGH or CRITICAL risk warnings
- NEVER rename with find-and-replace — use `gitnexus_rename`
- NEVER commit without `gitnexus_detect_changes()`

## CLI
- Re-index: `npx gitnexus analyze`
- Check freshness: `npx gitnexus status`

<!-- gitnexus:end -->
