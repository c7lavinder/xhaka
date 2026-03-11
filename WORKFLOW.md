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
