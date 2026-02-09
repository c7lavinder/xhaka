# Pre-Call Brief Bot

## Overview
Automatically prepares a comprehensive brief before every LM/AM call, giving reps instant context without manual research.

## Trigger
- **LM calls:** Task created for outbound call OR inbound call detected
- **AM calls:** Appointment scheduled OR offer call task created

## Output
Delivers a "Call Brief" to the rep containing:
1. Property snapshot
2. Seller context
3. Previous interactions
4. Red flags
5. Suggested approach

---

## Agents

### 1. Brief Coordinator
**Role:** Orchestrates the brief generation process

**Actions:**
- Receives trigger (call about to happen)
- Dispatches data requests to other agents
- Assembles final brief
- Delivers to rep (GHL notes + optional Slack/SMS)

### 2. Property Researcher
**Role:** Gathers property data from external sources

**Data Sources:**
- Zillow (Zestimate, beds/baths/sqft, photos, history)
- Redfin (estimate, days on market if listed)
- County assessor (tax value, owner info, liens)
- Google Earth (property condition, neighborhood)
- BatchLeads (skip trace data, additional contacts)

**Output:**
```
PROPERTY SNAPSHOT
-----------------
Address: 123 Main St, Nashville TN 37211
Zillow Zestimate: $285,000
County Tax Value: $245,000
Beds/Baths/Sqft: 3/2/1,450
Year Built: 1975
Lot Size: 0.25 acres
Owner: John Smith (since 2015)
Tax Status: Current
Liens: None found
MLS Status: NOT LISTED ✓
Google Earth: Roof appears aged, yard overgrown
```

### 3. MLS Checker
**Role:** Determines if property is currently listed

**Actions:**
- Check MLS via API or scrape
- If listed: Pull listing price, DOM, agent info
- Flag as RED FLAG if listed (changes negotiation dynamic)

**Output:**
```
MLS STATUS: LISTED ⚠️
List Price: $310,000
Days on Market: 45
Agent: Jane Doe, Keller Williams
→ Seller has other options. Expect higher price expectations.
```

### 4. Context Compiler
**Role:** Summarizes all previous interactions with this lead

**Data Sources:**
- GHL contact notes
- GHL conversation history (SMS, email)
- Previous call recordings/transcripts (from Gunner)
- Previous call grades (from Gunner)

**Output:**
```
SELLER CONTEXT
--------------
Lead Source: Cold Call (Jan 15)
Total Touches: 7 (3 calls, 4 SMS)
Last Contact: Feb 5 (SMS - "call me next week")

Previous Call Summary (Jan 28):
- Inherited property from mother
- Lives out of state (California)
- Mentioned $200K but "flexible"
- Concerned about clearing out belongings
- Motivation: Doesn't want to be a landlord

Gunner Score: 62% (B-)
Key Weakness: Didn't isolate all decision makers
```

### 5. Red Flag Detector
**Role:** Identifies potential issues before the call

**Red Flags to Check:**
- Property listed on MLS
- Multiple owners on deed (decision maker issue)
- Recent sale (less than 1 year)
- Tax liens or code violations
- Seller marked as "Red" (hostile) in previous notes
- Property in flood zone
- Probate situation without paperwork started
- Previous no-shows

**Output:**
```
RED FLAGS
---------
⚠️ Multiple owners on deed (John Smith + Mary Smith)
   → Confirm both decision makers available
⚠️ Previous no-show on Jan 30
   → Confirm appointment before driving out
```

### 6. Approach Suggester
**Role:** Recommends talking points based on context

**Logic:**
- If inherited → Empathize with situation, offer to handle cleanout
- If out of state → Emphasize convenience of cash sale
- If listed and expired → "Frustrating when it doesn't sell..."
- If tax issues → Offer to close fast before penalties
- If previous objection noted → Prepare counter

**Output:**
```
SUGGESTED APPROACH
------------------
Primary Motivation: Inherited, lives out of state
Lead With: "I know dealing with a property from across the country is a hassle..."
Address: Belongings concern - mention we can handle cleanout
Watch For: May have unrealistic price expectations (hasn't seen condition)
Previous Objection: Wanted $200K → Anchor at $150-170K based on condition
```

---

## Delivery

### Timing
- **Outbound calls:** Brief ready 2 minutes before scheduled call
- **Inbound calls:** Brief generated on ring, delivered within 30 seconds

### Channels
1. **GHL Contact Notes** — Always (pinned to top as "CALL BRIEF - [Date]")
2. **Slack DM** — Optional (if rep has Slack connected)
3. **SMS to Rep** — Optional (condensed version)

### Format Options
- **Full Brief:** All sections (for complex leads)
- **Quick Brief:** Property snapshot + red flags only (for simple calls)

---

## Tenant Configuration

```json
{
  "preBriefBot": {
    "enabled": true,
    "triggers": {
      "outboundCall": true,
      "inboundCall": true,
      "appointmentScheduled": true
    },
    "dataSources": {
      "zillow": true,
      "redfin": true,
      "countyAssessor": true,
      "googleEarth": true,
      "batchLeads": true,
      "mls": true
    },
    "delivery": {
      "ghlNotes": true,
      "slack": false,
      "sms": false
    },
    "briefType": "full"
  }
}
```

---

## Error Handling

| Scenario | Action |
|----------|--------|
| Data source unavailable | Skip that section, note "Data unavailable" |
| No previous interactions | Note "First contact" |
| Property not found | Use address only, flag for manual research |
| Brief generation fails | Alert rep, log error, continue without brief |

---

## Success Metrics

- Brief delivered before 95% of calls
- Rep satisfaction score (survey)
- Reduction in "I'll need to look that up" during calls
- Increase in first-call conversion rate
