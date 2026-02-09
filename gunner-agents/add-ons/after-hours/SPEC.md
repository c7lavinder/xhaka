# After-Hours Bot

## Overview
Provides instant response to leads outside business hours. Engages sellers immediately, gathers initial info, and queues for priority follow-up when team returns.

## Trigger
- Inbound lead (form, SMS, call) outside business hours
- Weekend leads
- Holiday leads

---

## Agents

### 1. After-Hours Coordinator
**Role:** Manages all after-hours lead engagement

**Business Hours Definition:**
- Weekdays: 8 AM - 7 PM CT
- Saturday: 9 AM - 5 PM CT
- Sunday: Closed
- Holidays: Closed (configurable list)

**After-Hours = Everything else**

### 2. Instant Responder
**Role:** Sends immediate acknowledgment

**Response Time:** Within 60 seconds of lead arrival

**Response by Channel:**

**SMS Inquiry:**
```
Hi {{first_name}}! Thanks for reaching out about your property.

Our team is currently offline, but I wanted to let you know we received your message and will follow up first thing tomorrow morning.

In the meantime, a few quick questions so we can help you faster:

1. What's the property address?
2. Are you the owner?
3. What's your timeline for selling?

Reply anytime - I'll make sure the right person sees it!

- {{company_name}}
```

**Web Form Submission:**
```
Subject: We received your inquiry - {{company_name}}

Hi {{first_name}},

Thank you for submitting your property information!

Our team is currently offline (we're humans who need sleep 😊), but your inquiry is at the top of our list for tomorrow morning.

What to expect:
• We'll call you within the first 2 hours of business
• We'll have questions about your property and situation
• No pressure - just an honest conversation

In the meantime, if you have any photos of the property or additional details, feel free to reply to this email.

Talk soon!
{{company_name}}
{{company_phone}}
```

**Inbound Call (Voicemail):**
```
Hi, you've reached {{company_name}}. 

We're currently away from the phone, but your call is important to us! 

Please leave your name, number, and the property address you're calling about. We'll call you back first thing tomorrow morning, or you can text us anytime at this number.

Thanks, and talk soon!
```

### 3. Info Gatherer
**Role:** Collects qualifying information via conversation

**If Seller Responds:**

**Question Flow:**
1. Property address (if not provided)
2. Ownership confirmation
3. Property condition
4. Selling timeline
5. Motivation (gentle probe)
6. Price expectations (optional)

**Conversational Approach:**
```
Seller: 123 Main St Nashville

Bot: Got it! Thanks. Is this property you own or are you helping someone else?

Seller: I own it

Bot: Perfect. Just a couple more questions to help our team tomorrow:

What's the general condition? (Move-in ready, needs some work, or major repairs needed?)

Seller: Needs some work, roof and AC

Bot: Thanks for sharing that. What's your ideal timeline - looking to sell quickly, or more flexible?

Seller: Pretty quick, maybe 30 days

Bot: Got it. We can definitely work with that timeline. Last question - do you have a ballpark price in mind, or would you like us to evaluate and make an offer?

Seller: Maybe around 150-160k

Bot: Perfect. I've noted everything down:
• 123 Main St, Nashville
• You own it
• Needs roof and AC work
• 30-day timeline
• Thinking $150-160K

{{first_name}}, one of our specialists will call you tomorrow morning to discuss further. They may have a few more questions about the property, but this is super helpful.

Is morning or afternoon better for a call?
```

### 4. Priority Tagger
**Role:** Flags urgent/hot leads for immediate follow-up

**Priority Signals:**
- "Need to sell fast/ASAP/urgent"
- Short timeline mentioned (<30 days)
- Strong motivation expressed
- Engaged heavily (multiple responses)
- High-value property address

**Tagging:**
- `After-Hours Lead`
- `Priority: High/Medium/Low`
- `First Contact: [Time]`
- `Responded: Yes/No`

**Priority Lead Alert:**
If HIGH priority detected:
```
🔥 HOT AFTER-HOURS LEAD

{{seller_name}} - {{phone}}
Property: {{address}}

Why hot:
• "Need to sell within 2 weeks"
• Very engaged (5 messages)
• Timeline: 14 days

Info gathered:
• Condition: Needs roof
• Price: Open to offers
• Best time: Morning

Consider calling early tomorrow!
```

### 5. Handoff Preparer
**Role:** Prepares leads for morning follow-up

**Morning Report (7:30 AM):**
```
📬 AFTER-HOURS LEADS - {{date}}

Total overnight: 5

🔥 HIGH PRIORITY (2)
1. John Smith - 615-555-1234
   • "Urgent sale needed"
   • Info gathered: ✅ Complete
   • Best time: Morning

2. Jane Doe - 615-555-5678
   • 14-day timeline
   • Info gathered: Partial
   • Best time: Anytime

📋 STANDARD (3)
3. Bob Wilson - needs callback
4. Mary Johnson - form submission only
5. Tom Brown - left voicemail

[View all in GHL]
```

**Task Creation:**
For each after-hours lead:
- Create task: "After-hours lead - [Name]"
- Due: First hour of business
- Assign: On-duty LM
- Priority based on signals

### 6. Weekend Manager
**Role:** Special handling for weekend leads

**Friday Night → Monday Morning:**
- Acknowledge timing clearly
- Set Monday expectation
- Offer Saturday option if team available
- Send Sunday reminder: "We'll call tomorrow!"

**Weekend Response:**
```
Hi {{first_name}}! Thanks for reaching out.

Just a heads up - it's the weekend so our team is recharging. But don't worry, you're first in line for Monday morning!

We'll call you within the first 2 hours on Monday.

If this is urgent and can't wait, reply "URGENT" and I'll try to reach someone for you.

Have a great weekend!
```

**Urgent Escalation:**
If seller replies "URGENT":
- Alert designated on-call person
- Create urgent task
- If no response in 1 hour, notify Corey

---

## Conversation Limits

**Max Messages:** 10 exchanges
**After Limit:**
```
Thanks for all the info, {{first_name}}! 

I've got everything I need for our team. They'll take it from here tomorrow morning and can answer any other questions you have.

Have a great night! 🌙
```

**Handoff Triggers:**
- Max messages reached
- Seller asks complex question
- Seller requests human
- Pricing negotiation attempted

---

## Integration Points

### Inputs
- GHL form submissions
- GHL inbound SMS
- GHL call logs (missed calls)
- GHL voicemail transcripts

### Outputs
- GHL contact notes (conversation log)
- GHL tags (after-hours, priority)
- GHL tasks (follow-up)
- Team notifications (priority alerts)
- Morning summary report

---

## Tenant Configuration

```json
{
  "afterHoursBot": {
    "enabled": true,
    "businessHours": {
      "weekday": {"start": "08:00", "end": "19:00"},
      "saturday": {"start": "09:00", "end": "17:00"},
      "sunday": null
    },
    "timezone": "America/Chicago",
    "holidays": ["2026-01-01", "2026-07-04", "2026-12-25"],
    "responseDelay": 60,
    "infoGathering": {
      "enabled": true,
      "maxMessages": 10,
      "questions": ["address", "ownership", "condition", "timeline", "motivation"]
    },
    "priorityAlerts": {
      "enabled": true,
      "channels": ["sms"],
      "recipients": ["on_call_lm"]
    },
    "weekendUrgent": {
      "enabled": true,
      "escalateTo": "owner"
    },
    "morningReport": {
      "time": "07:30",
      "recipients": ["lm_team"]
    }
  }
}
```

---

## Error Handling

| Scenario | Action |
|----------|--------|
| Bot confused by response | Graceful handoff message |
| Seller frustrated | Apologize, promise human callback |
| System error | Simple acknowledgment only |
| Spam detected | Don't engage, flag for review |

---

## Success Metrics

- After-hours lead response time (target: <60s)
- Info gathering completion rate
- Lead engagement rate (responded to bot)
- Priority lead same-day contact rate
- After-hours lead → contract conversion
- Seller satisfaction (feedback)
