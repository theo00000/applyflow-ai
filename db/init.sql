CREATE TABLE IF NOT EXISTS opportunities (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    organizer VARCHAR(255) NOT NULL,
    majors TEXT[] NOT NULL,
    minimum_gpa NUMERIC(3,2) NOT NULL,
    deadline DATE NOT NULL,
    approved BOOLEAN NOT NULL DEFAULT FALSE,
    source_url TEXT UNIQUE,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_gpa CHECK (
        minimum_gpa >= 0 AND minimum_gpa <= 4
        ($2::integer IS NULL OR o.id = $2)
    )
);

INSERT INTO opportunities (
    title,
    organizer,
    majors,
    minimum_gpa,
    deadline,
    approved
)
VALUES
(
    'Beasiswa STEM (Simulasi)',
    'Penyelenggara Simulasi A',
    ARRAY['Informatika', 'Teknik Informatika'],
    3.60,
    '2027-02-20',
    TRUE
),
(
    'Beasiswa Teknologi (Simulasi)',
    'Penyelenggara Simulasi B',
    ARRAY['Informatika'],
    3.40,
    '2026-12-05',
    TRUE
),
(
    'Beasiswa Kampus (Simulasi)',
    'Penyelenggara Simulasi C',
    ARRAY['Informatika', 'Manajemen', 'Sistem Informasi'],
    2.50,
    '2026-12-16',
    TRUE
);
