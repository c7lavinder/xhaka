# Dispo Dashboard — Product Requirements Document

**For:** Manus
**Product:** New tab/page in Gunner
**Purpose:** Give wholesalers visibility into dispo team activity, buyer engagement, and deal flow

---

## Problem Statement

Wholesalers have no visibility into what their dispo team is doing:
- Can't see which buyers are being contacted
- Can't see buyer interest/feedback on deals
- Can't track dispo team activity or performance
- Have to trust dispo manager blindly
- Deals fall through without understanding why

**Quote from Corey:** "I have to trust him a lot and I do not like that."

---

## Solution

A Dispo Dashboard in Gunner that shows:
1. **Today's Activity** — what did dispo do today
2. **Inventory Status** — all active deals and their buyer engagement
3. **Buyer Interest** — who's interested, who passed, why
4. **Buyer Feedback** — patterns in why deals aren't moving
5. **Team Metrics** — dispo manager performance over time

---

## User Roles

| Role | Access |
|------|--------|
| **Owner** (Corey) | Full dashboard, all metrics, settings |
| **Dispo Manager** (Esteban) | Activity view, deal management, buyer outreach |
| **Admin** | Configuration, field mapping |

---

## Dashboard Views

### 1. Overview (Default View)

What the owner sees when opening Dispo tab:

```
┌─────────────────────────────────────────────────────────────────┐
│  DISPO DASHBOARD                               [Today ▼] [⚙️]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  TODAY'S ACTIVITY                                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────┐ │
│  │ Deals Sent   │ │ Buyers       │ │ Responses    │ │ Hot    │ │
│  │     3        │ │ Contacted    │ │ Received     │ │Interest│ │
│  │              │ │    27        │ │     8        │ │   2    │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ └────────┘ │
│                                                                 │
│  INVENTORY STATUS                                              │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Property        │ Days │ Buyers    │ Interest │ Status     ││
│  │                 │ Out  │ Contacted │          │            ││
│  ├─────────────────┼──────┼───────────┼──────────┼────────────┤│
│  │ 123 Main St     │  3   │    15     │ 2 🔥     │ Active     ││
│  │ 456 Oak Ave     │  7   │    22     │ 0 ⚠️     │ Stale      ││
│  │ 789 Elm Rd      │  1   │     8     │ 3 🔥     │ Active     ││
│  │ 321 Pine Dr     │  0   │     0     │ —        │ New        ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  BUYER FEEDBACK (This Week)                                    │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🏷️ "Price too high" ████████████ 12                        ││
│  │ 🏷️ "Wrong area"     ████████ 8                             ││
│  │ 🏷️ "Too much work"  ████ 4                                 ││
│  │ 🏷️ "No response"    ██████████████████ 18                  ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  RECENT ACTIVITY                                               │
│  • Esteban sent 123 Main St to 15 buyers (2h ago)              │
│  • Brian Thompson responded "interested" (1h ago)               │
│  • Mike Chen passed - "price too high" (45m ago)               │
│  • 456 Oak Ave marked stale - 0 interest after 7 days          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Deal Detail View

When clicking on a specific deal:

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back                           123 MAIN ST, NASHVILLE       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  DEAL INFO                              DISPO STATUS            │
│  ┌─────────────────────────────┐       ┌─────────────────────┐ │
│  │ Contract: $145,000          │       │ Stage: Active       │ │
│  │ ARV: $280,000               │       │ Days Out: 3         │ │
│  │ Assignment: $10,000         │       │ Buyers Contacted: 15│ │
│  │ Closing: Feb 28             │       │ Hot Interest: 2     │ │
│  │ Property: 3/2, 1,450 sqft   │       │ Passes: 4           │ │
│  └─────────────────────────────┘       └─────────────────────┘ │
│                                                                 │
│  BUYER ENGAGEMENT                                              │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Buyer            │ Sent    │ Response │ Status   │ Notes   ││
│  ├───────────────────┼─────────┼──────────┼──────────┼─────────┤│
│  │ 🔥 Brian Thompson│ Feb 3   │ Feb 3    │ HOT      │ Wants   ││
│  │                  │ 10:00am │ 10:45am  │          │ to see  ││
│  │ 🔥 Sarah Williams│ Feb 3   │ Feb 3    │ HOT      │ Checking││
│  │                  │ 10:00am │ 2:30pm   │          │ funds   ││
│  │ ❌ Mike Chen     │ Feb 3   │ Feb 3    │ PASSED   │ Price   ││
│  │                  │ 10:00am │ 11:00am  │          │ too high││
│  │ ⏳ John Davis    │ Feb 3   │ —        │ WAITING  │ No reply││
│  │ ...12 more      │         │          │          │         ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ACTIONS                                                       │
│  [Send to More Buyers] [Mark UC] [Mark Dead] [View Packet]     │
│                                                                 │
│  ACTIVITY LOG                                                  │
│  • Feb 3, 10:00am — Sent to 15 buyers via text + email         │
│  • Feb 3, 10:45am — Brian Thompson: "I'm interested"           │
│  • Feb 3, 11:00am — Mike Chen: "Pass, price too high"          │
│  • Feb 3, 2:30pm — Sarah Williams: "Checking with partner"     │
│  • Feb 4, 10:00am — Auto follow-up sent to 10 non-responders   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Buyer Database View

```
┌─────────────────────────────────────────────────────────────────┐
│  BUYER DATABASE                    [Add Buyer] [Import] [⚙️]   │
├─────────────────────────────────────────────────────────────────┤
│  Search: [________________] Filters: [Tier ▼] [Market ▼]       │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Buyer         │ Tier      │ Markets     │ Deals  │ Response││
│  │               │           │             │ Closed │ Speed   ││
│  ├───────────────┼───────────┼─────────────┼────────┼─────────┤│
│  │ Brian Thompson│ Qualified │ Nashville,  │   3    │ ⚡ Fast ││
│  │               │ ✓ Funded  │ Antioch     │        │         ││
│  │ Mike Chen     │ Qualified │ Nashville   │   1    │ 📱 Same ││
│  │               │ ✓ Funded  │             │        │   Day   ││
│  │ Sarah Williams│ JV Partner│ Nashville,  │   2    │ 📱 Same ││
│  │               │ ✓ Funded  │ Franklin    │        │   Day   ││
│  │ John Davis    │ Not Ready │ Nashville   │   0    │ 🐌 Slow ││
│  │               │ ? Funding │             │        │         ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  BUYER STATS                                                   │
│  Total Buyers: 47 │ Qualified: 23 │ Missing Info: 12           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4. Team Performance View

```
┌─────────────────────────────────────────────────────────────────┐
│  DISPO TEAM PERFORMANCE                    [This Month ▼]      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ESTEBAN LEIVA                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                             ││
│  │  Deals Sent Out     ████████████████████  18               ││
│  │  Buyers Contacted   ████████████████████████████  312      ││
│  │  Responses Received ████████████████  89 (28%)             ││
│  │  Hot Interest       ████████  23                           ││
│  │  Deals Closed       ████  4                                ││
│  │  Revenue            ████████  $47,000                      ││
│  │                                                             ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  KEY METRICS                                                   │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │ Avg Response │ │ Close Rate   │ │ Avg Days to  │            │
│  │ Time         │ │              │ │ Close        │            │
│  │   2.3 hrs    │ │    22%       │ │    8 days    │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│                                                                 │
│  ACTIVITY CALENDAR                                             │
│  [Heatmap showing daily activity levels]                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Core Features

### 1. Inventory Management
- See all active deals in dispo
- Track days on market
- See buyer engagement per deal
- Flag stale deals (no interest after X days)

### 2. Buyer Engagement Tracking
- Log every buyer contacted
- Track response / no response
- Capture pass reasons
- Track hot interest

### 3. Buyer Database
- Central buyer list with all info
- Qualification status (Tier, Funding, Speed)
- Purchase history
- Buybox / market preferences

### 4. Activity Feed
- Real-time log of all dispo activity
- Who was contacted, when, response
- Deal stage changes
- System-generated events (auto follow-ups)

### 5. Feedback Analytics
- Aggregate pass reasons
- Identify patterns (pricing issues, market mismatch)
- Inform acquisition team

### 6. Performance Metrics
- Dispo manager activity stats
- Response rates
- Close rates
- Time to close

### 7. Offer Tracking (NEW)
- Track offers received from buyers
- Log offer amount, terms, contingencies
- Track counter-offers and negotiations
- Status: Pending → Accepted → Rejected → Countered
- Compare multiple offers on same deal

**Offer Tracking View:**
```
┌─────────────────────────────────────────────────────────────────┐
│  OFFERS: 123 Main St                                           │
├─────────────────────────────────────────────────────────────────┤
│  Contract Price: $145,000 │ Assignment: $10,000                │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Buyer          │ Offer    │ Terms        │ Status │ Action ││
│  ├────────────────┼──────────┼──────────────┼────────┼────────┤│
│  │ Brian Thompson │ $155,000 │ Cash, 14 day │ ⭐ BEST│ [Accept]││
│  │ Sarah Williams │ $152,000 │ Cash, 21 day │ Pending│ [Counter││
│  │ Mike Chen      │ $148,000 │ Financing    │ Low    │ [Reject]││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  [Add Offer] [Compare Offers]                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 8. Showing Management (NEW)
- Schedule buyer showings/walkthroughs
- Track confirmations and no-shows
- Collect feedback after showing
- Calendar integration

**Showing Management View:**
```
┌─────────────────────────────────────────────────────────────────┐
│  SHOWINGS: 123 Main St                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  UPCOMING                                                      │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Feb 6, 10:00 AM │ Brian Thompson │ Confirmed ✓ │ [Reschedule]│
│  │ Feb 6, 2:00 PM  │ Sarah Williams │ Pending     │ [Remind]   ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  COMPLETED                                                     │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Feb 4, 11:00 AM │ Mike Chen │ Showed │ Feedback: "Too much  ││
│  │                 │           │        │ work for the price"  ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  [Schedule Showing]                                            │
└─────────────────────────────────────────────────────────────────┘
```

### 9. Assignment Agreement Workflow (NEW)
- Trigger agreement when buyer commits
- Pull buyer info (Name, Company, Email) from database
- Auto-populate DocHub template
- Send for signature
- Track signature status
- Notify when signed

**Agreement Trigger Flow:**
```
Buyer accepts offer
       ↓
[Send Assignment Agreement] button appears
       ↓
System checks buyer info complete:
  ✓ Buyer Name
  ✓ Company Name  
  ✓ Email
       ↓
If missing → prompt to collect
If complete → populate DocHub template
       ↓
Send via DocHub
       ↓
Track status: Sent → Viewed → Signed
       ↓
Notify Esteban + Corey when signed
       ↓
Auto-move deal to "UC with Buyer" stage
```

**Agreement Status Panel:**
```
┌─────────────────────────────────────────────────────────────────┐
│  ASSIGNMENT AGREEMENT                                          │
├─────────────────────────────────────────────────────────────────┤
│  Buyer: Brian Thompson                                         │
│  Company: Thompson Investments LLC                             │
│  Email: brian@thompsoninv.com                                  │
│                                                                 │
│  Status: ✅ SIGNED                                             │
│  Sent: Feb 5, 4:30 PM                                          │
│  Viewed: Feb 5, 4:45 PM                                        │
│  Signed: Feb 5, 5:12 PM                                        │
│                                                                 │
│  [View Document] [Download PDF]                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## GHL Integration

### Data Sources

| Data | GHL Location |
|------|--------------|
| Deals | Dispo Pipeline opportunities |
| Buyers | Buyer Pipeline contacts |
| Buyer Info | Custom fields on contact |
| Activity | GHL conversation logs, notes |
| Responses | Inbound messages |

### Webhook Triggers

| Event | Action |
|-------|--------|
| Deal enters "Clear to Send Out" | Add to inventory |
| Buyer responds (SMS/email) | Log response, notify |
| Deal stage changes | Update dashboard |
| New buyer created | Add to buyer DB |

### Field Mapping (Configurable)

Each tenant maps their GHL fields to the dashboard:
- Pipeline selection
- Stage mapping
- Buyer field mapping
- Deal field mapping

(See Dispo Assist SPEC.md for full mapping schema)

---

## UI Components Needed

1. **Dashboard Cards** — KPI summary boxes
2. **Data Tables** — sortable, filterable tables for deals/buyers
3. **Deal Detail Panel** — slide-out or page for deal deep-dive
4. **Activity Feed** — real-time log component
5. **Charts** — bar charts for feedback, line charts for trends
6. **Buyer Profile** — buyer detail view
7. **Settings Panel** — field mapping configuration

---

## Navigation

```
Gunner App
├── Dashboard (existing)
├── Call History (existing)
├── Analytics (existing)
├── Training (existing)
├── Team (existing)
├── Dispo (NEW) ← This PRD
│   ├── Overview (default)
│   ├── Inventory
│   │   └── Deal Detail
│   │       ├── Buyer Engagement
│   │       ├── Offers (NEW)
│   │       ├── Showings (NEW)
│   │       └── Agreement (NEW)
│   ├── Buyers
│   ├── Showings Calendar (NEW)
│   └── Performance
└── Settings (existing)
    └── Dispo Settings (field mapping, DocHub)
```

---

## Notifications

| Event | Notification |
|-------|--------------|
| Buyer responds "interested" | Push + in-app |
| Deal stale (7+ days, 0 interest) | Daily digest |
| Buyer passes with reason | In-app log |
| Deal closed | Push + in-app celebration |

---

## Phase 1 (MVP)

**Build first:**
1. Overview dashboard with key metrics
2. Inventory table (deals + engagement stats)
3. Deal detail view
4. Basic activity feed
5. GHL integration (read deals, buyers)

**Defer to Phase 2:**
- Buyer database management
- Performance analytics
- Auto follow-up sending
- Marketing packet generation
- DocHub integration

---

## Phase 2 (Full)

- Complete buyer database with intake flow
- Full performance metrics
- Automated outreach (text/email from dashboard)
- Marketing packet generation
- **Offer tracking system** (compare, accept, reject, counter)
- **Showing management** (schedule, confirm, collect feedback)
- **Assignment agreement workflow** (DocHub integration, auto-populate, track signature)
- Advanced analytics and reporting

---

## Questions for Manus

1. Can this share components with existing Gunner dashboards?
2. What's the best approach for real-time activity updates?
3. How should we handle GHL rate limits for syncing?
4. Timeline estimate for Phase 1 MVP?

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Owner checks dashboard | Daily |
| Time to identify stale deal | <24 hours |
| Dispo visibility score | 100% (vs 0% today) |
| Buyer data completeness | >80% |
