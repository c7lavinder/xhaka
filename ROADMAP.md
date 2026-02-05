# ROADMAP.md — New Again Houses

## Now (Active)

### Esteban: Tag Top Buyers
- **Owner:** Esteban
- **Due:** This week
- **Status:** In progress
- **Details:** Tag top 50-100 priority buyers with new custom fields (Buyer Tier, Verified Funding, Buybox, Markets, etc.)

---

## Next (This Week / Next Few Days)

### Manus Property Detail Sheet Automation
- **Goal:** Auto-generate property detail PDFs when deal is ready to send out
- **Flow:** Deal hits "Clear to Send Out" → API call to Manus → Manus creates PDF → Ready for Esteban
- **Needs:** Manus API access, template/example of current property sheet, GHL webhook or Zapier trigger
- **Status:** Research done — Manus has API, flow is viable

### Finish Showing Appointment Workflow
- **Goal:** Complete the GHL workflow for showing appointments (similar to Walkthrough workflow)
- **Flow:** Showing scheduled → Appointment created → Shows on calendar → Auto-reminders sent
- **Status:** Workflow exists but unfinished

### Call Summarization in Notes
- **Goal:** Automatically summarize calls and add to contact/opportunity notes in GHL
- **Needs:** Identify call source (GHL native? External dialer?), explore transcription options
- **Status:** Not started

---

## Later (Planned)

### Automated Deal Distribution
- **Goal:** When deal is locked up, system identifies matching buyers and generates tailored messaging
- **Flow:** Deal fields (Market, Property Type) match to Buyer fields (Markets, Buybox) → Generate contact list + draft messages by buyer type
- **Needs:** Buyer data populated, matching logic built, message templates
- **Status:** Foundation laid (custom fields created)

### CSV Bulk Update for Buyers
- **Goal:** Mass-update remaining buyer records with new custom field data
- **Owner:** Esteban + Xhaka
- **Needs:** Export current buyers, map data, import with new fields
- **Status:** Waiting on Esteban's priority tagging first

### InvestorLift Integration
- **Goal:** Auto-push deals to InvestorLift when "Clear to Send Out"
- **Blocker:** Requires paid InvestorLift plan for Zapier/API access
- **Status:** On hold

### Mailing Address Auto-Pull (Skip Trace)
- **Goal:** Auto-populate mailing address when lead hits "New Lead" stage
- **Flow:** GHL trigger → BatchLeads API (via Zapier) → Update contact mailing fields
- **Tools Ready:** Zapier ✓, BatchLeads API ✓, GHL mailing fields ✓
- **Priority:** Low — only needed for postcard/direct mail follow-up
- **Status:** On hold

### GHL Documentation (Google Doc)
- **Goal:** Complete documentation of NAH's GHL setup for team onboarding
- **Doc:** https://docs.google.com/document/d/1Mv5b0I6ra9jaxZKFpVwkRQf9gVfJ3dc0vyKiy70oTrM/edit
- **Status:** In progress — will update while Corey sleeps

---

## Done (Archive)

### Buyer Custom Fields — ✓ 2026-02-01
Created 8 fields on Contact object:
- Buyer Tier, Verified Funding, Has Purchased Before, Response Speed, Last Contact Date, Buyer Notes, Market(s), Buybox

### Deal Custom Fields — ✓ 2026-02-01
Created 9 fields on Opportunity object:
- Market, Property Type, ARV, Repair Estimate, Contract Price, Asking Price, Deal Summary, Photos Link, Access Instructions

### Pipeline Exploration — ✓ 2026-02-01
Mapped: Sales Process, Dispo Pipeline, Buyer Pipeline, Follow Up, JV Deals, Lead Mining

### Emailed Esteban — ✓ 2026-02-01
Sent instructions on new buyer fields + this week's tagging task
