# Meeting: AI Tech Team — Matt Lavinder's Group
**Date:** March 19, 2026
**Attendees:** Ben Harrison, Will Riddle, Rohan Chalisgaonkar, Matt Lavinder, Corey Lavinder
**Status:** Complete transcript captured

---

## What This Call Actually Was

**Corey was presenting his system to his dad's team.** He demoed the call grading tool, walked through the architecture, and explained Xhaka. This was not a peer brainstorm — Matt's team is earlier stage and learning from Corey.

---

## Full Detail (timestamped)

**Intro / overwhelm (00:00 - 00:05)** — Rohan is a math intern. Corey flagged the core challenge: Twitter moves fast, hard to stay disciplined. Visual learner — can't confirm AI code is working across thousands of lines.

**Managing complexity (00:03 - 00:14)** — Ben: Lego blocks, single responsibility principle (SOLID). Matt: three-tiered memory, "narrow and deep." Trust broadly adopted software — don't rebuild what already works.

**Semi-assisted automation + RAG (00:18 - 00:21)** — Tried full automation, hit limits. Shifted to: system grades → human edits → human sends. RAG loop: user edits push back into AI, compounding toward full automation over time.

**MiroFish (00:21:56)** — Collect every possible data signal (cabinet colors, house sale speed, every franchise touchpoint) to predict daily events and problems before they happen. Long game. Deferred until foundation is proven.

**Stack (00:27 - 00:29)** — GHL as backend engine. GitHub → Railway → Supabase (Postgres). Clawbot named **Jaca/Jocka**, functions as COO, 7 sub-agents: Builder, Researcher, Auditor, Architect, Librarian, Operator.

**Call grading demo (00:33)** — Showed summaries, coaching tips, objection replies, next steps.

**Dev workflow (00:35)** — VS Code + Claude Chat web app. Talk through issue in Claude → Claude generates prompt → prompt goes to VS Code → push to GitHub.

**Agent-assisted setup (00:37)** — Agents configured most of infrastructure using refined external materials.

**Whisper Flow (00:39)** — Voice dictation → transcribed into chat.

**Supabase via plain English (00:41)** — Clawbot modifies database structure through natural language.

**Co-work / Claude Code (00:41)** — Anthropic browser control automates Railway setup after being shown once.

**Compliance (00:42 - 00:49)** — Will flagged ToS concerns on scraping. Corey: webhooks/APIs only. Matt: SaaS that blocks agents won't survive — will need to replicate internally or add UI layer over GHL. GHL is permanent backbone.

**OpenClaw analogy (00:52:57)** — Matt: LLM = brain in the Mac Mini. OpenClaw = the hands that execute.

**Model split (00:55:38)** — OpenAI for Xhaka (cheaper, personal/business org). Claude Code for building and productivity. Two tools, two jobs.

**Dev loop (00:59:56)** — Fully automated: Architect designs → Builder pushes to GitHub → Auditor checks errors → sends back to Architect → repeat. No user interaction required. Cyclical.

**Jocka repository (01:07:11)** — Made up initial data for Gunner. Now Jocka repo collects real data on failures AND successes. Every new site build pulls from past lessons. This is the compounding data moat in practice.

**Will Riddle: overwhelmed (01:03 - 01:05)** — Feels buried by the master strategy. Wants to "play with it" — get a basic working model before building everything correctly from scratch. Avoid waterfall. Wants something tangible.

**Corey's recommended starting point (01:05:50)** — Step 1: organize the GitHub repo. Step 2: populate it with relevant data (e.g., franchise sales process). Step 3: LLM answers team questions using that repo + general knowledge. Simple, fast, valuable.

**Data storage debate (01:08 - 01:12)** — Ben: blog content / website data traditionally lives in a database, NOT committed to a code repo. Jocka repo mixing code + data is unconventional. For backup/restoration: need middleware to sync everything to a master database (MariaDB in their case). Data lives in DB, code lives in repo — separation of concerns.

---

## Key Revelations (Final)

1. **Jaca = Xhaka.** Same phonetic name, same role (COO), same 7 sub-agent structure. Corey was presenting this system. These are not separate things.

2. **The Jocka repo IS the compounding memory system.** Started with made-up data. Now collects real failures and successes. Every future build gets smarter. This is already happening. It's the MiroFish data layer in embryonic form.

3. **The fully automated dev loop is real and running.** Architect → Builder → Auditor → back to Architect. No user needed in the loop. This is production architecture, not a concept.

4. **Will Riddle is the canary.** When Will says he's overwhelmed and wants to play with a basic model, that's a signal that the system is getting too complex to explain without a visual layer. The Control Room solves this directly.

5. **Data/code separation is a real debt.** Ben flagged it correctly. Storing agent data in GitHub is fine for config/knowledge, but anything that needs backup/restore (call records, grades, team data) must live in Supabase — not GitHub. This is already how Gunner is built, but worth auditing.

6. **Corey's recommended onboarding path is exactly right:** GitHub repo → populate with data → LLM answers questions. Simple, fast, immediately useful. Could be the Gunner onboarding flow for new teams.

7. **Matt's team needs a visual session.** Will asked for it explicitly. If that session happens, the Control Room is the right tool to show them.

---

## Actions
- [ ] **MiroFish:** Design data collection architecture now — start capturing signals even if prediction engine is deferred
- [ ] **Audit data/code separation:** Confirm nothing mission-critical lives only in GitHub (should be in Supabase)
- [ ] **Control Room as the visual layer:** If Matt's team gets a session, this is what Corey shows them
- [ ] **Gunner onboarding:** Corey's "GitHub → data → LLM answers" is a clean onboarding model — apply to new Gunner customers
- [ ] **RAG feedback loop:** User grade overrides feed back into model — add to Builder backlog
- [ ] **Optimize for Whisper Flow:** Corey dictates via voice — expect clipped, rough messages, read them as spoken not typed
