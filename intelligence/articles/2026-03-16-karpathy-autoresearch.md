# Karpathy's Autoresearch — Autonomous Improvement Harness

**Source:** Pasted (manthanguptaa.in)  
**Published:** 2026-03-14  
**Relevance Score:** 9/10  
**Tags:** autonomous-agents, harness-design, self-improvement, reversibility

## Summary
Autoresearch: edit one file → run for fixed time → measure → keep if better, revert if not → repeat. 550 experiments, zero babysitting.

## Key Insights
- Constraints make agents better. One file, one metric, one harness.
- Optimize the harness, not just the model
- Time-bounded evaluation forces real-world usefulness
- Reversibility is non-negotiable — cheap failure mode = aggressive exploration

## Xhaka Application
- Our harness = job-registry + evaluation-log + proposed-changes pipeline
- Missing: one clear metric per job, time-bounded runs, cheap rollback
- program.md equivalent = SOUL.md + ROUTING.md + agent definitions
