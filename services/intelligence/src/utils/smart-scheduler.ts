// services/intelligence/src/utils/smart-scheduler.ts
// Intelligent scheduling primitives — inspired by Jon Tsai's OpenClaw Command Center.
// Provides: run-if-not-run-since, skip-if-last-run-within, conflict-avoidance, LLM router, cost tracker.

import { getFileContent } from '../lib/github.js';

const REPO = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';
const RESULTS_PATH = 'data/results.tsv';
const HEAVY_JOBS = new Set(['researcher', 'organize', 'improve', 'cleanup', 'scribe', 'propagate', 'tool-researcher']);

// ---------------------------------------------------------------------------
// In-memory conflict tracking
// ---------------------------------------------------------------------------

const runningHeavyJobs = new Set<string>();

export function markHeavyJobRunning(jobName: string): void {
  if (HEAVY_JOBS.has(jobName)) runningHeavyJobs.add(jobName);
}

export function markHeavyJobDone(jobName: string): void {
  runningHeavyJobs.delete(jobName);
}

export function isHeavyJobRunning(): boolean {
  return runningHeavyJobs.size > 0;
}

export function getRunningHeavyJobs(): string[] {
  return Array.from(runningHeavyJobs);
}

// ---------------------------------------------------------------------------
// results.tsv helpers
// ---------------------------------------------------------------------------

// Parse last success time for a job from results.tsv
export async function getLastSuccessTime(jobName: string): Promise<Date | null> {
  try {
    const file = await getFileContent(REPO, RESULTS_PATH);
    if (!file) return null;
    const lines = file.content.trim().split('\n').slice(1); // skip header row
    for (let i = lines.length - 1; i >= 0; i--) {
      const parts = lines[i].split('\t');
      if (parts.length >= 3 && parts[1] === jobName && parts[2] === 'success') {
        return new Date(parts[0]);
      }
    }
    return null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Scheduling primitives
// ---------------------------------------------------------------------------

/**
 * run-if-not-run-since: returns true if the job should run
 * (i.e. it hasn't succeeded within the last N hours).
 */
export async function shouldRunIfNotRunSince(jobName: string, hours: number): Promise<boolean> {
  try {
    const last = await getLastSuccessTime(jobName);
    if (!last) return true; // never run — run now
    const hoursSince = (Date.now() - last.getTime()) / (1000 * 60 * 60);
    return hoursSince >= hours;
  } catch {
    return true; // on error, default to running
  }
}

/**
 * skip-if-last-run-within: returns true if the job should be SKIPPED
 * (i.e. it ran within the last M minutes — debounce).
 */
export async function shouldSkipIfRanWithin(jobName: string, minutes: number): Promise<boolean> {
  try {
    const last = await getLastSuccessTime(jobName);
    if (!last) return false;
    const minsSince = (Date.now() - last.getTime()) / (1000 * 60);
    return minsSince < minutes;
  } catch {
    return false; // on error, default to not skipping
  }
}

/**
 * conflict-avoidance: returns true if this heavy job should be skipped
 * because another heavy job is currently running.
 */
export function shouldSkipDueToConflict(jobName: string): boolean {
  try {
    if (!HEAVY_JOBS.has(jobName)) return false;
    const others = Array.from(runningHeavyJobs).filter(j => j !== jobName);
    if (others.length > 0) {
      console.log(`[smart-scheduler] Skipping ${jobName} — conflict with running: ${others.join(', ')}`);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// LLM Router — pick cheapest model sufficient for task type
// ---------------------------------------------------------------------------

export type TaskComplexity = 'heavy' | 'medium' | 'light';

export function routeModel(jobName: string): { model: string; estimatedCostUsd: number } {
  try {
    // Heavy: complex reasoning, code generation, deep analysis
    const heavyJobs = ['researcher', 'improve', 'scribe', 'morning-brief', 'inspect',
      'pattern-miner', 'tool-researcher', 'repo-researcher'];
    // Medium: summarization, formatting, light analysis
    const mediumJobs = ['organize', 'propagate', 'behavior-sync', 'routing-review',
      'feedback', 'change-evaluator', 'auditor'];

    if (heavyJobs.includes(jobName)) {
      return { model: 'gpt-4o', estimatedCostUsd: 0.025 };
    } else if (mediumJobs.includes(jobName)) {
      return { model: 'gpt-4o-mini', estimatedCostUsd: 0.003 };
    } else {
      // Light: status checks, logging, simple reads
      return { model: 'gpt-4o-mini', estimatedCostUsd: 0.001 };
    }
  } catch {
    return { model: 'gpt-4o-mini', estimatedCostUsd: 0.001 };
  }
}

// ---------------------------------------------------------------------------
// Cost tracker — reads today's totals from results.tsv
// ---------------------------------------------------------------------------

export async function getTodayCostEstimate(): Promise<{
  totalUsd: number;
  jobCount: number;
  breakdown: Record<string, number>;
}> {
  try {
    const file = await getFileContent(REPO, RESULTS_PATH);
    if (!file) return { totalUsd: 0, jobCount: 0, breakdown: {} };

    const today = new Date().toISOString().split('T')[0];
    const lines = file.content.trim().split('\n').slice(1);
    let total = 0;
    let count = 0;
    const breakdown: Record<string, number> = {};

    for (const line of lines) {
      const parts = line.split('\t');
      if (parts.length >= 3 && parts[0].startsWith(today) && parts[2] === 'success') {
        const jobName = parts[1];
        const notes = parts[5] || '';
        const costMatch = notes.match(/cost=\$([0-9.]+)/);
        const cost = costMatch ? parseFloat(costMatch[1]) : routeModel(jobName).estimatedCostUsd;
        total += cost;
        count++;
        breakdown[jobName] = (breakdown[jobName] || 0) + cost;
      }
    }

    return {
      totalUsd: Math.round(total * 1000) / 1000,
      jobCount: count,
      breakdown,
    };
  } catch {
    return { totalUsd: 0, jobCount: 0, breakdown: {} };
  }
}
