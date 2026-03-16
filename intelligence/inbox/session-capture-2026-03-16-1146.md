# Session Memory Capture
**Timestamp:** 2026-03-16-1146 (CST)
**Captured by:** Xhaka memory-scribe cron

---

## Key Decisions

### Paperclip Architecture Decision (2026-03-16 ~11:45 AM)
- **Decision:** Delete the Railway Paperclip Docker service — deployed wrong (tried to pull private ghcr.io image that does not exist).
- **Correct model:** Paperclip is a CLI orchestrator, not a Railway container. Right pattern: polling crons every 10 min per agent, all communication through Paperclip issues.
- **Rule established:** "If it isn't in Paperclip, it doesn't exist" — every agent task gets a Paperclip issue with commit hash verification before marking done.
- **Xhaka workflow change:** Corey messages Telegram -> Xhaka converts to Paperclip issue before any Builder is spawned.
- Architecture doc saved to GitHub + pending-steps updated.

### Supabase Separation Decision (2026-03-16 ~11:33 AM)
- **Decision:** Gunner and Xhaka must have SEPARATE Supabase projects. Old "Gunner V 1.5" project is Gunner ONLY — never run Xhaka SQL there.
- **New Xhaka Supabase project:** xhaka-intelligence at https://hlxmhfxweybxhzmzhwkm.supabase.co
- **Credentials saved to TOOLS.md:**
  - URL: https://hlxmhfxweybxhzmzhwkm.supabase.co
  - Service key: sb_secret_ZeO8kVlQQ_fX5p22FAjvyQ__hg94B1B
  - DB password: maZL2Vbum00YRczK
- pgvector SQL ran in new project (success).
- Railway env vars SUPABASE_URL + SUPABASE_SERVICE_KEY must be manually set by Corey (Railway API write permissions issue with current token).

### Pre-Deploy TypeScript CI Approved (2026-03-16 ~09:50 AM)
- **Decision:** Corey approved spawning three proactive fixes to prevent frustrations before they happen.
- Fix 1: GitHub Actions pre-deploy TypeScript check on intelligence services.
- Fix 2: Morning brief reformat to signal-only (max 15 lines).
- Fix 3: Memory synthesis + pending steps reminder.
- Deploy recovered after two Builder TypeScript errors (librarian.ts .size hallucination + hindsight-sync.ts missing await on markJobStart).

---

## Rules Corey Stated

1. **Automatic memory capture is required** — "That needs to be automatic. I thought we had created that?" (2026-03-13). Memory logging must be autonomous.
2. **Do not babysit agents** — "Why are you tightening scope and pushing? Can you not create an agent that does that?" (2026-03-13). Create agents for recurring tasks.
3. **Fix frustrations before they happen** — "We need to fix those possible frustrations before they happen" (2026-03-16 04:49 AM).
4. **Gunner and Xhaka are separate** — separate Railway projects, separate Supabase databases, no crossover.

---

## Open Tasks

### IMMEDIATE — Corey must do manually
- [ ] Set Railway env vars on xhaka-intelligence: SUPABASE_URL + SUPABASE_SERVICE_KEY (values in TOOLS.md)
- [ ] Delete broken Paperclip Railway service (Settings -> Delete service)
- [ ] Send full Paperclip article URL (Corey shared excerpt only; Xhaka asked for full link)
- [ ] Set Railway xhaka-control-room source -> repo: c7lavinder/xhaka, root dir (pending)

### IN PROGRESS (Agents running)
- Pre-deploy TypeScript GitHub Actions check (builder subagent completing)
- Paperclip architecture implementation (proper CLI polling model)
- Morning brief signal-only format

### PENDING — System
- kb-indexer runs tonight 2 AM to embed knowledge files into new Supabase vector DB
- Librarian quality audit agent active

---

## System Status (as of 11:46 AM CST)
- xhaka-intelligence: DEPLOYED (SUCCESS commit 5e236edc)
- xhaka-control-room: unclear (being reconfigured)
- Supabase xhaka-intelligence: pgvector initialized, awaiting Railway env var update
- Gunner V1.5 Supabase: unchanged, Gunner only
- GitHub Actions CI: pre-deploy tsc check deploying
