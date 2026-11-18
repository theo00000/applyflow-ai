export type Opportunity = {
    id: number;
    title: string;
    majors: string[];
    minimumGpa: number;
    deadline: string;
    approved: boolean;
};

export const opportunities: Opportunity[] = [
    {
        id: 1,
        title: "Beasiswa STEM (Simulasi)",
        majors: ["Informatika", "Teknik Informatika"],
        minimumGpa: 3.6,
        deadline: "2027-02-20",
        approved: true,
    },
    {
        id: 2,
        title: "Beasiswa Djarum",
        majors: ["Informatika"],
        minimumGpa: 3.4,
        deadline: "2026-12-05",
        approved: true,
    },
    {
        id: 3,
        title: "Beasiswa BCA",
        majors: ["Informatika", "Teknik Informatika", "Manajemen", "Sistem Informasi"],
        minimumGpa: 2.5,
        deadline: "2026-12-16",
        approved: true,
    },
];