# Session Memory Capture
**Timestamp:** 2026-03-15 04:47 UTC (2026-03-14 11:47 PM CDT)
**Captured by:** Xhaka memory-scribe cron

---

## KEY DECISIONS

### Gunner Build Workflow (2026-03-13)
- **DECISION:** Stop using Cursor Chat as middleman between Corey and Claude Code terminal
- New workflow: Corey tells Xhaka → Xhaka writes spec → Corey pastes into Claude Code terminal → terminal builds
- Cursor Chat is retired from the build loop

### Builder Cost Decision (2026-03-13)
- **DECISION:** Xhaka-spawned Builder (ACP) is too expensive; use Claude Code via Cursor's $200/month plan instead
- Xhaka writes briefs; Claude Code in terminal executes

### Model Cost Optimization (2026-03-14)
- **DECISION:** Switched main chat from Anthropic Sonnet → GPT-4o → GPT-4o-mini
- GPT-4o-mini ($0.15/M) for day-to-day conversation; GPT-4o or Sonnet only for complex specs/decisions
- OpenAI provider added to OpenClaw config

### Claude Code ACP Setup (deferred to Wednesday 2026-03-19)
- **DECISION:** Set up Claude Code as proper ACP-integrated Builder on Wednesday
- Install: `npm install -g @anthropic-ai/claude-code` + `claude login`
- Enable: `openclaw config set acp.allowAny true` + gateway restart
- Create CLAUDE.md from existing rules; wire Skill Graph into `.claude/skills/`
- Add 3 Hooks: no main commits, tsc check, Telegram notify

---

## RULES COREY STATED

1. **Don't ask questions I can find in the repo** — read it first, then come back with answers
2. **Memory must be automatic** — append to `memory/YYYY-MM-DD.md` throughout session without being asked
3. **Xhaka does NOT write code** — the Builder (Claude Code terminal) does that
4. **Corey uses Cursor $200/mo plan** — don't spawn expensive ACP builder sessions

---

## OPEN TASKS

### 🔴 CRITICAL — Wednesday 2026-03-19
- [ ] Set up Claude Code ACP integration (4-step install sequence above)
- [ ] Create CLAUDE.md at xhaka repo root from existing rules
- [ ] Wire Master Skill Graph into `.claude/skills/`
- [ ] Add pre-commit hooks

### 🟡 GUNNER — Active
- Gunner CRM had `degraded` status on 2026-03-13 morning; Corey was working on GHL fix directly
- Rebuild in progress: through Wave 5 per `BUILD-STATUS.md`
- REBUILD-PLAN.md has 23 sections — comprehensive spec exists
- Reference site for visual design: TBD (Corey hadn't confirmed yet in captured sessions)
- Goal: rebuild getgunner.ai visuals enhanced + drastically improve functionality + remove Manus dependency

### 🟡 XHAKA SERVICE
- `xhaka-production.up.railway.app` → 404 as of 2026-03-13 morning; domain may be unset

### 📋 PEOPLE CONTEXT
- **Matt Lavinder (Corey's dad):** Building AI ops layer for New Again Franchises (NAF), Bristol Sportsplex, podcast
  - Agents: Nora (NAF), Max (Matt's personal), Pia (Sportsplex)
  - Team: Will Riddle (build), Ben Harrison (tech lead)
  - Corey advised: soul doc is critical, watch for infra gatekeeper bottleneck

---

## SYSTEM STATE (2026-03-14 night)
- OpenClaw model: switched to `openai/gpt-4o-mini` (cost optimization)
- Workspace sync: all 8 files matched GitHub (no pushes needed)
- Gunner health: unknown at time of capture (last check was degraded on 3/13)
