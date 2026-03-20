# Session Memory Capture — 2026-03-20-1731

## Key Decisions
- **CLAUDE.md rewritten**: All specialists now get full company/mission context on session start.
- **ACP spawns are dead**: Paperclip is now the exclusive execution layer for all technical tasks.
- **Communication Protocol**: No narration of internal steps; acknowledge -> in motion -> done -> next.
- **Routing by Domain**: Use specialized agents (Researcher, Auditor, etc.) in a chain (Researcher -> Builder -> Auditor).
- **Permanent Tunnel**: Established permanent ngrok tunnel at `https://nonuterine-unprickly-rosalba.ngrok-free.dev`.
- **OpenAI Integration**: Wired OpenAI API key into `.env` and set `openai/gpt-4o-mini` as default for background tasks.
- **Memory Architecture**: Adopted Hermes-style principles (hot/cold memory separation, prompt stability focus).
- **Optimization Strategy**: Adopted Convex optimization patterns (one-shot fetches, digest tables, change detection).

## Rules Corey Stated
- **Context is Mandatory**: Agents must follow all provided knowledge (CLAUDE.md), not just raw code capability.
- **No Narration**: Stop narrating internal tool calls; keep replies dense and action-oriented.
- **Stop defaulting to "Builder"**: Use the correct domain specialist (Architect, Operator, etc.).
- **Paperclip Only**: All technical work must happen on the Paperclip board for auditability/records.
- **Ignore Gunner CRM**: This is an old repo; do not track it or create issues for it.

## Open Tasks
- **Fix ai.xhaka.sync**: The sync LaunchAgent is broken because `/Users/wholesaleai/.openclaw/workspace/scripts/sync-xhaka.sh` is missing.
- **Token Leak Check**: Audit background jobs to ensure no accidental Anthropic token spend.
- **Gunner CRM Health**: Investigate why the health check returns `crmStatus: degraded`.
- **Implementation**: Execute the Convex optimization plan (one-shot fetches, digest tables, change detection).
