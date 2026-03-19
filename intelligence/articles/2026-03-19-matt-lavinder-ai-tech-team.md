# Meeting: AI Tech Team — Matt Lavinder's Group
**Date:** March 19, 2026
**Attendees:** Ben Harrison, Will Riddle, Rohan Chalisgaonkar, Matt Lavinder, Corey Lavinder
**Status:** Complete — all 4 sections captured

---

## What This Call Actually Was

Corey was presenting his system to his dad's team. He demoed the call grading tool, walked through the architecture, explained Xhaka. Matt's team is earlier stage and learning from Corey.

---

## Full Transcript Detail

### Part 1: Foundations (00:00 - 00:21)
- Rohan intro (math intern). Corey on AI overwhelm — hard to stay disciplined, visual learner.
- Ben: Lego blocks, single responsibility (SOLID). Matt: three-tiered memory, "narrow and deep."
- Semi-assisted automation: system grades → human edits → human sends. RAG loop feeds edits back in.

### Part 2: Architecture (00:21 - 00:55)
- **MiroFish:** Collect every signal (cabinet colors, house sale speed) → predict daily problems before they happen. Long game.
- **Stack:** GHL backend. GitHub → Railway → Supabase. Clawbot = Jaca/Jocka (COO). 7 sub-agents: Builder, Researcher, Auditor, Architect, Librarian, Operator.
- **Call grading demo:** Summaries, coaching tips, objection replies, next steps.
- **Dev workflow:** VS Code + Claude Chat web app. Talk through → Claude generates prompt → VS Code codes → push to GitHub.
- **Compliance:** Webhooks/APIs only. GHL is permanent backbone. Matt: SaaS that blocks agents won't survive.
- **OpenClaw analogy:** LLM = brain in Mac Mini. OpenClaw = the hands.
- **Model split:** OpenAI (cheaper) for Xhaka/orchestration. Claude Code for building. Two jobs, two tools.

### Part 3: Dev Loop & Data (00:58 - 01:12)
- **Fully automated dev loop:** Architect → Builder → Auditor → back to Architect. No user needed. Cyclical.
- **Jocka repo:** Started with made-up data. Now collects real failures + successes. Every new build pulls from past lessons.
- **Will Riddle: overwhelmed** — wants to "play with it" first, not build everything from scratch. Avoid waterfall.
- **Corey's onboarding path:** Organize GitHub repo → populate with data → LLM answers team questions. Simple, fast, valuable.
- **Ben: data/code separation** — website data belongs in a database, not a code repo. Need middleware to sync to master DB for backup.

### Part 4: Next Steps & Infrastructure (01:12 - 01:36)
- **FranDev focus:** Matt wants tangible results. FranDev has no data risk — good place to start learning.
- **Will on task completion:** "Done" isn't enough — need detail on what completed, because completion informs ongoing strategy.
- **Paperclip:** Corey recommended it to Matt's team for agent visualization — shows what sub-agents are working on and how they connect. Clawbot can set it up and keep it updated.
- **Master Suite integration:** Franchise apps sitting on top of GHL = sufficient for now. Full integration is a later-stage problem. Ben: Docker containers + Nginx reverse proxy already handle multi-app architecture.
- **Claude Code value:** Write code fast for new features. E.g., replace notes field with full activity tracking — one prompt, full page update.
- **Ben on workflow:** Separate repos for newiganhouses.com and franchise site. Branch-based dev for bigger orgs — PR before merge, quality control.
- **Reporting:** Looker Studio is painful to manage. Need integrated reporting tool in Master Suite. Coaches need it to hold people accountable.
- **Cost management:** Mac Mini + web app instead of API tokens = significant savings. Claude API costs more per day than GPT-4o-mini. Use the right model for each job.
- **Ghost on the computer:** For software without APIs, Clawbot acts as admin user on the monitor — simulated human action. CLI preferred when available (faster, more reliable than browser).
- **Future architecture:** Move agents away from Mac Mini. Agents live in an "agents" folder in the repo, deployable online. Already works headless — no monitor required.
- **Monday session:** Will Riddle + Corey, screen share, Monday after 2 PM. Corey will use Claude Chat + Claude Code in VS Code. Start with "vibe coding" to build a plan, then prompt to build the foundation.

---

## Agreed Next Steps
- [ ] **Will:** Review Client Tether ToS — exactly how is automated API access worded?
- [ ] **Will → Corey:** Give admin access to Client Tether to check GHL functionality
- [ ] **Corey:** Create GHL build plan for franchise sales using the Gunner app model
- [ ] **Monday 2 PM+:** Screen share session — Will watches Corey's dev process live

---

## Key Insights (Final)

1. **Jaca = Xhaka.** Corey was presenting this system. Same name, same COO role, same 7 sub-agents.

2. **Paperclip is validated.** Corey recommended it to Matt's team for exactly the reason we use it — agent visualization. We should have it working properly.

3. **The compounding data loop is already running.** Jocka repo collects failures + successes. Every build gets smarter. This IS MiroFish in its earliest form.

4. **Cost discipline is real.** Claude API >> GPT-4o-mini for orchestration tasks. The heartbeat switch we made today is exactly right. Keep pressure on model costs — use cheapest model that does the job.

5. **Will Riddle is the canary.** "Done isn't enough — give me detail." And "I'm overwhelmed, I want to play with it." Both signals: visualization and completion reporting are gaps. Control Room + better cron delivery addresses both.

6. **The ghost-on-computer pattern + CLI preference** is how OpenClaw already works. This confirms the architecture is sound.

7. **Future = agentless hardware.** Agents in a repo folder, deployed online, headless. This is the Railway deployment model we already use. Directionally correct.

8. **Monday is a commitment.** Corey has a 2+ hour screen share with Will Riddle scheduled for Monday after 2 PM. Calendar this.

---

## What This Means for Xhaka

- Paperclip should be working (we just confirmed it's a ghost cron — need to fix or replace)
- Completion reporting on crons needs more detail (Will's exact complaint)  
- Control Room is the visual layer for anyone who needs to understand the system
- MiroFish data collection architecture should be designed now, even if the prediction engine waits
- Monday PM: Corey is in a session — don't interrupt
