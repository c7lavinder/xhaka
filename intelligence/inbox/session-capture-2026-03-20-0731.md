# Session Memory Capture — 2026-03-20-0731

## Period Covered
Friday, March 20, 2026 — 05:00 AM to 07:31 AM CST

---

## Key Decisions

1. **Paperclip is the ONLY execution layer** — ACP spawns are dead. Every task beyond a quick lookup gets a Paperclip issue assigned to the right agent.

2. **ngrok free plan is unusable** — browser interstitial blocks JS assets, dashboard goes black. Abandoned.

3. **Switched to Cloudflare Quick Tunnel** as workaround for the Paperclip URL. Current URL is TEMPORARY and will die on reboot.

4. **Xhaka violated the no-technical-work rule** — directly killed stale server process on Mac mini to fix the black screen. Admitted it. Rule reinforced.

5. **Structural gap identified:** Paperclip cannot dispatch The Operator when Paperclip itself is down (Catch-22). Solution: Watchdog script that auto-recovers independently.

6. **XHAA-28 created** — Watchdog spec drafted and added to Paperclip board. Needs Builder assignment from Corey.

7. **Anthropic API credits ran out** — background cron jobs failed early AM. Switched main chat to Gemini Flash, then Gemini Pro. Jobs resumed once a different model took over.

8. **All 7 Paperclip agents verified working** — Builder + all 5 untested agents passed loop tests.

---

## Rules Corey Stated

- Xhaka must not execute technical fixes directly, even in emergencies.
- When the system crashes, architect a structural solution (Watchdog), not a manual intervention.
- Paperclip is the tracking and execution layer. If it doesn't appear in Paperclip, it didn't happen properly.

---

## Open Tasks

1. **XHAA-28 (Watchdog)** — Corey needs to assign to The Builder on Paperclip board.

2. **Permanent Tunnel** — Cloudflare Quick Tunnel URL is temporary. Need permanent tunnel (requires cloudflared tunnel login on Mac mini).

3. **Paperclip Permanent URL launchd setup** — Once permanent tunnel is live, lock into Mac mini launchd for reboot survival.

4. **workspace-sync cron erroring** — Observed at 06:40 AM heartbeat check. May need debugging.

5. **Anthropic API credits** — Monitor; background jobs fail when credits run out.

---

## System Status (as of 07:31 AM CST)

- xhaka-intelligence Railway: healthy
- xhaka Railway: healthy
- Paperclip: running via Cloudflare Quick Tunnel (TEMPORARY URL)
- session-memory-capture cron: running
- workspace-sync cron: erroring as of 06:40 AM
- MEMORY.md: 126 lines (under 150 limit)
