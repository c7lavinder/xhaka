# Intelligence Service — Spec

> A 24/7 background service that captures, processes, and propagates intelligence across all agents and projects. Runs on Railway, separate from Gunner.

---

## What It Does

Three jobs, always running:

### 1. Capture (Real-Time)
When Corey sends Xhaka something (article, URL, image, thought):
- Xhaka processes it immediately in the session
- Writes the synthesized output to `intelligence/inbox/`
- Service picks it up, routes it to `processed/gunner/`, `processed/nah/`, or `processed/general/`
- Commits to xhaka GitHub repo

### 2. Propagate (Daily — 6 AM CST)
- Scan `intelligence/processed/` for items from the last 24 hours
- For each item: determine which agents it should update
- Use OpenAI to generate the specific addition to the agent file
- Append to relevant agent `.md` file in `agents/`
- Commit changes to xhaka repo
- Log what was updated and why

### 3. Improve (Weekly — Monday 6 AM CST)
- Pull last 7 days of git history from `c7lavinder/Gunner`
- Find: reverted commits, failed builds, Railway deploy failures
- Extract lessons from each failure
- Use OpenAI to synthesize: "What rule should the Builder know to prevent this?"
- Append to `agents/builder.md` failure patterns section
- Pull Railway error logs — update `agents/operator.md` known issues
- Distill accumulated `intelligence/processed/` items into cleaner knowledge
- Commit everything

---

## Architecture

```
Railway Service: xhaka-intelligence
├── src/
│   ├── jobs/
│   │   ├── capture.ts        ← Processes inbox/ items
│   │   ├── propagate.ts      ← Daily: intel → agent files
│   │   └── improve.ts        ← Weekly: git history → lessons
│   ├── lib/
│   │   ├── github.ts         ← Read/write xhaka repo via GitHub API
│   │   ├── openai.ts         ← Synthesis calls
│   │   ├── railway.ts        ← Pull deploy logs
│   │   └── router.ts         ← Routes intel to right project folder
│   ├── scheduler.ts          ← node-cron job runner
│   └── index.ts              ← Entry point
├── package.json
└── railway.toml
```

---

## Tech Stack

- **Runtime:** Node.js + TypeScript
- **Scheduler:** `node-cron`
- **GitHub:** Octokit REST API (read/write xhaka repo)
- **AI Synthesis:** OpenAI GPT-4o (cheap, fast, good enough for synthesis)
- **Deploy:** Railway (own project — NOT Gunner App)
- **No database needed** — GitHub is the storage layer

---

## Environment Variables

```
OPENAI_API_KEY=          ← For synthesis calls
GITHUB_TOKEN=            ← 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
GITHUB_REPO=             ← c7lavinder/xhaka
RAILWAY_API_TOKEN=       ← 107983f5-06cc-40b3-92d6-833004dee064
GUNNER_REPO=             ← c7lavinder/Gunner
```

---

## Propagation Logic

When a new intel item arrives, the service determines which agents to update:

| Intel Tags | Agents Updated |
|---|---|
| gunner, frontend, ui | architect.md |
| gunner, code, bug, build | builder.md |
| gunner, security | auditor.md |
| gunner, competitor, market | researcher.md |
| nah, ghl, crm, integration | operator.md |
| nah, automation | operator.md + researcher.md |
| tools, new capability | relevant agent based on domain |

---

## Improvement Loop (Weekly)

```
1. Pull git log from c7lavinder/Gunner (last 7 days)
2. Find commits with "fix:", "revert:", "hotfix:" prefixes
3. For each: extract what broke and why
4. Prompt OpenAI: "Given this failure, what rule should be added to [agent]?"
5. Append rule to agent file under "Lessons Learned" section
6. Pull Railway deploy logs — find any crashes
7. Prompt OpenAI: "What does this crash tell us about our setup?"
8. Update operator.md or builder.md accordingly
9. Commit all changes with message: "intelligence: weekly improvement run [date]"
```

---

## Capture Format (Written by Xhaka to inbox/)

```markdown
---
date: 2026-03-11
source: https://... | corey-direct
project: gunner | nah | general
tags: [tag1, tag2]
urgency: high | medium | low
---

## Raw
[What Corey sent — URL, paste, or summary]

## Synthesis
[Xhaka's analysis — what this means for us specifically]

## Suggested Action
[What should change as a result]
```

---

## What Agents Look Like After 6 Months

Each agent file grows a `## Intelligence Log` section:

```markdown
## Intelligence Log

### 2026-03-15: Vite 7.2 Released
Vite 7.2 adds experimental HMR improvements. No breaking changes.
No action required for current build setup.

### 2026-03-18: Gong raised $50M Series D
Targeting enterprise — not moving downmarket. 
Gunner's SMB/vertical-specific niche remains uncontested.
Researcher flagged: monitor for feature parity in coaching rubrics.

### 2026-03-22: Builder lesson — missing tenantId on calls.getAll
Caught by Auditor pre-deploy. Root cause: new router file didn't inherit
the tenantId enforcement pattern. Added explicit check to Builder checklist.
```

---

## Build Priority

**Phase 1 (Build first):**
- Capture job (reads inbox/, routes to processed/, commits)
- Basic daily propagate (appends intel summaries to agent knowledge)

**Phase 2:**
- Weekly improve job (git history analysis + lessons)
- Railway log monitoring

**Phase 3:**
- Smarter routing (NLP-based tag detection)
- Cross-project intelligence connections
- Agent file version history + diff tracking

---

## Success Metric

After 90 days: Corey sends an article → it's in the right folder within seconds → the relevant agent has a new entry by next morning → the agent is measurably better at that domain than it was before.

After 6 months: Xhaka walks into every conversation already knowing more than last time, without Corey having to repeat anything.
