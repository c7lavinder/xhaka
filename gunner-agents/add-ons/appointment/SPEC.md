# Appointment Bot

## Overview
Manages the entire appointment lifecycle: confirmation, reminders, rescheduling, no-show handling, and prep for AMs.

## Scope
- Walkthrough appointments (seller property visits)
- Offer call appointments (phone-based offer presentations)
- Any scheduled seller interaction

---

## Agents

### 1. Appointment Coordinator
**Role:** Orchestrates all appointment-related activities

**Lifecycle:**
```
Appointment Created
    ↓
24h Before → Confirmation Request
    ↓
Confirmed? 
  Yes → 2h Reminder + AM Prep
  No Response → Escalate (call seller)
  Rescheduled → Update calendar, restart sequence
  Cancelled → Route appropriately
    ↓
Appointment Time
    ↓
Post-Appointment → Check-in with AM
    ↓
No-Show? → No-Show Protocol
```

### 2. Confirmation Agent
**Role:** Confirms appointments with sellers

**24-Hour Confirmation:**
```
Hi {{first_name}}, confirming your appointment tomorrow:

📅 {{day_of_week}}, {{date}} at {{time}}
📍 {{property_address}}

{{am_name}} will meet you there.

Reply YES to confirm, or let us know if you need to reschedule.
```

**Response Handling:**
| Response | Action |
|----------|--------|
| YES / Confirmed / 👍 | Mark confirmed, notify AM |
| Reschedule request | Offer new times |
| Cancel | Cancel apt, route to follow-up |
| No response (4h) | Call attempt |
| No response (8h) | Second SMS |
| No response (12h) | Flag high-risk, alert AM |

### 3. Reminder Agent
**Role:** Sends timely reminders

**2-Hour Reminder (Confirmed appointments only):**
```
Reminder: {{am_name}} is heading to {{property_address}} in about 2 hours ({{time}}).

See you soon! Call us if anything changes: {{company_phone}}
```

**AM Notification (2 hours before):**
```
🏠 APPOINTMENT IN 2 HOURS

Seller: {{seller_name}}
Address: {{property_address}}
Time: {{time}}

Quick Stats:
- Motivation: {{motivation}}
- Asking: ${{asking_price}}
- Our anchor: ${{anchor_price}}

Notes: {{key_notes}}

Confirm seller still coming? Last confirmation: {{confirmation_status}}
```

### 4. Reschedule Handler
**Role:** Manages reschedule requests

**Trigger:** Seller indicates need to reschedule

**Flow:**
1. Acknowledge request
2. Offer 3 available time slots
3. Confirm new time
4. Update calendar
5. Restart confirmation sequence
6. Notify AM of change

**Reschedule Message:**
```
No problem! Here are some available times:

1️⃣ {{option_1}}
2️⃣ {{option_2}}
3️⃣ {{option_3}}

Reply with 1, 2, or 3 - or suggest another time that works for you.
```

### 5. No-Show Handler
**Role:** Manages no-show situations

**Detection:**
- AM reports no-show via quick reply
- Or: No "appointment completed" signal within expected window

**No-Show Protocol:**
1. Immediate SMS to seller:
```
Hi {{first_name}}, we were at {{property_address}} but may have missed you. 

Everything okay? Let us know if you'd like to reschedule.
```

2. Wait 2 hours for response

3. If no response, call attempt (create task for LM)

4. After 24h no contact:
   - Move to "Pending Apt" stage (2x daily call attempts)
   - Log no-show in notes
   - Update no-show count on contact

**Repeat No-Show Logic:**
| No-Shows | Action |
|----------|--------|
| 1 | Standard protocol, reschedule |
| 2 | Flag "High no-show risk" |
| 3 | Require phone confirmation before booking |
| 4+ | Manager review before accepting apt |

### 6. Calendar Manager
**Role:** Handles calendar operations

**Responsibilities:**
- Check AM availability before booking
- Prevent double-booking
- Buffer travel time between appointments
- Block prep time (15 min before)
- Handle timezone conversions

**Availability Rules:**
- Default available: 9 AM - 6 PM M-F, 10 AM - 4 PM Sat
- Respect AM's blocked time
- Minimum 1 hour between appointments
- Consider drive time based on locations

---

## Appointment Types

### Walkthrough Appointment
- In-person property visit
- AM meets seller at property
- Duration: ~45 min
- Requires: Address, seller attendance, access to property

### Offer Call Appointment  
- Phone-based offer presentation
- AM calls seller
- Duration: ~30 min
- Requires: All decision makers available

### Appointment Creation Data

**Required Fields:**
- Seller name
- Phone number
- Property address
- Date/time
- Appointment type
- Assigned AM

**Optional Fields:**
- Asking price
- Our anchor
- Key motivation notes
- Access instructions
- Gate code / lockbox info
- Other decision makers to include

---

## Integration Points

### Inputs
- GHL Calendar (appointments)
- GHL Contacts (seller info)
- LM Assistant Bot (creates appointments)
- Manual booking (AM/LM creates)

### Outputs
- GHL Calendar (updates, reschedules)
- SMS to seller
- SMS/notification to AM
- GHL tasks (no-show follow-up)
- GHL notes (confirmation status, no-shows)

---

## Tenant Configuration

```json
{
  "appointmentBot": {
    "enabled": true,
    "confirmationTiming": {
      "firstConfirmation": "24h",
      "reminder": "2h",
      "escalationCall": "12h_no_response"
    },
    "noShowProtocol": {
      "immediateSms": true,
      "callTaskAfter": "2h",
      "moveToPendingAfter": "24h",
      "maxNoShows": 4
    },
    "scheduling": {
      "defaultDuration": 45,
      "bufferMinutes": 15,
      "travelTimeBuffer": true,
      "workingHours": {
        "weekday": {"start": "09:00", "end": "18:00"},
        "saturday": {"start": "10:00", "end": "16:00"},
        "sunday": null
      }
    },
    "assignedAms": ["Kyle Barks"],
    "calendarId": "[GHL Calendar ID]",
    "timezone": "America/Chicago"
  }
}
```

---

## Escalation Paths

| Situation | Escalation |
|-----------|------------|
| No confirmation after 12h | Alert AM + create call task |
| Seller cancels | Route to LM for re-engagement |
| AM unavailable | Offer LM to cover or reschedule |
| 3+ reschedules | Flag for manager review |
| Technical failure | Alert admin, manual takeover |

---

## Success Metrics

- Confirmation rate (target: >80%)
- No-show rate (target: <15%)
- Reschedule rate
- Average appointments per AM per day
- Time from lead → appointment
- Appointment → contract conversion
