# Email Triage Bot

## Overview
Automatically sorts, prioritizes, and routes incoming emails. Drafts responses for common inquiries. Reduces inbox overwhelm and ensures nothing important gets missed.

## Design Principle: Zero-Config Ready
- Works immediately when email connected
- Auto-learns patterns from user behavior
- No manual rules needed to start
- Progressive configuration for power users

---

## Agents

### 1. Triage Coordinator
**Role:** Processes all incoming emails

**Auto-Classification Categories:**
| Category | Examples | Default Action |
|----------|----------|----------------|
| Seller Inquiry | "Want to sell", property questions | ⭐ High priority, route to sales |
| Seller Follow-up | Reply from existing lead | Route to assigned rep |
| Buyer Inquiry | "Looking to buy", investor questions | Route to dispo |
| Contract/Title | DocuSign, title company, closing | ⭐ High priority, alert owner |
| Vendor/Partner | Service providers, JV partners | Normal priority |
| Marketing/Promo | Newsletters, ads, offers | Low priority / Archive |
| Spam | Obvious spam | Auto-archive |
| Internal | Team, calendar, notifications | Normal priority |

**Zero-Config:** Categories pre-built, no setup needed

### 2. Priority Scorer
**Role:** Determines email urgency

**Auto-Priority Signals:**
| Signal | Priority Boost |
|--------|---------------|
| "Urgent" in subject | +High |
| "ASAP", "Today" | +High |
| Reply to your email | +Medium |
| Known contact (in CRM) | +Medium |
| Contract/legal keywords | +High |
| "Unsubscribe" request | +Low (compliance) |

**Smart Learning:**
- Tracks which emails user opens first
- Learns priority from user behavior
- Adjusts scoring over time

### 3. Contact Matcher
**Role:** Links emails to CRM contacts

**Auto-Match Flow:**
```
Email arrives
    ↓
Extract sender email
    ↓
Search GHL contacts
    ↓
Found? → Link to contact, pull context
Not found? → Flag as new lead (if seller inquiry)
```

**Context Enrichment:**
When matched, bot knows:
- Contact stage
- Assigned team member
- Last interaction
- Property details

### 4. Auto-Responder
**Role:** Handles common inquiries automatically

**Pre-Built Templates (editable):**

**Seller Inquiry (new):**
```
Subject: RE: {{original_subject}}

Hi {{first_name}},

Thanks for reaching out about selling your property!

I'd love to learn more. A few quick questions:
- What's the property address?
- What's your timeline for selling?
- Is the property currently occupied?

Or if easier, give us a call at {{company_phone}} - we're happy to chat!

Best,
{{company_name}}
```

**Info Request:**
```
Hi {{first_name}},

Thanks for your interest!

Here's how our process works:
1. Quick phone call to learn about your property
2. We evaluate and make a fair cash offer
3. If you accept, we close on your timeline

No fees, no repairs needed, no hassle.

Want to get started? Reply with your property address or call us at {{company_phone}}.

{{company_name}}
```

**Auto-Response Rules:**
- Only auto-respond during business hours
- Don't auto-respond to existing active leads
- Don't auto-respond twice to same person in 24h
- Always allow human override

### 5. Draft Generator
**Role:** Creates response drafts for human review

**Draft Scenarios:**
- Complex seller questions → Draft with suggested answers
- Price inquiries → Draft with appropriate deflection
- Objections → Draft using objection playbook
- Scheduling → Draft with calendar availability

**Draft Notification:**
```
📧 DRAFT READY

From: John Smith (seller inquiry)
Subject: Questions about selling 123 Main St

I've drafted a response based on their questions:
[View Draft]

Approve, edit, or discard?
```

### 6. Router
**Role:** Sends emails to right team member

**Auto-Routing Logic:**
| Email Type | Route To |
|------------|----------|
| Seller - assigned contact | Contact owner |
| Seller - new | On-duty LM |
| Buyer inquiry | Dispo team |
| Contract/title | Deal owner + admin |
| Vendor | Admin |

**Routing Actions:**
- Forward email to assignee
- Create task with email summary
- Add to contact timeline

---

## Tenant Onboarding

### Required (1 thing):
- Connect email account (Gmail/Outlook OAuth)

### Auto-Configured:
- Categories (pre-built)
- Priority rules (pre-built + learning)
- Templates (defaults provided)
- Routing (based on GHL team)

### Optional Customization:
- Edit response templates
- Add custom categories
- Adjust priority rules
- Set auto-response hours

---

## Integration Points

### Inputs
- Gmail/Outlook (incoming emails)
- GHL contacts (matching)
- GHL team (routing)

### Outputs
- Email labels/folders
- GHL contact notes
- GHL tasks
- Auto-responses
- Draft queue

---

## Tenant Configuration

```json
{
  "emailTriageBot": {
    "enabled": true,
    "autoConfigured": {
      "categories": "default",
      "priorityRules": "default",
      "templates": "default"
    },
    "requiredSetup": {
      "emailConnected": true
    },
    "optionalCustomization": {
      "customTemplates": [],
      "customCategories": [],
      "autoResponseHours": {"start": "08:00", "end": "18:00"}
    },
    "learning": {
      "enabled": true,
      "trackUserBehavior": true
    },
    "autoResponse": {
      "enabled": true,
      "onlyNewInquiries": true,
      "maxPerSenderPerDay": 1
    }
  }
}
```

---

## Success Metrics

- Inbox zero achievement rate
- Response time improvement
- Auto-response accuracy
- Important email miss rate (target: 0%)
- User behavior learning accuracy
