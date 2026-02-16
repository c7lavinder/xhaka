# Data Hygiene Bot v2 — SPEC

## Overview
Sits BEFORE Lead IQ in the pipeline. Cleans and enriches every GHL contact so downstream bots (Lead IQ, Signals, Follow Up, etc.) work with complete, consistent data.

**v2** is a major upgrade based on Corey's 10-case audit feedback (Feb 2026).

## Architecture
- **Engine:** `src/engines/data-hygiene/index.js`
- **Config:** `src/config/data-hygiene-config.js`
- **Schedule:** Every 2 hours (cron: `10 */2 * * *`)
- **State:** `data/data-hygiene-state.json` (tracks processed contacts by hash — skips unchanged)
- **Rate limiting:** Batches of 50 contacts with 2s delay between batches

## What It Does

### 1. Source Preservation (v2 — CRITICAL)
| Rule | Detail |
|------|--------|
| **NEVER change source** | Source IS the lead type (PPL, dialer, sms, etc.) |
| Read-only detection | `detectPPLSource()` identifies PPL leads without modifying anything |
| Attribution fix | If `attributionSource` is empty, copies from `source` (read, never write to source) |

### 2. Business Name = Street Address (v2)
| Check | Action |
|-------|--------|
| `companyName` empty or doesn't start with a number | Set to property street address |
| Street address extracted from `address1` / `propertyAddress` | Formatted in Title Case |

### 3. Timezone by Property Location (v2)
| Check | Action |
|-------|--------|
| Detect state from address or `state` field | Map to IANA timezone |
| Uses state→timezone mapping | NOT phone area code |
| Sets GHL `timezone` field | e.g., `America/Chicago` for TN |

### 4. County Records Flagging (v2)
| Check | Action |
|-------|--------|
| Contact has property address | Tag `needs-county-lookup` |
| Summary note includes lookup instructions | What to verify: owner, mailing address, tax status |
| Future: integrate free property data API | Currently flag-only |

### 5. Contact Summary Note (v2)
| Check | Action |
|-------|--------|
| Every processed contact | Creates/updates structured GHL note |
| Note includes | Lead info, property info, data quality score, flags, county records status |
| Deduped by contact ID | Won't spam duplicate notes |

### 6. Name Capitalization (v2 — bulletproof)
| Check | Action |
|-------|--------|
| ALL CAPS names | → Title Case |
| all lowercase | → Title Case |
| Mixed garbage | → Title Case |
| Special prefixes | Mc/Mac/O' handled (McDonald, O'Brien) |
| Suffixes | Jr., Sr., II, III, IV preserved |
| Hyphenated | Smith-Jones → both parts capitalized |

### 7. Address Formatting (v2)
| Check | Action |
|-------|--------|
| Street addresses | Title Case with smart handling |
| State abbreviations | Kept UPPERCASE (TN, GA) |
| Directionals | N, S, E, W, NE, etc. kept uppercase |
| Street suffixes | Standardized (St, Ave, Blvd, Dr, etc.) |
| Missing city/state/zip | Flagged |

### 8. Market Tagging (v2)
| Check | Action |
|-------|--------|
| Zip code prefix matching | Maps to market |
| City name matching | Maps to market |
| Current markets | `market:nashville`, `market:chattanooga` |
| Nashville coverage | Nashville metro + surrounding TN cities |
| Chattanooga coverage | Chattanooga metro + Catoosa GA area |

### 9. Fake Name Detection (v2)
| Check | Action |
|-------|--------|
| Single-character names | Tag `name-needs-verification` |
| Known fakes | "Test", "Mister Seller", "Seller", "Owner", "asdf", etc. |
| Repeated characters | "Aaaa", "Bbbb" |
| Keyboard patterns | "asdf", "qwer", "zxcv" |

### 10. Phone Area Code Validation (v2)
| Check | Action |
|-------|--------|
| Valid US area code check | Against comprehensive NPA list |
| Toll-free codes (800, 888, etc.) | Tag `phone-needs-verification` |
| Premium/fictional (900, 555) | Tag `phone-needs-verification` |
| Invalid area codes | Flagged and tagged |

### 11. Data Cleaning (original)
| Check | Action |
|-------|--------|
| Invalid phone (too short, repeated digits) | Flag, don't fix |
| Invalid/placeholder email | Flag |
| Address missing city/state/zip | Flag |

### 12. Quality Scoring (original, enhanced)
Every contact gets a 0-100 score:
- **80+** → `data-quality:good`
- **50-79** → `data-quality:needs-review`
- **<50** → `data-quality:poor`

Score deductions: invalid phone (-20), missing phone (-10), bad area code (-10), invalid email (-10), missing name (-10), suspicious name (-5), missing address (-15), incomplete address (-5 per issue), no source (-10), no attribution (-5).

### 13. Duplicate Detection (original)
- Indexes all contacts by normalized phone (last 10 digits) and normalized address
- Flags groups sharing same phone or address
- **Never auto-merges** — flags only for manual review
- Tag: `data-hygiene:possible-duplicate`

## Tags Applied
| Tag | Meaning |
|-----|---------|
| `data-quality:good` | Score 80+ |
| `data-quality:needs-review` | Score 50-79 |
| `data-quality:poor` | Score <50 |
| `data-hygiene:possible-duplicate` | Shares phone/address with another contact |
| `data-hygiene:untouched` | Zero activity since creation |
| `data-hygiene:missing-fields` | Missing required fields |
| `name-needs-verification` | Suspicious/fake name detected |
| `phone-needs-verification` | Invalid or suspicious area code |
| `needs-county-lookup` | Has address, needs property records research |
| `market:nashville` | Property in Nashville metro |
| `market:chattanooga` | Property in Chattanooga metro |

## DRY_RUN Behavior
- All writes (updateContact, addTag, addNote) go through `isDryRun()` check
- In DRY_RUN mode: logs what WOULD change via `logDryRunAction()`
- In live mode: executes GHL API calls

## State Management
- Tracks each contact by a hash of key fields (name, phone, email, address, tags, source, companyName, timezone)
- Skips contacts that haven't changed since last scan
- Persists to `data/data-hygiene-state.json`

## Control Room
- Registered in `engineLayout` as first engine (before Lead IQ)
- API ID: `data-hygiene`

## Dependencies
- `src/utils/ghl.js` — GHL API client (updateContact, addNote, addTag)
- `src/utils/dryrun-log.js` — dry run logging
- `src/core/tenant-context.js` — multi-tenant support

## County Records — Future Integration
Currently flags contacts for manual lookup. Potential free APIs to integrate:
- **OpenStreetMap/Nominatim** — geocoding/address validation
- **ATTOM Data** — property data (has free tier)
- **County assessor websites** — scraping (per-county, fragile)
- **Zillow API** — property details (limited free access)
- **Regrid/Loveland** — parcel data (limited free tier)

When a suitable free API is found, replace the flagging logic with actual property data enrichment.
