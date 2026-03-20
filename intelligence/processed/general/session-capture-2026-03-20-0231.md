# Session Capture — 2026-03-20-0231

## Session: 3cd597d4 (Main Telegram — Corey, ~01:11–02:31 AM CDT)

### Key Decisions

1. **Paperclip setup mode = "just a board"** — Corey decided Paperclip should be a visual layer only (issues, goals, projects visible). Autonomous `claude_local` execution disabled. The 8 agents are named slots for visibility, NOT for auto-spawning.

2. **Agents are peers, not a hierarchy** — Corey pushed back on Builder being treated as dominant. All specialists (Builder, Researcher, Auditor, Architect, Operator, Librarian) own their domain equally.

3. **Gunner is OFF LIMITS for Xhaka** — Xhaka violated this rule tonight (sent Builder into the Gunner repo). Acknowledged. Rule reinforced hard.

4. **Auditor has NOT been running as real independent check** — Xhaka admitted it. Post-Builder review has been Xhaka glancing, not Auditor running independently. This is a known gap.

5. **Will Riddle Monday = low stakes** — just showing team that things exist/work. No hard deadline. No need to over-prepare.

6. **Session capture cadence changed to 30min** (was 4h).

7. **SDD push rule hardened in SOUL.md** — every SDD must explicitly include: "Do not ask for permission before committing or pushing. Complete all tasks end-to-end including the push."

### Rules Corey Stated

- **Gunner is off limits** — Xhaka does NOT touch the Gunner repo. No exceptions. Gets shut off if it happens again.
- **Default action, not questions** — when Corey says "hammer through all of those," start top to bottom without asking which one.
- **Agents must not auto-run without supervision** — 300 max turns in Paperclip was too much rope. Autonomous production pushes without oversight are unacceptable.

### Open Tasks

- [ ] **Gunner CRM Railway deploy** — Corey needs to manually trigger the deploy for the CRM changes the Builder pushed (Xhaka can't touch it)
- [ ] **XHAA-18** — Session transcripts feature in Paperclip (not done yet)
- [ ] **Gunner Settings Page SDD** — needs to be written
- [ ] **Auditor as genuinely independent agent** — still not actually running on its own timer. Gap acknowledged, not fixed.
- [ ] **Builder max turns** — 300 is too high per run. Should be reduced to ~50 (decision made in conversation, implementation pending)
- [ ] **Paperclip agents** — instructions file paths set, cwd configured, 0 errors — but agents not autonomously executing (intentional)

### Context / Background

- **Control Room deploy confirmed** — Next.js fix pushed by Builder at 1:36 AM, Railway deploying
- **Paperclip v2026.318.0 installed** — running at http://127.0.0.1:3101 on Mac mini. PostgreSQL already existed from prior install.
- **XHAA-19 closed** — "Paperclip real-time loop: Xhaka creates issues → agents execute → live board" — completed successfully
- **Railway intelligence jobs** (Node.js scheduler) are separate from Paperclip — different cost model (GPT-mini/OpenAI API vs claude CLI on Claude.ai subscription)
- **claude CLI = OAuth account** on Corey's Claude.ai subscription, NOT Anthropic API credits

---

## Session: 58163bc7 (Paperclip wake event — ~01:58 AM CDT)

- Paperclip triggered XHAA-19 (Xhaka-assigned issue: "Paperclip real-time loop")
- Xhaka ran the cloud adapter wake procedure
- Confirmed loop ran clean end-to-end: wake → issue read → execution → board updated
- XHAA-19 marked done ✅

---

## Session: dc622c6a (workspace-sync cron — ~02:23 AM CDT)

- Workspace sync ran — all 8 files already identical to GitHub
- Synced 0/8, skipped 8, errors 0
- No changes needed

---

*Captured: 2026-03-20 02:31 AM CDT*
