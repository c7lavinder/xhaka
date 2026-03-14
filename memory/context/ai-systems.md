# AI Systems — Permanent Knowledge

> Distilled principles from Claude Skills 2.0. These are not suggestions — they are the operating model for how intelligence is built in this system.

---

## Core Principles

### 1. Prompts Are Temporary. Skills Are Permanent.
A one-off prompt gets a one-off answer. A skill gets a repeatable, improvable result.

If you've run the same task more than twice, it deserves a skill.md. If it's in a skill.md, it can be tested, benchmarked, handed off, and improved without losing context.

**Implication for this system:** Every agent in `agents/` is a skill. Every job in `intelligence/` is a skill. Every new workflow added here must be skill-structured before it goes live.

---

### 2. Every Repeated Task Deserves a skill.md

**skill.md format:**
1. `Description` — one sentence: what it does, when to use it
2. `Steps` — numbered, exact sequence from input to output
3. `Examples` — at least one sample input and the expected good output
4. `Rules/Constraints` — explicit guardrails (what this skill must never do)

This format is not bureaucracy. It's the difference between a workflow that degrades quietly and one that fails loudly and improves.

---

### 3. Test Before Deploying. Benchmark for Consistency.

Testing tells you it works once.
Benchmarking tells you it works reliably.

**How to benchmark:**
- Run the same workflow on 2 different inputs
- Compare structure, quality, and completeness
- Flag any workflow where output quality changes based on input characteristics

**Standard:** A skill is not production-ready until it has passed a 2-input benchmark.

---

### 4. Build In Self-Improvement

Every skill should ask after each run: *Did this meet the quality bar? If not, what specific instruction change would fix it?*

Improvement suggestions are logged (not discarded). They feed back into the skill definition. This is how the system gets smarter without human intervention on every cycle.

See: `memory/context/researcher-improvements.md` for the live log from the Researcher.

---

### 5. Composability: Small Reliable Modules > One Complex Monolith

**The stack model:**
```
session-capture → inbox → daily-log → organize → scribe → MEMORY.md
```

Each module:
- Does exactly one thing
- Has defined inputs and outputs
- Fails loudly (not silently)
- Can be replaced or upgraded without rebuilding the whole pipeline

**Red flags for a non-composable system:**
- One "mega-job" that does 5 things in sequence with no checkpoints
- Silent failures that let corrupted data flow downstream
- A workflow that requires understanding the entire system to modify one step

---

## Applied to This System

| Principle | Where It Lives |
|---|---|
| Skill format | `agents/builder.md` → Skill Design Standard |
| Benchmarking | `agents/auditor.md` → Benchmarking Protocol |
| Self-improvement | `agents/researcher.md` → Self-Improvement Loop |
| Composable stack | `WORKFLOW.md` → Skill Stack Architecture |
| Improvement log | `memory/context/researcher-improvements.md` |

---

## What This Is NOT

- This is not a philosophy document. It's an operating model.
- These principles only matter if they're reflected in how agents actually run.
- If a new workflow is added without a skill.md, that's a violation — not an oversight.

---

*Last updated: 2026-03-14 | Source: Claude Skills 2.0 series*
