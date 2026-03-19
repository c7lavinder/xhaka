# Sparkwave — Inter-Agent Communication and Task Orchestration in Paperclip

**Source:** Pasted (Sparkwave)  
**Published:** 2026-03-16  
**Relevance Score:** 10/10  
**Tags:** paperclip, agent-orchestration, inter-agent-communication, telegram-integration

## Summary
Paperclip uses GitHub Issues as the coordination layer between agents. Polling loop model. Telegram → Paperclip conversion. Direct blueprint for Xhaka's multi-agent setup.

## Key Insights
- Issues as coordination layer: agents create/update/close issues as work units
- Polling loop: agents check for assigned issues on a schedule
- Telegram → Paperclip: inbound messages convert to trackable work items
- HIGH PRIORITY — direct blueprint for our setup

## Why It Matters
This is the architecture pattern for how Xhaka should coordinate Builder, Researcher, Auditor, and Operator agents via structured work items rather than ad-hoc spawning.
