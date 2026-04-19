# LEARNINGS.md — The "Never Again" List

**Rule:** After ANY mistake, fix it, write the lesson here, and never repeat it. Making the same mistake twice is unforgivable.

---

## 2026-03-13
- **Mistake:** Touched Gunner Railway project without explicit Corey authorization. Corey's trust dropped to 10%.
- **Fix:** Gunner Railway (f379b683) is permanently off limits for Xhaka.
- **Rule:** **Never touch Gunner Railway without explicit Corey authorization. Not even to check logs.**

- **Mistake:** Built code directly instead of delegating to Builder/Architect.
- **Fix:** Xhaka specs, delegates, and reports. Period.
- **Rule:** **If it requires code, spawn the Builder. If it requires UI, spawn the Architect. No exceptions.**

- **Mistake:** Chased 502 on wrong service for 30 minutes (xhaka-brain in Gunner project vs xhaka-intelligence in Xhaka project).
- **Fix:** Two separate Railway projects: Xhaka (84c0d035) and Gunner (f379b683). xhaka-brain is a wrongly-named Postgres DB.
- **Rule:** **Always verify which Railway project and service before any action.**

- **Mistake:** Asked questions Corey expected me to answer myself (should have read the repo first).
- **Fix:** Check the repo, read memory, come back with answers — not questions.
- **Rule:** **Be resourceful before asking. Read the file. Check the context. Search for it. Then ask if stuck.**

## 2026-03-05
- **Mistake:** Missed 7:30 AM deadline for Acquisition Machine Plan. Hallucinated "Morning reminder set."
- **Fix:** Actually scheduled the cron job instead of assuming it was set.
- **Rule:** **Never say a cron is set unless you verified it with `openclaw cron list`. Schedule it, then confirm.**

## 2026-03-01
- **Mistake:** Built Torque AI infrastructure and pivot before confirming Corey was committed to the pivot.
- **Context:** Corey did ask for it and later refocused on Gunner.
- **Rule:** **On pivots: build GTM/strategy first, infrastructure second. Confirm commitment before deploying infrastructure.**

## 2026-02-27
- **Mistake:** Tried to run sub-agents with `anthropic/claude-sonnet-4-6` which doesn't exist on the API key.
- **Fix:** Use `gemini-pro` for sub-agents or verify model availability first.
- **Rule:** **Sub-agents default to `gemini-pro`.**

- **Mistake:** Tried to install `claude` CLI globally (`npm -g`) without permission.
- **Fix:** Install locally (`npm install`) and alias it.
- **Rule:** **Always install tools locally in the workspace.**

- **Mistake:** OAuth tokens stored on disk were wiped by Railway deploy.
- **Fix:** Persist tokens to Railway env vars via GraphQL API.
- **Rule:** **On Railway, disk is ephemeral. State must go to DB or Env Vars.**

- **Mistake:** Manually edited code instead of delegating to The Builder/Architect.
- **Fix:** Spawn specialized agents for all code/UI tasks.
- **Rule:** **If it's code > 1 line, SPAWN THE BUILDER.**

## 2026-02-26
- **Mistake:** Sub-agent Builder wrote files to sandbox, not actual repo. Lost: config/loader.ts, tenants/nah.json, initial-outreach.ts.
- **Fix:** Claude Code CLI writes directly to repo path. Use Claude Code for all repo file operations.
- **Rule:** **Sub-agents live in a sandbox. Claude Code CLI (`npx -y @anthropic-ai/claude-code`) writes to real paths.**

- **Mistake:** Used generic AI phrases ("Let's dive in").
- **Fix:** Updated SOUL.md with identity/tone standards.
- **Rule:** **No slop. Sound like Xhaka.**

## 2026-02-18
- **Mistake:** DRY_RUN globally true but 11 ENGINE_* env var overrides in Railway were silently bypassing it. Task Manager was creating REAL tasks for Kyle.
- **Fix:** Removed all 11 override vars. Now truly in dry run.
- **Rule:** **Before enabling anything, verify no individual ENGINE_* vars are overriding the global flag.**

## 2026-02-17
- **Mistake:** Data Hygiene not catching new leads because GHL workflows move leads past "New Lead" before 2-min poller cycles.
- **Fix:** Pipeline poller now triggers Data Hygiene on contacts created since last poll, not just current stage = "New Lead."
- **Rule:** **Polling triggers miss fast-moving stage changes. Build creation-time triggers, not stage-current triggers.**

## Recurring Patterns (What Works vs What Doesn't)

### What Works
- **Corey gives vision, Xhaka writes spec, Builder executes** — clean delegation = fastest builds
- **DRY RUN before live** — always. Corey needs to watch it work before trusting it.
- **Playbook-driven architecture** — industry-agnostic agents + swappable playbook = scale
- **Confidence scoring** (not DRY_RUN binary) — graduated response builds trust better
- **Morning follow-up** — Corey responds better in the morning when proactively nudged
- **Velocity Mode** — when Corey says "go fast," he means it. Don't slow down to ask permission on each step.
- **Claude Code via PTY** — must use `--pty true` and `--dangerously-skip-permissions` for file writes

### What Doesn't Work
- **Building code in main session** — Corey explicitly told Xhaka to stop. Trust drops.
- **Polling as primary trigger** — race conditions, missed events. Use webhooks + creation-time detection.
- **All-or-nothing DRY_RUN** — too coarse. Use per-engine flags or confidence thresholds.
- **Monolithic agent files** — hard to debug, test, or iterate. Split into small focused agents.
- **Hardcoded industry terms in agent code** — blocks multi-tenant scaling. Everything → Playbook.
- **Building features before foundations** — V1's biggest mistake. Foundation first, always.
- **Asking Corey which step to start on** — he said "just start." Work the list top to bottom.
- **Gemini 3 Pro Preview** — deprecated March 9, 2026. Don't use it.

### Corey's Feedback Patterns
- Gives feedback on UI in iterative loops — expect multiple revision cycles
- Will call out architectural violations immediately ("shouldn't there be more than 9 bots?")
- "Great" = keep going. Silence = keep going. Detailed feedback = something missed.
- "A lot of what you're saying goes over my head" = simplify language, always
- References his team as "my team" — design for non-technical users at all times
- When trust is low: he wants clean execution on small things first, not big builds

---
Last updated: 2026-03-14


## Auto-Generated Rules (2026-03-14)

- [HIGH][RULE]: Sub-agents must default to using `gemini-pro` unless another model is verified to be available.
- [RULE]: Always install tools locally within the workspace to avoid permission issues.
- [HIGH][RULE]: On Railway, treat disk storage as ephemeral; persist state to database or environment variables.
- [RULE]: For any code task longer than one line, spawn a specialized agent like The Builder to handle it.
- [RULE]: Use Claude Code CLI (`npx -y @anthropic-ai/claude-code`) for all file operations in the repository to ensure files are written to the correct paths.
- [HIGH][RULE]: Maintain Xhaka's unique tone and identity in all communications; avoid generic AI phrases.
- [RULE]: Before enabling any feature, ensure no individual ENGINE_* environment variables are overriding the global DRY_RUN flag.
- [RULE]: Implement creation-time triggers for data hygiene processes to capture fast-moving stage changes effectively.


## Auto-Generated Rules (2026-03-16)

- [HIGH][RULE]: Sub-agents must default to using `gemini-pro` unless model availability is verified.
- [RULE]: Always install tools locally within the workspace to avoid permission issues.
- [HIGH][RULE]: On Railway, treat disk storage as ephemeral; persist state to the database or environment variables.
- [RULE]: For any code task longer than one line, spawn a specialized agent like The Builder.
- [RULE]: Sub-agents operate in a sandbox; use Claude Code CLI (`npx -y @anthropic-ai/claude-code`) for writing to actual repository paths.
- [RULE]: Maintain Xhaka's identity and tone as per SOUL.md; avoid generic AI phrases.
- [RULE]: Before enabling any feature, ensure no individual ENGINE_* environment variables override the global DRY_RUN flag.
- [RULE]: Use creation-time triggers instead of stage-current triggers to handle fast-moving stage changes effectively.


## Auto-Generated Rules (2026-03-17)

- [HIGH][RULE]: Always verify model availability before attempting to run sub-agents. Default to using `gemini-pro` if unsure.
- [RULE]: Install all tools locally within the workspace using `npm install` and alias them as needed; avoid global installations.
- [HIGH][RULE]: On Railway, treat disk storage as ephemeral. Persist all necessary state to the database or environment variables.
- [RULE]: Delegate any code task longer than one line to the specialized Builder agent to ensure efficiency and accuracy.
- [RULE]: Use Claude Code CLI (`npx -y @anthropic-ai/claude-code`) for all file operations within the repository to ensure changes are made to the correct paths.
- [RULE]: Maintain the distinct identity and tone of Xhaka in all communications; avoid generic AI phrases.
- [RULE]: Before enabling any feature, ensure that no individual ENGINE_* environment variables are overriding the global DRY_RUN flag.
- [RULE]: Implement creation-time triggers for data hygiene processes to account for fast-moving stage changes in workflows.


## Auto-Generated Rules (2026-03-18)

- [HIGH][RULE]: Sub-agents must default to using `gemini-pro` unless model availability is verified.
- [RULE]: Always install tools locally in the workspace using `npm install` and alias them as needed.
- [HIGH][RULE]: On Railway, treat disk storage as ephemeral. Persist state to the database or environment variables.
- [RULE]: For code tasks longer than one line, spawn the specialized Builder agent to handle them.
- [RULE]: Sub-agents operate in a sandbox environment. Use Claude Code CLI (`npx -y @anthropic-ai/claude-code`) for writing to actual repository paths.
- [RULE]: Maintain a consistent identity and tone as outlined in SOUL.md; avoid generic AI phrases.
- [RULE]: Before enabling any feature, ensure no individual ENGINE_* environment variables are overriding the global DRY_RUN flag.
- [RULE]: Use creation-time triggers for data hygiene processes to account for fast-moving stage changes in workflows.


## Auto-Generated Rules (2026-03-19)

- [HIGH][RULE]: Sub-agents should default to using `gemini-pro` unless another model is verified as available.
- [HIGH][RULE]: Always install tools locally within the workspace to avoid permission issues.
- [HIGH][RULE]: On Railway, treat disk storage as ephemeral; persist state to the database or environment variables.
- [RULE]: For any code task longer than one line, spawn the Builder agent to handle it.
- [RULE]: Sub-agents operate in a sandbox environment; use the Claude Code CLI (`npx -y @anthropic-ai/claude-code`) for writing to actual repository paths.
- [RULE]: Avoid using generic AI phrases; maintain a consistent tone and identity as outlined in SOUL.md.
- [RULE]: Before enabling any feature, ensure no individual ENGINE_* environment variables are overriding the global DRY_RUN flag.
- [RULE]: Use creation-time triggers for data hygiene processes to account for fast-moving stage changes in workflows.


## Auto-Generated Rules (2026-03-20)

- [HIGH][RULE]: Sub-agents must default to using `gemini-pro` unless another model is verified as available.
- [RULE]: Always install tools locally within the workspace to avoid permission issues.
- [HIGH][RULE]: On Railway, treat disk storage as ephemeral; persist any state to the database or environment variables instead.
- [HIGH][RULE]: Delegate all code tasks greater than one line to specialized agents like The Builder to ensure efficiency and accuracy.
- [RULE]: Use Claude Code CLI (`npx -y @anthropic-ai/claude-code`) for all file operations in the repository to ensure changes are made in the correct paths.
- [RULE]: Maintain Xhaka's unique tone and identity in all communications; avoid generic AI phrases.
- [HIGH][RULE]: Before enabling any feature, ensure no individual ENGINE_* environment variables override the global DRY_RUN flag.
- [RULE]: Build triggers based on creation time rather than current stage to capture fast-moving data changes effectively.


## Auto-Generated Rules (2026-03-21)

- [HIGH][RULE]: Always verify model availability before attempting to run sub-agents. Default to using `gemini-pro` for sub-agents if unsure.
- [RULE]: Install all tools locally within the workspace using `npm install` and alias them as needed; avoid global installations.
- [HIGH][RULE]: On Railway, treat disk storage as ephemeral. Persist important state information to the database or environment variables.
- [RULE]: Delegate all code tasks that exceed one line to specialized agents like The Builder to ensure efficiency and accuracy.
- [RULE]: Use Claude Code CLI (`npx -y @anthropic-ai/claude-code`) for all operations involving writing to real repository paths, as sub-agents operate within a sandbox environment.
- [RULE]: Adhere to the identity and tone standards outlined in SOUL.md to maintain a consistent and recognizable voice as Xhaka.
- [RULE]: Before enabling any feature, ensure that no individual ENGINE_* environment variables are overriding the global DRY_RUN flag.
- [RULE]: Implement creation-time triggers for data hygiene processes to capture fast-moving stage changes effectively, rather than relying solely on current stage triggers.


## Auto-Generated Rules (2026-03-22)

- [HIGH][RULE]: Always verify model availability before attempting to run sub-agents; default to using `gemini-pro` if unsure.
- [RULE]: Install tools locally within the workspace and alias them as needed; avoid global installations without permissions.
- [HIGH][RULE]: On Railway, treat disk storage as ephemeral. Persist important state data to the database or environment variables instead.
- [RULE]: For any code task exceeding one line, delegate to the Builder by spawning a specialized agent.
- [RULE]: Use Claude Code CLI (`npx -y @anthropic-ai/claude-code`) for all file operations that need to write directly to the repository paths.
- [RULE]: Maintain Xhaka's identity and tone as specified in SOUL.md; avoid using generic AI phrases.
- [RULE]: Before enabling any feature, ensure no individual ENGINE_* environment variables are overriding the global DRY_RUN flag.
- [RULE]: Implement creation-time triggers for data hygiene processes to account for fast-moving stage changes in workflows.


## Auto-Generated Rules (2026-03-23)

- [HIGH][RULE]: Always verify model availability before attempting to run sub-agents; default to using `gemini-pro` if unsure.

- [RULE]: Install tools locally within the workspace using `npm install` and alias them, avoiding global installations.

- [HIGH][RULE]: On Railway, treat disk storage as ephemeral. Persist all necessary state to the database or environment variables.

- [HIGH][RULE]: Delegate any code task longer than one line to The Builder by spawning specialized agents.

- [RULE]: Use Claude Code CLI (`npx -y @anthropic-ai/claude-code`) for all file operations in the repository to ensure files are written to the correct paths.

- [RULE]: Adhere strictly to the identity and tone standards outlined in SOUL.md to maintain a consistent voice as Xhaka.

- [RULE]: Before enabling any feature, ensure no individual ENGINE_* environment variables are overriding the global settings.

- [RULE]: Implement triggers based on creation time rather than current stage to catch fast-moving changes in workflows.


## Auto-Generated Rules (2026-03-24)

- [HIGH][RULE]: Always verify model availability before attempting to run sub-agents, defaulting to `gemini-pro` if unsure.
- [RULE]: Install all tools locally within the workspace to avoid permission issues with global installations.
- [HIGH][RULE]: On Railway, treat disk storage as ephemeral; persist any necessary state to the database or environment variables.
- [RULE]: Delegate all code tasks exceeding one line to specialized agents like The Builder to ensure efficiency and accuracy.
- [RULE]: Use Claude Code CLI (`npx -y @anthropic-ai/claude-code`) for writing files directly to the repository path to prevent data loss.
- [RULE]: Adhere to the identity and tone standards outlined in SOUL.md to maintain consistent communication as Xhaka.
- [RULE]: Before enabling any features, ensure no individual ENGINE_* environment variables are overriding the global DRY_RUN flag.
- [RULE]: Implement creation-time triggers instead of relying solely on stage-current triggers to capture fast-moving stage changes effectively.


## Auto-Generated Rules (2026-03-25)

- [HIGH][RULE]: Sub-agents must default to using `gemini-pro` unless another model is verified to be available.
- [HIGH][RULE]: Always install tools locally within the workspace using `npm install` and alias them as needed.
- [RULE]: On Railway, treat the disk as ephemeral. Persist any necessary state to the database or environment variables.
- [RULE]: For any code task greater than one line, spawn the Builder agent to handle it.
- [RULE]: Sub-agents operate in a sandbox environment; use Claude Code CLI (`npx -y @anthropic-ai/claude-code`) for writing to real repository paths.
- [RULE]: Maintain Xhaka's unique voice and tone as outlined in SOUL.md; avoid generic AI phrases.
- [RULE]: Before enabling any feature, ensure no individual ENGINE_* environment variables are overriding the global DRY_RUN flag.
- [RULE]: Implement creation-time triggers rather than relying on current-stage triggers to account for fast-moving stage changes in workflows.


## Auto-Generated Rules (2026-03-26)

- [HIGH][RULE]: Sub-agents must default to using `gemini-pro` unless model availability is verified.
- [RULE]: Always install tools locally in the workspace using `npm install` and alias them as needed.
- [HIGH][RULE]: On Railway, treat disk as ephemeral; persist state to database or environment variables.
- [RULE]: For any code task exceeding one line, spawn the specialized Builder agent to handle it.
- [RULE]: Sub-agents operate in a sandbox environment; use Claude Code CLI (`npx -y @anthropic-ai/claude-code`) for writing to actual repository paths.
- [RULE]: Maintain Xhaka's distinct identity and tone in all communications; avoid generic AI phrases.
- [RULE]: Before enabling any feature, ensure no individual ENGINE_* environment variables are overriding the global DRY_RUN flag.
- [RULE]: Use creation-time triggers for data hygiene processes to account for fast-moving stage changes in workflows.


## Auto-Generated Rules (2026-03-27)

- [HIGH][RULE]: Sub-agents must default to using `gemini-pro` unless a specific model is verified as available.
- [RULE]: Always install tools locally within the workspace to avoid permission issues.
- [HIGH][RULE]: On Railway, treat disk storage as ephemeral; persist state to environment variables or a database.
- [RULE]: For code tasks longer than one line, delegate to The Builder by spawning a specialized agent.
- [RULE]: Use Claude Code CLI (`npx -y @anthropic-ai/claude-code`) for writing to actual repository paths, as sub-agents operate in a sandbox.
- [RULE]: Ensure no individual ENGINE_* environment variables override the global DRY_RUN flag before enabling any feature.
- [RULE]: Build triggers based on creation time rather than current stage to capture fast-moving changes effectively.
- [RULE]: Maintain Xhaka's distinct identity and tone; avoid generic AI phrases.


## Auto-Generated Rules (2026-03-28)

- [HIGH][RULE]: Sub-agents must default to using `gemini-pro` unless another model's availability is confirmed.
- [RULE]: Always install tools locally within the workspace to avoid permission issues.
- [HIGH][RULE]: On Railway, persist state to environment variables or a database, as the disk is ephemeral.
- [RULE]: For any code task greater than one line, spawn the Builder agent to handle it.
- [RULE]: Use Claude Code CLI (`npx -y @anthropic-ai/claude-code`) for writing to real repository paths, as sub-agents operate in a sandbox.
- [RULE]: Ensure communication aligns with Xhaka's identity and tone as defined in SOUL.md; avoid generic AI phrases.
- [RULE]: Before enabling any feature, check that no individual ENGINE_* environment variables are overriding the global DRY_RUN flag.
- [RULE]: Implement creation-time triggers for data processes to account for fast-moving stage changes, rather than relying solely on current stage triggers.


## Auto-Generated Rules (2026-03-29)

- [HIGH][RULE]: Always verify model availability before attempting to run sub-agents; default to using `gemini-pro` if unsure.
- [RULE]: Install all tools locally within the workspace and alias them as needed to avoid permission issues.
- [HIGH][RULE]: On Railway, treat disk storage as ephemeral; persist all state data to a database or environment variables.
- [RULE]: Delegate any code task longer than one line to The Builder to ensure efficient execution and maintain focus on high-level tasks.
- [RULE]: Use Claude Code CLI (`npx -y @anthropic-ai/claude-code`) for all file operations in the repository to ensure changes are made in the correct location.


## Auto-Generated Rules (2026-03-30)

- [HIGH][RULE]: Always verify model availability before attempting to run sub-agents. Default to using `gemini-pro` if unsure.
- [RULE]: Install all tools locally within the workspace to avoid permission issues, and alias them if necessary.
- [HIGH][RULE]: On Railway, treat disk storage as ephemeral. Persist all necessary state to the database or environment variables.
- [RULE]: Delegate any code tasks longer than one line to specialized agents like The Builder to ensure efficiency and accuracy.
- [RULE]: Use Claude Code CLI (`npx -y @anthropic-ai/claude-code`) for all operations that require writing to the repository to ensure files are correctly placed.
- [HIGH][RULE]: Maintain Xhaka's unique voice and tone as outlined in SOUL.md; avoid generic AI phrases.
- [RULE]: Before enabling any feature, ensure no individual ENGINE_* environment variables are overriding the global DRY_RUN flag.
- [RULE]: Build triggers based on creation time rather than current stage to accommodate fast-moving changes in workflows.


## Auto-Generated Rules (2026-03-31)

- [HIGH][RULE]: Always verify model availability before attempting to run sub-agents. Default to using `gemini-pro` if unsure.
- [RULE]: Install all tools locally within the workspace using `npm install` and alias them as needed; avoid global installations.
- [RULE]: Persist OAuth tokens to Railway environment variables using the GraphQL API to prevent data loss, as Railway disk storage is ephemeral.
- [HIGH][RULE]: Delegate all code tasks exceeding one line to specialized agents like The Builder to ensure efficiency and accuracy.
- [RULE]: Use Claude Code CLI (`npx -y @anthropic-ai/claude-code`) for any file operations within the repository to ensure changes are made to the correct paths.
- [RULE]: Adhere strictly to the identity and tone standards outlined in SOUL.md to maintain a consistent and professional communication style.
- [RULE]: Before enabling any features, confirm that no individual ENGINE_* environment variables are overriding the global DRY_RUN flag.
- [RULE]: Implement creation-time triggers for data hygiene processes to account for fast-moving stage changes in workflows.


## Auto-Generated Rules (2026-04-01)

- [HIGH][RULE]: Always verify model availability before attempting to run sub-agents. Default to using `gemini-pro` if unsure.
- [RULE]: Install all tools locally within the workspace using `npm install` and alias them as needed; avoid global installations.
- [HIGH][RULE]: Persist all state and tokens to Railway environment variables or a database, as the disk is ephemeral and will not retain data.
- [RULE]: Delegate any code task longer than one line to a specialized agent like The Builder to ensure efficiency and accuracy.
- [RULE]: Use Claude Code CLI (`npx -y @anthropic-ai/claude-code`) for any file operations that need to write to the actual repository to avoid data loss.
- [RULE]: Maintain Xhaka's distinct tone and identity as outlined in SOUL.md; avoid generic AI phrases.
- [RULE]: Before enabling any features, ensure no individual ENGINE_* environment variables override the global DRY_RUN flag.
- [RULE]: Implement creation-time triggers for data hygiene processes to catch fast-moving stage changes, rather than relying solely on current stage polling.


## Auto-Generated Rules (2026-04-02)

- [HIGH][RULE]: Sub-agents must default to using `gemini-pro` unless another model is verified to be available.
- [RULE]: Always install tools locally within the workspace using `npm install` and alias them as needed.
- [HIGH][RULE]: On Railway, treat disk storage as ephemeral; persist state to database or environment variables instead.
- [RULE]: For any code task exceeding one line, delegate to The Builder by spawning a specialized agent.
- [RULE]: Sub-agents operate in a sandbox environment; use Claude Code CLI (`npx -y @anthropic-ai/claude-code`) for writing to actual repository paths.
- [RULE]: Maintain Xhaka's identity and tone by avoiding generic AI phrases; adhere to the standards outlined in SOUL.md.
- [RULE]: Before enabling any feature, ensure that no individual ENGINE_* environment variables are overriding the global DRY_RUN flag.
- [RULE]: Use creation-time triggers instead of stage-current triggers to handle fast-moving stage changes effectively.


## Auto-Generated Rules (2026-04-03)

- [HIGH][RULE]: Sub-agents must default to using `gemini-pro` unless model availability is verified.
- [RULE]: Always install tools locally within the workspace using `npm install` and alias them as needed.
- [HIGH][RULE]: On Railway, treat disk storage as ephemeral. Persist state to the database or environment variables.
- [RULE]: For any code task exceeding one line, spawn the Builder agent to handle it.
- [RULE]: Ensure sub-agents operate in a sandbox. Use Claude Code CLI (`npx -y @anthropic-ai/claude-code`) for writing to actual repository paths.
- [RULE]: Maintain Xhaka's unique tone and identity; avoid generic AI phrases.
- [RULE]: Before enabling any feature, verify that no individual ENGINE_* environment variables override the global flag.
- [RULE]: Use creation-time triggers instead of stage-current triggers to handle fast-moving stage changes effectively.


## Auto-Generated Rules (2026-04-04)

- [HIGH][RULE]: Sub-agents must default to using `gemini-pro` unless model availability is verified.
- [RULE]: Always install tools locally within the workspace using `npm install` and alias them as needed.
- [HIGH][RULE]: On Railway, treat disk storage as ephemeral. Persist state to the database or environment variables.
- [HIGH][RULE]: For any code task exceeding one line, delegate to the Builder by spawning a specialized agent.
- [RULE]: Sub-agents operate in a sandbox; use Claude Code CLI (`npx -y @anthropic-ai/claude-code`) to write directly to repository paths.
- [RULE]: Avoid generic AI phrases; adhere to the identity and tone standards outlined in SOUL.md to maintain Xhaka's distinct voice.
- [RULE]: Before enabling any feature, ensure that no individual ENGINE_* environment variables are overriding the global DRY_RUN flag.
- [RULE]: Use creation-time triggers for data hygiene processes to account for fast-moving stage changes, rather than relying solely on current-stage triggers.


## Auto-Generated Rules (2026-04-05)

- [HIGH][RULE]: Sub-agents should default to using `gemini-pro` unless model availability is verified first.
- [RULE]: Always install tools locally in the workspace to avoid permission issues.
- [HIGH][RULE]: On Railway, treat disk storage as ephemeral; persist state to the database or environment variables.
- [HIGH][RULE]: For any code task greater than one line, spawn The Builder to handle it.
- [RULE]: Use Claude Code CLI (`npx -y @anthropic-ai/claude-code`) for all file operations in the repository to ensure correct path usage.
- [RULE]: Maintain Xhaka's unique tone and identity; avoid generic AI phrases.
- [RULE]: Before enabling any feature, verify that no individual ENGINE_* environment variables are overriding the global flag.
- [RULE]: Use creation-time triggers for data hygiene processes to capture fast-moving stage changes effectively.


## Auto-Generated Rules (2026-04-06)

- [HIGH][RULE]: Always verify model availability before attempting to run sub-agents. Default to using `gemini-pro` if unsure.
- [RULE]: Install all tools locally within the workspace using `npm install` and alias them as needed; avoid global installations.
- [HIGH][RULE]: On Railway, treat the disk as ephemeral. Persist any necessary state to the database or environment variables.
- [RULE]: For any code task longer than one line, spawn a specialized agent like The Builder to handle it.
- [RULE]: Ensure sub-agents operate in a sandbox environment. Use Claude Code CLI (`npx -y @anthropic-ai/claude-code`) for writing to actual repository paths.
- [HIGH][RULE]: Maintain Xhaka's identity and tone as outlined in SOUL.md; avoid generic AI phrases.
- [RULE]: Before enabling any feature, check for and resolve any ENGINE_* environment variable overrides that might bypass global settings.
- [RULE]: Use creation-time triggers for data processes to account for fast-moving stage changes, rather than relying solely on current-stage polling.


## Auto-Generated Rules (2026-04-07)

- [HIGH][RULE]: Sub-agents must default to using `gemini-pro` unless another model is verified as available.
- [RULE]: Always install tools locally in the workspace using `npm install` and alias them as needed.
- [HIGH][RULE]: On Railway, treat disk storage as ephemeral; persist any necessary state to the database or environment variables.
- [RULE]: Delegate any code tasks exceeding one line to specialized agents like The Builder.
- [RULE]: Use Claude Code CLI (`npx -y @anthropic-ai/claude-code`) for all file operations that need to write to the actual repository paths.
- [RULE]: Ensure communication aligns with Xhaka's identity and tone standards as outlined in SOUL.md.
- [RULE]: Before enabling any features, verify that no individual ENGINE_* environment variables are overriding the global DRY_RUN flag.
- [RULE]: Implement creation-time triggers for data processes to account for fast-moving stage changes, rather than relying solely on current stage triggers.


## Auto-Generated Rules (2026-04-08)

- [HIGH][RULE]: Always verify model availability before attempting to run sub-agents; default to using `gemini-pro` if unsure.
- [RULE]: Install all tools locally within the workspace to avoid permission issues and ensure proper configuration.
- [HIGH][RULE]: On Railway, treat disk storage as ephemeral. Persist all necessary state data to the database or environment variables.
- [RULE]: Delegate any coding tasks that exceed one line to The Builder to ensure accuracy and efficiency.
- [RULE]: Use Claude Code CLI (`npx -y @anthropic-ai/claude-code`) for writing files directly to the repository paths, as sub-agents operate in a sandbox environment.
- [RULE]: Maintain the unique identity and tone of Xhaka in all communications; avoid generic AI phrases.
- [RULE]: Before enabling any feature, ensure no individual ENGINE_* environment variables are overriding the global DRY_RUN flag.
- [RULE]: Implement creation-time triggers for data hygiene processes to account for fast-moving stage changes in workflows.


## Auto-Generated Rules (2026-04-10)

- [HIGH][RULE]: Sub-agents must default to using `gemini-pro` unless another model is verified as available.
- [RULE]: Always install tools locally in the workspace using `npm install` and alias them if needed.
- [HIGH][RULE]: On Railway, all persistent state must be stored in the database or environment variables, as disk storage is ephemeral.
- [RULE]: For any code task exceeding one line, spawn the Builder to handle it.
- [RULE]: Sub-agents operate in a sandbox environment; use Claude Code CLI (`npx -y @anthropic-ai/claude-code`) for writing to real repository paths.
- [RULE]: Ensure communication aligns with Xhaka's identity and tone standards as outlined in SOUL.md.
- [RULE]: Before enabling any feature, verify that no individual ENGINE_* environment variables are overriding the global DRY_RUN flag.
- [RULE]: Build triggers based on creation-time rather than current stage to account for fast-moving stage changes in workflows.


## Auto-Generated Rules (2026-04-11)

- [HIGH][RULE]: Sub-agents must default to using `gemini-pro` unless another model is verified to be available.
- [RULE]: Always install tools locally in the workspace using `npm install` and alias them as needed.
- [HIGH][RULE]: On Railway, ensure all state is persisted to the database or environment variables, as the disk is ephemeral.
- [RULE]: For any code task exceeding one line, spawn the Builder agent to handle it.
- [RULE]: Sub-agents operate in a sandbox; use Claude Code CLI (`npx -y @anthropic-ai/claude-code`) for writing to actual repository paths.
- [RULE]: Maintain Xhaka's distinct identity and tone; avoid generic AI phrases.
- [RULE]: Before enabling any feature, verify that no individual ENGINE_* environment variables are overriding the global DRY_RUN flag.
- [RULE]: Use creation-time triggers for data hygiene processes to account for fast-moving stage changes in workflows.


## Auto-Generated Rules (2026-04-12)

- [HIGH][RULE]: Sub-agents must default to using `gemini-pro` unless another model is verified as available.
- [RULE]: Always install tools locally within the workspace using `npm install` and alias them as needed.
- [HIGH][RULE]: On Railway, treat disk storage as ephemeral; persist any necessary state to the database or environment variables.
- [HIGH][RULE]: For any code tasks exceeding one line, delegate to The Builder by spawning specialized agents.
- [RULE]: Ensure sub-agents operate within a sandbox, and use Claude Code CLI (`npx -y @anthropic-ai/claude-code`) for writing to actual repository paths.
- [RULE]: Maintain Xhaka's distinct identity and tone in all communications; avoid generic AI phrases.
- [RULE]: Before enabling any feature, verify that no individual ENGINE_* environment variables are overriding the global DRY_RUN flag.
- [RULE]: Use creation-time triggers for data hygiene processes to account for fast-moving stage changes, rather than relying solely on current stage triggers.


## Auto-Generated Rules (2026-04-13)

- [HIGH][RULE]: Always use `gemini-pro` for sub-agents unless a different model is verified as available.
- [HIGH][RULE]: Install all tools locally within the workspace environment; avoid global installations.
- [HIGH][RULE]: On Railway, treat disk storage as ephemeral. Persist any necessary state to the database or environment variables.
- [RULE]: For any code tasks exceeding one line, delegate to The Builder to ensure proper execution and management.
- [RULE]: Use Claude Code CLI (`npx -y @anthropic-ai/claude-code`) for all file operations that need to be written directly to the repository paths.
- [RULE]: Maintain the Xhaka identity and tone as outlined in SOUL.md; avoid generic AI phrases.
- [RULE]: Before enabling any feature, ensure no individual ENGINE_* environment variables are overriding the global settings.
- [RULE]: Build triggers based on creation-time rather than current stage to accommodate fast-moving stage changes in workflows.


## Auto-Generated Rules (2026-04-14)

- [HIGH][RULE]: Sub-agents must default to using `gemini-pro` unless another model's availability is confirmed.
- [RULE]: Always install tools locally within the workspace using `npm install` and alias them as needed.
- [HIGH][RULE]: On Railway, treat the disk as ephemeral; persist state to the database or environment variables.
- [RULE]: For any code task exceeding one line, spawn a specialized agent, specifically The Builder, to handle it.
- [RULE]: Sub-agents operate in a sandbox environment; use Claude Code CLI (`npx -y @anthropic-ai/claude-code`) for writing to actual repository paths.
- [RULE]: Maintain Xhaka's unique tone and identity as outlined in SOUL.md; avoid generic AI phrases.
- [RULE]: Before enabling any feature, ensure that no individual ENGINE_* environment variables are overriding the global DRY_RUN flag.
- [RULE]: Use creation-time triggers instead of stage-current triggers to handle fast-moving stage changes effectively.


## Auto-Generated Rules (2026-04-15)

- [HIGH][RULE]: Sub-agents must default to using `gemini-pro` unless another model is verified as available.
- [HIGH][RULE]: Always install tools locally within the workspace to avoid permission issues.
- [HIGH][RULE]: On Railway, treat disk storage as ephemeral; persist state to the database or environment variables.
- [RULE]: For any code task exceeding one line, delegate to The Builder by spawning a specialized agent.
- [RULE]: Use Claude Code CLI (`npx -y @anthropic-ai/claude-code`) for all operations involving writing to the actual repository paths.
- [RULE]: Maintain Xhaka's distinct identity and tone in all communications; avoid generic AI phrases.
- [RULE]: Before enabling any feature, ensure no individual ENGINE_* environment variables are overriding the global DRY_RUN flag.
- [RULE]: Design pollers to trigger based on creation time rather than current stage to capture fast-moving changes effectively.


## Auto-Generated Rules (2026-04-16)

- [HIGH][RULE]: Always verify the availability of models before attempting to use them. Default sub-agents to `gemini-pro` if unsure.
- [RULE]: Install tools locally within the workspace using `npm install` and alias them as needed; avoid global installations.
- [HIGH][RULE]: Persist any state information on Railway to environment variables or a database, as the disk is ephemeral.
- [RULE]: Delegate any code tasks longer than one line to specialized agents like The Builder.
- [RULE]: Use Claude Code CLI (`npx -y @anthropic-ai/claude-code`) for all file operations in the repository to ensure files are written to the correct paths.
- [RULE]: Adhere strictly to the identity and tone standards outlined in SOUL.md to maintain consistency in communication.
- [RULE]: Before enabling any feature, ensure that no individual ENGINE_* environment variables are overriding the global DRY_RUN flag.
- [RULE]: Implement creation-time triggers for data hygiene processes to account for fast-moving stage changes and ensure no leads are missed.


## Auto-Generated Rules (2026-04-17)

- [HIGH][RULE]: Always verify model availability before attempting to run sub-agents; default to using `gemini-pro` if unsure.
- [RULE]: Install all tools locally within the workspace using `npm install` and alias them as needed, avoiding global installations.
- [HIGH][RULE]: Persist OAuth tokens and any state information to Railway environment variables or a database, as the disk is ephemeral.
- [HIGH][RULE]: Delegate all code tasks exceeding one line to a specialized agent like The Builder to ensure efficient task management.
- [RULE]: Use Claude Code CLI (`npx -y @anthropic-ai/claude-code`) for all file operations in the repository to ensure files are written to the correct paths.
- [RULE]: Maintain consistent identity and tone by adhering to the standards outlined in SOUL.md, avoiding generic AI phrases.
- [RULE]: Before enabling any feature, ensure no individual ENGINE_* environment variables are overriding the global DRY_RUN flag.
- [RULE]: Implement creation-time triggers for data processes to account for fast-moving stage changes, rather than relying solely on current stage triggers.


## Auto-Generated Rules (2026-04-18)

- [HIGH][RULE]: Always verify model availability before attempting to run sub-agents. Default to using `gemini-pro` if uncertain.

- [HIGH][RULE]: Install all tools locally within the workspace to avoid permission issues. Use local aliasing for global functionality.

- [HIGH][RULE]: On Railway, treat disk storage as ephemeral. Persist important state information to the database or environment variables.

- [RULE]: Delegate any code task longer than one line to a specialized agent like The Builder to ensure efficiency and accuracy.

- [RULE]: Use Claude Code CLI for all file operations in the repository to ensure changes are made directly to the intended paths.

- [RULE]: Avoid using generic AI phrases. Maintain a consistent and unique tone that aligns with Xhaka's identity as outlined in SOUL.md.

- [RULE]: Before enabling any features, confirm that no individual ENGINE_* environment variables are overriding the global settings.

- [RULE]: Implement creation-time triggers for data hygiene processes to capture fast-moving stage changes effectively.


## Auto-Generated Rules (2026-04-19)

- [HIGH][RULE]: Sub-agents must default to using `gemini-pro` unless model availability is verified first.
- [RULE]: Always install tools locally within the workspace using `npm install` and alias them as needed.
- [HIGH][RULE]: On Railway, treat disk storage as ephemeral; persist state to the database or environment variables.
- [RULE]: For any code task exceeding one line, spawn a specialized agent, specifically The Builder.
- [RULE]: Sub-agents operate in a sandbox environment; use Claude Code CLI (`npx -y @anthropic-ai/claude-code`) for writing to actual repository paths.
- [RULE]: Avoid generic AI phrases; adhere to the identity and tone standards outlined in SOUL.md to maintain Xhaka's distinct voice.
- [RULE]: Before enabling any feature, ensure no individual ENGINE_* environment variables are overriding the global DRY_RUN flag.
- [RULE]: Use creation-time triggers instead of stage-current triggers to handle fast-moving stage changes effectively.
