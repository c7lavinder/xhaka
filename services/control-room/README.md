# Xhaka Control Room

Lightweight static reference dashboard. Loads in under 1 second. No build step.

## Stack
- `index.html` — single-file vanilla JS dashboard
- `server.js`  — zero-dependency Node HTTP server
- `package.json` — scripts only (no npm install needed)

## Run locally
```bash
node server.js
# → http://localhost:3000
```

## Deploy (Railway)
- Root directory: `services/control-room`
- Start command: `node server.js`
- No build command needed

## Primary interface
Telegram is primary. This is a reference view for when Corey wants to check in visually.

## Data sources (all from c7lavinder/xhaka via GitHub API)
- `data/results.tsv` — intelligence job history
- `data/task-queue.json` — pending tasks
- `memory/context/books/` — book library
- `memory/context/sim/` — digital twins
- `intelligence/repo-inbox.md` — queued repos
- `intelligence/article-digest.md` — article digests
