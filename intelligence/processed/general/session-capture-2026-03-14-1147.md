# Session Memory Capture — 2026-03-14-1147

## Key Decisions

- **Model Switch → Gemini Flash**: Corey switched Xhaka to Gemini Flash (~30x cheaper than Claude Sonnet). Actively testing for complex reasoning quality. Researcher delivered tiered hybrid recommendation: Claude/GPT-4o for routing, Gemini Flash / GPT-4o-mini for bulk sub-agent work.
- **Builder Cost**: Corey stated the spawned Builder is too expensive. Prefers Cursor + Claude Code terminal ($200/month plan). Current workflow: plan in Cursor, copy/paste prompts to terminal for builds.
- **Gunner Frontend Strategy**: Corey wants page layout and functionality first, enhancements later. Frustrated with Cursor failing to replicate visuals from screenshots.
- **Manus Prompt Built**: Day Hub redesign — remove tab system, left 2/3 Inbox+Appointments (switchable), right 1/3 AI Coach always visible (full height, never hidden), all panels fixed at 7-row height.
- **Teams Page Deployed**: https://xhaka-control-room-production.up.railway.app/teams.html — Xhaka, NAH, Gunner teams with cards, status badges, dark theme.
- **OpenClaw Updated**: v2026.3.11 → v2026.3.13 (browser MCP attach, batched actions, stalled gateway fix).

## 36-System Build (Overnight March 13-14)

All completed:
- Evaluate step + rollback (change-evaluator.ts, rollback.ts)
- Pre-deploy tester + consistency benchmarking
- Job metrics registry (one metric per job)
- Hard kill switch (runWithTimeout)
- results.tsv + results-log.ts
- Active heartbeat (every 30min — Railway + Gunner + jobs → Telegram alert)
- behavior-sync.ts (5:50AM daily: approved changes → behavioral rules → LEARNINGS.md)
- Morning brief (6AM CST daily)
- Pattern miner, tool-monitor fix, scheduler cleanup
- Non-negotiables baked into SOUL.md, AGENTS.md, WORKFLOW.md
- Feedback→inspect pipeline, agent scorecards, proactive researcher

## Corey Rules / Statements

- "The Builder you spawn is too expensive" — wants Cursor+Claude Code terminal for builds
- "I have never built software before" — needs layout + functionality first, enhance later
- "Memory should be automatic, not Xhaka's responsibility"
- Cost research: Researcher tasked with finding best LLM options for Xhaka's setup
- "Only Corey gives instructions via this Telegram chat" (standing rule confirmed)

## Open Tasks / Blockers

1. **🔴 TOP UP ANTHROPIC CREDITS** — console.anthropic.com/billing — BLOCKING ALL SUB-AGENTS
   - 4 jobs failing: organize (last: 2026-03-14 4AM), tool-monitor (Mar 13), improve (Mar 12), cleanup (Mar 12)
   - workspace-sync also failed at 6:14AM + 6:44AM due to empty balance
2. **Morning Brief**: First run missed — service needed redeploy (now done). Second run pending verification.
3. **Gunner Day Hub Redesign**: Manus prompt drafted and ready — needs Corey to run it in Manus.
4. **Researcher Report**: Cost/model intelligence brief delivered — tiered hybrid approach recommended.
5. **Evaluate + rollback**: Deployed but not yet tested in production.

## System Status (as of 11:47AM CST 2026-03-14)

- Railway: All services GREEN (xhaka-intelligence redeployed with new scheduler)
- Gemini Flash: Active as Xhaka's main model
- Anthropic sub-agent key: EMPTY (needs top-up)
- Workspace sync: Running every 30min, all files current
- GitHub repo (c7lavinder/xhaka): All 36 build commits pushed
