---
name: CallRail
category: crm-external
projects:
  - xhaka
role: Call tracking and voicemail platform — pull and process voicemails
auth_type: api_key
api_base_url: https://api.callrail.com/v3
rate_limits:
  requests_per_minute: 120
  tokens_per_minute: null
pricing_tier: subscription
free_tier_limits: null
key_features:
  - Call tracking with attribution
  - Voicemail recording and transcription
  - Call log API
  - Form tracking
known_issues: []
integration_hooks:
  - Xhaka: API key 267bcdd64628abc9c9c4c43e8a46dca2
  - Purpose: Voicemail Bot — pull and process voicemails
  - Scope verified: voicemail read access confirmed by Operator (Mar 09)
alternatives:
  - twilio (more flexible, higher dev effort)
docs_url: https://apidocs.callrail.com
changelog_url: https://www.callrail.com/blog/product-updates
last_reviewed: 2026-03-11
notes: ""
---

## Notes

API key scope verified by Operator Mar 09 — voicemail read access confirmed. Voicemail Bot integration pending wiring in Xhaka services.
