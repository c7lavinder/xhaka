---
title: "AI Agent Orchestration Frameworks — State of Play (March 2026)"
category: tooling
tags: [AI-agents, orchestration, LangGraph, CrewAI, Claude-SDK, MCP, TypeScript]
summary: "LangGraph owns stateful orchestration, CrewAI owns rapid multi-agent prototyping with MCP+A2A, Claude Agent SDK owns MCP-native development. For Xhaka's TypeScript stack, Claude Agent SDK and Mastra are the strongest fits."
date: 2026-03-20
source: multiple
---

## Framework Landscape

### Tier 1 — Production-Grade
| Framework | Owner | Language | Strength | MCP Support |
|-----------|-------|----------|----------|-------------|
| **LangGraph** | LangChain | Python, JS/TS | Complex stateful workflows, persistence, checkpointing | Via tools |
| **CrewAI** | CrewAI Inc | Python | Rapid multi-agent prototyping, role-based agents | MCP + A2A |
| **Claude Agent SDK** | Anthropic | TypeScript, Python | MCP-native, in-process server model, lifecycle hooks | Native |
| **OpenAI Agents SDK** | OpenAI | Python | Simplicity, zero-to-working-agent speed | Via tools |

### Tier 2 — Specialized
| Framework | Owner | Language | Strength |
|-----------|-------|----------|----------|
| **Mastra** | Mastra | TypeScript-first | TS-native agent orchestration, good for Node.js stacks |
| **Semantic Kernel** | Microsoft | C#, Python | Enterprise, deep Azure integration |
| **Google ADK** | Google | Python | Multi-agent orchestration for Gemini |
| **Strands Agents** | AWS | Python | Model-agnostic with optional deep AWS integration |
| **Pydantic AI** | Pydantic | Python | Type-safe Python agents |
| **Agno** | Agno | Python | Fast agent SDK with optional managed platform |

Sources: [Let's Data Science](https://letsdatascience.com/blog/ai-agent-frameworks-compared), [Design Revision](https://designrevision.com/blog/ai-agent-frameworks), [o-mega](https://o-mega.ai/articles/langgraph-vs-crewai-vs-autogen-top-10-agent-frameworks-2026)

## Key Architectural Differences

**LangGraph** — Graph-based. Agents are nodes, edges are transitions. Best for complex decision pipelines with conditional logic, branching, and parallel processing. Strongest persistence/checkpointing story.

**CrewAI** — Role-based. Define agents with roles/goals/backstories, organize into "crews." Mental model: team of specialists, not a flowchart. Three concepts: Agents, Tasks, Crews. Largest community. Broadest protocol support (MCP + A2A).

**Claude Agent SDK** — MCP-native. In-process server model with lifecycle hooks. Best when building on Anthropic models with MCP tool ecosystem.

**OpenAI Agents SDK** — Simplest. Gets teams from zero to working agent fastest. Best for OpenAI-stack shops.

## Why This Matters

**For Xhaka's stack (TypeScript, MCP-heavy):**
1. **Claude Agent SDK is the natural fit.** Xhaka already uses MCP extensively. The SDK's native MCP support and TypeScript-first design align perfectly.
2. **Mastra is worth tracking** as the only TS-first alternative with real traction.
3. **CrewAI's A2A support** matters if Xhaka agents need to talk to external agent systems (e.g., client agents, marketplace agents).
4. **LangGraph is overkill** unless Xhaka needs complex graph-based state machines — the dispatcher pattern already handles this.

**Decision:** Stay on Claude Agent SDK for core orchestration. Monitor Mastra for TS-native patterns. Watch CrewAI's A2A protocol for future agent interop needs.
