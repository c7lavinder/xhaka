# Meeting: AI Tech Team — Matt Lavinder's Group
**Date:** March 19, 2026
**Attendees:** Ben Harrison, Will Riddle, Rohan Chalisgaonkar, Matt Lavinder, Corey Lavinder

---

## Full Detail (timestamped)

**Rohan intro (00:00)** — Intern from King, strong math background, brought in for algorithms + AI education.

**Corey on AI overwhelm (00:01:57)** — Twitter moves fast, makes it hard to stay disciplined on one project. Finishing is the hard part. Thousands of lines of code with no visual confirmation it's working — especially hard as a visual learner.

**Ben on complexity (00:03:14)** — "Drinking from the fire hose." Fix: break software into Lego blocks. Even after 20 years, his personal method is printing source code, highlighting it, reading with a separate notepad.

**Corey on trusting AI code (00:05:35)** — Often has to trust it because he can't fully review it. Most progress has come from external resources: YouTube, GitHub repos, well-respected articles. Uses these to train Clawbot — pulls important info, updates repo and database.

**Clawbot development (00:06:54)** — Corey has Clawbot analyze trending GitHub repos daily to keep learning. Current limitation: can't memorize everything, prioritizes recent conversations over older context.

**Matt on memory structure (00:09:28)** — Three-tiered memory system to segment context and prevent agent confusion. "Narrow and deep" — segmentation prevents the agent from drowning in a mass of context.

**Ben on single responsibility (00:12:07)** — SOLID principles applied to agents: one agent, one job. More reliable, easier to debug, easier to trust.

**Ben on trusting software (00:14:37)** — Use broadly adopted tools (Auntu Linux, WordPress equivalents). Wide adoption = more tested = more reliable. Don't build what already exists and works.

**Corey on semi-assisted automation (00:18:04)** — Started trying to fully automate. Hit Clawbot limitations. Shifted to: system grades calls and suggests next steps → human reviews and edits → human sends. Semi-assisted.

**RAG feedback loop (00:20:50)** — User edits get pushed back into the AI. Each correction makes it smarter. Goal: compound toward full automation over time. Not there yet — building the data layer first.

**Matt on revenue focus (00:24:56)** — Short-term: generate revenue from FranDev acquisitions and improve coaching. Starting with FranDev agent use case because it's simpler. Proving ROI before expanding.

---

## Key Insights

1. **Corey is in this group.** He's not just listening — he's building Clawbot alongside Matt's team. Same architecture, different domain. This is a peer group, not a client call.

2. **The RAG feedback loop is the most important idea here.** Semi-assisted → corrections feed back in → model improves → automation increases over time. This is exactly what Gunner needs. A manager overrides a call grade → that override trains the next grade. Proprietary data moat compounds with every human edit.

3. **Corey's core constraint is visual confirmation.** He can't see if AI code is working. This isn't a knowledge gap — it's a workflow gap. Better observability (logs, dashboards, health checks) directly addresses this. Xhaka's Control Room is the right answer.

4. **Clawbot has a memory problem Xhaka has already solved.** Corey's Clawbot prioritizes recent context over old. Xhaka's tiered memory system (MEMORY.md + daily logs + project files) is the architecture fix. Matt described the same solution.

5. **Single responsibility principle is already embedded in AGENTS.md.** Builder, Auditor, Researcher, Operator — all single-purpose. This validates the org chart design.

6. **The daily GitHub repo analysis Corey runs on Clawbot** is the same thing as Xhaka's intelligence jobs (capture, propagate, researcher). Same instinct. Corey is solving this problem from multiple directions simultaneously.

7. **FranDev is Matt's revenue wedge — not Corey's.** Corey's equivalent is Gunner + NAH. Don't conflate the two businesses.

---

## Actions / Follow-Up
- [ ] **Apply RAG feedback loop to Gunner** — when a manager overrides a call grade, capture that override and feed it back. Add to Builder backlog.
- [ ] **Show Corey the Control Room as the visual confirmation layer** — directly addresses his stated pain point.
- [ ] **Understand Clawbot vs Xhaka overlap** — are these separate systems or converging?
- [ ] **Ben Harrison is worth knowing** — 20+ years engineering, SOLID principles mindset, practical. Could be a resource.
