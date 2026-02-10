# ARV Assistant — Spec v1.0

**Status:** Ready for Development  
**Priority:** HIGH — saves 1.5-2.5 hrs/day  
**Integration:** MasterSuite + Zillow + Google Street View

---

## Problem

Corey spends 15-30 min per property on:
- Running comps on Zillow → ARV
- Assessing exterior condition via Street View → Construction Budget
- Evaluating intangibles and location → Offer adjustments

At 5 properties/day, that's 1.5-2.5 hours daily on property analysis alone.

---

## Solution

AI assistant that:
1. Takes subject property address
2. Pulls comparable sales from Zillow → calculates ARV
3. Pulls Google Street View → grades Construction Budget
4. Assesses intangibles and location from visual data
5. Enters all data into MasterSuite via Playwright automation

**Corey's role shifts from:** researcher + data entry → reviewer + approver

---

## Target Accuracy

**Stage 3 = "Accurate" (not perfect)**

The goal is getting close enough to make an offer. Stage 4 (post-walkthrough) is where numbers get refined with exact construction estimates.

If AI gets 80% of the way there, Corey validates/adjusts in 2-5 min instead of 15-30.

---

## Part 1: ARV Calculation

### Comp Selection Criteria

| Criteria | Rule |
|----------|------|
| **Property Type** | Must match (SFR to SFR, etc.) |
| **Condition** | Fully remodeled only |
| **Sqft Range** | Similar, but flexible for outliers |
| | Small (700 sqft) → include up to 1000 sqft |
| | Large (2500 sqft) → include up to 3000 sqft |
| **Distance** | Urban: as close as possible for 5 good comps |
| | Rural: go as far as needed, 3 decent comps acceptable |
| **Recency** | Max 12 months, prioritize newest |
| **Beds/Baths** | Best match possible, ±1 okay when needed |

### ARV Calculation Method

**Combination of $/sqft AND price relative to comps** (not just simple average)

**Low-End / High-End Range:**
- Usually **20-30 $/sqft** spread between low and high
- Super urban with lots of comps → can narrow to **10 $/sqft** spread
- **Entered as $/sqft** — MasterSuite calculates full price

---

## Part 2: Construction Budget Grading

**Source:** Google Street View (virtual "drive-by")

### Grading Formula

**Baseline: 2.5** (every property starts here)

Add points for visible damage/issues:

| Category | Points | What to Look For |
|----------|--------|------------------|
| **Exterior Indicators** | -0.5 to +1.5 | Overgrown yard, trash, boarded windows, obvious neglect, general disrepair |
| **Roof** | 0 or +0.5 | Visible sag, missing shingles, tarps, moss/damage |
| **Windows** | 0 or +0.5 | Broken/boarded, obviously old/failed, mismatched |
| **Paint/Siding** | 0, +0.5, or +1.0 | Peeling paint, rotting wood, damaged/missing siding |
| **Premium (unseen)** | +1.5 | **Auto-add for Stage 3** — no walkthrough yet, buffer for hidden issues |

### Grade Interpretation

| Grade | Meaning |
|-------|---------|
| 2.5 | Clean property, no visible issues |
| 3.0-3.5 | Minor issues (1-2 categories need work) |
| 4.0-4.5 | Multiple visible problems |
| 5.0+ | Major exterior damage |
| 6.0-6.5 | Full gut job territory |

### Formula
```
Construction Budget = Grade × Market Construction Index × SqFt
```
(Market index is backend MasterSuite data per market — AI just enters grades)

### Fallback: No Street View

When Street View is unavailable, outdated, or obstructed, use **seller's description from call notes**:

| Seller Description | Grade |
|--------------------|-------|
| Needs a ton of work | 7 |
| Needs updating throughout | 5 |
| Needs very little | 3 |
| Needs nothing | 1 |

Source: GHL contact notes, call summaries, or conversation history.

### Post-Walkthrough

- **Grade stays forever** — never changed after initial entry
- **Blue box** = exact construction estimate entered after walkthrough
- Grade is historical reference; blue box is the real number

---

## Part 3: Intangibles

**Source:** Street View + Zillow photos + property data

Each field uses a simple **+/-/O** scale:
- **+ Asset** = adds value
- **- Liability** = detracts value  
- **O Typical** = neutral (no adjustment)

| Field | + Asset | - Liability | O Typical |
|-------|---------|-------------|-----------|
| **Comp Risk** | Strong comps available | Weak/few comps | Normal comp situation |
| **Basement** | Finished/bonus space | Issues/water damage signs | None or unfinished |
| **Beds/Baths** | More than comps | Fewer than comps | Same as comps |
| **Curb Appeal** | Great looking | Ugly/eyesore | Average |
| **Neighbors** | Nice houses on street | Rough area visible | Normal neighborhood |
| **Parking** | Garage/extra parking | Street only | Typical driveway |
| **Yard** | Big/nice lot | Tiny/issues | Normal yard |

### Assessment Sources

| Field | Primary Source |
|-------|----------------|
| Comp Risk | Zillow comp search results |
| Basement | Zillow property data |
| Beds/Baths | Zillow data vs comp avg |
| Curb Appeal | Street View |
| Neighbors | Street View |
| Parking | Street View + Zillow photos |
| Yard | Street View + Zillow photos |

---

## Part 4: Location Score

**Source:** Google Street View

| Score | Meaning | Visual Indicators |
|-------|---------|-------------------|
| 1 | War zone | Boarded houses, abandoned cars, obvious blight |
| 2 | Rough area | Deferred maintenance throughout, some blight |
| 3 | Average | Normal working-class neighborhood (MOST COMMON) |
| 4 | Good area | Well-maintained, nice houses |
| 5 | Best | Nice street, desirable neighborhood |

**Default to 3** when in doubt. Only deviate if clearly better (4-5) or clearly worse (1-2).

---

## MasterSuite Integration

**Method:** Playwright browser automation (no API)

### Fields to Populate

**Valuation Tab:**
- Comparable properties (address, price, sqft, beds/baths, sold date, URL)
- Comp category: Sold or Active
- Comp condition: New / Remodeled / Updated
- Comp location: Similar / Worse / Better

**Analysis Tab (Construction Budget):**
- Exterior Indicators grade
- Roof grade
- Windows grade
- Paint/Siding grade
- Premium (+1.5 for Stage 3)
- (Blue box left empty — for post-walkthrough)

**Analysis Tab (Intangibles):**
- Comp Risk: +/-/O
- Basement: +/-/O
- Beds/Baths: +/-/O
- Curb Appeal: +/-/O
- Neighbors: +/-/O
- Parking: +/-/O
- Yard: +/-/O

**Analysis Tab (Location):**
- Location Score: 1-5

---

## Workflow

### Input
- Property address (single or batch from GHL/MasterSuite)

### Process
1. **Zillow Scrape:**
   - Pull property details (sqft, beds, baths, lot size)
   - Search for comps within criteria
   - Score and rank comps
   - Calculate ARV range

2. **Street View Analysis:**
   - Pull Street View imagery
   - Grade: Exterior, Roof, Windows, Siding
   - Assess: Curb Appeal, Neighbors, Parking, Yard
   - Score Location (1-5)

3. **MasterSuite Entry:**
   - Navigate to property
   - Enter comps on Valuation tab
   - Enter grades on Analysis tab
   - Enter intangibles
   - Enter location score
   - Save

### Output
- Property fully populated in MasterSuite
- Summary message to Corey: "7170 Bidwell Rd ready for review — ARV: $X, CB Grade: Y, Location: Z"

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Time per property | 15-30 min → 2-5 min review |
| Daily time saved | 1-2 hours |
| ARV accuracy | Within 5% of Corey's final 80%+ of time |
| CB Grade accuracy | Within 0.5 of Corey's assessment |
| Throughput | Handle 5+ properties/day without backlog |

---

## Technical Stack

- **Language:** TypeScript
- **Browser Automation:** Playwright
- **Data Sources:** Zillow (scraping), Google Street View
- **Target:** MasterSuite (nashc.mastersuite.com)
- **Auth:** corey@newagainhouses.com / lavinder

---

## Training Reference

**Drive-By Grading Guide:**  
`gunner-agents/add-ons/arv-assistant/training/construction-budget-grading.pdf`

Google Slides source:  
https://docs.google.com/presentation/d/1HTycxhZqmtut3pPVdtPDOPcVJKFmi_SGDNVJe2GWAcc/

---

## Build Phases

### Phase 1: Core Automation
- Zillow comp scraping + ARV calculation
- Street View grading for Construction Budget
- MasterSuite entry via Playwright
- Basic intangibles and location scoring

### Phase 2: Intelligence Layer
- Improve comp scoring algorithm
- Better visual analysis of Street View
- Confidence scoring for rural properties
- Batch processing from GHL

### Phase 3: Photo Analysis
- Zillow interior photos → refine CB grade
- Detect specific issues (dated kitchen, old HVAC, etc.)
- Pre-walkthrough condition report

---

*Spec v1.0 — Ready for development*
