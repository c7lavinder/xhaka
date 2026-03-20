# Session Memory Capture — 2026-03-20-1325

## Source Sessions
- agent:main:cron:0bc114f3-c3e2-4684-ba46-708d97ff9d93 (Active Cron)
- History from main Telegram session (3cd597d4) and cron captures (0501, 0741)

---

## Key Decisions
1. **CLAUDE.md Rewritten**: Builder now has full company context (Corey, NAH, Gunner off-limits, rules).
2. **ACP Spawns are Dead**: Paperclip issues are the only execution layer. No exceptions.
3. **Communication Protocol**: Xhaka acknowledges, confirms completion, states what's next. No step-by-step narration.
4. **Routing by Domain**: Stop defaulting to "Builder". Use Researcher (knowledge), Auditor (quality), Architect (UI), Librarian (files), Operator (GHL), Builder (code).
5. **Paperclip Verified**: 7 agents active, cwd=workspace, CLAUDE.md loaded on start.

---

## Rules Corey Stated
1. **Context Parity**: Agents must follow all context/material Corey has fed Xhaka.
2. **No Narration**: Acknowledge receipt, confirm completion, state what's next. Nothing in between.
3. **Specialized Routing**: Non-trivial code tasks: Researcher → Builder → Auditor.
4. **Paperclip Only**: No more one-off ACP spawns for repo edits.

---

## Open Tasks
1. **🔴 URGENT: Cloudflare Tunnel Login**: Corey needs to run `cloudflared tunnel login` on the Mac mini terminal to set up the permanent Paperclip URL. The previous attempt timed out.
2. **🔴 Gunner CRM Status**: `crmStatus: "degraded"` remains unresolved. Pending assignment to Builder.
3. **🔴 Pipeline Failures**: `capture` and `organize` jobs are failing. Builder investigation needed.
4. **Context Audit**: Verify all specialist agent instructions align with the new CLAUDE.md.
