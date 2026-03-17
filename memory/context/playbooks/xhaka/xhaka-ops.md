---
title: Xhaka Operational Standards
description: Core requirements for internal systems (Headless, System-First, Automated Handoffs).
---

## 🛠️ Tooling & Infrastructure Strategy (The "Minecraft Lesson")
*Inspired by the 2026-03-14 RL Research*

**Principle: The Tooling is the Bottleneck.**
We do not build for the sake of the concept; we build to solve the engineering reality of verification.

1. **Headless Execution**: Every automated system (NAH/Gunner) must be able to run "headless" (without UI/human intervention) to allow for high-volume AI rollouts/tests.
2. **Reliable Verifiers**: If we can't build a verifier for a domain (e.g. "is this ad good?"), we don't automate it via RL yet. We focus on deterministic domains first (Code, Data, KPIs).
3. **Out-of-Scope Management**: Explicitly identify domains where verification is too expensive or subjective, and keep those as "Human-in-the-Loop" until the tooling catches up.
