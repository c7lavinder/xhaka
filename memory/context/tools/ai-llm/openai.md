# OpenAI

**Category:** AI & LLM
**Status:** 🟢 Active

## Purpose
Powers call transcription (Whisper) and grading (GPT-4o) in Gunner. Powers intelligence jobs in Xhaka (researcher, organize, scribe, evaluator).

## Current State
- GPT-4o: Latest stable model. Use for grading, coaching, complex analysis.
- GPT-4o-mini: 15x cheaper than GPT-4o. Use for classification, simple extraction, high-volume tasks.
- text-embedding-3-small: 1536 dims, $0.02/1M tokens. Best price/performance for RAG embeddings.
- text-embedding-3-large: 3072 dims, higher accuracy, 13x more expensive. Only if small underperforms.
- Whisper: Best-in-class transcription. No good cheaper alternative yet.

## Gotchas
- Token limits: GPT-4o context = 128k tokens. Transcripts > 100k chars need chunking.
- Rate limits: Tier 1 = 500 RPM GPT-4o, 3000 RPM GPT-4o-mini. Monitor in production.
- Embeddings are immutable — if you change the model, you must re-embed everything.
- text-embedding-ada-002 is legacy. Do not use for new builds. Use text-embedding-3-small.

## Smart Tip
Use GPT-4o-mini for the evaluation/inspect jobs (high volume, lower complexity). Reserve GPT-4o for grading and coaching where quality matters. Cuts OpenAI costs 80%+ without sacrificing output quality where it counts.

## Configuration
- API Key: Railway env var `OPENAI_API_KEY`
- Docs: https://platform.openai.com/docs
