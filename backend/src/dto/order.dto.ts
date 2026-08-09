import type { OrderStatus, SofaStatus } from "../types/order.interface";

export interface CreateOrderDTO {
    cleaningType: string;
    sofaCount: number;
    customerAddress: string;
}

export interface CreateOrderResponseDTO {
    id: string;
    cleaningType: string;
    orderStatus: string;
    totalPrice: number;
    sofaCount: number;
}

// export interface UpdatedOrderResponseDTO extends CreateOrderResponseDTO {

// }

// export interface CustomerOrdersResponseDTO extends CreateOrderResponseDTO {

// }

// export interface InternalOrdersResponseDTO extends CustomerOrdersResponseDTO {

// }

export interface OrderResponseDTO {
    id: string;
    customer: { id: string, fullName: string };
    customerAddress: string;
    cleaningType: string;
    orderStatus: OrderStatus;
    fieldCleaner: { id: string | null; fullName: string | null };
    manager: { id: string | null; fullName: string | null };
    cleaningDate: string | null; // ISO Date string
    totalPrice: number;
    statusEvents: Array<{
        step: OrderStatus;
        label: string;
        icon: string;
        timestamp: string; // ISO Date string;
    }>;
    sofas: Array<{
        sofaId: string;
        status: SofaStatus;
        healthScore: number | null;
        images: {
            before: string | null;
            after: string | null;
        };
    }>;
}

export type TransitionOrderDTO =
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