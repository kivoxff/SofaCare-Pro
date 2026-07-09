import { type Types } from "mongoose";

export type RequestStatus =
    | "pending"
    | "approved"
    | "rejected"
    | "assigned"
    | "in-progress"
    | "review"
    | "reclean"
    | "completed"
    | "closed";

export type SofaStatus = "pending" | "completed" | "reclean-required";

export interface IStatusEvent {
    step: RequestStatus;
    label: string;
    icon: string;
    timestamp: Date;
}

export interface ISofaItem {
    sofaId: string;
    status: SofaStatus;
    healthScore: number | null;
    images: {
        before: string | null;
        after: string | null;
    };
}

export interface ICleaningRequest {
    customer: { id: string, fullName: string };
    cleaningType: string;
    overallStatus: RequestStatus;
    fieldCleaner: { id: string | null, fullName: string | null };
    manager: { id: string | null, fullName: string | null };
    cleaningDate: Date | null;
    totalPrice: number;
    statusEvents: IStatusEvent[];
    sofas: ISofaItem[];
}

export interface IDashboardStats {
    _id: string;
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
        recleanSofasCount: number;
    };
}