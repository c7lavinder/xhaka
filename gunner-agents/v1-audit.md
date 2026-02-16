# Gunner V1 Audit — Issues & Recommendations

**Date:** Feb 12, 2026
**Audited by:** Xhaka (Corey's AI)

---

## 🔴 BROKEN / NEEDS IMMEDIATE FIX

### 1. Dashboard stats inconsistent with Analytics
Dashboard shows: 234 calls, 63 conversations, 21 appointments, 8 offer calls, 45% avg
Analytics shows: 197 calls, 55 conversations, 20 appointments, 6 offer calls, 46% avg
Same "Last 7 Days" filter on both pages. Numbers don't match. This will destroy trust with users immediately — they won't know which numbers are real.

### 2. Dashboard leaderboard scores don't match Analytics
- Dashboard: Kyle 69% / 89 calls, Daniel 47% / 138 calls, Chris 36% / 168 calls
- Analytics Team Member Scores: Kyle 79% / 9 graded, Daniel 42% / 30 graded, Chris 34% / 17 graded
- Percentages AND call counts are different between pages. Which is right?

### 3. Call Processing numbers inconsistent between page loads
Dashboard Call Processing showed 63 scored / 171 skipped / 234 total on one load, then 55 scored / 142 skipped / 197 total on another. Same session, same time filter. Data is shifting between renders.

---

## 🟡 UX / DESIGN ISSUES

### 4. Recent Calls — skipped calls should be de-emphasized, not hidden
Skipped calls are useful (proves team is dialing), but they currently look identical to graded calls and dominate the list. Fix:
- Add an activity indicator above the list: **"23 calls today (4 graded, 19 skipped)"** — instant answer to "is my team working?"
- Gray out or visually de-emphasize skipped calls in the list so graded calls stand out

### 5. Gamification feels empty
All three team members are "Lvl 2 Rookie" with 1 badge each. Admin is Lvl 1 with all zeros. The gamification section takes prime dashboard real estate but feels hollow. Badges need names/descriptions to be motivating. Consider hiding this section until there's enough data to make it meaningful.

### 6. 64% of graded calls are F's
36 out of 55 graded calls are F. If the rubric is so strict that 64% fail, new customers will think the tool is broken, not that their team is bad. Worth examining — either calibrate the rubric or add context ("F doesn't mean failure, here's what it means").

### 7. Score Trends chart — empty weeks show as 0% dots
12-week view but only 2 weeks have data. Empty weeks show dots at 0% on the chart, which looks like scores crashed to zero rather than "no data." Should show no dot or a gap for weeks with no calls.

### 8. Analytics leaderboard ranking criteria unclear
Daniel ranked #1 LM with 138 calls / 42% avg. Chris is #2 with 168 calls / 34% avg. Chris has MORE calls but lower rank. What's the sort? If it's score, makes sense. If it's calls, it's wrong. The ranking criteria should be visible or explained.

### 9. No helpful empty states
When Signals shows 0 Missed and 0 Worth a Look, cards just show "0" with no context. Should say something like "No urgent signals — your team is on track."

---

## 🟠 LIKELY TO CAUSE BUGS / SCALE ISSUES

### 10. Conversation scan capped at 50
Pipeline Signals scans only the 50 most recent GHL conversations. On a busy day with 3 LMs making 50+ calls each, real signals will get missed. Needs to scale with activity volume.

### 11. CRM settings shows "Connect GHL" even when connected
CRM tab shows a "Connect GHL" button with no indication it's already connected and syncing. New user would think it's not set up. Should show connected status with last sync time.

### 12. Custom Domain field has no save button
Settings > General has a Custom Domain field with placeholder text but no save button (unlike Company Info which has one). Unclear if it's functional or decorative.

### 13. No role-based access control visible
Admin-only features (Signals scan, Training insights generation, Settings) appear visible to all users. Need to verify: can a team member see Pipeline Signals? Run "Scan Pipeline"? Access Settings? Edit rubrics?

### 14. Signup URL inconsistency
Signup flow shows "app.getgunner.ai/" for the vanity URL, but the actual app runs on "getgunner.ai" (www). Settings also shows "gunner.app/nah." Three different URL patterns — confusing.

---

## 💡 QUICK WINS

### 15. No "last synced" indicator on Dashboard
Call History shows "Sync from GHL (20 minutes ago)" which is great. Dashboard has no sync indicator. Users won't know if data is current.

### 16. Call detail page for skipped calls should show a short summary
"Call Skipped — Too Short (13s)" currently takes up a full page of white space. Even a 13-second call has context — run a quick 1-2 sentence summary from the recording/transcript: "Seller answered, said not interested, hung up" or "Voicemail, no message left." Cheap to process and gives real insight instead of a blank page.

### 17. Dashboard greeting could be more useful
"Welcome back, Xhaka!" is fine but wastes space. For owners, show today's key number ("3 signals need attention" or "Kyle had 4 A-B calls today"). For team members, show their own stats.

---

## ✅ VERIFIED WORKING

- TOS and Privacy Policy pages — live and loading correctly
- Google OAuth login — working
- Pipeline Signals — detecting real signals from GHL data
- Call grading and coaching feedback — detailed and actionable
- AI Coach panel — visible on Call History with coaching prompts and action suggestions
- Team page — showing correct members with grade distributions
- Signup onboarding flow — clean 6-step wizard (Company Info → CRM → Roles → Training → Invite → Launch)
- Forgot password flow — functional

---

**Priority order:** Fix #1-3 (data inconsistency) before onboarding anyone. Everything else can be patched incrementally.
