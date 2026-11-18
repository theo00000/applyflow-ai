
import {
    opportunities,
    type Opportunity,
} from "./opportunities";

export function getEligibleRecommendations(
    major: string,
    gpa: number
): Opportunity[] {
    const normalizedMajor = major.trim().toLowerCase();
    const now = new Date();

    // STEP 1: Filtering
    const eligible = opportunities.filter((item) => {
        const matchesMajor = item.majors.some((m) => {
            const normalized = m.trim().toLowerCase();

            return (
                normalized === normalizedMajor ||
                normalized === "semua"
            );
        });

        const meetsGpa = gpa >= item.minimumGpa;

        const deadline = new Date(
            `${item.deadline}T23:59:59+07:00`
        );

        const isActive =
            !Number.isNaN(deadline.getTime()) &&
            deadline >= now;

        return (
            item.approved &&
            matchesMajor &&
            meetsGpa &&
            isActive
        );
    });

    // STEP 2: Deduplication
    const unique = new Map<string, Opportunity>();

    for (const item of eligible) {
        const key =
            `${item.title.trim().toLowerCase()}|${item.deadline}`;

        unique.set(key, item);
    }

    // STEP 3: Return unique results
    return Array.from(unique.values());
}
