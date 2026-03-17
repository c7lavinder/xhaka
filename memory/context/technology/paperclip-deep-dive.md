# Paperclip Deep Dive — Complete Wiring Guide

**Source:** Live fetch from `github.com/paperclipai/paperclip` (master branch)
**Date:** 2026-03-16
**Purpose:** Everything needed to wire Paperclip with our 7-agent setup

---

## 1. What Paperclip Is

Paperclip is an **open-source AI agent orchestration layer**. Think of it as a project management board where the "team members" are AI agents that actually do the work autonomously.

Key mental model:
- **Company** = your org (one Paperclip instance, multiple companies possible)
- **Agent** = an AI employee with a role, adapter, and budget
- **Issue** = a unit of work (like a GitHub issue or Linear task)
- **Heartbeat** = a short execution window where the agent actually runs
- **Adapter** = the bridge that connects Paperclip to a specific AI runtime

---

## 2. Setup

### 2.1 Starting Paperclip

```bash
# One-command bootstrap and start (auto-onboards if needed)
pnpm paperclipai run

# First-time interactive setup
pnpm paperclipai onboard

# Non-interactive quickstart (opens browser on start)
pnpm paperclipai onboard --yes

# Health check with auto-repair
pnpm paperclipai doctor --repair
```

### 2.2 Local Data Paths

| Data | Path |
|------|------|
| Config | `~/.paperclip/instances/default/config.json` |
| Database | `~/.paperclip/instances/default/db` |
| Logs | `~/.paperclip/instances/default/logs` |
| Storage | `~/.paperclip/instances/default/data/storage` |
| Secrets key | `~/.paperclip/instances/default/secrets/master.key` |

### 2.3 Server

- **Default URL:** `http://localhost:3100`
- **API base:** `http://localhost:3100/api`
- **Default mode:** `local_trusted` (no auth required — single-operator local use)

### 2.4 Key Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | `3100` | Server port |
| `PAPERCLIP_HOME` | `~/.paperclip` | Base directory |
| `PAPERCLIP_DEPLOYMENT_MODE` | `local_trusted` | Auth mode |
| `ANTHROPIC_API_KEY` | — | Required for claude_local adapter |
| `OPENAI_API_KEY` | — | Required for codex_local adapter |

**Injected into agent processes during heartbeats:**

| Variable | Description |
|----------|-------------|
| `PAPERCLIP_AGENT_ID` | Agent's unique ID |
| `PAPERCLIP_COMPANY_ID` | Company ID |
| `PAPERCLIP_API_URL` | Paperclip API base URL |
| `PAPERCLIP_API_KEY` | Short-lived JWT for API auth |
| `PAPERCLIP_RUN_ID` | Current heartbeat run ID |
| `PAPERCLIP_TASK_ID` | Issue that triggered this wake |
| `PAPERCLIP_WAKE_REASON` | Wake trigger reason (timer/assignment/on_demand) |
| `PAPERCLIP_WAKE_COMMENT_ID` | Comment that triggered this wake |

---

## 3. Adapters

### 3.1 Available Adapters

| Adapter | Type Key | Use For |
|---------|----------|---------|
| Claude Code CLI | `claude_local` | Builder/coding agents |
| OpenAI Codex CLI | `codex_local` | Alternative coding agents |
| Gemini CLI | `gemini_local` | Gemini-based agents |
| OpenCode CLI | `opencode_local` | Multi-provider agent |
| **OpenClaw Gateway** | **`openclaw_gateway`** | **OpenClaw/Xhaka** |
| Shell process | `process` | Scripts, custom agents |
| External webhook | `http` | Cloud-hosted agents |

### 3.2 OpenClaw Gateway Adapter (`openclaw_gateway`)

**This is the critical one for Xhaka.**

The OpenClaw adapter uses **WebSocket** transport only (no REST/SSE fallback).

#### How It Works

1. Paperclip connects to OpenClaw Gateway via WebSocket (`ws://` or `wss://`)
2. Performs challenge/auth handshake
3. Sends an `agent` request with the wake context + prompt
4. Waits for completion via `agent.wait`
5. Streams `event agent` frames into logs

#### Onboarding Flow (UI-driven — do this first)

1. In Paperclip UI → Company Settings → click **"Generate OpenClaw Invite Prompt"**
2. Paste the generated prompt into OpenClaw chat (this Telegram session)
3. OpenClaw submits an invite acceptance payload with:
   - `adapterType: "openclaw_gateway"`
   - `agentDefaultsPayload.url`: your gateway WebSocket URL
   - `agentDefaultsPayload.headers["x-openclaw-token"]`: auth token
4. Board operator approves the join request in Paperclip UI
5. OpenClaw claims an API key and installs the Paperclip skill
6. First run may trigger device pairing (one-time approval in OpenClaw)
7. Device key is persisted in `adapterConfig.devicePrivateKeyPem` — no re-pairing needed

#### Minimum `agentDefaultsPayload` Config

```json
{
  "url": "ws://127.0.0.1:18789",
  "headers": { "x-openclaw-token": "<gateway-token>" }
}
```

#### Recommended Full Config

```json
{
  "url": "ws://127.0.0.1:18789",
  "headers": { "x-openclaw-token": "<gateway-token>" },
  "paperclipApiUrl": "http://127.0.0.1:3100",
  "waitTimeoutMs": 120000,
  "sessionKeyStrategy": "issue",
  "role": "operator",
  "scopes": ["operator.admin"]
}
```

#### Auth Options

| Method | How |
|--------|-----|
| Token in config | `authToken` or `token` field |
| Token in headers | `headers["x-openclaw-token"]` |
| Password mode | `password` field |

#### Session Strategy

| Strategy | Behavior |
|----------|----------|
| `issue` | Session key = issue ID (recommended — one conversation per task) |
| `fixed` | Fixed session key from `sessionKey` field |
| `run` | New session per heartbeat run |

#### Device Auth Notes

- Default: `disableDeviceAuth: false` (device signing enabled)
- First run with pairing required → adapter auto-calls `device.pair.approve`
- After approval: `devicePrivateKeyPem` saved in config, no re-pairing
- To use stable key: set `devicePrivateKeyPem` in adapter config

---

### 3.3 Claude Local Adapter (`claude_local`)

For **Builder** and other CLI-based coding agents.

**Prerequisites:**
- `claude` CLI installed and authenticated
- `ANTHROPIC_API_KEY` set (or subscription login)

**Config fields:**

| Field | Required | Description |
|-------|----------|-------------|
| `cwd` | Yes | Working directory (absolute path) |
| `model` | No | e.g. `claude-opus-4-6` |
| `promptTemplate` | No | Prompt for every run |
| `env` | No | Environment variables |
| `timeoutSec` | No | Process timeout (0 = no limit) |
| `graceSec` | No | Grace before force-kill |
| `maxTurnsPerRun` | No | Default 300 |
| `dangerouslySkipPermissions` | No | Dev only |

**Session persistence:** Saves Claude session IDs between heartbeats. Next heartbeat resumes the existing conversation. Reset via UI if agent gets stuck.

**Prompt template variables:** `{{agentId}}`, `{{companyId}}`, `{{runId}}`, `{{agent.name}}`, `{{company.name}}`

**Run manually from CLI (outside Paperclip):**
```bash
pnpm paperclipai agent local-cli <agent-name> --company-id <company-id>
```
This installs Paperclip skills in `~/.claude/skills` and sets up the agent API key.

---

### 3.4 HTTP Adapter (`http`)

For cloud-hosted or external agents.

```json
{
  "adapterType": "http",
  "adapterConfig": {
    "url": "https://your-agent.example.com/webhook",
    "headers": { "Authorization": "Bearer secret" },
    "timeoutSec": 120
  }
}
```

Webhook receives:
```json
{
  "runId": "...",
  "agentId": "...",
  "companyId": "...",
  "context": {
    "taskId": "...",
    "wakeReason": "...",
    "commentId": "..."
  }
}
```

---

### 3.5 Process Adapter (`process`)

For shell scripts or custom agents.

```json
{
  "adapterType": "process",
  "adapterConfig": {
    "command": "python3 /path/to/agent.py",
    "cwd": "/path/to/workspace",
    "timeoutSec": 300
  }
}
```

Standard `PAPERCLIP_*` env vars are injected automatically.

---

## 4. Agent Heartbeat Runtime

### 4.1 How Heartbeats Work

Agents run in **heartbeats** — short execution windows, not continuously.

Each heartbeat:
1. Starts the configured adapter
2. Injects context (task, run ID, wake reason)
3. Lets the agent work until exit, timeout, or cancel
4. Stores results (status, token usage, logs)
5. Updates UI live

### 4.2 Wake Triggers

| Trigger | When |
|---------|------|
| `timer` | Scheduled interval (e.g. every 300s) |
| `assignment` | Issue assigned/checked out to this agent |
| `on_demand` | Manual trigger (button or API) |
| `automation` | System-triggered (future automations) |

If agent is already running, new wakeups are **coalesced** (no duplicate runs).

### 4.3 Heartbeat Config Fields

| Field | Description |
|-------|-------------|
| `enabled` | Allow scheduled heartbeats |
| `intervalSec` | Timer interval (0 = disabled) |
| `wakeOnAssignment` | Wake when work is assigned |
| `wakeOnOnDemand` | Allow manual wakeups |
| `wakeOnAutomation` | Allow system automation wakeups |

### 4.4 Operating Patterns

**Autonomous loop (Builder style):**
- `intervalSec: 300` (every 5 min)
- `wakeOnAssignment: true`

**Event-driven loop (Xhaka style):**
- `intervalSec: 0` (no timer)
- `wakeOnAssignment: true`
- `wakeOnOnDemand: true`

**Safety-first:**
- Short timeout
- Conservative prompt
- Monitor errors carefully

---

## 5. API Reference

**Base URL:** `http://localhost:3100/api`

**Auth header:** `Authorization: Bearer <token>`

Tokens are: agent API keys (long-lived) or run JWTs (short-lived, injected as `PAPERCLIP_API_KEY`).

**Critical header for mutations during heartbeats:** `X-Paperclip-Run-Id: {runId}`

---

### 5.1 Issue API

#### Create Issue
```
POST /api/companies/{companyId}/issues
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Build the caching layer",
  "description": "Add Redis caching for hot queries",
  "status": "todo",
  "priority": "high",
  "assigneeAgentId": "{agentId}",
  "projectId": "{projectId}",
  "goalId": "{goalId}"
}
```

#### List Issues
```
GET /api/companies/{companyId}/issues?status=todo,in_progress&assigneeAgentId={id}
```

#### Get Issue
```
GET /api/issues/{issueId}
```
Returns issue + `planDocument`, `documentSummaries`, `ancestors`.

#### Update Issue
```
PATCH /api/issues/{issueId}
X-Paperclip-Run-Id: {runId}

{ "status": "done", "comment": "Completed with 90% cache hit rate." }
```

#### Checkout (Claim) Issue
```
POST /api/issues/{issueId}/checkout
X-Paperclip-Run-Id: {runId}

{
  "agentId": "{yourAgentId}",
  "expectedStatuses": ["todo", "backlog", "blocked"]
}
```
Atomically transitions to `in_progress`. Returns `409 Conflict` if another agent owns it. **Never retry a 409.**

#### Release Issue
```
POST /api/issues/{issueId}/release
```

#### Add Comment (triggers @mention wakeups)
```
POST /api/issues/{issueId}/comments

{ "body": "Update: completed phase 1. @Builder please review." }
```
@-mentions in comments **trigger heartbeats** for the mentioned agent.

#### Issue Lifecycle
```
backlog → todo → in_progress → in_review → done
                     |              |
                  blocked        in_progress
```
Terminal states: `done`, `cancelled`

---

### 5.2 Agent API

#### Create Agent
```
POST /api/companies/{companyId}/agents

{
  "name": "Builder",
  "role": "engineer",
  "title": "Software Engineer",
  "reportsTo": "{managerAgentId}",
  "capabilities": "Full-stack development, Node.js",
  "adapterType": "claude_local",
  "adapterConfig": { "cwd": "/path/to/workspace" }
}
```

#### Get Agent
```
GET /api/agents/{agentId}
GET /api/agents/me  (returns currently-authenticated agent)
```

#### Update Agent
```
PATCH /api/agents/{agentId}

{ "adapterConfig": {...}, "budgetMonthlyCents": 10000 }
```

#### Pause / Resume Agent
```
POST /api/agents/{agentId}/pause
POST /api/agents/{agentId}/resume
```

#### Create API Key
```
POST /api/agents/{agentId}/keys
```
Returns a long-lived key — **only shown once, store immediately**.

#### Trigger Heartbeat (on-demand wakeup)
```
POST /api/agents/{agentId}/heartbeat/invoke
```

#### Get Org Chart
```
GET /api/companies/{companyId}/org
```

---

### 5.3 Cost API

#### Report Cost Event
```
POST /api/companies/{companyId}/cost-events

{
  "agentId": "{agentId}",
  "provider": "anthropic",
  "model": "claude-sonnet-4-20250514",
  "inputTokens": 15000,
  "outputTokens": 3000,
  "costCents": 12
}
```
(Adapters report this automatically after each heartbeat.)

#### Get Company Cost Summary
```
GET /api/companies/{companyId}/costs/summary
```

#### Costs by Agent
```
GET /api/companies/{companyId}/costs/by-agent
```

#### Budget Enforcement

| Threshold | Effect |
|-----------|--------|
| 80% | Soft alert — agent focuses on critical tasks |
| 100% | Hard stop — agent auto-paused |

Budget windows reset on the 1st of each month (UTC).

---

### 5.4 Authentication

**During heartbeats:** agents receive `PAPERCLIP_API_KEY` (short-lived JWT scoped to agent + run).

**For persistent access:** create a long-lived key via `POST /api/agents/{agentId}/keys`.

**Local trusted mode:** no auth required for board operator requests (localhost only).

---

## 6. CLI Commands

### Setup
```bash
pnpm paperclipai run                          # Start server
pnpm paperclipai onboard                      # First-time setup
pnpm paperclipai doctor --repair              # Health check + fix
pnpm paperclipai configure --section server   # Update server config
pnpm paperclipai env                          # Show resolved config
```

### Issues
```bash
pnpm paperclipai issue list [--status todo,in_progress]
pnpm paperclipai issue create --title "..." --description "..." --priority high
pnpm paperclipai issue get <issue-id>
pnpm paperclipai issue update <issue-id> --status done --comment "..."
pnpm paperclipai issue comment <issue-id> --body "..."
pnpm paperclipai issue checkout <issue-id> --agent-id <agent-id>
```

### Agents
```bash
pnpm paperclipai agent list
pnpm paperclipai agent get <agent-id>
```

### Heartbeat (Manual Wakeup)
```bash
pnpm paperclipai heartbeat run --agent-id <agent-id> [--api-base http://localhost:3100]
```

### Company Export/Import
```bash
pnpm paperclipai company export <company-id> --out ./exports/xhaka --include company,agents
pnpm paperclipai company import --from ./exports/xhaka --target existing --company-id <id>
```

---

## 7. Budget Tracking

- Adapters **automatically report** token spend after each heartbeat via `POST /api/companies/{companyId}/cost-events`
- No manual configuration needed — it's built into adapters
- Set per-agent monthly budget: `PATCH /api/agents/{agentId}` with `budgetMonthlyCents: 5000` (=$50/month)
- Set company-level budget: `PATCH /api/companies/{companyId}` with `budgetMonthlyCents: 100000` (=$1000/month)
- View in UI dashboard or via API
- `ANTHROPIC_API_KEY` is needed by `claude_local` adapter so it can call the API (and thus track token usage)

---

## 8. Multi-Adapter Setup

**YES** — you can mix adapter types in one company.

Example org:
- Xhaka → `openclaw_gateway` (OpenClaw)
- Builder → `claude_local` (Claude Code CLI)
- Researcher → `claude_local` (Claude Code CLI, different cwd/prompt)
- Auditor → `process` (custom Python script)
- Architect → `claude_local`

Each agent has its own `adapterType` and `adapterConfig`. No conflicts.

---

## 9. Persistent Service on Mac (launchd)

No official launchd guide in the docs, but the pattern is straightforward.

### Create Launch Agent plist

```bash
cat > ~/Library/LaunchAgents/ai.paperclip.server.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>ai.paperclip.server</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/sh</string>
    <string>-c</string>
    <string>cd /path/to/paperclip && pnpm paperclipai run</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>StandardOutPath</key>
  <string>/Users/wholesaleai/.paperclip/logs/paperclip.log</string>
  <key>StandardErrorPath</key>
  <string>/Users/wholesaleai/.paperclip/logs/paperclip-error.log</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key>
    <string>/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin</string>
    <key>PAPERCLIP_HOME</key>
    <string>/Users/wholesaleai/.paperclip</string>
  </dict>
</dict>
</plist>
EOF

# Load it
launchctl load ~/Library/LaunchAgents/ai.paperclip.server.plist

# Check status
launchctl list ai.paperclip.server

# Stop/Start
launchctl unload ~/Library/LaunchAgents/ai.paperclip.server.plist
launchctl load ~/Library/LaunchAgents/ai.paperclip.server.plist
```

---

## 10. Issue/Ticket Workflow (Step by Step)

### The Full Flow: Telegram → Paperclip → Agent → Done

1. **Corey messages Xhaka** via Telegram
   - Example: "Builder needs to fix the caching bug in gunner-v2"

2. **Xhaka (OpenClaw) receives the request**
   - Understands the task
   - Determines it's a build task → routes to Builder

3. **Xhaka creates a Paperclip issue** via API:
   ```
   POST /api/companies/{companyId}/issues
   Authorization: Bearer {xhaka_api_key}

   {
     "title": "Fix caching bug in gunner-v2",
     "description": "Detailed spec...",
     "status": "todo",
     "priority": "high",
     "assigneeAgentId": "{builder_agent_id}"
   }
   ```

4. **Paperclip wakes up Builder** (because `wakeOnAssignment: true`)
   - Injects `PAPERCLIP_TASK_ID`, `PAPERCLIP_WAKE_REASON: assignment`

5. **Builder checks out the issue** (atomically claims it):
   ```
   POST /api/issues/{issueId}/checkout
   X-Paperclip-Run-Id: {runId}

   { "agentId": "{builder_id}", "expectedStatuses": ["todo"] }
   ```
   Issue transitions to `in_progress`.

6. **Builder works** — reads code, makes changes, runs tests

7. **Builder updates issue status + posts comment**:
   ```
   PATCH /api/issues/{issueId}
   X-Paperclip-Run-Id: {runId}

   { "status": "done", "comment": "Fixed. Root cause was X. Changed Y." }
   ```

8. **Xhaka sees the activity** (via polling issues or @mention notification)
   - Reports back to Corey in Telegram

---

## 11. Troubleshooting

| Problem | Fix |
|---------|-----|
| Runs fail repeatedly | Check CLI installed + authenticated, check `cwd` exists |
| 409 on checkout | Another agent owns it — pick a different issue |
| Agent stuck in loop | Reset session via UI |
| OpenClaw pairing required | Approve device in OpenClaw settings (once only) |
| ANTHROPIC_API_KEY warning | Set key in env or adapter config (warning, not error) |
| Budget exceeded | Agent auto-paused — increase `budgetMonthlyCents` |

---

## 12. Quick Reference Card

| Action | Command / Endpoint |
|--------|-------------------|
| Start server | `pnpm paperclipai run` |
| Create issue | `POST /api/companies/{cid}/issues` |
| Trigger wakeup | `POST /api/agents/{aid}/heartbeat/invoke` |
| Wakeup via CLI | `pnpm paperclipai heartbeat run --agent-id <id>` |
| Checkout issue | `POST /api/issues/{iid}/checkout` |
| Close issue | `PATCH /api/issues/{iid}` with `status: done` |
| Costs by agent | `GET /api/companies/{cid}/costs/by-agent` |
| Pause agent | `POST /api/agents/{aid}/pause` |
| Org chart | `GET /api/companies/{cid}/org` |
