// services/intelligence/src/jobs/librarian.ts
// The Librarian — daily knowledge graph audit.
//
// Responsibilities:
//   1. Flag pending items in article-inbox.md and book-inbox.md
//   2. Audit intelligence/proposed-changes/ for stale + banned content
//   3. Scan memory/context/ tree for non-compliant and misplaced knowledge files
//   4. Flag stale daily logs in memory/ (>30 days)
//   5. Alert if MEMORY.md approaches the 150-line limit
//   6. Write daily report to intelligence/librarian-reports/YYYY-MM-DD.md
//
// Never modifies content. Moves banned files to intelligence/rejected/ only.

import {
  getFileContent,
  listDirectory,
  createFile,
  updateFile,
  deleteFile,
} from '../lib/github.js';
import { markJobStart, markJobSuccess, markJobFailed } from '../utils/job-registry.js';
import { sendAlert } from '../utils/alert.js';

const XHAKA_REPO = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';
const DRY_RUN = process.env.DRY_RUN === 'true';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BANNED_KEYWORDS = [
  'polymarket',
  'betting',
  'kelly criterion',
  'prediction market',
  'prediction markets',
  'gambling',
];

const REQUIRED_FRONTMATTER = ['title', 'learned', 'source', 'tags'] as const;

// Files in memory/context/ that are exempt from compliance audits
const AUDIT_EXEMPT = new Set([
  'KNOWLEDGE-TEMPLATE.md',
  'INDEX.md',
  '.gitkeep',
  'operator-log.md', // operational log, not a knowledge file
]);

// Tag → subdirectory routing map
const TAG_TO_SUBDIR: Record<string, string> = {
  concept:        'concepts',
  framework:      'concepts',
  'mental-model': 'concepts',
  api:            'technology',
  tool:           'technology',
  technical:      'technology',
  platform:       'technology',
  workflow:       'workflows',
  process:        'workflows',
  procedure:      'workflows',
  sop:            'workflows',
  person:         'people',
  contact:        'people',
  team:           'people',
  book:           'books',
  playbook:       'playbooks',
  sim:            'sim',
  simulation:     'sim',
};

const MS_24H = 24 * 60 * 60 * 1000;
const MS_30D = 30 * 24 * 60 * 60 * 1000;
const MEMORY_MD_WARN_THRESHOLD = 140;
const MEMORY_MD_HARD_LIMIT = 150;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuditReport {
  date: string;
  articleInboxCount: number;
  bookInboxCount: number;
  proposedChangesStale: string[];
  bannedRejected: string[];
  nonCompliantFiles: Array<{ path: string; missingFields: string[] }>;
  misplacedFiles: Array<{ path: string; recommendedDir: string | null }>;
  staleMemoryLogs: string[];
  memoryMdLines: number;
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

export async function runLibrarian(): Promise<void> {
  const _startTime = await markJobStart('librarian');

  const report: AuditReport = {
    date: todayStr(),
    articleInboxCount: 0,
    bookInboxCount: 0,
    proposedChangesStale: [],
    bannedRejected: [],
    nonCompliantFiles: [],
    misplacedFiles: [],
    staleMemoryLogs: [],
    memoryMdLines: 0,
  };

  try {
    console.log(`[librarian] Starting audit for ${report.date}${DRY_RUN ? ' (DRY RUN)' : ''}...`);

    await auditArticleInbox(report);
    await auditBookInbox(report);
    await auditProposedChanges(report);
    await auditKnowledgeFiles(report);
    await auditStaleMemoryLogs(report);
    await checkMemoryMd(report);
    await writeReport(report);

    // Alert if MEMORY.md approaching limit
    if (report.memoryMdLines >= MEMORY_MD_WARN_THRESHOLD) {
      const emoji = report.memoryMdLines >= MEMORY_MD_HARD_LIMIT ? '🚨' : '⚠️';
      await sendAlert(
        `${emoji} *Librarian: MEMORY.md Alert*\n` +
        `${report.memoryMdLines} lines (limit: ${MEMORY_MD_HARD_LIMIT}).\n` +
        `Run the \`synthesize\` job to archive old entries.`,
      );
    }

    const totalIssues =
      report.proposedChangesStale.length +
      report.bannedRejected.length +
      report.nonCompliantFiles.length +
      report.misplacedFiles.length +
      report.staleMemoryLogs.length;

    console.log(
      `[librarian] Audit complete. ${totalIssues} issue(s) flagged. ` +
      `${report.bannedRejected.length} banned item(s) rejected. ` +
      `MEMORY.md: ${report.memoryMdLines} lines.`,
    );

    await markJobSuccess('librarian', _startTime);
  } catch (err) {
    console.error('[librarian] Fatal error:', err);
    await markJobFailed('librarian', _startTime);
    const errMsg = err instanceof Error ? err.message : String(err);
    await sendAlert(`🚨 *Librarian job failed*\n${errMsg}`);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// 1. Article inbox
// ---------------------------------------------------------------------------

async function auditArticleInbox(report: AuditReport): Promise<void> {
  try {
    const file = await getFileContent(XHAKA_REPO, 'intelligence/article-inbox.md');
    if (!file || !file.content.trim()) {
      console.log('[librarian] article-inbox.md is empty.');
      return;
    }
    const lines = file.content
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#') && !l.startsWith('<!--'));
    report.articleInboxCount = lines.length;
    if (lines.length > 0) {
      console.log(`[librarian] article-inbox.md has ${lines.length} pending item(s).`);
    }
  } catch (err) {
    console.warn('[librarian] Could not audit article-inbox.md:', (err as Error).message);
  }
}

// ---------------------------------------------------------------------------
// 2. Book inbox
// ---------------------------------------------------------------------------

async function auditBookInbox(report: AuditReport): Promise<void> {
  try {
    const file = await getFileContent(XHAKA_REPO, 'intelligence/book-inbox.md');
    if (!file || !file.content.trim()) {
      console.log('[librarian] book-inbox.md is empty.');
      return;
    }
    const lines = file.content
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#') && !l.startsWith('<!--'));
    report.bookInboxCount = lines.length;
    if (lines.length > 0) {
      console.log(`[librarian] book-inbox.md has ${lines.length} pending item(s).`);
    }
  } catch (err) {
    console.warn('[librarian] Could not audit book-inbox.md:', (err as Error).message);
  }
}

// ---------------------------------------------------------------------------
// 3. Proposed changes — flag stale, reject banned
// ---------------------------------------------------------------------------

async function auditProposedChanges(report: AuditReport): Promise<void> {
  try {
    const files = await listDirectory(XHAKA_REPO, 'intelligence/proposed-changes');
    const mdFiles = files.filter((f) => f.type === 'file' && f.name.endsWith('.md'));

    for (const f of mdFiles) {
      // Parse date from filename: YYYY-MM-DD-{slug}.md
      const dateMatch = f.name.match(/^(\d{4}-\d{2}-\d{2})/);
      if (dateMatch) {
        const fileDate = new Date(dateMatch[1]).getTime();
        if (Date.now() - fileDate > MS_24H) {
          // Read to check status and banned content
          const content = await getFileContent(XHAKA_REPO, f.path);
          if (!content) continue;

          const lc = content.content.toLowerCase();

          // Banned content check
          const foundBanned = BANNED_KEYWORDS.filter((kw) => lc.includes(kw));
          if (foundBanned.length > 0) {
            console.log(`[librarian] 🚫 Banned content in ${f.name}: ${foundBanned.join(', ')}`);
            await rejectBannedFile(f.path, f.sha, f.name, content.content, foundBanned, report);
            continue;
          }

          // Still pending after 24h
          if (lc.includes('status: pending') || lc.includes('**status:** pending')) {
            report.proposedChangesStale.push(f.name);
            console.log(`[librarian] ⏰ Stale proposed change: ${f.name}`);
          }
        } else {
          // File is recent — still check for banned content
          const content = await getFileContent(XHAKA_REPO, f.path);
          if (!content) continue;
          const lc = content.content.toLowerCase();
          const foundBanned = BANNED_KEYWORDS.filter((kw) => lc.includes(kw));
          if (foundBanned.length > 0) {
            console.log(`[librarian] 🚫 Banned content in new file ${f.name}: ${foundBanned.join(', ')}`);
            await rejectBannedFile(f.path, f.sha, f.name, content.content, foundBanned, report);
          }
        }
      }
    }
  } catch (err) {
    console.warn('[librarian] Could not audit proposed-changes:', (err as Error).message);
  }
}

async function rejectBannedFile(
  originalPath: string,
  sha: string,
  filename: string,
  content: string,
  keywords: string[],
  report: AuditReport,
): Promise<void> {
  const rejectedHeader =
    `# AUTO-REJECTED\n` +
    `Reason: banned content detected\n` +
    `Keywords found: ${keywords.join(', ')}\n` +
    `Original path: ${originalPath}\n` +
    `Rejected at: ${new Date().toISOString()}\n\n---\n\n`;

  const rejectedPath = `intelligence/rejected/${filename}`;

  if (DRY_RUN) {
    console.log(`[librarian] DRY RUN — would reject ${filename} → ${rejectedPath}`);
    report.bannedRejected.push(filename);
    return;
  }

  try {
    await createFile(
      XHAKA_REPO,
      rejectedPath,
      rejectedHeader + content,
      `librarian: auto-reject banned content — ${filename}`,
    );
    await deleteFile(
      XHAKA_REPO,
      originalPath,
      `librarian: remove banned content from proposed-changes — ${filename}`,
      sha,
    );
    report.bannedRejected.push(filename);
    console.log(`[librarian] ✓ Rejected ${filename} → ${rejectedPath}`);
  } catch (err) {
    console.error(`[librarian] Failed to reject ${filename}:`, (err as Error).message);
  }
}

// ---------------------------------------------------------------------------
// 4. Knowledge file compliance audit
// ---------------------------------------------------------------------------

async function auditKnowledgeFiles(report: AuditReport): Promise<void> {
  try {
    // Audit root-level memory/context/ files
    const rootFiles = await listDirectory(XHAKA_REPO, 'memory/context');
    const rootMdFiles = rootFiles.filter(
      (f) => f.type === 'file' && f.name.endsWith('.md') && !AUDIT_EXEMPT.has(f.name),
    );

    // Root-level .md files are misplaced (should be in a subdir)
    for (const f of rootMdFiles) {
      const content = await getFileContent(XHAKA_REPO, f.path);
      if (!content) continue;

      // Compliance check
      const missingFields = checkFrontmatterCompliance(content.content);
      if (missingFields.length > 0) {
        report.nonCompliantFiles.push({ path: f.path, missingFields });
      }

      // Misplacement check — any file in root should be in a subdir
      const recommendedDir = inferSubdir(content.content);
      report.misplacedFiles.push({ path: f.path, recommendedDir });
    }

    // Audit subdirectory files for compliance only
    const subdirs = rootFiles.filter((f) => f.type === 'dir' && f.name !== '.gitkeep');
    for (const subdir of subdirs) {
      try {
        const subFiles = await listDirectory(XHAKA_REPO, subdir.path);
        const subMdFiles = subFiles.filter(
          (f) => f.type === 'file' && f.name.endsWith('.md') && !AUDIT_EXEMPT.has(f.name),
        );
        for (const f of subMdFiles) {
          const content = await getFileContent(XHAKA_REPO, f.path);
          if (!content) continue;
          const missingFields = checkFrontmatterCompliance(content.content);
          if (missingFields.length > 0) {
            report.nonCompliantFiles.push({ path: f.path, missingFields });
          }
        }
      } catch {
        // Subdir read failure is non-fatal
      }
    }

    console.log(
      `[librarian] Knowledge audit: ${report.nonCompliantFiles.length} non-compliant, ` +
      `${report.misplacedFiles.length} misplaced.`,
    );
  } catch (err) {
    console.warn('[librarian] Could not audit knowledge files:', (err as Error).message);
  }
}

function checkFrontmatterCompliance(content: string): string[] {
  if (!content.startsWith('---')) return [...REQUIRED_FRONTMATTER];

  const endIdx = content.indexOf('---', 3);
  if (endIdx === -1) return [...REQUIRED_FRONTMATTER];

  const frontmatter = content.slice(3, endIdx).toLowerCase();
  return REQUIRED_FRONTMATTER.filter((field) => !frontmatter.includes(`${field}:`));
}

function inferSubdir(content: string): string | null {
  if (!content.startsWith('---')) return null;
  const endIdx = content.indexOf('---', 3);
  if (endIdx === -1) return null;

  const frontmatter = content.slice(3, endIdx).toLowerCase();
  const tagsMatch = frontmatter.match(/tags:\s*\[([^\]]*)\]/);
  if (!tagsMatch) return null;

  const tags = tagsMatch[1].split(',').map((t) => t.trim().replace(/['"]/g, ''));
  for (const tag of tags) {
    if (TAG_TO_SUBDIR[tag]) return TAG_TO_SUBDIR[tag];
  }
  return null;
}

// ---------------------------------------------------------------------------
// 5. Stale memory logs
// ---------------------------------------------------------------------------

async function auditStaleMemoryLogs(report: AuditReport): Promise<void> {
  try {
    const files = await listDirectory(XHAKA_REPO, 'memory');
    const logFiles = files.filter(
      (f) => f.type === 'file' && /^\d{4}-\d{2}-\d{2}\.md$/.test(f.name),
    );

    for (const f of logFiles) {
      const fileDate = new Date(f.name.replace('.md', '')).getTime();
      if (Date.now() - fileDate > MS_30D) {
        report.staleMemoryLogs.push(f.name);
      }
    }

    if (report.staleMemoryLogs.length > 0) {
      console.log(`[librarian] ${report.staleMemoryLogs.length} stale daily log(s) (>30 days) ready for archiving.`);
    }
  } catch (err) {
    console.warn('[librarian] Could not audit stale memory logs:', (err as Error).message);
  }
}

// ---------------------------------------------------------------------------
// 6. MEMORY.md line count
// ---------------------------------------------------------------------------

async function checkMemoryMd(report: AuditReport): Promise<void> {
  try {
    const file = await getFileContent(XHAKA_REPO, 'MEMORY.md');
    if (!file) {
      console.log('[librarian] MEMORY.md not found.');
      return;
    }
    report.memoryMdLines = file.content.split('\n').length;
    console.log(`[librarian] MEMORY.md: ${report.memoryMdLines} lines.`);
  } catch (err) {
    console.warn('[librarian] Could not check MEMORY.md:', (err as Error).message);
  }
}

// ---------------------------------------------------------------------------
// 7. Write daily report
// ---------------------------------------------------------------------------

async function writeReport(report: AuditReport): Promise<void> {
  const totalIssues =
    report.proposedChangesStale.length +
    report.bannedRejected.length +
    report.nonCompliantFiles.length +
    report.misplacedFiles.length +
    report.staleMemoryLogs.length;

  const memoryStatus =
    report.memoryMdLines >= MEMORY_MD_HARD_LIMIT ? '🚨 OVER LIMIT' :
    report.memoryMdLines >= MEMORY_MD_WARN_THRESHOLD ? '⚠️ APPROACHING LIMIT' :
    '✅ OK';

  const lines: string[] = [
    `# Librarian Audit — ${report.date}`,
    ``,
    `## Summary`,
    `- **Total issues flagged:** ${totalIssues}`,
    `- **Banned items auto-rejected:** ${report.bannedRejected.length}`,
    `- **MEMORY.md lines:** ${report.memoryMdLines} ${memoryStatus}`,
    `- **Generated at:** ${new Date().toISOString()}`,
    ``,
    `## Article Inbox`,
    report.articleInboxCount > 0
      ? `- ⏳ ${report.articleInboxCount} item(s) pending researcher processing`
      : `- ✅ Empty`,
    ``,
    `## Book Inbox`,
    report.bookInboxCount > 0
      ? `- ⏳ ${report.bookInboxCount} item(s) pending routing to memory/context/books/`
      : `- ✅ Empty`,
    ``,
    `## Proposed Changes`,
    `### Stale (>24h, still Pending)`,
    ...(report.proposedChangesStale.length > 0
      ? report.proposedChangesStale.map((f) => `- ⏰ ${f}`)
      : ['- ✅ None']),
    `### Banned & Auto-Rejected`,
    ...(report.bannedRejected.length > 0
      ? report.bannedRejected.map((f) => `- 🚫 ${f} → intelligence/rejected/`)
      : ['- ✅ None']),
    ``,
    `## Knowledge Compliance`,
    `### Non-Compliant Files (missing frontmatter)`,
    ...(report.nonCompliantFiles.length > 0
      ? report.nonCompliantFiles.map(
          ({ path, missingFields }) =>
            `- ⚠️ \`${path}\` — non-compliant, needs metadata (missing: ${missingFields.join(', ')})`,
        )
      : ['- ✅ All files compliant']),
    `### Misplaced Files (in memory/context/ root, should be in a subdirectory)`,
    ...(report.misplacedFiles.length > 0
      ? report.misplacedFiles.map(
          ({ path, recommendedDir }) =>
            `- 📁 \`${path}\` → recommended: \`memory/context/${recommendedDir ?? 'unknown — needs tags'}/\``,
        )
      : ['- ✅ No misplaced files']),
    ``,
    `## Memory Housekeeping`,
    `- **MEMORY.md:** ${report.memoryMdLines} lines ${memoryStatus}`,
    `### Stale Daily Logs (>30 days, ready to archive to memory/archive/)`,
    ...(report.staleMemoryLogs.length > 0
      ? report.staleMemoryLogs.map((f) => `- 🗓️ memory/${f}`)
      : ['- ✅ None']),
  ];

  const content = lines.join('\n') + '\n';
  const reportPath = `intelligence/librarian-reports/${report.date}.md`;

  if (DRY_RUN) {
    console.log(`[librarian] DRY RUN — would write report to ${reportPath}`);
    return;
  }

  // Check if a report already exists today (overwrite if so)
  const existing = await getFileContent(XHAKA_REPO, reportPath);
  if (existing) {
    await updateFile(
      XHAKA_REPO,
      reportPath,
      content,
      `librarian: update audit report ${report.date}`,
      existing.sha,
    );
  } else {
    await createFile(
      XHAKA_REPO,
      reportPath,
      content,
      `librarian: daily audit report ${report.date}`,
    );
  }

  console.log(`[librarian] ✓ Report written to ${reportPath}`);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}
