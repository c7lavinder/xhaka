# Shorthand Guide to Agentic Security

**Source:** Pasted  
**Published:** 2026-03-16  
**Relevance Score:** 9/10  
**Tags:** security, prompt-injection, claude-code, CVE, MCP, agent-security

## Summary
Lethal trifecta: private data + untrusted content + external comms. CVE-2025-59536 + CVE-2026-21852 (Claude Code) — prompt injection → shell execution. ToxicSkills: 36% injection rate. MCP Top 10 vulnerabilities.

## Key Insights
- Attack vectors: Telegram/WhatsApp injection, PDF attachments, GitHub PR poisoning
- Memory poisoning: malicious content in agent memory files corrupts future sessions
- Least agency principle: agents should have minimum permissions needed
- Kill switches mandatory for any agent with external comms access
- Sandboxing: iptables-based network restrictions per agent process

## Why It Matters
Xhaka has Telegram access + GitHub write access + Railway API. All three are attack surfaces. The CVEs are real and patched in newer Claude Code versions — verify Builder is current.
