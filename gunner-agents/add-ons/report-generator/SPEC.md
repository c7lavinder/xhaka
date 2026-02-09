# Report Generator Bot

## Overview
Creates and delivers custom reports on-demand and on schedule. Transforms raw data into actionable insights with visualizations, summaries, and recommendations.

## Trigger
- Scheduled (daily, weekly, monthly)
- On-demand (user request)
- Event-driven (milestone reached, anomaly detected)

---

## Agents

### 1. Report Coordinator
**Role:** Manages report generation and distribution

**Report Catalog:**
| Report | Frequency | Recipients |
|--------|-----------|------------|
| Daily Pulse | Daily 8 AM | Corey, Jessica |
| Weekly Performance | Monday 7 AM | Full team |
| Monthly Summary | 1st of month | Corey |
| Campaign ROI | Weekly | Corey |
| Team Scorecard | Daily 9 AM | Team |
| Pipeline Health | Daily 8 AM | Corey |

### 2. Data Aggregator
**Role:** Pulls and aggregates data for reports

**Data Sources:**
- GHL Contacts (leads)
- GHL Opportunities (deals, pipeline)
- GHL Call Logs (activity)
- GHL Calendar (appointments)
- KPI Spreadsheet (historical)
- Gunner (call grades)

**Aggregation Types:**
- Counts (leads, calls, appointments)
- Sums (revenue, spend)
- Averages (score, days in stage)
- Comparisons (vs last period, vs goal)
- Trends (week over week, month over month)

### 3. Report: Daily Pulse
**Purpose:** Quick morning snapshot of business health

**Content:**
```
📊 DAILY PULSE - {{date}}

YESTERDAY'S ACTIVITY
├── New Leads: 12 (↑3 vs avg)
├── Calls Made: 245
├── Conversations: 38
├── Appointments Set: 4
└── Offers Made: 2

PIPELINE SNAPSHOT
├── Hot Leads: 23
├── Appointments This Week: 8
├── Under Contract: 5
└── Closing This Week: 1

REVENUE
├── MTD Closed: $45,000
├── Pending UC: $127,500
└── Projected Month: $82,000

⚠️ ATTENTION NEEDED
├── 3 leads untouched >48h
├── 1 appointment unconfirmed
└── Contract unsigned 4 days

Have a great day! 🚀
```

**Delivery:** SMS + Email

### 4. Report: Weekly Performance
**Purpose:** Comprehensive weekly review

**Content:**
```
📈 WEEKLY PERFORMANCE REPORT
Week of {{week_start}} - {{week_end}}

═══════════════════════════════════

LEAD GENERATION
Source          Leads    Cost/Lead    Conv%
───────────────────────────────────
Cold Call         28       $32        7.1%
SMS               45       $56        4.4%
PPL               12       $0*        0.0%
Webforms           8       $35        0.0%
───────────────────────────────────
TOTAL             93       $41 avg    4.3%

*PPL included in other costs

TEAM ACTIVITY
              Calls    Convos    Apts    Goal%
───────────────────────────────────
Chris          312       42        5     104%
Daniel         287       38        4      91%
Kyle (AM)       --       --        8 wlk  --
───────────────────────────────────

PIPELINE MOVEMENT
├── New → Working: 93
├── Working → Hot: 18
├── Hot → Apt: 12
├── Apt → Offer: 6
├── Offer → UC: 2
└── UC → Closed: 1

DEALS
New UC:
  • 123 Main St ($185K) - Closing 3/1
  
Closed This Week:
  • 456 Oak Ave - $12,500 assignment fee

REVENUE
├── Closed: $12,500
├── Pending: $127,500
└── WoW Change: +8%

KEY WINS 🎉
• Best conversion week in 6 weeks
• Chris hit 104% of call goal
• New UC from cold call (rare!)

AREAS TO IMPROVE ⚡
• PPL leads not converting - review quality
• Daniel below call goal - check in
• 2 appointments no-showed

NEXT WEEK FOCUS
1. Push 3 UC deals toward close
2. Re-evaluate PPL vendor
3. Implement no-show reduction protocol
```

**Delivery:** Email with PDF attachment

### 5. Report: Monthly Summary
**Purpose:** Month-end executive summary

**Content:**
- Full P&L
- YTD progress vs goals
- Channel ROI analysis
- Team performance rankings
- Deal breakdown by market
- Cash flow summary
- Key decisions needed
- Next month projections

**Format:** Detailed PDF report

### 6. Report: Team Scorecard
**Purpose:** Daily team motivation and accountability

**Content:**
```
🏆 TEAM SCORECARD - {{date}}

TODAY'S LEADERS
1. Chris - 52 calls, 8 convos 🔥
2. Daniel - 45 calls, 6 convos
3. Kyle - 2 walkthroughs

STREAKS
• Chris: 5 days above goal 🔥🔥🔥🔥🔥
• Daniel: 3 days above goal 🔥🔥🔥

GOALS TODAY
├── Chris: 50 calls | 7 convos | 1 apt
├── Daniel: 50 calls | 7 convos | 1 apt
└── Kyle: 2 walkthroughs

Current Pace: ON TRACK ✅

Let's get it! 💪
```

**Delivery:** Team Slack/group chat

### 7. Report: Pipeline Health
**Purpose:** Identify stuck deals and opportunities

**Content:**
```
🔍 PIPELINE HEALTH - {{date}}

STAGE VELOCITY (avg days)
├── New → Working: 1.2 days ✅
├── Working → Hot: 8.4 days ⚠️ (goal: 5)
├── Hot → Apt: 3.1 days ✅
├── Apt → Offer: 2.0 days ✅
└── Offer → UC: 12.3 days ⚠️ (goal: 7)

STUCK DEALS (over threshold)
Working Lead >14 days:
  • John Smith - 18 days - Last: "needs to talk to wife"
  • Jane Doe - 15 days - Last: "call back March"

Made Offer >21 days:
  • 789 Pine St - 24 days - Counter at $195K
  
UC Past Close Date:
  • None ✅

AT-RISK APPOINTMENTS (unconfirmed)
  • 123 Main - Tomorrow 2pm - No response

RECOMMENDED ACTIONS
1. Call John Smith - wife conversation overdue
2. Final offer on 789 Pine or close out
3. Confirm tomorrow's appointment ASAP
```

**Delivery:** Email + SMS alert for critical items

### 8. Report Builder (On-Demand)
**Purpose:** Generate custom reports via request

**Request Examples:**
- "Show me all PPL leads from January"
- "What's our conversion rate by source?"
- "List all deals closed by Kyle"
- "Compare this month to last month"

**Capabilities:**
- Filter by date range
- Filter by source/team/market
- Compare periods
- Export to CSV/PDF
- Custom visualizations

---

## Visualizations

### Charts Generated:
- Lead trend (line chart)
- Source breakdown (pie chart)
- Pipeline funnel
- Team comparison (bar chart)
- Revenue trend
- Conversion rates

### Delivery Formats:
- In-line (text reports)
- Image attachments
- PDF reports
- Interactive dashboard links

---

## Notification Triggers

### Milestone Alerts:
- Deal closed → Instant notification
- Goal hit → Celebration message
- Record broken → Team announcement

### Warning Alerts:
- Pipeline drop >20% → Alert Corey
- Team member below goal 3+ days → Alert manager
- Stale deals accumulating → Pipeline health alert

---

## Integration Points

### Inputs
- GHL (all data)
- KPI Spreadsheet
- Gunner (call grades)
- Calendar (appointments)

### Outputs
- SMS (quick summaries)
- Email (detailed reports)
- Slack (team updates)
- PDF (formal reports)
- Google Drive (archived reports)

---

## Tenant Configuration

```json
{
  "reportGenerator": {
    "enabled": true,
    "reports": {
      "dailyPulse": {
        "enabled": true,
        "time": "08:00",
        "recipients": ["owner_sms", "manager_email"],
        "channels": ["sms", "email"]
      },
      "weeklyPerformance": {
        "enabled": true,
        "day": "Monday",
        "time": "07:00",
        "recipients": ["team_email"],
        "format": "pdf"
      },
      "teamScorecard": {
        "enabled": true,
        "time": "09:00",
        "channel": "slack"
      },
      "pipelineHealth": {
        "enabled": true,
        "time": "08:00",
        "alertOnCritical": true
      }
    },
    "milestoneAlerts": {
      "dealClosed": true,
      "goalHit": true,
      "recordBroken": true
    },
    "warningAlerts": {
      "pipelineDropThreshold": 20,
      "belowGoalDaysThreshold": 3
    },
    "timezone": "America/Chicago"
  }
}
```

---

## Error Handling

| Scenario | Action |
|----------|--------|
| Data source unavailable | Note in report, use cached data |
| Report generation fails | Retry, alert admin |
| Delivery fails | Retry alternate channel |
| Incomplete data | Generate partial report with note |

---

## Success Metrics

- Report delivery rate (target: 100%)
- Report open rate
- Action taken from reports
- Time saved vs manual reporting
- User satisfaction
