# Paperclip × Xhaka Wiring Guide

**For:** Wiring our 7-agent setup on the Mac mini
**Date:** 2026-03-16
**Status:** Ready to execute

---

## TL;DR

- Paperclip is already installed locally (`~/.paperclip/instances/default`)
- Xhaka (OpenClaw) connects via `openclaw_gateway` adapter using WebSocket
- Builder uses `claude_local` adapter (runs Claude Code CLI directly)
- Corey's Telegram messages → Xhaka creates issues → Builder/others execute → Xhaka reports back
- Heartbeats = the scheduling mechanism (Paperclip handles it, no cron needed externally)
- To survive reboots: one launchd plist for the Paperclip server

---

## Step 1: Confirm Paperclip is Running

```bash
# Check if server is up
curl -fsS http://127.0.0.1:3100/api/health

# If not running, start it
cd /path/to/paperclip && pnpm paperclipai run
```

Paperclip data lives at: `~/.paperclip/instances/default/`

---

## Step 2: Make Paperclip Survive Reboots (launchd)

Find where `pnpm paperclipai` lives first:
```bash
which pnpm
# e.g. /opt/homebrew/bin/pnpm
# Find paperclip repo:
ls ~/paperclip || find /Users/wholesaleai -name "paperclipai" -maxdepth 6 2>/dev/null
```

Create the launch agent:
```bash
mkdir -p ~/Library/LaunchAgents
mkdir -p ~/.paperclip/logs

cat > ~/Library/LaunchAgents/ai.paperclip.server.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>ai.paperclip.server</string>
  <key>ProgramArguments</key>
  <array>
    <string>/opt/homebrew/bin/pnpm</string>
    <string>paperclipai</string>
    <string>run</string>
  </array>
  <key>WorkingDirectory</key>
  <string>/Users/wholesaleai/paperclip</string>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>StandardOutPath</key>
  <string>/Users/wholesaleai/.paperclip/logs/server.log</string>
  <key>StandardErrorPath</key>
  <string>/Users/wholesaleai/.paperclip/logs/server-error.log</string>
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

# Load immediately
launchctl load ~/Library/LaunchAgents/ai.paperclip.server.plist

# Verify it's running
launchctl list ai.paperclip.server
curl -fsS http://127.0.0.1:3100/api/health
```

**Management commands:**
```bash
launchctl stop ai.paperclip.server    # Stop (auto-restarts due to KeepAlive)
launchctl unload ~/Library/LaunchAgents/ai.paperclip.server.plist  # Fully stop
launchctl load ~/Library/LaunchAgents/ai.paperclip.server.plist    # Restart
tail -f ~/.paperclip/logs/server.log  # Watch logs
```

---

## Step 3: Wire Xhaka (OpenClaw → Paperclip)

### 3.1 Generate the Invite Prompt

1. Open Paperclip UI: `http://localhost:3100`
2. Go to **Company Settings**
3. Click **"Generate OpenClaw Invite Prompt"**
4. Copy the generated prompt

### 3.2 Paste Into OpenClaw

Paste the prompt directly into this Telegram chat (or wherever OpenClaw lives).

OpenClaw will submit an invite acceptance containing:
```json
{
  "adapterType": "openclaw_gateway",
  "agentDefaultsPayload": {
    "url": "ws://127.0.0.1:18789",
    "headers": { "x-openclaw-token": "<generated-token>" },
    "paperclipApiUrl": "http://127.0.0.1:3100",
    "waitTimeoutMs": 120000,
    "sessionKeyStrategy": "issue"
  }
}
```

### 3.3 Approve the Join Request

In Paperclip UI → Approvals → approve the OpenClaw join request.

OpenClaw will:
- Claim its API key
- Install the Paperclip skill
- Be ready to create/manage issues

### 3.4 First Run / Device Pairing (one-time)

When Xhaka first gets woken by a heartbeat:
- May show `pairing required` 
- Approve the device in OpenClaw settings
- Device key gets saved → never needs pairing again

### 3.5 Xhaka Heartbeat Config

For Xhaka (event-driven, not timer-based):
```json
{
  "enabled": true,
  "intervalSec": 0,
  "wakeOnAssignment": true,
  "wakeOnOnDemand": true
}
```

---

## Step 4: Register Our 7 Agents

### Overview

| Agent | Role | Adapter | Wake Strategy |
|-------|------|---------|--------------|
| Xhaka (COO) | `ceo` or `manager` | `openclaw_gateway` | on_demand |
| Builder | `engineer` | `claude_local` | assignment + timer |
| Auditor | `qa` | `claude_local` | timer (every 4h) |
| Researcher | `analyst` | `claude_local` | on_demand + timer (daily) |
| Architect | `designer` | `claude_local` | on_demand |
| Guide | `solutions_architect` | `claude_local` | on_demand |
| Operator | `operator` | `claude_local` | on_demand |

### 4.1 Xhaka (Already done via invite flow above)

Xhaka is registered via the OpenClaw invite prompt process. adapterType = `openclaw_gateway`.

### 4.2 Builder

```bash
# Create Builder via CLI (or UI)
pnpm paperclipai issue create --title "Setup Builder agent" --description "Create claude_local agent for Builder"

# OR via API:
curl -X POST http://localhost:3100/api/companies/{COMPANY_ID}/agents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {TOKEN}" \
  -d '{
    "name": "Builder",
    "role": "engineer",
    "title": "Software Engineer",
    "reportsTo": "{XHAKA_AGENT_ID}",
    "capabilities": "Full-stack development, Node.js, PostgreSQL, API design",
    "adapterType": "claude_local",
    "adapterConfig": {
      "cwd": "/Users/wholesaleai/.openclaw/workspace",
      "model": "claude-opus-4-6",
      "maxTurnsPerRun": 300,
      "dangerouslySkipPermissions": false,
      "env": {
        "ANTHROPIC_API_KEY": "{{secrets.ANTHROPIC_API_KEY}}"
      }
    },
    "heartbeatConfig": {
      "enabled": true,
      "intervalSec": 300,
      "wakeOnAssignment": true,
      "wakeOnOnDemand": true
    }
  }'
```

### 4.3 Auditor (runs every 4 hours)

```json
{
  "name": "Auditor",
  "role": "qa",
  "title": "QA & Compliance Officer",
  "adapterType": "claude_local",
  "adapterConfig": {
    "cwd": "/Users/wholesaleai/.openclaw/workspace",
    "promptTemplate": "You are the Auditor. Check RULES.md compliance, review recent code, flag issues."
  },
  "heartbeatConfig": {
    "enabled": true,
    "intervalSec": 14400,
    "wakeOnAssignment": true
  }
}
```

### 4.4 Researcher (on-demand + daily morning check)

```json
{
  "name": "Researcher",
  "role": "analyst",
  "adapterType": "claude_local",
  "adapterConfig": {
    "cwd": "/Users/wholesaleai/.openclaw/workspace"
  },
  "heartbeatConfig": {
    "enabled": true,
    "intervalSec": 86400,
    "wakeOnAssignment": true,
    "wakeOnOnDemand": true
  }
}
```

### 4.5 Architect, Guide, Operator (all on-demand only)

```json
{
  "heartbeatConfig": {
    "enabled": true,
    "intervalSec": 0,
    "wakeOnAssignment": true,
    "wakeOnOnDemand": true
  }
}
```

---

## Step 5: The Corey → Paperclip → Agent Pipeline

### How a Telegram Message Becomes a Completed Issue

```
Corey's Telegram msg
        ↓
Xhaka (OpenClaw) receives via OpenClaw session
        ↓
Xhaka analyzes: is this a build task? → Builder
        ↓
Xhaka calls Paperclip API:
  POST /api/companies/{companyId}/issues
  {
    "title": "Task summary",
    "description": "Spec with acceptance criteria",
    "priority": "high",
    "assigneeAgentId": "{builder_id}"
  }
        ↓
Paperclip wakes Builder (wakeOnAssignment = true)
  Injects: PAPERCLIP_TASK_ID, PAPERCLIP_WAKE_REASON=assignment
        ↓
Builder checks out the issue:
  POST /api/issues/{issueId}/checkout
  → Status: in_progress
        ↓
Builder works (reads code, makes changes, commits)
        ↓
Builder marks done:
  PATCH /api/issues/{issueId}
  { "status": "done", "comment": "Completed. Here's what I did..." }
        ↓
Xhaka polls for updates OR gets @mentioned in Builder's comment
        ↓
Xhaka reports to Corey in Telegram
```

### Xhaka's API Calls in Practice

Xhaka needs to know the company ID and agent IDs. Get them once and cache:

```bash
# List companies
curl http://localhost:3100/api/companies -H "Authorization: Bearer {token}"

# List agents
curl http://localhost:3100/api/companies/{companyId}/agents -H "Authorization: Bearer {token}"

# Create an issue assigned to Builder
curl -X POST http://localhost:3100/api/companies/{companyId}/issues \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "title": "Fix the bug Corey found",
    "description": "Description with context...",
    "status": "todo",
    "priority": "high",
    "assigneeAgentId": "{builder_agent_id}"
  }'
```

### Triggering Immediate Wakeup (Bypass Poll Delay)

After creating an issue, trigger Builder immediately:
```bash
# Via API
curl -X POST http://localhost:3100/api/agents/{builder_id}/heartbeat/invoke \
  -H "Authorization: Bearer {token}"

# Via CLI
pnpm paperclipai heartbeat run --agent-id {builder_id}
```

---

## Step 6: Setting API Keys (Secrets)

Paperclip has built-in secret management. Don't hardcode keys.

In UI: Company Settings → Secrets → Add secret

Or via config file. Then reference in adapter config:
```json
{
  "adapterConfig": {
    "env": {
      "ANTHROPIC_API_KEY": "{{secrets.ANTHROPIC_API_KEY}}"
    }
  }
}
```

---

## Step 7: Budget Setup

Set budgets to prevent runaway spend:

```bash
# Set company-level budget ($1000/month)
curl -X PATCH http://localhost:3100/api/companies/{companyId} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{ "budgetMonthlyCents": 100000 }'

# Set per-agent budgets
# Builder (heaviest) — $50/month
curl -X PATCH http://localhost:3100/api/agents/{builder_id} \
  -d '{ "budgetMonthlyCents": 5000 }'

# Xhaka — $20/month
curl -X PATCH http://localhost:3100/api/agents/{xhaka_id} \
  -d '{ "budgetMonthlyCents": 2000 }'

# Researcher — $20/month
curl -X PATCH http://localhost:3100/api/agents/{researcher_id} \
  -d '{ "budgetMonthlyCents": 2000 }'

# Others (Auditor, Architect, Guide, Operator) — $10/month each
curl -X PATCH http://localhost:3100/api/agents/{agent_id} \
  -d '{ "budgetMonthlyCents": 1000 }'
```

Monitor spend:
```bash
curl http://localhost:3100/api/companies/{companyId}/costs/by-agent \
  -H "Authorization: Bearer {token}"
```

---

## Step 8: Xhaka's Paperclip Skill

After joining, OpenClaw has access to the Paperclip skill. This means:

**Xhaka can directly:**
- Create issues
- Assign agents
- Update issue status
- Add comments
- Trigger heartbeats
- Check agent status and costs
- Query the org chart

The skill is auto-installed during the join flow. No manual skill setup needed.

---

## Operational Runbook

### Daily Checks

```bash
# Is Paperclip running?
curl -fsS http://127.0.0.1:3100/api/health

# Any stuck issues?
pnpm paperclipai issue list --status in_progress

# Any agent errors?
tail -50 ~/.paperclip/instances/default/logs/current.log

# Cost check
curl http://localhost:3100/api/companies/{cid}/costs/summary -H "Authorization: Bearer {token}"
```

### If an Agent Gets Stuck

```bash
# Release the stuck issue
pnpm paperclipai issue release {issue_id}

# Reset the agent's session (via UI: agent → reset session)
# Then re-assign the issue
```

### If Paperclip Server Goes Down

```bash
# Check logs
tail -50 ~/.paperclip/logs/server-error.log

# Restart (launchctl handles auto-restart, but manual if needed)
launchctl stop ai.paperclip.server

# If database is corrupted
pnpm paperclipai doctor --repair
```

---

## Summary: The Critical Connection Points

| Connection | Type | Address |
|-----------|------|---------|
| Paperclip API | REST/HTTP | `http://localhost:3100/api` |
| OpenClaw Gateway | WebSocket | `ws://127.0.0.1:18789` |
| Claude CLI | Local process | `claude` binary |

**The key insight:** Xhaka is wired to Paperclip via the `openclaw_gateway` adapter — it's a **bidirectional WebSocket connection** where Paperclip wakes Xhaka by sending a gateway payload, and Xhaka can create/manage issues via the HTTP API. They live together on the same Mac mini.
