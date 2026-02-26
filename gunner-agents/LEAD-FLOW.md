# NAH Lead Flow — Master Process Map

**This is the single source of truth for how leads move through the system.**
Last updated: 2026-02-17

---

## Stage 1: NEW SELLER LEAD ENTERS CRM
**Trigger:** Seller lead enters **Sales Process pipeline → New Lead stage**
**Sources:** PPL, dialer, SMS, forms, etc.
**Important:** This ONLY fires for seller leads in Sales Process. Buyers, partners, and other contacts in other pipelines are NOT touched.

→ **Data Hygiene Bot** fires immediately:
  - Format phone/email
  - Property records lookup (RentCast)
  - Owner verification
  - Clean junk data

---

## Stage 2: LEAD SCORED & ROUTED
**Trigger:** Data Hygiene completes

→ **Lead IQ** fires on the now-clean contact:
  - Scores on 5 factors → HOT or WARM
  - Tags contact (hot-lead / warm-lead)
  - Assigns to team member (source-based routing)
  - Moves opportunity to **Warm Leads** or **Hot Leads** stage
  - Creates task with due date for assigned user
  - Sends internal email notification to assigned user

---

## Stage 3: FIRST CONTACT ATTEMPT
**Trigger:** Lead IQ completes scoring + stage move

→ **New Lead Responder** fires immediate SMS:
  - HOT: "do you have a few minutes today for a quick call?"
  - WARM: "when's a good time for a quick call?"
  - Source-branched (dialer/sms/forms/general)
  - SMS from assigned team member's name

→ **Team member** sees task + email notification → calls the lead

---

## Stage 4: WORKING THE LEAD
**Trigger:** Unanswered outbound call OR short/dismissive brush-off reply

→ **New Lead Drip** activates:
  - 104-day SMS + email follow-up sequence
  - Source-branched first 2 days, then unified
  - Reply classifier: REAL (stop) / BRUSHOFF (continue) / DNC (stop + flag)
  - Analytics tracking (delivery, sentiment, engagement)
  - Day 14 ghosted → auto-move to Ghosted stage

---

## Stage 5: QUALIFICATION (Human)
**Who:** Daniel (LM) — handles ALL qualification
**When:** Lead responds / engages

- If qualified → moves through pipeline stages
- If not → Follow Up Pipeline or dead

---

## Stage 6: APPOINTMENT & OFFER (Human)
**Who:** Kyle (AM) — runs walkthroughs, makes offers

- Pending Apt → Walkthrough Scheduled → Offer Scheduled → Made Offer

---

## Stage 7: UNDER CONTRACT → CLOSE
- Under Contract → Dispo Pipeline (Esteban)
- Purchased → Post-close follow-ups

---

## Engine Status

| Step | Engine | Status |
|------|--------|--------|
| 1 | Data Hygiene | ✅ ACTIVE |
| 2 | Lead IQ | ✅ ACTIVE |
| 3 | New Lead Responder | ✅ ACTIVE (chains off Lead IQ) |
| 4 | New Lead Drip | ✅ ACTIVE |
| 5 | Follow-Up Manager | 🔒 DRY-RUN |
| 6 | Pipeline Signals | 🔒 DRY-RUN |
| 7 | Nurture | 🔒 DRY-RUN |

---

## What's NOT Built Yet

- **Dispo Assist** — automates Esteban's workflow after Under Contract
- **Buyer Lead Gen** — finds buyers for deals
- **ARV Assistant** — property analysis + construction budgets
- **KPI Entry Bot** — auto-populate spreadsheets

---

## Rules
- NEVER change the Source field
- Data Hygiene ONLY on new leads (no retroactive scans)
- SMS tone = casual, like a real person texting
- No timing assumptions ("just got your info") — leads may enter CRM hours after engagement
- New Lead Drip = contact attempt sequence, NOT nurture
- All bots DRY-RUN until Corey says go live
