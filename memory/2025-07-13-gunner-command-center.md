# Gunner Command Center Fix — 2025-07-13

## What We Did
Fixed the Gunner backend Command Center (`/dashboard/audit`) so agent activity is visible when GHL webhooks fire.

### Fixes Applied (all committed & deployed)
1. **Agent toggles were all `enabled: false`** in `src/core/registry.ts` — fixed to `true` (`7412e49`)
2. **AI writer returned placeholder in dry-run** — now actually calls Gemini since composing text is safe (`5591179`)
3. **`updateState()` failures blocked agent execution** — decoupled, DB failures non-blocking (`354ef2a`)
4. **trigger_log DB insert blocking** — made non-blocking (`0b10a0b`)
5. **Command Center sidebar used wrong agent IDs** (`data-hygiene`/`lead-iq` don't exist) — mapped to real IDs: `new-lead-pipeline`, `lead-scorer`, `lead-tagger`, `lead-noter`, `lead-task-creator`, `initial-outreach` (`563c9ce`)
6. **Rich metadata logging** added to all agents: contactName, phone, address, trigger chain, typed outputs with exact content
7. **Added API endpoints**: `/api/audit/agent/:agentId` (per-agent history), `/api/audit/feedback` (GET/POST)
8. **LIVE ACTIONS panel + FEEDBACK section** added to audit.html UI

### Still TODO
- [ ] Last 10 fires/activities display per agent in UI
- [ ] Per-activity feedback (👍/😐/👎 tied to individual fires, not global)
- [ ] Bryan Leftwich webhook lost during deploy gap — needs stage move to re-trigger
- [ ] Consider persisting audit log to Postgres (currently in-memory, wiped on deploy)
- [ ] Remove debug logging once stable

### Key Architecture Notes
- `DRY_RUN=true` — AI composition runs, GHL writes skip
- In-memory audit wipes every Railway deploy
- No `data-hygiene` or `lead-iq` agent files — functionality in `new-lead-pipeline` and `lead-scorer`
- Playbook: `src/playbooks/tenants/nah.json` — 26 triggers

### Key IDs
- Railway service: `facfb1ea-9c64-4060-a38f-31564a126106`
- GHL Location: `hmD7eWGQJE7EVFpJxj4q`
- Sales Pipeline: `tOqQbembKlIoPiXbepP3`
- New Lead Stage: `f919c1a7-17da-456f-b8f9-10c1aca62691`
- Warm Stage: `34b88324-9bb1-4110-8531-d4271c6c1567`
