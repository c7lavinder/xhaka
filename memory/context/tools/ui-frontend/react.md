# React

**Category:** UI & Frontend
**Status:** 🟢 Active

## Purpose
Primary UI framework for Gunner's frontend. Powers the dashboard, call coaching interface, leaderboard, and all user-facing screens.

## Usage in Stack
- Version: React 19
- Build tool: Vite 7
- Component library: shadcn/ui (54+ components)
- Routing: Wouter v3 (NOT React Router)
- State: TanStack Query v5 (server state) + React state (local)
- Forms: React Hook Form + Zod v4

## Configuration
- No API key needed
- Docs: https://react.dev

## Notes
- React 19 — use new features carefully (concurrent features, transitions)
- Never bypass tRPC with raw fetch in components
- Framer Motion used in xhaka-control-room (not Gunner)

## Last Updated
2026-03-12