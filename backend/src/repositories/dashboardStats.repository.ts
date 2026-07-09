import dashboardStatsModel = require("../models/dashboardStats.model");
import { type HydratedDocument } from "mongoose";
import { type IDashboardStats } from "../types/request.interface";

class DashboardStatsRepository {
    // Fetches the singleton. If it doesn't exist, it creates it instantly.
    async getOrCreateStats(): Promise<HydratedDocument<IDashboardStats>> {
        let dashboardStats = await dashboardStatsModel.findById("dashboard_stats");
        if (!dashboardStats) {
            dashboardStats = await dashboardStatsModel.create({ _id: "dashboard_stats" });
        }
        return dashboardStats;
    }

    // async ensureStats(): Promise<void> {
    //     const exists = await dashboardStatsModel.findById("dashboard_stats");
    //     if (!exists) {
    //         await dashboardStatsModel.create({ _id: "dashboard_stats" });
    //         console.log("Global stats document initialized.");
    //     }
    // }

    // async applyIncrement(updateQuery: Record<string, number>): Promise<void> {
    //     await dashboardStatsModel.findByIdAndUpdate("dashboard_stats", { $inc: updateQuery });
    // }

    // async getStats(): Promise<any> {
    //     return await dashboardStatsModel.findById("dashboard_stats"); // can use lean() here
    // }
}

export = new DashboardStatsRepository();