---
title: 800 Hours of Claude Code — Solo Developer Insights
source: YouTube tutorial transcript (2026)
date: 2026-03-16
tags: [claude-code, sub-agents, mcp, workflows, production]
---

# 800 Hours of Claude Code — Key Insights

## The Most Important Insight (Most People Get Wrong)

**Do NOT assign sub-agents to roles. Assign them to TASKS.**

> "I spent a good couple of hours trying to work with agents as a frontend developer, UX designer, product manager — the results were pretty bad compared to just using Claude Code with no agent-specific instructions."

**What works:** Sub-agents defined by task, not identity:
- ✅ "Review UI/UX and give feedback via Playwright"
- ✅ "Clean up and optimize the code just written"
- ✅ "Generate documentation for these files"
- ✅ "Gather research data from the web"
- ❌ "You are a senior frontend developer"
- ❌ "You are a product manager"

Sub-agents aren't at the point where they can brainstorm and work autonomously like humans. They're excellent at executing specific, bounded tasks.

---

## The # Key — Quick Memory Addition
Press `#` to instantly add instruction snippets to Claude's memory. Choose:
- **Local** (project-specific) → saves to project CLAUDE.md
- **Global** (all sessions) → saves to global CLAUDE.md

Faster than editing CLAUDE.md manually mid-session.

---

## Custom Command Library — The `/commands` Directory

```
.claude/
└── commands/
    ├── new-endpoint.md       # "Create API endpoint with my middleware pattern"
    ├── fix-typescript.md     # "Run TS linter and fix all errors"
    └── auth/
        ├── add-auth.md
        └── check-permissions.md
```

Commands accept arguments for flexibility. Build this library incrementally — whenever you type the same prompt twice, make it a command.

---

## Context7 MCP — Critical for Up-to-Date Docs

The most-used MCP server for development: **Context7**
- Provides latest documentation for popular coding libraries
- Claude's training data goes stale; libraries change constantly
- Usage: just add "use Context7" to your prompt — Claude auto-fetches

Other essential MCPs:
- **Supabase MCP** — query data, apply migrations, create tables directly
- **Chrome DevTools + Playwright MCP** — Claude controls browser, inspects DOM/console, autonomous frontend debugging
- **Stripe MCP** — payment-related features
- **Vercel MCP** — deployment settings and docs

---

## Sub-agents for Parallel Work

Key benefit: each sub-agent gets its own context window, system prompt, and tool permissions. **Offloads tasks without polluting main context.**

**Best real-world sub-agent example from the author:**
- UI/UX reviewer sub-agent connected to Playwright MCP
- Inspects live UI components in the browser
- Returns feedback on design and usability
- Saves main context tokens AND gets better specialized output

**To create:** `/agents` → Create new agent → Project or Personal → Generate with Claude → Describe the task → Set tool permissions → Save

**To invoke:** Natural language OR `@agent-name` in prompt

---

## Plugins — Clone Entire Setups Instantly

Anthropic released "plugins" to bundle complete setups (commands, agents, MCP configs) into one package. Install someone's full workflow with a single command.

---

## Mindset Rules That Matter

**1. "Garbage in = garbage out"**
If you can't write a clear prompt, you don't know what you want. Learning prompt engineering forces you to break problems into smaller pieces — clarifies your own thinking.

**2. Use Plan Mode for vague ideas**
When the idea is still fuzzy: use Plan Mode to have Claude ask clarifying questions BEFORE writing any code. "Have it ask me clarifying questions so we can be on the same page."

**3. "AI generates code, humans own it"**
Before pushing to production: start a fresh session and ask Claude to review the files it recently touched. Never let AI make you lazy about security, performance, error handling.

**4. Speed means nothing if the app is buggy**
Constant code review is not optional. Ignored fundamentals compound into vulnerabilities.

---

## GitHub Repo Reference
Author mentions a community GitHub repo with useful daily commands. Worth finding and pulling into our command library.

---
*Source: 800 Hours of Claude Code YouTube tutorial, 2026 | Processed: 2026-03-16*
