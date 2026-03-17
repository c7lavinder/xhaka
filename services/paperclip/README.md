# Paperclip — Agent Orchestration Platform

Paperclip is an open-source Node.js + React agent orchestration platform that provides a unified dashboard for managing, routing, and monitoring AI agents. It supports multi-agent workflows, budget tracking per agent, ticket delegation, and a visual control panel — making it the operating layer that sits above individual AI agents and coordinates their work.

---

## Railway Setup

### What Was Done (Automated via API)
- **Service created:** `paperclip` in the Xhaka Railway project
- **Service ID:** `34790bf3-b59c-4fb3-85f0-5c33ae0d6622`
- **Docker image:** `ghcr.io/paperclipai/paperclip:latest`
- **Environment variables set:**
  - `PAPERCLIP_AUTH_MODE=local_trusted`
  - `PORT=3100`
  - `NODE_ENV=production`
- **Public URL:** `https://paperclip-production-a104.up.railway.app`

### What May Need Manual Config
- Verify the Docker image `ghcr.io/paperclipai/paperclip:latest` is publicly accessible and pulls correctly on Railway
- If the image pull fails, open Railway dashboard → paperclip service → Settings → Source, and confirm or re-enter the image tag
- Initial deployment may take 2–5 minutes to go live

---

## Company Configuration

### Onboarding CLI
After the service is live and accessible, run:

```bash
npx paperclipai onboard
# Company: Xhaka Intelligence Co
# Mission: Run NAH operations and grow Gunner to 100 users without Corey managing day-to-day
# Board: Corey Lavinder (CEO)
```

Or point it at the Railway URL:
```bash
PAPERCLIP_URL=https://paperclip-production-a104.up.railway.app npx paperclipai onboard
```

---

## Agent Roster — Xhaka Intelligence Co

| # | Agent | Monthly Budget | Description (Router) |
|---|-------|---------------|----------------------|
| 1 | **Xhaka** (COO) | $25/mo | Strategic partner and COO. Routes tasks, tracks goals, monitors agent health, sends morning briefs and alerts to Corey via Telegram. Never writes code. |
| 2 | **The Builder** | $25/mo | Writes, debugs, and deploys TypeScript code in the c7lavinder/xhaka GitHub repo. Triggered only by complete SPEC+PLAN+TASKS tickets. |
| 3 | **The Auditor** | $10/mo | Reviews Builder commits for TypeScript errors, hardcoded values, circular deps, and RULES.md violations. Runs post-build and on schedule. |
| 4 | **The Researcher** | $20/mo | Fetches and analyzes GitHub repos, articles, and external URLs. Produces knowledge files in memory/context/. Never writes application code. |
| 5 | **The Architect** | $10/mo | Builds and updates HTML/CSS/JS dashboard pages in services/control-room/. Frontend only — no backend logic. |
| 6 | **The Librarian** | $10/mo | Indexes and routes files in memory/context/. Never modifies content — only moves, flags, and updates TOOL-KNOWLEDGE-INDEX.md. |
| 7 | **The Operator** | $10/mo | Reads GHL, Railway, BatchDialer, and BatchLeads APIs to pull IDs, verify configs, and report status. Read-only on all external systems. |

**Total budget:** ~$110/mo (target ≤ $100/mo — trim Researcher to $15/mo if needed)

---

## Add Agents via CLI

```bash
npx paperclipai agent add \
  --name "Xhaka" \
  --role "COO" \
  --description "Strategic partner and COO. Routes tasks, tracks goals, monitors agent health, sends morning briefs and alerts to Corey via Telegram. Never writes code." \
  --budget 25

npx paperclipai agent add \
  --name "The Builder" \
  --description "Writes, debugs, and deploys TypeScript code in the c7lavinder/xhaka GitHub repo. Triggered only by complete SPEC+PLAN+TASKS tickets." \
  --budget 25

npx paperclipai agent add \
  --name "The Auditor" \
  --description "Reviews Builder commits for TypeScript errors, hardcoded values, circular deps, and RULES.md violations. Runs post-build and on schedule." \
  --budget 10

npx paperclipai agent add \
  --name "The Researcher" \
  --description "Fetches and analyzes GitHub repos, articles, and external URLs. Produces knowledge files in memory/context/. Never writes application code." \
  --budget 20

npx paperclipai agent add \
  --name "The Architect" \
  --description "Builds and updates HTML/CSS/JS dashboard pages in services/control-room/. Frontend only — no backend logic." \
  --budget 10

npx paperclipai agent add \
  --name "The Librarian" \
  --description "Indexes and routes files in memory/context/. Never modifies content — only moves, flags, and updates TOOL-KNOWLEDGE-INDEX.md." \
  --budget 10

npx paperclipai agent add \
  --name "The Operator" \
  --description "Reads GHL, Railway, BatchDialer, and BatchLeads APIs to pull IDs, verify configs, and report status. Read-only on all external systems." \
  --budget 10
```

---

## Architecture Notes

- Paperclip runs as a stateless Docker container on Railway
- All state (agent configs, tickets, budgets) is stored in Paperclip's embedded DB
- Xhaka heartbeat should be wired to ping every 30 minutes to keep the agent loop alive
- Ticket delegation flow: Corey → Xhaka → Paperclip routes → Specialist Agent → result reported back
