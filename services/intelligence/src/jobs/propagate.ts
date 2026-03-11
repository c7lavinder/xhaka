import {
  listDirectory,
  getFileContent,
  updateFile,
  getFileLastCommitDate,
} from '../lib/github.js';
import {
  parseIntelFile,
  determineTargetAgents,
} from '../lib/router.js';
import { generateAgentEntry } from '../lib/openai.js';

const XHAKA_REPO = process.env.GITHUB_REPO ?? 'c7lavinder/xhaka';
const PROCESSED_PATH = 'intelligence/processed';
const AGENTS_PATH = 'agents';
const INTEL_LOG_HEADING = '## Intelligence Log';

// ---------------------------------------------------------------------------
// Propagate job — daily 6 AM CST
// Scans processed/ items from last 24h, updates relevant agent files
// ---------------------------------------------------------------------------

export async function runPropagate(): Promise<void> {
  console.log('[propagate] Starting daily propagation run...');

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentItems = await getRecentProcessedItems(cutoff);

  if (!recentItems.length) {
    console.log('[propagate] No new processed items in last 24h — nothing to propagate.');
    return;
  }

  console.log(`[propagate] Found ${recentItems.length} recent item(s) to propagate.`);

  // Group updates by agent to batch commits
  const agentUpdates = new Map<string, string[]>();

  for (const item of recentItems) {
    let parsed;
    try {
      parsed = parseIntelFile(item.content);
    } catch (err) {
      console.warn(`[propagate] Could not parse ${item.path} — skipping.`, err);
      continue;
    }

    const targetAgents = determineTargetAgents(parsed);
    console.log(
      `[propagate] ${item.name} → agents: ${targetAgents.join(', ')}`,
    );

    for (const agentFile of targetAgents) {
      if (!agentUpdates.has(agentFile)) agentUpdates.set(agentFile, []);
      agentUpdates.get(agentFile)!.push(item.content);
    }
  }

  // Apply updates agent by agent
  for (const [agentFile, intelItems] of agentUpdates) {
    await updateAgentFile(agentFile, intelItems);
  }

  console.log('[propagate] Done.');
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

interface ProcessedItem {
  name: string;
  path: string;
  content: string;
}

async function getRecentProcessedItems(
  since: Date,
): Promise<ProcessedItem[]> {
  const projects = ['gunner', 'nah', 'general'];
  const recent: ProcessedItem[] = [];

  for (const project of projects) {
    const dirPath = `${PROCESSED_PATH}/${project}`;
    const files = await listDirectory(XHAKA_REPO, dirPath);
    const mdFiles = files.filter(
      (f) => f.type === 'file' && f.name.endsWith('.md'),
    );

    for (const file of mdFiles) {
      const lastCommit = await getFileLastCommitDate(XHAKA_REPO, file.path);
      if (!lastCommit || lastCommit < since) continue;

      const fileData = await getFileContent(XHAKA_REPO, file.path);
      if (!fileData) continue;

      recent.push({ name: file.name, path: file.path, content: fileData.content });
    }
  }

  return recent;
}

async function updateAgentFile(
  agentFile: string,
  intelItems: string[],
): Promise<void> {
  const agentPath = `${AGENTS_PATH}/${agentFile}`;
  const agentData = await getFileContent(XHAKA_REPO, agentPath);

  if (!agentData) {
    console.warn(`[propagate] Agent file not found: ${agentPath} — skipping.`);
    return;
  }

  let currentContent = agentData.content;
  const agentName = agentFile.replace('.md', '');

  const newEntries: string[] = [];

  for (const intel of intelItems) {
    try {
      // Provide agent context (last 500 chars) + intel item
      const entry = await generateAgentEntry(agentName, currentContent, intel);
      newEntries.push(entry);
      console.log(`[propagate] ✓ Generated entry for ${agentFile}`);
    } catch (err) {
      console.error(`[propagate] OpenAI call failed for ${agentFile}:`, err);
    }
  }

  if (!newEntries.length) return;

  // Ensure Intelligence Log section exists
  if (!currentContent.includes(INTEL_LOG_HEADING)) {
    currentContent = currentContent.trimEnd() + `\n\n${INTEL_LOG_HEADING}\n`;
  }

  // Append all new entries
  const addition = '\n' + newEntries.join('\n\n') + '\n';
  const updatedContent = currentContent.trimEnd() + addition;

  const date = new Date().toISOString().split('T')[0];
  await updateFile(
    XHAKA_REPO,
    agentPath,
    updatedContent,
    `intelligence: propagate ${newEntries.length} item(s) to ${agentFile} [${date}]`,
    agentData.sha,
  );

  console.log(
    `[propagate] ✓ Updated ${agentFile} with ${newEntries.length} new intelligence entries.`,
  );
}
