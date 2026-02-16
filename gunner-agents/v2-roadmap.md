# Gunner V2 Roadmap

*Defined by Corey — Feb 12, 2026*

---

## Pillar 1: Agent Suite
The full suite of AI agents as add-ons inside Gunner. $49/mo or $99/mo tiers. Easy to onboard — plug and play.

Agents include (and will grow beyond):
- Lead IQ (qualification scoring)
- LM Assistant (post-call automation)
- AM Assistant (post-call automation)
- Follow Up Bot (intelligent nurture)
- Appointment Bot (scheduling, no-shows)
- After-Hours Bot (engage leads off-hours)
- Callback Capture Bot (AI listens, creates opportunities)
- Contract Bot (generate, send, track)
- Post-Close Bot (thank you, reviews, referrals)
- Data Hygiene Bot (clean CRM data)
- KPI Entry Bot (auto-populate spreadsheets)
- Report Generator (daily/weekly/monthly)
- Market Watch Bot (trends, comps)
- MLS Monitor Bot (alert when pipeline properties list)
- Voicemail Bot (CallRail → transcribe → GHL)
- PPL Refund Bot (already built)
- More to come

**Lead Generation Bots (NEW):**
- **County Data Bot** — Pulls tax delinquencies, probate filings, code violations, pre-foreclosures, lis pendens, absentee owners, vacant properties, estate transfers from public county records. Auto-builds skip-traced lists for the dialers.
- **MLS Scraper Bot** — Monitors expired listings, price reductions, high days-on-market, FSBO, withdrawn/canceled listings. Feeds leads directly into GHL pipeline. Replaces expensive PPL lead buying.

**Deal Operations Bots (from Dispo chat analysis):**
- **Deal Packaging Bot** — Auto-populates deal packages from walkthrough data + GHL contact info + county records. Sqft, asking price, notes, seller closing timeline — entered once, packaged automatically.
- **Title Coordination Bot** — Tracks title company tasks, sends reminders for outstanding items (addendum acceptance, info verification), flags when things stall. No more chasing Tammy in group chat.
- **Photo Scheduling Bot** — Schedules property access with sellers for photos, confirms times, sends reminders. Triggers when a deal hits dispo pipeline and photos are needed.
- **Deal Distribution Bot** — Auto-generates deal package (photos, sqft, price, notes, seller timeline) and pushes to buyer list the moment a deal enters dispo pipeline. Esteban doesn't wait for Kyle to fill things in.
- **Cross-Platform Sync Bot** — Syncs deals between GHL and EZREI (and any other platforms). Enter once, appears everywhere.
- **Buyer Negotiation Tracker** — Logs buyer offers and counter-offers in GHL automatically. Tracks where each buyer stands on each deal. No more relaying numbers in group chat.

**LM Workflow Bots (from LM chat analysis):**
- **Lead Summary Auto-Poster** — After LM call graded in Gunner, auto-generate structured lead summary from transcript and post to team chat/feed. LM reviews/edits before posting. Saves 10-15 min per lead. (Highest frequency pattern in LM chat — every single call.)
- **Scheduling Coordinator Bot** — Knows AM/walkthrough team availability, travel distances, and auto-suggests optimal appointment times. Flags calendar conflicts before they happen. Handles reschedules when sellers cancel. (Constant back-and-forth in chat.)
- **Pipeline Hygiene Nudge Bot** — Daily scan of pipeline stages. Auto-nudges LMs when leads sit too long without movement. Removes need for Corey to manually police stale stages. (Corey was sending screenshots of stale columns asking team to clean up.)
- **Walkthrough vs Offer Decision Bot** — When LM qualifies lead, auto-calculates price gap, drive distance from AM base, and property characteristics. Recommends walkthrough vs offer call with reasoning. (Recurring judgment call in chat — "that's not worth a walkthrough, we're 200K off.")
- **Follow-Up Persistence Tracker** — Tracks contact attempts per lead. After X failed attempts, auto-suggests next action (different time, text, move to offer, or park). Prevents leads falling through cracks. (Chris called a seller 4x with no answer — no system to track or escalate.)
- **Process Compliance Bot** — Maintains living rule book from Corey's chat corrections ("wrong number = delete, don't move to DNW"). Auto-flags when pipeline actions violate known rules. Prevents rules from getting buried in chat history.
- **Address Verification Bot** — Auto-verifies property addresses exist in MasterSuite when added to GHL. Flags mismatches or fuzzy matches immediately. (Jessica caught address discrepancies between systems.)
- **Seller Re-engagement Bot** — Tracks declined offers with reasons and seller-stated timelines. Auto-triggers intelligent re-engagement when timing is right. (Jason declined $60K in Jan, came back in Feb ready to accept.)
- **Short Sale / Special Situation Advisor** — When LM notes indicate unusual scenarios (squatters, liens, short sale, probate), auto-surfaces relevant playbook content and flags for senior review. (Daniel: "New scenario to me.")
- **MasterSuite Integration Bot** — Auto-pulls MasterSuite data when lead moves to offer stage. Surfaces ARV, comp analysis, repair estimates alongside lead summary.
- **Unread Message Alert Bot** — Auto-alerts team members when they have unread GHL messages past a time threshold. Replaces Jessica manually checking and reminding. (Jessica: "Can we check unread in GHL please.")
- **Cancellation/Reschedule Handler** — Tracks walkthrough cancellations, auto-suggests new times, flags leads that cancel 2+ times for potential DQ or different approach. (Dameron Ave rescheduled twice, Deborah canceled day-of.)
- **Team Chat Digest Bot** — End-of-day summary posted to Corey: "3 new appointments set, 1 walkthrough rescheduled, 2 offer calls scheduled." So he doesn't have to read every message in LM/Dispo chats.

**Key:** Easy onboarding. Add-on pricing. Not all-or-nothing.

---

## Pillar 2: Smarter AI / LLM Intelligence
Making the AI in Gunner genuinely smarter over time:

- **AI Coaching** — learns each user's style, captures before/after edits, builds preference profiles
- **Pipeline Signals V2** — expanded detection rules, understands missed deals at a deeper level (Robin Phelps pattern, seller timelines, open-ended responses)
- **Team Understanding** — AI learns team patterns, strengths, weaknesses. Knows who needs what kind of coaching.

---

## Pillar 3: Underwriting / Deal Analysis
Understanding the numbers on deals. **Two versions:**

1. **NAH Version** — Uses MasterSuite (NAH franchise tool) for ARV, repair estimates, construction budgets. NAH franchise grading system baked in.
2. **Non-NAH Version** — Uses a different underwriting method/tool for wholesalers outside the NAH system.

This is how Gunner goes from "call coaching" to "deal intelligence."

---

## Pillar 4: Dispo Visibility
Full dashboard showing buyer-side activity:

- What did dispo do today (deals sent, buyers contacted, responses)
- Inventory status — all active deals and buyer engagement
- Buyer interest — who's interested, who passed, why
- Buyer feedback patterns — why deals aren't moving
- Dispo team metrics and performance over time

**The problem it solves:** "I have to trust him a lot and I do not like that."

PRD already written: `gunner-agents/dispo-dashboard-prd.md`

---

## Pillar 5: Control Room / KPI Management
Daily business accountability — the instrument panel:

- Real-time KPI tracking and management
- Daily numbers visible at a glance
- SLA breach detection
- Team performance and bottleneck identification
- Pipeline health monitoring
- Trend tracking (getting better or worse?)

Not a workflow tool — it's the dashboard you check every morning to know if the machine is running.

---

## Notes
- White-label / multi-tenant is NOT part of V2 scope (separate initiative)
- Agent suite is designed to grow — these are starting agents, not the final list
- All five pillars make Gunner a full business operating system, not just call coaching
