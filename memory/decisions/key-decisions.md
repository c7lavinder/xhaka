# Key Decisions Log

---

## 2026-03-13 — "Real fix, always" — Permanent Operating Principle
**Decision:** Never patch symptoms. Always fix root causes.
**Context:** Established after a series of band-aid fixes that masked underlying issues.
**Outcome:** Permanent operating principle for all agents. No patches accepted.

## 2026-03-13 — Gunner Railway Project Off Limits for Xhaka
**Decision:** Gunner Railway project (f379b683) is permanently off limits for Xhaka agents without explicit Corey authorization.
**Context:** Risk of unauthorized changes to production Gunner system.
**Outcome:** Rule hardcoded into corey.md, gunner.md, and all agent definitions.

## 2026-03-13 — Session-Capture Cron Architecture
**Decision:** Session-capture cron runs FROM OpenClaw (not Railway).
**Context:** Gateway is loopback-only — Railway can't reach it. OpenClaw native cron is the right tool.
**Outcome:** Session-capture cron added at 4h interval via OpenClaw. Needs verification.

## 2026-03-13 — New Gunner Build Workflow
**Decision:** Xhaka writes Claude Code prompts → Corey pastes to terminal. Cursor chat retired as planning middleman.
**Context:** Cleaner separation of planning vs. execution. Xhaka owns the spec, Builder owns the build.
**Outcome:** New workflow active. All Gunner engineering tasks follow this pattern.

## 2026-03-11 — Memory System Structured
**Decision:** Set up long-term memory system with subfolders (archive, important, people, projects, decisions, context).
**Context:** Memory was growing chaotically with 50+ daily files and no structure.
**Outcome:** Cleanup job added, subfolders created, MEMORY.md capped at 150 lines.

## 2026-03-11 — Xhaka Railway Project = My Focus
**Decision:** Corey explicitly told me the Xhaka Railway project is my entire focus. Not Gunner.
**Context:** I kept drifting into Gunner engineering work.
**Outcome:** Rule hardcoded into SOUL.md and AGENTS.md.

## 2026-03-11 — Xhaka Intelligence Service Live
**Decision:** Deploy intelligence service as separate Railway service from the showcase.
**Context:** Root directory confusion was causing deploy failures. Cleaner to split into two services.
**Outcome:** `xhaka` (showcase) + `xhaka-intelligence` (jobs) — both live.

## 2026-03-08 — Xhaka is COO Only, Not Engineer
**Decision:** Corey explicitly stated: "I do not want you building stuff. I need you more of a homie that organizes my life and empowers me to do more."
**Context:** I was spending too much time in code/engineering work.
**Outcome:** Role clarity rule added to SOUL.md. AGENTS.md updated.

## 2026-03-08 — Manus Dependencies Eliminated from Gunner
**Decision:** Remove all Manus infrastructure from Gunner stack.
**Context:** Moving to independent stack (OpenAI Whisper, Supabase Storage, JWT auth).
**Outcome:** Stack 100% independent. Builder executed.

## 2026-03-05 — AI Acquisition Machine Plan
**Decision:** 30-day plan to systematize NAH lead acquisition with AI.
**Context:** Need to grow NAH without adding headcount.
**Outcome:** Plan documented in memory/2026-03-05-acquisition-machine.md. Not yet executed.

---
Last updated: 2026-03-13
