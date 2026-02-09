# Showing Bot

## Overview
Manages buyer property showings for the dispo process: scheduling, confirmation, access coordination, feedback collection, and follow-up.

## Scope
- Coordinates showings between buyers and properties under contract
- Works with Dispo Assist Bot (which handles buyer matching/outreach)
- Feeds showing outcomes back into buyer scoring

---

## Agents

### 1. Showing Coordinator
**Role:** Orchestrates showing lifecycle

**Lifecycle:**
```
Buyer requests showing
    ↓
Check property availability
    ↓
Schedule showing slot
    ↓
Send access instructions
    ↓
24h/2h confirmations
    ↓
Day of: Final access details
    ↓
After showing: Collect feedback
    ↓
Route based on interest level
```

### 2. Availability Manager
**Role:** Manages showing windows for each property

**Considerations:**
- Seller occupancy (schedule around them)
- Existing showing appointments
- Property access type (lockbox, meet seller, vacant)
- Showing windows (e.g., only 10am-4pm)

**Availability Rules by Property:**
```json
{
  "propertyId": "123",
  "showingType": "lockbox",
  "lockboxCode": "1234",
  "availableWindows": [
    {"days": ["Mon","Tue","Wed","Thu","Fri"], "start": "09:00", "end": "18:00"},
    {"days": ["Sat"], "start": "10:00", "end": "16:00"}
  ],
  "slotDuration": 30,
  "bufferBetween": 15,
  "maxPerDay": 6,
  "specialInstructions": "Park on street, not in driveway"
}
```

### 3. Scheduler
**Role:** Books showing appointments

**Booking Flow:**
1. Buyer indicates interest ("I want to see it")
2. Offer available time slots:
```
Great! Here are available times for {{address}}:

1️⃣ Today 2:00 PM
2️⃣ Today 4:30 PM
3️⃣ Tomorrow 10:00 AM
4️⃣ Tomorrow 1:00 PM

Reply with a number, or suggest your preferred time.
```
3. Confirm booking
4. Send calendar invite to buyer
5. Log showing in deal record

**Multi-Buyer Coordination:**
If multiple buyers want same slot:
- First come, first served
- Offer next available to others
- Can do back-to-back if needed

### 4. Access Coordinator
**Role:** Provides property access information

**Access Types:**

**Lockbox:**
```
ACCESS INFO for {{address}}:

🔐 Lockbox Code: {{code}}
📍 Location: {{lockbox_location}}

{{special_instructions}}

Your showing is confirmed for {{date}} at {{time}}.
Code is valid only during your scheduled window.
```

**Seller Meet:**
```
ACCESS INFO for {{address}}:

The seller will meet you at the property.
Seller Contact: {{seller_name}} - {{seller_phone}}

Your showing is confirmed for {{date}} at {{time}}.
Please arrive on time as the seller is accommodating this visit.
```

**Vacant/Open Access:**
```
ACCESS INFO for {{address}}:

The property is vacant with open access.
Entry: {{entry_method}}

{{special_instructions}}

Your showing is confirmed for {{date}} at {{time}}.
```

**Code Security:**
- Codes sent only within 4 hours of showing
- Or: Time-based codes that change daily
- Log all code distributions

### 5. Confirmation Agent
**Role:** Confirms showings with buyers

**24-Hour Confirmation:**
```
Reminder: You have a showing tomorrow!

📍 {{address}}
📅 {{date}} at {{time}}

Reply YES to confirm, or let us know if you need to reschedule.
```

**2-Hour Reminder:**
```
Showing in 2 hours!

📍 {{address}}
🔐 Access code: {{code}}

See you there! Questions? {{company_phone}}
```

**No-Show Handling:**
- If buyer doesn't confirm within 4h → Call attempt
- If still no response → Cancel showing, offer slot to waitlist
- Track no-shows per buyer (affects buyer score)

### 6. Feedback Collector
**Role:** Gathers showing feedback

**Post-Showing Survey (2 hours after scheduled time):**
```
How was your showing at {{address}}?

1️⃣ Love it - want to make an offer
2️⃣ Interested - need to think/discuss
3️⃣ Maybe - have some concerns
4️⃣ Pass - not for me

Reply with a number!
```

**Follow-up by Response:**

**Love it (1):**
```
Great! What offer amount are you thinking?
Reply with your number and we'll get it submitted.
```
→ Route to Dispo Assist for offer handling

**Interested (2):**
```
No rush! What would help you decide?
- More photos/details?
- Repair estimate?
- Comp analysis?
- Second showing?

Reply or call us: {{company_phone}}
```
→ Create follow-up task for 48h

**Maybe (3):**
```
What concerns do you have? We might be able to address them.
```
→ Route response to dispo team

**Pass (4):**
```
Thanks for checking it out! Any feedback for us?
We'll keep you in mind for future deals that might be a better fit.
```
→ Log feedback, update buyer preferences

### 7. Analytics Tracker
**Role:** Tracks showing metrics

**Metrics Tracked:**
- Showings scheduled per property
- Show rate (scheduled vs attended)
- Feedback distribution (love/interested/maybe/pass)
- Time from showing request to scheduled
- Buyer showing history
- No-show rates by buyer

**Buyer Scoring Updates:**
| Behavior | Score Impact |
|----------|--------------|
| Attends showing | +10 |
| No-show | -25 |
| "Love it" feedback | +15 |
| Makes offer after showing | +30 |
| Repeat no-shows (3+) | Flag for review |

---

## Property Setup

### Initial Configuration (per property)
When deal enters dispo:
1. Determine access type
2. Set showing windows
3. Add special instructions
4. Configure max showings

### Access Instruction Template
```json
{
  "property": "{{address}}",
  "accessType": "lockbox|seller_meet|vacant|appointment_only",
  "lockboxCode": "1234",
  "lockboxLocation": "Front door, under mat",
  "entryInstructions": "Ring doorbell, then use lockbox",
  "parkingInstructions": "Street parking only",
  "specialNotes": "Dog on premises - will be kenneled",
  "showingWindows": [...],
  "requiresConfirmation": true,
  "maxDailyShowings": 6
}
```

---

## Waitlist Management

**When slots full:**
```
All showing slots are currently booked for {{address}}.

Would you like to be added to the waitlist? We'll contact you immediately if a slot opens up.

Reply YES for waitlist.
```

**When slot opens:**
```
A showing slot just opened up!

📍 {{address}}
📅 {{date}} at {{time}}

Want it? Reply YES to claim (first come, first served).
```

---

## Integration Points

### Inputs
- Dispo Assist Bot (buyer interest signals)
- GHL Calendar (availability)
- Deal record (property details, access info)

### Outputs
- GHL Calendar (showing appointments)
- Buyer communication (SMS/email)
- Deal notes (showing history)
- Buyer record (showing history, scores)
- Dispo Assist (offer routing)

---

## Tenant Configuration

```json
{
  "showingBot": {
    "enabled": true,
    "defaultShowingDuration": 30,
    "defaultBuffer": 15,
    "confirmationTiming": {
      "firstConfirmation": "24h",
      "reminder": "2h",
      "accessCodeTiming": "4h"
    },
    "feedbackTiming": "2h_after",
    "noShowPolicy": {
      "warningAfter": 2,
      "blockAfter": 4
    },
    "waitlistEnabled": true,
    "maxWaitlistPerProperty": 10,
    "calendarId": "[GHL Calendar ID]"
  }
}
```

---

## Error Handling

| Scenario | Action |
|----------|--------|
| Double-booking attempt | Offer next available |
| Access code issue | Alert dispo team immediately |
| Buyer can't access property | Create urgent task |
| No feedback received | Send one reminder after 24h |
| Seller conflict | Reschedule, apologize to buyer |

---

## Success Metrics

- Average showings per deal
- Show rate (target: >85%)
- Feedback completion rate (target: >70%)
- Time from interest → showing scheduled
- Showing → Offer conversion rate
- Buyer satisfaction score
