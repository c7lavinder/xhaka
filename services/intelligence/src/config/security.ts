// services/intelligence/src/config/security.ts
// Security policy for the Xhaka intelligence service.
// Based on: "Shorthand Guide to Agentic Security" (2026-03-16)

/**
 * Paths the intelligence service should NEVER read.
 * Add patterns here as new sensitive paths are identified.
 */
export const DENIED_READ_PATHS = [
  '~/.ssh',
  '~/.aws',
  '.env',
  '.env.local',
  '.env.production',
  'secrets',
  'master.key',
];

/**
 * Domains the Researcher is allowed to fetch from.
 * Everything else should be logged as a warning.
 */
export const ALLOWED_FETCH_DOMAINS = [
  'github.com',
  'raw.githubusercontent.com',
  'api.github.com',
  'openai.com',
  'anthropic.com',
  'railway.app',
  'backboard.railway.app',
  'supabase.co',
];

/**
 * Maximum content size to process from external sources (bytes).
 * Prevents context-flooding attacks.
 */
export const MAX_EXTERNAL_CONTENT_BYTES = 32_000;

/**
 * Check if a URL is on the allowed fetch list.
 * Log a warning if not — never silently fetch untrusted domains.
 */
export function isAllowedDomain(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return ALLOWED_FETCH_DOMAINS.some(d => hostname.endsWith(d));
  } catch {
    return false;
  }
}

/**
 * Suspicious patterns that indicate prompt injection attempts.
 * If found in external content, log a security warning.
 */
export const INJECTION_PATTERNS = [
  /ignore (all |previous |prior )?instructions/i,
  /disregard (your |all |previous )?instructions/i,
  /you are now/i,
  /new (system |role |persona)/i,
  /ANTHROPIC_BASE_URL/i,
  /enableAllProjectMcpServers/i,
  /sudo rm/i,
  /curl.*\|.*bash/i,
];

export function detectInjection(content: string): boolean {
  return INJECTION_PATTERNS.some(pattern => pattern.test(content));
}
