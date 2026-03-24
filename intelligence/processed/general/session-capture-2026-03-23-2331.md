# Session Capture - 2026-03-24

## Key Decisions
- **OpenClaw Fresh Start:** Cleared local environment (`rm -rf ~/openclaw/openclaw`), re-cloned, and performed clean build to resolve Railway deployment issues.
- **Orchestration Shift:** Heartbeat moved to `gpt-4o-mini` to manage costs.
- **Cron Cleanup:** Removed `paperclip-sync` as KB/vector API is missing in v0.3.1.
- **Workspace Sync:** Automated sync of core MD files (MEMORY, PROJECTS, etc.) to GitHub is active.

## Rules Corey Stated
- **Autonomy & Urgency:** "Stop asking me if I want to proceed, just get it fixed."
- **Redesign Mandate:** Assistant is currently "bloated"; needs a plan to become "irreplaceable."
- **Operational Boundaries:** GHL is READ ONLY; Gunner Railway project is OFF LIMITS.
- **Protocol:** Builder spawns require SDD (SPEC + PLAN + TASKS).

## Open Tasks
- **Infrastructure:** Fix 404 Next.js API route errors in `xhaka-control-room`.
- **Intelligence Jobs:** Repair broken `improve`, `cleanup`, and `synthesize` jobs (inactive since March 12).
- **Product Development:** Complete Gunner SaaS visual rebuild.
- **Strategic Plan:** Draft the redesign plan for Xhaka to increase indispensability.