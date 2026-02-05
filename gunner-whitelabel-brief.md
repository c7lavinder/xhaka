# Gunner White-Label Platform Brief

## Goal
Transform Gunner from a single-tenant app (NAH only) into a white-label SaaS platform that other businesses can subscribe to and use with their own data, team, and CRM.

---

## Core Requirements

### 1. Multi-Tenancy
- Each customer (company) gets isolated data — no cross-contamination
- Separate: team members, calls, training materials, grading rubrics, badges/XP
- NAH becomes just another tenant (the first one)

### 2. Paywall & Billing
- Stripe integration for subscriptions
- Pricing tiers (suggest):
  - **Starter**: $99/mo — up to 3 users, 1 CRM integration
  - **Growth**: $249/mo — up to 10 users, all integrations, custom roles
  - **Scale**: $499/mo — unlimited users, API access, priority support
- Free trial option (14 days?)
- Billing management (upgrade/downgrade/cancel)

### 3. Quick Onboarding Wizard
New customer signs up → guided setup flow:

1. **Create Account** — company name, admin email, password
2. **Choose Plan** — select tier, enter payment
3. **Connect CRM** — pick from supported integrations, OAuth connect
4. **Upload Training Materials** — scripts, objection handling docs (or skip for later)
5. **Define Roles** — what roles exist on their team (e.g., SDR, AE, Closer)
6. **Invite Team** — add team members by email, assign roles
7. **Done** — land on dashboard, calls start syncing

**Goal: Under 10 minutes from signup to first call graded.**

---

### Tenant-Specific Data (What Each Customer Must Provide)

**This is what's unique to NAH's setup that every new customer will need to supply during onboarding:**

| Data | NAH Example | What New Customer Provides |
|------|-------------|---------------------------|
| **CRM Connection** | GoHighLevel (OAuth) | Their CRM credentials (GHL, HubSpot, Salesforce, etc.) |
| **Team Roles** | Lead Manager, Acquisition Manager | Their roles (e.g., SDR, AE, Closer, Setter) |
| **Training Materials** | LM Script, AM Offer Script, Objection Mastery docs | Their scripts, playbooks, objection handling docs |
| **Grading Rubrics** | 9 criteria for LM calls, different criteria for AM calls | Their criteria per role (or use platform defaults to start) |
| **Team Members** | Daniel, Kyle, Chris + emails | Their team members + emails |
| **Role Assignments** | Daniel & Chris = LM, Kyle = AM | Which team member has which role |
| **Call Classification Rules** | Qualification Call, Offer Call | Their call types (e.g., Discovery, Demo, Closing) |
| **Badge Definitions** | Role-specific badges (LM vs AM) | Use defaults or customize per role |

---

### Onboarding Decision: Guided vs. Blank Slate

**Option A: Blank Slate (Current Plan)**
- Customer starts with nothing
- Must upload all their own materials
- Define all their own roles and rubrics
- Pro: Fully customized to their business
- Con: More work upfront, may not know where to start

**Option B: Industry Templates (Recommended)**
- Customer picks an industry (Real Estate, Solar, Insurance, SaaS, etc.)
- Platform provides starter templates:
  - Default roles for that industry
  - Sample grading rubrics
  - Example scripts (they customize)
  - Pre-built badges
- Pro: Faster onboarding, less "blank page" paralysis
- Con: Need to build templates per industry

**Recommendation:** Start with Option A (blank slate) for MVP. Add industry templates in Phase 2 once you see which industries sign up most.

---

### What Manus Needs to Clearly Separate

**Platform-Level (Same for Everyone):**
- Gamification system (XP, levels, streaks)
- Badge mechanics (how badges work)
- AI grading engine (universal learning layer)
- Dashboard, reports, analytics
- Billing, auth, admin tools

**Tenant-Level (Unique Per Customer):**
- CRM connection
- Team members and roles
- Training materials
- Grading rubrics per role
- Call type classifications
- Badge definitions (if customized)
- Company branding (if offered later)

### 4. CRM Integrations
- GoHighLevel (already done)
- HubSpot
- Salesforce
- Close.io
- Pipedrive
- (Modular — easy to add more later)

Each integration needs:
- OAuth connection flow
- Call sync (pull recordings)
- Contact/deal sync (optional, for context)

### 5. Customization Per Tenant
- **Roles**: Each company defines their own roles (not hardcoded LM/AM)
- **Grading Rubrics**: Each role gets custom grading criteria
- **Training Materials**: Company uploads their own scripts/docs
- **Badges**: Can use defaults or customize (Phase 2)

### 6. Admin Dashboard (Per Company)
- Manage team members
- Manage billing/subscription
- View usage stats
- Configure integrations
- Upload/edit training materials

### 7. Super Admin (Platform Owner)
- See all tenants
- Usage metrics across platform
- Revenue dashboard
- Manage platform-wide settings
- Support access to tenant accounts (with permission)

---

## Universal AI Learning System

### Concept
Build a shared AI learning layer that improves from calls across ALL companies, so new customers get enterprise-grade coaching from Day 1 — not starting from scratch.

### Value Proposition
- **New companies don't start cold** — Day 1 they get AI trained on 100,000+ sales calls
- **Faster, smarter grading** — Patterns across industries improve the AI for everyone
- **Best practices emerge organically** — "Top 1% of closers do X"
- **Marketing advantage** — "Trained on 500,000+ real sales calls"

### Architecture

| Layer | Shared? | What It Learns |
|-------|---------|----------------|
| Base Model | ✅ Universal | Tonality, pacing, objection structure, rapport patterns, motivation extraction techniques |
| Industry Model | ✅ Opt-in by vertical | Real estate patterns, solar patterns, insurance patterns, SaaS patterns |
| Company Layer | ❌ Private | Company scripts, specific rubric, team coaching, proprietary techniques |

### What Gets Shared (Anonymized)
- Conversation patterns and structure
- Tonality and pacing analysis
- Objection handling techniques (structure, not content)
- Rapport-building patterns
- Motivation extraction approaches

### What Stays Private (Per Company)
- Actual call recordings
- Specific scripts and pricing
- Company/contact names
- Proprietary techniques
- Grading rubrics

### Implementation
- **Opt-in by default** — companies can choose to contribute anonymized data
- **Anonymization pipeline** — strip PII, company names, specific numbers before training
- **Industry buckets** — real estate calls train real estate model, solar trains solar, etc.
- **Clear data policy** — transparent about what's used and how

### The Pitch
> "Gunner's AI is trained on 500,000+ real sales calls across hundreds of companies. Your team gets enterprise-grade coaching from Day 1 — no ramp-up required."

---

## Platform Updates & Deployment

### Single Codebase, All Tenants
- **One platform, many tenants** — NOT separate installations per customer
- When the main Gunner platform gets updates, ALL tenants get updates automatically
- No version fragmentation — everyone on the same version
- Billing gate: updates only apply to accounts current on billing (paused/delinquent accounts get locked out until resolved)

### What This Means
- New features ship to everyone at once
- Bug fixes apply universally
- No maintenance burden of multiple codebases
- Tenants can't "opt out" of updates (standard SaaS model)

---

## Technical Considerations

### Database
- Add `tenant_id` / `company_id` to all tables
- Ensure all queries are tenant-scoped
- Row-level security or strict query scoping

### Auth
- Keep Manus OAuth or add email/password option
- Tenant context on login
- Role-based permissions within tenant

### Infrastructure
- Start with shared DB, tenant-scoped
- Scale to isolated DBs per tenant later if needed

### Security
- Audit logging for compliance
- Data encryption at rest and in transit
- SOC 2 considerations for enterprise sales

---

## Phased Rollout

### Phase 1 (MVP White-Label)
- Multi-tenancy (data isolation)
- Stripe billing with 2-3 tiers
- Onboarding wizard (basic)
- GHL integration (already done)
- NAH migrated as first tenant
- Base universal AI model

### Phase 2 (Expand Integrations)
- HubSpot integration
- Salesforce integration
- Improved onboarding wizard
- Custom roles per tenant
- Industry-specific AI models (opt-in)

### Phase 3 (Scale)
- API access for enterprise
- Custom badge definitions per tenant
- Advanced analytics
- Reseller/agency tier
- Full universal learning system with industry verticals

---

## Scaling to 100 Customers — What Needs to Be Right

### Guiding Principle
> "Build it so 100 companies can onboard, pay, get support, and succeed WITHOUT me touching anything. Self-serve everything. If a customer has to email me to fix a billing issue, we've failed."

---

### Technical / Infrastructure Concerns

| Concern | Why It Matters | What to Build |
|---------|---------------|---------------|
| Database performance | 100 tenants × 10 users × 20 calls/day = 20,000+ calls/day | Proper indexing, query optimization, tenant isolation |
| Call processing queue | Can't grade 20K calls synchronously | Background job queue, parallel processing, status visibility |
| CRM API rate limits | GHL/HubSpot/Salesforce all have limits | Rate limiting, retry logic, queue management |
| Storage costs | Call recordings add up fast | Compression, retention policies, tiered storage |
| AI/LLM costs | Grading 20K calls/day isn't cheap | Cost tracking per tenant, consider usage-based pricing |

---

### Front-End / Self-Serve (Critical)

**1. Bulletproof Onboarding**
- Wizard must work without hand-holding
- Clear error messages when CRM connection fails
- Video tutorials embedded at each step
- Progress saving (can resume if interrupted)

**2. Billing Self-Service**
- Update payment method
- View invoices and payment history
- Upgrade/downgrade plan
- Cancel subscription (with off-ramp/win-back flow)
- Handle failed payments gracefully (retry, notify, grace period)

**3. Help Center / Knowledge Base**
- FAQs
- How to connect each CRM
- How to upload training materials
- How to set up roles and grading
- Troubleshooting common issues
- Video walkthroughs

**4. In-App Support**
- Chat widget or ticket system (Intercom, Crisp, or similar)
- NOT owner's personal email
- Canned responses for common issues
- Escalation path for real problems

**5. Status Page**
- status.getgunner.ai
- Shows system health, ongoing incidents
- Customers check here instead of flooding support
- Subscribe to updates

**6. Platform Admin Dashboard (Owner View)**
- MRR / ARR / churn / growth at a glance
- List of tenants with failed payments
- Tenants with low usage (churn risk)
- Support ticket volume and trends
- Revenue by plan tier
- New signups this week/month

---

### Legal Requirements (Before Scaling)

- **Terms of Service** — liability limits, acceptable use, termination rights, IP ownership
- **Privacy Policy** — data collection, universal AI learning consent, data retention
- **Data Processing Agreement (DPA)** — enterprise customers will require this
- **Refund Policy** — clear expectations (e.g., no refunds for partial months)
- **Cookie Policy** — if using analytics/tracking

---

## Questions for Manus
1. What's the estimated timeline for Phase 1?
2. Stripe integration — do you have experience with Stripe Billing/Subscriptions?
3. Multi-tenancy approach — shared DB with tenant scoping, or separate DBs?
4. Any concerns about the GHL integration working across multiple accounts?
5. Universal AI learning — any technical constraints on training across tenant data?
6. What's needed for the anonymization pipeline?

---

## Low-Touch Operations — Building for Passive Income

### Guiding Principle
> "This should not become a second job. Build systems that run without me. I only get involved for strategic decisions, not daily operations."

---

### Sales & Marketing (Self-Serve Only)

**No demo calls.** Product should sell itself.

- Recorded product tour / walkthrough video on landing page
- Self-serve signup with free trial
- Clear pricing page (no "Contact Us for pricing")
- Testimonials and case studies do the selling
- If someone needs a demo call to understand it, they're not the right customer

---

### Pricing (No Custom Deals)

**One price. No negotiation.**

- Fixed tiers: Starter / Growth / Scale
- No "let's hop on a call" for enterprise discounts
- No custom contracts until there's a dedicated enterprise tier with support priced in
- "This is the price" — take it or leave it

---

### Feature Requests (Controlled Roadmap)

**Customers don't drive the roadmap. You do.**

- Public roadmap (Canny, Productboard, or simple Notion page)
- Customers can submit and vote on features
- Review quarterly — batch decisions, not reactive building
- Default answer to feature requests: "Added to the roadmap for consideration"
- Say no often

---

### Automated Customer Success (Prevent Silent Churn)

**Email sequences triggered by behavior:**

| Trigger | Email |
|---------|-------|
| Signup | "Welcome! Here's how to get started" |
| Day 2, no CRM connected | "Let's get your CRM connected — here's how" |
| Day 5, no calls graded | "Your team hasn't graded any calls yet — need help?" |
| Day 14 (trial ending) | "Your trial ends in 3 days — upgrade to keep access" |
| Day 30 (active user) | "You're seeing results! Here's how to get even more value" |
| Day 45, low usage | "We noticed you haven't logged in — everything okay?" |
| Cancellation | "Sorry to see you go — quick survey + door open to return" |

**Build with:** Customer.io, Intercom, or simple Mailchimp automation

---

### Support (VA-Ready, Not Founder-Dependent)

**Tiered support model:**

| Tier | Who Handles | Examples |
|------|-------------|----------|
| Tier 0 | Self-serve (KB, docs) | "How do I connect GHL?" |
| Tier 1 | VA / Support tool | Password resets, billing questions, basic troubleshooting |
| Tier 2 | Manus (technical) | Bugs, integration issues, outages |
| Tier 3 | You (rare) | Strategic escalations, angry enterprise customer, legal |

**Requirements:**
- Knowledge base covers 80% of questions
- Canned responses documented for VA
- Community (Slack/Discord) where customers help each other
- You only see Tier 3 escalations

---

### Monitoring & Incidents (Manus Gets Paged, Not You)

- Automated uptime monitoring (Uptime Robot, Pingdom, Better Uptime)
- Status page auto-updates when issues detected
- Manus receives alerts for downtime, not you
- You get a daily/weekly summary, not real-time noise
- Post-incident reviews monthly (if needed)

---

### Billing & Refunds (Self-Serve, Clear Policy)

**Billing:**
- Customers update payment method themselves
- Failed payment → automated retry → email notification → grace period → account paused
- No manual invoicing

**Refunds:**
- Policy in TOS: Full refund within 14 days, no refunds after
- Automated refund flow for eligible requests
- Chargebacks auto-responded with TOS documentation
- No negotiation

---

### The Passive Checklist

| Area | Status | Notes |
|------|--------|-------|
| Self-serve signup | ⬜ | No demos, no sales calls |
| Fixed pricing | ⬜ | No custom deals |
| Onboarding emails | ⬜ | Automated sequence |
| Knowledge base | ⬜ | Covers common questions |
| Community | ⬜ | Slack/Discord for peer support |
| VA support docs | ⬜ | Canned responses ready |
| Monitoring | ⬜ | Alerts go to Manus |
| Status page | ⬜ | Auto-updating |
| Refund policy | ⬜ | Clear, automated |
| Public roadmap | ⬜ | Customers vote, you decide |

---

## Success Metrics
- Time to first graded call < 10 minutes
- Onboarding completion rate > 80%
- Monthly churn < 5%
- AI grading accuracy improves with scale (measure over time)
