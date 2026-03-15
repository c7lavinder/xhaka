# Session Memory Capture — 2026-03-15-1546

## Key Decisions

### 1. Claude Code replaces expensive Builder spawns for coding
- Corey has Claude Code in Cursor ($200/month plan) — use that instead of spawning Builder sub-agents
- **Xhaka's role:** write the spec/brief → Corey pastes into Claude Code terminal → it builds
- Current broken workflow: Corey talking through plan with Cursor chatbot → copy/paste prompts to terminal = two AI layers playing telephone
- **Correct workflow:** Corey tells Xhaka what to build → Xhaka writes tight spec → Corey pastes into Claude Code once

### 2. Wednesday March 18 — Claude Code setup session locked
Setup checklist:
1. `npm install -g @anthropic-ai/claude-code`
2. `claude login`
3. `openclaw config set acp.allowAny true` + gateway restart
4. Create `CLAUDE.md` from existing rules
5. Wire Skill Graph into `.claude/skills/`
6. Add 3 Hooks (no main commits, tsc check, Telegram notify)

### 3. Model cost optimization applied
- Switched from Sonnet ($3/M) → GPT-4o-mini ($0.15/M) for routine chat
- Rule: stay on 4o-mini for daily chat; only use GPT-4o/Sonnet for complex specs

### 4. Gunner rebuild objective clarified
- Goal: rebuild Gunner visuals (enhanced from getgunner.ai) + drastically improve functionality + eliminate Manus dependency
- Corey has never built software before; needs page layout + basic functionality first, enhancements after
- Has existing build plans/docs — needs Xhaka to review and write Builder-ready specs

## Rules Corey Stated

- Builder spawning is too expensive — use Claude Code in Cursor instead (already paid for)
- Corey controls the terminal; Xhaka writes specs, Corey executes
- No more talking through plans with Cursor chatbot — come to Xhaka for specs
- "I have never built software before" — needs step-by-step execution, not strategy loops

## Open Tasks

| Task | Owner | ETA | Status |
|------|-------|-----|--------|
| Wednesday Claude Code setup | Xhaka briefs, Corey executes | Wed 2026-03-18 | 🔲 Pending |
| Verify morning-brief cron recovered | Xhaka | Mon 2026-03-16 6 AM CDT | 🔲 Pending |
| Verify feedback cron recovered | Xhaka | Mon 2026-03-16 8 AM CDT | 🔲 Pending |
| improve + cleanup cron self-recovery | System | Mon 2026-03-16 morning | 🔲 Pending |
| Gunner rebuild spec (from Corey's plans) | Xhaka | When Corey sends plans | 🔲 Waiting on Corey |
| Review Matt Lavinder AI setup advice | Corey | — | 🔲 FYI delivered |

## Infrastructure Status (as of 2026-03-15 ~3:30 PM CDT)

- **Gunner backend:** Up on Railway (gunner-v2), deployed 10:51 AM CDT today
- **Cron jobs failing:** `feedback`, `improve`, `cleanup` (3 total)
- **Root cause fixed:** `safeRun` timeout now calls `markJobFailed` — fix deployed, awaiting next run windows
- **morning-brief:** Was silently failing (None | None), fix deployed — next run 6 AM CDT tomorrow
- **GHL CRM status:** Was degraded Friday Mar 13, Corey worked on it manually — status unclear

## Context

- Corey's dad Matt Lavinder building AI ops layer: agents Nora (NAF), Max (personal), Pia (Sportsplex). Team: Will Riddle (builder), Ben Ha (infra).
- Xhaka advised: soul doc is most important, don't rush calibration, watch for org structure traps in AI builds.
- Corey "getting hammered" Saturday night (2026-03-15 ~midnight) — system held fine.
