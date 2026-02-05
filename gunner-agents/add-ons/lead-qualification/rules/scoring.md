# Lead Scoring Rules

Single source of truth for lead qualification scoring.

## Scoring Factors (5 Total)

### 1. Timeline
**Question:** When does the seller want to sell?

| Response | Score |
|----------|-------|
| Within 30 days | ✅ HOT factor |
| 30+ days, unclear, or "eventually" | WARM factor |

**Signals:**
- "Need to sell fast" → HOT
- "As soon as possible" → HOT
- "No rush" → WARM
- "Just seeing what it's worth" → WARM

---

### 2. Condition
**Question:** What condition is the property in?

| Response | Score |
|----------|-------|
| Distressed, needs work, vacant, tear-down | ✅ HOT factor |
| Some repairs needed, dated, livable | WARM factor |
| Move-in ready, recently updated | WARM factor |

**Signals:**
- "Needs a lot of work" → HOT
- "Vacant for X months/years" → HOT
- "Fire/flood damage" → HOT
- "Just cosmetic updates" → WARM
- "Good shape" → WARM

---

### 3. Price Flexibility
**Question:** Is the seller willing to sell below market?

| Response | Score |
|----------|-------|
| Will sell below market, flexible on price | ✅ HOT factor |
| Wants fair price, some flexibility | WARM factor |
| Wants retail/top dollar, firm | WARM factor |

**Signals:**
- "Just want it gone" → HOT
- "Make me an offer" → HOT (with motivation)
- "I know what it's worth" → WARM
- "Not giving it away" → WARM

---

### 4. Motivation (Most Important)
**Question:** Why is the seller selling?

| Response | Score |
|----------|-------|
| Clear pain point present | ✅ HOT factor |
| Some motivation but not urgent | WARM factor |
| No clear motivation | WARM factor |

**HOT Motivation Triggers:**
- Inherited property (don't want it, out of state)
- Divorce (need to liquidate)
- Pre-foreclosure / behind on payments
- Tired landlord (bad tenants, tired of management)
- Code violations / city pressure
- Job relocation (forced timeline)
- Health issues / can't maintain
- Death in family / estate situation
- Tax liens / financial pressure

**WARM Motivation:**
- "Thinking about downsizing"
- "Might sell in the future"
- "Just curious what it's worth"
- "Testing the market"

---

### 5. Lead Source
**Question:** Where did this lead come from?

| Source | Score |
|--------|-------|
| Direct mail response | ✅ HOT factor |
| PPC / paid search | ✅ HOT factor |
| Driving for dollars | ✅ HOT factor |
| Referral | ✅ HOT factor |
| Cold call (answered, engaged) | WARM factor |
| Facebook / social media | WARM factor |
| Purchased list | WARM factor |

---

## Scoring Calculation

```
Count HOT factors:
- 3 or more → Lead is HOT
- 0, 1, or 2 → Lead is WARM

There is no COLD. All leads get worked.
```

## Output Format

When scoring a lead, output:

```json
{
  "score": "HOT",
  "factors": {
    "timeline": {"value": true, "notes": "Wants to sell within 2 weeks"},
    "condition": {"value": true, "notes": "Vacant, needs major repairs"},
    "price": {"value": false, "notes": "Wants fair market value"},
    "motivation": {"value": true, "notes": "Inherited, lives out of state"},
    "source": {"value": true, "notes": "Direct mail response"}
  },
  "hotCount": 4,
  "summary": "HOT lead - inherited vacant property, motivated seller, 2 week timeline"
}
```
