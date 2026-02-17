# GHL Follow-Up Workflows — Extracted Content

> Extracted from GoHighLevel on 2025-07-17
> Location: New Again Houses Nashville (hmD7eWGQJE7EVFpJxj4q)

---

## Workflow 1: 1 Month Follow Up Workflow
**ID:** `73b74257-3332-444e-83c5-d313659c1abf`
**Status:** Published

### Trigger: "Monthly Follow Up Trigger"
- **Type:** Pipeline stage changed
- **Pipeline:** Sales Process
- **Stage:** 1 Month Follow Up

### Step 1: Add Tag
- **Tag:** `1 month`

### Step 2: Wait
- **Duration:** 26 days
- **Advance Window:** Yes (resume 9AM–5PM on certain days)

### Step 3: Condition — Check Pipeline Stage
- **Field:** Pipeline Stage
- **Check:** Is `[Sales Process] - 1 Month Follow Up`

#### Branch: If Match →

**Step 3a: Add Task**
- **Title:** `Follow Up Call — 1 Month`
- **Description:** `Follow up call for {{contact.company_name}}. If lead, change Mastersuite status to 1 and schedule appointment. If not a lead, keep in 1 month or move to corresponding follow up campaign. Call 2 times daily, text 1 time. If 3 days past due, check it off. Add all notes from conversation into MasterSuite.`
- **Assigned to:** Contact's Assigned User
- **Due in:** 5 days

**Step 3b: Remove from Workflow**
- Removes contact from current workflow

#### Branch: If No Match →

**Step 3c: Wait**
- **Duration:** 14 days
- **Advance Window:** No

**Step 3d: Condition 2 — Check Pipeline Stage Again**
- **Field:** Pipeline Stage
- **Check:** Is `[Sales Process] - 1 Month Follow Up`

##### Sub-Branch: If Match →
- **Go To:** Loops back to Add Tag step (Step 1)

##### Sub-Branch: If No Match →
- **END**

---

## Workflow 2: Follow Up Automation
**ID:** `0927d584-e878-427d-8824-835c8c986140`
**Status:** Published

### Trigger 1: "1 Year Follow Up Stale"
- **Type:** Stale Opportunities
- **Pipeline:** Follow Up
- **Duration:** 10 days
- **Stage:** 1 Year Follow Up

### Trigger 2: "Stale Opportunities"
- **Type:** Stale Opportunities
- **Pipeline:** Follow Up
- **Duration:** 10 days
- **Stage:** 4 Month Follow Up

### Step 1: Assign to User
- **User:** Chris Segura

### Step 2: Wait
- **Duration:** 28 (days)

### Step 3: Assign to User (second assignment)
- Details not extracted (likely reassigns)

### Step 4: Condition — Check Pipeline Stage
- **Field:** Pipeline Stage
- **Branches:**
  - **4 Month Branch:** Pipeline Stage Is `[Follow Up] - 4 Month Follow Up`
  - **1 Year Branch:** Pipeline Stage Is `[Follow Up] - 1 Year Follow Up`
  - **None:** When none of the conditions are met → END

---

### 4 Month Branch Flow

#### Step 4a: "4 Month Tag" (Add Tag)
- Adds a tag (likely "4 month")

#### Step 4b: "Add Tag"
- Additional tag

#### Step 4c: "Remove from Workflow"
- Removes from workflow

#### Step 4d: Wait
- **Duration:** 2261 (likely minutes — displayed on node)

#### Step 4e: "Drip messages"
- Drip message action

#### Step 4f: "Message Pool 4 Month" (Random Path Selection)
- Splits into **5 paths (A through E)** for message randomization

---

### SMS Message Templates — 4 Month Campaign

#### 1st Round SMS (5 variants, one per path A–E):

**Path A — "1st SMS 4 Month A":**
> Hi {{contact.first_name}}, we had a chat about {{contact.company_name}} a few months back. Are you still looking to sell?

**Path B — "1st SMS 4 Month B":**
> Hi {{contact.first_name}}, it is {{user.first_name}} with New Again Houses. Were you able to sell {{contact.company_name}}? Are you still looking to sell?

**Path C — "1st SMS4 Month C":**
> Hi {{contact.first_name}}, it is {{user.first_name}} with New Again Houses. We had spoken a few months back about {{contact.company_name}}. Is now a good time to start the process of selling?

**Path D — "1st SMS 4 Month D":**
> {{contact.first_name}}, checking back in to see if you are still looking to sell {{contact.full_address}}? We had spoken a few months back. — {{user.first_name}} with New Again Houses.

**Path E — "1st SMS 4 Month E":**
> Hey {{contact.first_name}}, were you still exploring options to sell {{contact.company_name}}? {{user.first_name}} w/ New Again Houses.

#### Wait Between Rounds
- Wait nodes between 1st and 2nd round SMS (duration not extracted individually — likely several days)

#### 2nd Round SMS (same message across all 5 paths):

**All Paths A–E — "2nd SMS 4 Month A":**
> Is selling {{contact.full_address}} still an option?

#### Wait Between Rounds
- Wait nodes between 2nd and 3rd round SMS

#### 3rd Round SMS (same message across all 5 paths):

**All Paths A–E — "3rd SMS 4 Month A":**
> Should I mark you as not selling {{contact.full_address}}? Or is there a better time to discuss it?

---

### After 3rd Round SMS

#### 4 Month Branch:
- **Go To** actions (4 total, one per remaining path) → loop back
- **Wait** action
- **Go To** actions (4 more) → loop back
- **Restart** action — restarts the workflow

#### 1 Year Branch:
- Similar structure with:
  - **Wait** (2232 — displayed on node)
  - **Drip messages** action
  - **Message Pool 4 Month** (uses same message pool)
  - **5 paths (A–E)** with same SMS templates as 4 Month
  - Same 3-round SMS pattern
  - **Restart workflow** action at end

> **Note:** Both 4 Month and 1 Year branches use the same SMS message templates. The difference is in the initial wait duration and the drip timing between rounds. All SMS nodes across both branches are named "1st/2nd/3rd SMS 4 Month A" — the templates are shared.

---

## Workflow 3: Follow Up Organization
**ID:** `9c959627-91b0-4207-93e5-9da1ead7605a`
**Status:** Published

### Trigger 1: "Sitting in Lead Gen"
- **Type:** Stale Opportunities
- **Duration:** 10 days
- **Pipeline:** Sales Process

### Trigger 2: "Moved in Lead Gen Pipeline"
- **Type:** Pipeline stage changed
- **Pipeline:** Sales Process

### Step 1: Wait
- **Duration:** 1 hour

### Step 2: Find Opportunity
- **Find:** Most recently created opportunity
- **Field:** Pipeline Is `Sales Process`

#### Branch: Opportunity Found →

### Step 3: Pipeline Stage (Condition)
- **Action Name:** Pipeline Stage
- **Branches (8 + None):**

| Branch | Condition | Stats |
|--------|-----------|-------|
| **4 Month Follow Up** | Pipeline Stage Is `[Sales Process] - 4 Month Follow Up` | 17 |
| **1 Year Follow Up** | Pipeline Stage Is `[Sales Process] - 1 Year Follow Up` | 16 |
| **Ghosted** | Pipeline Stage Is `[Sales Process] - Ghosted Lead` | 7 |
| **Trash** | Pipeline Stage Is `[Sales Process] - DO NOT WANT` | 5 |
| **Not Closed** | Pipeline Stage Is `[Sales Process] - Agreement not closed` | 10 |
| **SOLD** | Pipeline Stage Is `[Sales Process] - SOLD` | 4 |
| **Purchased** | Pipeline Stage Is `[Sales Process] - Purchased (6)` | 9 |
| **1 Month** | Pipeline Stage Is `[Sales Process] - 1 Month Follow Up` | 7 |
| **None** | When no condition is met | 4 |

#### Branch: Opportunity Not Found →
- **END**

---

### Downstream Actions Per Branch

Each branch follows a consistent pattern of actions. Here's the general flow per branch:

#### 4 Month Follow Up Branch:
1. **Add Tag** — tags the contact
2. **Assign to User** — assigns contact
3. **Remove from Working Drip** — removes from active drip
4. **Months Wait** — 170 (displayed on node)
5. **#1 Add to 4 Month Sheet** — Google Sheets action
6. **Add to Follow Up** — moves opportunity to Follow Up pipeline
7. **Find Opportunity** → Opportunity Found/Not Found
8. **Remove Opportunity** (if found)
9. **END**

#### 1 Year Follow Up Branch:
1. **Add Tag**
2. **Assign to User**
3. **Remove from Working Drip**
4. **Months Wait** — 121
5. **#2 Add to 1 Year Sheet** — Google Sheets action
6. **Add to Follow Up** — moves to Follow Up pipeline
7. **Find Opportunity** → Found/Not Found
8. **Remove Opportunity** (if found)
9. **END**

#### Ghosted Branch:
1. **Add Tag**
2. **Remove from Working Drip**
3. **Months Wait** — 99
4. **#3 Add to Ghosted Sheet** — Google Sheets action
5. **Lost Opportunity** — marks opportunity as lost
6. **Add to Follow Up**
7. **Find Opportunity** → Found/Not Found
8. **Remove Opportunity** (if found)
9. **END**

#### Trash (DO NOT WANT) Branch:
1. **Add Tag**
2. **Remove from Working Drip**
3. **Lost Opportunity**
4. **Abandon Opportunity**
5. **END**

#### Not Closed (Agreement not closed) Branch:
1. **Add Tag**
2. **Assign to User**
3. **Remove from Working Drip**
4. **Months Wait** — 23
5. **Add to Follow Up**
6. **Find Opportunity** → Found/Not Found
7. **Abandon Opportunity** (if found)
8. **END**

#### SOLD Branch:
1. **Add Tag**
2. **Remove from Working Drip**
3. **Won Opportunity** — marks as won
4. **END**

#### Purchased Branch:
1. **Add Tag**
2. **Remove from Working Drip**
3. **Months Wait** — 3
4. **Add to Follow Up**
5. **Find Opportunity** → Found/Not Found
6. **Abandon Opportunity** (if found)
7. **END**

#### 1 Month Branch:
1. **Add Tag**
2. **Remove from Working Drip**
3. **Wait** — 103
4. **#4 Add to 1 Month Sheet** — Google Sheets action
5. **Add to Follow Up**
6. **Add Follower(s) to Opportunity**
7. **Assign to User**
8. **END**

#### None Branch (no condition met):
- **END** (falls through)

---

## Summary of Key Variables Used in SMS Templates

| Variable | Description |
|----------|-------------|
| `{{contact.first_name}}` | Contact's first name |
| `{{contact.company_name}}` | Property address (stored as company name) |
| `{{contact.full_address}}` | Contact's full address |
| `{{user.first_name}}` | Assigned user's first name (the sales rep) |

## Pipeline Stages Referenced

### Sales Process Pipeline:
- 1 Month Follow Up
- 4 Month Follow Up
- 1 Year Follow Up
- Ghosted Lead
- DO NOT WANT
- Agreement not closed
- SOLD
- Purchased (6)

### Follow Up Pipeline:
- 4 Month Follow Up
- 1 Year Follow Up

## Google Sheets Actions
- #1 Add to 4 Month Sheet
- #2 Add to 1 Year Sheet
- #3 Add to Ghosted Sheet
- #4 Add to 1 Month Sheet
