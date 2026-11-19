export type ScholarshipDataOrigin =
    | "simulated"
    | "real"
    | "unknown";

export type ScholarshipSourceVerification =
    | "verified"
    | "unverified"
    | "unknown";

export type ScholarshipSummary = {
    id: number;
    title: string
    organizer: string;

    deadline: string;
    majors: string[];
    minimumGpa: number;
    approved: boolean; sourceUrl: string | null; dataOrigin: ScholarshipDataOrigin; sourceVerification: ScholarshipSourceVerification;
    educationLevel?: string | null; fundingType?: string | null;
    description?: string | null;
};
