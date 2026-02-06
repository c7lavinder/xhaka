# Coaching Bot Add-on

**Product Name:** Coaching Bot
**Price:** $49/mo
**Status:** 🔨 Designing

## Purpose

On-demand situational coaching for LMs and AMs. When a rep hits a tricky objection or scenario, they can query the bot and get an instant response based on your playbook. Train the playbook once, the agent delivers it repeatedly.

---

## Agents

| Agent | Role | Responsibility |
|-------|------|----------------|
| **Coach Coordinator** | Lead | Receives coaching requests, routes to right resource |
| **Objection Handler** | Worker | Matches seller objection to playbook, suggests response |
| **Script Assistant** | Worker | Pulls relevant script sections based on call stage |
| **Scenario Advisor** | Worker | Handles edge cases not in scripts (probate, divorce, etc.) |
| **Playbook Updater** | Worker | Logs new objections/situations, suggests playbook additions |

---

## How Reps Use It

### Option 1: Text Query (Mid-Call)
Rep texts the bot while on a call:
```
Rep: "seller says price is too low"
Bot: "Try: 'I understand. Help me understand what 
     number would work for you?' Then use the 
     bracketing technique..."
```

### Option 2: Pre-Call Prep
Rep asks before calling:
```
Rep: "inherited property, out of state owner, what should I focus on?"
Bot: "Key angles for inherited properties:
     1. Timeline pressure (probate, carrying costs)
     2. Emotional distance (they don't want to deal with it)
     3. Convenience value (we handle everything)
     Opening: 'I know dealing with inherited property 
     can be overwhelming, especially from out of state...'"
```

### Option 3: Post-Call Debrief
Rep asks after a tough call:
```
Rep: "seller got angry when I mentioned we're investors, how do I handle that?"
Bot: "This is the 'investor objection.' Next time try:
     'I get it - you've probably had bad experiences. 
     We're different because [specific differentiator]...'
     Want me to add this to your practice scenarios?"
```

---

## ⚠️ RULES TO VERIFY - Corey please confirm

### Playbook Sources

Where does the coaching content come from?

| Source | Status | Notes |
|--------|--------|-------|
| Skool course content | ✅ Have it | 130KB+ of scripts, objections, processes |
| Objection library | ✅ Have it | 12,416 words in skool-modules/objection-library.md |
| Gunner call recordings | 🔨 Can analyze | Learn from actual successful calls |
| Your direct input | Ongoing | New scenarios you want to add |

**Is the Skool content the primary source? Anything else to include?**

---

### Objection Categories (from your playbook)

| Category | Examples |
|----------|----------|
| **Price Objections** | "That's too low", "I want retail", "Other company offered more" |
| **Timeline Objections** | "I'm not ready yet", "I need more time", "Maybe next year" |
| **Trust Objections** | "How do I know you're legit?", "I've been burned before" |
| **Process Objections** | "I want to list it", "I need to talk to my spouse" |
| **Motivation Blockers** | "I'm just looking", "Not really motivated" |

**Are these the main categories? Any missing?**

---

### Coaching Delivery Channel

How should reps query the bot?

| Channel | Pros | Cons |
|---------|------|------|
| **Telegram bot** | Fast, familiar | Separate from CRM |
| **GHL conversation** | In CRM, logged | Slower? |
| **Slack/Teams** | Team visibility | Need to set up |
| **Gunner integration** | Native, tied to calls | Need Manus to build |

**What's your preference?**

---

### Response Style

How should the bot respond?

| Style | Example |
|-------|---------|
| **Quick script** | "Try: 'I understand. What number would work for you?'" |
| **Detailed breakdown** | Full explanation of technique + script + examples |
| **Roleplay offer** | "Want to practice this? I'll play the seller." |

**Default to quick scripts with option to expand?**

---

### Who Can Access

| Role | Access Level |
|------|--------------|
| LMs (Daniel, Chris) | Full - all objections, scripts, scenarios |
| AM (Kyle) | Full - plus offer/negotiation specific |
| Dispo (Esteban) | Limited - buyer-side scripts only? |

**Same playbook for everyone or role-specific?**

---

## Integration with Gunner

**Future enhancement:** After a call is graded in Gunner, Coaching Bot can:
1. See what objections came up
2. See how rep handled them
3. Suggest improvements
4. Track if rep improves on that objection over time

This creates a feedback loop: Gunner grades → Coaching Bot trains → Gunner measures improvement.

---

## Sample Interaction

```
DANIEL: seller keeps saying she needs to talk to her husband first

COACHING BOT: Classic "spouse objection" - usually means she's 
interested but needs cover. Try:

"Absolutely, that makes sense. Most of our sellers want 
to talk it over. Quick question - if your husband was 
sitting here right now, what do you think he'd want to 
know about the offer?"

This gets her to voice his likely objections so you can 
address them now.

If she's firm: "No problem. When would be a good time 
for me to call back when you're both available?"

---
From: Objection Library > Process Objections > Spouse
Want more detail? Reply "more"
```

---

## Playbook Structure

```
/coaching-playbook/
  /objections/
    price-too-low.md
    want-retail.md
    other-offer-higher.md
    not-ready-yet.md
    need-to-think.md
    spouse-decision.md
    investor-distrust.md
    want-to-list.md
    ...
  /scenarios/
    inherited-property.md
    divorce-situation.md
    pre-foreclosure.md
    tired-landlord.md
    code-violations.md
    out-of-state-owner.md
    ...
  /scripts/
    lm-intro.md
    lm-qualification.md
    am-offer-presentation.md
    am-negotiation.md
    ...
```

---

## Tenant Configuration

```json
{
  "tenantId": "tenant_xxx",
  "addOn": "coaching",
  "config": {
    "deliveryChannel": "telegram",
    "responseStyle": "quick_with_expand",
    "roleAccess": {
      "lm": ["objections", "scenarios", "scripts"],
      "am": ["objections", "scenarios", "scripts", "negotiation"],
      "dispo": ["buyer_scripts"]
    },
    "playbookSource": "skool_content",
    "gunnerIntegration": true,
    "trackImprovements": true
  }
}
```

---

## Next Steps

1. **Corey confirms rules above** ✋ WAITING
2. Structure the playbook from Skool content
3. Write agent system prompts
4. Set up delivery channel
5. Test with real scenarios from the team
