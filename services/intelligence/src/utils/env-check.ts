// services/intelligence/src/utils/env-check.ts
// Pre-flight environment variable checker for intelligence jobs.
// Jobs should call this before doing any API work.
// Returns { ok: boolean, missing: string[] }

interface EnvCheckResult {
  ok: boolean;
  missing: string[];
}

/**
 * Check that all required environment variables are set.
 * Returns ok=true if all are present, ok=false with list of missing keys otherwise.
 */
export function checkEnv(required: string[]): EnvCheckResult {
  const missing = required.filter((key) => !process.env[key]);
  return { ok: missing.length === 0, missing };
}

/**
 * Log a clean warning when a job skips due to missing env vars.
 * Does NOT write to job-registry — missing config is not a job failure.
 */
export function warnMissingEnv(jobName: string, missing: string[]): void {
  console.warn(
    `[${jobName}] Skipping — missing required env vars: ${missing.join(', ')}. ` +
    `Set these in Railway to enable this job.`,
  );
}
