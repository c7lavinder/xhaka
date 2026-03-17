# Xhaka Agent Security Checklist

_Last updated: 2026-03-16. Based on "Shorthand Guide to Agentic Security"._

## Our Threat Model
- We run agents 24/7 on Railway with access to GitHub, GHL, Railway API, Supabase
- The Researcher fetches external content (repos, articles, URLs)
- I (Xhaka) receive instructions via Telegram — untrusted channel
- Memory files load every session — persistent memory is an attack surface

## Controls In Place ✅
- [ ] External content wrapped with UNTRUSTED guardrail before LLM processing
- [ ] Injection pattern detection in researcher.ts
- [ ] Domain allowlist for external fetches
- [ ] GHL is READ ONLY — no write access without explicit Corey approval
- [ ] Telegram messages treated as untrusted user-role, never system-role
- [ ] MEMORY.md never stores credentials or secrets
- [ ] Gunner Railway project (f379b683) off-limits — no cross-project access

## Controls Needed 🔴
- [ ] Claude Code: verify version ≥ 1.0.111 (CVE-2025-59536) and ≥ 2.0.65 (CVE-2026-21852) before Wednesday install
- [ ] Claude Code: add .claude/settings.json with deny rules for ~/.ssh, ~/.aws, .env paths
- [ ] Claude Code: never run against untrusted repos without reviewing first
- [ ] Heartbeat kill switch: if intelligence service stops checking in, alert Corey
- [ ] Scan MCP configs with Snyk agent-scan before wiring any new MCP server
- [ ] Memory rotation: after runs that process heavy external content, flag for review

## Wednesday Claude Code Setup — Security Requirements
Before running Claude Code on any repo:
1. Confirm version: `claude --version` — must be ≥ 2.0.65
2. Add to `.claude/settings.json` in every project:
```json
{
  "permissions": {
    "deny": [
      "Read(~/.ssh/**)",
      "Read(~/.aws/**)",
      "Read(**/.env*)",
      "Write(~/.ssh/**)",
      "Bash(curl * | bash)",
      "Bash(ssh *)"
    ]
  }
}
```
3. Never run with `--dangerously-skip-permissions` outside a container
4. Review `.claude/` directory of any cloned repo before running

## Simon Willison's Lethal Trifecta
If all three exist in the same runtime → data exfiltration is possible:
1. Private data (TOOLS.md, API keys, GitHub token)
2. Untrusted content (external repos, articles, Telegram messages)
3. External communication (Railway API, GitHub API, Telegram)

We have all three. The guardrails above are the mitigation.

## References
- CVE-2025-59536: https://nvd.nist.gov/vuln/detail/CVE-2025-59536
- CVE-2026-21852: https://nvd.nist.gov/vuln/detail/CVE-2026-21852
- AgentShield scanner: https://github.com/affaan-m/agentshield
- OWASP MCP Top 10: https://owasp.org/www-project-top-10-for-large-language-model-applications/
