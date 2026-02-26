# Lead Qualification Add-on

**Product Name:** Lead IQ
**Price:** $49/mo
**Status:** 🔨 Building

## Purpose

Automatically qualify, score, and route new leads. Ensures no lead falls through the cracks and reps only work prioritized leads.

---

## Agents

| Agent | Role | Responsibility |
|-------|------|----------------|
| **Coordinator** | Lead | Receives new leads, orchestrates workflow, makes final routing decision |
| **Data Enricher** | Worker | Pulls property data from external sources (Zillow, PropStream, county records) |
| **Qualifier** | Worker | Scores lead based on configured criteria, assigns Hot/Warm/Cold |
| **Router** | Worker | Assigns lead to correct team member based on rules |
| **Watchdog** | Worker | Monitors assigned leads, flags if no contact within SLA |
| **QA Reviewer** | Reviewer | Spot-checks qualification decisions for accuracy |

---

## Workflow

```
GHL: New Contact Created (or Opportunity Created)
        ↓
[1] Coordinator receives webhook
        ↓
[2] Coordinator → Data Enricher: "Enrich this lead"
        ↓
[3] Data Enricher pulls: property data, tax records, Zillow estimate, all owner names on title
        ↓
[4] Coordinator → Qualifier: "Score this lead" (with enriched data)
        ↓
[5] Qualifier evaluates 5 factors, assigns score (HOT/WARM/COLD)
        ↓
[6] Coordinator → Router: "Route this lead" (with score)
        ↓
[7] Router applies rules, assigns to team member
        ↓
[8] Coordinator updates GHL: tags, custom fields, task creation, assignment
        ↓
[9] Watchdog begins monitoring for follow-up SLA
        ↓
[10] QA Reviewer samples 10% for accuracy audit
```

---

## ⚠️ RULES TO VERIFY - Corey please confirm these are accurate

### Lead Scoring (v2 — updated per Corey's audit 2026-02-16)

| Factor | Weight | HOT Criteria | WARM Criteria |
|--------|--------|--------------|---------------|
| **Motivation** | Highest | Clear pain (inherited, divorce, foreclosure, tired landlord, code violations) | Some or unclear motivation |
| **Timeline** | High | Wants to sell within 30 days | 30+ days or unclear |
| **Condition** | Medium | Distressed, needs work, vacant | Some repairs or move-in ready |
| **Price** | Medium | Will sell below market | Flexible or wants retail |
| **Source** | High | High-intent source (PPL, direct mail, PPC, driving for dollars) | Lower-intent (cold call, Facebook, list) |
| **PPL Bonus** | ×2 | PPL source counts as 2 factors (implied timeline + high-intent) | — |
| **Conversation History** | Bonus | 3+ notes OR 5+ messages AND motivation/timeline/price keywords present | Not enough history or no keywords |
| **Multi-Unit Penalty** | -1 | Apartment/multi-unit detected (apt, unit, #, complex, multi-family) | Single family |

**Scoring Logic (v2):**
- PPL source = 2 factors (source + ppl_bonus)
- Conversation history with engagement + keywords = +1 bonus factor
- Multi-unit/apartment = -1 penalty factor
- 3+ net factors = HOT, less = WARM
- **No COLD category** — all leads get worked

**Flags (informational, don't change score):**
- 🏠 **Street View**: Link included for condition check when condition is unknown
- 🏢 **Multi-unit**: Flagged for unit ambiguity
- 💰 **Buybox**: Luxury/commercial properties flagged but not auto-rejected
- 👤 **Fake Name**: Data Hygiene flag noted but doesn't downgrade score
- 🏗️ **Good Condition**: Property in good shape = less urgency (condition factor not checked)

✅ VERIFIED by Corey 2026-02-05
✅ UPDATED per Corey's audit feedback 2026-02-16

---

### Routing Rules

| Lead Score | Assignment | Task Created |
|------------|------------|--------------|
| **HOT** | Daniel (LM doing qual) | "Priority call - HOT lead" due in 15 min |
| **WARM** | Daniel (LM doing qual) | "Call - WARM lead" due in 15 min |

**Current State (NAH):**
- Daniel is only LM doing new lead qualification
- ALL leads assigned to Daniel
- 15 minute SLA for first call attempt

**Future State (larger team):**
- Round-robin between multiple LMs
- Skip if LM has 10+ open tasks
- Track assignment count for fairness

**Drip Logic:**
- Drip ONLY triggers if lead doesn't answer first call
- Workflow: "New Lead Drip" in CRM Drips folder
- Drip = email/SMS sequence
- Drip STOPS if lead replies

**Weekend Gap:**
- No calls happen on weekends currently
- Known issue — needs resolution
- AI caller considered but not preferred

✅ VERIFIED by Corey 2026-02-05

---

### Follow-Up SLA (Watchdog)

| Lead Score | First Contact SLA | Escalation |
|------------|-------------------|------------|
| HOT | 15 minutes | Alert Jessica Guzman if no call in 30 min |
| WARM | 15 minutes | Alert Jessica Guzman if no call in 30 min |

**"Contact" = logged call attempt in GHL**

**Weekend Handling:**
- SLA paused on weekends (Sat-Sun)
- Weekend leads get immediate SMS/email auto-response
- Task created (will show overdue Monday AM)
- Monday morning: weekend leads prioritized first

**Current State:** Task created → overdue by Monday when LM arrives

**Note:** SOPs for this process are in GHL dashboard (bottom of page)

✅ VERIFIED by Corey 2026-02-05
✅ UPDATED: Escalation to Jessica, PPL=HOT timeline, Google Earth condition check

---

### GHL Updates (What agents write)

| Data | GHL Field |
|------|-----------|
| **Lead Score** | Tags: `Hot` or `Warm` |
| **Property street(s)** | General Info → Business Name (supports multiple with `&`) |
| **Property full address** | General Info → Street Address, City, State, Postal Code |
| **Mailing address** | Contact → Mailing Street, Mailing City, Mailing State, Mailing Zip |
| **Owner names (all on title)** | Contact Note |
| **All enrichment data** | Contact Note (property details, Zillow estimate, tax info, score reasoning) |
| **Pipeline Stage** | Move to appropriate stage based on score |
| **Task** | Created for assigned rep |

**Data Storage Philosophy:**
- **Notes over custom fields** — works across any GHL setup without field creation
- **Tags for scoring** — simple `Hot` / `Warm` tags, no custom dropdowns
- **Standard GHL fields only** — no custom field setup required for new tenants
- All enrichment data (owner names, property data, comps, etc.) → single formatted Note

✅ VERIFIED by Corey 2026-02-09

---

## Tenant Configuration (What each Gunner customer sets up)

```json
{
  "tenantId": "tenant_xxx",
  "addOn": "lead-qualification",
  "config": {
    "scoring": {
      "factors": ["timeline", "condition", "price", "motivation", "source"],
      "hotThreshold": 3
    },
    "routing": {
      "qualAssignees": ["user_daniel_id"],
      "rotationMethod": "round-robin",
      "noAnswerAction": "working_drip"
    },
    "sla": {
      "firstCallMinutes": 15,
      "escalationMinutes": 30,
      "escalationTarget": "user_corey_id",
      "weekendPause": true
    },
    "dataSources": {
      "redfin": true,
      "zillow": true,
      "batchleads": true,
      "countyRecords": ["davidson", "williamson", "rutherford"]
    },
    "ghlMapping": {
      "scoreField": "lead_score",
      "factorsField": "score_factors",
      "enrichmentField": "property_data",
      "newLeadDripWorkflow": "new_lead_drip_id"
    }
  }
}
```

Every customer can customize these values. NAH's values are the defaults.

**GHL Reference Workflows (NAH):**
- New lead trigger: "New Lead - Entry Point" in Acquisitions folder
- New Lead Drip: "New Lead Drip" in CRM Drips folder
- SOPs: Dashboard (bottom of page)

---

## Data Sources for Enrichment

| Source | Data Retrieved | API/Method |
|--------|---------------|------------|
| Redfin | Comps, listing history, price estimates | Scrape or API |
| Zillow | Zestimate, beds/baths, sqft, lot size, year built | API or scrape |
| BatchLeads | Skip tracing, **all owner names on title**, property data | API (NAH has subscription) |
| County Records | Tax records, liens, ownership history, **owner names** | Varies by county — many different sites |

**Owner Names:** Capture ALL names on title (e.g., "John Smith & Jane Smith", "ABC Holdings LLC", trusts, etc.) — critical for contracts and skip tracing additional contacts.

**County Data (Tennessee):**
- NAH works pretty much every county in TN
- Most rural counties: same site (easier)
- Different external sites: Hamilton, Knox, Blount
- Agent opportunity: standardize retrieval across all formats

✅ VERIFIED by Corey 2026-02-05

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Leads scored within 5 minutes | 95% |
| Qualification accuracy (vs human review) | 90% |
| SLA compliance (contacted within window) | 85% |
| False HOT rate (scored HOT but actually COLD) | <10% |

---

## Future: AI Caller Add-on

**Not building now, but on roadmap.**

Prerequisites before AI caller:
- Analyze hundreds/thousands of NAH calls
- Map common questions sellers ask
- Map how team handles each question
- Train AI voice on successful call patterns

**When ready:** AI caller handles immediate response for:
- Weekend leads (speed to lead)
- After-hours leads
- Overflow when LMs are maxed

---

## Next Steps

1. ✅ Corey verified rules (2026-02-05)
2. Write agent system prompts
3. Build workflow logic
4. Test with historical NAH leads
5. Go live with real leads
6. Iterate based on accuracy
