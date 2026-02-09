# Commission Bot

## Overview
Automatically calculates commissions/splits when deals close. Tracks who gets paid what, generates payout reports, and ensures no one gets missed.

## Design Principle: Zero-Config Ready
- Works with simple default splits
- Auto-detects team from deal assignments
- No manual calculation needed
- Progressive complexity for custom structures

---

## Agents

### 1. Commission Coordinator
**Role:** Processes deal closings and calculates payouts

**Trigger:** Deal marked as "Closed/Funded"

**Auto-Flow:**
```
Deal Closed
    ↓
Pull deal data (price, fee, assignments)
    ↓
Apply commission structure
    ↓
Calculate individual payouts
    ↓
Generate payout report
    ↓
Log to records
```

### 2. Structure Manager
**Role:** Manages commission structures

**Default Structure (works out of box):**
```
Simple Split:
- Company: 70%
- Team: 30% (split among involved reps)

Team Split (of the 30%):
- LM who set appointment: 40%
- AM who closed deal: 60%
```

**Pre-Built Structures (selectable):**

| Structure | Description |
|-----------|-------------|
| Simple | 70/30 company/team |
| Aggressive | 60/40 company/team |
| Conservative | 80/20 company/team |
| Role-Based | Different % by role |
| Tiered | Higher % at volume thresholds |
| Custom | User-defined |

**Structure Selection:**
New client picks structure during onboarding (default: Simple)
Can change anytime.

### 3. Calculator
**Role:** Crunches the numbers

**Calculation Example:**

**Deal:** 123 Main St
- Assignment Fee: $15,000
- Structure: Simple (70/30)
- LM: Daniel
- AM: Kyle

**Calculation:**
```
Gross Fee:           $15,000

Company Share (70%): $10,500
Team Share (30%):    $4,500
  - Daniel (LM, 40%): $1,800
  - Kyle (AM, 60%):   $2,700
```

**Auto-Detection:**
- LM pulled from GHL "Lead assigned to" field
- AM pulled from GHL "Opportunity owner" or appointment creator
- Handles multiple LMs/AMs if applicable

### 4. Payout Reporter
**Role:** Generates payout summaries

**Per-Deal Report:**
```
💰 COMMISSION REPORT
Deal: 123 Main St - Closed {{date}}

Assignment Fee: $15,000

PAYOUTS:
├── Company: $10,500
├── Daniel (LM): $1,800
└── Kyle (AM): $2,700

Status: Pending payment

[Approve Payouts] [Adjust]
```

**Monthly Summary:**
```
📊 COMMISSION SUMMARY - {{month}}

Total Deals Closed: 8
Total Assignment Fees: $92,500

COMPANY EARNINGS: $64,750

TEAM PAYOUTS:
Name          Deals    Earnings    Status
─────────────────────────────────────
Kyle (AM)       8      $16,650     Pending
Daniel (LM)     5      $6,660      Pending  
Chris (LM)      3      $4,440      Pending

TOTAL TEAM: $27,750

[Export CSV] [Approve All]
```

### 5. Bonus Tracker
**Role:** Handles performance bonuses

**Pre-Built Bonus Types:**

| Bonus | Trigger | Amount |
|-------|---------|--------|
| First Deal | Rep's first closed deal | $500 |
| Volume | 5+ deals/month | $1,000 |
| Big Deal | Fee > $20K | Extra 5% |
| Streak | 3 months hitting goal | $500 |
| Referral | Referred lead closes | $500 |

**Bonus Detection:**
Auto-checks triggers on each deal close
Adds to payout report

### 6. Ledger Keeper
**Role:** Maintains commission history

**Records:**
- Every deal's commission breakdown
- Payout status (pending/paid)
- Adjustments/corrections
- Running totals by person

**Audit Trail:**
Who got paid what, when, for which deal.

---

## Tenant Onboarding

### Required (0 things):
- Just connect GHL (already done for core features)
- Uses default 70/30 split automatically

### Auto-Configured:
- Detects team members from GHL users
- Detects deal assignments from opportunities
- Calculates on every close

### Optional Customization:
- Select different split structure
- Define custom percentages
- Add bonus rules
- Set payout approval workflow

---

## Integration Points

### Inputs
- GHL Opportunities (deal data)
- GHL Users (team members)
- Deal assignments (LM, AM)

### Outputs
- Commission reports
- Payout summaries
- GHL notes (commission logged on deal)
- Export (CSV for accounting)

---

## Tenant Configuration

```json
{
  "commissionBot": {
    "enabled": true,
    "autoConfigured": true,
    "structure": "simple",
    "defaultSplits": {
      "company": 70,
      "team": 30
    },
    "teamSplits": {
      "lm": 40,
      "am": 60
    },
    "bonuses": {
      "firstDeal": 500,
      "volumeThreshold": 5,
      "volumeBonus": 1000,
      "bigDealThreshold": 20000,
      "bigDealBonus": 5
    },
    "payoutApproval": "auto",
    "reportFrequency": "per_deal"
  }
}
```

---

## Success Metrics

- Calculation accuracy (target: 100%)
- Time from close to commission report
- Payout disputes (target: 0)
- Team satisfaction with transparency
