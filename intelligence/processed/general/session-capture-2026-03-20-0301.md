# Session Capture — 2026-03-20-0301

**Captured:** Friday March 20, 2026 — 3:01 AM CST
**Session covered:** ~1:11 AM – 3:01 AM CST (session 3cd597d4)

---

## Key Decisions

1. **Paperclip migration plan updated** — Full overhaul incorporating articles on Paperclip, gstack, autoresearch, and Sparkwave orchestration patterns. Paperclip IS the execution layer (not just board), with gstack skills as guardrails.

2. **gstack updated v0.4.4 → v0.9.0** — `/office-hours`, `/careful`, `/freeze`, `/unfreeze`, `/guard`, `/investigate` all now live. Xhaka ran the update directly (not Corey).

3. **autoresearch confirmed missing** — Install method is NOT git clone. Must fire Claude Code and ask it to build a skill based on `github.com/karpathy/autoresearch`. This is the R&D layer for Gunner prompt optimization / model benchmarking. Added to Paperclip migration plan.

4. **NAH and Gunner should be separate Paperclip companies** — article explicitly called this out. Added to migration plan.

5. **Paperclip currently running locally on Mac mini** (`http://127.0.0.1:3100`). 6 agents registered. Cloudflare tunnel active but URL changes on restart (permanent URL fix is pending).

6. **Control Room Monday demo** — Builder was spawned to fix Railway deploy serving old vanilla HTML instead of Next.js. Monday = Will Riddle demo. Paperclip NOT relevant to Monday demo.

7. **Gunner CRM degraded = false alarm** — health check flags degraded when no GHL webhook in last 2 hours. No webhook ≠ broken. Builder fixed the threshold logic.

---

## Files Updated Tonight

- `agents/builder-instructions.md` — Complete overhaul:
  - "Do what is asked. Nothing more." rule
  - TodoWrite mandate with in_progress/completed discipline
  - "Never push unless explicitly instructed" rule
  - File operation rules (Read before Edit, Edit over Write)
  - Paperclip Protocol section (acknowledgment protocol, commit hash verification, cross-agent coordination — from Sparkwave docs)
  - Binary acceptance criteria pattern
  - Parallel task format

- `agents/paperclip-migration/STATUS.md` — Updated with:
  - autoresearch as missing component
  - Railway/Paperclip cleanup note
  - Acknowledgment protocol added to architecture decisions
  - gstack v0.9.0 skill list updated

- `agents/paperclip-migration/WORKFLOW-TEMPLATES.md` — Created/updated with new gstack skills and binary acceptance criteria pattern

---

## Bugs Fixed Tonight

1. **cron race condition fixed** — `improve` (Mon) and `cleanup` (Sun) staggered to 6:30 AM. Was: all 3 heavy jobs (propagate, improve, cleanup) fired at 6:00 AM simultaneously, causing SHA collision. Fix: 2 lines in `scheduler.ts`. Builder committed + pushed.

2. **TypeScript CI restored** — `package-lock.json` had 131 lines of version mismatches. Regenerated with `npm install`. First passing GitHub Actions CI in weeks.

3. **Gunner CRM false alarm fixed** — Health check threshold logic fixed. Was triggering degraded whenever no GHL webhook in 2-hour window.

4. **HEARTBEAT.md updated** — Now explicitly reads job-registry.json, checks for overdue weekly jobs, has hard rules against re-alerting.

5. **gstack upgraded** — v0.4.4 → v0.9.0 with new skills.

---

## Open Tasks / Still Pending

1. **Control Room Monday demo fix** — Builder was spawned, status unknown at capture time. Must show Next.js app (not vanilla HTML) for Will Riddle Monday.

2. **autoresearch skill** — Not built yet. Must ask Claude Code to build it as a skill from `github.com/karpathy/autoresearch`. For Gunner prompt optimization and model benchmarking.

3. **Session transcript loading on restart** — When OpenClaw gateway restarts, conversation history is wiped. Need a solution so context survives restarts. Not yet solved.

4. **Paperclip permanent Cloudflare tunnel URL** — Currently changes on restart. Needs to be made stable.

5. **synthesize job overdue** — Was 8 days overdue at start of session. Synthesis ran manually but the scheduled job still needs to be verified.

6. **Gunner Settings Page** — 6 sections, Builder-ready SDD exists, not yet spawned.

7. **Sunday 6:30 AM cleanup + Monday 6:30 AM improve** — First real verification of the cron fix.

---

## Rules Corey Stated Tonight

- "Why would I run it" — Corey should NEVER be asked to run scripts or CLI commands. If it can be run, Xhaka runs it.
- Corey called out Xhaka for saying gstack was missing when it was already installed. Rule reinforced: **check before claiming something is missing**.
- Corey was frustrated with surface-level article analysis ("I sent you a thousand words, how is that the only thing important?"). Rule reinforced: **go word for word through articles, extract everything actionable**.
- Corey confirmed Paperclip migration plan direction — Paperclip as execution layer with gstack guardrails is correct.

---

## Context for Next Session

- Paperclip is ~70% migrated. The key remaining pieces are: autoresearch skill, session transcript persistence, stable Cloudflare URL, and verifying the cron fixes on Sunday/Monday.
- gstack v0.9.0 is now the baseline. `/careful` blocks destructive commands. `/review` and `/qa` are the quality gates.
- Monday demo = Control Room. Show Will Riddle the dashboard. Do NOT demo Paperclip.
- Builder should never push unless explicitly told to.
- Sparkwave acknowledgment protocol: every task must start with acknowledgment comment in code, commit hash must be verified before marking done.
