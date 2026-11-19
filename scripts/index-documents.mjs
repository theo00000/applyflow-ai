
import OpenAI from "openai";
import pg from "pg";

const { Pool } = pg;

const client = new OpenAI();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const MODEL = "text-embedding-3-small";

async function main() {
    try {
        const { rows: sources } = await pool.query(`
      SELECT id, source_title, content
      FROM opportunity_sources
      ORDER BY id
    `);

        for (const source of sources) {
            const sentences = source.content
                .split(/(?<=[.!?])\s+/)
                .map((sentence) => sentence.trim())
                .filter(Boolean);

            const chunks = [];

            for (let i = 0; i < sentences.length; i += 2) {
                chunks.push(
                    `${source.source_title}\n` +
                    sentences.slice(i, i + 2).join(" ")
                );
            }

            for (const [index, chunk] of chunks.entries()) {
                // Hindari embedding ulang untuk konten yang sama
                const existing = await pool.query(
                    `SELECT content FROM opportunity_chunks
           WHERE source_id = $1
             AND chunk_index = $2
             AND embedding_model = $3`,
                    [source.id, index, MODEL]
                );

                if (existing.rows[0]?.content === chunk) {
                    console.log(`Skipped unchanged chunk ${index}`);
                    continue;
                }

                const response = await client.embeddings.create({
                    model: MODEL,
                    input: chunk,
                    encoding_format: "float",
                });

                const vector = response.data[0].embedding;

                await pool.query(
                    `
          INSERT INTO opportunity_chunks
            (source_id, chunk_index, content,
             embedding, embedding_model)
          VALUES ($1, $2, $3, $4::vector, $5)
          ON CONFLICT (source_id, chunk_index)
          DO UPDATE SET
            content = EXCLUDED.content,
            embedding = EXCLUDED.embedding,
            embedding_model = EXCLUDED.embedding_model
          `,
                    [
                        source.id,
                        index,
                        chunk,
                        `[${vector.join(",")}]`,
                        MODEL,
                    ]
                );

                console.log(
                    `Indexed source ${source.id}, chunk ${index}`,
                    `Tokens: ${response.usage.total_tokens}`
                );
            }

            // Source changes may reduce the number of chunks. Remove stale tails.
            await pool.query(
                `DELETE FROM opportunity_chunks WHERE source_id = $1 AND chunk_index >= $2`,
                [source.id, chunks.length]
            );
        }

        console.log("Document indexing completed.");
    } finally {
        await pool.end();
    }
}

main().catch((error) => {
    console.error("Indexing failed:", error.message);
    process.exitCode = 1;
});
