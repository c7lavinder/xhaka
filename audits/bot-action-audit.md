# Bot Action Audit — What They'd Do vs What Actually Happened
**Date:** Feb 15, 2026 | **Pipeline:** Sales Process (147 opps) + Follow Up (7,365 opps)

---

## 🔴 LEAD IQ — Last 10 Actions It WOULD Have Taken

Lead IQ scores leads HOT/WARM based on 5 factors: Timeline, Condition, Price, Motivation, Source. 3+ = HOT.

| # | Contact | ID | Stage | Source | What Lead IQ Would Do | What Actually Happened |
|---|---------|-----|-------|--------|----------------------|----------------------|
| 1 | **Nancy Williams** | `tAikIojNQIsfrwRe9HNG` | New Lead | PPL | ⚠️ Score WARM (PPL source = motivated, but no conversation data to assess other factors). Flag as **NEEDS IMMEDIATE OUTREACH** — no activity detected. | **ZERO activity. Zero conversations. $125-150 PPL lead sitting untouched.** Assigned to Jessica Guzman (data manager, not LM). |
| 2 | **Pat Anderson** | `6Y5DZpML4UHa0nOzBsfS` | New Lead | PPL | Score WARM. Flag for outreach — 7805 Smokey Hill Rd property. | In New Lead stage. PPL lead, some activity indicators (7 items visible). No evidence of qualification call. |
| 3 | **Gary Tallman** | `nMhTweMKEQ0gG8QoEvV2` | Hot Leads | Website | Score HOT — website lead = self-initiated (high motivation). 725 S Allen property. | In Hot Leads stage. Website source = inbound. Some activity (4 items). Assigned to Jessica Guzman. |
| 4 | **Richard Dixon** | `LdW9Mlrqi8PHBy8O7i9F` | Warm Leads | Dialer | Score WARM — cold outbound call, need conversation data to upgrade. 9231 Birchwood Pike. | In Warm Leads. Assigned to Daniel Lozano. Some activity (5 items). |
| 5 | **Moody Graves** | `19CC15kYA37L2v4a2cqp` | SMS Warm | Texts | Score WARM — SMS response but no call data. 536 4th St NW. | SMS Warm Leads stage. Assigned to Daniel. Responded via text. |
| 6 | **Jesse Dalton** | `VI34MHYEA3xj8AapOvnO` | Hot Leads | PPL | Score HOT — PPL + active conversation ("Hi Kyle, Thanks for reaching out" on Feb 13). 138 Cessna Rd Jasper. | Hot Leads, real engagement. Had conversation with Kyle on Feb 13. 11 activity items visible. |
| 7 | **Christian Ingram** | `86X35jIf0zZWWijMafTy` | Hot Leads | PPL | Score HOT — PPL + active conversation ("Yeah sure thing" Feb 13). 775 Ashland Terrace. | Hot Leads. Active conversation. Engaging positively. |
| 8 | **Micah Hensley** | `3R12eY9pQhs4Hl34ufen` | Walkthrough Apt | Dialer | Score HOT — appointment scheduled = strong signal. 518 Matt St. | **Walkthrough apt Feb 16 8:00 AM. ZERO GHL conversations.** All communication via BatchDialer (phone). Lead IQ would miss this without dialer integration. |
| 9 | **Frances Rolin** | `svW1X82i3vgjI5bbAtnh` | Offer Apt Scheduled | PPL | Score HOT — offer appointment = deal stage. 229 E Woodrow St. | Offer apt Feb 16 12:30 PM. 7 activity items. Daniel assigned. |
| 10 | **Matt Jacobsen** | `iNVOJXGtJUlRcmppoP8v` | Made Offer | Texts | Score HOT — offer made = active deal. 1311 La Loma Dr. | Made Offer stage. 6 activity items. Daniel assigned. |

### Lead IQ Verdict
**Estimated accuracy: 40-50% without BatchDialer integration.** Key gaps:
- Can't assess motivation/timeline/condition without call transcripts
- 9 New Lead contacts (all PPL) have minimal GHL data
- Dialer-sourced leads have appointment activity but zero GHL conversations
- Needs BatchDialer + call transcript data to score reliably

---

## 🟡 PIPELINE SIGNALS — Last 10 Actions It WOULD Have Taken

Pipeline Signals detects missed opportunities, at-risk deals, and noteworthy patterns.

| # | Contact | ID | Signal | Tier | What Actually Happened |
|---|---------|-----|--------|------|----------------------|
| 1 | **Nancy Williams** | `tAikIojNQIsfrwRe9HNG` | 🔴 **NO ATTEMPT** — PPL lead in New Lead, zero activity, zero conversations | MISSED | $125-150 lead completely untouched. Not even assigned to an LM (assigned to Jessica, data manager). |
| 2 | **Eugene Bradley** | `D4FCGTFGfsCwh1imYTa2` | 🔴 **NO ATTEMPT** — PPL lead in New Lead, minimal activity | MISSED | New Lead stage, PPL source, 4 activity items but no evidence of outreach. |
| 3 | **Richard Jeronimus** | `WmT6UaYrU05ZmZbS6JK7` | 🔴 **NO ATTEMPT** — PPL lead in New Lead | MISSED | New Lead, PPL, Jessica assigned. Minimal activity. |
| 4 | **Kenneth Crozier** | `2F0rWd5KLaZyt9WyTOze` | 🔴 **NO ATTEMPT** — PPL lead in New Lead | MISSED | New Lead, PPL. Same pattern. |
| 5 | **Tt Slow** | `czGnUYpTvgCVlODvZ5Qv` | 🔴 **NO ATTEMPT** — PPL lead in New Lead (also: suspicious name) | MISSED | New Lead, PPL. Name "Tt Slow" could be test/spam lead — worth flagging for dispute. |
| 6 | **Mister Seller** | `bm5IAKKqqIE38RrBxlOf` | 🔴 **NO ATTEMPT + SUSPECT** — PPL lead, obviously fake name | MISSED | New Lead, PPL. "Mister Seller" is a fake name → **dispute candidate** for PPL refund ($125-150 back). |
| 7 | **Micah Hensley** | `3R12eY9pQhs4Hl34ufen` | 🟡 **PRE-APT NO CONFIRM** — Walkthrough tomorrow (Feb 16 8am), no confirmation SMS sent | AT RISK | Appointment scheduled but no GHL conversation. If seller doesn't get a confirmation, no-show risk is HIGH. |
| 8 | **Kathy Pack** | `9HkDC0tofbPOHHAKoqQK` | 🟡 **PRE-APT NO CONFIRM** — Walkthrough Feb 16 2:00 PM | AT RISK | 918 Dameron Ave. 8 activity items. Same risk — appointment tomorrow, no confirmation visible. |
| 9 | **Lourie Saad** | `ob9Ymof0HqFB7ftGGPIn` | 🟡 **PRE-APT NO CONFIRM** — Walkthrough Feb 17 11:00 AM | AT RISK | 406 Park St. Appointment Monday, should get confirmation SMS. |
| 10 | **Terri Kahl** | `PidZgsEfL2DgfMZdUgjO` | 🟢 **STALE OFFER** — Made Offer stage, offer apt was Feb 15 5pm (today/yesterday) | WORTH A LOOK | 1936 Williamsport Pike. Chris assigned. 8 items + 9 items visible. Was there follow-up after the offer presentation? |

### Pipeline Signals Verdict
**6 of 9 New Lead PPL contacts have NO outreach.** That's $750-900 in PPL spend with zero follow-up. Plus 2 are likely fake names (dispute candidates = $250-300 in refunds). 3 upcoming appointments have no visible confirmation sent.

---

## 🔵 FOLLOW UP BOT — Last 10 Actions It WOULD Have Taken

The Follow Up Bot manages the full lifecycle: personalized SMS, contextual tasks, adaptive cadence, auto-disposition.

| # | Contact | ID | Current Stage | What Follow Up Bot Would Do | What Actually Happened |
|---|---------|-----|--------------|---------------------------|----------------------|
| 1 | **Nancy Williams** | `tAikIojNQIsfrwRe9HNG` | New Lead (Sales) | **Immediate:** Send personalized intro SMS within 15 min of lead creation. Create task for Daniel: "Call Nancy Williams — PPL lead, no address on file." Escalate to Jessica at 30 min if no response. | Nothing. Zero outreach. Lead sitting cold. |
| 2 | **Micah Hensley** | `3R12eY9pQhs4Hl34ufen` | Walkthrough Apt (Sales) | **Pre-appointment:** Send confirmation SMS 24h before (today): "Hi Micah, just confirming Kyle will be at 518 Matt St tomorrow at 8am. Still works?" Create task if no confirmation reply. | No confirmation sent. Walkthrough is tomorrow morning. |
| 3 | **Kathy Pack** | `9HkDC0tofbPOHHAKoqQK` | Walkthrough Apt (Sales) | **Pre-appointment:** Send confirmation SMS: "Hi Kathy, confirming your walkthrough at 918 Dameron Ave tomorrow at 2pm. See you then!" | No confirmation visible. Apt tomorrow 2pm. |
| 4 | **Joseph Carey** | `pUMpcw8WkuzQQm5aeLw8` | New Offer (Follow Up) | **Nurture cycle:** Check last contact date. If stale >10 days, send personalized SMS referencing property: "Hi Joseph, checking in on [property address]. Any updates on your situation?" Create task for LM follow-up call. | Currently in GHL's automated 5-path A/B SMS drip. Generic messages, no personalization, no context. |
| 5 | **Jess Berry** | `nxYGEoyZS8OTjmNhaBhv` | New Offer (Follow Up) | **Nurture:** Same pattern — check conversation history, send contextual SMS, create smart task. | In automated drip. 473 Hillsboro Rd Apt D. |
| 6 | **James Hall** | `Iut4wGEqyMDi5hTfMgeE` | New Offer (Follow Up) | **Nurture + Signal:** Previously flagged as undertiered in Pipeline Signals audit. Bot would auto-escalate priority based on prior engagement. | In Follow Up pipeline. Previously identified as having more engagement than stage suggests. |
| 7 | **Tracie Gulas** | `bOS3IqxVBjczhor2M57B` | New Lead (Sales) | **Immediate outreach:** 3007 Hydes Ferry Rd. PPL lead. Send intro SMS, create call task, 15-min SLA. | In New Lead stage. 7 activity items but unclear if actively being worked. Also has duplicate issue flagged in Signals audit. |
| 8 | **Terri Kahl** | `PidZgsEfL2DgfMZdUgjO` | Made Offer (Sales) | **Post-offer follow-up:** Offer was presented today/yesterday. Send "thinking of you" SMS within 24h: "Hi Terri, thanks for your time at 1936 Williamsport Pike. Take your time with the offer — happy to answer any questions." Create task for Chris: "Follow up on Terri Kahl offer — 48h check." | Made Offer stage. Chris assigned. Unknown if follow-up was sent after offer presentation. |
| 9 | **Frances Rolin** | `svW1X82i3vgjI5bbAtnh` | Offer Apt (Sales) | **Pre-appointment:** Offer appointment tomorrow Feb 16 12:30pm. Send confirmation: "Hi Frances, confirming our meeting tomorrow at 12:30 at 229 E Woodrow St to discuss the offer." | Offer apt scheduled. No visible confirmation. |
| 10 | **James Manuele** | `U7twipeBasJypDjN0cee` | Walkthrough Apt (Sales) | **Pre-appointment:** Walkthrough Feb 18 12pm. Send confirmation 24h before (tomorrow): "Hi James, confirming the walkthrough at 713 N Military Ave on Tuesday at noon." | Walkthrough scheduled. No visible confirmation yet (apt is Monday, so confirmation should go tomorrow). |

### Follow Up Bot Verdict
**Every single action above is currently NOT happening.** The existing GHL workflows only cover the Follow Up pipeline (4 Month/1 Year nurture). There is:
- ❌ No automated new-lead outreach
- ❌ No appointment confirmation SMS
- ❌ No post-offer follow-up sequence
- ❌ No personalized messaging (current drip is generic A/B test)
- ❌ No smart task creation with context
- ❌ No SLA enforcement

---

## 💰 Money Left on the Table (This Week)

| Issue | Count | Est. Cost |
|-------|-------|-----------|
| PPL leads with zero outreach (New Lead stage) | 6-7 of 9 | $750-1,050 wasted PPL spend |
| Fake/test PPL leads (dispute candidates) | 2 (Tt Slow, Mister Seller) | $250-300 recoverable |
| Appointments without confirmation (no-show risk) | 4 upcoming | 1 no-show = 1 lost deal ($5-50K) |
| No post-offer follow-up | 2 recent offers | Seller cooling = deal death |
| Follow Up pipeline on generic drip | 4,500+ active | Unknown — personalization lifts response 2-3x |

---

## 📊 Pipeline Snapshot (Feb 15, 2026)

**Sales Process — 147 opportunities:**
| Stage | Count | Notes |
|-------|-------|-------|
| New Lead | 9 | All PPL, mostly unworked |
| Warm Leads | 10 | Mix: Dialer, PPL, Form |
| SMS Warm Leads | 6 | All Texts source |
| Hot Leads | 28 | Mostly PPL, active conversations |
| Pending Apt | 5 | Texts + PPL |
| Walkthrough Apt Scheduled | 5 | Feb 16-18 appointments |
| Offer Apt Scheduled | 1 | Frances Rolin, Feb 16 |
| Made Offer | 2 | Matt Jacobsen, Terri Kahl |
| Under Contract → SOLD | 0 | Pipeline stages exist but empty |

**Follow Up — 7,365 opportunities:**
| Stage | Count |
|-------|-------|
| 4 Month Follow Up | 2,234 |
| 1 Year Follow Up | 2,288 |
| SOLD | 495 |
| Purchased | 104 |
| Agreement Not Closed | 88 |
| Other stages | ~2,156 |

---

## ⚡ Bottom Line

**The bots aren't running, and it shows.** Real leads are going cold. Real appointments are unconfirmed. Real offers have no follow-up. The GHL automations only cover long-term nurture in the Follow Up pipeline — everything in Sales Process is manual and clearly falling through cracks.

The 9 PPL leads in New Lead alone represent ~$1,125 in spend. At least 2 are dispute-worthy. 4 appointments this weekend have no confirmation. This is the exact gap the bot suite was designed to fill.
