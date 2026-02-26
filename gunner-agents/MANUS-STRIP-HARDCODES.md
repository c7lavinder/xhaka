# Gunner V2 — Strip All Hardcoded Names & IDs
**Date:** Feb 26, 2026  
**Priority:** HIGH — do this before any new agent work  
**Rule:** Zero NAH-specific data in agent/bot code. Everything from env vars or config.

---

## Why This Matters

Gunner is a multi-tenant product. Any hardcoded name, calendar ID, user ID, or company reference
locks the code to NAH and breaks every future customer.

---

## Exact Fixes Required

### 1. `src/bots/appointment.ts` — Hardcoded calendar IDs + person-named env vars

**Problem:**
```ts
// Hardcoded NAH calendar IDs as defaults
const CALENDAR_DEFAULTS = {
  walkthrough:                 'y0r0nS6fKHeypYaVAAZd',   // NAH only
  'offer-call':                'JFnptaNnUpgcHT6ptdDI',   // NAH only
  'qualification-call-daniel': 'w9RlzCODB6CYlNI12ilN',   // NAH + person-specific
  'qualification-call-chris':  'ngqJGIxjVJi0WKkjKY2V',   // NAH + person-specific
};

// Person-named env vars
process.env['GHL_USER_ID_KYLE']
process.env['GHL_USER_ID_DANIEL']
process.env['GHL_USER_ID_CHRIS']
process.env['GHL_CALENDAR_QUAL_DANIEL']
process.env['GHL_CALENDAR_QUAL_CHRIS']
```

**Fix:**
- Remove ALL hardcoded calendar ID defaults — no fallback to NAH IDs. If env var not set, skip booking and log a warning.
- Replace person-named env vars with role-based ones:

| Old (broken) | New (correct) |
|---|---|
| `GHL_USER_ID_KYLE` | Derived from `ROLE_AM_IDS` (first entry) |
| `GHL_USER_ID_DANIEL` | Derived from `ROLE_LM_IDS` (first entry) |
| `GHL_USER_ID_CHRIS` | Derived from `ROLE_LM_IDS` (second entry) |
| `GHL_CALENDAR_QUAL_DANIEL` | `GHL_CALENDAR_QUAL_LM_1` |
| `GHL_CALENDAR_QUAL_CHRIS` | `GHL_CALENDAR_QUAL_LM_2` |
| `GHL_CALENDAR_WALKTHROUGH` | Keep — already generic ✅ |
| `GHL_CALENDAR_OFFER_CALL` | Keep — already generic ✅ |

**Updated `getTeamIds()`:**
```ts
function getTeamIds() {
  const amIds = (process.env['ROLE_AM_IDS'] ?? '').split(',').map(s => s.trim()).filter(Boolean);
  const lmIds = (process.env['ROLE_LM_IDS'] ?? '').split(',').map(s => s.trim()).filter(Boolean);
  return {
    am1: amIds[0] ?? '',      // primary AM
    lm1: lmIds[0] ?? '',      // primary LM
    lm2: lmIds[1] ?? '',      // secondary LM
  };
}
```

**Updated calendar routing for qualification-call:**
```ts
if (aptType === 'qualification-call') {
  const team = getTeamIds();
  const calKey = repUserId === team.lm2 ? 'GHL_CALENDAR_QUAL_LM_2' : 'GHL_CALENDAR_QUAL_LM_1';
  const calendarId = process.env[calKey];
  if (!calendarId) {
    log.warn(`${calKey} not set — skipping appointment booking`);
    return null;
  }
  return { calendarId, assignedUserId: repUserId ?? team.lm1 };
}
```

---

### 2. `public/gunner-data.js` — Hardcoded rep name in UI

**Line 206:**
```js
bullets.push('👉 What this means: This is a priority lead. Daniel should call NOW — hot leads go cold fast.');
```

**Fix:**
```js
bullets.push('👉 What this means: This is a priority lead. Your LM should call NOW — hot leads go cold fast.');
```

---

### 3. `src/agents/apt-prep-agent.ts` — Comments with NAH calendar IDs

Lines 6-7 reference hardcoded calendar IDs in JSDoc. Not runtime but should be cleaned:
```ts
// Before:
*   - Walkthrough calendar (y0r0nS6fKHeypYaVAAZd)
*   - Offer Call calendar (JFnptaNnUpgcHT6ptdDI)

// After:
*   - Walkthrough calendar (GHL_CALENDAR_WALKTHROUGH env var)
*   - Offer Call calendar (GHL_CALENDAR_OFFER_CALL env var)
```

---

### 4. `src/core/config/reader-bot.ts` — NAH calendar ID in example

**Line 301:**
```ts
// Before:
* e.g. calendarType('y0r0nS6fKHeypYaVAAZd') → 'walkthrough'

// After:
* e.g. calendarType(process.env.GHL_CALENDAR_WALKTHROUGH) → 'walkthrough'
```

---

## What's Already Clean ✅

These are correctly using env vars or config — do NOT change:
- All stage IDs pulled from `config.stageId(name)` — ✅
- All pipeline IDs from env vars — ✅  
- All user IDs derived from `ROLE_LM_IDS` / `ROLE_AM_IDS` — ✅ (mostly)
- `companyName` field — ✅ (from tenant config, not hardcoded)
- `ROLE_LM_IDS` / `ROLE_AM_IDS` env var names themselves — ✅ generic

---

## New Railway Env Vars Needed for NAH

After this code change, set these on Railway to replace the old person-named vars:

| Var | Value |
|-----|-------|
| `GHL_CALENDAR_QUAL_LM_1` | `w9RlzCODB6CYlNI12ilN` (Daniel's calendar) |
| `GHL_CALENDAR_QUAL_LM_2` | `ngqJGIxjVJi0WKkjKY2V` (Chris's calendar) |
| `GHL_CALENDAR_WALKTHROUGH` | `y0r0nS6fKHeypYaVAAZd` |
| `GHL_CALENDAR_OFFER_CALL` | `JFnptaNnUpgcHT6ptdDI` |

Remove the old person-named vars once the new code is deployed.

---

## Completion Checklist

- [ ] `src/bots/appointment.ts` — remove hardcoded defaults, rename env vars to role-based
- [ ] `public/gunner-data.js` line 206 — replace "Daniel" with "Your LM"
- [ ] `src/agents/apt-prep-agent.ts` — clean JSDoc comments
- [ ] `src/core/config/reader-bot.ts` — clean example comment
- [ ] Set new Railway env vars (listed above)
- [ ] Remove old `GHL_USER_ID_KYLE`, `GHL_USER_ID_DANIEL`, `GHL_USER_ID_CHRIS` from Railway if they exist
- [ ] Confirm no other files contain `Kyle`, `Daniel`, `Chris`, `Esteban`, `Jessica`, `New Again Houses`, or any NAH-specific IDs in runtime code (comments OK)
