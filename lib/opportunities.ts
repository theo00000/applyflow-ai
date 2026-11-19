// Shared API type only. Opportunity records come from PostgreSQL, not a second hardcoded dataset.
export type Opportunity = {
    id: number;
    title: string;
    majors: string[];
    minimumGpa: number;
    deadline: string;
    approved: boolean;
};
