# KPI Monitor Add-on

**Product Name:** Ops Monitor
**Price:** $29/mo
**Status:** 🔨 Designing

## Purpose

Automated monitoring of business KPIs. Daily summaries without asking, anomaly alerts when something's wrong, pipeline audits to catch stuck deals. Corey gets visibility without checking dashboards.

---

## Agents

| Agent | Role | Responsibility |
|-------|------|----------------|
| **Ops Monitor** | Lead | Runs periodic checks, aggregates data, coordinates reports |
| **Lead Flow Tracker** | Worker | Monitors lead volume by source, alerts on drops |
| **Pipeline Auditor** | Worker | Checks pipeline stages for stuck deals, flags stale opportunities |
| **Follow-Up Auditor** | Worker | Monitors follow-up completion rates, flags reps falling behind |
| **Daily Reporter** | Worker | Compiles daily summary (leads in, calls made, offers sent, deals closed) |
| **Anomaly Alerter** | Worker | Detects unusual patterns, sends immediate alerts |

---

## Outputs

### 1. Daily Summary (Every Morning)

Delivered to Corey via Telegram at 8 AM:

```
📊 NAH DAILY SUMMARY — Feb 5, 2026

LEADS
• New leads yesterday: 12 (▲ vs 8 avg)
• Sources: PPL (7), Cold Call (3), Direct Mail (2)
• Hot leads: 4 | Warm leads: 8

CALLS
• Total calls: 47
• Connect rate: 34%
• Appointments set: 3

PIPELINE
• New Lead: 23
• Warm: 45
• Hot: 12
• Pending Apt: 8
• Made Offer: 5

DEALS
• Under contract: 2
• Closed this week: 1 ($12k assignment)
• Closing this month: 3 (est. $35k)

ALERTS
⚠️ 2 leads assigned >48h with no call attempt
⚠️ Lead volume from PPL down 30% vs last week

Full dashboard: [link]
```

### 2. Anomaly Alerts (Real-Time)

Sent immediately when something's off:

```
🚨 ANOMALY ALERT

Lead volume dropped significantly:
• Today so far: 2 leads
• Same time yesterday: 8 leads
• Same time last week: 7 leads

Possible causes:
• PPL campaign paused?
• Website form broken?
• Lead source issue?

Recommend: Check lead sources ASAP
```

### 3. Weekly Recap (Monday Morning)

```
📈 NAH WEEKLY RECAP — Week of Jan 29

LEAD PERFORMANCE
• Total leads: 67 (▼12% vs prior week)
• Conversion to apt: 8.9%
• Conversion to offer: 4.5%

TEAM PERFORMANCE
• Daniel: 89 calls, 4 apts, 2 offers
• Kyle: 23 calls, 12 walkthroughs, 5 offers
• Esteban: 3 deals sent to buyers, 1 closed

REVENUE
• Closed: $24,000 (2 deals)
• Pipeline: $47,000 (4 UC deals)

TOP ISSUES THIS WEEK
1. Follow-up rate dropped to 71% (target: 85%)
2. 5 hot leads went stale (no contact >72h)
3. PPL lead quality declining (more tire-kickers)

WINS 🎉
• Closed 2 deals in one week
• Kyle's offer acceptance rate up 15%
```

---

## ⚠️ RULES TO VERIFY - Corey please confirm

### KPIs to Track

| Category | Metrics |
|----------|---------|
| **Lead Flow** | New leads/day, by source, hot/warm ratio |
| **Call Activity** | Calls made, connect rate, talk time |
| **Pipeline** | Leads per stage, stage velocity, stuck deals |
| **Appointments** | Set, completed, no-show rate |
| **Offers** | Made, accepted, rejected, counter |
| **Deals** | Under contract, closed, fell through |
| **Revenue** | Assignment fees, monthly total, pipeline value |
| **Team** | Activity per rep, conversion per rep |

**Are these the right KPIs? Any missing?**

---

### Anomaly Thresholds

When to alert:

| Anomaly | Threshold |
|---------|-----------|
| Lead volume drop | >30% below 7-day average |
| No leads in X hours | 4+ hours (business hours) |
| Stuck lead (no activity) | >48 hours |
| Hot lead gone cold | >24 hours no contact |
| Pipeline stage stuck | >7 days in same stage |
| Follow-up rate drop | <75% (target 85%) |
| Offer acceptance drop | <20% (if normally higher) |

**Are these thresholds right for your business?**

---

### Report Delivery

| Report | Frequency | Delivery | Time |
|--------|-----------|----------|------|
| Daily Summary | Every day | Telegram | 8 AM CT |
| Anomaly Alert | Real-time | Telegram | Immediate |
| Weekly Recap | Monday | Telegram + Email | 8 AM CT |
| Monthly Report | 1st of month | Email | 8 AM CT |

**Is Telegram the right channel? Different times?**

---

### Data Sources

Where to pull KPI data:

| Data | Source |
|------|--------|
| Leads | GHL Contacts (created date, source, tags) |
| Calls | GHL Call logs |
| Pipeline | GHL Opportunities |
| Appointments | GHL Calendars |
| Deals | GHL Opportunities (specific stages) |
| Revenue | GHL Custom fields or manual input? |

**Is revenue tracked in GHL or elsewhere?**

---

### Who Gets Reports

| Report | Recipients |
|--------|------------|
| Daily Summary | Corey |
| Anomaly Alerts | Corey, Jessica (Data Manager) |
| Weekly Recap | Corey |
| Team Performance | Corey (shared with team?) |

**Anyone else need reports?**

---

## Pipeline Stages to Monitor

From GHL audit, your Sales Pipeline stages:

1. New Lead
2. Warm Leads
3. SMS Warm Leads
4. Hot Leads
5. Pending Apt
6. Walkthrough
7. Offer Apt
8. Made Offer

**Stage velocity targets:**
- New Lead → Warm/Hot: <24 hours
- Hot → Pending Apt: <48 hours
- Made Offer → UC or Dead: <7 days

**Are these velocity targets realistic?**

---

## Tenant Configuration

```json
{
  "tenantId": "tenant_xxx",
  "addOn": "kpi-monitor",
  "config": {
    "reports": {
      "dailySummary": {"enabled": true, "time": "08:00", "channel": "telegram"},
      "weeklyRecap": {"enabled": true, "day": "monday", "time": "08:00"},
      "anomalyAlerts": {"enabled": true, "channel": "telegram"}
    },
    "thresholds": {
      "leadVolumeDrop": 0.30,
      "noLeadsHours": 4,
      "stuckLeadHours": 48,
      "hotLeadColdHours": 24,
      "pipelineStuckDays": 7,
      "followUpRateMin": 0.75
    },
    "recipients": {
      "owner": "corey_telegram_id",
      "dataManager": "jessica_telegram_id"
    },
    "kpis": ["leads", "calls", "pipeline", "appointments", "offers", "deals", "revenue"]
  }
}
```

---

## Next Steps

1. **Corey confirms KPIs and thresholds** ✋ WAITING
2. Map GHL data to each KPI
3. Write agent system prompts
4. Build reporting logic
5. Test with real data
6. Set up delivery channels
