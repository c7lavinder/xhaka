# Lead IQ Audit — Side-by-Side Analysis
**Date:** Feb 15, 2026
**Sample:** 3 deep-dives + 40 leads from pipeline list view
**Pipeline:** Sales Process (146 opportunities)

---

## Deep Dive: 3 Leads Scored

### 1. Pat Anderson — 7105 Smokey Hill Rd, Antioch TN
| Factor | Data Found | HOT? |
|--------|-----------|------|
| Timeline | Said "Yes" to selling (Dec 3 text) | ✅ |
| Condition | Unknown | ❌ |
| Price | Unknown | ❌ |
| Motivation | PPL lead, responsive | ❓ |
| Source | PPL (Leadzolo + MotivatedSellers) | ❌ |

**Lead IQ Score: WARM** (1 confirmed factor)

**What Actually Happened:**
- Jul 19, 2025: Created, Daniel called (4:39 min), moved from New Lead same day
- Dec 3, 2025: Chris texted about selling by end of year. Pat said **"Yes"**
- Jan 15, 2026: Marked as **LOST**, moved to 4 Month Follow Up
- Feb 15, 2026: Re-created as New Lead in Sales Process

**🚨 PROBLEM:** Seller said "Yes" in December and the lead was marked LOST. This is exactly what Pipeline Signals Rule 9 (DQ'd Lead Had Selling Signals) should catch. The Follow Up Bot should have triggered re-qualification based on the positive response (+50 engagement points).

**Lead IQ Accuracy: WRONG** — Should have scored HOT based on positive response + timeline. The 5-factor static scoring misses dynamic signals like "seller said yes."

---

### 2. Brian Schaffer — 9015 Cattle Baron Path, Austin TX
| Factor | Data Found | HOT? |
|--------|-----------|------|
| Timeline | Actively scheduling calls | ✅ |
| Condition | Unknown | ❌ |
| Price | Unknown | ❌ |
| Motivation | Web form submission = moderate intent | ❓ |
| Source | Form (Website) | ❓ |

**Lead IQ Score: WARM** (1 confirmed factor)

**What Actually Happened:**
- Feb 10: Jessica manually created. Same day: scheduled call for 3pm, outbound call at 3:02pm, inbound call at 3:27pm ("I may have missed your call, available until 4pm")
- Feb 11-13: Daniel making follow-up outbound calls (4 calls in 4 days)
- Assigned to Daniel, tagged "warm"
- Property is in **Austin, TX** — not Nashville market

**Lead IQ Accuracy: REASONABLE** — Scored WARM, being worked actively. But note the property is in Texas — Lead IQ has no "market fit" factor, which it should.

**🚨 PROBLEM:** No market/geography filter. This lead is out of NAH's primary market but is being worked. Should Lead IQ flag out-of-market leads?

---

### 3. Amanda Hargrove — 236 Longmeadow Cir, Pulaski TN
| Factor | Data Found | HOT? |
|--------|-----------|------|
| Timeline | Unknown | ❌ |
| Condition | Unknown | ❌ |
| Price | Unknown | ❌ |
| Motivation | Unknown — Texts source | ❌ |
| Source | Texts (SMS response) = moderate | ❓ |

**Lead IQ Score: WARM** (0 confirmed factors — minimum)

**What Actually Happened:**
- Jan 14, 2026: Created by Zapier
- Assigned to Chris Segura
- **ZERO conversations. Zero calls. Zero activity.**
- DND on all channels
- Created 32 days ago with literally nothing done

**Lead IQ Accuracy: N/A** — Can't score what you can't see. But this is a **Watchdog failure**. 32 days with zero contact = massive SLA breach.

**🚨 PROBLEM:** This is the #1 issue Lead IQ's Watchdog agent is supposed to prevent. A lead sat for a month with zero outreach. Jessica should have been alerted at 30 minutes.

---

## Pipeline-Level Patterns (from 40 visible leads)

### Source Distribution
| Source | Count | % |
|--------|-------|---|
| PPL | ~24 | 60% |
| Texts | ~8 | 20% |
| Dialer | ~5 | 12% |
| Form/Website | ~3 | 8% |

**Observation:** PPL dominates the pipeline. At $125-150/lead, these are expensive. Lead IQ needs to prioritize high-value PPL leads especially aggressively.

### Leads with Upcoming Appointments (Active Pipeline)
- Jean Arrington (Dialer) — Feb 16, 9:15 AM
- Micah Hensley (Dialer) — Feb 16, 8:00 AM
- Kathy Pack (PPL) — Feb 16, 2:00 PM
- Lourie Saad (PPL) — Feb 17, 11:00 AM
- James Manuele (Texts) — Feb 18, 12:00 PM
- Frances Rolin (PPL) — Feb 16, 12:30 PM
- Terri Kahl (Dialer) — Feb 15, 5:00 PM (today!)

**7 appointments visible** — these are the hottest leads and should all be HOT in Lead IQ.

### DND Pattern
All 3 deep-dived contacts had **DND on all channels**. If this is widespread, it's a data hygiene issue — how are leads being contacted if DND is enabled? The Data Hygiene Bot should flag this.

---

## Lead IQ Verdict

### What Works
- 5-factor scoring logic is sound for initial triage
- HOT/WARM (no COLD) is the right approach — all leads get worked
- SLA monitoring concept is critical

### What's Missing
1. **No dynamic re-scoring** — Pat Anderson said "Yes" but static score didn't change
2. **No market/geography filter** — Brian Schaffer in Texas treated same as Nashville
3. **No engagement-based scoring** — Should factor in responsiveness, not just initial intake
4. **Watchdog is theoretical** — Amanda Hargrove sat 32 days untouched
5. **DND detection** — Leads marked DND everywhere need immediate escalation
6. **Source quality weighting is too simple** — PPL leads at $150 need different urgency than free SMS responses

### Estimated Accuracy: ~50-60%
The static 5-factor model will get the obvious HOTs right but miss:
- Re-engagement signals (like Pat's "Yes")
- Leads that need dynamic re-scoring
- Geographic mismatches
- Stale leads with zero activity

---

## Recommendations for Deployment
1. **Add engagement scoring layer** on top of static 5-factor (Follow Up Bot's signal scoring is the right idea)
2. **Add market filter** — flag out-of-market leads immediately
3. **Watchdog is highest priority** — the SLA monitoring alone would prevent the Amanda Hargrove situation
4. **DND audit** — bulk check how many pipeline leads have DND enabled
5. **Deploy Watchdog first, scoring second** — catching untouched leads is more valuable than scoring them
