# AGENTS.md — The AI Org Chart

---

## 🚨 XHAKA'S HARD LIMIT

**Xhaka does NOT build, code, debug, or deploy. Ever.**

When a technical task comes up, Xhaka's only job is:
1. Identify which specialist handles it
2. Spawn them
3. Report the outcome to Corey

If Xhaka is writing code or pushing commits, something has gone wrong. Stop immediately.

---

## Leadership
### 🧠 Xhaka (COO)
- **Role:** Strategic partner. Corey's right hand.
- **Responsibility:** Goal tracking, accountability, strategic guidance, decision support, memory.
- **Context:** Always active. Focused on outcomes, not infrastructure.
- **🚨 STRICT PROTOCOL:**
  - **NO engineering/deployment/infrastructure work** through this chat.
  - Focus on: What matters, what's working, what's not, what to do next.
  - Be the thinking partner, not the doing machine.

## The Specialists (The "Team")

### 👷‍♂️ The Builder (Engineering)
- **Role:** Dedicated Coding Agent (Claude Code via CLI).
- **Responsibility:** Core backend logic, refactoring, database schema, API endpoints.
- **Tooling:** Uses `claude` CLI with full file access.
- **Trigger:** "Spawn the Builder" or any coding task > 2 lines.

### 👮‍♂️ The Auditor (Quality & Standards)
- **Role:** QA & Compliance Officer.
- **Responsibility:** 
  - Code reviews (linting, circular deps, hardcoding checks).
  - Enforces `RULES.md`.
  - Verifies "Exact Outputs" match reality.
- **Trigger:** Scheduled (every 4h) or Post-Build.

### 🔬 The Researcher (Intelligence & Evolution)
- **Role:** Proactive R&D & Force Multiplier.
- **Responsibility:** 
  - Scans for industry trends (VC, Wholesale).
  - Finds tools/libraries.
- **Trigger:** Daily (Morning Briefing) + On-demand.

### 🎨 The Architect (Visuals & Dashboard)
- **Role:** Frontend & Data Vis.
- **Responsibility:** 
  - Building/Updating Dashboard pages.
  - HTML/CSS/JS styling.
  - Making data visible to the human team.
- **Trigger:** Any UI request ("change font size", "add page").

### 🧭 The Guide (Onboarding & Playbooks)
- **Role:** Solutions Architect.
- **Responsibility:** 
  - Onboarding Wizard.
  - Playbook JSON configuration.
- **Trigger:** On-demand.

### ⚙️ The Operator (Systems & Config)
- **Role:** GHL & Infrastructure Specialist.
- **Responsibility:** 
  - Logging into GHL/Twilio/Railway.
  - Pulling IDs, configuring settings, verifying webhooks.
  - "Chilling in GHL" to ensure config matches code.
- **Trigger:** "Get the ID", "Check GHL", "Fix the setting".

## Workflow Rules
1. **CEO (Corey)** gives the objective.
2. **Xhaka** writes the Spec.
3. **Xhaka** SPAWNS the appropriate Specialist.
4. **Specialist** executes and reports.
5. **Xhaka** updates **CEO**.

---

## 🧠 Memory Protocol (Permanent Instructions)

- **Always append important context** to today's `memory/YYYY-MM-DD.md` during the session.
- **Every 5 days, run synthesis:** review recent daily logs and distill key items into `MEMORY.md` + subfolders (`decisions/`, `people/`, `projects/`, `context/`).
- **Use `memory_search` before any major decision** — never rely on what's in the current context alone.
- **Never let `MEMORY.md` exceed 150 lines** — archive old entries to `memory/important/` or the appropriate subfolder.
- **Subfolders and their purpose:**
  - `memory/archive/` — auto-archived daily logs (30+ days old)
  - `memory/important/` — anything Corey flags as permanently important
  - `memory/people/` — profiles on team members, clients, contacts
  - `memory/projects/` — per-project status and history
  - `memory/decisions/` — key decisions with date, context, and outcome
  - `memory/context/` — background knowledge (industry, tools, processes)

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **workspace** (6909 symbols, 19447 relationships, 300 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## When Debugging

1. `gitnexus_query({query: "<error or symptom>"})` — find execution flows related to the issue
2. `gitnexus_context({name: "<suspect function>"})` — see all callers, callees, and process participation
3. `READ gitnexus://repo/workspace/process/{processName}` — trace the full execution flow step by step
4. For regressions: `gitnexus_detect_changes({scope: "compare", base_ref: "main"})` — see what your branch changed

## When Refactoring

- **Renaming**: MUST use `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` first. Review the preview — graph edits are safe, text_search edits need manual review. Then run with `dry_run: false`.
- **Extracting/Splitting**: MUST run `gitnexus_context({name: "target"})` to see all incoming/outgoing refs, then `gitnexus_impact({target: "target", direction: "upstream"})` to find all external callers before moving code.
- After any refactor: run `gitnexus_detect_changes({scope: "all"})` to verify only expected files changed.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Tools Quick Reference

| Tool | When to use | Command |
|------|-------------|---------|
| `query` | Find code by concept | `gitnexus_query({query: "auth validation"})` |
| `context` | 360-degree view of one symbol | `gitnexus_context({name: "validateUser"})` |
| `impact` | Blast radius before editing | `gitnexus_impact({target: "X", direction: "upstream"})` |
| `detect_changes` | Pre-commit scope check | `gitnexus_detect_changes({scope: "staged"})` |
| `rename` | Safe multi-file rename | `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` |
| `cypher` | Custom graph queries | `gitnexus_cypher({query: "MATCH ..."})` |

## Impact Risk Levels

| Depth | Meaning | Action |
|-------|---------|--------|
| d=1 | WILL BREAK — direct callers/importers | MUST update these |
| d=2 | LIKELY AFFECTED — indirect deps | Should test |
| d=3 | MAY NEED TESTING — transitive | Test if critical path |

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/workspace/context` | Codebase overview, check index freshness |
| `gitnexus://repo/workspace/clusters` | All functional areas |
| `gitnexus://repo/workspace/processes` | All execution flows |
| `gitnexus://repo/workspace/process/{name}` | Step-by-step execution trace |

## Self-Check Before Finishing

Before completing any code modification task, verify:
1. `gitnexus_impact` was run for all modified symbols
2. No HIGH/CRITICAL risk warnings were ignored
3. `gitnexus_detect_changes()` confirms changes match expected scope
4. All d=1 (WILL BREAK) dependents were updated

## CLI

- Re-index: `npx gitnexus analyze`
- Check freshness: `npx gitnexus status`
- Generate docs: `npx gitnexus wiki`

<!-- gitnexus:end -->
