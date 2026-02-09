# Gunner Agent Suite - Tenant Onboarding

## Design Philosophy

**Goal:** New client goes from signup to fully operational agents in under 10 minutes.

**Principles:**
1. **Zero-config where possible** — Works out of the box
2. **Auto-discovery** — Detects pipelines, stages, team automatically
3. **Smart defaults** — Industry-standard settings pre-configured
4. **Progressive complexity** — Basic works instantly, customization optional

---

## Onboarding Flow

### Step 1: Connect CRM (Required)
**Time: 2 minutes**

```
┌─────────────────────────────────────┐
│  Connect Your CRM                   │
│                                     │
│  [🔗 Connect GoHighLevel]           │
│                                     │
│  We'll automatically detect your:   │
│  • Pipelines and stages             │
│  • Team members                     │
│  • Contact fields                   │
│  • Existing automations             │
│                                     │
└─────────────────────────────────────┘
```

**What happens:**
- OAuth connection to GHL
- Auto-scan of account structure
- Pipeline/stage mapping

### Step 2: Auto-Detection Results
**Time: 30 seconds (automated)**

```
┌─────────────────────────────────────┐
│  ✅ Account Connected!              │
│                                     │
│  We found:                          │
│  📊 6 Pipelines                     │
│  👥 4 Team Members                  │
│  📍 3 Markets (Nashville, Memphis,  │
│     Knoxville)                      │
│                                     │
│  Detected Setup:                    │
│  • Sales Pipeline: "Sales Process"  │
│  • Dispo Pipeline: "Dispo"          │
│  • Lead Stage: "New Lead"           │
│  • UC Stage: "Under Contract"       │
│                                     │
│  [Looks Right] [Adjust Mapping]     │
│                                     │
└─────────────────────────────────────┘
```

**Auto-Detected:**
- Pipeline names and stages
- Stage-to-function mapping (using keywords)
- Team members and roles (from GHL users)
- Markets (from deal addresses)

### Step 3: Choose Your Agents
**Time: 2 minutes**

```
┌─────────────────────────────────────┐
│  Select Agents to Activate          │
│                                     │
│  CORE (Included)                    │
│  ☑ Pre-Call Brief                   │
│  ☑ LM Assistant                     │
│  ☑ AM Assistant                     │
│  ☑ Follow Up Bot                    │
│  ☑ Appointment Bot                  │
│                                     │
│  DEAL FLOW                          │
│  ☑ Contract Bot                     │
│  ☑ Title Bot                        │
│  ☑ Post-Close Bot                   │
│                                     │
│  OPERATIONS                         │
│  ☑ Data Hygiene                     │
│  ☑ KPI Auto-Entry                   │
│  ☐ Commission Tracker (configure)   │
│                                     │
│  COMMUNICATION                      │
│  ☑ After-Hours Bot                  │
│  ☑ Voicemail Bot                    │
│  ☐ Email Triage (connect email)     │
│                                     │
│  [Activate Selected]                │
│                                     │
└─────────────────────────────────────┘
```

**Default:** All core agents ON
**Optional:** Agents requiring extra config shown but unchecked

### Step 4: Quick Preferences
**Time: 1 minute**

```
┌─────────────────────────────────────┐
│  Quick Setup                        │
│                                     │
│  Business Hours:                    │
│  [8 AM] to [7 PM] [CT ▼]            │
│                                     │
│  Weekend Coverage:                  │
│  ☑ Saturday (limited)               │
│  ☐ Sunday                           │
│                                     │
│  Notifications go to:               │
│  📱 [+1 615-555-1234]               │
│  📧 [owner@company.com]             │
│                                     │
│  [Complete Setup →]                 │
│                                     │
└─────────────────────────────────────┘
```

### Step 5: Done! 🎉
**Total time: ~5 minutes**

```
┌─────────────────────────────────────┐
│  🎉 You're All Set!                 │
│                                     │
│  12 agents are now active           │
│                                     │
│  What happens next:                 │
│  • Agents start monitoring now      │
│  • You'll get your first Daily      │
│    Pulse report tomorrow at 8 AM    │
│  • Pre-call briefs will appear      │
│    before your next calls           │
│                                     │
│  [View Dashboard] [Customize More]  │
│                                     │
└─────────────────────────────────────┘
```

---

## Auto-Configuration Details

### Pipeline Mapping (Zero-Config)

**Detection Logic:**
| Looking For | Keywords Searched | Maps To |
|-------------|-------------------|---------|
| Sales Pipeline | "sales", "lead", "acquisition" | Lead flow agents |
| Dispo Pipeline | "dispo", "buyer", "assignment" | Dispo agents |
| Follow-up | "follow", "nurture", "drip" | Follow-up bot |

**Stage Detection:**
| Stage Type | Keywords | Example Matches |
|------------|----------|-----------------|
| New Lead | "new", "incoming", "fresh" | "New Lead", "Fresh Leads" |
| Working | "working", "qualifying", "active" | "Working Lead", "In Progress" |
| Hot | "hot", "priority", "ready" | "Hot Leads", "High Priority" |
| Appointment | "apt", "appointment", "scheduled" | "Apt Set", "Walkthrough" |
| Made Offer | "offer", "presented" | "Made Offer", "Offer Sent" |
| Under Contract | "contract", "uc", "pending" | "Under Contract", "UC" |
| Closed | "closed", "funded", "won" | "Closed", "Funded", "Purchased" |

**Fallback:** If detection uncertain → Show simple mapping UI

### Team Detection (Zero-Config)

**From GHL Users:**
- Pull all active users
- Detect roles from user title or permissions
- LMs = users with call activity
- AMs = users with appointment/offer activity
- Admin = users with full permissions

**Fallback:** Ask "Who are your LMs?" (multi-select from users)

### Market Detection (Zero-Config)

**From Deal Data:**
- Scan property addresses in pipeline
- Extract cities/counties
- Identify top 3-5 markets by volume

**Fallback:** "What markets do you operate in?" (text input)

---

## Agent Activation Matrix

### Instant-On (No Config Needed)
| Agent | Auto-Configured How |
|-------|---------------------|
| Pre-Call Brief | Uses GHL contact + public data |
| LM Assistant | Uses detected stages |
| AM Assistant | Uses detected stages |
| Follow Up Bot | Uses detected follow-up pipeline |
| Appointment Bot | Uses GHL calendar |
| Data Hygiene | Scans all contacts |
| Voicemail Bot | Uses GHL voicemails |
| Market Watch | Uses detected markets |
| MLS Monitor | Uses pipeline property addresses |
| Cash Flow | Uses pipeline deals |

### Requires 1 Input
| Agent | Required Input |
|-------|----------------|
| After-Hours Bot | Confirm business hours |
| Report Generator | Confirm notification contact |
| Commission Bot | Select split structure (default provided) |
| PPL Refund Bot | Select PPL providers used |

### Requires Connection
| Agent | Required Connection |
|-------|---------------------|
| Email Triage | Connect Gmail/Outlook |
| Contract Bot | Connect DocuSign/DocHub |
| Title Bot | Add title company contact |
| KPI Entry Bot | Connect Google Sheets |

---

## Default Settings

### Business Rules (Editable Anytime)
```yaml
business_hours:
  weekday: 8:00 AM - 7:00 PM
  saturday: 9:00 AM - 5:00 PM
  sunday: closed

response_sla:
  new_lead: 15 minutes
  hot_lead: 5 minutes
  after_hours: next business day

follow_up:
  one_month: 30 days
  four_month: 120 days
  one_year: 365 days

commission:
  structure: simple
  company: 70%
  team: 30%
  lm_split: 40%
  am_split: 60%
```

### Stage Probability Defaults
```yaml
pipeline_probability:
  new_lead: 5%
  working_lead: 10%
  hot_lead: 25%
  appointment_set: 40%
  made_offer: 50%
  under_contract: 85%
  closing_scheduled: 95%
```

---

## Progressive Customization

### Level 1: Basic (Setup)
- Accept defaults
- Everything works immediately

### Level 2: Tuned (Week 1)
- Adjust business hours
- Modify notification preferences
- Tweak stage names

### Level 3: Customized (Month 1)
- Custom follow-up sequences
- Modified commission structures
- Custom report schedules
- Adjusted probability weights

### Level 4: Advanced (Ongoing)
- Custom agent behaviors
- API integrations
- Multi-location settings
- White-label configurations

---

## Validation Checks

Before activating, system verifies:

**Critical (blocks activation):**
- ❌ GHL connected
- ❌ At least one pipeline found
- ❌ At least one team member

**Warning (activates with notice):**
- ⚠️ No follow-up pipeline found (Follow Up Bot limited)
- ⚠️ No calendar connected (Appointment Bot limited)
- ⚠️ No call data found (Pre-Call Brief limited)

**Info (noted for optimization):**
- ℹ️ Email not connected (Email Triage unavailable)
- ℹ️ DocuSign not connected (Contract Bot manual mode)

---

## Post-Onboarding

### First 24 Hours
- Welcome email with quick tips
- First Daily Pulse report
- Any issues auto-detected and flagged

### First Week
- Check-in notification with suggestions
- Performance baseline established
- Auto-adjustments based on behavior

### Ongoing
- Monthly optimization suggestions
- New feature announcements
- Usage insights

---

## Technical Implementation

### Onboarding API Flow
```
1. POST /onboard/connect-ghl
   → Returns GHL OAuth URL
   
2. GET /onboard/detect
   → Scans account, returns detected config
   
3. POST /onboard/configure
   → Accepts user selections/adjustments
   
4. POST /onboard/activate
   → Activates selected agents
   
5. GET /onboard/status
   → Returns activation status
```

### Database Schema
```sql
tenant_config {
  tenant_id
  ghl_account_id
  detected_config (JSON)
  user_config (JSON)
  active_agents (JSON array)
  onboarding_completed_at
}
```

---

## Success Metrics

- **Onboarding completion rate** (target: >90%)
- **Time to first value** (target: <24 hours)
- **Configuration changes in week 1** (lower = better defaults)
- **Support tickets during onboarding** (target: <10%)
- **Agent activation rate** (% of available agents activated)
