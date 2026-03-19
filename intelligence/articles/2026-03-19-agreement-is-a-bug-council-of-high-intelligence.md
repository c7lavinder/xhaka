# Agreement Is a Bug — I Forced 11 Claude Agents to Disagree

**Source:** LinkedIn / 0xNyk  
**URL:** https://github.com/0xNyk/council-of-high-intelligence  
**Published:** 2026-03-19  
**Fetched:** 2026-03-19T07:38:00.000Z  
**Relevance Score:** 9/10  
**Tags:** AI agents, multi-agent systems, decision-making, architecture, Claude Code, adversarial deliberation

## Summary
A developer built a system of 11 independent Claude Code subagents — each modeled on a historical thinker (Socrates, Feynman, Torvalds, etc.) — that are forced to disagree before reaching consensus. The system uses 6 polarity pairs, a 3-round deliberation protocol, and anti-recursion safeguards to surface blind spots that single-agent reasoning misses.

## Key Insights
- Single-model answers sound balanced but come from one reasoning tradition. True adversarial deliberation requires external disagreement layers.
- 11 pre-built triads for common domains (architecture, strategy, shipping, product, founder, etc.)
- Anti-recursion rules prevent Socratic infinite loops — 3-level depth limit, 2-message cutoff, hemlock rule.
- Minority report is often the most valuable output — surfaces the risk the majority missed.
- Installed at: `~/.claude/agents/` + `~/.claude/skills/council/SKILL.md`

## Why It Matters
Directly applicable to Gunner architecture decisions. Installed on Xhaka system 2026-03-19. Now part of Builder pre-check protocol in SOUL.md — complex SDDs run through council triad before spawning.

## Actions Taken
- Cloned and installed on Xhaka system
- Added council pre-check rule to SOUL.md
