# LangSmith

**Category:** AI Observability
**Status:** ⚠️ API key exists — NOT wired into Gunner

## Purpose
Tracks every AI agent call in Gunner. Debug traces, performance monitoring, prompt version control.

## Current State
- Account: smith.langchain.com (xhakalavinder@gmail.com)
- API Key: `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`
- Status: CREDENTIALS EXIST. Not connected to any pipeline.

## What to Wire First
The grading pipeline is the highest value target:
1. Set `LANGCHAIN_API_KEY` + `LANGCHAIN_TRACING_V2=true` in Railway env
2. Wrap `gradeCall()` with LangSmith tracing
3. Every grade attempt becomes a traceable run with: input transcript, prompt used, output score, latency, token cost

## What You Get
- See exactly which prompt produced which grade
- Compare prompt versions A/B (did the new rubric improve scores?)
- Catch prompt regressions before they affect coaching quality
- Token cost per grading run

## Smart Tip
LangSmith's "datasets" feature lets you build a golden test set of calls with known-good grades. Run new prompt versions against it before deploying. This is the evaluation layer for Gunner's grading quality.

## Configuration
- API key in Railway env vars when ready
- Docs: https://docs.smith.langchain.com
