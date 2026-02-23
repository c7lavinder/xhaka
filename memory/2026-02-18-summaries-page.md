# Call Summaries Review Page — Deployed 2026-02-18 ~3:27am CST

## What was done
The summaries review page and API already existed in the codebase (built previously). What was missing was **disk persistence** — summaries and feedback were only stored in-memory and lost on every restart.

### Changes made:
1. **`src/engines/call-summary/index.js`** — Added disk persistence:
   - Summaries saved to `data/call-summaries.json` (survives restarts)
   - Feedback saved to `data/summary-feedback.json` (survives restarts)
   - Loads from disk on startup, falls back to empty arrays
   - Uses same pattern as other state files (poll-state.json, etc.)

2. **`src/routes/dashboard.js`** — Added "📞 Summaries" nav link to the logs page nav bar

### Already existed (no changes needed):
- **Route:** `GET /dashboard/summaries` — full HTML page with dark theme, mobile-friendly
- **API:** `GET /api/call-summaries` — returns summaries + feedback stats
- **API:** `POST /api/call-summaries/:id/feedback` — accepts rating (good/bad/missed_info) + comment
- **Auto-refresh:** Polls every 60 seconds
- **Summary tracking:** `storeSummary()` called in `processCall()` after each real conversation
- **Feedback UI:** Thumbs up/down/missed-info buttons + comment input per summary

### Commit: f4f1eb2
### URLs:
- Page: https://gunner-engine-production.up.railway.app/dashboard/summaries
- API: https://gunner-engine-production.up.railway.app/api/call-summaries

### Note:
Summaries list is currently empty because no calls have been processed since last restart. As calls come in, they'll appear on the page and persist across restarts.
