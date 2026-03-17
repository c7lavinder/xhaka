---
title: Stop Writing Better Prompts. Start Building Better Context.
source: Telegram article (context engineering)
date: 2026-03-16
tags: [context-engineering, prompting, claude-code, system-prompts, knowledge-base, architecture]
---

# Context Engineering — The Complete Framework

## The Core Shift
**Prompt engineering** = how you ask the question  
**Context engineering** = everything the model sees when it generates a response (system prompts, loaded documents, tool access, conversation history, memory)

Prompt engineering is a subset of context engineering. A perfect prompt with bad context = polished generic answer.

## The 4D Framework (AI Fluency)
- **Delegation** — deciding whether, when, and how to engage AI (not everything should be delegated)
- **Description** — effectively describing goals (prompt engineering)
- **Discernment** — accurately assessing AI output, catching errors, verifying claims
- **Diligence** — taking responsibility for what you do with output

Most people only focus on Description. Skip Delegation (wrong tasks), ignore Discernment (blind trust), forget Diligence (no verification).

## The Four Context Layers

### 1. System Prompts — Behavior Architecture
Not preferences. Specific constraints that shape every output.

❌ Bad: `"be helpful and professional"`  
✅ Good:
```
first person, conversational. lead with data.
show wins AND failures.
never use: 'game-changing', 'revolutionary', 'leverage', 'synergy'.
structure long-form as: hook → breakdown → closer. no section headers.
```

**Different projects = different system prompts.** Research project ≠ content project ≠ coding project.

### 2. Knowledge Base — Persistent Reference Material
- Load working documents, past examples, style guides, reference docs
- Without it: every conversation starts from zero
- With it: quality compounds across dozens of conversations
- **Few-shot at scale** — past examples ARE the examples. Don't describe your style, show it.
- 15 targeted files beats 50 random files every time

### 3. Tools — What the Model Can Do
- MCP connects Claude to filesystem, GitHub, databases, browser
- Without MCP: manually paste files
- With MCP: Claude reads from your actual systems directly
- Tool access = context layer (expands what info can be pulled mid-conversation)

### 4. Conversation History & Memory
Three techniques for long-horizon tasks:
- **Compaction** — summarize history approaching context limits; preserve decisions, discard redundant output
- **Structured note-taking** — model writes persistent notes outside context window, retrieved later
- **Sub-agent architectures** — specialized agents handle focused tasks, return condensed summaries (1k-2k tokens)

**Practical:** Start new conversations within the same project. Project context stays intact, conversation context stays fresh.

## Context Rot — Critical Concept
More context ≠ better output. Transformer models create n² pairwise relationships between tokens. Longer contexts stretch attention thin.

**"Find the smallest set of high-signal tokens that maximize the likelihood of your desired outcome."**

Anthropic's actual framing.

## Common Mistakes
1. **Projects as folders** — projects should be specialized, not organized. One purpose, curated docs, specific instructions.
2. **Vague system prompts** — "be helpful" tells the model nothing. Define behavior precisely.
3. **Overloading context** — if the model can't prioritize, it averages everything. Curate ruthlessly.
4. **Ignoring tool access** — copy-pasting files manually when MCP exists = doing it the hard way.
5. **Skipping Discernment** — always fact-check outputs against primary sources before using.
6. **Stale documents** — if your product evolves and your KB still has old docs, you're reasoning against outdated information. Maintenance is part of the system.

## System Prompt Templates

### Code Review / Technical
```
You are a senior developer reviewing code for clarity, correctness, and maintainability.
Flag potential bugs, suggest improvements, explain reasoning.
Documentation structure: what it does → how it works → how to use it → known limitations.
```

### Research Synthesis
```
Summarize each source. Then cross-reference to identify:
consensus points, contradictions, gaps, novel insights.
Output as structured brief.
Flag claims that appear in only one source.
```

### Competitive Intelligence
```
Structure all analysis as comparative briefs.
Format: name → mechanism → strengths → weaknesses → strategic implications.
Always include data sources. Flag data older than 30 days.
```

## Key Principle
The gap between someone who writes good prompts and someone who builds good context = the gap between using AI casually and getting real work done.

20 minutes of setup → permanent compound returns.

---
*Source: Article via Telegram, 2026-03-16*
