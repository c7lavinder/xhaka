# Project: Xhaka

## What It Is
My home base. The Xhaka Railway project is the system that runs me — my memory, my intelligence jobs, my command center.

## Status: Active ✅

## Infrastructure
- **Repo:** c7lavinder/xhaka (GitHub)
- **Railway Project:** Xhaka (ID: 84c0d035-cf53-4edd-b29c-31aeb42caac9)
- **Environment:** production (ID: 7dba9cea-edc6-4d8c-8ebd-29c20bf11a2e)

## Services
| Service | ID | URL | Status |
|---|---|---|---|
| xhaka | e6f2c6d7-75a4-4573-b142-63869d0e1b4c | xhaka-production.up.railway.app | ✅ Online |
| xhaka-intelligence | e6a33162-f5ff-4916-a875-0a4fb86c934c | (no public URL — background service) | ✅ Online |

## Intelligence Jobs
| Job | Schedule | Purpose |
|---|---|---|
| capture | Every 5 min | Polls intelligence/inbox/, routes to processed/ |
| propagate | Daily 6 AM CST | Updates agent files from processed intel |
| improve | Monday 6 AM CST | Pulls git history + Railway logs, extracts lessons |
| cleanup | Sunday 6 AM CST | Archives 30+ day memory files, summarizes months |

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

## Key Milestones
- 2026-03-11: Railway project created, intelligence service deployed
- 2026-03-11: Inbox/processed folders created, capture job now functional
- 2026-03-11: Command Center (showcase) live at xhaka-production.up.railway.app
- 2026-03-11: Memory system structured with subfolders
- 2026-03-11: Cleanup job added (Sunday 6 AM CST)
- 2026-03-11: improve job decoupled from Gunner

## Next Steps
- Add custom domain (if Corey wants one)
- Populate intelligence/inbox with first real intel items
- First synthesis run: 2026-03-16

---
Last updated: 2026-03-11
