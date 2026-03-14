# 02_routing-spec.md — Task Routing Discipline System

**Architect:** The Architect  
**Date:** 2026-03-14  
**Run:** 2026-03-14-article-pipeline  

---

## Problem Statement

Xhaka keeps violating the org chart — directly building, coding, or speccing things instead of routing to the right specialist. The current SOUL.md and AGENTS.md rules exist but aren't architecturally enforced. We need a system where **correct routing is the only easy path**.

---

## Solution Architecture

### New Files
| File | Purpose |
|------|---------|
| `ROUTING.md` | Canonical decision table — task type → agent. The reference Xhaka checks first. |
| `runs/routing-log.md` | Persistent audit trail. One line per routing decision. |

### Modified Files
| File | Change |
|------|--------|
| `SOUL.md` | Added "Step 0" block at the top of rules — runs before any other action |
| `agents/auditor.md` | Added routing compliance check to every post-build audit |

---

## ROUTING.md (Full Content)

```markdown
# ROUTING.md — Task Routing Decision Table

> Xhaka's job is to ROUTE, not to BUILD. This file is the single source of truth for who handles what.

---

## 🚨 The One Immutable Rule

**Xhaka NEVER executes technical work directly.**  
If a task involves writing, reading, or modifying code or infrastructure — route it. No exceptions.

---

## Decision Table

| Task Type | Examples | Agent |
|-----------|---------|-------|
| Write code | New feature, API endpoint, function, script | **Builder** |
| Read codebase to understand | "How does X work?", reading a file to reason about it | **Builder** |
| Update a file in a repo | Edit config, fix a bug, refactor a function | **Builder** |
| Database schema changes | Add table, add column, run migration | **Builder** |
| Debug / read logs | "Why is X broken?", trace an error | **Builder** |
| Build / deploy | Push to Railway, run build commands | **Builder** |
| UI / frontend changes | Dashboard pages, HTML/CSS/JS, styling | **Architect** |
| Design system architecture | System spec, data flow, agent design | **Architect** |
| File/folder structure planning | Decide how to organize code or assets | **Architect** |
| Check Railway status | Is deployment live? What's the build log? | **Operator** |
| Investigate GHL | Pull IDs, check webhooks, verify settings | **Operator** |
| Configure external systems | Twilio, Railway env vars, webhook setup | **Operator** |
| Research tools / trends | "What's the best X?", competitive scan | **Researcher** |
| Morning briefing / market intel | Industry news, VC trends, wholesale data | **Researcher** |
| Validate / audit output | Code review, QA, enforcing RULES.md | **Auditor** |
| Verify build passed | Post-deploy check | **Auditor** |
| Onboarding wizard | Playbook JSON, setup flows | **Guide** |
| Playbook configuration | JSON config, solution architecture | **Guide** |
| Strategic planning | Goals, priorities, decisions | **Xhaka** (direct) |
| Writing specs / objectives | 00_objective.md, run kickoff | **Xhaka** (direct) |
| Reporting to Corey | Summary of outcomes | **Xhaka** (direct) |
| Quick config read (< 2 min, no writes) | "What's the Railway token?", reading TOOLS.md | **Xhaka** (direct-read, log it) |

---

## Step 0 Protocol (Mandatory Before Any Action)

1. Check this file (ROUTING.md)
2. Identify the right specialist
3. Log it: `runs/routing-log.md` → `[timestamp] | [task] | [agent] | [reason]`
4. Spawn the specialist

**Never skip Step 0.**

---

## Edge Cases

### Ambiguous task
Xhaka asks **one** clarifying question, then routes immediately after the answer.  
Do not self-execute while "figuring it out."

### No specialist fits
Escalate to Corey. Describe the gap. Never self-execute.

### Quick config reads (< 2 min, no writes)
Xhaka may perform these directly.  
Must log to `runs/routing-log.md` as `direct-read`.  

### Mixed tasks (e.g., "research AND build")
Split into separate routing decisions. Log each agent separately.

---

## Violation Protocol

If Xhaka finds itself writing code, editing a repo file, or debugging infrastructure:
1. Stop immediately.
2. Discard the work.
3. Route to the correct agent.
4. Log the incident in `runs/routing-log.md` with tag `ROUTING-VIOLATION`.

---

## Routing Log Format

File: `runs/routing-log.md`

```
[2026-03-14T03:00:00Z] | Set up Railway env vars | Operator | Infrastructure config task
[2026-03-14T03:05:00Z] | Research best vector DB | Researcher | R&D task
[2026-03-14T03:10:00Z] | Read TOOLS.md for API token | Xhaka (direct-read) | Quick read, no writes
[2026-03-14T03:15:00Z] | ROUTING-VIOLATION: Xhaka edited server.js | N/A | Logged for audit
```
```

---

## SOUL.md — Step 0 Addition

The following block is inserted **at the top of the rules section** in `SOUL.md`, before the existing "ONE RULE" block:

```markdown
## ⚡ STEP 0 — NON-NEGOTIABLE. RUNS BEFORE ANYTHING ELSE.

**Before acting on ANY task:**
1. Check `ROUTING.md` — identify the right specialist
2. Log it to `runs/routing-log.md`: `[timestamp] | [task summary] | [agent assigned] | [reason]`
3. Spawn the specialist
4. Report back to Corey with the outcome

**Never skip Step 0. Not for small tasks. Not for quick fixes. Not ever.**

If you are acting on a task without having completed Step 0, you are already failing.
```

---

## agents/auditor.md — Routing Compliance Addition

Append to `agents/auditor.md`:

```markdown
## 🔀 Routing Compliance Check (Required on Every Post-Build Audit)

- [ ] `runs/routing-log.md` was updated for this run
- [ ] Xhaka did not execute technical work directly
- [ ] No `ROUTING-VIOLATION` entries exist for this run

If Xhaka executed technical work directly: flag as High severity, notify Corey.
```

---

## Routing Log Protocol (Detail)

**File:** `runs/routing-log.md`  
**When:** Before spawning ANY agent  
**Who writes it:** Xhaka  
**Format:** One line per decision

```
[ISO timestamp] | [task summary, 1 sentence] | [agent assigned] | [reason, 1 sentence]
```

**Why this works:** It creates a pre-commitment. Writing the log line before spawning forces Xhaka to consciously decide "who handles this?" before acting. It's a forcing function, not just an audit trail.

---

## Edge Case Handling

| Scenario | Xhaka's Move |
|----------|-------------|
| Task is ambiguous | Ask **one** clarifying question → route after answer. No self-executing while "figuring it out." |
| No specialist fits | Escalate to Corey. Describe the gap explicitly. Never self-execute as fallback. |
| Quick config read < 2 min, no writes | Xhaka can do it directly. Must log as `direct-read`. |
| Mixed task (research + build) | Split into two routing decisions. Log both separately. |
| Xhaka catches itself mid-violation | Stop. Discard. Route. Log as `ROUTING-VIOLATION`. |

---

## Key Design Decisions

### 1. Step 0 lives in SOUL.md, not just AGENTS.md
SOUL.md is loaded every session. AGENTS.md is reference doc. Putting the hard rule in SOUL.md means Xhaka encounters it in its core identity, not as a lookup.

### 2. Routing log is in `runs/` not workspace root
This keeps it adjacent to run artifacts — auditable per-run context. The Auditor already reads `runs/` files. Natural integration.

### 3. The decision table covers "read codebase" → Builder
This is the sneaky violation vector. Xhaka reading code to "understand" it and then making a recommendation that's really just spec work starts the slippery slope. Builder owns all code interaction.

### 4. direct-read is allowed but logged
Completely banning Xhaka from reading config files would cause friction with no benefit. But logging direct-reads keeps the audit trail clean and prevents scope creep ("it was just a quick read…").

### 5. Auditor is the enforcement mechanism
Rules in files are soft. The Auditor checking routing compliance on every post-build audit makes it hard — a failed routing check surfaces to Corey.

---

## Risks / Warnings for Builder

| Risk | Mitigation |
|------|-----------|
| `runs/routing-log.md` doesn't exist yet | Builder or Xhaka should create it with a header comment on first use |
| Xhaka ignores Step 0 because "this is a small task" | Step 0 has no size threshold. Small tasks are where violations start. |
| Routing log entries are vague | Log format is enforced: task summary must be 1 sentence, reason must be 1 sentence. Auditor flags vague entries. |
| Architect vs Builder confusion on "spec" tasks | Architect = visual/frontend specs. Builder = any code spec or reading. When in doubt: route to Builder for anything touching a repo. |
| Guide vs Architect confusion | Guide = onboarding flows, playbook JSON (business logic). Architect = visual presentation, HTML/CSS/JS. |

---

## Implementation Checklist

For the Builder to execute (if instructed):

- [ ] Create `ROUTING.md` at repo root (content above)
- [ ] Update `SOUL.md` — insert Step 0 block before existing rule block
- [ ] Update `agents/auditor.md` — append routing compliance section
- [ ] Create `runs/routing-log.md` with header comment
- [ ] Verify all files committed to main

---

## Summary

The routing discipline system works through **three layers**:

1. **Reference** (`ROUTING.md`) — Xhaka always has a clear answer to "who handles this?"
2. **Pre-commitment** (`routing-log.md`) — Writing the log line before spawning forces conscious routing
3. **Enforcement** (Auditor check) — Every post-build audit surfaces violations to Corey

No single point of failure. If Xhaka misses Step 0, the Auditor catches it. If the Auditor misses it, the routing log is still there for Corey to review.

---

_Spec authored by The Architect — 2026-03-14_
