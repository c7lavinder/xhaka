# OpenAI Whisper

**Category:** Audio & Media
**Status:** 🟢 Active

## Purpose
Transcribes sales call recordings in Gunner. Audio pulled from GHL (GoHighLevel) recordings and converted to text for AI analysis.

## Usage in Stack
- Integrated in Gunner's call processing pipeline
- Flow: GHL recording → Whisper transcription → GPT-4o grading → Gunner dashboard
- Called via OpenAI API (same key as GPT-4o)

## Configuration
- API Key: Via OpenAI ✓
- Docs: https://platform.openai.com/docs/guides/speech-to-text

## Notes
- Accuracy is high for sales calls (English, phone quality audio)
- Cost: ~$0.006/minute of audio

## Last Updated
2026-03-12