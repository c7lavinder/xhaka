# Session Memory Capture - 2026-03-20-0431

Captured: Friday, March 20, 2026 - 4:31 AM CST

---

## KEY DECISIONS

### Paperclip as Execution Layer
- Decision: Paperclip is not just a board - it is the execution layer. Go all-in.
- claude_local agents are the right approach: persistent state, heartbeats, issue context
- Agents are peers (not hierarchy) - Builder is not in charge
- For 50 companies: Paperclip scales natively (one instance, 50 company boards)
- Model tiering: Railway jobs = GPT-mini; Paperclip agents = Claude subscription (OAuth, flat rate)

### Agent Routing Rule (Corey correction)
- Stop defaulting to Builder - route by domain, not habit
- Auditor has not been real - has been Xhaka doing final check. Needs to fire independently.
- Current quality gate bottleneck = Xhaka. Paperclip heartbeats fix this.

### Architecture Confirmed
- Agents working on even playing field, not Builder-centric

### Paperclip Configuration Fixed (2026-03-20 ~2 AM)
- Root cause: all agents had empty adapterConfig (no cwd), causing workspace errors
- Fixed: adapterType=claude_local + adapterConfig.cwd on all 6 worker agents
- Fixed: reset 4 agents from error to idle
- Real-time loop confirmed: assigning XHAA-19 triggered live WebSocket heartbeat

### Issues in Paperclip
- XHAA-14: Intelligence jobs failed since March 12 (high)
- XHAA-15: OpenAI key missing (high)
- XHAA-16: Session transcript on restart (medium)
- XHAA-17: Gunner CRM degraded (critical)
- XHAA-18: Control Room stale HTML (critical)
- XHAA-19: Paperclip real-time loop (in_progress)

---

## RULES COREY STATED

1. Stop saying Builder by default - route tasks by domain
2. Agents are peers - no agent is more important than another
3. Dial max turns down: Builder 25-50, not 300
4. Test one real end-to-end task through Paperclip before fully committing

---

## OPEN TASKS

- [ ] Confirm Builder spawn worked end-to-end
- [ ] Gunner CRM degraded - Builder SDD needed (XHAA-17)
- [ ] Control Room Next.js API routes 404 - Builder SDD (XHAA-18)
- [ ] Intelligence jobs broken since March 12 - Builder SDD (XHAA-14)
- [ ] OpenAI key missing from auth store - Operator (XHAA-15)
- [ ] WILL RIDDLE screen share Monday after 2 PM CST - NO REMINDER SET YET
- [ ] Control Room must be fixed before Monday demo
- [ ] Dial max turns down on Paperclip agents
- [ ] Test one real end-to-end task through Paperclip
- [ ] Fix: session transcript not loaded on restart - Builder SDD (XHAA-16)

---

## SYSTEM STATE AS OF 4:31 AM CST

- Gunner CRM: degraded (was fixed 10 AM 3/19, regressed)
- Control Room: serving old HTML (Next.js API routes 404)
- improve/cleanup/synthesize jobs: FAILED since March 12
- OpenAI key: missing from auth store
- Memory synthesis: DONE (ran 2026-03-20 ~1:20 AM)
- MEMORY.md: 126 lines OK
- Paperclip: configured, real-time loop confirmed working
- Goals in Paperclip: NAH $300k/mo net and Gunner 100 customers structured

---

## CONTEXT

Gateway restarted ~12:54 AM CST (triggered by ACP permissionMode config change).
New session = blank conversation slate. Facts/jobs on disk survived. Conversation thread did not.
Fix queued: XHAA-16.
