# LangSmith

**Category:** Observability
**Status:** 🟡 Installed (Not Wired)

## Purpose
AI observability platform — tracks every LLM call, debug traces, latency, and performance metrics for AI agents.

## Usage in Stack
- Installed in Gunner, API key configured
- BUT: `server/_core/llm.ts` uses native OpenAI calls, not LangChain
- Result: LangSmith is installed but produces NO traces

## Configuration
- API Key: Configured ✓ (`LANGCHAIN_API_KEY` in env)
- Docs: https://docs.smith.langchain.com

## Notes
- ⚠️ Not active — either wire it into llm.ts OR remove to clean up dependencies
- Decision pending: wire LangSmith OR switch to native OpenAI tracing

## Last Updated
2026-03-12