// ---------------------------------------------------------------------------
// Router — determines where an intel item belongs and which agents it updates
// ---------------------------------------------------------------------------

export type Project = 'gunner' | 'nah' | 'general';

export interface IntelFrontmatter {
  date: string;
  source: string;
  project: Project;
  tags: string[];
  urgency: 'high' | 'medium' | 'low';
}

export interface ParsedIntel {
  frontmatter: IntelFrontmatter;
  raw: string;
  synthesis: string;
  suggestedAction: string;
  fullContent: string;
}

// ---------------------------------------------------------------------------
// Parse the frontmatter + sections from an inbox file
// ---------------------------------------------------------------------------

export function parseIntelFile(content: string): ParsedIntel {
  // Strip YAML front matter
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!fmMatch) {
    throw new Error('Invalid intel file format — missing frontmatter');
  }

  const fmRaw = fmMatch[1];
  const body = fmMatch[2];

  const frontmatter = parseFrontmatter(fmRaw);

  // Extract sections
  const rawMatch = body.match(/## Raw\n([\s\S]*?)(?=## |$)/);
  const synthMatch = body.match(/## Synthesis\n([\s\S]*?)(?=## |$)/);
  const actionMatch = body.match(/## Suggested Action\n([\s\S]*?)(?=## |$)/);

  return {
    frontmatter,
    raw: rawMatch?.[1]?.trim() ?? '',
    synthesis: synthMatch?.[1]?.trim() ?? '',
    suggestedAction: actionMatch?.[1]?.trim() ?? '',
    fullContent: content,
  };
}

function parseFrontmatter(fmRaw: string): IntelFrontmatter {
  const lines = fmRaw.split('\n');
  const fm: Record<string, unknown> = {};

  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();

    if (key === 'tags') {
      // Handle: [tag1, tag2] or - tag1
      const cleaned = value.replace(/[\[\]]/g, '');
      fm[key] = cleaned
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
    } else {
      fm[key] = value;
    }
  }

  const project = String(fm['project'] ?? 'general');
  const validProject: Project =
    project === 'gunner' || project === 'nah' ? project : 'general';

  const urgency = String(fm['urgency'] ?? 'medium');
  const validUrgency =
    urgency === 'high' || urgency === 'low' ? urgency : 'medium';

  return {
    date: String(fm['date'] ?? new Date().toISOString().split('T')[0]),
    source: String(fm['source'] ?? 'unknown'),
    project: validProject,
    tags: Array.isArray(fm['tags']) ? (fm['tags'] as string[]) : [],
    urgency: validUrgency,
  };
}

// ---------------------------------------------------------------------------
// Determine which agents an intel item should update
// ---------------------------------------------------------------------------

export function determineTargetAgents(intel: ParsedIntel): string[] {
  const { project, tags } = intel.frontmatter;
  const agents = new Set<string>();

  const has = (...t: string[]) => t.some((tag) => tags.includes(tag));

  // Project-level routing
  if (project === 'gunner') {
    if (has('frontend', 'ui', 'design')) agents.add('architect.md');
    if (has('code', 'bug', 'build', 'engineering', 'typescript', 'deploy'))
      agents.add('builder.md');
    if (has('security', 'auth', 'audit')) agents.add('auditor.md');
    if (has('competitor', 'market', 'research', 'industry', 'vc'))
      agents.add('researcher.md');
    // Default for gunner with no specific tags
    if (agents.size === 0) agents.add('builder.md');
  }

  if (project === 'nah') {
    if (has('ghl', 'crm', 'integration', 'automation', 'twilio'))
      agents.add('operator.md');
    if (has('market', 'research', 'wholesale', 'leads'))
      agents.add('researcher.md');
    // Default for nah
    if (agents.size === 0) agents.add('operator.md');
  }

  if (project === 'general') {
    if (has('tools', 'capability', 'ai', 'llm')) {
      // Route to relevant agent based on other tags
      if (has('frontend', 'ui')) agents.add('architect.md');
      if (has('code', 'engineering')) agents.add('builder.md');
      else agents.add('researcher.md'); // default for general
    } else {
      agents.add('researcher.md');
    }
  }

  // Cross-cutting concerns
  if (has('automation')) {
    agents.add('operator.md');
    agents.add('researcher.md');
  }

  return Array.from(agents);
}

// ---------------------------------------------------------------------------
// Build the processed file path
// ---------------------------------------------------------------------------

export function getProcessedPath(
  filename: string,
  project: Project,
): string {
  // Strip inbox/ prefix if present
  const base = filename.replace(/^intelligence\/inbox\//, '');
  return `intelligence/processed/${project}/${base}`;
}
