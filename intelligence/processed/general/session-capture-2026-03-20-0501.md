# Session Memory Capture — 2026-03-20-0501

## Source Sessions
- Main Telegram session: 3cd597d4-f591-45cf-b9d3-2b919afe58ec (active, 602 messages)
- Continuation from previous captures at 0401 and 0431

---

## Key Decisions

1. CLAUDE.md rewritten — Builder now gets full company context on every session start: who Corey is, what NAH does, what Gunner is (off-limits), hard rules, LEARNINGS.md behavioral rules, gstack workflow, Paperclip protocol, pointers to MEMORY.md and TOOLS.md.

2. ACP spawns are dead — Paperclip issues only going forward. Xhaka updated SOUL.md to reflect this. No exceptions.

3. Communication protocol defined — Xhaka acknowledges receipt, says its in motion, confirms when done, states whats next. No narration of steps in between.

4. Routing corrected — Stop defaulting to Builder. Route by domain: Researcher (knowledge), Auditor (quality), Architect (UI), Librarian (files), Operator (GHL/config), Builder (code). Non-trivial code tasks: Researcher → Builder → Auditor.

5. Paperclip verified clean — All 7 agents have cwd=workspace, dangerouslySkipPermissions=true, PATH set, CLAUDE.md loaded on every start. Goals owned by Xhaka OpenClaw. Company description includes mission + repo + Gunner off-limits.

6. Paperclip URL (temporary): https://governor-win-oaks-technique.trycloudflare.com — changes on tunnel restart.

7. Cloudflared permanent URL — OPEN TASK: Corey needs to run cloudflared tunnel login in terminal on Mac mini to set up fixed URL. Conversation ended at this step at 05:01 AM.

---

## Rules Corey Stated

1. Agents must follow all the knowledge and material Corey has fed Xhaka — Builder/specialists need the same context, not just raw code capability.
2. Xhaka should not narrate steps — acknowledge receipt, confirm completion, state whats next. Nothing in between.
3. Stop saying Builder as default — all specialists are on equal footing; name the right domain.
4. Route by domain, use full chain — non-trivial tasks: Researcher → Builder → Auditor. Not Builder alone.
5. Paperclip is the execution layer, not ACP spawns.

---

## Open Tasks

1. OPEN: Cloudflared fixed URL — Corey was about to run cloudflared tunnel login when session ended at 05:01 AM. Need to complete this to get a permanent Paperclip URL.

2. Paperclip issues XHAA-14 through XHAA-19 — unknown completion status. Verify with Auditor.

3. All specialists context audit — now that CLAUDE.md is updated, verify each agents individual instructions file is still correct.

---

## Context Notes

- Session ran midnight to 05:01 AM CST on 2026-03-20
- Major theme: migrating from ACP spawns to Paperclip as execution layer
- Secondary theme: giving Builder full company context via CLAUDE.md
- Third theme: communication style and routing discipline from Xhaka
