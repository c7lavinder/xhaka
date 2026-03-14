# OpenAI

**Category:** AI & LLM
**Status:** 🟢 Active
**Last Updated:** 2026-03-14

## Purpose
Powers call transcription (Whisper) and call analysis (GPT-4o) in Gunner. Every sales call is transcribed and graded using OpenAI.

## Usage in Stack
- **Gunner:** Whisper for transcription, GPT-4o for call grading/coaching feedback
- **Xhaka:** GPT-4o for intelligence tasks (⚠️ consider migrating to Claude for complex reasoning)

---

## Current Models & Pricing (March 2026)

### Chat / Completion
| Model | Input | Output | Notes |
|-------|-------|--------|-------|
| gpt-4o | $2.50/MTok | $10/MTok | Standard workhorse |
| gpt-4o (cached) | $1.25/MTok | $10/MTok | Prompt caching — huge savings on repeated system prompts |
| gpt-4o-mini | $0.15/MTok | $0.60/MTok | For simple/cheap tasks |
| o3 | $10/MTok | $40/MTok | Heavy reasoning — don't use for Gunner grading |
| o4-mini | $1.10/MTok | $4.40/MTok | Reasoning on a budget |

> **Batch API discount:** 50% off for non-time-sensitive jobs. Gunner call grading is a perfect candidate — calls don't need to grade in real-time.

### Whisper
- **Whisper v2:** $0.006/minute — flat rate
- **No streaming.** Submit audio file, get transcript back.
- Max file size: 25MB. Compress long calls to MP3 at 64kbps before sending.

### Embeddings
| Model | Price | Dimensions | vs ada-002 |
|-------|-------|-----------|------------|
| text-embedding-3-small | $0.02/MTok | 1536 | **5x cheaper, better quality** |
| text-embedding-3-large | $0.13/MTok | 3072 | Best quality, use for search |
| text-embedding-ada-002 | $0.10/MTok | 1536 | **LEGACY — don't use for new work** |

**🚨 URGENT:** If Gunner uses ada-002 embeddings anywhere, switch to text-embedding-3-small. Same quality, 5x cheaper.

---

## Known Gotchas

1. **Whisper hallucination on silence:** If a call has dead air or music-on-hold, Whisper invents text. Add a post-processing check: if transcript contains "Thank you for watching" or "Subscribe" → flag as hallucination.

2. **GPT-4o context limit:** 128k tokens input, but billing surprises hit at long transcripts. A 45-min call transcript ~= 15k tokens. At $2.50/MTok input, that's ~$0.04/call. 100 calls/day = $4/day = ~$120/month just on input tokens.

3. **Rate limits (Tier 1):** 500 RPM for gpt-4o. If Gunner ever processes calls in burst, add a queue with exponential backoff.

4. **Structured outputs:** GPT-4o supports `response_format: { type: "json_schema" }` — use this for call grading output instead of prompt-engineering JSON. More reliable, no parsing errors.

5. **Audio file format:** Whisper works best with WAV or MP3. If GHL returns recording URLs as .mp4 or .ogg, transcode first.

---

## Whisper Alternatives Worth Knowing

| Option | Cost | Quality | Latency | Notes |
|--------|------|---------|---------|-------|
| Deepgram Nova-2 | $0.0043/min | ⭐⭐⭐⭐⭐ | Real-time | **Cheaper, faster, better accuracy on phone calls** |
| AssemblyAI | $0.0065/min | ⭐⭐⭐⭐ | ~30s | Good speaker diarization |
| Groq Whisper | ~free tier | ⭐⭐⭐⭐ | Fastest | 216x real-time speed. ⚠️ verify pricing |
| Self-hosted Whisper | Server cost only | ⭐⭐⭐⭐ | Variable | Makes sense at 1000+ calls/day |

**Smart tip:** Deepgram Nova-2 has a phone call model specifically tuned for low-quality audio (noisy backgrounds, phone compression). For Gunner's use case (real sales calls from mobile phones), Deepgram likely outperforms standard Whisper on accuracy AND is 28% cheaper.

---

## Smart Use Tips

1. **Prompt caching for Gunner:** The system prompt for call grading is probably 1000+ tokens and identical across all calls. Enable prompt caching — you only pay 50% for cached input. With 100 calls/day at 1000 token system prompt, that's $0.06/day saved.

2. **Batch API for grading:** Submit call grading jobs via Batch API (50% discount, 24hr turnaround). Since Gunner doesn't need real-time grades, this could cut AI costs in half.

3. **Flex processing tier:** Even cheaper than Batch for lowest-priority work.

---

## Account Details
- See TOOLS.md for API key
- Monitor spend at: platform.openai.com/usage
