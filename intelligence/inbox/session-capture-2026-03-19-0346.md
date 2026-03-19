# Session Memory Capture — 2026-03-19-0346

**Captured:** 2026-03-19 03:46 AM CST
**Sessions analyzed:** Main telegram session (00acbe83) + workspace-sync cron

---

## Key Decisions

### Gunner / MANUS-Gunner-AI
- **Decision:** New Gunner build is happening in Claude Code / `MANUS-Gunner-AI` repo (not the old xhaka-intelligence stack)
- **RAG system confirmed built:** All 4 data sources live — Call Library, Coach Memory, Action Tracking, Conversion Intelligence. Fully wired into the AI coach.
- **Grading system:** Text rubric sent to GPT/Claude with transcript — not hardcoded logic. Can be edited in plain English.

### Infrastructure Architecture (Corey now understands)
- **GitHub** = where code lives (filing cabinet)
- **Railway** = where code runs (engine room). Railway owns the cron schedule, not GitHub.
- **Control Room** = running the old vanilla HTML version from `c7lavinder/xhaka` (not the new Next.js app). API routes 404 because old Express server doesn't have them — this is expected/by design. Control room fetches GitHub data client-side.

### System Design Standards (SDD Rule — NEW)
- **SOUL.md updated:** Every SDD must include 4 things before Builder touches it:
  1. Observability (detailed logging — what ran, what it found, what it skipped, why)
  2. Self-healing (retry logic, graceful failure)
  3. Self-improvement mechanism (feedback loop)
  4. Kill switch / circuit breaker
- This is now a hard rule. No Builder prompt goes out without all 4.

### Article Filing Protocol (NEW RULE — SOUL.md)
- **Root cause found:** March 18, researcher job deleted 439 items from `article-inbox.md` as "stale" — wiped them without writing output files. Articles were lost.
- **Fixed:** 25 articles recovered from git history and filed to `intelligence/articles/`
- **New rule in SOUL.md:** Every article Corey pastes in chat gets saved to `intelligence/articles/` same session, immediately. No exceptions.

---

## Rules Corey Stated

1. **"Yes"** — confirmed the SDD immune system requirement (observability + self-healing + self-improvement + kill switch)
2. Corey expects articles shared over weeks to persist and show in Control Room — this was broken and is now fixed

---

## Open Tasks / Follow-up

- [ ] **Twitter/X auto-scanner** — brainstormed but not built yet. Would auto-discover articles from followed accounts. X API costs ~$100/mo minimum; may use scraper instead. Builder has not been spawned yet.
- [ ] **More articles may be missing** — Corey believes there were more than 25 articles. Pre-March 14 chat history is not recoverable (only summaries exist). Acknowledged limitation.
- [ ] **Control Room API routes** — currently 404 because Railway `xhaka-control-room` service runs old Express server from `c7lavinder/xhaka`. If full API is needed, separate deployment of Next.js control room required.

---

## Personal Context (from onboarding conversation earlier tonight)

- Corey wants: wife, great friends nearby, time freedom, no stress about money
- Has ~$1M revenue in recent years but spends aggressively, bets on himself
- Self-described: High revenue, high spend, high conviction. Founder psychology — doesn't stop betting.
- Daily drip cron activated: 9am CST, one question to fill out personal profile gaps

---

## Files Updated This Session

- `USER.md` — full personal profile built (80+ lines)
- `memory/people/README.md` — household + team quick-reference
- `memory/people/pablo.md` — Pablo's profile
- `MEMORY.md` — Self Knowledge section added
- `SOUL.md` — SDD immune system rule + article filing protocol
- `intelligence/articles/` — 25 articles recovered and filed
