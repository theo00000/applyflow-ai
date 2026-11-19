
import type { ScholarshipSummary } from "./types";

/**
 * ApplyFlow development-only scholarship fixtures.
 *
 * Source:
 * - db/init.sql
 * - db/002_opportunity_sources.sql
 *
 * IMPORTANT:
 * - All records are simulated.
 * - IDs are synthetic, not PostgreSQL IDs.
 * - Do not use these fixtures as production data.
 * - Do not use synthetic IDs for database detail queries.
 */

export const developmentScholarships = [
    {
        id: -1,
        title: "Beasiswa Teknologi (Simulasi)",
        organizer: "Penyelenggara Simulasi B",
        deadline: "2026-12-05",
        majors: ["Informatika"],
        minimumGpa: 3.4,
        approved: true,
        sourceUrl: null,

        dataOrigin: "simulated",
        sourceVerification: "unverified",
    },
    {
        id: -2,
        title: "Beasiswa Kampus (Simulasi)",
        organizer: "Penyelenggara Simulasi C",
        deadline: "2026-12-16",
        majors: [
            "Informatika",
            "Manajemen",
            "Sistem Informasi",
        ],
        minimumGpa: 2.5,
        approved: true,
        sourceUrl: null,

        dataOrigin: "simulated",
        sourceVerification: "unknown",
    },
    {
        id: -3,
        title: "Beasiswa STEM (Simulasi)",
        organizer: "Penyelenggara Simulasi A",
        deadline: "2027-02-20",
        majors: [
            "Informatika",
            "Teknik Informatika",
        ],
        minimumGpa: 3.6,
        approved: true,
        sourceUrl: null,

        dataOrigin: "simulated",
        sourceVerification: "unknown",
    },
] satisfies ScholarshipSummary[];
