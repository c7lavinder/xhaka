# Post-Close Bot

## Overview
Handles all post-closing activities: thank-you messages, review requests, referral asks, system updates, and deal archival. Turns closed deals into future opportunities.

## Trigger
- Title Bot signals "Funded/Closed"
- Or: Deal manually marked closed in GHL

---

## Agents

### 1. Post-Close Coordinator
**Role:** Orchestrates post-close activities

**Sequence:**
```
Deal Funded
    ↓
Immediate: Seller thank you
    ↓
Day 1: Buyer thank you
    ↓
Day 3: Seller review request
    ↓
Day 7: Seller referral ask
    ↓
Day 7: Buyer feedback request
    ↓
Update all systems
    ↓
Archive deal
    ↓
Add to case studies (if good)
```

### 2. Gratitude Agent
**Role:** Sends thank-you messages

**Seller Thank You (Immediate):**
```
Hi {{seller_first_name}},

Thank you so much for trusting us with {{address}}! 🎉

We hope the process was smooth and stress-free. Your wire should arrive within 24-48 hours if not already.

It was a pleasure working with you. If you ever have questions or know someone else looking to sell, we're always here!

Best,
{{company_name}}
{{company_phone}}
```

**Buyer Thank You (Day 1):**
```
Hi {{buyer_first_name}},

Congrats on closing {{address}}! 🎉

Thank you for being a great buyer to work with. We hope this deal is profitable for you!

We have new deals coming in regularly - we'll keep you posted on anything matching your criteria.

To your success,
{{company_name}}
```

### 3. Review Agent
**Role:** Requests reviews from satisfied sellers

**Review Request (Day 3):**
```
Hi {{seller_first_name}},

Hope you're settling in nicely!

We'd be so grateful if you could take 60 seconds to share your experience. It really helps others find us:

⭐ Google: {{google_review_link}}

Just a sentence or two about how things went makes a huge difference!

Thank you so much,
{{company_name}}
```

**Platform Priority:**
1. Google Business (most valuable)
2. Facebook
3. Zillow/Realtor.com (if applicable)

**Conditional Logic:**
- Only request if deal went smoothly
- Skip if there were issues/complaints
- Personalize based on interaction quality

**Follow-Up (Day 7, if no review):**
```
Hi {{seller_first_name}},

Just a gentle reminder - if you have a minute, a quick review would mean the world to us!

⭐ {{google_review_link}}

No pressure at all - we just appreciate the support!
```

### 4. Referral Agent
**Role:** Asks for referrals

**Referral Ask (Day 7):**
```
Hi {{seller_first_name}},

Quick question - do you know anyone else who might be looking to sell a property?

We pay $500 for any referral that leads to a closed deal! Just have them mention your name.

Friends, family, neighbors, coworkers - anyone who might need a quick, easy sale.

Thanks again for everything!
{{company_name}}
```

**Referral Tracking:**
- Log referral source on new leads
- Track referral payouts
- Notify team when referral converts

**Referral Commission (if applicable):**
When referral closes → trigger payout:
```
🎉 REFERRAL BONUS

{{original_seller}} referred {{new_seller}}.
Deal closed: {{address}}

Payout owed: $500 to {{original_seller}}
```

### 5. Feedback Collector
**Role:** Gathers internal feedback for process improvement

**Buyer Feedback (Day 7):**
```
Hi {{buyer_first_name}},

Quick feedback request on {{address}}:

1. How accurate was our deal info? (1-5)
2. How was communication throughout? (1-5)
3. Anything we could improve?

Your feedback helps us serve buyers better!
```

**Internal Deal Review:**
Compile for team retrospective:
- Days to close
- Issues encountered
- What worked well
- What could improve

### 6. System Updater
**Role:** Updates all systems with closed deal

**GHL Updates:**
- Move opportunity to "Closed/Funded"
- Add "Closed" tag
- Update opportunity value (final)
- Mark contact as "Past Seller"
- Log final notes

**KPI Spreadsheet:**
- Add to Deals sheet
- Update revenue totals
- Log commission/fees

**Dispo Records:**
- Mark deal as closed
- Update buyer stats (if assignment)
- Log buyer satisfaction

**File Storage:**
- Archive all documents to deal folder
- Ensure executed docs saved
- Settlement statement filed

### 7. Case Study Generator
**Role:** Creates marketing assets from good deals

**Criteria for Case Study:**
- Clean transaction (no major issues)
- Happy seller (responded positively)
- Good story (problem solved)
- Seller willing to share (optional)

**Case Study Template:**
```markdown
## Case Study: {{address}}

**The Situation:**
{{seller_situation}}

**The Challenge:**
{{challenge}}

**Our Solution:**
{{how_we_helped}}

**The Outcome:**
- Closed in {{days}} days
- Seller net: ${{seller_proceeds}}
- Problem solved: {{problem_solved}}

**Seller Quote:**
"{{testimonial}}"
```

**Usage:**
- Website testimonials
- Social media posts
- Marketing materials
- Training examples

---

## Timing Schedule

| Day | Action | Recipient |
|-----|--------|-----------|
| 0 | Thank you | Seller |
| 1 | Thank you | Buyer |
| 3 | Review request | Seller |
| 7 | Referral ask | Seller |
| 7 | Feedback request | Buyer |
| 7 | Review reminder (if needed) | Seller |
| 14 | Final referral reminder | Seller |

---

## Metrics Tracked

**Deal Metrics:**
- Final sale price
- Assignment fee / profit
- Days to close
- Issues encountered

**Engagement Metrics:**
- Review rate
- Review sentiment
- Referral rate
- Referral conversion rate

**Buyer Metrics:**
- Buyer satisfaction score
- Repeat buyer rate
- Buyer feedback themes

---

## Integration Points

### Inputs
- Title Bot (closing confirmation)
- GHL opportunity (deal data)
- GHL contact (seller/buyer info)

### Outputs
- SMS/email (thank you, review, referral)
- GHL opportunity (status updates)
- GHL tags (past seller, past buyer)
- KPI spreadsheet (deal logging)
- File storage (archival)
- CRM/marketing (case studies)

---

## Tenant Configuration

```json
{
  "postCloseBot": {
    "enabled": true,
    "sellerThankYou": {
      "enabled": true,
      "timing": "immediate",
      "channel": "sms"
    },
    "buyerThankYou": {
      "enabled": true,
      "timing": "day_1",
      "channel": "email"
    },
    "reviewRequest": {
      "enabled": true,
      "timing": "day_3",
      "platforms": ["google"],
      "googleReviewLink": "https://g.page/r/...",
      "reminderDay": 7
    },
    "referralAsk": {
      "enabled": true,
      "timing": "day_7",
      "bonusAmount": 500,
      "reminderDay": 14
    },
    "buyerFeedback": {
      "enabled": true,
      "timing": "day_7"
    },
    "caseStudy": {
      "autoGenerate": true,
      "minDealQuality": "clean"
    },
    "archiveTo": {
      "googleDrive": true,
      "folderId": "[FOLDER_ID]"
    }
  }
}
```

---

## Error Handling

| Scenario | Action |
|----------|--------|
| Seller unresponsive | Don't push, respect silence |
| Negative review posted | Alert manager immediately |
| System update fails | Retry, then create manual task |
| Referral tracking issue | Log manually, investigate |
| Deal had issues | Skip review request, adjust messaging |

---

## Success Metrics

- Review request → review rate (target: >20%)
- Average review rating (target: >4.5 stars)
- Referral ask → referral rate (target: >5%)
- Referral → closed deal rate
- Buyer repeat rate
- Case studies generated per quarter
