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

