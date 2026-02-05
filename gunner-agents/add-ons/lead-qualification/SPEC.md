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
[3] Data Enricher pulls: property data, tax records, Zillow estimate, ownership info
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

### Lead Scoring (5 Factors)

| Factor | Weight | HOT Criteria | WARM Criteria | COLD Criteria |
|--------|--------|--------------|---------------|---------------|
| **Timeline** | High | Wants to sell within 30 days | 30-60 days | 60+ days or "just looking" |
| **Condition** | Medium | Distressed, needs work, vacant | Some repairs needed | Move-in ready, retail condition |
| **Price** | Medium | Will sell below market | Flexible on price | Wants retail/above market |
| **Motivation** | Highest | Clear pain (inherited, divorce, foreclosure, tired landlord, code violations) | Some motivation present | No clear motivation |
| **Source** | Low | High-intent source (direct mail response, PPC, driving for dollars) | Medium-intent (cold call answered) | Low-intent (Facebook, bought list) |

**Scoring Logic:**
- 3+ factors = HOT
- 2 factors = WARM
- 0-1 factors = COLD

**Is this accurate? Any adjustments needed?**

---

### Routing Rules

| Lead Score | Assignment | Task Created |
|------------|------------|--------------|
| **HOT** | Kyle (AM) | "Priority call - HOT lead" due in 1 hour |
| **WARM** | Next available LM (Chris or Daniel) | "Follow up - WARM lead" due in 4 hours |
| **COLD** | Auto-nurture sequence (no human assignment) | None - enters drip |

**LM Rotation Logic:**
- Round-robin between Chris and Daniel
- Skip if LM has 10+ open tasks
- Track assignment count for fairness

**Is this accurate? Any adjustments needed?**

---

### Follow-Up SLA (Watchdog)

| Lead Score | First Contact SLA | Escalation |
|------------|-------------------|------------|
| HOT | 1 hour | Alert Corey if no contact in 2 hours |
| WARM | 4 hours | Alert assigned LM manager if no contact in 8 hours |
| COLD | N/A (in drip) | N/A |

**"Contact" = logged call, SMS sent, or appointment set in GHL**

**Is this accurate? Any adjustments needed?**

---

### GHL Updates (What agents write)

| Field | Value |
|-------|-------|
| Tag | `lead-iq-scored`, `hot`/`warm`/`cold` |
| Custom Field: Lead Score | HOT / WARM / COLD |
| Custom Field: Score Factors | "Timeline: Y, Motivation: Y, Price: N..." |
| Custom Field: Enrichment | Property details from Data Enricher |
| Pipeline Stage | Move to appropriate stage based on score |
| Task | Created for assigned rep |
| Note | Agent reasoning: why this score was assigned |

**Are these the right fields to update? Any custom fields I should know about?**

---

## Tenant Configuration (What each Gunner customer sets up)

```json
{
  "tenantId": "tenant_xxx",
  "addOn": "lead-qualification",
  "config": {
    "scoring": {
      "factors": ["timeline", "condition", "price", "motivation", "source"],
      "hotThreshold": 3,
      "warmThreshold": 2
    },
    "routing": {
      "hotAssignee": "user_kyle_id",
      "warmAssignees": ["user_chris_id", "user_daniel_id"],
      "coldAction": "nurture_sequence",
      "rotationMethod": "round-robin"
    },
    "sla": {
      "hotMinutes": 60,
      "warmMinutes": 240,
      "escalationTarget": "user_corey_id"
    },
    "ghlMapping": {
      "scoreField": "lead_score",
      "factorsField": "score_factors",
      "enrichmentField": "property_data"
    }
  }
}
```

Every customer can customize these values. NAH's values are the defaults.

---

## Data Sources for Enrichment

| Source | Data Retrieved | API/Method |
|--------|---------------|------------|
| Zillow | Zestimate, beds/baths, sqft, lot size, year built | API or scrape |
| PropStream | Owner info, mortgage, tax value, equity estimate | API (requires subscription) |
| County Records | Tax records, liens, ownership history | Varies by county |
| GHL Contact | Existing tags, notes, previous interactions | API |

**What data sources does NAH currently use for property research?**

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Leads scored within 5 minutes | 95% |
| Qualification accuracy (vs human review) | 90% |
| SLA compliance (contacted within window) | 85% |
| False HOT rate (scored HOT but actually COLD) | <10% |

---

## Next Steps

1. **Corey confirms rules above** ✋ WAITING
2. Write agent system prompts
3. Build workflow logic
4. Test with historical NAH leads
5. Go live with real leads
6. Iterate based on accuracy
