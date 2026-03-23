# Session Capture Summary (2026-03-22-2331)

## Key Decisions
- Moved heartbeat orchestration to gpt-4o-mini to preserve Claude Pro limits.
- Identified Gunner's semi-assisted automation RAG feedback loop as the core strategic moat.
- MiroFish architecture design to start now; build deferred to 100-user milestone.
- Removed paperclip-sync cron due to Paperclip v0.3.1 API limitations.

## Corey's Rules
- XHAKA HARD LIMIT: Xhaka does NOT build, code, debug, or deploy.
- PAPERCLIP PROTOCOL: All technical tasks MUST go through Paperclip issues. ACP spawns are forbidden.
- NO DIAGNOSING: Never guess infrastructure state; read local config files first.
- NO HOMEWORK: Xhaka manages the Paperclip board (assigns/starts tickets) for Corey.
- COMMUNICATION: No filler/performative phrases. Action-oriented, dense replies only.

## Open Tasks
- Confirm Builder spawn path is working.
- Integrate job-registry.json health checks into Heartbeat.
- Fix session transcript loading on restart (Builder SDD queued).
- Prepare for Will Riddle screen share (Monday after 2 PM CST).
- Fix Gunner CRM degradation (Builder task).
