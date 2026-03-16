# REPOS.md — Repository Map

Single source of truth for where everything lives.

## The Three Repos

| Repo | Purpose | Status |
|---|---|---|
| [c7lavinder/xhaka](https://github.com/c7lavinder/xhaka) | Xhaka COO brain — memory, KB, intelligence jobs, control room, ROUTING | ✅ Active |
| [c7lavinder/NAH](https://github.com/c7lavinder/NAH) | New Again Houses — agents, automations, dashboards, playbooks, docs | 🏗️ Scaffold |
| [c7lavinder/MANUS-Gunner-AI](https://github.com/c7lavinder/MANUS-Gunner-AI) | Gunner call coaching SaaS — all product code | ✅ Active |

## What Goes Where

**Xhaka (`c7lavinder/xhaka`)**
- Xhaka COO memory and knowledge base (`memory/`)
- Intelligence jobs: morning brief, researcher, scribe, tool monitor (`services/intelligence/`)
- Control Room dashboard (`services/control-room/`)
- Routing rules, agent definitions, SOUL.md, AGENTS.md
- Nothing NAH-specific, nothing Gunner-specific

**NAH (`c7lavinder/NAH`)**
- Autonomous AI agents for NAH operations (`agents/`)
- GHL automations and workflows (`automations/`)
- Internal ops dashboards (`dashboards/`)
- Team playbooks, SOPs, call scripts (`playbooks/`)
- Team documentation and training (`docs/`)
- Nothing Xhaka-internal, nothing Gunner

**Gunner (`c7lavinder/MANUS-Gunner-AI`)**
- All Gunner product code (branch: `production` only — never `main`)
- Xhaka never touches this repo directly
- Builder is the only agent with write access

## Rules
- Never mix business logic across repos
- Xhaka intelligence jobs that support NAH go in `xhaka` (they're Xhaka's job)
- NAH-specific automations, agents, and tools go in `NAH`
- If unsure which repo → check ROUTING.md → ask Xhaka
