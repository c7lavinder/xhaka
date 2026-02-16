# Business Map — Product Specification

**Feature:** Business Map (Gunner V2)
**Version:** 1.0
**Date:** 2026-02-13
**Status:** Draft

---

## 1. Overview & Value Proposition

The Business Map is a full-page visual dashboard inside Gunner that renders the entire wholesale real estate pipeline — from cold calling to close — as an interactive flowchart. Each step in the pipeline displays a **human icon** (manual), **robot icon** (automated by a Gunner agent), or **hybrid icon** (agent-assisted). As users activate agents, the corresponding step visually transforms from human → robot with a satisfying flip animation.

### Why It Matters

| Audience | Value |
|---|---|
| **Business Owner** | Instant bird's-eye view of what's manual vs. automated. Identifies bottlenecks and upsell opportunities in seconds. |
| **Sales Team (Gunner)** | The single most powerful demo slide: "Here's your business today (all humans). Here's your business on Gunner (robots everywhere)." |
| **New Customer** | Onboarding becomes a game — activate agents one by one, watch the map transform, see the automation % climb. |

**Core insight:** Wholesalers think in pipeline stages, not feature lists. The Business Map speaks their language and turns agent activation into a visible, gamified journey.

---

## 2. Full Process Map Layout

The pipeline is a left-to-right (desktop) / top-to-bottom (mobile) flowchart with **8 primary stages**, each containing **1-3 substeps**. Every substep maps to a team role and (optionally) a Gunner agent.

### Pipeline Stages

```
LEAD GENERATION → LEAD QUALIFICATION → APPOINTMENT SETTING → WALKTHROUGH →
OFFER → CONTRACT → DISPO → CLOSE
```

### Detailed Step Map

| # | Stage | Substep | Team Role | Gunner Agent | Agent Tier |
|---|---|---|---|---|---|
| 1a | **Lead Generation** | Cold Calling (Outbound Dialing) | Lead Generator | **AI Dialer Agent** | $99/mo |
| 1b | | Inbound Call Handling | Lead Generator | **Inbound Call Agent** | $49/mo |
| 1c | | SMS/Text Follow-Up | Lead Generator | **SMS Drip Agent** | $49/mo |
| 1d | | Voicemail Drops | Lead Generator | **Voicemail Bot** | $49/mo |
| 2a | **Lead Qualification** | Initial Lead Screening | Lead Manager | **Lead Screening Agent** | $49/mo |
| 2b | | Motivation & Situation Assessment | Lead Manager | **Qualification Agent** | $49/mo |
| 2c | | CRM Data Entry & Tagging | Lead Manager | **CRM Sync Agent** | $49/mo |
| 3a | **Appointment Setting** | Scheduling Callbacks/Appts | Lead Manager | **Appointment Setter Agent** | $49/mo |
| 3b | | Appointment Confirmation & Reminders | Lead Manager | **Reminder Agent** | $49/mo |
| 4a | **Walkthrough** | Property Visit Prep (Comps, ARV) | Acquisition Manager | **Comp Analysis Agent** | $99/mo |
| 4b | | On-Site Walkthrough | Acquisition Manager | *(None — human required)* | — |
| 5a | **Offer** | Offer Calculation (MAO) | Acquisition Manager | **Offer Calculator Agent** | $49/mo |
| 5b | | Offer Presentation & Negotiation | Acquisition Manager | **Negotiation Coach Agent** | $99/mo |
| 5c | | Follow-Up on Pending Offers | Acquisition Manager | **Offer Follow-Up Agent** | $49/mo |
| 6a | **Contract** | Contract Generation & Sending | Acquisition Manager | **Contract Agent** | $99/mo |
| 6b | | Earnest Money & Compliance | Acquisition Manager | *(None — human required)* | — |
| 7a | **Dispo** | Buyer List Management | Dispo Manager | **Buyer Match Agent** | $99/mo |
| 7b | | Deal Blast / Marketing to Buyers | Dispo Manager | **Deal Blast Agent** | $49/mo |
| 7c | | Buyer Follow-Up & Negotiation | Dispo Manager | **Buyer Follow-Up Agent** | $49/mo |
| 8a | **Close** | Title / Closing Coordination | Acquisition Manager | **Closing Coordinator Agent** | $49/mo |
| 8b | | Post-Close Follow-Up & Reviews | Dispo Manager | **Post-Close Agent** | $49/mo |

**Total substeps:** 20
**Automatable substeps:** 18 (2 require human presence — on-site walkthrough, earnest money/compliance)
**Max automation %:** 90% (18/20)

---

## 3. Visual States

Each substep node has one of three visual states:

### 🧑 Human (Manual)
- **Icon:** Person silhouette (neutral gray)
- **Border:** Gray dashed
- **Label:** Team role name (e.g., "Lead Generator")
- **Meaning:** No agent active. Fully manual.

### 🤖 Robot (Automated)
- **Icon:** Robot head (Gunner brand green, glowing pulse)
- **Border:** Solid green with subtle glow
- **Label:** Agent name (e.g., "AI Dialer Agent")
- **Badge:** "ACTIVE" pill
- **Meaning:** Agent is handling this step. Human optional.

### 🧑‍🤖 Hybrid (Agent-Assisted)
- **Icon:** Split — half-person / half-robot
- **Border:** Solid blue
- **Label:** Both role + agent name
- **Badge:** "ASSISTED" pill
- **Meaning:** Agent provides support (coaching, data, suggestions) but human still executes. Examples: Negotiation Coach Agent coaches the AM during offers but the AM still talks to the seller.

### 🚫 Not Available
- **Icon:** Person silhouette with lock overlay
- **Border:** Gray solid
- **Badge:** "HUMAN ONLY"
- **Meaning:** No agent exists for this step (e.g., on-site walkthrough). Shown differently so users don't expect automation here.

### Transition Animation
When a user activates an agent, the node plays a **flip animation** (card flip, ~0.6s):
1. Node rotates on Y-axis
2. Back face reveals the robot icon
3. Green glow pulses once
4. Automation % ticks up with a counter animation
5. Optional: confetti burst on milestone thresholds (25%, 50%, 75%, 90%)

---

## 4. Interaction Design

### Click/Tap a Node → Slide-Out Detail Panel

The detail panel appears from the right (desktop) or bottom (mobile) and shows context based on the node's state:

#### If Manual (No Agent Active)
- Step description: What happens here, who does it
- **"Automate This Step"** CTA button (primary, green)
- Agent overview: Name, what it does, price
- ROI teaser: "Companies using [Agent] save ~X hours/week"
- Social proof: "Used by 340+ wholesalers"

#### If Automated (Agent Active)
- Agent name + status (active, healthy)
- **Performance stats** (last 30 days):
  - Calls handled / leads screened / offers sent (metric varies by agent)
  - Time saved estimate
  - Success rate (if applicable)
- **Activity log:** Last 5 actions the agent took
- **Settings** link → agent config page
- **"Deactivate Agent"** secondary button

#### If Hybrid
- Same as automated, plus:
- Human performance alongside agent assist metrics
- "Upgrade to Full Automation" CTA (if applicable)

### Hover States (Desktop Only)
- Hovering a node shows a tooltip: step name + current state + one-line summary
- Hovering a stage header highlights all substeps in that stage

### Connections / Flow Lines
- Animated dotted lines connect stages left → right
- Lines are **gray** for manual connections, **green** for automated
- Shows the "flow of automation" visually — a fully automated pipeline is a green river

---

## 5. Automation Progress Indicator

### Top-of-Page Banner

```
┌─────────────────────────────────────────────────────┐
│  🤖 Your Business is  ██████████░░░░░░  55% Automated  │
│     11 of 20 steps powered by Gunner agents           │
│     [See What's Next →]                               │
└─────────────────────────────────────────────────────┘
```

- **Progress bar** fills left-to-right with green gradient
- **Percentage** updates in real-time when agents are toggled
- **"See What's Next"** scrolls/highlights the next recommended agent to activate
- The 2 "human only" steps are excluded from the denominator option (toggle: "Show achievable max" = 18 steps = 100%)

### Breakdown Chips (Below Progress Bar)
```
Lead Gen: 4/4 ✅  |  Qualification: 2/3  |  Appointments: 2/2 ✅  |  ...
```
Per-stage mini progress so users see which phases are fully covered.

---

## 6. Onboarding Use Case

### First-Time Experience (New Customer)

1. **Welcome Modal:**
   > "Welcome to your Business Map! This is your wholesale pipeline — every step from cold call to close. Right now, it's all manual. Let's change that."

2. **Map loads with all nodes in Human state** — gray, no glow, 0% automated

3. **Guided Tour (optional, skippable):**
   - Spotlight walks through each stage: "This is Lead Generation — where your cold callers live"
   - Highlights the first recommended agent: "Most teams start here — the AI Dialer Agent"
   - CTA: "Activate Your First Agent"

4. **First activation → flip animation + celebration:**
   - Confetti burst
   - Progress bar jumps from 0% → 5%
   - Achievement unlocked: "🎉 First Agent Activated!"

5. **Smart recommendations appear:**
   - After first activation, other nodes show subtle "Recommended" badges based on:
     - What's most impactful for their plan size
     - What pairs well with what they just activated
     - Popular combos from similar-sized teams

### Ongoing Onboarding
- Business Map is the **default landing page** for the first 30 days
- Weekly email: "Your Business Map Update — you're 35% automated. Here's what's next."
- In-app nudges when visiting other pages: "Your Dispo stage is still fully manual → [View Map]"

---

## 7. Sales Use Case

### Before/After Toggle

A toggle switch at the top of the map:

```
[Without Gunner]  ←→  [With Gunner]
```

- **Without Gunner:** All nodes are human/gray. Pipeline looks manual, slow, expensive.
- **With Gunner:** Nodes flip to robots with a cascading animation (left-to-right, staggered). Green lights up the entire pipeline.

### Sales Demo Mode
Accessible via URL parameter (`?demo=true`) or internal toggle for Gunner sales team:

- Pre-configured "prospect" account with 0% automation
- Sales rep walks through the map live: "Here's your pipeline today..."
- Activates agents one by one during the call, showing the visual transformation
- Ends with: "And here's your business fully powered by Gunner — 90% automated."
- **ROI Summary Panel** appears at the end:

```
┌──────────────────────────────────────┐
│  💰 Estimated Monthly Savings        │
│                                      │
│  Hours saved:        ~320 hrs/mo     │
│  FTE equivalent:     2.0 employees   │
│  Agent cost:         $1,047/mo       │
│  Estimated savings:  $6,000+/mo      │
│                                      │
│  [Start Free Trial]                  │
└──────────────────────────────────────┘
```

### Shareable Snapshot
- **"Share My Map"** generates a static image or public link
- Owner can share with their team: "Here's where we are and where we're going"
- Useful for investor decks, team meetings, social media flex

---

## 8. Gamification & Achievements

### Achievement System

Achievements unlock as users hit automation milestones. Shown as toast notifications + collected in a trophy case accessible from the map.

| Achievement | Trigger | Icon |
|---|---|---|
| **First Step** | Activate first agent | 🏁 |
| **Getting Started** | 25% automated (5 agents) | 🌱 |
| **Half Machine** | 50% automated (10 agents) | ⚡ |
| **Almost There** | 75% automated (14 agents) | 🔥 |
| **Full Pipeline** | 90% automated (18/18 possible agents) | 🏆 |
| **Stage Master: Lead Gen** | All Lead Gen steps automated | 📞 |
| **Stage Master: Qualification** | All Qualification steps automated | 🎯 |
| **Stage Master: Dispo** | All Dispo steps automated | 💰 |
| **Speed Demon** | Activate 5+ agents in first week | ⚡ |
| **All In** | Activate all available agents within 48 hours of signup | 🚀 |
| **30-Day Streak** | All agents active for 30 consecutive days | 🔥 |

### Leaderboard (Optional / Phase 2)
- Anonymous leaderboard: "Top 10 Most Automated Businesses"
- Shows automation % and number of agents
- Social proof + competitive motivation

### Monthly Automation Report
- Auto-generated email/in-app report:
  - Current automation %
  - Agents activated/deactivated this month
  - Performance highlights from active agents
  - "Unlock your next achievement" CTA

---

## 9. Technical Considerations

### Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Frontend    │────▶│  Map API     │────▶│  Agent Registry  │
│  (React)     │     │  /api/map    │     │  (DB: agents,    │
│              │◀────│              │◀────│   subscriptions)  │
└─────────────┘     └──────────────┘     └─────────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Analytics   │
                    │  Service     │
                    └──────────────┘
```

### Data Model

```typescript
// Pipeline definition (static, config-driven)
interface PipelineStep {
  id: string;                    // e.g., "lead_gen.cold_calling"
  stage: string;                 // e.g., "lead_generation"
  name: string;                  // e.g., "Cold Calling"
  description: string;
  teamRole: string;              // e.g., "Lead Generator"
  agentId: string | null;        // null = human-only step
  agentTier: "$49" | "$99" | null;
  order: number;
  automationType: "full" | "hybrid" | "none";
}

// User's map state (per account)
interface UserMapState {
  accountId: string;
  steps: {
    stepId: string;
    state: "manual" | "automated" | "hybrid";
    agentActivatedAt: Date | null;
    agentConfig: Record<string, any>;
  }[];
  automationPercent: number;     // computed
  achievements: string[];        // achievement IDs earned
  lastUpdated: Date;
}

// Agent performance (pulled from agent services)
interface StepPerformance {
  stepId: string;
  accountId: string;
  period: "7d" | "30d" | "90d";
  metrics: Record<string, number>; // varies by agent type
  timeSavedHours: number;
}
```

### API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/map` | Return pipeline definition + user's current map state |
| POST | `/api/map/activate` | Activate an agent for a step (triggers billing) |
| POST | `/api/map/deactivate` | Deactivate an agent |
| GET | `/api/map/performance/:stepId` | Get agent performance stats for a step |
| GET | `/api/map/achievements` | Get user's earned achievements |
| GET | `/api/map/snapshot` | Generate shareable map image/link |
| GET | `/api/map/demo` | Demo mode map (no auth required for sales) |

### Frontend Considerations
- **Framework:** React (consistent with Gunner V2 stack)
- **Visualization:** Use a lightweight library — **React Flow** or custom SVG. Avoid heavy D3 for this; the layout is fixed/predictable.
- **Animations:** Framer Motion for flip transitions, progress bar, confetti (use `canvas-confetti` lib)
- **Responsive:** Desktop = horizontal flowchart. Tablet = condensed horizontal. Mobile = vertical list with collapsible stages.
- **Performance:** The map is mostly static layout + user state overlay. Should load in <500ms. Lazy-load performance stats on panel open.

### Billing Integration
- Activating an agent from the map triggers the existing subscription/add-on billing flow
- Map state syncs bidirectionally with Stripe subscription status
- If payment fails → node reverts to Human state with "Payment Issue" badge

### Real-Time Updates
- WebSocket or polling (30s) to keep map state in sync if agents are activated/deactivated elsewhere (e.g., from agent settings page)
- Achievement toasts trigger on state change

---

## 10. Wireframe Description

### Desktop Layout (1440px)

```
┌─────────────────────────────────────────────────────────────────────┐
│  GUNNER V2                                    [Settings] [Profile]  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  🗺️ Your Business Map                              [Without ←→ With] │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  🤖 Your Business is ████████████░░░░░  65% Automated         │  │
│  │     13 of 20 steps  •  [See What's Next →]                    │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  Lead Gen    Qualification  Appointments  Walkthrough               │
│  ┌──────┐   ┌──────┐       ┌──────┐      ┌──────┐                 │
│  │ 🤖   │──▶│ 🤖   │──────▶│ 🤖   │─────▶│ 🤖   │                 │
│  │Dialer│   │Screen│       │Setter│      │ Comp  │                 │
│  │Agent │   │Agent │       │Agent │      │Analyst│                 │
│  └──────┘   └──────┘       └──────┘      └──────┘                 │
│  ┌──────┐   ┌──────┐       ┌──────┐      ┌──────┐                 │
│  │ 🤖   │   │ 🧑   │       │ 🤖   │      │ 🚫   │                 │
│  │Inbnd │   │Motiv.│       │Remind│      │OnSite│                 │
│  │Agent │   │Assess│       │Agent │      │(Human│                 │
│  └──────┘   └──────┘       └──────┘      │ Only)│                 │
│  ┌──────┐   ┌──────┐                      └──────┘                 │
│  │ 🤖   │   │ 🤖   │                                               │
│  │ SMS  │   │ CRM  │       Offer          Contract                 │
│  │Agent │   │Sync  │       ┌──────┐       ┌──────┐                 │
│  └──────┘   └──────┘       │ 🤖   │──────▶│ 🧑   │                 │
│  ┌──────┐                  │Offer │       │Earnst│                 │
│  │ 🤖   │                  │Calc  │       │Money │                 │
│  │ VM   │                  └──────┘       └──────┘                 │
│  │ Bot  │                  ┌──────┐       ┌──────┐                 │
│  └──────┘                  │ 🧑‍🤖  │       │ 🤖   │                 │
│                            │Negot.│       │Contr.│                 │
│                            │Coach │       │Agent │                 │
│  Dispo       Close         └──────┘       └──────┘                 │
│  ┌──────┐   ┌──────┐      ┌──────┐                                │
│  │ 🤖   │──▶│ 🤖   │      │ 🧑   │                                │
│  │Buyer │   │Close │      │Offer │                                │
│  │Match │   │Coord │      │F.Up  │                                │
│  └──────┘   └──────┘      └──────┘                                │
│  ┌──────┐   ┌──────┐                                               │
│  │ 🤖   │   │ 🤖   │                                               │
│  │Blast │   │Post  │       🏆 Achievements: [🏁][🌱][⚡][ ][ ]    │
│  │Agent │   │Close │                                               │
│  └──────┘   └──────┘                                               │
│  ┌──────┐                                                          │
│  │ 🧑   │                                                          │
│  │Buyer │                                                          │
│  │F.Up  │                                                          │
│  └──────┘                                                          │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ Stage Progress:                                              │   │
│  │ Lead Gen 4/4 ✅ │ Qual 2/3 │ Appts 2/2 ✅ │ Walk 1/2 │     │   │
│  │ Offer 1/3 │ Contract 1/2 │ Dispo 2/3 │ Close 2/2 ✅        │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### Detail Panel (Slides in from Right on Node Click)

```
┌────────────────────────────┐
│  ✕                         │
│                            │
│  📞 Cold Calling           │
│  Stage: Lead Generation    │
│  Role: Lead Generator      │
│                            │
│  ┌──────────────────────┐  │
│  │  🤖 AI Dialer Agent  │  │
│  │  Status: ACTIVE ●    │  │
│  │  Since: Jan 15, 2026  │  │
│  └──────────────────────┘  │
│                            │
│  📊 Last 30 Days           │
│  ├ Calls Made: 12,450     │
│  ├ Conversations: 1,832   │
│  ├ Connect Rate: 14.7%    │
│  ├ Time Saved: ~86 hrs    │
│  └ Cost: $99/mo           │
│                            │
│  📋 Recent Activity        │
│  • 2m ago: Called (615)... │
│  • 5m ago: Left VM for... │
│  • 8m ago: Connected w/.. │
│                            │
│  [⚙️ Agent Settings]       │
│  [⏸️ Deactivate Agent]     │
│                            │
└────────────────────────────┘
```

### Mobile Layout (375px)

Vertical stack — each stage is a collapsible accordion section. Tapping a stage expands it to show substep nodes in a vertical list. The automation progress bar is sticky at the top.

---

## Appendix: Implementation Phases

### Phase 1 — MVP (4-6 weeks)
- Static pipeline layout with correct stages/substeps
- Visual states (human/robot/hybrid) synced to active agent subscriptions
- Click-to-expand detail panel with agent info + activate CTA
- Automation % progress bar
- Responsive layout

### Phase 2 — Engagement (2-3 weeks)
- Flip animations on activation
- Achievement system with toasts
- Smart agent recommendations
- Guided onboarding tour

### Phase 3 — Sales & Growth (2-3 weeks)
- Before/After toggle
- Demo mode for sales team
- Shareable snapshot
- ROI summary panel
- Weekly automation report emails

### Phase 4 — Intelligence (Ongoing)
- Per-agent performance stats in detail panel
- AI-powered recommendations ("Based on your call volume, activate SMS Agent next")
- Leaderboard
- Team view (which team members are being augmented)

---

*This spec is a living document. Update as agent roster and pricing evolve.*
