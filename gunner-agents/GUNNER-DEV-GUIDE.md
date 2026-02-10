# Gunner Development Guide

**What this is:** Simple rules for building Gunner. No enterprise overhead. Just what matters now.

**Who it's for:** Manus (and any AI tools helping with code)

---

## How Gunner Works

### Data Flow
```
External Sources → Gunner → Agents → Actions
     ↓
  GHL (CRM)
  BatchDialer
  BatchLeads
  CallRail
```

- **All data flows through Gunner** — agents never call external APIs directly
- **GHL is the CRM source of truth** — synced to Gunner
- **Gunner is the brain** — stores grades, analytics, tenant configs

### Multi-Tenant
- Every feature works for ANY tenant, not just NAH
- NAH is tenant #1 and the template
- Tenant data is isolated
- Config is per-tenant, code is shared

---

## Architecture Rules

### Agents
- **Event-driven** — Webhooks trigger agent actions
- **Stateless** — State lives in database, not in agent
- **Idempotent** — Safe to retry if something fails

### API Design
- Validate all inputs
- Handle errors gracefully
- Return consistent response formats
- Paginate lists (max 100 items)

### Database
- Use indexes for queries
- Never store secrets in plain text
- Soft delete where possible (keep history)

### Security
- No API keys in client-side code
- External calls go through server-side proxy
- Sanitize user input
- Encrypt PII at rest

---

## Naming Conventions

| Thing | Style | Example |
|-------|-------|---------|
| Files | kebab-case | `lead-qualification.ts` |
| Functions | camelCase | `qualifyLead()` |
| Types/Interfaces | PascalCase | `LeadScore` |
| Database tables | snake_case | `call_grades` |
| API endpoints | kebab-case | `/api/lead-scores` |

---

## Current Integrations

| Service | What It Does | API Key Location |
|---------|--------------|------------------|
| GHL | CRM — leads, contacts, pipeline | OAuth connected |
| BatchDialer | Call metrics | Env var |
| BatchLeads | SMS metrics | Env var |
| CallRail | Voicemails | Env var |
| Leadzolo | PPL disputes | Stored credentials |
| MotivatedSellers | PPL disputes | Stored credentials |
| PropertyLeads | PPL disputes | Stored credentials |

---

## Team Roles in Gunner

| Role | What They Do | What They See |
|------|--------------|---------------|
| Admin | Full access, billing, settings | Everything |
| Acquisition Manager | Offer calls, closings | Team-wide data |
| Lead Manager | Qualification calls | Own data + team leaderboard |
| Lead Generator | Cold calling, lead gen | Own data only |

---

## Agent Suite (Building Now)

### Phase 1 — Core (Build First)
1. Lead IQ — Qualify and route leads
2. LM Assistant — Post-call automation
3. Appointment Bot — Confirm and manage appointments
4. AM Assistant — Offer process automation
5. Follow Up Bot — Nurture sequences

### Phase 2 — Completion
6. Contract Bot — Send and track contracts
7. Post-Close Bot — Thank you, reviews, referrals

### Phase 3 — Operations
8. Data Hygiene — Clean CRM data
9. KPI Entry — Auto-populate spreadsheets
10. Report Generator — Daily/weekly reports

### Phase 4 — Communication
11. After-Hours Bot — Engage leads outside hours
12. Voicemail Bot — Process CallRail voicemails
13. Market Watch — Track market trends
14. MLS Monitor — Alert when properties list

### Already Built
- PPL Refund Bot — File disputes on PPL platforms

---

## V1 Features (Current)

| Feature | Status | Notes |
|---------|--------|-------|
| Call grading | ✅ Live | AI grades calls against rubrics |
| Leaderboards | ✅ Live | Team rankings + gamification |
| Analytics | ✅ Live | Score trends, team breakdown |
| Training insights | ✅ Live | AI-generated coaching |
| GHL sync | ✅ Live | Pulls calls automatically |
| Opportunities Missed | 🔨 Building | Flag leads that need second look |

---

## How We Build Features

### 1. Spec First
- Write a clear spec before any code
- Include: what it does, how it works, edge cases
- Corey approves spec before building

### 2. Build
- Follow architecture rules above
- Write tests for new features
- Keep PRs focused (one feature = one PR)

### 3. Review
- Manus reviews own code (for now)
- Test in staging before production
- Corey tests from user perspective

### 4. Ship
- Deploy to production
- Monitor for issues
- Update docs if needed

---

## Known Gotchas

### GHL
- OTP codes go to spam folder
- Webhook payload format varies by event type
- Rate limits apply — batch where possible

### PPL Platforms
- MotivatedSellers has reCAPTCHA on login
- PropertyLeads tracks declined refund % — don't dispute too aggressively
- Leadzolo uses separate portal vs form URLs

### BatchDialer
- "Conversation" = disposition-based, NOT call duration
- Calls often <1 minute but still count as conversations
- Data comes through Zapier currently

---

## Costs to Watch

| Thing | Concern | Mitigation |
|-------|---------|------------|
| AI calls (grading) | Token usage | Cache where possible, batch calls |
| GHL API | Rate limits | Queue requests, respect limits |
| Database | Query performance | Use indexes, paginate |
| External APIs | Per-call costs | Cache, batch, minimize |

---

## Questions? 

Ask Corey for product decisions.
Check specs in `/gunner-agents/add-ons/` for agent details.
This doc is the source of truth for how we build.

---

*Last updated: February 9, 2026*
