# Market Watch Bot

## Overview
Monitors local real estate market trends. Provides insights on pricing, inventory, and market conditions. Helps with accurate valuations and market timing.

## Design Principle: Zero-Config Ready
- Auto-detects client's market from deals
- Pulls public data automatically
- No API keys needed for basic features
- Delivers insights without setup

---

## Agents

### 1. Market Coordinator
**Role:** Orchestrates market monitoring

**Auto-Market Detection:**
- Scans client's closed deals and pipeline
- Identifies primary markets (cities/counties)
- Starts monitoring those markets automatically

### 2. Data Collector
**Role:** Gathers market data

**Data Sources (public, no keys needed):**
- Zillow (estimates, trends)
- Redfin (market stats)
- Realtor.com (inventory)
- County records (sales)
- MLS (if integrated)

**Metrics Tracked:**
| Metric | Update Frequency |
|--------|-----------------|
| Median home price | Weekly |
| Price per sqft | Weekly |
| Days on market | Weekly |
| Inventory levels | Weekly |
| Price trends (MoM, YoY) | Monthly |
| Sales volume | Monthly |

### 3. Trend Analyzer
**Role:** Identifies meaningful patterns

**Auto-Generated Insights:**

**Price Trends:**
```
📈 MARKET UPDATE - Nashville

Median Price: $385,000 (+2.3% MoM, +8.1% YoY)
Price/SqFt: $245 (+$5 from last month)
Trend: APPRECIATING

What this means for you:
• ARVs may be conservative - check recent comps
• Sellers may expect more - adjust anchors
• Good time to be buying inventory
```

**Inventory Trends:**
```
📦 INVENTORY ALERT - Nashville

Active Listings: 2,450 (-12% MoM)
Days on Market: 18 days (-3 days)
Trend: SELLER'S MARKET

What this means for you:
• Less motivated sellers (more options for them)
• Move faster on good deals
• Buyers more eager (dispo advantage)
```

### 4. Comp Assistant
**Role:** Provides valuation support

**When analyzing a deal:**
```
🏠 MARKET CONTEXT - 123 Main St

Neighborhood: East Nashville
Avg Price/SqFt: $265
Recent Sales (90 days): 12
Median Sale: $345,000
Price Range: $285K - $425K

This Property:
• 1,400 sqft × $265 = $371,000 suggested ARV
• Below median = potential value-add opportunity

Recent Comps:
• 125 Main St - $355,000 (3bd/2ba, 1,380sf)
• 118 Oak Ave - $389,000 (3bd/2ba, 1,520sf)
• 201 Pine St - $342,000 (3bd/1ba, 1,290sf)
```

### 5. Alert Generator
**Role:** Proactive market notifications

**Pre-Built Alerts:**

**Significant Change:**
```
📊 MARKET SHIFT - Memphis

Median price dropped 4.2% this month.
Previous: $245,000 → Now: $234,700

Possible causes:
• Seasonal adjustment
• Increased inventory
• Interest rate impact

Action: Review your Memphis offers - may need to adjust.
```

**Opportunity Alert:**
```
🎯 OPPORTUNITY - Nashville East

Days on Market spiked to 35 days (was 18).
Inventory up 22% MoM.

This means:
• More motivated sellers likely
• Better negotiating position
• Good time to increase outreach here
```

---

## Market Reports

### Weekly Digest
```
📰 WEEKLY MARKET DIGEST

Your Markets: Nashville, Memphis, Knoxville

NASHVILLE
• Median: $385K (+2.3%)
• Inventory: 2,450 (-12%)
• DOM: 18 days
• Trend: Hot 🔥

MEMPHIS  
• Median: $235K (-1.1%)
• Inventory: 3,200 (+5%)
• DOM: 32 days
• Trend: Cooling ❄️

KNOXVILLE
• Median: $310K (+0.5%)
• Inventory: 1,100 (flat)
• DOM: 24 days
• Trend: Stable ➡️

[Full Report]
```

### Monthly Deep Dive
- Detailed trend analysis
- Neighborhood breakdowns
- Forecasting models
- Investment recommendations

---

## Tenant Onboarding

### Required (0 things):
- Markets auto-detected from deals

### Auto-Configured:
- Primary markets identified
- Data collection starts immediately
- Weekly digest enabled

### Optional Customization:
- Add/remove markets
- Set alert thresholds
- Custom metrics focus
- Report frequency

---

## Integration Points

### Inputs
- GHL deals (market detection)
- Public data sources
- MLS (if connected)

### Outputs
- Market reports
- Comp assistance
- Deal context
- Alerts

---

## Tenant Configuration

```json
{
  "marketWatchBot": {
    "enabled": true,
    "autoConfigured": true,
    "marketDetection": "from_deals",
    "dataSources": ["zillow", "redfin", "county"],
    "updateFrequency": "weekly",
    "reports": {
      "weeklyDigest": true,
      "monthlyDeepDive": true
    },
    "alerts": {
      "priceChangeThreshold": 3,
      "inventoryChangeThreshold": 15,
      "domChangeThreshold": 5
    }
  }
}
```

---

## Success Metrics

- Valuation accuracy improvement
- Market alerts acted upon
- Report engagement rate
- Offer accuracy improvement
