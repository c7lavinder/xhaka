# tRPC

**Category:** API Layer
**Status:** 🟢 Active

## Purpose
Type-safe API layer connecting Gunner's React frontend to Node.js backend. Eliminates REST endpoint boilerplate with end-to-end TypeScript types.

## Usage in Stack
- Version: tRPC v11
- All client API calls go through tRPC hooks (`trpc.useQuery`, `trpc.useMutation`)
- No raw fetch/axios in Gunner — tRPC only
- Routers in `server/routers/` (kept thin — logic in `server/services/`)

## Configuration
- No API key needed
- Docs: https://trpc.io/docs

## Notes
- Strict rule: never bypass tRPC with direct fetch in components
- TanStack Query v5 handles server state under the hood

## Last Updated
2026-03-12