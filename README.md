# ApplyFlow AI — Scholarship Evidence Assistant

**Status:** portfolio MVP candidate / simulated data only; not production-ready or an official scholarship directory.

ApplyFlow AI is a Next.js RAG prototype for answering Indonesian scholarship questions **using cited source documents**. The system combines PostgreSQL + pgvector semantic search, lexical reranking, scope checks, structured LLM responses, citation validation, and evaluation scripts. A separate recommendation endpoint filters records deterministically by major, GPA, approval, and deadline.

> **Important:** Scholarship records and the academic requirements in the seed data are fictional. They must not be presented as official scholarships, eligibility decisions, or verified application instructions.

## Technology

- Next.js 16 (App Router), TypeScript, React 19, Tailwind CSS 4
- PostgreSQL 16, pgvector (1,536-dimensional embeddings)
- OpenAI `text-embedding-3-small` and Responses API (default `gpt-5-mini`)
- Zod structured outputs, Node.js test runner

## Get started (Windows PowerShell)

**Requirements:** Node.js 22+, Docker Desktop, an OpenAI API key.

```powershell
# 1. In the project directory
Copy-Item .env.example .env.local
# Edit .env.local and replace OPENAI_API_KEY. Never commit it.

# 2. Start a NEW dev DB; never use `down -v` on an existing DB you value
# If port 5434 is already in use, change the compose binding and DATABASE_URL.
docker compose up -d

# 3. Install dependencies and generate package-lock.json
npm install

# 4. Embedding index: requires OpenAI API access, may incur charges
npm run db:index

# 5. Start the server
npm run dev
```

Visit http://localhost:3000 or http://localhost:3000/ask. If you already have an existing ApplyFlow database, **do not overwrite or reset it**: inspect its schema/records and apply only necessary SQL changes. Docker init scripts run only on a fresh empty database volume.

### Environment variables

| Variable | Purpose |
|---|---|
| `OPENAI_API_KEY` | Server-only API key; not `NEXT_PUBLIC_` |
| `OPENAI_MODEL` | Responses API model; default `gpt-5-mini` |
| `DATABASE_URL` | PostgreSQL connection string |
| `RAG_BASE_URL` | Test target, default `http://localhost:3000` |

Docker Compose uses a **local development password**. Change credentials and disable anonymous paid endpoints before any public deployment. Never expose PostgreSQL to the internet.

## Architecture

```text
Web UI (/ and /ask)
  -> POST /api/ask-semantic
  -> Zod request validation and scholarship scope resolver
  -> OpenAI question embedding
  -> pgvector cosine retrieval (up to 12 candidates)
  -> lexical + vector reranking (top 3 chunks)
  -> OpenAI Responses API with structured output
  -> citation ID validation and source verification status
  -> answer, source references, usage and request timing

Offline evaluation:
  scripts/evaluate-rag.mjs -> running API
  scripts/evaluate-groundedness-live.mjs -> running API + cited chunks + judge
  tests/groundedness-utils.test.mjs -> deterministic local unit tests
```

### API routes

| Endpoint | Description |
|---|---|
| `GET /api/health` | Liveness endpoint (not DB readiness) |
| `POST /api/ask-semantic` | Scoped, cited RAG question answering |
| `POST /api/semantic-search` | Debug semantic retrieval; active approved sources only |
| `POST /api/ask-opportunity` | Older single-opportunity document answering |
| `GET /api/recommendations?major=Informatika&gpa=3.6` | Deterministic recommendations |
| `POST /api/ai-recommendations` | AI explanations of deterministic eligibility matches |
| `GET /api/opportunity-sources?opportunityId=2` | Public demo document source listing |

Example RAG request:

```powershell
$body = @{ question = 'Berapa IPK minimum Beasiswa Teknologi?' } | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:3000/api/ask-semantic -Method Post -ContentType 'application/json' -Body $body
```

Main RAG response includes `answer`, `hasEnoughInformation`, `sources`, `verifiedSource`, `retrieval.chunkIds`, `retrieval.usedChunkIds`, `usage`, `metrics.guardResult`, and `requestId`.

## Validation and testing

```powershell
npm test                  # offline deterministic validator tests
npm run typecheck         # TypeScript; requires npm install
npm run lint              # static lint; requires npm install
npm run build             # production bundle; requires npm install
npm run smoke             # requires running server + database
npm run eval:rag          # requires running server + DB + OpenAI key
npm run eval:groundedness # requires OpenAI key
npm run eval:live         # requires running server + DB + OpenAI key
```

`eval/rag-cases.json` contains 8 regression scenarios, including unknown scholarship, out-of-scope question, missing sources, missing stipend information, and user prompt injection. The live groundedness script checks **only cited chunks** and verifies claim spans and literal supporting evidence. Its LLM judge may still miss claims; passing is evidence of those test cases, **not a guarantee that all future answers are grounded**.

### Known limitations (deliberate scope boundaries)

- **No login, abuse protection or rate limit.** Do not expose paid AI endpoints to unauthenticated public traffic. Use deployment protection, proper authentication and gateway rate limiting before a public release.
- No calibrated retrieval-confidence threshold. Similarity measures semantic relatedness, **not fact correctness**. With only a few labeled chunks, selecting a threshold would be guesswork. Current answer sufficiency is LLM-judged and should not be interpreted as a probability.
- Scholarship name recognition uses a basic `Beasiswa <word>` rule and may miss multiword/ambiguous names.
- Seed documents are **unverified**, only a handful of chunks are available, and deadline dates are fixed to 2026/2027. Update and verify data before future demos; rerun indexing when sources change.
- One test result depends on generated chunk identifiers; they may differ after restoring a database backup or reseeding. Adapt `eval/rag-cases.json` to local chunk IDs.
- No confirmed production deployment, real source ingestion, data freshness pipeline, comprehensive security testing, or human evaluation study.

## Security and data handling

- Keep `.env.local`, API keys and database backup dumps outside Git. The provided `.gitignore` excludes these paths.
- SQL requests use parameter binding; document contents are treated as **untrusted** in model instructions.
- Citation IDs are validated against retrieved chunks, but model-generated claims are not independently proven true at runtime.
- Source links are optional; `verifiedSource=false` clearly identifies unverified data.
- Backups are **not included** in the sanitized deliverable ZIP. Preserve your original backup separately.

## Learning resources in this repository

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md): pipeline and design decisions
- [`docs/AUDIT_REPORT.md`](docs/AUDIT_REPORT.md): review findings and validation status

## Development workflow

1. Create a feature branch and write a failing test for each regression.
2. Make one small change, run `npm test` and `npm run typecheck`.
3. For RAG changes, run full evaluations and inspect `eval/results/latest.json`.
4. Keep model, dataset, dependencies, and test version notes with results.
5. Do not announce production readiness without authentication, rate limiting, monitoring, restore rehearsal and deployment smoke tests.
