// import { type Types } from "mongoose";

export type OrderStatus =
    | "pending"
    | "approved"
    | "rejected"
    | "assigned"
    | "in-progress"
    | "review"
    | "reclean"
    | "completed"

export type SofaStatus = "pending" | "completed" | "reclean-required";

export interface IStatusEvent {
    step: OrderStatus;
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

export interface IOrder {
    customer: { id: string, fullName: string };
    customerAddress: string;
    cleaningType: string;
    orderStatus: OrderStatus;
    fieldCleaner: { id: string | null, fullName: string | null };
    manager: { id: string | null, fullName: string | null };
    cleaningDate: Date | null;
    totalPrice: number;
    statusEvents: IStatusEvent[];
    sofas: ISofaItem[];
}

export interface IDashboardStats {
    _id: string;
    orders: {
        totalOrders: number;
        pendingOrders: number;
        inProgressOrders: number;
        reviewOrders: number;
        recleanOrders: number;
        completedOrders: number;
    };
    revenue: {
        totalRevenue: number;
    };
    sofas: {
        totalSofasCleaned: number;
        recleanSofasCount: number;
    };
}