# NAH Acquisitions Process Map
**Source:** Process diagram (Feb 2026)
**Status:** Documented from visual — needs Manus to recreate/update
**Last Updated:** Feb 3, 2026

---

## Role Legend

| Color | Role |
|-------|------|
| 🔴 Red | Data Manager |
| 🔵 Blue | Lead Manager (LM) |
| 🟢 Green | Acquisition Manager (AM) |
| 🟡 Yellow | Franchise Owner |
| 🟢 Dark Green Circles | **Critical Milestones** (see below) |

---

## Critical Milestones (Dark Green Circles)

These are the KEY MOMENTS in the process — major transitions that matter.

| Milestone | What It Means | Who Owns |
|-----------|---------------|----------|
| 🟢 **New Lead Created** | Lead added to CRM (already a lead, now formalized via automation/data manager cleaning) | Data Manager / Automation |
| 🟢 **Apt Scheduled** | LM had answered call AND booked the walkthrough appointment | LM |
| 🟢 **Contract Signed** | Seller signed the purchase contract | AM |

### Automations That Fire at Milestones
- **Property Evaluation Automation** — triggers during/after walkthrough
- **Appointment Confirmation Automations** — triggers when apt is scheduled

---

## Key Process Clarifications

### Lead Handoff Flow (Data Manager → LM)
```
🟢 New Lead Created
    ↓
[GHL] Lands in "New Lead" column
    ↓
[Data Manager] Cleans/verifies data
    ↓
[Data Manager] Moves to "Warm Lead" or "Hot Lead" column
    ↓
[AUTOMATION] Stage change triggers:
    ├── Assigns lead to LM
    └── Sends notification to LM
    ↓
[LM] Now engages the lead
```

**Note:** LMs DO wait for Data Manager cleanup. This creates a handoff delay — especially noticeable on weekends when Data Manager isn't working.

**Warm vs Hot Criteria (5-Factor Scoring):**
- Timeline
- Condition
- Price
- Motivation
- Source

**3+ factors = Hot Lead**

### Conversion Reality
- **10-20%** of contacted leads → Apt Scheduled (ready now)
- **80-90%** of contacted leads → Follow Up pool (not ready yet)
- Follow-up pool = **thousands of records** being worked continuously
- **Ghosted** = No response after 10-14 days in system

### LM Works Two Pools
1. **New leads** — Call immediately when they enter
2. **Follow-up leads** — Ongoing pool, most of the work

---

## PHASE 1: Lead Generation & Marketing
**Owner:** Data Manager (Red)

### Campaign Setup
```
Build Mkt Campaign
    ↓
├── Import list to BatchLeads
├── Upload List to BatchLeads
├── Send Texts
├── Reply to texts
├── Power Play Campaign
├── Call through the list
    ↓
├── Set Budget
├── Set Bids
├── Update Bids
    ↓
├── SEO Set Up
├── SEO Management
├── Keep Info Current
    ↓
├── Set Budget
├── Create Ads
├── Price Management
```

### Lead Entry Point
```
Clean Data → Lead? (decision)
    ↓
If YES → Submit Lead
    ↓
Lead Manual Research Campaigns
```

---

## PHASE 2: Lead Research & Qualification
**Owner:** Automations (Dark Green) + LM (Blue)

### Automated Research
```
Submit Lead
    ↓
Lead Manual Research Campaigns
    ↓
Researched? (decision)
    ├── YES → Call New Lead
    └── NO → Add to Research/Verify on details
              ↓
              Update details on Podio
              ↓
              Qualify Lead ✓
```

### Initial Outreach
```
Call New Lead
    ↓
Qualify New Lead
(Call 20 per day for All Reps)
    ↓
Answered? (decision)
    ├── YES → Continue to Interest Check
    └── NO → Working Lead / Lost Stay Organized
              ↓
              Put on Drip Campaign
              ↓
              Call 20 per day for All Reps
```

### Interest Qualification
```
Answered? → YES
    ↓
Interested? (decision)
    ├── YES → Continue to Appointment
    ├── NO → Check all qualify new leads sent
    └── GHOSTED → Ghosted path
```

---

## PHASE 3: Appointment Setting
**Owner:** Lead Manager (Blue)

### Setting the Appointment
```
Interested? → YES
    ↓
Set Apt Up
    ↓
├── Hot Follow Up
├── Warm Follow Up  
├── Cold Follow Up
└── Unqualified
    ↓
Moved to Apt scheduled column
    ↓
[AUTOMATION] Pre-Apt Autoconfirmation
    ↓
Task Created to Set Appt Number
```

### Appointment Confirmation
```
Task Created
    ↓
Walkthrough
    ↓
Confirm Apt
    ↓
Stage 2 Completed ✓
```

---

## PHASE 4: Walkthrough
**Owner:** Acquisition Manager (Green)

### Pre-Walkthrough
```
Confirm Apt
    ↓
[AUTOMATION] Pending Apt (Carrot/Batch)
    ↓
Perform Walkthrough
```

### Walkthrough Execution
```
Perform Walkthrough
    ↓
Show Up? (decision)
    ├── YES → Continue
    └── NO → [AUTOMATION] Post Walkthrough Autoconfirmation
              ↓
              Stage 3 Walkthrough Completed
```

### Post-Walkthrough
```
Show Up? → YES
    ↓
[AUTOMATION] Post Walkthrough Autoconfirmation
    ↓
Stage 3 Walkthrough Completed ✓
```

---

## PHASE 5: Offer Process
**Owner:** Acquisition Manager (Green)

### Offer Call Setup
```
Stage 3 Completed
    ↓
Call Seller at scheduled call time
    ↓
Accepted? (decision)
    ├── YES → Perform Offer Call
    └── NO/MAYBE → Pending Apt Communication
```

### Making the Offer
```
Perform Offer Call
    ↓
[AUTOMATION] Pending Apt Communication
    ↓
Accept or Follow Up? (decision)
    ├── ACCEPT → Continue to Contract
    └── FOLLOW UP → Follow Up Apt Prepare
                    ↓
                    ├── Warm Follow Up
                    └── Cold Follow Up
```

### Offer Outcomes
```
Perform Offer Call
    ↓
├── Made Offer Negotiation → YES → Decision on Price and terms
├── Hot Follow Up                         ↓
└── Cold Follow Up                   Contract Call ✓
                                          ↓
                                     Send to TC
```

### Contract
```
Decision on Price and terms → Agreed
    ↓
Contract Call ✓
    ↓
Send to TC (Title Company)
    ↓
DEAL COMPLETE ✅
```

---

## FOLLOW UP SYSTEM
**Owner:** Mixed (LM + Automations)

### Entry Points
```
[GREEN CIRCLE] Follow Up Entry
    ↓
├── Answered
├── Hot Follow Up
├── Warm Follow Up
└── Cold Follow Up
```

### Follow Up Flow
```
Contact Attempt
    ↓
Answered? (decision)
    ├── YES → Tag Created
    │           ↓
    │         Pipeline Changed
    │           ↓
    │         Specific Task Completed
    │           ↓
    │         Dealer Campaigns
    │           ↓
    │         ├── Create Campaigns
    │         ├── Execute Replies
    │         └── Execute Task Replies
    │           ↓
    │         Execute Calls
    │           ↓
    │         Execute Apts
    │
    └── NO → Continue Follow Up Sequence
              ↓
              Hot Follow Up / Warm Follow Up / Cold Follow Up
```

### Follow Up Outcomes
```
Follow Up Sequence
    ↓
Outcome:
├── Apts created → 3 Day SMS → [AUTOMATION] Email Nurturing
├── All Calls, visits, and missed → Task Created
├── Dead Lead Tag (x2)
    ↓
DNC, Assessment
    ↓
Contact? (decision)
    ├── YES → Update Daily Dashboard → Go to Follow-up section
    └── NO → For Follow-up/Abandoned
              ↓
              Survey Call (end)
```

---

## STAGE SUMMARY

| Stage | Name | Owner | Key Actions |
|-------|------|-------|-------------|
| 1 | Lead Gen | Data Manager | Campaigns, lists, outreach |
| 2 | Research | Automation + LM | Verify data, qualify |
| 3 | Contact | LM | Call, assess interest |
| 4 | Appointment | LM | Set apt, confirm |
| 5 | Walkthrough | AM | Visit property |
| 6 | Offer | AM | Present, negotiate |
| 7 | Contract | AM | Sign, send to TC |
| 8 | Follow Up | LM + Auto | Nurture non-converts |

---

## KEY DECISION POINTS

1. **Lead?** — Is this a valid lead to pursue?
2. **Researched?** — Do we have enough info to call?
3. **Answered?** — Did they pick up?
4. **Interested?** — Are they motivated to sell?
5. **Show Up?** — Did they attend the walkthrough?
6. **Accepted?** — Ready for offer call?
7. **Accept or Follow Up?** — Did they accept or need nurturing?
8. **Contact?** — Should we keep trying?

---

## AUTOMATION TRIGGERS

| Trigger | Automation |
|---------|------------|
| Lead submitted | Research/verify details |
| Apt scheduled | Pre-Apt Autoconfirmation |
| Walkthrough complete | Post Walkthrough Autoconfirmation |
| Offer pending | Pending Apt Communication |
| Follow up needed | Email Nurturing, SMS sequences |
| Dead lead | DNC tagging |

---

## NOTES FOR MANUS

**To recreate this diagram:**
1. Use color coding by role (see legend above)
2. Decision diamonds at each branching point
3. Automation steps in dark green
4. Clear flow from left (lead gen) to right (contract)
5. Follow up section as separate flow below main process
6. Include stage markers (Stage 2, Stage 3, etc.)

**Suggested tool:** Lucidchart, Miro, or Whimsical

**Update triggers:**
- When process changes
- When new automations added
- When roles shift
- Quarterly review recommended

---

## CHANGELOG

| Date | Change | By |
|------|--------|-----|
| Feb 3, 2026 | Initial documentation from visual | Xhaka |

---

*This document should be updated whenever the process changes. Visual diagram is source of truth.*
