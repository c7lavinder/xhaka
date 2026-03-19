# The Spec Is the New Code — Spec Driven Development

**Source:** Pasted  
**Published:** 2026-03-14  
**Relevance Score:** 10/10  
**Tags:** spec-driven-development, builder-workflow, task-decomposition, claude-code

## Summary
AI agents fail from ambiguity, not model weakness. Fix: Spec (WHAT) → Plan (HOW) → Tasks (ordered, self-contained) → Implement. Each Builder spawn must follow this structure.

## Key Insights
- Spec = functional/behavior layer. Plan = technical/architecture layer. Never mix them.
- Tasks unlock parallelism and agent-agnosticism
- 2-3x more tokens upfront, worth it for complex features
- The spec IS context engineering — you're filling the agent's context window with exactly what it needs

## Actions Taken
- SDD structure encoded in SOUL.md Builder spawn rule
- Every Builder prompt must have SPEC + PLAN + TASKS before spawning
