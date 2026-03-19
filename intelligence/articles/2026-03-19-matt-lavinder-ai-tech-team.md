# Meeting: AI Tech Team — Matt Lavinder's Group
**Date:** March 19, 2026
**Attendees:** Ben Harrison, Will Riddle, Rohan Chalisgaonkar, Matt Lavinder, Corey Lavinder

---

## Raw Summary

FranDev project and semi-assisted automation were prioritized for revenue generation and improved coaching, with extensive discussion regarding AI agent architecture and the necessity of data integration.

---

## Key Topics

### Agent Strategy & Code Management
- Introduced an intern to assist with AI algorithms
- Challenge: managing complex AI code without visual confirmation
- Strategy: break into small pieces, apply **single responsibility principle** — different agents for different tasks

### FranDev Automation & Revenue Focus
- Immediate focus: revenue via FranDev acquisitions + improving coaching process
- Starting point: FranDev agent use case
- Shifted to **semi-assisted automation** — RAG layer where user edits push back into AI to improve it over time

### Technical Architecture & Data Integration
- Compliance concerns: automated access to proprietary software flagged as risky
- Favoring **webhooks and APIs** over direct scraping/automation
- Their system (Clawbot): 7 generic sub-agents + three-tiered memory system to prevent context confusion
- Primary data goal: collect massive proprietary business data to improve predictions

---

## Key Insights

1. **They are building the same thing Corey is** — multi-agent orchestration with memory and specialization. Different use case (FranDev/franchising) but identical architecture philosophy.
2. **Semi-assisted automation is smarter than full automation** — letting humans edit outputs and feeding those edits back into the AI is a compounding loop. Gunner could benefit from this pattern (user corrects a call grade → that correction trains future grades).
3. **Compliance posture is right** — webhooks/APIs over automated scraping. Same rule applies to NAH/Gunner integrations.
4. **Three-tiered memory resonates** — matches Xhaka architecture. Context confusion is a real problem at scale and they've solved it the same way.
5. **FranDev as the revenue wedge** — using a specific acquisition use case to prove ROI before expanding. Smart sequencing — same approach Corey should use with Gunner.

---

## Actions / Follow-Up
- [ ] Understand FranDev use case — what does acquisition look like in their world?
- [ ] Consider RAG feedback loop for Gunner (user corrections improving future call grades)
- [ ] Matt's team is architecturally parallel — potential knowledge share worth exploring
