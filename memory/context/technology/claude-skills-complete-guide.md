---
title: The Complete Guide to Building Skills for Claude
source: https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf
date: 2026-03-16
tags: [claude-code, skills, prompting, workflows, mcp, agent-systems]
---

# The Complete Guide to Building Skills for Claude

## What Is a Skill?
A skill is a folder of instructions that teaches Claude how to handle a specific workflow — consistently, every time. Instead of re-explaining context in every session, you teach Claude once.

**Structure:**
```
your-skill-name/
├── SKILL.md          # Required — main instructions
├── scripts/          # Optional — executable code
├── references/       # Optional — docs loaded on demand
└── assets/           # Optional — templates, fonts
```

## Three-Level Progressive Disclosure
- **Level 1 (YAML frontmatter):** Always loaded. Tells Claude WHEN to use this skill.
- **Level 2 (SKILL.md body):** Loaded when skill is relevant. Full instructions.
- **Level 3 (linked files):** Loaded only as needed. Minimizes token usage.

## YAML Frontmatter — Critical Fields

```yaml
---
name: your-skill-name          # kebab-case, no spaces/capitals
description: What it does AND when to use it (trigger phrases). Under 1024 chars.
---
```

**The description field IS the router.** Structure: `[What it does] + [When to use] + [Trigger phrases]`

Good:
```yaml
description: Manages Linear sprint workflows. Use when user mentions "sprint", "Linear tasks", "project planning", or asks to "create tickets".
```

Bad:
```yaml
description: Helps with projects.
```

## Skill Categories

### Category 1: Document & Asset Creation
- Templates, brand standards, style guides embedded
- No external tools needed
- Quality checklists built in

### Category 2: Workflow Automation
- Multi-step processes
- Validation gates between steps
- Iterative refinement loops

### Category 3: MCP Enhancement
- Coordinates multiple MCP calls in sequence
- Domain expertise embedded so users don't need to prompt each step
- Error handling for common MCP issues

## Writing Effective Instructions

**Be specific:**
```markdown
Run `python scripts/validate.py --input {filename}`
If validation fails:
- Missing required fields → add them to CSV
- Invalid dates → use YYYY-MM-DD format
```

**Include error handling:**
```markdown
### MCP Connection Failed
1. Verify MCP server is running
2. Confirm API key is valid
3. Settings > Extensions > Reconnect
```

**Reference bundled files:**
```
Before writing queries, consult `references/api-patterns.md` for rate limiting and pagination.
```

## Naming Rules
- Folder: `kebab-case` only. No spaces, no underscores, no capitals.
- File: exactly `SKILL.md` (case-sensitive). No README.md inside skill folder.
- Forbidden: "claude" or "anthropic" in name (reserved)
- No XML angle brackets in frontmatter (security)

## Testing Framework

### Triggering Tests
- Does it trigger on obvious requests? ✅
- Does it trigger on paraphrased requests? ✅
- Does it NOT trigger on unrelated topics? ✅

### Functional Tests
- Valid outputs generated
- API calls succeed
- Edge cases covered

### Performance Comparison
Measure: tool calls, tokens consumed, failed API calls, user corrections needed — with vs. without skill.

## Iteration Signals
- **Undertriggering** → add more keywords/trigger phrases to description
- **Overtriggering** → add negative examples, be more specific
- **Inconsistent results** → improve instructions, add error handling

## Key Principles
- Skills work identically across Claude.ai, Claude Code, and API
- Multiple skills can load simultaneously — design for composability
- Start with one challenging task, iterate until it works, then extract into a skill
- Skills are living documents — update as you find edge cases

## Distribution (as of Jan 2026)
- Individual: download → zip → upload via Settings > Capabilities > Skills
- Claude Code: place in skills directory
- Organization: admins deploy workspace-wide (shipped Dec 18, 2025)

## MCP + Skills = Full Power
- **MCP** = the professional kitchen (tools, data access, connections)
- **Skills** = the recipes (how to use the kitchen effectively)

Without skills: users don't know what to do with MCP access.
With skills: pre-built workflows activate automatically, best practices embedded.

---
*Source: Official Anthropic PDF guide | Processed: 2026-03-16*
