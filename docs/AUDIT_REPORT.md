# ApplyFlow AI — Audit of uploaded db.zip

**Audit date:** 2026-11-19 (Asia/Jakarta)

## What was available

Source ZIP contained 45 archive entries covering `db`, `eval`, `lib`, `scripts`, `app`, `package.json`, and a default Next.js README. It lacked `package-lock.json`, `.env.local` (correctly omitted), `node_modules`, several typical framework config files and the previously discussed separate `/ask` route. The original `db/applyflow-backup.dump` was present in the upload but is **intentionally excluded from the sanitized release**.

## Fixes applied to release copy

| Finding | Action |
|---|---|
| Malformed `valid_gpa` SQL `CHECK` containing unrelated SQL text | Replaced with valid `0 <= minimum_gpa <= 4` constraint definition |
| Seed script inserted duplicated records on reruns | Replaced with `INSERT ... WHERE NOT EXISTS`; retains existing records |
| Hardcoded TS opportunities mislabeled sample scholarships as Djarum/BCA, unlike database | Removed unused hardcoded dataset; retained shared TypeScript `Opportunity` type |
| Search debugging route could return inactive/unapproved sources | Joined `opportunities`, filtered approved and active deadlines; rerank up to 12 then return top 3 |
| Public source listing and older document route lacked active/approved filter | Added approved/active restrictions |
| Older `ask-opportunity` accepted fabricated citations | Added allowlist and positive-answer citation check |
| Groundedness code had unused `fullEvidence` and embedded validation logic | Moved checks to reusable helper and added 8 deterministic tests |
| Indexer retained obsolete chunk tails if source became shorter | Added cleanup after successful source indexing |
| Missing basic framework/development files | Added next/tsconfig/postcss, example env, ignore rules, Docker Compose, health, `/ask` alias |
| Generic readme and metadata | Replaced with real setup, warnings, limitations and study notes |

## Checks completed in this environment

- **PASS:** 8/8 deterministic Node.js groundedness-validator tests (`node --test tests/*.test.mjs`).
- **PASS:** Node `--check` syntax checks for `.mjs` scripts.
- **NOT VERIFIED:** TypeScript typecheck, Next.js build and ESLint. Attempting `npm install` failed because the environment couldn't resolve npm registry (`EAI_AGAIN`). No `node_modules` or lockfile was available.
- **NOT VERIFIED:** PostgreSQL migrations, Docker Compose start, database smoke test, OpenAI API calls, 8/8 live RAG regression on this release. No Docker, local DB, or user API key was provided to this runtime.

## Release blockers and remaining tasks

1. On the owner's Windows environment: run `npm install`, commit generated `package-lock.json`, then `npm run typecheck`, `npm run lint`, `npm run build` and `npm test`; fix any failures.
2. Check existing database separately before applying SQL. Fresh volumes can be initialized with `docker compose up -d`. **Do not wipe the original data volume**.
3. Set valid environment credentials, index source documents, and run `npm run smoke`, `npm run eval:rag`, `npm run eval:groundedness`, `npm run eval:live`. Inspect which failures are model/test instability versus actual hallucination.
4. Decide deployment provider and configure authenticated/rate-limited access **before** making metered OpenAI endpoints public.
5. Replace all simulated/unverified scholarships with verified official source records; only then consider it an actionable application product.

This is a **patched MVP candidate**, not a statement that the project has been deployed or fully verified.
