import statsRepository = require("../repositories/dashboardStats.repository");
import type { RequestStatus, IDashboardStats } from "../types/request.interface";

class DashboardStatsService {
    async recordNewRequest(): Promise<void> {
        const dashboardStats = await statsRepository.getOrCreateStats();
        
        dashboardStats.overview.totalRequests += 1;
        dashboardStats.overview.pendingRequests += 1;
        
        await dashboardStats.save();
    }

    async recordStatusTransition(oldStatus: RequestStatus, newStatus: RequestStatus): Promise<void> {
        if (oldStatus === newStatus) return;

        const dashboardStats = await statsRepository.getOrCreateStats();

        // Decrement old status
        if (oldStatus === "pending") dashboardStats.overview.pendingRequests -= 1;
        if (oldStatus === "in-progress") dashboardStats.overview.inProgressRequests -= 1;
        if (oldStatus === "review") dashboardStats.overview.reviewRequests -= 1;
        if (oldStatus === "reclean") dashboardStats.overview.recleanRequests -= 1;
        if (oldStatus === "closed") dashboardStats.overview.closedRequests -= 1;

        // Increment new status
        if (newStatus === "pending") dashboardStats.overview.pendingRequests += 1;
        if (newStatus === "in-progress") dashboardStats.overview.inProgressRequests += 1;
        if (newStatus === "review") dashboardStats.overview.reviewRequests += 1;
        if (newStatus === "reclean") dashboardStats.overview.recleanRequests += 1;
        if (newStatus === "closed") dashboardStats.overview.closedRequests += 1;

        await dashboardStats.save();
    }

    async recordCompleted(revenue: number, totalSofas: number): Promise<void> {
        const dashboardStats = await statsRepository.getOrCreateStats();
        
        dashboardStats.financials.totalRevenue += revenue;
        dashboardStats.quality.totalSofasCleaned += totalSofas;
        
        await dashboardStats.save();
    }

    async recordReclean(failedSofaCount: number): Promise<void> {
        const dashboardStats = await statsRepository.getOrCreateStats();
        
        dashboardStats.quality.recleanSofasCount += failedSofaCount;
        
        await dashboardStats.save();
    }

    async getDashboardStats(): Promise<IDashboardStats> {
        const dashboardStats = await statsRepository.getOrCreateStats();

        return dashboardStats;
    }
}

export = new DashboardStatsService();