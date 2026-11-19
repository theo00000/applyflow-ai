
export type Source = {
    id: number;
    opportunityTitle: string;
    title: string;
    url: string | null;
    isVerified: boolean;
};

export type AnswerResult = {
    question: string;
    answer: string;
    hasEnoughInformation: boolean;
    sources: Source[];
    verifiedSource: boolean;
};
