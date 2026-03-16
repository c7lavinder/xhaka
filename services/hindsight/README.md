# Hindsight — Episodic Memory for Xhaka

> **Status:** Railway service deployed. `hindsight-sync.ts` job registered. Full wiring pending.

---

## What Is Hindsight?

Hindsight is an agent memory system that makes AI agents **learn over time**, not just remember the current conversation. It auto-captures every session, extracts facts/entities/relationships using gpt-4o-mini, and injects relevant memories before each agent response. Zero manual curation.

**GitHub:** https://github.com/vectorize-io/hindsight  
**Docs:** https://hindsight.vectorize.io

---

## Two Memory Layers

Xhaka uses a dual-layer memory architecture:

| Layer | What It Is | Who Writes It | Files |
|-------|-----------|---------------|-------|
| **Episodic (Hindsight)** | What actually happened in past sessions — decisions, outcomes, people, patterns | Auto-written by `hindsight-sync.ts` | Stored in Hindsight DB (Railway) |
| **Institutional (KB Files)** | Permanent knowledge: org chart, processes, rules, identity | Human-curated by Corey | `AGENTS.md`, `SOUL.md`, `TOOLS.md`, `MEMORY.md`, etc. |

Hindsight fills the gap that KB files can't: **what happened in this session last Tuesday**.

---

## Architecture

```
Xhaka conversation → OpenClaw gateway
                          ↓
                 hindsight-openclaw plugin
                    (auto-capture + auto-inject)
                          ↓
              Hindsight API (Railway: xhaka-hindsight)
                          ↓
              PostgreSQL + vector indexes
```

Or via daily batch sync (current approach):
```
Session turns → capture.ts → data/results.tsv
                                    ↓
             hindsight-sync.ts (11 PM CST)
                                    ↓
              Hindsight retain API → memory banks
```

---

## Railway Service

- **Service name:** `xhaka-hindsight`
- **Service ID:** `120da791-ab76-4b9d-9f35-32789b6ae390`
- **Project:** Xhaka (`84c0d035-cf53-4edd-b29c-31aeb42caac9`)
- **Docker image:** `ghcr.io/vectorize-io/hindsight:latest`
- **API port:** 8888
- **UI port:** 9999

### Environment Variables

| Variable | Value | Purpose |
|----------|-------|---------|
| `OPENAI_API_KEY` | `sk-proj-...` | LLM extraction (auto-copied from xhaka-intelligence) |
| `HINDSIGHT_API_LLM_API_KEY` | `sk-proj-...` | Hindsight's env var name for the same key |
| `PORT` | `3200` | Railway port binding |
| `NODE_ENV` | `production` | Runtime mode |

> **Note:** Hindsight's Docker image listens on port 8888 by default for the API and 9999 for the UI. Railway will handle port mapping. Once deployed, set `HINDSIGHT_URL` on `xhaka-intelligence` to the Railway internal URL.

---

## Hindsight API Endpoints

All endpoints relative to the base URL (e.g., `https://xhaka-hindsight.up.railway.app`):

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/retain` | Store information (auto-extracts facts/entities) |
| `POST` | `/recall` | Retrieve memories by semantic query |
| `POST` | `/reflect` | Deep analysis of existing memories |
| `GET` | `/health` | Health check |

### Retain Request Example
```json
POST /retain
{
  "bank_id": "xhaka-main",
  "content": "Corey decided to pause BatchDialer integration until Q2",
  "context": "strategy session 2026-03-16",
  "timestamp": "2026-03-16T22:00:00Z"
}
```

### Recall Request Example
```json
POST /recall
{
  "bank_id": "xhaka-main",
  "query": "What did Corey decide about BatchDialer?"
}
```

---

## hindsight-sync.ts — Daily Session Sync Job

**Location:** `services/intelligence/src/jobs/hindsight-sync.ts`  
**Schedule:** `0 23 * * *` (11 PM CST, after all other nightly jobs)

Current status: **stub** — job registered in scheduler, wiring pending.

### Full Wiring Checklist (Next Steps)

1. **Set `HINDSIGHT_URL`** on `xhaka-intelligence` service in Railway:
   - Value: Railway public URL of `xhaka-hindsight` (e.g., `https://xhaka-hindsight.up.railway.app`)
   - Or use internal Railway DNS: `http://xhaka-hindsight.railway.internal:8888`

2. **Wire session data** in `hindsight-sync.ts`:
   - Pull today's session captures from `data/results.tsv` (Scribe job output)
   - Format as Hindsight retain payloads
   - POST to `${HINDSIGHT_URL}/retain` with `bank_id: "xhaka-main"`

3. **Install OpenClaw plugin** for real-time capture (optional, more powerful):
   ```bash
   openclaw plugins install @vectorize-io/hindsight-openclaw
   ```
   Then configure `~/.openclaw/openclaw.json` to point to Railway Hindsight URL:
   ```json
   {
     "plugins": {
       "entries": {
         "hindsight-openclaw": {
           "enabled": true,
           "config": {
             "hindsightApiUrl": "https://xhaka-hindsight.up.railway.app"
           }
         }
       }
     }
   }
   ```

4. **Add memory bank config** — set `bankMission` to give Hindsight context:
   ```json
   "bankMission": "Xhaka is Corey Lavinder's AI COO for New Again Houses wholesale real estate. Track decisions, people, deals, and operational patterns."
   ```

5. **Test recall** from within `morning-brief.ts` or `scribe.ts`:
   ```typescript
   const { HindsightClient } = await import('@vectorize-io/hindsight-client');
   const hindsight = new HindsightClient({ baseUrl: process.env.HINDSIGHT_URL });
   const memories = await hindsight.recall('xhaka-main', 'recent decisions about Gunner');
   ```

---

## Memory Bank Strategy

| Bank ID | Purpose |
|---------|---------|
| `xhaka-main` | All general Xhaka sessions |
| `xhaka-gunner` | Gunner-specific decisions and coaching patterns |
| `xhaka-deals` | Active deal tracking and outcomes |

---

## Why Not Just Use KB Files?

KB files (`MEMORY.md`, `AGENTS.md`, etc.) are institutional memory — human-curated, durable, structured. They answer "who are we and how do we work."

Hindsight answers "what actually happened." When Corey says "remember last week when we decided to pause that integration?" — that's episodic memory. KB files don't capture it. Hindsight does, automatically.

Together they form a complete cognitive picture:
- **KB files** = long-term semantic memory (facts, identity, rules)
- **Hindsight** = episodic memory (events, decisions, interactions)
