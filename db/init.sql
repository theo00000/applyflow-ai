-- ApplyFlow: simulated opportunities for local development only.
-- Run against a development database; never treat seed records as official.
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
    CONSTRAINT valid_gpa CHECK (minimum_gpa >= 0 AND minimum_gpa <= 4)
);

-- Avoid inserting duplicate sample opportunities on reruns.
INSERT INTO opportunities (title, organizer, majors, minimum_gpa, deadline, approved)
SELECT sample.title, sample.organizer, sample.majors,
       sample.minimum_gpa, sample.deadline, TRUE
FROM (
  VALUES
    ('Beasiswa STEM (Simulasi)'::varchar(255),
     'Penyelenggara Simulasi A'::varchar(255),
     ARRAY['Informatika','Teknik Informatika']::text[],
     3.60::numeric(3,2), DATE '2027-02-20'),
    ('Beasiswa Teknologi (Simulasi)',
     'Penyelenggara Simulasi B', ARRAY['Informatika']::text[],
     3.40::numeric(3,2), DATE '2026-12-05'),
    ('Beasiswa Kampus (Simulasi)',
     'Penyelenggara Simulasi C',
     ARRAY['Informatika','Manajemen','Sistem Informasi']::text[],
     2.50::numeric(3,2), DATE '2026-12-16')
) AS sample(title, organizer, majors, minimum_gpa, deadline)
WHERE NOT EXISTS (
    SELECT 1 FROM opportunities existing WHERE existing.title = sample.title
);
