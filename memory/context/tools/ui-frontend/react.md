---
name: React
category: ui-frontend
projects:
  - gunner
role: Frontend UI framework for Gunner call coaching dashboard
auth_type: none
api_base_url: null
rate_limits:
  requests_per_minute: null
  tokens_per_minute: null
pricing_tier: open-source
free_tier_limits: unlimited
key_features:
  - Component-based UI architecture
  - React Query for server state management
  - React Router for SPA navigation
  - Hooks for state and effects
power_user_features:
  - Server Components (React 19)
  - Concurrent rendering
  - Suspense for async data loading
known_issues:
  - React 18 → 19 migration has breaking changes (useEffect behavior)
integration_hooks:
  - Gunner: frontend SPA
alternatives:
  - next.js (full-stack, more opinionated)
  - vue (lighter, but smaller ecosystem for this team)
docs_url: https://react.dev
changelog_url: https://github.com/facebook/react/releases
last_reviewed: 2026-03-11
notes: ""
---

## Notes

Core frontend framework for Gunner. Leaderboard, call grading UI, and playbook viewer all built in React. Paired with React Query for efficient server state caching.
