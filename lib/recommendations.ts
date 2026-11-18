import { pool } from "./db";
import type { Opportunity } from "./opportunities";

export async function getEligibleRecommendations(
    major: string,
    gpa: number
): Promise<Opportunity[]> {

    const normalizedMajor = major.trim().toLowerCase();

    const result = await pool.query<Opportunity>(
        `
    SELECT
      o.id,
      o.title,
      o.majors,
      o.minimum_gpa::float8 AS "minimumGpa",
      o.deadline::text AS deadline,
      o.approved
    FROM opportunities AS o
    WHERE
      o.approved = TRUE
      AND o.minimum_gpa <= $2
      AND o.deadline >=
        (NOW() AT TIME ZONE 'Asia/Jakarta')::date
      AND EXISTS (
        SELECT 1
        FROM unnest(o.majors) AS m(value)
        WHERE
          LOWER(BTRIM(m.value)) = $1
          OR LOWER(BTRIM(m.value)) = 'semua'
      )
    ORDER BY o.deadline ASC, o.id ASC
    `,
        [normalizedMajor, gpa]
    );

    const unique = new Map<string, Opportunity>();

    for (const item of result.rows) {
        const key =
            `${item.title.trim().toLowerCase()}|${item.deadline}`;

        if (!unique.has(key)) {
            unique.set(key, item);
        }
    }

    return Array.from(unique.values());
}
