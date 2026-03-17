---
id: twin-esteban
role: Disposition Manager
level: unknown
call_score: 64%
behavioral_logic:
  primary_mode: buyer_matching_and_deal_packaging
  strength: buyer_relationship_management, deal_packaging, speed_to_market
  weakness: buyer_list_depth, price_gap_negotiation, deal_kill_speed
  decision_trigger: contract_received_from_kyle + arv_spread_confirmed
  pipeline_position: post_contract_dispo
  handoff_receives_from: [twin-kyle]
  handoff_sends_to: closing_table
---

# 🧠 Digital Twin: Esteban (Dispo)

## Identity
- **Role:** Disposition Manager
- **Gunner Call Score:** 64%
- **Specialty:** Buyer matching, deal packaging, assignment fee negotiation

---

## Behavioral Logic

### Core Dispo Pattern
Esteban receives contracted deals from [[twin-kyle]] and is responsible for:
1. Packaging the deal (ARV, repairs, MAO, assignment fee)
2. Matching to the right buyer segment from the buyer list
3. Negotiating the assignment fee
4. Getting the deal to closing table

### Buyer-Matching Logic
```yaml
buyer_tier_1:
  type: cash_buyer_investor
  criteria: [buys_as-is, closes_fast, local_market_knowledge]
  assignment_fee_tolerance: high
  contact_cadence: first_call_within_24hrs_of_contract

buyer_tier_2:
  type: fix_and_flip_operator
  criteria: [needs_spread_of_20%+, wants_detailed_repair_estimate, 30-45_day_close]
  assignment_fee_tolerance: medium
  contact_cadence: deal_sheet_first_then_call

buyer_tier_3:
  type: rental_investor_or_landlord
  criteria: [cash_flow_focused, less_ARV_sensitive, slower_close_ok]
  assignment_fee_tolerance: low_to_medium
  contact_cadence: email_blast_then_follow_up
```

### Deal Packaging (Standard)
| Field | Source |
|---|---|
| Address + Property Details | [[twin-kyle]] contract |
| ARV Estimate | Kyle's underwrite + comp check |
| Repair Estimate | As-is condition notes |
| Asking Price (MAO) | Contract price |
| Assignment Fee | Esteban negotiates (target: $5k–$15k) |
| Closing Timeline | Seller-confirmed from [[twin-seller-persona]] intake |

### Strengths
- **Buyer relationships:** Likely has a warm list of repeat buyers
- **Deal packaging speed:** Gets deals to market quickly post-contract
- **Market feel:** Understands what buyers in the Nashville/NAH market will pay

### Coaching Gaps (at 64%)
- **Buyer list depth:** 64% score suggests deals may be stalling due to limited buyer pool — not enough tier-1 buyers for fast closes
- **Price gap negotiation:** When buyer's offer is below ask, Esteban may not be bridging the gap effectively
- **Deal kill speed:** Slow to call a dead dispo and get the deal back to Corey for decision

### Decision Triggers
| Signal | Action |
|---|---|
| Tier-1 buyer match found | Call within 24hrs, push to close |
| No buyer after 5 days | Escalate to Corey — reprice or kill |
| Buyer requests heavy discount | Re-underwrite, check if deal still works |
| Closing date at risk | Alert Corey immediately |

---

## Pipeline Flow
```
[[twin-kyle]] → signed contract → Esteban
Esteban → packages deal → buyer list
Buyer agrees → assignment contract → closing
No buyer → escalate → Corey decision
```

---

## Simulation Notes
- At 64%, Esteban is **functional but not optimized**. The gap likely lives in buyer list depth and negotiation confidence.
- **Target:** 75%+ by expanding buyer list and tightening price gap scripts.
- **Coaching priority:** "Speed kills in dispo. Every day on market = buyer confidence erosion."
- **Key risk:** Bottleneck between Kyle closing and Esteban disposing. If dispo is slow, Kyle's motivation to close hard drops.
