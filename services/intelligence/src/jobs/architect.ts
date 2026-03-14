// services/intelligence/src/jobs/architect.ts
// Architect — drafts a spec when a high-level goal lands in the inbox
//
// Triggered by: task-queue when capture detects an inbox file with type=goal
// Proof of Work: spec written to intelligence/specs/YYYY-MM-DD-<slug>.md

import { createFile } from '../lib/github.js';
import { synthesize } from '../lib/openai.js';
import { sendTelegram } from '../utils/notifier.js';

const REPO = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';
const SPECS_DIR = 'intelligence/specs';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ArchitectPayload {
  goalTitle?: string;
  goalBody?: string;
  sourceFile?: string;
  project?: string;
}

interface Spec {
  title: string;
  objective: string;
  background: string;
  successCriteria: string[];
  outOfScope: string[];
  proposedApproach: string;
  openQuestions: string[];
  estimatedComplexity: 'LOW' | 'MEDIUM' | 'HIGH';
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export async function runArchitect(payload: Record<string, unknown> = {}): Promise<string> {
  const p = payload as ArchitectPayload;

  if (!p.goalTitle && !p.goalBody) {
    throw new Error('[architect] No goal provided in payload');
  }

  const goalTitle = p.goalTitle ?? 'Untitled Goal';
  const goalBody = p.goalBody ?? '';
  const project = p.project ?? 'general';

  console.log(`[architect] Drafting spec for: "${goalTitle}" (project: ${project})`);

  // 1. Ask OpenAI to draft the spec
  const systemPrompt = `You are the Architect for the Xhaka AI system — a wholesale real estate operations platform. Your job is to take a high-level goal and draft a clear technical spec for the engineering team.

The system is built on:
- Railway (Node.js/TypeScript backend)
- GitHub as the data store (JSON files, markdown)
- Telegram for notifications
- OpenAI for intelligence tasks

Write specs that are:
- Concrete and actionable
- Scoped to what the Builder (Claude Code) can implement in one session
- Focused on solving Corey's real business problems

Return a JSON object with: title, objective, background, successCriteria (array), outOfScope (array), proposedApproach, openQuestions (array), estimatedComplexity (LOW/MEDIUM/HIGH).`;

  const userPrompt = `Draft a spec for this goal:

**Title:** ${goalTitle}
**Project:** ${project}

**Goal Description:**
${goalBody || '(no additional details provided)'}

Produce a complete technical spec.`;

  let spec: Spec;

  try {
    const raw = await synthesize(systemPrompt, userPrompt, 1200);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      spec = {
        title: parsed.title ?? goalTitle,
        objective: parsed.objective ?? '',
        background: parsed.background ?? '',
        successCriteria: parsed.successCriteria ?? [],
        outOfScope: parsed.outOfScope ?? [],
        proposedApproach: parsed.proposedApproach ?? '',
        openQuestions: parsed.openQuestions ?? [],
        estimatedComplexity: parsed.estimatedComplexity ?? 'MEDIUM',
      };
    } else {
      // Fallback: use raw text as the spec
      spec = {
        title: goalTitle,
        objective: goalBody,
        background: 'Auto-generated spec.',
        successCriteria: [],
        outOfScope: [],
        proposedApproach: raw.slice(0, 1000),
        openQuestions: [],
        estimatedComplexity: 'MEDIUM',
      };
    }
  } catch (err) {
    console.error('[architect] OpenAI call failed:', err);
    // Produce a skeleton spec that Corey can fill in
    spec = {
      title: goalTitle,
      objective: goalBody,
      background: 'OpenAI unavailable — skeleton spec generated.',
      successCriteria: ['TBD'],
      outOfScope: ['TBD'],
      proposedApproach: 'Manual spec required.',
      openQuestions: ['Review goal and fill in details'],
      estimatedComplexity: 'MEDIUM',
    };
  }

  // 2. Write spec to repo
  const today = new Date().toISOString().slice(0, 10);
  const slug = goalTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

  const specPath = `${SPECS_DIR}/${today}-${slug}.md`;

  const complexityEmoji: Record<string, string> = { LOW: '🟢', MEDIUM: '🟡', HIGH: '🔴' };
  const cEmoji = complexityEmoji[spec.estimatedComplexity] ?? '🟡';

  const specDoc = `# Spec: ${spec.title}

## Metadata
- **Date:** ${today}
- **Project:** ${project}
- **Complexity:** ${cEmoji} ${spec.estimatedComplexity}
- **Source:** ${p.sourceFile ?? 'inbox'}

## Objective
${spec.objective}

## Background
${spec.background}

## Success Criteria
${spec.successCriteria.length > 0 ? spec.successCriteria.map((s) => `- [ ] ${s}`).join('\n') : '_TBD_'}

## Out of Scope
${spec.outOfScope.length > 0 ? spec.outOfScope.map((s) => `- ${s}`).join('\n') : '_TBD_'}

## Proposed Approach
${spec.proposedApproach}

## Open Questions
${spec.openQuestions.length > 0 ? spec.openQuestions.map((q) => `- ${q}`).join('\n') : '_None_'}
`;

  await createFile(
    REPO,
    specPath,
    specDoc,
    `architect: spec "${spec.title}" [${spec.estimatedComplexity}]`,
  );

  // 3. Notify Corey
  const msg = `🎨 *Architect — New Spec Drafted*\n\n*Goal:* ${spec.title}\n*Complexity:* ${cEmoji} ${spec.estimatedComplexity}\n*Project:* ${project}\n\n${spec.objective.slice(0, 200)}\n\n📄 Spec: \`${specPath}\``;
  await sendTelegram(msg);

  console.log(`[architect] ✓ Spec written: ${specPath}`);

  return `Spec drafted for "${spec.title}" [${spec.estimatedComplexity}]. Artifact: ${specPath}`;
}
