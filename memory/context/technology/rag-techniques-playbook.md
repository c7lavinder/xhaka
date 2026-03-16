# RAG Techniques Playbook — Xhaka Knowledge System
_Deep dive on NirDiamant/RAG_Techniques — extracted for Xhaka implementation_
_Analyzed: 2026-03-16 by The Researcher_
_Source: https://github.com/NirDiamant/RAG_Techniques (34+ techniques, production-grade)_

---

## Overview

The RAG Techniques repo is the most comprehensive RAG reference available. It covers 34 techniques across 8 categories: Foundational, Query Enhancement, Context Enrichment, Advanced Retrieval, Iterative Techniques, Evaluation, Explainability, and Advanced Architecture.

Our current knowledge system: markdown files in `memory/context/` subdirectories, no vector search, no semantic retrieval — agents receive context via direct file reads.

This playbook extracts the 5 techniques most applicable to upgrading that system.

---

## Technique 1: Contextual Chunk Headers
**Category:** Context Enrichment
**RAG Techniques notebook:** `contextual_chunk_headers.ipynb`

### What It Is
Before storing any chunk in a vector store, prepend structured metadata (document title, section, date, tags, agent origin) to the chunk text itself. This means every retrieved chunk carries its own context — no orphan snippets without provenance.

### Why It Matters for Xhaka
Our markdown files in `memory/context/` have no consistent metadata. A retrieved chunk about "GHL configuration" provides no signal about when it was written, by which agent, or which project it applies to. Adding headers solves this.

### Implementation Approach
```
# Pattern: prepend to every chunk before embedding
header = f"""
Source: {filename}
Category: {subfolder}  # decisions | context | projects | people
Date: {created_date}
Agent: {author_agent}
Tags: {comma_separated_tags}
---
"""
full_chunk = header + original_chunk_text
```

For existing files: add YAML frontmatter to every `.md` in `memory/context/`. For new files: Builder/Researcher/Librarian write frontmatter by default.

### Wiring Into memory/context/
1. Add a frontmatter template to `AGENTS.md` that all agents must follow when writing memory files
2. When Cognee indexes files, it reads frontmatter as metadata fields (Cognee supports this natively)
3. At retrieval time, filter by `category`, `date`, or `agent` before semantic search

### Effort: LOW
This is a convention change + YAML frontmatter addition. No new infrastructure. Can be done today.

---

## Technique 2: HyDE — Hypothetical Document Embedding
**Category:** Query Enhancement
**RAG Techniques notebook:** `HyDe_Hypothetical_Document_Embedding.ipynb`

### What It Is
Instead of embedding the raw query ("what's our GHL lead routing logic?"), you first ask the LLM to generate a *hypothetical ideal answer*, then embed *that answer* for vector search. The hypothesis is closer in embedding space to the actual relevant documents than the short query is.

### Why It Matters for Xhaka
When our agents query memory for context, their queries are often terse and abstract. "What did we decide about Paperclip?" is a weak search query. A hypothetical answer ("We decided to use Paperclip as the org-level orchestrator, running above Xhaka, with Cognee providing the knowledge graph layer...") finds the right memory chunks far more reliably.

### Implementation Approach
```typescript
async function hydeSearch(query: string, k: number = 5): Promise<Chunk[]> {
  // Step 1: Generate hypothetical answer
  const hypothesis = await llm.complete(`
    Based on the query below, write a detailed 2-3 sentence answer 
    as if you were retrieving it from an internal knowledge base.
    Query: ${query}
    Hypothetical Answer:
  `);
  
  // Step 2: Embed the hypothesis (not the query)
  const embedding = await embed(hypothesis);
  
  // Step 3: Search vector store with hypothesis embedding
  return vectorStore.search(embedding, k);
}
```

### Wiring Into memory/context/
- Replaces the current direct file read in agent context loading
- Works on top of any vector store (pg-vector in Supabase, Chroma, or Cognee's built-in store)
- Can be gated: only use HyDE for queries longer than 3 words; use direct match for exact lookups

### Effort: LOW-MEDIUM
Requires vector store (Cognee or pg-vector in Supabase). Once that's up, HyDE is ~20 lines of TS. The hypothesis generation adds ~1 LLM call per lookup but dramatically improves recall.

---

## Technique 3: Self-RAG (Self-Reflective Retrieval)
**Category:** Advanced Architecture
**RAG Techniques notebook:** `self_rag.ipynb`

### What It Is
The agent grades its own retrieval before using it. Instead of blindly using whatever was retrieved, Self-RAG adds three decision points:
1. **Retrieve?** — Does this query even need retrieval, or does the LLM already know?
2. **Is Relevant?** — Is the retrieved document actually relevant to the query?
3. **Is Supported?** — Does the final answer faithfully reflect the retrieved content?

### Why It Matters for Xhaka
Our agents currently use whatever context the Dispatcher injects — no quality check. A Researcher that retrieves stale or irrelevant memory will hallucinate confidently. Self-RAG prevents this. It also reduces cost: if the LLM already knows the answer (e.g. "what's TypeScript?"), skip the retrieval entirely.

### Implementation Approach
```typescript
interface RetrievalDecision {
  shouldRetrieve: boolean;
  relevanceScore: number; // 0-1
  supportScore: number;   // 0-1
  reasoning: string;
}

async function selfRAG(query: string, context: string[]): Promise<string> {
  // Grade 1: Should we retrieve at all?
  const needsRetrieval = await gradeRetrievalNeed(query);
  if (!needsRetrieval) return await directAnswer(query);
  
  // Grade 2: Is retrieved content relevant?
  const relevant = context.filter(c => await gradeRelevance(query, c) > 0.7);
  if (relevant.length === 0) return await fallbackAnswer(query);
  
  // Generate answer from relevant chunks
  const answer = await generateAnswer(query, relevant);
  
  // Grade 3: Is the answer supported?
  const supportScore = await gradeSupportedness(answer, relevant);
  if (supportScore < 0.6) return await flagForHumanReview(query, answer);
  
  return answer;
}
```

### Wiring Into memory/context/
- Wrap the Researcher's memory lookup calls in this pattern
- The relevance grading can use a small/cheap model (GPT-4o-mini or Haiku) to keep costs low
- Unsupported answers should trigger a `memory/flagged/` write for Auditor review

### Effort: MEDIUM
Requires 2-3 extra LLM calls per retrieval cycle. Worth it: reduces hallucinations significantly. Implement as a middleware wrapper in the intelligence service.

---

## Technique 4: Graph RAG
**Category:** Advanced Architecture
**RAG Techniques notebooks:** `graph_rag.ipynb`, `Microsoft_GraphRag.ipynb`

### What It Is
Instead of treating documents as isolated chunks, build a knowledge graph where entities (people, projects, tools, decisions) are nodes and relationships (depends_on, decided_by, replaces, relates_to) are edges. Retrieval traverses the graph to find connected context, not just semantically similar chunks.

### Why It Matters for Xhaka
Our memory is inherently relational. "Gunner" connects to "GHL", "LangSmith", "Supabase", "PostHog", and "Railway". A flat vector search for "Gunner architecture" misses the fact that the Supabase schema and the LangSmith tracing config are deeply relevant. Graph RAG surfaces those connections automatically.

This is exactly what Cognee is designed for — Cognee builds a knowledge graph from your documents. This technique is the theoretical foundation for why Cognee is the right choice.

### Implementation Approach
**With Cognee (our planned path):**
```typescript
import cognee from 'cognee';

// Index memory files as graph nodes
await cognee.add(memoryFiles, 'xhaka-memory');
await cognee.cognify(); // builds graph

// Graph-aware search
const results = await cognee.search(
  'Gunner architecture dependencies',
  SearchType.GRAPH_COMPLETION  // traverses relationships
);
```

**Without Cognee (interim):**
- Add explicit `relates_to:` fields in markdown frontmatter
- Build a simple adjacency list from those fields
- Augment vector search results with linked documents

### Wiring Into memory/context/
1. Every `.md` file gets `relates_to: [file1.md, file2.md]` in frontmatter
2. The Librarian agent is responsible for maintaining these links
3. When Cognee is live, these links seed the initial graph
4. The Dispatcher pre-fetches linked documents as additional context for any agent task

### Effort: HIGH (with Cognee), LOW (manual frontmatter links)
Do the manual frontmatter links now. Wire Cognee when the Builder is ready to implement it. The payoff is the biggest of any technique here.

---

## Technique 5: Corrective RAG (CRAG)
**Category:** Advanced Architecture
**RAG Techniques notebook:** `crag.ipynb`

### What It Is
CRAG adds a self-correction loop to retrieval: if the retrieved documents score low on relevance (below a threshold), the system automatically falls back to a web search to supplement or replace the internal retrieval. Three states: Correct (use as-is), Ambiguous (use + web), Incorrect (replace with web).

### Why It Matters for Xhaka
Our knowledge base has gaps. When the Researcher is asked about a new tool or a trend we haven't documented yet, currently it either hallucinates from training data or returns nothing. CRAG lets agents acknowledge "I don't have this in memory → let me search the web → now I have it → let me store it."

This also creates a self-improving knowledge loop: every CRAG web fallback is a signal to the Librarian to write a new memory file.

### Implementation Approach
```typescript
async function correctiveRAG(query: string): Promise<{ answer: string, source: 'memory' | 'web' | 'hybrid' }> {
  // Step 1: Retrieve from memory
  const memoryChunks = await memorySearch(query);
  const relevanceScore = await scoreRelevance(query, memoryChunks);
  
  if (relevanceScore > 0.8) {
    // CORRECT — memory is sufficient
    return { answer: await generate(query, memoryChunks), source: 'memory' };
  } else if (relevanceScore > 0.4) {
    // AMBIGUOUS — supplement with web
    const webResults = await webSearch(query);
    const combined = [...memoryChunks, ...webResults];
    // Trigger Librarian to write web results to memory
    await triggerLibrarian(query, webResults);
    return { answer: await generate(query, combined), source: 'hybrid' };
  } else {
    // INCORRECT — replace with web search
    const webResults = await webSearch(query);
    await triggerLibrarian(query, webResults);  // knowledge gap → new memory file
    return { answer: await generate(query, webResults), source: 'web' };
  }
}
```

### Wiring Into memory/context/
- Researcher agent gets CRAG as its primary search function
- CRAG "Incorrect" path triggers Librarian with: `{ task: 'capture', source: webResults, topic: query }`
- New memory files land in `memory/context/` with frontmatter `source: web-search`
- This creates a self-improving knowledge base: gaps auto-fill over time

### Effort: MEDIUM
Requires: relevance scoring model (cheap), web search tool (Brave API — already configured), and Librarian write capability (already exists). Can be assembled in ~100 lines of TypeScript.

---

## Recommended Build Order

```
Phase 1 — Zero Infrastructure (do this week)
├── Add YAML frontmatter to all memory/context/ files (Contextual Chunk Headers)
├── Update agent prompts to include category/date/tags when writing memory
└── Add relates_to: fields to key memory files (seeds Graph RAG later)

Phase 2 — With pg-vector in Supabase (1-2 weeks)
├── Embed all memory/context/ files using all-MiniLM-L6-v2 or OpenAI ada-002
├── Store embeddings in Supabase pgvector table
├── Implement basic semantic search for Researcher agent
└── Add HyDE wrapper to all memory queries

Phase 3 — Self-improving Loop (2-4 weeks)
├── Implement CRAG with Brave Search fallback
├── Wire Librarian to auto-capture web fallbacks
└── Add Self-RAG relevance grading to Researcher

Phase 4 — Graph Layer (1-2 months, when Cognee ready)
├── Ingest all memory/context/ files into Cognee
├── Let Cognee build knowledge graph from frontmatter links
├── Replace semantic search with graph-completion queries
└── Add Hindsight episodic memory as separate graph namespace
```

---

## Cost Estimates

| Technique | Extra LLM Calls Per Query | Estimated Cost Impact |
|-----------|--------------------------|----------------------|
| Contextual Chunk Headers | 0 (indexing only) | +$0/query |
| HyDE | +1 small call | +$0.001/query |
| Self-RAG (3 grades) | +2-3 small calls | +$0.002/query |
| Graph RAG (Cognee) | 0-1 (graph traversal) | +$0.001/query |
| CRAG (when correct) | +1 relevance check | +$0.001/query |
| CRAG (web fallback) | +2-3 calls + search | +$0.01/query |

**Estimated total for full stack:** ~$0.005-0.015 per agent context lookup. Negligible vs. current costs.

---

## Immediate Action Items

1. **TODAY:** Add YAML frontmatter to the 5 most-referenced memory files as a proof of concept
2. **THIS WEEK:** Update AGENTS.md to require frontmatter on all new memory writes
3. **NEXT SPRINT:** Builder implements pg-vector in Supabase + basic embedding pipeline
4. **FOLLOWING SPRINT:** HyDE + CRAG implemented in Researcher agent
