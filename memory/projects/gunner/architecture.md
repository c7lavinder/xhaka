# Gunner — Technical Architecture

## System Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         EXTERNAL WORLD                              │
│  GoHighLevel CRM          Stripe           Deepgram    Forge LLM    │
│  (webhooks, OAuth)      (billing)        (transcribe)  (grade/coach)│
└──────────┬──────────────────┬─────────────────┬──────────┬──────────┘
           │                  │                 │          │
           ▼                  ▼                 ▼          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    GUNNER BACKEND (Railway)                          │
│                                                                     │
│  Express HTTP Server (api/index.ts)                                 │
│  ├── tRPC Router (16 sub-routers)                                   │
│  ├── Webhook Handler (server/webhook.ts)                            │
│  ├── Stripe Webhook (server/stripe/webhook.ts)                      │
│  ├── GHL OAuth (server/ghlOAuth.ts)                                 │
│  └── Health endpoint (/health → status, crmStatus)                  │
│                                                                     │
│  Core Services:                                                     │
│  ├── grading.ts (17-step processCall pipeline)                      │
│  ├── gamification.ts (XP, badges, streaks, leaderboard)            │
│  ├── ghlService.ts (GHL API calls — 2121 lines)                     │
│  ├── tenant.ts (multi-tenant config resolution)                     │
│  ├── playbooks.ts (playbook config + knowledge context)             │
│  └── rag/ (embeddings, retrieval, ingestion)                        │
└─────────────────────────┬───────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    TiDB (MySQL-compatible)                           │
│              Drizzle ORM / drizzle/schema.ts                        │
│              330 exports, 71 importers                              │
└─────────────────────────────────────────────────────────────────────┘
           ▲
           │
┌─────────────────────────────────────────────────────────────────────┐
│                    GUNNER FRONTEND (React 19)                        │
│              Served by Express from /dist                           │
│              tRPC client via lib/trpc.ts                            │
│              37 pages, TanStack Router, shadcn/ui                   │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow: GHL Webhook → Grade → Dashboard

```
1. Call ends in GHL
2. GHL fires webhook → POST /webhook (server/webhook.ts)
3. webhook.ts normalizes event → resolves tenant by locationId
4. Resolves team member by GHL userId or name matching
5. Creates `calls` record (status: pending) in TiDB
6. Fires processCall(callId) — 17 steps:

   Step 1:  Duration check (skip if <30s entirely, <60s = summarize only)
   Step 2:  Transcribe via Deepgram (status: transcribing)
   Step 2.5: Resolve contact name (cache → GHL API → LLM extraction)
   Step 3:  Classify call (conversation / voicemail / admin / too_short)
   Step 4:  Grade (if "conversation") — LLM with role-specific rubric
   Step 5:  Save grade to callGrades table
   Step 6:  Mark call completed, save callOutcome
   Step 7:  Award XP automatically
   Step 8:  Evaluate badges (chronological order, per-tenant)
   Step 9:  Fire webhook to Gunner Engine (if configured)
   Step 10: Auto-generate next steps
   Step 11: Generate call highlights (key moments with timestamps)
   Step 12: Update user playbook performance profile
   Step 13: Proactive AI coaching suggestion (fire-and-forget)
   Step 14: Intelligence pattern detection (fire-and-forget)
   Step 15: Update per-criterion skill scores (fire-and-forget)
   Step 16: RAG — embed graded call for semantic search (fire-and-forget)
   Step 17: Index recording in call recording library (fire-and-forget)

7. Frontend polls for updates via tRPC
8. Rep sees grade on dashboard + Call Inbox
```

## Directory Structure

```
gunner/
├── api/index.ts             ← Express entry point
├── client/src/
│   ├── pages/               ← 37 page components
│   ├── components/          ← calls/, coach/, dayhub/, task/, ui/
│   ├── contexts/            ← auth, theme
│   ├── hooks/               ← custom hooks
│   └── lib/trpc.ts          ← tRPC client binding
├── server/
│   ├── _core/               ← Framework plumbing (DO NOT EDIT)
│   │   ├── env.ts           ← ENV config object
│   │   ├── llm.ts           ← LLM invocation wrapper
│   │   ├── voiceTranscription.ts ← Deepgram wrapper
│   │   └── index.ts
│   ├── db/                  ← Database query layer (9 domain files)
│   ├── ghl/                 ← GHL API actions (9 domain modules)
│   ├── routers/             ← tRPC sub-routers (16 feature routers)
│   │   └── tenant/          ← Tenant router (6 sub-files)
│   ├── integrations/        ← CRM adapter layer
│   ├── rag/                 ← RAG pipeline
│   ├── stripe/              ← Payment processing
│   ├── grading.ts           ← ⭐ CORE: 17-step pipeline + all rubrics (~2500 lines)
│   ├── gamification.ts      ← XP, badges, streaks
│   ├── ghlService.ts        ← GHL API (2121 lines — god file)
│   ├── ghlOAuth.ts          ← OAuth token management
│   ├── tenant.ts            ← Multi-tenant config
│   ├── playbooks.ts         ← Playbook system
│   └── webhook.ts           ← GHL webhook handler
├── drizzle/schema.ts        ← ⭐ DB schema (330 exports, source of truth)
├── shared/                  ← Shared types, constants, playbooks
└── storage/                 ← S3 helpers
```

## Database Schema Summary

> Database: TiDB (MySQL-compatible). ORM: Drizzle. Schema: `drizzle/schema.ts` (330 exports).

### Multi-Tenancy Tables
| Table | Key Columns | Purpose |
|-------|------------|---------|
| `tenants` | id, name, slug, stripeSubscriptionId, subscriptionTier, crmType, crmConnected, crmConfig, industryKey, playbookTemplateId | One row per company |
| `users` | id, tenantId, openId, email, passwordHash, role, teamRole, isTenantAdmin | Auth users |
| `teamMembers` | id, tenantId, name, teamRole, userId, ghlUserId, lcPhone, lcPhones | Sales reps |
| `teamAssignments` | leadManagerId, acquisitionManagerId | LM → AM reporting |
| `tenantRoles` | tenantId, name, code, rubricId, defaultCallTypeCode | Custom role definitions |
| `tenantRolePermissions` | tenantId, roleCode, pageKey, allowed | Page-level access control |
| `tenantRubrics` | tenantId, name, callType, criteria (JSON), redFlags | Custom grading rubrics |
| `tenantCallTypes` | tenantId, name, code, detectionHints, rubricId | Custom call classifications |
| `tenantTerminology` | tenantId, termKey, displayValue | Terminology white-labeling |
| `tenantPipelineStages` | tenantId, stageKey, label, sortOrder | CRM pipeline stages |
| `tenantOutcomes` | tenantId, outcomeKey, label, priorityOrder | Call outcome options |
| `tenantKpiDefinitions` | tenantId, roleKey, metricKey, label, calculationMethod, target | KPI metrics per role |
| `tenantNavConfig` | tenantId, pageKey, label, path, roleVisibility | Navigation config |
| `tenantAiConfig` | tenantId, coachPersonality, systemPromptTemplate | AI coach config |
| `tenantGradingConfig` | tenantId, callTypeKey, classificationPrompt | Grading engine config |

### Core Call Tables
| Table | Key Columns | Purpose |
|-------|------------|---------|
| `calls` | id, tenantId, ghlCallId, contactName, recordingUrl, duration, teamMemberId, callType, callOutcome, classification, status, transcript | Every call record |
| `callGrades` | id, callId, tenantId, overallScore, overallGrade, criteriaScores (JSON), strengths, improvements, coachingTips, redFlags, highlights | AI-generated grades |
| `webhookRetryQueue` | callId, payload, attemptCount, nextRetryAt, status | Failed webhook retry |

### Gamification Tables
| Table | Purpose |
|-------|---------|
| `badges` | Badge definitions |
| `userBadges` | Earned badges per user |
| `badgeProgress` | Progress toward next tier |
| `userStreaks` | Daily streak tracking |
| `userXp` | Total XP per user |
| `xpTransactions` | XP award history |
| `rewardViews` | Reward view events |

### Other Key Tables
| Table | Purpose |
|-------|---------|
| `deals` | Wholesale deal tracking |
| `dispo_properties` | Property inventory for dispo |
| `trainingMaterials` | Upload coaching materials |
| `gradingRules` | Custom grading rules |
| `aiFeedback` | Coach feedback learning |
| `playbookTemplates` | Industry playbook templates |
| `playbookIntelligence` | AI pattern observations |
| `playbookKnowledgeModules` | Structured coaching knowledge |
| `userSkillScores` | Per-criterion rolling averages |
| `userCoachingSessions` | Weekly coaching history |
| `userGoals` | Personal goal tracking |
| `ghlOAuthTokens` | GHL OAuth tokens per tenant |
| `contactCache` | Cached GHL contact names |
| `kpiEntries` | Daily KPI submissions |
| `socialPosts` | Social media content |

## tRPC Router Map (16 routers)

| Router | Key Procedures |
|--------|---------------|
| `auth` | me, logout, impersonate |
| `calls` | getCallsForGrading, getCallDetail, getCallRecordings |
| `coach` | streamCoachResponse, getCoachHistory |
| `coachActions` | getActionLog, editAction, executeAction |
| `gamification` | getBadges, getXp, getStreaks, getLeaderboard |
| `intelligence` | getInsights, getSuggestions |
| `inventory` | getProperties, getDispoKpiSummary, updateProperty |
| `kpi` | getFunnelCounts, getKpiScoreboard, getDetailBySource |
| `meeting` | getMeetings, createMeeting |
| `playbook` | getPlaybook, updatePlaybook, getTemplates |
| `social` | getPosts, createPost, getBrandProfile |
| `sync` | getSyncHistory, triggerSync |
| `taskCenter` | getDayHubData, getInbox, getAppointments |
| `team` | getMembers, inviteMember, updateRole |
| `tenant` | getSettings, updateSettings, getSubscription (6 sub-files) |
| `training` | getMaterials, getRubric, getFeedback |

## Key Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | ✅ | TiDB connection string |
| `JWT_SECRET` | ✅ | Session signing |
| `STRIPE_SECRET_KEY` | ✅ | Stripe payments |
| `GHL_CLIENT_ID` | ✅ | GHL OAuth app |
| `GHL_CLIENT_SECRET` | ✅ | GHL OAuth app |
| `STRIPE_WEBHOOK_SECRET` | Optional | Stripe webhook validation |
| `GOOGLE_CLIENT_ID` | Optional | Google OAuth login |
| `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth login |
| `BUILT_IN_FORGE_API_URL` | Optional | LLM endpoint |
| `BUILT_IN_FORGE_API_KEY` | Optional | LLM auth |
| `BATCHDIALER_API_KEY` | Optional | BatchDialer integration |
| `PODIO_CLIENT_ID` | Optional | Podio CRM |
| `PODIO_CLIENT_SECRET` | Optional | Podio CRM |
| `TURNSTILE_SECRET_KEY` | Optional | Cloudflare bot protection |
| `APP_URL` | Optional | Self-referential URL |
| `OAUTH_SERVER_URL` | Optional | Manus OAuth server |
