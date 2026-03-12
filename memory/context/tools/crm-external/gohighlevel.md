---
name: GoHighLevel
category: crm-external
projects:
  - gunner
  - xhaka
role: CRM and automation platform for New Again Houses — contacts, pipelines, webhooks, SMS/calls
auth_type: api_key
api_base_url: https://services.leadconnectorhq.com
rate_limits:
  requests_per_minute: 100
  tokens_per_minute: null
pricing_tier: subscription
free_tier_limits: null
key_features:
  - Contact management and pipeline stages
  - Webhook triggers for lead events
  - Two-way SMS via Twilio subaccount
  - Custom fields and tags
  - Automation workflows
power_user_features:
  - Sub-account API for white-label
  - Custom webhooks per pipeline stage
  - Conversation AI (beta) for SMS follow-up
known_issues:
  - Webhook rate limit not profiled — add queue with 100/min throttle and burst detection
  - OTP codes for login go to spam — check spam folder for ghl.newagainhouses.com emails
  - API documentation sparse for newer endpoints — test in sandbox first
integration_hooks:
  - Gunner: pulls calls automatically from GHL pipeline
  - Xhaka: Operator uses GHL UI for config, not API
  - Account: New Again Houses Nashville
alternatives:
  - hubspot (more enterprise, higher cost)
  - close.com (better for outbound sales teams)
docs_url: https://highlevel.stoplight.io/docs/integrations
changelog_url: https://changelog.gohighlevel.com
last_reviewed: 2026-03-11
notes: ""
---

## Notes

READ ONLY unless Corey explicitly approves an action. Login: xhakalavinder@gmail.com. Gunner pulls calls automatically — pipeline stage IDs mapped by Operator (6 stages, 2 custom fields, Mar 10). Webhook volume profiling pending.
