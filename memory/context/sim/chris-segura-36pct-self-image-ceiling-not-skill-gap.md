---
id: twin-chris
role: Lead Manager (LM)
level: unknown
call_score: 36%
behavioral_logic:
  primary_mode: inconsistent_qualification
  strength: initial_contact_attempt
  weakness: discovery_depth, objection_handling, lead_routing_accuracy
  decision_trigger: unclear_often_based_on_gut_not_criteria
  pipeline_position: intake_and_qualification
  handoff_receives_from: inbound_leads, jessica_data
  handoff_sends_to: [twin-kyle]
  risk_level: HIGH
  pipeline_risk: lead_leakage, premature_disqualification, poor_handoffs
---

# 🧠 Digital Twin: Chris (LM)

## Identity
- **Role:** Lead Manager
- **Gunner Level:** Unknown / Not Level 5
- **Call Score:** 36%
- **Specialty:** Attempted lead qualification — significant coaching intervention needed

---

## ⚠️ Risk Profile: HIGH

Chris is operating at **36% call score** — well below the team floor. This is a **pipeline risk** node. Deals are likely being lost, killed prematurely, or passed to [[twin-kyle]] without proper qualification.

---

## Behavioral Logic

### Identified Failure Patterns (from 36% score context)

#### 1. Shallow Discovery
- Not getting through the full qualification checklist before forming an opinion
- Likely skipping equity confirmation or treating seller's asking price as equity indicator
- Missing the "why are you selling?" question or accepting surface answers

#### 2. Objection Capitulation
- When seller pushes back on price or company credibility, Chris likely backs off instead of re-framing
- "I'll think about it" objections are probably being logged as "not interested" and killed
- Dead leads accumulating from winnable conversations

#### 3. Poor Routing Accuracy
- Hot leads may be tagged as warm/cold due to incomplete qualification
- [[twin-kyle]] may be receiving under-qualified leads (wasting his time) or not receiving leads he should get
- This creates downstream friction in the pipeline

#### 4. Script Drift / Ad-Lib Risk
- At 36%, likely deviating significantly from proven qualification frameworks
- Improvising responses to objections without a framework = inconsistent outcomes

---

## Coaching Intervention Plan

### Immediate Fixes
```yaml
fix_1: Return to strict qualification checklist (no skipping steps)
fix_2: Role-play objection handling x3 per week with Corey or Kyle
fix_3: Record every call — Gunner review required within 24hrs
fix_4: Binary routing rule: qualified (>20% equity + motivation) = Kyle, else = nurture
fix_5: No "gut feel" disqualifications — must cite a specific disqualify criterion
```

### KPIs to Watch
| Metric | Current | Target |
|---|---|---|
| Call Score | 36% | 60%+ (30-day goal) |
| Deals passed to Kyle | Unknown | Track weekly |
| Premature kills | Unknown | Audit last 30 leads |
| Objection re-frame rate | Low | Monitor via Gunner |

---

## Pipeline Flow
```
Inbound lead → Chris screens (HIGH RISK ZONE)
If Chris qualifies → [[twin-kyle]] (validate: is lead actually qualified?)
If Chris kills → Audit sample for false negatives
[[twin-seller-persona]] — Chris may not be reading seller signals accurately
```

---

## Simulation Notes
- At 36%, Chris is the **primary pipeline leak** in the current team structure.
- **Every deal Chris loses prematurely = direct revenue loss.**
- Possible root causes: lack of framework adherence, call anxiety, insufficient reps
- **Coaching priority:** Script enforcement first, then objection drilling, then discovery depth.
- Corey should consider: shadow calls, dual-listen sessions, or temporary volume reduction until score improves.

> 🔴 **Sim Flag:** Do not assume Chris's lead routing is accurate. Any deal he touches should have a 2nd-review checkpoint until score exceeds 55%.
