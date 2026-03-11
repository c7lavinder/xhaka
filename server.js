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

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.listen(PORT, () => console.log(`Xhaka Command Center running on port ${PORT}`));
