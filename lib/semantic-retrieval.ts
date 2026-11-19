import OpenAI from "openai";
import { pool } from "./db";
import { rerankChunks } from "./reranker";

export type RetrievedChunk = {
    id: string;
    sourceId: number;
    opportunityId: number;
    opportunityTitle: string;
    sourceTitle: string;
    sourceUrl: string | null;
    isVerified: boolean;
    content: string;
    similarity: number;
};

export type RetrievalDecision = {
    hasRelevantEvidence: boolean;
    topSimilarity: number | null;
    reason:
    | "relevant"
    | "low_similarity"
    | "no_documents";
};

export function validateCitations(
    retrievedChunkIds: string[],
    usedChunkIds: string[]
): boolean {
    const allowed = new Set(
        retrievedChunkIds.map(String)
    );

    return usedChunkIds.every((id) =>
        allowed.has(String(id))
    );
}

export async function retrieveRelevantChunks(
    question: string,
    limit = 3,
    opportunityId?: number
) {
    const client = new OpenAI();

    const embeddingResponse = await client.embeddings.create({
        model: "text-embedding-3-small",
        input: question,
        encoding_format: "float",
    });

    const embedding = embeddingResponse.data[0].embedding;
    const vector = `[${embedding.join(",")}]`;

    const result = await pool.query<RetrievedChunk>(
        `
    SELECT
      c.id::text AS id,
      s.id AS "sourceId",
      s.opportunity_id AS "opportunityId",
      o.title AS "opportunityTitle",
      s.source_title AS "sourceTitle",
      s.source_url AS "sourceUrl",
      s.is_verified AS "isVerified",
      c.content,
      1 - (c.embedding <=> $1::vector) AS similarity
    FROM opportunity_chunks c
    JOIN opportunity_sources s
      ON s.id = c.source_id
    JOIN opportunities o
      ON o.id = s.opportunity_id
    WHERE o.approved = TRUE
      AND o.deadline >=
          (NOW() AT TIME ZONE 'Asia/Jakarta')::date
      AND c.embedding_model = 'text-embedding-3-small'
      AND ($2::integer IS NULL OR o.id = $2)
    ORDER BY c.embedding <=> $1::vector
    LIMIT 12
    `,
        [vector, opportunityId ?? null]
    );

    const ranked = rerankChunks(
        question,
        result.rows
    );

    return {
        chunks: ranked.slice(0, limit),
        embeddingTokens:
            embeddingResponse.usage.total_tokens,
    };
}
