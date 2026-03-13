# Drizzle ORM

**Category:** Database & Storage
**Status:** 🟢 Active

## Purpose
Type-safe ORM for Gunner's PostgreSQL database. Defines and manages 76 tables across the Gunner schema.

## Usage in Stack
- Version: Drizzle ORM v0.44
- Schema source of truth: `drizzle/schema.ts`
- Migrations via `pnpm run db:push`
- Every query MUST include `tenantId` for multi-tenant isolation

## Configuration
- No API key needed
- Docs: https://orm.drizzle.team/docs

## Notes
- ⚠️ Rule: ALL queries scoped to `ctx.user.tenantId` — no exceptions
- 76 tables total (migrations 0000-0077, MySQL legacy ignored)
- Migrations 0000-0077 are legacy MySQL — use Postgres only

## Last Updated
2026-03-12