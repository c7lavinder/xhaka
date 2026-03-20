# Session Memory Capture — 2026-03-20-0901

## Source Sessions Reviewed
- Main Telegram session: 3cd597d4-f591-45cf-b9d3-2b919afe58ec (867 messages, active)
- Previous cron captures: 0501, 0601, 0701, 0731, 0801, 0831 (all committed to GitHub)

---

## Key Decisions (This Window: 8:01–9:01 AM CST)

1. **Catch-22 rule officially codified** — Xhaka broke protocol earlier by manually fixing the server when Paperclip was down. Resolution is NOT expanding permissions. Resolution is building a Watchdog agent (XHAA-28) so it never gets that bad again. The rule stands: if it doesn't happen on the board, it didn't happen.

2. **XHAA-28 (Watchdog) created** — Sitting on the Paperclip board. Waiting for Corey to assign to Builder. No progress yet.

3. **Cloudflare Quick Tunnel adopted as temporary Paperclip URL** — Replaced ngrok. URL changes on tunnel restart. Permanent URL still not established (cloudflared login timed out at 7:41 AM CST).

4. **workspace-sync cron erroring** — The cron that syncs config files to GitHub is failing. Suspected same Anthropic credit/API issue from earlier this morning. Flagged in heartbeat checks.

5. **Daily personal question cron fired** — Asked Corey about his Nashville social circle (gap in USER.md). No response yet.

6. **Capture and organize intelligence jobs failed** — capture failed at 11:40 UTC, organize at 04:00 UTC. Builder investigation pending.

---

## Rules Reinforced This Window

1. **Catch-22 is non-negotiable** — No manual emergency fixes from Xhaka, even if Paperclip is down. Structural solution (Watchdog) only.
2. **If it doesn't happen on the board, it didn't happen** — All execution goes through Paperclip issues.
3. **Paperclip is the only execution layer** — ACP spawns are dead. No exceptions.

---

## Open Tasks (Carry-Forward)

1. **CRITICAL: XHAA-28 (Watchdog)** — Needs Corey to assign to Builder. Prevents Catch-22 from recurring.
2. **Cloudflared permanent URL** — Corey needs to run `cloudflared tunnel login` interactively on Mac mini. Must open browser on the machine.
3. **Gunner CRM degraded** — `crmStatus: "degraded"` flagged in multiple heartbeats. Needs Builder.
4. **capture + organize jobs failing** — Intelligence pipeline down. Needs Builder investigation.
5. **workspace-sync cron erroring** — Config file sync to GitHub broken. Investigate.

---

## Context Notes

- This window (8–9 AM CST) was mostly cron heartbeats and memory syncs — no direct Corey interaction
- All prior decisions from midnight-8am captured in previous cron files on GitHub
- Corey is likely just waking up around this time (usual wake ~9am CST)
