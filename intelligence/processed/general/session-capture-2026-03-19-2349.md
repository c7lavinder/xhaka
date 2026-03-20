# Session Memory Capture — 2026-03-19-2349

**Captured:** 2026-03-20 04:49 UTC (2026-03-19 11:49 PM CST)
**Sessions reviewed:** 3 most recent (main telegram session + cron sessions)

---

## 🔴 CRITICAL OPEN ISSUES

### 1. xhaka-control-room Deploy Loop (ACTIVE — 14+ hours)
- **Status:** STILL LOOPING as of 11:49 PM CST — 14 consecutive heartbeats, ~6 hours
- **Root cause identified:** workspace-sync pushes to `c7lavinder/xhaka` repo every 30 min → Railway auto-deploy triggers on xhaka-control-room on every push
- **Fix required (Corey action):** Railway dashboard → xhaka-control-room → Settings → disable auto-deploy (30 seconds, no Builder needed)
- **Side effect:** All `/api/*` routes on control room return 404 — live data panels broken, serving stale cached UI
- **control-room-sync cron:** Already disabled by Xhaka (not root cause, but was also a problem)

### 2. xhaka-intelligence Jobs Failing
- **Jobs down:** `improve`, `cleanup`, `researcher` — failing for 2+ cycles
- **Status:** Unresolved, Builder not yet spawned
- **Action needed:** Spawn Builder to investigate and fix

---

## ✅ DECISIONS MADE TODAY (2026-03-19)

1. **Heartbeat moved to gpt-4o-mini** — Corey approved (~11:47 AM CST). Cost reduction.
2. **paperclip-sync cron removed** — was causing issues, removed
3. **Gunner CRM monitoring removed** — deprecated old repo, not worth tracking
4. **control-room-sync cron disabled** — Xhaka disabled to stop contributing to deploy loop
5. **Old Gunner repo errors** — Corey said "that Gunner repo is not a big deal, it is an old repo" — stop monitoring it

---

## 📋 RULES COREY STATED

- "Any errors, you need to fix, figure out they errored, and ensure they do not error in future" (11:48 AM CST)
- Errors should be caught proactively, root-caused, and prevented — not just reported

---

## 🧠 CONTEXT: AI Tech Team Meeting (Corey's Dad's Team)

**Meeting:** Mar 19, 2026 — Corey + Matt Lavinder + Ben Harrison + Will Riddle + Rohan Chalisgaonkar

**Key topics:**
- **FranDev project** — prioritized as main focus; low data risk, good for learning tangible results
- **RAG + proprietary data** — RAG approach needs proprietary data to have real value
- **"Myrrofish" concept** — Corey's concept: collect massive business data to predict daily events and problems before they happen
- **GitHub repos** — multiple repos exist due to difficulty finishing website (last 5%)
- **Rohan** — student intern from King with math/algorithms skills; there to learn AI implementation
- **Will Riddle** — screen share planned for Monday 2 PM (reminder NOT YET SET — open task)

**Corey's self-assessment:** "I am ahead of them and still feel like I just blab without actually understanding" — wants to deepen real understanding, not just talk about AI concepts

**Context:** Corey explained OpenClaw/Xhaka to the team — "I was trying to explain what you were and how I use you"

---

## 📌 OPEN TASKS

1. ⚠️ **Corey action needed:** Disable Railway auto-deploy on xhaka-control-room (30 sec fix)
2. 🔧 **Builder needed:** Fix xhaka-intelligence jobs (improve, cleanup, researcher)
3. 📅 **Set reminder:** Monday 2 PM — Will Riddle screen share (NOT YET SET)
4. 🔧 **Builder needed:** Rewrite control-room-sync cron to read state, not trigger redeploys (after deploy loop is fixed)

---

## 📊 SYSTEM STATUS (as of 11:49 PM CST)

- xhaka-intelligence: ✅ deployed successfully (jobs failing separately)
- xhaka-control-room: 🔴 deploy loop, all API routes dead
- gunner-v2: deprecated, ignore
- Heartbeat: now running on gpt-4o-mini ✅
