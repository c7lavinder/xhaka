# 2026-02-27 Afternoon Session

## Command Center Audit Page — Iterative Improvements
- Added enhanced trigger pills: two-line format (event type + stage name), color-coded by source
- Added "📋 EXACT OUTPUTS" section to every agent: SMS, TASK, NOTE, TAG, STAGE, API, ALERT with specific example text
- Mirrored V2 Command Center style: big agent header + subtitle, build confidence bar with %, "What This Agent Does" plain English description, larger fonts
- Corey picked **Design 5 (Split Pane)** as his favorite layout
- Commits: `24203f9`, `092a860`, `6c5761c`

## OAuth Persistence Fixed
- Tokens now persist to Railway env var via GraphQL API (survives deploys)
- Added `RAILWAY_TOKEN`, `RAILWAY_SERVICE_ID`, `RAILWAY_ENVIRONMENT_ID` as env vars
- `projectId` required in Railway GraphQL mutations (learned the hard way)
- Added `/setup/oauth/register-webhooks` POST endpoint for manual webhook registration
- Webhook registered successfully after Corey re-authorized
- Commit: `0f2dd86`

## Twilio SMS Compliance Issues
- **Account 1 (Lead Gen - CEOXF38)**: SUSPENDED. Cold texting 8K/day via BatchLeads (which uses Twilio backend). Violations: no opt-out language, consumer complaint, content drift (Purple Doors registered but sending as Volunteer Solutions/EasySaleTN). Responded within 72h window using trustedflipper.com as opt-in source. Corey says this happens every few months.
- **Account 2 (Acquisitions)**: Warning only. Real leads from newagainhouses.com + PPL platforms. Violations: no company name in sender ID, no STOP language. 5 business day deadline (by March 4). Drafted response referencing NAH website + PPL platforms as opt-in sources. Easy fix — just add "with New Again Houses" and "Reply STOP" to templates.
- **Account 3**: Already banned previously.
- Purple Doors = registered A2P brand. Shell names (Volunteer Solutions, EasySaleTN) used to protect NAH brand.

## 23 Sycamore Ct Deal — POA/Conservatorship Issue
- Closing fell through: seller's mother has dementia, daughter had POA but it was NOT notarized → invalid
- Title company (EZ REI Closings / Abby) declined to close, notary also declined
- Attorney Derek Malcolm (W. Derek Malcolm, Esq.) confirmed: conservatorship is the only path
- Derek's play: Corey pays $1,500 back taxes, daughter signs Note + Quitclaim Deed giving 50% interest as protection, daughter pursues conservatorship
- Contract expires 4/11/2026, PSA auto-extends for title issues
- Kyle asked to contact daughter re: money for taxes + conservatorship
- Tim Hill 615-256-177 recommended as conservatorship attorney

## Sub-Agent / Team Issues
- `anthropic/claude-sonnet-4-6` model fails for sub-agents — "Unknown model" error
- Default primary model in config is `anthropic/claude-sonnet-4-6` which doesn't exist
- `gemini-pro` works for sub-agents
- Corey wants The Builder to use Claude Code specifically
- Claude Code is a separate CLI product, not API — would need to install and invoke via exec
- Corey reminded me to USE THE TEAM (AGENTS.md) — stop building everything myself
- The Architect should handle all visual/UI work

## Standing Config Notes
- Main session: `anthropic/claude-opus-4-6` (manually overridden)
- Heartbeat model: `anthropic/claude-sonnet-4-6` (broken — needs fix)
- Sub-agents: must specify `model: gemini-pro` explicitly until Anthropic model issue resolved
