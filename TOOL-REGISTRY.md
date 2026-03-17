# Tool Registry — Xhaka Intelligence Co

Every tool in our stack. Researcher monitors these for updates. Control Room surfaces them.

> **Sync rule:** When adding a tool here, also add it to `REGISTRY_GITHUB_REPOS` in  
> `services/intelligence/src/jobs/tool-monitor.ts` (if it has a GitHub repo).

## Active Tools

| Tool | Purpose | GitHub/URL | Monitor | KB File |
|---|---|---|---|---|
| Paperclip | Agent orchestration | paperclipai/paperclip | ✅ | memory/context/technology/paperclip-deep-dive.md |
| OpenClaw | AI agent runtime | openclaw/openclaw | ✅ | memory/context/technology/openclaw.md |
| Railway | Deployment platform | railwayapp/railway-cli | ✅ | memory/context/technology/railway.md |
| Supabase | Database + pgvector | supabase/supabase | ✅ | memory/context/technology/supabase.md |
| GHL | CRM / pipeline | — | ✅ | tools/ghl/knowledge/overview.md |
| Gunner | Call coaching SaaS | c7lavinder/MANUS-Gunner-AI | ✅ | memory/projects/gunner.md |
| BatchDialer | Cold calling | — | ✅ | tools/batchdialer/knowledge/overview.md |
| BatchLeads | SMS campaigns | — | ✅ | tools/batchleads/knowledge/overview.md |
| CallRail | Call tracking | — | ✅ | tools/callrail/knowledge/overview.md |
| Claude Code | AI coding agent | anthropics/claude-code | ✅ | memory/context/technology/claude-code-system-prompt-analysis.md |
| GitNexus | Code intelligence | — | ✅ | memory/context/technology/gitnexus.md |
| Hindsight | Episodic memory | vectorize-io/hindsight-openclaw | ✅ | memory/context/technology/hindsight.md |
| PostHog | Analytics | PostHog/posthog | ✅ | memory/context/technology/posthog.md |
| Sentry | Error tracking | getsentry/sentry | ✅ | memory/context/technology/sentry.md |
| LangSmith | AI observability | langchain-ai/langsmith-sdk | ✅ | memory/context/technology/langsmith.md |

## Monitor Coverage

| Type | Count | How Monitored |
|---|---|---|
| GitHub repos (direct release check) | 9 | `tool-monitor.ts` → `REGISTRY_GITHUB_REPOS` |
| SaaS changelogs (HTML scrape) | 7 | `tool-monitor.ts` → `CHANGELOG_SOURCES` |
| npm package deps | dynamic | Both repo `package.json` scans |

## Scheduled Monitor

- **Job:** `tool-monitor` in `services/intelligence/src/jobs/tool-monitor.ts`
- **Schedule:** Daily at 6:05 AM CST (via `scheduler.ts`)
- **Output:** `data/tool-monitor-results.md` + `intelligence/inbox/tool-monitor-{date}.md`
- **Alert:** Telegram to Corey if any new releases detected

## Adding a New Tool

1. Add a row to the table above
2. If it has a GitHub repo → add to `REGISTRY_GITHUB_REPOS` in `tool-monitor.ts`
3. If it has a changelog URL → add to `CHANGELOG_SOURCES` in `tool-monitor.ts`
4. Create KB file at the path listed in the table (even if empty stub)

---

_Last updated: 2026-03-16_
