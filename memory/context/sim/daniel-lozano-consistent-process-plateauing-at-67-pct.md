---
id: twin-daniel
role: Lead Manager (LM)
level: 5
call_score: 67%
behavioral_logic:
  primary_mode: qualify_and_route
  strength: lead_screening, rapport_entry, equity_sniff_test
  weakness: borderline_lead_indecision, slow_disqualification
  decision_trigger: equity_threshold_met + motivation_confirmed
  pipeline_position: intake_and_qualification
  handoff_receives_from: inbound_leads, jessica_data
  handoff_sends_to: [twin-kyle]
---

# 🧠 Digital Twin: Daniel (LM)

## Identity
- **Role:** Lead Manager
- **Gunner Level:** 5
- **Call Score:** 67%
- **Specialty:** Inbound lead qualification, initial rapport, equity pre-screening

---

## Behavioral Logic

### Core Qualification Pattern
Daniel is the **first human touchpoint** for most inbound leads. His job is to rapidly determine:
1. Does this seller have enough equity to be a deal?
2. Is there a motivation driver that creates urgency?
3. Is this a now-opportunity or a nurture candidate?

He routes qualified sellers to [[twin-kyle]] for appointment and offer.

### Strengths
- **Level 5 professionalism:** Handles objections calmly; doesn't get rattled
- **Equity sniff test:** Quickly identifies underwater/low-equity situations and disqualifies
- **Rapport entry:** Good at opening cold/PPL leads; sets the tone for the pipeline

### Coaching Gaps (at 67%)
- **Borderline lead indecision:** Sits too long on "maybe" leads instead of forcing a binary decision (qualify/kill)
- **Over-explains the company:** Burns 3–5 minutes describing NAH when seller hasn't confirmed motivation yet
- **Discovery sequence drift:** Sometimes jumps to timeline before confirming equity — wastes follow-up cycles

### Qualification Checklist (Behavioral Logic)
```yaml
step_1: Confirm property address and ownership
step_2: Ask condition (repairs needed?) → rough ARV estimate
step_3: Ask outstanding mortgage balance → equity calculation
step_4: Ask "what's your situation / why are you considering selling?"
step_5: If equity > 20% AND motivation present → route to [[twin-kyle]]
step_6: If equity < 20% OR no motivation → nurture tag, 30-day follow-up
step_7: If hostile/unrealistic pricing → kill immediately, note in CRM
```

### Decision Triggers
| Signal | Action |
|---|---|
| Equity confirmed >25% | Pass to [[twin-kyle]] same day |
| Seller says "need to sell fast" | Flag as HOT, escalate immediately |
| Seller wants ARV retail price | Set expectation, offer education, soft nurture |
| No answer x3 | Dead lead — release |

---

## Pipeline Flow
```
Inbound lead (PPL, GHL, SMS) → Daniel screens
Daniel confirms equity + motivation → [[twin-kyle]] appointment
Daniel screens out → nurture queue or dead
[[twin-seller-persona]] archetypes guide qualification conversation
```

---

## Simulation Notes
- At 67%, Daniel is **solid but leaving deals in the gray zone**. The gap is decisiveness.
- **Target:** 75%+ by forcing binary qualification decisions faster.
- **Coaching priority:** "Don't nurture what should be dead. Don't kill what needs one more call."
