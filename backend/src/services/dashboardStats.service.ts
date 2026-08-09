import statsRepository = require("../repositories/dashboardStats.repository");
import type { OrderStatus, IDashboardStats } from "../types/order.interface";

class DashboardStatsService {
    async recordNewOrder(): Promise<void> {
        const dashboardStats = await statsRepository.getOrCreateStats();

        dashboardStats.orders.totalOrders += 1;
        dashboardStats.orders.pendingOrders += 1;

        await dashboardStats.save();
    }

    async recordStatusTransition(oldStatus: OrderStatus, newStatus: OrderStatus): Promise<void> {
        if (oldStatus === newStatus) return;

        const dashboardStats = await statsRepository.getOrCreateStats();

        // Decrement old status
        if (oldStatus === "pending") dashboardStats.orders.pendingOrders -= 1;
        if (oldStatus === "in-progress") dashboardStats.orders.inProgressOrders -= 1;
        if (oldStatus === "review") dashboardStats.orders.reviewOrders -= 1;
        if (oldStatus === "reclean") dashboardStats.orders.recleanOrders -= 1;
        if (oldStatus === "completed") dashboardStats.orders.completedOrders -= 1;

        // Increment new status
        if (newStatus === "pending") dashboardStats.orders.pendingOrders += 1;
        if (newStatus === "in-progress") dashboardStats.orders.inProgressOrders += 1;
        if (newStatus === "review") dashboardStats.orders.reviewOrders += 1;
        if (newStatus === "reclean") dashboardStats.orders.recleanOrders += 1;
        if (newStatus === "completed") dashboardStats.orders.completedOrders += 1;

        await dashboardStats.save();
    }

    async recordCompleted(revenue: number, totalSofas: number): Promise<void> {
        const dashboardStats = await statsRepository.getOrCreateStats();

        dashboardStats.revenue.totalRevenue += revenue;
        dashboardStats.sofas.totalSofasCleaned += totalSofas;

        await dashboardStats.save();
    }

    async recordReclean(failedSofaCount: number): Promise<void> {
        const dashboardStats = await statsRepository.getOrCreateStats();

        dashboardStats.sofas.recleanSofasCount += failedSofaCount;

        await dashboardStats.save();
    }

    async getDashboardStats(): Promise<IDashboardStats> {
        const dashboardStats = await statsRepository.getOrCreateStats();

        return dashboardStats;
    }
}

export = new DashboardStatsService();

// FUTURE

// stats.revenue.potentialRevenue: The sum of all order totals regardless of status. // allOrdersRevenue, overallRevenue, combinedOrderRevenue
// stats.sofas.totalSofasOrdered: The total number of sofas in all created orders, regardless of status.