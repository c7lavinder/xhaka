# SalesDojo AI — Product Requirements Document

**Version:** 1.0 (MVP)
**Date:** February 3, 2026
**Status:** Ready for Development

---

## Executive Summary

SalesDojo AI is a SaaS platform for AI-powered sales training with chat and voice roleplay. Reps practice realistic sales conversations against AI prospects, receive structured scoring and coaching, and improve through adaptive skill profiling. Managers create scenarios with a single prompt and track team performance.

---

## Assumptions

1. **Target users:** B2B sales teams (5-500 reps), sales enablement leaders
2. **Pricing model:** Per-seat subscription, tiered by features
3. **Primary use case:** New hire onboarding + ongoing skill sharpening
4. **Voice is MVP-critical:** Differentiator vs. chat-only competitors
5. **No fine-tuning for MVP:** RAG-based grounding is sufficient
6. **Push-to-talk acceptable:** For MVP voice, PTT is acceptable if sub-1.5s streaming proves difficult
7. **Cloud-first:** No on-prem requirements for MVP
8. **LLM provider:** OpenAI (GPT-4o) primary; Anthropic fallback; voice via Deepgram (STT) + ElevenLabs (TTS)
9. **Storage:** Audio stored 30 days by default; transcripts stored indefinitely
10. **Compliance:** SOC2-ready architecture; full certification is Phase 2

---

## A. User Stories & Acceptance Criteria

### A.1 Sales Rep Stories

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| R1 | As a rep, I can view my assigned scenarios so I know what to practice | Scenario list shows: title, motion type, difficulty, due date, attempts remaining |
| R2 | As a rep, I can start a chat roleplay session | Chat interface loads with scenario context; AI responds in character; session saves on completion |
| R3 | As a rep, I can start a voice roleplay session | Mic permission requested; PTT or continuous mode; AI responds with voice; transcript generated |
| R4 | As a rep, I can view my session results with scoring and coaching | Score (0-100), rubric breakdown, mistake tags, coaching bullets with transcript citations |
| R5 | As a rep, I can retry a scenario and compare attempts | Side-by-side comparison of attempt 1 vs 2; score delta highlighted |
| R6 | As a rep, I can view my skill profile | Radar chart of skills; trend over time; weakest areas highlighted |
| R7 | As a rep, I can see recommended scenarios | Recommendations based on skill gaps; difficulty progression shown |
| R8 | As a rep, I can browse the scenario library | Filter by motion type, difficulty, tags; search by keyword |

### A.2 Manager Stories

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| M1 | As a manager, I can create a scenario with a single prompt | Enter prompt → system generates structured scenario → manager can edit/save |
| M2 | As a manager, I can edit and version scenarios | Edit any field; save creates new version; can revert to previous |
| M3 | As a manager, I can assign scenarios to reps/teams | Select reps/teams; set due date; set required attempts |
| M4 | As a manager, I can upload sales scripts and docs | Upload PDF/DOCX/TXT or paste text; system parses and embeds |
| M5 | As a manager, I can review rep sessions | View transcript + audio playback; see scoring explanation; see cited sources |
| M6 | As a manager, I can override scores and add notes | Edit any rubric score; add text notes; mark as "gold standard" |
| M7 | As a manager, I can view team analytics | Completion rates, performance distribution, common mistakes, scenario effectiveness |
| M8 | As a manager, I can lock assignments (disable auto-recommendations) | Toggle per rep or team-wide |

### A.3 Admin Stories

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| A1 | As an admin, I can manage users and roles | Invite users; assign roles; deactivate users |
| A2 | As an admin, I can configure workspace settings | Org name, logo, default retention, SSO settings |
| A3 | As an admin, I can manage billing | View plan, usage, invoices; upgrade/downgrade |
| A4 | As an admin, I can set data retention policies | Configure audio retention (7-90 days); transcript retention |

---

## B. Architecture Proposal

### B.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTS                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                       │
│  │ Web App  │  │ Mobile   │  │ Admin    │                       │
│  │ (React)  │  │ (PWA)    │  │ Console  │                       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                       │
└───────┼─────────────┼─────────────┼─────────────────────────────┘
        │             │             │
        └─────────────┼─────────────┘
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API GATEWAY (Kong/AWS ALB)                    │
│                    Rate limiting, Auth, Routing                  │
└─────────────────────────────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   REST API   │ │  WebSocket   │ │  Voice WS    │
│   (FastAPI)  │ │  (Chat RT)   │ │  (Voice RT)  │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       └────────────────┼────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                     CORE SERVICES                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Session    │  │  Scenario   │  │  Scoring    │              │
│  │  Service    │  │  Service    │  │  Service    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  RAG/KB     │  │  Skill      │  │  Analytics  │              │
│  │  Service    │  │  Service    │  │  Service    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  PostgreSQL  │   │    Redis     │   │     S3       │
│  (Primary)   │   │  (Cache/PubSub)│  │  (Audio/Docs)│
└──────────────┘   └──────────────┘   └──────────────┘
        │
        ▼
┌──────────────┐
│  Pinecone/   │
│  pgvector    │
│  (Embeddings)│
└──────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  OpenAI     │  │  Deepgram   │  │  ElevenLabs │              │
│  │  (LLM)      │  │  (STT)      │  │  (TTS)      │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    ASYNC PROCESSING                              │
│  ┌─────────────────────────────────────────────────┐            │
│  │              BullMQ / Redis Queues              │            │
│  │  - scoring_queue (post-session evaluation)     │            │
│  │  - embedding_queue (document processing)       │            │
│  │  - analytics_queue (aggregation jobs)          │            │
│  │  - audio_processing_queue (transcription)      │            │
│  └─────────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

### B.2 Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend** | Next.js 14 + React | SSR for SEO, App Router, excellent DX |
| **UI Components** | shadcn/ui + Tailwind | Fast iteration, consistent design |
| **State** | Zustand + React Query | Simple, performant, good caching |
| **Backend** | FastAPI (Python) | Async native, great for AI workloads, OpenAPI auto-gen |
| **Real-time** | WebSockets (native FastAPI) | Chat + voice streaming |
| **Database** | PostgreSQL 15 | ACID, JSON support, pgvector for embeddings |
| **Cache/Queue** | Redis + BullMQ | Session state, pub/sub, job queues |
| **Vector Store** | pgvector (MVP) → Pinecone (scale) | Start simple, migrate when needed |
| **Object Storage** | AWS S3 | Audio files, uploaded documents |
| **Auth** | Clerk or Auth0 | Fast MVP, SSO-ready, RBAC built-in |
| **LLM** | OpenAI GPT-4o | Best quality for roleplay + scoring |
| **STT** | Deepgram Nova-2 | Fast, accurate, streaming support |
| **TTS** | ElevenLabs Turbo v2 | Natural voice, low latency |
| **Infra** | AWS (ECS/Fargate) or Railway | Container-based, auto-scaling |
| **Monitoring** | Datadog or Axiom | Logs, metrics, traces |

### B.3 Voice Pipeline (Detailed)

```
REP SPEAKS                          AI RESPONDS
    │                                    ▲
    ▼                                    │
┌─────────┐                        ┌─────────┐
│ Browser │                        │ Browser │
│ MediaRec│                        │ <audio> │
└────┬────┘                        └────▲────┘
     │ WebSocket                        │ WebSocket
     │ (audio chunks)                   │ (audio stream)
     ▼                                  │
┌─────────────────────────────────────────────────┐
│              VOICE SERVICE                       │
│                                                  │
│  1. Receive audio chunks from client            │
│  2. Stream to Deepgram STT                      │
│  3. Accumulate transcript until silence/PTT     │
│  4. Send transcript to LLM (with context)       │
│  5. Stream LLM response to ElevenLabs TTS       │
│  6. Stream audio back to client                 │
│                                                  │
│  Latency budget:                                │
│  - STT: ~300ms (streaming)                      │
│  - LLM: ~500-800ms (streaming)                  │
│  - TTS: ~200ms (streaming)                      │
│  - Network: ~200ms                              │
│  = Total: ~1.2-1.5s first byte                  │
└─────────────────────────────────────────────────┘
```

**MVP Voice Mode: Push-to-Talk (PTT)**
- Rep holds button to speak
- Release triggers processing
- Simpler silence detection
- Clear turn-taking

**Phase 2: Continuous Mode**
- VAD (Voice Activity Detection) on client
- More natural conversation flow
- Requires interruption handling

### B.4 RAG Pipeline

```
DOCUMENT UPLOAD                    RETRIEVAL AT RUNTIME
      │                                   │
      ▼                                   ▼
┌─────────────┐                    ┌─────────────┐
│ Parse Doc   │                    │ Query       │
│ (PDF/DOCX)  │                    │ Embedding   │
└──────┬──────┘                    └──────┬──────┘
       ▼                                  ▼
┌─────────────┐                    ┌─────────────┐
│ Chunk Text  │                    │ Vector      │
│ (500 tokens)│                    │ Search      │
└──────┬──────┘                    └──────┬──────┘
       ▼                                  ▼
┌─────────────┐                    ┌─────────────┐
│ Generate    │                    │ Retrieve    │
│ Embeddings  │                    │ Top-K Chunks│
└──────┬──────┘                    └──────┬──────┘
       ▼                                  ▼
┌─────────────┐                    ┌─────────────┐
│ Store in    │                    │ Inject into │
│ pgvector    │                    │ LLM Context │
└─────────────┘                    └─────────────┘
```

---

## C. Data Model Definitions

### C.1 Core Tables

```sql
-- MULTI-TENANT FOUNDATION
CREATE TABLE orgs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    logo_url TEXT,
    settings JSONB DEFAULT '{}',
    retention_days_audio INT DEFAULT 30,
    retention_days_transcript INT DEFAULT 365,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'rep')),
    avatar_url TEXT,
    settings JSONB DEFAULT '{}',
    last_active_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(org_id, email)
);

CREATE INDEX idx_users_org ON users(org_id);

-- SCENARIOS (VERSIONED)
CREATE TABLE scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    motion_type VARCHAR(50) NOT NULL, -- 'sdr', 'discovery', 'closing', etc.
    difficulty INT CHECK (difficulty BETWEEN 1 AND 5),
    tags TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE scenario_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id UUID REFERENCES scenarios(id) ON DELETE CASCADE,
    version INT NOT NULL,
    
    -- Structured scenario data
    persona JSONB NOT NULL,          -- industry, role, company_size, tone, authority
    context JSONB NOT NULL,          -- situation, pains, goals, constraints
    goal TEXT NOT NULL,              -- what rep must achieve
    objection_tree JSONB NOT NULL,   -- objections and follow-ups
    hidden_info JSONB DEFAULT '[]',  -- revealed only if asked correctly
    success_criteria JSONB NOT NULL, -- what counts as success
    disqualifiers JSONB DEFAULT '[]',-- instant fail conditions
    rubric_weights JSONB NOT NULL,   -- category weights for scoring
    
    -- Generation metadata
    source_prompt TEXT,              -- original manager prompt
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(scenario_id, version)
);

CREATE INDEX idx_scenarios_org ON scenarios(org_id);
CREATE INDEX idx_scenario_versions_scenario ON scenario_versions(scenario_id);

-- ASSIGNMENTS
CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
    scenario_id UUID REFERENCES scenarios(id) ON DELETE CASCADE,
    scenario_version INT NOT NULL,
    assigned_by UUID REFERENCES users(id),
    assigned_to UUID REFERENCES users(id),   -- NULL if team assignment
    team_id UUID,                             -- for team assignments
    due_date DATE,
    required_attempts INT DEFAULT 1,
    is_locked BOOLEAN DEFAULT false,         -- disable auto-recommendations
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assignments_user ON assignments(assigned_to);
CREATE INDEX idx_assignments_org ON assignments(org_id);

-- SESSIONS
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    scenario_id UUID REFERENCES scenarios(id),
    scenario_version INT NOT NULL,
    assignment_id UUID REFERENCES assignments(id),
    
    session_type VARCHAR(20) NOT NULL CHECK (session_type IN ('chat', 'voice')),
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    attempt_number INT DEFAULT 1,
    
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration_seconds INT,
    
    -- Aggregated after completion
    overall_score INT CHECK (overall_score BETWEEN 0 AND 100),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_org ON sessions(org_id);
CREATE INDEX idx_sessions_scenario ON sessions(scenario_id);

-- SESSION TURNS (TRANSCRIPT)
CREATE TABLE session_turns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    turn_number INT NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('rep', 'prospect', 'system')),
    content TEXT NOT NULL,
    
    -- Voice-specific
    audio_url TEXT,                  -- S3 URL if voice
    audio_duration_ms INT,
    
    -- Timing
    timestamp_ms INT NOT NULL,       -- ms from session start
    
    -- RAG citations (if applicable)
    citations JSONB DEFAULT '[]',    -- [{doc_id, chunk_id, text_snippet}]
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(session_id, turn_number)
);

CREATE INDEX idx_turns_session ON session_turns(session_id);

-- EVALUATIONS
CREATE TABLE evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    
    overall_score INT NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
    rubric_scores JSONB NOT NULL,    -- {category: {score, weight, evidence: [turn_ids]}}
    mistake_tags JSONB NOT NULL,     -- [{tag, severity, turn_ids, description}]
    coaching_bullets JSONB NOT NULL, -- [{text, turn_ids}]
    
    -- Manager overrides
    is_overridden BOOLEAN DEFAULT false,
    override_by UUID REFERENCES users(id),
    override_notes TEXT,
    override_scores JSONB,
    
    -- Gold standard marking
    is_gold_standard BOOLEAN DEFAULT false,
    
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(session_id)
);

-- REP SKILL PROFILES
CREATE TABLE skill_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Current skill vector
    skills JSONB NOT NULL DEFAULT '{
        "discovery": 50,
        "objection_handling": 50,
        "value_framing": 50,
        "clarity": 50,
        "confidence": 50,
        "next_steps": 50,
        "rapport": 50,
        "active_listening": 50
    }',
    
    -- Aggregated stats
    total_sessions INT DEFAULT 0,
    avg_score DECIMAL(5,2),
    
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- SKILL HISTORY (for trending)
CREATE TABLE skill_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES sessions(id),
    skills_snapshot JSONB NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_skill_history_user ON skill_history(user_id);

-- KNOWLEDGE BASE (RAG)
CREATE TABLE knowledge_docs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES users(id),
    
    title VARCHAR(255) NOT NULL,
    doc_type VARCHAR(50) NOT NULL,   -- 'script', 'objection_guide', 'product_info', 'faq', 'call_transcript'
    source_url TEXT,                 -- S3 URL of original file
    tags TEXT[] DEFAULT '{}',
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doc_id UUID REFERENCES knowledge_docs(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    content TEXT NOT NULL,
    token_count INT,
    embedding vector(1536),          -- OpenAI embedding dimension
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chunks_doc ON knowledge_chunks(doc_id);
CREATE INDEX idx_chunks_embedding ON knowledge_chunks USING ivfflat (embedding vector_cosine_ops);

-- TEAMS (for group assignments)
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE team_members (
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (team_id, user_id)
);

-- AUDIT LOG
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    details JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_org ON audit_logs(org_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);
```

### C.2 Indexes for Performance

```sql
-- Full-text search on scenarios
CREATE INDEX idx_scenarios_search ON scenarios USING gin(to_tsvector('english', title));

-- Analytics queries
CREATE INDEX idx_sessions_completed ON sessions(org_id, completed_at) WHERE status = 'completed';
CREATE INDEX idx_evaluations_score ON evaluations(overall_score);

-- Skill recommendations
CREATE INDEX idx_skill_profiles_skills ON skill_profiles USING gin(skills);
```

---

## D. API Endpoints

### D.1 Auth & Users
```
POST   /auth/login                    # OAuth/magic link
POST   /auth/logout
GET    /users/me                      # Current user profile
PATCH  /users/me                      # Update profile
GET    /users                         # List org users (manager+)
POST   /users/invite                  # Invite user (admin)
PATCH  /users/:id/role                # Change role (admin)
DELETE /users/:id                     # Deactivate (admin)
```

### D.2 Scenarios
```
GET    /scenarios                     # List scenarios (filter, search, paginate)
POST   /scenarios                     # Create from prompt (manager)
GET    /scenarios/:id                 # Get scenario with latest version
GET    /scenarios/:id/versions        # List versions
GET    /scenarios/:id/versions/:v     # Get specific version
PATCH  /scenarios/:id                 # Update (creates new version)
DELETE /scenarios/:id                 # Soft delete (admin)
POST   /scenarios/generate-preview    # Generate from prompt without saving
```

### D.3 Assignments
```
GET    /assignments                   # List (rep sees own, manager sees all)
POST   /assignments                   # Create assignment (manager)
GET    /assignments/:id
PATCH  /assignments/:id               # Update due date, attempts
DELETE /assignments/:id               # Remove assignment
GET    /assignments/completion-stats  # Team completion rates
```

### D.4 Sessions
```
POST   /sessions                      # Start new session
GET    /sessions/:id                  # Get session with turns
PATCH  /sessions/:id                  # Update status (complete/abandon)
GET    /sessions/:id/turns            # Get transcript
POST   /sessions/:id/turns            # Add turn (used by chat)

# Voice-specific
POST   /sessions/:id/voice/start      # Initialize voice connection
WS     /sessions/:id/voice/stream     # WebSocket for voice
```

### D.5 Evaluations
```
GET    /sessions/:id/evaluation       # Get evaluation
PATCH  /sessions/:id/evaluation       # Manager override
POST   /sessions/:id/evaluation/gold  # Mark as gold standard
```

### D.6 Skills & Recommendations
```
GET    /users/:id/skills              # Get skill profile
GET    /users/:id/skills/history      # Skill trend over time
GET    /users/:id/recommendations     # Recommended scenarios
```

### D.7 Knowledge Base
```
GET    /knowledge                     # List docs
POST   /knowledge                     # Upload doc
GET    /knowledge/:id                 # Get doc with chunks
DELETE /knowledge/:id                 # Remove doc
POST   /knowledge/search              # Semantic search (for debugging)
```

### D.8 Analytics
```
GET    /analytics/rep/:id             # Rep dashboard data
GET    /analytics/team                # Team dashboard (manager)
GET    /analytics/scenarios           # Scenario effectiveness
GET    /analytics/mistakes            # Common mistake tags
```

### D.9 Admin
```
GET    /org                           # Org settings
PATCH  /org                           # Update settings
GET    /org/billing                   # Billing info
POST   /org/billing/upgrade           # Change plan
GET    /org/audit-log                 # Audit log
```

---

## E. Prompt Design

### E.1 Roleplay System Prompt

```
SYSTEM PROMPT: PROSPECT ROLEPLAY

You are playing the role of a sales prospect in a training simulation. Stay in character at all times.

## Your Persona
{persona_json}

## Current Situation
{context_json}

## Your Objections
You have these concerns (raise them naturally when appropriate):
{objection_tree_json}

## Hidden Information
Only reveal if the rep asks the right questions:
{hidden_info_json}

## Rules
1. NEVER break character or acknowledge this is a simulation
2. Respond naturally as this persona would - match their tone and authority level
3. Don't make it too easy - push back on weak responses
4. Don't make it impossible - reward good selling with engagement
5. If the rep earns it, you can agree to next steps
6. Keep responses concise (2-4 sentences typical, more if explaining something)

## Grounding Context (from company knowledge base)
{rag_context}

Use this context to inform realistic responses about the prospect's industry/situation.

BEGIN ROLEPLAY. The sales rep will speak first.
```

### E.2 Evaluation Prompt (Strict JSON Output)

```
SYSTEM PROMPT: SESSION EVALUATION

You are an expert sales coach evaluating a training roleplay session. Analyze the transcript and provide structured feedback.

## Scenario Context
Goal: {scenario_goal}
Success Criteria: {success_criteria_json}
Disqualifiers: {disqualifiers_json}
Rubric Weights: {rubric_weights_json}

## Transcript
{transcript_with_turn_ids}

## Grounding Documents Referenced
{cited_docs}

## Evaluation Instructions

1. Score each rubric category (0-100) based on evidence from the transcript
2. Identify specific mistakes with severity (low/medium/high)
3. Provide 3-7 actionable coaching bullets, each citing specific turn(s)
4. Calculate overall score using rubric weights
5. Check for disqualifiers - if any triggered, cap score at 40

## Output Format (STRICT JSON)

```json
{
  "overall_score": <0-100>,
  "passed": <true if met success criteria>,
  "rubric_scores": {
    "<category>": {
      "score": <0-100>,
      "weight": <from rubric_weights>,
      "evidence": ["turn_<id>: <quote>", ...]
    }
  },
  "mistake_tags": [
    {
      "tag": "<standardized_tag>",
      "severity": "low|medium|high",
      "turn_ids": [<turn_numbers>],
      "description": "<what went wrong>"
    }
  ],
  "coaching_bullets": [
    {
      "text": "<actionable advice>",
      "turn_ids": [<turn_numbers>],
      "quote": "<relevant transcript excerpt>"
    }
  ],
  "disqualifier_triggered": <null or {tag, turn_id, reason}>
}
```

RESPOND WITH ONLY THE JSON OBJECT. NO OTHER TEXT.
```

### E.3 Scenario Generation Prompt

```
SYSTEM PROMPT: SCENARIO GENERATOR

You are a sales training scenario designer. Convert the manager's description into a structured training scenario.

## Manager Input
{manager_prompt}

## Output Format (STRICT JSON)

```json
{
  "title": "<concise scenario title>",
  "motion_type": "<sdr|inbound|discovery|demo|negotiation|closing|renewal|winback|upsell>",
  "difficulty": <1-5>,
  
  "persona": {
    "name": "<realistic name>",
    "role": "<job title>",
    "company": "<company name>",
    "industry": "<industry>",
    "company_size": "<startup|smb|midmarket|enterprise>",
    "tone": "<friendly|neutral|skeptical|hostile|rushed>",
    "authority_level": "<champion|influencer|decision_maker|evaluator>",
    "communication_style": "<brief responses or detailed>"
  },
  
  "context": {
    "situation": "<what's happening at their company>",
    "pains": ["<pain point 1>", "<pain point 2>"],
    "goals": ["<what they want to achieve>"],
    "constraints": ["<budget, timeline, political constraints>"],
    "current_solution": "<what they use today, if anything>"
  },
  
  "goal": "<what the rep must achieve to succeed>",
  
  "objection_tree": [
    {
      "objection": "<what they'll say>",
      "trigger": "<when they raise it>",
      "good_response_unlocks": "<what happens if handled well>",
      "poor_response_leads_to": "<what happens if handled poorly>"
    }
  ],
  
  "hidden_info": [
    {
      "info": "<valuable information>",
      "revealed_if": "<what question/approach reveals it>"
    }
  ],
  
  "success_criteria": [
    "<specific measurable outcome 1>",
    "<specific measurable outcome 2>"
  ],
  
  "disqualifiers": [
    "<instant fail condition>"
  ],
  
  "rubric_weights": {
    "discovery": <0-1>,
    "objection_handling": <0-1>,
    "value_framing": <0-1>,
    "clarity": <0-1>,
    "confidence": <0-1>,
    "next_steps": <0-1>,
    "rapport": <0-1>,
    "active_listening": <0-1>
  },
  
  "suggested_tags": ["<tag1>", "<tag2>"]
}
```

Ensure rubric_weights sum to 1.0.
RESPOND WITH ONLY THE JSON OBJECT. NO OTHER TEXT.
```

### E.4 Skill Update Prompt

```
SYSTEM PROMPT: SKILL PROFILE UPDATE

Given the evaluation results, update the rep's skill profile.

## Current Skills
{current_skills_json}

## Session Evaluation
{evaluation_json}

## Rules
1. Adjust skills based on rubric scores (weight by 0.2 to smooth changes)
2. Factor in mistake severity
3. Skills range 0-100
4. Return updated skills + reasoning

## Output Format (STRICT JSON)

```json
{
  "updated_skills": {
    "discovery": <0-100>,
    "objection_handling": <0-100>,
    ...
  },
  "changes": [
    {"skill": "<name>", "delta": <+/- change>, "reason": "<why>"}
  ],
  "recommended_focus": ["<top 2 skills to improve>"]
}
```
```

### E.5 Guardrails

**Scoring Consistency:**
- All evaluations include turn_id citations
- Scores must have evidence
- JSON schema validated before storage
- If LLM returns invalid JSON, retry once with stricter prompt

**Character Consistency:**
- Prospect never says "as an AI" or similar
- System prompt emphasizes staying in character
- If detected, log and regenerate response

**Fairness:**
- Same scenario version = same rubric weights
- Manager overrides logged in audit trail
- Gold standards used for calibration checks

---

## F. Build Plan (6 Weeks)

### Week 1: Foundation
| Task | Owner | DoD |
|------|-------|-----|
| Project setup (monorepo, CI/CD) | Eng | Repo live, PRs auto-deploy to staging |
| Database schema + migrations | Eng | All tables created, seed data works |
| Auth integration (Clerk/Auth0) | Eng | Login/logout, RBAC middleware |
| Basic API scaffolding | Eng | Health check, user CRUD, org CRUD |
| Design system setup | Design | Component library in Storybook |

### Week 2: Scenarios + Chat
| Task | Owner | DoD |
|------|-------|-----|
| Scenario generation prompt | Eng | Manager prompt → valid JSON scenario |
| Scenario CRUD API | Eng | Create, edit, version, list, delete |
| Scenario builder UI | Eng | Manager can create + edit scenarios |
| Chat session API | Eng | Start session, add turns, complete |
| Chat roleplay prompt | Eng | AI stays in character, natural responses |
| Chat UI | Eng | Rep can run chat session end-to-end |

### Week 3: Voice MVP
| Task | Owner | DoD |
|------|-------|-----|
| Deepgram STT integration | Eng | Audio → transcript works |
| ElevenLabs TTS integration | Eng | Text → audio works |
| Voice WebSocket endpoint | Eng | Bidirectional audio streaming |
| Push-to-talk client | Eng | Browser PTT captures + plays audio |
| Voice session flow | Eng | Full voice roleplay works E2E |
| Audio storage (S3) | Eng | Audio files saved, retrievable |

### Week 4: Scoring + RAG
| Task | Owner | DoD |
|------|-------|-----|
| Evaluation prompt | Eng | Transcript → valid JSON evaluation |
| Scoring service | Eng | Auto-score on session complete |
| Session results UI | Eng | Rep sees score, rubric, coaching |
| Document upload | Eng | PDF/DOCX → parsed text |
| Chunking + embedding | Eng | Docs chunked, embeddings stored |
| RAG retrieval | Eng | Query → relevant chunks |
| RAG in roleplay | Eng | Chunks injected into prospect context |

### Week 5: Skills + Assignments
| Task | Owner | DoD |
|------|-------|-----|
| Skill profile service | Eng | Profile updates after each session |
| Skill dashboard UI | Eng | Rep sees radar chart + trends |
| Recommendation engine | Eng | Weak skills → suggested scenarios |
| Assignment CRUD | Eng | Manager can assign to rep/team |
| Assignment UI (manager) | Eng | Create, track, view completion |
| Assignment UI (rep) | Eng | See assigned, due dates, attempts |

### Week 6: Analytics + Polish
| Task | Owner | DoD |
|------|-------|-----|
| Rep analytics API | Eng | Progress, mistakes, trends |
| Manager analytics API | Eng | Team stats, scenario effectiveness |
| Analytics dashboards | Eng | Charts render, data accurate |
| Manager review UI | Eng | Transcript + audio playback, override |
| Redo mode | Eng | Rep retries, comparison view |
| Audit logging | Eng | All mutations logged |
| Load testing | Eng | 100 concurrent sessions stable |
| Bug bash + fixes | All | P0/P1 bugs resolved |

### Milestones

| Milestone | Date | Criteria |
|-----------|------|----------|
| M1: Auth + DB | End Week 1 | Users can log in, data persists |
| M2: Chat Works | End Week 2 | Full chat roleplay E2E |
| M3: Voice Works | End Week 3 | Full voice roleplay E2E |
| M4: Scoring Works | End Week 4 | Sessions scored, RAG grounded |
| M5: Assignments Work | End Week 5 | Full assignment flow |
| M6: MVP Complete | End Week 6 | All features, load tested |

---

## G. Test Plan

### G.1 Unit Tests

**Scoring Output Validation**
```python
def test_evaluation_schema():
    """Evaluation JSON matches expected schema"""
    result = scoring_service.evaluate(mock_transcript, mock_scenario)
    
    assert 0 <= result["overall_score"] <= 100
    assert "rubric_scores" in result
    assert "mistake_tags" in result
    assert "coaching_bullets" in result
    
    for category, data in result["rubric_scores"].items():
        assert "score" in data
        assert "weight" in data
        assert "evidence" in data
        assert isinstance(data["evidence"], list)
    
    for mistake in result["mistake_tags"]:
        assert mistake["severity"] in ["low", "medium", "high"]
        assert isinstance(mistake["turn_ids"], list)
    
    for bullet in result["coaching_bullets"]:
        assert "text" in bullet
        assert "turn_ids" in bullet

def test_scenario_generation_schema():
    """Generated scenario matches expected schema"""
    result = scenario_service.generate(mock_prompt)
    
    assert result["motion_type"] in VALID_MOTION_TYPES
    assert 1 <= result["difficulty"] <= 5
    assert "persona" in result
    assert "context" in result
    assert "objection_tree" in result
    assert abs(sum(result["rubric_weights"].values()) - 1.0) < 0.01

def test_skill_update_bounds():
    """Skill updates stay within 0-100"""
    result = skill_service.update(mock_profile, mock_evaluation)
    
    for skill, value in result["updated_skills"].items():
        assert 0 <= value <= 100
```

### G.2 Integration Tests

**Voice Loop E2E**
```python
async def test_voice_session_e2e():
    """Full voice session from start to transcript"""
    # Start session
    session = await client.post("/sessions", json={
        "scenario_id": MOCK_SCENARIO_ID,
        "session_type": "voice"
    })
    session_id = session.json()["id"]
    
    # Connect WebSocket
    async with client.websocket(f"/sessions/{session_id}/voice/stream") as ws:
        # Send audio chunk (mock)
        await ws.send_bytes(MOCK_AUDIO_CHUNK)
        await ws.send_json({"action": "end_turn"})
        
        # Receive response
        response = await ws.receive()
        assert response["type"] == "audio"
        
        # Get transcript
        await ws.send_json({"action": "get_transcript"})
        transcript = await ws.receive_json()
        assert len(transcript["turns"]) >= 2

async def test_chat_session_e2e():
    """Full chat session with scoring"""
    session = await client.post("/sessions", json={
        "scenario_id": MOCK_SCENARIO_ID,
        "session_type": "chat"
    })
    session_id = session.json()["id"]
    
    # Add turns
    await client.post(f"/sessions/{session_id}/turns", json={
        "content": "Hi, this is Alex from Acme Corp..."
    })
    
    # Get AI response
    response = await client.get(f"/sessions/{session_id}/turns")
    assert len(response.json()) == 2
    
    # Complete session
    await client.patch(f"/sessions/{session_id}", json={"status": "completed"})
    
    # Check evaluation generated
    eval_response = await client.get(f"/sessions/{session_id}/evaluation")
    assert eval_response.status_code == 200
    assert "overall_score" in eval_response.json()
```

**RAG Pipeline**
```python
async def test_rag_retrieval():
    """Uploaded doc is retrievable via semantic search"""
    # Upload doc
    doc = await client.post("/knowledge", files={
        "file": ("script.pdf", MOCK_PDF_BYTES)
    })
    doc_id = doc.json()["id"]
    
    # Wait for processing
    await asyncio.sleep(5)
    
    # Search
    results = await client.post("/knowledge/search", json={
        "query": "how to handle price objections"
    })
    
    assert len(results.json()["chunks"]) > 0
    assert any(c["doc_id"] == doc_id for c in results.json()["chunks"])
```

### G.3 Performance Targets

| Metric | Target | Test Method |
|--------|--------|-------------|
| Voice latency (first byte) | < 1.5s p95 | Load test with 50 concurrent voice sessions |
| Chat response time | < 2s p95 | Load test with 100 concurrent chat sessions |
| Scenario generation | < 10s p95 | Generate 100 scenarios serially |
| Evaluation generation | < 15s p95 | Evaluate 100 transcripts serially |
| Document embedding | < 30s for 10-page PDF | Process 50 docs concurrently |
| API response (non-AI) | < 200ms p95 | 1000 RPS against list endpoints |

### G.4 Load Test Scenarios

```yaml
# k6 load test config
scenarios:
  chat_sessions:
    executor: ramping-vus
    startVUs: 0
    stages:
      - duration: 2m
        target: 50
      - duration: 5m
        target: 100
      - duration: 2m
        target: 0
    
  voice_sessions:
    executor: ramping-vus
    startVUs: 0
    stages:
      - duration: 2m
        target: 25
      - duration: 5m
        target: 50
      - duration: 2m
        target: 0

thresholds:
  http_req_duration:
    - p(95) < 2000
  websocket_connecting:
    - p(95) < 500
```

---

## Appendix: Standardized Mistake Tags

```json
{
  "discovery": [
    "skipped_discovery",
    "surface_level_questions",
    "missed_pain_point",
    "didnt_quantify_impact",
    "assumed_instead_of_asked"
  ],
  "objection_handling": [
    "ignored_objection",
    "argued_with_prospect",
    "weak_reframe",
    "no_evidence_provided",
    "gave_up_too_early"
  ],
  "value_framing": [
    "feature_dumping",
    "no_personalization",
    "missed_value_connection",
    "jargon_heavy"
  ],
  "clarity": [
    "rambling_response",
    "unclear_ask",
    "contradicted_self",
    "too_much_information"
  ],
  "confidence": [
    "excessive_hedging",
    "apologetic_tone",
    "filler_words",
    "uncertain_pricing"
  ],
  "next_steps": [
    "no_clear_next_step",
    "weak_close_attempt",
    "didnt_confirm_commitment",
    "left_open_ended"
  ],
  "rapport": [
    "too_transactional",
    "ignored_personal_cues",
    "interrupted_prospect",
    "no_acknowledgment"
  ],
  "active_listening": [
    "repeated_question",
    "missed_buying_signal",
    "didnt_reference_earlier",
    "talked_over_prospect"
  ]
}
```

---

*End of PRD — Ready for Development*
