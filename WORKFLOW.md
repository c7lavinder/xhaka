# WORKFLOW.md — Agent Pipeline

## How It Works

Every objective Corey gives creates a timestamped run folder:
runs/YYYY-MM-DD-{task-slug}/

Each agent reads all prior files in the folder and writes its own output file.

## Chain Order

Step 1: Xhaka creates 00_objective.md
Step 2: Spawn Researcher → reads 00 → writes 01_researcher_output.md
Step 3: Spawn Architect → reads 00+01 → writes 02_architect_output.md
Step 4: Spawn Builder → reads 00+01+02 → writes 03_builder_output.md
Step 5: Spawn Auditor → reads all → writes 04_auditor_report.md
Step 6: Xhaka reads 04 → writes 05_xhaka_summary.md → reports to Corey

## File Naming
- 00_objective.md — Corey's goal, written by Xhaka
- 01_researcher_output.md — findings + recommendations
- 02_architect_output.md — spec/design, file list, decisions
- 03_builder_output.md — what was built, commit SHAs, notes
- 04_auditor_report.md — pass/fail, bugs found, recommendation
- 05_xhaka_summary.md — final summary to Corey

## Rules
- Each agent reads ALL prior numbered files before starting
- No agent skips to execution without reading prior context
- Auditor must explicitly PASS before Xhaka reports success to Corey
- Runs are never deleted — they are the audit trail

---

## Intelligence Jobs

The xhaka-intelligence service runs on Railway (service ID: e6a33162). It executes scheduled jobs from `services/intelligence` on the `main` branch. Jobs are composable — each reads specific inputs and writes specific outputs.

| Job | Schedule | Purpose | Input | Output |
|-----|----------|---------|-------|--------|
| `capture` | Every 5 min | Polls for new Telegram signals and writes session notes | Telegram webhook / message queue | `memory/YYYY-MM-DD.md` session entries |
| `daily-log` | Daily 6 AM CST | Compiles today's session notes into a clean daily log | Today's session entries | `memory/YYYY-MM-DD.md` (finalized) |
| `organize` | Daily 6 AM CST | Synthesizes daily logs into MEMORY.md and subfolders | Recent `memory/YYYY-MM-DD.md` files | Updated `MEMORY.md` + subfolder entries |
| `scribe` | On-demand | Writes processed insights to the relevant context file | Processed event data (call, article, decision) | Entry in `memory/context/` relevant file |
| `propagate` | Daily 6 AM CST | Pushes intelligence outputs to downstream systems | `intelligence/` outputs | GitHub commits to repo |
| `researcher` | Daily 7:30 AM CST | Fetches and analyzes article URLs from article-inbox | `intelligence/article-inbox.md` | Insights written to `memory/context/insights/` |
| `tool-monitor` | Weekly Mon 6 AM CST | Checks Railway services, job health, log anomalies | Railway API (project 84c0d035) | Status report in `intelligence/tool-reports/` |
| `improve` | Weekly Mon 6 AM CST | Reviews improvement logs and applies approved changes | `memory/context/researcher-improvements.md` | Updated skill files (pending Corey approval) |
| `cleanup` | Weekly Sun 6 AM CST | Archives daily logs older than 30 days | `memory/YYYY-MM-DD.md` files (30+ days old) | Moved to `memory/archive/` |
| `watchdog` | Every 15 min | Monitors job failures and alerts Corey via Telegram | Railway service health + last job run timestamps | Telegram alert if any job fails or goes stale |

### Job Details

#### `capture`
- Watches for new signals from Corey (Telegram)
- Writes structured session notes: decisions made, actions taken, context added
- Does NOT finalize or synthesize — just records

#### `daily-log`
- Runs at 6 AM CST, after the day's capture window closes
- Merges session notes into a single coherent daily log
- Preserves chronological order

#### `organize`
- The synthesis engine — turns raw logs into searchable memory
- Updates `MEMORY.md` (must stay under 150 lines)
- Routes entries to subfolders: `decisions/`, `people/`, `projects/`, `context/`
- Archives anything >30 days old to `memory/archive/`

#### `scribe`
- Triggered when there's new processed data to log (a call was graded, an article was read, a decision was made)
- Writes to the right context file based on content type
- Format: actionable, sourced, concise

#### `propagate`
- Ensures the repo stays in sync with what xhaka-intelligence has processed
- Commits any new `memory/` or `intelligence/` files to GitHub
- One commit per propagation run (not per file)

#### `researcher`
- Reads `intelligence/article-inbox.md` for queued URLs
- Fetches and extracts article content
- Evaluates for behavioral impact (does this change how we should operate?)
- Writes insights to `memory/context/insights/`
- Writes proposed changes to `intelligence/proposed-changes/` if behavioral impact is detected
- Removes processed URLs from inbox (or marks them processed)

#### `tool-monitor`
- Calls Railway API to check health of all Xhaka project services
- Looks for: failed deployments, stale jobs, log errors
- Does NOT touch Gunner project (f379b683) — read-only observation only

#### `improve`
- Reviews `memory/context/researcher-improvements.md` for pending improvements
- Drafts skill file updates for Builder review
- Does NOT auto-apply — surfaces them as proposed changes

#### `cleanup`
- Auto-archives `memory/YYYY-MM-DD.md` files older than 30 days
- Moves to `memory/archive/YYYY/MM/` folder structure
- Runs Sunday 6 AM CST

#### `watchdog`
- Polls job health every 15 minutes
- Alerts Corey on Telegram if any critical job hasn't run in its expected window
- Escalates to Corey if same job fails 3 times in a row

---

## Article Intake Protocol
When Corey sends an article URL or pasted content, Xhaka writes it to `intelligence/articles/inbox/` on GitHub.

To queue an article for research, add its URL to `intelligence/article-inbox.md`.
Format: one URL per line, optional `# note` after the URL.
Example: `https://example.com/article # wholesale market update`

> ⚠️ Note: JavaScript-rendered pages (e.g., some news sites) may fail extraction — the researcher job will keep them in inbox for retry. Paywalled URLs (WSJ, Bloomberg) will also fail gracefully.

---

## Self-Improvement Loop (The Target Architecture)

The pipeline is evolving toward a fully self-improving system. The four-stage loop:

```
OBSERVE → INSPECT → AMEND → EVALUATE
```

| Stage | Status | What It Does |
|---|---|---|
| **OBSERVE** | ✅ Built | `capture` + `researcher` jobs notice what's happening |
| **INSPECT** | 🔲 Not built yet | Analyze patterns across observations — what's working, what's degrading |
| **AMEND** | 🟡 Partial | `improve` job drafts changes; `proposed-changes/` holds them |
| **EVALUATE** | 🔲 Not built yet | Run amended skill against benchmark — accept if better, roll back if not |

### How It Will Work (When Complete)
1. `researcher` finds an insight that suggests a behavior change
2. `researcher` writes it to `intelligence/proposed-changes/`
3. `inspect` (future job) patterns-matches across recent proposed changes — groups related ones
4. `improve` drafts an updated skill file
5. `evaluate` (future job) runs the updated skill against 2 benchmark inputs
6. If benchmark passes: update the skill file, commit, notify Corey
7. If benchmark fails: discard the amendment, log failure as evidence for next cycle

**Key principle:** Amendments must prove improvement or roll back. Failures are evidence, not noise.

### Current Gap
The `inspect` and `evaluate` jobs are not yet built. Until they are:
- Proposed changes accumulate in `intelligence/proposed-changes/`
- Builder reviews them on manual request
- Improvements require Corey or Builder to manually approve and apply

---

## Skill Stack Architecture

Our intelligence pipeline is a **composable skill stack** — not a monolith. Each step is a discrete skill with defined inputs, outputs, and quality criteria.

### The Stack
```
session-capture → inbox → daily-log → organize → scribe → MEMORY.md
                                                    ↓
                                             researcher → proposed-changes → (future: inspect → evaluate)
```

| Skill | Input | Output | Quality Criteria |
|---|---|---|---|
| `session-capture` | Raw Telegram conversation | Structured session notes | Every decision and action captured |
| `inbox` | Article URLs / signals from Corey | Queued items in `intelligence/article-inbox.md` | URL + context note per item |
| `daily-log` | Today's events, updates, actions | `memory/YYYY-MM-DD.md` | Complete record, no gaps |
| `organize` | Accumulated daily logs | Categorized entries in `memory/` subfolders | Searchable, under 150-line MEMORY.md |
| `scribe` | Processed call/article/event data | Insight entry in relevant context file | Actionable, sourced, concise |
| `researcher` | Article URL + context note | Insight entry + (if behavioral) proposed change | Connected to Gunner/NAH, has recommended action |
| `MEMORY.md` | Synthesized entries from subfolders | Single source of truth for active context | < 150 lines, linked to archives |

### Adding a New Skill
Every new workflow added to this pipeline must follow this sequence:

```
1. Define inputs/outputs → what goes in, what comes out, one-sentence description
2. Write sample I/O   → at least one concrete example of good output
3. Test with sample   → run against sample input, verify output matches spec
4. Benchmark          → run on 2 different inputs, confirm consistent quality
5. Wire into pipeline → identify where it slots in the stack above
6. Document           → add to this table + create skill.md in its folder
```

**Never wire a skill into the pipeline before steps 1–4 are done.** Untested skills corrupt downstream skills.

### Composability Principle
Small, reliable modules > one complex monolith.
- Each skill should do exactly one thing
- Failure in one skill must not silently corrupt others (fail loudly, fail early)
- A skill is only "done" when it has a definition, a sample, and a benchmark result

---


---

## Proof-of-Work Standard

Every job must declare its proof-of-work artifact **before** the Builder is allowed to build it. No artifact declaration = no build approval.

### Required Declaration

Each job must specify:
- **Artifact name:** Human-readable name (e.g., "Article Digest")
- **Artifact path:** Exact path in repo (e.g., `intelligence/article-digest.md`)
- **Non-empty definition:** What "non-empty" means for that artifact (e.g., "at least one insight entry after first run")

### Builder Checklist Item

Before closing any job task:
- [ ] Artifact path declared in the spec before build started
- [ ] Artifact exists in repo after first run
- [ ] Artifact is non-empty per its declared definition
- [ ] **If artifact is missing or empty after first run: task is NOT done — do not mark complete**

### Examples

| Job | Artifact | Non-Empty Means |
|-----|----------|-----------------|
| `researcher` | `intelligence/article-digest.md` | At least one insight entry |
| `tool-monitor` | `memory/context/tools/{category}/` | At least one file with content |
| `organize` | `memory/people/`, `memory/decisions/`, `memory/projects/` | At least one updated file |
| `scribe` | `memory/YYYY-MM-DD.md` | At least one commit or decision entry |
| `daily-log` | `memory/YYYY-MM-DD.md` | At least one timestamped entry |
| `inspect` | `intelligence/inspect-reports/YYYY-MM-DD-{job}.md` | Root cause type + recommended fix present |
| `routing-review` | `intelligence/routing-reviews/YYYY-MM-DD.md` | At least one pattern observation |
| `feedback` | `data/feedback-log.json` | At least one entry processed |

**A job that runs and produces nothing is a failed job, regardless of exit status.**

## Auditor Checklist

Every `04_auditor_report.md` must include this section:

### Routing Compliance Check
- [ ] Does `runs/routing-log.md` have an entry for this task?
- [ ] Was the correct agent assigned per ROUTING.md decision table?
- [ ] Did Xhaka write any code directly? (FAIL if yes)
- [ ] Did Xhaka do any visual/UI work directly? (FAIL if yes)
