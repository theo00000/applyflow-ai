CREATE TABLE IF NOT EXISTS opportunity_sources (
    id SERIAL PRIMARY KEY,

    opportunity_id INTEGER NOT NULL
        REFERENCES opportunities(id)
        ON DELETE CASCADE,

    source_title VARCHAR(255) NOT NULL,
    source_url TEXT,
    content TEXT NOT NULL,

    is_verified BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (opportunity_id, source_title)
);

INSERT INTO opportunity_sources (
    opportunity_id,
    source_title,
    content,
    is_verified
)
SELECT
    id,
    'Persyaratan Akademik - Simulasi',
    'Beasiswa Teknologi (Simulasi). ' ||
    'Jurusan yang diterima: Informatika. ' ||
    'IPK minimum: 3.40. ' ||
    'Deadline: 5 Desember 2026. ' ||
    'Informasi semester dan dokumen administrasi ' ||
    'belum tersedia dalam dataset.',
    FALSE
FROM opportunities
WHERE title = 'Beasiswa Teknologi (Simulasi)'
ON CONFLICT (opportunity_id, source_title)
DO NOTHING;
