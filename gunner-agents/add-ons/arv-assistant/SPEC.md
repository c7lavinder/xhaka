# ARV Assistant — Spec (DRAFT)

**Status:** Draft — needs Corey input  
**Priority:** HIGH — saves 1.5-2.5 hrs/day  
**Integration:** MasterSuite + Zillow

---

## Problem

Corey spends 15-30 min per property running comps on Zillow and entering them into MasterSuite Valuation tab. At 5 properties/day, that's 1.5-2.5 hours daily on ARV analysis alone.

Rural properties take longer (fewer comps, wider search needed).

---

## Solution

AI assistant that:
1. Takes subject property address
2. Pulls comparable sales from Zillow
3. Scores comps for similarity
4. Suggests ARV range (Low-End / High-End / Recommended)
5. Pre-populates MasterSuite Valuation tab (or provides data for manual entry)

**Corey's role shifts from:** researcher + data entry → reviewer + approver

---

## Target Accuracy

**Stage 3 = "Accurate" (not perfect)**

The goal is getting close enough to make an offer. Stage 4 (post-walkthrough) is where numbers get refined.

If AI gets 80% of the way there, Corey validates/adjusts in 2-5 min instead of 15-30.

---

## Comp Selection Criteria (Confirmed by Corey)

| Criteria | Rule |
|----------|------|
| **Property Type** | Must match (SFR to SFR, etc.) |
| **Condition** | Fully remodeled only |
| **Sqft Range** | Similar, but flexible for outliers |
| | Small (700 sqft) → include up to 1000 sqft |
| | Large (2500 sqft) → include up to 3000 sqft |
| | Wider tolerance for very small/large properties |
| **Distance** | Urban: as close as possible for 5 good comps |
| | Rural: go as far as needed, 3 decent comps acceptable |
| **Recency** | Max 12 months, prioritize newest |
| **Beds/Baths** | Best match possible, ±1 okay when needed (e.g., 3/1 comp for 3/2 subject) |

**Comp Risk Flag:** If comps are hard to find → mark Comp Risk intangible as negative

---

## Comp Scoring

Each comp scored on similarity to subject:

| Factor | Weight | Notes |
|--------|--------|-------|
| Distance | High | Closer = better |
| Sqft match | High | Similar size |
| Beds/Baths | Medium | Same config preferred |
| Recency | Medium | More recent = better |
| Condition | High | Remodeled/updated preferred |
| Location grade | Medium | Same neighborhood quality |

**Output:** Top 5-10 comps ranked by similarity score

---

## ARV Calculation (Confirmed by Corey)

**Method:** Combination of $/sqft AND price relative to comps
- Not just a simple average
- Consider both metrics together

**Low-End / High-End Range:**
- Usually **20-30 $/sqft** spread between low and high
- Super urban with lots of comps → can narrow to **10 $/sqft** spread
- Represents range of fully remodeled houses with similar specs
- **Entered as $/sqft** — system calculates full price

**Example:**
- Subject: 1,855 sqft
- Low-End: $200/sqft = $371,000
- High-End: $225/sqft = $417,375
- Spread: $25/sqft (typical)

---

## Construction Budget

**Not in scope for V1** — this requires property condition assessment (photos, walkthrough).

Could be Phase 2: AI analyzes property photos to suggest rehab level.

---

## Integration (Full Automation via Browser)

**No API integration with MasterSuite** — use Playwright browser automation instead.

**Workflow:**
1. Input: Property address (single or batch)
2. AI searches Zillow → finds and scores comps
3. AI opens MasterSuite → navigates to property's Valuation tab
4. AI clicks "Add Comparable" for each top comp (3-5)
5. AI fills in comp details (address, price, sqft, beds/baths, sold date, etc.)
6. AI saves
7. Corey reviews final ARV numbers on Analysis tab — approve or adjust

**Corey's role:** Review and approve, not data entry.

**Tech Stack:** TypeScript + Playwright (same as PPL Refund Bot)

---

## Data Sources

### Primary: Zillow
- Sold listings
- Property details
- Photos (for future condition assessment)

### Secondary (potential):
- Redfin
- Realtor.com
- MLS data (if accessible)
- County tax records

**Question for Corey:** Do you ever use sources other than Zillow for comps?

---

## Rural Property Handling

Rural properties have:
- Fewer comps nearby
- Larger lot sizes (acreage matters more)
- More variance in property types

**AI should:**
- Flag when comp pool is thin (<3 comps within criteria)
- Suggest expanding search radius
- Weight lot size higher for rural
- Note confidence level (high/medium/low)

---

## Output Format

For each subject property:

```
SUBJECT: 1172 Linn Cove Court, Gallatin TN 37066
Sqft: 1,855 | Beds: 3 | Baths: 2 | Lot: 0.5 acres

SUGGESTED ARV RANGE:
- Low-End: $380,000 ($205/sqft)
- Recommended: $410,000 ($221/sqft)  
- High-End: $440,000 ($237/sqft)
- Confidence: HIGH (8 comps found)

TOP COMPS:
1. 123 Main St — $425,000 ($220/sqft) — 1,932 sqft — 0.3 mi — Sold 45 days ago — Score: 94
2. 456 Oak Ave — $395,000 ($215/sqft) — 1,837 sqft — 0.5 mi — Sold 60 days ago — Score: 91
3. 789 Pine Rd — $415,000 ($225/sqft) — 1,844 sqft — 0.4 mi — Sold 30 days ago — Score: 89
...

NOTES:
- Subject is slightly smaller than avg comp (1,855 vs 1,871 avg)
- Zip avg is $202/sqft, suggested ARV is 9% above (justified by condition)
```

---

## Workflow Integration

### Current (Manual):
```
New Lead → Open Zillow → Search comps (15-30 min) → Enter in MasterSuite → Stage 2/3
```

### With ARV Assistant:
```
New Lead → AI runs analysis (auto) → Corey reviews (2-5 min) → Approve/adjust → Stage 2/3
```

---

## Success Metrics

- Time per property: 15-30 min → 2-5 min
- Daily time saved: 1-2 hours
- Accuracy: AI suggestion within 5% of Corey's final ARV 80%+ of time
- Rural accuracy: AI suggestion within 10% for rural properties

---

## Answered Questions

✅ Comp criteria — similar type, remodeled, flexible sqft  
✅ Distance — urban close (5 comps), rural far (3 comps okay)  
✅ ARV calculation — combo of $/sqft and price relative to comps  
✅ Low-End / High-End — 20-30 $/sqft spread (10 for dense urban)  
✅ Rejection criteria — none if specs/location/condition match  
✅ Integration — standalone tool (no MasterSuite integration)

## Remaining Questions

1. ~~**Recency:** How old can comps be?~~ ✅ Max 12 months, prioritize newest
2. ~~**Beds/Baths:** Exact match needed, or ±1 okay?~~ ✅ Best match, ±1 okay when needed
3. ~~**Data sources:** Just Zillow, or also Redfin/other?~~ ✅ Zillow (best UI)
4. ~~**No good comps:** What do you do when there are zero decent comps?~~ ✅ Find best 2-3 available, flag Comp Risk

---

## Build Phases

### Phase 1: Basic Comp Pull + ARV Suggestion
- Zillow scraping/API
- Basic similarity scoring
- ARV range output
- Standalone tool

### Phase 2: MasterSuite Integration
- Auto-populate Valuation tab
- Or browser automation to enter comps

### Phase 3: Photo Analysis
- AI reviews property photos
- Suggests construction budget / rehab level
- Condition assessment

---

## Technical Notes

- Zillow doesn't have a public API — will need scraping or third-party data provider
- Alternatives: RapidAPI Zillow endpoints, Redfin (more scrape-friendly), or licensed MLS data
- MasterSuite integration depends on their API availability

---

*Draft spec — will refine with Corey's input*
