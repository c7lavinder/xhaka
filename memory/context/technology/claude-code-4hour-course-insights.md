---
title: Claude Code Full Course — Key Insights (4-Hour Course, 2026)
source: Video transcript, 57k words — "Claude Code Full Course: Build & Sell 2026"
date: 2026-03-16
tags: [claude-code, workflows, production, monetization, skills, agents, context-management]
---

# Claude Code Full Course — Production Insights

> Instructor runs a $4M+/year business (Left Click agency) and uses Claude Code daily.

---

## TL;DR — 5 Things Most People Miss

1. **Skills > MCP for recurring workflows.** A custom skill with scripts is 100x more token-efficient than the equivalent MCP server. Use MCP to prototype, then convert to a skill.
2. **Plan mode before any non-trivial build.** 5 min of planning saves 35+ min of build-fix-rebuild cycles.
3. **The real value of AI is speed, not perfection.** It gets to 80% in 2 minutes; your job is to steer it to 100% via test-verify loops.
4. **CLAUDE.md is a token budget and a quality lever.** Too long = dumber AI + higher cost. Keep under 500 lines, prune regularly.
5. **Parallel sub-agents = force multiplier.** Running 10 sub-agents simultaneously multiplies throughput. Bottleneck is your ability to orchestrate, not AI speed.

---

## Setup & CLAUDE.md

### The .claude Directory Structure

```
.claude/
  settings.json         # Team permissions + hooks
  settings.local.json   # Local overrides (git-ignored)
  CLAUDE.md             # Project instructions
  CLAUDE.local.md       # Local-only overrides (git-ignored)
  agents/               # Sub-agent definitions (.md files)
  skills/               # Skill definitions (reusable workflows)
  rules/                # Modular rule files (split from CLAUDE.md)
```

Global level: `~/.claude/CLAUDE.md` — applies to ALL workspaces.

**Three-tier merge order:** Enterprise → Global → Per-project

### Starting a New Project: Use `/init` First

Run `/init` inside any folder. Claude reads every file, summarizes codebase, writes CLAUDE.md automatically.
- Saves Claude from reading every file on every prompt (huge token savings)
- Creates high-density summary that improves output quality
- Do this BEFORE adding any custom instructions

### CLAUDE.md Best Practices

**DO:**
- Run `/init` first in any new folder
- Use bullet points and short headings — high information density
- Put critical rules at the **very top** (primacy bias — models remember beginning more than middle)
- Keep **200-500 lines max**
- Treat as living code — prune regularly as Claude adds cruft
- Add rules when Claude makes same mistake 2-3x: "Add this to CLAUDE.md"
- Use `@include filename.md` to pull in external files

**DON'T:**
- Dump entire API docs or style guides into it (massive token waste)
- Write vague rules like "be smart" or "make no mistakes"
- Let it grow past 500 lines without pruning

**Primacy/Recency Bias:** Models remember beginning and end of prompt more than middle. Hard guardrails go first. Important instructions never in the middle of a long CLAUDE.md.

### Splitting CLAUDE.md into Rules Files

Instead of one monolithic file, use `.claude/rules/`:
- `workflow.md` — how tasks should be approached
- `design.md` — visual/UI standards
- `tech-defaults.md` — stack choices, libraries
- `security.md` — what never to do

### Token Awareness — What's Actually in Context

Run `/context` to see breakdown:

| Category | Approx Tokens | Notes |
|---|---|---|
| System tools (built-in) | ~17,000 | Bash, web fetch, task, read, write, etc. |
| CLAUDE.md (global + local) | varies | Keep this lean |
| MCP tools | varies | **Can explode** — poorly written MCPs add 10k+ |
| Skills (front matter only) | ~60 per skill | Only loaded on demand — massive efficiency win |

Before you type one word, you may already be at 40,000+ tokens (20% of 200k context) just from system setup.

---

## Sub-agents in Production

### Three High-Value Sub-agents to Build First

**1. Research Agent** (use Sonnet, not Opus)
- Task: web research, API doc reading, data gathering
- Returns: dense summary only
- Sonnet = larger context window + much cheaper for I/O-heavy tasks

**2. Reviewer Agent** (zero-context is the feature)
- Task: review completed code with fresh eyes
- No context of how code was written = catches bias-driven decisions
- Catches what the parent agent never would

**3. QA/Testing Agent**
- Task: write tests, run them, report failures, fix failures
- Returns: test results + fixes only
- Keeps parent context clean

### Parallelization Math

- Serial: 3 tasks × 1 min each = 3 min total
- Parallel: 3 tasks × 1 min each = 1 min total (3x speedup)
- 10 sub-agents in parallel: email classification went 36s/100 emails → 60s/1,000 emails

### Critical: Keep Sub-agent Tasks Atomic

Compounding probability problem:
- 1 agent at 95% success = 95%
- 3 agents = 85.7%
- 10 agents = 59%
- 50 agents = 7.7%

**Each extra step per agent compounds failure probability. Keep tasks simple and single-purpose.**

Always have sub-agents return **compressed summaries**, not raw data. Parent context is precious.

---

## Plan Mode — Real Usage

### ROI Calculation

| Without Plan | With Plan |
|---|---|
| Build (15m) → Test (5m) → Wrong approach → Rebuild (15m) | Plan (5m) → Catch problem → Better plan (5m) → Build (5-15m) |
| 35+ min, more tokens, worse quality | 15-25 min, fewer tokens, better quality |

### What Plan Mode Does

Read-only exploration. Claude can read files, search web, reason about architecture, ask clarifying questions. **Cannot modify any files.**

### How to Run Plan Mode

1. Switch to Plan Mode
2. Dump raw requirements (voice transcript works)
3. Claude asks clarifying questions via GUI form
4. Answer questions
5. It generates `plan.md`: user flows, tech stack, DB schema, file structure, API routes
6. Read the plan — verify the user flow makes sense
7. Switch to Bypass Permissions mode
8. Build

### Pro Tip: Design DNA

Before planning a design-heavy project: paste a screenshot of a site you love, or paste HTML from a site. Claude uses this as design DNA throughout the entire build. Far more effective than describing aesthetics in words.

---

## Context Management & Avoiding Context Rot

### The Core Problem

At session start, you're already at 13-20% context used before typing a word. Auto-compaction triggers at ~67% used.

### High-ROI Context Techniques

1. **`/clear`** — Wipe conversation history when switching to unrelated task
2. **`/compact` with custom instructions** — "Compact this, prioritizing: final working endpoints, error patterns solved, key architectural decisions. Ignore: all debugging back-and-forth."
3. **Voice transcripts → compress first** — Never paste raw transcripts. Compress with cheaper model first.
4. **Use Sonnet for sub-agents** — Much larger context window, much cheaper. Reserve Opus for synthesis and complex reasoning.
5. **Move long instructions from CLAUDE.md to skills** — Skills load on demand. CLAUDE.md always loads.
6. **Specific prompts** — "Fix login redirect bug in `auth/callback.ts`" uses far fewer tokens than "improve the codebase."

---

## Hooks — Practical Use Cases

Hooks are custom scripts that fire automatically before or after every Claude Code tool call.

### High-Value Hook Examples

**Pre-tool hooks:**
- Block writes to specific files (`package.json`, `.env`)
- Log every file Claude is about to edit (audit trail)
- Run linter before any edit

**Post-tool hooks:**
- Auto-run tests after any file change
- Auto-commit with standardized message after successful task
- Notify Slack/Telegram when Claude finishes a task
- Send Claude's output to a logging service

### Hook Format
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write",
        "hooks": [{"type": "command", "command": "echo 'Writing: $CLAUDE_TOOL_INPUT'"}]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [{"type": "command", "command": "npm test 2>&1 | tail -20"}]
      }
    ]
  }
}
```

### Key Insight: Hooks Enable Autonomous Loops

Post-tool hook runs tests → output goes back to Claude → Claude sees test failure → fixes it → hook runs tests again → loop until green. **This is how you get truly autonomous builds.**

---

## Building & Selling with Claude Code

### The Business Model That Works

The instructor runs **Left Click** — a digital agency model:
- Builds web apps, MVPs, internal tools for businesses
- Claude Code does 80-90% of the build
- Developer's job: orchestrate, verify, deliver
- Pricing: charge full market rate, pocket the efficiency gain as margin

### What Actually Sells

1. **Internal tools for existing businesses** — Business already has processes; they need software to systematize them. Claude Code is perfect here.
2. **MVPs for non-technical founders** — They have an idea, no developer. You're the bridge.
3. **Maintenance retainers** — Ship it fast, then charge monthly for updates.

### The Delivery Workflow

1. Discovery call: understand the problem, not the tech
2. Plan Mode: generate the architecture with them watching
3. Build with Claude Code (they're amazed)
4. Verify everything works
5. Deploy
6. Retainer

### Pricing Psychology

Don't show clients Claude Code. They don't need to know. You're selling outcomes, not process. What took 2 weeks now takes 2 days — charge 1 week's rate. You still deliver faster than alternatives; they get a better deal; you make more per hour.

### The Test-Verify Loop (Critical)

The #1 mistake: accepting Claude's output as correct. The loop:
1. Claude builds feature
2. You test it yourself
3. Report exactly what's wrong ("when I click X, Y happens instead of Z")
4. Claude fixes
5. Repeat until it works

Never skip the verify step. Never trust Claude's own claim that "it's working."

---

## Mistakes to Avoid

1. **Mega-prompts** — One massive prompt trying to build an entire app. Build incrementally.
2. **Skipping Plan Mode** — Jumping into building without planning leads to wrong architecture that's expensive to undo.
3. **Ignoring context usage** — Letting context fill up without managing it leads to coherence degradation.
4. **MCP for everything** — MCPs are powerful but token-heavy. Skills are lighter for things you do repeatedly.
5. **Trusting output without testing** — Claude will claim success even when things don't work. Always verify.
6. **Fighting the model** — If Claude keeps making the same mistake, fix CLAUDE.md, not the prompt.
7. **Not pruning CLAUDE.md** — It gets bloated over time. Review and prune monthly.
8. **One agent for everything** — Parallelization is the multiplier. One agent doing 10 things serially is slow and context-heavy.

---

## Surprising / Non-Obvious Insights

- **Voice transcripts work** — Paste raw voice transcript into plan mode. Claude extracts requirements, asks follow-ups, fills in gaps. Faster than writing a spec.
- **Claude adds to its own CLAUDE.md** — Tell it "add a rule that you never do X" and it writes it permanently. It self-documents its constraints.
- **Skills can run scripts** — Not just instructions. You can include bash scripts in a skill that Claude executes as part of the workflow.
- **Bypass permissions mode is intentional** — "Dangerously skip permissions" exists because sometimes you want fully autonomous execution without confirmation dialogs. Use with caution in production.
- **The sub-agent email demo** — 10 parallel agents classified 1,000 emails while one serial agent was still on email #36. Parallelization is genuinely transformative at scale.
- **Cheap model for compression** — Use Haiku or Sonnet to compress large inputs before feeding to Opus. Saves significant cost on complex tasks.
- **`/init` generates better code** — A session that started with `/init` produces code more consistent with the existing codebase than one that didn't. The upfront token cost pays off.
- **Plan mode asks questions via GUI** — There's a form-based UI for Claude to ask you structured clarifying questions. Not just a chat prompt.

---
*Source: 4-hour YouTube course "Claude Code Full Course: Build & Sell 2026" | Processed: 2026-03-16*
