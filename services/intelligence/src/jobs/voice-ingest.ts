// services/intelligence/src/jobs/voice-ingest.ts
// Voice Ingest job — polls intelligence/voice-inbox/ for audio files (.m4a/.mp3/.wav/.ogg),
// transcribes each with OpenAI Whisper, extracts structured knowledge with GPT-4o,
// and writes a formatted markdown note to intelligence/inbox/.
//
// Triggered by: capture.ts (via task queue) every 5 minutes when new audio files are present.

import { createReadStream, writeFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { extname } from 'path';
import OpenAI from 'openai';
import { listDirectory, createFile, deleteFile } from '../lib/github.js';
import { markJobStart, markJobSuccess, markJobFailed } from '../utils/job-registry.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const XHAKA_REPO = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';
const VOICE_INBOX_PATH = 'intelligence/voice-inbox';
const VOICE_PROCESSED_PATH = 'intelligence/voice-processed';
const INTEL_INBOX_PATH = 'intelligence/inbox';

const AUDIO_EXTENSIONS = new Set(['.m4a', '.mp3', '.wav', '.ogg']);

// ---------------------------------------------------------------------------
// OpenAI client (lazy singleton)
// ---------------------------------------------------------------------------

let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

function toDateStr(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toDateTimeStr(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AudioFileEntry {
  name: string;
  path: string;
  sha: string;
}

// ---------------------------------------------------------------------------
// Main job entry point
// ---------------------------------------------------------------------------

export async function runVoiceIngest(): Promise<void> {
  const _startTime = await markJobStart('voice-ingest');

  try {
    console.log('[voice-ingest] Checking voice-inbox for new audio files...');

    // List audio files in voice-inbox (returns [] if folder doesn't exist)
    const inboxFiles: AudioFileEntry[] = (await listDirectory(XHAKA_REPO, VOICE_INBOX_PATH))
      .filter(f => f.type === 'file' && AUDIO_EXTENSIONS.has(extname(f.name).toLowerCase()))
      .map(f => ({ name: f.name, path: f.path, sha: f.sha }));

    if (inboxFiles.length === 0) {
      console.log('[voice-ingest] No audio files in voice-inbox — nothing to do.');
      await markJobSuccess('voice-ingest', _startTime);
      return;
    }

    // List already-processed files to skip them
    const processedFiles = await listDirectory(XHAKA_REPO, VOICE_PROCESSED_PATH);
    const processedNames = new Set(
      processedFiles.filter(f => f.type === 'file').map(f => f.name),
    );

    const toProcess = inboxFiles.filter(f => !processedNames.has(f.name));

    if (toProcess.length === 0) {
      console.log('[voice-ingest] All inbox files are already processed — nothing to do.');
      await markJobSuccess('voice-ingest', _startTime);
      return;
    }

    console.log(`[voice-ingest] Found ${toProcess.length} new audio file(s) to process.`);

    let processed = 0;
    for (const audioFile of toProcess) {
      try {
        await processAudioFile(audioFile);
        processed++;
      } catch (err) {
        console.error(`[voice-ingest] ❌ Failed to process ${audioFile.name}:`, err);
      }
    }

    console.log(`[voice-ingest] Done. Processed ${processed}/${toProcess.length} file(s).`);
    await markJobSuccess('voice-ingest', _startTime);
  } catch (err) {
    console.error('[voice-ingest] Fatal error:', err);
    await markJobFailed('voice-ingest', _startTime);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Process a single audio file end-to-end
// ---------------------------------------------------------------------------

async function processAudioFile(file: AudioFileEntry): Promise<void> {
  console.log(`[voice-ingest] ▶️  ${file.name}`);

  const ext = extname(file.name).toLowerCase();

  // 1. Download raw audio bytes from GitHub
  const audioBuffer = await downloadGitHubFile(file.path);
  console.log(`[voice-ingest] Downloaded ${file.name} (${audioBuffer.length} bytes)`);

  // 2. Write to a temp file — Whisper SDK expects a ReadStream
  const tmpPath = join(tmpdir(), `voice-ingest-${Date.now()}${ext}`);
  writeFileSync(tmpPath, audioBuffer);

  let transcript = '';
  let durationSeconds = 0;

  try {
    // 3. Transcribe with Whisper
    console.log(`[voice-ingest] Transcribing with whisper-1...`);
    const transcription = await getOpenAI().audio.transcriptions.create({
      file: createReadStream(tmpPath),
      model: 'whisper-1',
      response_format: 'verbose_json',
    });

    // verbose_json includes .text and .duration
    transcript = (transcription as { text: string }).text ?? '';
    durationSeconds = Math.round(((transcription as unknown) as { duration?: number }).duration ?? 0);
    console.log(`[voice-ingest] Transcribed: ${transcript.split(/\s+/).length} words, ~${durationSeconds}s`);
  } finally {
    if (existsSync(tmpPath)) {
      try { unlinkSync(tmpPath); } catch { /* ignore cleanup errors */ }
    }
  }

  if (!transcript.trim()) {
    console.warn(`[voice-ingest] Empty transcript for ${file.name} — skipping extraction.`);
    return;
  }

  // 4. Extract structured content with GPT-4o
  console.log(`[voice-ingest] Extracting structured content with GPT-4o...`);
  const extracted = await extractStructuredContent(transcript);

  // 5. Build the final note
  const now = new Date();
  const dateStr = toDateStr(now);
  const tags = parseTagsFromExtracted(extracted);
  const transcriptWords = transcript.trim().split(/\s+/).length;

  const frontmatter = [
    '---',
    `date: ${dateStr}`,
    `source: voice-memo`,
    `tags: [${tags.join(', ')}]`,
    `duration_seconds: ${durationSeconds}`,
    `transcript_words: ${transcriptWords}`,
    '---',
    '',
  ].join('\n');

  const rawSection = `\n## Raw Transcript\n${transcript}\n`;
  const noteContent = frontmatter + extracted.trim() + rawSection;

  // 6. Write note to intelligence/inbox/
  const noteFilename = `voice-${toDateTimeStr(now)}.md`;
  const notePath = `${INTEL_INBOX_PATH}/${noteFilename}`;
  console.log(`[voice-ingest] Writing note → ${notePath}`);
  await createFile(
    XHAKA_REPO,
    notePath,
    noteContent,
    `feat: voice-ingest — ${noteFilename} from ${file.name}`,
  );

  // 7. Create processed marker (same filename, text content listing source)
  const markerContent = [
    `source: ${file.path}`,
    `processed_at: ${now.toISOString()}`,
    `note: ${notePath}`,
    `transcript_words: ${transcriptWords}`,
    `duration_seconds: ${durationSeconds}`,
  ].join('\n') + '\n';

  await createFile(
    XHAKA_REPO,
    `${VOICE_PROCESSED_PATH}/${file.name}`,
    markerContent,
    `feat: voice-ingest — mark ${file.name} as processed`,
  );

  // 8. Remove original from voice-inbox/
  await deleteFile(
    XHAKA_REPO,
    file.path,
    `feat: voice-ingest — remove processed ${file.name} from voice-inbox`,
    file.sha,
  );

  console.log(`[voice-ingest] ✅ ${file.name} → ${noteFilename}`);
}

// ---------------------------------------------------------------------------
// Download raw binary file from GitHub
// ---------------------------------------------------------------------------

async function downloadGitHubFile(filePath: string): Promise<Buffer> {
  const repoEnv = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';
  const [owner, repo] = repoEnv.split('/');
  const token = process.env.GITHUB_TOKEN;

  const url = `https://raw.githubusercontent.com/${owner}/${repo}/main/${filePath}`;
  const response = await fetch(url, {
    headers: token ? { Authorization: `token ${token}` } : {},
  });

  if (!response.ok) {
    throw new Error(
      `GitHub download failed for ${filePath}: HTTP ${response.status} ${response.statusText}`,
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// ---------------------------------------------------------------------------
// GPT-4o extraction
// ---------------------------------------------------------------------------

async function extractStructuredContent(transcript: string): Promise<string> {
  const systemPrompt =
    'You are extracting structured knowledge from a voice memo transcript. ' +
    'Return only the structured markdown content — no preamble, no code blocks, no explanation.';

  const userPrompt = `You are extracting structured knowledge from a voice memo transcript.

Transcript:
${transcript}

Extract and return a structured markdown note with these exact sections:

## Summary
One paragraph: what this memo is about.

## Claims
Bullet list of distinct factual or strategic claims worth preserving (8-15 items).

## Frameworks
Named frameworks or mental models mentioned or implied (3-5 items with brief explanation).

## Action Items
Concrete next steps mentioned (numbered list).

## Questions
Open questions or things to investigate further.

## Tags
Comma-separated tags relevant to: nah, gunner, xhaka, strategy, team, operations, product, finance`;

  const completion = await getOpenAI().chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 2000,
    temperature: 0.3,
  });

  return completion.choices[0]?.message?.content?.trim() ?? '';
}

// ---------------------------------------------------------------------------
// Parse the Tags section from GPT-4o output
// ---------------------------------------------------------------------------

function parseTagsFromExtracted(extracted: string): string[] {
  const match = extracted.match(/^##\s*Tags\s*\n([\s\S]*?)(?=\n##|$)/m);
  if (!match) return [];

  return match[1]
    .split(',')
    .map(t => t.trim().toLowerCase().replace(/[^a-z0-9-]/g, ''))
    .filter(t => t.length > 0);
}
