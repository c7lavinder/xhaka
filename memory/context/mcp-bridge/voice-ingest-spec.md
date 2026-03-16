# Voice Ingest Spec — Voice Memo → Structured Memory Pipeline

**Version:** 1.0  
**Owner:** Builder  
**Status:** Spec (pending implementation)  
**Target service:** xhaka-intelligence  

---

## Overview

Corey thinks out loud. His best frameworks, decisions, and observations happen
in motion — in the car, on a walk, between calls. This pipeline captures those
moments and turns them into structured memory before they disappear.

**Input:** `.m4a` or `.mp3` voice memo  
**Output:** Structured markdown note in `intelligence/inbox/`, auto-picked-up
by `capture.ts` on the next 5-min run.

---

## Trigger Options

### Option A — Watched Folder (local)
Corey drops an `.m4a` or `.mp3` file into:
```
/Users/wholesaleai/.openclaw/workspace/intelligence/voice-drop/
```
A file watcher (fs.watch or chokidar) detects the new file and queues it for
processing.

### Option B — Telegram Voice Memo
Corey sends a voice memo directly in the Xhaka Telegram chat.  
The OpenClaw agent receives the `.ogg`/`.m4a` attachment, saves it to
`intelligence/voice-drop/`, and the same pipeline runs.

Both triggers feed into the same processing queue.

---

## Processing Pipeline

```
[Voice file arrives in voice-drop/]
         │
         ▼
[1. Transcribe via Whisper API]
   Model: whisper-1
   Input: audio file (m4a/mp3/ogg)
   Output: raw transcript text
         │
         ▼
[2. Extract structure via GPT-4o]
   System prompt: extract claims, frameworks, action items
   Input: raw transcript
   Output: structured JSON
         │
         ▼
[3. Write structured note to intelligence/inbox/]
   Filename: YYYY-MM-DD-HHmm-voice-[slug].md
   Format: see Output Format section below
         │
         ▼
[4. Move source audio to intelligence/voice-archive/]
   Keeps the original; inbox stays clean
         │
         ▼
[5. capture.ts picks it up on next 5-min run]
   Routes note to researcher queue for synthesis
```

---

## Output Format

```markdown
---
type: voice-memo
date: YYYY-MM-DD
time: HH:MM
source: telegram | voice-drop
duration_sec: 142
status: raw
tags: []
---

## Claims

- [Extracted direct assertions Corey made]
- [Each claim = one bullet, present tense]

## Frameworks

- [Any mental models, decision frameworks, or repeatable patterns mentioned]
- [Name them if possible: "The 3-Call Rule", "Anchor-Low close", etc.]

## Action Items

- [ ] [Specific next steps Corey mentioned]
- [ ] [Assign to a person if named]

## Raw Transcript

> [Full verbatim transcript from Whisper, unedited]
```

---

## GPT-4o Extraction Prompt

```
You are a knowledge extraction assistant. Given a raw voice memo transcript,
extract the following into JSON:

{
  "claims": ["string"],        // Direct assertions the speaker made
  "frameworks": ["string"],    // Mental models or repeatable patterns
  "action_items": ["string"],  // Specific next steps mentioned
  "tags": ["string"]           // 2-5 topic tags for searchability
}

Rules:
- Claims = things the speaker believes to be true right now
- Frameworks = if they described a process or mental model, name it
- Action items = concrete tasks with a verb (call, build, check, decide)
- Do not invent anything not in the transcript
- Be terse; one line per item
```

---

## Integration with capture.ts

`capture.ts` runs every 5 minutes on `xhaka-intelligence`. It already monitors
`intelligence/inbox/` for new files. Voice memos written with `type: voice-memo`
in frontmatter will be:

1. Detected by capture.ts on next run
2. Routed to the **Researcher** queue (`intelligence/queue/researcher.json`)
3. Researcher synthesizes claims into `MEMORY.md` or the appropriate
   `memory/context/` file on next run

No changes needed to capture.ts for this routing — it already handles
`intelligence/inbox/` generically.

---

## Implementation Notes

### File: `intelligence/voice-ingest.ts`

Key functions to implement:
```typescript
// Watch the voice-drop folder
async function watchVoiceDrop(): Promise<void>

// Transcribe audio using Whisper API
async function transcribeAudio(filePath: string): Promise<string>

// Extract structure using GPT-4o
async function extractStructure(transcript: string): Promise<VoiceExtraction>

// Write the structured note
async function writeMemoryNote(extraction: VoiceExtraction, meta: AudioMeta): Promise<string>

// Archive the source file
async function archiveSource(filePath: string): Promise<void>
```

### Environment Variables Required
```
OPENAI_API_KEY=          # For both Whisper and GPT-4o
VOICE_DROP_PATH=intelligence/voice-drop
VOICE_ARCHIVE_PATH=intelligence/voice-archive
VOICE_INBOX_PATH=intelligence/inbox
```

---

## Cost Estimate

| Step | Model | Cost |
|------|-------|------|
| Transcription | Whisper API | ~$0.006/min of audio |
| Extraction | GPT-4o (4o-mini viable) | ~$0.01 per memo |
| **Total per 2-min memo** | | **~$0.022** |
| **Total per 10 memos/day** | | **~$0.22/day** |
| **Total per month (10/day)** | | **~$6.60/month** |

Using `gpt-4o-mini` instead of `gpt-4o` for extraction drops cost to ~$0.001
per memo with minimal quality loss for this structured task.

---

## Acceptance Criteria

- [ ] Voice file dropped in `voice-drop/` → structured note in `inbox/` within 60 seconds
- [ ] Telegram voice memo → same pipeline, same output
- [ ] `capture.ts` picks up the note on next 5-min run without errors
- [ ] Source audio moved to `voice-archive/` (never deleted)
- [ ] Frontmatter `type: voice-memo` present in all outputs
- [ ] Cost per memo ≤ $0.05
