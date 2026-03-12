# Supabase

**Category:** Database & Storage
**Status:** 🟢 Active (Storage Only)

## Purpose
File storage for Gunner call recordings. Hosts the `gunner-recordings` bucket used to store audio files before/after transcription.

## Usage in Stack
- Storage bucket: `gunner-recordings`
- Project URL: `tvjkgumckwapybpjyrkw.supabase.co`
- NOT the primary database (PostgreSQL on Railway is primary)
- pgvector extension available for future vector embeddings

## Configuration
- Publishable Key: Configured ✓
- Secret Key: Configured ✓
- Docs: https://supabase.com/docs/guides/storage

## Notes
- ⚠️ Supabase = STORAGE ONLY. Primary DB is PostgreSQL (Railway).
- pgvector ready: run `create extension vector;` in Supabase SQL editor when needed
- Project name: "Gunner V1.5"

## Last Updated
2026-03-12