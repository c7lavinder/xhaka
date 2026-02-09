# Cash Flow Bot

## Overview
Forecasts cash flow based on pipeline deals. Shows what money is coming, when, and how confident. Helps with planning and prevents cash surprises.

## Design Principle: Zero-Config Ready
- Automatically pulls from pipeline
- Uses standard probability by stage
- No manual entry needed
- Works immediately when enabled

---

## Agents

### 1. Cash Flow Coordinator
**Role:** Generates cash flow forecasts

**Auto-Pull Data:**
- All deals in pipeline
- Stage + expected close date
- Deal value (assignment fee)

### 2. Pipeline Analyzer
**Role:** Assesses deal probability

**Default Stage Probabilities:**
| Stage | Probability | Typical Days to Close |
|-------|-------------|----------------------|
| Made Offer | 15% | 30-45 |
| Verbal Agreement | 40% | 14-21 |
| Under Contract | 75% | Per contract |
| Clear to Close | 95% | 7-14 |
| Scheduled Closing | 99% | 1-3 |

**Auto-Detection:**
- Maps client's pipeline stages to these categories
- Falls back to simple logic if custom stages
- Learns from historical close rates over time

### 3. Forecast Generator
**Role:** Creates cash flow projections

**Weekly Forecast:**
```
💰 CASH FLOW FORECAST

THIS WEEK (Feb 10-16)
─────────────────────────────────
High Confidence ($47,500):
• 123 Main St - $15,000 (closing Tue)
• 456 Oak Ave - $12,500 (closing Thu)  
• 789 Pine St - $20,000 (closing Fri)

Medium Confidence ($25,000):
• 321 Elm St - $17,500 (UC, closes ~Feb 20)
• 654 Maple Dr - $7,500 (UC, closes ~Feb 18)

Possible ($12,000):
• 987 Cedar Ln - $12,000 (verbal, needs contract)

EXPECTED RANGE: $47,500 - $84,500
WEIGHTED FORECAST: $58,750
```

**Monthly View:**
```
📊 30-DAY CASH FLOW

Week 1: $47,500 (high confidence)
Week 2: $25,000 (medium)
Week 3: $17,500 (medium)
Week 4: $12,000 (low)
─────────────────────────────────
TOTAL EXPECTED: $102,000
WEIGHTED TOTAL: $67,250

Pipeline Value: $245,000
Conversion Needed: 41%

[View All Deals]
```

### 4. Alert Manager
**Role:** Proactive cash flow alerts

**Auto-Alerts:**

**Cash Crunch Warning:**
```
⚠️ CASH FLOW ALERT

No high-confidence deals closing in next 14 days.

Current pipeline:
• 3 deals Under Contract (earliest: Feb 25)
• 2 deals Made Offer

Recommendation: Push UC deals to close faster
or accelerate pipeline movement.
```

**Windfall Alert:**
```
🎉 BIG WEEK COMING

3 deals closing next week = ~$45,000

Make sure:
✓ All contracts signed
✓ Title clear
✓ Buyer funds confirmed
```

**Slip Alert:**
```
⚠️ DEAL SLIPPING

123 Main St was expected to close Feb 10.
Status: Still "Under Contract" - no movement.

Days past expected: 5

Action needed: Check with title/seller
```

### 5. Historical Tracker
**Role:** Tracks forecast accuracy

**Accuracy Metrics:**
- Forecasted vs Actual by week
- Stage probability calibration
- Days-to-close accuracy

**Self-Improvement:**
- Adjusts probabilities based on actual close rates
- Learns client's typical timeline
- Gets more accurate over time

---

## Forecast Views

### Quick Glance (Daily)
```
💵 Today: $15,000 closing
📅 This week: $47,500 expected
📆 This month: $102,000 forecast
```

### Detailed (On Request)
- Deal-by-deal breakdown
- Risk factors per deal
- Historical comparison

### Planning View
- Expenses vs expected income
- Runway calculation
- Investment capacity

---

## Tenant Onboarding

### Required (0 things):
- Works automatically from pipeline data

### Auto-Configured:
- Pulls all pipeline deals
- Maps stages to probabilities
- Calculates forecasts

### Optional Customization:
- Adjust stage probabilities
- Set alert thresholds
- Add expense tracking
- Custom reporting periods

---

## Integration Points

### Inputs
- GHL Opportunities (pipeline deals)
- GHL Pipeline stages
- Historical close data

### Outputs
- Forecast reports
- Cash flow alerts
- Dashboard widget
- Weekly summary

---

## Tenant Configuration

```json
{
  "cashFlowBot": {
    "enabled": true,
    "autoConfigured": true,
    "stageProbabilities": "auto_detect",
    "forecastPeriod": 30,
    "alerts": {
      "cashCrunchDays": 14,
      "slipThresholdDays": 5,
      "windfallThreshold": 30000
    },
    "reports": {
      "dailyGlance": true,
      "weeklyForecast": true,
      "monthlyPlanning": true
    },
    "learning": {
      "enabled": true,
      "calibrateProbabilities": true
    }
  }
}
```

---

## Success Metrics

- Forecast accuracy (target: ±20%)
- Alert usefulness (user feedback)
- Cash surprises prevented
- Planning decisions enabled
