# Jose (JWT)

**Category:** Auth & Security
**Status:** 🟢 Active

## Purpose
JWT token creation and verification in Gunner. Handles auth tokens for the session management system.

## Usage in Stack
- Used alongside jsonwebtoken (consolidation to jose-only is a pending task)
- Auth flow in `server/_core/context.ts`
- Token verification on every tRPC request

## Configuration
- No API key needed
- Docs: https://github.com/panva/jose

## Notes
- ⚠️ Duplicate: both `jose` AND `jsonwebtoken` are installed in Gunner — should consolidate to `jose` only
- jose is the modern standard; jsonwebtoken is legacy

## Last Updated
2026-03-12