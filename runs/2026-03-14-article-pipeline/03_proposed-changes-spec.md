# Proposed Changes Step — Spec
**Run:** 2026-03-14-article-pipeline
**Author:** The Architect
**Date:** 2026-03-14

---

## Overview

After the researcher extracts insights from an article, a second evaluation step determines whether any insight warrants a behavioral change to a core Xhaka file (SOUL.md, ROUTING.md, agents/*, HEARTBEAT.md, etc.).

Only HIGH confidence proposals are written to disk. MEDIUM/LOW are logged inline but not persisted as files. Xhaka reviews each morning and routes approved proposals to Builder.

---

## 1. Exact Code Changes to `researcher.ts`

### 1a. New Interfaces (add after `ArticleAnalysis` interface)

```typescript
interface BehavioralProposal {
  targetFile: string;          // e.g. "SOUL.md", "ROUTING.md", "agents/builder.md"
  changeType: 'addition' | 'edit' | 'new-section';
  currentState: string;        // What the file currently says, or "doesn't exist"
  proposedChange: string;      // Exact text to add or modify
  why: string;                 // One sentence — what behavior this improves
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  insightSource: string;       // The insight text that triggered this proposal
}

interface BehavioralEvaluationResult {
  proposals: BehavioralProposal[];
  evaluatedAt: string;         // ISO timestamp
}
```

### 1b. New Function: `evaluateForBehavioralImpact`

Add this function to `researcher.ts` after the `analyzeArticle` function:

```typescript
async function evaluateForBehavioralImpact(
  articleTitle: string,
  keyInsights: string[],
  articleUrl: string,
): Promise<BehavioralEvaluationResult> {
  const systemPrompt = `You are a behavioral systems analyst for an AI COO named Xhaka.
Xhaka operates via a set of core files that define identity, routing, agent roles, and daily behavior:
- SOUL.md — core identity, rules, vibe, what Xhaka is/isn't
- ROUTING.md — who handles what task (never skip routing)
- agents/README.md — agent roster and responsibilities
- HEARTBEAT.md — daily morning routine and review checklist
- agents/builder.md, agents/researcher.md, etc. — per-agent instructions

Your job: for each insight provided, decide if it suggests a BETTER WAY to prompt, route, build, audit, or organize that Xhaka is NOT currently doing.

Return ONLY valid JSON (no markdown fences). Schema:
{
  "proposals": [
    {
      "targetFile": "string — e.g. SOUL.md or ROUTING.md",
      "changeType": "addition | edit | new-section",
      "currentState": "string — what the file currently says, or 'doesn't exist'",
      "proposedChange": "string — exact text to add or modify",
      "why": "string — one sentence, what behavior this improves",
      "confidence": "HIGH | MEDIUM | LOW",
      "insightSource": "string — the insight that triggered this"
    }
  ]
}

Confidence guidelines:
- HIGH: The insight directly and unambiguously maps to a missing rule, protocol, or behavior in a core file. The change is specific and low-risk.
- MEDIUM: The insight is relevant but the mapping is interpretive or the change is large/uncertain.
- LOW: Loosely related, speculative, or the file already handles this well enough.

If no proposals are warranted, return { "proposals": [] }.
Do NOT invent proposals for their own sake. Fewer, better proposals beat many weak ones.`;

  const userPrompt = `Article: "${articleTitle}"
URL: ${articleUrl}

Key Insights:
${keyInsights.map((ins, i) => `${i + 1}. ${ins}`).join('
')}

Evaluate each insight. Return only proposals where confidence is HIGH, MEDIUM, or LOW.
Include all three tiers in the JSON — the caller will filter by confidence.`;

  const raw = await synthesize(systemPrompt, userPrompt, 2000);
  const cleaned = raw.replace(/^```(?:json)?
?/, '').replace(/
?```$/, '').trim();

  let parsed: BehavioralEvaluationResult;
  try {
    parsed = JSON.parse(cleaned) as BehavioralEvaluationResult;
  } catch (err) {
    console.warn('[researcher] evaluateForBehavioralImpact: JSON parse failed — skipping proposals');
    return { proposals: [], evaluatedAt: new Date().toISOString() };
  }

  if (!Array.isArray(parsed.proposals)) {
    return { proposals: [], evaluatedAt: new Date().toISOString() };
  }

  parsed.evaluatedAt = new Date().toISOString();
  return parsed;
}
```

### 1c. New Function: `writeProposedChange`

Add after `evaluateForBehavioralImpact`:

```typescript
function buildProposedChangeMarkdown(
  proposal: BehavioralProposal,
  articleTitle: string,
  today: string,
): string {
  return `# Proposed Change — ${today}
Source: ${articleTitle}
Target File: ${proposal.targetFile}
Type: ${proposal.changeType}

## Current State
${proposal.currentState}

## Proposed Change
${proposal.proposedChange}

## Why
${proposal.why}

## Confidence
${proposal.confidence}
`;
}

async function writeProposedChanges(
  proposals: BehavioralProposal[],
  articleTitle: string,
  articleSlug: string,
  today: string,
): Promise<number> {
  const highConfidence = proposals.filter((p) => p.confidence === 'HIGH');

  // Log MEDIUM/LOW inline (do not write files)
  const skipped = proposals.filter((p) => p.confidence !== 'HIGH');
  if (skipped.length > 0) {
    console.log(`[researcher] Skipped ${skipped.length} MEDIUM/LOW proposals for "${articleTitle}":`);
    skipped.forEach((p) => console.log(`  - [${p.confidence}] ${p.targetFile}: ${p.why}`));
  }

  let written = 0;
  for (const proposal of highConfidence) {
    const targetSlug = proposal.targetFile.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const filePath = `intelligence/proposed-changes/${today}-${articleSlug}-${targetSlug}.md`;
    const content = buildProposedChangeMarkdown(proposal, articleTitle, today);

    try {
      await createFile(
        XHAKA_REPO,
        filePath,
        content,
        `researcher: propose change to ${proposal.targetFile} from "${articleTitle}"`,
      );
      console.log(`[researcher] ✓ Proposed change written: ${filePath}`);
      written++;
    } catch (err) {
      console.warn(`[researcher] Failed to write proposal ${filePath}:`, (err as Error).message);
    }
  }

  return written;
}
```

### 1d. Integration into `runResearcher()` — Add after article file is written (inside the `for` loop)

Insert after the digest append block and before `processed.push(item)`:

```typescript
      // Evaluate insights for behavioral impact
      const behaviorEval = await evaluateForBehavioralImpact(
        analysis.title,
        analysis.keyInsights,
        item.url,
      );

      const proposalCount = await writeProposedChanges(
        behaviorEval.proposals,
        analysis.title,
        slug,
        today,
      );

      if (proposalCount > 0) {
        console.log(`[researcher] → ${proposalCount} HIGH-confidence proposal(s) written for "${analysis.title}"`);
      }
```

---

## 2. OpenAI Prompt Design — Rationale

The prompt is designed with three constraints:

1. **Specificity over volume.** The system prompt explicitly instructs the model that "fewer, better proposals beat many weak ones." This prevents the model from generating a proposal for every insight.

2. **File-anchored thinking.** The system prompt names the exact core files. This grounds responses in real targets and prevents hallucinated file paths.

3. **Confidence calibration.** The three-tier confidence system (HIGH/MEDIUM/LOW) is defined with explicit criteria. HIGH requires "direct and unambiguous" mapping — this is the filter that prevents noise from reaching Xhaka's morning review.

**Token budget:** 2000 completion tokens. The prompt is ~600 tokens; this leaves ample room for 2-4 detailed proposals without overflow.

**Error posture:** On parse failure, the function logs a warning and returns an empty proposal set. It does NOT throw. The researcher job must not fail due to a behavioral evaluation parse error — article processing continues regardless.

---

## 3. File Structure for `intelligence/proposed-changes/`

```
intelligence/
  proposed-changes/
    README.md                          ← explains the review process (create once)
    2026-03-14-{article-slug}-soul-md.md
    2026-03-14-{article-slug}-routing-md.md
    approved/                          ← Builder moves files here after implementing
      2026-03-14-{slug}-implemented.md
    rejected/                          ← Xhaka moves rejected proposals here
      2026-03-14-{slug}-rejected.md
```

**`intelligence/proposed-changes/README.md` content:**
```markdown
# Proposed Changes

Auto-generated by the Researcher job when an article insight maps to a behavioral gap.

## Review Process
1. Xhaka reviews each morning (see HEARTBEAT.md)
2. Approved → route to Builder with file path + proposed change text
3. Rejected → move file to `rejected/` with a one-line comment
4. Implemented → Builder moves to `approved/` after commit

## Confidence Filter
Only HIGH confidence proposals are written here.
MEDIUM/LOW are logged in Railway but not persisted.
```

---

## 4. Xhaka Morning Routine — HEARTBEAT.md Addition

Add the following section to HEARTBEAT.md under the morning routine checklist:

```markdown
### 🔬 Proposed Changes Review
- [ ] Check `intelligence/proposed-changes/` for new files
- [ ] For each proposal: read Target File + Proposed Change + Why
- [ ] Decide: APPROVE or REJECT
  - APPROVE → route to Builder: "Implement proposed change at `[filePath]` — see proposal for exact text"
  - REJECT → move file to `intelligence/proposed-changes/rejected/` with a one-line note
- [ ] Log decision in today's `memory/YYYY-MM-DD.md`
```

**Placement:** After the article digest review step, before strategic priorities. These are low-stakes, small changes — should take < 5 minutes to review a typical batch of 0-2 proposals.

---

## 5. Approved Changes → Builder Flow

**Xhaka's routing message to Builder (template):**

```
Builder — implement a proposed change:

File: [targetFile from proposal]
Type: [addition / edit / new-section]

Current state:
[currentState block]

Proposed change:
[proposedChange block]

Why: [why sentence]

Source: intelligence/proposed-changes/[filename].md

After implementing: move the proposal file to intelligence/proposed-changes/approved/ and commit.
```

**Builder's expected actions:**
1. Open the target file (SOUL.md, ROUTING.md, etc.)
2. Apply the exact proposed change
3. Commit with message: `chore: apply proposed change to [targetFile] (from [articleTitle])`
4. Move proposal file to `intelligence/proposed-changes/approved/`
5. Report back to Xhaka with the commit SHA

**No approval gate on Builder's side** — Xhaka already approved before routing. Builder executes, does not re-evaluate.

---

## Summary Table

| Component | Location | Who creates |
|-----------|----------|-------------|
| `evaluateForBehavioralImpact()` | researcher.ts | Builder |
| `writeProposedChanges()` | researcher.ts | Builder |
| `buildProposedChangeMarkdown()` | researcher.ts | Builder |
| Proposal files | intelligence/proposed-changes/ | Researcher job (runtime) |
| README | intelligence/proposed-changes/README.md | Builder (one-time) |
| Morning review step | HEARTBEAT.md | Builder |
| Approved dir | intelligence/proposed-changes/approved/ | Builder (create dir) |
| Rejected dir | intelligence/proposed-changes/rejected/ | Builder (create dir) |
