# LEARNINGS.md — Behavioral Rules in Effect

> Distilled from articles, books, and sessions. These rules are active — not archived.
> Loaded every session. Violation = system failure.

---

## SDD — Spec Driven Development
Source: "The Spec Is the New Code" article (2026-03-16)

**Rule:** Every Builder spawn MUST follow this structure:
1. ## SPEC — what it does (functional, acceptance criteria, Given/When/Then)
2. ## PLAN — how to build it (architecture, patterns, existing code to reference, constraints)
3. ## TASKS — ordered list, each self-contained, no ambiguity

Mixing functional + technical in the same prompt = ambiguity = bugs = wasted time.
If I am writing a Builder prompt without these 3 sections, STOP and restructure.

---

## Vertical Beats Horizontal (47 Micro-SaaS)
Source: "I Built 47 Micro-SaaS Tools in 90 Days" (2026-03-16)

**Rule:** Before evaluating any new product idea, run the 5-factor score:
Customer income × Usage frequency × Market gap × Can't self-build × Integration depth
Score >500 = build. Score <200 = skip.

Gunner scores ~2,000. Stay vertical, stay SMB, don't go horizontal.

---

## Knowledge Compounds Only If Loaded (Claude + Obsidian)
Source: "The Memory Stack That Compounds" (2026-03-16)

**Rule:** Every insight must end in a file change that gets loaded next session.
Storing knowledge that never gets read = zero value.
LEARNINGS.md must be in OpenClaw workspace context files.

---

## Self-Image Is the Ceiling, Not Skill (Psycho-Cybernetics)
Source: Book — Maxwell Maltz

**Rule:** When diagnosing team underperformance, ask self-image question first.
Chris at 36% is a self-image ceiling, not a skill gap.
Address the identity before the technique.

---

## Diagrams Must Argue, Not Display (Excalidraw Skill)
Source: Excalidraw diagram skill (2026-03-16)

**Rule:** Every visual must pass the isomorphism test: if you removed all text, would the structure alone communicate the concept?
If not — redesign. Shape IS the meaning.
---

## Multi-Agent Architecture Rules (2026-03-16)
Source: "Claude Subagents vs Agent Teams"

**Rule 1 — Split by context, not by role.**
Never split agents by org chart (planner/implementer/tester). Split only when context can be genuinely isolated. If two subtasks need overlapping information, they belong to the same agent.

**Rule 2 — Sub-agents for parallel exploration. Agent teams for ongoing negotiation.**
Sub-agents: fire-and-forget, isolated, result flows back to parent. Use for: research, lookups, codebase exploration.
Agent teams: persistent, peer-to-peer, shared state. Use for: features that require reconciliation across agents.

**Rule 3 — Never write code in parallel sub-agents.**
Parallel agents writing code make incompatible assumptions. Sub-agents for coding = answer questions and explore only. One agent writes the code.

**Rule 4 — Start with one agent. Add complexity only where it breaks.**
Most multi-agent pipelines could have been better prompting on a single agent. Measure before adding agents.

**Rule 5 — The description field IS the router.**
In Claude sub-agent SDK: the description field routes tasks. Keep it specific and distinct from other agents or they'll conflict.

**Rule 6 — Tier models by task complexity.**
Heavy reasoning → Sonnet/Opus. Routing/summarizing → GPT-4o-mini. Never use expensive models for routine work.
