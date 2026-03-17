# 🤖 Agent & Skill System Management

This playbook defines how we transition from "Solo Agents" doing tasks to "Skill Systems" (Plugins) running entire business processes. We use a [[Skill Graph]] architecture to connect these pieces.

## 🏛️ System-First Architecture
(Inspired by the "Pattern 1: Shared Context" Research)

We do not build isolated skills. We build **Systems** where the glue is automated, not Corey.

1. **Shared Context (Pattern 1)**: Every skill in a system must reference the same foundational files:
   - `SOUL.md` (Tone/Persona)
   - `USER.md` (Corey's Preferences)
   - [[Master Skill Graph]] (The Business DNA)

2. **The "Hand-off" Principle**: 
   - A skill must never end in a "Response." It must end in a "File" or a [[Task Queue]] entry.
   - Example: The Capture Skill writes to Inbox -> The Dispatcher sees the file -> The Researcher Skill triggers automatically.

3. **Commands vs Skills vs Plugins**:
   - **Command**: "How" (e.g., `git push`). Routine technical actions.
   - **Skill**: "What" (e.g., `SEO Auditor`). A specific capability.
   - **Plugin**: "Business Process" (e.g., `Gunner Growth Engine`). A collection of skills and commands that produce a finished result.

## 📋 The Development Rule
Before building a new skill, the Architect must ask: *"Which shared context files does this need, and what is the automated hand-off to the next step?"*

---
*Status: Updated 2026-03-14 to reflect Plugin/System architecture.*

## 🔗 Connective Patterns for Workflow Automation
*Inspired by the 2026-03-14 Research*

**Pattern 2: Output-as-Input Chaining**
Agents must be "loosely coupled" through the file system or the task queue.
- Skill A output directory = Skill B input directory.
- No agent should be the "glue" for another; the data must flow automatically.
- Every task in the Queue must produce a structured artifact that the next agent can parse.

**Pattern 3: Orchestration via the Dispatcher (The Queue)**
- High-frequency chains (like Research/Writing) run via the **Task Queue** for speed.
- Low-frequency/System-wide chains (like Synthesis/Cleaning) run via **Schedules** (Cron).
- The Dispatcher is our "Orchestrator" that ensures Skill B fires only after Skill A successfully writes its artifact.

## 🏗️ Production Pipeline Standard
A system is only "Production Ready" when it has:
1. **Shared Context**: Loads `brand-voice.md` or equivalent playbooks.
2. **Automated Handoff**: No manual copy-pasting of results.
3. **Error Logging**: Every handoff must be logged to `data/results.tsv` or the Queue.
