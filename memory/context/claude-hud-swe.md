# Research: Claude HUD & Agent Orchestration (Open SWE)

## 1. Open SWE (langchain-ai/open-swe)
- **Identity:** Open-source framework for building internal "Asynchronous Coding Agents" (similar to Stripe's Minions or Ramp's Inspect).
- **Core Architecture:**
  - **Isolated Cloud Sandboxes:** Uses Modal, Daytona, or Runloop to create ephemeral Linux environments for every task.
  - **Subagent Spawning:** Uses the `task` tool to fan out work to child agents (Deep Agents framework).
  - **Persistence:** Each thread gets a persistent sandbox that auto-recreates if unreachable.
  - **Invocation:** Triggered via Slack (@mentions), Linear (comments), or GitHub (PR comments).
- **Key Files:** 
  - `AGENTS.md`: Root-level file used to inject repo-specific conventions, testing rules, and architectural decisions into every agent run.

## 2. Claude HUD (jarrodwatts/claude-hud)
- **Identity:** A "Head-Up Display" plugin for Claude Code.
- **Value:** Real-time visibility into the agent's "internal state" while it works.
- **HUD Elements:**
  - **Context Health:** Visual bar (Green -> Red) showing how full the 200k/1M token window is.
  - **Tool Activity:** Live stream of Read/Edit/Grep actions.
  - **Agent Tracking:** Shows which subagents are running and their current sub-task.
  - **Todo Progress:** Tracks task completion percentage.
- **Setup:** `/plugin install claude-hud` inside Claude Code.

## Strategic Takeaway for Gunner Rebuild
- **HUD for the Builder:** You should install `claude-hud` in your VS Code terminal where you run Claude Code. This will let you see *exactly* when the Builder is hitting context limits or when a sub-agent is spinning on a task.
- **AGENTS.md is the Standard:** We should adopt the `AGENTS.md` pattern from Open SWE. It's a cleaner way to store the "Rules of the House" for any agent that enters the repo, ensuring they follow our data contract and settings-tab rules without having to repeat them in every prompt.
- **Cloud Sandboxes:** As we scale, moving the "Builder" from your local machine to a Modal/Daytona cloud sandbox (like Open SWE does) would allow for parallel feature development without locking up your local terminal.
