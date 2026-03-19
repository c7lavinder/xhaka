# Project: Xhaka

## What It Is
My home base. The Xhaka Railway project is the system that runs me — my memory, my intelligence jobs, my command center.

## Status: Active — Foundation Hardening 🔧

## Current State
The project is stable with all services online and functioning as expected. Recent sessions focused on team mapping and visual output, confirming the completion of all Xhaka week-1 builds. The control room has transitioned to a new Next.js setup, improving reliability and maintainability.

## Infrastructure
- **Repo:** c7lavinder/xhaka (GitHub — single source of truth)
- **Railway Project:** Xhaka (ID: 84c0d035-cf53-4edd-b29c-31aeb42caac9)
- **Environment:** production

## Services
| Service | ID | URL | Status |
|---|---|---|---|
| xhaka | e6f2c6d7-75a4-4573-b142-63869d0e1b4c | xhaka-production.up.railway.app | ✅ Online |
| xhaka-intelligence | e6a33162-f5ff-4916-a875-0a4fb86c934c | (background service) | ✅ Online |
| xhaka-control-room | 629682d3-c8d4-4907-9845-304587be36b2 | xhaka-control-room-production.up.railway.app | ✅ Online |
| xhaka-hindsight | 120da791-ab76-4b9d-9f35-32789b6ae390 | xhaka-hindsight-production.up.railway.app | ⚠️ 404 — New, unknown |
| Links and Docs | 0498adcb-0b20-477e-b1a5-83c3673e79cf | links-and-docs-production.up.railway.app | ✅ Online |

> **Note:** `xhaka-brain` in the Gunner project is a wrongly-named Postgres DB — it is NOT the intelligence service. Ignore it.
> **New 2026-03-19:** `xhaka-hindsight` service appeared — deployed 2026-03-16, returning 404. Ask Corey what this is.

## Intelligence Jobs
| Job | Schedule | Purpose |
|---|---|---|
| capture | Every 5 min | Polls intelligence/inbox/, routes to processed/ |
| propagate | Daily 6 AM CST | Updates agent files from processed intel |
| improve | Monday 6 AM CST | Pulls git history + Railway logs, extracts lessons |
| cleanup | Sunday 6 AM CST | Archives 30+ day memory files, summarizes months |

## OpenClaw Crons (native)
| Cron | Schedule | Purpose | Status |
|---|---|---|---|
| session-capture | Every 4h | Captures session state to memory | Added 2026-03-13 — needs verification |
| workspace-sync | Every 30min | Syncs local workspace → GitHub | Active as of Mar 13 |

## GitHub = Single Source of Truth
All workspace files stay synced to c7lavinder/xhaka main branch.
workspace-sync cron runs every 30 minutes (16 workspace files covered).

## Repo Structure
```
/
├── index.html          ← Command Center UI
├── server.js           ← Express static server
├── package.json
├── SOUL.md             ← My identity and rules
├── AGENTS.md           ← Agent org chart + memory protocol
├── MEMORY.md           ← Live brain (< 150 lines)
├── agents/             ← Agent definition files
├── intelligence/
│   ├── inbox/          ← Drop intel here for capture job
│   └── processed/      ← Processed intel items
├── memory/             ← Daily logs + subfolders
│   ├── archive/        ← Auto-archived old files
│   ├── important/      ← Permanently important items
│   ├── people/         ← Person profiles
│   ├── projects/       ← Project status files
│   ├── decisions/      ← Key decisions log
│   └── context/        ← Background knowledge
├── services/
│   └── intelligence/   ← Intelligence service source code
└── docs/               ← Specs and documentation
```

## Build History

### Feb 10-17, 2026 — Early xhaka Repo (Memory Only)
- Xhaka repo primarily a memory store for the Gunner V1 build sessions.
- Daily logs written to `memory/YYYY-MM-DD.md` during sessions.
- No railway deployment yet — local Mac mini + OpenClaw only.

### Feb 18, 2026 — OpenClaw Update