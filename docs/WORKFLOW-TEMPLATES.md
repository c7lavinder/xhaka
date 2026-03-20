# Workflow Templates — Ready-to-Use Prompts

> Copy-paste templates for standard workflows. Use these instead of writing prompts from scratch.
> Source: "Installed Paperclip, Now What!?" article + gstack README + autoresearch method.

---

## The 5 Core Prompts

### 1. Planning — Reframe an Idea
Use when: Corey has a rough idea and wants it turned into a real plan with options.
```
Use /plan-ceo-review to reframe this idea: [paste idea here].
I want three implementation approaches with effort estimates.
```

### 2. Scope Check — Find the Simple Version
Use when: A plan exists but feels too big or expensive.
```
Use /plan-ceo-review to challenge the scope of this plan.
Find the simplest version that delivers 80% of the value.
```

### 3. Review + QA + Ship Chain
Use when: Code is written and ready to ship.
```
Use /review to check this code for bugs,
then /qa to test the user flows in a real browser,
then /ship to deploy.
```

### 4. autoresearch Experiment
Use when: We want to optimize a prompt, workflow, or grading rubric overnight.
*(Requires autoresearch skill installed + program.md created first)*
```
Examine program.md and launch a new experiment.
Run autonomously until you've completed 50 iterations.
Log all results.
```

### 5. Full Sprint Execution (Board-Level Delegation)
Use when: Corey approves a sprint goal and wants it fully executed.
```
This is our sprint goal: [goal].

Plan it with /plan-ceo-review,
lock the architecture with /plan-eng-review,
build it,
test it with /qa,
and ship it with /ship.

I'll review the PR when you're done.
```

---

## The Full Standard Chain

For any significant feature, use this sequence:

```
0. /investigate         → root cause analysis (if bug or unclear scope)
1. /freeze              → lock files outside working folder (production-adjacent work)
2. /office-hours        → rough idea → 3 approaches with effort estimates
3. /plan-ceo-review     → validate we're building the right thing
4. /plan-eng-review     → lock architecture, edge cases, failure modes
5. implement            → write the code (/careful wraps any destructive steps)
6. /review              → catch production bugs before commit
7. /qa                  → real browser test
8. /ship                → sync, test, push, open PR
9. /document-release    → update README + ARCHITECTURE + CONTRIBUTING
   /unfreeze            → remove freeze lock
```

For a quick bug fix (no architecture):
```
implement → /review → /qa → /ship → /document-release
```

**`/document-release` is always the last step. Every ship, without exception.**

---

## autoresearch program.md Template

When setting up an overnight research run, create `program.md` in the repo root:

```markdown
# Research Goal
[What are we trying to improve? Be specific.]
Example: "Optimize Gunner's motivation grading rubric to correctly classify seller motivation"

# Baseline
[What does the current version score? How do we know?]
Example: "Current rubric scores 72% accuracy on 50 gold-standard transcripts"

# Target
[When do we stop?]
Example: "95% accuracy on the same 50 transcripts"

# Evaluation Checklist (Binary — Yes/No ONLY)
Use Yes/No questions. Never rate 1-10. Sweet spot: 3-6 questions.
- Did it correctly identify the seller's primary motivation? Yes/No
- Did it avoid false-positive "financial distress" classifications? Yes/No
- Is the output under 100 words? Yes/No

# Constraints
[What can't change?]
Example: "Must use Gemini Flash. Response time under 3 seconds."
```

---

## Xhaka's SDD Template (Before Spawning Builder)

Before creating any Paperclip issue for Builder, verify these three sections exist:

```
SPEC:
[What it does — no implementation details]

ACCEPTANCE CRITERIA (binary — must all be checkable Yes/No):
- [ ] [Specific endpoint/behavior X returns Y]
- [ ] [Existing tests still pass]
- [ ] [No new files created outside X directory]

PLAN:
[Architecture decisions — specific, not vague]
[Constraints and patterns to follow]
[Files NOT to touch]
[Which gstack skills to use and when]

Use TodoWrite to track all tasks.
Mark each in_progress before starting, completed immediately after finishing.
Do what is asked. Nothing more. Do NOT create new docs or refactor code outside task scope.

TASKS:
1. [PARALLEL] Read [file A] AND [file B] to understand current patterns
2. [SEQUENTIAL] Core implementation
3. [SEQUENTIAL] Run /review
4. [SEQUENTIAL] Run /qa
5. [SEQUENTIAL] Run npm run typecheck — fix any errors
6. [SEQUENTIAL] Run /ship
7. [SEQUENTIAL] Run /document-release
8. Confirm: git status shows only expected files changed
```

**Rules:**
- If any section is missing — rewrite before spawning. A bad prompt wastes API credits and Corey's time.
- TASKS must use `[PARALLEL]` / `[SEQUENTIAL]` labels — Builder will batch parallel steps automatically.
- Acceptance criteria must be binary. Never write "it works better" — write "it returns 200 on endpoint X."
- The scope creep prevention line is mandatory: "Do what is asked. Nothing more."

---

## Delivery Window

All agent tasks should complete by **8 AM CST**.
Corey reviews the board at **9 AM CST**.
If a task will miss the window — comment with an ETA.
