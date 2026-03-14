// services/intelligence/src/jobs/tool-monitor.ts
// Daily job: scan both repos' package.json, check GitHub Releases RSS for known packages,
// check SaaS changelogs, drop findings to intelligence/inbox/

import { getFileContent, createFile, updateFile, listDirectory } from '../lib/github.js';
import { fetchText } from '../lib/http.js';
import { markJobStart, markJobSuccess, markJobFailed } from '../utils/job-registry.js';

const XHAKA_REPO = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';
const GUNNER_REPO = process.env.GUNNER_REPO ?? 'c7lavinder/Gunner';
const TOOLS_STATE_PATH = 'memory/context/tools/.last-scan.json';
const INBOX_PATH = 'intelligence/inbox';

// ── Changelog URLs ──────────────────────────────────────────────────
const CHANGELOG_SOURCES = [
  {
    id: 'gohighlevel',
    name: 'GoHighLevel',
    url: 'https://changelog.gohighlevel.com',
    type: 'html',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    url: 'https://platform.openai.com/docs/changelog',
    type: 'html',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    url: 'https://www.anthropic.com/news',
    type: 'html',
  },
  {
    id: 'posthog',
    name: 'PostHog',
    url: 'https://posthog.com/changelog',
    type: 'html',
  },
  {
    id: 'railway',
    name: 'Railway',
    url: 'https://railway.app/changelog',
    type: 'html',
  },
];

// ── Main entry ──────────────────────────────────────────────────────
export async function runToolMonitor(): Promise<void> {
  const _startTime = await markJobStart('tool-monitor');
  try {
    console.log('[tool-monitor] Starting daily tool scan...');

    // 1. Load last-scan state
    const stateFile = await getFileContent(XHAKA_REPO, TOOLS_STATE_PATH);
    const state: LastScanState = stateFile
      ? JSON.parse(stateFile.content)
      : { lastRunAt: null, versions: {}, changelogChecked: {} };
    const stateSha = stateFile?.sha ?? null;
    // Defensive defaults — guard against schema mismatch in persisted state
    state.versions = state.versions ?? {};
    state.changelogChecked = state.changelogChecked ?? {};

    const findings: Finding[] = [];

    // 2. Scan package.json deps in both repos
    const xhakaDeps = await getPackageJsonDeps(XHAKA_REPO);
    const gunnerDeps = await getPackageJsonDeps(GUNNER_REPO);
    const allDeps = mergeDeps(xhakaDeps, gunnerDeps);

    console.log(`[tool-monitor] Found ${Object.keys(allDeps).length} total deps across both repos.`);

    // 3. For each dep, check GitHub Releases RSS for new version
    for (const [pkg, currentVersion] of Object.entries(allDeps)) {
      const knownVersion = state.versions[pkg];
      const repoSlug = npmPkgToGitHubRepo(pkg);
      if (!repoSlug) continue;

      const latestVersion = await getLatestVersionFromRSS(repoSlug);
      if (!latestVersion) continue;

      if (knownVersion && latestVersion !== knownVersion) {
        findings.push({
          type: 'dep-update',
          package: pkg,
          fromVersion: knownVersion,
          toVersion: latestVersion,
          rssUrl: `https://github.com/${repoSlug}/releases.atom`,
        });
        console.log(`[tool-monitor] Update detected: ${pkg} ${knownVersion} → ${latestVersion}`);
      }

      // Update state with current latest
      state.versions[pkg] = latestVersion;
    }

    // 4. Check changelog URLs for service tools
    for (const source of CHANGELOG_SOURCES) {
      const lastChecked = state.changelogChecked[source.id]
        ? new Date(state.changelogChecked[source.id])
        : null;

      const content = await fetchText(source.url);
      if (!content) {
        console.warn(`[tool-monitor] Could not fetch changelog for ${source.name}`);
        continue;
      }

      // Heuristic: look for date strings newer than lastChecked in the page content
      const hasNewContent = detectNewChangelogContent(content, lastChecked);
      if (hasNewContent) {
        findings.push({
          type: 'changelog-update',
          service: source.name,
          url: source.url,
          detectedAt: new Date().toISOString(),
        });
        console.log(`[tool-monitor] Changelog activity detected: ${source.name}`);
      }

      state.changelogChecked[source.id] = new Date().toISOString();
    }

    // 5. Write findings to intelligence/inbox/
    if (findings.length > 0) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const fileName = `tool-monitor-${timestamp}.md`;
      const filePath = `${INBOX_PATH}/${fileName}`;
      const content = buildInboxFile(findings, timestamp);

      await createFile(
        XHAKA_REPO,
        filePath,
        content,
        `tool-monitor: ${findings.length} update(s) detected`,
      );
      console.log(`[tool-monitor] Dropped ${findings.length} finding(s) → ${filePath}`);
    } else {
      console.log('[tool-monitor] No updates detected.');
    }

    // 6. Save updated state
    state.lastRunAt = new Date().toISOString();
    const stateContent = JSON.stringify(state, null, 2);
    if (stateSha) {
      await updateFile(
        XHAKA_REPO,
        TOOLS_STATE_PATH,
        stateContent,
        'tool-monitor: update last-scan state',
        stateSha,
      );
    } else {
      await createFile(
        XHAKA_REPO,
        TOOLS_STATE_PATH,
        stateContent,
        'tool-monitor: initialize last-scan state',
      );
    }

    // 7. Write latest-update.md for each category
    const depUpdateCount = findings.filter(f => f.type === 'dep-update').length;
    await writeLatestUpdateFile('packages', `Last scanned: ${new Date().toISOString()}\nDeps checked: ${Object.keys(allDeps).length}\nUpdates found: ${depUpdateCount}\n`);
    for (const source of CHANGELOG_SOURCES) {
      const hasActivity = findings.some(f => f.type === 'changelog-update' && (f as ChangelogFinding).service === source.name);
      await writeLatestUpdateFile(source.id, `Last scanned: ${new Date().toISOString()}\nService: ${source.name}\nChangelog activity: ${hasActivity ? 'YES — new content detected' : 'none detected'}\n`);
    }

        console.log('[tool-monitor] Done.');

    await markJobSuccess('tool-monitor', _startTime);
  } catch (err) {
    console.error('[tool-monitor] Fatal error:', err);
    await markJobFailed('tool-monitor', _startTime);
    throw err;
  }
}

// ── Helpers ─────────────────────────────────────────────────────────

async function getPackageJsonDeps(repo: string): Promise<Record<string, string>> {
  // Fetch root package.json
  const rootPkg = await getFileContent(repo, 'package.json');
  const deps: Record<string, string> = {};

  if (rootPkg) {
    const parsed = JSON.parse(rootPkg.content);
    Object.assign(deps, parsed.dependencies ?? {}, parsed.devDependencies ?? {});
  }

  // Also check services/*/package.json (one level deep)
  const serviceEntries = await listDirectory(repo, 'services');
  for (const entry of serviceEntries) {
    if (entry.type !== 'dir') continue;
    const svcPkg = await getFileContent(repo, `services/${entry.name}/package.json`);
    if (!svcPkg) continue;
    try {
      const parsed = JSON.parse(svcPkg.content);
      Object.assign(deps, parsed.dependencies ?? {}, parsed.devDependencies ?? {});
    } catch {
      // Skip malformed package.json
    }
  }

  return deps;
}

function mergeDeps(...depMaps: Record<string, string>[]): Record<string, string> {
  // Last write wins on version conflicts — flag if different versions exist
  const merged: Record<string, string> = {};
  for (const deps of depMaps) {
    for (const [k, v] of Object.entries(deps)) {
      // Strip semver range prefix (^, ~, >=) for clean version string
      merged[k] = v.replace(/^[\^~>=]+/, '');
    }
  }
  return merged;
}

// Maps npm package name to GitHub owner/repo slug for RSS
// Extend this map as needed
const NPM_TO_GITHUB: Record<string, string> = {
  'openai':                'openai/openai-node',
  '@supabase/supabase-js': 'supabase/supabase-js',
  '@trpc/server':          'trpc/trpc',
  '@trpc/client':          'trpc/trpc',
  'zod':                   'colinhacks/zod',
  'express':               'expressjs/express',
  '@octokit/rest':         'octokit/octokit.js',
  'node-cron':             'node-cron/node-cron',
  'jose':                  'panva/jose',
  'jsonwebtoken':          'auth0/node-jsonwebtoken',
  'posthog-node':          'PostHog/posthog-node',
  '@sentry/node':          'getsentry/sentry-javascript',
  'prisma':                'prisma/prisma',
  '@prisma/client':        'prisma/prisma',
  'drizzle-orm':           'drizzle-team/drizzle-orm',
};

function npmPkgToGitHubRepo(pkg: string): string | null {
  return NPM_TO_GITHUB[pkg] ?? null;
}

async function getLatestVersionFromRSS(repoSlug: string): Promise<string | null> {
  // Fetch https://github.com/{owner}/{repo}/releases.atom
  const url = `https://github.com/${repoSlug}/releases.atom`;
  const xml = await fetchText(url);
  if (!xml) return null;

  // Parse first <title> inside first <entry> — format: "v1.2.3" or "1.2.3"
  // Simple regex approach (no XML parser dep needed):
  const entryMatch = xml.match(/<entry>[\s\S]*?<title[^>]*>(.*?)<\/title>/);
  if (!entryMatch) return null;

  const raw = entryMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/, '$1').trim();
  // Strip leading "v" if present
  return raw.replace(/^v/, '');
}

function detectNewChangelogContent(html: string, lastChecked: Date | null): boolean {
  if (!lastChecked) return false; // First run — don't flood inbox

  // Look for date strings in the HTML newer than lastChecked
  // Match patterns: "March 10, 2026", "2026-03-10", "Mar 10 2026"
  const datePatterns = [
    /(\d{4}-\d{2}-\d{2})/g,
    /([A-Z][a-z]+ \d{1,2},? \d{4})/g,
  ];

  for (const pattern of datePatterns) {
    const matches = html.matchAll(pattern);
    for (const match of matches) {
      const d = new Date(match[1]);
      if (!isNaN(d.getTime()) && d > lastChecked) {
        return true;
      }
    }
  }
  return false;
}

function buildInboxFile(findings: Finding[], timestamp: string): string {
  const depUpdates = findings.filter(f => f.type === 'dep-update');
  const changelogUpdates = findings.filter(f => f.type === 'changelog-update');

  const lines = [
    `---`,
    `project: xhaka`,
    `date: ${timestamp.slice(0, 10)}`,
    `tags: [tool-update, automated]`,
    `source: tool-monitor-job`,
    `---`,
    ``,
    `# Tool Monitor Report — ${timestamp.slice(0, 10)}`,
    ``,
    `Automated daily scan detected ${findings.length} update(s).`,
    ``,
  ];

  if (depUpdates.length > 0) {
    lines.push(`## Dependency Updates`);
    lines.push(``);
    for (const f of depUpdates as DepUpdateFinding[]) {
      lines.push(`### \`${f.package}\``);
      lines.push(`- **From:** ${f.fromVersion}`);
      lines.push(`- **To:** ${f.toVersion}`);
      lines.push(`- **Releases:** ${f.rssUrl.replace('.atom', '')}`);
      lines.push(``);
    }
  }

  if (changelogUpdates.length > 0) {
    lines.push(`## Service Changelog Activity`);
    lines.push(``);
    for (const f of changelogUpdates as ChangelogFinding[]) {
      lines.push(`### ${f.service}`);
      lines.push(`- **Changelog:** ${f.url}`);
      lines.push(`- **Detected:** ${f.detectedAt}`);
      lines.push(``);
    }
  }

  lines.push(`---`);
  lines.push(`_Run the "Deep Research" button in the Control Room Tools panel for full analysis._`);

  return lines.join('\n');
}


// ── Latest-Update Writers ────────────────────────────────────────────

async function writeLatestUpdateFile(category: string, content: string): Promise<void> {
  try {
    const path = `memory/context/tools/${category}/latest-update.md`;
    const existing = await getFileContent(XHAKA_REPO, path);
    if (existing) {
      await updateFile(XHAKA_REPO, path, content, `tool-monitor: update ${category} latest-update`, existing.sha);
    } else {
      await createFile(XHAKA_REPO, path, content, `tool-monitor: init ${category} latest-update`);
    }
    console.log(`[tool-monitor] Wrote latest-update.md for category: ${category}`);
  } catch (err) {
    console.warn(`[tool-monitor] Failed to write latest-update for ${category}:`, (err as Error).message);
  }
}

// ── Types ────────────────────────────────────────────────────────────

interface LastScanState {
  lastRunAt: string | null;
  versions: Record<string, string>;
  changelogChecked: Record<string, string>;
}

type Finding = DepUpdateFinding | ChangelogFinding;

interface DepUpdateFinding {
  type: 'dep-update';
  package: string;
  fromVersion: string;
  toVersion: string;
  rssUrl: string;
}

interface ChangelogFinding {
  type: 'changelog-update';
  service: string;
  url: string;
  detectedAt: string;
}
