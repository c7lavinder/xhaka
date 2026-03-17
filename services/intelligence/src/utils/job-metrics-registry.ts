// services/intelligence/src/utils/job-metrics-registry.ts
// Single metric declaration per job — defines what "good" and "minimum acceptable" look like.
// Never throws from exported functions.

export interface JobMetric {
  name: string;         // e.g. "actionable_insights_per_article"
  description: string;  // what we're optimizing
  unit: string;         // "count" | "score" | "percentage"
  target: number;       // what "good" looks like
  minimum: number;      // below this = failure
}

// ---------------------------------------------------------------------------
// Metric registry — one entry per job
// ---------------------------------------------------------------------------

const JOB_METRICS: Record<string, JobMetric> = {
  'researcher': {
    name: 'insight_quality_score',
    description: 'Quality score from evaluator',
    unit: 'score',
    target: 80,
    minimum: 65,
  },
  'organize': {
    name: 'categorization_quality',
    description: 'Quality of memory categorization',
    unit: 'score',
    target: 75,
    minimum: 60,
  },
  'scribe': {
    name: 'promotion_quality',
    description: 'Quality of MEMORY.md updates',
    unit: 'score',
    target: 80,
    minimum: 70,
  },
  'daily-log': {
    name: 'log_specificity',
    description: 'How specific and useful the daily log is',
    unit: 'score',
    target: 70,
    minimum: 50,
  },
  'tool-monitor': {
    name: 'tools_scanned',
    description: 'Number of tools with updated intel',
    unit: 'count',
    target: 5,
    minimum: 1,
  },
  'feedback': {
    name: 'entries_processed',
    description: 'Feedback entries processed',
    unit: 'count',
    target: 1,
    minimum: 0,
  },
  'inspect': {
    name: 'root_causes_identified',
    description: 'Jobs with root cause identified',
    unit: 'count',
    target: 1,
    minimum: 0,
  },
  'morning-brief': {
    name: 'sections_delivered',
    description: 'Non-empty sections in brief',
    unit: 'count',
    target: 3,
    minimum: 1,
  },
  'voice-ingest': {
    name: 'voice_memos_processed',
    description: 'Voice memos transcribed and structured into knowledge notes',
    unit: 'count',
    target: 1,
    minimum: 0,
  },
  'librarian': {
    name: 'knowledge_graph_health_score',
    description: 'Overall health of the knowledge graph — compliance rate, zero stale items = 100',
    unit: 'score',
    target: 90,
    minimum: 70,
  },
  'repo-researcher': {
    name: 'repos_analyzed',
    description: 'GitHub repositories analyzed and written to memory/context/technology/',
    unit: 'count',
    target: 1,
    minimum: 0,
  },
};

// ---------------------------------------------------------------------------
// Public API — never throws
// ---------------------------------------------------------------------------

/**
 * Returns the declared metric for a job, or null if not defined.
 */
export function getJobMetric(jobName: string): JobMetric | null {
  try {
    return JOB_METRICS[jobName] ?? null;
  } catch {
    return null;
  }
}

/**
 * Returns true if the value meets or exceeds the target for the job.
 * Returns false if the job has no declared metric.
 */
export function meetsTargetMetric(jobName: string, value: number): boolean {
  try {
    const metric = JOB_METRICS[jobName];
    if (!metric) return false;
    return value >= metric.target;
  } catch {
    return false;
  }
}

/**
 * Returns true if the value meets or exceeds the minimum threshold for the job.
 * Returns true if the job has no declared metric (no enforcement).
 */
export function meetsMinimumMetric(jobName: string, value: number): boolean {
  try {
    const metric = JOB_METRICS[jobName];
    if (!metric) return true;
    return value >= metric.minimum;
  } catch {
    return true;
  }
}
