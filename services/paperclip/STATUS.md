# Paperclip Deployment Status

## Railway Service
- Status: DEPLOYED
- Service ID: 34790bf3-b59c-4fb3-85f0-5c33ae0d6622
- URL: https://paperclip-production-a104.up.railway.app
- Docker Image: ghcr.io/paperclipai/paperclip:latest
- Created: 2026-03-16
- Environment: production (7dba9cea-edc6-4d8c-8ebd-29c20bf11a2e)

## Local Instance (Active)
- URL: http://127.0.0.1:3100
- Tunnel: https://governor-win-oaks-technique.trycloudflare.com (changes on restart)
- Auth mode: local_trusted
- launchd: ai.xhaka.paperclip + ai.xhaka.paperclip-tunnel

## Environment Variables Set
- PAPERCLIP_AUTH_MODE=local_trusted
- PORT=3100
- NODE_ENV=production

## Agent Setup — Completed 2026-03-20
- [x] 6 worker agents created with claude_local adapter
- [x] adapterConfig.cwd set on all agents (root cause of "No project workspace directory" fixed)
- [x] Instruction files created for all agents in /workspace/agents/
- [x] Real-time loop confirmed: assign issue → heartbeat triggers → WebSocket connects
- [x] Goals structured (NAH $300k/mo + Gunner 100 customers)
- [x] Stale issues cleaned (XHAA-2 done, XHAA-7 cancelled)

## Open Items

### 🔴 Critical — Must Do Before Any Real Agent Work
- [ ] **Delete Railway Paperclip service** (34790bf3) — Railway deployment is the wrong model. Paperclip runs locally at localhost:3100. The Railway service is wasted spend and a source of confusion.
- [ ] **Dial max turns down** — Builder: 25-50 turns max (currently 300). Fix in agent adapterConfig.
- [ ] **Test one real end-to-end task** through Paperclip before fully committing (see XHAA-19 status)
- [ ] **autoresearch skill** — Builder needs to build this from scratch:
  - Prompt: "Create a Claude Code skill called 'autoresearch' based on https://github.com/karpathy/autoresearch.git — adapt Karpathy's ML training experiment pattern for iterative prompt/workflow research. Install to ~/.claude/skills/autoresearch/"
  - This is a Builder task, NOT a git clone
  - Once built: runs 12 experiments/hour, ~100 overnight

### 🟡 Should Do
- [ ] **Permanent tunnel URL** — run `cloudflared tunnel login` manually in terminal (needs browser). Gets us a fixed URL instead of one that changes on restart.
- [ ] **Run gstack-upgrade** — check if /office-hours, /careful, /freeze skills are available in a newer gstack version:
  ```bash
  cd ~/.claude/skills/gstack && ./gstack-upgrade
  ```
- [ ] **Set delivery windows** — configure Auditor to complete before 8 AM CST (Corey reviews at 9 AM). Update heartbeat config intervalSec to align.
- [ ] **Will Riddle demo prep** — Monday after 2 PM CST. Need to ensure the loop is demonstrable.

### 🟢 Nice to Have
- [ ] **Multi-company setup** — NAH and Gunner as separate Paperclip companies (separate budgets, separate boards). Low priority until single-company is proven.
- [ ] **Migrate Railway scheduled jobs into Paperclip heartbeats** — long-term replacement for node-cron. Not urgent.
- [ ] **Hindsight (episodic memory)** — see paperclip-kb-spec.md. Adds automatic conversation memory layer.

## Core Rules (From Sparkwave Learnings)
- **"If it isn't in Paperclip, it doesn't exist."** Every task, every cross-agent request = Paperclip issue. No exceptions.
- **Acknowledgment protocol:** Every agent must post "Acknowledged: [title]. Starting work now." as first comment when picking up an issue.
- **Commit hash required:** No issue marked done without posting the commit hash. Claims without commits = not complete.
- **Agents don't relay through humans.** Builder needs data from Researcher? Create an issue. Never ask Xhaka to ask Corey.
- **Wakeup ≠ task.** When Paperclip triggers a heartbeat, the task lives in the issue — not in the heartbeat payload. Always read the issue.

## Architecture Decisions (Locked 2026-03-20)
- Paperclip = execution layer, not just a board. All-in approach.
- claude_local agents with persistent heartbeats are the right architecture.
- Agents are peers on equal footing — not a hierarchy with Builder at top.
- Auditor fires independently on its heartbeat schedule — not triggered by Xhaka.
- Model tiering: Railway jobs use GPT-mini. Paperclip agents use Claude subscription (OAuth, flat rate).
- For scaling to 50 companies: one Paperclip instance, multiple company boards.

## gstack Skills Available (Confirmed in ~/.claude/skills/gstack/)
| Skill | What It Does |
|-------|-------------|
| `/plan-ceo-review` | CEO/founder scope review. Finds 10-star product. 3 approaches. |
| `/plan-eng-review` | Engineering spec lockdown. Architecture, edge cases, failure modes. |
| `/review` | Paranoid staff engineer code review. Catches production bugs. |
| `/qa` | Opens real browser, tests flows, fixes bugs, re-verifies. |
| `/qa-only` | Same as /qa but report-only, no code changes. |
| `/ship` | Sync main, run tests, push, open PR. |
| `/document-release` | Updates README, ARCHITECTURE, CONTRIBUTING to match what shipped. |
| `/browse` | Browser automation for manual QA tasks. |
| `/retro` | Engineering retrospective with per-person feedback. |

**New skills added in v0.9.0 (updated 2026-03-20):**
- `/office-hours` ✅ — rough idea → real plan with 3 approaches + smart questions
- `/careful` ✅ — warns before any destructive action (wraps destructive commands)
- `/freeze` ✅ — locks all files except the current working folder
- `/unfreeze` ✅ — removes freeze lock
- `/guard` ✅ — persistent safety layer for a whole session
- `/investigate` ✅ — deep root cause analysis before touching code
- `/design-consultation` ✅ — design review from a principal designer perspective
- `/design-review` ✅ — visual + UX review of implementation vs intent

## Standard Build Chain
Every Builder task follows this sequence:
```
/plan-ceo-review → /plan-eng-review → implement → /review → /qa → /ship → /document-release
```
