---
title: Xhaka Cost Optimizer (Smart Routing)
description: Protocol for minimizing token spend while maintaining high-quality reasoning.
---
# 💰 Cost Optimizer (Smart Routing)

We do not use "One Brain for everything." We route tasks based on their complexity tier.

## 📉 Tier 1: Utility (Gemini Flash / GPT-4o-mini)
**Cost**: ~$0.10 - $0.15 / M tokens
**Tasks**: 
- Inbox polling (Capture)
- File organization (Organize)
- Transcription/Cleaning
- Simple Slack/Telegram replies

## 🧠 Tier 2: Logical (Claude Haiku / DeepSeek)
**Cost**: ~$0.14 - $0.80 / M tokens
**Tasks**: 
- Researching articles (Researcher)
- Basic code auditing
- Drafting routine emails
- Updating People profiles

## 👑 Tier 3: Strategic (Claude Sonnet / GPT-4o)
**Cost**: ~$2.50 - $3.00 / M tokens
**Tasks**: 
- System Architecture (The Architect)
- Complex Coding (The Builder)
- Strategic Decision Support (Xhaka COO)
- High-value Deal Analysis (NAH/Gunner)

## 📋 Optimization Rules
1. **Default to Bottom**: Always try a Tier 1 model first for automated jobs.
2. **Upgrade on Failure**: If a Tier 1 job fails or produces "Low Quality" (Score < 60), the Dispatcher must re-queue with a Tier 2 brain.
3. **Corey Override**: Corey can manually force a Tier 3 brain for any session via `/model sonnet`.

---
*Status: Architecture established 2026-03-14. Implementing via Dispatcher.*
