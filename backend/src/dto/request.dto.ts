export interface CreateRequestDTO {
    cleaningType: string;
    numberOfSofas: number;
}

export interface CreateRequestResponseDTO {
    id: string;
    cleaningType: string;
    overallStatus: string;
    totalPrice: number;
    sofaCount: number;
}

export type TransitionRequestDTO =
    | { transition: "approve"; }
    | { transition: "reject"; } // note: string; can add
    | { transition: "assign"; fieldCleaner: { id: string, fullName: string }; cleaningDate: Date; }
    | { transition: "start"; }
    | { transition: "complete"; }
    | { transition: "reclean"; failedSofas: string[]; }; // note: string; can add

export interface SubmitCompletionDTO {
    proofFiles: Express.Multer.File[];
    healthScores: Record<string, number>;
}

export interface DashboardStatsResponseDTO {
    overview: {
        totalRequests: number;
        pendingRequests: number;
        inProgressRequests: number;
        reviewRequests: number;
        recleanRequests: number;
        closedRequests: number;
    };
    financials: {
        totalRevenue: number; 
    };
    quality: {
        totalSofasCleaned: number;
        recleanSofasCount: number; // Replaced health score with a highly actionable metric
    };
}