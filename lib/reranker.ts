
export type RankedChunk = {
    id: string;
    content: string;
    similarity: number;
};

const STOPWORDS = new Set([
    "apa", "yang", "untuk", "dan", "di",
    "ke", "dari", "adalah", "berapa",
    "beasiswa", "teknologi", "syarat",
]);

function tokenize(text: string): string[] {
    return text
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .split(/\s+/)
        .filter(
            (word) => word.length > 2 && !STOPWORDS.has(word)
        );
}

function expandQuery(question: string): Set<string> {
    const tokens = new Set(tokenize(question));

    // Domain vocabulary untuk informasi beasiswa
    if (
        /\b(nilai akademik|indeks prestasi|gpa)\b/i.test(
            question
        )
    ) {
        tokens.add("ipk");
    }

    return tokens;
}

function getChunkBody(content: string): string {
    // Indexer kita menambahkan judul sumber
    // pada baris pertama setiap chunk.
    const newlineIndex = content.indexOf("\n");

    if (newlineIndex === -1) {
        return content;
    }

    return content.slice(newlineIndex + 1);
}

export function rerankChunks<T extends RankedChunk>(
    question: string,
    chunks: T[]
): Array<T & {
    keywordScore: number;
    finalScore: number;
}> {
    const queryTokens = expandQuery(question);

    return chunks
        .map((chunk) => {
            const documentTokens = new Set(
                tokenize(getChunkBody(chunk.content))
            );

            const matches = [...queryTokens].filter(
                (token) => documentTokens.has(token)
            );

            const keywordScore =
                queryTokens.size > 0
                    ? matches.length / queryTokens.size
                    : 0;

            const finalScore =
                0.7 * chunk.similarity +
                0.3 * keywordScore;

            return {
                ...chunk,
                keywordScore,
                finalScore,
            };
        })
        .sort((a, b) => b.finalScore - a.finalScore);
}
