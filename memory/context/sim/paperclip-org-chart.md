---
title: "Paperclip Org Chart — Xhaka Intelligence Co"
category: sim
tags: [paperclip, org-chart, agents, configuration]
last_updated: 2026-03-16
status: draft-ready
---

# Paperclip Org Chart — Xhaka Intelligence Co

## Company Profile

| Field | Value |
|---|---|
| **Company Name** | Xhaka Intelligence Co |
| **Mission** | Run NAH operations and grow Gunner to 100 users without Corey managing day-to-day |
| **Board** | Corey Lavinder (sole board member) |
| **Total Monthly Budget** | $100/mo |
| **Deployment Target** | Railway — new `paperclip` service in Xhaka project |
| **Agent Runtime** | OpenClaw (primary), Claude Code (Builder) |

---

## Org Chart

```
BOARD
└── Corey Lavinder (Human — approve hires, strategy, budget overrides)
    │
    └── Xhaka (COO) ← REPORTING TO BOARD
        ├── The Builder (Engineering)
        ├── The Auditor (QA)
        ├── The Researcher (R&D)
        ├── The Architect (Frontend)
        ├── The Librarian (Knowledge)
        └── The Operator (Systems)
```

---

## Agent Configurations

### 1. Xhaka — Chief Operating Officer

| Field | Config |
|---|---|
| **Paperclip Title** | Chief Operating Officer (COO) |
| **Runtime** | OpenClaw |
| **Reports To** | Board (Corey) |
| **Direct Reports** | Builder, Auditor, Researcher, Architect, Librarian, Operator |
| **Monthly Budget** | $25/mo |
| **Heartbeat Schedule** | Every 30 min (always on) |
| **Heartbeat Action** | Check open tickets, review agent work, flag blockers, update daily log |
| **Primary Channel** | Telegram (8031111945) |
| **Goal** | Keep NAH operations running and Gunner growing without Corey in the weeds |
| **Constraints** | NO code/build/deploy. Delegate all technical tasks. Own strategy and accountability |

---

### 2. The Builder — Engineering Lead

| Field | Config |
|---|---|
| **Paperclip Title** | Engineering Lead |
| **Runtime** | Claude Code (CLI) |
| **Reports To** | Xhaka (COO) |
| **Direct Reports** | None |
| **Monthly Budget** | $25/mo |
| **Heartbeat Schedule** | On-demand only (no scheduled heartbeat — spawned by task assignment) |
| **Heartbeat Action** | Check assigned coding tickets, execute SPEC→PLAN→TASKS, commit, report |
| **Goal** | Build and maintain all code in the Xhaka/Gunner ecosystem |
| **Constraints** | Must receive complete SPEC + PLAN + TASKS before starting. No ambiguous tickets |

---

### 3. The Auditor — QA & Standards Officer

| Field | Config |
|---|---|
| **Paperclip Title** | Quality & Standards Officer |
| **Runtime** | OpenClaw |
| **Reports To** | Xhaka (COO) |
| **Direct Reports** | None |
| **Monthly Budget** | $10/mo |
| **Heartbeat Schedule** | Every 4 hours |
| **Heartbeat Action** | Review recent Builder commits, check RULES.md compliance, file QA tickets, flag violations |
| **Goal** | Ensure all code meets quality bar before it touches production |
| **Constraints** | READ ONLY on all external systems. Report findings — don't fix directly |

---

### 4. The Researcher — Intelligence & R&D

| Field | Config |
|---|---|
| **Paperclip Title** | Director of Research & Intelligence |
| **Runtime** | OpenClaw |
| **Reports To** | Xhaka (COO) |
| **Direct Reports** | None |
| **Monthly Budget** | $10/mo |
| **Heartbeat Schedule** | Every 24 hours (morning briefing) + on-demand |
| **Heartbeat Action** | Scan industry news, find tools/libraries, write research files to memory/context/ |
| **Goal** | Surface opportunities, threats, and tools that give Xhaka a competitive edge |
| **Constraints** | Research and report only. No external actions without Xhaka approval |

---

### 5. The Architect — Frontend & Data Visualization

| Field | Config |
|---|---|
| **Paperclip Title** | Frontend Architect |
| **Runtime** | OpenClaw |
| **Reports To** | Xhaka (COO) |
| **Direct Reports** | None |
| **Monthly Budget** | $10/mo |
| **Heartbeat Schedule** | On-demand (triggered by UI tickets) |
| **Heartbeat Action** | Execute UI change tickets, update dashboard pages, report completion |
| **Goal** | Make data visible and dashboards actionable for the NAH team |
| **Constraints** | UI/CSS/JS only. No backend logic. Coordinate with Builder for API changes |

---

### 6. The Librarian — Knowledge Custodian

| Field | Config |
|---|---|
| **Paperclip Title** | Chief Knowledge Officer |
| **Runtime** | OpenClaw |
| **Reports To** | Xhaka (COO) |
| **Direct Reports** | None |
| **Monthly Budget** | $10/mo |
| **Heartbeat Schedule** | Every 5 days (synthesis run) |
| **Heartbeat Action** | Review daily memory logs, synthesize into MEMORY.md and context subfolders, prune old entries |
| **Goal** | Keep the knowledge base accurate, organized, and under 150 lines in MEMORY.md |
| **Constraints** | Read/write to memory/ only. Never take external actions |

---

### 7. The Operator — Systems & Config

| Field | Config |
|---|---|
| **Paperclip Title** | Systems & Configuration Operator |
| **Runtime** | OpenClaw |
| **Reports To** | Xhaka (COO) |
| **Direct Reports** | None |
| **Monthly Budget** | $10/mo |
| **Heartbeat Schedule** | On-demand (triggered by config/ID-fetch tickets) |
| **Heartbeat Action** | Access GHL/Twilio/Railway for IDs, configs, webhook verification |
| **Goal** | Keep all external integrations correctly configured and documented |
| **Constraints** | READ ONLY on GHL unless Corey explicitly approves a write action |

---

## Budget Summary

| Agent | Budget | % of Total |
|---|---|---|
| Xhaka (COO) | $25/mo | 25% |
| The Builder | $25/mo | 25% |
| The Auditor | $10/mo | 10% |
| The Researcher | $10/mo | 10% |
| The Architect | $10/mo | 10% |
| The Librarian | $10/mo | 10% |
| The Operator | $10/mo | 10% |
| **Total** | **$100/mo** | **100%** |

---

## Heartbeat Schedule Summary

| Agent | Schedule | Trigger Type |
|---|---|---|
| Xhaka | Every 30 min | Scheduled |
| The Builder | On-demand | Event (task assignment) |
| The Auditor | Every 4 hours | Scheduled |
| The Researcher | Every 24 hours | Scheduled |
| The Architect | On-demand | Event (ticket assignment) |
| The Librarian | Every 5 days | Scheduled |
| The Operator | On-demand | Event (ticket assignment) |

---

## Reporting Lines

```
Board (Corey)
  │
  └── Xhaka [COO] — $25/mo — every 30 min
        │
        ├── The Builder [Engineering] — $25/mo — on-demand
        │     └── escalates blockers → Xhaka
        │
        ├── The Auditor [QA] — $10/mo — every 4h
        │     └── QA reports → Xhaka → Board if critical
        │
        ├── The Researcher [R&D] — $10/mo — daily
        │     └── briefings → Xhaka → Board if actionable
        │
        ├── The Architect [Frontend] — $10/mo — on-demand
        │     └── UI changes → Xhaka review → deploy
        │
        ├── The Librarian [Knowledge] — $10/mo — every 5 days
        │     └── memory synthesis → available to all agents
        │
        └── The Operator [Systems] — $10/mo — on-demand
              └── config reports → Xhaka
```

---

## Projects (Recommended Initial Setup)

| Project Name | Goal | Owner Agent |
|---|---|---|
| NAH Operations | Keep leads flowing, team accountable, KPIs tracked | Xhaka |
| Gunner Growth | Ship features, fix bugs, grow to 100 users | The Builder |
| Knowledge Base | Keep memory accurate and synthesized | The Librarian |
| Infrastructure | Railway/GHL/Twilio config always correct | The Operator |

---

## Real Estate Leads Template Mapping (NAH)

When Clipmart ships, the **Real Estate Leads** template (7 agents) maps to NAH as follows:

| Clipmart Agent | NAH Equivalent | Our Paperclip Agent |
|---|---|---|
| Prospector | Lead intake from PPL platforms | The Operator (pulls from Leadzolo/PropertyLeads) |
| Outreach Agent | First-contact SMS/GHL workflow | The Operator (GHL automation) |
| Follow-Up Agent | Lead nurture sequences | The Operator (GHL sequences) |
| Closing Agent | Appointment → contract strategy | Xhaka (coaching Corey's team) |
| Data Manager | KPI entry, lead routing | The Operator |
| Coordinator | Task delegation | Xhaka (COO) |
| Reporting Agent | Lead velocity, conversion metrics | The Researcher |

*Import this template when Clipmart launches. Map to existing agents rather than creating 7 new ones.*

---

## Migration Path

### Phase 1: Deploy (Week 1)
1. Add `paperclip` service to Railway Xhaka project
2. Add Railway Postgres (or reuse xhaka-brain with new DB name)
3. Set `DATABASE_URL`, `HOST=0.0.0.0`, `NODE_ENV=production`
4. Verify: `curl https://paperclip.xhaka.app/api/health` → `{"status":"ok"}`

### Phase 2: Configure (Week 1-2)
1. Create company: "Xhaka Intelligence Co" with mission
2. Add all 7 agents with configs above
3. Set budgets and heartbeat schedules
4. Connect Xhaka (OpenClaw) via invite token + onboarding flow

### Phase 3: Integrate (Week 2-3)
1. Wire Builder (Claude Code) as an agent adapter
2. Test heartbeat flow: Paperclip → OpenClaw webhook → ticket update
3. Move existing task tracking from Telegram-only to Paperclip tickets
4. Train Xhaka on Paperclip SKILLS.md (auto-injected at runtime)

### Phase 4: Run (Ongoing)
1. All work starts as Paperclip tickets
2. Heartbeats handle recurring jobs
3. Corey uses Paperclip mobile dashboard as command center
4. Wait for Clipmart to ship Real Estate Leads template

---

## Key Decisions Pending

- [ ] Use Railway managed Postgres or share existing xhaka-brain?
- [ ] Auth mode: `local_trusted` (simpler) or `authenticated` (more secure)?
- [ ] Builder adapter: direct Claude Code CLI or wrapper bash script?
- [ ] Tailscale for mobile access vs. public Railway URL?
