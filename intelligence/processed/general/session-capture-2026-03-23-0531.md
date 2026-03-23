# Session Capture: 2026-03-23-0531

## Key Decisions
- No new major decisions identified in the last 3 cron sessions.

## Rules Corey Stated
- **Workspace Sync Rule:** Sync only a specific list of config files (MEMORY.md, PROJECTS.md, HEARTBEAT.md, SOUL.md, TOOLS.md, USER.md, IDENTITY.md, AGENTS.md) to GitHub. Do not touch anything outside this list.
- **Heartbeat Protocol:** Max 3 alerts per heartbeat. If an issue was already reported, do not repeat it. All clear must reply 'HEARTBEAT_OK'.

## Open Tasks
- [ ] Monitor 'xhaka-intelligence' and 'xhaka-control-room' for failed Railway deployments.
- [ ] Monitor Gunner CRM health via endpoint.
- [ ] Check 'data/job-registry.json' for failed or stuck jobs (>30 min).
- [ ] Verify synthesis and cleanup jobs are run weekly.
- [ ] Maintain MEMORY.md under 150 lines.
- [ ] Ensure local workspace is synced to GitHub.
