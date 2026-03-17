---
title: Claude Code — Complete Usage Guide
source: Official Anthropic docs + community research
date: 2026-03-16
tags: [claude-code, tools, development, setup]
---

# Claude Code — Complete Usage Guide

## Quick Reference

```bash
# Install
npm install -g @anthropic-ai/claude-code

# Launch
claude                        # Interactive session
claude "explain this project" # Start with prompt
claude -p "query"             # Non-interactive (print mode), exits after
claude -c                     # Continue most recent session
claude --resume               # Choose from recent sessions
claude --permission-mode plan # Launch in Plan Mode (read-only, no edits)
```

**Key slash commands:**
- `/init` — Generate CLAUDE.md from codebase
- `/clear` — Reset context (use between unrelated tasks)
- `/compact` — Summarize context to save tokens
- `/cost` — Show token usage for current session
- `/memory` — Browse/edit CLAUDE.md and auto memory files
- `/agents` — Manage subagents
- `/config` — Open settings UI
- `/mcp` — Manage MCP servers
- `/rewind` — Checkpoint rewind menu
- `Shift+Tab` — Cycle: Normal → Auto-Accept → Plan Mode
- `Esc` — Interrupt Claude mid-action (context preserved)
- `Esc+Esc` — Open rewind menu

---

## Setup & Configuration

### Auth Methods
1. **Claude.ai subscription (Pro/Max)** — OAuth login, costs covered by subscription
2. **API Key** — Set `ANTHROPIC_API_KEY` env var. Pay-per-token
3. **Custom auth helper** — `apiKeyHelper` script for enterprise/SSO

**Billing reality:** ~$6/dev/day average with Sonnet, 90% under $12/day.

### settings.json — Key Fields

```json
{
  "permissions": {
    "allow": ["Bash(npm run lint)", "Bash(git commit *)", "Bash(git diff *)"],
    "deny": ["Bash(curl *)", "Read(./.env)", "Read(./secrets/**)"],
    "defaultMode": "plan"
  },
  "env": { "NODE_ENV": "development" },
  "autoMemoryEnabled": true,
  "includeCoAuthoredBy": true,
  "cleanupPeriodDays": 30
}
```

**Scope priority (highest → lowest):** Managed policy → CLI flags → Local → Project → User

**Security hardening:**
```json
{
  "permissions": {
    "deny": ["Bash(curl *)", "Bash(wget *)", "Bash(ssh *)", "Read(./.env*)", "Read(./secrets/**)"]
  }
}
```

---

## CLAUDE.md — How It Works

Loaded into context at session start. Treated as user message (not system prompt) — specificity matters. Vague rules get ignored.

| Location | Scope |
|----------|-------|
| `~/.claude/CLAUDE.md` | All projects (personal) |
| `./CLAUDE.md` | This project (shared/committed) |
| `./subdirectory/CLAUDE.md` | Loaded when Claude reads files in that dir |

**Best practices:**
- Keep under 200 lines. Longer = lower adherence
- Use "IMPORTANT:" or "YOU MUST:" for high-priority rules
- Be concrete: "Use 2-space indentation" not "format code nicely"
- Run `/init` to auto-generate, then refine
- Commit `./CLAUDE.md` to git so team benefits

**What to include:**
- Build/test commands
- Code style that differs from language defaults
- Branch naming, PR conventions
- Architecture decisions
- Common gotchas, env var requirements

**What NOT to include:**
- Things Claude infers from reading code
- Standard conventions
- Long tutorials (link instead)
- "Write clean code" platitudes

**Effective example:**
```markdown
# Build & Test
- Build: `npm run build`
- Test single: `npx jest src/foo.test.ts`
- TypeScript check: `npx tsc --noEmit`

# Code Style
- ES modules only, no CommonJS
- No `any` types — use `unknown` and narrow
- Zod for all external data validation

# Architecture
- API handlers in `src/api/handlers/`
- Shared types in `src/types/`
- Never use `../../../` — use `@/` aliases

# Gotchas
- `DB_URL` must be in `.env.local` for local dev
- The `legacy/` directory is frozen — do not modify
```

---

## Prompting Strategies

### For Bug Fixes
```
I have a bug where [specific symptom].
It happens when [reproduction steps].
Relevant files: [list files].
Here's the error: [paste error/stack trace].
Fix ONLY this issue. Do not refactor anything else.
```

### For New Features
```
Add [feature] to [specific file/module].
Requirements:
- [requirement 1]
- [requirement 2]
Follow the existing pattern in [similar file] for reference.
Do not touch [file/system] — that's out of scope.
```

### Constraints that work
- "Only change files in `src/api/`"
- "Do not modify the database schema"
- "Match the existing error handling pattern in `src/lib/errors.ts`"
- "Run `npm run typecheck` before considering the task done"
- "Do not commit — I'll review first"

### For TypeScript specifically
- "Use strict TypeScript — no `any` types"
- "Add explicit return type annotations to all exported functions"
- "Narrow types using type guards, not `as` casts"

### Context efficiency
- Give Claude the 2-3 most relevant files, not the whole codebase
- Use `/clear` between unrelated tasks — don't let stale context pollute
- Use `/compact` when context gets long mid-session
- Name sessions with `/rename` so you can resume later

---

## Git & Code Management

### How commits work
- By default Claude commits automatically when it completes work
- To prevent auto-commit: include "do not commit" in your prompt
- To control commit messages: "commit with message: [your message]"
- `includeCoAuthoredBy: true` in settings adds "Co-authored-by: Claude" to commits

### Branch management
- Claude works in your current branch — check out the right branch first
- For risky work: "create a new branch `fix/[name]` and work there"
- Claude can create PRs if you have `gh` CLI configured

### Preventing broken commits
- Add to CLAUDE.md: "Always run `npm run typecheck && npm run lint` before committing"
- Use `permissions.allow` to pre-approve: `"Bash(npm run typecheck)"`, `"Bash(npm run lint)"`
- Start in Plan Mode (`claude --permission-mode plan`) for risky work — review plan before execution

### Safe workflow for production code
1. Start in Plan Mode: `Shift+Tab` or `claude --permission-mode plan`
2. Review the plan, ask questions, refine
3. Switch to Auto-Edit when satisfied
4. Check the diff before finalizing

---

## Debugging Workflows

### Giving Claude a bug
```
Bug: [specific behavior]
Expected: [what should happen]
Actual: [what does happen]
Reproduction: [steps]
Error output:
[paste exact error/stack trace]

Look at [file] first. The issue is likely in [function/area].
Fix only this. Do not change unrelated code.
```

### Sharing errors effectively
- Paste the full stack trace, not just the last line
- Include the command that triggered it
- Include relevant env context (Node version, etc.) if it matters
- Don't summarize errors — copy/paste exactly

### Iterative debugging
- "That didn't work. New error: [error]. Check [file] for [specific thing]."
- Use `Esc` to interrupt if Claude is going in the wrong direction
- Use `/rewind` to roll back to a checkpoint if changes made things worse

### "It fixed one thing but broke another"
- "Revert your last change to [file] and try a different approach"
- Or use git: `git stash` before giving Claude the next prompt
- Be explicit: "The first bug is fixed. Now there's a new issue in [file/function]."

### Understanding unfamiliar code
- "Explain what `[function]` does and how it's called"
- "Trace the flow when [event] happens — start from [entry point]"
- "What would break if I removed [piece]?"

---

## Advanced Features

### Plan Mode
Read-only. Claude can read files and propose a plan but cannot make edits.
- Use for: complex features, risky refactors, understanding before acting
- Toggle: `Shift+Tab` in session, or `claude --permission-mode plan`
- Claude drafts plan → you approve → switch to execution mode

### Extended Thinking
Available in interactive mode for complex reasoning tasks.
- Trigger: "think step by step about..." or "use extended thinking"
- Best for: architecture decisions, debugging complex race conditions, system design
- Higher cost — don't use for routine edits

### Subagents
Claude spins up sub-processes to parallelize work. Each has its own context, tools, and model.
- Best for: "research X while implementing Y", parallelizable tasks
- Define in `.claude/agents/` — Claude auto-delegates based on description
- `maxTurns` to prevent runaway agents
- Subagents don't share context with parent — keep them self-contained

### Print Mode (`-p` flag)
Non-interactive, outputs to stdout, exits when done. Good for scripting.
```bash
claude -p "what does this function do?" < src/utils/parser.ts
claude -p "summarize the changes in this diff" < changes.diff
```

### Cost control
- `/cost` in session to see current usage
- Use Haiku for simple tasks (code search, explanation) — 20x cheaper than Sonnet
- Use `/compact` aggressively when context bloats
- `/clear` between tasks to reset context
- Assign Haiku to `model` in subagent frontmatter for lightweight sub-tasks

---

## Gotchas & Limitations

### What Claude Code is bad at
- **Very large codebases** — context window limits mean it can't hold the whole codebase at once. Provide focused context.
- **Long multi-step migrations** — it loses track across many files. Break into smaller tasks.
- **Remembering decisions across sessions** — use CLAUDE.md and auto memory actively, or it starts fresh
- **Testing its own output** — it can write tests but can't always tell if they actually pass. Always verify.
- **Non-deterministic bugs** — race conditions, timing issues. It can help reason about them but can't reproduce reliably.

### Common failure modes
1. **Scope creep** — Claude refactors more than asked. Fix: "Only change X. Do not touch Y."
2. **Stale context** — Previous task context bleeds into next. Fix: `/clear` between tasks.
3. **Over-confidence on types** — Claude assumes things about external API types. Fix: "Check the actual type definition before assuming."
4. **Circular fixes** — Claude fixes a bug, introduces another, fixes that, loops. Fix: `Esc`, `/rewind`, restart with more context.
5. **Phantom files** — Claude references files that don't exist. Fix: "List files in [directory] first."

### Security
- Never allow `Read(./.env*)` or `Read(./secrets/**)` in permissions
- Never let Claude see SSH keys or cloud credentials
- Subagents inherit parent permissions by default — be explicit about `disallowedTools`
- Treat CLAUDE.md as public (it can be committed to git) — no secrets in it

### Context window management
- A full project context + long conversation = context pressure
- Signs of context pressure: Claude starts forgetting earlier instructions, makes inconsistent choices
- Fix: `/compact` to summarize, or `/clear` and restart with a focused prompt
- For massive codebases: give Claude a map (directory structure + key file descriptions) rather than all files

---

## Cost Control Summary

| Tactic | Savings |
|--------|---------|
| Subscription auth (Pro/Max) vs API key | Flat fee vs per-token |
| Use Haiku model for subagents | ~20x cheaper than Sonnet |
| `/compact` mid-session | Reduces context tokens |
| `/clear` between tasks | Prevents context bloat |
| Print mode (`-p`) for scripts | No interactive overhead |
| Focused prompts (2-3 files max) | Smaller context = lower cost |
| Plan Mode before execution | Fewer wasted iterations |

---
*Last updated: 2026-03-16 | Source: Anthropic docs + community research*
