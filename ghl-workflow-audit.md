# GHL Workflow Audit
*Started: February 2, 2026*
*Updated: February 2, 2026 - Renames completed*

## ✅ COMPLETED RENAMES (Feb 2, 2026 4:22 PM)
| Old Name | New Name | Status |
|----------|----------|--------|
| Acqusitions (folder) | Acquisitions | ✅ Fixed |
| All New Lead | New Lead - Entry Point | ✅ Done |
| Deal UC to Sell | Deal Under Contract | ✅ Done |
| New Deal Trigger | New Deal - Setup | ✅ Done |

---

## Executive Summary

| Folder | Workflows | Published | Draft | Active Contacts |
|--------|-----------|-----------|-------|-----------------|
| Acquisitions | 10 | 10 | 0 | ✅ Well-organized |
| Disposition | 5 | 5 | 0 | ✅ Operational |
| Lead Generation | 10 | 0 | 10 | 🔴 Major cleanup needed |

**Key Finding:** Lead Generation folder has 10 draft workflows, 7 of which are 3+ years old and never used. One draft workflow has 267 active contacts stuck in limbo.

---

## ACQUISITIONS FOLDER ✅

Well-organized and actively used. All workflows published.

### New Lead Automation (5 workflows - ALL PUBLISHED ✅)
| Workflow | Total Enrolled | Active | Notes |
|----------|----------------|--------|-------|
| All New Lead | 8,931 | 0 | Main entry point for all new leads |
| Warm Leads | 4,436 | 0 | Warm lead follow-up sequence |
| Hot Leads | 2,597 | 0 | Hot lead follow-up sequence |
| New JV Lead | 22 | 0 | JV-specific automation |
| New Follow Up Lead | 9 | 0 | Recent (Jan 2026) |

**Assessment:** This is the core of lead processing. Well-structured with clear lead temperature segmentation.

### Other Subfolders
- Appointment Management - Empty (placeholder)
- Deal Closed Automations - Empty (placeholder)
- Follow Up Organization - Empty (placeholder)
- Making Offer Automation - Empty (placeholder)

---

## DISPOSITION FOLDER ✅

Clean and operational. Handles buyer and deal workflows.

### Buyer Automations (2 workflows - ALL PUBLISHED ✅)
| Workflow | Total Enrolled | Active | Notes |
|----------|----------------|--------|-------|
| Assign Buyers to Dispo Manager | 444 | 0 | Routes new buyers |
| New Buyer — No Answer | 166 | 0 | Follow-up for unresponsive buyers |

### Dispo Automations (3 workflows - ALL PUBLISHED ✅)
| Workflow | Total Enrolled | Active | Notes |
|----------|----------------|--------|-------|
| New Deal Trigger | 204 | 0 | Core deal automation |
| Deal UC to Sell | 11 | 0 | Under contract deals |
| Deal Closed | 0 | 0 | New (Feb 2026) |

**Assessment:** Solid dispo system in place.

---

## LEAD GENERATION FOLDER 🔴

**Major cleanup opportunity.** 10 workflows, ALL in draft status.

### Lead Mining Lead Gen (1 workflow - DRAFT)
| Workflow | Total Enrolled | Active | Notes |
|----------|----------------|--------|-------|
| Lead Mining Lead Gen | 0 | 0 | New (Jan 2026) - development |

### Referral Partner Lead Gen (2 workflows - DRAFT ⚠️)
| Workflow | Total Enrolled | Active | Notes |
|----------|----------------|--------|-------|
| Referral Partner Template | 270 | **267** | ⚠️ ACTIVE contacts in draft workflow! |
| Done Business Referral Partner Template | 0 | 0 | Empty draft |

**⚠️ CRITICAL:** "Referral Partner Template" has 267 active contacts enrolled in a draft workflow. They're stuck in limbo - not receiving automation. Need to either:
1. Publish the workflow, OR
2. Remove contacts from workflow

### SMS Campaign Lead Gen (7 workflows - ALL DRAFT 🔴)
| Workflow | Total Enrolled | Active | Created | Notes |
|----------|----------------|--------|---------|-------|
| Broad SMS (foreclosures/citations) | 0 | 0 | Oct 2022 | 3+ years old |
| Everlasting Follow Up | 0 | 0 | Oct 2022 | Never used |
| Eviction SMS | 0 | 0 | Oct 2022 | Never used |
| Follow Up SMS | 0 | 0 | Oct 2022 | Never used |
| Probate SMS | 0 | 0 | Oct 2022 | Never used |
| Referral Request | 0 | 0 | Oct 2022 | Never used |
| Review Request | 0 | 0 | Oct 2022 | Never used |

**🔴 DELETE CANDIDATES:** All 7 workflows created October 2022. Over 3 years old, never published, never used. Safe to delete.

---

## ROOT LEVEL WORKFLOWS (from earlier audit)

| Workflow | Status | Total Enrolled | Active | Notes |
|----------|--------|----------------|--------|-------|
| Call Triger for Follow Up Automation | **Draft** | **12,109** | 0 | ⚠️ Huge - being built by someone |
| call transcription summary | Draft | 4,056 | 0 | ⚠️ Being built by someone |
| Call Transcript in Notes | Published | 0 | 0 | |
| New Propertiy Added | Published | 4 | 0 | Typo in name |
| Dead Lead Follow-up | Draft | 0 | 0 | Feb 2023 - 2 years unused |
| New Workflow : 1769256344242 | Draft | 0 | 0 | Unnamed test |
| collect prop | Draft | 0 | 0 | |

---

## RECOMMENDATIONS

### 🔴 HIGH PRIORITY

1. **Review "Referral Partner Template"** (Lead Generation folder)
   - 267 active contacts stuck in draft workflow
   - Either publish it or clean up enrolled contacts

### 🟡 CLEANUP (DELETE CANDIDATES)

1. **SMS Campaign Lead Gen** - All 7 workflows (3+ years old, never used):
   - Broad SMS (foreclosures/citations)
   - Everlasting Follow Up
   - Eviction SMS
   - Follow Up SMS
   - Probate SMS
   - Referral Request
   - Review Request

2. **Done Business Referral Partner Template** - Empty draft

3. **Dead Lead Follow-up** - 2+ years old, never used

4. **New Workflow : 1769256344242** - Unnamed test workflow

### 🟢 TYPOS TO FIX

- "Acqusitions" → "Acquisitions" (folder name)
- "New Propertiy Added" → "New Property Added"
- "Call Triger" → "Call Trigger"

### 💡 OBSERVATIONS

1. **Acquisitions is solid** - Well-structured lead processing with temperature segmentation
2. **Disposition is operational** - Clean buyer and deal workflows
3. **Lead Generation needs attention** - Mostly abandoned workflows from 2022
4. **Empty subfolders** in Acquisitions could be consolidated

---

## FULL WORKFLOW COUNT

| Category | Count | Published | Draft |
|----------|-------|-----------|-------|
| Acquisitions (New Lead Automation) | 5 | 5 | 0 |
| Disposition (Buyer + Dispo) | 5 | 5 | 0 |
| Lead Generation (all subfolders) | 10 | 0 | 10 |
| Root Level | 7+ | 2 | 5+ |
| AI Caller (from earlier) | 7 | 1 | 6 |
| **TOTAL** | ~34 | ~13 | ~21 |

**~62% of workflows are drafts.** Many should be deleted or completed.

---

## FOR PACKAGING

To make this system replicable/sellable:

1. **Delete dead workflows** - Clean slate
2. **Fix naming conventions** - Professional, consistent
3. **Document each workflow:**
   - Trigger condition
   - Actions performed
   - Custom fields required
   - Expected outcome
4. **Create workflow templates** - Exportable/importable
5. **Write setup guide** - How to configure from scratch

Current folder structure (recommended to keep):
```
Root
├── Acquisitions/
│   └── New Lead Automation/
│       ├── All New Lead
│       ├── Hot Leads
│       ├── Warm Leads
│       ├── New JV Lead
│       └── New Follow Up Lead
├── Disposition/
│   ├── Buyer Automations/
│   │   ├── Assign Buyers to Dispo Manager
│   │   └── New Buyer — No Answer
│   └── Dispo Automations/
│       ├── New Deal Trigger
│       ├── Deal UC to Sell
│       └── Deal Closed
└── Lead Generation/
    └── (clean up and rebuild)
```
