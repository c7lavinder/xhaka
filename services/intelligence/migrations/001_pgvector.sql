-- Enable pgvector extension
create extension if not exists vector;

-- Knowledge embeddings table
create table if not exists knowledge_embeddings (
  id uuid primary key default gen_random_uuid(),
  file_path text not null unique,
  title text,
  category text,
  content_hash text not null,
  embedding vector(1536),
  content_preview text,
  last_indexed timestamptz default now()
);

-- Index for fast similarity search
create index if not exists knowledge_embeddings_embedding_idx
  on knowledge_embeddings using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Semantic search function
create or replace function match_knowledge(
  query_embedding vector(1536),
  match_threshold float default 0.7,
  match_count int default 5
)
returns table (
  file_path text,
  title text,
  category text,
  content_preview text,
  similarity float
)
language sql stable
as $$
  select
    file_path, title, category, content_preview,
    1 - (embedding <=> query_embedding) as similarity
  from knowledge_embeddings
  where 1 - (embedding <=> query_embedding) > match_threshold
  order by embedding <=> query_embedding
  limit match_count;
$$;
