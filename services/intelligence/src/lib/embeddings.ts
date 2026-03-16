// services/intelligence/src/lib/embeddings.ts
// OpenAI embeddings + Supabase pgvector storage and retrieval.

const SUPABASE_URL = process.env.SUPABASE_URL ?? 'https://tvjkgumckwapybpjyrkw.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY ?? '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? '';

export interface KnowledgeMatch {
  file_path: string;
  title: string | null;
  category: string | null;
  content_preview: string | null;
  similarity: number;
}

export async function embedText(text: string): Promise<number[]> {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: text.slice(0, 8000) }),
  });
  if (!res.ok) throw new Error(`OpenAI embeddings failed: ${res.status}`);
  const data = await res.json() as { data: Array<{ embedding: number[] }> };
  return data.data[0].embedding;
}

export async function upsertEmbedding(
  filePath: string,
  content: string,
  title: string | null,
  category: string | null,
): Promise<void> {
  const contentHash = Buffer.from(content).toString('base64').slice(0, 32);
  const embedding = await embedText(content);
  const preview = content.slice(0, 500);

  const res = await fetch(`${SUPABASE_URL}/rest/v1/knowledge_embeddings`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'apikey': SUPABASE_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates',
    },
    body: JSON.stringify({
      file_path: filePath,
      title,
      category,
      content_hash: contentHash,
      embedding,
      content_preview: preview,
      last_indexed: new Date().toISOString(),
    }),
  });
  if (!res.ok) throw new Error(`Supabase upsert failed: ${res.status}`);
}

export async function searchKnowledge(query: string, limit = 5): Promise<KnowledgeMatch[]> {
  const embedding = await embedText(query);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/match_knowledge`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'apikey': SUPABASE_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query_embedding: embedding, match_threshold: 0.7, match_count: limit }),
  });
  if (!res.ok) return [];
  return res.json() as Promise<KnowledgeMatch[]>;
}
