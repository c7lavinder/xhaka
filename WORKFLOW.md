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

| Job | Schedule | Purpose |
|-----|----------|---------|
| researcher | Daily 7:30 AM CST | Fetch + analyze article URLs from intelligence/article-inbox.md |

### Article Intake Protocol
When Corey sends an article URL or pasted content, Xhaka writes it to `intelligence/articles/inbox/` on GitHub.

To queue an article for research, add its URL to `intelligence/article-inbox.md`.
Format: one URL per line, optional `# note` after the URL.
Example: `https://example.com/article # wholesale market update`

> ⚠️ Note: JavaScript-rendered pages (e.g., some news sites) may fail extraction — the researcher job will keep them in inbox for retry. Paywalled URLs (WSJ, Bloomberg) will also fail gracefully.

---

## Skill Stack Architecture

Our intelligence pipeline is a **composable skill stack** — not a monolith. Each step is a discrete skill with defined inputs, outputs, and quality criteria.

### The Stack
```
session-capture → inbox → daily-log → organize → scribe → MEMORY.md
```

| Skill | Input | Output | Quality Criteria |
|---|---|---|---|
| `session-capture` | Raw Telegram conversation | Structured session notes | Every decision and action captured |
| `inbox` | Article URLs / signals from Corey | Queued items in `intelligence/article-inbox.md` | URL + context note per item |
| `daily-log` | Today's events, updates, actions | `memory/YYYY-MM-DD.md` | Complete record, no gaps |
| `organize` | Accumulated daily logs | Categorized entries in `memory/` subfolders | Searchable, under 150-line MEMORY.md |
| `scribe` | Processed call/article/event data | Insight entry in relevant context file | Actionable, sourced, concise |
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

## Auditor Checklist

Every `04_auditor_report.md` must include this section:

### Routing Compliance Check
- [ ] Does `runs/routing-log.md` have an entry for this task?
- [ ] Was the correct agent assigned per ROUTING.md decision table?
- [ ] Did Xhaka write any code directly? (FAIL if yes)
- [ ] Did Xhaka do any visual/UI work directly? (FAIL if yes)
