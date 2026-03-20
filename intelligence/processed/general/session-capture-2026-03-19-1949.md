# Session Memory Capture — 2026-03-19-1949

Captured: Thursday, March 19, 2026 — 7:49 PM CST

---

## OPEN ISSUES

### 1. xhaka-control-room — Deploy Loop
- In continuous redeploy loop (4+ consecutive heartbeats DEPLOYING, never landing)
- Root cause: deployed from wrong repo — currently c7lavinder/xhaka (old Express), should be c7lavinder/openclaw-control-room (Next.js)
- control-room-sync cron may be triggering redeploys every 30 min
- Status as of 7:44 PM: still stuck

### 2. xhaka-intelligence Job Failures
- improve, cleanup, and researcher jobs failing for 2+ cycles
- Builder needed
- Status: unresolved

### 3. Will Riddle Screen Share
- Monday after 2 PM — no reminder cron set yet
- Action needed: create reminder

---

## DECISIONS MADE TODAY

1. Heartbeat moved to gpt-4o-mini — Corey explicitly decided at 11:47 AM. Claude too expensive for orchestration.

2. paperclip-sync cron removed — ghost job; KB/vector API does not exist in Paperclip v0.3.1 yet.

3. Old Gunner repo GitHub errors — Corey confirmed old/deprecated repo, not monitoring.

4. Gunner CRM degraded resolved — Corey fixed around 10:16 AM.

---

## RULES COREY STATED

1. "Any errors, you need to fix, figure out they errored, and ensure they do not error in future" (11:48 AM) — proactive error resolution is mandatory.

2. Cost discipline: Claude API costs significantly more than GPT-4o-mini for orchestration. Switch all non-critical jobs to cheaper models.

---

## KEY INTEL — DAD'S TEAM MEETING (Mar 19, 12:57 PM)

Meeting: Corey + Matt Lavinder + Ben Harrison + Will Riddle + Rohan Chalisgaonkar (King intern)

What actually happened: Corey was presenting Xhaka to Matt's AI tech team — not learning from them.

Key people:
- Matt Lavinder: Corey's dad, building similar agent system for FranDev (franchising)
- Ben Harrison: 20+ yrs engineering, SOLID principles advocate
- Will Riddle: complained "done" is not useful output; wants visualization
- Rohan Chalisgaonkar: student intern from King College, math/algorithms focus

Jaca = Xhaka — Matt's team calls their COO agent "Jaca." Same 7-agent structure. Different domain (franchising).

MiroFish concept: Collect every possible data signal from a business to predict daily events before they happen. Long-game data moat. Deferred until Gunner hits 100 users but architectural design should start now so data collection begins early.

Corey's self-assessment: "I understand outcomes, not mechanisms" — can explain what agents do but not always the why underneath.

Will Riddle screen share: Monday after 2 PM — Corey to show Will the Control Room as the visualization layer.

Semi-assisted automation RAG feedback loop: When a manager overrides a Gunner call grade, that correction gets fed back to improve future grades. Compounding loop = proprietary data moat. This is the strategic Gunner play.

---

## SYSTEM STATUS (7:49 PM CST)

- xhaka-intelligence: HEALTHY
- xhaka-control-room: DEPLOY LOOP (broken)
- gunner-v2: HEALTHY (CRM fix confirmed ~10 AM)
- Heartbeat crons: RUNNING (now on gpt-4o-mini)
- paperclip-sync: REMOVED

---

## UPCOMING

- Monday after 2 PM: Will Riddle screen share (Control Room demo) — no reminder set
