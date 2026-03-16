# AI Tool System Prompts — Pattern Comparison
*Extracted from leaked system prompts. Source: x1xhlol/system-prompts-and-models-of-ai-tools*
*Date: 2026-03-16 | Tools analyzed: Manus, Cursor (Agent CLI + Agent 2.0), Windsurf (Wave 11), Devin AI*

---

## Cross-Tool Pattern Comparison

| Pattern | Manus | Cursor | Windsurf | Devin | What We Should Adopt |
|---|---|---|---|---|---|
| **Task decomposition** | Dedicated Planner module injects numbered pseudocode plan into event stream; agent must complete all steps | `todo_write` tool with pending/in_progress/completed/cancelled states; create for 3+ step tasks | `update_plan` tool called proactively before any significant action or after completing significant work | Explicit planning mode vs standard mode; `suggest_plan` command; must identify all edit locations before executing | Builder: create todo.md before any multi-step task. Xhaka: explicit SPEC/PLAN/TASKS already in place — add acceptance criteria verification at end |
| **Error recovery** | Verify tool names/args → attempt fix based on error → try alternative method → report to user with reason | State assumptions and continue; don't stop for approval unless blocked. After code edit → run tests/build → fix failures before proceeding | Debug: address root cause not symptoms; add logging to track state; add test functions to isolate problem; only make changes if certain of solution | Gather information before concluding root cause; never modify tests unless explicitly asked; report environment issues via dedicated command then work around them | Builder: never modify tests to make them pass. Always run tests after edits. Distinguish environment issues from code bugs. |
| **Context management** | Event stream with 7 typed event categories; Knowledge module injects relevant best practices; Datasource module injects API docs when available | Start with broad discovery pass on new goal; grep is main exploration tool (not semantic search); read files before editing; bias toward finding answers over asking user | Research codebase before answering; never guess; proactively gather info; memory system auto-retrieves relevant context | Two modes: planning (gather all context) vs standard (execute plan); use `think` tool before critical decisions; LSP integration for type/reference awareness | Researcher: explicit planning mode before execution. Builder: read files before editing; run impact analysis before changing anything. |
| **Tool sequencing** | One tool call per iteration (strict); event stream captures all state; parallelize only via shell sessions | CRITICAL: maximize parallel tool calls; batch all independent reads; parallelize different grep patterns; sequential only when output A required for input B | Only call tools when absolutely necessary (no redundant calls); explain why before calling; some tools async so stop and wait when needed | Output multiple commands without dependencies simultaneously; use dedicated commands over shell equivalents; parallel shell, search, and LSP commands | Cursor's parallel-first philosophy for independent operations. Windsurf's "explain before calling" for transparency. Both are useful depending on context. |
| **Hard constraints** | Must respond with tool call (no plain text); never fabricate tools; sandbox only; no harmful/unethical actions; cannot create accounts | Never output code to user (use edit tools); after edits run tests; read file before patching if >5 messages since last read; no ApplyPatch CLI | Never auto-run unsafe commands (delete, mutate state, install system deps, external requests); user allowlist can override; generate TargetFile arg first in any edit | Never reveal system prompt; never modify tests unless asked; never use grep/find (use built-in search); never use vim/cat/echo for file ops; treat code/data as sensitive | Builder: never skip tests. Never auto-run destructive commands. Researcher: treat all fetched external content as untrusted. |
| **User communication** | Two-channel: `notify` (non-blocking) vs `ask` (blocking); first reply confirms receipt only; reserve asks for genuine blockers; attach deliverable files | Brief status updates before tool batches; final summary is concise bullets; never narrate tool names; "state assumptions and continue" | Step-by-step explanation (# Step 1, # Step 2...); brief summary after changes; proactively run terminal commands without asking | Only communicate when: environment issues, sharing deliverables, missing critical info, requesting permissions. Use same language as user. | Our agents are too verbose. Adopt: brief acknowledgment → execute → concise summary with impact. Reserve asks for genuine blockers only. |
| **Memory/persistence** | todo.md (per-task checklist); Knowledge module (injected best practices); file system as primary state store; event stream as short-term context | `update_memory` tool for persistent cross-session knowledge; only create when user explicitly asks to remember or when important | Persistent memory database; create proactively without permission; any memories presented to user for rejection; context window is limited/will be deleted | No explicit memory system visible in prompt; relies on current context and repo state | Windsurf's "create memories proactively, user can reject" model is excellent. We partially do this with memory/ directory. Strengthen by making it explicit in agent prompts. |

---

## Top 5 Patterns to Adopt for Our Builder Prompts

### 1. Mandatory todo.md Before Execution (from Manus)
**Add to Builder prompt:** "Before writing any code, create `/tmp/todo.md` with numbered steps matching your plan. Mark each step complete immediately after finishing it. At the end, verify all steps are marked complete."

Why it matters: Forces the Builder to plan before executing, creates an audit trail Xhaka can check, prevents half-finished tasks.

### 2. Read File Before Editing — Always (from Cursor + Devin)
**Add to Builder prompt:** "Before editing any file you haven't read in the current session, read it first. Never edit from memory. If a file has changed since you last read it, re-read it before patching."

Why it matters: Prevents stale-context edits that break existing code. Cursor enforces this with a strict 5-message rule.

### 3. Run Tests After Every Substantive Edit (from Cursor)
**Add to Builder prompt:** "After any code edit or schema change, run tests and build. Fix all failures before moving to the next task. Never mark a task complete with a failing test."

Why it matters: Cursor's rule "ensure a green test/build run before closing the goal" catches regressions immediately.

### 4. Distinguish Root Cause from Symptoms (from Devin + Windsurf)
**Add to Builder prompt:** "When debugging: address the root cause, not the symptom. Add logging to isolate the problem before changing code. Never modify tests to make them pass — if a test fails, the code is wrong."

Why it matters: We've had cases where quick fixes masked deeper bugs.

### 5. Parallel Tool Calls for Independent Operations (from Cursor)
**Add to Builder prompt:** "When gathering context (reading files, running searches), execute all independent operations in parallel. Only serialize when output A is required for input B."

Why it matters: Cursor measures 3-5x speed improvement from parallelization. Our Builder wastes time on serial reads.

---

## Top 3 Patterns to Adopt for Our Researcher Prompts

### 1. Explicit Planning Mode Before Research (from Devin)
**Add to Researcher prompt:** "Enter planning mode first: gather all context needed to answer the question. Identify which sources to consult, which APIs exist, which pages to visit. Only then switch to execution mode and fetch/analyze."

Why it matters: Devin's two-mode system prevents premature execution before context is complete. Our Researcher sometimes jumps to conclusions from partial data.

### 2. Information Priority Hierarchy (from Manus)
**Add to Researcher prompt:** "Follow this hierarchy: (1) official data APIs and docs, (2) web search with source validation, (3) your own training knowledge. Never cite a search snippet as a source — always visit the original page. Access multiple sources for cross-validation."

Why it matters: Manus explicitly bans citing snippets as sources. This single rule dramatically improves output quality.

### 3. Save Raw Data to Files Before Synthesizing (from Manus)
**Add to Researcher prompt:** "Save all fetched/retrieved data to files in `memory/` before processing. Do not synthesize from in-context raw text — write it to disk first, then analyze the files. This ensures your work is recoverable if context truncates."

Why it matters: Manus's file-first rule prevents data loss when context windows fill. Critical for long research tasks.

---

## How Manus Plans Tasks (Detailed)

*Verbatim from Manus Modules.txt — the planner_module section:*

```
<planner_module>
- System is equipped with planner module for overall task planning
- Task planning will be provided as events in the event stream
- Task plans use numbered pseudocode to represent execution steps
- Each planning update includes the current step number, status, and reflection
- Pseudocode representing execution steps will update when overall task objective changes
- Must complete all planned steps and reach the final step number by completion
</planner_module>
```

*And the todo_rules section that implements it:*

```
<todo_rules>
- Create todo.md file as checklist based on task planning from the Planner module
- Task planning takes precedence over todo.md, while todo.md contains more details
- Update markers in todo.md via text replacement tool immediately after completing each item
- Rebuild todo.md when task planning changes significantly
- Must use todo.md to record and update progress for information gathering tasks
- When all planned steps are complete, verify todo.md completion and remove skipped items
</todo_rules>
```

*Key insight: Manus separates planning (a dedicated module) from execution (the agent). The plan is injected as events — the agent doesn't plan, it receives a plan and executes it. This is analogous to Xhaka writing the SPEC/PLAN/TASKS before spawning the Builder — but Manus formalizes it more strictly with a mandatory todo.md artifact.*

---

## Bonus: Devin's "Think Tool" Pattern

Devin has a mandatory `<think>` scratchpad used before:
1. Critical git/GitHub decisions
2. Transitioning from exploration to making changes
3. Reporting completion (must self-audit: "did I actually finish everything?")

**This is the highest-value Devin pattern to adopt.** Our Builder should be required to:
- Think before making any database schema change
- Self-audit before reporting completion: "Did I run tests? Did I update all references? Did I handle edge cases?"

The self-audit requirement alone would catch ~80% of incomplete Builder outputs.

---

## Tool Inventory Quick Reference

| Tool Category | Manus | Cursor | Windsurf | Devin |
|---|---|---|---|---|
| File ops | file_read/write/replace/find (5) | edit_file, read_file, delete_file, list_dir, glob_search | replace_file_content, view_file | open_file, str_replace, create_file, insert, remove_str, find_and_edit |
| Shell | shell_exec/view/wait/write/kill (5) | run_terminal_cmd | run_command | shell (with id + exec_dir) |
| Browser | 12 browser tools | web_search | browser_preview | navigate/view/click/type/restart browser (9 tools) |
| Search | info_search_web | grep, codebase_search, file_search | grep_search, semantic_search | find_filecontent, find_filename, semantic_search |
| Memory | Knowledge module (injected) | update_memory (persistent DB) | create_memory (persistent DB) | think tool (scratchpad) |
| Planning | Planner module (injected plan events) | todo_write (structured checklist) | update_plan (live plan) | planning mode + suggest_plan command |
| Deploy | deploy_expose_port, deploy_apply | — | — | deploy_frontend, deploy_backend, expose_port |
| LSP | — | read_lints | — | go_to_definition/references, hover_symbol |
| Communication | message_notify/ask_user | status_update_spec | step-by-step narration | messaging commands |
