# Report Generator — Spec

**Agent #13**  
**Priority:** HIGH — Automated insights without asking

---

## Overview

Generates and delivers Daily, Weekly, and Monthly reports automatically. No manual data pulling — Gunner aggregates everything and delivers insights on schedule.

---

## Report Schedule

| Report | Frequency | Delivery Time | Recipient |
|--------|-----------|---------------|-----------|
| Daily Digest | Every day | 7:00 AM local | Corey (admin) |
| Weekly Snapshot | Monday | 8:00 AM local | Corey (admin) |
| Monthly Deep Dive | 1st of month | 9:00 AM local | Corey (admin) |

---

## Daily Digest

**Purpose:** Quick morning overview — what happened yesterday, what needs attention today.

### Yesterday's Activity
- Total calls made
- New leads generated (by source)
- Appointments set
- Contracts sent
- Deals closed

### Today's Priorities
- Appointments scheduled for today
- Deals requiring follow-up (no activity >2 days)
- Tasks due today
- Callbacks requested

### Red Flags 🚨
- Leads with no activity >3 days
- Missed follow-ups (scheduled but not done)
- Stuck deals (same stage >7 days)
- Appointments not confirmed

### Quick Wins 💰
- Hot leads (high engagement score)
- Callbacks requested
- Sellers who asked for offer
- Easy closes (ready to sign)

---

## Weekly Snapshot

**Purpose:** Pipeline health check, team performance, direction of the business.

### Lead Flow
| Metric | Detail |
|--------|--------|
| New Leads | Total, broken down by source (Dialer, Texts, PPL) |
| Cost Per Lead | By source (if cost data available) |
| Lead Quality | Avg score, distribution |
| Lead Response Time | Avg time from lead → first contact |

### Pipeline Health
| Stage | Count | Conversion Rate | Avg Days in Stage |
|-------|-------|-----------------|-------------------|
| New Lead | X | — | X |
| Contacted | X | X% | X |
| Appointment Set | X | X% | X |
| Offer Made | X | X% | X |
| Under Contract | X | X% | X |
| Closed | X | X% | — |

### Team Performance
| Team Member | Role | Calls | Conversations | Appointments | Gunner Grade |
|-------------|------|-------|---------------|--------------|--------------|
| Chris | LM | X | X | X | X |
| Daniel | LM | X | X | X | X |
| Kyle | AM | X | X | X | X |

### Velocity
- Average deal cycle time (lead → close)
- Stuck deals (>7 days no activity)
- Fastest close this week
- Slowest deal in pipeline

### Money
- Deals closed this week
- Revenue this week
- Average profit per deal
- PPL refunds recovered

---

## Monthly Deep Dive

**Purpose:** Strategic view — ROI, trends, team rankings, where to focus next month.

### ROI by Channel
| Source | Spend | Leads | Contracts | Revenue | ROI |
|--------|-------|-------|-----------|---------|-----|
| Dialer | $X | X | X | $X | X% |
| Texts | $X | X | X | $X | X% |
| PPL (MotivatedSellers) | $X | X | X | $X | X% |
| PPL (PropertyLeads) | $X | X | X | $X | X% |
| PPL (Leadzolo) | $X | X | X | $X | X% |

### Trend Lines (Month-over-Month)
- Lead volume: ↑/↓ X%
- Conversion rate: ↑/↓ X%
- Revenue: ↑/↓ X%
- Cost per acquisition: ↑/↓ X%

Visual charts if delivered via dashboard.

### Team Rankings
| Rank | Team Member | Appointments | Contracts | Gunner Avg | Trend |
|------|-------------|--------------|-----------|------------|-------|
| 1 | X | X | X | X | ↑ |
| 2 | X | X | X | X | → |
| 3 | X | X | X | X | ↓ |

### Missed Opportunities
Summary from Opportunities Missed feature:
- Total flagged this month
- Top 5 worth revisiting
- Common patterns (why leads got lost)

### Pipeline Forecast
| Stage | Count | Probability | Weighted Value |
|-------|-------|-------------|----------------|
| Appointment Set | X | 20% | $X |
| Offer Made | X | 40% | $X |
| Under Contract | X | 80% | $X |
| **Total Forecast** | — | — | **$X** |

### AI Recommendations
Based on data analysis:
- "Lead response time increased 15% — consider adding automation"
- "Dialer ROI outperforming Texts by 2x — consider reallocating budget"
- "3 deals stuck at Offer Made >14 days — review pricing strategy"

---

## Data Sources

| Data | Source |
|------|--------|
| Leads, Pipeline, Contacts | GHL |
| Calls, Conversations | BatchDialer (via Gunner) |
| SMS Sent/Received | BatchLeads (via Gunner) |
| Call Grades | Gunner |
| PPL Spend/Refunds | PPL platforms |

---

## Delivery Methods

1. **Email** — Formatted HTML report
2. **Gunner Dashboard** — Interactive version with drill-down
3. **GHL Internal Chat** — Summary ping with link to full report

---

## Multi-Tenant Configuration

Each tenant configures:
- Report recipients (email addresses)
- Delivery times (timezone-aware)
- Which reports to enable (daily/weekly/monthly)
- Custom metrics to include/exclude
- Branding (logo, colors for PDF/email)

---

## Success Criteria

- [ ] Daily digest delivered by 7 AM every day
- [ ] Weekly snapshot delivered Monday mornings
- [ ] Monthly deep dive delivered 1st of month
- [ ] All metrics accurate (matches manual calculation)
- [ ] Reports actionable (clear what to do)
- [ ] Zero manual data pulling required
