# Manus Agent — Deep Analysis
*Extracted from leaked system prompts. Source: x1xhlol/system-prompts-and-models-of-ai-tools*
*Date: 2026-03-16*

---

## Full Tool Inventory

Manus has 31 tools across 6 categories:

### Messaging (2)
- `message_notify_user` — Send non-blocking progress updates to user (no reply required)
- `message_ask_user` — Ask user a question and BLOCK until they respond; supports `suggest_user_takeover: browser` to hand off browser control for sensitive ops

### File System (5)
- `file_read` — Read file content with optional line range + sudo
- `file_write` — Overwrite or append to file with leading/trailing newline control
- `file_str_replace` — Surgical string replacement within a file
- `file_find_in_content` — Regex search within file content
- `file_find_by_name` — Glob-pattern file finder within a directory

### Shell (5)
- `shell_exec` — Run commands in a named shell session (sessions are persistent)
- `shell_view` — View output of a running shell session
- `shell_wait` — Wait for a process to complete in a named session
- `shell_write_to_process` — Write input to an interactive process (e.g., confirm prompts)
- `shell_kill_process` — Terminate a running process

### Browser (12)
- `browser_view` — View current page state
- `browser_navigate` — Navigate to URL
- `browser_restart` — Reset browser to fresh state
- `browser_click` — Click by element index or coordinates
- `browser_input` — Fill input fields
- `browser_move_mouse` — Move cursor
- `browser_press_key` — Keyboard shortcuts
- `browser_select_option` — Select from dropdowns
- `browser_scroll_up` / `browser_scroll_down` — Viewport scrolling
- `browser_console_exec` — Execute JavaScript in browser console
- `browser_console_view` — View console output/errors

### Search & Deploy (3)
- `info_search_web` — Google-style search with date range filtering
- `deploy_expose_port` — Expose local port via public proxy (temporary)
- `deploy_apply_deployment` — Deploy static or Next.js apps to production

### Meta (4)
- `make_manus_page` — Publish MDX file as a Manus Page
- `idle` — Signal task completion and enter standby

---

## Task Planning Approach

Manus uses a **dedicated Planner module** that operates separately from the execution agent:

1. **Planner generates pseudocode task plans** with numbered steps, injected into the event stream as `Plan` events
2. The agent MUST complete all planned steps — skipping is not allowed
3. Each planning event includes: current step number, status, and a reflection note
4. Plans update when the overall objective changes
5. **todo.md is the execution artifact**: the agent creates a `todo.md` checklist from the plan, updates markers after each step, and removes skipped items at completion

**Planning hierarchy:**
```
Task Planning (Planner module) → takes precedence
  └── todo.md (detailed execution tracking)
```

**Event stream types the agent monitors:**
- `Message` — User input
- `Action` — Tool calls it made
- `Observation` — Results from tool calls
- `Plan` — Planner module updates
- `Knowledge` — Best practice hints
- `Datasource` — Available data API docs

---

## Sandbox Architecture

Manus runs inside an **isolated Linux sandbox**:

- **OS:** Ubuntu 22.04 (linux/amd64)
- **User:** `ubuntu` with sudo privileges
- **Home:** `/home/ubuntu`
- **Network:** Full internet access
- **Runtimes pre-installed:** Python 3.10.12, Node.js 20.18.0, `bc` calculator
- **Sleep behavior:** Auto-sleep when inactive; wake on task start (no health check needed)
- **Data APIs:** Pre-installed in `/opt/.manus/.sandbox-runtime`, called via Python (NOT as tools)
- **Deployment:** Can expose ports temporarily or deploy static/Next.js apps permanently

The sandbox is the agent's workspace — it saves all intermediate work to files, never relies on in-memory state alone.

---

## Comparison to Xhaka Agent Architecture

| Dimension | Manus | Xhaka (our setup) |
|---|---|---|
| Execution model | Agent loop: one tool call per iteration | Sub-agent pattern: specialized agents spawned per task |
| Planning | Dedicated Planner module injects plan events | Xhaka writes SPEC/PLAN/TASKS before spawning Builder |
| State persistence | todo.md + file system (sandbox) | memory/ directory (markdown files) |
| Tool calls | One at a time (by design) | Parallel tool calls encouraged |
| Deployment | Built-in port expose + static/Next.js deploy | Railway API |
| User communication | Two modes: notify (non-blocking) vs ask (blocking) | Single Telegram message |
| Browser | Full browser automation built-in | OpenClaw browser tool |
| Error recovery | Verify args → try alternative → report to user | Specialist agents handle domain errors |
| Memory | Knowledge module + todo.md | memory/ directory |

---

## What We Should Copy Into Builder/Researcher Prompts

### For the Builder:

1. **Mandatory todo.md creation**: Before executing any task, Builder should create a `todo.md` with numbered steps checked off as it goes. This creates an audit trail and forces step-by-step thinking.

2. **One-tool-at-a-time discipline for sequential tasks**: Manus's "choose only one tool call per iteration" prevents race conditions in multi-step work. Our Builder should be explicit: "complete step N, verify output, then proceed to step N+1" for any task where steps have dependencies.

3. **Two-channel communication model**: Distinguish between `notify` (progress update, no response needed) and `ask` (blocking question, response required). Our agents should reserve asks for genuine blockers only.

4. **Information priority hierarchy**: `authoritative data API > web search > internal knowledge`. Our Researcher should explicitly follow this: check official docs/APIs before Googling, check Google before relying on training data.

5. **Shell session management**: Manus uses named shell sessions that persist across tool calls. Our Builder should chain commands with `&&` and save outputs to files rather than expecting in-context state.

6. **Browser handoff for sensitive ops**: When an action requires credentials or has side effects, Manus can signal `suggest_user_takeover: browser`. Equivalent: Xhaka asking Corey to take manual action in GHL rather than automating.

### For the Researcher:

1. **Save intermediate results to files**: Manus explicitly saves all retrieved data to files before processing. Our Researcher should write raw fetched data to `memory/` before synthesizing.

2. **Multi-source cross-validation**: The `info_rules` require accessing multiple URLs from search results, not just snippets. Researcher should never cite a snippet as a source — always visit the original page.

3. **Sequential entity search**: Search multiple attributes of one entity separately before moving to the next. Don't try to batch everything into one search.

---

## What Manus Does That We Don't (Gaps to Close)

| Gap | Manus Has | We're Missing |
|---|---|---|
| Structured planning artifact | `todo.md` that maps to the plan 1:1 | Builder just executes; no formal checklist |
| Plan-vs-execution verification | Planner checks remaining steps before completion | No systematic "did I finish everything?" |
| Streaming knowledge injection | Knowledge module injects best practices mid-task | Our prompts are static; no runtime knowledge injection |
| Data API priority | Explicit hierarchy: API > search > training data | Researchers may use Google when a direct API exists |
| Browser console debugging | Can execute JS and view console errors | Not using browser console for debug |
| Non-blocking progress updates | `message_notify_user` vs `message_ask_user` distinction | All our messages are equivalent weight |
| Idle/standby signaling | `idle` tool signals completion cleanly | Agents just stop responding |
| Writing style rules | Explicit rule: no bullet lists in outputs (prose only) | No output format enforcement in our agent prompts |

---

## Verbatim: Manus Agent Loop (from Agent loop.txt)

```
You are operating in an agent loop, iteratively completing tasks through these steps:
1. Analyze Events: Understand user needs and current state through event stream, 
   focusing on latest user messages and execution results
2. Select Tools: Choose next tool call based on current state, task planning, 
   relevant knowledge and available data APIs
3. Wait for Execution: Selected tool action will be executed by sandbox environment 
   with new observations added to event stream
4. Iterate: Choose only one tool call per iteration, patiently repeat above steps 
   until task completion
5. Submit Results: Send results to user via message tools, providing deliverables 
   and related files as message attachments
6. Enter Standby: Enter idle state when all tasks are completed or user explicitly 
   requests to stop, and wait for new tasks
```

## Verbatim: Manus todo_rules (from Modules.txt)

```
- Create todo.md file as checklist based on task planning from the Planner module
- Task planning takes precedence over todo.md, while todo.md contains more details
- Update markers in todo.md via text replacement tool immediately after completing each item
- Rebuild todo.md when task planning changes significantly
- Must use todo.md to record and update progress for information gathering tasks
- When all planned steps are complete, verify todo.md completion and remove skipped items
```

## Verbatim: Manus message_rules (from Modules.txt)

```
- Communicate with users via message tools instead of direct text responses
- Reply immediately to new user messages before other operations
- First reply must be brief, only confirming receipt without specific solutions
- Notify users with brief explanation when changing methods or strategies
- Actively use notify for progress updates, but reserve ask for only essential needs 
  to minimize user disruption and avoid blocking progress
- Must message users with results and deliverables before entering idle state upon task completion
```
