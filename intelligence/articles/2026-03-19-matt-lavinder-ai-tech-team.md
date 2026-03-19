# Meeting: AI Tech Team — Matt Lavinder's Group
**Date:** March 19, 2026
**Attendees:** Ben Harrison, Will Riddle, Rohan Chalisgaonkar, Matt Lavinder, Corey Lavinder

---

## What This Call Actually Was

**Corey was presenting his system to his dad's team.** He demoed the call grading tool, walked through the architecture, and explained Xhaka. This was not a peer brainstorm — it was a show-and-tell. Matt's team is earlier stage and learning from Corey.

---

## Full Detail (timestamped)

**Rohan intro (00:00)** — Intern from King, math background, brought in for algorithms + AI education.

**Corey on AI overwhelm (00:01:57)** — Hard to stay disciplined when Twitter moves fast. Finishing is the hardest part. As a visual learner, can't easily confirm AI code is working across thousands of lines.

**Ben on complexity (00:03:14)** — "Drinking from the fire hose." Strategy: Lego blocks. Single responsibility. Even after 20 years he prints source code and reads it with a notepad.

**Clawbot memory limitation (00:08:20)** — Prioritizes recent conversations, forgets old context. Matt's fix: three-tiered memory segmentation — "narrow and deep."

**Ben: single responsibility principle (00:12:07)** — SOLID applied to agents. One agent, one job. More reliable, easier to trust.

**Ben: trust broadly adopted software (00:14:37)** — Wide adoption = more tested. Don't rebuild what already works.

**Semi-assisted automation (00:18:04)** — Corey tried full automation, hit limits, shifted to: system grades → human edits → human sends. RAG layer pushes edits back in. Goal: compound toward full automation.

**MiroFish / Myrrofish (00:21:56)** — Corey's concept: collect massive proprietary business data to predict daily events and problems before they happen. Example data points for franchises: cabinet colors, house sale speed. Every possible signal. This is the prediction/simulation engine.

**Technical stack (00:27:42 - 00:29:57):**
- Backend engine: **Go High Level**
- Code: **GitHub → Railway → Supabase** (full Postgres)
- Clawbot name: **Jaca** (COO function)
- Sub-agents: Builder, Researcher, Auditor, Architect, Librarian, Operator (7 total)

**Call grading demo (00:33:07)** — Showed the tool: summaries, coaching tips, objection replies, next steps.

**Dev workflow (00:35:03)** — VS Code + Claude Chat (web app). Talk through issues in Claude → Claude generates prompts → prompts go to VS Code → push to GitHub.

**Agent-assisted setup (00:37:42)** — Agents configured most of the infrastructure. Corey didn't manually figure it out — agents did it using refined external materials.

**Whisper Flow (00:39:01)** — Voice dictation tool. Dictates issues → transcribed into chat.

**Testing method (00:40:42)** — Primarily team feedback. Local testing is hard.

**Supabase via plain English (00:41:53)** — Clawbot can modify database structure through natural language API calls.

**Co-work / Claude Code (00:41:53)** — Corey uses Anthropic's browser control (Claude Code) to automate tasks like setting Railway env vars after showing it once.

**Compliance: webhooks over scraping (00:42:56 - 00:45:01)** — Will flagged ToS concerns on screen scraping. Corey confirmed: they use webhooks and APIs only, not direct scraping. Matt: if SaaS products block agents, they won't last — will need to replicate internally or add a UI layer over GHL.

**GHL as permanent backbone (00:49:15)** — GHL must be the backend due to functionality and ongoing investment. Not going anywhere.

**OpenClaw analogy (00:52:57)** — Matt described it: LLM = brain living in the Mac Mini. OpenClaw = the hands that take information and execute tasks.

**Corey on model choice (00:55:38)** — Clawbot primarily uses OpenAI (cheaper) for personal/business org. Anthropic Claude Code is for productivity and building. Two separate use cases, two different tools.

---

## Key Revelations (Updated)

1. **Jaca = Xhaka.** The Clawbot is named Jaca. It functions as COO. It has 7 sub-agents with identical roles to our AGENTS.md. Corey was presenting *this system* to his dad's team. Same name, same architecture, same purpose.

2. **MiroFish is now fully defined.** It's a data collection + prediction layer — gather every possible signal from a business (franchise or NAH) and predict what's going to happen before it does. Cabinet colors, deal velocity, every touchpoint. This is the long game. MEMORY.md correctly flagged it as deferred until Gunner hits 100 users.

3. **Corey was the expert in the room.** Matt's team is learning from Corey, not the other way around. Rohan is an intern. Ben has engineering depth but not agent-building experience. Corey is ahead.

4. **Two Claude products, two jobs:** OpenAI = Xhaka's brain (cheaper, good enough for orchestration). Claude Code = building tool (Anthropic, used in VS Code via web app). This is the actual split.

5. **The stack is locked:** GHL → GitHub → Railway → Supabase. Not changing. Any future build happens within this constraint.

6. **Whisper Flow** — Corey dictates into chat using voice. This is how he operates. Xhaka should be optimized for short, voice-transcribed inputs that may be rough or clipped.

7. **Will Riddle is the skeptic/visual thinker.** Asked for a session to map out all the connections. Could be a useful forcing function for documentation.

---

## Actions
- [ ] **MiroFish:** Flag for after Gunner 100-user milestone — data collection architecture needs to be designed now so it's ready
- [ ] **Optimize Xhaka responses for Whisper Flow input** — assume clipped, voice-transcribed messages sometimes
- [ ] **Will Riddle session:** If Matt's team wants a visual map, the Control Room is the answer — worth offering
- [ ] **RAG feedback loop:** Add to Gunner Builder backlog — user grade overrides feed back into model
