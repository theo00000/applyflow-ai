# ApplyFlow AI — Architecture & Engineering Decisions

## 1. System scope

This snapshot is a **scholarship-focused RAG demo**, not the complete multi-opportunity ApplyFlow vision (discovery, personalized readiness, deadline tracking). The difference matters for portfolio accuracy. All provided seed data is simulated and unverified.

## 2. Data model

- `opportunities`: public catalog attributes, GPA/major eligibility, deadline, approval.
- `opportunity_sources`: source document, title, URL, review status.
- `opportunity_chunks`: segmented document text with one pgvector 1,536-dimensional embedding per chunk.

`db/init.sql`, `db/002_opportunity_sources.sql`, and `db/003_document_embeddings.sql` initialize fresh PostgreSQL volumes. The indexing script updates embeddings if a chunk text changes and removes stale trailing chunks.

## 3. RAG process

1. **Validate** `question` with Zod; reject invalid requests.
2. **Scope resolution** attempts to match `Beasiswa <name>` to an active approved record; unknown named scholarship returns before OpenAI cost.
3. **Embed** the question with `text-embedding-3-small`.
4. **Retrieve** up to twelve active, approved candidate chunks with pgvector cosine distance, optionally filtered by opportunity.
5. **Rerank**: `0.7 * similarity + 0.3 * keywordScore`, then keep top three. These weights are engineering heuristics, not calibrated probabilities.
6. **Generate** a structured answer via Responses API, with `isInScope`, `hasEnoughInformation`, and `usedChunkIds`.
7. **Check** that referenced chunk IDs belong to retrieved chunks and that positive answers cite at least one chunk.
8. **Return** answer, sources, verification status, usage, latency and request ID.

**Important distinction:** Valid citation ID does not prove that the stated fact is entailed by that chunk. The separate groundedness evaluation provides additional testing, not a formal proof.

## 4. Groundedness evaluation (offline / test-time)

The live evaluator calls the actual RAG API, retrieves cited chunk content directly from PostgreSQL, then sends only `answer` and `documents` to an independent judge. Each extracted claim includes:

- `answerSpan`: verbatim substring in the actual answer.
- `claim`: evaluator's factual interpretation.
- `supported`: whether cited content supports it.
- `evidence`: literal excerpt of document content, empty for unsupported claims.
- `reason`: explanation, kept separate from evidence.

`assessGroundedness()` deterministically checks answerSpan provenance, quote inclusion, and aggregate verdict consistency. The LLM judge is non-deterministic, and **claim-extraction completeness remains an open limitation**. A robust future solution would add human-reviewed multi-claim datasets and compare against an independent extraction pass.

## 5. Abstention and confidence

Current `hasEnoughInformation` is an LLM judgment constrained by source evidence; it is not calibrated confidence. A cosine score of 0.92 is not 92% certainty. A proper confidence threshold should be tuned using labeled relevant, irrelevant and partial-evidence examples, scored by false-answer and false-abstention costs. With this tiny simulation dataset, abstention through grounded instructions + regression tests is more responsible than claiming a calibrated threshold.

## 6. Threat model (demo)

**Already addressed partially:** malformed JSON, invalid GPA, parameterized SQL, cited chunk IDs, user/document prompt injection in limited tests, source verification status.

**Must solve before public launch:** user authentication, distributed rate limiting, request quotas, secrets management, abuse/malicious URL controls, reliable source verification/approval workflow, incident monitoring, data retention policy and complete cost controls.

## 7. Endpoint boundaries

`/api/ask-semantic` is the primary RAG path. Other endpoints represent earlier milestones or isolated feature demos. Consider deprecating `ask-opportunity` after parity and evaluations; do not assume every route has identical guardrails.
