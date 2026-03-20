# SDD: Session Transcript Loading on Restart

**Created:** 2026-03-20
**Priority:** High — session context loss on gateway restart wastes Corey's time

---

## SPEC

When the OpenClaw gateway restarts and starts a new session, automatically load the last N messages from the previous session transcript so conversation context is preserved.

**Acceptance criteria:**
- After a gateway restart, Xhaka knows what was discussed in the most recent prior session (last 20-30 messages)
- If Corey references "those items" or "that list", Xhaka can answer without asking him to repeat himself
- Does not load entire transcript (memory cost) — just enough recent context to maintain continuity
- Works silently — no "I'm loading your previous session" noise

---

## PLAN

OpenClaw saves every session to a `.jsonl` file at:
`/Users/wholesaleai/.openclaw/agents/main/sessions/<session-id>.jsonl`

Sessions are tracked in `sessions.json`. On new session start, the most recent prior main session transcript can be read and injected as context.

**Two approaches:**

**Option A — Startup cron/hook (preferred):**
- A cron that runs at session start reads the most recent prior session transcript
- Extracts the last 20-30 user/assistant message pairs
- Writes a summary to `memory/session-bridge.md`
- HEARTBEAT.md (or MEMORY.md workspaceFile) picks it up on next load

**Option B — Frequent session capture (simpler, partial fix):**
- Change `session-memory-capture` cron from every 4 hours to every 15 minutes
- Ensures at most 15 min of context is lost on restart
- Does not recover the actual conversation thread, just facts/decisions

**Recommendation:** Option B as immediate fix (15-min captures), Option A as proper fix.

---

## TASKS

### Immediate (Option B) — Change session capture frequency:
1. In OpenClaw config (`openclaw.json`), find the `session-memory-capture` cron schedule
2. Change from `0 */4 * * *` (every 4h) to `*/15 * * * *` (every 15 min)
3. Verify cron runs without errors

### Proper fix (Option A) — Session bridge on startup:
1. Create a new cron job: `session-bridge`
2. Trigger: on session start (or every 5 minutes as a near-real-time bridge)
3. Logic:
   - Read `sessions.json` to find the most recent prior main session
   - Read last 30 messages from that session's `.jsonl` file
   - Extract user messages and assistant text responses (skip tool calls)
   - Write condensed summary to `workspace/memory/session-bridge.md`
   - Format: "Last session context (auto-generated): [summary of recent exchange]"
4. Add `session-bridge.md` to `openclaw.json` workspaceFiles so it loads every session
5. The bridge file auto-overwrites each time, keeping it current

**Note:** Session bridge file should be capped at ~50 lines to avoid bloating context.
