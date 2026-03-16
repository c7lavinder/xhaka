---
title: Claude Code 2.0 — System Prompt Analysis
category: technology
tags: [claude-code, prompting, wednesday-setup, builder]
last_updated: 2026-03-16
source: x1xhlol/system-prompts-and-models-of-ai-tools
importance: 5
---

# Claude Code 2.0 — System Prompt Analysis

> Analyzed from leaked system prompt (Claude Code v2.0.0, release date 2025-09-29, powered by claude-sonnet-4-5-20250929). Treat as reference for how Claude Code reasons — not as guaranteed spec.

---

## How Claude Code Thinks

**Core directive:** *"Do what has been asked; nothing more, nothing less."*

This is the single most important sentence in the system prompt. Claude Code is scoped to the literal request — no scope creep, no unsolicited extras.

**Decision framework:**
1. Understand the task
2. Use TodoWrite to plan it (if 3+ steps or non-trivial)
3. Execute sequentially, marking todos in_progress → completed as you go
4. Confirm done briefly — no summaries or explanations unless asked

**Proactiveness:** Balanced. It will take follow-up actions when clearly implied, but will NOT take actions the user didn't ask for. If asked "how do I do X," it answers first before taking any action.

**Professional objectivity over validation:** It's explicitly instructed to prioritize truth over agreement. It will disagree, correct, and push back if technically warranted — even if that's not what you want to hear.

**Ambiguity handling:** Investigate first, then answer. Don't confirm assumptions — verify them. When given unclear instructions, it reads files, runs searches, checks the environment, then responds with findings.

---

## Tool Use Patterns

Claude Code has a rich, structured tool ecosystem with clear hierarchy:

| Tool | Purpose | Key Rule |
|------|---------|---------|
| **TodoWrite** | Task planning + progress tracking | Use VERY frequently; mark completed immediately |
| **Bash** | Terminal ops (git, npm, docker, etc.) | NOT for file ops — use dedicated tools |
| **Read** | Read files | Always read before editing |
| **Edit** | Precise string replacement | Prefer editing over writing new files |
| **Write** | Create new files | Only when truly necessary |
| **Glob** | File pattern matching | Prefer over `find` |
| **Grep** | Content search (ripgrep) | Never use `grep` as bash command |
| **Task** | Spawn sub-agents for complex searches | Use to reduce context usage |
| **WebFetch** | Fetch URLs | Only for legit programming help |

**Parallel tool calls:** Claude Code explicitly batches independent tool calls into a single message. This is enforced in the prompt: "you MUST send a single message with multiple tool calls." This is a performance pattern we should replicate.

**Task agent for file searches:** When a search might require multiple rounds of globbing/grepping, Claude Code spawns a sub-agent via the Task tool rather than burning its own context. This is the "Task tool for context efficiency" pattern.

---

## Constraints

**Hard limits:**
- Defensive security only — refuses anything that could be used maliciously
- Never generates/guesses URLs unless confident they help with programming
- Never commits without explicit user request
- Never pushes to remote unless explicitly asked
- Never amends commits on other developers' work
- Never uses `git push --force` to main/master (warns user)
- Never skips pre-commit hooks (`--no-verify`) unless asked

**File hygiene:**
- ALWAYS prefer editing existing files over creating new ones
- NEVER proactively create `.md` or README files unless explicitly asked
- NEVER create files unless absolutely necessary

**Communication:**
- No emojis unless requested
- No preamble/postamble ("Based on the above...", "Here's what I'll do...")
- Minimal output tokens — brief and complete
- Output is CLI-rendered; uses GitHub-flavored markdown, monospace assumption

**Tone constraints:**
- No praise or emotional validation
- No "Great question!" or filler
- Concise by default (< 4 lines), more detail for complex tasks only

---

## What Makes a Good Claude Code Prompt

Based on what the system prompt rewards and penalizes:

**DO:**
- Be specific and scoped — Claude Code won't infer beyond what you say
- Use positive examples AND negative examples (the prompt shows this explicitly for verbosity)
- Give it an ordered task list — it maps well to TodoWrite
- Specify acceptance criteria — it prioritizes correctness and will investigate before assuming
- Request parallel execution when you want speed ("run X and Y in parallel")
- Give context about the environment (working dir, is it a git repo, platform)

**DON'T:**
- Ask vague questions expecting it to figure out your intent
- Ask for explanations after every step (it defaults to brief)
- Expect it to create documentation files unless asked
- Assume it will push/deploy — always explicitly request that

**Magic words:**
- "In parallel" → triggers simultaneous tool calls
- "Use TodoWrite to plan" → forces explicit task tracking
- "Confirm when done" → matches its default behavior (brief completion confirmation)

---

## Implications for Our Builder Prompts

Our current SPEC→PLAN→TASKS format is already well-aligned. Here are specific upgrades:

### 1. Add Explicit Parallel Execution Hints
Claude Code batches independent tool calls. Our TASKS section should flag parallelizable steps:
```
TASKS:
1. [PARALLEL] Read src/routes/calls.js AND src/models/call.js
2. [SEQUENTIAL] Implement the new endpoint using findings from step 1
```

### 2. Scope Creep Prevention Language
Add to every Builder prompt:
```
Do what is asked. Nothing more. Do NOT create new documentation, README files, 
or refactor code outside the scope of these tasks.
```

### 3. TodoWrite Mandate
Add to PLAN section:
```
Use TodoWrite to track all tasks. Mark each in_progress before starting, 
completed immediately after finishing. Do not batch completions.
```

### 4. File Operation Constraints
Add to PLAN section:
```
ALWAYS prefer editing existing files over creating new ones. 
Read a file before editing it. Use specialized file tools (Read/Edit/Write/Grep/Glob) 
instead of bash commands for file operations.
```

### 5. Commit Message Format
Claude Code's commit style: brief, focuses on "why" not "what," includes:
```
🤖 Generated with [Claude Code](https://claude.com/claude-code)
Co-Authored-By: Claude <noreply@anthropic.com>
```
We can adopt this convention for Builder commits.

### 6. No Unsolicited Pushes
Add explicit end-of-task instruction:
```
When tasks are complete: confirm completion briefly. Do NOT push to remote unless 
explicitly instructed in these tasks.
```

### 7. Acceptance Criteria in SPEC
The system prompt's "professional objectivity" means Claude Code will investigate 
ambiguity rather than assume. Our SPEC section should include binary acceptance criteria:
```
ACCEPTANCE CRITERIA:
- [ ] POST /api/calls returns 200 with call object
- [ ] Existing tests still pass (npm test exits 0)
- [ ] No new files created outside src/routes/
```

---

## Claude Sonnet 4.6 Differences (claude.ai web interface)

Sonnet 4.6 (the web chat model) has a very different profile:

**Key differences from Claude Code:**
- **No todo tracking** — no TodoWrite equivalent; handles tasks conversationally
- **Minimal formatting by default** — no bullets unless asked or essential; prefers prose
- **No tool hierarchy** — web search and artifact storage are its primary tools
- **Artifact-native** — has a full storage API (`window.storage`) for persistent cross-session artifacts
- **Can call Anthropic API** from within artifacts ("Claude in Claude") — useful for building AI-powered tools
- **Evenhanded on politics/ethics** — explicitly instructed to present multiple perspectives
- **Memory system** — has a derived memory system (off by default in the leaked prompt)
- **Knowledge cutoff:** Early August 2025 (uses web search for anything newer)

**Multi-step reasoning:** Sonnet 4.6 handles multi-step tasks by maintaining full conversation history — it's stateless between completions but the caller must pass full history. For complex stateful apps built in artifacts, it passes complete state objects as JSON in each API call.

**Tool use in artifacts:** Web search is additive (passed in `tools` array). MCP servers and web search can be combined. Handles mixed content blocks (text + tool_use + tool_result) by concatenating text blocks.

---

## Wednesday Setup Checklist

Based on the system prompt analysis, here's what to configure/verify when setting up Claude Code:

- [ ] **CLAUDE.md file** — Create a repo-level `CLAUDE.md` with project context (tech stack, patterns, constraints). Claude Code reads this automatically.
- [ ] **Hooks** — Configure pre-commit hooks in Claude Code settings; it will respect them and amend commits if hook modifies files
- [ ] **Slash commands** — Custom `/review-pr`, `/test`, etc. can be defined and Claude Code will execute them via SlashCommand tool
- [ ] **Task agents** — Define specialized sub-agents (like `code-reviewer`, `test-runner`) in settings; Claude Code will proactively spawn them
- [ ] **TodoWrite always on** — Claude Code uses it natively; no config needed, just make sure Builder prompts request it
- [ ] **Git safety** — Claude Code will NOT push unless asked; make sure Builder tasks explicitly say "push to branch X" when needed
- [ ] **Working directory** — Pass `--cwd` or ensure Claude Code is launched from the repo root; it uses this for all relative paths
- [ ] **Model** — Claude Code 2.0 runs on `claude-sonnet-4-5-20250929` (or newer); verify the model being used matches expectations
- [ ] **Parallel agents** — For speed, use `--dangerously-skip-permissions` flag carefully, or pre-approve tool categories in settings

---

## Key Takeaway for Builder Prompts

**The single biggest unlock:** Claude Code's "do what's asked, nothing more" directive means **our TASKS section is the contract**. Every task should be atomic, ordered, and unambiguous. Vague tasks = wasted API credits and scope drift.

The SPEC establishes intent. The PLAN establishes constraints. The TASKS are the law.
