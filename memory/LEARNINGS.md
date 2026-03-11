# LEARNINGS.md — The "Never Again" List

**Rule:** After ANY mistake, fix it, write the lesson here, and never repeat it. Making the same mistake twice is unforgivable.

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

- **Mistake:** Used generic AI phrases ("Let's dive in").
- **Fix:** Update SOUL.md with "Vibecoding" standards.
- **Rule:** **No slop. Sound like Xhaka.**
