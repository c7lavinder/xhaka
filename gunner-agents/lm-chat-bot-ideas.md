# Bot Ideas from LM Team Chat Analysis

*Source: LM Team Space (Google Chat) — Feb 3-13, 2026*

---

## Patterns Observed → Bot Opportunities

### 1. **Lead Summary Auto-Poster Bot** (LM Assistant enhancement)
**Pattern:** Daniel and Chris manually type detailed lead summaries into Google Chat after every qualification call — property details, seller motivation, pricing expectations, timeline, decision makers, condition notes. These are long, structured posts that follow a consistent format.

**Bot:** After an LM finishes a call graded in Gunner, auto-generate a structured lead summary from the call transcript and post it to the team chat (or Gunner feed). LM reviews/edits before posting. Saves 10-15 min per lead.

---

### 2. **Scheduling Coordinator Bot** (Appointment Bot enhancement)
**Pattern:** Constant back-and-forth about scheduling:
- "Can we move this to offer tomorrow?"
- "Brian is out of town Thursday/Friday — can we move to Wednesday?"
- "2 PM CST would work best"
- "I penciled it in for tomorrow — it's about 30 min away from Lewisburg"
- Kyle and Daniel negotiating walkthrough vs offer call timing
- Rescheduling due to cancellations (Deborah canceled, Lourie has chemo)

**Bot:** Knows Kyle/Brian's availability, travel distance to properties, and automatically suggests optimal times. When LM sets appointment, bot checks AM calendar conflicts and flags issues before they happen. Handles reschedules automatically.

---

### 3. **Pipeline Hygiene Nudge Bot** (Data Hygiene enhancement)
**Pattern:** Corey had to manually message: "Hey guys, on Monday can we update these columns... only 2 of them have appts scheduled so lets get them moved down funnel or back to pending" — with a screenshot of stale pipeline stages.

**Bot:** Daily scan of pipeline stages. If leads sit in "Appointment Scheduled" or "Walkthrough" for >48h without activity, auto-nudge the assigned LM: "Hey, [property] has been in [stage] for 3 days — should this move to offer or back to pending?" Removes need for Corey to police the pipeline.

---

### 4. **Address Verification Bot** (Data Hygiene enhancement)
**Pattern:** Jessica flagged: "Chris you have to tell me when there's another address added to the lead — this one is not in MS." Corey corrected: "Cameron Ray is in MasterSuite but it is Karen Ray." Address mismatches between GHL and MasterSuite cause confusion.

**Bot:** When a new property is added or lead moves to qualification, auto-verify the address exists in MasterSuite. If not found or fuzzy match detected, flag it immediately. Cross-reference GHL contact address with MasterSuite entry.

---

### 5. **Walkthrough vs Offer Decision Bot** (AM Assistant / Lead IQ enhancement)
**Pattern:** Repeated decisions about whether to do walkthrough vs just offer call:
- "That is not worth a walkthrough, we are 200k off his price"
- "Can this be a walkthrough? Really needs to be walkthrough"
- "Would really like the Walland house to be a walkthrough as well"
- Distance considerations ("35 min from Chattanooga", "50 min away")

**Bot:** When LM qualifies a lead, auto-calculate: (1) price gap between asking and likely offer, (2) drive distance from AM's base, (3) property characteristics. Recommend walkthrough vs offer call with reasoning. Flag to Corey/Kyle when borderline.

---

### 6. **Follow-Up Persistence Tracker** (Follow Up Bot enhancement)
**Pattern:** Chris tried calling a seller 4 times with no luck. Kyle said "if we can get him on the phone tomorrow, just move that over to an offer." Leads go cold when contact attempts fail and there's no systematic follow-up.

**Bot:** Track contact attempts per lead. After X failed attempts, auto-suggest next action (try different time, send text, move to offer, or park in follow-up). Prevent leads from falling through cracks between "I'll try again" and actually trying again.

---

### 7. **Process Compliance Bot** (Team Training / Signals enhancement)
**Pattern:** Corey sends process corrections via chat:
- "If someone says wrong number, delete the opportunity do not move it to DNW"
- "Chris, make sure to flip it back to stage 1 in MasterSuite when you get a follow up lead"
- These rules get buried in chat history and new team members won't see them

**Bot:** Maintain a living rule book. When a pipeline action is taken that violates a known rule (e.g., moving wrong number to DNW instead of deleting), auto-flag it. Also: digest Corey's chat corrections into the rule book automatically.

---

### 8. **Seller Re-engagement Bot** (Follow Up Bot / Signals enhancement)
**Pattern:** Several leads had sellers who previously declined but came back:
- Jason (Cecil OH) — declined $60K in January, came back in February ready to accept
- Multiple leads with "not in a rush" sellers who might convert with proper nurture

**Bot:** Track declined offers with reasons. Set intelligent re-engagement timelines based on seller's stated situation (e.g., "mom in hospice — check back in 60 days", "waiting on title transfer — follow up next month"). Auto-trigger outreach when timing is right.

---

### 9. **Short Sale / Special Situation Advisor** (Lead IQ enhancement)
**Pattern:** Daniel flagged: "New scenario to me — property occupied by squatters, seller upside down on mortgage, would need to be a short sale." Team encounters unusual scenarios they haven't handled before.

**Bot:** When LM notes indicate special situations (short sale, squatters, liens, probate, divorce, multiple parcels), auto-surface relevant playbook content and flag for senior team review. Help LMs handle edge cases they've never seen.

---

### 10. **MasterSuite Integration Bot** (Underwriting support)
**Pattern:** Kyle shares MasterSuite analysis links for properties. Team references MasterSuite for comps and property data. Currently manual process.

**Bot:** When a lead moves to offer stage, auto-pull MasterSuite data (if available) and attach to the opportunity. Surface ARV, comp analysis, and repair estimates alongside the lead summary.

---

## Priority Ranking (by frequency/impact in chat)

1. **Lead Summary Auto-Poster** — happens every single call, massive time save
2. **Scheduling Coordinator** — constant friction point, multiple messages per day
3. **Pipeline Hygiene Nudge** — Corey shouldn't have to police this manually
4. **Walkthrough vs Offer Decision** — recurring judgment call that can be data-driven
5. **Follow-Up Persistence Tracker** — leads falling through cracks = lost revenue
6. **Process Compliance** — rules getting buried in chat = repeated mistakes
7. **Address Verification** — data quality issue causing confusion
8. **Seller Re-engagement** — money left on table from declined offers
9. **Short Sale Advisor** — less frequent but high-value when it happens
10. **MasterSuite Integration** — nice-to-have, reduces manual lookups

---

## Notes
- Chat is 80% structured lead summaries from Daniel/Chris → huge automation opportunity
- Jessica acts as process enforcer (checking GHL unreads, flagging data issues) → her role gets augmented, not replaced
- Kyle's messages are almost all scheduling coordination → biggest time save for AM
- Corey's messages are almost all process corrections and strategic decisions → compliance bot frees him up
