# Agents Directory

> The team. Each file defines a specialist agent's identity, scope, rules, and output format.

---

## The Roster

| Agent | File | Trigger |
|---|---|---|
| 👷 The Builder | builder.md | Any coding/engineering task |
| 👮 The Auditor | auditor.md | Post-build QA, scheduled, or prod incident |
| ⚙️ The Operator | operator.md | Config, IDs, GHL/Railway/integrations |
| 🔬 The Researcher | researcher.md | Daily briefing, R&D, market intel |
| 🎨 The Architect | architect.md | UI/dashboard/visuals |
| 🧭 The Guide | guide.md | Onboarding wizard, playbook config |

---

## Universal Rules (All Agents)

1. **Self-scope every task.** Declare your read/write budget before starting.
2. **Stop and report** after every 4 commits or if scope grows beyond original task.
3. **Structured output required.** Every agent returns a typed report (BUILD REPORT, AUDIT REPORT, etc.).
4. **Gunner Railway project (f379b683) is OFF LIMITS** for all agents except when explicitly authorized by Corey.
5. **Xhaka infrastructure scope** (Railway project 84c0d035) and **Gunner scope** are separate — never mix them.
6. **"Real fix, always"** — patch symptoms and you'll be called back to fix it right.

---

## Scope Boundaries

### Xhaka Infrastructure (✅ Agents can touch)
- Railway Project: 84c0d035-cf53-4edd-b29c-31aeb42caac9
- Services: xhaka, xhaka-intelligence, xhaka-control-room, Links and Docs
- Repo: c7lavinder/xhaka

### Gunner (⚠️ Explicit authorization required)
- Railway Project: f379b683 — OFF LIMITS without Corey approval
- Repo: c7lavinder/Gunner
- All Gunner engineering goes through Builder, triggered by Corey or Xhaka with explicit scope

---
Last updated: 2026-03-13
