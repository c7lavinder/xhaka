# Research: Production AI Agent Architecture (The "Agentic Loop" Guide)

- **Source:** "How to build AI agents in one day (full course)"
- **Key Philosophy:** An agent is a **worker**, not a chatbot. Chatbots are `input -> output`. Agents are `input -> think -> act -> observe -> loop -> output`.

## The Agentic Loop (Mechanical)
- **Stop Signal:** Use `stop_reason: "end_turn"` (API level), **NEVER** natural language parsing (e.g., checking if the model said "I'm done"). Natural language is ambiguous; API signals are not.
- **Anti-Pattern:** Don't use iteration caps as the primary stop mechanism—use them only as a safety net.

## 7 Principles for Production Agents
1. **Plan Before You Prompt:** Write a spec document defining: Goal, Tools, Success/Failure criteria, and Human-Escalation triggers.
2. **Minimum Tools:** Every tool is a decision. More tools = more chances for the model to pick the wrong one. Start with 3-5 max.
3. **Structured Error Handling:** Tools must return structured JSON (status: success/error/no_results) with a `suggestion` field so the model knows how to recover (e.g., "Try a broader search").
4. **Programmatic Enforcement:** Don't rely on prompts for high-stakes boundaries (refunds, deletes). Use **code-level interceptors** to block actions that exceed thresholds.
5. **Multi-Agent Hub-and-Spoke:** Use a Coordinator. **CRITICAL:** Sub-agents do NOT inherit conversation history. You must pass all required context explicitly in every sub-agent spawn.
6. **Adversarial Testing:** Test with "Worst Case" inputs: empty, contradictory, 10x too long, or malicious ("ignore instructions").
7. **Structured Logging:** Log every message, tool call, reasoning step, and token count in JSON. If you can't reconstruct the run from logs, you can't debug it.

## Common Failure Patterns
- **Infinite Loop:** Fix by force-injecting a "You've tried this 3 times, try something else" message.
- **Hallucination Fallback:** Fix by explicit "I don't know" instructions when tools return no results.
- **Context Overflow:** Fix with periodic summarization to compress history.

## Strategic Takeaway for Gunner
- **Sub-Agent Context:** When Xhaka spawns the Builder, we must ensure the `task` passed in `sessions_spawn` is a self-contained "Mega-Prompt" with all relevant architectural context (as sub-agents start with a blank slate).
- **Tool Descriptions:** Our GHL and DB tool descriptions must be updated to include "When NOT to use" instructions to prevent model confusion.
- **Boundary Gates:** Any "Delete" or "SMS Blast" tool in Gunner must have a programmatic confirmation gate, not just a prompt instruction.
