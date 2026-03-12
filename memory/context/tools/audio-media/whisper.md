---
name: OpenAI Whisper
category: audio-media
projects:
  - gunner
role: Audio transcription — converts call recordings to text for AI grading
auth_type: api_key
api_base_url: https://api.openai.com/v1/audio
rate_limits:
  requests_per_minute: 50
  tokens_per_minute: null
pricing_tier: pay-per-use
free_tier_limits: null
key_features:
  - High-accuracy speech-to-text (multilingual)
  - Speaker diarization (via post-processing)
  - Supports mp3, mp4, wav, m4a, webm formats
  - Timestamps at word level
power_user_features:
  - Verbose JSON output with word-level timestamps
  - Prompt seeding for domain vocabulary (real estate terms)
known_issues:
  - No native speaker diarization — need post-processing step
  - Large file uploads slow — pre-chunk audio > 25MB
integration_hooks:
  - Gunner: call recording transcription pipeline
  - Uses OpenAI API key (same as LLM calls)
alternatives:
  - deepgram (faster, cheaper, native diarization)
  - assemblyai (better diarization, higher cost)
docs_url: https://platform.openai.com/docs/guides/speech-to-text
changelog_url: https://platform.openai.com/docs/changelog
last_reviewed: 2026-03-11
notes: ""
---

## Notes

Whisper via OpenAI API — no self-hosting. Transcription is the first step in the Gunner grading pipeline. Consider prompt seeding with real estate vocabulary (motivated seller, cash offer, ARV, etc.) to improve accuracy.
