// services/intelligence/src/jobs/auditor.ts
// Auditor — verifies a build after a code change is pushed
//
// Triggered by: task-queue when a commit lands on main
// Proof of Work: commit audit summary written to intelligence/audits/YYYY-MM-DD-<sha>.md

import { getFileContent, getRecentCommits, createFile, getCommitDiff } from '../lib/github.js';
import { synthesize } from '../lib/openai.js';
import { sendTelegram } from '../utils/notifier.js';

const REPO = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';
const AUDIT_DIR = 'intelligence/audits';
const RULES_PATH = 'RULES.md';

// Patterns for docs-only files — no real code, skip auditing
const DOCS_ONLY_PATTERNS = [
  /\.md$/i,
  /\.gitkeep$/,
  /^intelligence\//,         // audit/memory artifacts
  /package-lock\.json$/,
  /\.json$/i,                // data/config JSON files
];

function isDocsOnly(filenames: string[]): boolean {
  if (filenames.length === 0) return true;
  return filenames.every((f) => DOCS_ONLY_PATTERNS.some((p) => p.test(f)));
}

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

interface AuditPayload {
  commitSha?: string;
  commitMessage?: string;
  author?: string;
  triggeredAt?: string;
}

interface AuditResult {
  commitSha: string;
  verdict: 'PASS' | 'WARN' | 'FAIL' | 'SKIPPED';
  summary: string;
  concerns: string[];
  recommendations: string[];
  auditedAt: string;
}

// ----------------------------------------------------------------------------
// Main
// ----------------------------------------------------------------------------

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
      commitSha = latest.sha; // keep full SHA for diff API call
      commitMessage = latest.message;
      author = latest.author;
    }
  }

  console.log(`[auditor] Auditing commit: ${commitSha.slice(0, 8)} — "${commitMessage}" by ${author}`);

  // 2. Fetch the actual commit diff
  const diffData = await getCommitDiff(REPO_ENV, commitSha);

  // 3. Skip if diff unavailable or docs-only
  if (!diffData || diffData.files.length === 0) {
    console.log('[auditor] No diff available — skipping.');
    return `skipped: docs-only commit (no diff for ${commitSha.slice(0, 8)})`;
  }

  const changedFiles = diffData.files.map((f) => f.filename);
  if (isDocsOnly(changedFiles)) {
    console.log(`[auditor] Docs-only commit (${changedFiles.join(', ')}) — skipping.`);
    return `skipped: docs-only commit (${commitSha.slice(0, 8)})`;
  }

  console.log(`[auditor] Diff fetched: ${diffData.files.length} file(s) changed — proceeding with audit.`);

  // 4. Build the diff text for the prompt (cap at 6000 chars to avoid token overflow)
  const diffText = diffData.files
    .map((f) => {
      const patch = f.patch ? `\n${f.patch}` : ' (binary or no patch)';
      return `--- ${f.filename} (${f.status}, +${f.additions}/-${f.deletions})${patch}`;
    })
    .join('\n\n')
    .slice(0, 6000);

  // 5. Load RULES.md for compliance context
  let rules = '';
  const rulesFile = await getFileContent(REPO_ENV, RULES_PATH);
  if (rulesFile) {
    rules = rulesFile.content.slice(0, 2000); // Cap to avoid token overflow
  }

  // 6. Ask OpenAI to audit the actual diff
  const systemPrompt = `You are the Auditor for the Xhaka AI system. You review ACTUAL code diffs — not commit messages. Be specific. Be direct. No hallucinations.

${rules ? `## RULES.md (excerpt)\n${rules}` : 'No RULES.md found — apply general software quality standards.'}

You will receive the real git diff. Audit it for:
- Hardcoded secrets, API keys, or credentials
- Missing error handling (unhandled promise rejections, missing try/catch)
- Circular dependencies introduced
- Missing tenantId enforcement on multi-tenant routes/queries
- TypeScript type errors or unsafe \`any\` casts
- Missing job-registry entries for new jobs

Be specific — cite file names and line numbers from the diff. If no real issues found, verdict is PASS.

IMPORTANT: Only return FAIL if there is a genuine, concrete problem in the diff. Do not WARN on speculative or minor style issues. PASS means clean code, FAIL means real problem found.

Return a structured JSON object with: verdict (PASS/FAIL), summary, concerns (array), recommendations (array).`;

  const userPrompt = `Commit: ${commitSha.slice(0, 8)}
Author: ${author}
Message: ${commitMessage}

Here is the actual code diff:

${diffText}

Audit this diff. Be specific — cite file names and line numbers. Verdict must be PASS or FAIL only.`;

  let auditResult: AuditResult;

  try {
    const raw = await synthesize(systemPrompt, userPrompt, 1000);

    // Parse JSON from response
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      // Normalize: treat WARN as PASS (we only care about real failures)
      const rawVerdict: string = (parsed.verdict ?? 'PASS').toUpperCase();
      const verdict = rawVerdict === 'FAIL' ? 'FAIL' : 'PASS';
      auditResult = {
        commitSha,
        verdict,
        summary: parsed.summary ?? 'Audit completed.',
        concerns: parsed.concerns ?? [],
        recommendations: parsed.recommendations ?? [],
        auditedAt: new Date().toISOString(),
      };
    } else {
      auditResult = {
        commitSha,
        verdict: 'PASS',
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

  // 7. Write audit artifact to repo
  const today = new Date().toISOString().slice(0, 10);
  const auditPath = `${AUDIT_DIR}/${today}-${commitSha.slice(0, 8)}.md`;

  const verdictEmoji = auditResult.verdict === 'PASS' ? '✅' : auditResult.verdict === 'FAIL' ? '🚨' : '⚠️';

  const auditDoc = `# Audit: ${commitSha.slice(0, 8)}

## Metadata
- **Commit:** ${commitSha}
- **Message:** ${commitMessage}
- **Author:** ${author}
- **Verdict:** ${verdictEmoji} ${auditResult.verdict}
- **Audited At:** ${auditResult.auditedAt}
- **Files Changed:** ${changedFiles.join(', ')}

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

  // 8. Notify Corey ONLY on FAIL — not on WARN or PASS
  if (auditResult.verdict === 'FAIL') {
    const msg = `${verdictEmoji} *Auditor Report* — Commit \`${commitSha.slice(0, 8)}\`\n\n*Verdict:* FAIL\n\n${auditResult.summary}\n\n${auditResult.concerns.length > 0 ? '*Concerns:*\n' + auditResult.concerns.map((c) => `• ${c}`).join('\n') : ''}`;
    await sendTelegram(msg);
  }

  console.log(`[auditor] ✓ Audit complete: ${auditResult.verdict} — ${auditPath}`);

  return `Audit ${auditResult.verdict} for commit ${commitSha.slice(0, 8)}. ${auditResult.concerns.length} concern(s). Artifact: ${auditPath}`;
}
