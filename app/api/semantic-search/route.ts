import OpenAI from "openai";
import { z } from "zod";
import { pool } from "../../../lib/db";
import { rerankChunks } from "../../../lib/reranker"

const RequestSchema = z.object({
    question: z.string().trim().min(5).max(500),
    opportunityId: z.number().int().positive().optional(),
});

type SearchResult = {
    id: string;
    opportunityId: number;
    content: string;
    sourceTitle: string;
    isVerified: boolean;
    similarity: number;
};

export async function POST(request: Request) {
    let body: unknown;

    try {
        body = await request.json();
    } catch {
        return Response.json(
            { error: "JSON tidak valid" },
            { status: 400 }
        );
    }

    const validation = RequestSchema.safeParse(body);

    if (!validation.success) {
        return Response.json(
            { error: "Input tidak valid" },
            { status: 400 }
        );
    }

    const { question, opportunityId } = validation.data;

    if (!process.env.OPENAI_API_KEY) {
        return Response.json(
            { error: "Konfigurasi AI belum tersedia" },
            { status: 503 }
        );
    }

    try {
        const client = new OpenAI();

        // 1. Ubah pertanyaan menjadi embedding
        const response = await client.embeddings.create({
            model: "text-embedding-3-small",
            input: question,
            encoding_format: "float",
        });

        const embedding = response.data[0].embedding;
        const vector = `[${embedding.join(",")}]`;

        // 2. Cari dokumen dengan cosine distance terendah
        const result = await pool.query<SearchResult>(
            `
      SELECT
        c.id::text AS id,
        s.opportunity_id AS "opportunityId",
        c.content,
        s.source_title AS "sourceTitle",
        s.is_verified AS "isVerified",
        1 - (c.embedding <=> $1::vector) AS similarity
      FROM opportunity_chunks c
      JOIN opportunity_sources s
        ON s.id = c.source_id
      WHERE
        ($2::integer IS NULL OR s.opportunity_id = $2)
        AND c.embedding_model = 'text-embedding-3-small'
      ORDER BY c.embedding <=> $1::vector
      LIMIT 3
      `,
            [vector, opportunityId ?? null]
        );

        const rankedResults = rerankChunks(
            question,
            result.rows
        );

        return Response.json({
            question,
            count: rankedResults.length,
            results: rankedResults,
            embeddingTokens: response.usage.total_tokens,
        });

    } catch (error) {
        console.error(
            "Semantic search failed:",
            error instanceof Error ? error.message : "Unknown error"
        );

        return Response.json(
            { error: "Pencarian semantik gagal" },
            { status: 502 }
        );
    }
}
