# Gunner Roadmap

## Future Features

### Team AI Assistant (OpenClaw-style bot)
*Added: 2026-02-08*

**Concept:** Conversational AI assistant built into Gunner that teams can interact with directly.

**How it differs from existing coaching tool:**
- Coaching tool grades calls after the fact (reactive, one-way)
- Team bot is conversational, proactive, and broader in scope

**What it would do:**
- Answer questions in real-time ("how do I handle this objection?")
- Know the team's playbook, processes, deal criteria — not just call data
- Persistent memory — remembers decisions, evolves with the team
- Multi-domain — can help with deals, processes, objections, onboarding
- Proactive — could alert, remind, follow up

**Value prop for Gunner customers:**
- Built-in team brain that knows their call data + their playbook
- Differentiator vs other call coaching tools
- Helps teams stay aligned as they scale

**Implementation notes:**
- Would need chat UI in Gunner
- Webhooks out (Gunner → bot when message sent)
- API endpoint in (bot → Gunner to post replies)
- Could leverage existing call/grading data as context

---

## Ideas / Backlog

*(add future ideas here)*
