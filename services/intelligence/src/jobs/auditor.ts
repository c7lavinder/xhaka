// services/intelligence/src/jobs/auditor.ts
// Auditor — verifies a build after a code change is pushed
//
// Triggered by: task-queue when a commit lands on main
// Proof of Work: commit audit summary written to intelligence/audits/YYYY-MM-DD-<sha>.md

import { getFileContent, getRecentCommits, createFile } from '../lib/github.js';
import { synthesize } from '../lib/openai.js';
import { sendTelegram } from '../utils/notifier.js';

const REPO = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';
const AUDIT_DIR = 'intelligence/audits';
const RULES_PATH = 'RULES.md';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuditPayload {
  commitSha?: string;
  commitMessage?: string;
  author?: string;
  triggeredAt?: string;
}

interface AuditResult {
  commitSha: string;
  verdict: 'PASS' | 'WARN' | 'FAIL';
  summary: string;
  concerns: string[];
  recommendations: string[];
  auditedAt: string;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export async function runAuditor(payload: Record<string, unknown> = {}): Promise<string> {
  const p = payload as AuditPayload;

  console.log('[auditor] Starting build verification...');

  const REPO_ENV = REPO;

  // 1. Resolve commit to audit
  let commitSha = p.commitSha ?? 'HEAD';
  let commitMessage = p.commitMessage ?? '';
  let author = p.author ?? 'unknown';

  // If no specific commit provided, grab the latest commit
  if (!p.commitSha) {
    const since = new Date(Date.now() - 2 * 60 * 60 * 1000); // last 2 hours
    const commits = await getRecentCommits(REPO_ENV, since);
    if (commits.length > 0) {
      const latest = commits[0];
      commitSha = latest.sha.slice(0, 8);
      commitMessage = latest.message;
      author = latest.author;
    }
  }

  console.log(`[auditor] Auditing commit: ${commitSha} — "${commitMessage}" by ${author}`);

  // 2. Load RULES.md for compliance check
  let rules = '';
  const rulesFile = await getFileContent(REPO_ENV, RULES_PATH);
  if (rulesFile) {
    rules = rulesFile.content.slice(0, 3000); // Cap to avoid token overflow
  }

  // 3. Ask OpenAI to audit the commit against the rules
  const systemPrompt = `You are the Auditor for the Xhaka AI system. Your job is to review code changes and ensure they comply with the system's rules and standards.

${rules ? `## RULES.md (excerpt)\n${rules}` : 'No RULES.md found — apply general software quality standards.'}

When auditing, check for:
- Hardcoded secrets or credentials
- Circular dependencies
- Missing error handling
- Breaking changes to core interfaces
- DRY violations
- Missing job-registry entries for new jobs
- Any obvious bugs or regressions

Return a structured JSON object with: verdict (PASS/WARN/FAIL), summary, concerns (array), recommendations (array).`;

  const userPrompt = `Audit this commit:

SHA: ${commitSha}
Author: ${author}
Message: ${commitMessage}

Provide your audit verdict and findings.`;

  let auditResult: AuditResult;

  try {
    const raw = await synthesize(systemPrompt, userPrompt, 800);

    // Parse JSON from response
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      auditResult = {
        commitSha,
        verdict: parsed.verdict ?? 'WARN',
        summary: parsed.summary ?? 'Audit completed.',
        concerns: parsed.concerns ?? [],
        recommendations: parsed.recommendations ?? [],
        auditedAt: new Date().toISOString(),
      };
    } else {
      auditResult = {
        commitSha,
        verdict: 'WARN',
        summary: raw.slice(0, 500),
        concerns: [],
        recommendations: [],
        auditedAt: new Date().toISOString(),
      };
    }
  } catch (err) {
    console.error('[auditor] OpenAI call failed:', err);
    auditResult = {
      commitSha,
      verdict: 'WARN',
      summary: 'Audit could not complete — OpenAI unavailable. Manual review required.',
      concerns: ['Automated audit skipped due to API error'],
      recommendations: ['Review commit manually'],
      auditedAt: new Date().toISOString(),
    };
  }

  // 4. Write audit artifact to repo
  const today = new Date().toISOString().slice(0, 10);
  const auditPath = `${AUDIT_DIR}/${today}-${commitSha.slice(0, 8)}.md`;

  const verdictEmoji = auditResult.verdict === 'PASS' ? '✅' : auditResult.verdict === 'WARN' ? '⚠️' : '🚨';

  const auditDoc = `# Audit: ${commitSha.slice(0, 8)}

## Metadata
- **Commit:** ${commitSha}
- **Message:** ${commitMessage}
- **Author:** ${author}
- **Verdict:** ${verdictEmoji} ${auditResult.verdict}
- **Audited At:** ${auditResult.auditedAt}

## Summary
${auditResult.summary}

## Concerns
${auditResult.concerns.length > 0 ? auditResult.concerns.map((c) => `- ${c}`).join('\n') : '_None identified._'}

## Recommendations
${auditResult.recommendations.length > 0 ? auditResult.recommendations.map((r) => `- ${r}`).join('\n') : '_No action required._'}
`;

  await createFile(
    REPO_ENV,
    auditPath,
    auditDoc,
    `auditor: audit ${commitSha.slice(0, 8)} — ${auditResult.verdict}`,
  );

  // 5. Notify Corey if WARN or FAIL
  if (auditResult.verdict !== 'PASS') {
    const msg = `${verdictEmoji} *Auditor Report* — Commit \`${commitSha.slice(0, 8)}\`\n\n*Verdict:* ${auditResult.verdict}\n\n${auditResult.summary}\n\n${auditResult.concerns.length > 0 ? '*Concerns:*\n' + auditResult.concerns.map((c) => `• ${c}`).join('\n') : ''}`;
    await sendTelegram(msg);
  }

  console.log(`[auditor] ✓ Audit complete: ${auditResult.verdict} — ${auditPath}`);

  return `Audit ${auditResult.verdict} for commit ${commitSha.slice(0, 8)}. ${auditResult.concerns.length} concern(s). Artifact: ${auditPath}`;
}
