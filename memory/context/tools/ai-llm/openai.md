# OpenAI

**Category:** AI & LLM
**Status:** 🟢 Active

## Purpose
Powers call transcription (Whisper) and call analysis (GPT-4o) in Gunner. Every sales call is transcribed and graded using OpenAI.

## Usage in Stack
- **Whisper**: Transcribes audio recordings pulled from GHL
- **GPT-4o**: Grades calls (A/B/C/D/F), extracts coaching insights
- Also used by xhaka-intelligence for tool research summaries

## Configuration
- API Key: Configured ✓ (Railway env vars)
- Docs: https://platform.openai.com/docs

## Notes
- Silent failure handling implemented (classifyOpenAIError in xhaka-intelligence)
- Credit monitoring: startup check alerts on auth failures
- Watch for quota limits during high-volume periods

## Last Updated
2026-03-12