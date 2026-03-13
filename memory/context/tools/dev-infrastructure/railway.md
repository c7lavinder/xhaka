# Railway

**Category:** Dev Infrastructure
**Status:** 🟢 Active

## Purpose
Cloud hosting platform for all Xhaka and Gunner services. Auto-deploys on GitHub push with watch path filtering.

## Usage in Stack
**Xhaka Project** (`84c0d035`):
- `xhaka` — showcase/control room (Express + HTML)
- `xhaka-intelligence` — intelligence pipeline (Node.js cron jobs)
- `xhaka-control-room` — Next.js mission control dashboard
- `Links and Docs` — URL bookmark service

**Gunner Project** (`f379b683`):
- `gunner-v2` — main app (Express + React)
- `gunner-postgres` — PostgreSQL database
- `xhaka-brain` — Xhaka's memory database

## Configuration
- API Token: Configured ✓
- Docs: https://docs.railway.com

## Notes
- Watch paths configured: xhaka-intelligence only rebuilds on `services/intelligence/**`
- Every Railway push triggers a build email on failure — watch path discipline critical
- Service Groups are UI-only (not API-configurable)

## Last Updated
2026-03-12