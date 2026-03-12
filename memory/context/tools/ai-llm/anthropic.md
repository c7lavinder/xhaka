# Anthropic Claude

**Category:** AI & LLM
**Status:** 🟢 Active

## Purpose
Primary AI model powering Xhaka — the COO agent. Handles all reasoning, strategy, memory management, and agent orchestration.

## Usage in Stack
- Model: `anthropic/claude-sonnet-4-6` (default)
- Runs via OpenClaw runtime on Mac mini
- Every Xhaka session uses this model

## Configuration
- API Key: Managed by OpenClaw ✓
- Docs: https://docs.anthropic.com

## Notes
- Thinking/reasoning mode available (`/reasoning` toggle)
- Adaptive thinking enabled by default
- Model aliases: `sonnet` = claude-sonnet-4-6, `opus` = claude-opus-4-5/4-6

## Last Updated
2026-03-12