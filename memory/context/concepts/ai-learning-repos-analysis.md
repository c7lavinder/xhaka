# AI Learning Repos Analysis — Xhaka Applicability
_Analyzed: 2026-03-16 by The Researcher_
_Source: "Best GitHub Repos to Master AI in 2026"_

---

## 1. Microsoft Generative AI for Beginners
**URL:** https://github.com/microsoft/generative-ai-for-beginners

**What it is:** A 21-lesson structured course from Microsoft covering all aspects of building generative AI applications, from LLM fundamentals to RAG, prompt engineering, and deployment. Each lesson has code samples, written content, and video walkthroughs.

**Applicable to us:** PARTIAL

**Pattern to extract:**
- Lesson structure maps well to our agent prompt scaffolding — specifically how they structure "role + task + output format" in each exercise prompt
- Their "Responsible AI" module covers output validation patterns we should apply to our Auditor agent
- The lesson on "Building Search Apps" (RAG) shows a clean chunk-embed-retrieve pattern implementable against our `memory/context/` markdown files

**Priority:** LOW — educational resource, not direct implementation


---

## 2. LLMs from Scratch (rasbt)
**URL:** https://github.com/rasbt/LLMs-from-scratch

**What it is:** A book/repo companion by Sebastian Raschka that builds a GPT-like LLM from the ground up in PyTorch — covering tokenization, attention mechanisms, pretraining, and fine-tuning. Deep internals focus, not application patterns.

**Applicable to us:** NO

**Pattern to extract:** N/A — this is about model internals (training, architecture) not agent systems or application patterns. No direct lift for a TypeScript orchestration layer.

**Priority:** LOW — reference if we ever fine-tune a model, not now


---

## 3. LLM Zoomcamp (DataTalksClub)
**URL:** https://github.com/DataTalksClub/llm-zoomcamp

**What it is:** A free 10-week course on building AI systems that answer questions over a knowledge base. Covers LLMs, RAG, vector search, evaluation, monitoring, and production deployment in a hands-on cohort format.

**Applicable to us:** YES

**Pattern to extract:**
- **RAG + Vector Search pipeline:** Their Elasticsearch + embedding flow is directly applicable to indexing our `memory/context/` markdown files. We can replace Elasticsearch with a lightweight local vector store (Chroma or pg-vector in Supabase) since we're already on Postgres.
- **Evaluation module:** They use `cosine similarity + LLM-as-judge` to grade RAG responses. We should adopt this pattern for the Auditor to score Researcher outputs.
- **Monitoring patterns:** They instrument RAG pipelines with Grafana/Prometheus metrics — directly maps to our LangSmith integration for tracking agent call quality.

**Priority:** HIGH — directly maps to our knowledge system + evaluation needs


---

## 4. Hands-On Large Language Models (HandsOnLLM)
**URL:** https://github.com/HandsOnLLM/Hands-On-Large-Language-Models

**What it is:** The "Illustrated LLM Book" by Jay Alammar and Maarten Grootendorst — visual, practical guide to understanding and using LLMs covering embeddings, semantic search, text classification, and generation with real code. Strong on the internals of how embeddings work.

**Applicable to us:** PARTIAL

**Pattern to extract:**
- **Semantic Search chapter:** Shows how to use sentence-transformers to embed and search a document corpus — directly applicable to building a semantic search layer over our `memory/context/` files. The embedding model choice (e.g. `all-MiniLM-L6-v2`) is a good starting point.
- **Text Classification patterns:** Could be used to auto-tag/classify new memory entries (decisions vs. context vs. projects) without manual curation.
- **Embedding caching strategy:** They demonstrate caching embeddings to avoid re-embedding unchanged documents — critical for cost efficiency in our system.

**Priority:** MEDIUM — the embedding + semantic search patterns are directly applicable once we wire in Cognee


---

## 5. Awesome LLM Apps (Shubhamsaboo)
**URL:** https://github.com/Shubhamsaboo/awesome-llm-apps

**What it is:** A curated collection of working LLM applications built with RAG, AI Agents, Multi-agent Teams, MCP, and Voice Agents. Uses OpenAI, Anthropic, Google, and open-source models. Serves as a real-world pattern library.

**Applicable to us:** YES

**Pattern to extract:**
- **Multi-Agent Team patterns:** Their multi-agent implementations show how to structure agent handoffs with shared state — exactly what we need for Dispatcher → Builder/Researcher flows. Specifically, the "team" pattern where a coordinator agent delegates and collects results.
- **MCP (Model Context Protocol) examples:** Several apps demonstrate MCP tool use, which maps to our planned Paperclip integration (Paperclip uses MCP-style tool calling)
- **RAG + Agent hybrid apps:** Show how to combine a retrieval layer with agent reasoning — the exact architecture we want for context-aware agents that can search `memory/context/` before acting

**Priority:** HIGH — immediately applicable reference implementations for multi-agent handoffs and MCP patterns


---

## 6. Prompt Engineering Guide (dair-ai)
**URL:** https://github.com/dair-ai/Prompt-Engineering-Guide

**What it is:** The most comprehensive open-source prompt engineering reference covering zero-shot, few-shot, chain-of-thought, ReAct, self-consistency, tree-of-thought, and more. 3M+ learners. Maintained by DAIR.AI.

**Applicable to us:** YES

**Pattern to extract:**
- **Chain-of-Thought (CoT) for our Builder prompt:** We should add "Think step by step" scaffolding to complex Builder tasks. Currently our SPEC/PLAN/TASKS format is good but lacks internal reasoning checkpoints.
- **ReAct pattern for Researcher:** The Researcher should use Reason → Act → Observe loops instead of single-shot searches. This means structuring the Researcher prompt as: `1. What do I know? 2. What should I search for? 3. What did I find? 4. What's the conclusion?`
- **Self-Consistency for Auditor:** Run the Auditor check 2-3 times and take the majority verdict instead of relying on single-pass judgment. Reduces false positives in code reviews.
- **Few-shot examples in agent prompts:** All 6 of our agent prompts should include 2-3 concrete input/output examples to dramatically improve output quality and consistency.

**Priority:** HIGH — direct upgrades to every agent prompt in the system. Zero infrastructure changes needed.


---

## 7. HuggingFace Transformers
**URL:** https://github.com/huggingface/transformers

**What it is:** The dominant open-source library for working with transformer models — 400k+ stars, supports every major model family (GPT, BERT, LLaMA, Mistral, etc.) with a unified API for inference, fine-tuning, and deployment.

**Applicable to us:** PARTIAL

**Pattern to extract:**
- **Pipeline abstraction:** HF's `pipeline()` abstraction (one line to run any model task) is a design pattern we should mirror in our agent dispatcher — a single `runAgent(agentType, task)` function that abstracts away model selection, prompt templating, and output parsing.
- **Model card pattern:** HF model cards (structured metadata about a model's capabilities, limitations, training data) maps to our agent definitions. Each of our 6 agents should have a formal "agent card" in `memory/context/` documenting their capabilities, constraints, and ideal task types.
- **Tokenizer awareness:** When building our RAG chunking strategy, HF tokenizers show how to chunk text respecting token boundaries rather than character limits.

**Priority:** MEDIUM — architecture patterns applicable, but we're not running local models so direct library use is limited


---

## 8. Machine Learning Roadmap (mrdbourke)
**URL:** https://github.com/mrdbourke/machine-learning-roadmap

**What it is:** A visual roadmap by Daniel Bourke connecting ML concepts, learning paths, tools, and mathematics. Primarily a curriculum/navigation resource for ML learners, not a coding repo.

**Applicable to us:** NO

**Pattern to extract:** N/A — this is a learning roadmap, not an implementable pattern library. The concepts it maps (supervised/unsupervised learning, neural networks) are foundational ML, not relevant to our agent orchestration system.

**Priority:** LOW — reference for onboarding new team members to ML concepts, not system building


---

## 9. RAG Techniques (NirDiamant)
**URL:** https://github.com/NirDiamant/RAG_Techniques

**What it is:** The most comprehensive collection of RAG techniques available (34+ methods), from basic chunking to Graph RAG, Self-RAG, CRAG, and Agentic RAG. Each technique has a detailed Jupyter notebook with LangChain/LlamaIndex implementations.

**Applicable to us:** YES

**Pattern to extract (top 5 — see dedicated playbook file):**
1. **Contextual Chunk Headers** — add document metadata to every chunk before embedding
2. **HyDE (Hypothetical Document Embedding)** — generate a hypothetical answer then search for it
3. **Self-RAG** — agent grades its own retrieval quality before using it
4. **Graph RAG** — build a knowledge graph from docs for relationship-aware retrieval
5. **Corrective RAG (CRAG)** — automatically corrects bad retrievals using web search fallback

_See `memory/context/technology/rag-techniques-playbook.md` for full deep dive._

**Priority:** HIGH — this is the core upgrade path for our knowledge system. Immediately implementable once Cognee is wired in.


---

## 10. AI Agents for Beginners (Microsoft)
**URL:** https://github.com/microsoft/ai-agents-for-beginners

**What it is:** A structured 14-lesson Microsoft course specifically on building production AI agents, covering design patterns (ReAct, planning, multi-agent, metacognition), tool use, agentic RAG, memory management, and agent protocols (MCP, A2A). Uses Azure AI Foundry but patterns are framework-agnostic.

**Applicable to us:** YES

**Pattern to extract:**
- **Metacognition Design Pattern (Lesson 9):** Agents that monitor and evaluate their own thinking process — directly applicable to making our Builder self-review code before declaring done, and making the Researcher assess source quality.
- **Planning Design Pattern (Lesson 7):** Structured task decomposition before execution — we should require the Builder to emit a plan JSON before starting any task, not just a SPEC.
- **Agentic Memory Management (Lesson 13):** Three-tier memory architecture: in-context (working), episodic (past interactions), semantic (knowledge base). Maps perfectly to our Hindsight + Cognee + memory/context/ trinity.
- **Trustworthy Agents (Lesson 6):** Guardrails pattern — every agent output should be validated against constraints before being acted upon. Maps to Auditor role but needs to be wired in as a middleware layer, not a separate agent call.
- **Agentic Protocols — MCP + A2A (Lesson 11):** Agent-to-Agent (A2A) protocol for structured handoffs between agents. We should adopt A2A message format for our Dispatcher ↔ Agent communication instead of raw strings.

**Priority:** HIGH — directly applicable agent architecture patterns with zero new infrastructure needed for most of them


---

## Summary Table

| Repo | Applicable | Priority | Key Pattern |
|------|-----------|----------|-------------|
| MS GenAI for Beginners | PARTIAL | LOW | Prompt scaffolding reference |
| LLMs from Scratch | NO | LOW | Model internals only |
| LLM Zoomcamp | YES | HIGH | RAG + evaluation pipeline |
| Hands-On LLMs | PARTIAL | MEDIUM | Embedding caching + semantic search |
| Awesome LLM Apps | YES | HIGH | Multi-agent handoffs + MCP patterns |
| Prompt Engineering Guide | YES | HIGH | CoT, ReAct, few-shot for all 6 agents |
| HuggingFace Transformers | PARTIAL | MEDIUM | Pipeline abstraction + Agent Cards |
| ML Roadmap | NO | LOW | Learning reference only |
| RAG Techniques | YES | HIGH | 5 advanced techniques for knowledge system |
| AI Agents for Beginners | YES | HIGH | Metacognition, planning, A2A protocol |

## Top 3 Immediately Actionable Findings

1. **Upgrade all 6 agent prompts with ReAct + few-shot examples** (Prompt Engineering Guide) — zero infrastructure cost, immediate quality improvement. Add Reason→Act→Observe loop to Researcher, add 2-3 examples to Builder/Auditor.

2. **Add Contextual Chunk Headers + Semantic Chunking to memory/context/ files** (RAG Techniques) — when Cognee is wired in, this doubles retrieval accuracy. Can be prototyped now by adding YAML frontmatter to every .md file in memory/context/.

3. **Adopt A2A message format for Dispatcher↔Agent handoffs** (AI Agents for Beginners) — structured JSON envelopes with task_id, agent_type, inputs, outputs, and status instead of raw strings. Makes debugging and Hindsight episodic memory trivially easy.
