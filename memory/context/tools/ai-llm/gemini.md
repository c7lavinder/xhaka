# Google Gemini

**Category:** AI & LLM
**Status:** 🔵 Configured

## Purpose
Google's LLM used for Gunner V2 intelligence services — specifically the Timeline and Motivation analyzers that score wholesale real estate leads.

## Usage in Stack
- Model: `gemini-1.5-flash` (default)
- Used in Gunner's AI scoring pipeline
- Free tier: 1,500 requests/day (covers NAH volume)

## Configuration
- API Key: Configured ✓ (Railway env vars)
- Source: Google AI Studio (aistudio.google.com)
- Docs: https://ai.google.dev/docs

## Notes
- Free tier is sufficient for current NAH call volume
- Model aliases: `gemini-flash`, `gemini-lite`, `gemini-pro` in OpenClaw

## Last Updated
2026-03-12