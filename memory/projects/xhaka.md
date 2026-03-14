# Project: Xhaka

## What It Is
My home base. The Xhaka Railway project is the system that runs me — my memory, my intelligence jobs, my command center.

## Status: Active — Foundation Hardening 🔧

## Infrastructure
- **Repo:** c7lavinder/xhaka (GitHub — single source of truth)
- **Railway Project:** Xhaka (ID: 84c0d035-cf53-4edd-b29c-31aeb42caac9)
- **Environment:** production

## Services
| Service | ID | URL | Status |
|---|---|---|---|
| xhaka | e6f2c6d7-75a4-4573-b142-63869d0e1b4c | xhaka-production.up.railway.app | ✅ Online |
| xhaka-intelligence | e6a33162-f5ff-4916-a875-0a4fb86c934c | (background service) | ✅ Online |
| xhaka-control-room | 629682d3-c8d4-4907-9845-304587be36b2 | (control room dashboard) | ✅ Online |
| Links and Docs | 0498adcb-0b20-477e-b1a5-83c3673e79cf | — | ✅ Online |

> **Note:** `xhaka-brain` in the Gunner project is a wrongly-named Postgres DB — it is NOT the intelligence service. Ignore it.

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
- Updated OpenClaw from 2026.2.9 → 2026.2.17
- Gemini Flash added as model option (alias: gemini-flash)
- Google API key stored in auth-profiles.json
- Model routing plan: Gemini Flash for chat, Sonnet for code/technical

### Feb 19-26, 2026 — Memory Store During V2 Architecture
- Xhaka repo used as memory store during intensive Gunner V2 architecture/build sessions
- Key architectural decisions, process maps, build specs all written to daily logs
- org-chart/index.html built locally (v0.4) — Gunner V2 process map
- No Railway deployment yet

### Feb 26-Mar 1, 2026 — First Agent Definitions
- AGENTS.md created: lean AI team of 5 (Xhaka, Builder, Architect, Auditor, Researcher)
- SOUL.md updated: "I am a Partner/COO, not an engineer" added as Core Truth
- PATH-FORWARD.md created: master strategic roadmap for 3 active projects
- First sub-agent runs via OpenClaw (Gemini-based, Anthropic models broken for spawn)

### Mar 8, 2026 — OpenClaw Update + Role Clarity Milestone
- OpenClaw updated to v2026.3.7 via `npx pnpm@latest`
- `gemini-3.1-flash-lite-preview` added (alias: gemini-lite)
- SOUL.md updated: role clarity "I am a Partner/COO, not an engineer"
- MEMORY.md: "NO BUILDING" prime directive added
- GitHub repos cleaned up: 6 dead repos archived, 2 active

### Mar 12, 2026 — Control Room + Intelligence Hardening
- Old vanilla HTML control room (xhaka-production.up.railway.app/control-room) abandoned
- New Next.js 15 Control Room: c7lavinder/openclaw-control-room
  - Live URL: xhaka-control-room-production.up.railway.app
  - Stack: Next.js 15 + TypeScript + Tailwind v4 + Framer Motion
  - Data source: GitHub API reading from c7lavinder/xhaka repo
  - Pages: Home, Memory, Agents, Projects, System
- xhaka-links repo created: c7lavinder/xhaka-links → links-and-docs-production.up.railway.app
- 10 intelligence hardening fixes shipped + Auditor PASS

### Mar 13, 2026 — Foundation Hardening Day
- All 12 core files updated and audited (Auditor verdict: READY)
- workspace-sync cron active (every 30min, 16 files)
- session-memory-capture cron: first pass deployed, status uncertain
- Intelligence pipeline: 4 bugs fixed (capture, github.ts 422, stuck job reset, boot recovery)
- TELEGRAM_BOT_TOKEN set on correct service (xhaka-intelligence, Xhaka project)
- Railway service map corrected (two separate projects confirmed)
- 10 new tool profiles created across 12 categories
- Agent definitions built: agents/README.md, agents/guide.md, all agents updated

## Key Milestones
- 2026-03-11: Railway project created, intelligence service deployed
- 2026-03-11: Inbox/processed folders created, capture job now functional
- 2026-03-11: Command Center (showcase) live at xhaka-production.up.railway.app
- 2026-03-11: Memory system structured with subfolders
- 2026-03-12: Next.js control room built and deployed
- 2026-03-13: xhaka-control-room and Links and Docs services confirmed
- 2026-03-13: Session-capture cron added (OpenClaw native, every 4h)
- 2026-03-13: Foundation hardening phase begins, workspace-sync active

## Next Steps
- Verify session-capture cron is running cleanly (openclaw cron list)
- Run first memory synthesis (was planned for 2026-03-16)
- Confirm propagate/improve/cleanup jobs are healthy (were failing as of Mar 13)

## Known Issues (as of Mar 13)
- `organize` job: failed Mar 13 (11s) — new failure, needs diagnosis
- `propagate`, `improve`, `cleanup`: 0ms failures since Mar 12 — pre-existing, need Builder
- `tool-monitor`: code fix deployed, may need Railway redeploy

---
Last updated: 2026-03-14
