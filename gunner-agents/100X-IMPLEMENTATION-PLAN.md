# 100x Engineer Implementation Plan for Gunner

**Goal:** Implement the AI-assisted engineering workflow from the playbook  
**Timeline:** Roll out over 1-2 weeks  
**Owner:** Corey + Manus

---

## Phase 1: Foundation (Day 1-2)

### 1.1 Create claude.md in Gunner Repo

**Location:** Root of Gunner repo (`/claude.md`)

**Initial Content:**
```markdown
# claude.md — Gunner AI Context

Last Updated: 2026-02-09

## Architecture Rules

### Data Flow
- All external data flows through Gunner as the hub
- Agents query Gunner APIs, never raw external sources directly
- GHL is the CRM source of truth, synced to Gunner

### Multi-Tenancy
- Every feature must work for any tenant, not just NAH
- Tenant isolation is non-negotiable
- Config is per-tenant, code is shared

### Agent Design
- Agents are event-driven (webhooks trigger actions)
- Agents are stateless (state lives in database)
- Agents are idempotent (safe to retry)

### Code Standards
- TypeScript strict mode
- All API endpoints need input validation
- All database queries need error handling
- No secrets in code — use environment variables

### Naming Conventions
- Files: kebab-case (e.g., `lead-qualification.ts`)
- Functions: camelCase (e.g., `qualifyLead()`)
- Types/Interfaces: PascalCase (e.g., `LeadScore`)
- Database tables: snake_case (e.g., `call_grades`)

---

## Known Mistakes

### Template (copy this for new entries)
**Date:** YYYY-MM-DD  
**What happened:** [Description]  
**Root cause:** [Why it happened]  
**Fix:** [How we fixed it]  
**Prevention:** [How to avoid next time]

### Entries
(Add after each PR where AI got something wrong)

---

## Constraints

### Security
- Never expose API keys in client-side code
- All external API calls go through server-side proxies
- User input is always sanitized
- PII is encrypted at rest

### Performance
- Target: <500ms p95 latency for API calls
- Database queries must use indexes
- Paginate all list endpoints (max 100 items)
- Cache frequently-read data (tenant configs, rubrics)

### Cost
- Optimize AI calls — batch when possible
- Use smaller models for simple tasks
- Cache AI responses where appropriate
- Monitor token usage per tenant

### Infrastructure
- Current: [Fill in — Vercel? AWS? etc.]
- Database: [Fill in — Postgres? Supabase?]
- Budget ceiling: $X/month for infrastructure

---

## Non-Negotiables

### Always Do
- Write tests for new features
- Update claude.md when you learn something
- Run linter before committing
- Create feature branches, never commit to main

### Never Do
- Skip code review
- Deploy on Fridays
- Store credentials in code
- Let AI auto-merge without human review

---

## Team Patterns

### PR Naming
`[type]/[scope]: [description]`
- feat/lead-iq: add scoring algorithm
- fix/voicemail: handle empty transcripts
- refactor/api: consolidate endpoints

### Commit Messages
`[type]: [description]`
- feat: add lead qualification endpoint
- fix: handle null phone numbers
- test: add voicemail bot tests

---

## AI Instructions

When working on this codebase:
1. Read this entire file first
2. Check /context folder for relevant specs
3. Follow architecture rules strictly
4. Propose a plan before writing code
5. Write tests alongside implementation
6. Flag any constraint violations immediately
```

**Action:** Manus creates this file, commits to repo.

---

### 1.2 Create Context File System

**Structure:**
```
/context
├── business-info/
│   ├── pricing-tiers.md      # Starter/Growth/Scale plans
│   ├── tenant-slas.md        # What we promise customers
│   └── cost-model.md         # Infrastructure costs
│
├── architecture/
│   ├── data-flow.md          # How data moves through system
│   ├── agent-patterns.md     # How agents are built
│   └── integrations.md       # GHL, BatchDialer, etc.
│
├── examples/
│   ├── ideal-agent.md        # Golden example of agent code
│   ├── ideal-api.md          # Golden example of API endpoint
│   └── ideal-test.md         # Golden example of test file
│
└── agents/
    ├── architect.md          # Role: system design decisions
    ├── implementer.md        # Role: write feature code
    ├── tester.md             # Role: write tests
    └── reviewer.md           # Role: review PRs
```

**Action:** Create folder structure, populate over time.

---

## Phase 2: Verification Layer (Day 3-4)

### 2.1 Set Up CI Pipeline

**On Every Commit:**
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Type check
        run: npm run typecheck
      
      - name: Test
        run: npm run test
      
      - name: Security scan
        run: npm audit --audit-level=high
```

**Action:** Manus sets up GitHub Actions.

---

### 2.2 Add AI Code Review

**Option A: Codium PR-Agent (Free)**
- Auto-reviews every PR
- Comments on issues
- Suggests improvements

**Option B: GitHub Copilot Workspace**
- If already using Copilot
- Reviews in context of full codebase

**Setup:**
1. Install PR-Agent GitHub App
2. Configure to read `claude.md` for custom rules
3. Set "high severity" as blocking

**Action:** Pick one, Manus installs.

---

## Phase 3: Background Agent Workflow (Day 5-7)

### 3.1 Create Night Queue System

**Simple approach:** Markdown file tracking async tasks

**Location:** `/context/night-queue.md`

```markdown
# Night Queue

Tasks for background agents to work on overnight.

## Ready to Run
- [ ] Fix all TypeScript strict mode errors in /src/agents
- [ ] Add tests for voicemail bot transcription
- [ ] Migrate deprecated API calls in /src/legacy

## In Progress
- [ ] Refactor call grading to new rubric format (Agent: Cursor BG)

## Done (Review Needed)
- [x] PR #142: ESLint fixes across 40 files
- [x] PR #143: Add missing JSDoc comments
```

**Workflow:**
1. During day: Add tasks to "Ready to Run"
2. End of day: Kick off 3-5 background agents
3. Morning: Review PRs in "Done (Review Needed)"

---

### 3.2 Background Agent Setup Options

**Option A: Cursor Background Agents**
- Built into Cursor IDE
- Runs in cloud while you're away
- Creates PRs automatically

**Option B: Claude with GitHub CLI**
- Use Claude Code in terminal
- Script to run overnight tasks
- Commits to feature branches

**Option C: Devin / Jules / Codex**
- External agent services
- More autonomous
- Higher cost

**Recommendation:** Start with Cursor Background Agents (simplest).

**Action:** Manus sets up Cursor with background agent access.

---

## Phase 4: Parallel Agent Workflow (Day 8-10)

### 4.1 Terminal Tab Strategy

Run 3-5 Claude Code sessions in separate terminal tabs:

```
Tab 1: Feature work (Lead IQ implementation)
Tab 2: Tests (Writing tests for current sprint)
Tab 3: Bug investigation (Production issues)
Tab 4: Refactoring (Tech debt cleanup)
Tab 5: Documentation (Updating specs/docs)
```

**Workflow:**
1. Start each session with clear scope
2. Cycle through tabs every 15-30 min
3. Unblock when stuck, let them continue
4. Merge when ready

---

### 4.2 Session Scoping Rules

**Good scope (one PR):**
- "Add lead scoring endpoint to Lead IQ agent"
- "Write tests for voicemail transcription"
- "Fix TypeScript errors in /src/api"

**Bad scope (too broad):**
- "Build the Lead IQ agent" (too big)
- "Fix all bugs" (undefined)
- "Improve performance" (vague)

**Rule:** If you can't describe it in one sentence, break it down.

---

## Phase 5: MCP Connections (Day 10-14)

### 5.1 Wire AI to Your Systems

**Priority connections:**

| System | What AI Can Do | Priority |
|--------|----------------|----------|
| GitHub | Create branches, open PRs, comment | High |
| Linear/Jira | Read tickets, update status | Medium |
| Sentry | Pull error logs for debugging | Medium |
| Database | Query for debugging/validation | Low (careful) |
| Slack | Post updates | Low |

**Setup:**
1. Create `.mcp.json` in repo root
2. Configure connections with appropriate permissions
3. Version control the config (everyone gets same setup)

**Action:** Start with GitHub only, add others as needed.

---

## Daily Workflow (After Setup)

### Morning (30 min)
1. Review overnight PRs from background agents
2. Merge good ones, close bad ones
3. Update `claude.md` with any learnings
4. Check night queue for stuck tasks

### During Day
1. Run 3-5 parallel agent sessions
2. Cycle through, unblock, review
3. Add tasks to night queue as you find them
4. Update specs/docs as you go

### End of Day (15 min)
1. Review night queue
2. Kick off 3-5 background agents
3. Each gets: clear task, feature branch, link to claude.md
4. Go home

---

## Metrics to Track

| Metric | Target | How to Measure |
|--------|--------|----------------|
| PRs merged per week | 20+ | GitHub stats |
| Time to first review | <4 hours | PR timestamps |
| Test coverage | >80% | CI reports |
| Defect rate | Decreasing | Bug tickets |
| AI accuracy | Track in claude.md | Mistake log |

---

## Who Does What

| Task | Owner | Timeline |
|------|-------|----------|
| Create claude.md | Manus | Day 1 |
| Create /context structure | Manus | Day 2 |
| Set up CI pipeline | Manus | Day 3 |
| Install PR-Agent | Manus | Day 4 |
| Set up Cursor BG agents | Manus | Day 5 |
| Create night queue | Corey | Day 5 |
| First parallel session test | Corey | Day 7 |
| MCP GitHub connection | Manus | Day 10 |

---

## Start Tomorrow

**Minimum viable start:**

1. Create `claude.md` with the template above
2. Add it to your repo
3. Update it after every PR where AI got something wrong

That's it. The rest builds on this foundation.

---

## Questions for Manus

1. What CI system is Gunner using? (GitHub Actions?)
2. What's the current test coverage?
3. Is Cursor already in use, or VS Code?
4. Any existing linter/formatter config?
5. Where is the repo hosted? (GitHub?)

---

Ready to execute. 🚀
