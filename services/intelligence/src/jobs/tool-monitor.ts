// services/intelligence/src/jobs/tool-monitor.ts
// Daily job: scan both repos' package.json, check GitHub Releases for known packages,
// check SaaS changelogs, drop findings to intelligence/inbox/ + data/tool-monitor-results.md
//
// FIX (2026-03-16):
//   - Added direct GitHub release monitoring for all TOOL-REGISTRY repos
//   - Added Telegram alert when new releases detected
//   - Added data/tool-monitor-results.md summary output
//   - Added GitHub API rate-limit handling (429 / X-RateLimit-Remaining)
//   - Added per-step error isolation (steps no longer cascade-fail)
//   - Fixed GUNNER_REPO default to match actual Gunner repo name

import { getFileContent, createFile, updateFile, listDirectory } from '../lib/github.js';
import { fetchText } from '../lib/http.js';
import { markJobStart, markJobSuccess, markJobFailed } from '../utils/job-registry.js';
import { sendTelegram } from '../utils/notifier.js';

const XHAKA_REPO = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';
const GUNNER_REPO = process.env.GUNNER_REPO ?? 'c7lavinder/MANUS-Gunner-AI';
const TOOLS_STATE_PATH = 'memory/context/tools/.last-scan.json';
const INBOX_PATH = 'intelligence/inbox';
const RESULTS_PATH = 'data/tool-monitor-results.md';

// ── Registry: GitHub repos to monitor directly for new releases ──────────────
// Sourced from TOOL-REGISTRY.md. Update both files together.
const REGISTRY_GITHUB_REPOS: Array<{ id: string; name: string; repo: string }> = [
  { id: 'openclaw',      name: 'OpenClaw',      repo: 'openclaw/openclaw' },
  { id: 'railway-cli',   name: 'Railway CLI',   repo: 'railwayapp/railway-cli' },
  { id: 'supabase',      name: 'Supabase',      repo: 'supabase/supabase' },
  { id: 'gunner',        name: 'Gunner',        repo: 'c7lavinder/MANUS-Gunner-AI' },
  { id: 'posthog',       name: 'PostHog',       repo: 'PostHog/posthog' },
  { id: 'sentry',        name: 'Sentry',        repo: 'getsentry/sentry' },
  { id: 'langsmith',     name: 'LangSmith',     repo: 'langchain-ai/langsmith-sdk' },
  { id: 'hindsight',     name: 'Hindsight',     repo: 'vectorize-io/hindsight-openclaw' },
  { id: 'claude-code',   name: 'Claude Code',   repo: 'anthropics/claude-code' },
];

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
  {
    id: 'batchdialer',
    name: 'BatchDialer',
    url: 'https://batchdialer.com/changelog',
    type: 'html',
  },
  {
    id: 'batchleads',
    name: 'BatchLeads',
    url: 'https://batchleads.io/changelog',
    type: 'html',
  },
];

// ── Main entry ──────────────────────────────────────────────────────
export async function runToolMonitor(): Promise<void> {
  const _startTime = await markJobStart('tool-monitor');
  try {
    console.log('[tool-monitor] Starting daily tool scan...');

    // 1. Load last-scan state
    const stateFile = await getFileContent(XHAKA_REPO, TOOLS_STATE_PATH).catch(() => null);
    const state: LastScanState = stateFile
      ? JSON.parse(stateFile.content)
      : { lastRunAt: null, versions: {}, changelogChecked: {}, repoReleases: {} };
    const stateSha = stateFile?.sha ?? null;
    // Defensive defaults — guard against schema mismatch in persisted state
    state.versions = state.versions ?? {};
    state.changelogChecked = state.changelogChecked ?? {};
    state.repoReleases = state.repoReleases ?? {};

    const findings: Finding[] = [];

    // 2. Scan package.json deps in both repos
    let xhakaDeps: Record<string, string> = {};
    let gunnerDeps: Record<string, string> = {};
    try {
      xhakaDeps = await getPackageJsonDeps(XHAKA_REPO);
    } catch (err) {
      console.warn('[tool-monitor] Failed to scan xhaka package.json deps:', (err as Error).message);
    }
    try {
      gunnerDeps = await getPackageJsonDeps(GUNNER_REPO);
    } catch (err) {
      console.warn('[tool-monitor] Failed to scan Gunner package.json deps:', (err as Error).message);
    }
    const allDeps = mergeDeps(xhakaDeps, gunnerDeps);

    console.log(`[tool-monitor] Found ${Object.keys(allDeps).length} total deps across both repos.`);

    // 3. For each dep, check GitHub Releases RSS for new version
    for (const [pkg, currentVersion] of Object.entries(allDeps)) {
      const knownVersion = state.versions[pkg];
      const repoSlug = npmPkgToGitHubRepo(pkg);
      if (!repoSlug) continue;

      let latestVersion: string | null = null;
      try {
        latestVersion = await getLatestVersionFromRSS(repoSlug);
      } catch (err) {
        console.warn(`[tool-monitor] RSS check failed for ${pkg}:`, (err as Error).message);
        continue;
      }
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
      state.versions[pkg] = latestVersion;
    }

    // 4. Direct GitHub release monitoring for TOOL-REGISTRY repos
    console.log(`[tool-monitor] Checking ${REGISTRY_GITHUB_REPOS.length} registry repos for new releases...`);
    for (const entry of REGISTRY_GITHUB_REPOS) {
      try {
        const release = await getLatestGitHubRelease(entry.repo);
        if (!release) continue;

        const knownTag = state.repoReleases[entry.id];
        if (knownTag && release.tag !== knownTag) {
          findings.push({
            type: 'repo-release',
            tool: entry.name,
            repo: entry.repo,
            fromTag: knownTag,
            toTag: release.tag,
            publishedAt: release.published,
            releaseUrl: `https://github.com/${entry.repo}/releases/tag/${release.tag}`,
          });
          console.log(`[tool-monitor] New release: ${entry.name} ${knownTag} → ${release.tag}`);
        }
        state.repoReleases[entry.id] = release.tag;
      } catch (err) {
        console.warn(`[tool-monitor] Release check failed for ${entry.name}:`, (err as Error).message);
      }
    }

    // 5. Check changelog URLs for service tools
    for (const source of CHANGELOG_SOURCES) {
      try {
        const lastChecked = state.changelogChecked[source.id]
          ? new Date(state.changelogChecked[source.id])
          : null;

        const content = await fetchText(source.url);
        if (!content) {
          console.warn(`[tool-monitor] Could not fetch changelog for ${source.name}`);
          continue;
        }

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
      } catch (err) {
        console.warn(`[tool-monitor] Changelog check failed for ${source.name}:`, (err as Error).message);
      }
    }

    // 6. Write findings to intelligence/inbox/
    if (findings.length > 0) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const fileName = `tool-monitor-${timestamp}.md`;
      const filePath = `${INBOX_PATH}/${fileName}`;
      const content = buildInboxFile(findings, timestamp);

      try {
        await createFile(
          XHAKA_REPO,
          filePath,
          content,
          `tool-monitor: ${findings.length} update(s) detected`,
        );
        console.log(`[tool-monitor] Dropped ${findings.length} finding(s) → ${filePath}`);
      } catch (err) {
        console.warn('[tool-monitor] Failed to write inbox file:', (err as Error).message);
      }
    } else {
      console.log('[tool-monitor] No updates detected.');
    }

    // 7. Write data/tool-monitor-results.md summary
    try {
      await writeResultsSummary(findings, state);
    } catch (err) {
      console.warn('[tool-monitor] Failed to write results summary:', (err as Error).message);
    }

    // 8. Save updated state
    state.lastRunAt = new Date().toISOString();
    const stateContent = JSON.stringify(state, null, 2);
    try {
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
    } catch (err) {
      // State write failure is non-fatal — job still succeeded
      console.warn('[tool-monitor] Failed to save scan state:', (err as Error).message);
    }

    // 9. Write latest-update.md for each category
    const depUpdateCount = findings.filter(f => f.type === 'dep-update').length;
    await writeLatestUpdateFile(
      'packages',
      `Last scanned: ${new Date().toISOString()}\nDeps checked: ${Object.keys(allDeps).length}\nUpdates found: ${depUpdateCount}\n`,
    );
    for (const source of CHANGELOG_SOURCES) {
      const hasActivity = findings.some(
        f => f.type === 'changelog-update' && (f as ChangelogFinding).service === source.name,
      );
      await writeLatestUpdateFile(
        source.id,
        `Last scanned: ${new Date().toISOString()}\nService: ${source.name}\nChangelog activity: ${hasActivity ? 'YES — new content detected' : 'none detected'}\n`,
      );
    }

    // 10. Send Telegram alert if any findings
    if (findings.length > 0) {
      const releaseFindings = findings.filter(f => f.type === 'repo-release') as RepoReleaseFinding[];
      const depFindings = findings.filter(f => f.type === 'dep-update') as DepUpdateFinding[];
      const changelogFindings = findings.filter(f => f.type === 'changelog-update') as ChangelogFinding[];

      const lines = [`🔧 *Tool Monitor — ${findings.length} update(s) detected*`, ``];

      if (releaseFindings.length > 0) {
        lines.push(`*New Releases:*`);
        for (const f of releaseFindings) {
          lines.push(`• ${f.tool}: \`${f.fromTag}\` → \`${f.toTag}\``);
        }
        lines.push(``);
      }
      if (depFindings.length > 0) {
        lines.push(`*Dep Updates:*`);
        for (const f of depFindings) {
          lines.push(`• \`${f.package}\`: ${f.fromVersion} → ${f.toVersion}`);
        }
        lines.push(``);
      }
      if (changelogFindings.length > 0) {
        lines.push(`*Changelog Activity:*`);
        for (const f of changelogFindings) {
          lines.push(`• ${f.service}: [view](${f.url})`);
        }
      }

      await sendTelegram(lines.join('\n'));
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
  const rootPkg = await getFileContent(repo, 'package.json');
  const deps: Record<string, string> = {};

  if (rootPkg) {
    const parsed = JSON.parse(rootPkg.content);
    Object.assign(deps, parsed.dependencies ?? {}, parsed.devDependencies ?? {});
  }

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
  const merged: Record<string, string> = {};
  for (const deps of depMaps) {
    for (const [k, v] of Object.entries(deps)) {
      merged[k] = v.replace(/^[\^~>=]+/, '');
    }
  }
  return merged;
}

// Maps npm package name to GitHub owner/repo slug for RSS
const NPM_TO_GITHUB: Record<string, string> = {
  'openai':                   'openai/openai-node',
  '@anthropic-ai/sdk':        'anthropics/anthropic-sdk-python',
  '@supabase/supabase-js':    'supabase/supabase-js',
  '@trpc/server':             'trpc/trpc',
  '@trpc/client':             'trpc/trpc',
  'zod':                      'colinhacks/zod',
  'express':                  'expressjs/express',
  '@octokit/rest':            'octokit/octokit.js',
  'node-cron':                'node-cron/node-cron',
  'jose':                     'panva/jose',
  'jsonwebtoken':             'auth0/node-jsonwebtoken',
  'posthog-node':             'PostHog/posthog-node',
  '@sentry/node':             'getsentry/sentry-javascript',
  'prisma':                   'prisma/prisma',
  '@prisma/client':           'prisma/prisma',
  'drizzle-orm':              'drizzle-team/drizzle-orm',
  'langsmith':                'langchain-ai/langsmith-sdk',
  '@langchain/core':          'langchain-ai/langchainjs',
};

function npmPkgToGitHubRepo(pkg: string): string | null {
  return NPM_TO_GITHUB[pkg] ?? null;
}

async function getLatestVersionFromRSS(repoSlug: string): Promise<string | null> {
  const url = `https://github.com/${repoSlug}/releases.atom`;
  const xml = await fetchText(url);
  if (!xml) return null;

  const entryMatch = xml.match(/<entry>[\s\S]*?<title[^>]*>(.*?)<\/title>/);
  if (!entryMatch) return null;

  const raw = entryMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/, '$1').trim();
  return raw.replace(/^v/, '');
}

// Direct GitHub API release check — handles rate limits gracefully
async function getLatestGitHubRelease(repo: string): Promise<{ tag: string; published: string } | null> {
  const token = process.env.GITHUB_TOKEN;
  const url = `https://api.github.com/repos/${repo}/releases/latest`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'xhaka-tool-monitor/1.0',
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    clearTimeout(timer);

    // Rate limit handling
    if (res.status === 429 || res.status === 403) {
      const remaining = res.headers.get('X-RateLimit-Remaining');
      const reset = res.headers.get('X-RateLimit-Reset');
      console.warn(
        `[tool-monitor] GitHub rate limit for ${repo} — remaining: ${remaining}, resets: ${reset ? new Date(Number(reset) * 1000).toISOString() : 'unknown'}`,
      );
      return null;
    }

    // Repo might not have releases or might be private
    if (res.status === 404 || !res.ok) return null;

    const data = (await res.json()) as { tag_name?: string; published_at?: string };
    if (!data.tag_name) return null;

    return {
      tag: data.tag_name.replace(/^v/, ''),
      published: data.published_at ?? '',
    };
  } catch {
    return null;
  }
}

function detectNewChangelogContent(html: string, lastChecked: Date | null): boolean {
  if (!lastChecked) return false; // First run — don't flood inbox

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
  const repoReleases = findings.filter(f => f.type === 'repo-release');
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

  if (repoReleases.length > 0) {
    lines.push(`## New Tool Releases`);
    lines.push(``);
    for (const f of repoReleases as RepoReleaseFinding[]) {
      lines.push(`### ${f.tool}`);
      lines.push(`- **From:** ${f.fromTag}`);
      lines.push(`- **To:** ${f.toTag}`);
      lines.push(`- **Published:** ${f.publishedAt}`);
      lines.push(`- **Release:** ${f.releaseUrl}`);
      lines.push(`- **Repo:** https://github.com/${f.repo}`);
      lines.push(``);
    }
  }

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

// ── data/tool-monitor-results.md ────────────────────────────────────

async function writeResultsSummary(findings: Finding[], state: LastScanState): Promise<void> {
  const now = new Date().toISOString();
  const repoReleases = findings.filter(f => f.type === 'repo-release') as RepoReleaseFinding[];
  const depUpdates = findings.filter(f => f.type === 'dep-update') as DepUpdateFinding[];
  const changelogUpdates = findings.filter(f => f.type === 'changelog-update') as ChangelogFinding[];

  const lines = [
    `# Tool Monitor — Latest Results`,
    ``,
    `**Last Run:** ${now}`,
    `**Total Findings:** ${findings.length}`,
    ``,
    `## Registry Repos Monitored`,
    ``,
    `| Tool | Repo | Latest Release |`,
    `|---|---|---|`,
  ];

  for (const entry of REGISTRY_GITHUB_REPOS) {
    const tag = state.repoReleases[entry.id] ?? '—';
    lines.push(`| ${entry.name} | [${entry.repo}](https://github.com/${entry.repo}) | \`${tag}\` |`);
  }

  lines.push(``);

  if (repoReleases.length > 0) {
    lines.push(`## 🚀 New Releases Detected`);
    lines.push(``);
    for (const f of repoReleases) {
      lines.push(`- **${f.tool}**: \`${f.fromTag}\` → \`${f.toTag}\` — [view release](${f.releaseUrl})`);
    }
    lines.push(``);
  }

  if (depUpdates.length > 0) {
    lines.push(`## 📦 Dependency Updates`);
    lines.push(``);
    for (const f of depUpdates) {
      lines.push(`- \`${f.package}\`: ${f.fromVersion} → ${f.toVersion}`);
    }
    lines.push(``);
  }

  if (changelogUpdates.length > 0) {
    lines.push(`## 📝 Changelog Activity`);
    lines.push(``);
    for (const f of changelogUpdates) {
      lines.push(`- **${f.service}**: [${f.url}](${f.url})`);
    }
    lines.push(``);
  }

  if (findings.length === 0) {
    lines.push(`## ✅ No Updates`);
    lines.push(``);
    lines.push(`All tools are on known versions. No changelog activity detected.`);
    lines.push(``);
  }

  lines.push(`---`);
  lines.push(`_Auto-generated by tool-monitor job. Next run: daily at 6:05 AM CST._`);

  const content = lines.join('\n');

  const existing = await getFileContent(XHAKA_REPO, RESULTS_PATH).catch(() => null);
  if (existing) {
    await updateFile(
      XHAKA_REPO,
      RESULTS_PATH,
      content,
      `tool-monitor: update results [${findings.length} finding(s)]`,
      existing.sha,
    );
  } else {
    await createFile(
      XHAKA_REPO,
      RESULTS_PATH,
      content,
      `tool-monitor: init results file`,
    );
  }
  console.log(`[tool-monitor] Wrote results summary → ${RESULTS_PATH}`);
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
  repoReleases: Record<string, string>;
}

type Finding = DepUpdateFinding | RepoReleaseFinding | ChangelogFinding;

interface DepUpdateFinding {
  type: 'dep-update';
  package: string;
  fromVersion: string;
  toVersion: string;
  rssUrl: string;
}

interface RepoReleaseFinding {
  type: 'repo-release';
  tool: string;
  repo: string;
  fromTag: string;
  toTag: string;
  publishedAt: string;
  releaseUrl: string;
}

interface ChangelogFinding {
  type: 'changelog-update';
  service: string;
  url: string;
  detectedAt: string;
}
