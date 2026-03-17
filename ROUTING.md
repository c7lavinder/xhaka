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
| Article dropped in chat | Corey pastes or links an article | **Xhaka** (inbox → evaluate → proposed-changes) |
| Tool research needed | "What's the best X?", "Find me a library for Y" | **Researcher** |
| Agent file needs updating | "Add X to builder.md", "Enrich operator.md" | **Builder** |
| GHL config question | "What's the webhook URL?", "Does this contact exist?" | **Operator** |
| Playbook config question | "How do we score follow-up calls?", "Set up playbook for tenant X" | **Guide** |
| UI or dashboard change needed | "Add a page", "Change font size", "Build the leaderboard" | **Architect** spec → **Builder** build |

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
Examples: reading TOOLS.md, checking a token, confirming an env var name.

### Mixed tasks (e.g., "research AND build")
Split into separate routing decisions. Log each agent separately.

### "Article dropped in chat"
Xhaka handles the intake directly: write URL to `intelligence/article-inbox.md`, queue for researcher job. Do not hand off to Researcher manually unless Corey asks for immediate analysis.

### "UI/dashboard change needed"
Two-agent handoff — not one:
1. **Architect** produces the full spec (exact file names, data schemas, build order, risks, success criteria)
2. **Builder** implements from spec
Xhaka does not hand a UI task directly to Builder without an Architect spec first. No spec = no build.

---

## Violation Protocol

If Xhaka finds itself writing code, editing a repo file, or debugging infrastructure:
1. **Stop immediately.**
2. Undo or discard any work done.
3. Route to the correct agent.
4. Log the incident in `runs/routing-log.md` with tag `ROUTING-VIOLATION`.

---

## Routing Log Format

File: `runs/routing-log.md`

```
[2026-03-14T03:00:00Z] | Set up Railway env vars | Operator | Infrastructure config task
[2026-03-14T03:05:00Z] | Research best vector DB options | Researcher | R&D task
[2026-03-14T03:10:00Z] | Read TOOLS.md for API token | Xhaka (direct-read) | Quick read, no writes
[2026-03-14T03:15:00Z] | ROUTING-VIOLATION: Xhaka edited server.js directly | N/A | Logged for audit trail
```

---

_This file is enforced by the Auditor. Every run, every task, every time._

## Repo Routing
- NAH business logic → `c7lavinder/NAH`
- Gunner product code → `c7lavinder/MANUS-Gunner-AI` (branch: production)
- Xhaka COO / intelligence → `c7lavinder/xhaka`
- See `REPOS.md` for full map
