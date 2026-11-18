
import { getEligibleRecommendations } from "../../../lib/recommendations";

export async function GET(request: Request) {
    const url = new URL(request.url);

    const major = url.searchParams.get("major")?.trim();
    const rawGpa = url.searchParams.get("gpa");
    const gpa = rawGpa === null ? NaN : Number(rawGpa);

    if (!major || !Number.isFinite(gpa) || gpa < 0 || gpa > 4) {
        return Response.json(
            { error: "Jurusan atau IPK tidak valid" },
            { status: 400 }
        );
    }

    const results = getEligibleRecommendations(major, gpa);

    return Response.json({
        count: results.length,
        recommendations: results,
    });
}
