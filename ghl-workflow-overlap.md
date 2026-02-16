# GHL Workflow Overlap Map

**Generated:** 2/14/2026, 1:38:21 AM CST
**Location:** New Again Houses Nashville
**Total Workflows:** 43 (26 published, 17 draft)

---

## All GHL Workflows

| # | Name | Status | Last Updated |
|---|---|---|---|
| 1 | 1 month Follow Up Workflow | 🟢 Published | 1/15/2026 |
| 2 | 4 Month Follow Up Automation | ⚪ Draft | 10/29/2025 |
| 3 | 4 Month Follow Up Template | ⚪ Draft | 10/29/2025 |
| 4 | Assign Buyers to Dispo Manager | 🟢 Published | 1/6/2026 |
| 5 | Auto-Tag Dead Leads (1 Year) | ⚪ Draft | 1/18/2026 |
| 6 | Auto-Tag Dead Leads (4 months) | ⚪ Draft | 1/18/2026 |
| 7 | Call Transcript in Notes | 🟢 Published | 2/2/2026 |
| 8 | Call Triger for Follow Up Automation | ⚪ Draft | 2/2/2026 |
| 9 | Deal Closed | 🟢 Published | 2/1/2026 |
| 10 | Deal Under Contract | 🟢 Published | 2/2/2026 |
| 11 | Delete Old Contacts | ⚪ Draft | 1/16/2026 |
| 12 | Delete Opportunity | 🟢 Published | 1/16/2026 |
| 13 | Follow Up Automation | 🟢 Published | 1/14/2026 |
| 14 | Follow Up Calls Drip | 🟢 Published | 9/13/2024 |
| 15 | Follow Up Organization | 🟢 Published | 1/15/2026 |
| 16 | Follow Up Workflow Triggers | ⚪ Draft | 10/29/2025 |
| 17 | Hot Leads | 🟢 Published | 1/6/2026 |
| 18 | JV Partner Follow Up | 🟢 Published | 1/14/2026 |
| 19 | JV Walkthrough Apt Confirmation | 🟢 Published | 11/19/2025 |
| 20 | Lead Mining Lead Gen | ⚪ Draft | 1/14/2026 |
| 21 | Made Offer Semi Automation | ⚪ Draft | 7/25/2025 |
| 22 | NAH Offer Call Apt Confirmation | 🟢 Published | 1/14/2026 |
| 23 | NAH Walkthrough Apt Confirmation | 🟢 Published | 1/14/2026 |
| 24 | New Buyer — No Answer | 🟢 Published | 1/16/2026 |
| 25 | New Deal - Setup | 🟢 Published | 2/2/2026 |
| 26 | New Follow Up Lead | 🟢 Published | 1/15/2026 |
| 27 | New JV Lead | 🟢 Published | 1/13/2026 |
| 28 | New Lead - Entry Point | 🟢 Published | 2/2/2026 |
| 29 | New Workflow : 1765156708213 | ⚪ Draft | 12/7/2025 |
| 30 | Outbound SMS, Email and Call | ⚪ Draft | 1/5/2026 |
| 31 | Pending Apt | 🟢 Published | 1/6/2026 |
| 32 | Pipeline Stage Changed | ⚪ Draft | 12/21/2025 |
| 33 | Post Closing Automation | 🟢 Published | 1/13/2026 |
| 34 | Remove from JV Follow Up | 🟢 Published | 1/13/2026 |
| 35 | SMS Follow-Up Sequence | 🟢 Published | 11/27/2025 |
| 36 | SMS: Message pump for follow up | ⚪ Draft | 1/4/2026 |
| 37 | Showing Apt Confirmation | ⚪ Draft | 11/19/2025 |
| 38 | Under Contract | ⚪ Draft | 12/18/2025 |
| 39 | Warm Leads | 🟢 Published | 1/29/2026 |
| 40 | Working Leads Drip | 🟢 Published | 12/18/2025 |
| 41 | Yearly Follow Up Template | ⚪ Draft | 10/29/2025 |
| 42 | call scoring, from the recording | 🟢 Published | 12/1/2025 |
| 43 | call transcription summary | ⚪ Draft | 2/2/2026 |

## Overlap Matrix: Engine Bots vs GHL Workflows

> ⚠️ The GHL Workflows API (v2021-07-28) exposes workflow names and status but NOT trigger/action details. The analysis below is based on workflow naming conventions and known GHL workflow behavior.

### Categorized Published Workflows

**FollowUp:** 1 month Follow Up Workflow, Follow Up Automation, Follow Up Calls Drip, Follow Up Organization, JV Partner Follow Up, New Follow Up Lead, Remove from JV Follow Up, SMS Follow-Up Sequence, Working Leads Drip
**Appointment:** JV Walkthrough Apt Confirmation, NAH Offer Call Apt Confirmation, NAH Walkthrough Apt Confirmation, Pending Apt
**NewLead:** Hot Leads, New Follow Up Lead, New JV Lead, New Lead - Entry Point, Warm Leads
**Deal:** Deal Closed, Deal Under Contract, New Deal - Setup, Post Closing Automation
**Buyer:** Assign Buyers to Dispo Manager, JV Partner Follow Up, JV Walkthrough Apt Confirmation, New Buyer — No Answer, New JV Lead, Remove from JV Follow Up
**CallScoring:** Call Transcript in Notes, call scoring, from the recording
**Sms:** SMS Follow-Up Sequence
**Other:** Delete Opportunity

### Overlap Matrix

| Engine Bot | GHL Workflow(s) | Conflict? | Recommendation |
|---|---|---|---|
| **Follow-Up Bot** (stale lead detection, task creation) | 1 month Follow Up Workflow, Follow Up Automation, Follow Up Calls Drip, Follow Up Organization, JV Partner Follow Up, New Follow Up Lead, Remove from JV Follow Up, SMS Follow-Up Sequence, Working Leads Drip | **YES — HIGH RISK** | GHL has 9 follow-up workflows. Engine should NOT send SMS/tasks that duplicate these drips. Engine should focus on **detection only** (flag stale leads) and let GHL workflows handle the outreach sequence. |
| **After-Hours Bot** (auto-response to off-hours messages) | 1 month Follow Up Workflow, Follow Up Automation, Follow Up Calls Drip, Follow Up Organization, JV Partner Follow Up, New Follow Up Lead, Remove from JV Follow Up, SMS Follow-Up Sequence, Working Leads Drip | **MAYBE** | Check if any GHL workflow has an "outside business hours" trigger. If so, disable engine auto-response. If not, engine fills a gap. |
| **Appointment Bot** (reminders, no-show recovery) | JV Walkthrough Apt Confirmation, NAH Offer Call Apt Confirmation, NAH Walkthrough Apt Confirmation, Pending Apt | **YES — HIGH RISK** | GHL has 4 appointment-related workflows including confirmation workflows. Engine should NOT send reminders if GHL workflows already handle them. Engine should focus on **no-show detection** and **gap detection** only. |
| **Lead IQ** (scoring, tagging Hot/Warm) | Hot Leads, New Follow Up Lead, New JV Lead, New Lead - Entry Point, Warm Leads | **MAYBE** | GHL has "Hot Leads, New Follow Up Lead, New JV Lead, New Lead - Entry Point, Warm Leads" workflows. Check if these tag leads. If so, coordinate tagging logic to avoid duplicates. Engine scoring provides MORE granular analysis than simple GHL tags. |
| **Re-engagement Bot** (dormant lead outreach) | 1 month Follow Up Workflow, 4 Month Follow Up Automation | **YES — MEDIUM RISK** | GHL already has time-based follow-up workflows. Engine re-engagement should only fire for contacts NOT in an active GHL workflow. Or focus on detection (flag for team) rather than automated outreach. |
| **Transcript Processor** (call summary, auto-tagging) | Call Transcript in Notes, call scoring, from the recording | **YES — MEDIUM RISK** | GHL has "Call Transcript in Notes, call scoring, from the recording" which may also process call recordings. Ensure engine notes are clearly labeled as "[Gunner Engine]" to distinguish from GHL-generated notes. Tag dedup is critical. |
| **KPI Bot** (daily performance metrics) | None | **NO CONFLICT** | No GHL workflow does KPI calculation. Engine fills a unique gap. |
| **Pipeline Signals** (lost deal detection) | Deal Closed, Deal Under Contract, New Deal - Setup, Post Closing Automation | **LOW RISK** | GHL deal workflows handle stage transitions. Engine signals DETECT patterns (sold claims, stall tactics) that GHL workflows can't. Complementary, not overlapping. |
| **SMS Follow-Up Sequence** (engine-generated texts) | SMS Follow-Up Sequence, 1 month Follow Up Workflow, Follow Up Automation, Follow Up Calls Drip, Follow Up Organization, JV Partner Follow Up, New Follow Up Lead, Remove from JV Follow Up, SMS Follow-Up Sequence, Working Leads Drip | **YES — CRITICAL** | Multiple GHL workflows send SMS. Engine MUST NOT send SMS that duplicates these. Use the action tracker cooldown system. Ideally, engine should create TASKS (not send SMS) and let GHL workflows handle actual messaging. |
| **Deal Packaging Bot** (assemble deal packages) | New Deal - Setup | **LOW RISK** | GHL "New Deal - Setup" handles initial deal setup. Engine packaging adds completeness scoring and gap detection — complementary. |
| **Scheduling Bot** (conflict detection, routing) | None | **NO CONFLICT** | No GHL workflow handles scheduling intelligence. Engine fills a unique gap. |

## Key Recommendations

1. **HIGHEST PRIORITY:** Disable engine SMS sending. Let GHL workflows handle all outbound messaging. Engine should create tasks/notes instead.
2. **Follow-up overlap:** Engine Follow-Up Bot + GHL "Follow Up Calls Drip" + "Working Leads Drip" + "SMS Follow-Up Sequence" = triple-texting risk. Action tracker cooldowns are essential.
3. **Appointment overlap:** GHL has confirmation workflows (NAH Walkthrough Apt Confirmation, NAH Offer Call Apt Confirmation). Engine should NOT send separate reminders.
4. **Call scoring overlap:** GHL "Call Transcript in Notes" + "call scoring, from the recording" vs Engine Transcript Processor. Ensure they produce different/complementary outputs.
5. **Re-engagement overlap:** GHL "1 month Follow Up Workflow" is published and active. Engine re-engagement should check if contact is already in this workflow before triggering.

## Workflows Not Accessible via API

> The GHL API (v2021-07-28) does NOT expose workflow triggers, conditions, or action steps. The overlap analysis above is based on workflow NAMES only. For a complete audit:
> 1. Corey should screenshot each published workflow's trigger and action configuration
> 2. Or export workflow details from GHL Settings → Automations
> 3. Then we can build a precise conflict map with exact trigger/action matching

---
_Generated by gunner-engine workflow audit system_
