---
name: jose
category: auth-security
projects:
  - gunner
  - xhaka
role: JWT signing and verification — auth tokens for API access
auth_type: none
api_base_url: null
rate_limits:
  requests_per_minute: null
  tokens_per_minute: null
pricing_tier: open-source
free_tier_limits: unlimited
key_features:
  - JWS, JWE, JWK, JWA support
  - Edge runtime compatible (no Node.js crypto dependency)
  - Async API with Web Crypto
  - RS256, HS256, ES256 algorithm support
power_user_features:
  - JWKS (JSON Web Key Set) for rotating keys
  - Compact serialization for short tokens
known_issues:
  - jsonwebtoken package ALSO in stack — duplicate JWT library, consolidate to jose
integration_hooks:
  - Gunner/Xhaka: JWT verify and sign
alternatives:
  - jsonwebtoken (deprecated in this stack — remove)
docs_url: https://github.com/panva/jose
changelog_url: https://github.com/panva/jose/releases
last_reviewed: 2026-03-11
notes: ""
---

## Notes

Preferred JWT library — edge-compatible, modern async API. **Action required:** Remove `jsonwebtoken` from package.json and migrate all `verify`/`sign` calls to `jose`. Duplicate libraries increase bundle size and create inconsistency.
