import mongoose = require("mongoose");
import { type Schema } from "mongoose";
import { type IDashboardStats } from "../types/request.interface";

const DashboardStatsSchema: Schema = new mongoose.Schema<IDashboardStats>({
    _id: { type: String, default: "dashboard_stats" }, // Hardcoded ID ensures a singleton
    overview: {
        totalRequests: { type: Number, default: 0 },
        pendingRequests: { type: Number, default: 0 },
        inProgressRequests: { type: Number, default: 0 },
        reviewRequests: { type: Number, default: 0 },
        recleanRequests: { type: Number, default: 0 },
        closedRequests: { type: Number, default: 0 },
    },
    financials: {
        totalRevenue: { type: Number, default: 0 },
    },
    quality: {
        totalSofasCleaned: { type: Number, default: 0 },
        recleanSofasCount: { type: Number, default: 0 },
    }
});

export = mongoose.model<IDashboardStats>("SystemStats", DashboardStatsSchema);