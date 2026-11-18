
import { pool } from "./db";

type OpportunityScope =
    | { kind: "general" }
    | { kind: "matched"; opportunityId: number }
    | { kind: "missing"; title: string }
    | { kind: "ambiguous"; title: string };

const GENERIC_WORDS = new Set([
    "apa", "mana", "yang", "untuk", "bagi",
    "di", "dengan", "terbaik", "saja",
    "apakah", "berdasarkan",
]);

export async function resolveOpportunityScope(
    question: string
): Promise<OpportunityScope> {
    // Baseline: mengenali pola "Beasiswa <nama>"
    const match = question.match(
        /\bbeasiswa\s+([\p{L}\p{N}-]+)/iu
    );

    if (!match) {
        return { kind: "general" };
    }

    const name = match[1];

    if (GENERIC_WORDS.has(name.toLowerCase())) {
        return { kind: "general" };
    }

    const title = `Beasiswa ${name}`;

    const result = await pool.query<{
        id: number;
        title: string;
    }>(
        `
    SELECT id, title
    FROM opportunities
    WHERE approved = TRUE
      AND deadline >=
        (NOW() AT TIME ZONE 'Asia/Jakarta')::date
      AND title ILIKE $1
    ORDER BY id
    LIMIT 2
    `,
        [`%${title}%`]
    );

    if (result.rows.length === 0) {
        return { kind: "missing", title };
    }

    if (result.rows.length > 1) {
        return { kind: "ambiguous", title };
    }

    return {
        kind: "matched",
        opportunityId: result.rows[0].id,
    };
}
