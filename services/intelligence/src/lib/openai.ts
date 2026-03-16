import OpenAI from 'openai';

// ---------------------------------------------------------------------------
// OpenAI client — synthesis calls for intel propagation and improvement runs
// ---------------------------------------------------------------------------

let _client: OpenAI | null = null;

function client(): OpenAI {
  if (!_client) {
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _client;
}

export async function synthesize(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 1000,
): Promise<string> {
  const completion = await client().chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: maxTokens,
    temperature: 0.3,
  });

  return completion.choices[0]?.message?.content?.trim() ?? '';
}

// ---------------------------------------------------------------------------
// Specific synthesis helpers
// ---------------------------------------------------------------------------

export async function generateAgentEntry(
  agentName: string,
  agentContext: string,
  intelItem: string,
): Promise<string> {
  const system = `You are updating an AI agent's knowledge file. The agent is: ${agentName}.

Your job: given a piece of intelligence, write a concise entry to append to the agent's "## Intelligence Log" section.

Rules:
- Keep it under 100 words
- Be specific and actionable — not generic
- Format exactly like this (no code blocks, just the markdown):

### YYYY-MM-DD: [Short Title]
[2-4 sentences: what this means for this specific agent's work]

Output ONLY the entry. No preamble, no explanation.`;

  const user = `Agent context (last 500 chars of their file):
${agentContext.slice(-500)}

New intelligence item:
${intelItem}

Today's date: ${new Date().toISOString().split('T')[0]}`;

  return synthesize(system, user, 300);
}

export async function generateBuilderLesson(
  failureContext: string,
): Promise<string> {
  const system = `You are analyzing engineering failures to extract rules for an AI coding agent called "The Builder".

Your job: given a failure (reverted commit, failed build, crash), write ONE new row for the Builder's failure patterns table.

Format EXACTLY like this (markdown table row, no code block):
| [What went wrong in 5 words] | [What happened — 1 sentence] | [The fix — 1 sentence] |

Output ONLY the table row. No preamble.`;

  const user = `Failure context:
${failureContext}`;

  return synthesize(system, user, 200);
}

export async function generateOperatorLesson(
  crashContext: string,
): Promise<string> {
  const system = `You are analyzing Railway deployment crashes to extract lessons for an AI operations agent called "The Operator".

Your job: given crash context, write a concise "Known Issue" entry.

Format EXACTLY like this (no code block):

### [Short issue title]
**Symptom:** [What the crash/error looked like]
**Root Cause:** [Why it happened]
**Resolution:** [How to fix or prevent it]

Output ONLY the entry. No preamble.`;

  const user = `Crash context:
${crashContext}`;

  return synthesize(system, user, 300);
}
