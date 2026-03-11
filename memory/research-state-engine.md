# Research: Event Processing & State Engines for Gunner

## Executive Summary
For a 2-person team needing **time-based triggers** and **event composition** without managing heavy infrastructure, **Inngest** or **Trigger.dev** are the top contenders. They offer "durable execution" (code that sleeps/retries reliably) without the complexity of Temporal.

If self-hosting is a strict requirement to avoid SaaS costs, **Windmill** or **n8n** are the best options, though they require more setup for complex event patterns compared to the code-first nature of Inngest/Trigger.dev.

---

## 1. Workflow/Event Engines (Code-First)

### **Inngest** (Top Recommendation for Speed)
1.  **What it is:** Event-driven durable execution platform that turns your API endpoints into long-running, stateful workflows.
2.  **Pricing:** Free tier (fairly generous), then usage-based.
3.  **Self-hosted:** No official self-hosted open-source version (SaaS control plane), but the *execution* happens on your servers.
4.  **Time-based triggers:** Native `step.sleep('48h')`.
5.  **Event composition:** Native `step.waitForEvent('event.B', { timeout: '15m' })` — exactly what you need for "speed-to-lead" logic.
6.  **Node/TS:** First-class TypeScript SDK.
7.  **Complexity:** Low. You just write a function. No separate worker fleet to manage (it calls your API).
8.  **Verdict:** **Buy/Consider.** Best developer experience for this specific problem set.

### **Trigger.dev (v3)**
1.  **What it is:** Open-source, durable serverless background jobs framework with no timeouts.
2.  **Pricing:** Usage-based cloud; Open Source is free.
3.  **Self-hosted:** Yes, fully self-hostable (Docker).
4.  **Time-based triggers:** Native `wait` functions.
5.  **Event composition:** Supports "wait for event" patterns.
6.  **Node/TS:** Excellent TypeScript support.
7.  **Complexity:** Low-Medium. Easier than Temporal, slightly more "infra" feel than Inngest if self-hosting.
8.  **Verdict:** **Consider.** Strongest contender if you want open-source/self-hosted durable execution.

### **Temporal.io**
1.  **What it is:** The gold standard for durable execution; runs code that never fails, guaranteeing completion.
2.  **Pricing:** Cloud is consumption-based; Self-hosted is free (but heavy).
3.  **Self-hosted:** Yes, but requires running a cluster (Cassandra/ES, etc.).
4.  **Time-based triggers:** Native support for long sleeps (days/months).
5.  **Event composition:** Signals and Queries allow complex event handling.
6.  **Node/TS:** Great SDK, but steeper learning curve (Activities vs Workflows).
7.  **Complexity:** High. Overkill for a 2-person team unless you have previous experience.
8.  **Verdict:** **Skip** (unless you scale massively).

### **Windmill**
1.  **What it is:** Fast, self-hostable developer platform for scripts (Python/TS) and flows.
2.  **Pricing:** Generous free tier; Enterprise for advanced features.
3.  **Self-hosted:** Yes, excellent self-hosting support.
4.  **Time-based triggers:** Supports scheduled flows and suspending execution.
5.  **Event composition:** Can wait for webhooks/events to resume flows.
6.  **Node/TS:** Supports TypeScript scripts natively (Deno-based runtime usually).
7.  **Complexity:** Medium. Good UI, but "flow" logic is different from pure code.
8.  **Verdict:** **Consider** (if you want a UI + Code hybrid).

---

## 2. Event Processing (Infrastructure-First)

### **BullMQ (Redis)**
1.  **What it is:** Robust message queue for Node.js based on Redis.
2.  **Pricing:** Free (MIT License). Pro version available.
3.  **Self-hosted:** Yes (requires Redis).
4.  **Time-based triggers:** Delayed jobs are supported.
5.  **Event composition:** Difficult. You have to manually manage state (check DB when job runs) or use FlowProducer for parent/child jobs. "Wait for event" is not native.
6.  **Node/TS:** Native.
7.  **Complexity:** Low setup, High maintenance for complex logic (you write the state machine yourself).
8.  **Verdict:** **Skip** for the "intelligence layer" (too manual for event composition). Keep for simple background tasks.

---

## 3. Low-code/iPaaS (Visual-First)

### **n8n**
1.  **What it is:** Workflow automation tool with a node-based visual editor.
2.  **Pricing:** Paid cloud plans; "Community Edition" generally free/fair-code for internal business use.
3.  **Self-hosted:** Yes, very popular self-hosted option.
4.  **Time-based triggers:** "Wait" node supports time delays.
5.  **Event composition:** "Wait" node can wait for a webhook/trigger. Logic can be complex to visualize for advanced state.
6.  **Node/TS:** Can write JavaScript/TS in "Code" nodes.
7.  **Complexity:** Low to start, but "spaghetti" flows can get unmanageable.
8.  **Verdict:** **Consider** (if you prefer visual builders over code).

---

## Final Recommendation for Gunner

**Top Choice: Inngest**
*   **Why:** It solves the exact problem ("event A + wait for event B") with a single function. It requires zero infrastructure management (it just calls your existing Next.js/Express API). It scales down to zero and up infinitely.
*   **Cost:** Likely free for early stage; predictable scaling.
*   **Implementation:** install SDK -> write function -> deploy.

**Runner Up (Self-Hosted): Trigger.dev**
*   **Why:** Similar capabilities to Inngest but open source. You can run it on your own metal if needed.

**Runner Up (Hybrid): Windmill**
*   **Why:** If you want a dashboard to view/debug these scripts and potentially let non-engineers tweak parameters, Windmill is a great middle ground.

### Comparison Table

| Feature | Inngest | Trigger.dev | Temporal | n8n |
| :--- | :--- | :--- | :--- | :--- |
| **Wait for Event** | Native (1 line) | Native | Native (Signals) | Supported (Wait Node) |
| **Infra Load** | None (SaaS) | Low (SaaS/Docker) | High | Low (Docker) |
| **Sleep (48h)** | Native | Native | Native | Native |
| **Dev Exp** | Excellent (TS) | Excellent (TS) | Good (TS) | Visual + Code |
| **Cost** | Usage | Usage | Usage/Infra | Usage/Self-host |
