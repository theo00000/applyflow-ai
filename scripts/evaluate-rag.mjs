import { readFile, mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const baseUrl = process.env.RAG_BASE_URL || "http://localhost:3000";

const cases = JSON.parse(
    await readFile(join(root, "eval", "rag-cases.json"), "utf8")
);

async function evaluate(testCase) {
    const start = performance.now();

    try {
        const response = await fetch(`${baseUrl}/api/ask-semantic`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                question: testCase.question,
            }),
            signal: AbortSignal.timeout(60000),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}: ${data.error ?? "Unknown error"}`
            );
        }

        // Semua variabel di sini berasal dari respons API.
        const sources = Array.isArray(data.sources)
            ? data.sources
            : [];

        const answer = String(data.answer ?? "").toLowerCase();

        const retrievedIds = Array.isArray(data.retrieval?.chunkIds)
            ? data.retrieval.chunkIds.map(String)
            : [];

        const usedIds = Array.isArray(data.retrieval?.usedChunkIds)
            ? data.retrieval.usedChunkIds.map(String)
            : [];

        const expectedIds = Array.isArray(
            testCase.expectedRelevantChunkIds
        )
            ? testCase.expectedRelevantChunkIds.map(String)
            : [];

        const retrievalHitAt3 = expectedIds.length === 0
            ? null
            : expectedIds.some((id) =>
                retrievedIds.slice(0, 3).includes(id)
            );

        const expectedAnswers = testCase.expectedAnswerAny ?? [];
        const forbiddenAnswers = testCase.forbiddenAnswerAny ?? [];

        const checks = {
            guard:
                data.metrics?.guardResult === testCase.expectedGuard,

            sufficiency:
                data.hasEnoughInformation === testCase.expectedEnough,

            sourceCount:
                testCase.expectedSourceCount === undefined ||
                sources.length === testCase.expectedSourceCount,

            answer:
                expectedAnswers.length === 0 ||
                expectedAnswers.some((phrase) =>
                    answer.includes(phrase.toLowerCase())
                ),

            forbiddenAnswer:
                !forbiddenAnswers.some((phrase) =>
                    answer.includes(phrase.toLowerCase())
                ),

            opportunity:
                !testCase.expectedOpportunityTitle ||
                sources.some(
                    (source) =>
                        source.opportunityTitle ===
                        testCase.expectedOpportunityTitle
                ),

            verifiedSource:
                testCase.expectedVerifiedSource === undefined ||
                data.verifiedSource === testCase.expectedVerifiedSource,

            zeroTokens:
                !testCase.expectZeroTokens ||
                (
                    data.usage?.embeddingTokens === 0 &&
                    data.usage?.inputTokens === 0 &&
                    data.usage?.outputTokens === 0
                ),

            retrieval:
                retrievalHitAt3 !== false,

            validCitations:
                usedIds.every((id) => retrievedIds.includes(id)),

            citations:
                !data.hasEnoughInformation || usedIds.length > 0,

            earlyRejection:
                !["opportunity_not_found", "no_documents"].includes(
                    testCase.expectedGuard
                ) || retrievedIds.length === 0,
        };

        return {
            id: testCase.id,
            question: testCase.question,
            passed: Object.values(checks).every(Boolean),
            checks,
            answer: data.answer,
            guard: data.metrics?.guardResult ?? null,
            hasEnoughInformation: data.hasEnoughInformation,
            sources,
            retrievedIds,
            usedIds,
            retrievalHitAt3,
            latencyMs: Math.round(performance.now() - start),
            retrievalMs: data.metrics?.retrievalMs ?? null,
            generationMs: data.metrics?.generationMs ?? null,
            usage: data.usage ?? null,
        };
    } catch (error) {
        // Cetak stack trace agar baris error terlihat.
        console.error(`[${testCase.id}]`, error);

        return {
            id: testCase.id,
            question: testCase.question,
            passed: false,
            error: error instanceof Error
                ? error.message
                : String(error),
            latencyMs: Math.round(performance.now() - start),
        };
    }
}

// Bagian ini berada DI LUAR fungsi evaluate().
const selectedCases = process.env.RAG_CASE_ID
    ? cases.filter(
        (testCase) => testCase.id === process.env.RAG_CASE_ID
    )
    : cases;

if (selectedCases.length === 0) {
    throw new Error("Tidak ada test case yang cocok.");
}

const results = [];

for (const testCase of selectedCases) {
    console.log(`Running ${testCase.id}...`);
    results.push(await evaluate(testCase));
}

const passed = results.filter((item) => item.passed).length;

const latencies = results
    .filter((item) => !item.error)
    .map((item) => item.latencyMs);

const averageLatencyMs = latencies.length > 0
    ? Math.round(
        latencies.reduce((sum, value) => sum + value, 0) /
        latencies.length
    )
    : null;

const report = {
    generatedAt: new Date().toISOString(),
    summary: {
        passed,
        failed: results.length - passed,
        total: results.length,
        averageLatencyMs,
    },
    results,
};

const outputDirectory = join(root, "eval", "results");

await mkdir(outputDirectory, { recursive: true });

await writeFile(
    join(outputDirectory, "latest.json"),
    JSON.stringify(report, null, 2),
    "utf8"
);

console.table(
    results.map((item) => ({
        Test: item.id,
        Passed: item.passed,
        Guard: item.guard ?? "ERROR",
        LatencyMs: item.latencyMs,
    }))
);

console.log(`Passed: ${passed}/${results.length}`);
console.log(`Average latency: ${averageLatencyMs} ms`);

for (const item of results.filter((entry) => !entry.passed)) {
    const failedChecks = item.checks
        ? Object.entries(item.checks)
            .filter(([, value]) => !value)
            .map(([name]) => name)
        : [];

    console.error(
        `${item.id} failed:`,
        item.error ?? failedChecks.join(", ")
    );

    if (item.answer) {
        console.error(`AI answer: ${item.answer}`);
    }
}

if (passed !== results.length) {
    process.exitCode = 1;
}
