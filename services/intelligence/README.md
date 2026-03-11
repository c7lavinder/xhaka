# Xhaka Intelligence Service

> 24/7 background service that captures intel from Xhaka's inbox, routes it to the right project folder, propagates it to agent knowledge files, and runs weekly improvement loops from Gunner's git history and Railway logs.

---

## What It Does

| Job | Schedule | What It Does |
|---|---|---|
| **capture** | Every 5 min | Polls `intelligence/inbox/` on GitHub. Routes `.md` files to `intelligence/processed/gunner|nah|general/` based on frontmatter tags. Commits and removes from inbox. |
| **propagate** | Daily 6 AM CST | Scans processed items from last 24h. Determines which `agents/*.md` files to update. Uses GPT-4o to generate entries. Appends to `## Intelligence Log` in each agent file. Commits. |
| **improve** | Monday 6 AM CST | Pulls Gunner git history for fix/revert/hotfix commits. Extracts failure lessons via GPT-4o. Appends to `builder.md` failure table. Pulls Railway deploy failure logs. Updates `operator.md` Known Issues. |

---

## Architecture

```
services/intelligence/
├── src/
│   ├── jobs/
│   │   ├── capture.ts        ← Inbox watcher + router
│   │   ├── propagate.ts      ← Daily intel → agent files
│   │   └── improve.ts        ← Weekly git history → lessons
│   ├── lib/
│   │   ├── github.ts         ← Octokit wrapper (read/write/list)
│   │   ├── openai.ts         ← GPT-4o synthesis helpers
│   │   ├── railway.ts        ← Railway GraphQL API client
│   │   └── router.ts         ← Intel frontmatter parser + tag router
│   ├── scheduler.ts          ← node-cron job registration
│   └── index.ts              ← Entry point + health server
├── package.json
├── tsconfig.json
├── railway.toml
└── README.md
```

---

## Intel File Format

Xhaka writes files to `intelligence/inbox/` in this format:

```markdown
---
date: 2026-03-11
source: https://... | corey-direct
project: gunner | nah | general
tags: [tag1, tag2]
urgency: high | medium | low
---

## Raw
[What Corey sent — URL, paste, or summary]

## Synthesis
[Xhaka's analysis — what this means for us specifically]

## Suggested Action
[What should change as a result]
```

The capture job picks it up within 5 minutes, routes it based on `project` + `tags`, and removes it from the inbox.

---

## Tag → Agent Routing

| Tags | Agents Updated |
|---|---|
| `gunner` + `frontend`, `ui`, `design` | `architect.md` |
| `gunner` + `code`, `bug`, `build`, `engineering` | `builder.md` |
| `gunner` + `security`, `auth`, `audit` | `auditor.md` |
| `gunner` + `competitor`, `market`, `research` | `researcher.md` |
| `nah` + `ghl`, `crm`, `integration`, `twilio` | `operator.md` |
| `nah` + `market`, `research`, `wholesale` | `researcher.md` |
| `general` + `tools`, `capability`, `ai` | `researcher.md` (or domain-specific) |
| any + `automation` | `operator.md` + `researcher.md` |

---

## Deploy to Railway

### 1. Create a new Railway service

Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub repo → select `c7lavinder/xhaka` → set **Root Directory** to `services/intelligence`.

### 2. Set environment variables

In Railway → service → Variables, add:

```
OPENAI_API_KEY=sk-...
GITHUB_TOKEN=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
GITHUB_REPO=c7lavinder/xhaka
RAILWAY_API_TOKEN=107983f5-06cc-40b3-92d6-833004dee064
GUNNER_REPO=c7lavinder/Gunner
RAILWAY_SERVICE_ID=b14d0504-8190-419a-80c5-7dd64dfefcc1
```

### 3. Build + Start commands

These are already set in `railway.toml`:
- **Build:** `npm install && npm run build`
- **Start:** `npm start`

### 4. Verify

Check Railway logs for:
```
==============================
  Xhaka Intelligence Service
  Started: 2026-03-11T...
==============================
[startup] Health server listening on port 3000
[scheduler] Jobs registered:
  ✓ capture    — every 5 minutes
  ✓ propagate  — daily at 6:00 AM CST
  ✓ improve    — every Monday at 6:00 AM CST
[startup] Service is running. Waiting for scheduled jobs...
```

---

## Manual Job Trigger (Testing)

To run a specific job immediately (without waiting for the cron schedule), set `RUN_JOB` env var:

```bash
# Run locally
RUN_JOB=capture GITHUB_TOKEN=... GITHUB_REPO=c7lavinder/xhaka OPENAI_API_KEY=... npm start

# On Railway: set RUN_JOB=capture as a one-shot env var, redeploy, then remove it
```

Valid values: `capture`, `propagate`, `improve`

---

## Health Check

The service exposes a `/health` endpoint on `PORT` (default 3000):

```bash
curl https://your-service.railway.app/health
# → {"status":"ok","uptime":12345.678}
```

---

## Local Development

```bash
cd services/intelligence
npm install
cp .env.example .env  # fill in values

# Type check
npm run typecheck

# Dev run (tsx, no compile step)
npm run dev

# Production build
npm run build
npm start
```
