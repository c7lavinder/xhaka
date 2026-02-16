# Data Hygiene Bot — SPEC

## Overview
Sits BEFORE Lead IQ in the pipeline. Cleans and enriches every GHL contact so downstream bots (Lead IQ, Signals, Follow Up, etc.) work with complete, consistent data.

## Architecture
- **Engine:** `src/engines/data-hygiene/index.js`
- **Config:** `src/config/data-hygiene-config.js`
- **Schedule:** Every 2 hours (cron: `10 */2 * * *`)
- **State:** `data/data-hygiene-state.json` (tracks processed contacts by hash — skips unchanged)
- **Rate limiting:** Batches of 50 contacts with 2s delay between batches

## What It Does

### 1. Data Cleaning
| Check | Action |
|-------|--------|
| Invalid phone (too short, repeated digits, 555) | Flag, don't fix |
| Invalid/placeholder email (test@, noreply@, typos) | Flag |
| Name ALL CAPS | Normalize to Title Case |
| Name extra whitespace | Trim |
| Address abbreviations (St → Street) | Normalize |
| Address missing city/state/zip | Flag |

### 2. Data Enrichment
| Check | Action |
|-------|--------|
| Missing attribution source | Set from `source` field (fixes Lead IQ bug) |
| PPL source inconsistency | Standardize to canonical: `leadzolo`, `propertyleads`, `motivatedsellers` |
| Missing required fields (name, phone, address) | Tag `data-hygiene:missing-fields` |
| Zero activity since creation | Tag `data-hygiene:untouched` |

### 3. Quality Scoring
Every contact gets a 0-100 score:
- **80+** → `data-quality:good`
- **50-79** → `data-quality:needs-review`
- **<50** → `data-quality:poor`

Score deductions: invalid phone (-20), missing phone (-10), invalid email (-10), missing name (-10), missing address (-15), incomplete address (-5 per issue), no source (-10), no attribution (-5).

### 4. Duplicate Detection
- Indexes all contacts by normalized phone (last 10 digits) and normalized address
- Flags groups of contacts sharing same phone or address
- **Never auto-merges** — flags only for manual review
- Tag: `data-hygiene:possible-duplicate`

## DRY_RUN Behavior
- All writes (updateContact, addTag) go through `isDryRun()` check
- In DRY_RUN mode: logs what WOULD change via `logDryRunAction()`
- In live mode: executes GHL API calls

## State Management
- Tracks each contact by a hash of key fields (name, phone, email, address, tags, source)
- Skips contacts that haven't changed since last scan
- Persists to `data/data-hygiene-state.json`

## Control Room
- Registered in `engineLayout` as first engine (before Lead IQ)
- 4 bots: Data Cleaner, Data Enrichment, Duplicate Detector, Quality Scorer
- API ID: `data-hygiene`

## Dependencies
- `src/utils/ghl.js` — GHL API client
- `src/utils/dryrun-log.js` — dry run logging
- `src/core/tenant-context.js` — multi-tenant support
