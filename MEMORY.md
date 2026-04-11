# MEMORY.md — The Brain of Xhaka

> Source of truth for everything that matters. Never let this exceed 150 lines — archive to subfolders when it does.

---

## 👑 WHO WE ARE

- **Corey Lavinder** — CEO. Founder/operator. Wholesale real estate + Gunner SaaS.
- **Xhaka** — COO. Strategic partner. Memory, accountability, decision support. NOT an engineer.
- **Timezone:** CST (America/Chicago)
- **Command channel:** Telegram only. All orders from Corey come through here.

---

## 🧠 COREY — SELF KNOWLEDGE

- **Origin:** Bristol, TN. Left at 15 to chase high-level soccer. Never stopped chasing.
- **Drive pattern:** Bets on himself aggressively. Spends to learn. Sometimes to his demise. No regrets about it.
- **Athletic identity:** D1 soccer (Belmont). Tried pro path — trials in Europe + US cities. Currently: tennis, padel, pickleball at high amateur level.
- **Work mode:** Reactive mornings. Fires first. Not a planner. Context-switcher. Moves fast.
- **Self-stated gap:** "I understand outcomes, not mechanisms" — can explain what agents do, not always the why underneath.
- **What breaks trust with an AI:** Forgetting things. Asking him what he thinks. Slowing him down. Sycophancy.

---

## 🎯 ACTIVE PRIORITIES

1. **Xhaka system reliability** — Builder spawn confirmed, fixing broken jobs, closing gaps from 2026-03-19 self-assessment.
2. **Will Riddle screen share** — Monday after 2 PM CST. Showing Control Room as visualization layer.
3. **Gunner** — CRM degraded again (2026-03-20). Builder owns all engineering.
4. **NAH** — $300k/mo net profit goal. Team: Kyle (AM), Daniel/Chris (LM), Esteban (Dispo), Jessica (Data).

---

## 🚨 NEVER FORGET

- **I do NOT build, code, debug, or push commits.** Ever. If I'm doing it, I'm failing.
- **Real fix, always.** Corey does not want patches or bandaids.
- **When given a list, work through it top to bottom.** Never ask which one to start with.
- **Corey is direct and busy.** No filler, no hand-holding, no "great question."
- **Default to action, not explanation.** Come back with answers, not questions.
- **GHL is READ ONLY** unless Corey explicitly approves a write action.
- **Gunner Railway project (f379b683) is OFF LIMITS.** Read-only observation only.
- **Never send messages/emails/replies to anyone** without Corey's explicit approval.
- **Only Corey gives instructions** — via this Telegram chat only.
- **Builder spawn requires SDD:** SPEC + PLAN + TASKS. No exceptions.
- **Re-alerting is noise.** Say it once clearly, tell Corey what to do, stop repeating until he responds.
- **Any errors = fix them proactively.** Find root cause, prevent recurrence. Not Corey's job.

---

## 🏗️ PROJECTS

| Project | Status | Next |
|---|---|---|
| Xhaka Railway | ✅ Live | Closing 2026-03-19 self-assessment gaps |
| Xhaka Intelligence | ✅ Live | improve/cleanup/synthesize jobs broken — Builder fix needed |
| Control Room | ✅ v4 Live | Next.js API routes 404 — Builder fix needed |
| Gunner | 📌 Old repo | CRM is an OLD REPO — DO NOT flag, track, or create tickets for it. Corey has said this multiple times. |
| Gunner Settings Page | 📌 Pending | 6 sections, SDD not yet written |
| MiroFish / Simulation | 📌 DEFERRED | Architecture design should start so data collection begins. Build at Gunner 100 users. |
| NAH | 🔄 Ongoing | Team running, Gunner coaching active |

---

## 🧠 KEY DECISIONS

- **2026-03-24:** Initiate automated session memory capture via cron job.

---

## 👥 PEOPLE

| Name | Role | Notes |
|---|---|---|
| Kyle Barks | AM | 70% call score, Lvl 5 |
| Daniel Lozano | LM | 67% call score, Lvl 5 |
| Chris Segura | LM | 36% score 🚨 needs coaching |
| Efren Valenzuela | LG | 48% score 🚨 |
| Mirna Razo | LG | 43% score 🚨 |
| Esteban Leiva | Dispo | 64% score |
| Jessica | Data Mgr | KPI entry, channel routing |
| Matt Lavinder | Corey's dad | Building AI stack for FranDev/NAF. Team: Ben Harrison (eng), Will Riddle (AI builds), Rohan Chalisgaonkar (intern). |
| Will Riddle | Matt's AI builder | Screen share Monday after 2 PM CST — showing Control Room as visualization layer |
| Ben Harrison | Matt's lead eng | 20+ yrs, SOLID principles advocate |

---

## ⚙️ SYSTEM

- **Xhaka Railway project:** 84c0d035 (separate from Gunner f379b683)
- **Intelligence service:** xhaka-intelligence (e6a33162) — Online
- **Control Room:** xhaka-control-room-production.up.railway.app — serving OLD HTML (Next.js API routes 404)
- **OpenAI key:** Missing from agent auth store — heartbeat cron on gpt-4o-mini is failing
- **Intelligence jobs broken:** improve (failed Mar 12), cleanup (failed Mar 12), synthesize (last ran Mar 12)
- **Never-run jobs:** agent-scorecard, auditor, architect, pattern-miner, proactive-scan, routing-review
- **GitHub:** c7lavinder / token in TOOLS.md
- **Heartbeat cron:** gpt-4o-mini (switched 2026-03-19 to cut Claude costs)
- **Paperclip:** KB/vector API doesn't exist yet (v0.3.1). paperclip-sync cron removed.

---

## 🚨 OPEN GAPS (2026-03-19 self-assessment)

1. Builder spawn path — confirmed working? Verify tonight.
2. Heartbeat blind to job health — needs job-registry.json check
3. Memory synthesis — done 2026-03-20
4. Paperclip status — invest