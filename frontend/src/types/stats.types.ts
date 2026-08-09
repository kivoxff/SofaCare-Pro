export interface IStats {
    orders: {
        totalOrders: number;
        pendingOrders: number;
        inProgressOrders: number;
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

export interface StatsResponse {
    success: boolean;
    message: string;
    data: IStats
}