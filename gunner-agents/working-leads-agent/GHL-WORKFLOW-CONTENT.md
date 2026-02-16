# Working Leads Drip - GHL Workflow Content (DETAILED)

**Workflow Name:** Working Leads Drip  
**Extracted:** 2026-02-16  
**From:** GoHighLevel (New Again Houses Nashville)  
**Location ID:** hmD7eWGQJE7EVFpJxj4q

---

## CONDITION NODE

**Action Name:** Condition  
**Scenario Recipe:** Build Your Own

### Branch 1: Dailer Leads
- **Condition:** Source **Is** "dialer"

### Branch 2: SMS Leads
- **Condition:** Source **Is** "sms" **OR** Source **Is** "texts"

### Branch 3: Form Leads
- **Condition:** Source **Is** "forms"

### Branch 4: None
- **Condition:** When none of the conditions are met (default/fallback)

---

## INITIAL WAIT STEPS (After Condition)

All 4 branches have a Wait step immediately after the condition:
- **Wait For:** Time Delay
- **Duration:** 2 minutes
- **Advance Window:** Off

---

## DAY 0 SMS MESSAGES

### Working Day 0 SMS (Dialer Branch)
**Action Name:** Working Day 0 SMS  
**Message:**
```
Hey this is {{user.first_name}}, assistant just sent me your information about (( contact.company_name )) and said to give you a call to talk more about how we can help you.
```
**Character Count:** 173 characters | 30 words

---

### Working SMS Day 0 SMS (SMS Branch)
**Action Name:** Working SMS Day 0 SMS  
**Message:**
```
Hey this is {{user.first_name}}, assistant just sent me your information about (( contact.company_name )) and said to give you a call to talk more about how we can help you.
```
**Character Count:** 173 characters | 30 words  
*Note: Same content as Dialer branch*

---

### Working FORM Day 0 SMS (Form Branch)
**Action Name:** Working FORM Day 0 SMS  
**Message:**
```
Hello this is {{user.first_name}}, I got your information about (( contact.company_name )). Can I call you today to discuss an offer on your property?
```
**Character Count:** 150 characters | 24 words

---

### Working General Day 0 SMS (None/General Branch)
**Action Name:** Working General Day 0 SMS  
**Message:**
```
Hey this is {{user.first_name}}, I have your information about (( contact.company_name )). Can I call you today to discuss an offer on it?
```
**Character Count:** 138 characters | 23 words

---

## TIME TO CONNECT EMAIL

**Action Name:** Time to Connect Email  
**From Name:** Kyle Barks  
**From Email:** kbarks@newagainhouses.com  
**Subject:** You're looking to sell {{contact.company_name}}? Let's connect  
**Pre-Header (Preview Text):** (Optional - empty)  
**Create Email Mode:** Quick Compose  
**Body:** *(Quick Compose mode - body content not visible in editor)*

---

## WAIT STEP (After Email)

**Wait For:** Time Delay  
**Duration:** 1 day  
*(Indicated by "1" badge on Wait node)*

---

## DAY 0.5 SMS MESSAGES

### Working CC Day .5 SMS (Dialer Branch)
**Action Name:** Working CC Day .5 SMS  
**Message:**
```
** just bumping this - thanks {{user.first_name}}
```
**Character Count:** 49 characters | 7 words

---

### Working SMS Day .5 SMS (SMS Branch)
**Action Name:** Working SMS Day .5 SMS  
**Message:**
```
** just bumping this - thanks {{user.first_name}}
```
**Character Count:** 49 characters | 7 words  
*Note: Same content as Dialer branch*

---

### Working FORM Day .5 SMS (Form Branch)
**Action Name:** Working FORM Day .5 SMS  
**Message:**
```
I'm sure you are busy, but if you have just a few minutes, I would love to prepare a cash offer for you as soon as possible. When is a good time for me to give you a call? - {{user.first_name}} with New Again Houses
```
**Character Count:** 215 characters | 45 words

---

### Working GENERAL Day .5 SMS (None/General Branch)
**Action Name:** Working GENERAL Day .5 SMS  
**Message:**
```
** just bumping this - thanks {{user.first_name}}
```
**Character Count:** 49 characters | 7 words  
*Note: Same content as Dialer/SMS branch*

---

## WAIT STEPS (After Day 0.5)

Various wait durations based on branch:
- Dialer Branch: Wait 2 days (indicated by "2" badge)
- SMS Branch: Wait step present
- Form Branch: Wait 1 day (indicated by "1" badge)
- General Branch: Wait 3 days (indicated by "3" badge)

---

## DAY 1 SMS MESSAGES

### Working CC Day 1 SMS (Dialer Branch)
**Action Name:** Working CC Day 1 SMS  
**Message:**
```
Hey {{contact.first_name}}, {{user.first_name}} again! My assistant sent me your information for (( contact.company_name )) yesterday, when can we connect today about getting you that cash offer?
```
**Character Count:** 195 characters | 26 words

---

### Working CC Day 1 SMS (SMS Branch - Second Instance)
**Action Name:** Working CC Day 1 SMS  
**Message:**
```
Hey {{contact.first_name}}! I'm with New Again Houses, yesterday I received your information from my assistant in regards to (( contact.company_name )). Is there a time today or tomorrow where I can give you a call, I just need a few minutes to put together your cash offer.
```
**Character Count:** 274 characters | 47 words

---

### Working FORM Day 1 SMS (Form Branch)
**Action Name:** Working FORM Day 1 SMS  
**Message:**
```
Hey {{contact.first_name}}, it is {{user.first_name}} from New Again Houses. I want to get you offer for (( contact.company_name ))! I just need a little bit more info. When can I give you a call?
```
**Character Count:** 196 characters | 34 words

---

### Working GENERAL Day 1 SMS (None/General Branch)
**Action Name:** Working GENERAL Day 1 SMS  
**Message:**
```
Hey {{contact.first_name}}! Your information came in yesterday, I just need a few minutes of your time to prep your cash offer. What time is best to give you a call?
```
**Character Count:** 165 characters | 30 words

---

## STILL INTERESTED EMAIL

**Action Name:** Still interested email  
**From Name:** Kyle Barks  
**From Email:** kbarks@newagainhouses.com  
**Subject:** Still interested in selling {{contact.company_name}}?  
**Pre-Header (Preview Text):** (Optional - empty)  
**Create Email Mode:** Quick Compose  
**Body:** *(Quick Compose mode - body content not visible in editor)*

---

## DAY 2 SMS MESSAGES

### Working CC Day 2 (Dialer Branch)
**Action Name:** Working CC Day 2  
**Message:**
```
Hey its {{user.first_name}} again... I was sent your information saying you had a property you were interested in selling, but I assume that you've probably changed your mind.
```
**Character Count:** 175 characters | 28 words  
*Note: "Breakup" style message*

---

### Working SMS Day 2 (SMS Branch)
**Action Name:** Working SMS Day 2  
**Message:**
```
Hey its {{user.first_name}} again... Assistant sent your information saying you had a property you were interested in selling a couple days ago, but I assume that you've probably changed your mind.
```
**Character Count:** 197 characters | 31 words

---

### Working FORM Day 2 SMS (Form Branch)
**Action Name:** Working FORM Day 2 SMS  
**Message:**
```
Hey its {{user.first_name}} with New Again Houses... I tried to get in contact with you yesterday about a form you recently filled out about. Were you still interested in getting an offer on (( contact.company_name ))?
```
**Character Count:** 218 characters | 36 words

---

### Working CC Day 2 (None/General Branch)
*Uses same "Working CC Day 2" template as Dialer branch*

---

## TRUST BUILDING EMAIL

**Action Name:** Trust Building Email  
**From Name:** Kyle Barks  
**From Email:** kbarks@newagainhouses.com  
*(Subject and body not extracted)*

---

## GO TO ACTIONS (Branch Merge)

After Day 2 and Trust Building Email, branches merge via "Go To" actions that route to the unified drip sequence.

---

## WAIT STEP (Before Day 3)

**Wait For:** Time Delay  
**Duration:** 4 days (indicated by "4" badge)

---

## UNIFIED SMS DRIP (Day 3+)

### Working Day 3 SMS
**Action Name:** Working Day 3 SMS  
**Message:**
```
{{contact.first_name}}? It's {{user.first_name}} checking in. I want to put together your cash as is offer, is there any way we could connect for 5 minutes so I can get the last bit of information I need?
```
**Character Count:** 204 characters | 36 words

---

### Wait (After Day 3)
**Duration:** 1 day

---

### Working Drip SMS Day 4
**Action Name:** Working Drip SMS Day 4  
**Message:**
```
Hi {{contact.first_name}}! {{user.first_name}} here :) got the info about your property at {{contact.company_name}}, but I had a few questions before I pull together your cash offer. Is texting here easier than calling?
```
**Character Count:** 219 characters | 32 words

---

### Wait (After Day 4)
**Duration:** 6 hours

---

### Working Drip SMS Day 5
**Action Name:** Working Drip SMS Day 5  
**Message:**
```
Hi {{contact.first_name}}, I've been trying to reach you with an offer for your property at {{contact.company_name}}! Texting you in case it is more convenient. Is it ok to text or would you rather I call you?
```
**Character Count:** 209 characters | 36 words

---

### Wait (After Day 5)
**Duration:** 6 hours

---

### Working Drip SMS Day 6
**Action Name:** Working Drip SMS Day 6  
**Message:**
```
Hi {{contact.first_name}}! I am so ready for a vacation! How about you? I just wanted to send you a quick message to follow up with you about {{contact.company_name}}. Are you still looking to sell?
```
**Character Count:** 198 characters | 34 words

---

## GREAT TIME TO SELL EMAIL

**Action Name:** Great time to sell Email  
*(Details not fully extracted)*

---

### Wait (After Day 6 / Before Day 7)
**Duration:** 3 days

---

### Working Drip SMS Day 7
**Action Name:** Working Drip SMS Day 7  
**Message:**
```
Hey there {{contact.first_name}}. Were you still interested in selling your property? Not sure when a good time to chat is but my schedule is super flexible tomorrow — even if it is before or after normal business hours! When do you have time for a quick call
```
**Character Count:** 260 characters | 47 words

---

### Wait (After Day 7)
**Duration:** 1 day

---

### Working Drip SMS Day 8
**Action Name:** Working Drip SMS Day 8  
**Message:**
```
Hi {{contact.first_name}}, Did you finally sell your property at {{contact.company_name}}? If not we can buy. Let me know.
```
**Character Count:** 122 characters | 18 words

---

### Wait (After Day 8)
**Duration:** 3 days

---

### Working Drip SMS Day 9
**Action Name:** Working Drip SMS Day 9  
**Message:**
```
{{contact.first_name}}, here just taking a shot again. I've been trying to reach you for months about buying {{contact.company_name}}, you probably aren't interested?
```
**Character Count:** 166 characters | 22 words

---

### Wait (After Day 9)
**Duration:** 1 day

---

### Working Drip SMS Day 10
**Action Name:** Working Drip SMS Day 10  
**Message:**
```
Hey {{contact.first_name}}, I just realized you're the only client who I haven't been able to set up with a cash, as is offer. When is a good time for me to give you a call, I only need a few minutes to put it together? - {{user.first_name}}
```
**Character Count:** 241 characters | 47 words

---

### Wait (After Day 10)
**Duration:** 3 days

---

### Working Drip SMS Day 11
**Action Name:** Working Drip SMS Day 11  
**Message:**
```
Hey... Sorry for bothering you, it's {{user.first_name}} here, but you probably don't want to sell any of your properties...
```
**Character Count:** 122 characters | 19 words

---

### Wait (After Day 11)
**Duration:** 2 days

---

### Working Drip SMS Day 12
**Action Name:** Working Drip SMS Day 12  
**Message:**
```
Hey it's {{user.first_name}} again being annoying if you don't want to sell {{contact.company_name}}, please just let me know - Thanks
```
**Character Count:** 134 characters | 20 words

---

### Wait (After Day 12)
*(Duration varies)*

---

### Working Drip SMS Day 13
**Action Name:** Working Drip SMS Day 13  
**Message:**
```
Hey {{contact.first_name}}. Are you currently looking to offload your property? If so, you can text or call me. We're here to make it very easy! - {{user.first_name}}.
```
**Character Count:** 167 characters | 27 words

---

## SOFT CHECK IN EMAIL

**Action Name:** Soft Check In Email  
**From Name:** Kyle Barks  
**From Email:** kbarks@newagainhouses.com  
*(Subject and body not fully extracted)*

---

### Wait (After Day 13 / Soft Check In Email)
**Duration:** 1 day

---

### Working Drip SMS Day 14
**Action Name:** Working Drip SMS Day 14  
**Message:**
```
At this point I think I have lost you... Typically this means you aren't interested in selling {{contact.company_name}}, let me know. - Thanks, {{user.first_name}}
```
**Character Count:** 163 characters | 24 words  
*Note: Final "breakup" message before extended drip*

---

## EXTENDED DRIP (Day 14+)

The workflow continues beyond Day 14 with additional steps:
- Working Drip SMS Day 24
- Close File Email
- Additional wait and SMS steps

*(Content for these steps not fully extracted)*

---

## CUSTOM FIELDS REFERENCE

| Field | Description |
|-------|-------------|
| `{{user.first_name}}` | Assigned user's first name |
| `{{contact.first_name}}` | Lead's first name |
| `{{contact.company_name}}` or `(( contact.company_name ))` | Property address |
| `Source` | Lead source field (dialer, sms, texts, forms) |

---

## NOTES

1. **Message Tone:** Casual, conversational, relationship-focused
2. **Breakup Messages:** Used at Day 2 and Day 14 to create urgency
3. **Branch-Specific Messages:** Form leads get more detailed initial messages (they actively filled out forms); Dialer/SMS leads get shorter follow-ups
4. **Email Sender:** All emails from Kyle Barks (kbarks@newagainhouses.com)
5. **Variable Syntax:** Mix of `{{field}}` and `(( field ))` syntax used for property address
6. **Wait Timing Pattern:**
   - Early drip: 1-2 day waits
   - Mid drip: Mix of hours (6h) and days (1-3 days)
   - Late drip: 2-3 day waits

---

## EMAIL BODY CONTENT (All emails from Kyle Barks / kbarks@newagainhouses.com)

### Email 1: Time to Connect Email (Day 0, after Day 0 SMS — all 4 branches)
**Subject:** You're looking to sell {{contact.company_name}}? Let's connect!
**Body:**
```
Hi {{contact.first_name}},

I saw that you're looking to sell {{contact.company_name}} and wanted to reach out. We buy houses in any condition and can make you a fair cash offer with no repairs, no agent fees, and a hassle-free closing.

Would you be open to a quick call to discuss your options? You can also learn more about how we work at New Again Houses (https://newagainhouses.com).

Best, Kyle Barks New Again Houses
```

### Email 2: Still Interested Email (Day 1, after Day 1 SMS — all 4 branches)
**Subject:** Still interested in selling {{contact.company_name}}?
**Body:**
```
Hi {{contact.first_name}},

I know selling a house can feel overwhelming, but we make it simple. We handle everything—from paperwork to closing—so you can move on without the hassle.

Would you be open to a quick chat to see if we're a good fit? You can also check out how our process works at New Again Houses (https://newagainhouses.com).

Best, Kyle
```

### Email 3: Trust Building Email (Day 2, after Day 2 SMS — all 4 branches)
**Subject:** We just bought a house like yours—want to hear how?
**Body:**
```
Hi {{contact.first_name}},

We recently helped a homeowner sell their house quickly and stress-free, and I'd love to see if we can do the same for you. No obligations—just a simple, straightforward conversation about your options.

Let me know if you're open to chatting! You can also explore more at New Again Houses (https://newagainhouses.com).

Best, Kyle
```

### Email 4: Great Time to Sell Email (Day 6, same time as Day 6 SMS)
**Subject:** It could be a great time to sell {{contact.company_name}}
**Body:**
```
Hi {{contact.first_name}},

I wanted to check in because home values are still strong, and we're actively buying properties in your area. If you're still considering selling, now might be the best time to get the most for your house.

Would you be open to a quick chat? You can also get more details on our simple selling process at New Again Houses (https://newagainhouses.com).

Best, Kyle
```

### Email 5: Soft Check In Email (Day 13, same time as Day 13 SMS)
**Subject:** Just following up—still thinking about selling?
**Body:**
```
Hi {{contact.first_name}},

I haven't heard back and just wanted to check in. If selling {{contact.company_name}} is still on your mind, I'd love to help. If not, no worries—just let me know either way!

Best, Kyle
```

### Post-Day 14 Emails (extracted from workflow tree, content TBD or same pattern)

**Email 6: Close File Email** (Day 24, after Day 24 SMS)
- Subject/body: TBD — need to extract

**Email 7: Stay in Touch Email** (Day 34, after Day 34 SMS)
- Subject/body: TBD — need to extract

**Email 8: Final Soft Offer Email** (Day 44, after Day 44 SMS)
- Subject/body: TBD — need to extract

---

## COMPLETE WORKFLOW TIMELINE (Days 0-104)

| Day | SMS | Email | Wait After |
|-----|-----|-------|------------|
| 0 | Day 0 SMS (branch-specific) | Time to Connect Email | — |
| 0.5 | Day .5 SMS (branch-specific) | — | 6h-1d |
| 1 | Day 1 SMS (branch-specific) | Still Interested Email | 1-3d |
| 2 | Day 2 SMS (breakup, branch-specific) | Trust Building Email | — |
| 3 | Day 3 SMS | — | 4d wait before |
| 4 | Day 4 SMS | — | 1d |
| 5 | Day 5 SMS | — | 6h |
| 6 | Day 6 SMS | Great Time to Sell Email | 6h |
| 7 | Day 7 SMS | — | 3d |
| 8 | Day 8 SMS | — | 1d |
| 9 | Day 9 SMS | — | 3d |
| 10 | Day 10 SMS | — | 1d |
| 11 | Day 11 SMS | — | 3d |
| 12 | Day 12 SMS | — | 2d |
| 13 | Day 13 SMS | Soft Check In Email | 1d |
| 14 | Day 14 SMS (breakup) | — | 11d |
| 24 | Day 24 SMS | Close File Email | 22d |
| 34 | Day 34 SMS | Stay in Touch Email | 14d |
| 44 | Day 44 SMS | Final Soft Offer Email | 14d |
| 54 | Day 54 SMS | — | 10d |
| 74 | Day 74 SMS | — | 31d |
| 104 | Day 104 SMS | — | END |

---

## EXTRACTION NOTES

- Email body content extracted 2026-02-17 via browser snapshot of GHL workflow editor
- All 5 first-14-day emails confirmed: Quick Compose mode, Verdana 16px
- All emails link to https://newagainhouses.com
- Post-Day 14 email bodies still need extraction (3 remaining: Close File, Stay in Touch, Final Soft Offer)
- Wait step exact durations visible via badge numbers on nodes
- Workflow is Published (Draft/Publish toggle shows Published)

---

*Extracted from GHL workflow builder at: https://app.gohighlevel.com/location/hmD7eWGQJE7EVFpJxj4q/workflow/20fc8111-db0a-46af-a264-099446be46d3*
