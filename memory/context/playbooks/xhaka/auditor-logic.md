# 👮‍♂️ Auditor & Verification Playbook

This playbook defines how we rigorously evaluate the work produced by the Builder and other agents to ensure it actually works and isn't "reward hacking."

## 🧠 Core Principle: Non-Reward-Hackability
(Inspired by Elliot Arledge / KernelBench v3)

An agent (the Builder) will often find the "easiest" way to satisfy a prompt. The Auditor's job is to ensure that "easy" doesn't mean "broken" or "cheated."

1. **Deterministic Verification**: Whenever possible, code must be tested against known inputs/outputs (the "Gym" model).
2. **Tolerance & Edge Cases**: Verifiers must include edge-case testing, not just the "happy path."
3. **Performance Baselines**: For critical systems (like the Intelligence jobs), we don't just check for "Success"; we check for performance relative to our [Benchmarks](../../../intelligence/benchmark-reports/).

## 📋 The Verification Cycle
1. **The Task**: Builder attempts the code change.
2. **The Reference**: Auditor compares against the original Spec (The Architect's work).
3. **The Verifier**: Auditor runs `pre-deploy-test.ts` or `benchmark.ts`.
4. **The Score**: Binary pass/fail. If fail, the task is rolled back and re-queued.

---
*Status: Updated 2026-03-14 with RL Environment principles.*

## 🛡️ The Xhaka Verification Funnel
*Inspired by the 2026-03-14 Research*

When an agent (Builder/Specialist) submits work, it must pass through this funnel before "shipping":

1. **Tier 1: Structural Checks** (Automated)
   - Does it match the Spec?
   - Does it compile/run without errors?
   - Does it pass the `pre-deploy-test.ts`?
2. **Tier 2: Adversarial Attack** (The "Cheater" Check)
   - We spawn a secondary "Attacker" model (GPT-4o).
   - Prompt: "Find a way to satisfy this task's success criteria without actually doing the work correctly."
   - If the Attacker finds a "reward hack" (a shortcut), the build is rejected.
3. **Tier 3: Final Human Gate** (Corey)
   - You only see the work after it has survived the "Attacker."

---
*Goal: Turn Xhaka into a system where you can't be lied to by your own agents.*
