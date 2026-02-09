# PPL Refund Bot

Gunner add-on that automates Pay-Per-Lead refund requests.

## What It Does

1. **Monitors GHL leads** — Identifies leads from PPL sources (PropertyLeads, MotivatedSellers, Leadzolo)
2. **Detects issues** — Disconnected numbers, duplicates, no response, wrong info, etc.
3. **Compiles evidence** — Pulls call logs, SMS, notes from GHL
4. **Files disputes** — Browser automation to fill platform dispute forms
5. **Tracks results** — Money recovered, approval rates, pending disputes

## Supported Platforms

| Platform | Dispute Window | Filing Method |
|----------|---------------|---------------|
| Leadzolo | 7 days | Form at return policy page |
| MotivatedSellers | 10 days | Portal dispute form |
| PropertyLeads | 7 days | Inline form per lead |

## Tenant Setup (~2 min)

1. Enable add-on in Gunner marketplace
2. Select which PPL platforms you use
3. Enter credentials for each platform
4. Choose automation level:
   - **Full Auto** — File automatically for clear-cut cases
   - **Semi-Auto** — Queue all for approval
   - **Manual** — Just detect and alert

## Detection Logic

**Auto-file eligible (high confidence):**
- Disconnected number
- Wrong number
- Duplicate lead
- Invalid/fake data
- Wrong market/property type

**Queued for approval (needs review):**
- No response after 5+ attempts
- Not property owner
- Wholesaler
- MLS listed

## Usage

```typescript
import { createPPLRefundBot, TenantConfig } from '@gunner/ppl-refund-bot';

const config: TenantConfig = {
  tenantId: 'abc123',
  companyName: 'Acme Investing',
  platforms: {
    leadzolo: {
      enabled: true,
      credentials: { email: 'user@acme.com', password: 'encrypted' },
      disputeWindow: 7,
    },
    // ... other platforms
  },
  automation: {
    level: 'semi-auto',
    autoFileReasons: ['disconnected', 'duplicate'],
    queueReasons: ['no_response', 'not_owner'],
  },
  detection: {
    noResponseDays: 5,
    noResponseAttempts: 5,
    duplicateWindowDays: 90,
  },
  notifications: {
    onFiled: true,
    onResolved: true,
    weeklyReport: true,
    deadlineAlerts: true,
  },
};

const bot = createPPLRefundBot(config);
await bot.initialize();

// Process leads from GHL
const disputes = await bot.processLeads(
  leads,
  getCallLogs,
  getSMSLogs,
  getNotes
);

// Handle based on automation level
const { autoFiled, queued, manual } = await bot.processDisputes(disputes);

// Cleanup
await bot.shutdown();
```

## Security

- Credentials encrypted at rest (AES-256)
- Bot NEVER adds/changes bids
- Only files disputes as authorized

## Files

```
ppl-refund/
├── SPEC.md              # Full specification
├── README.md            # This file
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts         # Main entry point
    ├── types.ts         # Type definitions
    ├── detection.ts     # Issue detection engine
    └── platforms/
        ├── leadzolo.ts
        ├── motivatedsellers.ts
        └── propertyleads.ts
```
