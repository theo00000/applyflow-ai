
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS opportunity_chunks (
    id BIGSERIAL PRIMARY KEY,

    source_id INTEGER NOT NULL
        REFERENCES opportunity_sources(id)
        ON DELETE CASCADE,

    chunk_index INTEGER NOT NULL,

    content TEXT NOT NULL,

    embedding VECTOR(1536) NOT NULL,

    embedding_model TEXT NOT NULL
        DEFAULT 'text-embedding-3-small',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (source_id, chunk_index)
);

CREATE INDEX IF NOT EXISTS idx_chunks_source
ON opportunity_chunks(source_id);
