# Session Memory Capture — 2026-03-20-0931

## Capture Window: ~9:01 AM – 9:31 AM CST, Friday March 20, 2026

---

## Key Decisions

1. **Paperclip is the ONLY execution layer** — ACP spawns are dead. Any task beyond a quick lookup gets a Paperclip issue. No exceptions. Codified in SOUL.md.

2. **Xhaka broke his own rule** — Fixed the Paperclip server crash directly via terminal (killed stale process) to unblock Corey. Corey caught it. Rule reinforced: even when Paperclip is down, no emergency manual fixes. Solve it structurally. If it didn't happen on the board, it didn't happen.

3. **Catch-22 rule codified** — If Paperclip crashes, the Operator (who lives inside Paperclip) is unconscious. Solution: build a Watchdog (XHAA-28) so the system can self-recover without Xhaka playing IT.

4. **ngrok abandoned, Cloudflare Quick Tunnels adopted** — ngrok's free plan intercepts JS bundles with a browser interstitial, causing black screen. Switched to Cloudflare Quick Tunnels which don't have this problem. Current temp URL: https://hobby-upon-locale-fought.trycloudflare.com (changes on restart).

5. **Anthropic API credits ran out** — Session temporarily on gpt-4o-mini, then Gemini Flash (gemini-3-flash-preview), then back to Sonnet. Memory capture crons were failing due to Anthropic credit outage earlier. Now resolved (balance topped up or model fallback working).

6. **CLAUDE.md rewritten** — Builder now receives full company context on session start. Verified by Builder.

7. **7 Paperclip agents verified clean** — All have cwd=workspace, dangerouslySkipPermissions=true, PATH set, CLAUDE.md loaded. Goals owned by Xhaka OpenClaw.

---

## Rules Corey Stated

1. **No emergency fixes from Xhaka, ever** — even when the system that would handle it is down. Solve gaps structurally.
2. **If it doesn't happen on the board, it didn't happen** — all execution goes through Paperclip.
3. **Route by domain, not habit** — Builder is not the default. Use full chain for non-trivial tasks: Researcher → Builder → Auditor.
4. **Xhaka does not narrate steps** — acknowledge receipt, confirm completion, state what's next.
5. **ACP spawns are dead** — Paperclip issues only.

---

## Open Tasks (Persistent)

1. **🔴 XHAA-28 (Watchdog)** — Spec written and on Paperclip board. NOT YET ASSIGNED to Builder. Corey needs to open board and assign it. Watchdog will auto-restart Paperclip if it crashes and send Telegram alert.

2. **🔴 Permanent Cloudflare Tunnel** — `cloudflared tunnel login` timed out at ~05:01 AM when it was waiting for browser auth. Current URL is a temporary Quick Tunnel that changes on restart. Corey needs to run this command interactively in a Mac mini terminal window.

3. **🔴 Gunner CRM degraded** — `crmStatus: "degraded"` flagged on heartbeat. Persisting. Not yet assigned to Builder.

4. **🟡 Intelligence jobs failing** — `capture` and `organize` jobs have been failing intermittently. Root cause unknown. Needs Builder investigation.

5. **🟡 Permanent ngrok URL** — `https://nonuterine-unprickly-rosalba.ngrok-free.dev` is permanent (launchd managed) but blocked by ngrok's browser interstitial. Replaced by Cloudflare tunnel but ngrok tunnel may still be running. Should be cleaned up.

---

## System Status (as of 9:31 AM CST)

- Paperclip: ONLINE (Cloudflare Quick Tunnel)
- Gunner: CRM degraded, rest healthy  
- Railway: xhaka-intelligence + xhaka — healthy (SUCCESS)
- Memory captures: running cleanly (every 30 min)
- Anthropic API: was down, now restored
- Current session model: anthropic/claude-sonnet-4-6
- workspace-sync cron: had errors earlier, status uncertain

---

## Context Notes

- Corey was awake midnight to ~9am working on all of this
- Daily personal question sent at 9am: Corey's Nashville social circle / friend group status
- Session has been compacted 2x — 412 messages in main session file
