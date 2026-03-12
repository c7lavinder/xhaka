const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));
app.get('/control-room', (req, res) => res.sendFile(path.join(__dirname, 'control-room.html')));

// GET /api/memory — MEMORY.md line count + subfolder stats
app.get('/api/memory', (req, res) => {
  try {
    const memPath = path.join(__dirname, 'MEMORY.md');
    const content = fs.existsSync(memPath) ? fs.readFileSync(memPath, 'utf8') : '';
    const lineCount = content.split('\n').length;
    const lastModified = fs.existsSync(memPath) ? fs.statSync(memPath).mtime : null;
    const subfolders = ['archive','important','people','projects','decisions','context'];
    const folderCounts = {};
    subfolders.forEach(f => {
      const p = path.join(__dirname, 'memory', f);
      folderCounts[f] = fs.existsSync(p) ? fs.readdirSync(p).filter(x => x.endsWith('.md')).length : 0;
    });
    res.json({ lineCount, limit: 150, lastModified, folderCounts });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// GET /api/intelligence — inbox/processed counts
app.get('/api/intelligence', (req, res) => {
  try {
    const inbox = path.join(__dirname, 'intelligence', 'inbox');
    const processed = path.join(__dirname, 'intelligence', 'processed');
    const inboxCount = fs.existsSync(inbox) ? fs.readdirSync(inbox).filter(x => x.endsWith('.md')).length : 0;
    const processedCount = fs.existsSync(processed) ? fs.readdirSync(processed).filter(x => x.endsWith('.md')).length : 0;
    res.json({ inbox: inboxCount, processed: processedCount });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// GET /api/runs — recent run history from runs/ folder
app.get('/api/runs', (req, res) => {
  try {
    const runsDir = path.join(__dirname, 'runs');
    if (!fs.existsSync(runsDir)) return res.json({ runs: [] });
    const runs = fs.readdirSync(runsDir)
      .filter(f => fs.statSync(path.join(runsDir, f)).isDirectory())
      .sort().reverse().slice(0, 20)
      .map(runId => {
        const runPath = path.join(runsDir, runId);
        const files = fs.readdirSync(runPath);
        const hasAudit = files.includes('04_auditor_report.md');
        let verdict = 'in_progress';
        if (hasAudit) {
          const audit = fs.readFileSync(path.join(runPath, '04_auditor_report.md'), 'utf8');
          verdict = /^\#\# Verdict:\s*PASS/m.test(audit) ? 'pass' : 'fail';
        }
        const objective = files.includes('00_objective.md')
          ? fs.readFileSync(path.join(runPath, '00_objective.md'), 'utf8').split('\n')[0].replace(/^#+ /, '')
          : runId;
        return { runId, objective, stepsComplete: files.filter(f => f.endsWith('.md')).length, verdict };
      });
    res.json({ runs });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// GET /api/pipeline — current active pipeline state (reads most recent run)
app.get('/api/pipeline', (req, res) => {
  try {
    const runsDir = path.join(__dirname, 'runs');
    if (!fs.existsSync(runsDir)) return res.json({ active: false });
    const latest = fs.readdirSync(runsDir)
      .filter(f => fs.statSync(path.join(runsDir, f)).isDirectory())
      .sort().reverse()[0];
    if (!latest) return res.json({ active: false });
    const files = fs.readdirSync(path.join(runsDir, latest));
    const steps = ['00_objective','01_researcher_output','02_architect_output','03_builder_output','04_auditor_report','05_xhaka_summary'];
    const completedSteps = steps.filter(s => files.some(f => f.startsWith(s)));
    res.json({ active: completedSteps.length < steps.length, runId: latest, completedSteps: completedSteps.length, totalSteps: steps.length });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// GET /api/agents — agent status from runs/ folder
app.get('/api/agents', (req, res) => {
  try {
    const agents = ['researcher','architect','builder','auditor','operator'];
    const runsDir = path.join(__dirname, 'runs');
    const agentStatus = agents.map(name => {
      let lastRun = null, lastTask = null, status = 'idle';
      if (fs.existsSync(runsDir)) {
        const runs = fs.readdirSync(runsDir).filter(f => fs.statSync(path.join(runsDir, f)).isDirectory()).sort().reverse();
        for (const run of runs) {
          const fileMap = { researcher: '01_researcher_output.md', architect: '02_architect_output.md', builder: '03_builder_output.md', auditor: '04_auditor_report.md' };
          const file = fileMap[name];
          if (file && fs.existsSync(path.join(runsDir, run, file))) {
            const stat = fs.statSync(path.join(runsDir, run, file));
            lastRun = stat.mtime;
            const content = fs.readFileSync(path.join(runsDir, run, file), 'utf8');
            lastTask = content.split('\n').find(l => l.startsWith('#'))?.replace(/^#+ /, '') || run;
            status = 'complete';
            break;
          }
        }
      }
      return { name, status, lastRun, lastTask };
    });
    res.json({ agents: agentStatus });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── TOOL INTELLIGENCE API ────────────────────────────────────────────────────

// Parse YAML frontmatter from a markdown file
// Returns the parsed frontmatter object merged with { body: string }
function parseToolProfile(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { name: 'unknown', raw: markdown };

  const frontmatter = {};
  const yamlLines = match[1].split('\n');
  let currentKey = null;
  let currentList = null;

  for (const line of yamlLines) {
    // List item
    if (line.match(/^  - (.+)/) && currentKey && currentList !== null) {
      currentList.push(line.match(/^  - (.+)/)[1]);
      continue;
    }
    // Key-value
    const kv = line.match(/^([a-z_]+(?:\.[a-z_]+)?): (.*)$/);
    if (kv) {
      currentList = null;
      const val = kv[2].trim();
      if (val === 'null') {
        frontmatter[kv[1]] = null;
      } else if (val === '') {
        currentKey = kv[1];
        currentList = [];
        frontmatter[kv[1]] = currentList;
      } else {
        frontmatter[kv[1]] = val;
        currentKey = kv[1];
      }
      continue;
    }
    // List start (bare key followed by array items)
    const bareKey = line.match(/^([a-z_]+):$/);
    if (bareKey) {
      currentKey = bareKey[1];
      currentList = [];
      frontmatter[currentKey] = currentList;
    }
  }

  frontmatter.body = match[2].trim();
  return frontmatter;
}

// GET /api/tools — tool profiles from memory/context/tools/, grouped by category
app.get('/api/tools', (req, res) => {
  try {
    const toolsRoot = path.join(__dirname, 'memory', 'context', 'tools');
    if (!fs.existsSync(toolsRoot)) {
      return res.json({ categories: {}, lastScan: null });
    }

    // Load last-scan state for update badges
    const statePath = path.join(toolsRoot, '.last-scan.json');
    const state = fs.existsSync(statePath)
      ? JSON.parse(fs.readFileSync(statePath, 'utf8'))
      : { lastRunAt: null, versions: {} };

    // Check if any tool-update files exist in intelligence/inbox
    const inboxDir = path.join(__dirname, 'intelligence', 'inbox');
    const pendingUpdates = fs.existsSync(inboxDir)
      ? fs.readdirSync(inboxDir).filter(f => f.startsWith('tool-monitor-')).length
      : 0;

    const categories = {};

    // Walk each subdirectory of memory/context/tools/
    const entries = fs.readdirSync(toolsRoot, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const categoryPath = path.join(toolsRoot, entry.name);
      const mdFiles = fs.readdirSync(categoryPath).filter(f => f.endsWith('.md'));

      categories[entry.name] = mdFiles.map(file => {
        const fullPath = path.join(categoryPath, file);
        const raw = fs.readFileSync(fullPath, 'utf8');
        const profile = parseToolProfile(raw);
        return profile;
      });
    }

    res.json({
      categories,
      lastScan: state.lastRunAt ?? state.lastScan ?? null,
      pendingUpdates,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── DEEP RESEARCH API ────────────────────────────────────────────────────────

// In-memory job store (survives process lifetime, not persisted)
const researchJobs = {};  // jobId → { status, category, events, startedAt }

// Pushes an event into the job's buffer
function pushEvent(jobId, event) {
  if (!researchJobs[jobId]) return;
  researchJobs[jobId].events.push({ ...event, ts: new Date().toISOString() });
}

// Simple HTTP fetch for changelog pages (no external deps)
async function fetchUrl(url) {
  const https = require('https');
  const http = require('http');
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { timeout: 10000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function buildResearchReport(category, events, findingsCount) {
  const date = new Date().toISOString().slice(0, 10);
  const findings = events.filter(e => e.type === 'finding');
  const lines = [
    `---`,
    `project: xhaka`,
    `date: ${date}`,
    `tags: [tool-update, deep-research, ${category}]`,
    `source: deep-research-job`,
    `---`,
    ``,
    `# Deep Research Report — ${category} (${date})`,
    ``,
    `**Category:** ${category}  `,
    `**Findings:** ${findingsCount}  `,
    ``,
    `## Findings`,
    ``,
  ];
  for (const f of findings) {
    lines.push(`### ${f.tool} — ${f.summary}`);
    lines.push(`**Severity:** ${f.severity}`);
    lines.push(``);
    lines.push(f.detail);
    lines.push(``);
  }
  lines.push(`---`);
  lines.push(`_Generated by deep-research job. Review and update tool profiles in memory/context/tools/${category}/_`);
  return lines.join('\n');
}

async function runDeepResearch(jobId, category) {
  const job = researchJobs[jobId];
  job.status = 'running';
  const startMs = Date.now();

  pushEvent(jobId, { type: 'progress', message: `Starting deep research on category: ${category}`, pct: 5 });

  // Load tool profiles for this category
  const toolsPath = path.join(__dirname, 'memory', 'context', 'tools', category);
  const tools = fs.existsSync(toolsPath)
    ? fs.readdirSync(toolsPath).filter(f => f.endsWith('.md'))
    : [];

  pushEvent(jobId, { type: 'progress', message: `Found ${tools.length} tool(s) in ${category}`, pct: 15 });

  let processed = 0;
  const findingsCount = { count: 0 };

  for (const toolFile of tools) {
    const raw = fs.readFileSync(path.join(toolsPath, toolFile), 'utf8');
    const profile = parseToolProfile(raw);
    const toolName = profile.name ?? toolFile.replace('.md', '');

    pushEvent(jobId, {
      type: 'progress',
      message: `Researching ${toolName}...`,
      pct: Math.round(15 + (processed / Math.max(tools.length, 1)) * 70),
    });

    // Fetch changelog if URL present
    if (profile.changelog_url) {
      try {
        const html = await fetchUrl(profile.changelog_url);
        pushEvent(jobId, {
          type: 'finding',
          tool: toolName,
          severity: 'info',
          summary: `Changelog reviewed`,
          detail: `Fetched ${profile.changelog_url} — ${html?.length ?? 0} chars. Manual review recommended for new entries since ${profile.last_reviewed ?? 'unknown'}.`,
        });
        findingsCount.count++;
      } catch (e) {
        // Silently skip unavailable changelogs
      }
    }

    // Flag known_issues as action items
    if (Array.isArray(profile.known_issues) && profile.known_issues.length > 0) {
      for (const issue of profile.known_issues) {
        pushEvent(jobId, {
          type: 'finding',
          tool: toolName,
          severity: 'action',
          summary: 'Known issue flagged',
          detail: issue,
        });
        findingsCount.count++;
      }
    }

    processed++;
  }

  pushEvent(jobId, { type: 'progress', message: 'Writing report to intelligence/inbox...', pct: 90 });

  // Drop a summary file to intelligence/inbox/
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
  const inboxPath = path.join(__dirname, 'intelligence', 'inbox', `deep-research-${category}-${timestamp}.md`);

  if (fs.existsSync(path.join(__dirname, 'intelligence', 'inbox'))) {
    const report = buildResearchReport(category, job.events, findingsCount.count);
    fs.writeFileSync(inboxPath, report, 'utf8');
  }

  const durationMs = Date.now() - startMs;
  pushEvent(jobId, { type: 'progress', message: 'Done.', pct: 100 });
  pushEvent(jobId, { type: 'done', jobId, status: 'done', findingsCount: findingsCount.count, durationMs });

  job.status = 'done';
  job.doneAt = new Date().toISOString();
}

// POST /api/tools/research — start a deep research job for a tool category
app.post('/api/tools/research', express.json(), (req, res) => {
  const { category } = req.body;
  if (!category) return res.status(400).json({ error: 'category required' });

  const jobId = `research-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  researchJobs[jobId] = {
    status: 'pending',
    category,
    events: [],
    startedAt: new Date().toISOString(),
    doneAt: null,
  };

  // Start job async (fire and forget — result streams via SSE)
  runDeepResearch(jobId, category).catch(err => {
    console.error(`[research] Job ${jobId} failed:`, err);
    pushEvent(jobId, { type: 'error', jobId, status: 'error', message: err.message });
    researchJobs[jobId].status = 'error';
    researchJobs[jobId].doneAt = new Date().toISOString();
  });

  res.json({ jobId });
});

// GET /api/tools/research/stream/:jobId — SSE stream for job progress
app.get('/api/tools/research/stream/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = researchJobs[jobId];
  if (!job) return res.status(404).json({ error: 'Job not found' });

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');  // Railway/nginx: disable buffering
  res.flushHeaders();

  // Send all already-buffered events first
  let sentIndex = 0;
  const flushBuffered = () => {
    while (sentIndex < job.events.length) {
      const ev = job.events[sentIndex++];
      res.write(`event: ${ev.type}\ndata: ${JSON.stringify(ev)}\n\n`);
    }
  };
  flushBuffered();

  // If job already done, send done event and close
  if (job.status === 'done' || job.status === 'error') {
    res.write(`event: done\ndata: ${JSON.stringify({ jobId, status: job.status })}\n\n`);
    return res.end();
  }

  // Poll for new events every 500ms
  const interval = setInterval(() => {
    flushBuffered();
    if (job.status === 'done' || job.status === 'error') {
      res.write(`event: done\ndata: ${JSON.stringify({ jobId, status: job.status })}\n\n`);
      clearInterval(interval);
      res.end();
    }
  }, 500);

  // Clean up on client disconnect
  req.on('close', () => clearInterval(interval));
});

// GET /api/health — liveness + uptime check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    pid: process.pid,
    env: process.env.NODE_ENV || 'production',
    url: 'https://xhaka-production.up.railway.app'
  });
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.listen(PORT, () => console.log(`Xhaka Command Center running on port ${PORT}`));
