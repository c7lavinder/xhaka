---
title: Paperclip Agent Orchestration — Architecture Blueprint
category: technology
tags: [paperclip, multi-agent, orchestration, openclaw]
source: Sparkwave Digital article
last_updated: 2026-03-16
importance: 5
---

# Paperclip Agent Orchestration — Architecture Blueprint

Source: Sparkwave Digital (Rico, Dev, Iris, Jerry, Arlo, Opal — 6 OpenClaw agents)

## The Core Principle
Paperclip is the **single source of truth for coordination**.
Every interaction between agents happens through Paperclip issues and comment threads.
"If it isn't in Paperclip, it doesn't exist."

## What Paperclip Is (and Is NOT)
- **IS:** An issue tracker / coordination layer that agents poll
- **IS NOT:** A Docker service you deploy to Railway
- Agents don't share memory or runtime context — coordination must be explicit

## Layer 1 — Issues as Communication
An issue can represent: a task, a request for information, a question, a status check, or operational coordination.

**Rule:** Agents never communicate directly. All communication = Paperclip issues.

Example — Rico needs research from Arlo:
1. Rico creates issue: "Research Request — Market sentiment on AI video tools" → assigned to Arlo
2. Arlo detects it via polling loop
3. Clarifications happen in issue comments
4. Results posted in same issue
5. Issue marked done

## Layer 2 — Polling: How Agents Discover Work
Each agent runs a polling cron:
```
openclaw cron add paperclip-poll \
  --schedule "every 10m" \
  --session isolated \
  --model haiku \
  --message "Check Paperclip for issues assigned to you..."
```

**Design choices:**
- Small model (haiku) for polling — cheap, frequent
- Escalate to larger model if actual work required
- Isolated sessions — no context leaks between polls

## Layer 3 — Wakeups for Urgent Work
For time-sensitive tasks, trigger immediate execution:
```
node /root/clawd/scripts/wakeup-agent.mjs <agent_name> "reason" <issue_id>
```
The wakeup does NOT contain the task — it just says "check Paperclip now."
Issue always remains source of truth.

## Acknowledgment Protocol
When an agent picks up an issue, it immediately posts:
> "Acknowledged: [issue title]. Starting work now."

Without this: can't tell if issue was missed, agent crashed, or agent is working.

## Verification Before Completion
- Agent completes work → commits → posts commit hash in issue → marks done
- Verifying agent checks commit exists in repo, confirms it matches spec
- **Agents don't rely on claims — they verify**

## Cross-Agent Coordination
If Arlo needs data from Jerry mid-task:
1. Arlo creates NEW issue assigned to Jerry: "Data Request — signup metrics"
2. Jerry responds in comments
3. Arlo incorporates data, finishes original issue

Agents request from teammates, not from humans.

## Telegram → Paperclip Conversion
Corey messages via Telegram → Xhaka converts to Paperclip issue before work starts.
This keeps the entire system synchronized even when humans use other channels.

## What Didn't Work (Sparkwave lessons)
- Messaging apps for agent-to-agent coordination (unreliable)
- Humans relaying instructions between agents (system is broken if this happens)
- Assuming a wakeup worked without verifying via Paperclip

## Application to Xhaka Setup

### What to build:
1. **Delete Railway Paperclip service** — wrong model entirely
2. **Add polling cron per agent** — `openclaw cron add paperclip-poll --schedule "every 10m"`
3. **Wire Telegram→Paperclip conversion** in Xhaka main session
4. **Acknowledgment rule** in every agent's SOUL equivalent
5. **Wakeup script** for urgent cross-agent tasks

### Agent polling setup (our 7 agents):
- Xhaka COO: every 5 min (primary orchestrator)
- Builder: every 10 min (on-demand)
- Researcher: every 10 min
- Auditor: every 15 min
- Architect: every 15 min
- Librarian: every 30 min
- Operator: every 15 min

### The rule for us:
If Corey messages Xhaka via Telegram, Xhaka converts to Paperclip issue.
If Xhaka needs Builder, Xhaka creates Paperclip issue assigned to Builder.
Builder polls, picks up, acknowledges, works, posts commit hash, marks done.
Xhaka verifies commit, reports back to Corey.
