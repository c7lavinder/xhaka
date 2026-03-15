# Session Memory Capture
**Date:** 2026-03-14 (Saturday)
**Captured:** 2026-03-14-1947 CST
**Source:** Main Telegram session (c1fbe43e) + recent cron sessions

---

## KEY DECISIONS

### Three Priorities Stated by Corey (~14:10 CDT):
1. **Audit + GitHub org** - Review everything built for gaps/failure risks, ensure organized in GitHub
2. **Control Room overhaul** - Visual of everything needs to be rebuilt/updated
3. **Cost reduction + new models** - Make Xhaka cheaper, install and confirm new models

### Cost Optimization:
- Corey ran out of Gemini free tier credits (as of March 14)
- Anthropic + Gemini API keys added to Railway (xhaka-intelligence service, NOT regular xhaka)
- Recommendation: switch main chat to /model anthropic/claude-haiku-3-5 (~75% cheaper than Sonnet)
- Evaluating OpenAI (GPT-4o-mini, GPT-4o) as alternatives
- GPT-4o-mini: $0.15/M input (cheapest for background jobs)
- Smart Router being set up in xhaka-intelligence to route to cheapest appropriate model

### Scribe Should Be Event-Driven:
- Corey asked why session-capture scribe only runs nightly
- Decision: Scribe should trigger on (1) session close after 60min idle, (2) major milestone completion
- Builder tasked to implement event-driven Scribe in queue system

### People/CRM Organization:
- Corey noticed contacts in Xhaka not organized by business - just flat list
- Corey clarified: NOT worried about current team org
- Cares about STRATEGIC RELATIONSHIPS - investors, capital, partners, local connections for growth
- No specific names yet, but this is a pending feature need

---

## OPEN TASKS

- Audit codebase for gaps + organize GitHub [Subagent spawned, status TBD]
- Control Room visual overhaul [Pending - Architect]
- Cost optimizer / model routing live [In progress - keys added, deploy pending]
- Confirm new models working in Railway [Blocked - Gemini billing, OpenAI being evaluated]
- Event-driven Scribe (trigger on session close) [Builder tasked]
- CRM contacts organized by business/relationship type [Future feature]

---

## CRON JOB STATUS (as of 19:47 CST)

4 jobs still failing (self-recovering):
- organize: failed 2026-03-14T04:00, next attempt ~11 PM CST tonight
- tool-monitor: failed 2026-03-13T11:05
- improve: failed 2026-03-12T04:24
- cleanup: failed 2026-03-12T04:24

workspace-sync: HEALTHY (8/8 files current, running every 30min)

---

## INTELLIGENCE ARTICLES REVIEWED

4 AI/tech articles reviewed today (Corey curating content for strategy/social):
1. RL Training Environments - hidden industry behind frontier models, bounty-based crowdsourcing
2. Claude Skills + Skill Graphs - shared context files as connective tissue across skills
3. Startup persistence story - bootstrapped to $100M, Steve Jobs cold email moment
4. Startup prompt frameworks - idea validator, niche finder (Corey noted startup-building is his hardest area)

---

## INFRA STATUS

- xhaka-intelligence: Anthropic + Gemini keys being added, redeploying
- xhaka-control-room: needs full overhaul (Corey's priority)
- xhaka: static web (teams.html, control-room.html) - unchanged
- API keys confirmed: belong in xhaka-intelligence ONLY

---

*Captured by: session-memory-capture cron | 2026-03-14-1947*
