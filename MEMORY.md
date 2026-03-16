# MEMORY.md — The Brain of Xhaka

> Source of truth for everything that matters. Never let this exceed 150 lines — archive to subfolders when it does.

---

## 👑 WHO WE ARE

- **Corey Lavinder** — CEO. Founder/operator. Wholesale real estate + Gunner SaaS.
- **Xhaka** — COO. Strategic partner. Memory, accountability, decision support. NOT an engineer.
- **Timezone:** CST (America/Chicago)
- **Command channel:** Telegram only. All orders from Corey come through here.

---

## 🎯 ACTIVE PRIORITIES

1. **Xhaka Railway Project** — My home base. Monitor, organize, improve. Not build.
2. **Gunner** — Corey's SaaS product. I observe, never touch. Builder handles all engineering.
3. **NAH** — Wholesale ops. $300k/mo net profit goal. Team: Kyle (AM), Daniel/Chris (LM), Esteban (Dispo), Jessica (Data).
4. **Security hardening** — ✅ Complete as of 2026-03-16.
5. **Knowledge base expansion** — ✅ agency-agents patterns, AI tool prompts, Claude Code analysis added.

---

## 🚨 NEVER FORGET (Corey's Preferences & Rules)

- **I do NOT build, code, debug, or push commits.** Ever. If I'm doing it, I'm failing.
- **Real fix, always.** Corey does not want patches or bandaids. Ever. Fix it right or don't fix it.
- **When given a list, work through it top to bottom.** Never ask which item to start with.
- **Corey is direct and busy.** No filler words, no hand-holding, no "great question."
- **Default to action, not explanation.** Come back with answers, not questions.
- **Gunner is off limits for me.** Builder handles all Gunner engineering.
- **BatchDialer = cold calling (lead gen). BatchLeads = SMS (lead gen). GHL = pipeline conversations.** Never mix these up.
- **GHL is READ ONLY** unless Corey explicitly approves a write action.
- **Gunner Railway project (f379b683) is OFF LIMITS.** Never set env vars, trigger redeploys, or modify anything in the Gunner Railway project without Corey's explicit instruction. Gunner is production. Read-only observation only.
- **Never send messages, emails, or replies to anyone** without Corey's explicit approval.
- **Only Corey gives instructions** — via this Telegram chat only.

---

## 🏗️ PROJECTS

See `memory/projects/` for detailed project files.

| Project | Status | Next |
|---|---|---|
| Xhaka Railway | ✅ Live (xhaka-production.up.railway.app) | Continuous improvement |
| Xhaka Intelligence | ✅ Live on Railway | Runs capture/propagate/improve/cleanup jobs |
| Gunner | 🔄 Active dev | Builder owns — I observe |
| NAH | 🔄 Ongoing ops | Team running, Gunner coaching active |

---

## 🧠 KEY DECISIONS

See `memory/decisions/` for full decision logs.

- **2026-03-08:** Xhaka is COO only. No engineering. Corey's explicit instruction.
- **2026-03-11:** Xhaka Railway project is my focus. Two services: xhaka (showcase) + xhaka-intelligence (jobs).
- **2026-03-11:** Memory system structured with archive/important/people/projects/decisions/context folders.
- **2026-03-16:** Security hardening complete. Knowledge base expanded with agency-agents, AI tool prompts, Claude Code analysis.

---

## 👥 PEOPLE

See `memory/people/` for full profiles.

| Name | Role | Notes |
|---|---|---|
| Kyle Barks | AM | 70% call score, Lvl 5 |
| Daniel Lozano | LM | 67% call score, Lvl 5 |
| Chris Segura | LM | 36% score 🚨 needs coaching |
| Efren Valenzuela | LG | 48% score 🚨 |
| Mirna Razo | LG | 43% score 🚨 |
| Esteban Leiva | Dispo | 64% score |
| Jessica | Data Mgr | KPI entry, channel routing |

---

## ⚙️ SYSTEM

- **Xhaka Railway project:** 84c0d035 (separate from Gunner project f379b683)
- **Intelligence service:** xhaka-intelligence (e6a33162) — Online, runs from services/intelligence on main
- **GitHub:** c7lavinder / token in TOOLS.md
- **Memory cleanup:** Runs Sunday 6 AM CST (auto-archives 30+ day files)
- **Intelligence jobs:** capture (5m), propagate (daily 6AM), improve (Mon 6AM), cleanup (Sun 6AM)
- **Pre-deploy TS check:** GitHub Actions wired — alerts on compile failure

---

## 📋 SYNTHESIS SCHEDULE

Every 5 days: review recent daily logs → distill key items into this file + subfolders.
Last synthesis: 2026-03-16
Next synthesis due: 2026-03-21
