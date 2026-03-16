---
title: "Paperclip — AI Company Orchestration"
category: technology
tags: [ai, orchestration, agents, infrastructure]
last_updated: 2026-03-16
status: researched
source: https://github.com/paperclipai/paperclip
---

# Paperclip — AI Company Orchestration

## What It Is

Paperclip is an **open-source Node.js server + React UI** that acts as the management layer above AI agents. The tagline: *"If OpenClaw is an employee, Paperclip is the company."*

It is NOT a framework, NOT a chatbot, NOT a workflow builder. It is a **company operating system** — org charts, budgets, ticketing, governance, heartbeats, and audit trails — for teams of AI agents.

MIT licensed. Self-hosted. No Paperclip account required.

---

## Full Feature List

| Feature | Description |
|---|---|
| **Org Chart** | Hierarchies, roles, reporting lines. Agents have a boss, title, job description |
| **Goal Alignment** | Every task traces back to company mission. Full goal ancestry from task → project → company |
| **Heartbeats** | Cron-based agent wakeups. Agents check work queue and act. Delegation flows up/down the chart |
| **Cost Control** | Monthly budget per agent. Auto-pause at 100%, soft warning at 80%. No runaway spend |
| **Ticket System** | Every instruction, response, tool call logged. Structured tickets with owner, status, thread |
| **Immutable Audit Log** | Append-only history. No edits, no deletions. Full accountability |
| **Governance** | Board approval required for new hires. Strategy review gates. Pause/resume/terminate any agent |
| **Multi-Company** | One deployment, unlimited companies, complete data isolation |
| **Mobile Ready** | Full dashboard accessible from phone |
| **Plugin System** | Drop-in extensions for knowledgebase, custom tracing, queues (🟢 shipped) |
| **Persistent Agent State** | Agents resume same task context across heartbeats — no context loss on restart |
| **Runtime Skill Injection** | Agents learn Paperclip workflows at runtime via SKILLS.md — no retraining needed |
| **Portable Templates** | Export/import entire company configs (orgs, agents, skills) with secret scrubbing |
| **Atomic Execution** | Task checkout + budget enforcement are atomic — no double-work, no race conditions |
| **Governance with Rollback** | Config changes are versioned. Bad changes roll back safely |
| **CLI** | Full control-plane commands: `paperclipai issue list/create/update`, context profiles |

---

## Tech Stack

| Component | Details |
|---|---|
| **Runtime** | Node.js 20+ required |
| **Package Manager** | pnpm 9.15+ |
| **Frontend** | React UI (served by API server, same origin) |
| **API Server** | Node.js, port 3100 by default |
| **Database** | PostgreSQL — embedded (auto-setup, no config needed) OR external via `DATABASE_URL` |
| **Embedded DB Path** | `~/.paperclip/instances/default/db` |
| **Storage** | Local disk default (`~/.paperclip/instances/default/data/storage`) or configurable |
| **Secrets** | Local encrypted key file (`~/.paperclip/instances/default/secrets/master.key`) |
| **Auth** | Two modes: `local_trusted` (no auth, localhost only) and `authenticated` (private/public) |
| **Docker** | Official Dockerfile + docker-compose.quickstart.yml provided |
| **Language** | TypeScript (ESM modules) |
| **Test Framework** | Vitest + Playwright (E2E) |

---

## How Heartbeats Work (Technical)

Heartbeats are the core scheduling mechanism. Each agent has a **heartbeat schedule** (cron expression) defining how often it "wakes up."

**Heartbeat flow:**
1. Paperclip fires a wakeup signal to the agent on schedule (or on event: task assignment, @-mention)
2. Agent receives the heartbeat via its registered adapter (OpenClaw webhook, HTTP endpoint, bash command, etc.)
3. Agent checks its work queue in Paperclip via API
4. Agent picks up tasks, executes, logs results back via tickets
5. Delegation flows automatically — if an agent can't handle something, it escalates up the org chart

**Technical details:**
- Task checkout is **atomic** — prevents two agents grabbing the same task
- Budget is checked atomically at checkout — agent stops if over limit
- Agent state persists across heartbeats (not stateless)
- Wakeup requests tracked in DB; heartbeat runs have their own immutable log

**Agent adapters supported:**
- OpenClaw (webhook-based, first-class integration)
- Claude Code (session-based)
- Codex
- Cursor
- Bash
- HTTP webhook (generic)

---

## Integration with OpenClaw (Our System)

This is a **first-class integration**. Paperclip explicitly names OpenClaw as a supported agent type.

**How the integration works:**
1. Each OpenClaw bot registers with Paperclip via an **invite token** (`GET /api/invites/:token`)
2. OpenClaw fetches the onboarding manifest (`GET /api/invites/:token/onboarding`)
3. A plain-text onboarding doc is available for agent consumption (`GET /api/invites/:token/onboarding.txt`) — LLM-readable
4. OpenClaw claims a one-time API key and registers as an agent
5. Paperclip sends wakeup callbacks to OpenClaw's webhook on heartbeat schedule
6. OpenClaw receives SKILLS.md at runtime to know Paperclip workflows

**Roadmap item:** "Get OpenClaw onboarding easier" — currently functional but marked for improvement.

**Smoke test available:** `pnpm smoke:openclaw-join` validates the full join flow end-to-end.

**Docker test available:** `pnpm smoke:openclaw-docker-ui` boots OpenClaw in Docker against local Paperclip.

---

## Cost Control Mechanics

- Each agent gets a **monthly budget in USD**
- Every tool call is tracked with a token cost
- Dashboard shows: cost per agent, per task, per project, per goal
- **80% threshold:** Soft warning surfaced
- **100% threshold:** Agent auto-pauses, new task checkout blocked
- Board (Corey) can override at any time and resume
- Budget enforcement is **atomic** — checked at task checkout, not after

---

## Ticket System / Audit Trail

- Every task is a **ticket** with: owner, status, thread of conversation
- Every agent response, tool call, API request, decision is **logged and visible**
- Audit log is **append-only** — no edits, no deletions
- Full tool-call tracing in the UI
- Governance actions (hires, strategy approvals, budget overrides) all have immutable records

---

## Database Requirements

**Local/Dev (default):**
- Embedded PostgreSQL auto-created on first run
- Zero configuration needed
- Data at `~/.paperclip/instances/default/db`
- Auto-backups every 60 min, retain 30 days

**Production:**
- Set `DATABASE_URL` environment variable to point at external Postgres
- Same schema, same migrations (`pnpm db:migrate`)

**On Railway:** Set `DATABASE_URL` to a Railway Postgres service URL.

---

## Auth Setup

**local_trusted mode (default):**
- No authentication required
- Suitable for: local machine, private network, Tailscale
- Paperclip trusts all requests

**authenticated mode:**
- Private/public exposure options
- Configured via `pnpm paperclipai configure --section auth`
- Required for: public-facing deployments, multi-user access
- Board actions (hire, strategy approve) require board auth

**Tailscale integration:**
- `pnpm dev --tailscale-auth` for private-network access on the go
- Binds to `0.0.0.0` for private network

---

## Railway Deployment

**Can Paperclip run on Railway? YES.**

Requirements:
- Node.js 20+ service
- PostgreSQL service (Railway's managed Postgres works)
- Environment: `DATABASE_URL`, `HOST=0.0.0.0`, `PAPERCLIP_HOME=/paperclip`
- Port: 3100 (or Railway's `$PORT`)
- Persistent volume for storage (or configure S3/cloud storage)

**Resource estimate:**
- Single Node.js process
- Low-medium CPU (heartbeat scheduler + API server)
- RAM: ~256–512MB for normal operation
- Storage: depends on audit log volume

**Conflict with xhaka-intelligence?**
- NO direct conflict — different services, different ports
- Should be a **new Railway service** in the Xhaka project
- Recommend name: `paperclip` or `xhaka-paperclip`
- Needs its own Railway Postgres or can share xhaka-brain Postgres with separate DB name

---

## Clipmart Templates (Pre-Built Companies)

Status: **COMING SOON** (not yet shipped as of March 2026)

Templates visible on marketing site:

| Template | Agents | Category |
|---|---|---|
| Content Marketing Agency | 8 | Marketing |
| Crypto Trading Desk | 12 | Finance |
| E-commerce Operator | 10 | E-commerce |
| YouTube Factory | 6 | Media |
| Dev Agency | 9 | Software |
| **Real Estate Leads** | **7** | **Sales** |
| Publish Your Own | — | Community |

### Real Estate Leads Template (7 agents)
**Directly relevant to NAH.**

From the site description: "Prospecting, outreach, follow-up, closing"
Full agent breakdown (inferred from category + agent count):
1. **Prospector** — finds and qualifies motivated seller leads
2. **Outreach Agent** — initial contact (SMS/email/cold call scripts)
3. **Follow-Up Agent** — sequences for non-responsive leads
4. **Closing Agent** — scripts/strategy for converting appointments to contracts
5. **Data Manager** — enriches and routes leads in CRM
6. **Coordinator** — manages task delegation across the team
7. **Reporting Agent** — KPI tracking, lead velocity metrics

*Note: Full spec not publicly available — Clipmart not yet launched. Template configs will be importable once Clipmart ships.*

---

## Installation Quickstart

```bash
# One command (recommended)
npx paperclipai onboard --yes

# Or manual
git clone https://github.com/paperclipai/paperclip.git
cd paperclip
pnpm install
pnpm dev
```

API: `http://localhost:3100`
Health check: `curl http://localhost:3100/api/health`
Companies: `curl http://localhost:3100/api/companies`
