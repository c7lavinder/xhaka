# MCP Bridge — Wiring Claude Code to the Xhaka Knowledge Graph

This folder contains everything needed to connect a Claude Code session directly
to the Xhaka workspace so Claude can read, search, and write memory in real-time.

---

## Why This Exists

Claude Code sessions are stateless by default. Without this bridge, every new
session starts blind. With it, Claude can:
- Semantic-search every note in the workspace via Smart Connections
- Read/write markdown files via the Obsidian MCP server
- Run structured queries via qmd

---

## Step 1 — Install the MCP Servers

### Smart Connections MCP (semantic search over the vault)
```bash
pip install smart-connections-mcp
```

### qmd MCP (structured markdown queries)
```bash
npx -y @tobilu/qmd mcp
```

### Obsidian MCP (file read/write over the vault)
```bash
# Bundled via npx — no separate install needed
# Runs as: npx -y obsidian-mcp
```

---

## Step 2 — Add MCP Config to Claude Settings

Copy the contents of `claude-mcp-config.json` (in this folder) into your Claude
Code MCP configuration. In Claude Code, open:

```
Settings → Developer → MCP Servers → Edit Config
```

Paste the JSON block. Save and restart Claude Code.

> ⚠️  `OBSIDIAN_VAULT_PATH` is already set to `/Users/wholesaleai/.openclaw/workspace`.
> If running on a different machine, update that path.

---

## Step 3 — Session Rhythm

Every Claude Code session should follow this three-phase rhythm:

### 🔵 ORIENT (session start — ~2 min)
Load the accumulated context before doing anything else:

```
1. Read CLAUDE.md          → architecture, rules, team roles
2. Read MEMORY.md          → current state of the organization
3. Read AGENTS.md          → who does what
4. Search memory/ for any notes relevant to today's task
5. Check memory/YYYY-MM-DD.md for today's running log
```

Never skip orient. A session that skips orient is operating blind.

### 🟢 WORK
Execute the task. While working:
- Follow all rules in CLAUDE.md
- Log decisions as you make them (don't wait until the end)
- Write interim notes to `intelligence/inbox/` if you discover something worth keeping

### 🔴 PERSIST (session end — ~2 min)
Write back before closing:

```
1. Append key decisions/outcomes to memory/YYYY-MM-DD.md
2. If anything changes MEMORY.md, update it (keep under 150 lines)
3. Commit any new memory files to GitHub
4. Leave a one-line summary of what changed for the next session
```

Never end a session without persisting. The knowledge graph is only as good as
what gets written back.

---

## Folder Reference

| Path | Purpose |
|------|---------|
| `memory/YYYY-MM-DD.md` | Daily running log |
| `memory/context/` | Background knowledge (this folder) |
| `memory/decisions/` | Key decisions with date + context |
| `memory/people/` | Profiles on team, clients, contacts |
| `memory/projects/` | Per-project status |
| `memory/important/` | Permanently flagged items |
| `intelligence/inbox/` | Drop zone for new intel (capture.ts picks up) |
| `MEMORY.md` | Synthesized org memory (≤150 lines) |
| `AGENTS.md` | The AI org chart |
| `CLAUDE.md` | Master teaching doc for Claude Code sessions |

---

## Troubleshooting

**Smart Connections not finding notes?**
Make sure `OBSIDIAN_VAULT_PATH` points to the workspace root and that the vault
has been indexed at least once (open in Obsidian, let it build `.smart-env/`).

**qmd failing?**
Check that Node 18+ is on PATH. Run `npx -y @tobilu/qmd mcp --version` to verify.

**Obsidian MCP not reading files?**
Confirm the path exists and Claude Code has filesystem read permissions for it.
