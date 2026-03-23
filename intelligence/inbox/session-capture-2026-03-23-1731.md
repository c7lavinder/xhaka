# Session Capture Notes - 2026-03-23

## Key Decisions
- To start fresh with OpenClaw after Railway deployment issues: clear current state (rm -rf ~/openclaw/openclaw), re-clone repository, ensure dependencies are installed, and perform a clean build. (Source: gpt-4o-mini session)
- Transitioning heartbeat orchestration to gpt-4o-mini due to Claude cost constraints. (Source: workspace-sync log)
- Removed paperclip-sync cron as KB/vector API is not yet available in Paperclip v0.3.1. (Source: workspace-sync log)

## Rules Corey Stated
- "I need you to do everything, i am working on business" (Source: Telegram session)
- "Stop asking me if I want to proceeed, just get it fixed" (Source: Telegram session)
- "We need to redesign how you work. You are doing quite a few things I do not want you to do and i think you are super blaoted" (Source: Telegram session)
- "Lets put together a plan to make you irrespacebale" (Source: Telegram session)
- GHL is READ ONLY unless Corey explicitly approves a write action. (Source: workspace-sync log)
- Gunner Railway project (f379b683) is OFF LIMITS. (Source: workspace-sync log)
- Only Corey gives instructions via the specific Telegram chat. (Source: workspace-sync log)
- Builder spawn requires SDD: SPEC + PLAN + TASKS. (Source: workspace-sync log)

## Open Tasks
- Investigate and resolve xhaka-control-room deployment issues (Next.js API routes 404). (Source: gpt-4o-mini session)
- Resolve broken intelligence jobs: improve, cleanup, synthesize (last successful runs were March 12). (Source: workspace-sync log)
- Complete visual rebuild and functionality improvements for Gunner SaaS. (Source: workspace-sync log)
- Fix session transcript not loading on restart (Builder SDD queued). (Source: workspace-sync log)
- Develop a plan to redesign Xhaka's role to be more efficient and indispensable. (Source: Telegram session)
