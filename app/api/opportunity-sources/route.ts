import { pool } from "../../../lib/db";

type SourceRow = {
    id: number;
    opportunityId: number;
    sourceTitle: string;
    sourceUrl: string | null;
    content: string;
    isVerified: boolean;
};

export async function GET(request: Request) {
    const url = new URL(request.url);

    const rawId = url.searchParams.get("opportunityId");
    const opportunityId = Number(rawId);

    if (
        !rawId ||
        !Number.isSafeInteger(opportunityId) ||
        opportunityId <= 0
    ) {
        return Response.json(
            { error: "Opportunity ID tidak valid" },
            { status: 400 }
        );
    }

    try {
        const result = await pool.query<SourceRow>(
            `
      SELECT
        id,
        opportunity_id AS "opportunityId",
        source_title AS "sourceTitle",
        source_url AS "sourceUrl",
        content,
        is_verified AS "isVerified"
      FROM opportunity_sources
      WHERE opportunity_id = $1
      ORDER BY id ASC
      `,
            [opportunityId]
        );

        return Response.json({
            opportunityId,
            count: result.rows.length,
            sources: result.rows,
        });
    } catch (error) {
        console.error("Source retrieval failed:", error);

        return Response.json(
            { error: "Gagal mengambil sumber informasi" },
            { status: 503 }
        );
    }
}
