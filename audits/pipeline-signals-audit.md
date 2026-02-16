# Pipeline Signals Audit — Side-by-Side Analysis
**Date:** Feb 15, 2026
**Source:** Gunner Signals page + GHL pipeline verification

---

## Current Signals: 21 Active (10 Missed / 8 At Risk / 3 Worth a Look)

### MISSED (10 signals)

| # | Contact | Rule | Description | Accurate? | Notes |
|---|---------|------|-------------|-----------|-------|
| 1 | Shirley Brackett | Seller Stated Price — No Follow Up | Kyle Barks called, she stated a price, no follow-up in 48h | ⚠️ VERIFY | Need to check if follow-up happened outside Gunner's view |
| 2 | Pat Anderson | New Lead — No Call in 15 Min | Entered pipeline at 1:19 AM today | ❌ FALSE POSITIVE | She's a re-created lead with prior history (said "Yes" in Dec). Not a new lead. |
| 3 | Richard Jeronimus | New Lead — No Call in 15 Min | PPL lead, no call | ⚠️ WEEKEND | Created ~Sat, team doesn't work weekends |
| 4 | Eugene Bradley | New Lead — No Call in 15 Min | PPL lead, no call | ⚠️ WEEKEND | Same — weekend lead |
| 5 | Kenneth Crozier | New Lead — No Call in 15 Min | PPL lead, no call | ⚠️ WEEKEND | Same |
| 6 | Tt Slow | New Lead — No Call in 15 Min | PPL lead, no call | ⚠️ WEEKEND | Also suspicious name — test contact? |
| 7 | Mister Seller | New Lead — No Call in 15 Min | PPL lead, no call | ⚠️ WEEKEND | Name is clearly a test/placeholder |
| 8 | Tracie Gulas | New Lead — No Call in 15 Min | PPL lead, no call | ⚠️ WEEKEND | First duplicate |
| 9 | Tracie Gulas | New Lead — No Call in 15 Min | PPL lead, no call | 🐛 DUPLICATE | Same person, same rule — dedup bug |
| 10 | Patsy Buckner | New Lead — No Call in 15 Min | PPL lead, no call | ⚠️ WEEKEND | Same |

**MISSED verdict:** 
- 1 false positive (Pat Anderson is recycled, not new)
- 1 duplicate bug (Tracie Gulas appears twice)
- 7 are technically correct but all weekend leads — team doesn't work weekends, so these aren't actionable until Monday
- **Missing weekend awareness** — signals should note "weekend lead, SLA starts Monday 8 AM"

### AT RISK (8 signals)

| # | Contact | Rule | Description | Accurate? | Notes |
|---|---------|------|-------------|-----------|-------|
| 1 | Sang Im | Seller Gave Timeline | 2-4 month timeline, no next step locked in (Daniel) | ✅ ACCURATE | Good catch — timeline given, no follow-up date set |
| 2 | Greg Bullock | Motivated Seller — Only 1 Call | Showed motivation, only 1 call (Chris) | ✅ ACCURATE | Chris has lowest scores, likely needs nudge |
| 3 | Genevieve Kilga | Motivated Seller — Only 1 Call | Motivated, no follow-up in 72h (Daniel) | ✅ ACCURATE | |
| 4 | William Thompson | Motivated Seller — Only 1 Call | Motivated, no follow-up in 72h (Daniel) | ✅ ACCURATE | Has appointment Feb 16 — signal should know this |
| 5 | Micah Hensley | Walkthrough Done — No Offer Sent | Walkthrough done, no offer in 24h (Kyle) | ⚠️ MAYBE | Has appointment Feb 16, 8 AM — may be the offer appointment |
| 6 | Elsa Robinson | Motivated Seller — Only 1 Call | Motivated, 71h no follow-up (Chris) | ✅ ACCURATE | |
| 7 | Mary Porter | Motivated Seller — Only 1 Call | Motivated, **144 hours** no follow-up (Chris) | 🚨 CRITICAL | 6 DAYS with no follow-up after motivation signals |
| 8 | Deborah Longley | Stale in Active Stage | Pending Apt for 5 days, no activity for 120h (Daniel) | ✅ ACCURATE | Pending for 5 days = something broke |

**AT RISK verdict:**
- 7/8 accurate and actionable
- Micah Hensley is borderline — has upcoming appointment, signal may be premature
- **William Thompson has a Feb 16 appointment but signal doesn't know it** — signals should cross-reference calendar
- Mary Porter at 144h is the worst — this should have been MISSED tier, not At Risk

### WORTH A LOOK (3 signals)

| # | Contact | Rule | Description | Accurate? | Notes |
|---|---------|------|-------------|-----------|-------|
| 1 | John Smith | Active Engagement in Follow Up | In 4 Month Follow Up, showing engagement | ✅ ACCURATE | |
| 2 | James Hall | Active Engagement in Follow Up | In 4 Month Follow Up, said **"text me an offer"** | 🚨 UPGRADE TO MISSED | This is a HOT signal — seller literally asked for an offer |
| 3 | Cathie Cooper | Callback Requested — None Made | Requested callback, 78h no response (Daniel) | ✅ ACCURATE | |

**WORTH A LOOK verdict:**
- James Hall is **massively undertiered** — "text me an offer" should be MISSED (urgent), not Worth a Look
- Cathie Cooper at 78h with no callback is also borderline At Risk

---

## Signals That Should Exist But Don't

| Contact | What's Happening | Rule That Should Catch It |
|---------|------------------|--------------------------|
| Amanda Hargrove | 32 days in pipeline, ZERO activity, assigned to Chris | Rule 5 (SLA) or Watchdog — but she's not new, she's just abandoned |
| Pat Anderson | Said "Yes" to selling in Dec, was marked LOST | Rule 9 (DQ'd Lead Had Selling Signals) |
| Multiple leads | DND enabled on all channels | No DND detection rule exists |

---

## Accuracy Summary

| Tier | Total | Accurate | False Positive | Undertiered | Bugs |
|------|-------|----------|----------------|-------------|------|
| Missed | 10 | 7 (weekend-correct) | 1 (Pat Anderson) | — | 1 (Tracie duplicate) |
| At Risk | 8 | 7 | — | 1 (Mary Porter should be Missed) | — |
| Worth a Look | 3 | 1 | — | 2 (James Hall, Cathie Cooper) | — |
| **Total** | **21** | **15 (71%)** | **1 (5%)** | **3 (14%)** | **1 (5%)** |

**Overall Signal Accuracy: ~71%**
- Good at detecting stale/SLA issues
- Weak at tiering urgency (seller said "text me an offer" = Worth a Look??)
- Missing weekend awareness entirely
- Missing calendar cross-reference (flags appointments that exist)
- Dedup bug (Tracie Gulas)
- Missing DND detection

---

## Top Recommendations

1. **Fix tiering logic** — "text me an offer" should auto-promote to MISSED
2. **Add weekend pause** — Don't fire SLA signals on Sat/Sun, queue for Monday
3. **Cross-reference calendar** — If lead has upcoming appointment, suppress or note it
4. **Fix dedup** — Tracie Gulas appears twice
5. **Add DND rule** — Flag pipeline leads with DND on all channels
6. **Detect recycled leads** — Pat Anderson isn't new, she has 7 months of history
7. **Mary Porter escalation** — 144h is too long for At Risk, needs auto-escalation
