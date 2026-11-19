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
        s.id,
        s.opportunity_id AS "opportunityId",
        s.source_title AS "sourceTitle",
        s.source_url AS "sourceUrl",
        s.content,
        s.is_verified AS "isVerified"
      FROM opportunity_sources AS s
      JOIN opportunities AS o ON o.id = s.opportunity_id
      WHERE s.opportunity_id = $1
        AND o.approved = TRUE
        AND o.deadline >= (NOW() AT TIME ZONE 'Asia/Jakarta')::date
      ORDER BY s.id ASC
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
